# SURAKSHA

A school disaster-preparedness platform for students, teachers and administrators in India.

- **Students:** Safety Path lessons and quizzes, daily 5-video modules with a final quiz, games, live NDMA alerts, an AI safety companion, XP and levels.
- **Teachers:** release assigned modules to their class, schedule drills.
- **Admins:** assign modules, broadcast alerts, view school rankings and analytics.

Built with Next.js 15 (App Router), React, TypeScript, Tailwind + shadcn/ui, Firebase (Auth + Firestore), Genkit with the Groq API, and the NDMA SACHET public alert feed.

## Run it locally

**Prerequisites:** Node.js 20+, a Firebase project (Authentication with email/password enabled, and Firestore), a [Groq API key](https://console.groq.com/keys).

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed:school-codes # one-time: creates the school signup codes in Firestore
npm run dev               # http://localhost:9002
```

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | AI chatbot and quiz flows |
| `NEXT_PUBLIC_FIREBASE_*` (6 values) | Firebase web app config (Project settings → General) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Service-account JSON on **one line**; needed by the server routes (chat auth, school stats, signup code check) |
| `EMAIL_USER`, `EMAIL_PASS` | Optional: Gmail address and app password for alert emails |

`.env` is git-ignored. Never commit it.

### Firestore rules

Publish `firestore.rules` (Firebase Console → Firestore → Rules, or `npm run firebase:deploy:rules`). See `DEPLOY_FIRESTORE_RULES.md`.

### Admin account

Admin access is granted by email in `src/app/api/check-admin-email/route.ts` and `src/contexts/auth-context.tsx`. Replace the address there with your own before first use.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 9002 |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run genkit:dev` | Genkit developer UI for the AI flows |
| `npm run security:check` | Checks your `.env` for placeholder or unsafe values |

## Project layout

```
src/app/(auth)      login and signup
src/app/(main)      dashboards, Safety Path, modules, games, alerts, rankings, admin pages
src/app/api         chat, school-stats, ndma-alerts, validate-school-code, check-admin-email
src/ai              Genkit flows (chatbot, simulation quiz, safe-spot quiz, email alert)
src/lib             data, scoring and Firestore helpers
firestore.rules     security rules
```
