import { useState } from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
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
      <PricingSection onPlanSelect={scrollToForm} />
      <OrderFormSection selectedTariff={selectedTariff} />
      <FooterSection />
    </div>
  );
};

export default LandingPage;