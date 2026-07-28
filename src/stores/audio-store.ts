import { create } from "zustand";

interface AudioStore {
  isPlaying: boolean;
  currentTrack: string | null;
  volume: number;
  muted: boolean;
  play: (track: string) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  reset: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 0.8,
  muted: false,

  play: (track) => set({ isPlaying: true, currentTrack: track }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, currentTrack: null }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  reset: () => set({ isPlaying: false, currentTrack: null, volume: 0.8, muted: false }),
}));
