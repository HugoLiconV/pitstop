# Pitstop — Design Spec

Date: 2026-10-26
Status: Draft for review

## 1. Purpose

Pitstop is a personal, single-user web app to:

1. **Remind** me what maintenance is due or overdue on my car (by km and/or time).
2. **Keep a clean history** of everything done to the car, with costs and receipts as evidence.

Vehicle: Mazda 6 2015 Grand Touring Plus, Mexican market, 2.5L Skyactiv-G.

### Constraints
- Single user; no sign-up.
- Must cost $0 to run (free tiers only).
- UI in Spanish. Units: km, MXN, dates DD/MM/YYYY.
- Mobile-first (used at the shop / right after a service).

### Success criteria
- Opening the app shows at a glance what is overdue and what is due soon.
- Logging a service (with receipt photo/PDF) takes under a minute on a phone.
- Full history with spend totals is browsable and filterable by maintenance item.

## 2. Scope

**v1 (this spec):** dashboard with due-status, manual odometer updates, service logging with attachments, history, editable maintenance schedule, single-user login.

**Tracked for later (not v1):**
- **B — Email reminders** + periodic "update your km" nudge, via the existing Vercel cron.
- Multiple vehicles, fuel logging, English UI.

**Explicitly never (unless re-scoped):** extracting data from receipts (OCR/parsing). Attachments are evidence only.

## 3. Architecture

- **Next.js 16.4 (App Router), React 19, Tailwind 4, TypeScript, pnpm** — existing repo.
- **Server-first:** pages are Server Components reading Supabase on the server; mutations are Server Actions.
- **Supabase (free tier):** Postgres (data), Auth (email+password, single user), Storage (private `attachments` bucket).
- **Vercel (free tier):** hosting, preview deploys, weekly cron.
- Core logic (`computeDueStatus`) is a pure TypeScript module with no I/O, unit-tested in isolation.

Before writing Next.js code, consult `node_modules/next/dist/docs/` per `AGENTS.md` (this Next version has breaking changes).

### Units
- `lib/due/` — pure due-status calculation. Input: schedule items, service history, current km, today, thresholds. Output: per-item status.
- `lib/validation/` — Zod schemas for every form.
- `lib/supabase/` — server client factory (cookie-based session) and typed queries.
- `app/` — routes: `/login`, `/` (Inicio), `/servicios/nuevo`, `/historial`, `/historial/[id]`, `/plan`.
- `supabase/migrations/` — SQL migrations; `supabase/seed.sql` — vehicle + schedule from the owner's manual.

## 4. Data model

All tables have `id uuid pk`, `user_id uuid` (FK auth.users), `created_at`. RLS enabled on every table: `user_id = auth.uid()` for select/insert/update/delete.

| Table | Fields |
|---|---|
| `vehicles` | name, vin (nullable), plate (nullable), purchase_date, initial_km |
| `odometer_readings` | vehicle_id, date, km (int), source (`manual` \| `service`) |
| `maintenance_items` | vehicle_id, name, interval_km (nullable int), interval_months (nullable int), notes, active (bool), source (`manual` \| `custom`), manual_page (nullable text, e.g. `6-13`) |
| `services` | vehicle_id, date, km, workshop (nullable), total_cost_mxn (numeric, nullable), notes |
| `service_items` | service_id, maintenance_item_id, cost_mxn (nullable) |
| `attachments` | service_id, storage_path, file_name, mime_type, size_bytes |

At least one of `interval_km` / `interval_months` must be non-null (check constraint).

**Current km** = the highest-dated `odometer_readings` row (ties: highest km).

## 5. Due-status logic

For each active maintenance item:

- **Baseline** = most recent service containing the item (its date and km). If none: vehicle `purchase_date` and `initial_km`.
- `next_km = baseline_km + interval_km` (if interval_km set)
- `next_date = baseline_date + interval_months` (calendar months; clamp to month end, e.g. 31 Jan + 1 month = 28/29 Feb)
- **Vencido** if `current_km >= next_km` OR `today >= next_date`.
- **Próximo** if not Vencido and (`next_km - current_km <= 1000` OR `next_date - today <= 30 days`).
- **OK** otherwise.
- Output also includes `km_remaining` and `days_remaining` (null when not applicable) for display ("faltan 800 km · 3 semanas").

Thresholds (1000 km, 30 days) are constants in one config module.

## 6. Screens (Spanish UI)

1. **Inicio** — current km + "Actualizar km" (single-field form); Vencido list, then Próximo list with remaining km/time; collapsed "Todo al día"; primary "+ Registrar servicio".
2. **Registrar servicio** — date, km (prefilled current), taller, costo total; checklist of maintenance items (Vencido/Próximo first) with optional per-item cost; attach files (camera-friendly input). Save = one transaction creating service + service_items + odometer reading (source `service`); then upload files.
3. **Historial** — services newest first (date, km, taller, total, items); filter by maintenance item; spend totals (this year, all-time). Detail page lists items and attachments (open via signed URL, delete).
4. **Plan de mantenimiento** — items with intervals, last done, next due; edit intervals, deactivate, add custom items. Items from the manual show a "Manual Mazda" tag; edits are always allowed.
5. **Login** — email/password. Sign-up disabled in Supabase; the single account is created once from the dashboard. All other routes require a session.

## 7. Design direction

Follows the licon-craft family rules (warm ground, calm hierarchy, honest copy). Pitstop's own character:

- **Signature colour:** motor-oil amber `#B86A1B` (darker `#8A4D10` for text contrast). Used only for the current km, the primary action and Próximo items. Vencido = muted brick red. OK = quiet sage. Not Mazda Soul Red.
- **Ground and ink:** bone `#F5F1EA` and warm near-black text. Dark mode uses warm charcoal.
- **Type:** Barlow (UI) + Barlow Semi Condensed with tabular figures (km, MXN, dates), via Google Fonts.
- **Signature moment:** the odometer. On Inicio the current km is the largest element, shown as odometer digits. Saving "Actualizar km" rolls the digits to the new value (~400 ms), then the due list re-sorts calmly. With reduced motion turned on, the value simply changes.
- **Name and tone:** Pitstop. Copy reads like a straight-talking mechanic friend, e.g. "Te faltan 800 km para el cambio de aceite", "Todo al día. Nos vemos en 3 meses".
- **Hierarchy on Inicio:** km, then one summary line ("2 pendientes" or "Todo al día"), then the list. One primary action: "+ Registrar servicio".
- **Honest numbers:** intervals show their source ("Manual Mazda · p. 6-13"). Money is MXN (`$1,850.00`). Dates are DD/MM/YYYY.
- **Written states:**
  - First run: "Sin servicios todavía. Registra el último que recuerdes y empezamos desde ahí."
  - Upload failure: "No se subió la factura. El servicio sí quedó guardado. Reintentar."
  - Offline: "Sin conexión. Tus datos están a salvo."
  - Database paused or unreachable: a friendly retry message.
- **Kept out:** charts, car photos or illustrations, and per-row badges or icons.
- **Account:** login and cloud storage are a deliberate exception to local-first (phone access at the shop, receipt storage). The login screen says "Solo tú tienes acceso."

## 8. Attachments

- Evidence only: never parsed, never used to fill fields.
- Private Supabase Storage bucket, path `{user_id}/{service_id}/{uuid}-{filename}`; storage RLS restricts to owner.
- Allowed: PDF, JPEG, PNG, HEIC; max 10 MB per file; multiple per service.
- Viewed through short-lived signed URLs. HEIC may not preview in all browsers; it is offered as a download.
- Free tier is 1 GB storage — acceptable for expected volume.

## 9. Seed schedule (owner's manual)

Source: *Mazda 6 2015 Manual del propietario* (`context/6-2015-manual-del-propietario.pdf`), section 6 "Programa de mantenimiento", table **"Excepto Israel/Rusia/Bielorrusia/Azerbaiyán/Kazajistán"** (pp. 6-13 to 6-16). This is the international table that applies to Mexico. Rule: months or km, **whichever comes first**. Only SKYACTIV-G 2.5 rows apply.

Note: mazda.mx advertises scheduled services every 10,000 km / 12 months. The manual is stricter (10,000 km / **6 months**). We seed the manual's values; I can edit them in the app.

All seeded items get `source = manual`.

| Item | interval_km | interval_months | Manual |
|---|---|---|---|
| Cambio de aceite de motor y filtro | 10,000 | 6 | R every interval |
| Rotación de neumáticos | 10,000 | — | "Rotar cada 10.000 km" |
| Inspección de neumáticos y presión | 10,000 | 6 | I |
| Inspección de frenos de disco y freno de mano | 10,000 | 6 | I |
| Inspección de correas de mando | 10,000 | 6 | I |
| Filtro de aire de cabina | 20,000 | 12 | R |
| Inspección de batería | 20,000 | 12 | I |
| Inspección de sistema de enfriamiento | 20,000 | 12 | I |
| Inspección de líneas de freno y mangueras | 20,000 | 12 | I |
| Inspección de dirección y suspensión | 20,000 | 12 | I |
| Inspección de líneas de combustible | 20,000 | 12 | I |
| Pernos y tuercas de chasis y carrocería (apretar) | 20,000 | 12 | T |
| Filtro de aire de motor (cambio) | 60,000 | 36 | C C R pattern; cleaned in between |
| Líquido de frenos | 40,000 | 24 | R every 4th interval |
| Sistema evaporativo (inspección) | 40,000 | 24 | I |
| Inspección de fundas de ejes | 40,000 | 24 | I |
| Filtro de combustible | 60,000 | — | "Cambie cada 60.000 km" |
| Cubierta térmica del escape (inspección) | 80,000 | — | "Inspeccione cada 80.000 km" |
| Bujías de encendido | 120,000 | — | "Cambie cada 120.000 km" |
| Refrigerante de motor (FL-22) | 200,000 | 120 | First change 200,000 km / 10 years, then 100,000 km / 5 years |
| Condición de carrocería (óxido/corrosión) | — | 12 | "Inspeccione anualmente" |

Notes:
- **Coolant:** v1 models one interval per item. Seed the first-change interval. After the first change, I edit it to 100,000 km / 60 months (stated in the item's `notes`).
- **Severe conditions** (heat, dust, mountains, short trips, idling) call for more frequent oil, belts and brake fluid (fluid yearly). These are noted on the items, not modeled.
- **Automatic transmission fluid** has no scheduled change in the manual and is not seeded. I can add it as a custom item.
- The manual's inspection items are grouped above to keep the list short. They can be split or removed in the app.

## 10. Error handling

- All Server Actions validate input with Zod; field-level Spanish error messages.
- Odometer: a reading is checked against neighboring readings *by date*. It must not be below the latest earlier reading or above the earliest later one, so back-entering old services works. A jump of more than 5,000 km over the previous reading requires explicit confirmation.
- "Today" is computed in `America/Mexico_City`, not server UTC.
- Service save is a single Postgres function call (RPC) so service + items + odometer reading commit together. Attachment upload happens after; on failure the service persists and the detail page shows "reintentar adjunto".
- Unexpected errors → `error.tsx` page in Spanish. Missing/expired session → redirect to `/login`.

## 11. Testing

- **Vitest unit tests** for `lib/due/` (km-only, time-only, both; never-serviced item; Próximo thresholds; month-end clamping; inactive items excluded).
- **Vitest unit tests** for Zod schemas (odometer rules, file type/size limits, required fields).
- No end-to-end tests in v1.

## 12. Deployment ($0)

- Vercel Hobby connected to the GitHub repo; preview deploys on PRs.
- Supabase Free: migrations versioned in `supabase/migrations/`, applied with the Supabase CLI.
- Env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CRON_SECRET`. The service-role key is not needed in v1 and is never shipped to the client.
- **Keep-alive cron:** weekly Vercel cron hits `/api/cron/keepalive` (protected by `CRON_SECRET`), which runs a trivial query so the free Supabase project does not pause after 7 days of inactivity. Future email reminders (B) will extend this route.
