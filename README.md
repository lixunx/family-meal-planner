# Family Meal Planner

A mobile-first web app for planning tomorrow's meals (breakfast, lunch, dinner), tracking kitchen inventory, and managing family access.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (PostgreSQL, Auth, Row Level Security)
- **Vercel** (hosting, free tier)

## Features

- Google sign-in with email allowlist
- Role-based access: admin, editor (helper), viewer (son)
- Meals tab: tomorrow's plan, AI-ready rule-based recommendations, history
- Inventory tab: categorized stock list with quick add/edit
- Settings tab: language (EN / 简体中文), timezone, family management
- PWA manifest for Add to Home Screen on iPhone

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **SQL Editor**, run the migration:
   [`supabase/migrations/20250613000000_initial_schema.sql`](supabase/migrations/20250613000000_initial_schema.sql)
3. Seed your family emails in **SQL Editor**:

```sql
INSERT INTO family_allowlist (email, role) VALUES
  ('you@example.com', 'admin'),
  ('wife@example.com', 'admin'),
  ('helper@example.com', 'editor'),
  ('son@example.com', 'viewer');
```

### 3. Enable Google OAuth

1. **Supabase** → Authentication → Providers → Google → enable.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Add the Client ID and Secret to Supabase.

For local dev, also add redirect URL in Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in values from Supabase → Project Settings → API.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (free)

See **[DEPLOY.md](DEPLOY.md)** for the full production checklist.

Quick summary:

1. Push this repo to GitHub/GitLab
2. Import the project in [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy, then update Supabase **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`
5. Test Google sign-in on the production URL

## Recommendation engine

Rule-based v1 logic in `lib/recommendations/engine.ts`:

- Avoids repeating dishes from recent plans (3 days breakfast, 5 days lunch/dinner)
- Dinner balance: 1–2 veg, 1 protein, 1 soup
- Soft preference for dishes matching in-stock inventory
- Optional `llmSuggest` hook for future AI assist

## Project structure

```
app/
  (app)/          # Authenticated pages with bottom nav
  (auth)/login/   # Google sign-in
  auth/callback/  # OAuth callback
  actions/        # Server actions
components/       # UI components
lib/              # Supabase, i18n, recommendations, data layer
supabase/         # SQL migrations and seed
```

## License

Private / personal use.
