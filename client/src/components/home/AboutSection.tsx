import { useState } from 'react';
import {
  Sparkles,
  Compass,
  Sparkle,
  Heart,
  Flame,
  Sun,
  Moon,
  Stars,
  Shield,
  Waves,
  Info,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { SacredDivider } from '../common/SacredGeometry';
import { useSanctuary } from '../../lib/authContext';
import { buildServiceBookingWhatsappUrl } from '../../lib/format';
import { ServiceDetailModal } from './ServiceCard';
import type { ServiceItem } from '../../types';

const SERVICE_ICONS: Record<string, LucideIcon> = {
  'akashik-tarot-reading': Stars,
  'tarot-reading': Sparkles,
  astrology: Compass,
  rituals: Flame,
  'shiv-shakti-healing': Sun,
  'maa-tara-healing': Moon,
  'lama-fera-healing': Waves,
  'm-e-v-healing': Heart,
  'mahakali-healing': Shield,
  'hoomkar-with-halaum': Sparkle,
};

export function AboutSection() {
  const { publicConfig, services } = useSanctuary();
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);

  // Deduplicate by slug and preserve configured catalogue order
  const showcaseServices = services.filter(
    (svc, idx, arr) => arr.findIndex((item) => item.slug === svc.slug) === idx
  );

  return (
    <section id="about" className="py-20 sm:py-24 bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Portrait / Altar Column (Left) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#2B142C]/20 border border-[#C6A16B]/40 bg-[#2B142C] aspect-[3/4] sm:aspect-auto sm:h-[540px] lg:h-[580px]">
              <img
                src="/images/akansha-bansal.jpg"
                alt="Akansha Bansal — Founder and Practitioner of Akansha.Predicts"
                className="w-full h-full object-cover object-[center_12%] transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B142C]/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Authentic Personal Philosophy Card */}
            <div className="sm:absolute -bottom-6 -right-4 sm:max-w-xs mt-4 sm:mt-0 bg-[#2B142C] text-[#FAF6F1] rounded-2xl p-5 shadow-xl border border-[#C6A16B]/35">
              <p className="font-serif-accent italic text-sm leading-relaxed text-[#F5ECE0]">
                “Every soul carries its own wisdom. Sometimes, all we need is a
                little guidance to reconnect with it.”
              </p>
              <div className="mt-3 pt-2.5 border-t border-[#FAF6F1]/15 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#DFB4B6]">
                <span>— {publicConfig.practitionerName}</span>
                <span className="text-[10px] text-[#E8D7BC]/80 tracking-widest">
                  Founder
                </span>
              </div>
            </div>
          </div>

          {/* Biography Column (Right) */}
          <div className="lg:col-span-7 space-y-6 lg:pl-4">
            {/* Header Block */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
                <Sparkle className="w-3.5 h-3.5 text-[#C6A16B]" />
                Founder &amp; Spiritual Practitioner
              </span>
              <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C] leading-tight">
                About {publicConfig.practitionerName}
              </h2>
              <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#654566]">
                Tarot Reader · Akashic Records Reader · Spiritual Healer
              </p>
              <SacredDivider className="!justify-start" />
            </div>

            {/* Core Narrative */}
            <div className="space-y-4 text-base text-[#411E42] leading-relaxed">
              <p className="text-[#2B142C] font-serif-accent italic text-lg sm:text-xl leading-snug text-[#5F3D61]">
                Guidance for your soul. Healing for your journey. Clarity for your path.
              </p>

              <p>
                Welcome to{' '}
                <span className="font-semibold text-[#2B142C]">
                  {publicConfig.sanctuaryName}
                </span>
                —a calm, supportive sanctuary created to help you reconnect with
                your inner knowing, find direction amidst uncertainty, and walk
                your path with ease. I am{' '}
                <span className="font-medium text-[#2B142C]">
                  {publicConfig.practitionerName}
                </span>
                , and my work is rooted in honest intuition, grounded spiritual
                awareness, and a genuine care for people navigating life’s
                personal and emotional crossroads.
              </p>

              <p className="text-[#5F3D61]">
                Through intuitive Tarot Readings, Akashic Records consultations,
                and Vedic Astrology alongside restorative Energy Healing—including
                Mantra Energy Vortex (MEV) healing and sacred
                Ho’omkar sound resonance—I provide a quiet space to pause,
                reflect, and gently untangle emotional knots.
              </p>

              <p className="text-[#5F3D61]">
                Whether you are seeking clarity in love and relationships,
                navigating important career transitions, managing emotional
                well-being, or desiring deeper spiritual alignment, every session
                is tailored with patient listening and practical insight. There
                are no fear-based predictions or complicated rituals—only
                warmth, complete confidentiality, and actionable clarity to help
                you move forward with confidence.
              </p>
            </div>

            {/* CTA & Reassurance */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium hover:bg-[#411E42] transition shadow-md"
              >
                Explore Consultations
              </a>
              <span className="text-xs text-[#654566]">
                Hours: {publicConfig.consultationHours} · Confidential 1:1 Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Services Showcase (replaces previous 4-column practice cards) */}
        {showcaseServices.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#C6A16B]/25">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" aria-hidden="true" />
                  Offerings &amp; Modalities
                </span>
                <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  Sacred Services by {publicConfig.practitionerName}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5F3D61] max-w-md">
                Every offering is tailored with calm presence, confidentiality, and direct WhatsApp coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {showcaseServices.map((service) => {
                const Icon = SERVICE_ICONS[service.slug] || Sparkles;
                const whatsappUrl = buildServiceBookingWhatsappUrl(
                  publicConfig.whatsappBusinessNumber,
                  service.name,
                  service.price,
                  publicConfig.sanctuaryName
                );

                return (
                  <article
                    key={service.id}
                    className="group card-sanctuary rounded-2xl overflow-hidden flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="relative h-36 overflow-hidden bg-[#2B142C]">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B0B1C]/80 via-[#2B142C]/20 to-transparent" />
                        <span
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FAF6F1]/90 backdrop-blur-sm border border-[#C6A16B]/40 text-[#2B142C] flex items-center justify-center shadow-sm"
                          aria-hidden="true"
                        >
                          <Icon className="w-4 h-4 text-[#8D5062]" />
                        </span>
                        <span className="absolute bottom-2.5 left-3.5 right-3.5 text-xs font-medium text-[#E8D7BC] truncate">
                          {service.category}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-2">
                        <h4 className="font-serif-display text-xl font-semibold text-[#2B142C] leading-snug">
                          {service.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#5F3D61] leading-relaxed line-clamp-3">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#E8D7BC]/45 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailService(service)}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border border-[#D8C7EB] bg-[#FAF6F1] hover:bg-[#EFE8F6] text-xs font-semibold text-[#411E42] transition-colors cursor-pointer shrink-0"
                      >
                        <Info className="w-3.5 h-3.5 text-[#8D6CA9]" aria-hidden="true" />
                        Details
                      </button>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold transition-colors bg-[#2B142C] text-[#FAF6F1] hover:bg-[#411E42] shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#E8D7BC]" aria-hidden="true" />
                        Book Now
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ServiceDetailModal
        service={detailService}
        publicConfig={publicConfig}
        onClose={() => setDetailService(null)}
      />
    </section>
  );
}
