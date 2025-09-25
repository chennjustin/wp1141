import React from 'react';
import { useGame } from '@game/GameContext';

export const HUD: React.FC = () => {
  const { ui } = useGame();
  return (
    <div className="hud">
      <div className="hud-chip">❤️ HP: {ui.hp}</div>
      <div className="hud-chip">⏱ {ui.timeLeftSec ?? 0}s</div>
      <div className="hud-chip">⟐ {ui.money}</div>
      <div className="hud-chip">Wave {ui.waveIndex}</div>
    </div>
  );
};


