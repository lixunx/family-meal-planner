# Production deployment guide

Deploy the app to **Vercel** (free) using your existing **Supabase** project.

## Prerequisites

- [ ] Supabase project running with migrations applied
- [ ] Google OAuth enabled in Supabase
- [ ] GitHub or GitLab account (for Vercel to pull code)
- [ ] [Vercel account](https://vercel.com/signup) (free)

---

## Step 1: Push code to Git

From the project folder:

```bash
cd /Users/lixun.lin/Workspace/meal-planner

# One-time: set your git identity if not configured
git config user.email "you@example.com"
git config user.name "Your Name"

git add -A
git commit -m "feat: family meal planner app"
```

Create a new repo on GitHub or GitLab, then:

```bash
git remote add origin git@github.com:YOUR_USER/meal-planner.git
git push -u origin main
```

---

## Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your `meal-planner` repository
3. Framework should auto-detect **Next.js** — leave defaults
4. Add **Environment Variables** (copy from your `.env.local`):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

5. Click **Deploy**
6. Wait ~2 minutes — you'll get a URL like `https://meal-planner-xxx.vercel.app`

---

## Step 3: Update Supabase auth URLs

In Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://your-app.vercel.app` |
| **Redirect URLs** | add `https://your-app.vercel.app/auth/callback` |

Keep `http://localhost:3000/auth/callback` if you still develop locally.

---

## Step 4: Update Google OAuth redirect URIs

In [Google Cloud Console](https://console.cloud.google.com/) → your OAuth client → **Authorized JavaScript origins**:

```
https://your-app.vercel.app
```

Supabase callback stays the same:

```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

(No change needed unless you created a separate Google client per environment.)

---

## Step 5: Test production

1. Open `https://your-app.vercel.app`
2. Sign in with Google (use an email on your `family_allowlist`)
3. Test meals, inventory, and settings on your phone
4. On iPhone: Safari → Share → **Add to Home Screen**

---

## CLI alternative (optional)

If you prefer the terminal:

```bash
npm i -g vercel
vercel login
vercel --prod
```

When prompted, add the same Supabase env vars.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sign-in redirects to localhost | Update Supabase Site URL + Redirect URLs to Vercel domain |
| "Not on family allowlist" | Add your Gmail to `family_allowlist` table in Supabase |
| Google sign-in fails | Check Supabase Google provider Client ID/Secret |
| Blank page after login | Check Vercel deployment logs; verify env vars are set |

---

## Custom domain (optional)

Vercel → Project → **Settings** → **Domains** → add e.g. `meals.yourfamily.com`

Then update Supabase Site URL and Redirect URLs to match.
