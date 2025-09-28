import React from 'react';
import { useGame, WeaponType } from '@game/GameContext';
import { playPurchase, playUpgrade, playActionClick, playReadyToClick, setUnderwaterEffect } from '@game/audio';
import { nextWave } from '@game/GameContext';
import { GameConfig } from '@game/config/GameConfig';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { ui, buyUpgrade, worldRef, setPhase } = useGame();
  
  // 商店水中效果管理
  React.useEffect(() => {
    // 進入商店時啟用水中效果
    setUnderwaterEffect(true);
    
    return () => {
      // 離開商店時關閉水中效果
      setUnderwaterEffect(false);
    };
  }, []);
  
  // Get current player weapons
  const playerWeapons = worldRef.current.player.weapons;
  const weaponTypes: WeaponType[] = ['weapon_R1', 'weapon_R2', 'weapon_R3'];
  
  const items = weaponTypes.map(weaponType => {
    const config = GameConfig.getWeaponConfig(weaponType);
    const existingWeapon = playerWeapons.find(w => w.type === weaponType);
    const isOwned = !!existingWeapon;
    const weaponLevel = existingWeapon ? existingWeapon.level : 0;
    const dynamicCost = config.COST + (weaponLevel * 20); // 動態升級費用
    const canAfford = worldRef.current.player.money >= dynamicCost;
    const canBuy = playerWeapons.length < 6 || isOwned;
    
    // 武器顯示名稱映射
    const getWeaponDisplayName = (weaponType: string): string => {
      switch (weaponType) {
        case 'weapon_R1': return 'Pistol';
        case 'weapon_R2': return 'Machine Gun';
        case 'weapon_R3': return 'Shotgun';
        default: return weaponType;
      }
    };

    return {
      key: weaponType,
      title: isOwned ? `${getWeaponDisplayName(weaponType)} Lv.${weaponLevel}` : getWeaponDisplayName(weaponType),
      upgradeInfo: isOwned ? `升級後：傷害+3，射速-50ms，射程+20` : `傷害:${config.DAMAGE} 射速:${Math.round(1000/config.ATTACK_INTERVAL_MS)}/s 射程:${config.RANGE}`,
      cost: dynamicCost,
      disabled: !canAfford || !canBuy,
      isWeapon: true,
      owned: isOwned
    };
  });

  return (
    <div className="workshop-backdrop">
      <div className="workshop-container">
        {/* Header Section */}
        <div className="workshop-header">
          <h1 className="workshop-title">Neon Workshop</h1>
          <div className="credits-panel">
            <div className="credit-icon">⟐</div>
            <div className="credit-amount">{ui.money}</div>
          </div>
        </div>

        {/* Weapon Cards Grid */}
        <div className="weapons-grid">
          {items.map((it) => (
            <div key={it.key} className={`weapon-card ${it.disabled ? 'disabled' : ''}`}>
              {/* Weapon Icon */}
              <div className="weapon-icon-container">
                {it.isWeapon && it.owned && (
                  <img 
                    src={`/src/asset/${it.key.replace('_', '')}.png`} 
                    alt={it.key}
                    className="weapon-icon-image"
                  />
                )}
              </div>

              {/* Weapon Info */}
              <div className="weapon-info">
                <h3 className="weapon-name">{it.title}</h3>
                <div className="upgrade-details">
                  <div className="detail-item">
                    <span className="detail-label">升級效果:</span>
                    <span className="detail-value">{it.upgradeInfo}</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                className="upgrade-button"
                disabled={it.disabled}
                onMouseEnter={() => playReadyToClick()}
                onClick={() => { 
                  buyUpgrade(it.key as any); 
                  if (it.isWeapon && it.owned) {
                    playUpgrade();
                  } else {
                    playPurchase();
                  }
                }}
              >
                <span className="button-text">{it.isWeapon && it.owned ? '升級' : '購買'}</span>
                <span className="button-cost">{it.cost === 0 ? 'FREE' : it.cost}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="workshop-footer">
          <button 
            className="footer-button primary" 
            onMouseEnter={() => playReadyToClick()}
            onClick={() => { 
              nextWave(worldRef.current); 
              setPhase('playing'); 
              playActionClick();
            }}
          >
            Start Next Wave (Enter)
          </button>
          <button 
            className="footer-button secondary" 
            onMouseEnter={() => playReadyToClick()}
            onClick={() => { 
              setPhase('menu'); 
              playActionClick();
            }}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};


