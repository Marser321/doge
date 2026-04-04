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
      className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-[9999] flex items-center justify-center drop-shadow-2xl"
      animate={{
        // Anclar el centro de la hoja de goma al mouse (asumo centro visual)
        x: mousePosition.x - 32,
        y: mousePosition.y - 12,
        rotate: isHovering ? -15 : 0,
        scale: isHovering ? 1.2 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.1
      }}
    >
      <svg width="64" height="64" viewBox="0 0 100 100" className="drop-shadow-lg">
        {/* Rubber Blade (Black) */}
        <rect x="5" y="25" width="90" height="8" fill="#111" rx="2" />
        
        {/* Brass Channel (Gold) */}
        <rect x="0" y="16" width="100" height="9" fill="#D4AF37" rx="1" />
        <line x1="0" y1="18" x2="100" y2="18" stroke="#FFEAA7" strokeWidth="1" opacity="0.7"/> {/* Highlight */}
        <line x1="0" y1="24" x2="100" y2="24" stroke="#8A6C1C" strokeWidth="1" opacity="0.6"/> {/* Shadow */}

        {/* Center Clip (Gold) */}
        <path d="M 35 25 L 65 25 L 58 45 L 42 45 Z" fill="#B8962E" />
        <path d="M 37 25 L 63 25 L 57 43 L 43 43 Z" fill="#D4AF37" />
        
        {/* Screws */}
        <circle cx="43" cy="30" r="2" fill="#5A4611" />
        <circle cx="57" cy="30" r="2" fill="#5A4611" />

        {/* Handle Body (Gold) */}
        <rect x="40" y="44" width="20" height="50" fill="#D4AF37" rx="4" />
        <rect x="42" y="46" width="6" height="46" fill="#FFEAA7" opacity="0.6" rx="2" /> {/* Cylindrical shine */}
        
        {/* Handle Grip Ribs */}
        <line x1="40" y1="65" x2="60" y2="65" stroke="#8A6C1C" strokeWidth="2" opacity="0.6"/>
        <line x1="40" y1="75" x2="60" y2="75" stroke="#8A6C1C" strokeWidth="2" opacity="0.6"/>
        <line x1="40" y1="85" x2="60" y2="85" stroke="#8A6C1C" strokeWidth="2" opacity="0.6"/>
      </svg>
    </motion.div>
  );
}
