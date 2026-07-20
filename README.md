# Pablo AI Social Agent

Plateforme SaaS d'automatisation IA pour la gestion d'un compte X (Twitter)
dédié à un memecoin. Cinq agents IA spécialisés — **Content**, **Trend**,
**Analytics**, **Community** et **Image** — assistent la création éditoriale,
la veille de tendances, l'analyse de performance, la modération communautaire
et la génération d'images, en conservant en permanence l'identité et la
personnalité de **Pablo**, un raton laveur mascotte.

Le système est conçu pour tourner 24h/24 sur un VPS, respecter les limites et
règles des API tierces (OpenAI, X), et rester entièrement pilotable depuis un
tableau de bord premium.

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, TailwindCSS, Framer Motion, Radix UI |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis, BullMQ |
| IA | API OpenAI (texte + image), 5 agents spécialisés, mémoire versionnée |
| Infra | Docker, Docker Compose, Nginx, PM2, GitHub Actions |

## Structure du monorepo

```
apps/
  api/      NestJS — agents IA, auth, Prisma, BullMQ, intégration X
  web/      Next.js — tableau de bord (9 écrans)
packages/
  shared/   Types, DTOs et enums partagés entre le frontend et le backend
docker/     Dockerfiles, configuration Nginx, scripts d'entrypoint
docs/       Guides d'installation, de déploiement et d'architecture
```

## Les 5 agents IA

| Agent | Rôle |
|---|---|
| **Content Agent** | Rédige les tweets, garde le ton et l'humour de Pablo, évite les répétitions |
| **Trend Agent** | Surveille Solana, Bitcoin, Ethereum, Pump.fun et la culture meme, propose des angles éditoriaux |
| **Analytics Agent** | Analyse l'engagement, identifie formats et heures optimaux, recommande des actions justifiées |
| **Community Agent** | Suggère des réponses aux commentaires, signale les messages sensibles pour validation humaine |
| **Image Agent** | Génère des scènes visuelles de Pablo cohérentes avec son identité, selon le style choisi |

Chaque agent explique ses décisions dans les logs (`agent_decision_logs`) sous
forme de raisonnement métier lisible — jamais de chaîne de pensée brute du
modèle.

## Démarrage rapide

Voir [`docs/INSTALL_GUIDE.md`](docs/INSTALL_GUIDE.md) pour l'installation
locale complète, ou [`docs/DOCKER_GUIDE.md`](docs/DOCKER_GUIDE.md) pour un
déploiement conteneurisé en une commande.

```bash
pnpm install
cp .env.example .env            # renseigner les secrets
pnpm --filter @pablo/api prisma:migrate
pnpm --filter @pablo/api prisma:seed
pnpm dev                        # démarre l'API (4000) et le web (3000)
```

## Documentation

- [Guide d'installation](docs/INSTALL_GUIDE.md)
- [Guide VPS (production)](docs/VPS_GUIDE.md)
- [Guide Docker](docs/DOCKER_GUIDE.md)
- [Guide de mise à jour](docs/UPDATE_GUIDE.md)
- [Guide de sauvegarde](docs/BACKUP_GUIDE.md)
- [Guide de configuration](docs/CONFIGURATION_GUIDE.md)
- [Architecture technique](docs/ARCHITECTURE.md)

## Qualité & sécurité

- Authentification JWT (access + refresh), rôles (OWNER/EDITOR/VIEWER).
- Clés API tierces chiffrées au repos (AES-256-GCM).
- Rate limiting global (Throttler) et par endpoint sensible (login).
- Validation stricte des entrées (`class-validator`, whitelist).
- Health checks (`/api/v1/health`) pour l'orchestration/monitoring.
- Tests unitaires et d'intégration (Jest).
