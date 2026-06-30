INSERT OR IGNORE INTO tags (name, created_at)
VALUES
  ('主题设计', unixepoch()),
  ('前端', unixepoch()),
  ('生活记录', unixepoch()),
  ('性能优化', unixepoch()),
  ('Cloudflare', unixepoch()),
  ('音乐', unixepoch());

INSERT OR IGNORE INTO posts (
  title,
  summary,
  read_time_in_minutes,
  slug,
  content_json,
  public_content_json,
  status,
  published_at,
  pinned_at,
  created_at,
  updated_at
)
VALUES
  (
    '给博客换一套更轻盈的玻璃主题',
    '记录一次从布局、色彩、卡片密度到交互动效的主题重做过程，让内容区在透明背景上保持清晰可读。',
    4,
    'demo-glass-blog-theme',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"主题目标"}]},{"type":"paragraph","content":[{"type":"text","text":"这篇样例文章用于展示首页卡片、文章详情页标题、摘要和正文排版。新的主题以毛玻璃卡片、柔和背景和较强的信息层级为核心。"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"设计取舍"}]},{"type":"paragraph","content":[{"type":"text","text":"导航保持轻量，卡片承担主要内容展示。正文区域减少装饰噪音，把边框、阴影和留白控制在能帮助阅读的范围内。"}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"主题目标"}]},{"type":"paragraph","content":[{"type":"text","text":"这篇样例文章用于展示首页卡片、文章详情页标题、摘要和正文排版。新的主题以毛玻璃卡片、柔和背景和较强的信息层级为核心。"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"设计取舍"}]},{"type":"paragraph","content":[{"type":"text","text":"导航保持轻量，卡片承担主要内容展示。正文区域减少装饰噪音，把边框、阴影和留白控制在能帮助阅读的范围内。"}]}]}',
    'published',
    unixepoch('now', '-1 day'),
    unixepoch('now', '-1 day'),
    unixepoch('now', '-1 day'),
    unixepoch('now', '-1 day')
  ),
  (
    'TanStack Start 本地开发笔记',
    '整理本地启动、环境变量、D1 数据库和 Cloudflare Workers 适配时容易踩到的几个点。',
    5,
    'demo-tanstack-start-local-notes',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"本地环境"}]},{"type":"paragraph","content":[{"type":"text","text":"开发时需要让 Vite、Cloudflare 插件和本地 D1 状态保持一致。对于主题开发，最重要的是能快速刷新页面并看到布局变化。"}]},{"type":"codeBlock","attrs":{"language":"bash"},"content":[{"type":"text","text":"npm run dev"}]},{"type":"paragraph","content":[{"type":"text","text":"这段代码块用于测试文章详情页的代码高亮和卡片内边距。"}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"本地环境"}]},{"type":"paragraph","content":[{"type":"text","text":"开发时需要让 Vite、Cloudflare 插件和本地 D1 状态保持一致。对于主题开发，最重要的是能快速刷新页面并看到布局变化。"}]},{"type":"codeBlock","attrs":{"language":"bash"},"content":[{"type":"text","text":"npm run dev"}]},{"type":"paragraph","content":[{"type":"text","text":"这段代码块用于测试文章详情页的代码高亮和卡片内边距。"}]}]}',
    'published',
    unixepoch('now', '-2 day'),
    NULL,
    unixepoch('now', '-2 day'),
    unixepoch('now', '-2 day')
  ),
  (
    '音乐播放器应该放在页面哪里',
    '悬浮播放器需要避开正文、回到顶部按钮和移动端菜单，位置比外观更影响实际体验。',
    3,
    'demo-floating-music-player',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"悬浮控件"}]},{"type":"paragraph","content":[{"type":"text","text":"播放器适合放在右下角，但要避免挡住主要操作。桌面端可以展示歌曲名和歌词，移动端则应该收敛宽度。"}]},{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"交互组件的第一原则是别挡内容。"}]}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"悬浮控件"}]},{"type":"paragraph","content":[{"type":"text","text":"播放器适合放在右下角，但要避免挡住主要操作。桌面端可以展示歌曲名和歌词，移动端则应该收敛宽度。"}]},{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"交互组件的第一原则是别挡内容。"}]}]}]}',
    'published',
    unixepoch('now', '-3 day'),
    NULL,
    unixepoch('now', '-3 day'),
    unixepoch('now', '-3 day')
  ),
  (
    '用 Bento 卡片组织个人主页',
    '个人博客首页不需要像营销页一样堆叠大段介绍，几个高信息密度的 Bento 区块更适合反复访问。',
    4,
    'demo-bento-homepage-layout',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"信息密度"}]},{"type":"paragraph","content":[{"type":"text","text":"Bento 布局可以把作者、文章入口、统计数据和社交链接放在首屏内，同时保持视觉节奏。"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"首屏展示身份和入口"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"卡片之间保持一致的圆角和透明度"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"列表内容下沉，避免抢走主视觉"}]}]}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"信息密度"}]},{"type":"paragraph","content":[{"type":"text","text":"Bento 布局可以把作者、文章入口、统计数据和社交链接放在首屏内，同时保持视觉节奏。"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"首屏展示身份和入口"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"卡片之间保持一致的圆角和透明度"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"列表内容下沉，避免抢走主视觉"}]}]}]}]}',
    'published',
    unixepoch('now', '-4 day'),
    NULL,
    unixepoch('now', '-4 day'),
    unixepoch('now', '-4 day')
  ),
  (
    'Cloudflare D1 与缓存失效小记',
    '当页面列表有 KV 缓存时，插入演示数据后需要同步更新缓存版本，否则页面可能继续显示旧数据。',
    6,
    'demo-cloudflare-d1-cache',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"缓存版本"}]},{"type":"paragraph","content":[{"type":"text","text":"这个项目会把文章列表缓存到 KV 中。发布新文章时，系统通过提升版本号让旧缓存自然失效。"}]},{"type":"paragraph","content":[{"type":"text","text":"演示数据也要遵循同样的规则，否则数据库里有文章，前台却可能仍然显示 0 篇。"}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"缓存版本"}]},{"type":"paragraph","content":[{"type":"text","text":"这个项目会把文章列表缓存到 KV 中。发布新文章时，系统通过提升版本号让旧缓存自然失效。"}]},{"type":"paragraph","content":[{"type":"text","text":"演示数据也要遵循同样的规则，否则数据库里有文章，前台却可能仍然显示 0 篇。"}]}]}',
    'published',
    unixepoch('now', '-5 day'),
    NULL,
    unixepoch('now', '-5 day'),
    unixepoch('now', '-5 day')
  ),
  (
    '一篇生活记录：把工作台整理到刚刚好',
    '生活类文章样例，用来观察长短标题混排、摘要截断和标签在卡片底部的表现。',
    2,
    'demo-desk-notes',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"日常片段"}]},{"type":"paragraph","content":[{"type":"text","text":"把桌面整理干净之后，写代码和写文章都会轻松一点。这个样例主要用于测试生活记录类文章在主题里的气质是否自然。"}]}]}',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"日常片段"}]},{"type":"paragraph","content":[{"type":"text","text":"把桌面整理干净之后，写代码和写文章都会轻松一点。这个样例主要用于测试生活记录类文章在主题里的气质是否自然。"}]}]}',
    'published',
    unixepoch('now', '-6 day'),
    NULL,
    unixepoch('now', '-6 day'),
    unixepoch('now', '-6 day')
  );

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-glass-blog-theme'
  AND t.name IN ('主题设计', '前端');

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-tanstack-start-local-notes'
  AND t.name IN ('前端', 'Cloudflare');

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-floating-music-player'
  AND t.name IN ('音乐', '主题设计');

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-bento-homepage-layout'
  AND t.name IN ('主题设计', '前端');

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-cloudflare-d1-cache'
  AND t.name IN ('Cloudflare', '性能优化');

INSERT OR IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.slug = 'demo-desk-notes'
  AND t.name IN ('生活记录');

INSERT INTO page_views (post_id, visitor_hash, created_at)
SELECT p.id, 'demo-viewer-theme-' || n.value, unixepoch('now', '-' || n.value || ' hour')
FROM posts p
JOIN (
  SELECT 1 AS value UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
) n
WHERE p.slug = 'demo-glass-blog-theme'
  AND NOT EXISTS (
    SELECT 1 FROM page_views pv
    WHERE pv.post_id = p.id AND pv.visitor_hash LIKE 'demo-viewer-theme-%'
  );

INSERT INTO page_views (post_id, visitor_hash, created_at)
SELECT p.id, 'demo-viewer-music-' || n.value, unixepoch('now', '-' || n.value || ' hour')
FROM posts p
JOIN (
  SELECT 1 AS value UNION ALL SELECT 2 UNION ALL SELECT 3
) n
WHERE p.slug = 'demo-floating-music-player'
  AND NOT EXISTS (
    SELECT 1 FROM page_views pv
    WHERE pv.post_id = p.id AND pv.visitor_hash LIKE 'demo-viewer-music-%'
  );

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-glass-blog-theme';

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df0852?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-tanstack-start-local-notes';

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-floating-music-player';

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-bento-homepage-layout';

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-cloudflare-d1-cache';

UPDATE posts
SET cover_image = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'demo-desk-notes';
