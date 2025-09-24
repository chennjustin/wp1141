// Simple audio placeholder system. Real audio files can be wired later.
// Usage: call playShoot(), playHit(), playPurchase(), playBgm()

let audioEnabled = true;
let bgmStarted = false;

export function setAudioEnabled(enabled: boolean) { audioEnabled = enabled; }

export function playShoot() {
  if (!audioEnabled) return;
  try { new AudioContext(); } catch {}
}

export function playHit() {
  if (!audioEnabled) return;
  try { new AudioContext(); } catch {}
}

export function playPurchase() {
  if (!audioEnabled) return;
  try { new AudioContext(); } catch {}
}

export function playBgm() {
  if (!audioEnabled || bgmStarted) return;
  // Placeholder: no-op. In future, attach an <audio> element and loop.
  bgmStarted = true;
}


