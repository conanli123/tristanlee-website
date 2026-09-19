export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm?: number;
  duration: number;
  src: string;
  color: string;
  source: string;
  license?: "CC BY 4.0";
};

export const musicTracks: MusicTrack[] = [
  {
    id: "ba-fang-lai-cai",
    title: "八方来财",
    artist: "揽佬 SKAI ISYOURGOD",
    genre: "CHINESE HIP-HOP",
    duration: 173.113,
    src: "music/ba-fang-lai-cai.mp3",
    color: "#ff7f94",
    source: "https://music.apple.com/cn/song/1763742879",
  },
  {
    id: "district-four",
    title: "District Four",
    artist: "Kevin MacLeod",
    genre: "FUNK / BREAKBEAT",
    bpm: 176,
    duration: 248.294,
    src: "music/district-four.mp3",
    color: "#daff61",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600039",
    license: "CC BY 4.0",
  },
  {
    id: "griphop",
    title: "Griphop",
    artist: "Kevin MacLeod",
    genre: "HIP-HOP / STRINGS",
    bpm: 90,
    duration: 206.785,
    src: "music/griphop.mp3",
    color: "#ff784d",
    source:
      "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100413",
    license: "CC BY 4.0",
  },
  {
    id: "happy-worship",
    title: "快乐崇拜",
    artist: "潘玮柏 / 张韶涵",
    genre: "MANDOPOP / HIP-HOP",
    duration: 205.375,
    src: "music/happy-worship.mp3",
    color: "#ffbc62",
    source: "https://music.apple.com/cn/song/1443399243",
  },
  {
    id: "crush-on-you",
    title: "花花公子",
    artist: "马思唯 / step.jad依加 / Higher Brothers",
    genre: "CHINESE HIP-HOP / R&B",
    duration: 229.12,
    src: "music/crush-on-you.mp3",
    color: "#99b9ff",
    source: "https://music.apple.com/cn/song/1724867781",
  },
];
