import React from 'react';
import { useGame } from '@game/GameContext';

export const HUD: React.FC = () => {
  const { ui } = useGame();
  return (
    <div className="hud">
      <div className="hpbar">
        <div className="hpbar-fill" style={{ width: Math.max(0, Math.min(100, ui.hp / 10 * 100)) + '%' }} />
        <span className="hpbar-label">HP {ui.hp}</span>
      </div>
      <div className="hud-chip">⟐ Credits: {ui.money}</div>
      <div className="hud-chip">Wave: {ui.waveIndex}</div>
      <div className="hud-chip">Phase: {ui.phase}</div>
    </div>
  );
};


