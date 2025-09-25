import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ENEMY_BASE, ENEMIES_CONFIG, ENEMY_REWARD, PLAYER_DEFAULTS, PROJECTILE_DEFAULTS } from './constants';
import { EnemyState, GamePhase, PlayerState, ProjectileState, UIState, WaveState, WorldState } from './types';
import { distance, normalize, now, randomEdgeSpawn } from './utils';

interface GameContextValue {
  worldRef: React.MutableRefObject<WorldState>;
  ui: UIState;
  setPhase: (p: GamePhase) => void;
  reset: () => void;
  buyUpgrade: (type: 'damage' | 'attackSpeed' | 'range' | 'maxHp') => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function createInitialWorld(): WorldState {
  const width = typeof window !== 'undefined' ? window.innerWidth : CANVAS_WIDTH;
  const height = typeof window !== 'undefined' ? window.innerHeight : CANVAS_HEIGHT;
  const player: PlayerState = {
    position: { x: width / 2, y: height / 2 },
    radius: PLAYER_DEFAULTS.radius,
    speed: PLAYER_DEFAULTS.speed,
    hp: PLAYER_DEFAULTS.maxHp,
    maxHp: PLAYER_DEFAULTS.maxHp,
    money: 0,
    damage: PLAYER_DEFAULTS.damage,
    attackIntervalMs: PLAYER_DEFAULTS.attackIntervalMs,
    attackRange: PLAYER_DEFAULTS.attackRange,
    lastAttackAt: 0,
    facing: 'right',
    anim: 'idle',
    frame: 0,
    lastFrameAtMs: 0,
  };
  const wave: WaveState = {
    index: 1,
    enemiesToSpawn: 24,
    spawned: 0,
    spawnCooldownMs: 360,
    lastSpawnAt: 0,
    enemyHp: ENEMY_BASE.hp,
    enemySpeed: ENEMY_BASE.speed,
  };
  return {
    phase: 'menu',
    width,
    height,
    player,
    enemies: [],
    projectiles: [],
    wave,
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const worldRef = useRef<WorldState>(createInitialWorld());
  const [ui, setUi] = useState<UIState>({ hp: worldRef.current.player.hp, money: 0, waveIndex: worldRef.current.wave.index, phase: 'menu', timeLeftSec: 30 });

  const syncUi = () => {
    const w = worldRef.current;
    setUi({ hp: w.player.hp, money: w.player.money, waveIndex: w.wave.index, phase: w.phase });
  };

  const setPhase = (p: GamePhase) => {
    worldRef.current.phase = p;
    if (p === 'playing' && ui.phase === 'menu') {
      // initialize UI at start of game
      // center player at start
      const w = worldRef.current;
      w.player.position.x = w.width / 2;
      w.player.position.y = w.height / 2;
      // start 30s timer each time playing starts
      w.timerEndAt = now() + 30_000;
      syncUi();
    }
    syncUi();
  };

  const reset = () => {
    worldRef.current = createInitialWorld();
    setUi({ hp: worldRef.current.player.hp, money: 0, waveIndex: 1, phase: 'menu' });
  };

  const buyUpgrade = (type: 'damage' | 'attackSpeed' | 'range' | 'maxHp') => {
    const w = worldRef.current;
    const p = w.player;
    const costs = { damage: 50, attackSpeed: 60, range: 70, maxHp: 80 } as const;
    const cost = costs[type];
    if (p.money < cost) return;
    p.money -= cost;
    if (type === 'damage') p.damage += 5;
    if (type === 'attackSpeed') p.attackIntervalMs = Math.max(200, p.attackIntervalMs - 80);
    if (type === 'range') p.attackRange += 40;
    if (type === 'maxHp') { p.maxHp += 2; p.hp = Math.min(p.maxHp, p.hp + 2); }
    syncUi();
  };

  // keep minimal UI in sync periodically without causing heavy re-renders
  useEffect(() => {
    const id = setInterval(() => {
      const w = worldRef.current;
      setUi(prev => {
        if (
          prev.hp === w.player.hp &&
          prev.money === w.player.money &&
          prev.waveIndex === w.wave.index &&
          prev.phase === w.phase &&
          Math.floor((Math.max(0, (w.timerEndAt ?? now()) - now())) / 1000) === (prev.timeLeftSec ?? 0)
        ) return prev;
        return { hp: w.player.hp, money: w.player.money, waveIndex: w.wave.index, phase: w.phase, timeLeftSec: Math.floor((Math.max(0, (w.timerEndAt ?? now()) - now())) / 1000) };
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const value = useMemo<GameContextValue>(() => ({ worldRef, ui, setPhase, reset, buyUpgrade }), [ui]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// Game update logic
export function stepWorld(world: WorldState, input: { up: boolean; down: boolean; left: boolean; right: boolean }) {
  const t = now();
  const { player } = world;

  // Handle victory timing even when not playing
  if (world.phase === 'victory') {
    // advance victory frames
    const interval = 140;
    if (t - player.lastFrameAtMs >= interval) {
      player.lastFrameAtMs = t;
      player.frame = (player.frame + 1) % 4; // 0..3 -> 33..36
    }
    const start = (world as any).victoryAt as number | undefined;
    if (start && t - start > 1800) {
      world.phase = 'shop';
    }
    return;
  }

  if (world.phase !== 'playing') return;

  // movement
  const dir = { x: (input.right ? 1 : 0) - (input.left ? 1 : 0), y: (input.down ? 1 : 0) - (input.up ? 1 : 0) };
  const n = normalize(dir);
  player.position.x = Math.max(0, Math.min(world.width, player.position.x + n.x * player.speed));
  player.position.y = Math.max(0, Math.min(world.height, player.position.y + n.y * player.speed));

  // animation state
  const isMoving = Math.abs(n.x) > 0.0001 || Math.abs(n.y) > 0.0001;
  // don't override death animation once started
  if (player.anim !== 'die') {
    player.anim = isMoving ? 'walk' : 'idle';
  }
  if (n.x > 0.0001) player.facing = 'right';
  else if (n.x < -0.0001) player.facing = 'left';

  // frame advance: idle uses [1,2], walk uses [9,10,11,12]
  const frameIntervalMs = player.anim === 'idle' ? 400 : (player.anim === 'walk' ? 120 : 180);
  if (t - player.lastFrameAtMs >= frameIntervalMs) {
    player.lastFrameAtMs = t;
    if (player.anim === 'idle') {
      // 0 -> character_1, 1 -> character_2
      player.frame = (player.frame + 1) % 2;
    } else if (player.anim === 'walk') {
      // 0..3 -> character_9..12
      player.frame = (player.frame + 1) % 4;
    } else if (player.anim === 'die') {
      // 0..3 -> character_37..40, stop at last frame
      player.frame = Math.min(3, player.frame + 1);
    }
  }

  // spawn enemies per wave
  const w = world.wave;
  if (t - w.lastSpawnAt >= w.spawnCooldownMs) {
    w.lastSpawnAt = t;
    w.spawned += 1;
    const pos = randomEdgeSpawn(world.width, world.height);
    // choose enemy type by wave
    let type: 'mask_dude' | 'ninja_frog' | 'pink_man' | 'virtual_guy' = 'mask_dude';
    if (w.index >= 4) type = (Math.random() < 0.4) ? 'virtual_guy' : (Math.random() < 0.5 ? 'pink_man' : (Math.random() < 0.6 ? 'ninja_frog' : 'mask_dude'));
    else if (w.index === 3) type = Math.random() < 0.6 ? 'pink_man' : (Math.random() < 0.7 ? 'ninja_frog' : 'mask_dude');
    else if (w.index === 2) type = Math.random() < 0.7 ? 'ninja_frog' : 'mask_dude';
    else type = 'mask_dude';

    const cfg = ENEMIES_CONFIG[type];
    world.enemies.push({ id: Math.random(), position: pos, radius: ENEMY_BASE.radius, speed: cfg.speed, hp: cfg.hp, maxHp: cfg.hp, type, damage: cfg.damage, frame: 0, lastFrameAtMs: t, facing: 'right' });
  }

  // move enemies toward player & animate
  for (const e of world.enemies) {
    const toPlayer = normalize({ x: player.position.x - e.position.x, y: player.position.y - e.position.y });
    e.position.x += toPlayer.x * e.speed;
    e.position.y += toPlayer.y * e.speed;
    if (toPlayer.x > 0.001) e.facing = 'right';
    else if (toPlayer.x < -0.001) e.facing = 'left';
    // animate 12-frame loop every 120ms
    const interval = 120;
    if (t - e.lastFrameAtMs >= interval) {
      e.lastFrameAtMs = t;
      e.frame = (e.frame + 1) % 12;
    }
  }

  // auto attack (slower than before)
  if (t - player.lastAttackAt >= Math.max(140, Math.floor(player.attackIntervalMs * 0.6))) {
    // find nearest in range
    let nearest: EnemyState | null = null;
    let nearestDist = Infinity;
    for (const e of world.enemies) {
      const d = distance(player.position, e.position);
      if (d < nearestDist && d <= player.attackRange) {
        nearest = e; nearestDist = d;
      }
    }
    if (nearest) {
      player.lastAttackAt = t;
      const dirTo = normalize({ x: nearest.position.x - player.position.x, y: nearest.position.y - player.position.y });
      world.projectiles.push({ id: Math.random(), position: { ...player.position }, velocity: { x: dirTo.x * PROJECTILE_DEFAULTS.speed, y: dirTo.y * PROJECTILE_DEFAULTS.speed }, radius: PROJECTILE_DEFAULTS.radius, damage: player.damage });
    }
  }

  // move projectiles
  for (const pr of world.projectiles) {
    pr.position.x += pr.velocity.x;
    pr.position.y += pr.velocity.y;
  }

  // collisions: projectile hits enemy
  for (const pr of world.projectiles) {
    for (const e of world.enemies) {
      const d = distance(pr.position, e.position);
      if (d <= pr.radius + e.radius) {
        e.hp -= pr.damage;
        pr.position.x = -9999; // mark for removal
        break;
      }
    }
  }
  world.projectiles = world.projectiles.filter(p => p.position.x > -1000 && p.position.y > -1000 && p.position.x < world.width + 1000 && p.position.y < world.height + 1000);
  // award money for kills and trigger dying animation (do not remove immediately)
  for (const e of world.enemies) {
    if (e.hp <= 0 && !e.dying) {
      player.money += (ENEMY_REWARD as any)[e.type] ?? 1;
      e.dying = true;
      e.disappearFrame = 0; // 0..4 -> dis_1..dis_5
      e.lastDisappearAtMs = t;
    }
  }
  // advance dying animation very fast; remove after last frame
  for (const e of world.enemies) {
    if (e.dying) {
      const interval = 50; // very fast
      if (t - (e.lastDisappearAtMs ?? 0) >= interval) {
        e.lastDisappearAtMs = t;
        e.disappearFrame = Math.min(4, (e.disappearFrame ?? 0) + 1);
      }
    }
  }
  world.enemies = world.enemies.filter(e => !e.dying || (e.disappearFrame ?? 0) < 4);

  // enemy touch player -> gradual damage (tick)
  let touching = false;
  for (const e of world.enemies) {
    const d = distance(player.position, e.position);
    if (d <= e.radius + player.radius) { touching = true; break; }
  }
  if (!('lastTouchDamageAt' in (player as any))) (player as any).lastTouchDamageAt = 0;
  const lastTouchDamageAt: number = (player as any).lastTouchDamageAt;
  if (touching && t - lastTouchDamageAt > 400) {
    (player as any).lastTouchDamageAt = t;
    player.hp = Math.max(0, player.hp - 1);
    if (player.hp <= 0) {
      // trigger death animation and keep phase until frames finish then set gameover
      if (player.anim !== 'die') {
        player.anim = 'die';
        player.frame = 0;
        player.lastFrameAtMs = t;
      }
    }
  }

  // timer reached -> victory phase (short celebration). No need to kill all enemies
  if (world.phase === 'playing' && (world.timerEndAt && t >= world.timerEndAt)) {
    player.money += 50 + w.index * 10;
    world.phase = 'victory';
    (world as any).victoryAt = t;
    // set victory animation for player
    player.anim = 'victory';
    player.frame = 0;
    player.lastFrameAtMs = t;
  }

  // victory animation timing: loop 33..36, then after delay -> shop
  if (world.phase === 'victory') {
    const start = (world as any).victoryAt as number | undefined;
    // advance frames
    const interval = 140;
    if (t - player.lastFrameAtMs >= interval) {
      player.lastFrameAtMs = t;
      player.frame = (player.frame + 1) % 4; // 0..3 -> 33..36
    }
    if (start && t - start > 1800) {
      // clear all enemies and projectiles before entering shop
      world.enemies = [];
      world.projectiles = [];
      world.phase = 'shop';
    }
  }

  // if dead animation reached final frame, end game
  if (player.anim === 'die' && player.frame >= 3) {
    world.phase = 'gameover';
  }
}

export function nextWave(world: WorldState) {
  const w = world.wave;
  // ensure battlefield is clean for the next wave
  world.enemies = [];
  world.projectiles = [];
  w.index += 1;
  w.enemiesToSpawn = Math.floor(24 + w.index * 6);
  w.spawned = 0;
  w.spawnCooldownMs = Math.max(120, Math.floor(w.spawnCooldownMs * 0.9));
  w.enemyHp = Math.floor(w.enemyHp * 1.2 + 4);
  w.enemySpeed = Math.min(3.5, w.enemySpeed + 0.12);
  // reset 30s timer each wave
  world.timerEndAt = now() + 30_000;
}

// Light UI polling to keep minimal values in sync without heavy React state churn
// (reserved) external UI sync util could be added here if needed in future


