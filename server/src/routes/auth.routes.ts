import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
} from '../utils/security';
import {
  AUTH_COOKIE_NAME,
  AuthenticatedRequest,
  requireAuth,
} from '../middleware/auth';
import { validateBody } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  phone: z.string().trim().min(7, 'Please enter a valid phone number').max(25),
  whatsappNumber: z.string().trim().min(7, 'Please enter a valid WhatsApp number').max(25),
  dateOfBirth: z.string().trim().max(30).optional().default(''),
  timeOfBirth: z.string().trim().max(30).optional().default(''),
  placeOfBirth: z.string().trim().max(120).optional().default(''),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  whatsappNumber: z.string().trim().min(7).max(25),
  dateOfBirth: z.string().trim().max(30).optional().default(''),
  timeOfBirth: z.string().trim().max(30).optional().default(''),
  placeOfBirth: z.string().trim().max(120).optional().default(''),
});

function setSessionCookie(res: any, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production' && process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function serializeUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    dateOfBirth: row.date_of_birth,
    timeOfBirth: row.time_of_birth,
    placeOfBirth: row.place_of_birth,
    createdAt: row.created_at,
  };
}

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const db = getDb();
  const data = req.body as z.infer<typeof registerSchema>;

  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(data.email);
  if (existing) {
    res.status(409).json({
      error: 'An account with this email already exists. Please sign in.',
    });
    return;
  }

  const passwordHash = await hashPassword(data.password);
  const info = db
    .prepare(
      `INSERT INTO users (
        name, email, password_hash, role, phone, whatsapp_number,
        date_of_birth, time_of_birth, place_of_birth
      ) VALUES (?, ?, ?, 'client', ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.email,
      passwordHash,
      data.phone,
      data.whatsappNumber,
      data.dateOfBirth,
      data.timeOfBirth,
      data.placeOfBirth
    );

  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as any;

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  setSessionCookie(res, token);

  res.status(201).json({
    user: serializeUser(user),
    token,
  });
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const db = getDb();
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as any;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.role !== 'client') {
    res.status(403).json({
      error:
        'Administrator accounts must sign in through the dedicated Admin Portal.',
    });
    return;
  }

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  setSessionCookie(res, token);

  res.json({
    user: serializeUser(user),
    token,
  });
});

router.post('/admin/login', validateBody(loginSchema), async (req, res) => {
  const db = getDb();
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as any;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({
      error: 'Access denied. This portal is restricted to administrators.',
    });
    return;
  }

  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  setSessionCookie(res, token);

  res.json({
    user: serializeUser(user),
    token,
  });
});

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.user!.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: serializeUser(user) });
});

router.put(
  '/profile',
  requireAuth,
  validateBody(profileUpdateSchema),
  (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const data = req.body as z.infer<typeof profileUpdateSchema>;

    db.prepare(
      `UPDATE users
       SET name = ?, phone = ?, whatsapp_number = ?,
           date_of_birth = ?, time_of_birth = ?, place_of_birth = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      data.name,
      data.phone,
      data.whatsappNumber,
      data.dateOfBirth,
      data.timeOfBirth,
      data.placeOfBirth,
      req.user!.userId
    );

    const updated = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(req.user!.userId) as any;
    res.json({ user: serializeUser(updated) });
  }
);

export default router;

