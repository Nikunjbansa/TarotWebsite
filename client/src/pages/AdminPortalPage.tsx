import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarClock,
  Check,
  Edit3,
  ExternalLink,
  Layers,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useSanctuary } from '../lib/authContext';
import { api, ApiError } from '../lib/api';
import {
  WEEKDAY_NAMES,
  buildClientDirectWhatsappUrl,
  formatDisplayDate,
  formatInr,
} from '../lib/format';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToast } from '../components/common/Toast';
import type {
  AdminClientSummary,
  AdminStats,
  AvailabilityOverride,
  AvailabilityRule,
  Booking,
  BookingStatus,
  ServiceCategory,
  ServiceItem,
  User,
} from '../types';

type AdminTab =
  | 'overview'
  | 'bookings'
  | 'services'
  | 'clients'
  | 'availability'
  | 'settings';

const SERVICE_IMAGES = [
  { label: 'Akashik Tarot Reading', url: '/images/service-akashik-tarot.jpg' },
  { label: 'Tarot & Celestial Deck', url: '/images/service-tarot.jpg' },
  { label: 'Vedic Astrology Astrolabe', url: '/images/service-astrology.jpg' },
  { label: 'Vedic Sacred Rituals', url: '/images/service-rituals.jpg' },
  { label: 'Shiv–Shakti Equilibrium', url: '/images/service-shiv-shakti.jpg' },
  { label: 'Maa Tara Lotus Shrine', url: '/images/service-maa-tara.jpg' },
  { label: 'Lama Fera Singing Bowl', url: '/images/service-lama-fera.jpg' },
  { label: 'M.E.V Crystal Resonance', url: '/images/service-mev.jpg' },
  { label: 'Mahakali Shakti Altar', url: '/images/service-mahakali.jpg' },
  { label: 'Hoomkar Sri Yantra', url: '/images/service-hoomkar.jpg' },
  { label: 'Healing Altar & Lotus', url: '/images/service-healing.jpg' },
];

export function AdminPortalPage() {
  const { user, authLoading, refreshPublicData } = useSanctuary();
  const { showToast } = useToast();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Overview
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [popularServices, setPopularServices] = useState<
    Array<{ name: string; bookingsCount: number; estimatedTotal: number }>
  >([]);

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<BookingStatus>('pending');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  // Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [svcForm, setSvcForm] = useState({
    name: '',
    subtitle: '',
    category: 'Divination & Astrology' as ServiceCategory,
    price: 2500,
    durationMinutes: 45,
    deliveryMode: '1:1 Live Consultation (Coordinated via WhatsApp)',
    shortDescription: '',
    fullDescription: '',
    benefitsText: '',
    requiresBirthDetails: false,
    imageUrl: '/images/service-tarot.jpg',
    isFeatured: false,
    isActive: true,
    sortOrder: 10,
  });

  // Clients
  const [clients, setClients] = useState<AdminClientSummary[]>([]);
  const [selectedClientDetail, setSelectedClientDetail] = useState<{
    client: User;
    bookings: Booking[];
  } | null>(null);

  // Availability
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [newSlotByDay, setNewSlotByDay] = useState<Record<number, string>>({});
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideBlocked, setOverrideBlocked] = useState(true);
  const [overrideCustomSlotsText, setOverrideCustomSlotsText] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Settings
  const [settingsForm, setSettingsForm] = useState({
    sanctuary_name: '',
    practitioner_name: '',
    whatsapp_business_number: '',
    contact_email: '',
    consultation_hours: '',
    announcement_text: '',
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, svcRes, clientsRes, availRes, setRes] =
        await Promise.all([
          api.adminGetStats(),
          api.adminGetBookings(),
          api.adminGetServices(),
          api.adminGetClients(),
          api.adminGetAvailability(),
          api.adminGetSettings(),
        ]);

      setStats(statsRes.stats);
      setUpcoming(statsRes.upcomingAppointments);
      setPopularServices(statsRes.popularServices);
      setBookings(bookingsRes.bookings);
      setServices(svcRes.services);
      setClients(clientsRes.clients);
      setRules(availRes.rules);
      setOverrides(availRes.overrides);
      setSettingsForm({
        sanctuary_name: setRes.settings.sanctuary_name || '',
        practitioner_name: setRes.settings.practitioner_name || '',
        whatsapp_business_number:
          setRes.settings.whatsapp_business_number || '',
        contact_email: setRes.settings.contact_email || '',
        consultation_hours: setRes.settings.consultation_hours || '',
        announcement_text: setRes.settings.announcement_text || '',
      });
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to load admin console.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      void loadAllAdminData();
    }
  }, [user?.id, user?.role]);

  const refreshBookingsAndStats = async (
    nextStatus = statusFilter,
    nextSearch = searchTerm
  ) => {
    const [statsRes, bookingsRes] = await Promise.all([
      api.adminGetStats(),
      api.adminGetBookings({
        status: nextStatus === 'all' ? undefined : nextStatus,
        search: nextSearch || undefined,
      }),
    ]);
    setStats(statsRes.stats);
    setUpcoming(statsRes.upcomingAppointments);
    setPopularServices(statsRes.popularServices);
    setBookings(bookingsRes.bookings);
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF6F1]">
        <p className="text-sm text-[#5F3D61]">Loading Admin Console...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const quickUpdateStatus = async (booking: Booking, status: BookingStatus) => {
    try {
      await api.adminUpdateBooking(booking.id, { status });
      showToast(`Booking ${booking.bookingCode} updated to ${status}.`);
      await refreshBookingsAndStats();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update booking.',
        'error'
      );
    }
  };

  const openBookingEditor = (b: Booking) => {
    setEditingBooking(b);
    setEditStatus(b.status);
    setEditDate(b.appointmentDate);
    setEditTime(b.appointmentTime);
    setEditAdminNotes(b.adminNotes || '');
  };

  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      await api.adminUpdateBooking(editingBooking.id, {
        status: editStatus,
        appointmentDate: editDate,
        appointmentTime: editTime,
        adminNotes: editAdminNotes,
      });
      setEditingBooking(null);
      showToast('Appointment updated successfully.');
      await refreshBookingsAndStats();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to save appointment.',
        'error'
      );
    }
  };

  const openServiceModal = (svc?: ServiceItem) => {
    if (svc) {
      setEditingServiceId(svc.id);
      setSvcForm({
        name: svc.name,
        subtitle: svc.subtitle,
        category: svc.category,
        price: svc.price,
        durationMinutes: svc.durationMinutes,
        deliveryMode: svc.deliveryMode,
        shortDescription: svc.shortDescription,
        fullDescription: svc.fullDescription,
        benefitsText: svc.benefits.join('\n'),
        requiresBirthDetails: svc.requiresBirthDetails,
        imageUrl: svc.imageUrl,
        isFeatured: svc.isFeatured,
        isActive: svc.isActive,
        sortOrder: svc.sortOrder,
      });
    } else {
      setEditingServiceId(null);
      setSvcForm({
        name: '',
        subtitle: '',
        category: 'Divination & Astrology',
        price: 2500,
        durationMinutes: 45,
        deliveryMode: '1:1 Live Consultation (Coordinated via WhatsApp)',
        shortDescription: '',
        fullDescription: '',
        benefitsText: '',
        requiresBirthDetails: false,
        imageUrl: '/images/service-tarot.jpg',
        isFeatured: false,
        isActive: true,
        sortOrder: services.length + 1,
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: svcForm.name,
      subtitle: svcForm.subtitle,
      category: svcForm.category,
      price: Number(svcForm.price),
      durationMinutes: Number(svcForm.durationMinutes),
      deliveryMode: svcForm.deliveryMode,
      shortDescription: svcForm.shortDescription,
      fullDescription: svcForm.fullDescription,
      benefits: svcForm.benefitsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      requiresBirthDetails: svcForm.requiresBirthDetails,
      imageUrl: svcForm.imageUrl,
      isFeatured: svcForm.isFeatured,
      isActive: svcForm.isActive,
      sortOrder: Number(svcForm.sortOrder),
    };

    try {
      if (editingServiceId) {
        await api.adminUpdateService(editingServiceId, payload);
        showToast(`Updated service: ${payload.name}`);
      } else {
        await api.adminCreateService(payload);
        showToast(`Created service: ${payload.name}`);
      }
      setServiceModalOpen(false);
      const [svcRes, statsRes] = await Promise.all([
        api.adminGetServices(),
        api.adminGetStats(),
      ]);
      setServices(svcRes.services);
      setStats(statsRes.stats);
      await refreshPublicData();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to save service.',
        'error'
      );
    }
  };

  const handleDeleteService = async (svc: ServiceItem) => {
    if (!window.confirm(`Delete "${svc.name}" from the catalog?`)) return;
    try {
      await api.adminDeleteService(svc.id);
      showToast(`Deleted "${svc.name}".`);
      const svcRes = await api.adminGetServices();
      setServices(svcRes.services);
      await refreshPublicData();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete service.',
        'error'
      );
    }
  };

  const handleInspectClient = async (clientId: number) => {
    try {
      const detail = await api.adminGetClientDetail(clientId);
      setSelectedClientDetail(detail);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load client details.',
        'error'
      );
    }
  };

  const handleToggleRuleDay = async (rule: AvailabilityRule) => {
    try {
      const res = await api.adminUpdateRule(rule.dayOfWeek, {
        isAvailable: !rule.isAvailable,
        slots: rule.slots,
      });
      setRules((prev) =>
        prev.map((r) => (r.dayOfWeek === rule.dayOfWeek ? res.rule : r))
      );
      showToast(
        `${WEEKDAY_NAMES[rule.dayOfWeek]} marked as ${
          res.rule.isAvailable ? 'Open' : 'Rest Day'
        }.`
      );
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update schedule.',
        'error'
      );
    }
  };

  const handleAddSlotToDay = async (rule: AvailabilityRule) => {
    const slotText = (newSlotByDay[rule.dayOfWeek] || '').trim();
    if (!slotText) return;
    if (rule.slots.includes(slotText)) {
      showToast('That slot already exists on this day.', 'error');
      return;
    }
    const nextSlots = [...rule.slots, slotText];
    try {
      const res = await api.adminUpdateRule(rule.dayOfWeek, {
        isAvailable: rule.isAvailable,
        slots: nextSlots,
      });
      setRules((prev) =>
        prev.map((r) => (r.dayOfWeek === rule.dayOfWeek ? res.rule : r))
      );
      setNewSlotByDay((prev) => ({ ...prev, [rule.dayOfWeek]: '' }));
      showToast(`Added ${slotText} to ${WEEKDAY_NAMES[rule.dayOfWeek]}.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not add slot.',
        'error'
      );
    }
  };

  const handleRemoveSlotFromDay = async (
    rule: AvailabilityRule,
    slotToRemove: string
  ) => {
    const nextSlots = rule.slots.filter((s) => s !== slotToRemove);
    try {
      const res = await api.adminUpdateRule(rule.dayOfWeek, {
        isAvailable: rule.isAvailable,
        slots: nextSlots,
      });
      setRules((prev) =>
        prev.map((r) => (r.dayOfWeek === rule.dayOfWeek ? res.rule : r))
      );
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not remove slot.',
        'error'
      );
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;
    const customSlots = overrideBlocked
      ? null
      : overrideCustomSlotsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    try {
      await api.adminUpsertOverride({
        overrideDate,
        isBlocked: overrideBlocked,
        customSlots,
        reason: overrideReason,
      });
      const availRes = await api.adminGetAvailability();
      setOverrides(availRes.overrides);
      setOverrideDate('');
      setOverrideReason('');
      setOverrideCustomSlotsText('');
      showToast('Date availability override saved.');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to save override.',
        'error'
      );
    }
  };

  const handleDeleteOverride = async (date: string) => {
    try {
      await api.adminDeleteOverride(date);
      setOverrides((prev) => prev.filter((o) => o.overrideDate !== date));
      showToast(`Removed override for ${date}.`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to remove override.',
        'error'
      );
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminUpdateSettings(settingsForm);
      await refreshPublicData();
      showToast('Akansha.Predicts settings updated.');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update settings.',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] pb-16">
      {/* Dark Plum Admin Banner */}
      <div className="bg-plum-velvet text-[#FAF6F1] py-8 border-b border-[#C6A16B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[#E8D7BC] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Akansha.Predicts · Administration Console
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold mt-1">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#EADFE9]/80 mt-1">
              Oversee appointments, services, client profiles, availability, and
              WhatsApp coordination workflows.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'bookings', label: 'Bookings', icon: CalendarClock },
                { id: 'services', label: 'Services', icon: Layers },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'availability', label: 'Availability', icon: Sparkles },
                { id: 'settings', label: 'Settings', icon: Settings },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-[#E8D7BC] text-[#2B142C] shadow'
                      : 'bg-[#FAF6F1]/10 text-[#FAF6F1] hover:bg-[#FAF6F1]/20 border border-[#C6A16B]/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading && !stats ? (
          <p className="text-sm text-[#5F3D61]">Loading Akansha.Predicts dashboard metrics...</p>
        ) : null}

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#FFFDFA] rounded-3xl p-5 border border-[#C6A16B]/30 shadow-sm">
                <p className="text-xs text-[#654566]">Total Booking Requests</p>
                <p className="font-serif-display text-4xl font-semibold text-[#2B142C] mt-1">
                  {stats.totalBookings}
                </p>
                <p className="text-[11px] text-[#8D5062] mt-1">
                  {stats.pendingBookings} awaiting confirmation
                </p>
              </div>
              <div className="bg-[#FFFDFA] rounded-3xl p-5 border border-[#C6A16B]/30 shadow-sm">
                <p className="text-xs text-[#654566]">
                  Accepted &amp; Completed
                </p>
                <p className="font-serif-display text-4xl font-semibold text-[#2B142C] mt-1">
                  {stats.acceptedBookings + stats.completedBookings}
                </p>
                <p className="text-[11px] text-[#654566] mt-1">
                  {stats.acceptedBookings} upcoming · {stats.completedBookings}{' '}
                  completed
                </p>
              </div>
              <div className="bg-[#FFFDFA] rounded-3xl p-5 border border-[#C6A16B]/30 shadow-sm">
                <p className="text-xs text-[#654566]">Registered Clients</p>
                <p className="font-serif-display text-4xl font-semibold text-[#2B142C] mt-1">
                  {stats.totalClients}
                </p>
                <p className="text-[11px] text-[#654566] mt-1">
                  {stats.activeServices} active services
                </p>
              </div>
              <div className="bg-[#2B142C] text-[#FAF6F1] rounded-3xl p-5 border border-[#C6A16B]/40 shadow-sm">
                <p className="text-xs text-[#DFB4B6]">
                  Confirmed Session Value
                </p>
                <p className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#E8D7BC] mt-1">
                  {formatInr(stats.confirmedValueInr)}
                </p>
                <p className="text-[11px] text-[#EADFE9]/75 mt-1">
                  Coordinated privately on WhatsApp
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upcoming Schedule */}
              <div className="lg:col-span-7 bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                    Upcoming &amp; Pending Appointments
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab('bookings')}
                    className="text-xs font-semibold text-[#8D5062] hover:underline cursor-pointer"
                  >
                    Manage All →
                  </button>
                </div>

                {upcoming.length === 0 ? (
                  <p className="text-sm text-[#654566]">
                    No upcoming pending or accepted appointments.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#8D5062]">
                              {b.bookingCode}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="font-medium text-sm text-[#2B142C] mt-1">
                            {b.clientName} ·{' '}
                            <span className="text-[#5F3D61]">
                              {b.items.map((i) => i.serviceName).join(', ')}
                            </span>
                          </p>
                          <p className="text-xs text-[#654566]">
                            {formatDisplayDate(b.appointmentDate)} at{' '}
                            {b.appointmentTime} · {formatInr(b.totalAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {b.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => quickUpdateStatus(b, 'accepted')}
                              className="px-3.5 py-1.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openBookingEditor(b)}
                            className="px-3 py-1.5 rounded-full border border-[#D8C7EB] text-xs font-medium text-[#411E42] hover:bg-[#EFE8F6] cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Services */}
              <div className="lg:col-span-5 bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-4">
                <h2 className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                  Most Requested Modalities
                </h2>
                {popularServices.length === 0 ? (
                  <p className="text-sm text-[#654566]">No service stats yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {popularServices.map((ps) => {
                      const maxCount = Math.max(
                        ...popularServices.map((p) => p.bookingsCount),
                        1
                      );
                      const pct = Math.round(
                        (ps.bookingsCount / maxCount) * 100
                      );
                      return (
                        <div key={ps.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium text-[#2B142C]">
                            <span>{ps.name}</span>
                            <span className="text-[#654566]">
                              {ps.bookingsCount} requests ·{' '}
                              {formatInr(ps.estimatedTotal)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#EFE8F6] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#8D6CA9] to-[#B5727B]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {tab === 'bookings' && (
          <div className="space-y-5">
            <div className="bg-[#FFFDFA] rounded-3xl p-5 border border-[#C6A16B]/30 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    'all',
                    'pending',
                    'accepted',
                    'completed',
                    'rejected',
                    'cancelled',
                  ] as const
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      void refreshBookingsAndStats(st, searchTerm);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#2B142C] text-[#FAF6F1]'
                        : 'bg-[#FAF6F1] text-[#5F3D61] border border-[#D8C7EB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-[#8D6CA9] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    void refreshBookingsAndStats(statusFilter, val);
                  }}
                  placeholder="Search code, client, email, WhatsApp..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FAF6F1] border border-[#D8C7EB] text-xs text-[#2B142C]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-[#FFFDFA] rounded-3xl p-10 text-center border border-[#C6A16B]/30 text-sm text-[#654566]">
                  No bookings match your current filter.
                </div>
              ) : (
                bookings.map((b) => {
                  const replyWa = buildClientDirectWhatsappUrl(
                    b.clientWhatsapp,
                    `Namaste ${b.clientName}, regarding your Akansha.Predicts booking ${b.bookingCode} on ${b.appointmentDate} at ${b.appointmentTime}: `
                  );
                  return (
                    <div
                      key={b.id}
                      className="bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E8D7BC]/45">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-bold tracking-wider text-[#8D5062]">
                              {b.bookingCode}
                            </span>
                            <StatusBadge status={b.status} />
                            {b.whatsappConfirmedSent && (
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF4EE] text-[#265B3F]">
                                Client Sent on WhatsApp
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif-display text-2xl font-semibold text-[#2B142C] mt-1">
                            {b.clientName} —{' '}
                            {formatDisplayDate(b.appointmentDate)} at{' '}
                            {b.appointmentTime}
                          </h3>
                          <p className="text-xs text-[#654566]">
                            Email: {b.clientEmail} · Phone: {b.clientPhone} ·
                            WhatsApp: {b.clientWhatsapp}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="font-serif-display text-3xl font-semibold text-[#2B142C]">
                            {formatInr(b.totalAmount)}
                          </span>
                          <span className="block text-xs text-[#654566]">
                            {b.totalDurationMinutes} mins total
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {b.items.map((item) => (
                          <span
                            key={item.id}
                            className="px-3 py-1 rounded-full bg-[#EFE8F6] text-xs font-medium text-[#2B142C]"
                          >
                            {item.serviceName} ({formatInr(item.servicePrice)})
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-[#FAF6F1] text-[#411E42]">
                          <strong className="uppercase tracking-wider text-[#654566] block mb-1">
                            Requirements / Questions:
                          </strong>
                          {b.requirements}
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#FAF6F1] text-[#411E42] space-y-1">
                          <strong className="uppercase tracking-wider text-[#654566] block">
                            Birth Details &amp; Admin Notes:
                          </strong>
                          <p>
                            DOB: {b.dateOfBirth || '—'} · TOB:{' '}
                            {b.timeOfBirth || '—'} · POB:{' '}
                            {b.placeOfBirth || '—'}
                          </p>
                          {b.adminNotes && (
                            <p className="text-[#8D5062] font-medium pt-1">
                              Note: {b.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {b.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => quickUpdateStatus(b, 'accepted')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold hover:bg-[#411E42] cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept Appointment
                            </button>
                            <button
                              type="button"
                              onClick={() => quickUpdateStatus(b, 'rejected')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DFB4B6] text-[#8E3B46] text-xs font-semibold hover:bg-[#F9E8EA] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => quickUpdateStatus(b, 'completed')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#265B3F] text-white text-xs font-semibold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Completed
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openBookingEditor(b)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D8C7EB] text-[#411E42] text-xs font-semibold hover:bg-[#EFE8F6] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Update / Reschedule / Notes
                        </button>
                        <a
                          href={replyWa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EFE8F6] text-[#2B142C] text-xs font-semibold hover:bg-[#D8C7EB] ml-auto"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Open Client WhatsApp
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES MANAGEMENT */}
        {tab === 'services' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-3xl font-semibold text-[#2B142C]">
                  Manage Services, Pricing &amp; Descriptions
                </h2>
                <p className="text-xs text-[#654566]">
                  Changes reflect immediately across the Akansha.Predicts
                  website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openServiceModal()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs sm:text-sm font-semibold hover:bg-[#411E42] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E8D7BC]" />
                Add New Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-[#FFFDFA] rounded-3xl p-5 border border-[#C6A16B]/30 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={svc.imageUrl}
                        alt={svc.name}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[#D8C7EB]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif-display text-xl font-semibold text-[#2B142C]">
                            {svc.name}
                          </h3>
                          {!svc.isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-[#F2EFEF] text-[10px] text-[#6E616B]">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#654566]">
                          {svc.category} · {svc.durationMinutes} mins
                        </p>
                        <p className="font-serif-display text-2xl font-semibold text-[#2B142C] mt-1">
                          {formatInr(svc.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#411E42] leading-relaxed">
                    {svc.shortDescription}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8D7BC]/45">
                    <button
                      type="button"
                      onClick={() => openServiceModal(svc)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D8C7EB] text-xs font-semibold text-[#2B142C] hover:bg-[#EFE8F6] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Service
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(svc)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-[#DFB4B6] text-xs text-[#8E3B46] hover:bg-[#F9E8EA] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLIENTS DIRECTORY */}
        {tab === 'clients' && (
          <div className="bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-5">
            <h2 className="font-serif-display text-3xl font-semibold text-[#2B142C]">
              Registered Clients ({clients.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E8D7BC] text-xs uppercase tracking-wider text-[#654566]">
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Contact / WhatsApp</th>
                    <th className="py-3 pr-4">Birth Info</th>
                    <th className="py-3 pr-4">Bookings</th>
                    <th className="py-3 pr-4">Confirmed Value</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D7BC]/40 text-xs sm:text-sm">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF6F1]/70">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-[#2B142C]">{c.name}</p>
                        <p className="text-xs text-[#654566]">{c.email}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-[#411E42]">
                        <p>Phone: {c.phone || '—'}</p>
                        <p>WA: {c.whatsappNumber || '—'}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-[#654566]">
                        {c.dateOfBirth ? (
                          <>
                            <p>{c.dateOfBirth}</p>
                            <p>
                              {c.timeOfBirth || '—'} · {c.placeOfBirth || '—'}
                            </p>
                          </>
                        ) : (
                          'Not added'
                        )}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-[#2B142C]">
                        {c.bookingCount}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-[#2B142C]">
                        {formatInr(c.totalConfirmedValue)}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectClient(c.id)}
                          className="px-4 py-1.5 rounded-full bg-[#EFE8F6] hover:bg-[#2B142C] hover:text-[#FAF6F1] text-xs font-semibold text-[#2B142C] transition cursor-pointer"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AVAILABILITY MANAGEMENT */}
        {tab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Weekly Schedule */}
            <div className="lg:col-span-7 bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-5">
              <div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  Weekly Consultation Schedule
                </h2>
                <p className="text-xs text-[#654566]">
                  Toggle weekdays open or closed and manage available IST time
                  slots.
                </p>
              </div>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.dayOfWeek}
                    className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB]/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-display text-xl font-semibold text-[#2B142C]">
                        {WEEKDAY_NAMES[rule.dayOfWeek]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRuleDay(rule)}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          rule.isAvailable
                            ? 'bg-[#EAF4EE] text-[#265B3F] border border-[#6FA787]/40'
                            : 'bg-[#F9E8EA] text-[#8E3B46] border border-[#DFB4B6]'
                        }`}
                      >
                        {rule.isAvailable ? 'Open for Bookings' : 'Rest Day'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {rule.slots.map((slot) => (
                        <span
                          key={slot}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDFA] border border-[#C6A16B]/35 text-xs text-[#2B142C]"
                        >
                          {slot}
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotFromDay(rule, slot)}
                            className="text-[#8E3B46] hover:text-[#2B142C] cursor-pointer"
                            aria-label={`Remove ${slot}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newSlotByDay[rule.dayOfWeek] || ''}
                        onChange={(e) =>
                          setNewSlotByDay((prev) => ({
                            ...prev,
                            [rule.dayOfWeek]: e.target.value,
                          }))
                        }
                        placeholder="Add slot (e.g. 08:00 PM)"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#FFFDFA] border border-[#D8C7EB] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSlotToDay(rule)}
                        className="px-4 py-1.5 rounded-xl bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold cursor-pointer"
                      >
                        Add Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Date Overrides */}
            <div className="lg:col-span-5 space-y-5">
              <form
                onSubmit={handleSaveOverride}
                className="bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-4"
              >
                <h2 className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                  Specific Date Override / Block
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                  />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={overrideBlocked}
                      onChange={() => setOverrideBlocked(true)}
                      className="accent-[#2B142C]"
                    />
                    Block Entire Date
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={!overrideBlocked}
                      onChange={() => setOverrideBlocked(false)}
                      className="accent-[#2B142C]"
                    />
                    Custom Slots
                  </label>
                </div>

                {!overrideBlocked && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                      Comma-Separated Slots
                    </label>
                    <input
                      type="text"
                      required
                      value={overrideCustomSlotsText}
                      onChange={(e) =>
                        setOverrideCustomSlotsText(e.target.value)
                      }
                      placeholder="11:00 AM, 04:00 PM, 07:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                    Reason / Label
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Amavasya Retreat / Festival Holiday"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold hover:bg-[#411E42] cursor-pointer"
                >
                  Save Date Override
                </button>
              </form>

              <div className="bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-3">
                <h3 className="font-serif-display text-xl font-semibold text-[#2B142C]">
                  Active Date Overrides ({overrides.length})
                </h3>
                {overrides.length === 0 ? (
                  <p className="text-xs text-[#654566]">
                    No custom overrides set.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {overrides.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#2B142C]">
                            {formatDisplayDate(o.overrideDate)} ·{' '}
                            <span
                              className={
                                o.isBlocked
                                  ? 'text-[#8E3B46]'
                                  : 'text-[#265B3F]'
                              }
                            >
                              {o.isBlocked ? 'Blocked' : 'Custom Slots'}
                            </span>
                          </p>
                          {o.reason && (
                            <p className="text-[#654566]">{o.reason}</p>
                          )}
                          {o.customSlots && (
                            <p className="text-[#411E42]">
                              {o.customSlots.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteOverride(o.overrideDate)}
                          className="p-1.5 rounded-full hover:bg-[#F9E8EA] text-[#8E3B46] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SANCTUARY SETTINGS */}
        {tab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="max-w-2xl bg-[#FFFDFA] rounded-3xl p-6 sm:p-8 border border-[#C6A16B]/30 shadow-sm space-y-4"
          >
            <h2 className="font-serif-display text-3xl font-semibold text-[#2B142C]">
              Akansha.Predicts Identity &amp; WhatsApp Number
            </h2>
            <p className="text-xs text-[#654566]">
              Configure the WhatsApp Business Number where client booking
              messages are routed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.sanctuary_name}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      sanctuary_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Owner &amp; Practitioner Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.practitioner_name}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      practitioner_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  WhatsApp Number (digits with country code)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsapp_business_number}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      whatsapp_business_number: e.target.value,
                    }))
                  }
                  placeholder="919560564150"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={settingsForm.contact_email}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      contact_email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Consultation Hours Text
              </label>
              <input
                type="text"
                required
                value={settingsForm.consultation_hours}
                onChange={(e) =>
                  setSettingsForm((p) => ({
                    ...p,
                    consultation_hours: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Top Ribbon Announcement Text
              </label>
              <input
                type="text"
                required
                value={settingsForm.announcement_text}
                onChange={(e) =>
                  setSettingsForm((p) => ({
                    ...p,
                    announcement_text: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] cursor-pointer"
            >
              Save Settings
            </button>
          </form>
        )}
      </div>

      {/* MODAL: EDIT BOOKING */}
      {editingBooking && (
        <div
          className="fixed inset-0 z-50 bg-[#1B0B1C]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingBooking(null)}
        >
          <form
            onSubmit={handleSaveBookingEdit}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDFA] text-[#2B142C] max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#C6A16B]/35 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-2xl font-semibold">
                Update Booking {editingBooking.bookingCode}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="p-2 rounded-full hover:bg-[#EFE8F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as BookingStatus)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Admin Notes (visible to client in portal)
              </label>
              <textarea
                rows={3}
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
                placeholder="e.g. Payment acknowledged on WhatsApp. Google Meet link shared."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 rounded-full border border-[#D8C7EB] text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold cursor-pointer"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {serviceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1B0B1C]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setServiceModalOpen(false)}
        >
          <form
            onSubmit={handleSaveService}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDFA] text-[#2B142C] max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C6A16B]/35 max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold">
                {editingServiceId ? 'Edit Sacred Service' : 'Add New Service'}
              </h3>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#EFE8F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={svcForm.name}
                  onChange={(e) =>
                    setSvcForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={svcForm.subtitle}
                  onChange={(e) =>
                    setSvcForm((p) => ({ ...p, subtitle: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Category *
                </label>
                <select
                  value={svcForm.category}
                  onChange={(e) =>
                    setSvcForm((p) => ({
                      ...p,
                      category: e.target.value as ServiceCategory,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                >
                  <option value="Divination & Astrology">
                    Divination &amp; Astrology
                  </option>
                  <option value="Energy & Tantra Healing">
                    Energy &amp; Tantra Healing
                  </option>
                  <option value="Sacred Rituals">Sacred Rituals</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={svcForm.price}
                    onChange={(e) =>
                      setSvcForm((p) => ({
                        ...p,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                    Minutes *
                  </label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={svcForm.durationMinutes}
                    onChange={(e) =>
                      setSvcForm((p) => ({
                        ...p,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Card Artwork
                </label>
                <select
                  value={svcForm.imageUrl}
                  onChange={(e) =>
                    setSvcForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                >
                  {SERVICE_IMAGES.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={svcForm.sortOrder}
                  onChange={(e) =>
                    setSvcForm((p) => ({
                      ...p,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Short Card Summary *
              </label>
              <textarea
                rows={2}
                required
                minLength={10}
                value={svcForm.shortDescription}
                onChange={(e) =>
                  setSvcForm((p) => ({
                    ...p,
                    shortDescription: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Full Description *
              </label>
              <textarea
                rows={3}
                required
                minLength={15}
                value={svcForm.fullDescription}
                onChange={(e) =>
                  setSvcForm((p) => ({
                    ...p,
                    fullDescription: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Key Benefits (one per line)
              </label>
              <textarea
                rows={3}
                value={svcForm.benefitsText}
                onChange={(e) =>
                  setSvcForm((p) => ({ ...p, benefitsText: e.target.value }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-5 text-xs pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={svcForm.requiresBirthDetails}
                  onChange={(e) =>
                    setSvcForm((p) => ({
                      ...p,
                      requiresBirthDetails: e.target.checked,
                    }))
                  }
                  className="accent-[#2B142C]"
                />
                Requires Birth Date/Time
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={svcForm.isActive}
                  onChange={(e) =>
                    setSvcForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="accent-[#2B142C]"
                />
                Active (Visible to Clients)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-[#D8C7EB] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold cursor-pointer"
              >
                {editingServiceId ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CLIENT DETAIL HISTORY */}
      {selectedClientDetail && (
        <div
          className="fixed inset-0 z-50 bg-[#1B0B1C]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedClientDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDFA] text-[#2B142C] max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C6A16B]/35 max-h-[90vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif-display text-3xl font-semibold">
                  {selectedClientDetail.client.name}
                </h3>
                <p className="text-xs text-[#654566]">
                  {selectedClientDetail.client.email} · WhatsApp:{' '}
                  {selectedClientDetail.client.whatsappNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="p-2 rounded-full hover:bg-[#EFE8F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5F3D61]">
                Booking History ({selectedClientDetail.bookings.length})
              </h4>
              {selectedClientDetail.bookings.length === 0 ? (
                <p className="text-xs text-[#654566]">
                  This client has not submitted any bookings yet.
                </p>
              ) : (
                selectedClientDetail.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-[#8D5062]">
                        {b.bookingCode} · {formatDisplayDate(b.appointmentDate)}{' '}
                        ({b.appointmentTime})
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="font-medium text-[#2B142C]">
                      {b.items.map((i) => i.serviceName).join(' · ')} —{' '}
                      {formatInr(b.totalAmount)}
                    </p>
                    <p className="text-[#5F3D61]">{b.requirements}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

