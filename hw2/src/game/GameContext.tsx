import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GameConfig } from './config/GameConfig';
import { EnemyState, GamePhase, PlayerState, ProjectileState, UIState, WaveState, WorldState } from './types';
import { distance, normalize, now, randomEdgeSpawn } from './utils';

// 武器類型定義
export type WeaponType = 'weapon_R1' | 'weapon_R2' | 'weapon_R3';

interface GameContextValue {
  worldRef: React.MutableRefObject<WorldState>;
  ui: UIState;
  setPhase: (p: GamePhase) => void;
  reset: () => void;
  buyUpgrade: (type: WeaponType) => void;
  selectWeapon: (weaponType: WeaponType) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function createInitialWorld(): WorldState {
  const width = typeof window !== 'undefined' ? window.innerWidth : 960;
  const height = typeof window !== 'undefined' ? window.innerHeight : 540;
  const player: PlayerState = {
    position: { x: width / 2, y: height / 2 },
    radius: GameConfig.PLAYER.RADIUS,
    speed: GameConfig.PLAYER.SPEED,
    hp: GameConfig.PLAYER.MAX_HP,
    maxHp: GameConfig.PLAYER.MAX_HP,
    money: 0,
    facing: 'right',
    anim: 'idle',
    frame: 0,
    lastFrameAtMs: 0,
    weapons: [],
    selectedWeaponIndex: 0,
    upgrades: {
      attackDamage: 0,
      attackSpeed: 0,
      maxHp: 0,
      moveSpeed: 0
    }
  };
  const wave: WaveState = {
    index: 1,
    enemiesToSpawn: 10,  // mask_dude starts with 10
    spawned: 0,
    spawnCooldownMs: 800,  // 生成間隔增加
    lastSpawnAt: 0,
    enemyHp: 25,  // 基礎敵人生命值
    enemySpeed: 1.0,  // 基礎敵人速度
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
    if (p === 'weaponSelect' && ui.phase === 'menu') {
      // reset world to initial state when starting from menu
      worldRef.current = createInitialWorld();
      const w = worldRef.current;
      w.phase = 'weaponSelect';
      w.player.position.x = w.width / 2;
      w.player.position.y = w.height / 2;
      syncUi();
    } else if (p === 'playing' && ui.phase === 'weaponSelect') {
      worldRef.current.phase = 'playing';
      const w = worldRef.current;
      // start 30s timer each time playing starts
      w.timerEndAt = now() + 30_000;
      syncUi();
    } else {
      worldRef.current.phase = p;
      syncUi();
    }
  };

  const reset = () => {
    worldRef.current = createInitialWorld();
    setUi({ hp: worldRef.current.player.hp, money: 0, waveIndex: 1, phase: 'menu' });
  };

  const buyUpgrade = (type: WeaponType) => {
    const w = worldRef.current;
    const p = w.player;
    
    const config = GameConfig.getWeaponConfig(type);
    if (p.money < config.COST) return;
    p.money -= config.COST;
    
    // Check if player already has this weapon
    const existingWeapon = p.weapons.find(w => w.type === type);
    if (existingWeapon) {
      // Upgrade existing weapon with traits
      existingWeapon.level += 1;
      existingWeapon.damage += 3;
      existingWeapon.attackIntervalMs = Math.max(200, existingWeapon.attackIntervalMs - 50);
      existingWeapon.range += 20;
      
      // 添加武器特質
      const weaponTraits = GameConfig.UPGRADES.WEAPON_TRAITS[type as keyof typeof GameConfig.UPGRADES.WEAPON_TRAITS];
      if (weaponTraits && weaponTraits.length > 0) {
        existingWeapon.traits = existingWeapon.traits || [];
        // 隨機選擇一個特質（如果還沒有的話）
        const availableTraits = weaponTraits.filter((trait: string) => !existingWeapon.traits?.includes(trait));
        if (availableTraits.length > 0) {
          const randomTrait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
          existingWeapon.traits.push(randomTrait);
          
          // 應用特質效果
          const traitConfig = GameConfig.UPGRADES.TRAITS[randomTrait as keyof typeof GameConfig.UPGRADES.TRAITS];
          if (traitConfig) {
            switch (randomTrait) {
              case 'ATTACK_DAMAGE':
                p.upgrades!.attackDamage = (p.upgrades!.attackDamage || 0) + traitConfig.value;
                break;
              case 'ATTACK_SPEED':
                p.upgrades!.attackSpeed = (p.upgrades!.attackSpeed || 0) + traitConfig.value;
                break;
                case 'MAX_HP':
                  p.upgrades!.maxHp = (p.upgrades!.maxHp || 0) + traitConfig.value;
                  p.maxHp = Math.floor(GameConfig.PLAYER.MAX_HP * (1 + p.upgrades!.maxHp));
                  p.hp = Math.min(p.hp, p.maxHp); // 確保生命值不超過最大值
                  break;
              case 'MOVE_SPEED':
                p.upgrades!.moveSpeed = (p.upgrades!.moveSpeed || 0) + traitConfig.value;
                break;
            }
          }
        }
      }
    } else {
      // Add new weapon (max 6 weapons)
      if (p.weapons.length < 6) {
        p.weapons.push({
          id: `${type}_${Date.now()}`,
          type: type,
          damage: config.DAMAGE,
          attackIntervalMs: config.ATTACK_INTERVAL_MS,
          range: config.RANGE,
          level: 1,
          lastAttackAt: 0,
          traits: []
        });
      }
    }
    syncUi();
  };

  const selectWeapon = (weaponType: WeaponType) => {
    const w = worldRef.current;
    const p = w.player;
    const config = GameConfig.getWeaponConfig(weaponType);
    
    p.weapons = [{
      id: `${weaponType}_${Date.now()}`,
      type: weaponType,
      damage: config.DAMAGE,
      attackIntervalMs: config.ATTACK_INTERVAL_MS,
      range: config.RANGE,
      level: 1,
      lastAttackAt: 0,
      traits: []
    }];
    p.selectedWeaponIndex = 0;
    
    // 選擇武器後開始第一關
    w.phase = 'playing';
    w.timerEndAt = now() + 30_000;
    // 確保第一關開始
    w.wave.index = 1;
    // 初始化第一關的敵人配置
    w.wave.enemiesToSpawn = Infinity;
    w.wave.spawned = 0;
    w.wave.spawnCooldownMs = 1000;
    w.wave.enemyHp = 15;
    w.wave.enemySpeed = 1.5;
    
    // 調試信息：顯示第一關開始
    console.log(`第一關開始，波次: ${w.wave.index}`);
    
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

  const value = useMemo<GameContextValue>(() => ({ worldRef, ui, setPhase, reset, buyUpgrade, selectWeapon }), [ui]);
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
    const start = world.victoryAt;
    if (start && t - start > 1800) {
      world.phase = 'shop';
    }
    return;
  }

  if (world.phase !== 'playing') return;

  // movement with upgrade effects
  const upgrades = player.upgrades || {};
  const moveSpeed = player.speed * (1 + (upgrades.moveSpeed || 0));
  const dir = { x: (input.right ? 1 : 0) - (input.left ? 1 : 0), y: (input.down ? 1 : 0) - (input.up ? 1 : 0) };
  const n = normalize(dir);
  player.position.x = Math.max(0, Math.min(world.width, player.position.x + n.x * moveSpeed));
  player.position.y = Math.max(0, Math.min(world.height, player.position.y + n.y * moveSpeed));

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
  
  // 無限生成模式：每一關的敵人都會無限生成直到關卡結束
  if (true) { // 永遠為真，實現無限生成
    // 檢查解鎖的敵人類型
    const availableTypes: string[] = [];
    if (w.index >= GameConfig.ENEMIES.mask_dude.UNLOCK_WAVE) availableTypes.push('mask_dude');
    if (w.index >= GameConfig.ENEMIES.ninja_frog.UNLOCK_WAVE) availableTypes.push('ninja_frog');
    if (w.index >= GameConfig.ENEMIES.pink_man.UNLOCK_WAVE) availableTypes.push('pink_man');
    if (w.index >= GameConfig.ENEMIES.virtual_guy.UNLOCK_WAVE) availableTypes.push('virtual_guy');
    
    // 調試信息：顯示當前波次和可用敵人類型
    console.log(`波次: ${w.index}, 可用敵人類型:`, availableTypes);
    
    // 為每個敵人類型檢查是否可以生成
    for (const type of availableTypes) {
      const enemyType = type as 'mask_dude' | 'ninja_frog' | 'pink_man' | 'virtual_guy';
      const cfg = GameConfig.getEnemyConfig(enemyType);
      
      // 檢查場上該類型敵人數量是否已達上限
      const currentTypeCount = world.enemies.filter(e => e.type === enemyType && !e.dying).length;
      
      if (currentTypeCount < cfg.MAX_ON_SCREEN) {
        // 檢查該類型的生成間隔
        const lastSpawnKey = `lastSpawnAt_${enemyType}`;
        const lastSpawnAt = (w as any)[lastSpawnKey] || 0;
        const timeSinceLastSpawn = t - lastSpawnAt;
        
        console.log(`檢查 ${enemyType}：場上數量 ${currentTypeCount}/${cfg.MAX_ON_SCREEN}，間隔 ${timeSinceLastSpawn}ms/${cfg.SPAWN_INTERVAL_MS}ms`);
        
        if (timeSinceLastSpawn >= cfg.SPAWN_INTERVAL_MS) {
          // 更新該類型的生成時間
          (w as any)[lastSpawnKey] = t;
          w.spawned += 1;
          console.log(`生成敵人: ${enemyType}`);
        
          const waveIndex = w.index;
          
          // 計算動態數值（使用波次縮放）
          const scaling = 1 + (waveIndex - 1) * GameConfig.GAME.WAVE_SCALING;
          const currentHp = Math.floor((cfg.BASE_HP + (waveIndex - 1) * cfg.HP_PER_WAVE) * scaling);
          const currentSpeed = (cfg.BASE_SPEED + (waveIndex - 1) * cfg.SPEED_PER_WAVE) * scaling;
      
      if (enemyType === 'mask_dude') {
        // mask_dude: 從外面跑進來，不閃光，直接出現
        const pos = randomEdgeSpawn(world.width, world.height);
        world.enemies.push({ 
          id: Math.random(), 
          position: pos, 
          radius: cfg.RADIUS, 
          speed: currentSpeed, 
          hp: currentHp, 
          maxHp: currentHp, 
          type: enemyType, 
          damage: cfg.DAMAGE, 
          frame: 0, 
          lastFrameAtMs: t, 
          facing: 'right',
          // 特殊屬性
          flashPosition: null,
          flashStartTime: undefined,
          dashTarget: null,
          dashCooldown: 0,
          lastDashAt: 0
        });
      } else {
        // ninja_frog, pink_man, virtual_guy: 先閃光1秒，然後在場上隨機出現
        const flashPos = {
          x: Math.random() * (world.width - 100) + 50,
          y: Math.random() * (world.height - 100) + 50
        };
        
        world.enemies.push({ 
          id: Math.random(), 
          position: flashPos, 
          radius: cfg.RADIUS, 
          speed: currentSpeed, 
          hp: currentHp, 
          maxHp: currentHp, 
          type: enemyType, 
          damage: cfg.DAMAGE, 
          frame: 0, 
          lastFrameAtMs: t, 
          facing: 'right',
          // 特殊屬性 - 閃光效果
          flashPosition: flashPos,
          flashStartTime: t,
          dashTarget: null,
          dashCooldown: enemyType === 'pink_man' ? 3000 : 0, // pink_man 有衝刺冷卻
          lastDashAt: 0
        });
      }
        }
      }
    }
  }

  // move enemies with special behaviors
  for (const e of world.enemies) {
    if (e.dying) continue;
    
    // 閃光效果處理（除了mask_dude，其他敵人都會閃光）
    if (e.flashPosition && e.flashStartTime && e.type !== 'mask_dude') {
      const flashDuration = 1000; // 閃光持續時間1秒
      if (t - e.flashStartTime < flashDuration) {
        // 還在閃光階段，不移動
        continue;
      }
    }
    
    // 特殊移動邏輯
    if (e.type === 'pink_man') {
      // pink_man: 衝刺行為
      if (e.dashTarget) {
        // 正在衝刺
        const toTarget = normalize({ x: e.dashTarget.x - e.position.x, y: e.dashTarget.y - e.position.y });
        e.position.x += toTarget.x * e.speed * 2; // 衝刺速度加倍
        e.position.y += toTarget.y * e.speed * 2;
        
        // 檢查是否到達目標
        const distToTarget = Math.hypot(e.dashTarget.x - e.position.x, e.dashTarget.y - e.position.y);
        if (distToTarget < 20) {
          e.dashTarget = null;
          e.lastDashAt = t;
        }
      } else if (e.lastDashAt && e.dashCooldown && t - e.lastDashAt >= e.dashCooldown) {
        // 可以進行下一次衝刺
        e.dashTarget = { x: player.position.x, y: player.position.y };
      }
    } else {
      // 其他敵人：正常追蹤玩家
      const toPlayer = normalize({ x: player.position.x - e.position.x, y: player.position.y - e.position.y });
      e.position.x += toPlayer.x * e.speed;
      e.position.y += toPlayer.y * e.speed;
    }
    
    // 更新面向方向
    const toPlayer = normalize({ x: player.position.x - e.position.x, y: player.position.y - e.position.y });
    if (toPlayer.x > 0.001) e.facing = 'right';
    else if (toPlayer.x < -0.001) e.facing = 'left';
    
    // animate 12-frame loop every 120ms
    const interval = 120;
    if (t - e.lastFrameAtMs >= interval) {
      e.lastFrameAtMs = t;
      e.frame = (e.frame + 1) % 12;
    }
  }

  // auto attack using weapons
  if (player.weapons.length > 0) {
    for (const weapon of player.weapons) {
      // 計算最終攻擊間隔（考慮攻擊速度升級）
      const finalAttackInterval = weapon.attackIntervalMs / (1 + (player.upgrades?.attackSpeed || 0));
      
      if (t - weapon.lastAttackAt >= finalAttackInterval) {
        // Calculate weapon position first
        const weaponIndex = player.weapons.indexOf(weapon);
        const positionOffset = GameConfig.WEAPON_POSITIONS[weaponIndex as keyof typeof GameConfig.WEAPON_POSITIONS] || { x: 0, y: 0 };
        const weaponX = player.position.x + positionOffset.x;
        const weaponY = player.position.y + positionOffset.y;
        
        // Find nearest enemy from weapon position (same logic as rendering)
        let nearest: EnemyState | null = null;
        let nearestDist = Infinity;
        for (const e of world.enemies) {
          if (e.dying) continue;
          const dist = Math.hypot(e.position.x - weaponX, e.position.y - weaponY);
          if (dist <= weapon.range && dist < nearestDist) {
            nearest = e;
            nearestDist = dist;
          }
        }
        
        if (nearest) {
          weapon.lastAttackAt = t;
          
          // 應用升級效果
          const upgrades = player.upgrades || {};
          const finalDamage = weapon.damage * (1 + (upgrades.attackDamage || 0));
          
          // 使用與渲染完全相同的武器方向計算邏輯
          const dx = nearest.position.x - weaponX;
          const dy = nearest.position.y - weaponY;
          const rawAngle = Math.atan2(dy, dx);
          
          let weaponAngle = 0;
          let isMirrored = false;
          
          if (dx < 0) {
            // Enemy on left side: mirror the weapon horizontally
            isMirrored = true;
            // Calculate angle as if enemy is on the right (inverted dx)
            weaponAngle = Math.atan2(dy, -dx);
          } else {
            // Enemy on right side: normal rotation
            isMirrored = false;
            weaponAngle = rawAngle;
          }
          
          // 強制限制角度在 -90° 到 +90° 範圍內
          weaponAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, weaponAngle));
          
          // 計算槍口位置 - 確保子彈從槍口發射
          const muzzleDistance = 20; // 武器中心到槍口的距離
          let muzzleX, muzzleY;
          
          if (isMirrored) {
            // 鏡像時，槍口仍然在原始精靈的右側
            // 但需要調整 X 方向來考慮鏡像
            muzzleX = weaponX - Math.cos(weaponAngle) * muzzleDistance;
            muzzleY = weaponY + Math.sin(weaponAngle) * muzzleDistance;
          } else {
            // 正常情況：槍口在武器精靈的右側
            muzzleX = weaponX + Math.cos(weaponAngle) * muzzleDistance;
            muzzleY = weaponY + Math.sin(weaponAngle) * muzzleDistance;
          }
          
          // 獲取武器配置
          const weaponConfig = GameConfig.getWeaponConfig(weapon.type);
          const pelletCount = weaponConfig.PELLETS || 1;
          
          // 發射多個彈丸
          for (let i = 0; i < pelletCount; i++) {
            // 計算朝向敵人的方向
            const dirToEnemy = normalize({ 
              x: nearest.position.x - muzzleX, 
              y: nearest.position.y - muzzleY 
            });
            
            let pelletDirX = dirToEnemy.x;
            let pelletDirY = dirToEnemy.y;
            
            // 如果是多彈丸武器，添加散射
            if (pelletCount > 1) {
              const spreadAngle = (i - (pelletCount - 1) / 2) * 0.2; // 散射角度
              const cos = Math.cos(spreadAngle);
              const sin = Math.sin(spreadAngle);
              const newX = pelletDirX * cos - pelletDirY * sin;
              const newY = pelletDirX * sin + pelletDirY * cos;
              pelletDirX = newX;
              pelletDirY = newY;
            }
            
            world.projectiles.push({ 
              id: Math.random(), 
              position: { x: muzzleX, y: muzzleY }, 
              velocity: { x: pelletDirX * GameConfig.PROJECTILE.SPEED, y: pelletDirY * GameConfig.PROJECTILE.SPEED }, 
              radius: GameConfig.PROJECTILE.RADIUS, 
              damage: finalDamage 
            });
          }
        }
      }
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
      const enemyConfig = GameConfig.getEnemyConfig(e.type);
      player.money += enemyConfig.REWARD;
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
  let touchingEnemy: EnemyState | null = null;
  for (const e of world.enemies) {
    const d = distance(player.position, e.position);
    if (d <= e.radius + player.radius) { 
      touching = true; 
      touchingEnemy = e;
      break; 
    }
  }
  if (!('lastTouchDamageAt' in (player as any))) (player as any).lastTouchDamageAt = 0;
  const lastTouchDamageAt: number = (player as any).lastTouchDamageAt;
  if (touching && touchingEnemy && t - lastTouchDamageAt > 400) {
    (player as any).lastTouchDamageAt = t;
    // 使用敵人的實際傷害值
    player.hp = Math.max(0, player.hp - touchingEnemy.damage);
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
    world.victoryAt = t;
    // set victory animation for player
    player.anim = 'victory';
    player.frame = 0;
    player.lastFrameAtMs = t;
  }

  // victory animation timing: loop 33..36, then after delay -> shop
  if (world.phase === 'victory') {
    const start = world.victoryAt;
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
  // 增加波次索引
  w.index += 1;
  
  // 調試信息：顯示波次更新
  console.log(`nextWave 被調用，新波次: ${w.index}`);
  
  // 無限生成模式：移除敵人數量限制
  w.enemiesToSpawn = Infinity; // 無限生成
  
  w.spawned = 0;
  w.spawnCooldownMs = 1000; // 基礎生成間隔，會被各敵人類型覆蓋
  w.enemyHp = 15; // 基礎HP，會被各敵人類型覆蓋
  w.enemySpeed = 1.5; // 基礎速度，會被各敵人類型覆蓋
  // reset 30s timer each wave
  world.timerEndAt = now() + 30_000;
}