export type GamePhase = 'menu' | 'playing' | 'shop' | 'gameover';

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
}

export interface EnemyState {
  id: number;
  position: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
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
}

export interface WorldState {
  phase: GamePhase;
  width: number;
  height: number;
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  wave: WaveState;
}


