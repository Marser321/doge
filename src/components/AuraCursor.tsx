'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SqueegeeCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
 
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

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.dataset.theme as 'dark' | 'light';
          setTheme(newTheme || 'dark');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    
    // Initial theme check
    const currentTheme = document.documentElement.dataset.theme as 'dark' | 'light';
    if (currentTheme) setTheme(currentTheme);
 
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
 
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor');
      observer.disconnect();
    };
  }, []);
 
  if (!isVisible) return null;

  // Theme-aware colors
  const primaryColor = theme === 'dark' ? '#94a3b8' : '#334155'; // Silver vs Charcoal
  const shineColor = theme === 'dark' ? '#f1f5f9' : '#94a3b8';
  const shadowColor = theme === 'dark' ? '#334155' : '#0f172a';
  const rubberColor = '#000';
 
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
      <svg width="80" height="80" viewBox="0 0 100 100" className={`transition-all duration-500 ${theme === 'dark' ? 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]'}`}>
        {/* Rubber Blade (Deep Black) */}
        <rect x="5" y="22" width="90" height="6" fill={rubberColor} rx="1" />
        
        {/* Titanium Channel (Silver/Grey) */}
        <rect x="0" y="15" width="100" height="7" fill={primaryColor} rx="0.5" className="transition-colors duration-500" />
        <rect x="0" y="15" width="100" height="2" fill={shineColor} opacity="0.4" className="transition-colors duration-500" /> {/* Shine */}
        <rect x="0" y="21" width="100" height="1" fill={shadowColor} opacity="0.5" className="transition-colors duration-500" /> {/* Under-shadow */}
 
        {/* Minimalist Center Clip */}
        <path d="M 38 22 L 62 22 L 56 38 L 44 38 Z" fill={shadowColor} className="transition-colors duration-500" />
        <path d="M 40 22 L 60 22 L 55 36 L 45 36 Z" fill={primaryColor} className="transition-colors duration-500" />
        
        {/* Sleek Handle */}
        <rect x="42" y="38" width="16" height="42" fill={primaryColor} rx="2" className="transition-colors duration-500" />
        <rect x="44" y="40" width="3" height="38" fill={shineColor} opacity="0.3" rx="1" className="transition-colors duration-500" /> {/* Shine */}
        
        {/* Subtle Grip Details */}
        {[50, 58, 66].map(y => (
          <line key={y} x1="44" y1={y} x2="54" y2={y} stroke={shadowColor} strokeWidth="1.5" opacity="0.4" className="transition-colors duration-500" />
        ))}
      </svg>
    </motion.div>

  );
}
