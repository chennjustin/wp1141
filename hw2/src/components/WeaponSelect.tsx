import React, { useState, useEffect } from 'react';
import { useGame, WeaponType } from '../game/GameContext';
import { GameConfig } from '../game/config/GameConfig';
import { playActionClick, playReadyToClick, playTalking, playGameStart, playLobbyBgm, setUnderwaterEffect, stopAllBgm, playPlayingBgm } from '../game/audio';

export const WeaponSelect: React.FC = () => {
  const { selectWeapon } = useGame();
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);
  const [showReady, setShowReady] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const [characterFrame, setCharacterFrame] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const handleWeaponSelect = (weaponType: WeaponType) => {
    setSelectedWeapon(weaponType);
    setShowReady(true);
    // 播放點擊音效
    playActionClick();
    
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
      // 播放遊戲開始音效
      playGameStart();
      // 停止大廳背景音樂，開始遊戲背景音樂
      stopAllBgm();
      playPlayingBgm();
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

  // 背景音樂管理
  useEffect(() => {
    // 進入武器選擇頁面時播放大廳背景音樂
    playLobbyBgm();
    
    return () => {
      // 組件卸載時不停止背景音樂，因為可能切換到遊戲
    };
  }, []);

  // 水中效果管理
  useEffect(() => {
    if (showReady) {
      // 顯示準備開始模態時啟用水中效果
      setUnderwaterEffect(true);
    } else {
      // 關閉準備開始模態時關閉水中效果
      setUnderwaterEffect(false);
    }
  }, [showReady]);

  // 主角動畫循環
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacterFrame(prev => (prev + 1) % 8);
    }, 200); // 每200ms切換一幀
    return () => clearInterval(interval);
  }, []);

  // 打字機效果
  useEffect(() => {
    const fullText = '請從以下武器中選擇一個作為初始武器。之後每過一關，你可以使用金錢來升級或購買其他武器。';
    let currentIndex = 0;
    
    // 播放對話音效
    playTalking();
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // 每50ms打一個字

    return () => clearInterval(typingInterval);
  }, []);


  return (
    <div className="weapon-select-screen">
      <div className="bg-animate" />
      <div className="scanlines"></div>
      
      {/* 準備開始浮窗 */}
      {showReady && selectedWeapon && (
        <div className="ready-modal-overlay">
          <div className="ready-modal">
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
                <h2 className="weapon-name-glow">{getWeaponType(selectedWeapon)}</h2>
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
                <button 
                  className="btn-ready pulse" 
                  onClick={handleStartGame}
                  onMouseEnter={() => playReadyToClick()}
                >
                  <span className="btn-text">BEGIN MISSION</span>
                  <span className="btn-glow"></span>
                </button>
                <button 
                  className="btn-back" 
                  onMouseEnter={() => playReadyToClick()}
                  onClick={() => {
                    setShowReady(false);
                    playActionClick();
                  }}
                >
                  BACK TO SELECTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                  <h3 className="weapon-name">{getWeaponType(weaponType)}</h3>
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
                  onMouseEnter={() => playReadyToClick()}
                >
                  <span className="btn-text">SELECT</span>
                  <div className="btn-effect"></div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 主角吉祥物 */}
      <div className="character-mascot">
        <div className="speech-bubble">
          <div className="speech-bubble-content">
            <p className="typing-text">
              {displayedText}
              {isTyping && <span className="typing-cursor">|</span>}
            </p>
          </div>
          <div className="speech-bubble-tail"></div>
        </div>
        
        <div className="character-container">
          <div className="character-glow"></div>
          <img 
            src={`/src/asset/main_character/character_${25 + characterFrame}.png`}
            alt="Character"
            className="character-sprite"
          />
          <div className="character-particles">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="character-particle" style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getWeaponType = (weaponType: string): string => {
  switch (weaponType) {
    case 'weapon_R1': return 'Pistol';
    case 'weapon_R2': return 'Machine Gun';
    case 'weapon_R3': return 'Shotgun';
    default: return 'Unknown';
  }
};
