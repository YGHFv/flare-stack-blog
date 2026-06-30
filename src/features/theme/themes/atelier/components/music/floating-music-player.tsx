import { useLocation } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "./music-provider";

interface Point {
  x: number;
  y: number;
}

export function FloatingMusicPlayer() {
  const location = useLocation();
  const { currentSong, isPlaying, togglePlay, nextSong, currentLyric } =
    useMusic();
  const [isMounted, setIsMounted] = useState(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const dragStartRef = useRef<Point | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isHomePage = location.pathname === "/";

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;
    setOffset({
      x: event.clientX - dragStartRef.current.x,
      y: event.clientY - dragStartRef.current.y,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (isHomePage || !isPlaying || !currentSong) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[70]"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="flex cursor-grab items-center gap-3 rounded-full border border-white/40 bg-white/70 p-2 pr-4 shadow-2xl backdrop-blur-xl active:cursor-grabbing dark:border-white/10 dark:bg-slate-800/80">
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/50 shadow-sm animate-[spin_6s_linear_infinite]"
          style={{ animationPlayState: isPlaying ? "running" : "paused" }}
        >
          <img
            src={currentSong.cover}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 shadow-inner" />
        </div>

        <div className="flex w-32 max-w-[8rem] flex-col overflow-hidden">
          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {currentSong.title}
          </span>
          <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
            {currentLyric}
          </span>
        </div>

        <div className="ml-1 flex items-center gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              togglePlay();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-(--atelier-primary) text-white shadow-md transition-transform hover:scale-110"
            type="button"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              nextSong();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="text-slate-600 transition-colors hover:text-(--atelier-primary) dark:text-slate-300"
            type="button"
            aria-label="Next song"
          >
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
