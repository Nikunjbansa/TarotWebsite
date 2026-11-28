import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SacredDivider } from '../common/SacredGeometry';

const FAQS = [
  {
    q: 'How do booking confirmation, payment, and Google Meet links work?',
    a: 'There is no online payment gateway or automated meeting link on this website. Simply click "Book Now" on any service card and WhatsApp opens directly with a pre-filled message containing your selected service name and price. You manually send that message on WhatsApp, where our team confirms your preferred timing, shares payment transfer details, and coordinates your session link directly.',
  },
  {
    q: 'Can I inquire about multiple services on WhatsApp?',
    a: 'Yes! Click "Book Now" on your primary modality to start the WhatsApp conversation directly, and you can let Akansha Bansal at Akansha.Predicts know if you wish to combine complementary readings or healings such as Akashik Tarot Reading with Lama Fera Healing.',
  },
  {
    q: 'Do I need my exact Time and Place of Birth?',
    a: 'Exact Date, Time, and Place of Birth are helpful for Vedic Astrology and chart-aligned Rituals—you can share them directly during your WhatsApp chat after clicking Book Now. If you do not know your birth time, you can still book Tarot Reading, Akashik Tarot Reading, or any of our energy healing modalities (Shiv–Shakti, Maa Tara, Lama Fera, Mantra Energy Vortex (MEV), Mahakali, or Hoomkar with Halaum) effortlessly.',
  },
  {
    q: 'How do I know which energy healing modality is right for me?',
    a: 'Each service card outlines its core focus—Maa Tara softens acute grief and anxiety, Lama Fera clears deep aura stagnation, Shiv–Shakti restores emotional/relational balance, MEV uses ancient mantras, the five elements, and Mantra Energy Radiators (MERs) for aura scanning and space clearing, Mahakali strengthens energetic boundaries, and Hoomkar with Halaum dissolves stubborn inertia. You may also share your intent when messaging us on WhatsApp.',
  },
  {
    q: 'Are all sessions strictly confidential?',
    a: 'Yes. Every consultation, birth chart detail, personal question, and healing note is held in complete confidence and is never shared with any third party.',
  },
  {
    q: 'What happens if I need to reschedule an appointment?',
    a: 'Simply reply on WhatsApp at least 24 hours ahead of your confirmed session and our team will happily coordinate a fresh time slot with you.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-[#F5EFE8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
            Clarity Before We Begin
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C]">
            Frequently Asked Questions
          </h2>
          <SacredDivider />
        </div>

        <div className="space-y-3.5">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl bg-[#FFFDFA] border border-[#C6A16B]/30 overflow-hidden transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif-display text-xl font-semibold text-[#2B142C]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8D6CA9] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#411E42] leading-relaxed border-t border-[#E8D7BC]/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

