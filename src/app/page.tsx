'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP Plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { Sparkles, ShieldCheck, Leaf, ArrowRight, Star, Clock, CheckCircle, Home, MapPin, Sun, Moon, Zap, Droplets, Camera, DollarSign, CalendarCheck, Store, Map } from 'lucide-react'
import { PrecisionProtocolScroll } from '../components/PrecisionProtocolScroll'
import { FeaturedProducts } from '../components/FeaturedProducts'
import { TiltCard } from '../components/TiltCard'
import { useMagnetic } from '@/hooks/useMagnetic'
import HeaderActions from '@/components/HeaderActions'
import { useLanguage } from '@/components/LanguageProvider'

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('doge-theme') === 'light' ? 'light' : 'dark'
}

function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Text Scrubbing Reveal Component
const TextScrubber = ({ text, className = "" }: { text: string, className?: string }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const chars = containerRef.current?.querySelectorAll('.char');
      if (!chars || chars.length === 0) return;

      gsap.fromTo(chars,
        { opacity: 0.1, filter: "blur(10px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          }
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <h1 ref={containerRef} className={`font-michroma ${className}`}>
      {text.split(" ").map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIdx) => (
            <span key={cIdx} className="char inline-block">{char}</span>
          ))}
        </span>
      ))}
    </h1>
  );
};

// Magnetic Button Wrapper (Updated for haptic luxury)
const MagneticButton = ({ children, className = "", href }: { children: React.ReactNode, className?: string, href?: string }) => {
  const { ref, magneticProps } = useMagnetic<HTMLAnchorElement>(0.2);

  return (
    <motion.a
      href={href}
      ref={ref}
      {...magneticProps}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.a>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 30, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

// Precision Reveal Mask Component
const PrecisionReveal = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!maskRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(maskRef.current, {
        attr: { r: "100%" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] md:h-[600px] overflow-hidden rounded-[40px] shadow-2xl border border-white/10 group bg-zinc-900">
      {/* Before Image (Slightly Muted/Grayscale) */}
      <Image 
        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop" 
        alt="Before" 
        fill 
        className="object-cover grayscale opacity-30" 
      />
      
      {/* After Image (Pristine/Full Color) with Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <clipPath id="revealMask">
            <circle ref={maskRef} cx="50%" cy="50%" r="0%" />
          </clipPath>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="transparent" 
        />
      </svg>
      
      <div className="absolute inset-0 z-20" style={{ clipPath: "url(#revealMask)" }}>
        <Image 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop" 
          alt="After" 
          fill 
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
             <Sparkles className="w-6 h-6 text-white" />
           </div>
           <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-60 block">Estado de Revista</span>
              <span className="text-xl font-bold font-michroma text-white">SANITIZADO.</span>
           </div>
        </div>
      </div>

      <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-[40px] z-30"></div>
    </div>
  );
};

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const heroRef = useRef<HTMLElement>(null);
  const { lang, t } = useLanguage();
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

      {/* 1. NAVIGATION (Noir Glassmorphism) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer cursor-hover-target">
            <motion.div 
              whileHover={{ scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-10 h-10 flex items-center justify-center transition-all"
            >
              <Image 
                src="/doge_logo_premium.png" 
                alt="DOGE Premium Logo" 
                fill 
                className="object-contain mix-blend-plus-lighter dark:mix-blend-screen" 
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-foreground transition-colors uppercase font-michroma leading-none">DOGE.S.M LLC</span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase mt-1">Cleaning Service</span>
            </div>
          </div>

          <div className="hidden md:flex gap-10 items-center text-[10px] font-black text-zinc-400 tracking-[0.2em] z-50 uppercase">
            <Link href="/services" className="hover:text-foreground transition-colors relative group cursor-hover-target">
              {t('nav.services')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </Link>
            <a href="#suscripciones" className="hover:text-foreground transition-colors relative group cursor-hover-target">
              {t('nav.memberships')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <a href="#confianza" className="hover:text-foreground transition-colors relative group cursor-hover-target">
              {t('nav.trust')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <Link href="/store" className="hover:text-foreground transition-colors relative group cursor-hover-target text-foreground">
              {t('nav.store')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full"></span>
            </Link>
            
            {/* Header Actions: Language, Theme, Cart, Account Menu */}
            <HeaderActions theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section ref={heroRef} className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[95vh] md:min-h-[900px] flex items-center bg-background transition-colors duration-500">
        {/* Deep Titanium Aurora Effect */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/10 rounded-full blur-[80px] -z-10"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center w-full">
          {/* Parallax Hero Text */}
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero }}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl relative z-10"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <ShieldCheck className="w-3 h-3" /> Professional Standard
              </span>
            </motion.div>
            
            <TextScrubber 
              text="Limpieza de Élite." 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground leading-[0.85] tracking-[-0.05em] uppercase mb-12"
            />
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-accent mb-10 md:mb-12 leading-relaxed font-medium max-w-lg">
              Limpieza de precisión y conservación de activos inmobiliarios en Miami. <span className="text-foreground font-bold">Un estándar superior para quienes no aceptan menos que la perfección.</span>
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-8 items-center">
              <MagneticButton href="/booking" className="inline-flex items-center justify-center px-10 py-6 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all group cursor-hover-target w-full sm:w-auto cta-glow btn-whimsy hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] relative">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                <span className="relative z-10 flex items-center">Agendar Cuadrilla <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" /></span>
              </MagneticButton>
              <div className="flex gap-4 items-center justify-center sm:justify-start">
                <div className="flex -space-x-3 cursor-hover-target opacity-60 grayscale hover:grayscale-0 transition-all">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-slate-950 flex justify-center items-center text-xs font-bold shadow-xl">
                      <Image src={`https://ui-avatars.com/api/?background=27272a&color=fff&name=V+${i}`} alt="Avatar" width={40} height={40} className="rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="border-l border-white/10 pl-4">
                  <div className="flex text-taupe mb-0.5 scale-75 origin-left">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                  </div>
                  <span className="text-[10px] font-black text-taupe uppercase tracking-widest">Inversores VIP Miami</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Parallax Hero Image Container */}
          <motion.div 
            style={{ y: yHeroImage, scale: scaleHeroImage, opacity: opacityHero }}
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[450px] md:h-[600px] lg:h-[750px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-zinc-900">
              <Image 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" 
                alt="Luxury Property Miami" 
                fill 
                className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              
              {/* Floating Element 1 - Real-time Status (Noir Style) */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 glass-panel p-5 rounded-2xl shadow-titanium"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex justify-center items-center text-foreground backdrop-blur-md border border-white/10">
                    <CheckCircle className="w-6 h-6"/>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Audit Complete</p>
                    <p className="text-[10px] font-bold text-taupe uppercase tracking-tighter">Status: Protected</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Element 2 - Safety Badge (Noir Style) */}
              <motion.div 
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 left-8 glass-panel p-6 rounded-2xl shadow-titanium text-white"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <span className="block font-bold text-sm tracking-tight uppercase">Garantía VIP</span>
                    <span className="text-[9px] font-black text-taupe uppercase tracking-[0.2em] leading-none">Security Active</span>
                  </div>
                </div>
                <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                    className="bg-white h-full"
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 2.5 HOW IT WORKS (4-Step Visual Flow) */}
      <section className="py-24 md:py-48 bg-background relative z-20 overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/10 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Sparkles className="w-3 h-3" /> {t('how.badge')}
            </span>
            <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mt-6 mb-8 tracking-tighter uppercase leading-[1.1]">
              {t('how.title')} <br /> <span className="silver-text">{t('how.title2')}</span>
            </h2>
            <p className="text-accent text-lg md:text-xl font-medium max-w-2xl mx-auto">
              {t('how.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { step: '01', icon: Camera, titleKey: 'how.step1.title' as const, descKey: 'how.step1.desc' as const },
              { step: '02', icon: DollarSign, titleKey: 'how.step2.title' as const, descKey: 'how.step2.desc' as const },
              { step: '03', icon: CalendarCheck, titleKey: 'how.step3.title' as const, descKey: 'how.step3.desc' as const },
              { step: '04', icon: CheckCircle, titleKey: 'how.step4.title' as const, descKey: 'how.step4.desc' as const },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard maxTilt={4} scale={1.02} className="h-full">
                  <div className="group relative bg-foreground/5 p-8 md:p-10 rounded-[32px] border border-accent/10 hover:border-accent/30 transition-all overflow-hidden cursor-hover-target h-full flex flex-col">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700"></div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl font-black text-accent/20 font-michroma leading-none">{item.step}</span>
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                        <item.icon className="w-6 h-6 text-foreground" />
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-foreground mb-3 tracking-tight uppercase font-michroma">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-accent font-medium leading-relaxed text-sm flex-grow">
                      {t(item.descKey)}
                    </p>

                    {idx < 3 && (
                      <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30">
                        <ArrowRight className="w-5 h-5 text-accent/30" />
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* CTA under How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <MagneticButton href="/services" className="cursor-hover-target">
              <span className="inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all cta-glow btn-whimsy relative group">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                <span className="relative z-10 flex items-center gap-3">
                  {t('services.requestEstimate')} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </span>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* 2.6 ECOSYSTEM CONNECTED (Services ↔ Map ↔ Store) */}
      <section className="py-24 md:py-48 bg-background relative z-20 overflow-hidden transition-colors duration-500 section-blur-divider">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('eco.badge')}</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">
                {t('eco.title')} <br /> <span className="silver-text">{t('eco.title2')}</span>
              </h2>
            </div>
            <p className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit">
              {t('eco.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {[
              { icon: Sparkles, titleKey: 'eco.services.title' as const, descKey: 'eco.services.desc' as const, href: '/services', color: 'from-blue-500/10 to-cyan-500/10' },
              { icon: Map, titleKey: 'eco.map.title' as const, descKey: 'eco.map.desc' as const, href: '#cobertura', color: 'from-emerald-500/10 to-teal-500/10' },
              { icon: Store, titleKey: 'eco.store.title' as const, descKey: 'eco.store.desc' as const, href: '/store', color: 'from-amber-500/10 to-orange-500/10' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard maxTilt={4} scale={1.02} className="h-full">
                  <Link href={item.href} className="block h-full">
                    <div className="group luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden cursor-hover-target shadow-xl h-full flex flex-col justify-between min-h-[240px] hover:border-accent/30 transition-all relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          <item.icon className="w-7 h-7 text-foreground" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-michroma mb-3">{t(item.titleKey)}</h3>
                        <p className="text-accent font-medium leading-relaxed text-sm">{t(item.descKey)}</p>
                      </div>
                      <div className="relative z-10 pt-6 flex items-center gap-2 text-accent group-hover:text-foreground transition-colors">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* Advantage Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="luxury-glass p-8 md:p-10 rounded-[32px] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
          >
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-black uppercase font-michroma mb-3 text-foreground">{t('eco.advantage')}</h3>
              <div className="space-y-2">
                <p className="text-accent font-medium text-sm leading-relaxed">• {t('eco.adv1')}</p>
                <p className="text-accent font-medium text-sm leading-relaxed">• {t('eco.adv2')}</p>
              </div>
            </div>
            <MagneticButton href="/membership" className="cursor-hover-target whitespace-nowrap">
              <span className="inline-flex items-center px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-xl hover:bg-zinc-200 transition-all">
                {t('mem.cta')}
              </span>
            </MagneticButton>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>

      {/* FEATURED PRODUCTS (Dynamic Store Interaction) */}
      <FeaturedProducts />

      {/* 3. VALUE PROPOSITION (Titanium Cards + TiltCard 3D) */}
      <section className="py-24 md:py-32 bg-background relative z-20 transition-colors duration-500 section-blur-divider">
        {/* Section blur divider — top fade */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {[
              { icon: Leaf, color: "zinc", title: "Eco-Lujo Residencial", desc: "Equipos certificados usan insumos biodegradables y WFP para cristales. Suelo de roble o mármol protegido al 100%.", yOffset: 0 },
              { icon: ShieldCheck, color: "zinc", title: "Auditoría Digital", desc: "Al terminar, recibe un informe fotográfico blindado del estado de su llave, ventanas y grifería preventivamente.", yOffset: 40 },
              { icon: Clock, color: "zinc", title: "Logística de Precisión", desc: "Nuestro despachador GPS optimiza rutas para llegar exactamente a la hora. En Miami, el tiempo es el activo más caro.", yOffset: 80 }
            ].map((prop, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: isMobile ? 50 : 100 + prop.yOffset }}
                whileInView={{ opacity: 1, y: isMobile ? 0 : prop.yOffset }}
                viewport={{ once: true, margin: isMobile ? "-20px" : "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <TiltCard maxTilt={5} scale={1.02} className="h-full">
                  <div className="group relative bg-zinc-900/40 dark:bg-zinc-900/40 bg-zinc-100/80 p-10 md:p-12 rounded-2xl border border-white/5 dark:border-white/5 border-black/5 hover:border-accent transition-all overflow-hidden cursor-hover-target shadow-2xl h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700"></div>
                    <div className="relative w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-8 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                      <prop.icon className="w-7 h-7 text-foreground" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground mb-4 tracking-tight uppercase font-michroma">{prop.title}</h3>
                    <p className="text-accent leading-relaxed font-medium">
                      {prop.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Section blur divider — bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>

      {/* 3.1 SERVICIOS (Bento Grid Architecture - 2026 Luxury) */}
      <section id="servicios" className="py-24 md:py-48 bg-background relative z-20 overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Especialidades Tácticas</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">Menú de <br/> <span className="silver-text">Operaciones.</span></h2>
            </div>
            <p className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit">
              Sistemas de limpieza de precisión diseñados para la <span className="text-foreground">preservación extrema</span> de activos inmobiliarios.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full">
            {/* Main Service - Large Bento */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-2 luxury-glass p-10 md:p-12 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-2xl flex flex-col justify-between min-h-[400px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                  <Home className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-michroma mb-6">Residencial <br/> VIP Elite.</h3>
                <p className="text-accent font-medium text-lg leading-relaxed max-w-sm">
                  Desinfección de mobiliario de lujo y tratamiento de polvos profundos con equipos de grado médico HEPA.
                </p>
              </div>
              <div className="relative z-10 pt-12 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Protocolo de Precisión Activo</span>
                <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

            {/* Sub Service 1 - Post Constr */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex items-center justify-between"
            >
              <div className="relative z-10 flex flex-col gap-2">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-michroma">Post-Construcción</h3>
                <p className="text-accent text-sm font-medium max-w-xs">Retiro intensivo de polvo obra y materiales pesados.</p>
              </div>
              <Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop" alt="Post construction" width={150} height={150} className="rounded-2xl grayscale opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.div>

            {/* Sub Service 2 - WFP */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="luxury-glass p-8 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex flex-col justify-between"
            >
              <div className="relative z-10">
                <Droplets className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-lg font-black uppercase font-michroma tracking-tighter">Cristal <br/> WFP</h3>
              </div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest">Tecnología de Agua Pura</p>
            </motion.div>

            {/* Sub Service 3 - Audit */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="luxury-glass p-8 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex flex-col justify-between bg-foreground/5"
            >
              <div className="relative z-10">
                <Zap className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-lg font-black uppercase font-michroma tracking-tighter">Control <br/> Florida</h3>
              </div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest">Anti-Humedad 24/7</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.12 B2B ELITE & CATÁLOGO COMERCIAL (Precision Storytelling Narrative) */}
      <PrecisionProtocolScroll />


      {/* 3.15 STORYTELLING PORTFOLIO (Cinematic Immersive - 2026) */}
      <section className="py-24 md:py-48 bg-background relative z-20 text-foreground overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-8 block">La Diferencia DOGE</span>
              <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl text-foreground mb-8 tracking-tighter uppercase leading-[1]">Grado de <br/> <span className="silver-text">Precisión.</span></h2>
              <p className="text-accent text-lg md:text-xl font-medium leading-relaxed mb-12">
                En el mercado de Miami, la limpieza no es un gasto, es una <span className="text-foreground">estrategia de preservación</span>. Aplicamos protocolos de precisión para recuperar materiales nobles y mantener sus activos en estado de revista.
              </p>
              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div>
                  <span className="text-3xl font-black block mb-2">99.8%</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Pureza de Aire HEPA</span>
                </div>
                <div>
                  <span className="text-3xl font-black block mb-2">12M+</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Patrimonio Protegido</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="lg:col-span-1"
            >
               <PrecisionReveal />
            </motion.div>
          </div>
          
          {/* Bento Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative h-[400px] rounded-[32px] overflow-hidden group border border-white/5 opacity-60"
            >
               <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop" alt="Standard Clean" fill className="object-cover grayscale" />
               <div className="absolute inset-0 bg-black/40"></div>
               <div className="absolute top-8 left-8">
                 <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Servicio Convencional</span>
               </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="relative h-[400px] rounded-[32px] overflow-hidden group shadow-2xl border border-zinc-500/20"
            >
               <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" alt="Doge standard" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               <div className="absolute top-8 right-8 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                 Titanium Standard
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2 SUSCRIPCIONES (Noir Memberships) */}
      <section id="suscripciones" className="py-24 md:py-48 bg-background relative z-20 overflow-hidden transition-colors duration-500 section-blur-divider">
        {/* Section blur divider — top fade */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-30 pointer-events-none" />
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/10 rounded-full blur-[80px] -z-10 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
          >
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/5 px-4 py-2 rounded-full border border-accent/10">Membresías Exclusivas</span>
            <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mt-10 mb-8 tracking-tighter uppercase leading-[1.1]">Estabilidad <br/> <span className="silver-text">Premium.</span></h2>
            <p className="text-accent text-lg md:text-xl font-medium max-w-2xl mx-auto">Asegure su cupo en la agenda más solicitada de Miami. Miembros oro cuentan con prioridad absoluta y beneficios tácticos mensuales.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[
              { id: 'bronce', name: 'Bronce', price: 150, freq: 'Mensual', popular: false, features: ['1 Sanitación Mensual', 'Acceso a Agenda', 'Soporte Estándar'] },
              { id: 'plata', name: 'Plata', price: 250, freq: 'Quincenal', popular: true, features: ['2 Sanitaciones/Mes', 'Prioridad de Agenda', 'Insumos Premium'] },
              { id: 'oro', name: 'Oro VIP', price: 450, freq: 'Semanal', popular: false, features: ['4 Sanitaciones/Mes', 'Turnos VIP Fijos', 'Auditoría Fotográfica Garantizada'] },
            ].map((plan, idx) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: isMobile ? 30 : 50, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <TiltCard maxTilt={4} scale={1.03} className="h-full">
                  <div className={`relative rounded-2xl p-10 md:p-12 transition-all flex flex-col cursor-hover-target border h-full ${
                    plan.popular 
                    ? `bg-zinc-100 text-black border-white shadow-2xl z-10 md:scale-105` 
                    : 'bg-zinc-900/30 border-white/5 text-white hover:border-white/10'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase shadow-xl whitespace-nowrap">
                        Most Requested
                      </div>
                    )}
                    <h3 className={`text-2xl md:text-3xl font-black mb-2 uppercase font-michroma ${plan.popular ? 'text-background' : 'text-foreground'}`}>{plan.name}</h3>
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-10 ${plan.popular ? 'text-background/70' : 'text-taupe'}`}>{plan.freq}</p>
                    <div className="mb-8 border-b border-accent/10 pb-8">
                      <span className="text-4xl font-black text-foreground font-michroma">${plan.price}</span>
                      <span className={`text-[10px] font-bold ml-2 uppercase tracking-widest ${plan.popular ? 'text-background/70' : 'text-taupe'}`}>/visita</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-grow">
                      {plan.features.map((item, i) => (
                        <li key={i} className={`flex items-center text-xs font-bold uppercase tracking-tight ${plan.popular ? 'text-background/80' : 'text-accent'}`}>
                          <CheckCircle className={`w-4 h-4 mr-3 shrink-0 ${plan.popular ? 'text-background' : 'text-accent/60'}`} /> {item}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton 
                      href="/membership" 
                      className={`w-full text-center py-5 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all cta-glow ${
                        plan.popular ? 'bg-background text-foreground hover:bg-background/90' : 'bg-accent/5 hover:bg-accent/10 text-foreground border border-accent/10'
                      }`}
                    >
                      {t('mem.cta')}
                    </MagneticButton>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.3 CONFIANZA (Noir Testimonials) */}
      <section id="confianza" className="py-24 md:py-48 bg-background transition-colors duration-500 text-foreground relative z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block border border-accent/10 text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/5 px-4 py-2 rounded-full mb-10">
                Compliance Protocol
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-10 tracking-tighter leading-[1] uppercase font-michroma text-foreground">
                Cero Riesgos. <br/> <span className="silver-text">Total Garantía.</span>
              </h2>
              <p className="text-accent text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-lg">
                Cumplimos 100% con las regulaciones de Florida. Personal asegurado (General Liability) y altamente capacitado para proteger su activo.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-2xl border border-accent/10 bg-accent/5 backdrop-blur-md">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-accent/10 shadow-titanium shrink-0">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-bold text-sm text-foreground uppercase tracking-widest leading-tight">USA General Liability <br/> <span className="text-[10px] text-accent">Full Coverage</span></span>
                </div>
                <div className="flex items-center gap-6 p-6 rounded-2xl border border-accent/10 bg-accent/5 backdrop-blur-md">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-accent/10 shadow-titanium shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <span className="font-bold text-sm text-foreground uppercase tracking-widest leading-tight">Geofencing Protocol <br/> <span className="text-[10px] text-accent">Live Team Tracking</span></span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <TiltCard maxTilt={3} scale={1.01} className="w-full">
                <div className="luxury-glass p-10 md:p-16 rounded-2xl relative shadow-titanium border border-accent/10">
                  <div className="absolute -top-12 -right-6 text-9xl text-accent/10 font-serif leading-none italic pointer-events-none disabled">&quot;</div>
                  <p className="text-xl md:text-3xl text-foreground mb-12 italic font-medium leading-[1.4] tracking-tight">
                    &quot;Delegar mi propiedad desde el exterior era un riesgo constante. Con DOGE veo el estado de mis activos en tiempo real con reportes tácticos de alta resolución.&quot;
                  </p>
                  <div className="flex items-center gap-6 border-t border-accent/10 pt-10">
                    <div className="w-16 h-16 rounded-full bg-accent/10 p-1 overflow-hidden shadow-2xl border border-accent/20 shrink-0">
                      <Image src="https://ui-avatars.com/api/?name=J+Silva&background=27272a&color=fff" alt="Review" width={64} height={64} className="rounded-full object-cover" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground">Alejandro V.</span>
                      <p className="text-taupe font-black text-[10px] uppercase tracking-[0.2em] mt-1">Founder @ Luxury Real Estate</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FINAL (Noir Elegance) */}
      <section className="py-24 md:py-48 px-6 bg-background relative z-20 transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative rounded-3xl glass-panel p-16 md:p-24 lg:p-32 overflow-hidden shadow-titanium text-center"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50 blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-10 tracking-tighter leading-[1] uppercase">
              El <span className="silver-text">Estándar</span> <br/> Superior.
            </h2>
            <p className="text-accent text-lg md:text-2xl font-medium mb-16 leading-relaxed max-w-2xl mx-auto">
              Disfrute de lo mejor de Miami. Nosotros nos encargamos de que su inversión mantenga su valor impecable.
            </p>
            <MagneticButton href="/booking" className="cursor-hover-target w-full sm:w-auto">
              <span className="flex sm:inline-flex justify-center items-center px-16 py-8 text-sm font-black uppercase tracking-[0.3em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all cta-glow btn-whimsy hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] relative group">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                <span className="relative z-10 flex items-center">Cotizar Operación <ArrowRight className="ml-4 w-6 h-6" /></span>
              </span>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* 4.5 MAPA DE COBERTURA */}
      <section id="cobertura" className="relative z-20 bg-background py-24 md:py-40 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 md:mb-32">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/10 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <MapPin className="w-3 h-3" /> Area of Operations
            </span>
            <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase leading-tight">Despliegue <br/> <span className="silver-text">Logístico.</span></h2>
            <p className="text-accent font-bold mt-6 text-sm uppercase tracking-[0.2em]">Miami & South Florida, USA</p>
          </div>
          
          <div className="w-full h-[500px] md:h-[650px] rounded-2xl overflow-hidden shadow-titanium border border-white/5 bg-zinc-900 group">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d229864.07548057998!2d-80.36952771579294!3d25.782488832628437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL%2C%20USA!5e0!3m2!1sen!2s!4v1712211234567!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) brightness(0.8)' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* 5. FOOTER (Noir Minimalist) */}
      <footer className="py-24 md:py-32 relative z-20 border-t border-white/5 bg-[var(--footer-bg)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-20">
          
          <div className="flex flex-col gap-8 max-w-sm">
            <div className="flex items-center gap-4">
              <div className={`relative w-12 h-12 flex items-center justify-center invert opacity-80 ${theme === 'light' ? 'invert-0' : 'invert'}`}>
                <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-michroma text-2xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">DOGE.S.M LLC</span>
                <span className="font-michroma text-[10px] font-bold tracking-[0.4em] text-accent uppercase mt-1">Cleaning Tactics</span>
              </div>
            </div>
            <p className="text-accent font-medium text-sm leading-relaxed">
              Servicios de limpieza técnica y preservación de activos de alto nivel. Operando bajo estándares de seguridad de clase mundial en Florida central y sur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Contact & Dispatch</span>
              <div className="flex flex-col gap-3 font-bold text-accent text-sm tracking-tight">
                <a href="mailto:doge.clean.miami@gmail.com" className="hover:text-foreground transition-colors duration-300">doge.clean.miami@gmail.com</a>
                <a href="tel:7869283948" className="hover:text-foreground transition-colors duration-300 tracking-widest text-lg text-foreground mt-2 font-michroma">786-928-3948</a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Operations</span>
              <div className="flex flex-col gap-3 font-bold text-accent text-sm">
                <span className="text-foreground">DAVID SOTOLONGO MARTINEZ</span>
                <span className="text-accent">Miami, Florida, United States</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap items-center gap-8 text-[9px] font-black text-accent uppercase tracking-[0.3em]">
            <Link href="/legal/licenses" className="hover:text-foreground transition-colors">Licencias</Link>
            <Link href="/legal/registry" className="hover:text-foreground transition-colors">Florida Registry</Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
          </div>
          <p className="text-accent font-bold text-[9px] uppercase tracking-[0.2em]">© {new Date().getFullYear()} DOGE.S.M LLC. Titanium Noir Standard.</p>
        </div>
      </footer>


    </div>
  )
}
