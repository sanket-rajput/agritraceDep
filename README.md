# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## 🔐 Secrets & Environment Variables

- Keep **secret** keys (API keys, service account credentials) out of the repo. This repo already ignores `.env*.local`.
- Use server-only env vars for secrets (no `NEXT_PUBLIC_` prefix) and configure them in your deployment provider (Vercel, Netlify, Cloud Run, etc.).
- If a secret was committed accidentally, rotate it immediately and remove it from git history.

Examples:

- `GOOGLE_GENAI_API_KEY=sk-<your-server-key>` (server only)
- `NEXT_PUBLIC_FIREBASE_API_KEY=<public-client-key>` (safe to be public in client bundles)

---

## 🔒 Firestore rules

I updated `firestore.rules` to restrict access to only authenticated users:
- `users/{uid}`: only the owner (and agents) can read or update; deletion is blocked.
- `wasteReports/{id}`: created by authenticated farmers; readable by the owner and agents; updates/deletes are agent-only.

Always test your rules in the Firebase Emulator or console before deploying to production.

