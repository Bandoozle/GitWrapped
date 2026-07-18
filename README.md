# GitWrapped

Turn any GitHub repository into a beautiful, shareable **carousel** for LinkedIn, X, portfolios, and resumes.

## Features

- **GitHub import** via OAuth → recruiter-ready 4-card carousel (project, features, engineering, shipped)
- **Shareable live link** at `/s/[id]` — no download required to view
- PNG export for LinkedIn / Instagram / X uploads

## Local setup

```bash
cd code-story
npm install
cp .env.example .env.local
```

### 1. Auth secret

```env
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_URL=http://localhost:3000
```

### 2. GitHub OAuth (local)

1. Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID + Secret into `.env.local`:

```env
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

Scopes requested: `read:user user:email` only (public repos via the public API — no `repo`, `public_repo`, or org scopes).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local live links are stored under `.data/shares/` (gitignored). That works on your machine only.

---

## Deploy to Vercel (so anyone can use it)

### 1. Push the repo and import on Vercel

Connect the GitHub repo in [Vercel](https://vercel.com/new) → Framework: Next.js → Deploy once (auth will fail until env is set).

### 2. Create a production GitHub OAuth App

1. [New OAuth App](https://github.com/settings/developers)
2. **Homepage URL:** `https://your-app.vercel.app` (or your custom domain)
3. **Authorization callback URL:** `https://your-app.vercel.app/api/auth/callback/github`

Use a **separate** OAuth App from local, or keep local as a second app — GitHub only allows one callback URL per app.

### 3. Add a Vercel Blob store

In the Vercel project → **Storage** → create **Blob** → connect it to the project.  
This sets `BLOB_READ_WRITE_TOKEN` so live links survive deploys and work for every visitor.

### 4. Environment variables on Vercel

| Variable | Value |
|----------|--------|
| `AUTH_SECRET` | New secret (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `AUTH_GITHUB_ID` | Production OAuth App client ID |
| `AUTH_GITHUB_SECRET` | Production OAuth App client secret |
| `BLOB_READ_WRITE_TOKEN` | From Blob store (often auto-injected) |

Redeploy after saving env vars.

### 5. Share links

Anyone signed in can publish. Live URLs look like:

`https://your-app.vercel.app/s/abc123xyz`

They use the deployed origin automatically — not localhost.

---

## Flow

1. Sign in with GitHub
2. New Story → pick a repo → import
3. Template → edit features / engineering / shipped proof
4. **Copy share link** → anyone opens `/s/...` and browses the carousel
5. Optional: download PNGs

## Notes

- Drafts stay in the browser (`localStorage`) per device — publishing writes a durable share for the live link.
- Publishing a live link requires sign-in; only the owner can overwrite an existing share id.
- Cards distinguish detected GitHub signals, system suggestions, and your edits.
