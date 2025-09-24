import React, { useMemo, useState } from 'react';
import { Game } from '@components/Game';
import { GameProvider, useGame } from '@game/GameContext';
import { GamePhase } from '@game/types';

export const AppInner: React.FC = () => {
  const { ui, setPhase } = useGame();
  const [showShop, setShowShop] = useState(false);

  useMemo(() => {
    setShowShop(ui.phase === 'shop');
  }, [ui.phase]);

  return (<Game />);
};

export const App: React.FC = () => (
  <GameProvider>
    <AppInner />
  </GameProvider>
);


