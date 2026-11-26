import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import availabilityRoutes from './routes/availability.routes';
import bookingsRoutes from './routes/bookings.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: env.nodeEnv === 'development' ? env.clientOrigin : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', brand: 'Akansha.Predicts' });
  });

  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/availability', availabilityRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/admin', adminRoutes);

  // Serve built frontend in production or when client/dist exists
  const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  });

  app.use(errorHandler);
  return app;
}

