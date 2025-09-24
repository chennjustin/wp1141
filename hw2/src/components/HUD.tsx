import React from 'react';
import { useGame } from '@game/GameContext';

export const HUD: React.FC = () => {
  const { ui } = useGame();
  return (
    <div className="hud">
      <div>生命: {ui.hp}</div>
      <div>金錢: {ui.money}</div>
      <div>輪次: {ui.waveIndex}</div>
      <div>階段: {ui.phase}</div>
    </div>
  );
};


