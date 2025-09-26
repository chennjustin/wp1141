import React from 'react';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { ShopModal } from './ShopModal';
import { WeaponSelect } from './WeaponSelect';
import { useGame } from '@game/GameContext';
import { StartScreen } from './Screens';

export const Game: React.FC = () => {
  const { ui } = useGame();

  return (
    <div className="game-root">
      {ui.phase === 'menu' && <StartScreen />}
      {ui.phase === 'weaponSelect' && <WeaponSelect />}
      {(ui.phase === 'playing' || ui.phase === 'victory' || ui.phase === 'shop' || ui.phase === 'gameover') && (
        <>
          <GameCanvas />
          <HUD />
        </>
      )}
      {ui.phase === 'shop' && <ShopModal onClose={() => {}} />}
    </div>
  );
};


