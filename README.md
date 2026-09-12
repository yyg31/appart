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

## Notes

- L'extraction automatique depuis une URL dépend de la structure de la page du site source (balises Open Graph / JSON-LD) ; certains sites bloquent les requêtes automatisées, auquel cas les champs restent à compléter manuellement.
- Les deux personnes qui notent sont créées par défaut (« Personne 1 » et « Personne 2 ») et peuvent être renommées dans **Réglages**.
