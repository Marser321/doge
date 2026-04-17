
'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { useLanguage } from '@/components/LanguageProvider'

// Import Sections
import { NavigationSection } from '@/components/page-sections/NavigationSection'
import { HeroSection } from '@/components/page-sections/HeroSection'
import { HowItWorksSection } from '@/components/page-sections/HowItWorksSection'
import { EcosystemSection } from '@/components/page-sections/EcosystemSection'
import { ValuePropositionSection } from '@/components/page-sections/ValuePropositionSection'
import { ServicesSection } from '@/components/page-sections/ServicesSection'
import { StorytellingSection } from '@/components/page-sections/StorytellingSection'
import { SubscriptionsSection } from '@/components/page-sections/SubscriptionsSection'
import { TestimonialsSection } from '@/components/page-sections/TestimonialsSection'
import { CTASection } from '@/components/page-sections/CTASection'
import { MapSection } from '@/components/page-sections/MapSection'
import { FooterSection } from '@/components/page-sections/FooterSection'
import { FeaturedProducts } from '@/components/FeaturedProducts'

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('doge-theme') === 'light' ? 'light' : 'dark'
}

function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const heroRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const lastScrollYRef = useRef(0);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Aura Cursor Scroll Reaction
    const handleScroll = () => {
      const aura = document.getElementById('aura-cursor');
      if (aura) {
        const currentScroll = window.scrollY;
        const lastScroll = lastScrollYRef.current;
        const speed = Math.abs(currentScroll - lastScroll);
        const scale = 1 + Math.min(speed / 50, 2);
        const opacity = 0.4 + Math.min(speed / 100, 0.6);
        aura.style.transform = `translate(-50%, -50%) scale(${scale})`;
        aura.style.opacity = opacity.toString();
        lastScrollYRef.current = currentScroll;
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('doge-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('doge-theme', newTheme);
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax Values (Disabled on mobile for performance/ux)
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 150]);
  const yHeroImage = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 250]);
  const scaleHeroImage = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 1.1]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent selection:text-white relative transition-opacity duration-1000 overflow-x-hidden">
      <div className="bg-noise"></div> {/* Luxury Noise Overlay */}

      <NavigationSection t={t} theme={theme} toggleTheme={toggleTheme} />

      <HeroSection
        t={t}
        heroRef={heroRef}
        yHeroText={yHeroText}
        yHeroImage={yHeroImage}
        scaleHeroImage={scaleHeroImage}
        opacityHero={opacityHero}
      />

      <HowItWorksSection t={t} />

      <EcosystemSection t={t} />

      <FeaturedProducts />
      
      <ValuePropositionSection isMobile={isMobile} />

      <ServicesSection />

      <StorytellingSection />

      <SubscriptionsSection isMobile={isMobile} t={t} />

      <TestimonialsSection />

      <CTASection />

      <MapSection />

      <FooterSection theme={theme} />

    </div>
  )
}
