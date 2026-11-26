import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useSanctuary } from '../lib/authContext';
import { useToast } from '../components/common/Toast';
import { LotusEmblem } from '../components/common/SacredGeometry';

export function ClientAuthPage() {
  const { user, setUser, selectedServiceIds, publicConfig } = useSanctuary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');

  useEffect(() => {
    if (user?.role === 'client') {
      navigate('/portal', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsappNumber(val);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setUser(res.user);
      showToast(`Welcome back to ${publicConfig.sanctuaryName}, ${res.user.name}.`);
      navigate('/portal');
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Unable to sign in.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await api.register({
        name,
        email,
        password,
        phone,
        whatsappNumber: sameAsPhone ? phone : whatsappNumber,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
      });
      setUser(res.user);
      showToast('Your private Client Portal account has been created.');
      navigate('/portal');
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Unable to complete registration.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoClient = () => {
    setMode('login');
    setLoginEmail('ananya@example.com');
    setLoginPassword('ClientPass@2026');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[82vh] bg-sanctuary-mesh py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-[32px] overflow-hidden shadow-2xl shadow-[#2B142C]/15 border border-[#C6A16B]/35 bg-[#FFFDFA]">
        {/* Left Sanctuary Welcome Column */}
        <div className="lg:col-span-5 bg-plum-velvet text-[#FAF6F1] p-8 sm:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <span className="w-12 h-12 rounded-full bg-[#FAF6F1]/10 border border-[#C6A16B]/40 flex items-center justify-center text-[#E8D7BC]">
              <LotusEmblem className="w-7 h-7" />
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold leading-tight">
              Your Private Consultation Portal
            </h1>
            <p className="text-sm text-[#EADFE9]/85 leading-relaxed">
              Sign in or create your client account to select multiple spiritual
              modalities, reserve open slots, save birth details, and carry your
              request straight into WhatsApp.
            </p>
            {selectedServiceIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FAF6F1]/10 border border-[#DFB4B6]/35 text-xs text-[#F5ECE0]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#E8D7BC] block mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedServiceIds.length} Service
                  {selectedServiceIds.length > 1 ? 's' : ''} Waiting in Your
                  Tray
                </span>
                Your selected modalities will remain ready as soon as you enter
                the portal.
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#FAF6F1]/15 text-xs text-[#EADFE9]/75">
            <p>
              • Zero online checkout — payment transfers &amp; Google Meet links
              are shared personally on WhatsApp.
            </p>
            <p>
              • Track live approval statuses and past healing consultations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={fillDemoClient}
                className="text-left underline text-[#E8D7BC] hover:text-white cursor-pointer"
              >
                Quick-fill sample client account (ananya@example.com)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-7 sm:p-10">
          {/* Tabs */}
          <div className="flex p-1 rounded-full bg-[#F3ECE2] border border-[#C6A16B]/25 mb-7 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#2B142C] text-[#FAF6F1] shadow'
                  : 'text-[#5F3D61] hover:text-[#2B142C]'
              }`}
            >
              Client Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#2B142C] text-[#FAF6F1] shadow'
                  : 'text-[#5F3D61] hover:text-[#2B142C]'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#F9E8EA] border border-[#DFB4B6] text-xs sm:text-sm text-[#7D2E38]">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm text-[#2B142C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm text-[#2B142C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Signing In...' : 'Enter Client Portal'}
                <ArrowRight className="w-4 h-4 text-[#E8D7BC]" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5F3D61]">
                    WhatsApp Number *
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#654566] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsappNumber(phone);
                      }}
                      className="accent-[#2B142C]"
                    />
                    Same as phone
                  </label>
                </div>
                <input
                  type="tel"
                  required
                  value={sameAsPhone ? phone : whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  disabled={sameAsPhone}
                  placeholder="9198XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm disabled:opacity-70"
                />
              </div>

              <div className="pt-2 border-t border-[#E8D7BC]/50">
                <p className="text-xs font-medium text-[#654566] mb-2.5">
                  Optional Birth Details (Required later if booking Astrology / Rituals)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    aria-label="Date of birth"
                    className="px-3 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs text-[#2B142C]"
                  />
                  <input
                    type="text"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    placeholder="Time (e.g. 07:45 AM)"
                    className="px-3 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs text-[#2B142C]"
                  />
                  <input
                    type="text"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="Birth City, Country"
                    className="px-3 py-2.5 rounded-xl bg-[#FAF6F1] border border-[#D8C7EB] text-xs text-[#2B142C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Creating Account...' : 'Create Client Account & Continue'}
                <ArrowRight className="w-4 h-4 text-[#E8D7BC]" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#E8D7BC]/45 text-center text-xs text-[#654566]">
            Practitioner or Sanctuary Team?{' '}
            <Link
              to="/admin/login"
              className="font-semibold text-[#2B142C] underline hover:text-[#B5727B]"
            >
              Sign in via Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

