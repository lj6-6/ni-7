create table if not exists public.todo_pomodoro_state (
  id integer primary key check (id = 1),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.todo_pomodoro_state enable row level security;

revoke insert, update on table public.todo_pomodoro_state from anon;
grant select on table public.todo_pomodoro_state to anon, authenticated;
grant insert, update on table public.todo_pomodoro_state to authenticated;

drop policy if exists "shared state can be read" on public.todo_pomodoro_state;
create policy "shared state can be read"
  on public.todo_pomodoro_state for select
  to anon, authenticated
  using (true);

drop policy if exists "shared state can be created" on public.todo_pomodoro_state;
create policy "shared state can be created"
  on public.todo_pomodoro_state for insert
  to authenticated
  with check (id = 1 and (auth.jwt() ->> 'email') = 'lj6-6@users.noreply.github.com');

drop policy if exists "shared state can be updated" on public.todo_pomodoro_state;
create policy "shared state can be updated"
  on public.todo_pomodoro_state for update
  to authenticated
  using (id = 1 and (auth.jwt() ->> 'email') = 'lj6-6@users.noreply.github.com')
  with check (id = 1 and (auth.jwt() ->> 'email') = 'lj6-6@users.noreply.github.com');

insert into public.todo_pomodoro_state (id, state)
values (1, '{"tasks": [], "focusId": null, "rounds": 2, "mode": "work", "workMinutes": 30, "breakMinutes": 5, "timerRunning": false, "timerEndAt": null, "timerSecondsLeft": 1800, "updatedAt": 1788263991278}'::jsonb)
on conflict (id) do nothing;
