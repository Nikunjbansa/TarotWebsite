import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { env } from '../config/env';

let dbInstance: DatabaseSync | null = null;

export function getDb(customPath?: string): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const targetPath = customPath || env.dbPath;
  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(targetPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  initializeSchema(db);
  dbInstance = db;
  return db;
}

export function resetDbForTests(db: DatabaseSync): void {
  dbInstance = db;
  db.exec('PRAGMA foreign_keys = ON;');
  initializeSchema(db);
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export function initializeSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('client', 'admin')) DEFAULT 'client',
      phone TEXT NOT NULL DEFAULT '',
      whatsapp_number TEXT NOT NULL DEFAULT '',
      date_of_birth TEXT NOT NULL DEFAULT '',
      time_of_birth TEXT NOT NULL DEFAULT '',
      place_of_birth TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL CHECK(category IN ('Divination & Astrology', 'Energy & Tantra Healing', 'Sacred Rituals')),
      price INTEGER NOT NULL CHECK(price >= 0),
      duration_minutes INTEGER NOT NULL DEFAULT 45,
      delivery_mode TEXT NOT NULL DEFAULT '1:1 Live Session (Google Meet via WhatsApp)',
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      benefits_json TEXT NOT NULL DEFAULT '[]',
      requires_birth_details INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '/images/service-tarot.png',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL UNIQUE CHECK(day_of_week >= 0 AND day_of_week <= 6),
      is_available INTEGER NOT NULL DEFAULT 1,
      slots_json TEXT NOT NULL DEFAULT '["10:30 AM","12:00 PM","03:00 PM","05:00 PM","07:00 PM"]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS availability_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      override_date TEXT NOT NULL UNIQUE,
      is_blocked INTEGER NOT NULL DEFAULT 0,
      custom_slots_json TEXT DEFAULT NULL,
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'completed', 'rejected', 'cancelled')) DEFAULT 'pending',
      total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
      total_duration_minutes INTEGER NOT NULL DEFAULT 45,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_whatsapp TEXT NOT NULL,
      date_of_birth TEXT NOT NULL DEFAULT '',
      time_of_birth TEXT NOT NULL DEFAULT '',
      place_of_birth TEXT NOT NULL DEFAULT '',
      requirements TEXT NOT NULL DEFAULT '',
      whatsapp_message TEXT NOT NULL DEFAULT '',
      whatsapp_confirmed_sent INTEGER NOT NULL DEFAULT 0,
      admin_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booking_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
      service_name TEXT NOT NULL,
      service_price INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sanctuary_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(appointment_date, appointment_time);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(is_active, sort_order);
  `);
}

