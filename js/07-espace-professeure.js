/* ======================= ÉCRAN : ESPACE PROFESSEURE ======================= */
/* Onglets de l'espace professeure : chaque onglet déclare la fonction qui remplit
   #teacher-body. Les rubriques et les titres viennent du modèle de navigation
   (15-navigation.js) ; les modules ajoutent leurs onglets avec registerTeacherTab. */
const TEACHER_TABS = {
  eleves: ()=>loadTeacherStudents(), rec: ()=>loadTeacherRecordings(), historique: ()=>loadTeacherHistorique(),
  temas: ()=>loadTeacherTemas(), experimental: ()=>loadExperimentalAdmin(), dispo: ()=>loadAdminDispo(),
  messages: ()=>loadTeacherMessages()
};
function registerTeacherTab(id, loader){ TEACHER_TABS[id] = loader; }
function renderTeacher(){
  const c = document.getElementById('content');
  if(!isTeacher){ goLogin(); return; }
  if(!TEACHER_TABS[teacherTab]) teacherTab = 'accueil';
  const cur = typeof navCurrent === 'function' ? navCurrent() : {section:null, tab:null};
  const section = cur.section ? cur.section.label : 'Espace professeure';
  const title = cur.tab ? cur.tab.label : '';
  c.innerHTML = `
    <p class="eyebrow">${section}</p>
    <h1 class="page-title">${cur.section && cur.section.tabs.length === 1 ? section : title}</h1>
    <div id="teacher-body"><p class="teacher-empty" role="status">Chargement…</p></div>
  `;
  (TEACHER_TABS[teacherTab] || (()=>{}))();
}
function setTeacherTab(tab){ teacherTab = tab; screen = 'teacher'; render(); }

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
    experimentalSlots = slotsSnap.docs.map(d=>({id:d.id, ...d.data()})).filter(s => s.isExperimental === true)
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
  const badgeStyle = { free:'background:var(--ok-bg);color:var(--ok);', reserved:'background:var(--c-info-bg);color:var(--brand-blue);', cancelled:'background:var(--bad-bg);color:var(--bad);' };
  const badgeLabel = { free:'Libre', reserved:'Réservé', cancelled:'Annulé' };
  return experimentalSlots.map(slot=>{
    const status = experimentalSlotStatus(slot);
    const isPast = new Date(slot.date).getTime() < now;
    /* La limite de 24h (et même la notion de "passé") sont des politiques en
       libre-service pour l'élève (voir loadNextCourseBanner dans
       05-admin-disponibilites-forum.js) — elles ne s'appliquent pas ici :
       c'est Melissa qui agit elle-même, donc elle garde toujours la main,
       même sur un cours déjà passé (rattrapage, oubli, cas exceptionnel). */
    const canModify = true;
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
    /* Statut de replanification en cours + actions replanification / annulation —
       uniquement pour un créneau réservé. Pas de vocabulaire/enregistrement ici :
       ça ne s'applique pas à un cours expérimental (décision explicite de Melissa). */
    let recapAndActionsHTML = '';
    if(status === 'reserved'){
      const pendingFromTeacher = slot.rescheduleRequest && slot.rescheduleRequest.by==='teacher' && slot.rescheduleRequest.status==='pending';
      const pendingFromStudent = slot.rescheduleRequest && slot.rescheduleRequest.by==='student' && slot.rescheduleRequest.status==='pending';
      let pendingHTML = '';
      if(pendingFromTeacher){
        pendingHTML = `<div class="storage-note" style="background:var(--c-warning-bg);margin-top:8px;">📅 Proposition envoyée : <b>${fmtSlotDate(slot.rescheduleRequest.proposedDate)}</b> — en attente de confirmation par l'élève.</div>`;
      } else if(pendingFromStudent){
        pendingHTML = `<div class="storage-note" style="background:var(--c-info-bg);margin-top:8px;">⏳ L'élève propose 3 disponibilités :
          <div style="margin-top:4px;font-size:12.5px;">
            1. ${fmtSlotDate(slot.rescheduleRequest.availability1)}<br>
            2. ${fmtSlotDate(slot.rescheduleRequest.availability2)}<br>
            3. ${fmtSlotDate(slot.rescheduleRequest.availability3)}
          </div>
          <p style="font-size:11.5px;color:var(--grey);margin-top:6px;">Envoie-lui la disponibilité que tu retiens via « Proposer un nouveau créneau » ci-dessous.</p>
        </div>`;
      }
      recapAndActionsHTML = `
        ${pendingHTML}
        <div class="teacher-entry-actions" style="margin-top:8px;">
          ${canModify ? `<button onclick="toggleExperimentalReschedule('${slot.id}')" style="background:none;color:var(--navy);">${rescheduleFormOpenId===slot.id ? 'Fermer' : '📅 Proposer un nouveau créneau'}</button>` : ''}
          ${canModify ? `<button onclick="cancelExperimentalSlotAdmin('${slot.id}')" style="background:none;color:var(--bad);">❌ Annuler ce cours</button>` : ''}
        </div>
        ${rescheduleFormOpenId===slot.id ? rescheduleFormHTML(slot, 'submitExperimentalReschedule', 'toggleExperimentalReschedule', 'directRescheduleExperimental') : ''}
      `;
    }
    return `
      <div class="teacher-entry" style="${isPast && status!=='reserved' ? 'opacity:.6;' : ''}">
        <div class="who">${fmtSlotDate(slot.date)} ${pill}</div>
        ${timezoneLineHTML(slot.date)}
        ${studentLine}
        ${linkLine}
        ${recapAndActionsHTML}
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
      <div class="who">${esc(s.prenom || '')} ${esc(s.nom || '')} · <span style="color:var(--gold-dark)">Cours expérimental</span></div>
      <div class="meta">${esc(s.email || '—')} · ${esc(s.telephone || '—')} · inscrit le ${fmtDate(s.createdAt)}</div>
      <div class="meta">Historique expérimental : ${s.experimentalLesson ? 'oui' : 'enregistré'}${s.experimentalCompleted ? ' · cours effectué' : ''}</div>
      <div class="teacher-entry-actions">
        <button onclick="convertExperimentalStudent('${s.id}')">Convertir en élève</button>
        <button class="del" onclick="archiveExperimentalStudent('${s.id}')">Archiver</button>
      </div>
    </div>
  `).join('') : '<p class="teacher-empty">Aucun élève au stade expérimental.</p>';

  const archivedHTML = archived.length ? archived.map(s=>`
    <div class="teacher-entry" style="opacity:.78;">
      <div class="who">${esc(s.prenom || '')} ${esc(s.nom || '')} · <span style="color:var(--grey)">Archivé</span></div>
      <div class="meta">${esc(s.email || '—')} · ${esc(s.telephone || '—')}</div>
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
      <div id="experimental-result" style="display:none;margin-top:18px;background:var(--c-info-bg);border:1px solid var(--c-info-bg);border-radius:10px;padding:16px;">
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

  /* Vérifie qu'il n'y a pas déjà un autre créneau (classique ou expérimental)
     exactement à cette date et heure, pour éviter de te retrouver avec deux
     cours en même temps sans t'en rendre compte.
     - Si ce créneau est déjà réservé par un élève (classique ou expérimental),
       c'est un vrai double-booking : on bloque et on te le signale clairement.
     - S'il est encore libre (personne n'a réservé dessus), il ne sert à rien
       de le garder : on le supprime tout seul et on met le cours expérimental
       à la place, sans te demander de choisir une autre heure. */
  try{
    const conflictSnap = await db.collection('disponibilites').where('date', '==', iso).get();
    if(!conflictSnap.empty){
      const reservedConflict = conflictSnap.docs.find(d => d.data().reservedBy);
      if(reservedConflict){
        const conflict = reservedConflict.data();
        err.textContent = `⚠️ Tu as déjà un cours réservé à cette heure-là (${conflict.reservedName || 'un élève'}) — choisis un autre créneau.`;
        err.style.display = 'block';
        return;
      }
      // Aucun des créneaux trouvés à cette heure n'est réservé : on les retire.
      for(const doc of conflictSnap.docs){
        try{ await db.collection('disponibilites').doc(doc.id).delete(); }
        catch(e){ console.error('Suppression du créneau libre en conflit échouée :', e); }
      }
      // Si l'un de ces créneaux supprimés était déjà dans la liste affichée
      // (un autre cours expérimental libre), on l'enlève aussi de la liste
      // en mémoire pour ne pas laisser une entrée fantôme.
      const deletedIds = new Set(conflictSnap.docs.map(d=>d.id));
      experimentalSlots = experimentalSlots.filter(s=>!deletedIds.has(s.id));
    }
  }catch(e){
    console.error('Vérification de conflit de créneau échouée :', e);
    /* Non bloquant : mieux vaut laisser créer le créneau que bloquer toute
       la fonctionnalité si cette vérification échoue ponctuellement. */
  }

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
let packSlotsByStudent = {};
async function loadPackSlotsByStudent(){
  /* Séances de forfait regroupées par élève, à partir de la source commune (22-seances.js). */
  await seancesCharger();
  const now = Date.now();
  const parEleve = {};
  SEANCES.liste.forEach(slot=>{
    if(slot.isPack !== true || !slot.reservedBy) return;
    (parEleve[slot.reservedBy] = parEleve[slot.reservedBy] || []).push(slot);
  });
  packSlotsByStudent = {};
  Object.keys(parEleve).forEach(uid=>{
    const c = rptCompteurs(parEleve[uid], now);
    packSlotsByStudent[uid] = {past:c.effectuees, upcoming:c.aVenir, nextDate:c.nextDate, compteurs:c, slots:parEleve[uid]};
  });
}
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
  await loadPackSlotsByStudent();
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
/* Liste riche (paiement/forfait/bilan rapide) construite ici. Le NOM
   "renderTeacherStudentsList" est volontairement laissé libre pour
   10-profils-regles-evaluations.js, qui s'en sert comme petit aiguilleur :
   s'il n'y a pas de fiche élève ouverte, il retombe sur CETTE fonction ;
   sinon il affiche la fiche détaillée (Dossiers & bilans / Profil / Forfait).
   Sans ce partage de nom, l'un des deux fichiers écrase silencieusement
   l'autre selon l'ordre de chargement — c'est exactement le bug qu'on vient
   de trouver. */
/* Liste des élèves : un résumé par élève et un seul bouton vers sa fiche, où se
   trouvent toutes les modifications (niveau, rythme, forfait, liens, paiement,
   nota, bilans). L'ancien panneau « Gérer » faisait double emploi avec la fiche. */
const ELEVES_FILTRES = [['tous','Tous'],['anomalie','À régulariser'],['renouveler','Forfait à renouveler'],['paiement','Paiement en attente'],['sansNiveau','Sans niveau']];
let elevesFiltre = {f:'tous', q:''};
function uiSetStudentFilter(f){ elevesFiltre.f = f; renderStudentsFlatList(); }
function uiSearchStudents(v){
  elevesFiltre.q = v; renderStudentsFlatList();
  const i = document.getElementById('ui-student-search'); if(i){ i.focus(); i.setSelectionRange(v.length, v.length); }
}
function renderStudentsFlatList(){
  const body = document.getElementById('teacher-body');
  if(!body) return;
  if(studentsData.length === 0){ body.innerHTML = profEmptyHTML('users', 'Aucun élève inscrit pour le moment', ''); return; }
  const flags = s => uiStudentFlags(s);
  const q = elevesFiltre.q.trim().toLowerCase();
  const liste = studentsData.filter(s => (elevesFiltre.f === 'tous' || flags(s)[elevesFiltre.f]) && (!q || `${s.prenom||''} ${s.nom||''} ${s.email||''}`.toLowerCase().includes(q)));
  const n = f => f === 'tous' ? studentsData.length : studentsData.filter(s => flags(s)[f]).length;
  const now = Date.now();
  const lignes = liste.map(s => {
    const f = flags(s);
    const b = s.pack && s.pack.total ? forfaitBilanEleve(s) : null;
    const prochain = (SEANCES.liste || []).filter(x => x.reservedBy === s.id && !x.experimentalCancelled && !x.definitivelyCancelled && new Date(x.date).getTime() > now)[0];
    const etats = [
      f.anomalie ? '<span class="badge badge-danger">À régulariser</span>' : '',
      f.renouveler ? '<span class="badge badge-warning">À renouveler</span>' : '',
      f.paiement ? '<span class="badge badge-warning">Paiement en attente</span>' : '',
      !s.niveau ? '<span class="badge">Sans niveau</span>' : ''
    ].join(' ').trim();
    return `<tr>
      <td><button type="button" class="link-btn" onclick="openAdminStudent('${s.id}')">${esc(s.prenom)} ${esc(s.nom || '')}</button><br><span class="tp-dim">${esc(s.email || '')}</span></td>
      <td>${s.niveau ? esc(s.niveau) : '—'}</td>
      <td>${b ? `${b.utilisees}/${b.total} utilisées · <b>${b.restantes}</b> restante${b.restantes>1?'s':''}` : '<span class="tp-dim">Aucun forfait</span>'}</td>
      <td>${prochain ? `<button type="button" class="link-btn" onclick="seanceOuvrir('${prochain.id}')">${fmtSlotDate(prochain.date)}</button>` : '—'}</td>
      <td>${etats || '<span class="tp-dim">À jour</span>'}</td>
      <td><button type="button" class="btn btn-secondary btn-sm" onclick="openAdminStudent('${s.id}')">Ouvrir la fiche</button></td></tr>`;
  }).join('');
  body.innerHTML = `
    <div class="ui-filters" role="group" aria-label="Filtrer les élèves">
      ${ELEVES_FILTRES.map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${elevesFiltre.f===id}" onclick="uiSetStudentFilter('${id}')">${l}<span class="n">${n(id)}</span></button>`).join('')}
    </div>
    <div class="field field-search"><label for="ui-student-search">Rechercher un élève (nom, e-mail)</label><input type="search" id="ui-student-search" value="${esc(elevesFiltre.q)}" oninput="uiSearchStudents(this.value)" autocomplete="off"></div>
    <p class="ui-results" aria-live="polite">${liste.length} élève${liste.length>1?'s':''}${elevesFiltre.f !== 'tous' || q ? ` sur ${studentsData.length}` : ''}</p>
    ${liste.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Niveau</th><th scope="col">Forfait</th><th scope="col">Prochain cours</th><th scope="col">État</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>${lignes}</tbody></table></div>`
      : profEmptyHTML('users', 'Aucun élève ne correspond', '')}`;
}
async function markPackPaid(id){
  const s = studentsData.find(x=>x.id===id);
  try{
    await db.collection('eleves').doc(id).update({
      'pack.paymentStatus': 'paid',
      'pack.paymentConfirmedAt': new Date().toISOString()
    });
  }catch(e){ alert("Impossible d'enregistrer pour le moment."); return; }
  if(s && s.email){
    try{
      await callDriveScript({
        action: 'notifyPaymentReceived',
        email: s.email,
        prenom: s.prenom,
        context: 'ton forfait de cours'
      });
    }catch(e){ /* non bloquant */ }
  }
  await loadTeacherStudents();
}

/* Envoi de la nota fiscal du forfait — même mécanisme que sendNotaFiscal pour un
   cours à l'unité (voir 05-admin-disponibilites-forum.js), mais écrit sur le
   document élève (eleves/{id}) plutôt que sur un créneau. */
async function sendNotaFiscalPack(id, inputElId){
  const input = document.getElementById(inputElId);
  const file = input && input.files && input.files[0];
  if(!file){ alert('Choisis d\'abord le fichier de la nota fiscal.'); return; }
  const s = studentsData.find(x=>x.id===id);
  let base64;
  try{ base64 = await fileToBase64(file); }
  catch(e){ alert("Impossible de lire le fichier."); return; }
  let uploadResult;
  try{
    uploadResult = await callDriveScript({
      action: 'upload',
      fileName: `nota-fiscal-forfait-${(s && s.prenom+'-'+s.nom) || id}.pdf`,
      mimeType: file.type || 'application/pdf',
      base64
    });
  }catch(e){ alert("Impossible de téléverser la nota fiscale pour le moment."); return; }
  if(!uploadResult || !uploadResult.ok){ alert("Le téléversement a échoué."); return; }
  try{
    await db.collection('eleves').doc(id).update({
      'pack.notaFiscalUrl': uploadResult.viewUrl,
      'pack.notaFiscalSent': true,
      'pack.notaFiscalSentAt': new Date().toISOString()
    });
  }catch(e){ alert("Impossible d'enregistrer pour le moment."); return; }
  if(s && s.email){
    try{
      await callDriveScript({
        action: 'notifyNotaFiscal',
        email: s.email,
        prenom: s.prenom,
        notaFiscalUrl: uploadResult.viewUrl
      });
    }catch(e){ /* non bloquant */ }
  }
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
