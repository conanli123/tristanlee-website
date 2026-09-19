export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number;
  src: string;
  color: string;
  source: string;
};

export type PlatformMusicTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  color: string;
  source: string;
  embedSrc: string;
};

// Official platform players keep these recordings on their licensed service.
// They are intentionally excluded from the site's native background queue.
export const platformMusicTracks: PlatformMusicTrack[] = [
  {
    id: "happy-worship",
    title: "快乐崇拜",
    artist: "潘玮柏 / 张韶涵",
    genre: "MANDOPOP / HIP-HOP",
    color: "#ffbc62",
    source: "https://music.apple.com/cn/song/1443399243",
    embedSrc: "https://embed.music.apple.com/cn/song/1443399243",
  },
  {
    id: "ba-fang-lai-cai",
    title: "八方来财",
    artist: "揽佬 SKAI ISYOURGOD",
    genre: "CHINESE HIP-HOP",
    color: "#ff7f94",
    source: "https://music.apple.com/cn/song/1763742879",
    embedSrc: "https://embed.music.apple.com/cn/song/1763742879",
  },
  {
    id: "crush-on-you",
    title: "花花公子",
    artist: "马思唯 / step.jad依加 / Higher Brothers",
    genre: "CHINESE HIP-HOP / R&B",
    color: "#99b9ff",
    source: "https://music.apple.com/cn/song/1724867781",
    embedSrc: "https://embed.music.apple.com/cn/song/1724867781",
  },
];

export const musicTracks: MusicTrack[] = [
  {
    id: "district-four",
    title: "District Four",
    artist: "Kevin MacLeod",
    genre: "FUNK / BREAKBEAT",
    bpm: 176,
    duration: 248,
    src: "music/district-four.mp3",
    color: "#daff61",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600039",
  },
  {
    id: "griphop",
    title: "Griphop",
    artist: "Kevin MacLeod",
    genre: "HIP-HOP / STRINGS",
    bpm: 90,
    duration: 207,
    src: "music/griphop.mp3",
    color: "#ff784d",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100413",
  },
  {
    id: "chillin-hard",
    title: "Chillin Hard",
    artist: "Kevin MacLeod",
    genre: "HIP-HOP / CHILL",
    bpm: 80,
    duration: 234,
    src: "music/chillin-hard.mp3",
    color: "#ab9aff",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600028",
  },
  {
    id: "rock-hybrid",
    title: "Rock Hybrid",
    artist: "Kevin MacLeod",
    genre: "HIP-HOP / ROCK",
    bpm: 116,
    duration: 130,
    src: "music/rock-hybrid.mp3",
    color: "#6bcad1",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100094",
  },
];
