export interface Transform2D {
  x: number;
  y: number;
  scale: number;
  rotation: number; // radians
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface AppliedFilter {
  id: string;
  intensity: number; // 0 - 1 range
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  aspectRatio?: number | null;
}

export interface MaskData {
  type: 'shape' | 'custom' | 'gradient';
  payload: Record<string, unknown>;
}

export interface PhotoLayer {
  id: string;
  sourceUri: string;
  transform: Transform2D;
  dimensions: Dimensions;
  filters: AppliedFilter[];
  opacity: number;
  blendMode: string;
  zIndex: number;
  crop: CropData | null;
  mask: MaskData | null;
  isLocked?: boolean;
  hidden?: boolean;
}

export interface TextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  transform: Transform2D;
  style: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    } | null;
    stroke?: {
      color: string;
      width: number;
    } | null;
  };
  zIndex: number;
}

export type Layer = PhotoLayer | TextLayer;

export interface CanvasState {
  width: number;
  height: number;
  background: {
    type: 'color' | 'gradient' | 'texture' | 'photo';
    value: string;
    options?: Record<string, unknown>;
  };
}

export interface CollageProject {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  thumbnail: string;
  canvas: CanvasState;
  layers: Layer[];
  template: string | null;
  metadata?: Record<string, unknown>;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'grid' | 'freeform' | 'seasonal' | 'premium';
  isPremium: boolean;
  layout: {
    canvas: CanvasState;
    frames: Array<{
      id: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      zIndex: number;
      mask?: MaskData | null;
    }>;
  };
}

export interface ExportOptions {
  quality: 'low' | 'high' | 'original';
  format: 'jpg' | 'png' | 'pdf';
  includeWatermark: boolean;
}
