/* ======================= RENDU PRINCIPAL ======================= */
function render(){
  const currentUser = auth.currentUser;
  /* Sécurité : tant que l'e-mail d'un compte élève n'est pas vérifié, on ne
     montre que l'écran de vérification — jamais le menu, les réservations,
     le forum ou l'historique. */
  if(currentUser && currentUser.uid !== TEACHER_UID && !currentUser.emailVerified){
    screen = 'verify';
    const sidebar = document.getElementById('sidebar');
    if(sidebar){ sidebar.innerHTML = ''; sidebar.style.display = 'none'; }
    renderVerify();
    window.scrollTo(0,0);
    return;
  }
  const sidebar = document.getElementById('sidebar');
  if(sidebar){ sidebar.style.display = ''; }

  renderSidebar();
  const contentEl = document.getElementById('content');
  let accent = "#3a6df0";
  if(screen==='week'){ const w = weeks.find(x=>x.id===current); if(w) accent = w.color; }
  else if(screen==='bilan'){ accent = BILAN_COLOR; }
  else if(screen==='survie'){ accent = "#ef476f"; }
  else if(screen==='temas'){ accent = "#e08a1e"; }
  else if(screen==='reserver'){ accent = "#06a77d"; }
  else if(screen==='forum'){ accent = "#6f42c1"; }
  else if(screen==='messages'){ accent = "#0d9488"; }
  else if(screen==='historique'){ accent = "#8338ec"; }
  contentEl.style.setProperty('--accent', accent);
  if(screen==='login') renderLogin();
  else if(screen==='verify') renderVerify();
  else if(screen==='waiting') renderWaiting();
  else if(screen==='dossiers') renderDossiers();
  else if(screen==='survie') renderSurvie();
  else if(screen==='temas') renderTemas();
  else if(screen==='reserver') renderReserver();
  else if(screen==='forum') renderForum();
  else if(screen==='messages') renderMessages();
  else if(screen==='historique') renderHistorique();
  else if(screen==='week') renderWeek(weeks.find(w=>w.id===current));
  else if(screen==='bilan') renderBilan();
  else if(screen==='teacher') renderTeacher();
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
function maybeCelebrate(uid){
  const ctx = findDayByUid(uid);
  if(!ctx) return;
  const needsExo = !!ctx.day.exo;
  const exoOk = !needsExo || exoDone[uid];
  if(exoOk && recDone[uid] && !celebrated[uid]){
    celebrated[uid] = true;
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
  const m = uid.match(/^w(\d+)d(\d+)$/);
  if(!m) return null;
  const w = weeks.find(x=>x.id===parseInt(m[1]));
  if(!w) return null;
  const day = w.days[parseInt(m[2])-1];
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
            niveau: niveau, dossier: "Dossier 0",
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

if(MAINTENANCE_MODE){ renderMaintenance(); }
else{ render(); }
