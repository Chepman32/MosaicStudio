import { create } from 'zustand';

interface SplashState {
  hasCompleted: boolean;
  markCompleted: () => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  hasCompleted: false,
  markCompleted: () => set({ hasCompleted: true }),
}));
