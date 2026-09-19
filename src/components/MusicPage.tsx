import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { MusicTrack } from "../data/music";
import { formatTime, useMusic } from "./music-context";
import "./music.css";

function TrackArtwork({
  track,
  index,
  playing = false,
  compact = false,
}: {
  track: Pick<MusicTrack, "color">;
  index: number;
  playing?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`music-artwork music-artwork-${index % 4}${playing ? " is-playing" : ""}${compact ? " is-compact" : ""}`}
      style={{ "--track-color": track.color } as CSSProperties}
      aria-hidden="true"
    >
      <div className="music-artwork-grid" />
      <svg className="music-court" viewBox="0 0 400 400" fill="none">
        <path d="M-10 70H410M-10 330H410M200 70V330" />
        <circle cx="200" cy="200" r="48" />
        <path d="M0 118H57V282H0M400 118H343V282H400M57 154a46 46 0 0 1 0 92M343 154a46 46 0 0 0 0 92" />
        <path d="M0 83C168 83 168 317 0 317M400 83C232 83 232 317 400 317" />
      </svg>
      <span className="music-artwork-top">TRISTANLEE / SELECTS</span>
      <div className="music-record">
        <span className="music-record-label">
          <span>VOL.</span>
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <i />
        </span>
      </div>
      <span className="music-artwork-bottom">
        OFF THE CLOCK.
        <br />
        ON THE BEAT.
      </span>
      <span className="music-artwork-side">COURTSIDE SESSION</span>
    </div>
  );
}

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span
      className={`music-equalizer${playing ? " is-playing" : ""}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default function MusicPage() {
  const music = useMusic();
  const { track, tracks, index, playing, loading } = music;
  const duration = music.duration || track.duration;
  const position = Math.min(music.currentTime, duration);
  const progress = duration ? (position / duration) * 100 : 0;
  const status =
    music.error ||
    (music.blocked
      ? "点击播放，或轻点页面空白处开启音乐。"
      : loading
        ? "正在加载音乐…"
        : playing
          ? "音乐会陪你继续浏览作品。"
          : "按下播放，让灵感跟上节拍。");

  return (
    <section
      className="music-page"
      aria-labelledby="music-title"
      data-music-control
    >
      <header className="music-page-heading">
        <h1 id="music-title">
          MUSIC<span>01</span>
        </h1>
        <div className="music-page-intro">
          <span>
            <Headphones /> SOUNDTRACK TO THE PORTFOLIO
          </span>
          <p>
            画面之外，节奏之中。
            <br />
            一些陪伴创作的嘻哈、律动与球场能量。
          </p>
        </div>
      </header>

      <div className="music-session">
        <div className="music-session-topline">
          <span>
            <i /> COURTSIDE SESSION
          </span>
          <span>
            VOL. 01 / {String(tracks.length).padStart(2, "0")} TRACKS
          </span>
        </div>

        <div className="music-current">
          <TrackArtwork track={track} index={index} playing={playing} />
          <div className="music-current-info">
            <div className="music-now-label">
              <Equalizer playing={playing} />{" "}
              {playing ? "NOW PLAYING" : "ON THE DECK"}
            </div>
            <p className="music-current-genre">
              {track.genre}
              {track.bpm !== undefined && (
                <>
                  {" "}
                  <span>·</span> {track.bpm} BPM
                </>
              )}
            </p>
            <h2>{track.title}</h2>
            <p className="music-current-artist">{track.artist}</p>
            <div className="music-progress">
              <input
                type="range"
                aria-label="播放进度"
                aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
                min="0"
                max={duration}
                step="0.25"
                value={position}
                onChange={(event) => music.seek(Number(event.target.value))}
                style={{ "--progress": `${progress}%` } as CSSProperties}
              />
              <div>
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="music-playback">
              <button
                className={`music-icon-button${music.shuffle ? " is-active" : ""}`}
                onClick={music.toggleShuffle}
                aria-label="随机播放"
                aria-pressed={music.shuffle}
                title="随机播放"
              >
                <Shuffle />
              </button>
              <button
                className="music-icon-button"
                onClick={music.previous}
                aria-label="上一首"
                title="上一首"
              >
                <SkipBack />
              </button>
              <button
                className="music-play-button"
                onClick={music.toggle}
                aria-label={playing ? "暂停音乐" : "播放音乐"}
                title={playing ? "暂停" : "播放"}
              >
                {loading ? (
                  <LoaderCircle className="music-loading" />
                ) : playing ? (
                  <Pause fill="currentColor" />
                ) : (
                  <Play fill="currentColor" />
                )}
              </button>
              <button
                className="music-icon-button"
                onClick={music.next}
                aria-label="下一首"
                title="下一首"
              >
                <SkipForward />
              </button>
              <div className="music-volume">
                <button
                  className="music-icon-button"
                  onClick={music.toggleMute}
                  aria-label={music.muted ? "取消静音" : "静音"}
                  title={music.muted ? "取消静音" : "静音"}
                >
                  {music.muted || music.volume === 0 ? (
                    <VolumeX />
                  ) : (
                    <Volume2 />
                  )}
                </button>
                <input
                  type="range"
                  aria-label="音量"
                  min="0"
                  max="1"
                  step="0.01"
                  value={music.muted ? 0 : music.volume}
                  onChange={(event) =>
                    music.setVolume(Number(event.target.value))
                  }
                />
              </div>
            </div>
            <p
              className={`music-status${music.error ? " is-error" : ""}`}
              role="status"
            >
              {status}
            </p>
          </div>
        </div>

        <div className="music-playlist-heading">
          <h3>
            THE ROTATION<span>精选歌单</span>
          </h3>
          <span>PRESS PLAY. STAY INSPIRED.</span>
        </div>
        <div className="music-track-table-labels" aria-hidden="true">
          <span>#</span>
          <span>TRACK / ARTIST</span>
          <span>VIBE</span>
          <span>BPM</span>
          <span>TIME</span>
        </div>
        <ol className="music-track-list" aria-label="精选音乐歌单">
          {tracks.map((item, itemIndex) => {
            const active = itemIndex === index;
            return (
              <li key={item.id}>
                <button
                  className={`music-track-row${active ? " is-current" : ""}`}
                  onClick={() => {
                    active ? music.toggle() : music.select(itemIndex);
                  }}
                  aria-label={`${active && playing ? "暂停" : "播放"} ${item.title}，${item.artist}`}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="music-track-number">
                    {active ? (
                      <Equalizer playing={playing} />
                    ) : (
                      String(itemIndex + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="music-track-name">
                    <TrackArtwork track={item} index={itemIndex} compact />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.artist}</small>
                    </span>
                  </span>
                  <span className="music-track-genre">{item.genre}</span>
                  <span className="music-track-bpm">{item.bpm ?? "—"}</span>
                  <span className="music-track-duration">
                    {formatTime(item.duration)}
                  </span>
                  <span className="music-track-action">
                    {active && playing ? <Pause /> : <Play />}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="music-playlist-note">
          {tracks.length} 首精选音乐，陪你继续浏览作品。
        </p>
        <div className="music-session-footer">
          <span>GOOD LIGHT. GOOD VIBES.</span>
          <span>TRISTANLEE © {new Date().getFullYear()}</span>
        </div>
      </div>

      <details className="music-credits">
        <summary>
          Music credits & licensing <span>音乐来源与授权</span>
        </summary>
        <p>
          District Four / Griphop by{" "}
          <a href="https://incompetech.com/" target="_blank" rel="noreferrer">
            Kevin MacLeod / incompetech.com <ArrowUpRight />
          </a>{" "}
          · Licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            Creative Commons Attribution 4.0 <ArrowUpRight />
          </a>
          。音频已压缩，供网页播放。
        </p>
        <ul>
          {tracks.filter((item) => item.license === "CC BY 4.0").map((item) => (
            <li key={item.id}>
              <a href={item.source} target="_blank" rel="noreferrer">
                {item.title} <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
        <p>
          《八方来财》《快乐崇拜》《花花公子》的版权归各自权利人所有，
          不适用上述 CC BY 4.0 授权。
        </p>
        <ul>
          {tracks.filter((item) => !item.license).map((item) => (
            <li key={item.id}>
              <a href={item.source} target="_blank" rel="noreferrer">
                {item.title} · {item.artist} <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export function MiniPlayer() {
  const music = useMusic();
  return (
    <aside
      className={`music-mini-player${music.playing ? " is-playing" : ""}`}
      aria-label="背景音乐播放器"
      data-music-control
    >
      <a className="music-mini-art" href="#/music" aria-label="打开 MUSIC 歌单">
        <TrackArtwork track={music.track} index={music.index} compact />
      </a>
      <a className="music-mini-title" href="#/music">
        <span>
          {music.error
            ? "播放失败 · 打开歌单"
            : music.blocked
              ? "轻点页面 · 开启音乐"
              : music.playing
                ? "NOW PLAYING"
                : "MUSIC / COURTSIDE"}
        </span>
        <strong>{music.track.title}</strong>
      </a>
      <button
        className="music-mini-toggle"
        onClick={music.toggle}
        aria-label={music.playing ? "暂停背景音乐" : "播放背景音乐"}
        title={music.playing ? "暂停背景音乐" : "播放背景音乐"}
      >
        {music.loading ? (
          <LoaderCircle className="music-loading" />
        ) : music.playing ? (
          <Pause fill="currentColor" />
        ) : (
          <Play fill="currentColor" />
        )}
      </button>
      <button
        className="music-mini-next"
        onClick={music.next}
        aria-label="下一首背景音乐"
        title="下一首"
      >
        <SkipForward />
      </button>
    </aside>
  );
}
