export type GamePhase = 'menu' | 'playing' | 'victory' | 'shop' | 'gameover';

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  money: number;
  damage: number;
  attackIntervalMs: number;
  attackRange: number;
  lastAttackAt: number;
  // sprite/animation
  facing: 'left' | 'right';
  anim: 'idle' | 'walk' | 'die' | 'victory';
  frame: number;
  lastFrameAtMs: number;
}

export interface EnemyState {
  id: number;
  position: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: 'mask_dude' | 'ninja_frog' | 'pink_man' | 'virtual_guy';
  damage: number;
  frame: number;
  lastFrameAtMs: number;
  facing?: 'left' | 'right';
  // dying/disappear animation state
  dying?: boolean;
  disappearFrame?: number; // 0..4 -> dis_1..dis_5
  lastDisappearAtMs?: number;
}

export interface ProjectileState {
  id: number;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
}

export interface WaveState {
  index: number;
  enemiesToSpawn: number;
  spawned: number;
  spawnCooldownMs: number;
  lastSpawnAt: number;
  enemyHp: number;
  enemySpeed: number;
}

export interface UIState {
  hp: number;
  money: number;
  waveIndex: number;
  phase: GamePhase;
  timeLeftSec?: number;
}

export interface WorldState {
  phase: GamePhase;
  width: number;
  height: number;
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  wave: WaveState;
  victoryAt?: number;
  timerEndAt?: number;
}


