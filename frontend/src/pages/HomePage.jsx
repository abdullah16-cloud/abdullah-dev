import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import HeroSection from '../components/home/HeroSection';
import FeaturedModelsSection from '../components/home/FeaturedModelsSection';
import CategoriesSection from '../components/home/CategoriesSection';
import BenefitsSection from '../components/home/BenefitsSection';
import DeliveryCodSection from '../components/home/DeliveryCodSection';
import FaqSection from '../components/home/FaqSection';
import CtaSection from '../components/home/CtaSection';
import './HomePage.css';

/**
 * HomePage: Composes all 7 homepage sections in exact semantic sequence.
 */
function HomePage() {
  usePageTitle('Home');

  return (
    <div className="home-page-container">
      <HeroSection />
      <FeaturedModelsSection />
      <CategoriesSection />
      <BenefitsSection />
      <DeliveryCodSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

export default HomePage;
