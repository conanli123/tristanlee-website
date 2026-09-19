import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { musicTracks } from "../data/music";
import { MusicContext } from "./music-context";

const settingsKey = "tristanlee-music";
type Preferences = {
  volume: number;
  muted: boolean;
  enabled: boolean;
  shuffle: boolean;
};
function preferences(): Preferences {
  try {
    const data = JSON.parse(localStorage.getItem(settingsKey) || "{}");
    return {
      volume:
        typeof data.volume === "number" && Number.isFinite(data.volume)
          ? Math.min(1, Math.max(0, data.volume))
          : 0.22,
      muted: data.muted === true,
      enabled: data.enabled !== false,
      shuffle: data.shuffle !== false,
    };
  } catch {
    return { volume: 0.22, muted: false, enabled: true, shuffle: true };
  }
}
function randomIndex(exclude = -1) {
  const pool = musicTracks.map((_, i) => i).filter((i) => i !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? 0;
}
function audioUrl(path: string) {
  // Published and single-file directories both have a sibling music folder.
  const prefix =
    location.protocol === "file:" &&
    !location.pathname.includes("/single-file/")
      ? "public/"
      : "";
  return new URL(prefix + path, window.location.href.split("#")[0]).href;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(preferences);
  const [index, setIndex] = useState(() => randomIndex());
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(musicTracks[index].duration);
  const [volume, setVolumeState] = useState(initial.volume);
  const [muted, setMuted] = useState(initial.muted);
  const [shuffle, setShuffle] = useState(initial.shuffle);
  const [enabled, setEnabled] = useState(initial.enabled);
  const audioRef = useRef<HTMLAudioElement>(null);
  const indexRef = useRef(index);
  const shuffleRef = useRef(shuffle);
  const needsGesture = useRef(false);
  const request = useRef(0);
  const seekAbort = useRef<AbortController | null>(null);
  const localAudioUrl = useRef<string | null>(null);
  const pendingSeek = useRef<number | null>(null);
  shuffleRef.current = shuffle;

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const version = ++request.current;
    setError("");
    setLoading(true);
    if (audio.error) audio.load();
    try {
      await audio.play();
      if (version !== request.current) return;
      needsGesture.current = false;
      setBlocked(false);
      setPlaying(!audio.paused);
      setLoading(false);
    } catch (reason) {
      if (version !== request.current) return;
      setLoading(false);
      setPlaying(false);
      if (reason instanceof DOMException && reason.name === "NotAllowedError") {
        needsGesture.current = true;
        setBlocked(true);
      } else if (!(
        reason instanceof DOMException && reason.name === "AbortError"
      )) {
        needsGesture.current = false;
        setError("这首音乐暂时无法播放，请重试或切换下一首。");
      }
    }
  }, []);

  const loadTrack = useCallback((nextIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    request.current++;
    seekAbort.current?.abort();
    pendingSeek.current = null;
    if (localAudioUrl.current) {
      URL.revokeObjectURL(localAudioUrl.current);
      localAudioUrl.current = null;
    }
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    setCurrentTime(0);
    setDuration(musicTracks[nextIndex].duration);
    setError("");
    audio.src = audioUrl(musicTracks[nextIndex].src);
    audio.load();
  }, []);

  const select = useCallback(
    (nextIndex: number) => {
      if (!musicTracks[nextIndex]) return;
      setEnabled(true);
      if (nextIndex !== indexRef.current || !audioRef.current?.src)
        loadTrack(nextIndex);
      void play();
    },
    [loadTrack, play],
  );
  const next = useCallback(() => {
    select(
      shuffleRef.current
        ? randomIndex(indexRef.current)
        : (indexRef.current + 1) % musicTracks.length,
    );
  }, [select]);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      void play();
      setEnabled(true);
    } else
      select((indexRef.current - 1 + musicTracks.length) % musicTracks.length);
  }, [select, play]);
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    request.current++;
    needsGesture.current = false;
    audio.pause();
    seekAbort.current?.abort();
    pendingSeek.current = null;
    setEnabled(false);
    setBlocked(false);
    setLoading(false);
  }, []);
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) pause();
    else {
      setEnabled(true);
      void play();
    }
  }, [pause, play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = initial.volume;
    audio.muted = initial.muted;
    loadTrack(indexRef.current);
    if (initial.enabled) void play();
    const unlock = (event: Event) => {
      if (!needsGesture.current) return;
      // Music controls make their own deliberate play/pause/selection request.
      if ((event.target as Element)?.closest?.("[data-music-control]")) return;
      if (
        event instanceof KeyboardEvent &&
        (event.ctrlKey || event.metaKey || event.altKey || event.key === "Tab")
      )
        return;
      void play();
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("pointerup", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return () => {
      request.current++;
      needsGesture.current = false;
      audio.pause();
      seekAbort.current?.abort();
      if (localAudioUrl.current) URL.revokeObjectURL(localAudioUrl.current);
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("pointerup", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, [initial, loadTrack, play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
    try {
      localStorage.setItem(
        settingsKey,
        JSON.stringify({ volume, muted, shuffle, enabled }),
      );
    } catch {
      /* Optional persistence. */
    }
  }, [volume, muted, shuffle, enabled]);

  const seek = async (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const target = Math.max(0, Math.min(audio.duration, seconds));
    setCurrentTime(target);
    if (
      audio.seekable.length &&
      audio.seekable.end(audio.seekable.length - 1) > 0
    ) {
      audio.currentTime = target;
      setCurrentTime(target);
      return;
    }
    // Some static previews omit byte-range support. Buffer only this track on
    // the first seek, so the browser can seek reliably using a local Blob URL.
    seekAbort.current?.abort();
    pendingSeek.current = target;
    const controller = new AbortController();
    seekAbort.current = controller;
    const source = audio.src;
    setLoading(true);
    try {
      const response = await fetch(source, { signal: controller.signal });
      if (!response.ok) throw new Error("Audio download failed");
      const blob = await response.blob();
      if (controller.signal.aborted || audio.src !== source) return;
      const resume = !audio.paused;
      const url = URL.createObjectURL(blob);
      if (localAudioUrl.current) URL.revokeObjectURL(localAudioUrl.current);
      localAudioUrl.current = url;
      const restore = () => {
        if (audio.src !== url || controller.signal.aborted) return;
        audio.currentTime = Math.min(target, audio.duration);
        pendingSeek.current = null;
        setCurrentTime(audio.currentTime);
        setLoading(false);
        if (resume) void play();
      };
      audio.addEventListener("canplay", restore, {
        once: true,
        signal: controller.signal,
      });
      audio.src = url;
      audio.load();
    } catch {
      if (controller.signal.aborted) return;
      pendingSeek.current = null;
      setLoading(false);
      setError("进度暂时无法调整，请稍后重试。");
    }
  };
  const setVolume = (value: number) => {
    if (!Number.isFinite(value)) return;
    setVolumeState(Math.max(0, Math.min(1, value)));
    if (value > 0) setMuted(false);
  };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: musicTracks[index].title,
      artist: musicTracks[index].artist,
      album: "TristanLee · COURTSIDE FM",
    });
    session.playbackState = playing ? "playing" : "paused";
    session.setActionHandler("play", () => {
      setEnabled(true);
      void play();
    });
    session.setActionHandler("pause", pause);
    session.setActionHandler("nexttrack", next);
    session.setActionHandler("previoustrack", previous);
    return () => {
      for (const action of [
        "play",
        "pause",
        "nexttrack",
        "previoustrack",
      ] as const)
        session.setActionHandler(action, null);
    };
  }, [index, playing, play, pause, next, previous]);

  return (
    <MusicContext.Provider
      value={{
        tracks: musicTracks,
        track: musicTracks[index],
        index,
        playing,
        loading,
        blocked,
        error,
        currentTime,
        duration,
        volume,
        muted,
        shuffle,
        select,
        toggle,
        pause,
        next,
        previous,
        seek,
        setVolume,
        toggleMute: () => setMuted((value) => !value),
        toggleShuffle: () => setShuffle((value) => !value),
      }}
    >
      {children}
      <audio
        ref={audioRef}
        data-site-music
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setBlocked(false);
        }}
        onPause={() => setPlaying(false)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onTimeUpdate={(event) => {
          if (pendingSeek.current === null)
            setCurrentTime(event.currentTarget.currentTime);
        }}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration))
            setDuration(event.currentTarget.duration);
        }}
        onEnded={next}
        onError={() => {
          setLoading(false);
          setPlaying(false);
          setError("这首音乐暂时无法播放，请重试或切换下一首。");
        }}
      />
    </MusicContext.Provider>
  );
}
