import type { TemplateDefinition } from '../types/projects';

export const TEMPLATE_CATEGORIES = [
  'grid',
  'freeform',
  'seasonal',
  'premium',
] as const;

const GAP = 16;
const CANVAS_SIZE = 2048;

export const SAMPLE_TEMPLATES: TemplateDefinition[] = [
  // Layout 1: 2 vertical columns
  {
    id: 'grid-2-col',
    name: '2 Columns',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1008, height: 2048 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 2048 }, rotation: 0, zIndex: 1 },
      ],
    },
  },
  // Layout 2: Diagonal split (premium)
  {
    id: 'grid-diagonal',
    name: 'Diagonal Split',
    category: 'premium',
    isPremium: true,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1024, height: 2048 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 2048 }, rotation: 0, zIndex: 1 },
      ],
    },
  },
  // Layout 3: Left column + 2 stacked right
  {
    id: 'grid-col-stack',
    name: 'Column & Stack',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1008, height: 2048 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 1008 }, rotation: 0, zIndex: 1 },
        { id: 'frame-2', position: { x: 1024, y: 1024 }, size: { width: 1024, height: 1024 }, rotation: 0, zIndex: 2 },
      ],
    },
  },
  // Layout 4: Left column + 3 stacked right
  {
    id: 'grid-col-3stack',
    name: 'Column & 3 Stack',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1008, height: 2048 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 661 }, rotation: 0, zIndex: 1 },
        { id: 'frame-2', position: { x: 1024, y: 677 }, size: { width: 1024, height: 661 }, rotation: 0, zIndex: 2 },
        { id: 'frame-3', position: { x: 1024, y: 1354 }, size: { width: 1024, height: 694 }, rotation: 0, zIndex: 3 },
      ],
    },
  },
  // Layout 5: Top row + bottom row (2 frames)
  {
    id: 'grid-rows',
    name: 'Top & Bottom',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 2048, height: 1008 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 0, y: 1024 }, size: { width: 2048, height: 1024 }, rotation: 0, zIndex: 1 },
      ],
    },
  },
  // Layout 6: Top row + 2x2 grid bottom
  {
    id: 'grid-top-2x2',
    name: 'Top + 2x2',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 2048, height: 1008 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 0, y: 1024 }, size: { width: 1008, height: 1024 }, rotation: 0, zIndex: 1 },
        { id: 'frame-2', position: { x: 1024, y: 1024 }, size: { width: 1024, height: 1024 }, rotation: 0, zIndex: 2 },
      ],
    },
  },
  // Layout 7: 2x2 grid
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1008, height: 1008 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 1008 }, rotation: 0, zIndex: 1 },
        { id: 'frame-2', position: { x: 0, y: 1024 }, size: { width: 1008, height: 1024 }, rotation: 0, zIndex: 2 },
        { id: 'frame-3', position: { x: 1024, y: 1024 }, size: { width: 1024, height: 1024 }, rotation: 0, zIndex: 3 },
      ],
    },
  },
  // Layout 8: 2 columns + bottom row
  {
    id: 'grid-2col-bottom',
    name: '2 Columns + Bottom',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: { type: 'color', value: '#FFFFFF' } },
      frames: [
        { id: 'frame-0', position: { x: 0, y: 0 }, size: { width: 1008, height: 1008 }, rotation: 0, zIndex: 0 },
        { id: 'frame-1', position: { x: 1024, y: 0 }, size: { width: 1024, height: 1008 }, rotation: 0, zIndex: 1 },
        { id: 'frame-2', position: { x: 0, y: 1024 }, size: { width: 2048, height: 1024 }, rotation: 0, zIndex: 2 },
      ],
    },
  },
];
