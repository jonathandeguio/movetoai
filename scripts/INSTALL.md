# BluePilot AI — Guide d'installation Linux

> **Cible** : Ubuntu 22.04 LTS / Debian 12 · Node.js 22 · MySQL 8 · Nginx · systemd

---

## Pré-requis

| Élément | Version minimale |
|---------|-----------------|
| OS | Ubuntu 22.04 / Debian 12 |
| RAM | 2 Go (4 Go recommandés) |
| CPU | 2 vCPU |
| Disque | 20 Go |
| Accès | `sudo` / root SSH |

---

## 1. Copier les fichiers de dev sur le serveur

```bash
# Depuis votre machine de dev — copie complète sauf node_modules/.next/.env
rsync -avz \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.env' \
  --exclude='.deploy-state/' \
  ./ user@ip-serveur:/opt/movetoai/
```

Ou en une commande (copie + déploiement automatique) :

```bash
MOVETOAI_HOST=user@ip-serveur ./scripts/push-to-server.sh
```

---

## 2. Première installation (une seule fois)

```bash
# Sur le serveur
cd /opt/movetoai
chmod +x scripts/install.sh
sudo scripts/install.sh
```

Le script effectue automatiquement :

| Étape | Action |
|-------|--------|
| 1 | Mise à jour système + paquets (`nginx`, `mysql-server`…) |
| 2 | Installation Node.js 22 LTS via NodeSource |
| 3 | Création de l'utilisateur système `movetoai` |
| 4 | Création de la base MySQL `movetoai` + user `movetoai` (mot de passe aléatoire) |
| 5 | Génération du fichier `.env` (secrets auto-générés) |
| 6 | `npm ci` → `prisma generate` → `prisma db push` → `next build` |
| 7 | Service systemd `movetoai.service` + Nginx reverse proxy + UFW firewall |

---

## 3. Configurer les clés API (obligatoire après install)

```bash
sudo nano /opt/movetoai/.env
```

```dotenv
# ⚠ Obligatoire — IA
ANTHROPIC_API_KEY=sk-ant-...

# Optionnel — Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optionnel — Resend (emails)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@votre-domaine.fr
```

```bash
sudo systemctl restart movetoai
```

---

## 4. Déploiement après copie de fichiers

```bash
# Sur le serveur, après avoir copié les fichiers
sudo /opt/movetoai/scripts/deploy.sh
```

Ce que `deploy.sh` fait :

```
1. Vérifie .env + DB + user système
2. Détecte les changements (SHA-256 sur schema.prisma et package-lock.json)
3. npm ci          — seulement si package-lock.json changé
4. prisma generate — toujours
5. Si schema.prisma changé :
   ├─ Snapshot mysqldump compressé → /var/backups/movetoai/pre-deploy_*.sql.gz
   ├─ Dry-run → affiche les changements
   └─ prisma db push
6. next build
7. systemctl restart movetoai + health check HTTP (60s)
```

---

## 5. Variables d'environnement du script

```bash
export MOVETOAI_URL="https://app.votre-domaine.fr"
export MOVETOAI_DOMAIN="app.votre-domaine.fr"
export MOVETOAI_USER="movetoai"
export DB_NAME="movetoai"
export DB_USER="movetoai"
export DB_PASS="MonMotDePasseStrong!"

sudo -E scripts/install.sh
```

---

## 6. HTTPS avec Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.votre-domaine.fr
```

Puis dans `.env` :

```dotenv
NEXT_PUBLIC_APP_URL=https://app.votre-domaine.fr
AUTH_URL=https://app.votre-domaine.fr
NEXTAUTH_URL=https://app.votre-domaine.fr
```

```bash
sudo systemctl restart movetoai
```

---

## 7. Commandes de gestion

```bash
sudo systemctl status movetoai          # statut
sudo journalctl -u movetoai -f          # logs live
sudo systemctl restart movetoai         # redémarrer

sudo scripts/deploy.sh                  # déployer après copie de fichiers
sudo scripts/backup-db.sh              # backup manuel

# Prisma Studio (interface DB)
sudo -u movetoai bash -c "cd /opt/movetoai && npx prisma studio"
```

---

## 8. Backup de la base de données

```bash
# Manuel
sudo /opt/movetoai/scripts/backup-db.sh

# Automatique — crontab root (chaque nuit à 2h)
sudo crontab -e
# Ajouter :
# 0 2 * * * /opt/movetoai/scripts/backup-db.sh >> /var/log/movetoai-backup.log 2>&1
```

Backups dans `/var/backups/movetoai/` — rétention 14 jours.

---

## 9. Restaurer un backup

```bash
gunzip -c /var/backups/movetoai/movetoai_20260419_020000.sql.gz \
  | mysql -u movetoai -p movetoai
```

---

## 10. Architecture déployée

```
Internet
    │
    ▼
[Nginx :80/:443]   ← reverse proxy, SSL, cache static
    │
    ▼
[Next.js :3000]    ← movetoai.service (systemd, user: movetoai)
    │
    ▼
[MySQL :3306]      ← base movetoai (user: movetoai, localhost uniquement)
```

---

## Dépannage

| Symptôme | Commande |
|----------|----------|
| App inaccessible | `sudo systemctl status movetoai` |
| Erreur 502 Nginx | `sudo journalctl -u movetoai -n 50` |
| Erreur DB | `mysql -u movetoai -p -e "SHOW DATABASES;"` |
| Build échoué | `sudo -u movetoai bash -c "cd /opt/movetoai && npm run build"` |
| Schema désynchronisé | `sudo -u movetoai bash -c "cd /opt/movetoai && npx prisma db push"` |
