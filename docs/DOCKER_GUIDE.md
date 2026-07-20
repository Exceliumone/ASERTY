# Guide Docker

## Images

| Image | Fichier | Contenu |
|---|---|---|
| `pablo-api` | `docker/api.Dockerfile` | NestJS buildé, Prisma Client généré, migrations appliquées au démarrage |
| `pablo-web` | `docker/web.Dockerfile` | Next.js en sortie `standalone` |

Les deux Dockerfiles sont multi-stage : une étape `deps` (installation
pnpm avec cache des layers), une étape `build`, puis une image runtime
minimale (Alpine) sans outils de build ni sources superflues.

## Services de la stack (`docker-compose.yml`)

| Service | Rôle |
|---|---|
| `postgres` | Base de données (volume persistant `postgres_data`) |
| `redis` | File de jobs BullMQ + cache (volume `redis_data`) |
| `api` | Backend NestJS (5 agents IA, auth, intégration X) |
| `web` | Frontend Next.js |
| `nginx` | Reverse proxy unique (port 80/443) vers `web` et `api` |

## Commandes courantes

```bash
# Démarrer toute la stack (build inclus)
docker compose up -d --build

# Suivre les logs d'un service
docker compose logs -f api

# Redémarrer un seul service après modification de code
docker compose up -d --build api

# Exécuter une commande ponctuelle dans le conteneur API (ex: seed, prisma studio)
docker compose exec api node_modules/.bin/ts-node prisma/seed.ts

# Arrêter la stack sans supprimer les volumes (données conservées)
docker compose down

# Arrêter ET supprimer les volumes (⚠️ perte des données)
docker compose down -v
```

## Variables d'environnement

Le fichier `.env` à la racine est lu à la fois par `docker-compose.yml`
(interpolation `${VAR}`) et transmis aux conteneurs via `env_file`. Voir
[`CONFIGURATION_GUIDE.md`](CONFIGURATION_GUIDE.md) pour le détail de chaque
variable.

## Volumes persistants

- `postgres_data` : données PostgreSQL.
- `redis_data` : persistance Redis (AOF), utile pour ne pas perdre les jobs
  BullMQ en attente lors d'un redémarrage.
- `api_uploads` : images générées par l'Image Agent, servies par Nginx sous
  `/uploads/`.

## Mise à jour d'une image sans downtime complet

```bash
docker compose build api
docker compose up -d --no-deps api
```

`--no-deps` évite de redémarrer `postgres`/`redis` inutilement. Le endpoint de
healthcheck (`/api/v1/health`) garantit que Docker attend que l'API soit prête
avant de la considérer "healthy".
