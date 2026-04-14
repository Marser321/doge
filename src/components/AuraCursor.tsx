'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

function getInitialTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

// Magnetic attraction config — from Agency Agents Senior Developer
const MAGNETIC_RADIUS = 120; // px — detection radius around hoverable elements
const MAGNETIC_STRENGTH = 0.35; // 0-1 — how strongly the cursor is attracted

export default function SqueegeeCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isOnGlass, setIsOnGlass] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring-based cursor position (with magnetic offset)
  const cursorX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.1 });
  const cursorY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.1 });

  // Track the active magnetic target for attraction calculations
  const magneticTarget = useRef<HTMLElement | null>(null);

  const updatePosition = useCallback((e: MouseEvent) => {
    const rawX = e.clientX - 40;
    const rawY = e.clientY - 20;

    // Check for magnetic attraction
    if (magneticTarget.current) {
      const rect = magneticTarget.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < MAGNETIC_RADIUS) {
        // Apply magnetic pull toward center of target
        const pull = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
        mouseX.set(rawX - distX * pull);
        mouseY.set(rawY - distY * pull);
        return;
      }
    }

    mouseX.set(rawX);
    mouseY.set(rawY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    document.body.classList.add('custom-cursor');

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for interactive targets (magnetic attraction)
      const interactive =
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-hover-target');

      if (interactive) {
        setIsHovering(true);
        magneticTarget.current = (target.closest('button') ||
          target.closest('a') ||
          target.closest('.cursor-hover-target') ||
          target) as HTMLElement;
      } else {
        setIsHovering(false);
        magneticTarget.current = null;
      }

      // Check for glass panels (saturate glow effect)
      const onGlass =
        target.closest('.glass-panel') !== null ||
        target.closest('.luxury-glass') !== null ||
        target.closest('.glass-panel-heavy') !== null;

      setIsOnGlass(onGlass);
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

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor');
      observer.disconnect();
    };
  }, [updatePosition]);

  // Theme-aware colors
  const primaryColor = theme === 'dark' ? '#94a3b8' : '#334155'; // Silver vs Charcoal
  const shineColor = theme === 'dark' ? '#f1f5f9' : '#94a3b8';
  const shadowColor = theme === 'dark' ? '#334155' : '#0f172a';
  const rubberColor = '#000';

  // Glass glow: when cursor is over a glass panel, add a saturate halo
  const glowFilter = isOnGlass
    ? theme === 'dark'
      ? 'drop-shadow(0 0 12px rgba(148, 163, 184, 0.4)) saturate(200%)'
      : 'drop-shadow(0 0 12px rgba(51, 65, 85, 0.3)) saturate(150%)'
    : theme === 'dark'
      ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
      : 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))';

  if (isTouchDevice) return null;

  return (
    <motion.div
      id="aura-cursor"
      className="fixed top-0 left-0 w-20 h-20 pointer-events-none z-[9999] flex items-center justify-center"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        rotate: isHovering ? -12 : 0,
        scale: isHovering ? 1.15 : isOnGlass ? 1.05 : 1,
      }}
      transition={{
        rotate: { type: "spring", stiffness: 400, damping: 25 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        className="transition-all duration-500"
        style={{ filter: glowFilter }}
      >
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
