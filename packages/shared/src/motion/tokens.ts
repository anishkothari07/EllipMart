export const durations = {
  veryFast: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.6,
};

export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeOutQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const springs = {
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  },
  snap: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
    mass: 0.6,
  },
  stiff: {
    type: "spring" as const,
    stiffness: 250,
    damping: 20,
  },
  luxury: {
    type: "spring" as const,
    stiffness: 80,
    damping: 15,
    mass: 1,
  },
};
