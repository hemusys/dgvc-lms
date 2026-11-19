# DG Learn — demo edition

Student-first learning app concept for D.G. Vaishnav College (B.Sc. Data Science, First Year sample content).

- `index.html` — the complete app (single page; progress is stored in the browser's localStorage).
- `api/ask.js` — Vercel Function that proxies AI questions to the Anthropic API. The key is read from the
  `ANTHROPIC_API_KEY` environment variable on the server and is never sent to the browser.
- Optional: `ANTHROPIC_MODEL` to override the model.

## Deploy on Vercel
1. Import this repository in Vercel (framework preset: **Other**, no build command, output directory: project root).
2. Project → Settings → Environment Variables → add `ANTHROPIC_API_KEY` (Production, type Sensitive). Redeploy.
3. Without the key the app still works fully; the AI assistant runs in its offline mode using the built-in notes.

Content is illustrative demo material, not official college curriculum or examination papers.
