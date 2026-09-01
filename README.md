# 待办清单 + 番茄钟

所有访问者通过服务端共享同一份 Supabase 状态。

## Supabase 初始化

1. 在 Supabase 的 SQL Editor 中执行 [`outputs/supabase.sql`](outputs/supabase.sql)。
2. 复制 `.env.example` 为 `.env`，填入项目 URL 和 publishable/anon key。
3. 启动：`node outputs/server.js`
4. 打开：`http://localhost:8788/todo-pomodoro.html`

这里使用 Supabase 的 publishable/anon key 配合 RLS；不要把 `service_role` 密钥写入网页代码或提交到 GitHub。
