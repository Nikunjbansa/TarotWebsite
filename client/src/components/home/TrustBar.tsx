import { Compass, Feather, Lock, MessageCircleHeart } from 'lucide-react';

const PILLARS = [
  {
    icon: Compass,
    title: 'Grounded Precision',
    text: 'Every insight blends intuitive perception with Vedic chart discipline—offering clear direction rather than vague generalities.',
  },
  {
    icon: Feather,
    title: 'Simple, Gentle Remedies',
    text: 'Practical Upayas, breath anchoring, and sacred rituals tailored to modern life—zero fear tactics or complicated dogma.',
  },
  {
    icon: Lock,
    title: 'Sacred Confidentiality',
    text: 'Your personal story, birth chart, and energetic concerns remain strictly private within a safe, non-judgmental space.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Direct WhatsApp Care',
    text: 'Confirmations, payment transfers, and private Google Meet session links are personally coordinated with you via WhatsApp.',
  },
];

export function TrustBar() {
  return (
    <section
      className="py-12 bg-[#FFFDFA] border-y border-[#C6A16B]/20"
      aria-labelledby="trust-pillars-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden H2 to satisfy accessible document outline (H1 -> H2 -> H3) */}
        <h2 id="trust-pillars-heading" className="sr-only">
          Guiding Pillars of Practice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-start p-6 rounded-2xl bg-[#FAF6F1]/70 border border-[#E8D7BC]/45 hover:border-[#B5727B]/45 transition h-full"
              >
                <span className="w-12 h-12 rounded-2xl bg-[#EFE8F6] text-[#411E42] flex items-center justify-center shrink-0 mb-4">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className="font-serif-display text-lg font-semibold text-[#2B142C] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#654566] leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

