import { Quote, Star } from 'lucide-react';
import { SacredDivider } from '../common/SacredGeometry';

const TESTIMONIALS = [
  {
    name: 'Rhea Sengupta',
    location: 'Bengaluru',
    modality: 'Akashik Tarot Reading + Lama Fera Healing',
    quote:
      'I arrived feeling completely stuck after two years of career burnout. Akansha Bansal named the exact emotional pattern holding me back within minutes, and the Lama Fera clearing lifted a heaviness I had carried for months. Her remedies were effortless to follow.',
  },
  {
    name: 'Siddharth & Kavya Malhotra',
    location: 'New Delhi',
    modality: 'Astrology + Shiv–Shakti Healing',
    quote:
      'What sets Akansha.Predicts apart is the calm, logical warmth. Our Kundli review gave us crystal-clear timing on our relocation without a trace of fear-mongering, and the Shiv–Shakti session restored deep harmony between us.',
  },
  {
    name: 'Nandini Deshpande',
    location: 'Mumbai',
    modality: 'Maa Tara Healing + Tarot Reading',
    quote:
      'During one of the hardest family transitions of my life, Maa Tara Healing felt like an immediate anchor of peace. Coordination on WhatsApp was deeply personal and unhurried—truly the most grounded spiritual experience I have ever had.',
  },
  {
    name: 'Arjun Rajagopal',
    location: 'London',
    modality: 'Mantra Energy Vortex (MEV) + Hoomkar with Halaum',
    quote:
      'The MEV session cleared stagnant energy around me and brought deep physical, emotional, and spiritual balance. Followed by Hoomkar with Halaum, my focus and inner calm transformed within days.',
  },
  {
    name: 'Priyanka Chaturvedi',
    location: 'Jaipur',
    modality: 'Mahakali Healing + Rituals',
    quote:
      'The Mahakali cord-cutting and customized lunar ritual helped me release a draining workspace dynamic gracefully. I felt protected, clear-headed, and finally back in my own power.',
  },
  {
    name: 'Tanvi Joshi',
    location: 'Singapore',
    modality: 'Astrology Consultation',
    quote:
      'Pinpoint accuracy on my Saturn Antardasha milestones and relationship turning points from six years ago. Every explanation was compassionate, structured, and empowering.',
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-20 sm:py-24 bg-[#FAF6F1] border-b border-[#C6A16B]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
            Voices of Renewal
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C]">
            Reflections From Seekers Worldwide
          </h2>
          <SacredDivider />
          <p className="text-sm sm:text-base text-[#5F3D61]">
            Words from clients who found grounded clarity, gentle remedies, and
            lasting emotional serenity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="card-sanctuary rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C6A16B]">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#D8C7EB]" />
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-[#EFE8F6] text-[11px] font-medium text-[#411E42]">
                  {t.modality}
                </span>

                <p className="text-sm text-[#411E42] leading-relaxed">
                  “{t.quote}”
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8D7BC]/50 flex items-center justify-between">
                <div>
                  <p className="font-serif-display text-lg font-semibold text-[#2B142C]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#654566]">{t.location}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#8D6CA9] font-semibold">
                  Verified Client
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

