import React from 'react';
import { useGame } from '@game/GameContext';

export const StartScreen: React.FC = () => {
  const { setPhase } = useGame();
  return (
    <div className="start-screen">
      <div className="bg-animate" />
      <div className="start-content">
        <h1 className="glow-title">Starfall Survival</h1>
        <p className="subtitle">Waves of foes among the stars</p>
        <button className="btn-primary" onClick={() => setPhase('playing')}>Start Game</button>
      </div>
    </div>
  );
};


