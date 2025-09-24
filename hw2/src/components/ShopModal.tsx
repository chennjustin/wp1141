import React from 'react';
import { useGame } from '@game/GameContext';
import { nextWave } from '@game/GameContext';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { ui, buyUpgrade, worldRef, setPhase } = useGame();
  const items = [
    { key: 'damage', title: '攻擊力 +5', desc: '每次射擊造成更高傷害', cost: 50 },
    { key: 'attackSpeed', title: '攻速 提升', desc: '縮短自動攻擊間隔', cost: 60 },
    { key: 'range', title: '射程 +40', desc: '更遠距離自動鎖定敵人', cost: 70 },
    { key: 'weapon2', title: '新武器（占位）', desc: '未來內容，敬請期待', cost: 9999, disabled: true },
  ] as const;

  return (
    <div className="shop-backdrop">
      <div className="shop">
        <h2>商店（按 Enter 開始下一波）</h2>
        <div>當前金錢：{ui.money}</div>
        <div className="grid">
          {items.map((it) => (
            <div key={it.key} className="card">
              <h3>{it.title}</h3>
              <div style={{ opacity: (('disabled' in it) && it.disabled) ? 0.6 : 1 }}>{it.desc}</div>
              <div>價格：{it.cost}</div>
              <button
                disabled={(('disabled' in it) && it.disabled) || worldRef.current.player.money < it.cost}
                onClick={() => buyUpgrade(it.key as any)}
              >購買</button>
            </div>
          ))}
        </div>
        <div className="footer">
          <button onClick={() => { nextWave(worldRef.current); setPhase('playing'); }}>繼續（開始下一波：回車）</button>
          <button onClick={() => { setPhase('menu'); }}>返回主頁</button>
        </div>
      </div>
    </div>
  );
};


