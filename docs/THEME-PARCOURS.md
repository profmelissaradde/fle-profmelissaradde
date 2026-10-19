# Thème de la semaine — format « parcours » (v2)

## Fichiers
- `js/11-theme-parcours.js` — moteur : rendu élève, exercices, correction automatique, sauvegarde/reprise, bilan, espace enseignante (aperçu, correction, publication, vidéo, éditeur, création de thème).
- `js/12-theme-entretien-embauche.js` — thème « Vous voulez ce poste ? » (A0, A1, A2, B1, B2).
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
