# Qadr manual QA checklist

Run before calling a release production-ready. Check off each item on **web** and at least one **native** build (`eas build --profile preview` or `expo run:ios` / `expo run:android`).

## Environment

- [ ] `.env` has `EXPO_PUBLIC_GROQ_API_KEY` (test AI-on path)
- [ ] `.env` has `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env` has Firebase vars + `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] Supabase migrations `001`, `002_firebase_auth.sql`, and `003_user_sessions.sql` applied
- [ ] Supabase Third-Party Firebase auth enabled; Firebase custom claims deployed
- [ ] Repeat critical flows **without** Groq key (local insights path)
- [ ] Optional: `npm run mind-extract` running + `EXPO_PUBLIC_CONTENT_EXTRACT_URL` set

## Splash and onboarding

- [ ] Branded splash shows Qadr logo (~1.2s) then fades into app
- [ ] Logged out (cloud): 3 onboarding slides with glass cards and icons
- [ ] Skip onboarding goes straight to sign-in
- [ ] Browser tab title shows **Qadr** (not undefined) on auth screens
- [ ] Sign-in shows app icon and official multicolor Google logo on white button
- [ ] After Google sign-in, onboarding not shown until sign out
- [ ] Local-only (no Firebase/Supabase env): splash then tabs, no onboarding gate

## Cloud auth and sync

- [ ] Sign in with Google (web popup or native account picker on dev build)
- [ ] First login uploads existing local data (`profiles.cloud_migrated_at` set)
- [ ] Add habit on device A → appears on device B after sign-in + sync
- [ ] Offline: add task → go online → **Sync now** or auto flush clears queue
- [ ] Settings → Account opens Clerk-style hub (shorter Settings scroll)
- [ ] Account: Google avatar, connected Google row, active sessions (IP + time)
- [ ] Custom dialogs: alerts/confirms use glass modals (no browser `alert`/`confirm` or native `Alert`)
- [ ] Account: Sign out shows custom confirm; delete is two-step (confirm → type email/uid exactly → Delete enabled)
- [ ] Account: Delete account hard-deletes cloud + Firebase; wrong typed phrase keeps Delete disabled
- [ ] Account: Export local backup downloads `.json` on web (or clipboard fallback)
- [ ] Sign out returns to auth screen; local cache retained
- [ ] Settings → App → Appearance **Dark / Light** toggles full UI; persists after reload
- [ ] Firebase console: Identity Platform + **TOTP MFA** enabled for 2FA tests
- [ ] Settings: bento layout (Your space hero, Bio-Sync, Personalize, Preferences, Security)
- [ ] Settings → Security → Enable 2FA (QR + 6-digit verify); sign out → sign in prompts authenticator code
- [ ] Settings → Account: 2FA on/off row matches Security card
- [ ] Settings → Bio-Sync: device label, sync frequency, Force sync now (cloud), Health & vitality link
- [ ] Native dev build: Settings → Bluetooth health device scan/connect (heart rate band); disconnect clears pairing
- [ ] Web: Bluetooth row shows “use mobile app” (no crash)

## Web (`npm run web`)

### Home

- [ ] Mood check-in saves and shows on briefing
- [ ] One thing displays; focus toggle starts suggested mode
- [ ] Daily goals toggle / add goal
- [ ] Health & Energy: sleep rings, energy dots, Bio-Sync link, habits CTA spacing OK
- [ ] Brain Dump FAB opens modal/screen

### Habits

- [ ] Log sleep (times via picker), update, delete
- [ ] Tap week strip day → form prefills or clears for new log
- [ ] Habit check-off persists after reload

### Ideas / Mind

- [ ] Capture URL or note; appears in vault
- [ ] Mind Spaces: create, rename, filter by space
- [ ] Open capture detail; tags / watched toggle
- [ ] **Share to Mind (native dev/EAS build):** Instagram Reel → Share → Qadr → spinner → “Good find! It's in your mind.”
- [ ] Share flow: **+ Add Tags/Notes** → add custom tag → Done → item in vault with tags
- [ ] Share flow: dismiss overlay returns to source app (no stuck on Qadr home)
- [ ] Share duplicate URL updates existing Mind item (no duplicate rows)

### Projects

- [ ] Create project, add task, toggle done
- [ ] Move idea to project

### More

- [ ] Brain Dump classifies lines (AI on; offline rules on failure)
- [ ] Weekly Review generates (AI on; local snapshot off)
- [ ] Assistant reply uses workspace data when AI off or fails
- [ ] Focus overlay timer pause/resume/end
- [ ] Bio-Sync: vitals, energy timeline sheet (7 days)
- [ ] Settings: locale, text size, Focus & schedule link, notifications row
- [ ] Account: backup export/import (Settings no longer hosts backup)
- [ ] Money: ledger, subscription due, expense

## Native (iOS or Android)

- [ ] Share extension / intent: Qadr appears in system share sheet for links (not available on web)
- [ ] App icon is Qadr mark (not Expo Go icon — requires dev/production build)
- [ ] Splash shows logo on black background
- [ ] Notification permission prompt; bedtime nudge schedules (Settings refresh)
- [ ] Subscription due notification fires on test device (optional)
- [ ] Contacts import for ledger (permission string OK)
- [ ] Photo picker for Mind save sheet
- [ ] Safe area / tab bar not clipped

## AI failure paths (Groq key set, simulate offline or invalid key)

- [ ] Brain Dump: alert + rule-based / local classification (not generic “global focus” copy)
- [ ] Assistant: alert + reply references habits/sleep/project when available
- [ ] Weekly Review: local or normalized fallback from your data

## Browser Extension (Web Clipper)

- [ ] Extension loads unpacked in `chrome://extensions/` with Developer Mode enabled without errors or warnings.
- [ ] Logged out state shows the branded "Sign In with Qadr Web" button and the crimson "Connect manually with Sync Key" fallback toggle.
- [ ] Tapping "Sign In with Qadr Web" opens `https://qadr-os.vercel.app` (or local port).
- [ ] Logging in on the Qadr web app automatically logs in the extension popup within seconds (Zero-input sync verification).
- [ ] Tapping "Save Link" in the popup successfully saves the tab, adds default tags, and slides a glowing glassmorphic crimson confirmation toast on the active page.
- [ ] Context Menu saving works: right-clicking a page, image, or text selection displays standard "Save to Qadr Mind" options and triggers the save toast.
- [ ] Recents feed displays the 5 most recent mind items in real-time.
- [ ] Logging out of the web app immediately logs out the extension popup.

## Build / release

- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (85 tests)
- [ ] `npx expo export --platform web` succeeds (if deploying web)
- [ ] `eas build --profile production` succeeds (requires `eas login` + linked project)

## Sign-off

| Platform | Tester | Date | Pass |
|----------|--------|------|------|
| Web      |        |      |      |
| iOS      |        |      |      |
| Android  |        |      |      |
