"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

const BRANDS = [
  { name: 'Dyson', logo: 'https://cdn.worldvectorlogo.com/logos/dyson-2.svg' },
  { name: 'Kärcher', logo: 'https://cdn.worldvectorlogo.com/logos/karcher-logo.svg' },
  { name: 'Miele', logo: 'https://cdn.worldvectorlogo.com/logos/miele.svg' },
  { name: 'Bissell', logo: 'https://cdn.worldvectorlogo.com/logos/bissell.svg' },
  { name: 'Unger', logo: 'https://cdn.worldvectorlogo.com/logos/unger-1.svg' },
  { name: 'Method', logo: 'https://cdn.worldvectorlogo.com/logos/method.svg' },
];

export const BrandMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!marqueeRef.current) return;

    const marquee = marqueeRef.current;
    const totalWidth = marquee.scrollWidth / 2;

    const tween = gsap.to(marquee, {
      x: -totalWidth,
      duration: 30,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className="w-full overflow-hidden py-20 border-y border-accent/10 relative">
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-background via-transparent to-background"></div>
      
      <div className="max-w-7xl mx-auto px-6 mb-12">
         <span className="text-[10px] font-black uppercase text-accent tracking-[0.5em] block mb-4">Official Partnership Hub</span>
         <h2 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tighter font-michroma">Equipamiento <span className="silver-text">Certificado.</span></h2>
      </div>

      <div className="flex w-full overflow-hidden mask-fade-edges">
        <div ref={marqueeRef} className="flex flex-nowrap shrink-0 items-center gap-24 py-4 px-12">
          {[...BRANDS, ...BRANDS].map((brand, idx) => (
            <div key={idx} className="flex items-center gap-4 group opacity-40 hover:opacity-100 transition-opacity">
              <div className="relative h-8 md:h-12 w-[120px]">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="invert dark:invert-0 object-contain transition-all duration-500 grayscale hover:grayscale-0"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
