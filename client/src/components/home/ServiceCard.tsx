import {
  Clock,
  Info,
  X,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import {
  buildServiceBookingWhatsappUrl,
  formatInr,
} from '../../lib/format';
import type { PublicConfig, ServiceItem } from '../../types';

export function isAkashicService(service: ServiceItem): boolean {
  return (
    /akashic|akashik/i.test(service.name) ||
    /akashic|akashik/i.test(service.slug)
  );
}

interface ServiceCardProps {
  service: ServiceItem;
  publicConfig: PublicConfig;
  onOpenDetails: (service: ServiceItem) => void;
}

export function ServiceCard({
  service,
  publicConfig,
  onOpenDetails,
}: ServiceCardProps) {
  const whatsappUrl = buildServiceBookingWhatsappUrl(
    publicConfig.whatsappBusinessNumber,
    service.name,
    service.price,
    publicConfig.sanctuaryName
  );

  return (
    <article className="card-sanctuary rounded-3xl overflow-hidden flex flex-col">
      {/* Artwork Header */}
      <div className="relative h-48 overflow-hidden bg-[#2B142C]">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B142C]/80 via-[#2B142C]/20 to-transparent" />
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FFFDFA]/90 backdrop-blur-sm text-[11px] font-medium text-[#2B142C]">
            {service.category}
          </span>
          {service.requiresBirthDetails && (
            <span className="px-2.5 py-1 rounded-full bg-[#2B142C]/80 text-[10px] font-medium text-[#E8D7BC] border border-[#C6A16B]/40">
              Birth Chart Info
            </span>
          )}
        </div>
        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2 text-[#FAF6F1]">
          <div>
            <h3 className="font-serif-display text-2xl font-semibold leading-tight">
              {service.name}
            </h3>
            <p className="text-xs text-[#DFB4B6] line-clamp-1">
              {service.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#654566]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8D6CA9]" />
              {service.durationMinutes} mins session
            </span>
            <span className="font-serif-display text-2xl font-semibold text-[#2B142C]">
              {formatInr(service.price)}
            </span>
          </div>
          <p className="text-sm text-[#411E42]/90 leading-relaxed">
            {service.shortDescription}
          </p>
        </div>

        {/* Card Footer Buttons */}
        <div className="pt-3 border-t border-[#E8D7BC]/50 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenDetails(service)}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-[#D8C7EB] bg-[#FAF6F1] hover:bg-[#EFE8F6] text-xs font-semibold text-[#411E42] transition cursor-pointer shrink-0"
          >
            <Info className="w-3.5 h-3.5 text-[#8D6CA9]" aria-hidden="true" />
            Details
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full text-xs font-semibold transition bg-[#2B142C] text-[#FAF6F1] hover:bg-[#411E42] shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#E8D7BC]" aria-hidden="true" />
            Book Now
          </a>
        </div>
      </div>
    </article>
  );
}

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  publicConfig: PublicConfig;
  onClose: () => void;
}

export function ServiceDetailModal({
  service,
  publicConfig,
  onClose,
}: ServiceDetailModalProps) {
  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1B0B1C]/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDFA] text-[#2B142C] max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#C6A16B]/35 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-52 shrink-0">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B142C]/85 via-[#2B142C]/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFDFA]/90 text-[#2B142C] hover:bg-white transition cursor-pointer"
            aria-label="Close service details"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-[#FAF6F1]">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#E8D7BC]">
              {service.category}
            </span>
            <h3 className="font-serif-display text-3xl font-semibold">
              {service.name}
            </h3>
            <p className="text-xs text-[#DFB4B6]">{service.subtitle}</p>
          </div>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8D7BC]/50">
            <div>
              <span className="text-xs text-[#654566] block">
                Session Contribution
              </span>
              <span className="font-serif-display text-3xl font-semibold text-[#2B142C]">
                {formatInr(service.price)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#654566] block">
                Duration &amp; Format
              </span>
              <span className="text-sm font-medium text-[#411E42]">
                {service.durationMinutes} mins · {service.deliveryMode}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#411E42] leading-relaxed">
            {service.fullDescription}
          </p>

          {service.benefits.length > 0 && (
            <div className="space-y-2.5 bg-[#FAF6F1] p-4 rounded-2xl border border-[#D8C7EB]/60">
              <h4 className="font-serif-display text-lg font-semibold text-[#2B142C]">
                What This Session Awakens
              </h4>
              <ul className="space-y-2">
                {service.benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-xs sm:text-sm text-[#411E42]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#8D6CA9] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <a
              href={buildServiceBookingWhatsappUrl(
                publicConfig.whatsappBusinessNumber,
                service.name,
                service.price,
                publicConfig.sanctuaryName
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm font-medium hover:bg-[#411E42] transition"
            >
              <MessageCircle className="w-4 h-4 text-[#E8D7BC]" />
              Book Now on WhatsApp
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

