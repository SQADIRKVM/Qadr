<p align="center">
  <img src="assets/icon.png" alt="Qadr app icon" width="128" height="128" />
</p>

<h1 align="center">Qadr</h1>

<p align="center">
  <strong>Your personal workspace OS</strong> — habits, focus, projects, Mind, and Bio-Sync in one calm, local-first app.
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

Qadr is a cross-platform productivity app built with **Expo SDK 54** and **React Native**. It keeps your data on-device first, with optional **Google sign-in** and **Supabase** sync when you want the same workspace on web, iOS, and Android.

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
4. Web: `npx expo export --platform web`.
5. Native: `eas login` → `eas init` → `npm run build:ios` / `build:android`.

Preview builds: `npm run build:preview:ios` or `build:preview:android`.

---

## Docs

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) — framework reference for this repo
- [QA checklist](docs/QA_CHECKLIST.md) — release testing
- [AGENTS.md](AGENTS.md) — agent / contributor notes

---

<p align="center">
  <sub>Qadr · local-first workspace</sub>
</p>
