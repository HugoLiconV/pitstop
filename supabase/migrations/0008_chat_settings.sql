-- Per-chat assistant settings: how much the model reasons and its output cap (reasoning tokens included).
alter table chats
  add column reasoning_effort text not null default 'low' check (reasoning_effort in ('none', 'low', 'medium', 'high')),
  add column max_output_tokens integer not null default 4000 check (max_output_tokens in (4000, 8000, 16000));
