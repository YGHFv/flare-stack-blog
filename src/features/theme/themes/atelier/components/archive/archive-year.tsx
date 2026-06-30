import { m } from "@/paraglide/messages";

interface ArchiveYearProps {
  year: number;
  count: number;
}

export function ArchiveYear({ year, count }: ArchiveYearProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/35 pt-5 first:border-t-0 first:pt-0 dark:border-white/10">
      <div className="flex items-baseline gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-(--atelier-primary) shadow-[0_0_18px_rgba(99,102,241,0.55)]" />
        <div className="text-2xl font-black tracking-tight atelier-text-90">
          {year}
        </div>
      </div>
      <div className="rounded-full bg-white/35 px-3 py-1 text-xs font-bold atelier-text-50 dark:bg-white/8">
        {m.posts_count({ count })}
      </div>
    </div>
  );
}
