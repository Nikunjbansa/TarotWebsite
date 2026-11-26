import { Sparkles, Compass, Sparkle, Heart, Flame } from 'lucide-react';
import { SacredDivider } from '../common/SacredGeometry';
import { useSanctuary } from '../../lib/authContext';

interface PracticeArea {
  title: string;
  description: string;
  icon: typeof Sparkles;
}

const PRACTICE_AREAS: PracticeArea[] = [
  {
    title: 'Tarot & Akashic Readings',
    description:
      'Intuitive card spreads and soul-level insights to illuminate current crossroads, relationship dynamics, and recurring life patterns.',
    icon: Sparkles,
  },
  {
    title: 'Vedic Astrology',
    description:
      'Grounded birth-chart analysis and planetary timing to bring clarity to career direction, personal milestones, and life transitions.',
    icon: Compass,
  },
  {
    title: 'Energy & M.E.V Healing',
    description:
      'Gentle subtle-energy clearing and Mind–Emotion–Vibration alignment to release stress, calm mental chatter, and restore balance.',
    icon: Heart,
  },
  {
    title: 'Spiritual Guidance & Ho’omkar',
    description:
      'Compassionate 1:1 mentoring paired with sacred sound resonance to dissolve lingering stagnation and reconnect you with inner peace.',
    icon: Flame,
  },
];

export function AboutSection() {
  const { publicConfig } = useSanctuary();

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
                focused M.E.V (Mind–Emotion–Vibration) alignment and sacred
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

            {/* Practice Focus Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {PRACTICE_AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <div
                    key={area.title}
                    className="p-4 rounded-2xl bg-[#FFFDFA] border border-[#D8C7EB]/70 hover:border-[#B5727B]/60 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="w-8 h-8 rounded-xl bg-[#EFE8F6] text-[#2B142C] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#8D6CA9]" />
                      </span>
                      <h3 className="font-serif-display text-base sm:text-lg font-semibold text-[#2B142C]">
                        {area.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#5F3D61] leading-relaxed pl-10">
                      {area.description}
                    </p>
                  </div>
                );
              })}
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
      </div>
    </section>
  );
}
