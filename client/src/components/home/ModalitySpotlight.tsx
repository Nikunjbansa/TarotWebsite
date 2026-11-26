import { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AstrolabeSeal } from '../common/SacredGeometry';

const SPOTLIGHTS = [
  {
    key: 'akashik-tarot',
    title: 'Akashik & Intuitive Tarot',
    modalities: 'Akashik Tarot Reading · Tarot Reading',
    image: '/images/service-tarot.jpg',
    heading: 'Decode Karmic Patterns & Present Crossroads',
    description:
      'While traditional Tarot illumines immediate energies, relationship dynamics, and practical choices over the coming months, Akashik Tarot opens the subtle soul ledger—revealing why certain patterns repeat and how to release them gracefully.',
    highlights: [
      'Direct clarity for career, relationships, and relocation',
      'Identifies emotional blocks before they escalate',
      'No birth time required—ideal for swift soulful insight',
    ],
  },
  {
    key: 'astrology-rituals',
    title: 'Vedic Astrology & Rituals',
    modalities: 'Astrology · Rituals · Hoomkar with Halaum',
    image: '/images/service-astrology.jpg',
    heading: 'Planetary Timing & Sacred Sankalpa Alignment',
    description:
      'Through classical Jyotish Shastra—Lagna, Navamsa, and active Mahadasha cycles—we map favorable timelines and karmic themes. Paired with personalized Rituals or Hoomkar with Halaum sound invocations, remedies remain deeply reverent and serene.',
    highlights: [
      'Precise birth-chart timing for milestones & transitions',
      'Accessible lifestyle & mantra Upayas tailored to your routine',
      'Lunar-aligned rituals for peace, prosperity, and protection',
    ],
  },
  {
    key: 'energy-healing',
    title: 'Himalayan & Shakti Healing',
    modalities:
      'Shiv–Shakti · Maa Tara · Lama Fera · M.E.V · Mahakali Healing',
    image: '/images/service-healing.jpg',
    heading: 'Subtle Aura Restoration & Deep Energetic Liberation',
    description:
      'Beyond insight lies embodied energetic renewal. From Himalayan Lama Fera chakra clearing and Maa Tara compassionate grace to Shiv–Shakti equilibrium, M.E.V frequency calibration, and Mahakali cord-cutting, each transmission meets your nervous system with gentle authority.',
    highlights: [
      'Clears heaviness, emotional overwhelm, and energetic fatigue',
      'Restores inner stillness, healthy boundaries, and clarity',
      '1:1 distance transmissions with guided integration debrief',
    ],
  },
];

export function ModalitySpotlight() {
  const [activeKey, setActiveKey] = useState(SPOTLIGHTS[0].key);
  const current =
    SPOTLIGHTS.find((item) => item.key === activeKey) || SPOTLIGHTS[0];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-plum-velvet text-[#FAF6F1]">
      <div className="pointer-events-none absolute -right-24 top-10 text-[#C6A16B]/10 animate-slow-spin">
        <AstrolabeSeal className="w-[420px] h-[420px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 mb-12">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E8D7BC]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Choosing Your Path
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#FAF6F1]">
              Where Insight Meets Deep Energetic Healing
            </h2>
          </div>

          {/* Balanced 3-tab layout: single row on desktop/tablet, stacked on mobile */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl"
            role="tablist"
            aria-label="Healing and reading modality pathways"
          >
            {SPOTLIGHTS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={tab.key === activeKey}
                onClick={() => setActiveKey(tab.key)}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer text-center w-full min-h-[44px] flex items-center justify-center ${
                  tab.key === activeKey
                    ? 'bg-[#E8D7BC] text-[#2B142C] font-semibold shadow-md'
                    : 'bg-[#FAF6F1]/10 text-[#FAF6F1] hover:bg-[#FAF6F1]/20 border border-[#C6A16B]/30'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF6F1]/5 border border-[#C6A16B]/25 rounded-3xl p-5 sm:p-8 backdrop-blur-sm">
          <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-[#C6A16B]/30">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-72 sm:h-88 object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div className="lg:col-span-7 space-y-5 lg:pl-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#DFB4B6]/15 border border-[#DFB4B6]/35 text-xs text-[#DFB4B6] tracking-wide">
              {current.modalities}
            </span>
            <h3 className="font-serif-display text-2xl sm:text-4xl font-semibold text-[#FAF6F1]">
              {current.heading}
            </h3>
            <p className="text-sm sm:text-base text-[#EADFE9]/85 leading-relaxed">
              {current.description}
            </p>
            <ul className="space-y-2.5 pt-1">
              {current.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2.5 text-sm text-[#F5ECE0]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E8D7BC] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF6F1] text-[#2B142C] text-sm font-semibold hover:bg-[#E8D7BC] transition"
              >
                Explore Services &amp; Book Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

