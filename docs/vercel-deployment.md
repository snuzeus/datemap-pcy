# Vercel Deployment Checklist

## 1. Project

- Import this repository into Vercel.
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave empty.

## 2. Environment Variables

Add the same keys to both Preview and Production unless a provider requires a separate callback/domain.

| Key | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview, Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview, Production | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview, Production | Server-only. Required for cron upserts |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Preview, Production | Kakao JavaScript key |
| `KAKAO_REST_API_KEY` | Preview, Production | Kakao Local REST API key |
| `GOOGLE_PLACES_API_KEY` | Preview, Production | Place and region photos |
| `SEOUL_API_KEY` | Production | Seoul realtime city data collection |
| `CRON_SECRET` | Preview, Production | Random long value. Vercel Cron sends it as `Authorization: Bearer ...` |

## 3. OAuth Redirect URLs

Add every deployed domain that users can sign in from.

### Supabase Auth

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: production domain, for example `https://your-domain.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/api/auth`
  - `https://your-domain.vercel.app/api/auth`
  - Any active Vercel preview domain used for QA

### Google OAuth

In Google Cloud Console > Credentials > OAuth client:

- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://your-domain.vercel.app`
- Authorized redirect URIs:
  - Supabase callback URL from Supabase Google provider settings

### Kakao OAuth

In Kakao Developers > Product Settings > Kakao Login:

- Redirect URI:
  - Supabase callback URL from Supabase Kakao provider settings
- Platform Web site domain:
  - `http://localhost:3000`
  - `https://your-domain.vercel.app`

## 4. Cron Jobs

`vercel.json` registers these schedules:

| Path | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/regions` | Daily 15:00 UTC | Seed and sync region catalog |
| `/api/cron/seoul-population` | Daily 01:00 UTC | Refresh realtime congestion and hot score |
| `/api/cron/region-images` | Weekly Sunday 16:00 UTC | Refresh region representative photos |

After the first production deployment, run `/api/cron/regions` once from Vercel or locally with `Authorization: Bearer CRON_SECRET` so the region table is initialized before user traffic.

## 5. Smoke Test

- Open `/` and confirm region ranking loads.
- Open a new region such as `/region/jamsil` and confirm 30 places load.
- Open a place detail and confirm the map chunk loads without `/_next/undefined`.
- Sign in with Google and Kakao.
- Save a place, open `/saved`, create a course, and open the share page.
