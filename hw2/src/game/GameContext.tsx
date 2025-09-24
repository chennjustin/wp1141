import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ENEMY_BASE, PLAYER_DEFAULTS, PROJECTILE_DEFAULTS } from './constants';
import { EnemyState, GamePhase, PlayerState, ProjectileState, UIState, WaveState, WorldState } from './types';
import { distance, normalize, now, randomEdgeSpawn } from './utils';

interface GameContextValue {
  worldRef: React.MutableRefObject<WorldState>;
  ui: UIState;
  setPhase: (p: GamePhase) => void;
  reset: () => void;
  buyUpgrade: (type: 'damage' | 'attackSpeed' | 'range') => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function createInitialWorld(): WorldState {
  const player: PlayerState = {
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    radius: PLAYER_DEFAULTS.radius,
    speed: PLAYER_DEFAULTS.speed,
    hp: PLAYER_DEFAULTS.maxHp,
    maxHp: PLAYER_DEFAULTS.maxHp,
    money: 0,
    damage: PLAYER_DEFAULTS.damage,
    attackIntervalMs: PLAYER_DEFAULTS.attackIntervalMs,
    attackRange: PLAYER_DEFAULTS.attackRange,
    lastAttackAt: 0,
  };
  const wave: WaveState = {
    index: 1,
    enemiesToSpawn: 8,
    spawned: 0,
    spawnCooldownMs: 900,
    lastSpawnAt: 0,
    enemyHp: ENEMY_BASE.hp,
    enemySpeed: ENEMY_BASE.speed,
  };
  return {
    phase: 'menu',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    player,
    enemies: [],
    projectiles: [],
    wave,
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const worldRef = useRef<WorldState>(createInitialWorld());
  const [ui, setUi] = useState<UIState>({ hp: worldRef.current.player.hp, money: 0, waveIndex: worldRef.current.wave.index, phase: 'menu' });

  const syncUi = () => {
    const w = worldRef.current;
    setUi({ hp: w.player.hp, money: w.player.money, waveIndex: w.wave.index, phase: w.phase });
  };

  const setPhase = (p: GamePhase) => {
    worldRef.current.phase = p;
    if (p === 'playing' && ui.phase === 'menu') {
      // initialize UI at start of game
      syncUi();
    }
    syncUi();
  };

  const reset = () => {
    worldRef.current = createInitialWorld();
    setUi({ hp: worldRef.current.player.hp, money: 0, waveIndex: 1, phase: 'menu' });
  };

  const buyUpgrade = (type: 'damage' | 'attackSpeed' | 'range') => {
    const w = worldRef.current;
    const p = w.player;
    const costs = { damage: 50, attackSpeed: 60, range: 70 } as const;
    const cost = costs[type];
    if (p.money < cost) return;
    p.money -= cost;
    if (type === 'damage') p.damage += 5;
    if (type === 'attackSpeed') p.attackIntervalMs = Math.max(200, p.attackIntervalMs - 80);
    if (type === 'range') p.attackRange += 40;
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
          prev.phase === w.phase
        ) return prev;
        return { hp: w.player.hp, money: w.player.money, waveIndex: w.wave.index, phase: w.phase };
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
  if (world.phase !== 'playing') return;
  const t = now();
  const { player } = world;

  // movement
  const dir = { x: (input.right ? 1 : 0) - (input.left ? 1 : 0), y: (input.down ? 1 : 0) - (input.up ? 1 : 0) };
  const n = normalize(dir);
  player.position.x = Math.max(0, Math.min(world.width, player.position.x + n.x * player.speed));
  player.position.y = Math.max(0, Math.min(world.height, player.position.y + n.y * player.speed));

  // spawn enemies per wave
  const w = world.wave;
  if (w.spawned < w.enemiesToSpawn && t - w.lastSpawnAt >= w.spawnCooldownMs) {
    w.lastSpawnAt = t;
    w.spawned += 1;
    const pos = randomEdgeSpawn(world.width, world.height);
    world.enemies.push({ id: Math.random(), position: pos, radius: ENEMY_BASE.radius, speed: w.enemySpeed, hp: w.enemyHp, maxHp: w.enemyHp });
  }

  // move enemies toward player
  for (const e of world.enemies) {
    const toPlayer = normalize({ x: player.position.x - e.position.x, y: player.position.y - e.position.y });
    e.position.x += toPlayer.x * e.speed;
    e.position.y += toPlayer.y * e.speed;
  }

  // auto attack
  if (t - player.lastAttackAt >= player.attackIntervalMs) {
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
  world.enemies = world.enemies.filter(e => e.hp > 0);

  // enemy touch player -> damage lethal
  for (const e of world.enemies) {
    const d = distance(player.position, e.position);
    if (d <= e.radius + player.radius) {
      player.hp = 0;
      world.phase = 'gameover';
    }
  }

  // wave complete -> shop phase
  if (world.phase === 'playing' && w.spawned >= w.enemiesToSpawn && world.enemies.length === 0) {
    player.money += 50 + w.index * 10;
    world.phase = 'shop';
  }
}

export function nextWave(world: WorldState) {
  const w = world.wave;
  w.index += 1;
  w.enemiesToSpawn = Math.floor(8 + w.index * 1.8);
  w.spawned = 0;
  w.spawnCooldownMs = Math.max(280, Math.floor(w.spawnCooldownMs * 0.92));
  w.enemyHp = Math.floor(w.enemyHp * 1.2 + 4);
  w.enemySpeed = Math.min(3.5, w.enemySpeed + 0.12);
}

// Light UI polling to keep minimal values in sync without heavy React state churn
// (reserved) external UI sync util could be added here if needed in future


