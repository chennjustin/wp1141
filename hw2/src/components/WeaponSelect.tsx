import React from 'react';
import { useGame, WeaponType } from '../game/GameContext';
import { GameConfig } from '../game/config/GameConfig';

export const WeaponSelect: React.FC = () => {
  const { selectWeapon } = useGame();

  const handleWeaponSelect = (weaponType: WeaponType) => {
    selectWeapon(weaponType);
  };

  return (
    <div className="weapon-select-screen">
      <div className="bg-animate" style={{ backgroundImage: 'url(/src/asset/lobby.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="weapon-select-content">
        <h1 className="glow-title typing">Choose Your Weapon</h1>
        <p className="subtitle">Select your starting weapon for the battle ahead</p>
        
        <div className="weapon-grid">
          {(['weapon_R1', 'weapon_R2', 'weapon_R3'] as WeaponType[]).map((weaponType) => {
            const config = GameConfig.getWeaponConfig(weaponType);
            return (
            <div key={weaponType} className="weapon-card">
              <div className="weapon-preview">
                <img 
                  src={`/src/asset/${weaponType.replace('_', '')}.png`} 
                  alt={weaponType}
                  style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }}
                />
              </div>
              <h3 className="weapon-name">{weaponType.replace('weapon', 'Weapon ')}</h3>
              <div className="weapon-stats">
                <div className="stat">
                  <span className="stat-label">Damage:</span>
                  <span className="stat-value">{config.DAMAGE}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Fire Rate:</span>
                  <span className="stat-value">{Math.round(1000 / config.ATTACK_INTERVAL_MS)}/s</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Range:</span>
                  <span className="stat-value">{config.RANGE}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Cost:</span>
                  <span className="stat-value">{config.COST === 0 ? 'FREE' : config.COST}</span>
                </div>
              </div>
              <button 
                className="btn-tech"
                 onClick={() => handleWeaponSelect(weaponType as WeaponType)}
              >
                {config.COST === 0 ? 'Select' : 'Buy'}
              </button>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
