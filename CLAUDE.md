# What this project does

SaaS de pilotage de la transformation IA en entreprise : cartographie des processus métier,
évaluation et priorisation des use cases IA, gouvernance des décisions, roadmap et scoring
de maturité. Déployé en self-hosted sur Ubuntu via GitHub Actions + pm2.

# Tech stack

- **Framework** : Next.js 15 (App Router, TypeScript, Server Components)
- **Base de données** : MySQL 8 via Docker (`movetoai-mysql`) · Prisma ORM
- **Auth** : NextAuth v5 (credentials JWT) · PBKDF2 password hashing
- **Styles** : Tailwind CSS · CSS custom properties (design tokens dark theme)
- **Anti-bot** : Cloudflare Turnstile (désactivable via `NEXT_PUBLIC_TURNSTILE_SITE_KEY=`)
- **Infra** : Ubuntu server · pm2 (port 3001) · nginx reverse proxy (port 50080) · GitHub Actions SSH deploy

# Common commands

```bash
npm run dev              # dev server (port 3000, distDir: .next-dev)
npm run build            # production build (distDir: .next)
npm run start            # start prod server (port 3001 via pm2)
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit

npx prisma db push       # sync schema → DB sans migration
npx prisma studio        # UI admin DB (port 5555)
npm run db:seed          # seed données démo complètes
npm run db:seed:reset    # clean + reseed données de test

pm2 restart movetoai     # redémarrer l'app sur le serveur
pm2 logs movetoai        # logs en temps réel
```

# Architecture & conventions

## Repository pattern
Toutes les queries Prisma sont isolées dans `lib/repositories/*.repo.ts`.
Les pages et composants serveur importent uniquement les repos, jamais `prisma` directement.
Exception : mutations via Server Actions dans les pages (ex: `compliance/[id]/page.tsx`).

```
lib/repositories/
  process.repo.ts       findForAdmin, findByWorkspace…
  application.repo.ts   findForAdmin, findForAssessment…
  use-case.repo.ts      …
  (21 repos au total)
```

## CSS / Design tokens
- Thème dark défini dans `app/globals.css` via variables CSS (`--bg-primary`, `--text-primary`…)
- Toujours utiliser les tokens, jamais de couleurs hardcodées
- `color-scheme: dark` forcé sur tous les `<select>` natifs pour la lisibilité des options
- Ne pas utiliser `text-white` (remappé sur `--text-primary` via globals.css)

## i18n
- Messages chargés côté serveur dans les layouts, passés en props aux composants clients
- Type `AuthMessages` / `AppMessages` — jamais d'import direct dans les Client Components
- Locales : `fr` (défaut), `en`

## Auth flow
- `lib/auth.ts` : authorize() → rate limit → Turnstile (si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` non vide) → verifyPassword → lastLoginAt
- `lib/password.ts` : PBKDF2, format `pbkdf2$310000$SALT$HASH`
- `lib/turnstile.ts` : ignoré si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` vide (self-hosted)

## Déploiement
- Push sur `main` → GitHub Actions → SSH sur le serveur → `git pull && npm install && npm run build && pm2 restart movetoai`
- Secrets GitHub nécessaires : `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
- `.env` sur le serveur : `/opt/movetoai/.env` (ne pas commiter)
