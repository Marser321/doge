'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'

export const MagneticButton = ({ children, className = "", href }: { children: React.ReactNode, className?: string, href?: string }) => {
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
