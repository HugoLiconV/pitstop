# Pitstop

Mantenimiento de mi Mazda 6 2015: qué toca, qué ya se hizo y cuánto ha costado.
Single-user, Spanish UI, $0 to run (Vercel Hobby + Supabase Free).

Design spec: `docs/superpowers/specs/2026-10-26-pitstop-design.md`

## Local development

Requires Docker (for local Supabase) and pnpm.

```bash
pnpm install
pnpm supabase start          # ports 5532x; applies migrations and supabase/seed.sql
cp .env.example .env.local   # fill with the local URL (http://127.0.0.1:55321) and anon key from `pnpm supabase status`
pnpm dev
```

Local login: `dev@pitstop.local` / `pitstop-dev` (created by `supabase/seed.sql`, local only).

Tests: `pnpm test` (Vitest) and `pnpm supabase test db` (RLS, pgTAP).

## Production setup (one time)

1. **Supabase:** create a free project. Link it with `pnpm supabase link --project-ref <ref>` and run `pnpm supabase db push`.
2. **Auth:** under Authentication → Sign In / Providers, turn off "Allow new users to sign up". Create your user under Authentication → Users.
3. **Seed your car:** in the SQL editor, run
   `select seed_pitstop('<your user id>', <current km>, '<YYYY-MM-DD purchase or start date>');`
   Past services can then be added from the app; old dates and lower km are accepted.
4. **Vercel:** import the GitHub repo and set these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET` (any long random string)

   Then deploy. `vercel.json` schedules a weekly keep-alive to `/api/cron/keepalive`, so the free database doesn't pause.

## Free-tier limits worth knowing

- Supabase Storage: 1 GB in total for receipts. Each file is limited to 10 MB.
- Supabase pauses a free project after 7 idle days. The weekly cron prevents this.
