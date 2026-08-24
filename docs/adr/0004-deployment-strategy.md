# ADR 0004: GitHub Pages Deployment

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The resume portfolio is a static React SPA. It needs:

- Free hosting with custom domain support
- Automatic deployment on push to main
- HTTPS with valid certificate
- CDN for global availability
- Support for client-side routing (SPA)

## Decision

Deploy to **GitHub Pages** via two CI workflows:

1. **Strict Validation** — runs on every push: TypeScript check, ESLint, bundle analysis (checks FSD imports, stylelint, bundle size). Blocks on any warning.
2. **opencode** — runs on `/deploy` comment in PRs: type-check, lint, build, deploy to `gh-pages` branch.

**SPA routing:** `public/404.html` handles client-side routing by redirecting all 404s to `index.html`.

**Custom domain:** Configured via `public/CNAME` file (or GitHub Pages settings).

## Consequences

### Positive

- Zero hosting cost
- Automatic HTTPS via GitHub Pages
- CDN-backed delivery
- Deployment tied to git workflow — no separate deploy step
- CI catches issues before deploy

### Negative

- Build times depend on GitHub Actions (typically 1-3 minutes)
- No staging environment (PR previews require additional setup)
- GitHub Pages has a 1GB repo limit and 100GB/month bandwidth
- SPA routing requires 404.html hack

## Alternatives Considered

| Alternative       | Reason against                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Netlify           | Free tier works but adds another service; GitHub Pages is simpler for a GitHub-first project |
| Vercel            | Excellent for Next.js but overkill for Vite SPA; vendor lock-in                              |
| Cloudflare Pages  | Free and fast but separate auth from GitHub                                                  |
| Self-hosted (VPS) | Operational overhead, cost, maintenance — disproportionate                                   |
