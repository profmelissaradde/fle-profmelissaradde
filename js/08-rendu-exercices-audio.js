/* ======================= RENDU PRINCIPAL (routeur unique) =======================
   Chaque écran est déclaré UNE fois dans SCREENS (ou ajouté par un module avec
   registerScreen). Le contrôle d'accès (rôle, statut expérimental, niveau) est fait par
   navGuard (15-navigation.js) avant tout affichage ; les modules qui ont besoin d'agir
   après un rendu s'inscrivent avec onAfterRender — plus aucune redéfinition de render(). */
const SCREENS = {
  login: ()=>renderLogin(), verify: ()=>renderVerify(), waiting: ()=>renderWaiting(),
  dossiers: ()=>renderDossiers(), survie: ()=>renderSurvie(), temas: ()=>renderTemas(),
  reserver: ()=>renderReserver(), forum: ()=>renderForum(), messages: ()=>renderMessages(),
  historique: ()=>renderHistorique(), week: ()=>renderWeek(weeks.find(w=>w.id===current)),
  bilan: ()=>renderBilan(), teacher: ()=>renderTeacher()
};
function registerScreen(id, fn){ SCREENS[id] = fn; }
const AFTER_RENDER = [];
function onAfterRender(fn){ AFTER_RENDER.push(fn); }

function render(){
  const currentUser = auth.currentUser;
  /* Sécurité : tant que l'e-mail d'un compte élève n'est pas vérifié, on ne
     montre que l'écran de vérification — jamais le menu, les réservations,
     le forum ou l'historique. */
  if(currentUser && currentUser.uid !== TEACHER_UID && !currentUser.emailVerified
     && !(typeof isStudentExperimental === 'function' && isStudentExperimental())
     && !(student && (student.experimentalLesson || student.registrationSource === 'cours-experimental'))){
    screen = 'verify';
  }
  if(screen === 'verify'){
    const sidebar = document.getElementById('sidebar');
    if(sidebar){ sidebar.innerHTML = ''; sidebar.style.display = 'none'; }
    renderVerify();
    AFTER_RENDER.forEach(fn=>{ try{ fn(); }catch(e){ console.error(e); } });
    window.scrollTo(0,0);
    return;
  }
  const sidebar = document.getElementById('sidebar');
  if(sidebar){ sidebar.style.display = ''; }
  if(typeof navGuard === 'function') navGuard();

  renderSidebar();
  const contentEl = document.getElementById('content');
  contentEl.style.setProperty('--accent', 'var(--c-primary)');
  const fn = SCREENS[screen] || SCREENS.login;
  fn();
  AFTER_RENDER.forEach(fn=>{ try{ fn(); }catch(e){ console.error(e); } });
  window.scrollTo(0,0);
}

/* ======================= EXERCICES ======================= */
function answerQCM(uid, chosen, correct){
  const container = document.getElementById('opts-'+uid);
  const buttons = container.querySelectorAll('.exo-opt');
  buttons.forEach((b,i)=>{
    b.disabled = true;
    if(i===correct) b.classList.add('correct');
    if(i===chosen && chosen!==correct) b.classList.add('wrong');
  });
  const fb = document.getElementById('fb-'+uid);
  if(chosen===correct){ fb.textContent = '✔ Correct ! / Correto!'; fb.className = 'exo-feedback ok'; }
  else{ fb.textContent = '✘ La bonne réponse est en vert. / A resposta certa está em verde.'; fb.className = 'exo-feedback bad'; }
  exoDone[uid] = true;
  maybeCelebrate(uid);
}
function checkTexte(uid, accepted){
  const input = document.getElementById('in-'+uid);
  const fb = document.getElementById('fb-'+uid);
  const val = norm(input.value);
  const ok = accepted.some(a=>norm(a)===val);
  if(ok){ fb.textContent = '✔ Correct ! / Correto!'; fb.className = 'exo-feedback ok'; }
  else{ fb.textContent = `✘ Réponse attendue : « ${accepted[0]} ».`; fb.className = 'exo-feedback bad'; }
  exoDone[uid] = true;
  maybeCelebrate(uid);
}

/* ======================= SUIVI DE COMPLÉTION + FÉLICITATIONS ======================= */
const exoDone = {};
const recDone = {};
const celebrated = {};
function activityKey(weekTag, dayNum){ return `D${CURRENT_DOSSIER_NUM}_${weekTag}_${slug(dayNum)}`; }
/* Un exercice gradué (CO/CE) a un uid du type "D1_w1d1_co2" — on retrouve le uid
   du JOUR ("D1_w1d1") en enlevant le suffixe "_co2"/"_ce1"/etc. Un exercice à
   l'ancien format (day.exo) a déjà un uid de jour tel quel, donc le regex ne
   matche rien à enlever et on renvoie le uid inchangé. */
function dayUidFromAny(uid){
  const m = uid.match(/^(D\d+_w\d+d\d+)/);
  return m ? m[1] : uid;
}
/* Liste des suffixes d'exercices requis pour considérer un jour "complet" :
   un par exercice gradué dans co.exos/ce.exos (nouveau format), ou "exo" pour
   l'ancien format à exercice unique. */
function requiredExoSuffixes(day){
  const list = [];
  if(day.co && Array.isArray(day.co.exos)) day.co.exos.forEach((_,i)=>list.push(`co${i+1}`));
  if(day.ce && Array.isArray(day.ce.exos)) day.ce.exos.forEach((_,i)=>list.push(`ce${i+1}`));
  if(day.exo) list.push('exo');
  return list;
}
function maybeCelebrate(uid){
  const dayUid = dayUidFromAny(uid);
  const ctx = findDayByUid(dayUid);
  if(!ctx) return;
  const suffixes = requiredExoSuffixes(ctx.day);
  const needsExo = suffixes.length > 0;
  const exoOk = !needsExo || suffixes.every(s => s==='exo' ? exoDone[dayUid] : exoDone[`${dayUid}_${s}`]);
  if(exoOk && recDone[dayUid] && !celebrated[dayUid]){
    celebrated[dayUid] = true;
    showCelebration(ctx.day);
    saveActivityCompletion(ctx.week.tag, ctx.day.num);
  }
}
function showCelebration(day){
  const box = document.createElement('div');
  box.className = 'celebrate-toast';
  box.innerHTML = `<span style="font-size:22px;">🎉</span><div><b>Bravo !</b><br>« ${day.title_fr} » terminé. / Concluído!</div>`;
  document.body.appendChild(box);
  setTimeout(()=>{ box.classList.add('out'); setTimeout(()=> box.remove(), 400); }, 3200);
}
async function saveActivityCompletion(weekTag, dayNum){
  if(!student.uid) return;
  const key = activityKey(weekTag, dayNum);
  student.completed = student.completed || {};
  student.completed[key] = new Date().toISOString();
  try{
    await db.collection('eleves').doc(student.uid).update({
      [`completed.${key}`]: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){ /* non bloquant */ }
}

/* ======================= ENREGISTREMENT AUDIO ======================= */
const recorders = {};

function findDayByUid(uid){
  /* uid format : "D<dossier>_w<unité>d<étape>", ex. "D1_w3d2" — le préfixe de
     dossier évite toute collision entre deux dossiers ayant la même unité/étape. */
  const m = uid.match(/^D(\d+)_w(\d+)d(\d+)$/);
  if(!m) return null;
  const dossierNum = parseInt(m[1]);
  const src = dossiersContent[dossierNum] || weeks;
  const w = src.find(x=>x.id===parseInt(m[2]));
  if(!w) return null;
  const day = w.days[parseInt(m[3])-1];
  return {week:w, day};
}

async function toggleRec(uid){
  const btn = document.getElementById('btn-'+uid);
  const status = document.getElementById('status-'+uid);
  if(!recorders[uid] || !recorders[uid].active){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = e=>chunks.push(e.data);
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, {type: mr.mimeType || 'audio/webm'});
        const url = URL.createObjectURL(blob);
        const player = document.getElementById('player-'+uid);
        player.innerHTML = `<audio class="rec-audio" controls src="${url}"></audio><br>
          <a class="rec-dl" href="${url}" download="${uid}-secours.webm">⬇ Copie locale (secours) / Cópia local</a>`;
        stream.getTracks().forEach(t=>t.stop());
        clearInterval(recorders[uid].timer);
        status.textContent = 'Envoi en cours…';
        status.className = 'rec-status';
        try{
          const ctx = findDayByUid(uid);
          const ext = (blob.type||'').includes('mp4') ? 'm4a' : 'webm';
          const fileName = `${niveau}_${slug(student.prenom)}-${slug(student.nom)}_${ctx.week.tag}-${slug(ctx.day.num)}_${Date.now()}.${ext}`;
          const b64 = await blobToBase64(blob);
          const result = await callDriveScript({
            action: 'upload',
            fileName,
            mimeType: blob.type || 'audio/webm',
            base64: b64
          });
          if(!result || !result.ok) throw new Error(result && result.error || 'échec Drive');
          await db.collection('enregistrements').add({
            uid: student.uid,
            prenom: student.prenom, nom: student.nom, email: student.email, telephone: student.telephone,
            niveau: niveau, dossier: `Dossier ${CURRENT_DOSSIER_NUM}`,
            semaine: ctx.week.tag, jour: ctx.day.num, activite: ctx.day.title_fr,
            driveUrl: result.viewUrl, driveFileId: result.fileId,
            ts: firebase.firestore.FieldValue.serverTimestamp()
          });
          status.textContent = '✅ Enregistrement envoyé à ta professeure.'; status.className = 'rec-status ok';
          recDone[uid] = true;
          maybeCelebrate(uid);
        }catch(e){
          status.textContent = "⚠ Échec de l'envoi — utilise la copie locale ci-dessus.";
          status.className = 'rec-status bad';
        }
      };
      mr.start();
      let seconds = 0;
      const timeEl = document.getElementById('time-'+uid);
      const timer = setInterval(()=>{
        seconds++;
        const m = String(Math.floor(seconds/60)).padStart(2,'0');
        const s = String(seconds%60).padStart(2,'0');
        timeEl.textContent = `${m}:${s}`;
      }, 1000);
      recorders[uid] = {mr, active:true, timer};
      btn.textContent = '■ Arrêter';
      btn.classList.add('recording');
      status.textContent = 'Enregistrement en cours…';
      status.className = 'rec-status';
    }catch(err){
      status.textContent = "Micro non disponible : autorise l'accès au micro dans ton navigateur.";
      status.className = 'rec-status bad';
    }
  } else {
    recorders[uid].mr.stop();
    recorders[uid].active = false;
    btn.textContent = '● Enregistrer';
    btn.classList.remove('recording');
  }
}

function renderMaintenance(){
  document.getElementById('sidebar').innerHTML = `
    <p class="cover-label">Français langue étrangère</p>
    <h1 class="cover-title">FLE</h1>
  `;
  document.getElementById('content').innerHTML = `
    <div class="login-wrap">
      <div class="login-card" style="text-align:center;">
        <div style="font-size:44px; margin-bottom:10px;">🛠️</div>
        <h1>Maintenance en cours</h1>
        <p class="sub">${MAINTENANCE_MESSAGE_FR}</p>
        <p class="sub" style="font-style:italic;">🇧🇷 ${MAINTENANCE_MESSAGE_PT}</p>
      </div>
    </div>
  `;
}

/* Premier affichage : une fois TOUS les scripts chargés (les modules 09 à 19 déclarent leurs
   écrans et la navigation). */
function demarrerApplication(){ if(MAINTENANCE_MODE){ renderMaintenance(); } else { render(); } }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrerApplication);
else setTimeout(demarrerApplication, 0);
