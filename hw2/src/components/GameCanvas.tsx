import React, { useEffect, useRef } from 'react';
import { useGame } from '@game/GameContext';
import { nextWave, stepWorld } from '@game/GameContext';
import { 
  playWeaponR1, 
  playWeaponR2, 
  playWeaponR3, 
  playPlayerHit, 
  playEnemyDeath, 
  playDash, 
  playVictory, 
  playGameOver, 
  playGameStart,
  playBgm 
} from '@game/audio';
import { GameConfig } from '@game/config/GameConfig';
import { now } from '@game/utils';

// preload sprite frames for main character
const idleFrames = [
  new Image(),
  new Image(),
];
idleFrames[0].src = '/src/asset/main_character/character_1.png';
idleFrames[1].src = '/src/asset/main_character/character_2.png';

const walkFrames = [
  new Image(), new Image(), new Image(), new Image(),
];
walkFrames[0].src = '/src/asset/main_character/character_9.png';
walkFrames[1].src = '/src/asset/main_character/character_10.png';
walkFrames[2].src = '/src/asset/main_character/character_11.png';
walkFrames[3].src = '/src/asset/main_character/character_12.png';

const dieFrames = [
  new Image(), new Image(), new Image(), new Image(),
];
dieFrames[0].src = '/src/asset/main_character/character_37.png';
dieFrames[1].src = '/src/asset/main_character/character_38.png';
dieFrames[2].src = '/src/asset/main_character/character_39.png';
dieFrames[3].src = '/src/asset/main_character/character_40.png';

const victoryFrames = [
  new Image(), new Image(), new Image(), new Image(),
];
victoryFrames[0].src = '/src/asset/main_character/character_33.png';
victoryFrames[1].src = '/src/asset/main_character/character_34.png';
victoryFrames[2].src = '/src/asset/main_character/character_35.png';
victoryFrames[3].src = '/src/asset/main_character/character_36.png';

// preload weapon images
const weaponImages = {
  weapon_R1: new Image(),
  weapon_R1_shoot: new Image(),
  weapon_R2: new Image(),
  weapon_R2_shoot: new Image(),
  weapon_R3: new Image(),
  weapon_R3_shoot: new Image(),
};
weaponImages.weapon_R1.src = '/src/asset/weaponR1.png';
weaponImages.weapon_R1_shoot.src = '/src/asset/weaponR1_shoot.png';
weaponImages.weapon_R2.src = '/src/asset/weaponR2.png';
weaponImages.weapon_R2_shoot.src = '/src/asset/weaponR2_shoot.png';
weaponImages.weapon_R3.src = '/src/asset/weaponR3.png';
weaponImages.weapon_R3_shoot.src = '/src/asset/weaponR3_shoot.png';

// 武器類型到圖像鍵的映射函數
const getWeaponImageKey = (weaponType: string) => {
  return weaponType as keyof typeof weaponImages;
};

export const GameCanvas: React.FC = () => {
  const { worldRef, ui, setPhase, reset } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef({ up: false, down: false, left: false, right: false });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase();
      if (['arrowup','w'].includes(key)) inputRef.current.up = down;
      if (['arrowdown','s'].includes(key)) inputRef.current.down = down;
      if (['arrowleft','a'].includes(key)) inputRef.current.left = down;
      if (['arrowright','d'].includes(key)) inputRef.current.right = down;
    };
    const kd = (e: KeyboardEvent) => handleKey(e, true);
    const ku = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  useEffect(() => {
    const loop = () => {
      const world = worldRef.current;
      const beforeHp = world.player.hp;
      stepWorld(world, inputRef.current);
      if (world.player.hp < beforeHp) {
        playPlayerHit();
        const canvas = canvasRef.current; if (canvas) {
          canvas.classList.remove('shake');
          void canvas.offsetWidth; // reflow to restart animation
          canvas.classList.add('shake');
          setTimeout(() => canvas.classList.remove('shake'), 300);
        }
      }
      render();
      if (world.phase === 'shop') {
        // pause loop but keep frame drawn; shop UI will show
        rafRef.current = requestAnimationFrame(render);
        return; // stop stepping until resumed
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    if (ui.phase === 'playing') { playBgm(); start(); }
    if (ui.phase === 'victory') { start(); }
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [ui.phase]);

  const render = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const world = worldRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background image
    const bgImg = new Image();
    bgImg.src = '/src/asset/lobby2.png';
    if (bgImg.complete) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      // fallback gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0b122b');
      grad.addColorStop(1, '#1a2558');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // animated starfield overlay
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 80; i++) {
      const sx = (i * 97 + performance.now() * 0.02) % canvas.width;
      const sy = (i * 61) % canvas.height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // draw player sprite
    const p = world.player;
    const frames = p.anim === 'idle' ? idleFrames : (p.anim === 'walk' ? walkFrames : (p.anim === 'die' ? dieFrames : victoryFrames));
    const frameImg = frames[p.frame % frames.length];
    const scale = 3.5;
    const imgW = frameImg.width * scale || 64;
    const imgH = frameImg.height * scale || 64;
    const drawX = p.position.x - imgW / 2;
    const drawY = p.position.y - imgH / 2;

    ctx.save();
    if (p.facing === 'left') {
      ctx.translate(p.position.x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-p.position.x, 0);
    }
    if (frameImg.complete) {
      ctx.drawImage(frameImg, drawX, drawY, imgW, imgH);
    } else {
      // fallback: circle if image not ready yet
      ctx.fillStyle = '#3ddc84';
      ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.radius + 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // draw weapons
    for (let i = 0; i < p.weapons.length; i++) {
      const weapon = p.weapons[i];
      const weaponImg = weaponImages[getWeaponImageKey(weapon.type)];
      const shootImg = weaponImages[getWeaponImageKey(`${weapon.type}_shoot`)];
      
      // Check if weapon just fired (within configured duration)
      const justFired = now() - weapon.lastAttackAt < GameConfig.ANIMATION.WEAPON_SHOOT_DURATION;
      // Use shoot image when firing, otherwise use base image
      const imgToUse = (justFired && shootImg && shootImg.complete) ? shootImg : weaponImg;
      
      // Draw if either selected image is ready or base image is ready
      if ((imgToUse && imgToUse.complete) || (weaponImg && weaponImg.complete)) {
        // Calculate weapon position based on weapon index using config
        const positionOffset = GameConfig.WEAPON_POSITIONS[i as keyof typeof GameConfig.WEAPON_POSITIONS] || { x: 0, y: 0 };
        const weaponX = p.position.x + positionOffset.x;
        const weaponY = p.position.y + positionOffset.y;
        
        // Find nearest enemy for weapon direction
        let targetAngle = 0;
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        for (const enemy of world.enemies) {
          if (enemy.dying) continue;
          const dist = Math.hypot(enemy.position.x - weaponX, enemy.position.y - weaponY);
          if (dist <= weapon.range && dist < nearestDist) {
            nearestEnemy = enemy;
            nearestDist = dist;
          }
        }
        
        // Brotato-style weapon orientation calculation
        let weaponAngle = 0;
        let isMirrored = false;
        
        if (nearestEnemy) {
          const dx = nearestEnemy.position.x - weaponX;
          const dy = nearestEnemy.position.y - weaponY;
          const rawAngle = Math.atan2(dy, dx);
          
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
        } else {
          // No target: weapon faces player's movement direction
          if (p.facing === 'left') {
            // Player facing left: weapon points left (mirrored)
            isMirrored = true;
            weaponAngle = 0; // Point straight left when mirrored
          } else {
            // Player facing right: weapon points right
            isMirrored = false;
            weaponAngle = 0; // Point straight right
          }
        }
        
        // Direct rotation to target angle (no smooth interpolation)
        const finalAngle = weaponAngle;
        
        // Calculate weapon dimensions
        const weaponScale = GameConfig.WEAPON_TYPE_SCALES[weapon.type as keyof typeof GameConfig.WEAPON_TYPE_SCALES] || 0.03;
        const weaponW = (imgToUse.width || 32) * weaponScale;
        const weaponH = (imgToUse.height || 32) * weaponScale;
        
        // Brotato-style weapon rendering
        ctx.save();
        
        // 1. Translate to weapon pivot point (player's hand)
        ctx.translate(weaponX, weaponY);
        
        // 2. Apply horizontal mirror if enemy is on the left
        if (isMirrored) {
          ctx.scale(-1, 1);
        }
        
        // 3. Apply rotation around the pivot point
        ctx.rotate(finalAngle);
        
        // 4. Draw weapon centered at the pivot point
        ctx.drawImage(imgToUse, -weaponW / 2, -weaponH / 2, weaponW, weaponH);
        
        ctx.restore();
      }
    }

    // draw weapon ranges (faint)
    ctx.strokeStyle = 'rgba(74,222,128,0.15)';
    for (const weapon of p.weapons) {
      ctx.beginPath(); 
      ctx.arc(p.position.x, p.position.y, weapon.range, 0, Math.PI * 2); 
      ctx.stroke();
    }

    // draw enemies or their disappear animation
    for (const e of world.enemies) {
      (window as any).__enemyCache = (window as any).__enemyCache || new Map<string, HTMLImageElement>();
      const cache: Map<string, HTMLImageElement> = (window as any).__enemyCache;

      // 檢查是否在閃光階段
      const isFlashing = e.flashPosition && e.flashStartTime && e.type !== 'mask_dude';
      const flashDuration = 1000; // 1秒閃光
      const flashProgress = isFlashing ? Math.min(1, (now() - (e.flashStartTime || 0)) / flashDuration) : 1;

      let sprite: HTMLImageElement | undefined;
      if (e.dying) {
        const disIdx = Math.min(4, Math.max(0, (e.disappearFrame ?? 0)));
        const cacheKey = `dis_${disIdx}`;
        sprite = cache.get(cacheKey) as HTMLImageElement | undefined;
        if (!sprite) {
          const img = new Image();
          img.src = `/src/asset/enemy/enemy_disappear/dis_${disIdx + 1}.png`;
          cache.set(cacheKey, img);
          sprite = img;
        }
      } else {
        const cacheKey = `${e.type}_${e.frame % 12}`;
        sprite = cache.get(cacheKey) as HTMLImageElement | undefined;
        if (!sprite) {
          const idx = (e.frame % 12) + 1;
          const img = new Image();
          img.src = `/src/asset/enemy/${e.type}/${e.type}_${idx}.png`;
          cache.set(cacheKey, img);
          sprite = img;
        }
      }

      const size = 48; // 增大敵人圖檔顯示大小
      const dw = size;
      const dh = size;
      const dx = e.position.x - dw / 2;
      const dy = e.position.y - dh / 2;
      
      ctx.save();
      
      // 閃光效果渲染
      if (isFlashing && flashProgress < 1) {
        // 閃光階段：只顯示fancy閃光效果，不顯示敵人
        if (e.type === 'pink_man') {
          // pink_man 特殊閃光效果：紅色/粉色系
          const flashSize = 50 + Math.sin(now() * 0.03) * 15; // 更大的閃爍
          const flashAlpha = 0.9 + Math.sin(now() * 0.04) * 0.3; // 更強烈的閃爍
          
          // 外圈閃光 - 紅色系
          const outerGradient = ctx.createRadialGradient(e.position.x, e.position.y, 0, e.position.x, e.position.y, flashSize);
          outerGradient.addColorStop(0, `rgba(255, 100, 100, ${flashAlpha * 0.4})`);
          outerGradient.addColorStop(0.5, `rgba(255, 0, 150, ${flashAlpha * 0.3})`);
          outerGradient.addColorStop(1, `rgba(255, 0, 150, 0)`);
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, flashSize, 0, Math.PI * 2);
          ctx.fill();
          
          // 內圈閃光 - 粉色系
          const innerGradient = ctx.createRadialGradient(e.position.x, e.position.y, 0, e.position.x, e.position.y, flashSize * 0.7);
          innerGradient.addColorStop(0, `rgba(255, 150, 200, ${flashAlpha * 0.9})`);
          innerGradient.addColorStop(1, `rgba(255, 0, 150, 0)`);
          ctx.fillStyle = innerGradient;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, flashSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
          
          // 中心點 - 亮粉色
          ctx.fillStyle = `rgba(255, 200, 255, ${flashAlpha})`;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 其他敵人的閃光效果：青色系
          const flashSize = 40 + Math.sin(now() * 0.02) * 10; // 閃爍大小
          const flashAlpha = 0.8 + Math.sin(now() * 0.03) * 0.2; // 閃爍透明度
          
          // 外圈閃光
          const outerGradient = ctx.createRadialGradient(e.position.x, e.position.y, 0, e.position.x, e.position.y, flashSize);
          outerGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.3})`);
          outerGradient.addColorStop(0.5, `rgba(0, 255, 255, ${flashAlpha * 0.2})`);
          outerGradient.addColorStop(1, `rgba(0, 255, 255, 0)`);
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, flashSize, 0, Math.PI * 2);
          ctx.fill();
          
          // 內圈閃光
          const innerGradient = ctx.createRadialGradient(e.position.x, e.position.y, 0, e.position.x, e.position.y, flashSize * 0.6);
          innerGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.8})`);
          innerGradient.addColorStop(1, `rgba(0, 255, 255, 0)`);
          ctx.fillStyle = innerGradient;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, flashSize * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          // 中心點
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.beginPath();
          ctx.arc(e.position.x, e.position.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // 正常階段：顯示敵人
        if (!e.dying && e.facing === 'left') {
          ctx.translate(e.position.x, 0);
          ctx.scale(-1, 1);
          ctx.translate(-e.position.x, 0);
        }
        if (sprite && (sprite as HTMLImageElement).complete) {
          ctx.globalAlpha = e.dying ? 0.95 : 1;
          ctx.drawImage(sprite as HTMLImageElement, dx, dy, dw, dh);
          ctx.globalAlpha = 1;
        }
        // 圖片未載入完成時不顯示任何東西（包括紅色圓圈）
      }
      
      ctx.restore();
    }

    // draw projectiles
    for (const pr of world.projectiles) {
      const bg = ctx.createRadialGradient(pr.position.x, pr.position.y, 0, pr.position.x, pr.position.y, pr.radius * 3);
      bg.addColorStop(0, 'rgba(96,165,250,0.6)');
      bg.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(pr.position.x, pr.position.y, pr.radius * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9cc9ff';
      ctx.shadowColor = '#9cc9ff';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(pr.position.x, pr.position.y, pr.radius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // draw damage numbers
    for (const dn of world.damageNumbers) {
      const age = now() - dn.startTime;
      const alpha = Math.max(0, 1 - age / 2000); // 2秒淡出
      const scale = 1 + Math.sin(age * 0.01) * 0.1; // 輕微脈動效果
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillStyle = '#ff6b6b';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 描邊
      ctx.strokeText(dn.damage.toString(), dn.position.x, dn.position.y);
      // 填充
      ctx.fillText(dn.damage.toString(), dn.position.x, dn.position.y);
      
      ctx.restore();
    }

    // draw level up text - 簡約設計
    for (const lt of world.levelUpTexts) {
      const age = now() - lt.startTime;
      const alpha = Math.max(0, 1 - age / 2000); // 2秒淡出
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold 16px 'Orbitron', monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText('LEVEL UP!', lt.position.x, lt.position.y);
      
      ctx.restore();
    }

    if (world.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('遊戲結束 - 按 Enter 返回主頁', canvas.width / 2, canvas.height / 2);
    }

    if (world.phase === 'victory') {
      // fancy "You Win" style text with pixel effects
      const t = performance.now();
      const pulse = 1 + Math.sin(t * 0.008) * 0.12;
      const hue = (t * 0.08) % 360;
      const sparkle = Math.sin(t * 0.02) * 0.3;
      
      ctx.save();
      // Victory title with pixel glow
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.95)`;
      ctx.shadowColor = `hsla(${hue}, 90%, 50%, 1)`;
      ctx.shadowBlur = 40;
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.floor(52 * pulse)}px 'Press Start 2P', monospace`;
      ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 30);
      
      // Subtitle with sparkle effect
      ctx.font = '600 18px "Orbitron", monospace';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255,255,255,${0.8 + sparkle})`;
      ctx.fillText('Entering Neon Workshop...', canvas.width / 2, canvas.height / 2 + 15);
      
      // Pixel particles around text
      for (let i = 0; i < 8; i++) {
        const angle = (t * 0.003 + i * 0.785) % (Math.PI * 2);
        const radius = 80 + Math.sin(t * 0.01 + i) * 20;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        ctx.fillStyle = `hsla(${(hue + i * 45) % 360}, 80%, 60%, 0.7)`;
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    // fit to window
    const resize = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const w = window.innerWidth; const h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      const world = worldRef.current; world.width = w; world.height = h;
      render();
    };
    resize();
    window.addEventListener('resize', resize);
    const onEnter = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'enter') {
        const w = worldRef.current;
        if (w.phase === 'gameover') {
          // reset entire world and UI back to initial state
          reset();
        } else if (w.phase === 'shop') {
          // resume next wave
          nextWave(w);
          w.phase = 'playing';
          setPhase('playing');
        }
      }
    };
    window.addEventListener('keydown', onEnter);
    return () => { window.removeEventListener('keydown', onEnter); window.removeEventListener('resize', resize); };
  }, [setPhase]);

  return (
    <canvas ref={canvasRef} className="game-canvas" />
  );
};


