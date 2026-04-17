'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const PrecisionReveal = () => {
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
      <Image
        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop"
        alt="Before"
        fill
        className="object-cover grayscale opacity-30"
      />

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
