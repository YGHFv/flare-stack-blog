import { Hono } from "hono";

const NETEASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
};

const MUSIC_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

interface NeteaseArtist {
  name?: string;
}

interface NeteaseAlbum {
  picUrl?: string;
}

interface NeteaseSong {
  name?: string;
  artists?: Array<NeteaseArtist>;
  album?: NeteaseAlbum;
}

interface NeteaseDetailResponse {
  songs?: Array<NeteaseSong>;
}

interface NeteaseLyricResponse {
  lrc?: {
    lyric?: string;
  };
}

interface SongResult {
  id: string;
  name?: string;
  artist?: string;
  author?: string;
  cover?: string;
  pic?: string;
  url?: string;
  lrc?: string;
  error?: string;
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: NETEASE_HEADERS,
    signal: timeoutSignal(6000),
  });

  return (await response.json()) as T;
}

async function getSong(songId: string): Promise<SongResult> {
  try {
    const [detail, lyric] = await Promise.all([
      fetchJson<NeteaseDetailResponse>(
        `https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`,
      ),
      fetchJson<NeteaseLyricResponse>(
        `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`,
      ).catch(() => null),
    ]);

    const song = detail.songs?.[0];

    if (!song) {
      return { id: songId, error: "not_found" };
    }

    const artistName = song.artists?.[0]?.name || "Unknown Artist";
    const cover = song.album?.picUrl || "";

    return {
      id: songId,
      name: song.name,
      artist: artistName,
      author: artistName,
      cover,
      pic: cover,
      url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
      lrc: lyric?.lrc?.lyric || "",
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "music fetch failed",
        songId,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return { id: songId, error: String(error) };
  }
}

const app = new Hono<{ Bindings: Env }>();

const route = app.get("/", async (c) => {
  const ids = c.req.query("ids");

  if (!ids) {
    return c.json({ error: "Missing ids parameter" }, 400);
  }

  const songIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  const results = await Promise.all(songIds.map((songId) => getSong(songId)));

  return c.json(results, 200, {
    "Cache-Control": MUSIC_CACHE_CONTROL,
  });
});

export default route;
