import React from 'react';
import { useGame } from '@game/GameContext';

export const HUD: React.FC = () => {
  const { ui } = useGame();
  const expPercentage = (ui.experience / ui.experienceToNext) * 100;
  const hpPercentage = (ui.hp / 100) * 100; // 假設最大HP為100，需要根據實際情況調整
  
  return (
    <div className="hud-container">
      {/* 左側狀態 */}
      <div className="hud-left">
        <div className="hud-section">
          <div className="hud-icon">❤️</div>
          <div className="hud-content">
            <div className="hud-label">HP</div>
            <div className="hud-value">{ui.hp}</div>
          </div>
        </div>
        
        <div className="hud-section">
          <div className="hud-icon">⏱</div>
          <div className="hud-content">
            <div className="hud-label">TIME</div>
            <div className="hud-value">{ui.timeLeftSec ?? 0}s</div>
          </div>
        </div>
      </div>

      {/* 中央經驗值條 */}
      <div className="hud-center">
        <div className="experience-container">
          <div className="experience-header">
            <span className="level-badge">LV.{ui.level}</span>
            <span className="experience-text">{ui.experience}/{ui.experienceToNext}</span>
          </div>
          <div className="experience-bar">
            <div className="experience-fill" style={{ width: `${expPercentage}%` }}></div>
            <div className="experience-glow"></div>
          </div>
        </div>
      </div>

      {/* 右側狀態 */}
      <div className="hud-right">
        <div className="hud-section">
          <div className="hud-icon">💎</div>
          <div className="hud-content">
            <div className="hud-label">MONEY</div>
            <div className="hud-value">{ui.money}</div>
          </div>
        </div>
        
        <div className="hud-section">
          <div className="hud-icon">🌊</div>
          <div className="hud-content">
            <div className="hud-label">WAVE</div>
            <div className="hud-value">{ui.waveIndex}</div>
          </div>
        </div>
      </div>
    </div>
  );
};


