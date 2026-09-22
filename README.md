# NAHS Attendance & Stats Platform

A mobile-first web app for a National Art Honor Society (NAHS) chapter. Members sign in with their
school Google account, check into weekly meetings with an admin-generated code, and track their
attendance, SSL hours, and activities. Admins get a full console for meetings, members, activities,
and analytics.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres/Auth/RLS)**, and
styled with an NAHS rainbow-accented design system.

---

## Features

### Members
- Google sign-in with school email, then a quick onboarding (name + grade). New members wait for
  admin approval.
- One-tap **check-in** by entering the meeting code (validated server-side).
- **Attendance stats**: rate %, meetings attended, current/longest streak, trend chart, full history.
- **SSL hours**: total vs. goal, breakdown by activity category, per-activity list, and manual
  adjustments.
- **Events**: upcoming and past meetings + activities.
- **Profile**: edit name/grade, see standing.

### Admins
- **Meetings**: create/edit/delete, generate a time-limited check-in code (with QR), open/close
  check-in, view live attendee list, manually add/remove attendees, export CSV.
- **Members**: approve pending sign-ups, set active/inactive, promote/demote admins, edit details,
  adjust SSL hours, search/filter, export CSV.
- **Activities**: create projects (e.g. Holiday Cards), record participants and award SSL hours.
- **Analytics**: attendance trends, avg rate by grade, SSL hours by category, leaderboards, and a
  "members at risk" list with export.
- **Announcements**: post updates shown on member dashboards.
- **Settings**: chapter name, meeting day, required attendance %/SSL hours, code length/window.

---

## Tech & security notes
- Auth and data access use Supabase with **Row Level Security**. Members can only read their own
  attendance/hours; admins have full access via an `is_admin()` policy helper.
- Check-in codes live in a separate, **admin-only** table so members can never read an active code
  to check in without being present. Check-in runs through a `check_in(code)` `SECURITY DEFINER`
  function that validates the code and its time window before recording attendance.

---

## Getting started

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

### 2. Run the database migration
In the Supabase dashboard, open the **SQL Editor** and run the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates all tables,
policies, triggers, the `check_in` function, and seeds the settings row.

### 3. Enable Google auth
1. In Supabase, go to **Authentication → Providers → Google** and enable it.
2. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/) and add
   the Supabase callback URL shown in the provider settings.
3. (Optional) Restrict sign-ups to your school domain via Google or Supabase settings.

### 4. Configure environment variables
Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Make yourself an admin
Sign in once with Google and complete onboarding. Then, in the Supabase **SQL Editor**, promote your
account.

A guard trigger (`trg_protect_profile`) blocks non-admins from changing `role`/`status`, and the SQL
editor runs without a logged-in user, so it counts as a non-admin. For the **first** admin, disable
that trigger for the update, then re-enable it:

```sql
alter table public.profiles disable trigger trg_protect_profile;

update public.profiles
set role = 'admin', status = 'active'
where email = 'you@yourschool.org';

alter table public.profiles enable trigger trg_protect_profile;
```

Refresh the app — you'll now have the **Admin console**. From there you can promote other members
without touching SQL again.

---

## Deploying to Vercel
1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com).
3. Add the same environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   and `NEXT_PUBLIC_SITE_URL` set to your production URL).
4. In Supabase **Authentication → URL Configuration**, add your Vercel domain to the allowed redirect
   URLs.
5. Deploy.

---

## Project structure

```
src/
  app/
    (member)/        Member area (dashboard, check-in, attendance, hours, events, profile)
    admin/           Admin console (dashboard, meetings, members, activities, analytics, ...)
    auth/            OAuth callback + sign-out routes
    onboarding/, pending/, page.tsx (landing)
  components/
    ui/              Reusable primitives (button, card, dialog, table, ...)
    admin/, member/  Feature components
    charts/          Recharts visualizations
    shared/, layout/, brand/
  lib/
    supabase/        Browser/server clients + session proxy
    actions/         Server actions (profile, admin mutations)
    queries/         Server-side data fetching + stats aggregation
    stats.ts, constants.ts, types.ts, utils.ts, csv.ts
supabase/
  migrations/0001_init.sql
```

## Design system
- **Palette:** neutral canvas with NAHS rainbow accents (red, orange, yellow, green, cyan, blue,
  violet); violet `#7C3AED` anchors the brand. Grades and activity categories are color-coded.
- **Type:** Fraunces (display) + Inter (body).
- Accessible touch targets, visible focus rings, and reduced-motion support are built in.
