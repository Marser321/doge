'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const TextScrubber = ({ text, className = "" }: { text: string, className?: string }) => {
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
