export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export const PLAYER_DEFAULTS = {
  radius: 10,
  speed: 3.2,
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

export const ENEMIES_CONFIG = {
  mask_dude: { speed: 1.0, hp: 25, damage: 5 },
  ninja_frog: { speed: 1.2, hp: 28, damage: 6 },
  pink_man: { speed: 1.4, hp: 36, damage: 7 },
  virtual_guy: { speed: 1.6, hp: 42, damage: 8 },
} as const;

export const ENEMY_REWARD = {
  mask_dude: 2,
  ninja_frog: 3,
  pink_man: 4,
  virtual_guy: 5,
} as const;

export const PROJECTILE_DEFAULTS = {
  radius: 4,
  speed: 5.2,
} as const;


