import React, { useMemo, useState } from 'react';
import { useGame } from '@game/GameContext';

export const StartScreen: React.FC = () => {
  const { setPhase } = useGame();
  const [showHelp, setShowHelp] = useState(false);
  const [fx, setFx] = useState(false);
  const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  return (
    <div className="start-screen">
      <div className="bg-animate" style={{ backgroundImage: 'url(/src/asset/lobby.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="start-content">
        <h1 className="glow-title typing">PIXEL SCI-FI</h1>
        <p className="subtitle">Survive the void. Upgrade your ship.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-tech pulse"
            onClick={() => {
              setFx(true);
              setTimeout(() => setPhase('weaponSelect'), 300);
              setTimeout(() => setFx(false), 800);
            }}
          >Start Game</button>
          <button className="btn-tech" onClick={() => setShowHelp(true)}>How to Play</button>
        </div>
        {fx && (
          <div className="particles">
            {particles.map(i => (
              <span key={i} className="particle" style={{ ['--i' as any]: i } as any} />
            ))}
          </div>
        )}
      </div>
      {showHelp && (
        <div className="shop-backdrop" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="typing small">How to Play</h3>
            <ul className="howto">
              <li>WASD / 方向鍵 移動</li>
              <li>自動攻擊最近的敵人</li>
              <li>存活 30 秒 即可過關</li>
              <li>商店購買升級：攻擊、攻速、射程、最大生命</li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn-tech" onClick={() => setShowHelp(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


