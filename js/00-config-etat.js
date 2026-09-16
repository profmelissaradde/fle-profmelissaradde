/* ██████████████████████████████████████████████████████████████████████ */
/* ██  MODE MAINTENANCE — c'est ICI, tout en haut du fichier.            ██ */
/* ██  Passe "false" en "true" ci-dessous pour afficher un écran         ██ */
/* ██  "Maintenance en cours" à tout le monde. Repasse à "false" pour    ██ */
/* ██  rouvrir le site. Édite ce fichier sur GitHub (crayon ✏️ en haut   ██ */
/* ██  à droite de la page du fichier), change la valeur, commit.       ██ */
/* ██████████████████████████████████████████████████████████████████████ */
const MAINTENANCE_MODE = false;
const MAINTENANCE_MESSAGE_FR = "Le site est en maintenance. Il sera de retour très bientôt !";
const MAINTENANCE_MESSAGE_PT = "O site está em manutenção. Estará de volta muito em breve!";

/* ======================= CONFIGURATION FIREBASE ======================= */
/* 1. Remplace ces valeurs par celles de TON projet Firebase                */
/*    (Console Firebase > ⚙️ Paramètres du projet > Tes applications > Web) */
const firebaseConfig = {
  apiKey: "AIzaSyAVT-VM8QyTfOg16P_9juX3dbJsR3e3z3c",
  authDomain: "fle-profmelissaradde.firebaseapp.com",
  projectId: "fle-profmelissaradde",
  storageBucket: "fle-profmelissaradde.firebasestorage.app",
  messagingSenderId: "670442169351",
  appId: "1:670442169351:web:535dca29a998c80dc636a2"
};
/* 2. Remplace par l'UID Firebase Auth de TON compte professeure           */
/*    (Console Firebase > Authentication > Users > colonne "User UID")     */
const TEACHER_UID = "pTbdNp5EiJe2jq80bgCi4Q01i4O2";

/* 3. Remplace par l'URL de ton Google Apps Script déployé en "Web app"    */
/*    (voir GUIDE_INSTALLATION.md, section Google Drive)                    */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjVN3__9qJC3gsAkTUBE5oy2z9J0iu08gL1DadZceMaxONg-srJgDkccKDXobiSZleYA/exec";

/* 4. Remplace par ton lien Zoom personnel (salle fixe et réutilisable).   */
/*    Sert de secours si la création automatique de lien par réservation   */
/*    (voir plus bas, ZOOM_UNIQUE_LINKS) n'est pas configurée ou échoue.   */
const ZOOM_LINK = "https://zoom.us/j/REMPLACE_PAR_TON_LIEN";
/* Ton adresse e-mail — utilisée pour te notifier quand un ÉLÈVE annule son cours lui-même. */
const TEACHER_EMAIL = "prof.melissaradde@gmail.com";
const ZOOM_MEETING_NAME = "Cours de français — Prof Melissa Radde";
/* Le bouton Zoom ne devient cliquable que X minutes avant le début du cours,
   et reste actif jusqu'à la fin prévue — pour éviter un accès permanent à la salle. */
const ZOOM_OPEN_MINUTES_BEFORE = 15;
/* Si true, le site essaie de créer un lien Zoom UNIQUE pour chaque réservation
   (via ton Apps Script + l'API Zoom — voir GUIDE_NOTIFICATIONS.md). Si la
   création échoue ou que c'est resté à false, ZOOM_LINK ci-dessus est utilisé. */
const ZOOM_UNIQUE_LINKS = true;

/* Bornes autorisées pour un forfait de cours (nombre de séances). */
const FORFAIT_MIN = 5;
const FORFAIT_MAX = 16;



firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.languageCode = "pt"; // e-mails de confirmation/réinitialisation envoyés en portugais
const db = MAINTENANCE_MODE ? null : firebase.firestore();

/* ======================= ÉTAT GLOBAL ======================= */
let niveau = null;        // A1 | A2 | B1 | B2 | C1 | C2 — attribué par la professeure
let screen = "login";     // login | waiting | dossiers | week | bilan | teacher
let authMode = "signup";  // signup | signin (onglet de l'écran de connexion)
let student = {prenom:"", nom:"", email:"", telephone:"", uid:"", uniteCourante:null, frequence:null, temas:{}};
let current = 1;          // semaine active 1..5

let teacherTab = "eleves"; // eleves | rec

let isTeacher = false;
const BILAN_COLOR = "#d98c00";

