# Architecture technique

## Vue d'ensemble

```
┌─────────────┐      HTTPS       ┌──────────────┐
│   Browser   │ ───────────────► │    Nginx     │
└─────────────┘                  └──────┬───────┘
                                         │
                     ┌───────────────────┼───────────────────┐
                     ▼                                       ▼
             ┌───────────────┐                      ┌────────────────┐
             │  Next.js Web  │  REST (JWT)  ───────► │  NestJS API    │
             └───────────────┘                      └───────┬────────┘
                                                             │
                        ┌────────────────────────────────────┼────────────────────────┐
                        ▼                                    ▼                        ▼
                ┌───────────────┐                   ┌────────────────┐      ┌──────────────────┐
                │  PostgreSQL   │                    │     Redis      │      │   OpenAI API      │
                │  (Prisma)     │                    │   (BullMQ)     │      │  (texte + image)   │
                └───────────────┘                    └───────┬────────┘      └──────────────────┘
                                                             │
                                                             ▼
                                                     ┌────────────────┐
                                                     │   X API v2     │
                                                     └────────────────┘
```

## Backend (NestJS)

### Modules d'infrastructure (`src/{prisma,redis,queue,common}`)

- `PrismaModule` : client Prisma partagé, global.
- `RedisModule` : client ioredis partagé (cache/lock si besoin futur).
- `QueueModule` : configuration BullMQ (connexion Redis + politique de retry
  par défaut). Chaque module fonctionnel enregistre ses propres queues via
  `BullModule.registerQueue`.
- `EncryptionModule` : chiffrement AES-256-GCM des credentials tiers.
- Guards/decorators communs : `JwtAuthGuard`, `RolesGuard`, `@CurrentUser`,
  `@Roles`, filtre d'exceptions global, intercepteur de logging.

### Identité & sécurité

- `AuthModule` : login/refresh/logout, JWT access + refresh (rotation et
  révocation des refresh tokens en base).
- `UsersModule` : gestion des comptes (OWNER/EDITOR/VIEWER).
- `CredentialsModule` : CRUD des clés API tierces, jamais retournées en clair.

### Identité de Pablo

- `PabloMemoryModule` : la "mémoire de Pablo" (personnalité, vocabulaire,
  identité visuelle, garde-fous) est stockée en base, versionnée
  (`pablo_memory_versions`), avec une seule version active à la fois. Chaque
  agent appelle `buildIdentityPrimer()` avant tout appel OpenAI pour rester
  cohérent avec l'identité du personnage.
- `PromptsModule` : prompts système versionnés par rôle d'agent
  (`prompt_templates`), modifiables depuis le tableau de bord sans
  redéploiement.

### Les 5 agents (`src/agents/*`)

Chaque agent est un module NestJS autonome exposant :
1. Un contrôleur REST pour le déclenchement manuel depuis le dashboard.
2. Un `WorkerHost` BullMQ pour l'exécution asynchrone/planifiée.
3. Un service métier qui orchestre : mémoire de Pablo → prompt actif →
   appel OpenAI (JSON strict) → persistance Prisma → journal de décision
   (`DecisionLogService`).

Infrastructure partagée par les 5 agents :
- `OpenAiService` : wrapper unique autour du SDK OpenAI (complétion JSON,
  génération d'image).
- `MemoryStoreService` : mémoire anti-doublon (`used_memory_items`) — thèmes,
  expressions, hashtags et scénarios visuels déjà utilisés récemment.
- `DecisionLogService` : journal d'explicabilité (`agent_decision_logs`) —
  raisonnement métier lisible, jamais de chaîne de pensée brute du modèle.

### Cycle de vie du contenu

- `TweetsModule` : CRUD des brouillons/suggestions de tweets.
- `CalendarModule` : planification (`calendar_entries`), reprogrammation,
  déprogrammation.
- `TwitterModule` : intégration X API v2 (`twitter-api-v2`), toujours
  invoquée via des jobs BullMQ à concurrence 1 pour respecter les limites de
  débit de la plateforme.
- `AnalyticsModule` : agrégats exposés au dashboard (KPIs, historique
  d'engagement, insights calculés par l'Analytics Agent).
- `SchedulerModule` : le cœur du fonctionnement 24h/24 — cron NestJS
  (`@nestjs/schedule`) qui enqueue automatiquement : publication des tweets
  dus, rafraîchissement des métriques, sondage des mentions, veille de
  tendances, analyse de performance et génération quotidienne d'idées.

## Frontend (Next.js App Router)

- Route group `(dashboard)` : shell avec sidebar + topbar, protégé par un
  garde d'authentification client (`AuthGuard`) basé sur le token JWT stocké
  côté navigateur.
- 9 écrans : Accueil, Calendrier, Statistiques, Bibliothèque d'images,
  Bibliothèque de prompts, Agents IA, Historique, Suggestions, Réglages.
- Design system maison (style shadcn/ui) construit sur Radix UI primitives +
  `class-variance-authority`, dark mode via `next-themes` (classe CSS +
  variables HSL), animations via Framer Motion.
- Données récupérées via SWR (`src/lib/hooks.ts`) contre l'API REST
  versionnée (`/api/v1/...`).
- Graphiques (Recharts) suivant une palette catégorielle/séquentielle
  validée pour l'accessibilité daltonienne (voir `src/lib/chart-colors.ts`).

## Modèle de données (Prisma)

Voir `apps/api/prisma/schema.prisma` pour le détail complet. Entités
principales : `User`, `RefreshToken`, `ApiCredential`, `PabloMemoryVersion`,
`PromptTemplate`, `Tweet`, `CalendarEntry`, `GeneratedImage`,
`UsedMemoryItem`, `TrendInsight`, `AnalyticsSnapshot`, `AnalyticsInsight`,
`CommunityReply`, `AgentDecisionLog`, `AuditLog`.

## Pourquoi ces choix

- **Prisma + PostgreSQL** : modèle relationnel riche (tweets ↔ images ↔
  calendrier ↔ analytics ↔ logs), migrations versionnées, typed client.
- **BullMQ + Redis** : découple les appels OpenAI/X (latents, sujets à
  rate limiting) du cycle requête/réponse HTTP, et fournit la persistance de
  jobs nécessaire à un fonctionnement 24h/24 sans supervision.
- **Mémoire et prompts en base plutôt qu'en code** : permet d'ajuster le
  comportement des agents et l'identité de Pablo sans redéploiement, tout en
  conservant un historique versionné et réversible.
- **Stockage local des images (volume Docker) plutôt que S3 par défaut** :
  simplicité pour un déploiement mono-VPS ; `LocalStorageService` est le seul
  point à réimplémenter pour basculer vers un stockage objet.
