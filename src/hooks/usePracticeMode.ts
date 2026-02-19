import { useCallback, useState } from 'react';
import { PracticeState, Song, FingeringMap } from '../types';

export const usePracticeMode = () => {
  const [state, setState] = useState<PracticeState>({
    currentEventIndex: -1,
    currentNote: null,
    expectedFingering: null,
    isPlaying: false,
    startTime: null,
  });

  const start = useCallback((song: Song, fingeringMap: FingeringMap) => {
    if (!song || song.events.length === 0) return;

    const first = song.events[0];
    setState({
      currentEventIndex: 0,
      currentNote: first.pitch,
      expectedFingering: fingeringMap[first.pitch]?.valvulas ?? null,
      isPlaying: true,
      startTime: Date.now(),
    });
  }, []);

  const next = useCallback((song: Song, fingeringMap: FingeringMap) => {
    setState(prev => {
      if (!song) return prev;
      const nextIndex = prev.currentEventIndex + 1;
      if (nextIndex >= song.events.length) {
        return {
          currentEventIndex: -1,
          currentNote: null,
          expectedFingering: null,
          isPlaying: false,
          startTime: null,
        };
      }

      const event = song.events[nextIndex];
      return {
        currentEventIndex: nextIndex,
        currentNote: event.pitch,
        expectedFingering: fingeringMap[event.pitch]?.valvulas ?? null,
        isPlaying: true,
        startTime: Date.now(),
      };
    });
  }, []);

  const end = useCallback(() => {
    setState({
      currentEventIndex: -1,
      currentNote: null,
      expectedFingering: null,
      isPlaying: false,
      startTime: null,
    });
  }, []);

  return { state, start, next, end };
};

export default usePracticeMode;
