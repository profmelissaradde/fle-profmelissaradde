# Programme pédagogique FLE 2026-2027

Rubrique professeure **« Programme pédagogique FLE »** : calendrier du 16 novembre 2026 au 2 janvier 2028 (59 semaines), fiches et séances par niveau (A1 → C2), bibliothèque filtrable, PowerPoint privés, suivi et import.

Audit préalable : `docs/PROGRAMME-FLE-AUDIT.md`.

## 1. Ce qui est dans le dépôt… et ce qui n'y est pas

| Dans le dépôt public (GitHub Pages) | Jamais dans le dépôt |
|---|---|
| `js/24-programme-fle.js` : l'interface, **sans aucun contenu** | Calendrier détaillé, fiches, corrigés, banques orales |
| Règles Firestore, actions Apps Script | PowerPoint (.pptx) |
| Cette documentation | Sources et générateurs des contenus |

Les contenus arrivent dans un **paquet privé** (fichier .zip remis à Melissa), importé depuis l'onglet *Import*. Ils sont écrits dans :

| Où | Contenu | Accès |
|---|---|---|
| Firestore `programmeSemaines` | les 59 semaines du calendrier | professeure seule |
| Firestore `programmeFiches` | une fiche par semaine et par niveau (JSON, corrigés compris) | professeure seule |
| Firestore `programmePptx` | index des PowerPoint (métadonnées, identifiant Drive) | professeure seule |
| Firestore `programmeSuivi` | statut, attributions, séances terminées, difficultés, adaptations | professeure seule |
| Firestore `programmeEleve` | exercices interactifs d'une semaine (sans notes ni modèles) | élèves : **seulement après publication** |
| Google Drive, dossier `PROGRAMME_FOLDER_ID` | les .pptx, rangés `année/Semaine_XX/Thème/Niveau/` | ton compte Google seulement |

## 2. Mise en ligne (dans cet ordre)

1. **Drive** : crée un dossier (par exemple « Programme FLE — privé »). Ne le partage avec personne. Ouvre-le et copie son identifiant (la fin de l'adresse, après `folders/`).
2. **Apps Script** : Paramètres du projet › Propriétés du script › ajoute `PROGRAMME_FOLDER_ID` = l'identifiant du dossier. Remplace le contenu de `Code.gs` par `apps-script/Code.gs`, enregistre, puis Déployer › Gérer les déploiements › ✏️ › **Nouvelle version** (l'URL ne change pas). Aucune nouvelle autorisation n'est demandée : le scope Drive existait déjà.
3. **Règles Firestore** : Firebase Console › Firestore › Règles › colle `firestore.rules` › **Publier**.
4. **Fusionne la pull request**. GitHub Pages se met à jour en une à deux minutes.
5. Connecte-toi en professeure › **Programme pédagogique FLE › Import**. Choisis le dossier du paquet décompressé, puis clique sur *Importer*. Le calendrier, les fiches et les parcours élèves sont enregistrés, puis les 96 PowerPoint sont envoyés dans ton Drive privé (compte une à deux minutes).
6. **Mes PowerPoint pédagogiques › Vérifier les accès** : le résultat doit être « tout est privé ».
7. Quand la semaine pilote te convient : **Fiches & séances › Publier le parcours élève**. Les élèves voient alors les exercices dans *Mon parcours › Thème de la semaine*, à partir du lundi 16 novembre (minuit UTC).

Si tu fais l'étape 4 avant les étapes 2 et 3, la rubrique affiche un message clair (« Le programme ne peut pas être lu ») ; le reste de la plateforme n'est pas touché.

## 3. Sécurité : ce qui protège réellement les fichiers

- **PowerPoint** : ils sont dans un dossier Drive non partagé. Chaque téléchargement passe par l'Apps Script. Celui-ci vérifie le jeton Firebase **côté serveur** (`verifyFirebaseIdToken_`), exige l'UID de la professeure (`requireTeacher_`) et refuse tout fichier situé hors du dossier du programme. Aucune URL publique n'est jamais transmise. Le lien « Ouvrir dans Drive » ne s'ouvre que connecté à ton compte Google.
- **Fiches et corrigés** : collections Firestore réservées à `isTeacher()`. Un élève qui interroge directement Firestore (console du navigateur) reçoit « permission denied ».
- **Exercices élèves** : `programmeEleve` n'est lisible que si `publie == true`. Les modèles de production et les notes ne sont jamais copiés dans le parcours élève. Limite inhérente à la correction instantanée : une fois un exercice publié, sa clé de correction automatique (QCM, textes à trous) est transmise au navigateur de l'élève, comme pour les thèmes existants.
- **Le menu n'est pas une barrière** : un élève qui force l'onglet est renvoyé à l'accueil (`navGuard`). Même s'il y parvenait, les règles et l'Apps Script refuseraient les données.

### Vérifications à faire une fois en ligne (5 minutes)

Firebase Console › Firestore › Règles › **Terrain de jeu des règles** :

| Simulation | Résultat attendu |
|---|---|
| `get` sur `programmeFiches/2026-S47_A1`, authentifié avec l'UID d'un élève | **Refusé** |
| `get` sur `programmePptx/2026-S47_A1_S1_prof`, UID élève | **Refusé** |
| `get` sur `programmeEleve/programme-2026-s47` non publié, UID élève | **Refusé** |
| même document après publication, UID élève (e-mail vérifié) | Autorisé |
| `get` sur `programmeFiches/2026-S47_A1`, UID `pTbdNp5EiJe2jq80bgCi4Q01i4O2` | Autorisé |

Puis, connecté avec un compte élève de test : *Mon parcours* affiche les exercices publiés. Aucun menu « Programme » ni « PowerPoint » n'apparaît.

## 4. Utilisation

- **Calendrier** : vues année, mois et semaine. Chaque semaine affiche ses dates, son thème, l'accroche, le scénario, la mission, la culture, les variantes par âge, les objectifs (communication, grammaire, phonétique, vocabulaire) par niveau, les ressources disponibles et la progression. Pastilles par niveau : à produire, fiche créée, fiche validée.
- **Fiches & séances** : choisis la semaine, le niveau, le nombre de séances par semaine (1 à 4) et le temps d'oral (15, 20 ou 30 min). Tu obtiens le déroulé minuté de chaque séance, les exercices avec corrigés, la banque orale (objectif, réponse possible, difficultés, relances, alternatives plus simple / plus exigeante), les jeux de rôle, l'activité de secours, les PowerPoint de la séance, puis le suivi des élèves du niveau. Le suivi permet d'attribuer, de cocher les séances terminées, de noter les difficultés observées et l'adaptation choisie. Actions disponibles : valider la fiche, publier ou retirer le parcours élève, imprimer, modifier la fiche (JSON).
- **Bibliothèque** : filtres par niveau, âge, thématique, compétence, point grammatical, difficulté, nombre de séances, durée de conversation et type de support. Le bouton « Copier l'activité » permet de la réutiliser ailleurs.
- **Mes PowerPoint pédagogiques** : recherche, aperçu du plan, téléchargement, ouverture dans Drive (aperçu et modification), remplacement par une version modifiée, suppression, contrôle des accès.
- **Suivi** : tableau de bord semaines × niveaux. Pour chaque case : créé, validé, attribué, séances réellement terminées.

### Les quatre parcours

| Séances / semaine | PowerPoint utilisés |
|---|---|
| 1 | `U` — séance unique, synthèse autonome de toute l'histoire (exercices propres, non copiés des autres séances) |
| 2 | `P2-S1` (découverte, vocabulaire, compréhension, grammaire) · `P2-S2` (approfondissement, oral, application) |
| 3 | `S1` · `S2` · `P3-S3` (communication, situations pratiques, réinvestissement) |
| 4 | `S1` (situation) · `S2` (complication, grammaire) · `S3` (interaction) · `S4` (production, évaluation) |

Chaque PowerPoint existe en version **prof** (conducteur des trois formats, notes, diapositive de corrigé après chaque exercice) et **projection** (sans conducteur, sans notes, sans corrigés).

## 5. État d'avancement (15 novembre 2026)

| Élément | État |
|---|---|
| Audit de la plateforme | Fait |
| Calendrier des 59 semaines : thème, accroche, scénario, mission, culture, variantes d'âge, objectifs communicatifs, grammaticaux et phonétiques, vocabulaire, pour les 6 niveaux | **Fait** (dans le paquet privé) |
| Semaine pilote 2026-S47, 6 niveaux : fiches, 109 exercices (170 items) avec corrigés, banques orales (156 activités, 5 étapes par séance), 18 jeux de rôle, évaluations formatives | **Fait** |
| 96 PowerPoint de la semaine pilote (6 niveaux × 8 séances × 2 versions) | **Fait** |
| Parcours élève interactif de la semaine pilote (A1 → C2) | **Fait** (non publié) |
| Intégration plateforme, Apps Script, règles | **Fait** (pull request) ; mise en ligne : étapes du §2 |
| Fiches, exercices et PowerPoint des semaines 2 à 59 | **À produire**, par lots, à partir du modèle validé de la semaine pilote |
| Compréhension orale avec vidéo dans le parcours élève | Non incluse (aucune vidéo n'a pu être vérifiée) : le contrôle qualité du thème le signale |

Le paquet privé contient les sources et les générateurs (`sources/`), pour reprendre la production sans tout recommencer.
