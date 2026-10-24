# Apps Script — reports de séances & synchronisation Zoom

`Code.gs` est ton script complet (version de référence dans le 1er commit de cette branche, modifications dans le commit suivant). `appsscript.json` est inchangé : **aucune nouvelle autorisation** n'est nécessaire.

## Ce qui change
| Avant | Maintenant |
|---|---|
| L'élève écrivait lui-même la nouvelle date dans Firestore, puis demandait la synchro Zoom | Tout passe par le serveur (`respondReschedule`, `applyTeacherReschedule`) : vérification, conflits, date, Zoom |
| Échec de mise à jour Zoom → nouvelle réunion créée, ancienne laissée active (doublon) | Même réunion déplacée (même lien) ; sinon remplacement : nouvelle réunion **puis** suppression de l'ancienne |
| Panne Zoom / Apps Script → état incohérent, rien n'était retenté | Statut `zoomSync` (pending / retry / ok / error), nouvel essai automatique, alerte e-mail après 8 échecs |
| E-mail de proposition : « connecte-toi sur la plateforme » | Boutons **Accepter / Refuser** sécurisés (jeton propre à chaque proposition) |
| Pas de contrôle de conflit, d'expiration, de double clic | Verrou (`LockService`), vérification des conflits, expiration 1 h avant, double clic → « déjà confirmé » |
| Refus non signalé | Melissa reçoit un e-mail ; la séance reste en anomalie ; nouvelle proposition possible |

Nouvelles actions `doPost` : `proposeReschedule`, `respondReschedule`, `applyTeacherReschedule`, `retryZoomSync`.
Nouvelles actions `doGet` (liens de l'e-mail) : `acceptproposal`, `refuseproposal` → `processProposalAction`.
`syncRescheduledCourse` (ancienne action) passe désormais par la synchro sans doublon.
`createZoomMeeting` refuse de créer une réunion pour une séance en anomalie.

Réunions récurrentes : ton script crée uniquement des réunions individuelles (`type: 2`). Par sécurité, si une séance était liée à une réunion récurrente ou partagée, seule l'occurrence concernée est déplacée (`zoomOccurrenceId`), sinon une réunion dédiée est créée — la série n'est jamais déplacée.

Heure d'été / d'hiver : Zoom reçoit l'heure locale de Paris avec `timezone: "Europe/Paris"` ; les e-mails affichent l'heure dans le fuseau de l'élève.

## Installation (dans cet ordre)
1. **Apps Script** : ouvre ton projet, remplace tout le contenu du fichier par `Code.gs`, enregistre.
2. **Déploiement** : Déployer › Gérer les déploiements › ✏️ › Version : *Nouvelle version* › Déployer (l'URL ne change pas).
3. **Déclencheur** : icône horloge › Ajouter un déclencheur › fonction `retryZoomSyncs` › Basé sur le temps › toutes les **10 minutes**.
4. **Application** : fusionne la pull request (l'application appelle les nouvelles actions).
5. **Règles Firestore** : Firebase Console › Firestore › Règles › colle `firestore.rules` (à la racine du dépôt) › Publier.
   Cette version contient aussi l'archivage des thèmes : connecte-toi d'abord une fois en professeure (étape 4) pour publier le calendrier des thèmes.

Si l'application est mise en ligne avant le nouveau script, une acceptation affichera « action inconnue » : rien n'est modifié, il suffit de faire les étapes 1-2.

## Mise à jour du 20/10/2026 — créneaux libres et relances des reports
- **Correctif** : les créneaux libres sont de nouveau envoyés aux élèves (`listAvailableSlots` utilise `IS_NULL`).
- **Nouvelle action** `remindProposal` : relance manuelle d'une proposition de report, depuis Cours › Reports & anomalies ou depuis la fiche Forfait.
  - Elle renvoie le même lien ; elle est refusée si une relance a déjà été faite il y a moins de 12 h.
  - Au maximum 6 relances par proposition.
- **Nouvelle fonction** `relancerPropositionsAuto` : relance automatique après N jours sans réponse.
  - Par défaut : après 2 jours, au plus 2 fois.
  - Réglable dans Paramètres › Réglages › Relances.
  - Une absence de réponse n'est jamais une acceptation.

À faire :
1. Coller `Code.gs`, puis **Nouvelle version** du déploiement existant (l'URL ne change pas).
2. Ajouter un déclencheur : fonction `relancerPropositionsAuto`, basé sur le temps, **tous les jours** (par exemple entre 9 h et 10 h).

## Mise à jour du 24/10/2026 — réponses aux e-mails de rappel synchronisées
Toutes les réponses (Confirmer / Annuler / Demander à déplacer), qu'elles viennent de l'e-mail, de l'espace élève, de Melissa ou d'une automatisation, passent par un **service central** (`coursAction_` / `coursAnnuler_`).
- **Même règle partout** : délais, 2 tolérances d'annulation tardive sur 30 jours glissants, forfait rendu ou décompté.
- **Fiabilité** : verrou, idempotence (double clic ou événement rejoué = une seule action), jeton lié à la date du cours, message « enregistré » uniquement après confirmation de Firestore.
- **Statut** de la réservation : `disponibilites/{id}.suivi`.
- **Historique** en ajout seul : collection `evenementsCours`. Un événement non écrit est mis en file et repris par `retryZoomSyncs`.
- **Notifications** pour Melissa : collection `notificationsProf` (lu / intervention requise).
- **Nouvelles actions** :
  - `lessonAction` (confirmer / demander un déplacement depuis la plateforme) ;
  - `resendReminder` (relance du rappel, au plus toutes les 6 h) ;
  - `refuseRescheduleRequest`.
- **Nouvelle fonction** `annulerCoursNonConfirmes` (annulation à H-1 des cours non confirmés).
  - **Désactivée par défaut** : sans activation, Melissa est seulement prévenue.
  - Elle s'active dans Paramètres › Réglages › Confirmation des cours.

À faire, dans cet ordre :
1. Coller `Code.gs`, puis **Nouvelle version** du déploiement existant (l'URL ne change pas).
2. Ajouter un déclencheur : fonction `annulerCoursNonConfirmes`, basé sur le temps, **toutes les 10 minutes**.
3. Firebase Console › Firestore › Règles : coller `firestore.rules` › **Publier** (nouvelles collections `evenementsCours` et `notificationsProf`).
4. Fusionner la pull request.

Si l'application est en ligne avant le nouveau script :
- la demande de déplacement depuis la plateforme repasse par l'ancien circuit ;
- le bouton « Confirmer mon cours » affiche un message d'indisponibilité.

Rien n'est perdu.
