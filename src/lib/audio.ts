/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

function playTone(freq: number, type: OscillatorType, duration: number, gainStartValue: number) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(gainStartValue, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export const soundEffects = {
  click: () => {
    playTone(523.25, 'triangle', 0.1, 0.15); // C5
  },
  deactivate: () => {
    playTone(392.00, 'triangle', 0.12, 0.12); // G4
  },
  connect: () => {
    // Elegant dual frequency chime
    playTone(587.33, 'sine', 0.2, 0.1); // D5
    setTimeout(() => {
      playTone(880.00, 'sine', 0.25, 0.1); // A5
    }, 60);
  },
  error: () => {
    // Low failure buzzy sound
    playTone(110.00, 'sawtooth', 0.3, 0.2); // A2
  },
  powerUp: () => {
    // Arpeggio up
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.15, 0.1);
      }, idx * 80);
    });
  },
  levelComplete: () => {
    // Beautiful science fiction sound
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.3, 0.15);
      }, idx * 100);
    });
  },
  overclock: () => {
    try {
      if (isMuted) return;
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn(e);
    }
  },
  deepScan: () => {
    // Sub-pulse sequence
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { }
  },
  gameOver: () => {
    // Descending scale
    const notes = [392, 349.23, 293.66, 261.63];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sawtooth', 0.25, 0.1);
      }, idx * 150);
    });
  }
};
