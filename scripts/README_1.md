# scripts/ — Installation, lancement et container local

Ce dossier contient les scripts d'installation, de cycle de vie et de test de la plateforme **movetoai**. Il est maintenu par l'agent Claude Code **`devops`**.

## 🎯 Contenu prévu

### Installation et cycle de vie serveur Linux (production `movetoai.io`)

| Script | Rôle |
|--------|------|
| `install.sh` | Installation initiale du serveur (dépendances OS, Node.js, Docker, utilisateurs, dossiers) |
| `setup-tls.sh <domaine>` | Configuration TLS Let's Encrypt via Certbot pour `movetoai.io` |
| `start.sh` | Démarrage de la stack (docker compose up ou systemd start) |
| `stop.sh` | Arrêt propre |
| `restart.sh` | Redémarrage rapide (utile après config change) |
| `update.sh` | Mise à jour : git pull + rebuild + migrations + restart |
| `healthcheck.sh` | Vérification santé (endpoints répondent, vLLM up, DB accessible) |
| `backup.sh` | Sauvegarde BDD + fichiers users vers stockage distant (à définir) |
| `restore.sh <archive>` | Restauration depuis backup |
| `logs.sh [service]` | Consultation des logs (tail -f par service) |

### Développement local (PC Windows via Docker Desktop / WSL2)

| Fichier | Rôle |
|---------|------|
| `docker-compose.dev.yml` | Stack complète en local : front (Vite dev server), back (Node), DB, cache, vLLM (Qwen 2.5 7B en mode CPU/GPU) |
| `docker-compose.prod.yml` | Stack de production (build optimisé, images multi-stage) |
| `Dockerfile.front` | Image front (build Vite → nginx) |
| `Dockerfile.back` | Image back (Node 20 multi-stage) |
| `Dockerfile.vllm` | Image vLLM avec Qwen 2.5 7B téléchargé au build |
| `.env.example` | Exemple de variables d'environnement (à copier en `.env.local`) |

### Utilitaires ponctuels

| Script | Rôle |
|--------|------|
| `seed-db.sh` | Charger des données de test en local |
| `reset-db.sh` | Réinitialiser la BDD locale (danger : dev uniquement) |
| `run-tests.sh` | Lancer la suite de tests complète (unit + E2E + a11y) |
| `bench-vllm.sh` | Benchmark de latence et throughput vLLM |

## 🚫 Ce que ces scripts ne font PAS

- **Aucun secret en dur** : les scripts lisent depuis les fichiers `.env.*` non versionnés
- **Aucun appel LLM tiers** : les tests IA utilisent le vLLM local avec MockProvider en fallback
- **Aucune modification silencieuse de la production** : tous les scripts prod affichent un récap et demandent confirmation

## 🔐 Convention de sécurité

- Tous les scripts bash commencent par `set -euo pipefail`
- Les scripts qui modifient l'état production affichent d'abord un dry-run
- Les mots de passe et clés API viennent de `.env.prod` (chmod 600, propriétaire root ou user dédié)
- Les logs ne contiennent aucun PII ni secret

## 🛠️ Comment demander à Claude Code de générer un script

Depuis le dossier `movetoai/`, lancez `claude` puis :

```
Use the devops subagent to generate the install.sh script for our Linux production server.
The server runs Ubuntu 24.04 LTS. Include Node.js 20, Docker, Docker Compose,
Certbot for Let's Encrypt, and create a dedicated 'movetoai' user.
```

L'agent `devops` produira le script dans ce dossier en respectant les conventions ci-dessus.

## 📋 Ordre de génération recommandé

Pour bootstrapper l'environnement, générer les scripts dans cet ordre :

1. `.env.example` (référence des variables nécessaires)
2. `Dockerfile.front`, `Dockerfile.back` (images de base)
3. `docker-compose.dev.yml` (permet le test local immédiat)
4. `install.sh` + `start.sh` + `stop.sh` (cycle de vie serveur)
5. `healthcheck.sh` (validation post-install)
6. `Dockerfile.vllm` + config vLLM (quand infra GPU choisie)
7. `docker-compose.prod.yml` (déploiement serveur)
8. `setup-tls.sh` (mise en HTTPS)
9. `backup.sh` + `restore.sh` + cron
10. Utilitaires ponctuels au fil des besoins

## 📄 Note sur le chemin Windows ↔ Linux

Sur PC Windows : ces scripts s'exécutent via **WSL2** (bash natif) ou **Git Bash**. PowerShell n'est pas la cible.

Pour tester `install.sh` sur Windows sans serveur Linux :
```powershell
wsl bash scripts/install.sh --dry-run
```

Sur serveur Linux : exécution directe.
