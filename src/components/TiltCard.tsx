'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 5)
  glareEnabled?: boolean; // Show glare reflection (default: true)
  scale?: number; // Scale on hover (default: 1.02)
}

/**
 * TiltCard — Kinetic 3D tilt component based on cursor position.
 * 
 * Source: Master Prompt "Hover Micro-interactions" (±5° tilt limit)
 * Tech: Framer Motion useMotionValue + useSpring for 60fps composited transforms
 * 
 * Features:
 * - Cursor-relative tilt with configurable max angle
 * - Glare reflection that follows cursor position
 * - Disabled on mobile (matchMedia) & reduced-motion
 * - Spring-based physics for smooth return-to-center
 */
export function TiltCard({ 
  children, 
  className = '', 
  maxTilt = 5, 
  glareEnabled = true,
  scale = 1.02 
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Motion values for smooth 60fps tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Spring configs for premium feel — cubic-bezier(0.16, 1, 0.3, 1) approximation
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    // Check for mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile || prefersReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized position: -1 to 1
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    // Clamp to ±maxTilt degrees
    rotateX.set(-normalizedY * maxTilt);
    rotateY.set(normalizedX * maxTilt);

    // Glare position (percentage)
    glareX.set(((e.clientX - rect.left) / rect.width) * 100);
    glareY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [isMobile, prefersReducedMotion, maxTilt, rotateX, rotateY, glareX, glareY]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !prefersReducedMotion) {
      setIsHovering(true);
    }
  }, [isMobile, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Spring back to center
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [rotateX, rotateY, glareX, glareY]);

  // If mobile or reduced motion, render without tilt
  if (isMobile || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        scale: isHovering ? scale : 1,
      }}
      transition={{
        scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {children}

      {/* Glare Reflection Overlay */}
      {glareEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] overflow-hidden"
          style={{
            background: isHovering
              ? `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
              : 'none',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
