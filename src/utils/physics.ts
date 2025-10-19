export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

export const simulateSpring = (
  value: number,
  target: number,
  velocity: number,
  config: SpringConfig,
  deltaTime: number,
): { value: number; velocity: number } => {
  const { damping, stiffness, mass } = config;
  const acceleration = (-stiffness * (value - target) - damping * velocity) / mass;
  const nextVelocity = velocity + acceleration * deltaTime;
  const nextValue = value + nextVelocity * deltaTime;
  return { value: nextValue, velocity: nextVelocity };
};
