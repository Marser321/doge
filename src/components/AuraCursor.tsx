'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SqueegeeCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Add custom cursor class to the body
    document.body.classList.add('custom-cursor');

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Expand cursor on clickable elements
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-hover-target')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-20 h-20 pointer-events-none z-[9999] flex items-center justify-center"
      animate={{
        x: mousePosition.x - 40,
        y: mousePosition.y - 20,
        rotate: isHovering ? -12 : 0,
        scale: isHovering ? 1.1 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.1
      }}
    >
      <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        {/* Rubber Blade (Deep Black) */}
        <rect x="5" y="22" width="90" height="6" fill="#000" rx="1" />
        
        {/* Titanium Channel (Silver/Grey) */}
        <rect x="0" y="15" width="100" height="7" fill="#94a3b8" rx="0.5" />
        <rect x="0" y="15" width="100" height="2" fill="#f1f5f9" opacity="0.4" /> {/* Shine */}
        <rect x="0" y="21" width="100" height="1" fill="#334155" opacity="0.5" /> {/* Under-shadow */}

        {/* Minimalist Center Clip */}
        <path d="M 38 22 L 62 22 L 56 38 L 44 38 Z" fill="#64748b" />
        <path d="M 40 22 L 60 22 L 55 36 L 45 36 Z" fill="#94a3b8" />
        
        {/* Sleek Handle */}
        <rect x="42" y="38" width="16" height="42" fill="#94a3b8" rx="2" />
        <rect x="44" y="40" width="3" height="38" fill="#f1f5f9" opacity="0.3" rx="1" /> {/* Shine */}
        
        {/* Subtle Grip Details */}
        {[50, 58, 66].map(y => (
          <line key={y} x1="44" y1={y} x2="54" y2={y} stroke="#475569" strokeWidth="1.5" opacity="0.4"/>
        ))}
      </svg>
    </motion.div>

  );
}
