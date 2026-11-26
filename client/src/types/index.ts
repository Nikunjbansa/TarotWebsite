export type UserRole = 'client' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  whatsappNumber: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  createdAt?: string;
}

export type ServiceCategory =
  | 'Divination & Astrology'
  | 'Energy & Tantra Healing'
  | 'Sacred Rituals';

export interface ServiceItem {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  deliveryMode: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  requiresBirthDetails: boolean;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

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

export interface DaySummary {
  date: string;
  isOpen: boolean;
  availableCount: number;
  totalCount: number;
  reason?: string;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface BookingServiceLine {
  id: number;
  serviceId: number | null;
  serviceName: string;
  servicePrice: number;
  durationMinutes: number;
}

export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  totalAmount: number;
  totalDurationMinutes: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  requirements: string;
  whatsappMessage: string;
  whatsappUrl: string;
  whatsappConfirmedSent: boolean;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  items: BookingServiceLine[];
}

export interface PublicConfig {
  sanctuaryName: string;
  practitionerName: string;
  whatsappBusinessNumber: string;
  contactEmail: string;
  consultationHours: string;
  announcementText: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  confirmedValueInr: number;
  totalClients: number;
  totalServices: number;
  activeServices: number;
}

export interface AdminClientSummary {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  createdAt: string;
  bookingCount: number;
  lastAppointmentDate: string | null;
  totalConfirmedValue: number;
}

export interface AvailabilityRule {
  dayOfWeek: number;
  isAvailable: boolean;
  slots: string[];
}

export interface AvailabilityOverride {
  id: number;
  overrideDate: string;
  isBlocked: boolean;
  customSlots: string[] | null;
  reason: string;
}

