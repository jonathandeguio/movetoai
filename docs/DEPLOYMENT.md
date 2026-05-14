# Move to AI — Guide de déploiement serveur

> **Stack** : Next.js 15 · TypeScript · Prisma · PostgreSQL 16 · Redis 7  
> **Runtime** : Node.js 22 LTS · PM2 · Nginx · Ubuntu 22.04 LTS

---

## Prérequis serveur

### Configuration minimale (TPE/PME · ≤ 50 utilisateurs)
| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| SSD | 40 GB | 80 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Prix indicatif | ~10 €/mois | ~20-40 €/mois |

### Configuration ETI (≤ 500 utilisateurs)
| Ressource | Valeur |
|-----------|--------|
| CPU | 4-8 vCPU |
| RAM | 16 GB |
| SSD | 100 GB |
| Prix indicatif | ~50-80 €/mois |

### Configuration avec Ollama 70B (IA locale)
| Ressource | Valeur |
|-----------|--------|
| CPU | 8+ vCPU |
| RAM | 64 GB minimum |
| SSD | 200 GB |
| GPU (optionnel) | NVIDIA RTX 4090 / A100 |
| Prix indicatif | ~200-400 €/mois (dédié) |

### Hébergeurs recommandés (RGPD / données en UE)
| Hébergeur | Localisation | Points forts |
|-----------|--------------|--------------|
| [Hetzner](https://www.hetzner.com) | Allemagne · Finlande | Meilleur rapport qualité/prix |
| [OVHcloud](https://www.ovhcloud.com) | France | Données en France possible |
| [Scaleway](https://www.scaleway.com) | France | Données France garanties |
| [Infomaniak](https://www.infomaniak.com) | Suisse | RGPD + éco-responsable |

---

## Installation complète

### 1. Préparer le serveur

```bash
# Se connecter en root
ssh root@VOTRE_IP_SERVEUR

# Optionnel : cloner le dépôt directement sur le serveur
git clone https://github.com/votre-org/move-to-ai.git /tmp/move-to-ai
cd /tmp/move-to-ai
```

### 2. Lancer l'installation

```bash
# Installation avec SSL (recommandé en production)
sudo bash scripts/server/install.sh \
  --domain app.votre-domaine.com \
  --email admin@votre-domaine.com

# Installation sans SSL (développement / test)
sudo bash scripts/server/install.sh
```

L'installation effectue automatiquement :
- ✅ Mise à jour du système
- ✅ Création de l'utilisateur `movetoai`
- ✅ Installation Node.js 22 + PM2
- ✅ Installation PostgreSQL 16 (avec optimisations production)
- ✅ Installation Redis 7 (avec authentification)
- ✅ Configuration Nginx (reverse proxy + rate limiting)
- ✅ Certificat SSL Let's Encrypt (si domaine fourni)
- ✅ Firewall UFW + Fail2ban
- ✅ Build et démarrage de l'application
- ✅ Configuration logrotate

### 3. Compléter la configuration (post-installation)

```bash
# Éditer les variables d'environnement
sudo nano /opt/movetoai/app/.env

# Variables à renseigner obligatoirement :
# ANTHROPIC_API_KEY=sk-ant-...      (LLM principal)
# RESEND_API_KEY=re_...             (envoi d'emails)
# STRIPE_SECRET_KEY=sk_live_...     (paiements)
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Redémarrer après modification du .env
sudo -u movetoai pm2 restart movetoai

# Vérifier que tout fonctionne
bash scripts/server/status.sh
```

### 4. Installation Ollama (optionnel — LLM local)

```bash
# Modèle léger (8B params — 8GB RAM min)
sudo bash scripts/server/install-ollama.sh --models llama3.1:8b

# Modèles multiples (8B + 70B — 64GB RAM min)
sudo bash scripts/server/install-ollama.sh --models llama3.1:8b,llama3.1:70b
```

---

## Opérations courantes

### Démarrage
```bash
bash scripts/server/start.sh           # Démarre tous les services
bash scripts/server/start.sh --check-only  # Vérifie sans démarrer
```

### Arrêt
```bash
bash scripts/server/stop.sh            # Arrête app + Nginx (PostgreSQL/Redis restent actifs)
bash scripts/server/stop.sh --all      # Arrêt complet (tous les services)
bash scripts/server/stop.sh --force    # Sans confirmation interactive
```

### État des services
```bash
bash scripts/server/status.sh          # Affichage lisible
bash scripts/server/status.sh --json   # JSON (pour monitoring externe)
bash scripts/server/status.sh --watch  # Rafraîchissement automatique toutes les 5s
```

### Mise à jour (zero-downtime)
```bash
bash scripts/server/update.sh          # Met à jour depuis main
bash scripts/server/update.sh --branch develop   # Branche spécifique
bash scripts/server/update.sh --skip-backup      # Sans sauvegarde (plus rapide)
FORCE_UPDATE=true bash scripts/server/update.sh  # Force même si déjà à jour
```

### Sauvegarde manuelle
```bash
bash scripts/server/backup-db.sh                       # Vers /opt/movetoai/backups/
bash scripts/server/backup-db.sh --dest /mnt/nfs/      # Vers un NAS
bash scripts/server/backup-db.sh --keep 60             # Rétention 60 jours
```

---

## Variables d'environnement requises

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL — générée automatiquement |
| `AUTH_SECRET` | ✅ | Secret NextAuth v5 — généré automatiquement |
| `NEXTAUTH_SECRET` | ✅ | Alias AUTH_SECRET — généré automatiquement |
| `NEXTAUTH_URL` | ✅ | URL publique de l'application |
| `ANTHROPIC_API_KEY` | ✅ | Clé API Anthropic (Claude) |
| `RESEND_API_KEY` | ✅ | Envoi d'emails transactionnels |
| `STRIPE_SECRET_KEY` | ✅ | Paiements Stripe |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Vérification webhooks Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Clé publique Stripe |
| `CRON_SECRET` | ✅ | Protection endpoints `/api/cron/*` — généré |
| `REDIS_URL` | ✅ | URL Redis — générée automatiquement |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | ⚡ | Protection formulaires |
| `HCAPTCHA_SECRET_KEY` | ⚡ | Protection formulaires |
| `GROQ_API_KEY` | 💡 | LLM alternatif (optionnel) |
| `OLLAMA_BASE_URL` | 💡 | LLM local (optionnel) |
| `SENTRY_DSN` | 💡 | Monitoring erreurs (optionnel) |

---

## Architecture de déploiement

```
Internet → Nginx (443/80) → Next.js via PM2 (cluster, port 3000)
                              ↓
                         PostgreSQL 16 (5432, localhost only)
                         Redis 7 (6379, localhost only)
                         Ollama (11434, localhost only) [optionnel]
```

```
/opt/movetoai/
├── app/                    # Code de l'application
│   ├── .env                # Variables d'environnement (600 root)
│   ├── ecosystem.config.js # Configuration PM2
│   ├── .next/              # Build Next.js
│   └── prisma/             # Schéma et migrations
├── logs/                   # Logs PM2 + Nginx (logrotate 14 jours)
│   ├── pm2-out.log
│   ├── pm2-error.log
│   ├── cron-out.log
│   ├── nginx-access.log
│   └── nginx-error.log
├── backups/                # Dumps PostgreSQL (retention 7 jours)
│   └── backup-YYYYMMDD-HHmmss/
│       ├── app/            # Code complet
│       └── db.sql.gz       # Dump compressé
├── ollama-models/          # Modèles LLM locaux [optionnel]
└── INSTALLATION_CREDENTIALS.txt  # ⚠ À supprimer après sauvegarde !
```

---

## Jobs cron

Le worker PM2 `movetoai-cron` s'exécute chaque jour à **08h00** et appelle :

| Endpoint | Fréquence | Description |
|----------|-----------|-------------|
| `GET /api/cron/certifications` | Quotidien | Alertes expiration (J-90, J-30, J=0) |

Les endpoints sont protégés par `Authorization: Bearer $CRON_SECRET`.

Nginx bloque l'accès externe à `/api/cron/*` (whitelist `127.0.0.1` uniquement).

---

## Mise à jour

Le script `update.sh` effectue une mise à jour **zero-downtime** :

```
1. Vérifications (espace disque, état app)
2. Sauvegarde code + dump BDD
3. git pull (branche main)
4. npm ci --prefer-offline
5. prisma migrate deploy
6. Seed idempotent (certifications)
7. npm run build
8. pm2 reload (cluster → reload instance par instance)
9. Health check → rollback automatique si échec
```

**Durée typique** : 3-8 minutes selon la taille du build.

---

## Rollback manuel

Si une mise à jour tourne mal et que le rollback automatique échoue :

```bash
# Lister les sauvegardes disponibles
ls -lt /opt/movetoai/backups/

# Identifier le backup à restaurer (ex: backup-20260501-143022)
BACKUP=/opt/movetoai/backups/backup-20260501-143022

# 1. Restaurer le code
sudo rsync -a --delete "$BACKUP/app/" /opt/movetoai/app/
sudo chown -R movetoai:movetoai /opt/movetoai/app/

# 2. Restaurer la base de données (ATTENTION : perte des données post-backup)
read -s -p "Mot de passe DB: " DB_PASS
gunzip -c "$BACKUP/db.sql.gz" \
  | PGPASSWORD="$DB_PASS" psql -h localhost -U movetoai movetoai_prod

# 3. Regénérer Prisma et redémarrer
sudo -u movetoai bash -c "
  cd /opt/movetoai/app
  npx prisma generate
  pm2 restart movetoai
"

# 4. Vérifier
bash scripts/server/status.sh
```

---

## Monitoring

### Logs en direct
```bash
sudo -u movetoai pm2 logs movetoai          # Logs application
sudo -u movetoai pm2 logs movetoai-cron     # Logs cron
sudo -u movetoai pm2 monit                  # Dashboard PM2
tail -f /opt/movetoai/logs/nginx-error.log  # Logs Nginx
journalctl -u ollama -f                     # Logs Ollama
```

### État JSON (pour Uptime Kuma, Grafana, etc.)
```bash
bash scripts/server/status.sh --json
# → {"timestamp":"...","services":{"postgresql":true,"redis":true,...}}
```

### Health check HTTP
```bash
curl https://votre-domaine.com/api/health
# → {"status":"ok","db":"connected","timestamp":"..."}
```

---

## Sécurité

### Accès réseau (UFW)
| Port | Source | Service |
|------|--------|---------|
| 22 | Tout | SSH |
| 80 | Tout | HTTP (redirection HTTPS) |
| 443 | Tout | HTTPS |
| 3000 | Bloqué | Next.js (Nginx uniquement) |
| 5432 | localhost | PostgreSQL |
| 6379 | localhost | Redis |
| 11434 | localhost | Ollama |

### Mises à jour de sécurité automatiques
```bash
# Activer les mises à jour de sécurité non-assistées
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Rotation des secrets
```bash
# Regénérer le CRON_SECRET
NEW_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
sed -i "s/^CRON_SECRET=.*/CRON_SECRET=${NEW_SECRET}/" /opt/movetoai/app/.env
sudo -u movetoai pm2 restart movetoai
```

---

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
sudo -u movetoai pm2 logs movetoai --lines 50

# Vérifier les variables d'environnement
sudo -u movetoai bash -c "cd /opt/movetoai/app && node -e \"require('./.env')\" 2>&1 || cat .env | grep -v '=$'"

# Tester le build manuellement
sudo -u movetoai bash -c "cd /opt/movetoai/app && npm run build"
```

### Erreur Prisma "Unknown field" après mise à jour

```bash
# Le client Prisma est désynchronisé — regénérer
sudo -u movetoai bash -c "cd /opt/movetoai/app && npx prisma generate"
sudo -u movetoai pm2 restart movetoai
```

### Redis ne répond pas

```bash
# Vérifier le mot de passe
REDIS_PASS=$(grep "^REDIS_URL=" /opt/movetoai/app/.env | sed 's/.*:\([^@]*\)@.*/\1/')
redis-cli -a "$REDIS_PASS" ping
# → PONG si OK

# Vérifier la mémoire Redis
redis-cli -a "$REDIS_PASS" info memory | grep used_memory_human
```

### Nginx : 502 Bad Gateway

```bash
# L'application n'est pas démarrée
bash scripts/server/start.sh

# Vérifier la config Nginx
nginx -t
sudo nginx -s reload
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
certbot renew --nginx --force-renewal

# Vérifier la date d'expiration
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com \
  2>/dev/null | openssl x509 -noout -dates
```

---

## Contacts et ressources

- **Issues** : https://github.com/votre-org/move-to-ai/issues
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation PM2** : https://pm2.keymetrics.io/docs
- **Documentation Next.js** : https://nextjs.org/docs/deployment
- **Certbot** : https://certbot.eff.org
