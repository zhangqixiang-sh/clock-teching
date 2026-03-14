import { useCallback, useState } from 'react';
import type { SoundManager } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function useSoundManager(): { soundEnabled: boolean; toggleSound: () => void; soundManager: SoundManager } {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const soundManager: SoundManager = {
    tick: useCallback(() => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) { }
    }, [soundEnabled]),

    correct: useCallback(() => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const start = ctx.currentTime + i * 0.12;
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
          osc.start(start);
          osc.stop(start + 0.3);
        });
      } catch (e) { }
    }, [soundEnabled]),

    wrong: useCallback(() => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        [400, 300].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const start = ctx.currentTime + i * 0.15;
          gain.gain.setValueAtTime(0.1, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.start(start);
          osc.stop(start + 0.25);
        });
      } catch (e) { }
    }, [soundEnabled]),

    fanfare: useCallback(() => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'triangle';
          const start = ctx.currentTime + i * 0.15;
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
          osc.start(start);
          osc.stop(start + 0.5);
        });
      } catch (e) { }
    }, [soundEnabled]),

    click: useCallback(() => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      } catch (e) { }
    }, [soundEnabled]),
  };

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return { soundEnabled, toggleSound, soundManager };
}
