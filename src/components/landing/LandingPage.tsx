import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WeDoEverythingSection } from './WeDoEverythingSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CalculatorSection } from './CalculatorSection';
import { CasesSection } from './CasesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { SecuritySection } from './SecuritySection';
import { VectorTechSection } from './VectorTechSection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';

import { OrderFormSection } from './OrderFormSection';
import { FooterSection } from './FooterSection';

const LandingPage = () => {
  const location = useLocation();
  const [selectedTariff, setSelectedTariff] = useState<string>('basic');

  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const scrollToForm = (tariffId: string) => {
    setSelectedTariff(tariffId);
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HeroSection onOrderClick={() => scrollToForm('basic')} />
      <FeaturesSection />
      <WeDoEverythingSection />
      <HowItWorksSection />
      <CalculatorSection />
      <CasesSection />
      <TestimonialsSection />
      <VectorTechSection />
      <SecuritySection />
      <PricingSection onPlanSelect={scrollToForm} />
      <FAQSection />
      <OrderFormSection selectedTariff={selectedTariff} />
      <FooterSection />
    </div>
  );
};

export default LandingPage;