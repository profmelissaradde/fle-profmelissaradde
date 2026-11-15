# Programme pédagogique FLE 2026-2027 — Phase 1 : audit de la plateforme

Audit réalisé le 15/11/2026 sur `main` (commit `f9f41ed`, après la PR n° 12). Rien n'a été modifié avant la fin de cet audit.

## 1. Ce qui existe

| Élément | Constat | Conséquence pour le programme |
|---|---|---|
| Hébergement | Application d'une seule page, servie par **GitHub Pages depuis un dépôt public**. Pas de compilation. | Tout fichier placé dans le dépôt est lisible par n'importe qui, même sans compte. **Aucun PowerPoint, corrigé, fiche professeure ni donnée d'élève ne doit y entrer.** |
| Authentification | Firebase Auth. La professeure est identifiée par son UID (`isTeacher()` dans les règles, `TEACHER_UID` dans l'Apps Script). | On réutilise exactement le même critère côté serveur. |
| Données | Firestore, protégé par `firestore.rules` (vraie barrière). Les collections `suiviEleves` et `journal` montrent déjà le modèle « professeure seule ». | Les fiches, le calendrier détaillé et l'index des PowerPoint vont dans des collections **lisibles par la professeure seule**. |
| Serveur | Apps Script (`apps-script/Code.gs`) déployé en « exécuter en tant que moi ». Il **vérifie le jeton Firebase côté serveur** (`verifyFirebaseIdToken_` → `accounts:lookup`) et sait refuser une action à un élève (`requireTeacher_`). Scope Drive déjà autorisé. | Le stockage privé des `.pptx` se fait dans **ton Google Drive**, via de nouvelles actions Apps Script réservées à la professeure. Aucune nouvelle autorisation Google n'est nécessaire. |
| Upload existant | `handleUpload` (enregistrements audio) rend le fichier **public par lien** (`ANYONE_WITH_LINK`). | Cette fonction ne doit **jamais** servir aux PowerPoint. Les nouvelles actions créent les fichiers en privé et vérifient leur partage. |
| Moteur de thèmes v2 | `js/11-theme-parcours.js` : QCM, trous, associations, remise en ordre, réponses courtes, mixtes, ouvertes, oral ; correction automatique ; correction manuelle ; archivage ; règles serveur sur les réponses. Niveaux **A0-B2 seulement** (C1/C2 → B2). | On le réutilise pour les exercices interactifs élèves (pas de deuxième moteur). Ajout de C1 et C2. |
| Contenus des thèmes | Écrits dans les fichiers `js/03`, `js/12`, `js/23` du dépôt public, **réponses comprises** (72 et 61 clés de correction). | Limite existante : un élève curieux peut lire les réponses dans le code. Pour le nouveau programme, les parcours élèves sont stockés dans Firestore et lisibles **seulement après publication**. Les clés de correction automatique restent forcément transmises au navigateur de l'élève une fois l'exercice publié (c'est le principe de la correction instantanée) ; les corrigés détaillés, notes et PowerPoint, eux, ne le sont jamais. |
| Navigation | `NAV_MODEL` (`js/15`) + `registerTeacherTab` (`js/07`) + contrôle d'accès `navGuard`. | Nouvelle rubrique ajoutée proprement, sans redéfinir `render()`. |
| Ressources élèves | Collection `ressources` (liens https, `publie`, `niveaux`). | Réutilisable pour les « contenus complémentaires » publiés. |
| Identité visuelle | Palette « bleu-rose » active (`#1F3A5F`, `#E9C6CF`, `#9A4F63`, ivoire `#F8F7F4`), police Inter, icônes au trait. | Reprise dans les PowerPoint et la nouvelle rubrique. |

## 2. Risques de régression identifiés

1. **Ordre des thèmes** : le thème « en cours » est le dernier de `temasSemanas` dont la date est passée. Les parcours importés doivent être ajoutés dans l'ordre chronologique et après les thèmes existants (le premier commence le 16/11/2026, après « Un petit conseil ! » du 26/10).
2. **Calendrier d'archivage** (`config/temasCalendrier`) : il est republié à la connexion de la professeure à partir de `temasSemanas`. Les parcours importés doivent donc être chargés **avant** cette publication — sinon les règles refuseraient les réponses des élèves.
3. **Niveaux C1/C2** : aujourd'hui convertis en B2. Ajouter C1/C2 ne doit pas changer le parcours des anciens thèmes (qui n'ont pas de contenu C1/C2 : la conversion vers B2 reste le repli).
4. **Règles Firestore** : toute nouvelle collection doit être ajoutée aux règles publiées dans la console Firebase, sinon la rubrique affiche une erreur (le reste de la plateforme continue de fonctionner).
5. **Apps Script** : les nouvelles actions exigent une **nouvelle version du déploiement** (même URL) et une propriété `PROGRAMME_FOLDER_ID` (dossier Drive privé).

## 3. Architecture retenue

```
Dépôt public (GitHub Pages)          Firestore (règles)                      Google Drive (privé, via Apps Script)
──────────────────────────           ───────────────────────────────         ─────────────────────────────────────
js/24-programme-fle.js  ──lit──▶     programmeSemaines/{semaine}   prof seule   /Programme FLE/2026/Semaine_47/<Thème>/A1/…pptx
(interface, aucune donnée)           programmeFiches/{semaine_niv} prof seule      ↑ fichiers jamais partagés
                                     programmePptx/{id}            prof seule      ↑ téléchargement = action Apps Script
                                     programmeSuivi/{semaine_niv}  prof seule        vérifiant l'UID de la professeure
                                     programmeEleve/{themeId}      élève : seulement si publie == true
```

* **Contenus professeure** (calendrier détaillé, fiches, corrigés, notes, banque orale) : livrés dans un **paquet privé** hors du dépôt, importé depuis la rubrique, écrits dans des collections professeure seule.
* **PowerPoint** : importés depuis le même paquet, envoyés à l'Apps Script, rangés dans `PROGRAMME_FOLDER_ID/<année>/Semaine_XX/<Thème>/<Niveau>/`, partage vérifié **privé**. Le navigateur ne reçoit jamais d'URL publique : le téléchargement passe par l'Apps Script, qui revérifie l'UID à chaque appel. Le lien « Ouvrir dans Drive » ne fonctionne que connecté à ton compte Google (droits Drive).
* **Exercices élèves** : un parcours v2 par semaine (`programmeEleve/{id}`), sans aucune note professeure ; lisible par les élèves seulement quand tu le publies.

## 4. Points d'attention hors périmètre (non modifiés)

* Les thèmes existants exposent leurs clés de correction dans le code public (voir §1). Les migrer vers Firestore est possible plus tard avec le même mécanisme que `programmeEleve`.
* Les enregistrements audio sont stockés « public par lien ». C'est un choix antérieur, signalé ici pour mémoire.
