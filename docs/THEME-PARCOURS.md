# Thème de la semaine — format « parcours » (v2)

## Fichiers
- `js/11-theme-parcours.js` — moteur : rendu élève, exercices, correction automatique, sauvegarde/reprise, bilan, espace enseignante (aperçu, correction, publication, vidéo, éditeur, création de thème).
- `js/12-theme-entretien-embauche.js` — thème « Vous voulez ce poste ? » (A0, A1, A2, B1, B2).
- `js/23-theme-conseil.js` — thème « Un petit conseil ! » (26 octobre → 1er novembre 2026, A0 à B2).
- Modifications ciblées : `js/03-donnees-themes-semaine.js` (visibilité brouillon, aiguillage v2, certificat), `js/00-config-etat.js` (lecture de `niveauTheme`), `index.html` (CSS `tp-*`, 2 balises script).

Les anciens thèmes (sans `version: 2`) gardent exactement leur rendu et leurs données.

## Données Firestore
| Chemin | Qui écrit | Contenu |
|---|---|---|
| `eleves/{uid}.temas.{temaId}.v2.r.{itemId}` | élève | réponse `{v, ok, st, n, ts}` — `st` = brouillon / auto / attente / avis |
| `eleves/{uid}.temas.{temaId}.v2.a.{actId}` | élève | activité lue/terminée |
| `eleves/{uid}.temas.{temaId}.v2.niveau` | élève | niveau du parcours utilisé |
| `eleves/{uid}.temas.{temaId}.v2.fb.{itemId}` | professeure | `{verdict: valide / a_revoir, c}` |
| `eleves/{uid}.temas.{temaId}.review` | professeure | note globale (inchangé) |
| `eleves/{uid}.niveauTheme` | professeure | niveau de thème forcé (ex. A0) |
| `config/temas` | professeure | `themes.{id}.publie`, `.videos.{niv}`, `.contenu.{niv}` (JSON), `nouveaux.{id}` (JSON) |

L'élève n'écrit que sous `temas` (comme avant).

## Règles Firestore à vérifier
Les règles ne sont pas dans le dépôt : je n'ai pas pu les vérifier. Il faut que :
1. un élève connecté puisse **lire** `config/temas` (comme `config/paiement`) ;
2. seule la professeure puisse **écrire** `config/temas` ;
3. si un élève peut lire `eleves/{uid}.temas.*.v2.fb`, c'est normal (il voit les corrections).

Exemple, si `config` n'a pas déjà une règle générique :
```
match /config/temas {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == "pTbdNp5EiJe2jq80bgCi4Q01i4O2";
}
```
Si `config/temas` n'est pas lisible, l'application utilise le statut écrit dans le code (`statut: "brouillon"` → invisible) et l'affiche en avertissement dans Admin › Suivi thème.

## Types d'exercices
`qcm` · `court` (accept) · `trous` (`___` + blancs) · `association` (paires) · `ordre` (unites) · `mixte` (accept + modele : auto si identique, sinon correction prof) · `choix_justif` · `ouverte` (min_mots, `avis: true` pour une question d'opinion) · `oral`.
`accents: "strict"` refuse une réponse juste à un accent près (conjugaison) ; sinon elle est acceptée avec un rappel.

## Archivage automatique (lecture seule)
- **Thème en cours** = le plus récent thème publié dont la date de début est passée (même règle que l'affichage). Il est le seul interactif.
- **Thèmes archivés** = tous les thèmes publiés précédents : consultables (contenu, vidéos, anciennes réponses, corrections, progression, certificat), mais plus aucune réponse ne peut être donnée, modifiée, recommencée ou soumise. Bandeau « 🗄️ Thème archivé — Consultation uniquement ».
- Bascule : à minuit UTC du jour `date_debut` du thème suivant (lundi 2 h à Paris, dimanche 21 h à Brasília). Un thème en brouillon ou à venir ne déclenche rien.
- Rien n'est supprimé : réponses, notes et corrections restent en place ; la professeure peut toujours corriger et noter un thème archivé.
- **Réouverture** : Admin › Suivi thème › fiche élève › « 🔓 Rouvrir exceptionnellement » (écrit `eleves/{uid}.temasRouverts.{temaId} = true`) ; « 🔒 Refermer » l'annule.

### Blocage côté serveur
L'application ne suffit pas : les règles de `docs/firestore-regles-themes.rules` refusent toute écriture d'élève sur un thème qui n'est ni en cours ni rouvert, toute modification de `temasRouverts` / `niveauTheme` par l'élève et toute modification des corrections de la professeure.
Pour cela, l'application de la professeure publie automatiquement `config/temasCalendrier` (période de chaque thème) à chaque connexion, publication et création de thème. Chaque sauvegarde d'élève déclare le thème concerné dans le champ `temaEcriture`.

**Important** : si tu ajoutes un thème directement dans le code, connecte-toi une fois avec ton compte professeure après la mise en ligne pour que le calendrier soit republié ; sinon les règles continueront de considérer l'ancien thème comme « en cours ».

### Mise en place des règles (Firebase Console › Firestore Database › Règles)
1. Colle les fonctions de `docs/firestore-regles-themes.rules` dans le bloc `match /databases/{database}/documents`.
2. Ajoute `&& ecritureThemesAutorisee() && champsThemesReservesIntacts()` à la condition `update` de l'élève dans `match /eleves/{uid}` (et `'temaEcriture'` à la liste des champs autorisés si tu en as une).
3. Ajoute les deux `match /config/...` indiqués.
4. Publie, puis connecte-toi en professeure (publication du calendrier).
5. Vérifie avec l'onglet « Terrain de jeu des règles » (Rules Playground) : une mise à jour de `eleves/<uid élève>` qui modifie `temas.<ancien thème>` doit être refusée.
