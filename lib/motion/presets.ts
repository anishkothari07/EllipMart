import { durations, easings, springs } from "./tokens";

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.fast, ease: easings.easeInOut },
  },
  fadeUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 15 },
    transition: { duration: durations.normal, ease: easings.easeOutExpo },
  },
  fadeDown: {
    initial: { opacity: 0, y: -15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: durations.normal, ease: easings.easeOutExpo },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: durations.fast, ease: easings.easeOutExpo },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: durations.normal, ease: easings.easeOutExpo },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: durations.normal, ease: easings.easeOutExpo },
  },
  drawer: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: springs.gentle,
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: springs.luxury,
  },
  toast: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.85, transition: { duration: durations.veryFast } },
    transition: springs.snap,
  },
  stagger: (staggerChildren = 0.05, delayChildren = 0) => ({
    animate: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }),
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: durations.normal, ease: easings.easeOutExpo },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { duration: durations.veryFast, ease: easings.easeOutQuart },
  },
  press: {
    scale: 0.98,
    transition: { duration: durations.veryFast, ease: easings.easeOutQuart },
  },
};
