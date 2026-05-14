# Comptes de test — Move to AI

> URL locale : **http://localhost:3000**
> Mot de passe universel : **`Test1234!`**

```bash
npm run db:seed:test    # crée tous les comptes et données
npm run db:seed:clean   # supprime uniquement les données de test
npm run db:seed:reset   # clean + seed en une commande
npx prisma studio       # GUI pour inspecter la base
```

---

## Utilisateurs

| Email | Nom | Rôle | Workspace principal | Thème |
|---|---|---|---|---|
| `admin@movetoai-test.dev` | Sophie Marchand | Admin Workspace | Technolab Industries | Light |
| `ceo@movetoai-test.dev` | Laurent Fontaine | Dirigeant (PDG) | Technolab Industries | Dark |
| `rh@movetoai-test.dev` | Isabelle Durand | Responsable Métier RH | Technolab Industries | System |
| `dsi@movetoai-test.dev` | Thomas Renard | DSI / IT Manager | Technolab Industries | Dark |
| `consultant@movetoai-test.dev` | Marc Leroy | Consultant IA | Multi-workspace (4) | Dark |
| `collab@movetoai-test.dev` | Amélie Petit | Collaborateur | Technolab Industries | System |
| `superadmin@movetoai-test.dev` | Alex Martin | Super Admin (interne) | Tous | Dark |

### Données d'édition pré-remplies par profil

Chaque compte est livré avec ses données complètes dans `user.preferences` :

| Champ | Clé `preferences` |
|---|---|
| Téléphone | `phone` |
| Bio | `bio` |
| Couleur avatar | `avatarColor` |
| Initiales avatar | `avatarInitials` |
| Département | `department` |
| Thème | `theme` |
| Notifs email / app | `notificationsEmail` / `notificationsApp` |
| Rapport hebdo | `weeklyReport` |
| LinkedIn / site | `linkedinUrl` / `websiteUrl` |
| Rôle applicatif | `role` |
| Préférences IA | `aiAmbition`, `aiHorizon`, `aiMaturity` |
| Stack technique (DSI) | `techStack`, `mainConstraint` |
| Outils IA (Consultant) | `toolsIa`, `specialization`, `sectors` |
| Outils RH (Resp. Métier) | `toolsUsed`, `challenges`, `teamSize` |

---

## Workspaces

| Workspace | Tenant slug | Secteur | Taille | Score IA | Membres |
|---|---|---|---|---|---|
| Technolab Industries | `technolab-industries-test` | Industrie manufacturière | ETI | 34/100 | 7 (Sophie, Laurent, Isabelle, Thomas, Marc, Amélie, Alex) |
| BoutiqueMode SAS | `boutiquemode-sas-test` | Commerce / Retail | PME | 21/100 | 3 (Marc, Sophie, Alex) |
| GroupeAlpha Finance | `groupe-alpha-test` | Finance & Assurance | Grand groupe | 61/100 | 3 (Marc, Sophie, Alex) |
| Leroy Consulting | `leroy-consulting-test` | Conseil & Services | PME | — | 2 (Marc, Alex) · `isPartnerWorkspace: true` |

### Rôles disponibles par workspace

| Code rôle | Nom affiché | Permissions |
|---|---|---|
| `WORKSPACE_ADMIN` | Admin workspace | Tout |
| `EXECUTIVE` | Dirigeant | Vue + opportunités + analytics + rapports |
| `BUSINESS_OWNER` | Responsable Métier | Vue + opportunités + analytics + use cases |
| `IT_MANAGER` | DSI / IT Manager | Vue + opportunités + analytics + use cases + settings |
| `CONSULTANT_PARTNER` | Consultant Partenaire | Vue + opportunités + analytics + use cases + rapports |
| `MEMBER` | Collaborateur | Vue + analytics uniquement |

---

## Opportunités (11 total)

### Technolab Industries (9 opportunités)

| Titre | Domaine | Statut | Detecté par |
|---|---|---|---|
| Automatiser l'onboarding des nouveaux collaborateurs | RH | `DRAFT` | AI |
| Automatiser la relance des factures impayées | Finance | `VALIDATED` | Manuel |
| Qualification automatique des leads entrants CRM | Commercial | `CONVERTED` ← UC1 | AI |
| Génération automatique de posts LinkedIn | Marketing | `REJECTED` | Terrain |
| Automatiser le suivi des demandes de congés | RH | `DRAFT` | Terrain (signal Amélie) |
| Pipeline SAP → Power BI automatisé (H+1) | IT | `CONVERTED` ← UC3 | AI |
| Workflow automatisé d'onboarding RH complet | RH | `CONVERTED` ← UC2 | AI |
| Chatbot IA support client FAQ | Support | `CONVERTED` ← UC4 | AI |
| Maintenance prédictive machines industrielles | Production | `CONVERTED` ← UC5 | AI |

### Autres workspaces

| Titre | Workspace | Statut |
|---|---|---|
| Automatiser les réponses aux avis clients Google | BoutiqueMode SAS | `VALIDATED` |
| Conformité documentaire réglementaire AMF/ESMA | GroupeAlpha Finance | `DRAFT` |

---

## Use Cases (5 total — tous statuts couverts)

| Titre | Statut | Assigné à | DSI | Consultant |
|---|---|---|---|---|
| Scoring IA des leads CRM Salesforce en temps réel | **backlog** | Isabelle Durand | Thomas Renard | Marc Leroy |
| Assistant IA onboarding RH automatisé | **analysis** | Isabelle Durand | Thomas Renard | Marc Leroy |
| Pipeline automatique SAP → Power BI (H+1) | **active** (en cours) | Thomas Renard | Thomas Renard | — |
| Chatbot IA support client FAQ | **deployed** ✓ avec métriques réelles | Sophie Marchand | Thomas Renard | — |
| Maintenance prédictive machines industrielles | **paused** (IoT manquants) | Thomas Renard | Thomas Renard | Marc Leroy |

### Ce que couvre chaque statut

| Statut | Vues testables |
|---|---|
| `backlog` | Fiche UC complète, KPIs, ROI, risques, plan d'action, pas encore démarré |
| `analysis` | Cadrage en cours, données requises, RGPD, effort détaillé |
| `active` | Progression (en cours de déploiement), next steps |
| `deployed` | Métriques réelles (`realKpis`, `realRoiAnalysis`), comparaison estimé/réel |
| `paused` | Contrainte bloquante dans `constraints`, raison pause visible |

---

## Données d'édition testables par profil

### Sophie Marchand — `admin@movetoai-test.dev`
- `/settings/profile` — prénom, nom, poste, téléphone, bio, LinkedIn pré-remplis · avatar "SM" sur fond bleu
- `/settings/preferences` — thème **light**, notifications email + app ON, rapport hebdo ON
- `/settings/security` — changement mot de passe (Test1234! → nouveau)
- `/settings/workspace` — secteur "Industrie manufacturière", taille "ETI", site pré-remplis
- `/settings/members` — 7 membres visibles, modifier rôle d'Amélie, inviter un membre
- Vue admin complète sur les 11 opportunités et 5 use cases de Technolab

### Laurent Fontaine — `ceo@movetoai-test.dev`
- `/settings/profile` — thème **dark**, notifications app ON · email OFF (checkboxes précises)
- Préférences IA : ambition `cost_reduction`, horizon `6_months`
- Dashboard dirigeant : vue stratégique sur le portefeuille, ROI global

### Isabelle Durand — `rh@movetoai-test.dev`
- `/settings/profile` — département "RH", thème **system** (auto), outils RH cochés (BambooHR, Excel, Teams), 3 défis pré-sélectionnés
- 2 use cases assignés (backlog + analysis) · 3 opportunités RH visibles

### Thomas Renard — `dsi@movetoai-test.dev`
- `/settings/profile` — stack technique 5 outils, contrainte principale "rgpd", taille équipe "6-20"
- 3 use cases en tant que `technicalOwner` · feu vert technique sur Pipeline SAP

### Marc Leroy — `consultant@movetoai-test.dev`
- `/settings/profile` — spécialisation `process_automation`, 3-7 ans, 3 secteurs, 5 outils IA, LinkedIn + site
- Accès à 4 workspaces · consultant sur 3 use cases ETI

### Amélie Petit — `collab@movetoai-test.dev`
- `/settings/profile` — profil minimaliste, `invitedByName: "Isabelle Durand"` visible
- Accès limité : pas de `/settings/workspace` ni `/settings/billing`
- 1 signal terrain visible (congés)

### Alex Martin — `superadmin@movetoai-test.dev`
- `/admin` — vue tous les workspaces (4), tous les utilisateurs (7)
- Badge "Équipe Move to AI" via `preferences.isInternal: true`
- Présent dans tous les workspaces en tant qu'admin

---

## Commandes rapides

```bash
# Reset complet
npm run db:seed:reset

# Seed seul (sans clean)
npm run db:seed:test

# Nettoyage seul
npm run db:seed:clean

# Inspecter la base
npx prisma studio
```

> ⚠️ Ces comptes ne fonctionnent que sur `NODE_ENV=development` ou avec `.env.test`.
> Ne jamais exposer ces emails/mots de passe en dehors de l'environnement local.
