import React, { useState, useEffect } from 'react';
import { useGame, WeaponType } from '../game/GameContext';
import { GameConfig } from '../game/config/GameConfig';

export const WeaponSelect: React.FC = () => {
  const { selectWeapon } = useGame();
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);
  const [showReady, setShowReady] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);

  const handleWeaponSelect = (weaponType: WeaponType) => {
    setSelectedWeapon(weaponType);
    setShowReady(true);
    
    // 創建粒子效果
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    }));
    setParticles(newParticles);
  };

  const handleStartGame = () => {
    if (selectedWeapon) {
      selectWeapon(selectedWeapon);
    }
  };

  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy
        })).filter(p => p.x > -50 && p.x < window.innerWidth + 50 && p.y > -50 && p.y < window.innerHeight + 50));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [particles]);

  if (showReady && selectedWeapon) {
    return (
      <div className="ready-screen">
        <div className="bg-animate" />
        <div className="particles">
          {particles.map(p => (
            <div key={p.id} className="particle" style={{ 
              left: p.x, 
              top: p.y,
              '--delay': `${p.id * 0.1}s` 
            } as React.CSSProperties} />
          ))}
        </div>
        
        <div className="ready-content">
          <div className="weapon-showcase">
            <div className="weapon-glow">
              <img 
                src={`/src/asset/${selectedWeapon.replace('_', '')}.png`} 
                alt={selectedWeapon}
                className="weapon-image"
              />
            </div>
            <h1 className="ready-title typing">WEAPON SELECTED</h1>
            <h2 className="weapon-name-glow">{selectedWeapon.replace('weapon', 'Weapon ')}</h2>
          </div>
          
          <div className="ready-stats">
            {(() => {
              const config = GameConfig.getWeaponConfig(selectedWeapon);
              return (
                <>
                  <div className="stat-row">
                    <span className="stat-icon">⚡</span>
                    <span className="stat-label">Damage:</span>
                    <span className="stat-value">{config.DAMAGE}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-label">Fire Rate:</span>
                    <span className="stat-value">{Math.round(1000 / config.ATTACK_INTERVAL_MS)}/s</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-label">Range:</span>
                    <span className="stat-value">{config.RANGE}</span>
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="ready-actions">
            <button className="btn-ready pulse" onClick={handleStartGame}>
              <span className="btn-text">BEGIN MISSION</span>
              <span className="btn-glow"></span>
            </button>
            <button className="btn-back" onClick={() => setShowReady(false)}>
              BACK TO SELECTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weapon-select-screen">
      <div className="bg-animate" />
      <div className="scanlines"></div>
      
      <div className="weapon-select-content">
        <div className="header-section">
          <h1 className="glow-title typing">ARMORY</h1>
          <p className="subtitle">Choose your weapon for the upcoming battle</p>
          <div className="title-underline"></div>
        </div>
        
        <div className="weapon-grid">
          {(['weapon_R1', 'weapon_R2', 'weapon_R3'] as WeaponType[]).map((weaponType, index) => {
            const config = GameConfig.getWeaponConfig(weaponType);
            return (
              <div key={weaponType} className="weapon-card" style={{ '--delay': `${index * 0.2}s` } as React.CSSProperties}>
                <div className="card-glow"></div>
                <div className="weapon-preview">
                  <div className="weapon-bg"></div>
                  <img 
                    src={`/src/asset/${weaponType.replace('_', '')}.png`} 
                    alt={weaponType}
                    className="weapon-icon"
                  />
                  <div className="weapon-particles">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="particle-small" style={{ '--i': i } as React.CSSProperties} />
                    ))}
                  </div>
                </div>
                
                <div className="weapon-info">
                  <h3 className="weapon-name">{weaponType.replace('weapon', 'Weapon ')}</h3>
                  <div className="weapon-type">{getWeaponType(weaponType)}</div>
                </div>
                
                <div className="weapon-stats">
                  <div className="stat">
                    <span className="stat-icon">⚡</span>
                    <span className="stat-label">Damage</span>
                    <span className="stat-value">{config.DAMAGE}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-label">Fire Rate</span>
                    <span className="stat-value">{Math.round(1000 / config.ATTACK_INTERVAL_MS)}/s</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-label">Range</span>
                    <span className="stat-value">{config.RANGE}</span>
                  </div>
                </div>
                
                <button 
                  className="btn-select"
                  onClick={() => handleWeaponSelect(weaponType as WeaponType)}
                >
                  <span className="btn-text">SELECT</span>
                  <div className="btn-effect"></div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getWeaponType = (weaponType: string): string => {
  switch (weaponType) {
    case 'weapon_R1': return 'Assault Rifle';
    case 'weapon_R2': return 'Submachine Gun';
    case 'weapon_R3': return 'Shotgun';
    default: return 'Unknown';
  }
};
