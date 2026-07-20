# Guide de sauvegarde

## Ce qui doit être sauvegardé

| Donnée | Emplacement | Criticité |
|---|---|---|
| Base de données PostgreSQL | volume `postgres_data` | Critique — tweets, images, prompts, mémoire de Pablo, analytics |
| Images générées | volume `api_uploads` | Élevée — non régénérables à l'identique |
| Fichier `.env` | racine du projet | Critique — secrets, ne pas committer, sauvegarder hors du dépôt |

Redis (`redis_data`) contient uniquement des jobs de file d'attente
éphémères : il n'a pas besoin d'être sauvegardé.

## Sauvegarde de la base de données (Docker)

```bash
docker compose exec -T postgres pg_dump -U ${POSTGRES_USER:-pablo} ${POSTGRES_DB:-pablo_ai} | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

## Sauvegarde des images générées

```bash
docker run --rm -v pablo-ai-social-agent_api_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

## Script de sauvegarde automatisé

Un script prêt à l'emploi est fourni dans `scripts/backup.sh` (voir aussi
`BACKUP_DIR` et `BACKUP_RETENTION_DAYS` dans `.env.example`). Planifiez-le via
cron sur le VPS :

```bash
crontab -e
# Sauvegarde quotidienne à 3h du matin
0 3 * * * /opt/pablo-ai-social-agent/scripts/backup.sh >> /var/log/pablo-backup.log 2>&1
```

## Restauration

```bash
gunzip -c backup_20260101_030000.sql.gz | docker compose exec -T postgres psql -U ${POSTGRES_USER:-pablo} ${POSTGRES_DB:-pablo_ai}
```

Pour les images :

```bash
docker run --rm -v pablo-ai-social-agent_api_uploads:/data -v $(pwd):/backup alpine \
  tar xzf /backup/uploads_20260101_030000.tar.gz -C /data
```

## Bonnes pratiques

- Copiez les sauvegardes hors du VPS (S3, autre serveur, stockage froid) —
  une sauvegarde qui reste sur la même machine ne protège pas d'une panne
  disque ou d'une compromission du serveur.
- Testez périodiquement une restauration complète sur un environnement de
  recette.
- Conservez au moins 14 jours d'historique (`BACKUP_RETENTION_DAYS`).
