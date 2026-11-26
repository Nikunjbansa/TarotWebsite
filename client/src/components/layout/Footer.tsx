import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MessageCircle, ShieldCheck, X } from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { LotusEmblem } from '../common/SacredGeometry';
import { buildClientDirectWhatsappUrl } from '../../lib/format';

export function Footer() {
  const { publicConfig, services } = useSanctuary();
  const [policyModal, setPolicyModal] = useState<'privacy' | 'terms' | null>(
    null
  );

  const directWa = buildClientDirectWhatsappUrl(
    publicConfig.whatsappBusinessNumber,
    `Namaste ${publicConfig.sanctuaryName}, I have a general inquiry regarding consultations.`
  );

  return (
    <footer className="bg-plum-velvet text-[#F4ECE2] pt-16 pb-10 border-t border-[#C6A16B]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#FAF6F1]/10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#FAF6F1]/10 border border-[#C6A16B]/40 flex items-center justify-center text-[#E8D7BC]">
                <LotusEmblem className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-serif-display text-2xl font-semibold text-[#FAF6F1]">
                  {publicConfig.sanctuaryName}
                </h3>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#DFB4B6]">
                  By {publicConfig.practitionerName}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#EADFE9]/80 leading-relaxed">
              Astrology, Tarot Reading, Spiritual Guidance and Energy Healing by{' '}
              {publicConfig.practitionerName} — delivered with warmth,
              discretion, and grounded care.
            </p>
            <a
              href={directWa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF6F1]/10 hover:bg-[#FAF6F1]/20 border border-[#C6A16B]/40 text-xs font-medium text-[#E8D7BC] transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Connect Manually on WhatsApp
            </a>
          </div>

          {/* Sanctuary Navigation */}
          <div>
            <h4 className="font-serif-display text-lg font-semibold text-[#FAF6F1] mb-4">
              Explore {publicConfig.sanctuaryName}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#EADFE9]/80">
              <li>
                <a href="/#about" className="hover:text-[#DFB4B6] transition">
                  About {publicConfig.practitionerName}
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-[#DFB4B6] transition">
                  Sacred Services &amp; Pricing
                </a>
              </li>
              <li>
                <a href="/#journey" className="hover:text-[#DFB4B6] transition">
                  Consultation Journey
                </a>
              </li>
              <li>
                <a
                  href="/#testimonials"
                  className="hover:text-[#DFB4B6] transition"
                >
                  Client Reflections
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-[#DFB4B6] transition">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Modalities Directory */}
          <div>
            <h4 className="font-serif-display text-lg font-semibold text-[#FAF6F1] mb-4">
              Healing &amp; Guidance Modalities
            </h4>
            <ul className="grid grid-cols-1 gap-2 text-xs text-[#EADFE9]/80">
              {services.slice(0, 10).map((s) => (
                <li key={s.id}>
                  <a
                    href="/#services"
                    className="hover:text-[#E8D7BC] transition"
                  >
                    • {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coordination & Trust Info */}
          <div className="space-y-4">
            <h4 className="font-serif-display text-lg font-semibold text-[#FAF6F1] mb-4">
              Coordination &amp; Ethics
            </h4>
            <div className="space-y-3 text-sm text-[#EADFE9]/85">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#DFB4B6] mt-0.5 shrink-0" />
                <span>{publicConfig.consultationHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#DFB4B6] mt-0.5 shrink-0" />
                <span>{publicConfig.contactEmail}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#DFB4B6] mt-0.5 shrink-0" />
                <a
                  href={directWa}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E8D7BC] transition"
                >
                  WhatsApp: +91 95605 64150
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF6F1]/5 border border-[#C6A16B]/25 text-xs leading-relaxed text-[#EADFE9]/80">
                <strong className="text-[#E8D7BC] block mb-1">
                  Personal WhatsApp Coordination
                </strong>
                No online checkout or automated meeting links are processed on
                this site. Simply click Book Now on any service to open
                WhatsApp with your pre-filled message, and manually send it to
                receive confirmation and next steps.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EADFE9]/65">
          <p>
            © {new Date().getFullYear()} {publicConfig.sanctuaryName}. All
            rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setPolicyModal('privacy')}
              className="hover:text-[#E8D7BC] transition cursor-pointer"
            >
              Confidentiality &amp; Privacy
            </button>
            <button
              type="button"
              onClick={() => setPolicyModal('terms')}
              className="hover:text-[#E8D7BC] transition cursor-pointer"
            >
              Terms of Consultation
            </button>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-[#DFB4B6]/80 hover:text-[#FAF6F1] transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {policyModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1B0B1C]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="bg-[#FFFDFA] text-[#2B142C] max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C6A16B]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl font-semibold">
                {policyModal === 'privacy'
                  ? 'Confidentiality & Privacy Charter'
                  : 'Terms of Spiritual Consultation'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="p-2 rounded-full hover:bg-[#EFE8F6] text-[#654566]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {policyModal === 'privacy' ? (
              <div className="space-y-3 text-sm text-[#411E42] leading-relaxed">
                <p>
                  Every birth chart detail, tarot question, emotional context,
                  and energy healing intention shared inside{' '}
                  {publicConfig.sanctuaryName} is treated with sacred
                  confidentiality.
                </p>
                <p>
                  Client records are stored solely to prepare your astrological
                  charts, track appointment history, and facilitate manual
                  consultation coordination via WhatsApp. We never sell or share
                  client data with third parties.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#411E42] leading-relaxed">
                <p>
                  Tarot readings, Vedic astrology, rituals, and energy healing
                  modalities are offered for spiritual clarity, personal
                  reflection, and energetic well-being. They do not replace
                  licensed medical, psychiatric, or legal advice.
                </p>
                <p>
                  Appointment confirmations, payment details, and private session
                  links are coordinated manually and directly with our team via
                  WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}

