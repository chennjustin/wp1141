// Audio system with integrated sound effects
// Usage: call playShoot(), playHit(), playPurchase(), playBgm(), etc.

let audioEnabled = true;
let bgmStarted = false;

export function setAudioEnabled(enabled: boolean) { audioEnabled = enabled; }

// Audio file paths
const AUDIO_FILES = {
  action_click: '/src/asset/audio/action-click.wav',
  ready_to_click: '/src/asset/audio/ready_to_click.wav',
  talking: '/src/asset/audio/talking.wav',
  dash: '/src/asset/audio/dash.wav',
  gunshot_silencer: '/src/asset/audio/gunshot-with-silencer.wav',
  sniper_shot: '/src/asset/audio/sniper-shot-muffled.wav',
  synthetic_gunshot: '/src/asset/audio/synthetic_gunshot.wav',
  player_hit: '/src/asset/audio/player_hit.wav',
  enemy_death: '/src/asset/audio/enemy_death.wav',
  upgrade: '/src/asset/audio/upgrade.wav',
  purchase: '/src/asset/audio/purchase.wav',
  victory: '/src/asset/audio/victory.wav',
  gameover: '/src/asset/audio/gameover.wav',
  gamestart: '/src/asset/audio/gamestart.wav',
  lobby_bg: '/src/asset/audio/lobby_background.mp3',
  playing_bgm: '/src/asset/audio/playing_bgm.mp3'
};

// 音效管理
let currentTalkingAudio: HTMLAudioElement | null = null;

// 背景音樂管理
let currentBgm: HTMLAudioElement | null = null;
let bgmContext: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let underwaterFilter: BiquadFilterNode | null = null;

// Helper function to play audio with volume control
function playAudio(src: string, volume: number = 0.7): HTMLAudioElement | null {
  if (!audioEnabled) return null;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {}); // Ignore errors for better UX
    return audio;
  } catch (error) {
    console.warn('Audio playback failed:', error);
    return null;
  }
}

// 停止所有音效
export function stopAllAudio(): void {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  currentTalkingAudio = null;
}

// UI Sound Effects
export function playActionClick() {
  playAudio(AUDIO_FILES.action_click, 0.9);
}

export function playReadyToClick() {
  playAudio(AUDIO_FILES.ready_to_click, 0.7);
}

export function playTalking() {
  // 停止之前的 talking 音效
  if (currentTalkingAudio) {
    currentTalkingAudio.pause();
    currentTalkingAudio.currentTime = 0;
  }
  currentTalkingAudio = playAudio(AUDIO_FILES.talking, 0.6);
}

export function stopTalking() {
  if (currentTalkingAudio) {
    currentTalkingAudio.pause();
    currentTalkingAudio.currentTime = 0;
    currentTalkingAudio = null;
  }
}

// 背景音樂控制
export function playLobbyBgm() {
  console.log('🎵 Attempting to play lobby BGM...');
  stopAllBgm();
  if (!audioEnabled) {
    console.log('🎵 Audio disabled, skipping BGM');
    return;
  }
  
  try {
    console.log('🎵 Creating audio element for:', AUDIO_FILES.lobby_bg);
    currentBgm = new Audio(AUDIO_FILES.lobby_bg);
    currentBgm.loop = true;
    currentBgm.volume = 1;
    currentBgm.preload = 'auto';
    
    // 添加載入事件監聽
    currentBgm.addEventListener('loadstart', () => console.log('🎵 BGM load started'));
    currentBgm.addEventListener('canplay', () => console.log('🎵 BGM can play'));
    currentBgm.addEventListener('error', (e) => console.error('🎵 BGM load error:', e));
    
    currentBgm.play().then(() => {
      console.log('🎵 Lobby BGM playing successfully');
    }).catch((error) => {
      console.warn('🎵 Lobby BGM autoplay blocked:', error);
      // 如果自動播放被阻止，嘗試在用戶第一次互動後播放
      const handleUserInteraction = () => {
        console.log('🎵 User interaction detected, retrying BGM...');
        if (currentBgm && currentBgm.paused) {
          currentBgm.play().then(() => {
            console.log('🎵 Lobby BGM started after user interaction');
          }).catch(() => {});
        }
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    });
  } catch (error) {
    console.warn('🎵 Lobby BGM failed:', error);
  }
}

export function playPlayingBgm() {
  stopAllBgm();
  if (!audioEnabled) return;
  
  try {
    currentBgm = new Audio(AUDIO_FILES.playing_bgm);
    currentBgm.loop = true;
    currentBgm.volume = 1;
    currentBgm.preload = 'auto';
    currentBgm.play().catch((error) => {
      console.warn('Playing BGM autoplay blocked:', error);
      // 如果自動播放被阻止，嘗試在用戶第一次互動後播放
      const handleUserInteraction = () => {
        if (currentBgm && currentBgm.paused) {
          currentBgm.play().catch(() => {});
        }
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    });
  } catch (error) {
    console.warn('Playing BGM failed:', error);
  }
}

export function stopAllBgm() {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
    currentBgm = null;
  }
  
  // 清理音頻上下文
  if (bgmContext) {
    bgmContext.close();
    bgmContext = null;
    bgmGainNode = null;
    underwaterFilter = null;
  }
}

export function setUnderwaterEffect(enabled: boolean) {
  if (!currentBgm) return;
  
  try {
    if (!bgmContext) {
      bgmContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = bgmContext.createMediaElementSource(currentBgm);
      bgmGainNode = bgmContext.createGain();
      underwaterFilter = bgmContext.createBiquadFilter();
      
      underwaterFilter.type = 'lowpass';
      underwaterFilter.frequency.setValueAtTime(1000, bgmContext.currentTime);
      underwaterFilter.Q.setValueAtTime(1, bgmContext.currentTime);
      
      source.connect(underwaterFilter);
      underwaterFilter.connect(bgmGainNode);
      bgmGainNode.connect(bgmContext.destination);
    }
    
    if (enabled) {
      // 水中效果：低通濾波器 + 適度降低音量
      underwaterFilter!.frequency.exponentialRampToValueAtTime(800, bgmContext!.currentTime + 0.5);
      bgmGainNode!.gain.exponentialRampToValueAtTime(0.6, bgmContext!.currentTime + 0.5);
    } else {
      // 正常效果：恢復頻率和音量
      underwaterFilter!.frequency.exponentialRampToValueAtTime(20000, bgmContext!.currentTime + 0.5);
      bgmGainNode!.gain.exponentialRampToValueAtTime(1, bgmContext!.currentTime + 0.5);
    }
  } catch (error) {
    console.warn('Underwater effect failed:', error);
  }
}

// Weapon Sound Effects
export function playWeaponR1() {
  playAudio(AUDIO_FILES.sniper_shot, 0.2);
}

export function playWeaponR2() {
  playAudio(AUDIO_FILES.gunshot_silencer, 0.5);
}

export function playWeaponR3() {
  playAudio(AUDIO_FILES.synthetic_gunshot, 0.5);
}

// Enemy Sound Effects
export function playDash() {
  playAudio(AUDIO_FILES.dash, 1);
}

export function playEnemyDeath() {
  playAudio(AUDIO_FILES.enemy_death, 0.6);
}

// Player Sound Effects
export function playPlayerHit() {
  playAudio(AUDIO_FILES.player_hit, 0.7);
}

// Game Event Sound Effects
export function playUpgrade() {
  playAudio(AUDIO_FILES.upgrade, 0.6);
}

export function playPurchase() {
  playAudio(AUDIO_FILES.purchase, 0.6);
}

export function playVictory() {
  playAudio(AUDIO_FILES.victory, 0.8);
}

export function playGameOver() {
  playAudio(AUDIO_FILES.gameover, 0.8);
}

export function playGameStart() {
  playAudio(AUDIO_FILES.gamestart, 0.7);
}

// Legacy functions for backward compatibility
export function playShoot() {
  playWeaponR1(); // Default to R1 sound
}

export function playHit() {
  playPlayerHit();
}

export function playBgm() {
  if (!audioEnabled || bgmStarted) return;
  // BGM can be implemented later if needed
  bgmStarted = true;
}


