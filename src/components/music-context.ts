import { createContext, useContext } from "react";
import type { MusicTrack } from "../data/music";

export type MusicState = {
  tracks: MusicTrack[];
  track: MusicTrack;
  index: number;
  playing: boolean;
  loading: boolean;
  blocked: boolean;
  error: string;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  select: (index: number) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
};
export const MusicContext = createContext<MusicState | null>(null);
export function useMusic() {
  const value = useContext(MusicContext);
  if (!value) throw new Error("MusicProvider required");
  return value;
}
export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
