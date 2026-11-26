import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env';

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: 'client' | 'admin';
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === 'string' || !decoded) {
    throw new Error('Invalid token payload');
  }
  return {
    userId: Number(decoded.userId),
    email: String(decoded.email),
    role: decoded.role === 'admin' ? 'admin' : 'client',
  };
}

export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomInt(1000, 9999);
  const alpha = crypto.randomBytes(1).toString('hex').toUpperCase();
  return `CV-${year}-${suffix}${alpha}`;
}

