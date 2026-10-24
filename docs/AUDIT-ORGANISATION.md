# Audit et réorganisation de la plateforme (octobre 2026)

Cet audit porte sur le code tel qu'il était après la pull request n° 10 : toutes les pages (professeure et élève), leurs actions et les données qu'elles lisent. Les captures ont été faites sur une base de test reproduisant les cas réels (forfait avec anomalies, demande de report, cours à l'unité impayé, cours d'essai).

## 1. Constats

### Doublons fonctionnels

| # | Fonction | Où elle existait | Problème |
|---|---|---|---|
| D1 | Demandes de report des élèves | Cours › Planning (bloc en tête), Cours › Reports & anomalies, Cours › Confirmations & demandes | Trois endroits. Le « Refuser » du Planning effaçait la demande directement depuis le navigateur (`rescheduleRequest: null`) : ni historique, ni e-mail à l'élève, contrairement au service central. |
| D2 | Séances à surveiller (anomalies, Zoom, propositions) | Reports & anomalies, Confirmations & demandes (filtre « erreurs »), Planning (badges) | Deux listes de travail différentes pour le même besoin. Deux compteurs différents dans le menu (`aTraiter` et `demandes`). |
| D3 | Annonces | Communication › Annonces et bouton « Faire une annonce » du Planning | Même formulaire à deux endroits. |
| D4 | Liens de paiement (cours à l'unité) | Planning (bouton) et Finances | Même éditeur à deux endroits. |
| D5 | Paiement et nota fiscal d'un cours à l'unité | Planning (sur chaque créneau) et Finances (« Marquer comme payé » seulement) | L'envoi de la nota d'un cours à l'unité n'était possible que depuis le Planning. |
| D6 | Niveau, rythme, forfait, liens, « forfait payé », nota, bilan | Panneau « Gérer » de la liste des élèves **et** fiche élève (Profil, Forfait, Dossiers & bilans) | Deux formulaires différents pour les mêmes données ; le bilan rapide était limité au Dossier 0. |
| D7 | Explication des automatisations | Communication › Annonces (« Rappels automatiques »), Paramètres › Relances, Paramètres › Confirmation des cours | Trois textes ; aucun endroit ne réunissait toutes les automatisations. |
| D8 | Historique des cours d'un élève | Fiche › Cours et fiche › Réponses & confirmations | Deux sections pour le même élève et les mêmes séances. |
| D9 | Résumé élève (niveau, thème, forfait, dossiers) | Accueil **et** Mon profil (élève) | Mon profil répétait l'accueil et la liste des dossiers (déjà dans Mon parcours). |

### Rubriques mal placées

- **Réserver un forfait** était dans Cours › Planning, alors que c'est l'acte de vente et de renouvellement d'un forfait (Finances), suivi de la programmation des séances.
- **Contrôle des forfaits** était dans Paramètres, alors qu'il ne règle rien : il contrôle les soldes (Finances).
- **Ajouter des créneaux** occupait le haut du Planning (5 400 px de haut sur ordinateur) : le calendrier et les cours à venir n'apparaissaient qu'après deux longs formulaires.

### Problèmes techniques

- **Requêtes répétées** : chaque onglet relisait toute la collection `disponibilites` avec son propre chargement (`loadAdminDispo`, `loadTeacherHistorique`, `profLoadSlots`, `loadPackSlotsByStudent`, `suiviCentreLoad`).
- **Détection des anomalies** : elle n'était exécutée qu'à l'ouverture de l'onglet Reports & anomalies. Le tableau de bord pouvait donc sous-estimer les séances à régulariser.
- **Code empilé** : plusieurs modules remplaçaient à la volée des fonctions d'autres modules (`renderTeacherHistorique`, `renderPastSessions`, `renderAdminDispo`, `renderStudentsFlatList`). Cela rendait le comportement difficile à suivre.
- **Statut d'une séance** : il était calculé à trois endroits avec des libellés différents (`rptEtat`, `forfaitEtatSeance`, `suiviStatutCli`).
- **Interface** : 65 émojis dans le Planning, 88 dans Cours expérimental. Beaucoup de styles écrits directement dans le code, ce qui donnait un aspect différent d'une page à l'autre.

### Ce qui fonctionnait et n'a pas été réécrit

- Le décompte des forfaits (`20-forfaits.js`, une seule fonction `forfaitBilan`).
- Le service central des réponses et des reports (Apps Script).
- La synchronisation Zoom, les paiements, les notas fiscais et la messagerie.
- La pédagogie : thèmes, parcours, dossiers, exercices.
- Les règles Firestore.

## 2. Organisation cible

Une fonction n'a plus qu'**un emplacement de gestion**. Le tableau de bord et les fiches affichent des résumés, qui renvoient tous vers la même **fiche séance** ou la même **fiche élève**.

| Fonctionnalité | Emplacement actuel | Problème | Emplacement cible | Action |
|---|---|---|---|---|
| Demandes de report, anomalies, propositions, Zoom, confirmations | Planning + Reports & anomalies + Confirmations & demandes | D1, D2 | **Cours › À traiter** (liste de travail unique, par priorité) | Fusionner |
| Détail et actions d'une séance | Cartes différentes par onglet | Actions dispersées | **Fiche séance** (panneau unique ouvert depuis l'agenda, À traiter, l'historique, les notifications, le tableau de bord et la fiche élève) | Centraliser |
| Calendrier et cours à venir | Bas du Planning | Peu visible | **Cours › Agenda** | Déplacer en haut |
| Ajouter des créneaux | Haut du Planning | Page trop chargée | **Cours › Disponibilités** | Séparer |
| Séances passées, vocabulaire, enregistrement | Historique & récapitulatifs | Correct | **Cours › Historique** (cartes ouvrant la fiche séance) | Conserver, simplifier |
| Réserver un forfait | Planning | Mal placé | **Forfaits & paiements › Nouveau forfait** | Déplacer |
| Contrôle des forfaits | Paramètres | Mal placé | **Forfaits & paiements › Contrôle** | Déplacer |
| Nota fiscal d'un cours à l'unité | Planning | D5 | **Forfaits & paiements › Vue d'ensemble** | Déplacer |
| Liens de paiement | Planning + Finances | D4 | **Forfaits & paiements** | Supprimer du Planning |
| Annonces | Planning + Communication | D3 | **Communication › Annonces** | Supprimer du Planning |
| Notifications | Communication | Correct | **Communication › Notifications** (en premier) | Conserver |
| Panneau « Gérer » de la liste des élèves | Liste des élèves | D6 | **Fiche élève** | Supprimer le panneau ; liste compacte |
| Historique des cours et des réponses d'un élève | Deux sections de la fiche | D8 | **Fiche › Cours & confirmations** | Fusionner |
| Automatisations (rappel 24 h, H-1, relances, impayés, Zoom) | Trois textes | D7 | **Paramètres › Réglages › Annulations & automatisations** | Regrouper |
| Résumé élève dans Mon profil | Accueil + Mon profil | D9 | **Accueil** | Retirer de Mon profil |
| Compteurs du menu et du tableau de bord | Trois calculs | D2 | Un seul calcul (`pilotage`) | Centraliser |

### Navigation professeure

| Rubrique | Onglets |
|---|---|
| Tableau de bord | À faire maintenant · À prévoir · Vue d'ensemble (une seule page) |
| Élèves | Tous les élèves · Cours d'essai |
| Cours | Agenda · À traiter · Historique · Disponibilités |
| Pédagogie | Thèmes de la semaine · Aperçu élève · Dossiers & niveaux · Enregistrements · Ressources · Phrases de survie |
| Forfaits & paiements | Vue d'ensemble · Nouveau forfait · Contrôle des forfaits |
| Communication | Notifications · Messages · Annonces · Forum |
| Paramètres | Réglages · Règles affichées · Journal d'activité |

**Pourquoi « Disponibilités » est dans Cours et non dans Paramètres.** Ouvrir des créneaux est une action de chaque semaine, pas un réglage ponctuel. Les automatisations et les règles d'annulation, elles, sont dans Paramètres.

**Anciens liens.** `anomalies` et `confirmations` ouvrent désormais « À traiter » ; `controle` ouvre l'onglet du même nom dans Forfaits & paiements.

## 3. Données

Aucune donnée n'est déplacée, convertie ni supprimée. Aucune règle de décompte ou de facturation n'est modifiée : la réorganisation porte sur l'interface et sur le partage du code. Une sauvegarde reste possible à tout moment depuis Forfaits & paiements › Contrôle des forfaits (export JSON).
