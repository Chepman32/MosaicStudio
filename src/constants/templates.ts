import type { TemplateDefinition } from '../types/projects';

export const TEMPLATE_CATEGORIES = [
  'grid',
  'freeform',
  'seasonal',
  'premium',
] as const;

export const SAMPLE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'grid-2x2',
    name: 'Classic 2x2',
    category: 'grid',
    isPremium: false,
    layout: {
      canvas: {
        width: 2048,
        height: 2048,
        background: {
          type: 'color',
          value: '#F5F5F7',
        },
      },
      frames: Array.from({ length: 4 }).map((_, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        return {
          id: `frame-${index}`,
          position: { x: col * 1024, y: row * 1024 },
          size: { width: 1024, height: 1024 },
          rotation: 0,
          zIndex: index,
        };
      }),
    },
  },
  {
    id: 'freeform-flow',
    name: 'Freeform Flow',
    category: 'freeform',
    isPremium: false,
    layout: {
      canvas: {
        width: 2048,
        height: 2048,
        background: {
          type: 'color',
          value: '#F5F5F7',
        },
      },
      frames: [
        {
          id: 'frame-1',
          position: { x: 200, y: 300 },
          size: { width: 900, height: 1100 },
          rotation: -0.05,
          zIndex: 1,
        },
        {
          id: 'frame-2',
          position: { x: 950, y: 400 },
          size: { width: 900, height: 900 },
          rotation: 0.08,
          zIndex: 2,
        },
      ],
    },
  },
  {
    id: 'premium-parallax',
    name: 'Parallax Layers',
    category: 'premium',
    isPremium: true,
    layout: {
      canvas: {
        width: 2048,
        height: 2048,
        background: {
          type: 'gradient',
          value: 'linear(#6B4FE0,#FF6B9D)',
        },
      },
      frames: [
        {
          id: 'frame-a',
          position: { x: 100, y: 200 },
          size: { width: 1100, height: 1100 },
          rotation: -0.12,
          zIndex: 1,
        },
        {
          id: 'frame-b',
          position: { x: 800, y: 600 },
          size: { width: 900, height: 900 },
          rotation: 0.18,
          zIndex: 2,
        },
      ],
    },
  },
];
