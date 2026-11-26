import type {
  AdminClientSummary,
  AdminStats,
  AvailabilityOverride,
  AvailabilityRule,
  Booking,
  BookingStatus,
  DayAvailability,
  DaySummary,
  PublicConfig,
  ServiceItem,
  User,
} from '../types';

export class ApiError extends Error {
  status: number;
  details?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    status: number,
    details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstDetail =
      Array.isArray(payload.details) && payload.details[0]?.message
        ? `${payload.error}: ${payload.details[0].message}`
        : payload.error;
    throw new ApiError(
      firstDetail || 'Request failed. Please try again.',
      res.status,
      payload.details
    );
  }
  return payload as T;
}

export const api = {
  getPublicConfig: () => request<PublicConfig>('/api/public/config'),
  getServices: () => request<{ services: ServiceItem[] }>('/api/services'),
  getAvailabilitySummary: (start: string, days = 30) =>
    request<{ start: string; days: DaySummary[] }>(
      `/api/availability/summary?start=${encodeURIComponent(start)}&days=${days}`
    ),
  getAvailabilityDate: (date: string) =>
    request<DayAvailability>(`/api/availability/date/${date}`),

  // Auth
  me: () => request<{ user: User }>('/api/auth/me'),
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone: string;
    whatsappNumber: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
  }) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  adminLogin: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  updateProfile: (body: {
    name: string;
    phone: string;
    whatsappNumber: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
  }) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Client Bookings
  getMyBookings: () => request<{ bookings: Booking[] }>('/api/bookings/mine'),
  createBooking: (body: {
    serviceIds: number[];
    appointmentDate: string;
    appointmentTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientWhatsapp: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    requirements: string;
  }) =>
    request<{ booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  markWhatsappSent: (bookingId: number) =>
    request<{ booking: Booking }>(
      `/api/bookings/${bookingId}/whatsapp-sent`,
      { method: 'PATCH' }
    ),
  cancelMyBooking: (bookingId: number) =>
    request<{ booking: Booking }>(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    }),

  // Admin Portal
  adminGetStats: () =>
    request<{
      stats: AdminStats;
      upcomingAppointments: Booking[];
      popularServices: Array<{
        name: string;
        bookingsCount: number;
        estimatedTotal: number;
      }>;
    }>('/api/admin/stats'),
  adminGetBookings: (params?: { status?: string; search?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.date) q.set('date', params.date);
    const qs = q.toString();
    return request<{ bookings: Booking[] }>(
      `/api/admin/bookings${qs ? `?${qs}` : ''}`
    );
  },
  adminUpdateBooking: (
    bookingId: number,
    body: {
      status?: BookingStatus;
      adminNotes?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    }
  ) =>
    request<{ booking: Booking }>(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  adminGetClients: () =>
    request<{ clients: AdminClientSummary[] }>('/api/admin/clients'),
  adminGetClientDetail: (clientId: number) =>
    request<{ client: User; bookings: Booking[] }>(
      `/api/admin/clients/${clientId}`
    ),
  adminGetServices: () =>
    request<{ services: ServiceItem[] }>('/api/admin/services'),
  adminCreateService: (body: Omit<ServiceItem, 'id' | 'slug'>) =>
    request<{ service: ServiceItem }>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  adminUpdateService: (id: number, body: Omit<ServiceItem, 'id' | 'slug'>) =>
    request<{ service: ServiceItem }>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  adminDeleteService: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/services/${id}`, {
      method: 'DELETE',
    }),
  adminGetAvailability: () =>
    request<{
      rules: AvailabilityRule[];
      overrides: AvailabilityOverride[];
    }>('/api/admin/availability'),
  adminUpdateRule: (
    dayOfWeek: number,
    body: { isAvailable: boolean; slots: string[] }
  ) =>
    request<{ rule: AvailabilityRule }>(
      `/api/admin/availability/rules/${dayOfWeek}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    ),
  adminUpsertOverride: (body: {
    overrideDate: string;
    isBlocked: boolean;
    customSlots?: string[] | null;
    reason?: string;
  }) =>
    request<{ override: AvailabilityOverride }>(
      '/api/admin/availability/overrides',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),
  adminDeleteOverride: (date: string) =>
    request<{ ok: boolean }>(`/api/admin/availability/overrides/${date}`, {
      method: 'DELETE',
    }),
  adminGetSettings: () =>
    request<{ settings: Record<string, string> }>('/api/admin/settings'),
  adminUpdateSettings: (body: Record<string, string>) =>
    request<{ settings: Record<string, string> }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

