import { Router } from 'express';
import { getDb } from '../db/database';
import { getSanctuaryConfigMap } from './bookings.routes';

const router = Router();

router.get('/config', (_req, res) => {
  const db = getDb();
  const settings = getSanctuaryConfigMap(db);
  res.json({
    sanctuaryName: settings.sanctuary_name || 'Akansha.Predicts',
    practitionerName: settings.practitioner_name || 'Akansha Bansal',
    whatsappBusinessNumber: settings.whatsapp_business_number || '919560564150',
    contactEmail: settings.contact_email || 'contact@akanshapredicts.com',
    consultationHours:
      settings.consultation_hours || 'Mon – Sat · 10:30 AM – 7:30 PM IST',
    announcementText:
      settings.announcement_text ||
      'Akansha.Predicts — Astrology, Tarot Reading, Spiritual Guidance & Energy Healing · Direct Booking via WhatsApp',
  });
});

export default router;

