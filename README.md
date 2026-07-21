# weavatrix.com

Static landing site for [Weavatrix](https://github.com/sergii-ziborov/weavatrix) — the code-graph
MCP server. Plain HTML/CSS/JS, no build step, no framework, no dependencies.

Extracted from the main repository (`sergii-ziborov/weavatrix`) so the engine repo stays focused on
the engine; this repo owns everything the site needs, including its deploy config.

## Layout

- `site/` — the pages and assets served at weavatrix.com (index, security, privacy, license,
  favicons, OG images, the deterministic hero-graph animation)
- `wrangler.jsonc` — Cloudflare static-assets Worker config (`weavatrix.com` + `www` custom domains)
- `.github/workflows/deploy-site.yml` — deploys on every push to `main` that touches the site

## Deploy

Automatic: push to `main`. Requires a `CLOUDFLARE_API_TOKEN` repository secret (Workers Scripts:
Edit permission; add `CLOUDFLARE_ACCOUNT_ID` too if the token sees more than one account). Without
the secret the workflow skips gracefully.

Manual: `npx wrangler@4 deploy` (after `npx wrangler login` once).

## Checks

```sh
npm test
```

Keeps versioned asset references in `index.html` unstale, keeps the hero animation deterministic
(no `Math.random`), and holds every source file to the same 300-line budget the engine repo uses.
