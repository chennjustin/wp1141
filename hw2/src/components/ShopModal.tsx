import React from 'react';
import { useGame } from '@game/GameContext';
import { playPurchase } from '@game/audio';
import { nextWave } from '@game/GameContext';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { ui, buyUpgrade, worldRef, setPhase } = useGame();
  const items = [
    { key: 'damage', title: '攻擊力 +5', desc: '每次射擊造成更高傷害', cost: 50 },
    { key: 'attackSpeed', title: '攻速 提升', desc: '縮短自動攻擊間隔', cost: 60 },
    { key: 'range', title: '射程 +40', desc: '更遠距離自動鎖定敵人', cost: 70 },
    { key: 'maxHp', title: '最大生命 +2', desc: '提升最大 HP，並回復 2 點生命', cost: 80 },
    { key: 'weapon2', title: '新武器（占位）', desc: '未來內容，敬請期待', cost: 9999, disabled: true },
  ] as const;

  return (
    <div className="shop-backdrop">
      <div className="shop">
        <h2 className="typing">Neon Workshop</h2>
        <div className="credits-display">
          <span className="credit-icon">⟐</span>
          <span className="credit-amount">{ui.money}</span>
        </div>
        <div className="grid">
          {items.map((it) => (
            <div key={it.key} className={`card ${(('disabled' in it) && it.disabled) ? 'disabled' : ''}`}>
              <div className="card-header">
                <h3>{it.title}</h3>
                <div className="price-tag">{it.cost}</div>
              </div>
              <div className="card-desc" style={{ opacity: ((('disabled' in it) && it.disabled) ? 0.6 : 1) }}>{it.desc}</div>
              <button
                className="btn-tech"
                disabled={(('disabled' in it) && it.disabled) || worldRef.current.player.money < it.cost}
                onClick={() => { buyUpgrade(it.key as any); playPurchase(); }}
              >購買</button>
            </div>
          ))}
        </div>
        <div className="footer">
          <button className="btn-tech" onClick={() => { nextWave(worldRef.current); setPhase('playing'); }}>Start Next Wave (Enter)</button>
          <button className="btn-tech" onClick={() => { setPhase('menu'); }}>Back to Lobby</button>
        </div>
      </div>
    </div>
  );
};


