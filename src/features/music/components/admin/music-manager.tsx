import {
  ArrowDown,
  ArrowUp,
  Disc3,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SystemConfig } from "@/features/config/config.schema";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { cn } from "@/lib/utils";

type MusicPlaylistItem = NonNullable<
  NonNullable<SystemConfig["music"]>["playlist"]
>[number];

function createMusicItem(source: "netease" | "custom"): MusicPlaylistItem {
  return {
    id: source === "custom" ? `custom-${Date.now()}` : "",
    source,
    enabled: true,
    title: "",
    artist: "",
    cover: "",
    src: "",
    lrc: "",
  };
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeMusicItem(item: MusicPlaylistItem): MusicPlaylistItem {
  return {
    id: item.id.trim(),
    source: item.source ?? "netease",
    enabled: item.enabled !== false,
    title: normalizeText(item.title),
    artist: normalizeText(item.artist),
    cover: normalizeText(item.cover),
    src: normalizeText(item.src),
    lrc: normalizeText(item.lrc),
  };
}

function getItemError(item: MusicPlaylistItem) {
  if (!item.id.trim()) return "需要填写歌曲 ID";
  if ((item.source ?? "netease") === "custom" && !item.src?.trim()) {
    return "自定义歌曲需要填写音频地址";
  }
  return null;
}

export function MusicManager() {
  const { settings, saveSettings, isLoading } = useSystemSetting();
  const [playlist, setPlaylist] = useState<Array<MusicPlaylistItem>>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPlaylist(settings.music?.playlist ?? []);
  }, [settings]);

  const enabledCount = useMemo(
    () => playlist.filter((item) => item.enabled !== false).length,
    [playlist],
  );
  const hasInvalidItems = playlist.some((item) => getItemError(item));

  function updateItem(index: number, updates: Partial<MusicPlaylistItem>) {
    setPlaylist((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    setPlaylist((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function deleteItem(index: number) {
    setPlaylist((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function savePlaylist() {
    if (!settings) return;

    const invalidItem = playlist.find((item) => getItemError(item));
    if (invalidItem) {
      toast.error(getItemError(invalidItem) ?? "音乐配置不完整");
      return;
    }

    setIsSaving(true);
    try {
      await saveSettings({
        data: {
          ...settings,
          music: {
            ...settings.music,
            playlist: playlist.map(normalizeMusicItem),
          },
        },
      });
      toast.success("音乐列表已保存");
    } catch {
      toast.error("保存音乐列表失败");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center border border-border/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            音乐管理
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Music Playlist
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPlaylist((current) => [...current, createMusicItem("netease")])
            }
            className="h-10 rounded-none px-4 text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            <Plus size={13} />
            网易云歌曲
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPlaylist((current) => [...current, createMusicItem("custom")])
            }
            className="h-10 rounded-none px-4 text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            <Plus size={13} />
            自定义歌曲
          </Button>
          <Button
            type="button"
            onClick={savePlaylist}
            disabled={isSaving || hasInvalidItems}
            className="h-10 rounded-none px-5 text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MusicStat label="歌曲数量" value={playlist.length} />
        <MusicStat label="已启用" value={enabledCount} />
        <MusicStat
          label="自定义"
          value={
            playlist.filter((item) => (item.source ?? "netease") === "custom")
              .length
          }
        />
      </div>

      <div className="border border-border/30 bg-background/50 p-5 text-sm text-muted-foreground">
        本地内置歌曲会始终作为兜底加入播放列表，不需要在这里重复配置。网易云歌曲只需要填写歌曲
        ID；自定义歌曲需要填写音频地址，可以使用本地 public 路径或完整 URL。
      </div>

      {playlist.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 border border-dashed border-border/40 text-muted-foreground">
          <Disc3 size={36} strokeWidth={1.2} className="opacity-35" />
          <p className="text-sm">暂无音乐，添加一首歌曲开始配置。</p>
        </div>
      ) : (
        <div className="space-y-5">
          {playlist.map((item, index) => (
            <MusicItemEditor
              key={`${item.source}-${item.id}-${index}`}
              item={item}
              index={index}
              total={playlist.length}
              onChange={(updates) => updateItem(index, updates)}
              onMove={moveItem}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MusicStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border/30 bg-background/50 p-5">
      <div className="mb-2 text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="text-3xl font-serif">{value}</div>
    </div>
  );
}

function MusicItemEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  item: MusicPlaylistItem;
  index: number;
  total: number;
  onChange: (updates: Partial<MusicPlaylistItem>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (index: number) => void;
}) {
  const error = getItemError(item);
  const source = item.source ?? "netease";

  return (
    <section
      className={cn(
        "border bg-background/50 transition-colors",
        error ? "border-destructive/50" : "border-border/30",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-border/20 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border/30 bg-muted/20">
            {item.cover ? (
              <img
                src={item.cover}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Disc3 size={22} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-medium">
              {item.title || item.id || "未命名歌曲"}
            </h2>
            <p className="mt-1 truncate text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {source === "netease" ? "Netease" : "Custom"} /{" "}
              {item.enabled === false ? "Disabled" : "Enabled"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={item.enabled !== false}
              onChange={(event) => onChange({ enabled: event.target.checked })}
            />
            启用
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="h-8 w-8"
            aria-label="上移"
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="h-8 w-8"
            aria-label="下移"
          >
            <ArrowDown size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="删除"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2">
        <Field label="来源">
          <select
            value={source}
            onChange={(event) =>
              onChange({ source: event.target.value as "netease" | "custom" })
            }
            className="h-9 w-full border-b border-input bg-transparent text-sm outline-none focus:border-foreground"
          >
            <option value="netease">网易云音乐</option>
            <option value="custom">自定义音频</option>
          </select>
        </Field>
        <Field
          label={source === "netease" ? "网易云歌曲 ID" : "自定义 ID"}
          error={error ?? undefined}
        >
          <Input
            value={item.id}
            onChange={(event) => onChange({ id: event.target.value })}
            placeholder={source === "netease" ? "707720" : "custom-song-id"}
          />
        </Field>
        <Field label="歌名">
          <Input
            value={item.title ?? ""}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="留空则使用歌曲源信息"
          />
        </Field>
        <Field label="作者">
          <Input
            value={item.artist ?? ""}
            onChange={(event) => onChange({ artist: event.target.value })}
            placeholder="留空则使用歌曲源信息"
          />
        </Field>
        <Field label="封面地址">
          <Input
            value={item.cover ?? ""}
            onChange={(event) => onChange({ cover: event.target.value })}
            placeholder="/music/cover.jpg 或 https://..."
          />
        </Field>
        <Field label="音频地址">
          <Input
            value={item.src ?? ""}
            onChange={(event) => onChange({ src: event.target.value })}
            placeholder={
              source === "netease"
                ? "留空则使用网易云外链"
                : "/music/song.ogg 或 https://..."
            }
          />
        </Field>
        <Field label="LRC 歌词" className="md:col-span-2">
          <Textarea
            value={item.lrc ?? ""}
            onChange={(event) => onChange({ lrc: event.target.value })}
            placeholder={
              source === "netease"
                ? "留空则自动读取网易云歌词，也可以粘贴 LRC 覆盖"
                : "[00:00.00]歌词内容"
            }
            className="min-h-32 font-mono text-xs"
          />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      {children}
    </label>
  );
}
