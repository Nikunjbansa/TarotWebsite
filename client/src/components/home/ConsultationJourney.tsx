import { Sparkles, MousePointerClick, MessageCircle, Video } from 'lucide-react';
import { SacredDivider } from '../common/SacredGeometry';

const STEPS = [
  {
    step: '01',
    icon: Sparkles,
    title: 'Explore Sacred Offerings',
    description:
      'Browse our Tarot, Astrology, Rituals, and Energy Healing modalities with clear descriptions, durations, and transparent pricing.',
  },
  {
    step: '02',
    icon: MousePointerClick,
    title: 'Click "Book Now" Instantly',
    description:
      'Choose the session that resonates with you and click Book Now—no registration walls, lengthy forms, or complicated checkout steps.',
  },
  {
    step: '03',
    icon: MessageCircle,
    title: 'Send Pre-Filled WhatsApp Message',
    description:
      'WhatsApp opens directly with your selected service name and price pre-filled so you can manually send your booking request.',
  },
  {
    step: '04',
    icon: Video,
    title: 'Confirmation, Transfer & Meet Link',
    description:
      'Akansha Bansal personally confirms your preferred timing, shares payment transfer details, and coordinates your session directly on WhatsApp.',
  },
];

export function ConsultationJourney() {
  return (
    <section id="journey" className="py-20 sm:py-24 bg-[#FFFDFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
            Seamless &amp; Transparent Process
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C]">
            Your Consultation Journey
          </h2>
          <SacredDivider />
          <p className="text-sm sm:text-base text-[#5F3D61]">
            Thoughtfully structured so you move effortlessly from exploring
            sacred services to personal WhatsApp coordination—with zero
            automated checkout friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="card-journey relative p-6 rounded-3xl bg-[#FAF6F1] border border-[#C6A16B]/30 group cursor-default h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-12 h-12 rounded-2xl bg-[#EFE8F6] text-[#2B142C] flex items-center justify-center transition-all duration-300 group-hover:bg-[#2B142C] group-hover:text-[#FAF6F1] group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[#2B142C]/20">
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden="true" />
                    </span>
                    <span className="font-serif-display text-4xl font-semibold text-[#C6A16B]/55 transition-all duration-300 group-hover:text-[#B5727B] group-hover:scale-105">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#2B142C] mb-2.5">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[#5F3D61] leading-relaxed mt-3">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium hover:bg-[#411E42] transition shadow-md"
          >
            Explore Services &amp; Book Now
          </a>
        </div>
      </div>
    </section>
  );
}
