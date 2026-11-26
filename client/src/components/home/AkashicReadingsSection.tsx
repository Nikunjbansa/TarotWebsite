import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { SacredDivider } from '../common/SacredGeometry';
import {
  ServiceCard,
  ServiceDetailModal,
  isAkashicService,
} from './ServiceCard';
import type { ServiceItem } from '../../types';

export function AkashicReadingsSection() {
  const { services, publicConfig } = useSanctuary();
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);

  const akashicServices = services.filter(isAkashicService);

  if (akashicServices.length === 0) {
    return null;
  }

  return (
    <section
      id="akashic-readings"
      className="py-20 sm:py-24 bg-[#FAF6F1] border-b border-[#C6A16B]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8D5062]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" />
            Soul Ledger &amp; Karmic Guidance
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C]">
            Akashic Readings
          </h2>
          <SacredDivider />
          <p className="text-sm sm:text-base text-[#5F3D61] leading-relaxed">
            Access the subtle archive of your soul’s journey—illuminating karmic
            patterns, ancestral echoes, and aligned pathways forward with
            gentle intuitive clarity.
          </p>
        </div>

        <div
          className={
            akashicServices.length === 1
              ? 'max-w-md mx-auto grid grid-cols-1 gap-6 sm:gap-7'
              : akashicServices.length === 2
                ? 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7'
          }
        >
          {akashicServices.map((service) => (
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

