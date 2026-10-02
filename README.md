# movetoai — Architecture 6 agents pour Claude Code

Ce repo contient l'architecture multi-agents pour le développement de **movetoai**, plateforme **SaaS B2B** développée par Efficience Industrie Conseil (EIC) mettant en œuvre un **Système de Management du Digital (SMD) intelligent**, optimisée pour Claude Code avec sub-agents personnalisés.

Vision produit complète (mission, objectifs, 4 segments cibles, concepts Module/Objet) : voir [`00-vision/vision-produit.md`](00-vision/vision-produit.md).

- **Nom de domaine production** : `movetoai.io`
- **Infrastructure cible** : serveur PC Linux self-hosted
- **Développement local** : container Docker sur PC Windows (Docker Desktop / WSL2)

## 🏗️ Structure du repo

```
movetoai/
├── CLAUDE.md                    # Contexte projet + règles communes (chargé auto)
├── README.md                    # Ce fichier
├── .claude/
│   └── agents/                  # 6 sub-agents Claude Code
│       ├── po.md                # Product Owner + UX/UI (Opus)
│       ├── archi.md             # Architecture + Sécurité + Data/API (Opus)
│       ├── devops.md            # Infra + CI/CD + observabilité (Haiku)
│       ├── devfull.md           # Générateur prompts Claude Code (Opus)
│       ├── qa.md                # Tests + qualité + a11y + sécu (Haiku)
│       └── ai.md                # LLM Ops Qwen 2.5 7B (Opus)
├── scripts/                     # Scripts installation, lancement, container local
│   ├── install.sh               # Installation initiale serveur Linux
│   ├── start.sh / stop.sh       # Cycle de vie
│   ├── healthcheck.sh           # Vérification santé
│   ├── backup.sh / restore.sh   # Sauvegardes
│   ├── update.sh                # Mise à jour
│   ├── docker-compose.dev.yml   # Test local Docker
│   ├── docker-compose.prod.yml  # Déploiement serveur
│   └── README.md                # Guide des scripts
├── 00-vision/                   # Livrables PO (vision, personas)
├── 01-specs/                    # Livrables Archi / DevOps / AI
│   └── ai/                      # Spécifique agent AI
├── 02-prompts-claude-code/      # Livrables DevFull
├── 03-tests/                    # Livrables QA
└── 99-journal/                  # ADR + arbitrages inter-agents
```

## 🚀 Installation

### Prérequis
- [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) installé
- Node.js 20 LTS
- Un abonnement Claude Pro/Team/Max ou une clé API Anthropic

### Mise en place

```bash
# 1. Cloner ou décompresser ce repo
git clone <votre-repo> movetoai
cd movetoai

# 2. Créer les dossiers de travail
mkdir -p 00-vision 01-specs/ai/{prompt-catalog,evaluations/golden-sets,evaluations/eval-reports}
mkdir -p 02-prompts-claude-code 03-tests 99-journal scripts

# 3. Initialiser Git (recommandé)
git init
git add .
git commit -m "chore: bootstrap movetoai agents architecture"

# 4. Lancer Claude Code dans le dossier
claude
```

Claude Code charge automatiquement `CLAUDE.md` (contexte projet) et découvre les 6 sub-agents dans `.claude/agents/`.

## 🐳 Développement local (container Docker)

Sur votre PC Windows avec Docker Desktop ou WSL2 :

```powershell
# Démarrer la stack complète en local
cd c:\movetoai1\scripts
docker compose -f docker-compose.dev.yml up -d

# Vérifier que tout tourne
docker compose -f docker-compose.dev.yml ps

# Consulter les logs
docker compose -f docker-compose.dev.yml logs -f

# Arrêter
docker compose -f docker-compose.dev.yml down
```

URLs par défaut en local :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000
- vLLM (Qwen 2.5 7B) : http://localhost:8000/v1
- Documentation OpenAPI : http://localhost:3000/docs

Note : les scripts `docker-compose.dev.yml` et les Dockerfiles seront générés par l'agent `devops` au fil de l'eau. Le dossier `scripts/` est pour l'instant un squelette.

## 🖥️ Déploiement production (serveur Linux movetoai.io)

Sur le serveur Linux cible (Ubuntu LTS ou Debian) :

```bash
# 1. Copier le repo sur le serveur (via git clone, scp, ou rsync)
git clone <votre-repo> /opt/movetoai
cd /opt/movetoai

# 2. Lancer l'installation (script généré par DevOps)
sudo bash scripts/install.sh

# 3. Configurer le domaine et TLS (Let's Encrypt via Certbot)
sudo bash scripts/setup-tls.sh movetoai.io

# 4. Démarrer la plateforme
bash scripts/start.sh

# 5. Vérifier la santé
bash scripts/healthcheck.sh
```

Les scripts seront produits par l'agent `devops` en s'appuyant sur les spécifications d'infrastructure de `01-specs/devops.md`.

## 🎯 Utilisation

### Auto-délégation (recommandé)

Décrivez simplement ce que vous voulez, Claude Code délègue au bon sub-agent grâce aux `description` en frontmatter :

```
Je veux une user story pour la facturation Stripe
→ Claude Code délègue automatiquement à `po`

Comment sécuriser le multi-tenant ?
→ Claude Code délègue à `archi`

Génère-moi un Dockerfile pour le service auth
→ Claude Code délègue à `devops`

Prépare le prompt de développement pour l'écran de connexion
→ Claude Code délègue à `devfull`

Plan de tests pour l'inscription utilisateur
→ Claude Code délègue à `qa`

On veut résumer les rapports de mission avec un LLM
→ Claude Code délègue à `ai`
```

### Invocation explicite

Pour forcer un agent précis :

```
Use the po subagent to draft a US for the contact form
Use the ai subagent to check if Qwen 2.5 7B fits our use case
```

## 🔄 Workflows types

### Workflow 1 — Feature classique (sans IA) : "Facturation Stripe"

1. **`po`** → User Story + parcours + wireframe
2. **`archi`** → architecture + sécurité + data + API OpenAPI
3. **`devops`** → Dockerfile + CI + templates
4. **`devfull`** → prompts Claude Code front + back
5. **Claude Code (main)** → exécute les prompts → produit le code
6. **`qa`** → plan de tests + scénarios E2E

### Workflow 2 — Feature IA : "Résumé automatique d'un rapport de mission"

1. **`po`** → US-088 marquée "Feature IA" + parcours UX
2. **`ai`** → adéquation Qwen 7B OK + prompt v1 + sécu LLM + RGPD + golden set + plan d'éval
3. **`archi`** → contrat API `/api/missions/{id}/summary`
4. **`devops`** → variables d'env LLM_BASE_URL / LLM_MODEL + monitoring GPU
5. **`devfull`** → prompt Claude Code référençant `promptId=resume-mission-v1` via LLMProvider
6. **Claude Code (main)** → produit le code
7. **`qa`** → plan de tests + intégration golden set + test dégradation gracieuse

## ⚡ Techniques d'optimisation tokens intégrées

Chaque sub-agent applique les 7 techniques suivantes (détail dans `CLAUDE.md`) :

1. **Context slicing** — lecture ciblée des sections nécessaires
2. **Prompt caching** — sections stables en tête pour maximiser le cache Claude
3. **Modèle adapté** — Opus pour raisonnement complexe, Haiku pour tâches structurées
4. **Batching** — livrables regroupés pour une même feature
5. **Mémoire externalisée** — références par chemin de fichier, pas de recopie
6. **Short-circuit** — redirection immédiate hors du périmètre
7. **Budget tokens par tâche** — défini dans chaque agent

**Économie cumulée réaliste** : 60-80% par rapport à une approche monolithique.

## 🔧 Choix techniques imposés (movetoai)

- **Stack** : JavaScript (TypeScript recommandé), React 18 + Vite, Node 20 LTS
- **Multilingue** : FR (défaut) / EN / ES
- **LLM interne** : Qwen 2.5 7B (Apache 2.0), self-hosté sur GPU EU via vLLM
- **Alternative documentée** : Mistral 7B pour souveraineté renforcée
- **Aucun LLM tiers en runtime applicatif**
- **Conformité** : RGPD + EU AI Act (déployeur)
- **Accessibilité** : WCAG 2.1 AA
- **Performance** : Lighthouse ≥ 90

## 📚 Ressources

- [Doc Claude Code sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Doc Claude Code overview](https://docs.claude.com/en/docs/claude-code/overview)
- [Qwen 2.5 sur Hugging Face](https://huggingface.co/Qwen)
- [vLLM documentation](https://docs.vllm.ai/)
- [EU AI Act texte officiel](https://artificialintelligenceact.eu/)

## ✅ Checklist de démarrage

**Bootstrap agents**
- [ ] Repo cloné dans `c:\movetoai1` et branche `movetoai1` créée
- [ ] Dossiers de travail créés (`00-vision/`, `01-specs/`, `scripts/`, etc.)
- [ ] Claude Code lancé dans le dossier
- [ ] Vérification : taper `/agents` dans Claude Code → les 6 sub-agents doivent apparaître
- [ ] Premier test : demander "Draft a user story for the contact form" → doit déléguer à `po`

**Développement local (Docker sur PC Windows)**
- [ ] Docker Desktop installé (ou WSL2 + Docker)
- [ ] `docker-compose.dev.yml` généré par l'agent `devops`
- [ ] Container lancé : `docker compose -f scripts/docker-compose.dev.yml up -d`
- [ ] Vérification : http://localhost:5173 (front) et http://localhost:3000 (back) répondent

**Infrastructure IA**
- [ ] Choix arbitré : GPU sur le serveur Linux (si équipé) ou GPU EU distant (OVHcloud, Scaleway, Hetzner)
- [ ] Serveur vLLM déployé avec Qwen 2.5 7B Instruct (fp16 ~24 Go VRAM, ou int8 ~12 Go)
- [ ] Endpoint interne accessible depuis la plateforme (VPC privé)

**Déploiement production movetoai.io**
- [ ] Serveur Linux provisionné (Ubuntu LTS ou Debian, ≥ 8 Go RAM)
- [ ] DNS `movetoai.io` pointant sur le serveur
- [ ] `scripts/install.sh` généré par `devops` et exécuté
- [ ] Certificat TLS Let's Encrypt configuré (Certbot)
- [ ] Firewall configuré (ports 80, 443 ouverts, SSH restreint)
- [ ] Backup automatique configuré (`scripts/backup.sh` en cron)
- [ ] Monitoring en place (logs, uptime, alertes)

**Workflows de validation**
- [ ] Premier workflow feature classique (formulaire de contact iec3.fr) déroulé bout-en-bout
- [ ] Premier workflow feature IA déroulé (classification ou extraction simple avec Qwen)
- [ ] Rappel calendrier trimestriel : `/veille-qwen` sur l'agent `ai`

## 🤝 Contribution

Toute modification d'un sub-agent doit être documentée dans `99-journal/decisions.md` (ADR).

Toute évolution de `CLAUDE.md` (contexte, contraintes, techniques d'optimisation) impacte les 6 agents et doit être validée par revue collective.

## 📄 License

Configuration d'agents propriétaire — Efficience Industrie Conseil (EIC).
