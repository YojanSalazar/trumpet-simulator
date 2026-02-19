import { useRef } from 'react';

/**
 * useAudioEngine
 * Hook mínimo que expone una función para reproducir un tono por pitch MIDI
 */
export const useAudioEngine = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playTone = (midi: number, duration = 600, volume = 0.3) => {
    const ctx = ensureContext();
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000 + 0.05);
  };

  return { playTone };
};

export default useAudioEngine;
