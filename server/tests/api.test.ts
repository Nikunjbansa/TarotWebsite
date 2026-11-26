import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app';
import { resetDbForTests, closeDb } from '../src/db/database';
import { seedDatabase } from '../src/db/seed';

let server: http.Server;
let baseUrl = '';

async function request(
  path: string,
  options: {
    method?: string;
    body?: any;
    cookie?: string;
  } = {}
) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.cookie ? { Cookie: options.cookie } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const setCookie = res.headers.get('set-cookie');
  let cookieHeader = options.cookie || '';
  if (setCookie) {
    cookieHeader = setCookie.split(';')[0];
  }

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie: cookieHeader };
}

describe('Akansha.Predicts API Integration Tests', () => {
  before(async () => {
    const memDb = new DatabaseSync(':memory:');
    resetDbForTests(memDb);
    await seedDatabase(memDb);

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
  });

  it('serves all 10 required sacred services on /api/services', async () => {
    const res = await request('/api/services');
    assert.equal(res.status, 200);
    const names = res.data.services.map((s: any) => s.name);
    const expected = [
      'Akashik Tarot Reading',
      'Tarot Reading',
      'Astrology',
      'Rituals',
      'Shiv–Shakti Healing',
      'Maa Tara Healing',
      'Lama Fera Healing',
      'M.E.V Healing',
      'Mahakali Healing',
      'Hoomkar with Halaum',
    ];
    for (const name of expected) {
      assert.ok(names.includes(name), `Missing required service: ${name}`);
    }
  });

  it('registers a client, enforces role separation, books multiple services, and builds WhatsApp payload', async () => {
    // 1. Register new client
    const reg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Meera Nair',
        email: 'meera.test@example.com',
        password: 'StrongPassword123',
        phone: '+91 98111 22334',
        whatsappNumber: '919811122334',
        dateOfBirth: '1993-05-14',
        timeOfBirth: '06:15 AM',
        placeOfBirth: 'Kochi, India',
      },
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.data.user.role, 'client');
    const clientCookie = reg.cookie;

    // 2. Client cannot login through admin login
    const adminAttempt = await request('/api/auth/admin/login', {
      method: 'POST',
      body: {
        email: 'meera.test@example.com',
        password: 'StrongPassword123',
      },
    });
    assert.equal(adminAttempt.status, 403);

    // 3. Find an open future date
    const tomorrow = new Date(Date.now() + 86400000 * 2);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const avail = await request(`/api/availability/date/${dateStr}`);
    assert.equal(avail.status, 200);
    assert.equal(avail.data.isOpen, true);
    const firstOpenSlot = avail.data.slots.find((s: any) => s.available);
    assert.ok(firstOpenSlot, 'Expected an open slot');

    // 4. Get services (select Akashik Tarot Reading + Lama Fera Healing)
    const servicesRes = await request('/api/services');
    const chosen = servicesRes.data.services.slice(0, 2);
    const expectedTotal = chosen.reduce((sum: number, s: any) => sum + s.price, 0);

    // 5. Create multi-service booking
    const bookRes = await request('/api/bookings', {
      method: 'POST',
      cookie: clientCookie,
      body: {
        serviceIds: chosen.map((s: any) => s.id),
        appointmentDate: dateStr,
        appointmentTime: firstOpenSlot.time,
        clientName: 'Meera Nair',
        clientEmail: 'meera.test@example.com',
        clientPhone: '+91 98111 22334',
        clientWhatsapp: '919811122334',
        dateOfBirth: '1993-05-14',
        timeOfBirth: '06:15 AM',
        placeOfBirth: 'Kochi, India',
        requirements: 'Seeking clarity on relationship & career alignment.',
      },
    });
    assert.equal(bookRes.status, 201);
    assert.equal(bookRes.data.booking.totalAmount, expectedTotal);
    assert.equal(bookRes.data.booking.status, 'pending');
    assert.ok(
      bookRes.data.booking.whatsappUrl.startsWith('https://wa.me/'),
      'Should generate wa.me URL'
    );
    assert.ok(
      bookRes.data.booking.whatsappMessage.includes(chosen[0].name),
      'WhatsApp message should include service name'
    );

    // 6. Double-booking same slot must fail with 409
    const duplicateRes = await request('/api/bookings', {
      method: 'POST',
      cookie: clientCookie,
      body: {
        serviceIds: [chosen[0].id],
        appointmentDate: dateStr,
        appointmentTime: firstOpenSlot.time,
        clientName: 'Meera Nair',
        clientEmail: 'meera.test@example.com',
        clientPhone: '+91 98111 22334',
        clientWhatsapp: '919811122334',
        requirements: 'Trying same slot again',
      },
    });
    assert.equal(duplicateRes.status, 409);

    // 7. Client marks WhatsApp sent & cancels pending booking
    const bookingId = bookRes.data.booking.id;
    const markSent = await request(`/api/bookings/${bookingId}/whatsapp-sent`, {
      method: 'PATCH',
      cookie: clientCookie,
    });
    assert.equal(markSent.status, 200);
    assert.equal(markSent.data.booking.whatsappConfirmedSent, true);
  });

  it('supports separate Admin Portal authentication, dashboard stats, service CRUD, booking acceptance & availability overrides', async () => {
    // 1. Admin cannot log in via client endpoint
    const wrongEndpoint = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@akanshapredicts.com',
        password: 'ChandraAdmin@2026',
      },
    });
    assert.equal(wrongEndpoint.status, 403);

    // 2. Admin logs in via /api/auth/admin/login
    const adminLogin = await request('/api/auth/admin/login', {
      method: 'POST',
      body: {
        email: 'admin@akanshapredicts.com',
        password: 'ChandraAdmin@2026',
      },
    });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.data.user.role, 'admin');
    const adminCookie = adminLogin.cookie;

    // 3. Stats & bookings list
    const statsRes = await request('/api/admin/stats', { cookie: adminCookie });
    assert.equal(statsRes.status, 200);
    assert.ok(statsRes.data.stats.totalBookings >= 2);
    assert.ok(statsRes.data.stats.totalClients >= 1);

    const bookingsRes = await request('/api/admin/bookings', {
      cookie: adminCookie,
    });
    assert.equal(bookingsRes.status, 200);
    const pending = bookingsRes.data.bookings.find(
      (b: any) => b.status === 'pending'
    );
    assert.ok(pending, 'Expected a pending booking');

    // 4. Accept booking
    const acceptRes = await request(`/api/admin/bookings/${pending.id}`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: {
        status: 'accepted',
        adminNotes: 'Payment received & Meet link shared via WhatsApp.',
      },
    });
    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.data.booking.status, 'accepted');

    // 5. Block a specific date via availability override
    const blockDate = new Date(Date.now() + 86400000 * 10)
      .toISOString()
      .slice(0, 10);
    const overrideRes = await request('/api/admin/availability/overrides', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        overrideDate: blockDate,
        isBlocked: true,
        reason: 'Amavasya Sadhana Retreat',
      },
    });
    assert.equal(overrideRes.status, 200);

    const checkDate = await request(`/api/availability/date/${blockDate}`);
    assert.equal(checkDate.data.isOpen, false);
    assert.equal(checkDate.data.reason, 'Amavasya Sadhana Retreat');

    // 6. Create & delete a service
    const createSvc = await request('/api/admin/services', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        name: 'Lunar Aura Cleansing',
        subtitle: 'Full Moon Gentle Reset',
        category: 'Energy & Tantra Healing',
        price: 2800,
        durationMinutes: 40,
        shortDescription: 'Gentle full-moon energetic clearing and grounding.',
        fullDescription:
          'A deeply soothing full-moon healing ritual aligning emotional tides and calm focus.',
        benefits: ['Emotional calm', 'Aura balance'],
        requiresBirthDetails: false,
        imageUrl: '/images/service-healing.jpg',
        isFeatured: false,
        isActive: true,
        sortOrder: 99,
      },
    });
    assert.equal(createSvc.status, 201);
    const createdId = createSvc.data.service.id;

    const delSvc = await request(`/api/admin/services/${createdId}`, {
      method: 'DELETE',
      cookie: adminCookie,
    });
    assert.equal(delSvc.status, 200);
  });
});

