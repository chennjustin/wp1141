export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export const PLAYER_DEFAULTS = {
  radius: 10,
  speed: 2.2,
  maxHp: 5,
  damage: 10,
  attackIntervalMs: 700,
  attackRange: 220,
} as const;

export const ENEMY_BASE = {
  radius: 10,
  speed: 1.0,
  hp: 25,
} as const;

export const PROJECTILE_DEFAULTS = {
  radius: 4,
  speed: 5.2,
} as const;


