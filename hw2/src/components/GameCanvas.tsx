import React, { useEffect, useRef } from 'react';
import { useGame } from '@game/GameContext';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@game/constants';
import { nextWave, stepWorld } from '@game/GameContext';
import { playShoot, playHit, playBgm } from '@game/audio';

export const GameCanvas: React.FC = () => {
  const { worldRef, ui, setPhase } = useGame();
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
      if (world.player.hp < beforeHp) playHit();
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
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [ui.phase]);

  const render = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const world = worldRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background grid
    // gradient background + starfield
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0b122b');
    grad.addColorStop(1, '#1a2558');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 80; i++) {
      const sx = (i * 97 + performance.now() * 0.02) % canvas.width;
      const sy = (i * 61) % canvas.height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // draw player
    const p = world.player;
    const playerGradient = ctx.createRadialGradient(p.position.x, p.position.y, 2, p.position.x, p.position.y, p.radius + 6);
    playerGradient.addColorStop(0, '#7bf5b3');
    playerGradient.addColorStop(1, 'rgba(123,245,179,0)');
    ctx.fillStyle = '#3ddc84';
    ctx.shadowColor = '#7bf5b3';
    ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.radius + 1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = playerGradient; ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.radius + 8, 0, Math.PI * 2); ctx.fill();

    // draw range (faint)
    ctx.strokeStyle = 'rgba(74,222,128,0.15)';
    ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.attackRange, 0, Math.PI * 2); ctx.stroke();

    // draw enemies
    for (const e of world.enemies) {
      const eg = ctx.createLinearGradient(e.position.x - e.radius, e.position.y - e.radius, e.position.x + e.radius, e.position.y + e.radius);
      eg.addColorStop(0, '#ff7a7a');
      eg.addColorStop(1, '#b91c1c');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.moveTo(e.position.x, e.position.y - e.radius);
      ctx.lineTo(e.position.x + e.radius, e.position.y + e.radius);
      ctx.lineTo(e.position.x - e.radius, e.position.y + e.radius);
      ctx.closePath();
      ctx.fill();
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
          setPhase('menu');
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


