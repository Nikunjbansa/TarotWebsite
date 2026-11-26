export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function buildClientDirectWhatsappUrl(
  phoneRaw: string,
  message: string
): string {
  let digits = (phoneRaw || '').replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildServiceBookingWhatsappMessage(
  serviceName: string,
  price: number,
  brandName = 'Akansha.Predicts'
): string {
  return [
    `Hello ${brandName}, I would like to book ${serviceName}.`,
    `Service Price: ${formatInr(price)}`,
    `Please share the next steps.`,
  ].join('\n');
}

export function buildServiceBookingWhatsappUrl(
  businessNumber: string,
  serviceName: string,
  price: number,
  brandName = 'Akansha.Predicts'
): string {
  return buildClientDirectWhatsappUrl(
    businessNumber,
    buildServiceBookingWhatsappMessage(serviceName, price, brandName)
  );
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

