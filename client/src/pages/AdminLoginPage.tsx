import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useSanctuary } from '../lib/authContext';
import { useToast } from '../components/common/Toast';
import { AstrolabeSeal, LotusEmblem } from '../components/common/SacredGeometry';

export function AdminLoginPage() {
  const { user, setUser, logout } = useSanctuary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await api.adminLogin(email, password);
      setUser(res.user);
      showToast('Signed in to Akansha.Predicts Admin Console.');
      navigate('/admin');
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : 'Unable to verify administrator credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] overflow-hidden bg-plum-velvet text-[#FAF6F1] py-14 px-4 flex items-center justify-center">
      <div className="pointer-events-none absolute -top-24 -right-24 text-[#C6A16B]/10 animate-slow-spin">
        <AstrolabeSeal className="w-96 h-96" />
      </div>

      <div className="relative max-w-md w-full bg-[#FFFDFA] text-[#2B142C] rounded-[32px] p-8 sm:p-10 shadow-2xl border border-[#C6A16B]/40">
        <div className="text-center space-y-2 mb-7">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#2B142C] text-[#E8D7BC] flex items-center justify-center shadow">
            <LotusEmblem className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[#8D5062] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Akansha.Predicts · Admin Access
          </span>
          <h1 className="font-serif-display text-3xl font-semibold text-[#2B142C]">
            Admin Portal Sign In
          </h1>
          <p className="text-xs text-[#654566]">
            Manage bookings, client records, services, pricing, and daily
            availability.
          </p>
        </div>

        {user?.role === 'client' && (
          <div className="mb-5 p-4 rounded-2xl bg-[#EFE8F6] border border-[#9E82BC]/40 text-xs text-[#2B142C] space-y-2">
            <p>
              You are currently signed in as client{' '}
              <strong>{user.email}</strong>. Sign out first to enter the Admin
              Console.
            </p>
            <button
              type="button"
              onClick={() => logout()}
              className="underline font-semibold cursor-pointer"
            >
              Sign out client session
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#F9E8EA] border border-[#DFB4B6] text-xs sm:text-sm text-[#7D2E38]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F3D61] mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8D6CA9] absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@akanshapredicts.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF6F1] border border-[#D8C7EB] focus:border-[#2B142C] focus:outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-semibold hover:bg-[#411E42] transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Verifying...' : 'Access Admin Console'}
            <ArrowRight className="w-4 h-4 text-[#E8D7BC]" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E8D7BC]/45 text-center text-xs text-[#654566]">
          Looking to explore consultations?{' '}
          <Link
            to="/"
            className="font-semibold text-[#2B142C] underline hover:text-[#B5727B]"
          >
            Return to Akansha.Predicts
          </Link>
        </div>
      </div>
    </div>
  );
}

