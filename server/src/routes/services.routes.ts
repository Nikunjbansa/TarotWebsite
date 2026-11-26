import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

export function serializeService(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    category: row.category,
    price: Number(row.price),
    durationMinutes: Number(row.duration_minutes),
    deliveryMode: row.delivery_mode,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    benefits: JSON.parse(row.benefits_json || '[]') as string[],
    requiresBirthDetails: Boolean(row.requires_birth_details),
    imageUrl: row.image_url,
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order),
  };
}

router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    )
    .all();
  res.json({ services: rows.map(serializeService) });
});

router.get('/:slug', (req, res) => {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1')
    .get(req.params.slug);
  if (!row) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json({ service: serializeService(row) });
});

export default router;

