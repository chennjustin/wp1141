export type GamePhase = 'menu' | 'weaponSelect' | 'playing' | 'victory' | 'shop' | 'gameover';

export interface Vector2 {
  x: number;
  y: number;
}

export interface WeaponState {
  id: string;
  type: 'weapon_R1' | 'weapon_R2' | 'weapon_R3';
  damage: number;
  attackIntervalMs: number;
  range: number;
  level: number;
  lastAttackAt: number;
  traits?: string[]; // 武器特質
}

export interface PlayerState {
  position: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  money: number;
  // 經驗值系統
  experience: number;
  level: number;
  experienceToNext: number;
  // sprite/animation
  facing: 'left' | 'right';
  anim: 'idle' | 'walk' | 'die' | 'victory';
  frame: number;
  lastFrameAtMs: number;
  // weapons
  weapons: WeaponState[];
  selectedWeaponIndex: number;
  // 升級屬性
  upgrades?: {
    attackDamage?: number; // 攻擊傷害加成
    attackSpeed?: number;  // 攻擊速度加成
  };
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
  // 特殊行為屬性
  flashPosition?: Vector2 | null;
  flashStartTime?: number;
  dashTarget?: Vector2 | null;
  dashCooldown?: number;
  lastDashAt?: number;
  // Virtual Guy 分身系統
  isClone?: boolean; // 是否為分身
  originalId?: number; // 本體 ID（僅分身有此屬性）
  cloneLifetime?: number; // 分身存活時間
  cloneStartTime?: number; // 分身生成時間
  hasSpawnedClones?: boolean; // 是否已經生成過分身
  // 分離動畫屬性
  separationAngle?: number; // 分離角度
  separationDistance?: number; // 當前分離距離
  separationSpeed?: number; // 分離速度
  // pink_man 衝刺拖尾
  dashTrail?: Vector2[]; // 衝刺軌跡點
  maxTrailLength?: number; // 最大軌跡長度
}

export interface ProjectileState {
  id: number;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
}

export interface DamageNumberState {
  id: number;
  position: Vector2;
  damage: number;
  startTime: number;
  velocity: Vector2;
}

export interface LevelUpTextState {
  id: number;
  position: Vector2;
  startTime: number;
  velocity: Vector2;
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
  experience: number;
  level: number;
  experienceToNext: number;
}

export interface WorldState {
  phase: GamePhase;
  width: number;
  height: number;
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  damageNumbers: DamageNumberState[];
  levelUpTexts: LevelUpTextState[];
  wave: WaveState;
  victoryAt?: number;
  timerEndAt?: number;
}


