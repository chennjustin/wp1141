import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '@game/GameContext';
import { playActionClick, playReadyToClick, playTalking, stopTalking, playLobbyBgm, setUnderwaterEffect } from '@game/audio';

export const StartScreen: React.FC = () => {
  const { setPhase } = useGame();
  const [showHelp, setShowHelp] = useState(false);
  const [fx, setFx] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterFrame, setCharacterFrame] = useState(0);
  const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  // HOW TO PLAY 文案
  const howToPlayTexts = [
    {
      title: "🎮 How to Play",
      content: "基本操作\n\n使用 WASD 或 方向鍵 移動角色。\n武器會自動瞄準並攻擊最近的敵人。\n每一波持續 30 秒，目標是生存到底。"
    },
    {
      title: "⚔️ 關於武器",
      content: "遊戲中有多種武器（目前就三種，期待以後更新）：步槍、手槍和散彈槍。\n每次過關後可以用手上的錢錢選擇升級武器或購買新武器。"
    },
    {
      title: "👾 敵人類型",
      content: "每次過關後，下一關會出現新的敵人。\n已有的敵人也會變得更加強大，基礎屬性將會上升，出現的數量也會更多。\n特殊敵人會有技能或預警效果，要小心應對！"
    },
    {
      title: "⭐ 成長與升級",
      content: "擊敗敵人可以獲得金錢與經驗。\n在升級時，你的角色會獲得更多生命值和更快移動速度，並回復部分生命值。\n使用金錢可以在商店裡升級武器或購買新的裝備。"
    },
  ];

  // 角色動畫
  useEffect(() => {
    if (showHelp) {
      const interval = setInterval(() => {
        setCharacterFrame(prev => (prev + 1) % 3);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [showHelp]);

  // 打字特效和音效管理
  useEffect(() => {
    if (showHelp && currentStep < howToPlayTexts.length) {
      setIsTyping(true);
      setDisplayedText('');
      const currentText = howToPlayTexts[currentStep].content;
      let index = 0;
      
      // 開始打字音效
      playTalking();
      
      const typingInterval = setInterval(() => {
        if (index < currentText.length) {
          setDisplayedText(currentText.substring(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          // 打字結束時停止音效
          stopTalking();
          clearInterval(typingInterval);
        }
      }, 30); // 加快打字速度

      return () => {
        clearInterval(typingInterval);
        // 停止音效
        stopTalking();
      };
    }
  }, [showHelp, currentStep]);

  // 大廳背景音樂管理
  useEffect(() => {
    console.log('🎵 Screens component mounted, attempting to play lobby BGM...');
    // 進入大廳時播放大廳背景音樂
    playLobbyBgm();
    
    return () => {
      // 組件卸載時不停止背景音樂，因為可能切換到武器選擇
    };
  }, []);

  // HOW TO PLAY 水中效果管理
  useEffect(() => {
    if (showHelp) {
      // 顯示 HOW TO PLAY 時啟用水中效果
      setUnderwaterEffect(true);
    } else {
      // 關閉 HOW TO PLAY 時關閉水中效果
      setUnderwaterEffect(false);
    }
  }, [showHelp]);

  return (
    <div className="start-screen">
      <div className="bg-animate" style={{ backgroundImage: 'url(/src/asset/lobby.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="start-content">
        <h1 className="glow-title typing">PIXEL SCI-FI</h1>
        <p className="subtitle">Survive the void. Upgrade your ship.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-tech pulse"
            onMouseEnter={() => playReadyToClick()}
            onClick={() => {
              setFx(true);
              setTimeout(() => setPhase('weaponSelect'), 300);
              setTimeout(() => setFx(false), 800);
              playActionClick();
            }}
          >Start Game</button>
          <button 
            className="btn-tech" 
            onMouseEnter={() => playReadyToClick()}
            onClick={() => {
              setShowHelp(true);
              playActionClick();
            }}
          >
            How to Play
          </button>
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
        <div className="howto-backdrop">
          <div className="howto-dynamic-modal">
            {/* 主角角色 */}
            <div className="howto-character">
              <img 
                src={`/src/asset/main_character/character_${characterFrame === 0 ? '1' : characterFrame === 1 ? '2' : '42'}.png`}
                alt="Character"
                className="character-sprite"
                onError={(e) => {
                  console.log('Image load error:', e.currentTarget.src);
                  // 如果圖片載入失敗，嘗試其他路徑
                  if (e.currentTarget.src.includes('main_character_1')) {
                    e.currentTarget.src = '/src/asset/main_character_1.png';
                  }
                }}
              />
            </div>

            {/* 文字框 */}
            <div className="howto-textbox">
              <div className="textbox-header">
                <h3 className="textbox-title">
                  {currentStep < howToPlayTexts.length ? howToPlayTexts[currentStep].title : ''}
                </h3>
              </div>
              <div className="textbox-content">
                <div className="typing-text">
                  {displayedText}
                  {isTyping && <span className="typing-cursor">|</span>}
                </div>
              </div>
              <div className="textbox-footer">
                {currentStep < howToPlayTexts.length - 1 ? (
                  <>
                    <button 
                      className="btn-textbox secondary"
                      onMouseEnter={() => playReadyToClick()}
                      onClick={() => {
                        if (currentStep > 0) {
                          setCurrentStep(currentStep - 1);
                          playActionClick();
                        }
                      }}
                      disabled={currentStep === 0}
                    >
                      回上一頁
                    </button>
                    <button 
                      className="btn-textbox primary"
                      onMouseEnter={() => playReadyToClick()}
                      onClick={() => {
                        setCurrentStep(currentStep + 1);
                        playActionClick();
                      }}
                    >
                      繼續
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn-textbox secondary"
                      onMouseEnter={() => playReadyToClick()}
                      onClick={() => {
                        if (currentStep > 0) {
                          setCurrentStep(currentStep - 1);
                          playActionClick();
                        }
                      }}
                    >
                      回上一頁
                    </button>
                    <button 
                      className="btn-textbox primary"
                      onMouseEnter={() => playReadyToClick()}
                      onClick={() => {
                        setShowHelp(false);
                        setCurrentStep(0);
                        setDisplayedText('');
                        playActionClick();
                      }}
                    >
                      確定
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


