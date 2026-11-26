import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, AuthTokenPayload } from '../utils/security';
import { getDb } from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const AUTH_COOKIE_NAME = 'cv_session';

export function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    const db = getDb();
    const user = db
      .prepare('SELECT id, email, role FROM users WHERE id = ?')
      .get(payload.userId) as
      | { id: number; email: string; role: 'client' | 'admin' }
      | undefined;

    if (!user) {
      res.status(401).json({ error: 'Session no longer valid.' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

export function requireClient(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'client') {
    res
      .status(403)
      .json({ error: 'Client portal access is reserved for client accounts.' });
    return;
  }
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res
      .status(403)
      .json({ error: 'Forbidden: Administrator privileges required.' });
    return;
  }
  next();
}

