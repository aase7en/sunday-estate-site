# Sunday Estate — Marketing Site

Public marketing site for **บริษัท ซันเดย์ เอสเตท จำกัด** (Sunday Estate Co., Ltd.) — separate from the internal webapp at `app.sundayestate.co.th`.

- **Stack**: Next.js 16 (App Router) · React 19 · Tailwind v4 · `motion` (Framer Motion) · TypeScript
- **Deploy**: Cloudflare Pages via `@cloudflare/next-on-pages`
- **Domain**: `sundayestate.co.th` (root) — webapp keeps `app.*`
- **Brand source of truth**: ported from `../sunday-estate-webapp/prototype/colors_and_type.css` + `data.jsx`
- **Plan**: `/Users/aase7en/.claude/plans/a-wiki-project-fizzy-lagoon.md` (M1–M5 milestones)

## Develop

```bash
pnpm install
cp .env.example .env.local   # fill in once secrets exist
pnpm dev                     # http://localhost:3000
pnpm build                   # production smoke test
```

## Status

- [x] **M1** — scaffold, brand tokens, logo, animated hero (cursor spotlight + magnetic CTA + mask reveal), services placeholder, footer
- [ ] **M2** — i18n (TH/EN) via next-intl, full Services + 32 Objectives + e-GP + About sections
- [ ] **M3** — Property listings (MDX + Velite) + Mapbox map section
- [ ] **M4** — Blog (MDX) + contact form (Resend)
- [ ] **M5** — CF Pages deploy + custom domain + Lighthouse pass

## Brand tokens (do not redefine)

Defined once in [`app/globals.css`](app/globals.css) and exposed to Tailwind via `@theme`. Use utility classes:

| Token | Tailwind | Hex |
|-------|----------|-----|
| Primary navy | `bg-navy` / `text-navy` | `#002c5f` |
| Accent gold | `bg-gold` / `text-gold` | `#f6a800` |
| Ink (dark hero) | `bg-ink` | `#081832` |
| Cream (page bg) | `bg-cream` | `#f8f9fa` |
| Paper (cards) | `bg-paper` | `#ffffff` |

Brand easing: `--ease-brand` (Expo-out, `cubic-bezier(0.22, 1, 0.36, 1)`). Body font: IBM Plex Sans Thai.
