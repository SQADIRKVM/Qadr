<p align="center">
  <img src="assets/icon.png" alt="Qadr app icon" width="128" height="128" />
</p>

<h1 align="center">Qadr</h1>

<p align="center">
  <strong>Your personal workspace OS</strong>
</p>

<p align="center">
  Habits, focus, projects, Mind, and Bio-Sync — one calm, local-first app for how you live and build.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000000?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#features">Features</a> ·
  <a href="#cloud-sync">Cloud sync</a> ·
  <a href="#docs">Docs</a>
</p>

---

## Overview

**Qadr — Your personal workspace OS** is a cross-platform productivity app built with **Expo SDK 54** and **React Native**. It keeps your data on-device first, with optional **Google sign-in** and **Supabase** sync when you want the same workspace on web, iOS, and Android.

| Platform | Support |
|----------|---------|
| Web | `npm run web` |
| iOS | Expo dev client / EAS build |
| Android | Expo dev client / EAS build |

---

## Features

| Area | What you get |
|------|----------------|
| **Home** | Daily briefing, mood, one thing, focus mode, goals, health & energy |
| **Ideas** | Idea vault, Sunday review, Mind spaces |
| **Habits** | Habit tracking and sleep log |
| **Projects** | Active project, queue, milestones, to-dos, post-mortems |
| **More** | Brain Dump, Weekly Review, Assistant, Focus overlay, Bio-Sync, Money, Decisions |
| **Settings** | Appearance, Bio-Sync, authenticator 2FA, locale, device pairing |
| **Account** | Google profile, cloud sync, sessions, backup export/import |

**Money** — ledger, subscriptions, expenses, income, and cashflow snapshot.

**Security** — optional **authenticator-app** two-factor (Google Authenticator, 1Password, etc.) via Firebase TOTP. Requires one-time project setup in Firebase (see [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md)).

---

## Quick start

### Requirements

- Node.js **20+**
- npm
- Expo Go, simulator, or dev build for device testing

### Install and run

```bash
git clone https://github.com/YOUR_USERNAME/Qadr.git
cd Qadr
npm install
cp .env.example .env   # then fill in keys (see below)
npx expo start
```

Press **`w`** for web, **`i`** for iOS simulator, **`a`** for Android.

### Environment

Copy [`.env.example`](.env.example) to `.env` (never commit `.env` — it is gitignored).

**Minimum for local-only use:** no Firebase/Supabase vars — app runs without sign-in.

**Cloud + AI:** see [Cloud sync](#cloud-sync) and [AI](#ai-optional) below.

---

## Brand assets

Source artwork: [`assets/qadr.png`](assets/qadr.png) (750×750).

| File | Size | Use |
|------|------|-----|
| [`icon.png`](assets/icon.png) | 1024×1024 | iOS / Android app icon |
| [`adaptive-icon.png`](assets/adaptive-icon.png) | 1024×1024 | Android adaptive foreground |
| [`favicon.png`](assets/favicon.png) | 48×48 | Web tab icon |
| [`splash-icon.png`](assets/splash-icon.png) | 512×512 | Splash screen |

Regenerate after editing `qadr.png` (macOS):

```bash
cd assets
sips -z 1024 1024 qadr.png --out icon.png && cp icon.png adaptive-icon.png
sips -z 48 48 qadr.png --out favicon.png
sips -z 512 512 qadr.png --out splash-icon.png
```

Restart with a clean cache: `npx expo start --web --clear`.

---

## Cloud sync

**Auth:** Google via [Firebase](https://console.firebase.google.com) (`qadr-408c7`).  
**Data:** [Supabase](https://supabase.com) per-domain JSON sync.

### Firebase

1. Enable **Google** sign-in in Firebase Authentication.
2. Add a **Web** app; copy Web Client ID → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
3. Deploy [custom claims](https://supabase.com/docs/guides/auth/third-party/firebase-auth#firebase-cloud-functions) (`role: authenticated`) for Supabase JWT trust.
4. Copy [`google-services.json.example`](google-services.json.example) to `google-services.json` at project root (download the real file from Firebase Console → Project settings → Your apps → Android). This file is **gitignored** and must not be committed.

### Supabase

1. Run migrations [`001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql), [`002_firebase_auth.sql`](supabase/migrations/002_firebase_auth.sql), and [`003_user_sessions.sql`](supabase/migrations/003_user_sessions.sql).
2. **Authentication → Third-Party → Firebase** — connect project `qadr-408c7`.
3. Disable Supabase Email/Magic Link (unused).

### Env vars

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=qadr-408c7.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=qadr-408c7
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

Restart → **Continue with Google**. First login uploads local data; later changes sync across devices.

**Native Google Sign-In** does not work in Expo Go — use a dev client or EAS build:

```bash
npx expo prebuild
npx expo run:android
# or: npm run build:preview:android
```

---

## AI (optional)

```env
EXPO_PUBLIC_AI_PROVIDER=groq
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_GROQ_MODEL=llama-3.1-8b-instant
```

Without a Groq key, Brain Dump, Weekly Review, and Assistant use **local insights** from your workspace data. Optional Ollama settings are in [`.env.example`](.env.example).

### Mind link previews

```bash
npm run mind-extract
```

Set `EXPO_PUBLIC_CONTENT_EXTRACT_URL=http://localhost:8787/` in `.env`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run web` | Web |
| `npm run ios` | iOS |
| `npm run android` | Android |
| `npm test` | Unit tests (`src/utils`) |
| `npm run build:ios` | EAS production iOS |
| `npm run build:android` | EAS production Android |

---

## Backup and restore

**Account → Export local backup** downloads all Zustand stores as JSON. **Restore from backup** imports pasted JSON (restart the app after import).

---

## Production checklist

1. Set `EXPO_PUBLIC_GROQ_API_KEY` if you want full AI.
2. `npm test` and `npx tsc --noEmit`.
3. Manual QA: [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md).
4. Web: `npm run build:web` (static export to `dist/`).
5. Native: `eas login` → `eas init` → `npm run build:ios` / `build:android`.

Preview builds: `npm run build:preview:ios` or `build:preview:android`.

### Share to Mind (Instagram, Reels, links)

Qadr registers as a **share target** on iOS and Android (via [`expo-share-intent`](https://github.com/achorein/expo-share-intent)). From another app → **Share** → **Qadr**:

1. The link is **saved to Mind immediately** (background enrich when AI is configured).
2. A glass overlay shows **“Good find! It's in your mind.”**
3. **+ Add Tags/Notes** opens tag editor + notes, then dismisses back to the source app.

**Requires a dev client or EAS build** (not Expo Go). After pulling:

```bash
npm install
npx expo prebuild --clean
eas build --profile preview --platform ios   # or android
```

**iOS:** Enable **App Groups** (`group.com.sqadirkvm.qadr`) for the main app and **Qadr Share** extension in Apple Developer. EAS should provision both targets.

**Android:** Share uses `ACTION_SEND` for `text/*` (URLs and captions).

**EAS file secret:** Upload `google-services.json` as a file env var (`GOOGLE_SERVICES_JSON`) — see [Expo file env vars](https://docs.expo.dev/eas/environment-variables/#file-environment-variables).

---

## Deploy web on Vercel

Expo web is a **static export** (`dist/`). Vercel runs the build and serves those files.

### 1. Push to GitHub

Ensure the repo is on GitHub (e.g. `SQADIRKVM/Qadr`).

### 2. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import **Qadr**.
2. Framework Preset: **Other** (or let Vercel read [`vercel.json`](vercel.json)).
3. **Build Command:** `npm run build:web`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### 3. Environment variables (required for cloud + AI)

In Vercel → Project → **Settings** → **Environment Variables**, add the same `EXPO_PUBLIC_*` keys as your local `.env` (Production + Preview):

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GROQ_API_KEY` (optional, for AI)

Redeploy after adding variables — they are baked in at **build time**.

### 4. Firebase authorized domains

Firebase Console → **Authentication** → **Settings** → **Authorized domains** → add:

- `qadr-os.vercel.app` (production web app)
- Any other `*.vercel.app` preview hostnames you use
- Your custom domain (if any)

Also add the same hostnames under [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your OAuth Web client → **Authorized JavaScript origins**.

Without this, Google sign-in fails on the deployed URL with `auth/unauthorized-domain`.

### 5. Deploy

Click **Deploy**, or push to `main` for automatic deploys.

Local test before Vercel:

```bash
npm run build:web
npx serve dist
```

Confirm `dist/manifest.json`, `dist/icon-192.png`, and `dist/icon-512.png` exist after export.

### 6. PWA (installable web app)

The web build ships a [Web App Manifest](public/manifest.json) and icons (`public/icon-192.png`, `public/icon-512.png`). After deploy:

- **Chrome / Edge:** address bar → **Install Qadr** (or menu → Install app)
- **Safari (iOS):** Share → **Add to Home Screen**

Offline caching is not enabled in v1 (manifest + installability only).

### 7. Browser tab title

The static export sets `<title>Qadr</title>`. At runtime, React Navigation updates `document.title` from the active route. When signed out, the auth screen is not a navigator route, so the default formatter would set the tab to `undefined`. [`App.tsx`](App.tsx) passes a `documentTitle` formatter that falls back to **Qadr** when there is no route title or name.

---

## Docs

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) — framework reference for this repo
- [QA checklist](docs/QA_CHECKLIST.md) — release testing
- [AGENTS.md](AGENTS.md) — agent / contributor notes

---

<p align="center">
  <sub><strong>Qadr</strong> · Your personal workspace OS</sub>
</p>
