import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '../components/home/HeroSection';
import { TrustBar } from '../components/home/TrustBar';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { AkashicReadingsSection } from '../components/home/AkashicReadingsSection';
import { ConsultationJourney } from '../components/home/ConsultationJourney';
import { ModalitySpotlight } from '../components/home/ModalitySpotlight';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { FaqSection } from '../components/home/FaqSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <main>
      <HeroSection />
      <TrustBar />
      <AboutSection />
      <ServicesSection />
      <AkashicReadingsSection />
      <ConsultationJourney />
      <ModalitySpotlight />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}

