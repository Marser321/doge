export const fadeInUp = {
  initial: { opacity: 0, y: 30, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}
