# Journal des décisions (ADR) — movetoai

## ADR-001 — Intégration de l'EPIC plateforme dans la documentation vision

**Date** : 2026-08-04
**Auteur** : PO (bootstrap via session Claude Code)
**Statut** : actif

### Contexte
L'EPIC plateforme movetoai a été transmis par le sponsor. Il précise le concept produit (Système de Management du Digital), la vision, la mission (5 points), les objectifs (3 axes : Performance & Structuration, Valeur, Organisation & Collaboration), les 4 segments cibles (Entreprises, Consultants, Administrations, Education) et les concepts structurants Module/Objet. Aucun de ces éléments n'existait encore dans la documentation du repo (`00-vision/` était un dossier vide).

### Décision
- Création de `/00-vision/vision-produit.md`, `/00-vision/glossaire.md`, `/00-vision/personas.md` à partir de l'EPIC.
- Mise à jour de la section "Contexte projet" de `CLAUDE.md` pour refléter le positionnement SMD et les 4 segments.
- Mise à jour des agents `po`, `archi`, `ai` pour intégrer le concept structurant Module/Objet et le principe d'IA intégrée structurellement (pas de changement pour `devops`, `devfull`, `qa` — hors périmètre de l'EPIC).
- `personas.md` reste au niveau macro-segment (v0.1) : l'EPIC ne fournit pas de profils individuels détaillés ; un atelier PO dédié est nécessaire avant rédaction de user stories fines.
- La « formule de calcul de valeur » et les KPI produit ne sont pas définis dans l'EPIC source : marqués « à spécifier » plutôt qu'inventés.

### Alternatives considérées
- Ne mettre à jour que `CLAUDE.md` sans créer les fichiers `00-vision/` : rejeté, car ces fichiers sont le livrable PO de référence désigné par la convention de mémoire partagée et évitent de dupliquer le contenu de l'EPIC dans `CLAUDE.md`.

### Conséquences
- Toute future US doit se rattacher à `/00-vision/vision-produit.md`.
- Tout nouveau module/objet doit être tracé dans `/00-vision/glossaire.md` puis modélisé par Archi dans `/01-specs/data-model.md`.
- Reste à faire : personas individuels détaillés, formule de valeur, KPI produit — à traiter en atelier PO/sponsor dédié.

## ADR-002 — Architecture cible US0 : stack Next.js, IA auto-hébergée, monolithe modulaire

**Date** : 2026-08-13
**Auteur** : PO (arbitrage sponsor), formalisé avec l'agent Archi en mode consultatif
**Statut** : actif

### Contexte
Le brouillon « US0 Architecture » (rév. V01) décrivait une architecture Next.js appelant directement l'API Anthropic en runtime, hébergée sur CentOS, avec un modèle de session NextAuth ambigu (JWT *et* persistance base simultanément) et une revendication « micro-services » non tenue par le contenu décrit (tout tournait dans un seul déployable Next.js). Cette architecture reproduisait, sans le savoir, la stack précédemment abandonnée lors du commit « nettoyage complet : de zéro » (24/07/2026). Une revue croisée (analyse directe + second avis de l'agent Archi en mode consultatif, aucun fichier produit à ce stade) a soulevé 4 questions bloquantes, tranchées par le sponsor.

### Décision
1. **Aucun appel LLM tiers en runtime** — confirmé et renforcé : le moteur d'inférence est auto-hébergé, atteint exclusivement via une **Passerelle IA** server-side unique, elle-même derrière l'abstraction `LLMProvider`. Le choix précis du modèle (version) n'est **pas figé au niveau architecture** : il relève de la politique IA (`/01-specs/ai/llm-strategy.md`), portée par l'agent AI.
2. **Next.js 14 (App Router) est confirmé** comme framework front + back-end de movetoai, en remplacement de Vite dans `CLAUDE.md`. Conséquence assumée : l'architecture est un **monolithe modulaire** (un artefact de déploiement unique), organisé en **Modules** métier étanches au sens du concept Module/Objet de `00-vision/vision-produit.md` — et non une architecture micro-services au sens infrastructure (pas de déploiement, de scaling ni d'observabilité indépendants par module en V1). L'extraction d'un Module en service autonome reste une évolution possible, pas un prérequis.
3. **Révocation de session immédiate requise** — la stratégie de session NextAuth est **`database`** (adaptateur Prisma), pas `jwt` : le navigateur ne détient qu'un cookie de session opaque, l'identité/rôle/workspace sont résolus côté serveur à chaque requête. Corollaire : les comptes clients (USER, ADMINOPS) et le compte interne EIC3 transverse (ADMINDEV) relèvent de **deux plans d'authentification distincts** (point d'entrée, domaine de cookie et exigences renforcées différents), pour borner le rayon d'impact d'une compromission.
4. **OS de production : Ubuntu 26.04 LTS**, en remplacement de CentOS (fin de vie).
5. Le modèle de rôles est simplifié à **3 rôles** : USER (périmètre = son workspace), ADMINOPS (administre son workspace, aucune visibilité hors de celui-ci), ADMINDEV (interne EIC3, transverse à tous les workspaces, accès aux données client uniquement par élévation explicite et journalisée).
6. Les 6 Modules métier de l'Epic0 (Initiative, Process, Opportunity, Solution, Value, Gouvernance) sont nommés dans l'US0 avec leur(s) Objet(s) principal(aux), sans modélisation détaillée (attributs, relations, cardinalités) : cette dernière est **volontairement différée** aux user stories de chaque module, pour éviter de figer un modèle de données avant que le besoin ne soit affiné.

### Alternatives considérées
- Garder l'appel direct à l'API Anthropic : rejeté — violerait la politique IA de `CLAUDE.md` (souveraineté, RGPD, coût variable non maîtrisé).
- Revenir à Vite + backend séparé (cohérent avec le prototype Hono v4 de mai 2026, commit `988bbde`, supprimé depuis) : non retenu par le sponsor, qui confirme Next.js comme choix définitif.
- Documenter dès l'US0 la matrice complète des relations producteur/consommateur entre Objets (Initiative, Process, Opportunity…) : rejeté par le sponsor — prématuré, sera précisé module par module via leurs user stories respectives.

### Conséquences
- `CLAUDE.md` mis à jour : stack (§ Contraintes non négociables) et ports de l'environnement local (§ Environnements).
- Le document `US0 Architecture Plateforme` est réécrit pour intégrer ces 5 décisions avant soumission formelle à Archi (production de `architecture.md`, `data-model.md`, `api-contracts.md`, `securite-rgpd.md`).
- Deux questions restent ouvertes pour Archi lors de la modélisation détaillée (hors US0) : le sens exact des relations entre Objets au fil des Modules, et la distinction confirmée entre `Workspace` (frontière technique de tenant) et les objets `Organisation`/`Gouvernance` (objets métier produits par le Module Gouvernance).
