-- Assistant conversations. Messages are stored in the AI SDK UIMessage format (parts as jsonb).

create table chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null default 'Nueva conversación',
  model text not null default 'gpt-6-luna' check (model in ('gpt-6-luna', 'gpt-6.1-terra')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chats_user_updated on chats (user_id, updated_at desc);

create table chat_messages (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  chat_id uuid not null references chats on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  parts jsonb not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index chat_messages_chat_created on chat_messages (chat_id, created_at);

do $$
declare t text;
begin
  foreach t in array array['chats','chat_messages'] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy owner_all on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
