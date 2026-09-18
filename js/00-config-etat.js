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
const firebaseConfig = {
  apiKey: "AIzaSyAVT-VM8QyTfOg16P_9juX3dbJsR3e3z3c",
  authDomain: "fle-profmelissaradde.firebaseapp.com",
  projectId: "fle-profmelissaradde",
  storageBucket: "fle-profmelissaradde.firebasestorage.app",
  messagingSenderId: "670442169351",
  appId: "1:670442169351:web:535dca29a998c80dc636a2"
};
const TEACHER_UID = "pTbdNp5EiJe2jq80bgCi4Q01i4O2";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjVN3__9qJC3gsAkTUBE5oy2z9J0iu08gL1DadZceMaxONg-srJgDkccKDXobiSZleYA/exec";
const ZOOM_LINK = "https://us06web.zoom.us/j/87396376216?pwd=b2G6XPCv9KCbzACXniXDKaALu1Aa2J.1";
const TEACHER_EMAIL = "prof.melissaradde@gmail.com";
const ZOOM_MEETING_NAME = "Cours de français — Prof Melissa Radde";
const ZOOM_OPEN_MINUTES_BEFORE = 15;
const ZOOM_UNIQUE_LINKS = true;
const FORFAIT_MIN = 5;
const FORFAIT_MAX = 16;

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.languageCode = "pt";
const db = MAINTENANCE_MODE ? null : firebase.firestore();

/* ======================= ÉTAT GLOBAL ======================= */
let niveau = null;
let screen = "login";
let authMode = "signup";
let student = {prenom:"", nom:"", email:"", telephone:"", uid:"", uniteCourante:null, frequence:null, temas:{}};
let current = 1;
let teacherTab = "eleves";
let isTeacher = false;
const BILAN_COLOR = "#d98c00";

/* ======================= CORRECTIF AUTH COURS EXPÉRIMENTAL ======================= */
window.addEventListener('load', () => {
  if(typeof doSignin === 'function'){
    window.doSignin = async function(){
      const emailEl = document.getElementById('si-email');
      const pwEl = document.getElementById('si-pw');
      const email = emailEl ? emailEl.value.trim() : '';
      const pw = pwEl ? pwEl.value : '';
      if(!email || !pw){ showAuthErr('Merci de renseigner ton e-mail et ton mot de passe.'); return; }
      const btn = document.getElementById('si-btn');
      if(btn){ btn.disabled = true; btn.textContent = 'Connexion…'; }
      try{
        const cred = await auth.signInWithEmailAndPassword(email, pw);
        if(cred.user.uid === TEACHER_UID){
          isTeacher = true;
          /* Le compte admin garde toujours son niveau "vue élève" (par défaut A1,
             modifiable dans la barre latérale via les pastilles de niveau) — pas besoin
             de forfait ni d'attribution de niveau côté Firestore pour accéder au Thème
             de la semaine, aux dossiers, etc. Voir setAdminNiveau() dans 01-utilitaires-nav.js. */
          niveau = niveau || 'A1'; current = null;
          student = {prenom:'Melissa', nom:'Radde', email:cred.user.email || email, telephone:'', uid:cred.user.uid, uniteCourante:{}, frequence:null, temas:{}};
          teacherTab = 'eleves'; screen = 'teacher';
          startTeacherPresenceHeartbeat(); startTeacherMessagesListener(); render(); return;
        }
        if(!cred.user.emailVerified){
          student = {prenom:'', nom:'', email:cred.user.email || email, telephone:'', uid:cred.user.uid};
          screen = 'verify'; render(); return;
        }
        const doc = await db.collection('eleves').doc(cred.user.uid).get();
        if(!doc.exists){ showAuthErr("Ce compte n'a pas de profil élève associé."); return; }
        const profileData = doc.data();
        if(profileData.status === 'archived'){
          await auth.signOut(); showAuthErr("Ce compte a été archivé. Contacte la professeure si tu souhaites reprendre les cours."); return;
        }
        afterAuth(cred.user.uid, profileData);
      }catch(e){ showAuthErr(friendlyAuthError(e.code)); }
      finally{ if(btn){ btn.disabled = false; btn.textContent = 'Se connecter →'; } }
    };
  }

  if(typeof afterAuth === 'function'){
    window.afterAuth = function(uid, record){
      /* uniteCourante : ancien format = une chaîne pour le Dossier 0, nouveau format =
         { [numéroDossier]: tag }. On normalise toujours en objet (voir aussi la même
         normalisation dans 01-utilitaires-nav.js pour l'autre copie de afterAuth). */
      let uc = record.uniteCourante;
      if(typeof uc === 'string'){ uc = {0: uc}; } else if(!uc || typeof uc !== 'object'){ uc = {}; }
      student = {
        prenom:record.prenom, nom:record.nom, email:record.email, telephone:record.telephone, uid,
        uniteCourante: uc, frequence:record.frequence || null,
        bilans:record.bilans || {}, completed:record.completed || {}, temas:record.temas || {},
        pack:record.pack || {}, evaluations:record.evaluations || [],
        experimentalLesson:record.experimentalLesson === true,
        registrationSource:record.registrationSource || null, status:record.status || null
      };
      startStudentMessagesListener();
      const isExperimental = record.experimentalLesson === true || record.registrationSource === 'cours-experimental' || record.status === 'experimental';
      if(isExperimental){ niveau = record.niveau || null; screen = 'dossiers'; }
      else if(record.niveau){ niveau = record.niveau; screen = 'dossiers'; }
      else{ niveau = null; screen = 'waiting'; }
      render();
    };
  }
});

/* Module complémentaire chargé après tous les scripts historiques afin qu'il puisse
   étendre la navigation et les écrans sans casser leur ordre de chargement. */
window.addEventListener('load', () => {
  if(document.querySelector('script[data-fle-profiles]')) return;
  const script = document.createElement('script');
  script.src = 'js/10-profils-regles-evaluations.js';
  script.dataset.fleProfiles = '1';
  document.body.appendChild(script);
});
