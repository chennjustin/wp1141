import React, { useEffect, useRef } from 'react';
import { useGame } from '@game/GameContext';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@game/constants';
import { nextWave, stepWorld } from '@game/GameContext';
import { playShoot, playHit, playBgm } from '@game/audio';

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
        playHit();
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

    // draw range (faint)
    ctx.strokeStyle = 'rgba(74,222,128,0.15)';
    ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.attackRange, 0, Math.PI * 2); ctx.stroke();

    // draw enemies or their disappear animation
    for (const e of world.enemies) {
      (window as any).__enemyCache = (window as any).__enemyCache || new Map<string, HTMLImageElement>();
      const cache: Map<string, HTMLImageElement> = (window as any).__enemyCache;

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

      const size = 32; // smaller enemies
      const dw = size;
      const dh = size;
      const dx = e.position.x - dw / 2;
      const dy = e.position.y - dh / 2;
      ctx.save();
      if (!e.dying && e.facing === 'left') {
        ctx.translate(e.position.x, 0);
        ctx.scale(-1, 1);
        ctx.translate(-e.position.x, 0);
      }
      if (sprite && (sprite as HTMLImageElement).complete) {
        ctx.globalAlpha = e.dying ? 0.95 : 1;
        ctx.drawImage(sprite as HTMLImageElement, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = '#ff7a7a';
        ctx.beginPath();
        ctx.arc(e.position.x, e.position.y, e.radius + 4, 0, Math.PI * 2);
        ctx.fill();
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


