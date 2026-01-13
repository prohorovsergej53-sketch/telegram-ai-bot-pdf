import { useState } from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CasesSection } from './CasesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { SecuritySection } from './SecuritySection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { OrderFormSection } from './OrderFormSection';
import { FooterSection } from './FooterSection';

const LandingPage = () => {
  const [selectedTariff, setSelectedTariff] = useState<string>('basic');

  const scrollToForm = (tariffId: string) => {
    setSelectedTariff(tariffId);
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HeroSection onOrderClick={() => scrollToForm('basic')} />
      <FeaturesSection />
      <HowItWorksSection />
      <CasesSection />
      <TestimonialsSection />
      <SecuritySection />
      <PricingSection onPlanSelect={scrollToForm} />
      <FAQSection />
      <OrderFormSection selectedTariff={selectedTariff} />
      <FooterSection />
    </div>
  );
};

export default LandingPage;