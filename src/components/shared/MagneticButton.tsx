'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

import { useMagnetic } from '@/hooks/useMagnetic'

const MotionLink = motion.create(Link)

/**
 * Primary call to action with a magnetic hover.
 *
 * Renders a `next/link`, not a bare anchor. It used to be a `motion.a`, which
 * meant the three main CTAs on the landing page triggered a full document
 * reload instead of a client-side navigation — the single biggest reason the
 * site felt slower than it is.
 */
export const MagneticButton = ({
  children,
  className = '',
  href = '#',
}: {
  children: React.ReactNode
  className?: string
  href?: string
}) => {
  const { ref, magneticProps } = useMagnetic<HTMLAnchorElement>(0.2)
  const reduceMotion = useReducedMotion()

  // Chasing the pointer is exactly the kind of motion reduced-motion is for.
  if (reduceMotion) {
    return (
      <Link href={href} className={`inline-block ${className}`}>
        {children}
      </Link>
    )
  }

  return (
    <MotionLink href={href} ref={ref} {...magneticProps} className={`inline-block ${className}`}>
      {children}
    </MotionLink>
  )
}
