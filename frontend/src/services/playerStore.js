import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,

  playTrack: (track) => set({ currentTrack: track, isPlaying: true, }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  stopTrack: () => set({ currentTrack: null, isPlaying: false, progress: 0 }),

  setVolume: (volume) => set({ volume }),

  setProgress: (progress) => set({ progress }),

  setDuration: (duration) => set({ duration }),

  setIsPlaying: (value) => set({ isPlaying: value }),
}));