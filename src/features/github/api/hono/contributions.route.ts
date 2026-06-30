import { Hono } from "hono";

const GITHUB_CONTRIBUTIONS_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400";

const app = new Hono<{ Bindings: Env }>();

const route = app.get("/contributions", async (c) => {
  const username = c.req.query("username")?.trim();

  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return c.json({ error: "Invalid username" }, 400);
  }

  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    {
      headers: {
        Accept: "application/json",
      },
      cf: {
        cacheTtl: 21600,
        cacheEverything: true,
      },
    },
  );

  if (!response.ok) {
    return c.json({ error: "Failed to fetch contributions" }, 502);
  }

  const data = await response.json();

  return c.json(data, 200, {
    "Cache-Control": GITHUB_CONTRIBUTIONS_CACHE_CONTROL,
  });
});

export default route;
