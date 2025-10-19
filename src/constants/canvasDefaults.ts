import type { CanvasState } from '../types/projects';

export const defaultCanvasState: CanvasState = {
  width: 2048,
  height: 2048,
  background: {
    type: 'color',
    value: '#F5F5F7',
    options: { texture: 'subtle-noise' },
  },
};
