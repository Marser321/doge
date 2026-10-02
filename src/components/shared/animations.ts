import type { Variants } from 'framer-motion'

/** The project's signature easing. Everything that moves uses it. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/**
 * Entrance used across the marketing surfaces.
 *
 * `transition` has to live inside the target variant. As a sibling key it is
 * read as a variant literally named "transition" and silently ignored, which
 * is what used to happen here: the duration and easing below never ran and
 * Framer fell back to its default spring.
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}
