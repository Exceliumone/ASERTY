# Guide de configuration

Toutes les variables sont documentées dans [`.env.example`](../.env.example).
Ce guide détaille leur usage.

## Général

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production` |
| `APP_URL` | URL publique du frontend (utilisée pour CORS) |
| `API_URL` | URL publique de l'API (utilisée par le frontend, `NEXT_PUBLIC_API_URL`) |
| `API_PORT` / `WEB_PORT` | Ports d'écoute internes |

## Base de données

`DATABASE_URL` est la chaîne de connexion Prisma. En Docker Compose, elle est
recomposée automatiquement à partir de `POSTGRES_USER`/`POSTGRES_PASSWORD`/
`POSTGRES_DB` — ne renseignez ces variables séparées que pour cet usage.

## Redis / BullMQ

`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` — utilisés à la fois pour le
cache et les files de jobs (génération de contenu, veille de tendances,
génération d'images, analytics, publication X, récupération de métriques).

## Sécurité

| Variable | Description |
|---|---|
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets de signature des tokens JWT. Générez avec `openssl rand -hex 32`. **Différents entre eux et par environnement.** |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Durées de vie des tokens (format `ms`/`vercel/ms`, ex: `15m`, `7d`) |
| `ENCRYPTION_KEY` | Clé AES-256-GCM (64 caractères hex = 32 octets) utilisée pour chiffrer les clés API tierces stockées en base. Générez avec `openssl rand -hex 32`. **La perte de cette clé rend les credentials stockés irrécupérables.** |
| `RATE_LIMIT_TTL` / `RATE_LIMIT_MAX` | Fenêtre et plafond du rate limiting global (Throttler) |

## OpenAI

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Clé API OpenAI utilisée par les 5 agents |
| `OPENAI_TEXT_MODEL` | Modèle texte (tweets, tendances, analytics, réponses, prompts d'image) |
| `OPENAI_IMAGE_MODEL` | Modèle de génération d'images |

Ces valeurs peuvent aussi être surchargées par utilisateur/environnement
depuis **Réglages → Clés API** (stockage chiffré en base, prioritaire sur
`.env` si votre intégration le prévoit).

## X (Twitter) API v2

| Variable | Description |
|---|---|
| `X_API_KEY` / `X_API_SECRET` | Clés d'application (OAuth 1.0a) |
| `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET` | Jetons d'accès du compte Pablo |
| `X_BEARER_TOKEN` | Jeton App-only (lecture) |
| `PABLO_X_USERNAME` | Nom d'utilisateur X du compte Pablo (sans @), utilisé pour la récupération des mentions |

Sans ces variables, l'application fonctionne en mode "brouillon uniquement" :
les agents génèrent du contenu mais rien n'est publié sur X.

## Mémoire de Pablo & prompts

Ces éléments ne sont **pas** configurés via variables d'environnement : ils
vivent en base de données (`pablo_memory_versions`, `prompt_templates`),
versionnés et modifiables depuis le tableau de bord (**Réglages** et
**Bibliothèque de prompts**). Le seed initial (`prisma/seed.ts`) crée la
version 1 de chacun.

## Sauvegardes

| Variable | Description |
|---|---|
| `BACKUP_DIR` | Répertoire de sortie des sauvegardes (`scripts/backup.sh`) |
| `BACKUP_RETENTION_DAYS` | Nombre de jours de rétention avant purge |
