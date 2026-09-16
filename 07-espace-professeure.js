/* ======================= ÉCRAN : ESPACE PROFESSEURE ======================= */
function renderTeacher(){
  const c = document.getElementById('content');
  if(!isTeacher){
    goLogin();
    return;
  }
  const titles = {eleves:'Élèves & attribution des niveaux', rec:'Enregistrements des élèves', temas:'Thème de la semaine — suivi & notes', dispo:'Disponibilités & réservations', experimental:'Cours expérimental', historique:'Historique des cours'};
  c.innerHTML = `
    <p class="eyebrow">Admin</p>
    <h1 class="page-title">${titles[teacherTab]}</h1>
    <div class="storage-note">🔒 Les profils et niveaux vivent dans Firestore (règles de sécurité), les fichiers audio dans ton Google Drive personnel — les deux ne sont pleinement accessibles qu'à ton compte professeure.</div>
    <div class="teacher-tabs">
      <button class="tab-btn ${teacherTab==='eleves'?'active':''}" onclick="setTeacherTab('eleves')">👤 Élèves & niveaux</button>
      <button class="tab-btn ${teacherTab==='rec'?'active':''}" onclick="setTeacherTab('rec')">🎙️ Enregistrements</button>
      <button class="tab-btn ${teacherTab==='temas'?'active':''}" onclick="setTeacherTab('temas')">🍅 Thème de la semaine</button>
      <button class="tab-btn ${teacherTab==='dispo'?'active':''}" onclick="setTeacherTab('dispo')">📅 Disponibilités</button>
      <button class="tab-btn ${teacherTab==='experimental'?'active':''}" onclick="setTeacherTab('experimental')">🧪 Cours expérimental</button>
      <button class="tab-btn ${teacherTab==='historique'?'active':''}" onclick="setTeacherTab('historique')">📚 Historique</button>
    </div>
    <div id="teacher-body"><p class="teacher-empty">Chargement…</p></div>
  `;
  if(teacherTab==='eleves') loadTeacherStudents();
  else if(teacherTab==='rec') loadTeacherRecordings();
  else if(teacherTab==='historique') loadTeacherHistorique();
  else if(teacherTab==='temas') loadTeacherTemas();
  else if(teacherTab==='experimental') loadExperimentalAdmin();
  else if(teacherTab==='dispo') loadAdminDispo();
}
function setTeacherTab(tab){ teacherTab = tab; render(); }

/* ---- Onglet : Élèves & niveaux ---- */
/* ---- Onglet : Cours expérimental ---- */
let experimentalLink = '';
function experimentalToken(){
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, x=>x.toString(16).padStart(2,'0')).join('');
}
let experimentalStudents = [];
let experimentalSlots = [];

async function loadExperimentalAdmin(){
  const body = document.getElementById('teacher-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('eleves').orderBy('nom').get();
    experimentalStudents = snap.docs
      .map(d=>({id:d.id, ...d.data()}))
      .filter(s => s.status === 'experimental' || s.status === 'archived' ||
        s.experimentalLesson === true || s.registrationSource === 'cours-experimental');
  }catch(e){
    console.error(e);
    experimentalStudents = [];
  }
  try{
    const slotsSnap = await db.collection('disponibilites').where('isExperimental','==',true).get();
    experimentalSlots = slotsSnap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b)=> new Date(a.date) - new Date(b.date));
  }catch(e){
    console.error(e);
    experimentalSlots = [];
  }
  renderExperimentalAdmin();
}

function experimentalStatus(s){
  if(s.status === 'archived') return 'archived';
  if(s.status === 'active') return 'active';
  return 'experimental';
}

function experimentalSlotStatus(slot){
  if(slot.experimentalCancelled || slot.confirmationStatus === 'cancelled') return 'cancelled';
  if(slot.reservedBy) return 'reserved';
  return 'free';
}

function esc(v){
  return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function experimentalSlotLink(slot){
  const page = new URL('cours-experimental.html', window.location.href);
  page.searchParams.set('token', slot.experimentalToken || '');
  page.searchParams.set('slot', slot.id);
  return page.href;
}

function renderExperimentalSlotsHTML(){
  if(!experimentalSlots.length) return '<p class="teacher-empty">Aucun cours expérimental créé pour le moment.</p>';
  const now = Date.now();
  const badgeStyle = { free:'background:var(--ok-bg);color:var(--ok);', reserved:'background:#eaf0ff;color:var(--brand-blue);', cancelled:'background:var(--bad-bg);color:var(--bad);' };
  const badgeLabel = { free:'Libre', reserved:'Réservé', cancelled:'Annulé' };
  return experimentalSlots.map(slot=>{
    const status = experimentalSlotStatus(slot);
    const isPast = new Date(slot.date).getTime() < now;
    const pill = `<span class="admin-pill" style="${badgeStyle[status]}">${badgeLabel[status]}${isPast ? ' · passé' : ''}</span>`;
    let studentLine = '';
    if(status !== 'free'){
      studentLine = `<div class="meta">👤 ${esc(slot.reservedName || '—')}${slot.reservedEmail ? ' · '+esc(slot.reservedEmail) : ''}</div>`;
    }
    let linkLine = '';
    if(status === 'free' && slot.experimentalToken){
      const link = experimentalSlotLink(slot);
      linkLine = `
        <div class="meta" style="word-break:break-all;margin-top:6px;">${esc(link)}</div>
        <div class="teacher-entry-actions">
          <button class="rec-btn" onclick="copyExperimentalSlotLink('${slot.id}')">Copier le lien</button>
          <span id="slot-copy-ok-${slot.id}" style="font-size:12.5px;color:var(--ok);"></span>
        </div>`;
    }
    return `
      <div class="teacher-entry" style="${isPast ? 'opacity:.6;' : ''}">
        <div class="who">${fmtSlotDate(slot.date)} ${pill}</div>
        ${timezoneLineHTML(slot.date)}
        ${studentLine}
        ${linkLine}
      </div>`;
  }).join('');
}

async function copyExperimentalSlotLink(slotId){
  const slot = experimentalSlots.find(s=>s.id===slotId);
  if(!slot) return;
  const ok = document.getElementById('slot-copy-ok-'+slotId);
  try{ await navigator.clipboard.writeText(experimentalSlotLink(slot)); if(ok) ok.textContent = 'Lien copié.'; }
  catch(e){ if(ok) ok.textContent = 'Copie le lien affiché ci-dessus.'; }
}

function renderExperimentalAdmin(){
  const body = document.getElementById('teacher-body');
  if(!body || !isTeacher) return;

  const prospects = experimentalStudents.filter(s => experimentalStatus(s) === 'experimental');
  const archived = experimentalStudents.filter(s => experimentalStatus(s) === 'archived');

  const prospectHTML = prospects.length ? prospects.map(s=>`
    <div class="teacher-entry">
      <div class="who">${s.prenom || ''} ${s.nom || ''} · <span style="color:var(--gold-dark)">Cours expérimental</span></div>
      <div class="meta">${s.email || '—'} · ${s.telephone || '—'} · inscrit le ${fmtDate(s.createdAt)}</div>
      <div class="meta">Historique expérimental : ${s.experimentalLesson ? 'oui' : 'enregistré'}${s.experimentalCompleted ? ' · cours effectué' : ''}</div>
      <div class="teacher-entry-actions">
        <button onclick="convertExperimentalStudent('${s.id}')">Convertir en élève</button>
        <button class="del" onclick="archiveExperimentalStudent('${s.id}')">Archiver</button>
      </div>
    </div>
  `).join('') : '<p class="teacher-empty">Aucun élève au stade expérimental.</p>';

  const archivedHTML = archived.length ? archived.map(s=>`
    <div class="teacher-entry" style="opacity:.78;">
      <div class="who">${s.prenom || ''} ${s.nom || ''} · <span style="color:var(--grey)">Archivé</span></div>
      <div class="meta">${s.email || '—'} · ${s.telephone || '—'}</div>
      <div class="meta">Cours expérimental déjà enregistré${s.experimentalCompleted ? ' · effectué' : ''} · archivé le ${fmtDate(s.archivedAt)}</div>
      <div class="teacher-entry-actions">
        <button onclick="restoreExperimentalStudent('${s.id}')">Restaurer en expérimental</button>
        <button onclick="convertExperimentalStudent('${s.id}')">Convertir en élève</button>
      </div>
    </div>
  `).join('') : '<p class="teacher-empty">Aucun profil expérimental archivé.</p>';

  body.innerHTML = `
    <div class="teacher-entry" style="max-width:680px;">
      <div class="who">Créer un cours expérimental</div>
      <div class="meta" style="margin-bottom:16px;">Choisis le créneau puis génère le lien unique à envoyer à l'élève.</div>
      <div class="field" style="max-width:420px;"><label>Date et heure</label><input id="experimental-date" type="datetime-local" oninput="previewTZ('experimental-date','experimental-date-tz')"></div>
      <div id="experimental-date-tz" style="margin:-8px 0 12px;"></div>
      <div class="meta" style="margin:-4px 0 16px;">Durée du cours expérimental : 45 minutes.</div>
      <button class="primary-btn" style="width:auto;padding:11px 18px;" onclick="createExperimentalCourse()">Créer le cours expérimental</button>
      <div id="experimental-error" class="login-err" style="margin-top:10px;"></div>
      <div id="experimental-result" style="display:none;margin-top:18px;background:#f3f6ff;border:1px solid #dbe4ff;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:var(--navy);margin-bottom:8px;">Lien élève créé</div>
        <div id="experimental-link" style="font-size:13px;word-break:break-all;margin-bottom:12px;"></div>
        <button class="rec-btn" onclick="copyExperimentalLink()">Copier le lien</button>
        <span id="experimental-copy-ok" style="font-size:12.5px;color:var(--ok);margin-left:10px;"></span>
      </div>
    </div>

    <h2 class="section-title">Créneaux déjà créés</h2>
    <div class="storage-note">Tous les créneaux marqués « cours expérimental », libres ou déjà réservés, avec leur horaire (Paris et São Paulo) et le lien à renvoyer si besoin.</div>
    <div id="experimental-slots-list">${renderExperimentalSlotsHTML()}</div>

    <h2 class="section-title">Élèves au stade expérimental</h2>
    <div class="storage-note">Ces profils ne sont pas affichés dans ta liste principale d'élèves. « Archiver » les retire de la plateforme tout en conservant leur identité et la trace du cours expérimental.</div>
    ${prospectHTML}

    <h2 class="section-title">Archives expérimentales</h2>
    ${archivedHTML}
  `;
}

async function convertExperimentalStudent(id){
  if(!isTeacher || auth.currentUser?.uid !== TEACHER_UID) return;
  if(!confirm("Convertir ce profil en élève actif ?")) return;
  try{
    await db.collection('eleves').doc(id).update({
      status: 'active',
      experimentalLesson: true,
      experimentalConvertedAt: firebase.firestore.FieldValue.serverTimestamp(),
      archivedAt: firebase.firestore.FieldValue.delete()
    });
    await loadExperimentalAdmin();
  }catch(e){
    console.error(e);
    alert("Impossible de convertir cet élève pour le moment.");
  }
}

async function archiveExperimentalStudent(id){
  if(!isTeacher || auth.currentUser?.uid !== TEACHER_UID) return;
  if(!confirm("Archiver ce profil ? Il ne sera plus affiché parmi les élèves actifs, mais son historique de cours expérimental sera conservé.")) return;
  try{
    await db.collection('eleves').doc(id).update({
      status: 'archived',
      experimentalLesson: true,
      archivedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await loadExperimentalAdmin();
  }catch(e){
    console.error(e);
    alert("Impossible d'archiver ce profil pour le moment.");
  }
}

async function restoreExperimentalStudent(id){
  if(!isTeacher || auth.currentUser?.uid !== TEACHER_UID) return;
  try{
    await db.collection('eleves').doc(id).update({
      status: 'experimental',
      experimentalLesson: true,
      archivedAt: firebase.firestore.FieldValue.delete()
    });
    await loadExperimentalAdmin();
  }catch(e){
    console.error(e);
    alert("Impossible de restaurer ce profil pour le moment.");
  }
}

async function createExperimentalCourse(){
  if(!isTeacher || auth.currentUser?.uid !== TEACHER_UID) return;
  const dateEl = document.getElementById('experimental-date');
  const err = document.getElementById('experimental-error');
  const result = document.getElementById('experimental-result');
  err.style.display = 'none'; err.textContent = ''; result.style.display = 'none';
  if(!dateEl.value){ err.textContent = 'Choisis une date et une heure.'; err.style.display = 'block'; return; }
  const iso = new Date(dateEl.value).toISOString();
  if(new Date(iso).getTime() <= Date.now()){ err.textContent = 'Choisis un créneau dans le futur.'; err.style.display = 'block'; return; }
  const token = experimentalToken();
  try{
    const ref = await db.collection('disponibilites').add({
      date: iso, duree: 45, isExperimental: true,
      courseType: 'experimental', courseTitle: 'Cours expérimental', experimentalToken: token,
      reservedBy: null, reservedName: null, reservedEmail: null,
      reminderSent: false, confirmed: false,
      createdBy: TEACHER_UID, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const page = new URL('cours-experimental.html', window.location.href);
    page.searchParams.set('token', token); page.searchParams.set('slot', ref.id);
    experimentalLink = page.href;
    document.getElementById('experimental-link').textContent = experimentalLink;
    result.style.display = 'block';
    experimentalSlots.push({ id: ref.id, date: iso, duree: 45, isExperimental: true,
      courseType: 'experimental', courseTitle: 'Cours expérimental', experimentalToken: token,
      reservedBy: null, reservedName: null, reservedEmail: null, reminderSent: false, confirmed: false });
    experimentalSlots.sort((a,b)=> new Date(a.date) - new Date(b.date));
    const listEl = document.getElementById('experimental-slots-list');
    if(listEl) listEl.innerHTML = renderExperimentalSlotsHTML();
  }catch(e){ console.error(e); err.textContent = 'Impossible de créer le cours expérimental.'; err.style.display = 'block'; }
}
async function copyExperimentalLink(){
  if(!experimentalLink) return;
  const ok = document.getElementById('experimental-copy-ok');
  try{ await navigator.clipboard.writeText(experimentalLink); ok.textContent = 'Lien copié.'; }
  catch(e){ ok.textContent = 'Copie le lien affiché ci-dessus.'; }
}

let studentsData = [];
let openBilanId = null;
async function loadTeacherStudents(){
  const body = document.getElementById('teacher-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('eleves').orderBy('nom').get();
    studentsData = snap.docs.map(d=>({id:d.id, ...d.data()})).filter(s =>
      s.status === 'active' ||
      (!s.status && s.experimentalLesson !== true && s.registrationSource !== 'cours-experimental')
    );
  }catch(e){ studentsData = []; }
  renderTeacherStudentsList();
}
async function loadTeacherStudentsQuiet(){
  try{
    const snap = await db.collection('eleves').orderBy('nom').get();
    studentsData = snap.docs.map(d=>({id:d.id, ...d.data()})).filter(s =>
      s.status === 'active' ||
      (!s.status && s.experimentalLesson !== true && s.registrationSource !== 'cours-experimental')
    );
  }catch(e){ studentsData = []; }
}
function toggleBilanEditor(id){
  openBilanId = (openBilanId === id) ? null : id;
  renderTeacherStudentsList();
}
function bilanEditorHTML(s){
  if(!s.niveau){
    return `<div class="rec-box" style="margin-top:10px;">
      <p class="rec-consigne">Attribue d'abord un niveau à ${s.prenom} avant de remplir un bilan (le bilan est rattaché à un niveau + un dossier).</p>
      <button onclick="toggleBilanEditor('${s.id}')" style="background:none; color:var(--grey); border:none; font-weight:700; cursor:pointer;">Fermer</button>
    </div>`;
  }
  const key = bilanKey(s.niveau, CURRENT_DOSSIER_NUM);
  const b = (s.bilans && s.bilans[key]) || {};
  const items = b.items || [];
  const rows = bilanItems.map((t,i)=>`
    <label style="display:flex; align-items:center; gap:8px; font-size:13.5px; margin-bottom:6px;">
      <input type="checkbox" id="bchk-${s.id}-${i}" ${items[i] ? 'checked' : ''}> ${t}
    </label>
  `).join('');
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">📝 Bilan final — ${s.prenom} ${s.nom} · Niveau ${s.niveau} · Dossier 0</p>
    ${rows}
    <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">Note / 20
      <input type="number" id="bnote20-${s.id}" min="0" max="20" step="0.5" value="${b.note20 != null ? b.note20 : ''}" placeholder="ex: 15" style="display:block; width:100px; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;">
    </label>
    <textarea id="bnote-${s.id}" placeholder="Commentaire pour l'élève (optionnel)" style="width:100%; min-height:60px; margin-top:8px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;">${b.note || ''}</textarea>
    <div class="teacher-entry-actions" style="margin-top:8px;">
      <button onclick="saveBilan('${s.id}','${key}')">Enregistrer le bilan</button>
      <button onclick="toggleBilanEditor('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}
async function saveBilan(id, key){
  const items = bilanItems.map((t,i)=> document.getElementById(`bchk-${id}-${i}`).checked);
  const note = document.getElementById(`bnote-${id}`).value.trim();
  const note20Raw = document.getElementById(`bnote20-${id}`).value;
  const note20 = note20Raw === '' ? null : parseFloat(note20Raw);
  try{
    await db.collection('eleves').doc(id).update({
      [`bilans.${key}`]: { items, note, note20, date: new Date().toISOString() }
    });
    openBilanId = null;
  }catch(e){ alert("Impossible d'enregistrer le bilan pour le moment."); }
  await loadTeacherStudents();
}
function completionStats(completedMap){
  const entries = Object.values(completedMap || {});
  const total = entries.length;
  const weekAgo = Date.now() - 7*24*3600*1000;
  let thisWeek = 0;
  entries.forEach(ts=>{
    try{
      const d = (ts && ts.toDate) ? ts.toDate() : new Date(ts);
      if(d.getTime() >= weekAgo) thisWeek++;
    }catch(e){ /* ignore */ }
  });
  return {total, thisWeek};
}
const TOTAL_ACTIVITIES = weeks.reduce((sum,w)=> sum + w.days.length, 0);
function reminderMailto(s){
  const subject = "Petit rappel — cours de français";
  const body = `Bonjour ${s.prenom},\n\nJe vois que tu n'as pas encore beaucoup avancé sur tes activités cette semaine. N'hésite pas à t'y remettre un peu avant notre prochaine séance !\n\nÀ bientôt,\nMelissa`;
  return `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function renderTeacherStudentsList(){
  const body = document.getElementById('teacher-body');
  if(!body) return;
  if(studentsData.length===0){ body.innerHTML = '<p class="teacher-empty">Aucun élève inscrit pour le moment.</p>'; return; }
  body.innerHTML = studentsData.map(s=>{
    const niveauOpts = ['', ...niveauxMenu.map(n=>n.code)].map(code=>
      `<option value="${code}" ${((s.niveau||'')===code) ? 'selected' : ''}>${code || '— Non assigné —'}</option>`
    ).join('');
    const freqOpts = ['', 1, 2, 3, 4, 5].map(f=>
      `<option value="${f}" ${(String(s.frequence||'')===String(f)) ? 'selected' : ''}>${f ? f+' séance'+(f>1?'s':'')+'/semaine' : '— Rythme non défini —'}</option>`
    ).join('');
    let progressText = 'Pas encore commencé';
    if(s.uniteCourante){
      const w = weeks.find(x=>x.tag===s.uniteCourante);
      if(w) progressText = `Unité ${w.id}/5 — ${w.title_fr}`;
    }
    const stats = completionStats(s.completed);
    const behind = stats.thisWeek < 3;
    const pack = s.pack || {};
    const packTotal = pack.total || 0;
    const packUsed = pack.used || 0;
    const packRemaining = packTotal - packUsed;
    return `<div class="teacher-entry">
      <div class="who">${s.prenom} ${s.nom} ${s.niveau ? '· <span style="color:var(--ok)">Niveau '+s.niveau+'</span>' : '· <span style="color:var(--bad)">non attribué</span>'}</div>
      <div class="meta">${s.email} · ${s.telephone || '—'} · inscrit le ${fmtDate(s.createdAt)}</div>
      <div class="meta">📍 Progression : ${progressText} ${s.niveau && s.bilans && s.bilans[bilanKey(s.niveau, CURRENT_DOSSIER_NUM)] ? `· <span style="color:var(--ok)">bilan Dossier 0 complété</span>${(s.bilans[bilanKey(s.niveau, CURRENT_DOSSIER_NUM)].note20 != null) ? ` · 📝 <b>${s.bilans[bilanKey(s.niveau, CURRENT_DOSSIER_NUM)].note20}/20</b>` : ''}` : ''}</div>
      <div class="meta">✅ ${stats.total}/${TOTAL_ACTIVITIES} activités faites au total · <b style="color:${behind ? 'var(--bad)' : 'var(--ok)'}">${stats.thisWeek} cette semaine</b>${behind ? ' ⚠️ moins de la moitié' : ''}</div>
      <div class="meta">📦 Forfait : ${packTotal ? `<b style="color:${packRemaining<=0?'var(--bad)':'var(--navy)'}">${packUsed}/${packTotal} séances utilisées</b> (${packRemaining} restante${packRemaining>1?'s':''})` : 'aucun forfait défini'}</div>
      <div class="teacher-entry-actions">
        <select id="niv-${s.id}">${niveauOpts}</select>
        <select id="freq-${s.id}">${freqOpts}</select>
        <label style="font-size:12px; color:var(--grey);">Forfait (${FORFAIT_MIN}-${FORFAIT_MAX} séances) <input type="number" id="packtotal-${s.id}" min="${FORFAIT_MIN}" max="${FORFAIT_MAX}" value="${packTotal || ''}" style="width:60px; margin-left:4px; padding:4px 6px; border:1px solid var(--line); border-radius:5px;"></label>
        <button onclick="saveStudentNiveau('${s.id}')">Enregistrer</button>
        <button onclick="toggleBilanEditor('${s.id}')">📝 Bilan final</button>
        ${behind ? `<a href="${reminderMailto(s)}" class="del" style="text-decoration:none;">📧 Envoyer un rappel</a>` : ''}
      </div>
      ${openBilanId === s.id ? bilanEditorHTML(s) : ''}
    </div>`;
  }).join('');
}
async function saveStudentNiveau(id){
  const niv = document.getElementById('niv-'+id).value;
  const freq = document.getElementById('freq-'+id).value;
  const packTotalRaw = document.getElementById('packtotal-'+id).value;
  const s = studentsData.find(x=>x.id===id);
  const updates = {
    niveau: niv || null,
    frequence: freq ? parseInt(freq, 10) : null
  };
  if(packTotalRaw !== ''){
    const packTotalVal = parseInt(packTotalRaw, 10) || 0;
    if(packTotalVal < FORFAIT_MIN || packTotalVal > FORFAIT_MAX){
      alert(`Un forfait doit contenir entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances.`);
      return;
    }
    updates['pack.total'] = packTotalVal;
    if(!(s && s.pack && typeof s.pack.used === 'number')){ updates['pack.used'] = 0; }
  }
  try{
    await db.collection('eleves').doc(id).update(updates);
  }catch(e){ alert("Impossible d'enregistrer pour le moment."); }
  await loadTeacherStudents();
}

/* ---- Onglet : Enregistrements ---- */
let teacherData = [];
async function loadTeacherRecordings(){
  const body = document.getElementById('teacher-body');
  if(body){
    body.innerHTML = `
      <div class="teacher-toolbar">
        <input id="teacher-filter" type="text" placeholder="Filtrer par prénom, nom, e-mail, semaine…">
        <button onclick="loadTeacherRecordings()">↻ Actualiser</button>
      </div>
      <div id="teacher-list"><p class="teacher-empty">Chargement…</p></div>
    `;
    document.getElementById('teacher-filter').oninput = renderTeacherList;
  }
  try{
    const snap = await db.collection('enregistrements').orderBy('ts','desc').limit(300).get();
    teacherData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){
    teacherData = [];
  }
  renderTeacherList();
}
function renderTeacherList(){
  const list = document.getElementById('teacher-list');
  if(!list) return;
  const filterEl = document.getElementById('teacher-filter');
  const filter = filterEl ? norm(filterEl.value) : '';
  const filtered = teacherData.filter(it=>{
    if(!filter) return true;
    const hay = norm(`${it.prenom} ${it.nom} ${it.email||''} ${it.semaine} ${it.jour} ${it.activite}`);
    return hay.includes(filter);
  });
  if(filtered.length===0){
    list.innerHTML = '<p class="teacher-empty">Aucun enregistrement pour le moment.</p>';
    return;
  }
  list.innerHTML = filtered.map(it=>{
    return `<div class="teacher-entry">
      <div class="who">${it.prenom} ${it.nom} · ${it.niveau} · ${it.dossier}</div>
      <div class="meta">${it.email || ''} · ${it.semaine} — ${it.jour} · ${it.activite || ''} · ${fmtDate(it.ts)}</div>
      <div class="teacher-entry-actions">
        <a href="${it.driveUrl}" target="_blank" rel="noopener">▶ Écouter / ouvrir dans Drive</a>
        <button class="del" onclick="deleteRecording('${it.id}','${it.driveFileId||''}')">🗑 Supprimer</button>
      </div>
    </div>`;
  }).join('');
}
async function deleteRecording(id, driveFileId){
  if(!confirm('Supprimer définitivement cet enregistrement (et le fichier dans le Drive) ?')) return;
  try{
    if(driveFileId){ await callDriveScript({action:'delete', fileId: driveFileId}); }
  }catch(e){ /* le document Firestore est quand même supprimé ci-dessous */ }
  try{ await db.collection('enregistrements').doc(id).delete(); }catch(e){ /* ignore */ }
  await loadTeacherRecordings();
}

