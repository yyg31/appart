# Appart

Application privée pour partager et suivre à deux une liste d'appartements en vente.

## Fonctionnalités

- Ajout d'une annonce en collant simplement son URL : le titre, la description, l'image, le prix, la surface et le nombre de pièces sont extraits automatiquement quand c'est possible (sinon, formulaire manuel).
- Fiche par appartement avec tous les critères : prix, surface, nombre de pièces, étage, ascenseur, cave, arrondissement, quartier, contact téléphonique, date de visite.
- Historique des prix : chaque changement de prix est enregistré avec sa date.
- Date de mise à jour de l'annonce (celle affichée par le site source), modifiable à la main.
- Note de 1 à 10 par personne, avec commentaire, sur chaque annonce.
- Bloc-notes libre par annonce.
- Statuts de suivi (nouveau, à contacter, contacté, visite prévue, visité, coup de cœur, rejeté, plus disponible), filtres et tris sur le tableau de bord.
- Réglages pour renommer les deux personnes qui notent.

## Stack technique

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS v4)
- SQLite via `better-sqlite3`, stocké dans `data/appart.db` (créé automatiquement, ignoré par git)
- `cheerio` pour l'extraction des informations depuis l'URL collée

Aucun compte ni service externe n'est nécessaire : les données restent en local dans le fichier SQLite.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
npm run start
```

## Docker

L'app + Caddy (HTTPS) peuvent tourner entièrement via Docker Compose.

1. Copiez `Caddyfile.example` vers `Caddyfile` et remplacez le domaine :
   ```bash
   cp Caddyfile.example Caddyfile
   ```
   (le mot de passe est optionnel — voir les instructions commentées dans le fichier pour l'activer)
2. Lancez :
   ```bash
   docker compose up -d --build
   ```

Les données (`data/appart.db`, `data/uploads/`) sont montées depuis le dossier `data/` du projet, donc persistantes entre les redéploiements. Le vrai `Caddyfile` (s'il contient un mot de passe) n'est jamais commité — voir `.gitignore`.

## Sauvegardes et mises à jour

- **Sauvegarder maintenant** : `bash scripts/backup.sh` — archive `data/appart.db` et `data/uploads/` dans `../appart-backups/` (en dehors du projet), et garde les 14 dernières.
- **Mettre à jour l'app** : `bash scripts/update.sh` — sauvegarde automatiquement, puis `git pull` et reconstruit les conteneurs.
- **Restaurer une sauvegarde** : `bash scripts/restore.sh` (restaure la plus récente) ou `bash scripts/restore.sh chemin/vers/appart-backup-XXXX.tar.gz`.
- **Sauvegarde automatique quotidienne** (recommandé) : ajoutez au crontab (`crontab -e`) :
  ```
  0 4 * * * cd ~/appart && bash scripts/backup.sh >> ~/appart-backups/backup.log 2>&1
  ```

## Notes

- L'extraction automatique depuis une URL dépend de la structure de la page du site source (balises Open Graph / JSON-LD) ; certains sites bloquent les requêtes automatisées, auquel cas les champs restent à compléter manuellement.
- Les deux personnes qui notent sont créées par défaut (« Personne 1 » et « Personne 2 ») et peuvent être renommées dans **Réglages**.
