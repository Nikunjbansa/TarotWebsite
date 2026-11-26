import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { SacredDivider } from '../common/SacredGeometry';
import {
  ServiceCard,
  ServiceDetailModal,
  isAkashicService,
} from './ServiceCard';
import type { ServiceCategory, ServiceItem } from '../../types';

const CATEGORIES: ServiceCategory[] = [
  'Divination & Astrology',
  'Energy & Tantra Healing',
  'Sacred Rituals',
];

export function ServicesSection() {
  const { services, publicConfig } = useSanctuary();

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(
    CATEGORIES[0]
  );
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);

  const generalServices = services.filter((s) => !isAkashicService(s));
  const filtered = generalServices.filter((s) => s.category === activeCategory);

  return (
    <section
      id="services"
      className="py-20 sm:py-24 bg-[#F5EFE8] border-y border-[#C6A16B]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" />
            Sacred Offerings &amp; Pricing
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C]">
            Modalities for Clarity, Healing &amp; Renewal
          </h2>
          <SacredDivider />
          <p className="text-sm sm:text-base text-[#5F3D61] leading-relaxed">
            Explore our sacred offerings by category below and click Book Now
            on any service to connect directly via WhatsApp. Final
            confirmation, payment details, and session coordination are
            personally handled with you there.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const count = generalServices.filter(
              (s) => s.category === cat
            ).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                  active
                    ? 'bg-[#2B142C] text-[#FAF6F1] shadow-md shadow-[#2B142C]/15'
                    : 'bg-[#FFFDFA] text-[#411E42] border border-[#C6A16B]/30 hover:bg-[#EFE8F6]'
                }`}
              >
                {cat} <span className="opacity-70 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div
          className={
            filtered.length === 2
              ? 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7'
              : filtered.length === 1
                ? 'max-w-md mx-auto grid grid-cols-1 gap-6 sm:gap-7'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7'
          }
        >
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              publicConfig={publicConfig}
              onOpenDetails={setDetailService}
            />
          ))}
        </div>
      </div>

      <ServiceDetailModal
        service={detailService}
        publicConfig={publicConfig}
        onClose={() => setDetailService(null)}
      />
    </section>
  );
}
