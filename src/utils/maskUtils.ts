import { Skia, type SkPath } from '@shopify/react-native-skia';

import type { MaskData } from '../types/projects';

interface PolygonPoint {
  x: number;
  y: number;
}

interface ShapeMaskPayload {
  kind?: string;
  shape?: string;
  points?: PolygonPoint[];
  units?: 'normalized' | 'absolute';
  orientation?: 'up' | 'down' | 'left' | 'right';
  inset?: number;
  cornerRadius?: number;
}

const buildPolygonPath = (
  points: PolygonPoint[],
  width: number,
  height: number,
  normalized: boolean,
): SkPath | null => {
  if (points.length < 3 || width <= 0 || height <= 0) {
    return null;
  }

  const path = Skia.Path.Make();
  points.forEach((point, index) => {
    const px = normalized ? point.x * width : point.x;
    const py = normalized ? point.y * height : point.y;
    if (index === 0) {
      path.moveTo(px, py);
    } else {
      path.lineTo(px, py);
    }
  });
  path.close();
  return path;
};

const buildTrianglePath = (
  payload: ShapeMaskPayload,
  width: number,
  height: number,
): SkPath | null => {
  const orientation = payload.orientation ?? 'up';
  const inset = Math.max(0, payload.inset ?? 0);
  const w = Math.max(0, width - inset * 2);
  const h = Math.max(0, height - inset * 2);
  const offsetX = inset;
  const offsetY = inset;

  const points: PolygonPoint[] = (() => {
    switch (orientation) {
      case 'down':
        return [
          { x: offsetX, y: offsetY },
          { x: offsetX + w, y: offsetY },
          { x: offsetX + w / 2, y: offsetY + h },
        ];
      case 'left':
        return [
          { x: offsetX + w, y: offsetY },
          { x: offsetX + w, y: offsetY + h },
          { x: offsetX, y: offsetY + h / 2 },
        ];
      case 'right':
        return [
          { x: offsetX, y: offsetY },
          { x: offsetX + w, y: offsetY + h / 2 },
          { x: offsetX, y: offsetY + h },
        ];
      case 'up':
      default:
        return [
          { x: offsetX, y: offsetY + h },
          { x: offsetX + w, y: offsetY + h },
          { x: offsetX + w / 2, y: offsetY },
        ];
    }
  })();

  return buildPolygonPath(points, 1, 1, false);
};

const buildRectPath = (width: number, height: number): SkPath => {
  const path = Skia.Path.Make();
  path.addRect(Skia.XYWHRect(0, 0, width, height));
  return path;
};

export const createClipForMask = (
  mask: MaskData | null | undefined,
  width: number,
  height: number,
): SkPath | null => {
  if (!mask || width <= 0 || height <= 0) {
    return null;
  }

  if (mask.type !== 'shape') {
    return null;
  }

  const payload = (mask.payload ?? {}) as ShapeMaskPayload;
  const kind = payload.kind ?? payload.shape ?? 'polygon';

  switch (kind) {
    case 'rect': {
      return buildRectPath(width, height);
    }
    case 'triangle': {
      return buildTrianglePath(payload, width, height);
    }
    case 'polygon':
    default: {
      const points = Array.isArray(payload.points) ? payload.points : [];
      if (points.length < 3) {
        return null;
      }
      const normalized =
        payload.units === 'normalized'
          ? true
          : payload.units === 'absolute'
            ? false
            : points.every(
                (point) =>
                  point.x >= 0 &&
                  point.x <= 1 &&
                  point.y >= 0 &&
                  point.y <= 1,
              );

      return buildPolygonPath(points, width, height, normalized);
    }
  }
};
