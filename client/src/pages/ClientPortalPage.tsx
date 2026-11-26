import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  History,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
  AlertCircle,
} from 'lucide-react';
import { useSanctuary } from '../lib/authContext';
import { api, ApiError } from '../lib/api';
import { formatDisplayDate, formatInr, formatShortDate } from '../lib/format';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToast } from '../components/common/Toast';
import type {
  Booking,
  DayAvailability,
  DaySummary,
  ServiceCategory,
} from '../types';

const CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Divination & Astrology',
  'Energy & Tantra Healing',
  'Sacred Rituals',
];

export function ClientPortalPage() {
  const {
    user,
    authLoading,
    services,
    selectedServiceIds,
    toggleSelectedService,
    clearSelectedServices,
    setUser,
    publicConfig,
  } = useSanctuary();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'book' | 'history' | 'profile'>(
    'book'
  );
  const [catFilter, setCatFilter] = useState<'All' | ServiceCategory>('All');

  // Availability & Scheduling
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [calendarDays, setCalendarDays] = useState<DaySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayAvailability, setDayAvailability] =
    useState<DayAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Personal & Requirements Form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Bookings history & active WhatsApp modal
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [whatsappModalBooking, setWhatsappModalBooking] =
    useState<Booking | null>(null);

  // Profile form state
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
      setClientPhone(user.phone || '');
      setClientWhatsapp(user.whatsappNumber || user.phone || '');
      setDateOfBirth(user.dateOfBirth || '');
      setTimeOfBirth(user.timeOfBirth || '');
      setPlaceOfBirth(user.placeOfBirth || '');
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user || user.role !== 'client') return;
    setLoadingBookings(true);
    try {
      const res = await api.getMyBookings();
      setMyBookings(res.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await api.getAvailabilitySummary(todayIso, 21);
      setCalendarDays(res.days);
      if (!selectedDate) {
        const firstOpen = res.days.find((d) => d.isOpen);
        if (firstOpen) {
          setSelectedDate(firstOpen.date);
        } else if (res.days[0]) {
          setSelectedDate(res.days[0].date);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'client') {
      void loadBookings();
      void loadSummary();
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime('');
    api
      .getAvailabilityDate(selectedDate)
      .then((res) => setDayAvailability(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );

  const totalAmount = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0),
    [selectedServices]
  );

  const requiresBirthDetails = useMemo(
    () => selectedServices.some((s) => s.requiresBirthDetails),
    [selectedServices]
  );

  const filteredServices = useMemo(
    () =>
      catFilter === 'All'
        ? services
        : services.filter((s) => s.category === catFilter),
    [services, catFilter]
  );

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF6F1]">
        <div className="text-center space-y-2">
          <Sparkles className="w-7 h-7 text-[#8D6CA9] mx-auto animate-pulse" />
          <p className="text-sm text-[#5F3D61]">Opening your sacred portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      showToast('Please select at least one service first.', 'error');
      return;
    }
    if (!selectedDate || !selectedTime) {
      showToast('Please choose an available appointment date and slot.', 'error');
      return;
    }
    if (requiresBirthDetails && !dateOfBirth.trim()) {
      showToast(
        'Date of Birth is required because Astrology or Rituals is selected.',
        'error'
      );
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await api.createBooking({
        serviceIds: selectedServices.map((s) => s.id),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        clientName,
        clientEmail,
        clientPhone,
        clientWhatsapp,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
        requirements,
      });

      clearSelectedServices();
      setRequirements('');
      setSelectedTime('');
      setWhatsappModalBooking(res.booking);
      showToast('Booking request saved! Continue on WhatsApp to send manually.');
      await Promise.all([loadBookings(), loadSummary()]);
      // Refresh current date slots
      const refreshedDay = await api.getAvailabilityDate(selectedDate);
      setDayAvailability(refreshedDay);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to save booking request.',
        'error'
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleWhatsappLaunch = async (booking: Booking) => {
    try {
      const res = await api.markWhatsappSent(booking.id);
      setMyBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? res.booking : b))
      );
      if (whatsappModalBooking?.id === booking.id) {
        setWhatsappModalBooking(res.booking);
      }
    } catch {
      // non-blocking
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Pre-filled booking message copied to clipboard.');
    } catch {
      showToast('Please select and copy the text manually.', 'error');
    }
  };

  const handleCancelPending = async (bookingId: number) => {
    try {
      const res = await api.cancelMyBooking(bookingId);
      setMyBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.booking : b))
      );
      showToast('Pending booking cancelled and slot released.');
      void loadSummary();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not cancel booking.',
        'error'
      );
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        name: clientName,
        phone: clientPhone,
        whatsappNumber: clientWhatsapp,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
      });
      setUser(res.user);
      showToast('Your client profile & birth details have been updated.');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update profile.',
        'error'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-8 border-b border-[#C6A16B]/25">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8D5062]">
              Client Consultation Portal
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B142C] mt-1">
              Namaste, {user.name}
            </h1>
            <p className="text-sm text-[#5F3D61] mt-1">
              Select multiple sacred services, choose an available slot, and
              finalize directly on WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-[#2B142C] text-[#FAF6F1] shadow'
                  : 'bg-[#FFFDFA] text-[#411E42] border border-[#D8C7EB] hover:bg-[#EFE8F6]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Book Consultation
              {selectedServices.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#DFB4B6] text-[#2B142C] text-[11px]">
                  {selectedServices.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#2B142C] text-[#FAF6F1] shadow'
                  : 'bg-[#FFFDFA] text-[#411E42] border border-[#D8C7EB] hover:bg-[#EFE8F6]'
              }`}
            >
              <History className="w-4 h-4" />
              My Bookings ({myBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#2B142C] text-[#FAF6F1] shadow'
                  : 'bg-[#FFFDFA] text-[#411E42] border border-[#D8C7EB] hover:bg-[#EFE8F6]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Profile &amp; Birth Info
            </button>
          </div>
        </div>

        {/* TAB 1: BOOK CONSULTATION */}
        {activeTab === 'book' && (
          <form
            onSubmit={handleSubmitBooking}
            className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Builder Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Select Multiple Services */}
              <section className="bg-[#FFFDFA] rounded-3xl p-6 sm:p-7 border border-[#C6A16B]/30 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D5062] font-semibold">
                      Step 1 of 3
                    </span>
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                      Browse &amp; Select Sacred Services
                    </h2>
                  </div>
                  <span className="text-xs text-[#654566]">
                    Multiple services allowed
                  </span>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatFilter(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                        catFilter === c
                          ? 'bg-[#2B142C] text-[#FAF6F1]'
                          : 'bg-[#FAF6F1] border border-[#D8C7EB] text-[#411E42] hover:bg-[#EFE8F6]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Selectable Service List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredServices.map((svc) => {
                    const checked = selectedServiceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleSelectedService(svc.id)}
                        className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between gap-3 cursor-pointer ${
                          checked
                            ? 'bg-[#EFE8F6]/75 border-[#2B142C] ring-1 ring-[#2B142C]'
                            : 'bg-[#FAF6F1]/70 border-[#D8C7EB]/80 hover:border-[#B5727B]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif-display text-xl font-semibold text-[#2B142C] leading-snug">
                              {svc.name}
                            </h3>
                            <p className="text-[11px] text-[#654566]">
                              {svc.category} · {svc.durationMinutes} mins
                            </p>
                          </div>
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                              checked
                                ? 'bg-[#2B142C] text-[#FAF6F1]'
                                : 'bg-[#FFFDFA] border border-[#C6A16B]/60 text-[#654566]'
                            }`}
                          >
                            {checked ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-[#411E42]/85 line-clamp-2">
                          {svc.shortDescription}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8D7BC]/50">
                          <span className="font-serif-display text-xl font-semibold text-[#2B142C]">
                            {formatInr(svc.price)}
                          </span>
                          {svc.requiresBirthDetails && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7EBED] text-[#8D5062] font-medium">
                              Birth Info Required
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 2: Preferred Date & Time */}
              <section className="bg-[#FFFDFA] rounded-3xl p-6 sm:p-7 border border-[#C6A16B]/30 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D5062] font-semibold">
                      Step 2 of 3
                    </span>
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                      Choose Preferred Appointment Date &amp; Time
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#654566]">Jump to date:</label>
                    <input
                      type="date"
                      min={todayIso}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs text-[#2B142C]"
                    />
                  </div>
                </div>

                {/* 14-day quick availability strip */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                  {calendarDays.slice(0, 14).map((d) => {
                    const active = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date)}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                          active
                            ? 'bg-[#2B142C] text-[#FAF6F1] border-[#2B142C] shadow'
                            : d.isOpen
                            ? 'bg-[#FAF6F1] border-[#D8C7EB] text-[#2B142C] hover:bg-[#EFE8F6]'
                            : 'bg-[#F5F2F2] border-transparent text-[#9D8E9A] opacity-70'
                        }`}
                      >
                        <span className="text-xs font-semibold block">
                          {formatShortDate(d.date)}
                        </span>
                        <span className="text-[10px] block mt-0.5 opacity-80">
                          {d.isOpen ? `${d.availableCount} open` : 'Closed'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Time slots for selectedDate */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#5F3D61] mb-3">
                    <Calendar className="w-4 h-4 text-[#8D6CA9]" />
                    <span>
                      Available Slots for{' '}
                      <strong className="text-[#2B142C]">
                        {formatDisplayDate(selectedDate)}
                      </strong>{' '}
                      (IST)
                    </span>
                  </div>

                  {loadingSlots ? (
                    <p className="text-xs text-[#654566]">
                      Checking sanctuary availability...
                    </p>
                  ) : dayAvailability && !dayAvailability.isOpen ? (
                    <div className="p-4 rounded-2xl bg-[#F9E8EA] border border-[#DFB4B6] text-xs sm:text-sm text-[#7D2E38] flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        {dayAvailability.reason ||
                          'No consultations available on this date. Please select another day.'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {(dayAvailability?.slots || []).map((slot) => {
                        const isPicked = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition ${
                              !slot.available
                                ? 'bg-[#F2EFEF] text-[#9A8C98] border-[#E2D9E0] line-through cursor-not-allowed'
                                : isPicked
                                ? 'bg-[#2B142C] text-[#FAF6F1] border-[#2B142C] shadow cursor-pointer'
                                : 'bg-[#FAF6F1] text-[#2B142C] border-[#D8C7EB] hover:bg-[#EFE8F6] cursor-pointer'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {slot.time}
                            {!slot.available && (
                              <span className="text-[10px] ml-1">(Booked)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Step 3: Personal Details & Requirements */}
              <section className="bg-[#FFFDFA] rounded-3xl p-6 sm:p-7 border border-[#C6A16B]/30 shadow-sm space-y-5">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D5062] font-semibold">
                    Step 3 of 3
                  </span>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                    Personal Details &amp; Session Requirements
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm text-[#2B142C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm text-[#2B142C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm text-[#2B142C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                      WhatsApp Number (for confirmation &amp; Meet link) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientWhatsapp}
                      onChange={(e) => setClientWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm text-[#2B142C]"
                    />
                  </div>
                </div>

                {/* Birth Info Section */}
                <div
                  className={`p-4 rounded-2xl border ${
                    requiresBirthDetails
                      ? 'bg-[#F7EBED]/60 border-[#DFB4B6]'
                      : 'bg-[#FAF6F1] border-[#E8D7BC]/60'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#2B142C] mb-2.5">
                    Birth Details{' '}
                    {requiresBirthDetails ? (
                      <span className="text-[#8E3B46]">
                        (Date of Birth required for selected Astrology / Rituals)
                      </span>
                    ) : (
                      <span className="font-normal text-[#654566]">
                        (Optional for Tarot &amp; Energy Healing)
                      </span>
                    )}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#654566] mb-1">
                        Date of Birth {requiresBirthDetails ? '*' : ''}
                      </label>
                      <input
                        type="date"
                        required={requiresBirthDetails}
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDFA] border border-[#D8C7EB] text-xs text-[#2B142C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#654566] mb-1">
                        Time of Birth
                      </label>
                      <input
                        type="text"
                        value={timeOfBirth}
                        onChange={(e) => setTimeOfBirth(e.target.value)}
                        placeholder="e.g. 07:45 AM or Unknown"
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDFA] border border-[#D8C7EB] text-xs text-[#2B142C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#654566] mb-1">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        value={placeOfBirth}
                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                        placeholder="City, State, Country"
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDFA] border border-[#D8C7EB] text-xs text-[#2B142C]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5F3D61] mb-1.5">
                    Your Questions, Life Context &amp; Healing Intentions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={5}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Share what you are navigating—career crossroads, relationship clarity, emotional heaviness, specific questions, or healing intentions..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm text-[#2B142C]"
                  />
                </div>
              </section>
            </div>

            {/* Right Sticky Summary Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              <div className="bg-[#2B142C] text-[#FAF6F1] rounded-3xl p-6 sm:p-7 border border-[#C6A16B]/40 shadow-2xl space-y-5">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#E8D7BC]">
                    Consultation Summary
                  </span>
                  <h3 className="font-serif-display text-2xl font-semibold mt-0.5">
                    Your Sacred Selection
                  </h3>
                </div>

                {selectedServices.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#FAF6F1]/5 border border-[#FAF6F1]/15 text-xs text-[#EADFE9]/80">
                    Select one or more services on the left to build your
                    personalized session summary.
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {selectedServices.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-2 pb-3 border-b border-[#FAF6F1]/10 text-sm"
                      >
                        <div>
                          <p className="font-medium text-[#FAF6F1]">{s.name}</p>
                          <p className="text-[11px] text-[#DFB4B6]">
                            {s.durationMinutes} mins
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-[#E8D7BC]">
                            {formatInr(s.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSelectedService(s.id)}
                            className="p-1 rounded-full hover:bg-[#FAF6F1]/10 text-[#DFB4B6] cursor-pointer"
                            aria-label={`Remove ${s.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center justify-between text-[#EADFE9]/80">
                    <span>Preferred Date</span>
                    <span className="font-medium text-[#FAF6F1]">
                      {selectedDate ? formatDisplayDate(selectedDate) : 'Not chosen'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#EADFE9]/80">
                    <span>Preferred Slot</span>
                    <span className="font-medium text-[#FAF6F1]">
                      {selectedTime || 'Select a time'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#EADFE9]/80">
                    <span>Combined Duration</span>
                    <span className="font-medium text-[#FAF6F1]">
                      {totalDuration} mins
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#FAF6F1]/15 flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#DFB4B6]">
                    Estimated Total
                  </span>
                  <span className="font-serif-display text-3xl font-semibold text-[#E8D7BC]">
                    {formatInr(totalAmount)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F1]/10 border border-[#C6A16B]/30 text-[11px] leading-relaxed text-[#EADFE9]/90">
                  No payment is collected online. Submitting saves your request
                  and prepares your pre-filled message for you to{' '}
                  <strong className="text-[#E8D7BC]">
                    manually send on WhatsApp
                  </strong>
                  . Confirmation, payment details, and Google Meet links are
                  handled personally on WhatsApp.
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking || selectedServices.length === 0}
                  className="w-full py-3.5 rounded-full bg-[#E8D7BC] text-[#2B142C] text-sm font-semibold hover:bg-[#FAF6F1] transition inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  {submittingBooking
                    ? 'Preparing Request...'
                    : 'Save & Continue on WhatsApp'}
                </button>
              </div>
            </aside>
          </form>
        )}

        {/* TAB 2: MY BOOKINGS HISTORY */}
        {activeTab === 'history' && (
          <div className="pt-8 space-y-5">
            {loadingBookings ? (
              <p className="text-sm text-[#5F3D61]">Loading your bookings...</p>
            ) : myBookings.length === 0 ? (
              <div className="bg-[#FFFDFA] rounded-3xl p-10 text-center border border-[#C6A16B]/30 space-y-4">
                <Sparkles className="w-8 h-8 text-[#8D6CA9] mx-auto" />
                <h3 className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                  No Consultation Requests Yet
                </h3>
                <p className="text-sm text-[#5F3D61] max-w-md mx-auto">
                  Select your desired readings or healing modalities to reserve
                  your first session.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="px-6 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium cursor-pointer"
                >
                  Browse Modalities
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#FFFDFA] rounded-3xl p-6 border border-[#C6A16B]/30 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D7BC]/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold tracking-wider text-[#8D5062]">
                            {b.bookingCode}
                          </span>
                          <StatusBadge status={b.status} />
                          {b.whatsappConfirmedSent && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF4EE] text-[#265B3F]">
                              WhatsApp Opened
                            </span>
                          )}
                        </div>
                        <p className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                          {formatDisplayDate(b.appointmentDate)} ·{' '}
                          {b.appointmentTime}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-[#654566] block">
                          Estimated Total ({b.totalDurationMinutes} mins)
                        </span>
                        <span className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                          {formatInr(b.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {b.items.map((item) => (
                        <span
                          key={item.id}
                          className="px-3.5 py-1.5 rounded-full bg-[#EFE8F6] text-xs font-medium text-[#2B142C]"
                        >
                          {item.serviceName} · {formatInr(item.servicePrice)}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-[#411E42] bg-[#FAF6F1] p-3.5 rounded-2xl">
                      <strong className="text-xs uppercase tracking-wider text-[#654566] block mb-1">
                        Your Submitted Requirements:
                      </strong>
                      {b.requirements}
                    </p>

                    {b.adminNotes && (
                      <div className="p-3.5 rounded-2xl bg-[#F7EBED]/70 border border-[#DFB4B6] text-xs text-[#411E42]">
                        <strong className="uppercase tracking-wider text-[#8E3B46] block mb-1">
                          Sanctuary Update:
                        </strong>
                        {b.adminNotes}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setWhatsappModalBooking(b)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-xs font-semibold hover:bg-[#411E42] transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#E8D7BC]" />
                        View &amp; Send WhatsApp Message
                      </button>

                      {b.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelPending(b.id)}
                          className="px-4 py-2 rounded-full border border-[#DFB4B6] text-xs font-medium text-[#8E3B46] hover:bg-[#F9E8EA] transition cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & BIRTH DETAILS */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="pt-8 max-w-2xl bg-[#FFFDFA] mt-8 rounded-3xl p-6 sm:p-8 border border-[#C6A16B]/30 shadow-sm space-y-5"
          >
            <div>
              <h2 className="font-serif-display text-2xl font-semibold text-[#2B142C]">
                Client Profile &amp; Saved Birth Information
              </h2>
              <p className="text-xs text-[#654566] mt-1">
                Keep your WhatsApp contact and birth chart information ready for
                faster consultation requests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={clientEmail}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F2EFEF] border border-[#D8C7EB] text-sm opacity-75"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                  Time of Birth
                </label>
                <input
                  type="text"
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F3D61] mb-1">
                Place of Birth
              </label>
              <input
                type="text"
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-7 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] transition cursor-pointer disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        )}
      </div>

      {/* WHATSAPP MANUAL TRANSFER MODAL */}
      {whatsappModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-[#1B0B1C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWhatsappModalBooking(null)}
        >
          <div
            className="bg-[#FFFDFA] text-[#2B142C] max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C6A16B]/40 max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D5062] font-semibold">
                  Final Step · Manual WhatsApp Transfer
                </span>
                <h3 className="font-serif-display text-3xl font-semibold mt-0.5">
                  Booking Request {whatsappModalBooking.bookingCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalBooking(null)}
                className="p-2 rounded-full hover:bg-[#EFE8F6] text-[#654566]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFE8F6]/70 border border-[#D8C7EB] text-xs sm:text-sm text-[#411E42] leading-relaxed">
              Your request is saved in our sanctuary records. Tap{' '}
              <strong>“Continue on WhatsApp”</strong> below to open WhatsApp
              with your pre-filled details, then{' '}
              <strong>manually tap Send</strong>. {publicConfig.practitionerName}
              ’s team will confirm your appointment, discuss payment transfer,
              and share your Google Meet link directly on WhatsApp.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5F3D61]">
                  Pre-Filled WhatsApp Message Preview
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyMessage(whatsappModalBooking.whatsappMessage)
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#8D5062] hover:text-[#2B142C] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs bg-[#FAF6F1] border border-[#C6A16B]/30 rounded-2xl p-4 text-[#2B142C] max-h-60 overflow-y-auto leading-relaxed">
                {whatsappModalBooking.whatsappMessage}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href={whatsappModalBooking.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsappLaunch(whatsappModalBooking)}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] transition inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-[#E8D7BC]" />
                Continue on WhatsApp (Send Manually)
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setWhatsappModalBooking(null);
                  setActiveTab('history');
                }}
                className="px-5 py-3.5 rounded-full border border-[#D8C7EB] text-xs font-semibold text-[#411E42] hover:bg-[#EFE8F6] transition cursor-pointer"
              >
                View in My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
