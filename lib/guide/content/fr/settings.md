# Paramètres et configuration

## Paramètres de l'espace de travail

Accessibles via **Admin → Paramètres**, ils permettent de configurer :
- Le nom et le logo de votre organisation
- Les intégrations externes (Slack, Teams, Jira...)
- Les préférences de notification

## Gestion des membres

**Admin → Membres** — Invitez des collaborateurs et assignez-leur un rôle :

| Rôle | Accès |
|------|-------|
| Admin | Accès complet |
| Executive | Vue stratégique |
| Business Owner | Gestion des opportunités métier |
| IT Manager | Catalogue technique |
| Consultant | Analyse et recommandations |
| Member | Consultation |

## Webhooks

Les webhooks permettent d'envoyer des notifications automatiques vers vos outils (Slack, Zapier, n8n...) lors d'événements clés.

**Événements disponibles :**
- `opportunity.created` — Nouvelle opportunité créée
- `usecase.validated` — Cas d'usage validé
- `assessment.completed` — Assessment terminé
- `briefing.ready` — Nouveau briefing disponible

## Audit Log

L'audit log enregistre toutes les actions importantes dans votre espace de travail pour la conformité et le suivi.
