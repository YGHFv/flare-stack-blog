import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_MUSIC_IDS = ["707720"];
const MUSIC_CACHE_KEY = `atelier:music:v2:${DEFAULT_MUSIC_IDS.join(",")}`;
const MUSIC_CACHE_TTL = 1000 * 60 * 60 * 24;
const LOCAL_MUSIC_LYRICS_URL = "/music/butterfly-luo-tianyi.lrc";

type PlayMode = "loop" | "single" | "random";

interface LyricLine {
  time: number;
  text: string;
}

interface RawSong {
  id?: string;
  name?: string;
  artist?: string;
  author?: string;
  cover?: string;
  pic?: string;
  url?: string;
  lrc?: string;
  error?: string;
}

export interface MusicSong {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lyrics: Array<LyricLine>;
}

interface LocalCacheValue<T> {
  savedAt: number;
  data: T;
}

const LOCAL_MUSIC_SONG: MusicSong = {
  id: "local-butterfly-luo-tianyi",
  title: "\u8774\u8776",
  artist: "\u6d1b\u5929\u4f9d",
  cover: "/music/butterfly-luo-tianyi.jpg",
  src: "/music/butterfly-luo-tianyi.ogg",
  lyrics: [],
};

interface MusicContextValue {
  playlist: Array<MusicSong>;
  currentIndex: number;
  currentSong: MusicSong | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  playMode: PlayMode;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  selectSong: (index: number) => void;
  seekToProgress: (value: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

function parseLrcTimestamp(match: RegExpMatchArray) {
  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);
  const ms = match[3] ? Number.parseInt(match[3], 10) : 0;
  const divisor = match[3]?.length === 3 ? 1000 : 100;

  return minutes * 60 + seconds + ms / divisor;
}

function parseLrc(lrcText?: string): Array<LyricLine> {
  if (!lrcText || lrcText.length > 30000) return [];

  return lrcText
    .split(/\r?\n/)
    .map((line) => {
      const matches = [
        ...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g),
      ];
      const text = line
        .replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, "")
        .split("")
        .filter((char) => {
          const code = char.charCodeAt(0);
          return !(
            code <= 31 ||
            (code >= 127 && code <= 159) ||
            (code >= 8203 && code <= 8205) ||
            code === 65279
          );
        })
        .join("")
        .trim();

      if (matches.length === 0 || !text) return null;

      return {
        time: parseLrcTimestamp(matches[0]),
        text,
      };
    })
    .filter((line): line is LyricLine => line !== null)
    .sort((a, b) => a.time - b.time);
}

function normalizeSong(song: RawSong): MusicSong | null {
  if (!song.url || song.error) return null;

  return {
    id: song.id || crypto.randomUUID(),
    title: song.name || "Unknown Song",
    artist: song.artist || song.author || "Unknown Artist",
    cover: song.cover || song.pic || "/images/avatar.png",
    src: song.url,
    lyrics: parseLrc(song.lrc),
  };
}

function readLocalCache<T>(key: string, ttl: number): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as LocalCacheValue<T>;
    if (!cached.savedAt || Date.now() - cached.savedAt > ttl) return null;

    return cached.data;
  } catch {
    return null;
  }
}

function writeLocalCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      } satisfies LocalCacheValue<T>),
    );
  } catch {
    // Storage may be unavailable; music still falls back to network data.
  }
}

function withLocalMusic(
  songs: Array<MusicSong>,
  localSong: MusicSong = LOCAL_MUSIC_SONG,
) {
  return [
    localSong,
    ...songs.filter((song) => song.id !== LOCAL_MUSIC_SONG.id),
  ];
}

function getLocalMusicSong(playlist: Array<MusicSong>) {
  return (
    playlist.find((song) => song.id === LOCAL_MUSIC_SONG.id) ?? LOCAL_MUSIC_SONG
  );
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playlist, setPlaylist] = useState<Array<MusicSong>>([
    LOCAL_MUSIC_SONG,
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyric, setCurrentLyric] = useState(LOCAL_MUSIC_SONG.title);
  const [isLoading, setIsLoading] = useState(false);
  const [playMode] = useState<PlayMode>("loop");

  const currentSong = playlist[currentIndex] ?? null;
  const currentSongId = currentSong?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    async function fetchMusic() {
      try {
        const cached = readLocalCache<Array<MusicSong>>(
          MUSIC_CACHE_KEY,
          MUSIC_CACHE_TTL,
        );

        if (cached && cached.length > 0) {
          if (!isMounted) return;

          setPlaylist((currentPlaylist) =>
            withLocalMusic(cached, getLocalMusicSong(currentPlaylist)),
          );
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/music?ids=${DEFAULT_MUSIC_IDS.join(",")}`,
        );
        const rawSongs = (await response.json()) as Array<RawSong>;
        const songs = rawSongs
          .map((song) => normalizeSong(song))
          .filter((song): song is MusicSong => song !== null);

        if (!isMounted) return;

        writeLocalCache(MUSIC_CACHE_KEY, songs);
        setPlaylist((currentPlaylist) =>
          withLocalMusic(songs, getLocalMusicSong(currentPlaylist)),
        );
      } catch {
        if (isMounted) setCurrentLyric(LOCAL_MUSIC_SONG.title);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMusic();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLocalLyrics() {
      try {
        const response = await fetch(LOCAL_MUSIC_LYRICS_URL);
        if (!response.ok) return;

        const lyrics = parseLrc(await response.text());
        if (!isMounted || lyrics.length === 0) return;

        setPlaylist((currentPlaylist) =>
          currentPlaylist.map((song) =>
            song.id === LOCAL_MUSIC_SONG.id ? { ...song, lyrics } : song,
          ),
        );
        setCurrentLyric((current) =>
          current === LOCAL_MUSIC_SONG.title || current === "Instrumental"
            ? lyrics[0].text
            : current,
        );
      } catch {
        // The local song remains playable even if the extracted lyrics fail.
      }
    }

    loadLocalLyrics();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentSong) return;

    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
    setCurrentLyric(currentSong.lyrics[0]?.text || "Instrumental");

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
  }, [currentSongId]);

  useEffect(() => {
    if (!currentSong) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentSong, isPlaying]);

  function nextSong() {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }

  function prevSong() {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }

  function selectSong(index: number) {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
    setCurrentLyric(playlist[index]?.lyrics[0]?.text || "Instrumental");
    setCurrentIndex(index);
    setIsPlaying(true);
  }

  function togglePlay() {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setProgress((audio.currentTime / (audio.duration || 1)) * 100);

    const activeLyric = currentSong?.lyrics
      .slice()
      .reverse()
      .find((line) => audio.currentTime >= line.time);

    if (activeLyric) setCurrentLyric(activeLyric.text);
  }

  function seekToProgress(value: number) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  }

  const value = useMemo<MusicContextValue>(
    () => ({
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      progress,
      currentTime,
      duration,
      currentLyric,
      isLoading,
      playMode,
      togglePlay,
      nextSong,
      prevSong,
      selectSong,
      seekToProgress,
    }),
    [
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      progress,
      currentTime,
      duration,
      currentLyric,
      isLoading,
      playMode,
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={nextSong}
        />
      )}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
}
