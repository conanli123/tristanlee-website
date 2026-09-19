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
