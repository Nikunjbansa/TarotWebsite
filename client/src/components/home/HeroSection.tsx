import { ArrowRight, Sparkles, Shield, Star, HeartHandshake } from 'lucide-react';
import { AstrolabeSeal } from '../common/SacredGeometry';
import { useSanctuary } from '../../lib/authContext';

export function HeroSection() {
  const { publicConfig } = useSanctuary();

  const scrollToServices = () => {
    const el = document.querySelector('#services');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-sanctuary-mesh pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      {/* Ambient Astrolabe Ornament */}
      <div className="pointer-events-none absolute -top-24 -left-24 text-[#C6A16B]/20 animate-slow-spin">
        <AstrolabeSeal className="w-96 h-96" />
      </div>
      <div className="pointer-events-none absolute -bottom-32 right-0 text-[#9E82BC]/20 animate-slow-spin">
        <AstrolabeSeal className="w-[460px] h-[460px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Editorial Copy Column */}
          <div className="lg:col-span-7 space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FFFDFA]/90 border border-[#C6A16B]/40 shadow-sm text-xs font-medium tracking-wider uppercase text-[#5F3D61]">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" />
              <span>
                {publicConfig.sanctuaryName} · By {publicConfig.practitionerName}
              </span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold text-[#2B142C] leading-[1.08] tracking-tight">
              Awaken Inner Clarity,{' '}
              <span className="italic font-normal text-[#8D5062]">
                Heal Deeply
              </span>{' '}
              &amp; Walk in Sacred Alignment
            </h1>

            <p className="text-base sm:text-lg text-[#503252] leading-relaxed max-w-2xl">
              Step into a serene space for Akashik Tarot readings, Vedic Jyotish
              astrology, and transformative Himalayan &amp; Shakti energy
              healing. Compassionate guidance designed to illuminate crossroads,
              dissolve energetic heaviness, and restore calm certainty.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm sm:text-base font-medium hover:bg-[#411E42] transition-all shadow-lg shadow-[#2B142C]/15 hover:-translate-y-0.5 cursor-pointer"
              >
                Book Your Consultation
                <ArrowRight className="w-4 h-4 text-[#E8D7BC]" />
              </button>
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFFDFA]/85 hover:bg-[#EFE8F6] border border-[#C6A16B]/45 text-[#2B142C] text-sm sm:text-base font-medium transition cursor-pointer"
              >
                Explore 10 Sacred Services
              </button>
            </div>

            {/* Trust Metric Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#C6A16B]/25">
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  5 Years+
                </p>
                <p className="text-xs text-[#654566]">
                  Jyotish, Tarot &amp; Healing Mastery
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  500+ Sessions
                </p>
                <p className="text-xs text-[#654566]">
                  1:1 Consultations Worldwide
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  10 Sacred
                </p>
                <p className="text-xs text-[#654566]">
                  Readings, Rituals &amp; Healings
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B142C]">
                  100%
                </p>
                <p className="text-xs text-[#654566]">
                  Discreet &amp; Confidential
                </p>
              </div>
            </div>
          </div>

          {/* Visual Centerpiece Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Outer Gold Arch Accent */}
              <div className="absolute -inset-3 rounded-t-[200px] rounded-b-[28px] border border-[#C6A16B]/45 pointer-events-none" />

              <div className="relative overflow-hidden rounded-t-[190px] rounded-b-[24px] shadow-2xl shadow-[#2B142C]/20 border border-[#FAF6F1] bg-[#2B142C]">
                <img
                  src="/images/hero-sanctuary.jpg"
                  alt="Celestial tarot deck, amethyst crystals, dried lavender, and antique brass astrolabe on ivory and dusty rose silk"
                  className="w-full h-[380px] sm:h-[460px] object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B142C]/65 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 glass-ivory rounded-2xl p-4 border border-[#C6A16B]/35">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#8D5062] font-semibold">
                        Personal 1:1 Care
                      </p>
                      <p className="font-serif-display text-lg font-semibold text-[#2B142C]">
                        Direct 1:1 Booking via WhatsApp
                      </p>
                    </div>
                    <span className="w-10 h-10 rounded-full bg-[#2B142C] text-[#E8D7BC] flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-4 text-[11px] text-[#5F3D61]">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[#8D6CA9]" />
                      No Fear-Mongering
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#B5727B]" />
                      WhatsApp Personal Confirmation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

