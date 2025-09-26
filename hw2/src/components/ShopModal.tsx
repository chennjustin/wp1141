import React from 'react';
import { useGame, WeaponType } from '@game/GameContext';
import { playPurchase } from '@game/audio';
import { nextWave } from '@game/GameContext';
import { GameConfig } from '@game/config/GameConfig';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { ui, buyUpgrade, worldRef, setPhase } = useGame();
  
  // Get current player weapons
  const playerWeapons = worldRef.current.player.weapons;
  const weaponTypes: WeaponType[] = ['weapon_R1', 'weapon_R2', 'weapon_R3'];
  
  const items = weaponTypes.map(weaponType => {
    const config = GameConfig.getWeaponConfig(weaponType);
    const existingWeapon = playerWeapons.find(w => w.type === weaponType);
    const isOwned = !!existingWeapon;
    const canAfford = worldRef.current.player.money >= config.COST;
    const canBuy = playerWeapons.length < 6 || isOwned;
    
    return {
      key: weaponType,
      title: isOwned ? `${weaponType.replace('weapon', 'Weapon ')} Lv.${existingWeapon?.level + 1 || 1}` : `${weaponType.replace('weapon', 'Weapon ')}`,
      desc: isOwned ? `升級武器：傷害+3，射速+50ms，射程+20` : `傷害:${config.DAMAGE} 射速:${Math.round(1000/config.ATTACK_INTERVAL_MS)}/s 射程:${config.RANGE}`,
      cost: config.COST,
      disabled: !canAfford || !canBuy,
      isWeapon: true,
      owned: isOwned
    };
  });

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
            <div key={it.key} className={`card ${it.disabled ? 'disabled' : ''} ${it.isWeapon ? 'weapon-card' : ''}`}>
              <div className="card-header">
                <h3>{it.title}</h3>
                <div className="price-tag">{it.cost === 0 ? 'FREE' : it.cost}</div>
              </div>
              <div className="card-desc" style={{ opacity: it.disabled ? 0.6 : 1 }}>{it.desc}</div>
              {it.isWeapon && it.owned && (
                <div className="weapon-preview">
                  <img 
                    src={`/src/asset/${it.key.replace('_', '')}.png`} 
                    alt={it.key}
                    style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }}
                  />
                </div>
              )}
              <button
                className="btn-tech"
                disabled={it.disabled}
                onClick={() => { buyUpgrade(it.key as any); playPurchase(); }}
              >
                {it.isWeapon && it.owned ? '升級' : '購買'}
              </button>
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


