import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/errorHandler';
import { serializeService } from './services.routes';
import { getSanctuaryConfigMap, serializeBooking } from './bookings.routes';
import {
  getAvailabilityForDate,
  isValidDateString,
} from '../services/availability.service';

const router = Router();
router.use(requireAuth, requireAdmin);

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(180).optional().default(''),
  category: z.enum([
    'Divination & Astrology',
    'Energy & Tantra Healing',
    'Sacred Rituals',
  ]),
  price: z.number().int().min(0).max(500000),
  durationMinutes: z.number().int().min(10).max(300),
  deliveryMode: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .optional()
    .default('1:1 Live Consultation (Coordinated via WhatsApp)'),
  shortDescription: z.string().trim().min(10).max(500),
  fullDescription: z.string().trim().min(15).max(3000),
  benefits: z.array(z.string().trim().min(2).max(200)).max(10).default([]),
  requiresBirthDetails: z.boolean().default(false),
  imageUrl: z.string().trim().min(1).max(300).default('/images/service-tarot.jpg'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).default(10),
});

const updateBookingSchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'completed', 'rejected', 'cancelled'])
    .optional(),
  adminNotes: z.string().max(1500).optional(),
  appointmentDate: z
    .string()
    .refine(isValidDateString, 'Invalid appointment date')
    .optional(),
  appointmentTime: z.string().trim().min(3).max(30).optional(),
});

const ruleSchema = z.object({
  isAvailable: z.boolean(),
  slots: z.array(z.string().trim().min(3).max(30)).max(20),
});

const overrideSchema = z.object({
  overrideDate: z
    .string()
    .refine(isValidDateString, 'Invalid date (use YYYY-MM-DD)'),
  isBlocked: z.boolean(),
  customSlots: z.array(z.string().trim().min(3).max(30)).nullable().optional(),
  reason: z.string().trim().max(200).optional().default(''),
});

const settingsSchema = z.object({
  sanctuary_name: z.string().trim().min(2).max(120),
  practitioner_name: z.string().trim().min(2).max(120),
  whatsapp_business_number: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'Enter digits only with country code (e.g. 919876543210)'),
  contact_email: z.string().trim().email(),
  consultation_hours: z.string().trim().min(3).max(120),
  announcement_text: z.string().trim().min(3).max(250),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 1. Dashboard Statistics
router.get('/stats', (_req, res) => {
  const db = getDb();

  const counts = db
    .prepare(
      `SELECT
         COUNT(*) as totalBookings,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
         SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as acceptedBookings,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedBookings,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedBookings,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
         COALESCE(SUM(CASE WHEN status IN ('accepted', 'completed') THEN total_amount ELSE 0 END), 0) as confirmedValueInr
       FROM bookings`
    )
    .get() as any;

  const clientCountRow = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'")
    .get() as { count: number };

  const serviceCounts = db
    .prepare(
      `SELECT
         COUNT(*) as totalServices,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeServices
       FROM services`
    )
    .get() as any;

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcomingRows = db
    .prepare(
      `SELECT * FROM bookings
       WHERE appointment_date >= ? AND status IN ('pending', 'accepted')
       ORDER BY appointment_date ASC, appointment_time ASC
       LIMIT 6`
    )
    .all(todayIso);

  const popularServices = db
    .prepare(
      `SELECT service_name as name, COUNT(*) as bookingsCount, SUM(service_price) as estimatedTotal
       FROM booking_items
       GROUP BY service_name
       ORDER BY bookingsCount DESC
       LIMIT 6`
    )
    .all();

  res.json({
    stats: {
      totalBookings: Number(counts.totalBookings || 0),
      pendingBookings: Number(counts.pendingBookings || 0),
      acceptedBookings: Number(counts.acceptedBookings || 0),
      completedBookings: Number(counts.completedBookings || 0),
      rejectedBookings: Number(counts.rejectedBookings || 0),
      cancelledBookings: Number(counts.cancelledBookings || 0),
      confirmedValueInr: Number(counts.confirmedValueInr || 0),
      totalClients: Number(clientCountRow.count || 0),
      totalServices: Number(serviceCounts.totalServices || 0),
      activeServices: Number(serviceCounts.activeServices || 0),
    },
    upcomingAppointments: upcomingRows.map((r) => serializeBooking(db, r)),
    popularServices,
  });
});

// 2. Bookings Management
router.get('/bookings', (req, res) => {
  const db = getDb();
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const date = typeof req.query.date === 'string' ? req.query.date : '';

  const conditions: string[] = [];
  const params: any[] = [];

  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }
  if (date && isValidDateString(date)) {
    conditions.push('appointment_date = ?');
    params.push(date);
  }
  if (search) {
    conditions.push(
      '(booking_code LIKE ? OR client_name LIKE ? OR client_email LIKE ? OR client_whatsapp LIKE ?)'
    );
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT * FROM bookings ${whereClause}
       ORDER BY created_at DESC, appointment_date DESC`
    )
    .all(...params);

  res.json({
    bookings: rows.map((row) => serializeBooking(db, row)),
  });
});

router.patch(
  '/bookings/:id',
  validateBody(updateBookingSchema),
  (req, res) => {
    const db = getDb();
    const bookingId = Number(req.params.id);
    const existing = db
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .get(bookingId) as any;

    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const data = req.body as z.infer<typeof updateBookingSchema>;
    const nextDate = data.appointmentDate ?? existing.appointment_date;
    const nextTime = data.appointmentTime ?? existing.appointment_time;
    const nextStatus = data.status ?? existing.status;

    if (
      (data.appointmentDate || data.appointmentTime) &&
      (nextDate !== existing.appointment_date ||
        nextTime !== existing.appointment_time)
    ) {
      const conflict = db
        .prepare(
          `SELECT id FROM bookings
           WHERE appointment_date = ? AND appointment_time = ?
             AND status IN ('pending', 'accepted') AND id != ?`
        )
        .get(nextDate, nextTime, bookingId);
      if (conflict) {
        res.status(409).json({
          error: 'Another active appointment already occupies that date & slot.',
        });
        return;
      }

      const dayInfo = getAvailabilityForDate(db, nextDate);
      if (!dayInfo.isOpen) {
        res.status(400).json({
          error: dayInfo.reason || 'Target date is currently blocked/closed.',
        });
        return;
      }
    }

    db.prepare(
      `UPDATE bookings
       SET status = ?,
           admin_notes = ?,
           appointment_date = ?,
           appointment_time = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      nextStatus,
      data.adminNotes !== undefined ? data.adminNotes : existing.admin_notes,
      nextDate,
      nextTime,
      bookingId
    );

    const updated = db
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .get(bookingId);
    res.json({ booking: serializeBooking(db, updated) });
  }
);

// 3. Clients Management
router.get('/clients', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.whatsapp_number,
              u.date_of_birth, u.time_of_birth, u.place_of_birth, u.created_at,
              COUNT(b.id) as booking_count,
              MAX(b.appointment_date) as last_appointment_date,
              COALESCE(SUM(CASE WHEN b.status IN ('accepted','completed') THEN b.total_amount ELSE 0 END), 0) as total_confirmed_value
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all() as any[];

  res.json({
    clients: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      whatsappNumber: r.whatsapp_number,
      dateOfBirth: r.date_of_birth,
      timeOfBirth: r.time_of_birth,
      placeOfBirth: r.place_of_birth,
      createdAt: r.created_at,
      bookingCount: Number(r.booking_count || 0),
      lastAppointmentDate: r.last_appointment_date || null,
      totalConfirmedValue: Number(r.total_confirmed_value || 0),
    })),
  });
});

router.get('/clients/:id', (req, res) => {
  const db = getDb();
  const clientId = Number(req.params.id);
  const client = db
    .prepare(
      `SELECT id, name, email, phone, whatsapp_number, date_of_birth,
              time_of_birth, place_of_birth, created_at
       FROM users WHERE id = ? AND role = 'client'`
    )
    .get(clientId) as any;

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  const bookings = db
    .prepare(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC'
    )
    .all(clientId);

  res.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsappNumber: client.whatsapp_number,
      dateOfBirth: client.date_of_birth,
      timeOfBirth: client.time_of_birth,
      placeOfBirth: client.place_of_birth,
      createdAt: client.created_at,
    },
    bookings: bookings.map((b) => serializeBooking(db, b)),
  });
});

// 4. Services Management
router.get('/services', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC')
    .all();
  res.json({ services: rows.map(serializeService) });
});

router.post('/services', validateBody(serviceSchema), (req, res) => {
  const db = getDb();
  const data = req.body as z.infer<typeof serviceSchema>;
  const baseSlug = slugify(data.name) || 'sacred-service';
  let slug = baseSlug;
  let suffix = 2;
  while (db.prepare('SELECT id FROM services WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const info = db
    .prepare(
      `INSERT INTO services (
        slug, name, subtitle, category, price, duration_minutes,
        delivery_mode, short_description, full_description,
        benefits_json, requires_birth_details, image_url,
        is_featured, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      data.name,
      data.subtitle,
      data.category,
      data.price,
      data.durationMinutes,
      data.deliveryMode,
      data.shortDescription,
      data.fullDescription,
      JSON.stringify(data.benefits),
      data.requiresBirthDetails ? 1 : 0,
      data.imageUrl,
      data.isFeatured ? 1 : 0,
      data.isActive ? 1 : 0,
      data.sortOrder
    );

  const created = db
    .prepare('SELECT * FROM services WHERE id = ?')
    .get(Number(info.lastInsertRowid));
  res.status(201).json({ service: serializeService(created) });
});

router.put('/services/:id', validateBody(serviceSchema), (req, res) => {
  const db = getDb();
  const serviceId = Number(req.params.id);
  const existing = db
    .prepare('SELECT * FROM services WHERE id = ?')
    .get(serviceId);
  if (!existing) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  const data = req.body as z.infer<typeof serviceSchema>;
  db.prepare(
    `UPDATE services
     SET name = ?, subtitle = ?, category = ?, price = ?,
         duration_minutes = ?, delivery_mode = ?,
         short_description = ?, full_description = ?,
         benefits_json = ?, requires_birth_details = ?,
         image_url = ?, is_featured = ?, is_active = ?,
         sort_order = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    data.name,
    data.subtitle,
    data.category,
    data.price,
    data.durationMinutes,
    data.deliveryMode,
    data.shortDescription,
    data.fullDescription,
    JSON.stringify(data.benefits),
    data.requiresBirthDetails ? 1 : 0,
    data.imageUrl,
    data.isFeatured ? 1 : 0,
    data.isActive ? 1 : 0,
    data.sortOrder,
    serviceId
  );

  const updated = db
    .prepare('SELECT * FROM services WHERE id = ?')
    .get(serviceId);
  res.json({ service: serializeService(updated) });
});

router.delete('/services/:id', (req, res) => {
  const db = getDb();
  const serviceId = Number(req.params.id);
  const existing = db
    .prepare('SELECT id FROM services WHERE id = ?')
    .get(serviceId);
  if (!existing) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  db.prepare('DELETE FROM services WHERE id = ?').run(serviceId);
  res.json({ ok: true });
});

// 5. Availability Management
router.get('/availability', (_req, res) => {
  const db = getDb();
  const rules = db
    .prepare('SELECT * FROM availability_rules ORDER BY day_of_week ASC')
    .all() as Array<{
    id: number;
    day_of_week: number;
    is_available: number;
    slots_json: string;
  }>;

  const overrides = db
    .prepare(
      'SELECT * FROM availability_overrides ORDER BY override_date ASC'
    )
    .all() as Array<{
    id: number;
    override_date: string;
    is_blocked: number;
    custom_slots_json: string | null;
    reason: string;
  }>;

  res.json({
    rules: rules.map((r) => ({
      dayOfWeek: r.day_of_week,
      isAvailable: Boolean(r.is_available),
      slots: JSON.parse(r.slots_json) as string[],
    })),
    overrides: overrides.map((o) => ({
      id: o.id,
      overrideDate: o.override_date,
      isBlocked: Boolean(o.is_blocked),
      customSlots: o.custom_slots_json
        ? (JSON.parse(o.custom_slots_json) as string[])
        : null,
      reason: o.reason,
    })),
  });
});

router.put(
  '/availability/rules/:dayOfWeek',
  validateBody(ruleSchema),
  (req, res) => {
    const db = getDb();
    const dayOfWeek = Number(req.params.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ error: 'dayOfWeek must be between 0 and 6' });
      return;
    }

    const { isAvailable, slots } = req.body as z.infer<typeof ruleSchema>;
    db.prepare(
      `INSERT INTO availability_rules (day_of_week, is_available, slots_json, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(day_of_week) DO UPDATE SET
         is_available = excluded.is_available,
         slots_json = excluded.slots_json,
         updated_at = datetime('now')`
    ).run(dayOfWeek, isAvailable ? 1 : 0, JSON.stringify(slots));

    res.json({
      rule: {
        dayOfWeek,
        isAvailable,
        slots,
      },
    });
  }
);

router.post(
  '/availability/overrides',
  validateBody(overrideSchema),
  (req, res) => {
    const db = getDb();
    const data = req.body as z.infer<typeof overrideSchema>;
    const customSlotsJson =
      data.customSlots && data.customSlots.length > 0
        ? JSON.stringify(data.customSlots)
        : null;

    db.prepare(
      `INSERT INTO availability_overrides (override_date, is_blocked, custom_slots_json, reason)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(override_date) DO UPDATE SET
         is_blocked = excluded.is_blocked,
         custom_slots_json = excluded.custom_slots_json,
         reason = excluded.reason`
    ).run(
      data.overrideDate,
      data.isBlocked ? 1 : 0,
      customSlotsJson,
      data.reason
    );

    const row = db
      .prepare('SELECT * FROM availability_overrides WHERE override_date = ?')
      .get(data.overrideDate) as any;

    res.json({
      override: {
        id: row.id,
        overrideDate: row.override_date,
        isBlocked: Boolean(row.is_blocked),
        customSlots: row.custom_slots_json
          ? (JSON.parse(row.custom_slots_json) as string[])
          : null,
        reason: row.reason,
      },
    });
  }
);

router.delete('/availability/overrides/:date', (req, res) => {
  const { date } = req.params;
  if (!isValidDateString(date)) {
    res.status(400).json({ error: 'Invalid date' });
    return;
  }
  const db = getDb();
  db.prepare('DELETE FROM availability_overrides WHERE override_date = ?').run(
    date
  );
  res.json({ ok: true });
});

// 6. Sanctuary Settings
router.get('/settings', (_req, res) => {
  const db = getDb();
  res.json({ settings: getSanctuaryConfigMap(db) });
});

router.put('/settings', validateBody(settingsSchema), (req, res) => {
  const db = getDb();
  const data = req.body as z.infer<typeof settingsSchema>;
  const upsert = db.prepare(
    `INSERT INTO sanctuary_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  );

  for (const [key, value] of Object.entries(data)) {
    upsert.run(key, String(value));
  }

  res.json({ settings: getSanctuaryConfigMap(db) });
});

export default router;

