import React, { useEffect, useRef } from 'react';
import { useGame } from '@game/GameContext';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@game/constants';
import { nextWave, stepWorld } from '@game/GameContext';

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
      stepWorld(world, inputRef.current);
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

    if (ui.phase === 'playing') start();
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [ui.phase]);

  const render = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const world = worldRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background grid
    ctx.fillStyle = '#0f1630';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1b274a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // draw player
    const p = world.player;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2); ctx.fill();

    // draw range (faint)
    ctx.strokeStyle = 'rgba(74,222,128,0.15)';
    ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.attackRange, 0, Math.PI * 2); ctx.stroke();

    // draw enemies
    for (const e of world.enemies) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(e.position.x, e.position.y, e.radius, 0, Math.PI * 2); ctx.fill();
    }

    // draw projectiles
    ctx.fillStyle = '#60a5fa';
    for (const pr of world.projectiles) {
      ctx.beginPath(); ctx.arc(pr.position.x, pr.position.y, pr.radius, 0, Math.PI * 2); ctx.fill();
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
    return () => window.removeEventListener('keydown', onEnter);
  }, [setPhase]);

  return (
    <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
  );
};


