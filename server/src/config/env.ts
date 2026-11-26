import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret:
    process.env.JWT_SECRET ||
    'akansha-predicts-local-dev-secret-change-in-production-2026',
  dbPath:
    process.env.DB_PATH ||
    path.resolve(process.cwd(), 'data', 'chandraveda.db'),
  whatsappBusinessNumber:
    process.env.WHATSAPP_BUSINESS_NUMBER || '919560564150',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

