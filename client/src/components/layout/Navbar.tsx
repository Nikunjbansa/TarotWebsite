import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { LotusEmblem } from '../common/SacredGeometry';

const NAV_LINKS = [
  { label: 'Home', target: '#top' },
  { label: 'About', target: '#about' },
  { label: 'Services', target: '#services' },
  { label: 'How It Works', target: '#journey' },
  { label: 'Testimonials', target: '#testimonials' },
  { label: 'FAQ', target: '#faq' },
];

export function Navbar() {
  const { user, publicConfig, logout } = useSanctuary();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (target: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${target}`);
      return;
    }
    if (target === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top announcement ribbon */}
      <div className="bg-[#2B142C] text-[#F5ECE0] text-xs tracking-wider py-2.5 px-4 text-center border-b border-[#C6A16B]/25">
        <span className="inline-flex items-center gap-2 justify-center flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-[#E8D7BC] shrink-0" aria-hidden="true" />
          <span>{publicConfig.announcementText}</span>
        </span>
      </div>

      {/* Main glass navbar */}
      <nav className="glass-ivory border-b border-[#C6A16B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="w-10 h-10 rounded-full bg-[#EFE8F6] border border-[#C6A16B]/40 flex items-center justify-center text-[#2B142C] group-hover:bg-[#2B142C] group-hover:text-[#FAF6F1] transition-colors duration-300">
              <LotusEmblem className="w-6 h-6" />
            </span>
            <div className="leading-tight">
              <span className="font-serif-display text-xl sm:text-2xl font-semibold tracking-tight text-[#2B142C] block">
                {publicConfig.sanctuaryName}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-[#654566] block font-medium">
                Astrology · Tarot · Spiritual Healing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleAnchorClick(item.target)}
                className="text-sm font-medium text-[#411E42] hover:text-[#B5727B] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium hover:bg-[#411E42] transition shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E8D7BC]" />
                  Admin Portal
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 rounded-full border border-[#D8C7EB] text-[#654566] hover:bg-[#F7EBED] hover:text-[#2B142C] transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleAnchorClick('#services')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium hover:bg-[#411E42] transition shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#E8D7BC]" />
                Book Consultation
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl border border-[#C6A16B]/30 text-[#2B142C] bg-[#FFFDFA]"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#FFFDFA] border-t border-[#C6A16B]/20 px-4 py-5 space-y-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => handleAnchorClick(item.target)}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#2B142C] hover:bg-[#EFE8F6] transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E8D7BC]/50 flex flex-col gap-2.5">
              {user?.role === 'admin' ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-center text-sm font-medium"
                  >
                    Open Admin Portal
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-full border border-[#D8C7EB] text-sm text-[#654566]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAnchorClick('#services')}
                  className="w-full py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-center text-sm font-medium"
                >
                  Book Consultation
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
