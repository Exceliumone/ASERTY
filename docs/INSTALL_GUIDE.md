# Guide d'installation (développement local)

## Prérequis

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable` puis `corepack prepare pnpm@10.33.0 --activate`)
- PostgreSQL ≥ 15 (local ou via Docker)
- Redis ≥ 7 (local ou via Docker)
- Une clé API OpenAI
- (Optionnel pour la publication réelle) des clés API X (Twitter) v2 avec accès
  lecture/écriture

## 1. Cloner et installer les dépendances

```bash
git clone <votre-fork> pablo-ai-social-agent
cd pablo-ai-social-agent
pnpm install
```

## 2. Configurer l'environnement

```bash
cp .env.example .env
```

Renseignez au minimum :

- `DATABASE_URL` (ou les variables `POSTGRES_*` si vous utilisez Docker pour la base)
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — générez avec `openssl rand -hex 32`
- `ENCRYPTION_KEY` — 64 caractères hexadécimaux, générez avec `openssl rand -hex 32`
- `OPENAI_API_KEY`

Les clés X peuvent être laissées vides en développement : le Content/Trend/
Analytics/Community/Image Agent fonctionnent sans elles (seule la publication
réelle sur X et la lecture des métriques les nécessitent).

## 3. Lancer les services d'infrastructure

Si vous n'avez pas déjà PostgreSQL/Redis en local, le plus simple est de ne
démarrer que ces deux services via Docker Compose :

```bash
docker compose up -d postgres redis
```

## 4. Initialiser la base de données

```bash
pnpm --filter @pablo/api prisma:migrate
pnpm --filter @pablo/api prisma:seed
```

Le seed crée :
- Un compte propriétaire (`SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD`, par
  défaut `owner@pablo.ai` / `ChangeMe123!` — **à changer immédiatement**).
- La version 1 de la mémoire de Pablo (`pablo_memory_versions`).
- La version 1 de chaque prompt d'agent (`prompt_templates`).

## 5. Démarrer l'application

```bash
pnpm dev
```

- API : http://localhost:4000 (Swagger : http://localhost:4000/api/docs)
- Web : http://localhost:3000

Connectez-vous avec le compte seedé, puis changez le mot de passe et
configurez vos clés API réelles depuis **Réglages**.

## 6. Vérifier l'installation

```bash
curl http://localhost:4000/api/v1/health
```

Doit renvoyer `{ "status": "ok", ... }`.

## Commandes utiles

| Commande | Effet |
|---|---|
| `pnpm dev:api` | Démarre uniquement l'API en mode watch |
| `pnpm dev:web` | Démarre uniquement le frontend |
| `pnpm --filter @pablo/api prisma:studio` | Explorateur de base de données |
| `pnpm test` | Lance les tests unitaires de tous les packages |
| `pnpm lint` | Lint de tous les packages |
