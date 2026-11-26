import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database';
import {
  AuthenticatedRequest,
  requireAuth,
  requireClient,
} from '../middleware/auth';
import { validateBody } from '../middleware/errorHandler';
import {
  getAvailabilityForDate,
  isValidDateString,
} from '../services/availability.service';
import {
  buildWhatsAppBookingMessage,
  buildWhatsAppUrl,
} from '../services/whatsapp.service';
import { generateBookingCode } from '../utils/security';
import { env } from '../config/env';

const router = Router();

const createBookingSchema = z.object({
  serviceIds: z
    .array(z.number().int().positive())
    .min(1, 'Please select at least one service'),
  appointmentDate: z
    .string()
    .refine(isValidDateString, 'Invalid appointment date (use YYYY-MM-DD)'),
  appointmentTime: z.string().trim().min(3, 'Please choose a time slot').max(30),
  clientName: z.string().trim().min(2, 'Name is required').max(100),
  clientEmail: z.string().trim().email('Valid email is required').toLowerCase(),
  clientPhone: z.string().trim().min(7, 'Phone number is required').max(25),
  clientWhatsapp: z
    .string()
    .trim()
    .min(7, 'WhatsApp number is required')
    .max(25),
  dateOfBirth: z.string().trim().max(30).optional().default(''),
  timeOfBirth: z.string().trim().max(30).optional().default(''),
  placeOfBirth: z.string().trim().max(120).optional().default(''),
  requirements: z
    .string()
    .trim()
    .min(5, 'Please briefly share your questions or spiritual requirements')
    .max(2000),
});

export function getSanctuaryConfigMap(db: ReturnType<typeof getDb>) {
  const rows = db
    .prepare('SELECT key, value FROM sanctuary_settings')
    .all() as Array<{ key: string; value: string }>;
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

export function serializeBooking(db: ReturnType<typeof getDb>, row: any) {
  const items = db
    .prepare(
      `SELECT id, service_id, service_name, service_price, duration_minutes
       FROM booking_items WHERE booking_id = ? ORDER BY id ASC`
    )
    .all(row.id) as Array<{
    id: number;
    service_id: number | null;
    service_name: string;
    service_price: number;
    duration_minutes: number;
  }>;

  const settings = getSanctuaryConfigMap(db);
  const businessNumber =
    settings.whatsapp_business_number || env.whatsappBusinessNumber;

  return {
    id: row.id,
    bookingCode: row.booking_code,
    userId: row.user_id,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    status: row.status,
    totalAmount: Number(row.total_amount),
    totalDurationMinutes: Number(row.total_duration_minutes),
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientWhatsapp: row.client_whatsapp,
    dateOfBirth: row.date_of_birth,
    timeOfBirth: row.time_of_birth,
    placeOfBirth: row.place_of_birth,
    requirements: row.requirements,
    whatsappMessage: row.whatsapp_message,
    whatsappUrl: buildWhatsAppUrl(businessNumber, row.whatsapp_message || ''),
    whatsappConfirmedSent: Boolean(row.whatsapp_confirmed_sent),
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((i) => ({
      id: i.id,
      serviceId: i.service_id,
      serviceName: i.service_name,
      servicePrice: Number(i.service_price),
      durationMinutes: Number(i.duration_minutes),
    })),
  };
}

router.use(requireAuth, requireClient);

router.get('/mine', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM bookings WHERE user_id = ?
       ORDER BY appointment_date DESC, created_at DESC`
    )
    .all(req.user!.userId);
  res.json({
    bookings: rows.map((row) => serializeBooking(db, row)),
  });
});

router.post(
  '/',
  validateBody(createBookingSchema),
  (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const data = req.body as z.infer<typeof createBookingSchema>;
    const uniqueIds = Array.from(new Set(data.serviceIds));

    // Reject past dates
    const todayIso = new Date().toISOString().slice(0, 10);
    if (data.appointmentDate < todayIso) {
      res.status(400).json({
        error: 'Please choose today or a future date for your appointment.',
      });
      return;
    }

    try {
      db.exec('BEGIN IMMEDIATE');

      const placeholders = uniqueIds.map(() => '?').join(',');
      const selectedServices = db
        .prepare(
          `SELECT id, name, price, duration_minutes, requires_birth_details
           FROM services
           WHERE id IN (${placeholders}) AND is_active = 1`
        )
        .all(...uniqueIds) as Array<{
        id: number;
        name: string;
        price: number;
        duration_minutes: number;
        requires_birth_details: number;
      }>;

      if (selectedServices.length !== uniqueIds.length) {
        db.exec('ROLLBACK');
        res.status(400).json({
          error: 'One or more selected services are unavailable.',
        });
        return;
      }

      const needsBirth = selectedServices.some(
        (s) => s.requires_birth_details === 1
      );
      if (needsBirth && !data.dateOfBirth.trim()) {
        db.exec('ROLLBACK');
        res.status(400).json({
          error:
            'Date of Birth is required for Astrology or Ritual consultations.',
        });
        return;
      }

      const dayAvailability = getAvailabilityForDate(db, data.appointmentDate);
      if (!dayAvailability.isOpen) {
        db.exec('ROLLBACK');
        res.status(400).json({
          error:
            dayAvailability.reason ||
            'The selected date is not open for consultations.',
        });
        return;
      }

      const matchingSlot = dayAvailability.slots.find(
        (s) => s.time === data.appointmentTime
      );
      if (!matchingSlot || !matchingSlot.available) {
        db.exec('ROLLBACK');
        res.status(409).json({
          error:
            'The selected appointment slot is no longer available. Please choose another slot.',
        });
        return;
      }

      const totalAmount = selectedServices.reduce(
        (sum, s) => sum + Number(s.price),
        0
      );
      const totalDurationMinutes = selectedServices.reduce(
        (sum, s) => sum + Number(s.duration_minutes),
        0
      );

      const settings = getSanctuaryConfigMap(db);
      const sanctuaryName =
        settings.sanctuary_name || 'Akansha.Predicts';
      const businessNumber =
        settings.whatsapp_business_number || env.whatsappBusinessNumber;
      const bookingCode = generateBookingCode();

      const whatsappMessage = buildWhatsAppBookingMessage({
        bookingCode,
        sanctuaryName,
        businessNumber,
        services: selectedServices.map((s) => ({
          name: s.name,
          price: Number(s.price),
          durationMinutes: Number(s.duration_minutes),
        })),
        totalAmount,
        totalDurationMinutes,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientWhatsapp: data.clientWhatsapp,
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
        requirements: data.requirements,
      });

      const bookingInfo = db
        .prepare(
          `INSERT INTO bookings (
            booking_code, user_id, appointment_date, appointment_time,
            status, total_amount, total_duration_minutes,
            client_name, client_email, client_phone, client_whatsapp,
            date_of_birth, time_of_birth, place_of_birth,
            requirements, whatsapp_message, whatsapp_confirmed_sent
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
        )
        .run(
          bookingCode,
          req.user!.userId,
          data.appointmentDate,
          data.appointmentTime,
          totalAmount,
          totalDurationMinutes,
          data.clientName,
          data.clientEmail,
          data.clientPhone,
          data.clientWhatsapp,
          data.dateOfBirth,
          data.timeOfBirth,
          data.placeOfBirth,
          data.requirements,
          whatsappMessage
        );

      const bookingId = Number(bookingInfo.lastInsertRowid);
      const insertItem = db.prepare(
        `INSERT INTO booking_items (
          booking_id, service_id, service_name, service_price, duration_minutes
        ) VALUES (?, ?, ?, ?, ?)`
      );

      for (const s of selectedServices) {
        insertItem.run(
          bookingId,
          s.id,
          s.name,
          s.price,
          s.duration_minutes
        );
      }

      // Sync latest contact & birth details back to client's profile if provided
      db.prepare(
        `UPDATE users
         SET phone = COALESCE(NULLIF(?, ''), phone),
             whatsapp_number = COALESCE(NULLIF(?, ''), whatsapp_number),
             date_of_birth = COALESCE(NULLIF(?, ''), date_of_birth),
             time_of_birth = COALESCE(NULLIF(?, ''), time_of_birth),
             place_of_birth = COALESCE(NULLIF(?, ''), place_of_birth),
             updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        data.clientPhone,
        data.clientWhatsapp,
        data.dateOfBirth,
        data.timeOfBirth,
        data.placeOfBirth,
        req.user!.userId
      );

      db.exec('COMMIT');

      const created = db
        .prepare('SELECT * FROM bookings WHERE id = ?')
        .get(bookingId);
      res.status(201).json({
        booking: serializeBooking(db, created),
      });
    } catch (err) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // ignore rollback error
      }
      throw err;
    }
  }
);

router.patch('/:id/whatsapp-sent', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const bookingId = Number(req.params.id);
  const existing = db
    .prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?')
    .get(bookingId, req.user!.userId);

  if (!existing) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  db.prepare(
    `UPDATE bookings
     SET whatsapp_confirmed_sent = 1, updated_at = datetime('now')
     WHERE id = ?`
  ).run(bookingId);

  const updated = db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get(bookingId);
  res.json({ booking: serializeBooking(db, updated) });
});

router.patch('/:id/cancel', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const bookingId = Number(req.params.id);
  const existing = db
    .prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?')
    .get(bookingId, req.user!.userId) as any;

  if (!existing) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  if (existing.status !== 'pending') {
    res.status(400).json({
      error:
        'Only pending booking requests can be cancelled here. For accepted sessions, please message us on WhatsApp.',
    });
    return;
  }

  db.prepare(
    `UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`
  ).run(bookingId);

  const updated = db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get(bookingId);
  res.json({ booking: serializeBooking(db, updated) });
});

export default router;

