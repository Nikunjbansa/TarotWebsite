export interface WhatsAppBookingPayload {
  bookingCode: string;
  sanctuaryName: string;
  businessNumber: string;
  services: Array<{ name: string; price: number; durationMinutes: number }>;
  totalAmount: number;
  totalDurationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  requirements?: string;
}

export function sanitizeWhatsappNumber(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function buildWhatsAppBookingMessage(
  payload: WhatsAppBookingPayload
): string {
  const lines: string[] = [
    `Namaste ${payload.sanctuaryName} 🙏✨`,
    `I would like to confirm my consultation request.`,
    ``,
    `*Booking Reference:* ${payload.bookingCode}`,
    ``,
    `*Selected Sacred Services:*`,
    ...payload.services.map(
      (s, idx) =>
        `${idx + 1}. ${s.name} — ${formatInr(s.price)} (${s.durationMinutes} mins)`
    ),
    ``,
    `*Estimated Total:* ${formatInr(payload.totalAmount)}`,
    `*Estimated Duration:* ${payload.totalDurationMinutes} mins`,
    `*Preferred Appointment:* ${payload.appointmentDate} at ${payload.appointmentTime}`,
    ``,
    `*Client Contact Details:*`,
    `• Name: ${payload.clientName}`,
    `• WhatsApp: ${payload.clientWhatsapp}`,
    `• Phone: ${payload.clientPhone}`,
    `• Email: ${payload.clientEmail}`,
  ];

  if (payload.dateOfBirth || payload.timeOfBirth || payload.placeOfBirth) {
    lines.push(``);
    lines.push(`*Birth Details (if applicable):*`);
    if (payload.dateOfBirth) lines.push(`• Date of Birth: ${payload.dateOfBirth}`);
    if (payload.timeOfBirth) lines.push(`• Time of Birth: ${payload.timeOfBirth}`);
    if (payload.placeOfBirth) lines.push(`• Place of Birth: ${payload.placeOfBirth}`);
  }

  if (payload.requirements && payload.requirements.trim()) {
    lines.push(``);
    lines.push(`*Questions & Personal Requirements:*`);
    lines.push(payload.requirements.trim());
  }

  lines.push(``);
  lines.push(
    `Please share confirmation, payment transfer details, and the Google Meet link once finalized. Thank you!`
  );

  return lines.join('\n');
}

export function buildWhatsAppUrl(
  businessNumber: string,
  message: string
): string {
  const cleanNumber = sanitizeWhatsappNumber(businessNumber);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

