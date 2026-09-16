/* ======================= RÉSERVATION DE COURS + FORUM ======================= */

function fmtSlotDate(iso){
  try{
    const d = new Date(iso);
    const jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    const mois = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const jour = jours[d.getDay()];
    const heure = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    return `${jour} ${d.getDate()} ${mois[d.getMonth()]} · ${heure}h${min}`;
  }catch(e){ return iso; }
}
/* Conversion dans quelques fuseaux horaires utiles (Paris, base de la professeure ;
   São Paulo, la majorité des élèves) — affiché en plus de l'heure locale de qui regarde. */
const TZ_LIST = [
  { label: 'Paris', tz: 'Europe/Paris' },
  { label: 'São Paulo', tz: 'America/Sao_Paulo' },
];
function fmtInTZ(iso, tz){
  try{
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit' }).formatToParts(d);
    const get = (t) => parts.find(p=>p.type===t).value;
    return `${get('day')}/${get('month')} ${get('hour')}h${get('minute')}`;
  }catch(e){ return ''; }
}
function timezoneLineHTML(iso){
  if(!iso) return '';
  const bits = TZ_LIST.map(z => `${z.label} : ${fmtInTZ(iso, z.tz)}`).join(' · ');
  return `<div class="tz-line">🌍 ${bits}</div>`;
}
/* Aperçu en direct de la conversion de fuseaux horaires, sous un champ datetime-local. */
function previewTZ(inputId, targetId){
  const val = document.getElementById(inputId).value;
  const target = document.getElementById(targetId);
  if(!target) return;
  if(!val){ target.innerHTML = ''; return; }
  target.innerHTML = timezoneLineHTML(new Date(val).toISOString());
}
/* Le lien Zoom n'est cliquable que juste avant le cours — évite un accès permanent à la salle. */
function zoomAccess(dateStr, duree){
  const start = new Date(dateStr).getTime();
  const opensAt = start - ZOOM_OPEN_MINUTES_BEFORE * 60000;
  const endsAt = start + (duree || 45) * 60000;
  const now = Date.now();
  return { open: now >= opensAt && now <= endsAt, opensAt, minutesLeft: Math.ceil((opensAt - now)/60000) };
}
/* Les liens Zoom ne sont jamais mis dans un <a href> (copiable en un clic droit) —
   on les garde dans cette table et on ouvre via un bouton + window.open(). */
const zoomUrlMap = {};
function openZoomLink(slotId){
  const url = zoomUrlMap[slotId] || ZOOM_LINK;
  window.open(url, '_blank', 'noopener');
  const field = isTeacher ? 'clickedByTeacher' : 'clickedByStudent';
  try{ db.collection('disponibilites').doc(slotId).update({ [field]: true }); }catch(e){ /* non bloquant */ }
}
function zoomButtonHTML(slotId, dateStr, duree, joinUrl){
  const acc = zoomAccess(dateStr, duree);
  zoomUrlMap[slotId] = joinUrl || ZOOM_LINK;
  if(acc.open){
    return `<button class="primary-btn" style="width:auto; padding:10px 18px; margin-top:8px;" onclick="openZoomLink('${slotId}')">🎥 Rejoindre : ${ZOOM_MEETING_NAME}</button>`;
  }
  const mins = acc.minutesLeft;
  let when;
  if(mins > 60*24) when = `dans ${Math.round(mins/1440)} jour(s)`;
  else if(mins > 60) when = `dans ${Math.round(mins/60)}h`;
  else when = `dans ${Math.max(mins,0)} min`;
  return `<button class="rec-btn" disabled style="opacity:.5; cursor:not-allowed; margin-top:8px;" title="Le lien s'active ${ZOOM_OPEN_MINUTES_BEFORE} min avant le cours">🔒 Lien Zoom disponible ${when}</button>`;
}

/* Demande à l'Apps Script de créer un lien Zoom unique pour cette réservation.
   Non bloquant : si ZOOM_UNIQUE_LINKS est désactivé ou que l'appel échoue,
   la réservation reste valide et utilisera ZOOM_LINK (salle fixe) à la place. */
async function ensureZoomMeeting(slotId, dateISO, duree, studentName, sessionNum){
  if(!ZOOM_UNIQUE_LINKS) return;
  const topic = sessionNum ? `#${sessionNum} Cours de français avec ${studentName || ''}` : `Cours de français avec ${studentName || ''}`;
  try{
    const result = await callDriveScript({
      action: 'createZoomMeeting',
      topic,
      startTime: dateISO,
      duration: duree || 45
    });
    if(result && result.ok && result.joinUrl){
      await db.collection('disponibilites').doc(slotId).update({ zoomJoinUrl: result.joinUrl, zoomTopic: topic });
    } else {
      console.warn('createZoomMeeting: pas de joinUrl retourné, secours sur ZOOM_LINK.', result);
    }
  }catch(e){ console.warn('createZoomMeeting a échoué, secours sur ZOOM_LINK.', e); }
}

/* ---- Mini-calendrier réutilisable ---- */
function toDateKey(d){
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function buildCalendarHTML(year, month, markers, selectedKey, onClickFnName){
  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayKey = toDateKey(new Date());

  let cells = '';
  for(let i=0;i<startDow;i++) cells += `<div class="mcal-day empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const dt = new Date(year, month, d);
    const key = toDateKey(dt);
    const marker = markers[key];
    const cls = ['mcal-day'];
    if(key === todayKey) cls.push('today');
    if(key === selectedKey) cls.push('selected');
    if(marker) cls.push('has-event');
    cells += `<div class="${cls.join(' ')}" onclick="${onClickFnName}('${key}')">
      ${d}${marker ? `<span class="mcal-dot" style="background:${marker.color}"></span>` : ''}
    </div>`;
  }
  return `
    <div class="mini-cal">
      <div class="mcal-head">
        <button onclick="${onClickFnName}Nav(-1)">‹</button>
        <span>${moisNoms[month]} ${year}</span>
        <button onclick="${onClickFnName}Nav(1)">›</button>
      </div>
      <div class="mcal-grid">
        <div class="mcal-dow">L</div><div class="mcal-dow">M</div><div class="mcal-dow">M</div>
        <div class="mcal-dow">J</div><div class="mcal-dow">V</div><div class="mcal-dow">S</div><div class="mcal-dow">D</div>
        ${cells}
      </div>
    </div>
  `;
}

/* ---- Élève : réserver un cours ---- */
let dispoData = [];
function renderHistorique(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="week-footer" style="margin-top:0; margin-bottom:18px;"><button onclick="goDossiers()">← Retour aux dossiers</button><div></div></div>
    <p class="eyebrow">Cours particuliers</p>
    <h1 class="page-title">📚 Historique de mes cours</h1>
    <div id="historique-body"><p class="teacher-empty">Chargement…</p></div>
  `;
  loadHistoriqueEleve();
}
async function loadHistoriqueEleve(){
  const body = document.getElementById('historique-body');
  try{
    const snap = await db.collection('disponibilites').orderBy('date','desc').get();
    const now = Date.now();
    const past = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .filter(s => s.reservedBy === student.uid && new Date(s.date).getTime() < now - 3600000);
    if(past.length===0){
      body.innerHTML = `<p class="teacher-empty">Aucun cours passé pour le moment.</p>`;
      return;
    }
    body.innerHTML = past.map(s => `
      <div class="slot-card" style="margin-bottom:12px;">
        <div class="slot-date">🗓️ ${fmtSlotDate(s.date)}</div>
        ${timezoneLineHTML(s.date)}
        ${s.anomalie ? `<p style="color:var(--bad); font-weight:700; font-size:13px; margin:4px 0;">⚠️ Cours en anomalie (toi et l'élève n'avez pas tous les deux rejoint le lien Zoom)</p>` : ''}
        ${s.vocab ? `<div style="background:var(--cream); border-radius:8px; padding:10px 12px; font-size:13.5px; white-space:pre-wrap; margin-top:8px;"><b>Vocabulaire vu :</b><br>${s.vocab}</div>` : `<p style="font-size:12.5px; color:var(--grey); margin-top:6px;">Le vocabulaire de ce cours n'a pas encore été ajouté.</p>`}
        ${s.recordingUrl ? `<a class="source-link" href="${s.recordingUrl}" target="_blank" rel="noopener" style="display:inline-block; margin-top:8px;">🎥 Voir l'enregistrement</a>` : ''}
      </div>
    `).join('');
  }catch(e){ body.innerHTML = `<p class="teacher-empty">Impossible de charger l'historique pour le moment.</p>`; }
}

async function loadDispoEleve(){
  const body = document.getElementById('reserver-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    dispoData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ dispoData = []; }
  renderReserverBody();
}
function renderReserver(){
  const c = document.getElementById('content');
  if(isTeacher){
    c.innerHTML = `
      <p class="eyebrow">Admin</p>
      <h1 class="page-title">Disponibilités & réservations</h1>
      <p style="font-size:14px; color:var(--grey); margin-bottom:16px;">Cette page redirige vers l'onglet Admin correspondant.</p>
    `;
    goTeacherTab('dispo');
    return;
  }
  c.innerHTML = `
    <p class="eyebrow">Cours particuliers</p>
    <h1 class="page-title">📅 Réserver un cours</h1>
    <div class="storage-note">🎥 Chaque cours réservé se fait en visio, sur la salle « ${ZOOM_MEETING_NAME} ». Le lien s'active automatiquement ${ZOOM_OPEN_MINUTES_BEFORE} minutes avant le début de ton cours.</div>
    <div id="reserver-body"><p class="teacher-empty">Chargement…</p></div>
  `;
  loadDispoEleve();
}
let reserverCalDate = new Date();
let reserverSelectedDay = null;
let studentRescheduleId = null;
function toggleStudentReschedule(id){
  studentRescheduleId = (studentRescheduleId === id) ? null : id;
  renderReserverBody();
}
function studentRescheduleFormHTML(s){
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">🔁 Demander une replanification</p>
    <p style="font-size:12.5px; color:var(--grey); margin-top:5px;">
      Propose exactement 3 disponibilités différentes. Le cours actuel reste réservé tant que ta professeure n'a pas validé un nouveau créneau.
    </p>

    ${[1,2,3].map(i => `
      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">
        Disponibilité ${i}
        <input type="datetime-local"
          id="student-propose-${i}-${s.id}"
          oninput="previewTZ('student-propose-${i}-${s.id}','student-propose-tz-${i}-${s.id}')"
          style="display:block; width:100%; box-sizing:border-box; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;">
      </label>
      <div id="student-propose-tz-${i}-${s.id}"></div>
    `).join('')}

    <button class="rec-btn" style="margin-top:10px;" onclick="proposeCustomReschedule('${s.id}')">
      Envoyer mes 3 disponibilités
    </button>
  </div>`;
}

async function proposeCustomReschedule(id){
  const values = [1,2,3].map(i => {
    const el = document.getElementById(`student-propose-${i}-${id}`);
    return el ? el.value : '';
  });

  if(values.some(v => !v)){
    alert('Merci de renseigner exactement 3 disponibilités.');
    return;
  }

  const dates = values.map(v => new Date(v).toISOString());

  if(new Set(dates).size !== 3){
    alert('Les 3 disponibilités doivent être différentes.');
    return;
  }

  const slot = dispoData.find(s=>s.id===id);
  if(!slot) return;

  if((new Date(slot.date).getTime() - Date.now()) <= 3600000){
    alert("La demande de replanification n'est plus possible à moins d'1h du cours.");
    return;
  }

  try{
    await db.collection('disponibilites').doc(id).update({
      rescheduleRequest: {
        by:'student',
        status:'pending',
        availability1: dates[0],
        availability2: dates[1],
        availability3: dates[2],
        proposedDate: null,
        proposedDuree: slot.duree || 45
      }
    });
  }catch(e){
    alert("Impossible d'envoyer la demande pour le moment.");
    return;
  }

  try{
    await callDriveScript({
      action:'notifyReschedule',
      to:'teacher',
      teacherEmail: TEACHER_EMAIL,
      name: `${student.prenom} ${student.nom}`,
      oldDate: fmtSlotDate(slot.date),
      availability1: fmtSlotDate(dates[0]),
      availability2: fmtSlotDate(dates[1]),
      availability3: fmtSlotDate(dates[2]),
      newDate: `${fmtSlotDate(dates[0])} / ${fmtSlotDate(dates[1])} / ${fmtSlotDate(dates[2])}`
    });
  }catch(e){ /* non bloquant */ }

  studentRescheduleId = null;
  alert('Tes 3 disponibilités ont été envoyées à ta professeure.');
  await loadDispoEleve();
}

async function acceptStudentAvailability(id, proposedDate){
  const slot = dispoData.find(s=>s.id===id);
  if(!slot || !slot.rescheduleRequest) return;

  try{
    await db.collection('disponibilites').doc(id).update({
      date: proposedDate,
      rescheduleRequest: null,
      rescheduleRequested: false,
      zoomJoinUrl: null,
      anomalie: false,
      anomalieHandled: true
    });
  }catch(e){
    alert("Impossible d'accepter ce créneau pour le moment.");
    return;
  }

  await ensureZoomMeeting(id, proposedDate, slot.duree || 45, slot.reservedName);
  await loadAdminDispo();
}

async function confirmTeacherProposal(id){
  const slot = dispoData.find(s=>s.id===id);
  if(!slot || !slot.rescheduleRequest) return;
  const newDate = slot.rescheduleRequest.proposedDate;
  const newDuree = slot.rescheduleRequest.proposedDuree || slot.duree;
  try{
    await db.collection('disponibilites').doc(id).update({
      date: newDate, duree: newDuree, rescheduleRequest: null, anomalie: false, anomalieHandled: true, zoomJoinUrl: null
    });
  }catch(e){ alert("Impossible de confirmer pour le moment."); return; }
  await ensureZoomMeeting(id, newDate, newDuree, `${student.prenom} ${student.nom}`);
  await loadDispoEleve();
}
async function refuseTeacherProposal(id){
  try{ await db.collection('disponibilites').doc(id).update({ rescheduleRequest: null }); }
  catch(e){ alert("Impossible de refuser pour le moment."); return; }
  await loadDispoEleve();
}

function selectReserverDayNav(delta){
  reserverCalDate = new Date(reserverCalDate.getFullYear(), reserverCalDate.getMonth()+delta, 1);
  renderReserverBody();
}
function selectReserverDay(key){
  reserverSelectedDay = (reserverSelectedDay === key) ? null : key;
  renderReserverBody();
}
function renderReserverBody(){
  const body = document.getElementById('reserver-body');
  if(!body) return;
  const now = Date.now();
  const mine = dispoData.filter(s => s.reservedBy === student.uid && new Date(s.date).getTime() >= now - 3600000);
  let dispo = dispoData.filter(s => !s.reservedBy && !s.isExperimental && new Date(s.date).getTime() >= now);

  const markers = {};
  dispo.forEach(s=>{ markers[toDateKey(new Date(s.date))] = {color:'#06a77d'}; });
  mine.forEach(s=>{ markers[toDateKey(new Date(s.date))] = {color:'#2E86C1'}; });

  if(reserverSelectedDay){ dispo = dispo.filter(s => toDateKey(new Date(s.date)) === reserverSelectedDay); }

  let html = '';
  if(mine.length){
    html += `<h2 class="section-title" style="margin-top:0;">Ton prochain cours</h2>`;
    html += mine.map(s => {
      const canModify = (new Date(s.date).getTime() - now) > 3600000;
      const pendingFromTeacher = s.rescheduleRequest && s.rescheduleRequest.by==='teacher' && s.rescheduleRequest.status==='pending';
      const pendingFromMe = s.rescheduleRequest && s.rescheduleRequest.by==='student' && s.rescheduleRequest.status==='pending';
      return `
      <div class="slot-card slot-mine">
        <div class="slot-date">📌 ${fmtSlotDate(s.date)} <span class="slot-dur">(${s.duree} min)</span></div>
        ${timezoneLineHTML(s.date)}
        ${pendingFromTeacher ? `
          <div class="storage-note" style="background:#FCF3CF;">
            📅 Ta professeure propose de déplacer ce cours au <b>${fmtSlotDate(s.rescheduleRequest.proposedDate)}</b>.
            <div style="margin-top:6px;">
              <button class="rec-btn" onclick="confirmTeacherProposal('${s.id}')">✅ Confirmer</button>
              <button onclick="refuseTeacherProposal('${s.id}')" style="background:none; color:var(--bad); margin-left:8px;">Refuser</button>
            </div>
          </div>` : ''}
        ${pendingFromMe ? `
          <div class="storage-note" style="background:#F4ECF7;">
            ⏳ Ta demande de replanification est en attente de validation par ta professeure.
            ${s.rescheduleRequest.availability1 ? `
              <div style="margin-top:6px; font-size:12.5px;">
                1. ${fmtSlotDate(s.rescheduleRequest.availability1)}<br>
                2. ${fmtSlotDate(s.rescheduleRequest.availability2)}<br>
                3. ${fmtSlotDate(s.rescheduleRequest.availability3)}
              </div>` : ''}
          </div>` : ''}
        ${zoomButtonHTML(s.id, s.date, s.duree, s.zoomJoinUrl)}
        ${canModify ? `<button class="rec-btn" style="background:none; color:var(--bad); margin-top:8px; margin-left:10px;" onclick="annulerReservation('${s.id}')">Annuler ma réservation</button>` : ''}
        ${canModify && !pendingFromMe && !pendingFromTeacher ? `<button class="rec-btn" style="background:none; color:var(--navy); margin-top:8px; margin-left:10px;" onclick="toggleStudentReschedule('${s.id}')">${studentRescheduleId===s.id ? "Fermer" : "🔁 Demander une replanification"}</button>` : ''}
        ${!canModify ? `<p style="font-size:11.5px; color:var(--grey); margin-top:6px;">Annulation ou demande de replanification possible jusqu'à 1h avant le cours seulement.</p>` : ''}
        ${studentRescheduleId===s.id ? studentRescheduleFormHTML(s) : ''}
      </div>
    `;
    }).join('');
  }
  html += `<h2 class="section-title">Calendrier</h2>
    <p style="font-size:12.5px; color:var(--grey); margin:-6px 0 10px;">🟢 créneau libre · 🔵 ton cours réservé — clique sur un jour pour filtrer</p>`;
  html += buildCalendarHTML(reserverCalDate.getFullYear(), reserverCalDate.getMonth(), markers, reserverSelectedDay, 'selectReserverDay');

  html += `<h2 class="section-title">Créneaux disponibles ${reserverSelectedDay ? `<button onclick="selectReserverDay('${reserverSelectedDay}')" style="background:none; color:var(--accent-2,#06a77d); font-size:12px; font-weight:700; vertical-align:middle;">✕ voir tous les jours</button>` : ''}</h2>`;
  if(dispo.length===0){
    html += `<p class="teacher-empty">${reserverSelectedDay ? 'Aucun créneau disponible ce jour-là.' : "Aucun créneau disponible pour le moment — reviens un peu plus tard, ta professeure en ajoute régulièrement."}</p>`;
  } else {
    html += `<div class="slot-grid">` + dispo.map(s => `
      <div class="slot-card">
        <div class="slot-date">🗓️ ${fmtSlotDate(s.date)}</div>
        ${timezoneLineHTML(s.date)}
        <div class="slot-dur">${s.duree} minutes</div>
        <button class="rec-btn" onclick="reserverCreneau('${s.id}')">Réserver</button>
      </div>
    `).join('') + `</div>`;
  }

  body.innerHTML = html;
}
async function reserverCreneau(id){
  const slot = dispoData.find(s=>s.id===id);
  try{
    await db.collection('disponibilites').doc(id).update({
      reservedBy: student.uid, reservedName: `${student.prenom} ${student.nom}`, reservedEmail: student.email
    });
  }catch(e){ alert("Impossible de réserver ce créneau pour le moment."); return; }
  if(slot){ await ensureZoomMeeting(id, slot.date, slot.duree, `${student.prenom} ${student.nom}`); }
  await loadDispoEleve();
}
