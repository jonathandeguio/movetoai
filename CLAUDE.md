# movetoai — Contexte projet et règles communes

Ce fichier est chargé automatiquement dans toutes les sessions Claude Code (et dans le contexte de chaque sub-agent invoqué). Il contient : contexte projet, convention de mémoire partagée, techniques d'optimisation tokens, glossaire, politique IA.

**Règle d'or (à respecter par TOUS les agents)** : ne charger que les fichiers strictement nécessaires à la tâche en cours. Jamais l'arborescence complète, jamais un fichier entier si une section suffit.

---

## 🎯 Contexte projet

**movetoai** est la plateforme SaaS développée par **EFFICIENCE INDUSTRIE CONSEIL (EIC)**, cabinet français de conseil en management de transition et transformation digitale. La plateforme cible les PME/ETI/startups (industrie et tertiaire) et couvre : management de transition, transformation digitale, gouvernance des données, BI et intégration d'IA.

**Nom de domaine production** : `movetoai.io`
**Site vitrine associé** : `iec3.fr` (React + Vite, minimaliste épuré).

## 🖥️ Infrastructure cible

- **Production** : serveur **PC Linux self-hosted** (bare metal ou VPS) exposé sur `movetoai.io`
- **Développement / test local** : container Docker sur PC Windows (Docker Desktop ou WSL2)
- **GPU pour Qwen 2.5 7B** : soit sur le même serveur Linux si équipé, soit sur GPU EU distant (OVHcloud, Scaleway, Hetzner) accessible en VPC privé
- **DNS / TLS** : à configurer sur `movetoai.io` (Let's Encrypt recommandé pour la V1)

## 🚧 Contraintes projet non négociables

- **Stack** : JavaScript (ES2022+), React 18, Vite, Node 20 LTS, TypeScript recommandé
- **Multilingue** : FR (défaut) / EN / ES
- **Conformité** : RGPD, EU AI Act (déployeur)
- **Nom de domaine** : `movetoai.io` (prod), `localhost` ou `*.movetoai.local` (dev)
- **Déploiement production** : serveur Linux self-hosted (Ubuntu LTS ou Debian recommandé)
- **Déploiement local (dev/test)** : Docker Compose sur PC Windows via Docker Desktop ou WSL2
- **LLM interne** : **Qwen 2.5 7B** (Apache 2.0), self-hosté sur infra GPU EU (OVHcloud, Scaleway ou Hetzner), servi par vLLM en VPC privé
- **Alternative documentée** : Mistral 7B pour souveraineté européenne renforcée
- **Aucun LLM tiers en runtime applicatif** (pas d'appel OpenAI/xAI/Anthropic depuis l'application). Claude via Claude Code reste utilisé côté équipe pour le développement.
- **Accessibilité** : WCAG 2.1 niveau AA minimum
- **Performance** : Lighthouse ≥ 90 sur perf/a11y/best-practices/SEO

## 🗂️ Convention de mémoire partagée

Tous les agents lisent et écrivent dans cette arborescence unique. **Chaque fichier a un et un seul agent auteur.**

```
/movetoai/
├── CLAUDE.md                          ← ce fichier (règles communes)
├── README.md                          ← guide d'installation et utilisation
├── .claude/agents/                    ← sub-agents (po, archi, devops, devfull, qa, ai)
├── /scripts/                          ← DevOps (installation, lancement, container local)
│   ├── install.sh                     (installation serveur Linux)
│   ├── start.sh / stop.sh             (cycle de vie)
│   ├── healthcheck.sh                 (vérification santé)
│   ├── backup.sh / restore.sh         (sauvegardes)
│   ├── update.sh                      (mise à jour)
│   ├── docker-compose.dev.yml         (test local Docker)
│   ├── docker-compose.prod.yml        (déploiement serveur)
│   └── README.md                      (guide des scripts)
├── /00-vision/
│   ├── vision-produit.md              ← PO
│   ├── personas.md                    ← PO
│   └── glossaire.md                   ← PO (partagé en lecture)
├── /01-specs/
│   ├── user-stories.md                ← PO
│   ├── ux-parcours.md                 ← PO
│   ├── design-system.md               ← PO
│   ├── architecture.md                ← Archi
│   ├── securite-rgpd.md               ← Archi
│   ├── data-model.md                  ← Archi
│   ├── api-contracts.md               ← Archi (OpenAPI 3.1)
│   ├── devops.md                      ← DevOps
│   └── ai/                            ← AI
│       ├── llm-strategy.md
│       ├── llm-security.md
│       ├── llm-rgpd.md
│       ├── llm-provider-abstraction.md
│       ├── prompt-catalog/{feature}-v{n}.md
│       └── evaluations/golden-sets/{feature}.jsonl
├── /02-prompts-claude-code/
│   ├── prompt-front-{feature}.md      ← DevFull
│   └── prompt-back-{feature}.md       ← DevFull
├── /03-tests/
│   ├── plan-tests-{feature}.md        ← QA
│   └── scenarios-e2e.md               ← QA
└── /99-journal/
    ├── decisions.md                   ← Partagé (ADR)
    └── conflits.md                    ← Partagé (arbitrages inter-agents)
```

## ⚡ Les 7 techniques d'optimisation tokens (applicables à TOUS les agents)

1. **Context slicing** — lire uniquement les sections nécessaires d'un fichier (grep/view avec range), jamais le fichier entier si évitable.
2. **Prompt caching** — placer les sections stables (contexte projet, glossaire, templates) en tête des livrables pour maximiser le cache Claude.
3. **Modèle adapté** — chaque agent a un modèle recommandé dans son frontmatter (`opus` pour raisonnement complexe, `haiku` pour tâches structurées). Ne pas escalader sans raison.
4. **Batching** — regrouper les livrables d'une même feature en un seul passage (ex : spec sécu + RGPD + éval en une fois, pas 3 échanges).
5. **Mémoire externalisée** — référencer les fichiers de spec par chemin, ne jamais les recopier dans les réponses ("mis à jour dans `architecture.md § 3.2`", pas de citation du contenu).
6. **Short-circuit** — rediriger vers l'agent compétent dès qu'une demande sort du périmètre (chaque agent a ses règles de redirection).
7. **Budget tokens par tâche** — chaque agent a des budgets définis dans son fichier ; au-delà, découper et demander confirmation.

## 📖 Glossaire métier

- **EIC** : Efficience Industrie Conseil (l'entreprise cliente)
- **movetoai** : la plateforme SaaS développée (ce projet)
- **iec3.fr** : site vitrine associé, distinct de la plateforme
- **PO / Archi / DevOps / DevFull / QA / AI** : les 6 sub-agents du projet
- **US** : User Story (format INVEST + Gherkin)
- **DoD** : Definition of Done (critères d'acceptation techniques)
- **ADR** : Architecture Decision Record (dans `/99-journal/decisions.md`)
- **DPIA** : Data Protection Impact Assessment (RGPD)
- **RBAC** : Role-Based Access Control
- **Feature IA** : toute feature utilisant Qwen 2.5 7B → doit passer par l'agent AI
- **promptId** : identifiant d'un prompt produit dans `/01-specs/ai/prompt-catalog/`
- **Golden set** : jeu de cas de test versionné pour évaluer une feature IA
- **vLLM** : serveur d'inférence LLM haute performance (production)
- **Ollama** : serveur d'inférence léger (dev, petite échelle)

## 🌍 Environnements

Trois environnements standards, tous décrits dans `/scripts/` et `/01-specs/devops.md` :

| Env | Cible | URL | Objectif |
|-----|-------|-----|----------|
| **local** | Container Docker sur PC Windows (Docker Desktop / WSL2) | `localhost:5173` (front), `localhost:3000` (back), `localhost:8000` (vLLM) | Développement quotidien + tests |
| **staging** (optionnel V1) | Sous-domaine sur serveur Linux | `staging.movetoai.io` | Recette avant prod |
| **prod** | Serveur Linux self-hosted | `movetoai.io` | Utilisateurs finaux |

**Règle** : aucun secret de production dans le repo. Les fichiers `.env.local`, `.env.staging`, `.env.prod` sont dans `.gitignore`. Seul un fichier `.env.example` est versionné.

## 🔒 Politique IA (résumé — détails dans `/01-specs/ai/`)

- Modèle unique en V1 : Qwen 2.5 7B Instruct
- Serveur : vLLM en VPC privé, URL interne uniquement
- Traitement 100% interne → aucun DPA tiers, aucun ZDR à négocier
- Toute feature IA passe obligatoirement par l'agent AI (spec + prompt + éval)
- Abstraction obligatoire : `LLMProvider` (voir `/01-specs/ai/llm-provider-abstraction.md`), le code applicatif ne connaît pas le modèle sous-jacent
- Aucun prompt LLM en dur dans le code — toujours par `promptId`
- PII scrubbing avant appel LLM (défense en profondeur, même en self-hosted)
- Escalade taille (14B, 32B) uniquement après échec documenté sur golden set + ADR

## 📄 Format standard des livrables

- Tous les livrables en **markdown**
- Nommage : `kebab-case.md`
- Chaque fichier de spec commence par un front-matter :
  ```markdown
  ---
  auteur: PO | Archi | DevOps | DevFull | QA | AI
  version: 1.0
  statut: draft | actif | déprécié
  date: YYYY-MM-DD
  ---
  ```
- Chaque modification significative → entrée dans `/99-journal/decisions.md`
- Chaque désaccord inter-agents → entrée dans `/99-journal/conflits.md` avec positions et arbitrage

## 🚦 Priorités quand plusieurs agents pourraient traiter une demande

1. Si la demande touche à l'expérience utilisateur ou au produit → **PO** d'abord
2. Si elle touche à une décision d'architecture, sécurité ou modèle de données → **Archi**
3. Si elle touche à l'infra, la CI/CD ou l'observabilité → **DevOps**
4. Si elle nécessite du code applicatif → **DevFull** (après que PO/Archi ont produit les specs)
5. Si elle nécessite des tests ou une validation qualité → **QA**
6. Si elle implique un LLM ou une génération/classification/extraction IA → **AI** (avant DevFull)

En cas de doute, l'agent invoqué explique brièvement pourquoi il redirige et vers qui.
