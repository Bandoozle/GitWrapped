# GitWrapped

Turn any GitHub repository into a beautiful, shareable **carousel** for LinkedIn, X, portfolios, and resumes.

## Features

- **GitHub import** via OAuth → recruiter-ready 4-card carousel (project, features, engineering, shipped)
- **Shareable live link** at `/s/[id]` — no download required to view
- PNG export still available for LinkedIn uploads

## Setup

```bash
cd code-story
npm install
cp .env.example .env.local
```

### 1. Auth secret

In `.env.local`:

```env
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_URL=http://localhost:3000
```

### 2. GitHub OAuth

1. Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID + Secret into `.env.local`:

```env
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. Sign in with GitHub
2. New Story → pick a repo → import
3. Template → edit features / engineering / shipped proof
4. **Copy share link** → anyone opens `/s/abc123` and browses the carousel
5. Optional: download PNGs

## Notes

- Shared stories are stored under `.data/shares/` locally (gitignored).
- For production on Vercel, persistent blob/DB storage should replace the file store.
- Cards distinguish detected GitHub signals, system suggestions, and your edits.
