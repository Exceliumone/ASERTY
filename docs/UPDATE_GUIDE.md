# Guide de mise à jour

## Avant toute mise à jour

1. Faites une sauvegarde (voir [`BACKUP_GUIDE.md`](BACKUP_GUIDE.md)).
2. Consultez le `CHANGELOG` / les messages de commit pour repérer d'éventuelles
   migrations de base de données ou changements de variables d'environnement.

## Déploiement Docker

```bash
cd /opt/pablo-ai-social-agent
git fetch origin
git checkout main
git pull origin main

# Reconstruire et redémarrer uniquement ce qui a changé
docker compose build
docker compose up -d
```

Les migrations Prisma sont appliquées automatiquement au démarrage du
conteneur `api` (`prisma migrate deploy` dans l'entrypoint). Si une migration
échoue, le conteneur ne démarre pas : consultez `docker compose logs api`.

## Déploiement PM2 (bare-metal)

```bash
cd /opt/pablo-ai-social-agent
git pull origin main
pnpm install
pnpm --filter @pablo/api prisma:generate
pnpm --filter @pablo/api prisma:migrate
pnpm build
pm2 reload ecosystem.config.js
```

`pm2 reload` redémarre les processus un par un (zero-downtime pour les
instances en cluster ; en mode fork simple, prévoyez une brève coupure).

## Mise à jour de la mémoire de Pablo ou des prompts

Ces éléments sont versionnés en base de données, pas dans le code : aucune
action de déploiement n'est nécessaire. Utilisez l'écran **Réglages** (mémoire)
ou **Bibliothèque de prompts** pour publier une nouvelle version — l'ancienne
reste disponible et réactivable à tout moment.

## Rollback

```bash
git checkout <tag-ou-commit-precedent>
docker compose up -d --build
```

Si une migration de base de données a été appliquée entre-temps, restaurez la
sauvegarde correspondante avant de revenir à une version antérieure du code
(voir [`BACKUP_GUIDE.md`](BACKUP_GUIDE.md)).
