export const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.85, 0, 0, 1] },
  },
}

export const fadeInStagger = (stagger = 0.08) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
})
