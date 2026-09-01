# 待办清单 + 番茄钟

所有访问者直接通过 GitHub Pages 访问网页，并共享同一份 Supabase 状态，不需要 Render。

## Supabase 初始化

1. 在 Supabase 的 SQL Editor 中执行 [`outputs/supabase.sql`](outputs/supabase.sql)。
2. 复制 `.env.example` 为 `.env`，填入项目 URL 和 publishable/anon key。
3. 在 GitHub 仓库的 Settings → Pages 中，将 `main` 分支的根目录设为发布来源。
4. 打开 GitHub Pages 提供的网址。

本地测试仍可执行：`node outputs/server.js`。

这里使用 Supabase 的 publishable/anon key 配合 RLS；不要把 `service_role` 密钥写入网页代码或提交到 GitHub。
