# Architecture de la plateforme

## Organisation

Une seule page (`index.html`) affiche un écran à la fois. Tout part de **`js/15-navigation.js`** :

- **Rubriques** : `NAV_MODEL` déclare les rubriques de chaque rôle et leurs onglets.
- **Interface calculée** : la barre latérale, les onglets de page, la barre du haut et la barre inférieure (mobile) sont générés à partir de ce modèle.
- **Contrôle d'accès** : `navGuard` utilise aussi ce modèle. Un écran absent des rubriques d'un rôle renvoie vers l'accueil de ce rôle.

| Rôle | Rubriques |
| --- | --- |
| Professeure | Tableau de bord · Élèves · Cours · Pédagogie · Finances · Communication · Paramètres |
| Élève inscrit | Accueil · Mon parcours · Mes cours · Mes exercices · Mes ressources · Messages · Mon profil |
| Élève sans niveau | Accueil · Mes cours · Messages · Mon profil |
| Cours expérimental | Mon cours · Historique · Messages · Mon profil |

Les règles Firestore (`firestore.rules`) restent la vraie barrière de sécurité : le menu ne fait que refléter les droits.

## Ajouter un écran ou un onglet

- **Écran** : `registerScreen('id', fonction)`, défini dans `js/08`.
- **Onglet de l'espace professeure** : `registerTeacherTab('id', fonction)`, défini dans `js/07`. La fonction remplit `#teacher-body`.
- **Code à exécuter après chaque affichage** : `onAfterRender(fonction)`.
- **Entrée de menu** : ajouter l'onglet dans `NAV_MODEL`.

Plus aucun fichier ne redéfinit `render()` ou `renderSidebar()`.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `css/design-system.css` | Jetons (couleurs, typographie, espacements), palettes « sauge » et « bleu-rose », thème sombre, composants de base |
| `css/app.css` | Styles des écrans |
| `js/00` à `js/13` | Écrans existants : connexion, dossiers, thèmes, réservations, messagerie, espace professeure, reports |
| `js/14-interface.js` | Notifications, filtres des élèves, accessibilité |
| `js/15-navigation.js` | Rubriques, menus, contrôle d'accès, icônes |
| `js/16-pilotage-professeure.js` | Tableau de bord, Reports & anomalies, Finances, Annonces, fiche élève centralisée, journal d'activité |
| `js/17-parametres.js` | `config/plateforme` : tarifs, apparence (palettes, couleurs, saison, mode sombre), règles affichées, profil professeure, intégrations, journal |
| `js/18-espace-eleve.js` | Accueil élève, Mon profil (modifiable), Mes exercices, Ressources (élève et professeure) |
| `js/19-parcours-chemin.js` | Parcours en chemin, verrouillage configurable, ordre, attribution, archivage anticipé |

## Données ajoutées

Aucune donnée existante n'est déplacée ni convertie. Revenir à la version précédente du code reste possible : les nouveaux champs sont simplement ignorés.

| Où | Contenu | Qui écrit |
| --- | --- | --- |
| `config/plateforme` | tarifs, apparence, regles, profil | professeure |
| `config/temas.themes.{id}` | parcours (mode, seuil), ordre, attribution, couleur, archiveLe | professeure |
| `config/temasCalendrier.periodes.{id}.eleves` | élèves autorisés à répondre (thème attribué à une sélection) | application de la professeure |
| `eleves/{uid}` | prenom, nom, nomAffiche, telephone, whatsappCode, timezone, avatar, langue, objectifs, preferences, notifications, apparence, profilMaj | l'élève (champs contrôlés par les règles) |
| `ressources/{id}` | titre, url (https), type, description, niveaux, publie, ordre | professeure |
| `suiviEleves/{uid}` | objectifs, difficultés, notes privées | professeure (jamais lisible par l'élève) |
| `journal/{id}` | type, message, details, par, parNom, ts | tout compte connecté, en ajout seul ; lecture professeure ; ni modification ni suppression |
| `annonces/{id}` | suppression autorisée à la professeure | professeure |

## Mise en ligne

1. Fusionner la pull request.
2. **Publier `firestore.rules`** dans la console Firebase (Firestore › Règles). Sans cette étape, les fonctions suivantes affichent un message d'erreur clair, mais le reste de la plateforme continue de fonctionner :
   - profil élève ;
   - ressources ;
   - journal ;
   - suivi privé ;
   - suppression d'annonces.
3. Se connecter une fois en professeure. Le calendrier des thèmes est republié automatiquement, avec les attributions.

L'Apps Script n'est pas modifié.
