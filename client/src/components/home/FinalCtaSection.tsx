import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { useSanctuary } from '../../lib/authContext';
import { buildClientDirectWhatsappUrl } from '../../lib/format';

export function FinalCtaSection() {
  const { publicConfig } = useSanctuary();

  const directWaUrl = buildClientDirectWhatsappUrl(
    publicConfig.whatsappBusinessNumber,
    `Hello, I would like guidance on choosing a consultation at ${publicConfig.sanctuaryName}. Please share the next steps.`
  );

  return (
    <section className="py-16 sm:py-20 bg-[#FAF6F1]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#EFE8F6] via-[#FAF6F1] to-[#F7EBED] border border-[#C6A16B]/40 p-8 sm:p-14 text-center shadow-xl shadow-[#2B142C]/10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDFA] border border-[#C6A16B]/35 text-xs font-semibold uppercase tracking-[0.2em] text-[#8D5062] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" />
            Step Into Sacred Clarity
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#2B142C] max-w-2xl mx-auto leading-tight">
            Ready to Begin Your Personal Consultation?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5F3D61] max-w-xl mx-auto leading-relaxed">
            Explore our ten sacred offerings, tap Book Now on the service that
            calls to you, and send your pre-filled WhatsApp message directly to
            finalize your session.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#services"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#2B142C] text-[#FAF6F1] text-sm sm:text-base font-medium hover:bg-[#411E42] transition shadow-lg"
            >
              Explore Services &amp; Book Now
              <ArrowRight className="w-4 h-4 text-[#E8D7BC]" />
            </a>
            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#FFFDFA] border border-[#C6A16B]/45 text-[#2B142C] text-sm sm:text-base font-medium hover:bg-[#EFE8F6] transition"
            >
              <MessageCircle className="w-4 h-4 text-[#8D6CA9]" />
              Connect on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
