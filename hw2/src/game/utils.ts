import { Vector2 } from './types';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

export function randomEdgeSpawn(width: number, height: number): Vector2 {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: Math.random() * width, y: -10 }; // top
  if (edge === 1) return { x: Math.random() * width, y: height + 10 }; // bottom
  if (edge === 2) return { x: -10, y: Math.random() * height }; // left
  return { x: width + 10, y: Math.random() * height }; // right
}

export function now(): number { return performance.now(); }


