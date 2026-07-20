# Guide de déploiement VPS (production)

Ce guide couvre un déploiement 24h/24 sur un VPS Linux (Ubuntu 22.04+
recommandé), avec deux options : **Docker** (recommandée) ou **PM2 bare-metal**.

## Prérequis serveur

- VPS avec au moins 2 vCPU / 4 Go RAM (les agents IA + Postgres + Redis + Next.js
  tiennent confortablement à cette taille)
- Un nom de domaine pointant vers l'IP du VPS (recommandé pour le HTTPS)
- Accès root ou sudo

## Option A — Déploiement Docker (recommandé)

### 1. Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Cloner le projet et configurer

```bash
git clone <votre-fork> /opt/pablo-ai-social-agent
cd /opt/pablo-ai-social-agent
cp .env.example .env
nano .env   # renseigner tous les secrets en production (voir CONFIGURATION_GUIDE.md)
```

### 3. Lancer la stack

```bash
docker compose up -d --build
```

Cela démarre : PostgreSQL, Redis, l'API (avec migrations Prisma automatiques
au démarrage), le frontend Next.js, et Nginx en reverse proxy sur le port 80.

### 4. Initialiser les données de base (première installation uniquement)

```bash
docker compose exec api node_modules/.bin/ts-node prisma/seed.ts
```

### 5. Activer HTTPS (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d votre-domaine.com
```

Puis adaptez `docker/nginx/nginx.conf` pour écouter sur le port 443 avec les
certificats générés (`/etc/letsencrypt/live/votre-domaine.com/`), montez le
dossier `/etc/letsencrypt` dans le conteneur `nginx` via `docker-compose.yml`,
et redirigez le port 80 vers 443. Redémarrez ensuite :

```bash
docker compose up -d nginx
```

### 6. Vérifier que tout tourne 24h/24

```bash
docker compose ps
docker compose logs -f api
```

Le `SchedulerService` (cron interne à l'API) prend le relais automatiquement :
publication des tweets planifiés, rafraîchissement des métriques, veille de
tendances, analyse de performance et génération d'idées de contenu tournent en
continu sans intervention manuelle.

## Option B — Déploiement PM2 (bare-metal, sans Docker)

### 1. Installer Node.js, pnpm, PostgreSQL, Redis, Nginx et PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql redis-server nginx
corepack enable && corepack prepare pnpm@10.33.0 --activate
sudo npm install -g pm2
```

### 2. Cloner, installer, builder

```bash
git clone <votre-fork> /opt/pablo-ai-social-agent
cd /opt/pablo-ai-social-agent
pnpm install
cp .env.example .env && nano .env
pnpm --filter @pablo/api prisma:generate
pnpm --filter @pablo/api prisma:migrate
pnpm --filter @pablo/api prisma:seed
pnpm build
```

### 3. Démarrer avec PM2

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # suivre l'instruction affichée pour démarrer PM2 au boot
```

### 4. Configurer Nginx

Copiez `docker/nginx/nginx.conf` vers `/etc/nginx/sites-available/pablo-ai`,
adaptez les `upstream` pour pointer vers `127.0.0.1:3000` et `127.0.0.1:4000`,
puis activez le site :

```bash
sudo ln -s /etc/nginx/sites-available/pablo-ai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Supervision recommandée

- `docker compose logs -f` ou `pm2 logs` pour le suivi en direct.
- `pm2 monit` pour l'usage CPU/RAM en bare-metal.
- Le endpoint `/api/v1/health` peut être branché à un uptime monitor externe
  (UptimeRobot, healthchecks.io, etc).
- Consultez [`BACKUP_GUIDE.md`](BACKUP_GUIDE.md) pour les sauvegardes
  automatiques et [`UPDATE_GUIDE.md`](UPDATE_GUIDE.md) pour les mises à jour
  sans interruption de service.
