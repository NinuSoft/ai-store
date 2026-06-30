import React from 'react';
import { useHomeData } from '../components/home/useHomeData';
import { OrderModal } from '../components/OrderModal';
import { ScrollProgressButton } from '../components/ScrollProgressButton';

// Subcomponents
import { Header } from '../components/home/components/Header';
import { HeroSection } from '../components/home/components/HeroSection';
import { SocialProofCounters } from '../components/home/components/SocialProofCounters';
import { BenefitsSection } from '../components/home/components/BenefitsSection';
import { TrustInfoSection } from '../components/home/components/TrustInfoSection';
import { SavingsComparisonSection } from '../components/home/components/SavingsComparisonSection';
import { PricingSection } from '../components/home/components/PricingSection';
import { HowItWorks } from '../components/home/components/HowItWorks';
import { TestimonialsSection } from '../components/home/components/TestimonialsSection';
import { FaqSection } from '../components/home/components/FaqSection';
import { FinalCtaSection } from '../components/home/components/FinalCtaSection';
import { Footer } from '../components/home/components/Footer';
import { SupportFloat } from '../components/home/components/SupportFloat';
import { StickyMobileCta } from '../components/home/components/StickyMobileCta';

export const Home: React.FC = () => {
  const {
    user,
    profile,
    plans,
    selectedPlan,
    isOrderModalOpen,
    setIsOrderModalOpen,
    isContactMenuOpen,
    setIsContactMenuOpen,
    whatsappNum,
    signInWithGoogle,
    handleSelectPlan,
    scrollToSection
  } = useHomeData();

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 1. HEADER — Premium glassy navbar */}
      <Header
        user={user}
        profile={profile}
        signInWithGoogle={signInWithGoogle}
        scrollToSection={scrollToSection}
      />

      {/* 2. HERO SECTION */}
      <HeroSection scrollToSection={scrollToSection} />

      {/* 3. SOCIAL PROOF SOCIAL COUNTERS */}
      <SocialProofCounters />

      {/* 4. BENEFITS SECTION */}
      <BenefitsSection />

      {/* 5. TRUST INFO SECTION */}
      <TrustInfoSection />

      {/* 6. SAVINGS COMPARISON SECTION */}
      <SavingsComparisonSection />

      {/* 7. PRICING SECTION */}
      <PricingSection
        plans={plans}
        handleSelectPlan={handleSelectPlan}
      />

      {/* 8. HOW IT WORKS (TIMELINE) */}
      <HowItWorks />

      {/* 9. TESTIMONIALS */}
      <TestimonialsSection />

      {/* 10. FAQ SECTION */}
      <FaqSection />

      {/* 11. FINAL CTA */}
      <FinalCtaSection scrollToSection={scrollToSection} />

      {/* 12. FOOTER */}
      <Footer
        whatsappNum={whatsappNum}
        scrollToSection={scrollToSection}
      />

      {/* 13. FLOATING STICKY SUPPORT ESCAPE HATCH */}
      <SupportFloat
        isContactMenuOpen={isContactMenuOpen}
        setIsContactMenuOpen={setIsContactMenuOpen}
        whatsappNum={whatsappNum}
      />

      {/* 14. STICKY MOBILE CTA BAR */}
      <StickyMobileCta scrollToSection={scrollToSection} />

      {/* 15. ORDER MODAL */}
      {isOrderModalOpen && (
        <OrderModal
          plan={selectedPlan}
          whatsappNum={whatsappNum}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      {/* 16. SCROLL PROGRESS BACK TO TOP */}
      <ScrollProgressButton />

    </div>
  );
};

export default Home;