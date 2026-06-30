import {
  Disc3,
  ListMusic,
  Loader2,
  Mic2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AtelierMusicCommentSection } from "../../components/comments/view/music-comment-section";
import { useMusic } from "../../components/music/music-provider";

function formatTime(time: number) {
  if (!time || Number.isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function MusicPage() {
  const {
    playlist,
    currentIndex,
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    currentLyric,
    isLoading,
    togglePlay,
    nextSong,
    prevSong,
    selectSong,
    seekToProgress,
  } = useMusic();
  const [activeTab, setActiveTab] = useState<"lyrics" | "playlist">("lyrics");
  const [searchQuery, setSearchQuery] = useState("");
  const activeLyricRef = useRef<HTMLDivElement>(null);

  function switchTab(tab: "lyrics" | "playlist") {
    setActiveTab(tab);
  }

  const lyrics = currentSong?.lyrics ?? [];
  const activeLyricIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    const nextIndex = lyrics.findIndex((line) => line.time > currentTime);
    if (nextIndex === -1) return lyrics.length - 1;
    return Math.max(0, nextIndex - 1);
  }, [currentTime, lyrics]);

  const filteredPlaylist = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return playlist.map((song, index) => ({ song, index }));

    return playlist
      .map((song, index) => ({ song, index }))
      .filter(({ song }) => {
        return (
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query)
        );
      });
  }, [playlist, searchQuery]);

  useEffect(() => {
    if (activeTab !== "lyrics") return;
    activeLyricRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLyricIndex, activeTab]);

  if (isLoading) {
    return (
      <section className="atelier-card-base flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-(--atelier-primary)" />
        <div className="text-sm font-black uppercase tracking-[0.24em] atelier-text-75">
          Loading Music
        </div>
      </section>
    );
  }

  if (!currentSong) {
    return (
      <section className="atelier-card-base flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <Disc3 className="h-14 w-14 text-(--atelier-primary)" />
        <div className="text-sm font-black uppercase tracking-[0.24em] atelier-text-75">
          No Music Available
        </div>
      </section>
    );
  }

  return (
    <div className="relative flex flex-col gap-5">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-45 blur-3xl">
        <img
          src={currentSong.cover}
          alt=""
          className="h-full w-full scale-110 object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <section className="relative z-10 grid grid-cols-1 gap-5 lg:h-[calc(100vh-8rem)] lg:min-h-[620px] lg:max-h-[760px] lg:grid-cols-12">
        <div className="atelier-card-base relative flex min-h-[540px] flex-col overflow-hidden p-6 md:p-8 lg:col-span-5 lg:h-full lg:min-h-0">
          <div
            className={`absolute inset-x-10 top-16 h-64 rounded-full bg-(--atelier-primary)/25 blur-3xl transition-opacity ${
              isPlaying ? "opacity-90" : "opacity-35"
            }`}
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
            <div className="relative mb-8 flex aspect-square w-56 max-w-[72vw] items-center justify-center md:w-72">
              <div
                className="absolute inset-0 overflow-hidden rounded-full border-[6px] border-white/70 shadow-2xl animate-[spin_18s_linear_infinite] dark:border-white/15"
                style={{
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
              >
                <img
                  src={currentSong.cover}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="relative z-10 h-14 w-14 rounded-full border border-slate-300/60 bg-white/90 shadow-inner dark:border-white/10 dark:bg-slate-900/90" />
            </div>

            <div className="w-full text-center">
              <h2 className="truncate text-2xl font-black tracking-normal atelier-text-90">
                {currentSong.title}
              </h2>
              <p className="mt-2 truncate text-sm font-bold atelier-text-60">
                {currentSong.artist}
              </p>
              <p className="mx-auto mt-5 min-h-6 max-w-sm truncate text-sm font-black text-(--atelier-primary)">
                {currentLyric}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="mb-6 flex items-center gap-3 text-xs font-bold atelier-text-60">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Number.isFinite(progress) ? progress : 0}
                onChange={(event) => seekToProgress(Number(event.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/45 accent-(--atelier-primary) outline-none shadow-inner dark:bg-white/10"
                aria-label="Music progress"
                style={{
                  background: `linear-gradient(to right, var(--atelier-primary) ${progress}%, rgba(148,163,184,0.35) ${progress}%)`,
                }}
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-7">
              <button
                type="button"
                onClick={prevSong}
                className="text-slate-600 transition-all hover:scale-110 hover:text-(--atelier-primary) dark:text-slate-300"
                aria-label="Previous song"
              >
                <SkipBack className="h-7 w-7" fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/60 bg-(--atelier-primary) text-white shadow-xl shadow-(--atelier-primary)/25 transition-transform hover:scale-105"
                aria-label={isPlaying ? "Pause music" : "Play music"}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" fill="currentColor" />
                ) : (
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={nextSong}
                className="text-slate-600 transition-all hover:scale-110 hover:text-(--atelier-primary) dark:text-slate-300"
                aria-label="Next song"
              >
                <SkipForward className="h-7 w-7" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        <div className="atelier-card-base flex h-[560px] min-h-0 flex-col overflow-hidden p-5 md:p-6 lg:col-span-7 lg:h-full">
          <div
            className="mx-auto mb-5 flex w-full max-w-xs rounded-full border border-white/45 bg-white/45 p-1 shadow-inner dark:border-white/10 dark:bg-white/8"
            role="tablist"
            aria-label="Music view"
          >
            <button
              type="button"
              onClick={() => switchTab("lyrics")}
              role="tab"
              aria-selected={activeTab === "lyrics"}
              aria-controls="atelier-music-lyrics-panel"
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all ${
                activeTab === "lyrics"
                  ? "bg-(--atelier-primary) text-white shadow-md"
                  : "atelier-text-60"
              }`}
            >
              <Mic2 size={16} />
              歌词
            </button>
            <button
              type="button"
              onClick={() => switchTab("playlist")}
              role="tab"
              aria-selected={activeTab === "playlist"}
              aria-controls="atelier-music-playlist-panel"
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all ${
                activeTab === "playlist"
                  ? "bg-(--atelier-primary) text-white shadow-md"
                  : "atelier-text-60"
              }`}
            >
              <ListMusic size={16} />
              歌单
            </button>
          </div>

          <div
            key={`lyrics-${currentSong.id}`}
            id="atelier-music-lyrics-panel"
            role="tabpanel"
            aria-hidden={activeTab !== "lyrics"}
            className={`relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-8 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] ${
              activeTab === "lyrics" ? "block" : "hidden"
            }`}
          >
            <div className="flex min-h-full flex-col justify-center gap-4 py-16 text-center">
              {lyrics.length > 0 ? (
                lyrics.map((line, index) => {
                  const isActive = index === activeLyricIndex;
                  return (
                    <div
                      key={`${line.time}-${line.text}`}
                      ref={isActive ? activeLyricRef : null}
                      className={`rounded-2xl px-4 py-2 transition-all duration-500 ${
                        isActive
                          ? "scale-105 bg-white/20 opacity-100 dark:bg-white/8"
                          : "opacity-35"
                      }`}
                    >
                      <p
                        className={`font-black leading-8 tracking-normal ${
                          isActive
                            ? "text-xl text-(--atelier-primary) md:text-2xl"
                            : "text-base atelier-text-75 md:text-lg"
                        }`}
                      >
                        {line.text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                  <Disc3 className="h-10 w-10 animate-spin text-(--atelier-primary)/55" />
                  <p className="text-lg font-black text-(--atelier-primary)">
                    {currentLyric || "暂无歌词"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            id="atelier-music-playlist-panel"
            role="tabpanel"
            aria-hidden={activeTab !== "playlist"}
            className={`min-h-0 flex-1 flex-col ${
              activeTab === "playlist" ? "flex" : "hidden"
            }`}
          >
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 atelier-text-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索歌曲"
                className="h-12 w-full rounded-full border border-white/45 bg-white/40 pl-11 pr-11 text-sm font-bold outline-none transition focus:border-(--atelier-primary)/45 focus:ring-2 focus:ring-(--atelier-primary)/20 dark:border-white/10 dark:bg-white/8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/45 dark:hover:bg-white/10"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                {filteredPlaylist.map(({ song, index }) => {
                  const isCurrent = index === currentIndex;
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => selectSong(index)}
                      className={`flex items-center gap-4 rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                        isCurrent
                          ? "border-(--atelier-primary)/35 bg-white/60 shadow-md dark:bg-white/10"
                          : "border-transparent hover:bg-white/35 dark:hover:bg-white/8"
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-sm">
                        <img
                          src={song.cover}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_white]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm font-black ${
                            isCurrent
                              ? "text-(--atelier-primary)"
                              : "atelier-text-90"
                          }`}
                        >
                          {song.title}
                        </div>
                        <div className="mt-1 truncate text-xs font-bold atelier-text-50">
                          {song.artist}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 atelier-card-base p-6 md:p-8">
        <AtelierMusicCommentSection
          key={currentSong.id}
          songId={currentSong.id}
          songTitle={currentSong.title}
        />
      </section>
    </div>
  );
}
