import { Router } from 'express';
import { getDb } from '../db/database';
import {
  getAvailabilityForDate,
  getMonthAvailabilitySummary,
  isValidDateString,
} from '../services/availability.service';

const router = Router();

router.get('/summary', (req, res) => {
  const db = getDb();
  const startParam =
    typeof req.query.start === 'string' && isValidDateString(req.query.start)
      ? req.query.start
      : new Date().toISOString().slice(0, 10);
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 60);
  const summary = getMonthAvailabilitySummary(db, startParam, days);
  res.json({ start: startParam, days: summary });
});

router.get('/date/:date', (req, res) => {
  const { date } = req.params;
  if (!isValidDateString(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }
  const db = getDb();
  const availability = getAvailabilityForDate(db, date);
  res.json(availability);
});

export default router;

