import { MessageCircle } from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { buildClientDirectWhatsappUrl } from '../../lib/format';

export function FloatingWhatsapp() {
  const { publicConfig } = useSanctuary();

  const directWa = buildClientDirectWhatsappUrl(
    publicConfig.whatsappBusinessNumber,
    `Hello ${publicConfig.sanctuaryName}, I would like to inquire about booking a consultation.`
  );

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-6 right-6 z-50">
      <a
        href={directWa}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        aria-label="Chat with Akansha.Predicts on WhatsApp (+91 95605 64150)"
      >
        {/* Soft pulsing halo */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-75" />

        <MessageCircle className="w-7 h-7 fill-current relative z-10" />

        {/* Hover pill tooltip */}
        <span className="pointer-events-none absolute right-16 px-3.5 py-1.5 rounded-full bg-[#2B142C] text-[#FAF6F1] border border-[#C6A16B]/40 text-xs font-medium tracking-wide whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:inline-block">
          Chat on WhatsApp · +91 95605 64150
        </span>
      </a>
    </aside>
  );
}
