import React, { useMemo, useState } from 'react';
import { GameCanvas } from '@components/GameCanvas';
import { HUD } from '@components/HUD';
import { ShopModal } from '@components/ShopModal';
import { GameProvider, useGame } from '@game/GameContext';
import { GamePhase } from '@game/types';

export const AppInner: React.FC = () => {
  const { ui, setPhase } = useGame();
  const [showShop, setShowShop] = useState(false);

  useMemo(() => {
    setShowShop(ui.phase === 'shop');
  }, [ui.phase]);

  return (
    <div className="app">
      {ui.phase === 'menu' && (
        <div className="menu">
          <h1>Survival Wave</h1>
          <button onClick={() => setPhase('playing')}>开始游戏</button>
        </div>
      )}

      {(ui.phase === 'playing' || ui.phase === 'shop' || ui.phase === 'gameover') && (
        <>
          <GameCanvas />
          <HUD />
        </>
      )}

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
    </div>
  );
};

export const App: React.FC = () => (
  <GameProvider>
    <AppInner />
  </GameProvider>
);


