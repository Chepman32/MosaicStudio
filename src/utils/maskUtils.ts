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
  strokeWidth?: number;
  strokeColor?: string;
  strokeJoin?: 'miter' | 'round' | 'bevel';
  strokeCap?: 'butt' | 'round' | 'square';
}

const buildPathFromPoints = (points: PolygonPoint[]): SkPath | null => {
  if (points.length < 3) {
    return null;
  }

  const path = Skia.Path.Make();
  points.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.y);
    } else {
      path.lineTo(point.x, point.y);
    }
  });
  path.close();
  return path;
};

const convertPolygonPoints = (
  payload: ShapeMaskPayload,
  width: number,
  height: number,
): PolygonPoint[] | null => {
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

  return points.map((point) => ({
    x: normalized ? point.x * width : point.x,
    y: normalized ? point.y * height : point.y,
  }));
};

const getTrianglePoints = (
  payload: ShapeMaskPayload,
  width: number,
  height: number,
): PolygonPoint[] | null => {
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

  return points;
};

const getRectPoints = (width: number, height: number): PolygonPoint[] => [
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height },
];

const resolveShapePoints = (
  payload: ShapeMaskPayload,
  width: number,
  height: number,
): PolygonPoint[] | null => {
  const kind = payload.kind ?? payload.shape ?? 'polygon';

  switch (kind) {
    case 'rect':
      return getRectPoints(width, height);
    case 'triangle':
      return getTrianglePoints(payload, width, height);
    case 'polygon':
    default:
      return convertPolygonPoints(payload, width, height);
  }
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
  const points = resolveShapePoints(payload, width, height);
  if (!points) {
    return null;
  }

  return buildPathFromPoints(points);
};

interface MaskStrokeOptions {
  width: number;
  color: string;
  join: 'miter' | 'round' | 'bevel';
  cap: 'butt' | 'round' | 'square';
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const getMaskStroke = (
  mask: MaskData | null | undefined,
  scale = 1,
): MaskStrokeOptions | null => {
  if (!mask || mask.type !== 'shape') {
    return null;
  }

  const payload = (mask.payload ?? {}) as ShapeMaskPayload;
  if (!isFiniteNumber(payload.strokeWidth) || payload.strokeWidth <= 0) {
    return null;
  }

  const width = payload.strokeWidth * scale;

  return {
    width,
    color: typeof payload.strokeColor === 'string' ? payload.strokeColor : '#FFFFFF',
    join: payload.strokeJoin ?? 'miter',
    cap: payload.strokeCap ?? 'butt',
  };
};

const polygonCentroid = (points: PolygonPoint[]): { x: number; y: number } => {
  let areaTwice = 0;
  let centroidX = 0;
  let centroidY = 0;
  const count = points.length;

  for (let i = 0; i < count; i += 1) {
    const { x: x0, y: y0 } = points[i];
    const { x: x1, y: y1 } = points[(i + 1) % count];
    const cross = x0 * y1 - x1 * y0;
    areaTwice += cross;
    centroidX += (x0 + x1) * cross;
    centroidY += (y0 + y1) * cross;
  }

  const area = areaTwice / 2;
  if (Math.abs(area) < 1e-6) {
    const sum = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
      }),
      { x: 0, y: 0 },
    );
    return {
      x: sum.x / count,
      y: sum.y / count,
    };
  }

  const factor = 1 / (6 * area);
  return {
    x: centroidX * factor,
    y: centroidY * factor,
  };
};

export const getMaskCentroid = (
  mask: MaskData | null | undefined,
  width: number,
  height: number,
): { x: number; y: number } | null => {
  if (!mask || mask.type !== 'shape') {
    return null;
  }

  const payload = (mask.payload ?? {}) as ShapeMaskPayload;
  const points = resolveShapePoints(payload, width, height);
  if (!points) {
    return null;
  }

  return polygonCentroid(points);
};
