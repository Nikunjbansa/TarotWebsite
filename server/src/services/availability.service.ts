import { DatabaseSync } from 'node:sqlite';

export interface SlotStatus {
  time: string;
  available: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  isOpen: boolean;
  reason?: string;
  slots: SlotStatus[];
}

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function getDayOfWeekFromDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function getAvailabilityForDate(
  db: DatabaseSync,
  dateStr: string
): DayAvailability {
  const dayOfWeek = getDayOfWeekFromDateString(dateStr);

  const override = db
    .prepare(
      'SELECT is_blocked, custom_slots_json, reason FROM availability_overrides WHERE override_date = ?'
    )
    .get(dateStr) as
    | {
        is_blocked: number;
        custom_slots_json: string | null;
        reason: string;
      }
    | undefined;

  if (override?.is_blocked) {
    return {
      date: dateStr,
      dayOfWeek,
      isOpen: false,
      reason: override.reason || 'Sanctuary closed for private sadhana / holiday',
      slots: [],
    };
  }

  let baseSlots: string[] = [];
  if (override?.custom_slots_json) {
    baseSlots = JSON.parse(override.custom_slots_json) as string[];
  } else {
    const rule = db
      .prepare(
        'SELECT is_available, slots_json FROM availability_rules WHERE day_of_week = ?'
      )
      .get(dayOfWeek) as
      | { is_available: number; slots_json: string }
      | undefined;

    if (!rule || !rule.is_available) {
      return {
        date: dateStr,
        dayOfWeek,
        isOpen: false,
        reason: 'Weekly sanctuary rest day',
        slots: [],
      };
    }
    baseSlots = JSON.parse(rule.slots_json) as string[];
  }

  const bookedRows = db
    .prepare(
      `SELECT appointment_time FROM bookings
       WHERE appointment_date = ? AND status IN ('pending', 'accepted')`
    )
    .all(dateStr) as Array<{ appointment_time: string }>;

  const bookedSet = new Set(bookedRows.map((r) => r.appointment_time));

  const slots: SlotStatus[] = baseSlots.map((time) => ({
    time,
    available: !bookedSet.has(time),
    reason: bookedSet.has(time) ? 'Reserved' : undefined,
  }));

  return {
    date: dateStr,
    dayOfWeek,
    isOpen: slots.length > 0,
    reason: override?.reason || undefined,
    slots,
  };
}

export function getMonthAvailabilitySummary(
  db: DatabaseSync,
  startDate: string,
  days = 30
): Array<{
  date: string;
  isOpen: boolean;
  availableCount: number;
  totalCount: number;
  reason?: string;
}> {
  const results = [];
  const [y, m, d] = startDate.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));

  for (let i = 0; i < days; i++) {
    const cur = new Date(start.getTime() + i * 86400000);
    const iso = cur.toISOString().slice(0, 10);
    const dayInfo = getAvailabilityForDate(db, iso);
    const availableCount = dayInfo.slots.filter((s) => s.available).length;
    results.push({
      date: iso,
      isOpen: dayInfo.isOpen && availableCount > 0,
      availableCount,
      totalCount: dayInfo.slots.length,
      reason: dayInfo.reason,
    });
  }
  return results;
}

