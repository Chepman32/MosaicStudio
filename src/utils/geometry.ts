export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const rotatePoint = (point: Point, angle: number): Point => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
