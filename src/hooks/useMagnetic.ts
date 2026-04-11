import { useState, useRef, useCallback, useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Custom hook to create a magnetic effect on a reference element.
 * Perfect for luxury CTAs that "pull" the cursor in.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  strength: number = 0.3,
) {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for that "weighted" haptic feel
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e: ReactMouseEvent<T>) => {
    if (!ref.current || window.matchMedia('(hover: none)').matches) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Apply strength pull
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  }, [strength, x, y]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Memoize event props to avoid re-renders
  const magneticProps = useMemo(
    () => ({
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: {
        x: springX,
        y: springY,
      },
    }),
    [handleMouseMove, handleMouseEnter, handleMouseLeave, springX, springY],
  );

  return { ref, magneticProps, isHovered };
}
