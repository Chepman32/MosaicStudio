export interface SharedElementConfig {
  id: string;
  duration: number;
}

export const createSharedElementConfig = (id: string, duration = 400): SharedElementConfig => ({
  id,
  duration,
});
