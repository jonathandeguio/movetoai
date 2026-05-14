# Modular Monolith — Move to AI

L'application est structurée en **modules métier** (modular monolith).
Chaque module est autonome et ne dépend pas des autres modules directement.

## Architecture des couches

```
app/(app)/[page]/page.tsx        ← Server Component : appelle module/server/
  ↓
modules/[domain]/server/         ← Data fetching + orchestration
  ↓
lib/services/                    ← Logique métier (calculs, règles)
  ↓
lib/repositories/                ← Accès DB (Prisma queries)
  ↓
lib/prisma.ts                    ← Client Prisma
```

## Structure d'un module

```
modules/[domain]/
  model/        types TypeScript, DTOs, view models
  server/       fonctions server-only pour les Server Components
  actions/      Server Actions (mutations)
  ui/           composants React (Client et Server)
  domain/       logique pure sans I/O (calculs, validations)
```

## Modules disponibles

| Module | Status | Description |
|---|---|---|
| `opportunities` | ✅ Complet | Opportunités IA, filtres, Kanban |
| `compliance` | ✅ Complet | Certifications, conformité |
| `business-structure` | ✅ Complet | Domaines, processus, capacités |
| `governance` | 🔄 Partiel | Décisions, approbations |
| `ai-assistant` | 🔄 Partiel | Suggestions IA |
| `auth` | 🔄 Partiel | Protection des routes |
| `scoring` | 🔄 Partiel | Calcul des scores IA |

## Règles

1. **Les pages ne font jamais `import { prisma }`** — elles appellent `modules/*/server/`
2. **Les modules/server/ utilisent `lib/services/`** — pas Prisma directement
3. **Les services utilisent `lib/repositories/`** — pas Prisma directement
4. **Exceptions acceptées** : `app/api/` interne peut appeler services directement
5. **API publique** : `app/api/public/v1/` uniquement pour intégrations externes
