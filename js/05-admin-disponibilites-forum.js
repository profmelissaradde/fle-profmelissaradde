/* ============================================================================
   POLITIQUE D'ANNULATION TARDIVE (< 1h avant le cours) — 2 tolérances / 30 jours
   Au-delà, le cours n'est plus replanifiable : perte de la séance si c'est
   l'élève qui annule, remboursement dû si c'est la professeure.
   ============================================================================ */
async function processCancellation(slot, by){
  const result = { excessive:false, refundDue:false };
  if(!slot || !slot.reservedBy) return result;
  const start = new Date(slot.date).getTime();
  const isLate = (start - Date.now()) < 3600000;
  const studentId = slot.reservedBy;

  let studentDoc = null;
  try{ studentDoc = (await db.collection('eleves').doc(studentId).get()).data(); }catch(e){ studentDoc = {}; }
  const log = (studentDoc && studentDoc.noShowLog) || [];

  if(isLate){
    const thirtyDaysAgo = Date.now() - 30*24*3600*1000;
    const recentCount = log.filter(l => l.by===by && l.late && new Date(l.ts).getTime() >= thirtyDaysAgo).length;
    const newLog = [...log, { ts: new Date().toISOString(), by, late: true }];
    try{ await db.collection('eleves').doc(studentId).update({ noShowLog: newLog }); }catch(e){ /* non bloquant */ }
    if(recentCount + 1 > 2){ result.excessive = true; }
  }

  if(result.excessive){
    // Le cours n'est plus replanifiable.
    try{
      await db.collection('disponibilites').doc(slot.id).update({ definitivelyCancelled: true, cancelledBy: by });
    }catch(e){ /* non bloquant */ }
    if(by === 'teacher'){
      // Juste un remboursement (l'argent, hors app) — la séance n'est PAS rendue au forfait,
      // puisque l'élève est remboursé plutôt que crédité d'une nouvelle séance.
      result.refundDue = true;
      try{
        await db.collection('eleves').doc(studentId).update({ refundDue: true });
      }catch(e){ /* non bloquant */ }
    }
    // Si c'est l'élève qui a dépassé la tolérance : la séance de forfait est simplement perdue (pack.used inchangé).
  } else {
    // Annulation normale (ou tardive mais dans la limite de tolérance) : le créneau redevient libre.
    try{
      await db.collection('disponibilites').doc(slot.id).update({ reservedBy: null, reservedName: null, reservedEmail: null, zoomJoinUrl: null });
      if(slot.isPack){
        const pack = studentDoc.pack || {};
        await db.collection('eleves').doc(studentId).update({ 'pack.used': Math.max(0, (pack.used||0) - 1) });
      }
    }catch(e){ /* non bloquant */ }
  }
  return result;
}

async function annulerReservation(id){
  if(!confirm('Annuler cette réservation ?')) return;
  const slot = dispoData.find(s=>s.id===id) || { id, date: null, reservedBy: student.uid, isPack:false };
  try{
    const r = await processCancellation(slot, 'student');
    if(r.excessive){
      alert("Tu as déjà annulé ou manqué 2 cours à moins d'une heure du début au cours des 30 derniers jours. Cette séance est donc définitivement perdue — contacte ta professeure si besoin.");
    }
  }catch(e){ alert("Impossible d'annuler pour le moment."); return; }
  try{ await notifyTeacherOfCancellation(`${student.prenom} ${student.nom}`, fmtSlotDate(slot.date)); }catch(e){ /* non bloquant */ }
  await loadDispoEleve();
}

/* ---- Bannière "prochain cours" affichée sur la page d'accueil (dossiers) ---- */
async function loadNextCourseBanner(){
  const el = document.getElementById('next-course-banner');
  if(!el || isTeacher || !student.uid) return;
  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    const now = Date.now();
    const mine = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .filter(s => s.reservedBy === student.uid && new Date(s.date).getTime() >= now - 3600000)
      .sort((a,b)=> new Date(a.date) - new Date(b.date));
    if(mine.length===0){ el.innerHTML = ''; return; }
    const s = mine[0];
    el.innerHTML = `
      <div class="slot-card slot-mine" style="margin-bottom:18px;">
        <div class="slot-date">🎥 Ton prochain cours : ${fmtSlotDate(s.date)} <span class="slot-dur">(${s.duree} min)</span></div>
        ${timezoneLineHTML(s.date)}
        ${zoomButtonHTML(s.id, s.date, s.duree, s.zoomJoinUrl)}
      </div>
    `;
  }catch(e){ el.innerHTML = ''; }
}

/* ---- Admin : gérer les disponibilités ---- */
let adminCalDate = new Date();
let adminSelectedDay = null;
function selectAdminDayNav(delta){
  adminCalDate = new Date(adminCalDate.getFullYear(), adminCalDate.getMonth()+delta, 1);
  renderAdminDispo();
}
function selectAdminDay(key){
  adminSelectedDay = (adminSelectedDay === key) ? null : key;
  renderAdminDispo();
}
async function loadAdminDispo(){
  const body = document.getElementById('teacher-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    dispoData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ dispoData = []; }
  if(studentsData.length===0){ await loadTeacherStudentsQuiet(); }
  renderAdminDispo();
}
let adminRescheduleFormOpenId = null;

function toggleAdminRescheduleForm(id){
  adminRescheduleFormOpenId = (adminRescheduleFormOpenId === id) ? null : id;
  renderAdminDispo();
}

function adminRescheduleFormHTML(s){
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">🔁 Demander une replanification à ${s.reservedName || "l'élève"}</p>
    <p style="font-size:12.5px; color:var(--grey);">
      Propose un nouveau créneau. L'élève devra l'accepter ou le refuser dans son espace.
    </p>
    <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:8px;">
      Nouvelle date et heure
      <input type="datetime-local" id="admin-reschedule-date-${s.id}"
        oninput="previewTZ('admin-reschedule-date-${s.id}','admin-reschedule-tz-${s.id}')"
        style="display:block; width:100%; box-sizing:border-box; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;">
    </label>
    <div id="admin-reschedule-tz-${s.id}"></div>
    <div class="teacher-entry-actions" style="margin-top:8px;">
      <button onclick="submitAdminRescheduleRequest('${s.id}')">Envoyer la demande</button>
      <button onclick="toggleAdminRescheduleForm('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}

async function submitAdminRescheduleRequest(id){
  const slot = dispoData.find(s=>s.id===id);
  const input = document.getElementById('admin-reschedule-date-'+id);
  if(!slot || !input || !input.value) {
    alert('Choisis une date et une heure.');
    return;
  }

  if((new Date(slot.date).getTime() - Date.now()) <= 3600000){
    alert("La demande de replanification n'est plus possible à moins d'1h du cours.");
    return;
  }

  const proposedDate = new Date(input.value).toISOString();

  try{
    await db.collection('disponibilites').doc(id).update({
      rescheduleRequest: {
        by:'teacher',
        proposedDate,
        proposedDuree: slot.duree || 45,
        status:'pending'
      }
    });
  }catch(e){
    alert("Impossible d'envoyer la demande pour le moment.");
    return;
  }

  if(slot.reservedEmail){
    try{
      await callDriveScript({
        action:'notifyReschedule',
        to:'student',
        email:slot.reservedEmail,
        name:slot.reservedName,
        oldDate:fmtSlotDate(slot.date),
        newDate:fmtSlotDate(proposedDate)
      });
    }catch(e){ /* non bloquant */ }
  }

  adminRescheduleFormOpenId = null;
  alert("Demande envoyée à l'élève. Le cours actuel reste réservé jusqu'à sa réponse.");
  await loadAdminDispo();
}

/* ---- Récurrence par jours de la semaine (créneaux + forfaits) ---- */
const WEEKDAYS_FR = [
  {value:1, label:'Lun'}, {value:2, label:'Mar'}, {value:3, label:'Mer'},
  {value:4, label:'Jeu'}, {value:5, label:'Ven'}, {value:6, label:'Sam'}, {value:0, label:'Dim'}
];
function weekdayPickerHTML(prefix){
  return `<div style="display:flex; gap:8px; flex-wrap:wrap;">` +
    WEEKDAYS_FR.map(d => `
      <div style="display:flex; align-items:center; gap:4px; font-size:12.5px; background:#fff; border:1px solid var(--line); border-radius:6px; padding:5px 8px;">
        <label style="display:flex; align-items:center; gap:4px;">
          <input type="checkbox" id="${prefix}-day-${d.value}" onchange="toggleDayTime('${prefix}',${d.value})">
          ${d.label}
        </label>
        <input type="time" id="${prefix}-time-${d.value}" placeholder="de" style="display:none; width:80px; padding:3px 4px; border:1px solid var(--line); border-radius:4px;" onchange="refreshRecurrencePreview('${prefix}')">
        <span id="${prefix}-sep-${d.value}" style="display:none; color:var(--grey);">à</span>
        <input type="time" id="${prefix}-timeend-${d.value}" placeholder="à (optionnel)" title="Heure de fin, seulement si tu veux plusieurs créneaux à la suite (demi-journée)" style="display:none; width:80px; padding:3px 4px; border:1px solid var(--line); border-radius:4px;" onchange="refreshRecurrencePreview('${prefix}')">
      </div>
    `).join('') + `</div>`;
}
function toggleDayTime(prefix, value){
  const chk = document.getElementById(`${prefix}-day-${value}`);
  const time = document.getElementById(`${prefix}-time-${value}`);
  const sep = document.getElementById(`${prefix}-sep-${value}`);
  const timeEnd = document.getElementById(`${prefix}-timeend-${value}`);
  if(!chk || !time) return;
  const show = chk.checked ? 'inline-block' : 'none';
  time.style.display = show;
  if(sep) sep.style.display = chk.checked ? 'inline' : 'none';
  if(timeEnd) timeEnd.style.display = show;
  if(!chk.checked){ time.value = ''; if(timeEnd) timeEnd.value = ''; }
  refreshRecurrencePreview(prefix);
}
function readSelectedDayTimes(prefix){
  const out = [];
  WEEKDAYS_FR.forEach(d=>{
    const chk = document.getElementById(`${prefix}-day-${d.value}`);
    const time = document.getElementById(`${prefix}-time-${d.value}`);
    const timeEnd = document.getElementById(`${prefix}-timeend-${d.value}`);
    if(chk && chk.checked && time && time.value) out.push({weekday: d.value, time: time.value, timeEnd: (timeEnd && timeEnd.value) || null});
  });
  return out;
}
/* Éclate une plage horaire (ex. 9h-13h) en plusieurs créneaux consécutifs de la durée choisie ; sans heure de fin, un seul créneau à l'heure donnée. */
function expandDayTimes(dayTimes, dureeMinutes){
  const expanded = [];
  dayTimes.forEach(dt=>{
    if(dt.timeEnd){
      const [sh,sm] = dt.time.split(':').map(Number);
      const [eh,em] = dt.timeEnd.split(':').map(Number);
      let startMin = sh*60+sm;
      const endMin = eh*60+em;
      while(startMin + dureeMinutes <= endMin){
        const hh = String(Math.floor(startMin/60)).padStart(2,'0');
        const mm = String(startMin%60).padStart(2,'0');
        expanded.push({weekday: dt.weekday, time: `${hh}:${mm}`});
        startMin += dureeMinutes;
      }
    } else {
      expanded.push({weekday: dt.weekday, time: dt.time});
    }
  });
  return expanded;
}
function nextOccurrence(startDateStr, weekday, timeStr){
  const [h,m] = timeStr.split(':').map(Number);
  const d = new Date(startDateStr+'T00:00:00');
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(h, m, 0, 0);
  return d;
}
/* Un ou plusieurs jours/heures (avec éventuelles plages horaires), répétés pendant N semaines. */
function generateWeeklyDates(startDateStr, dayTimes, weeks, dureeMinutes){
  const expanded = expandDayTimes(dayTimes, dureeMinutes || 45);
  const dates = [];
  expanded.forEach(dt=>{
    const base = nextOccurrence(startDateStr, dt.weekday, dt.time);
    for(let w=0; w<weeks; w++){
      dates.push(new Date(base.getTime() + w*7*24*3600*1000));
    }
  });
  dates.sort((a,b)=>a-b);
  return dates;
}
/* Plusieurs jours/heures (avec éventuelles plages horaires) combinés jusqu'à atteindre un nombre de séances. */
function generateCountDates(startDateStr, dayTimes, count, dureeMinutes){
  const expanded = expandDayTimes(dayTimes, dureeMinutes || 45);
  if(expanded.length===0) return [];
  const next = expanded.map(dt => nextOccurrence(startDateStr, dt.weekday, dt.time));
  const out = [];
  while(out.length < count){
    let minIdx = 0;
    for(let i=1;i<next.length;i++){ if(next[i] < next[minIdx]) minIdx = i; }
    out.push(new Date(next[minIdx]));
    next[minIdx] = new Date(next[minIdx].getTime() + 7*24*3600*1000);
  }
  return out;
}
function refreshRecurrencePreview(prefix){
  const previewEl = document.getElementById(prefix+'-preview');
  if(!previewEl) return;
  const dayTimes = readSelectedDayTimes(prefix);
  let dates = [];
  if(prefix==='dispo'){
    const startVal = document.getElementById('dispo-start')?.value;
    const weeks = Math.max(1, parseInt(document.getElementById('dispo-weeks')?.value,10) || 1);
    const duree = parseInt(document.getElementById('dispo-duree')?.value,10) || 45;
    if(startVal && dayTimes.length) dates = generateWeeklyDates(startVal, dayTimes, weeks, duree);
  } else if(prefix==='pack'){
    const startVal = document.getElementById('pack-quick-start')?.value;
    const count = Math.max(1, Math.min(FORFAIT_MAX, parseInt(document.getElementById('pack-quick-count')?.value,10) || 1));
    const duree = parseInt(document.getElementById('pack-duree')?.value,10) || 45;
    if(startVal && dayTimes.length) dates = generateCountDates(startVal, dayTimes, count, duree);
  }
  if(!dates.length){ previewEl.innerHTML = ''; return; }
  previewEl.innerHTML = `<div style="font-size:11.5px; color:var(--grey); margin-top:6px; max-height:120px; overflow-y:auto;">📋 ${dates.length} date(s) : ${dates.map(d=>fmtSlotDate(d.toISOString())).join(' · ')}</div>`;
}

function renderAdminDispo(){
  const body = document.getElementById('teacher-body');
  if(!body) return;
  const now = Date.now();
  let upcoming = dispoData.filter(s => new Date(s.date).getTime() >= now - 3600000);

  const markers = {};
  upcoming.forEach(s=>{ markers[toDateKey(new Date(s.date))] = {color: s.reservedBy ? '#e08a1e' : '#06a77d'}; });

  const studentOptions = studentsData.map(s=>`<option value="${s.id}|${s.prenom} ${s.nom}|${s.email||''}">${s.prenom} ${s.nom}${s.niveau ? ' · '+s.niveau : ''}</option>`).join('');
  const packStudentOptions = studentsData.map(s=>{
    const pack = s.pack || {};
    const remaining = (pack.total||0) - (pack.used||0);
    return `<option value="${s.id}|${s.prenom} ${s.nom}|${s.email||''}">${s.prenom} ${s.nom}${s.niveau ? ' · '+s.niveau : ''} — forfait ${pack.total ? `${pack.used||0}/${pack.total} (${remaining} restante${remaining>1?'s':''})` : 'non défini'}</option>`;
  }).join('');
  const packRows = Array.from({length: FORFAIT_MAX}, (_,i)=>i+1).map(i => `
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
      <span style="font-size:12px; color:var(--grey); width:22px;">${i}.</span>
      <input type="datetime-local" id="pack-date-${i}" oninput="previewTZ('pack-date-${i}','pack-tz-${i}')" style="padding:6px 8px; border:1px solid var(--line); border-radius:6px;">
      <div id="pack-tz-${i}" style="font-size:11.5px; color:var(--grey);"></div>
    </div>
  `).join('');

  const pendingFromStudents = dispoData.filter(s => s.rescheduleRequest && s.rescheduleRequest.by==='student' && s.rescheduleRequest.status==='pending');
  const pendingHTML = pendingFromStudents.length ? `
    <div class="rec-box" style="border-color:#8338ec;">
      <p class="rec-consigne" style="font-weight:700;">📅 Demandes de replanification des élèves</p>
      ${pendingFromStudents.map(s => {
        const r = s.rescheduleRequest || {};
        const avails = [r.availability1, r.availability2, r.availability3].filter(Boolean);
        return `
          <div class="teacher-entry">
            <div class="who">${s.reservedName} — cours actuel : ${fmtSlotDate(s.date)}</div>

            ${avails.length ? `
              <div class="meta" style="margin-top:7px;">
                <b>Disponibilités proposées :</b>
                ${avails.map((d,i)=>`
                  <div style="margin-top:6px;">
                    ${i+1}. ${fmtSlotDate(d)}
                    <button class="rec-btn" style="margin-left:8px;" onclick="acceptStudentAvailability('${s.id}','${d}')">Accepter</button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="meta">
                ${r.proposedDate ? `Propose : <b>${fmtSlotDate(r.proposedDate)}</b>` : "Demande un changement d'horaire."}
              </div>
              <div class="teacher-entry-actions">
                ${r.proposedDate ? `<button onclick="acceptStudentReschedule('${s.id}')">Accepter</button>` : ''}
              </div>
            `}

            <div class="teacher-entry-actions" style="margin-top:8px;">
              <button onclick="toggleAdminRescheduleForm('${s.id}')" style="background:none; color:var(--navy);">Proposer un autre créneau</button>
              <button onclick="rejectStudentReschedule('${s.id}')" style="background:none; color:var(--bad);">Refuser</button>
            </div>
            ${adminRescheduleFormOpenId === s.id ? adminRescheduleFormHTML(s) : ''}
          </div>
        `;
      }).join('')}
    </div>
  ` : '';
  body.innerHTML = `
    ${pendingHTML}
    <div class="rec-box">
      <p class="rec-consigne" style="font-weight:700;">➕ Ajouter un créneau</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-top:10px;">
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">À partir du
          <input type="date" id="dispo-start" onchange="refreshRecurrencePreview('dispo')" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;">
        </label>
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Durée (minutes)
          <input type="number" id="dispo-duree" value="45" min="15" step="5" onchange="refreshRecurrencePreview('dispo')" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:100px;">
        </label>
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Nombre de semaines
          <input type="number" id="dispo-weeks" value="1" min="1" max="26" onchange="refreshRecurrencePreview('dispo')" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:90px;">
        </label>
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Réserver directement pour (optionnel)
          <select id="dispo-eleve" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; min-width:180px;">
            <option value="">— Laisser libre —</option>
            ${studentOptions}
          </select>
        </label>
      </div>
      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:12px;">Jours de la semaine — une heure précise, ou une plage « de / à » pour une demi-journée de créneaux à la suite</label>
      <div style="margin-top:6px;">${weekdayPickerHTML('dispo')}</div>
      <div id="dispo-preview"></div>
      <button class="rec-btn" style="margin-top:12px;" onclick="addDisponibilite()">Créer le(s) créneau(x)</button>
      <p style="font-size:12px; color:var(--grey); margin:8px 0 0;">💡 Une heure de « à » optionnelle : par ex. Lundi de 9h à 13h avec des cours de 45 min → 5 créneaux à la suite ce jour-là. Ajoute « Nombre de semaines » pour répéter tout ça sur plusieurs semaines. En général jusqu'à 4 jours par semaine, exceptionnellement 6.</p>
    </div>
    <div class="rec-box" style="margin-top:16px;">
      <p class="rec-consigne" style="font-weight:700;">📦 Réserver un forfait (plusieurs dates, un seul élève)</p>
      <p style="font-size:12.5px; color:var(--grey); margin:4px 0 10px;">Ces séances sont réservées directement pour l'élève — il ne les choisit pas lui-même dans la liste des créneaux libres. Laisse vides les dates que tu n'utilises pas.</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:12px;">
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Élève
          <select id="pack-eleve" onchange="prefillPackCount()" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; min-width:260px;">
            <option value="">— Choisir un élève —</option>
            ${packStudentOptions}
          </select>
        </label>
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Durée par séance (minutes)
          <input type="number" id="pack-duree" value="45" min="15" step="5" onchange="refreshRecurrencePreview('pack')" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:100px;">
        </label>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:12px; background:var(--cream); border:1px solid var(--line); border-radius:8px; padding:10px 12px;">
        <label style="font-size:12px; font-weight:700; color:var(--navy);">⚡ Remplissage rapide — à partir du
          <input type="date" id="pack-quick-start" onchange="refreshRecurrencePreview('pack')" style="display:block; margin-top:4px; padding:6px 8px; border:1px solid var(--line); border-radius:6px;">
        </label>
        <label style="font-size:12px; font-weight:700; color:var(--navy);">Nombre de séances
          <input type="number" id="pack-quick-count" value="1" min="1" max="${FORFAIT_MAX}" onchange="refreshRecurrencePreview('pack')" style="display:block; margin-top:4px; padding:6px 8px; border:1px solid var(--line); border-radius:6px; width:70px;">
        </label>
      </div>
      <label style="font-size:12px; font-weight:700; color:var(--navy);">Jours de la semaine — une heure précise, ou une plage « de / à » pour une demi-journée</label>
      <div style="margin-top:6px;">${weekdayPickerHTML('pack')}</div>
      <div id="pack-preview"></div>
      <p style="font-size:11.5px; color:var(--grey); margin:8px 0 10px;">Ça pré-remplit les champs ci-dessous, dans l'ordre chronologique en combinant les jours cochés — tu peux ensuite corriger ou vider une date ponctuellement (vacances, jour férié…) avant de créer les séances.</p>
      <button class="rec-btn" onclick="fillPackDatesQuick()" type="button">Remplir les dates ci-dessous</button>
      ${packRows}
      <button class="rec-btn" style="margin-top:8px;" onclick="reserverPack()">📦 Créer les séances du forfait</button>
    </div>
    <h2 class="section-title">Calendrier</h2>
    <p style="font-size:12.5px; color:var(--grey); margin:-6px 0 10px;">🟢 créneau libre · 🟠 réservé — clique sur un jour pour filtrer la liste</p>
    ${buildCalendarHTML(adminCalDate.getFullYear(), adminCalDate.getMonth(), markers, adminSelectedDay, 'selectAdminDay')}
    <h2 class="section-title">Créneaux à venir ${adminSelectedDay ? `<button onclick="selectAdminDay('${adminSelectedDay}')" style="background:none; color:#e08a1e; font-size:12px; font-weight:700; vertical-align:middle;">✕ voir tous les jours</button>` : ''}</h2>
    <div id="admin-dispo-list"></div>
  `;
  if(adminSelectedDay){ upcoming = upcoming.filter(s => toDateKey(new Date(s.date)) === adminSelectedDay); }
  const list = document.getElementById('admin-dispo-list');
  if(upcoming.length===0){
    list.innerHTML = `<p class="teacher-empty">${adminSelectedDay ? 'Aucun créneau ce jour-là.' : 'Aucun créneau à venir. Ajoutes-en un ci-dessus pour que tes élèves puissent réserver.'}</p>`;
  } else {
    list.innerHTML = upcoming.map(s=>`
    <div class="teacher-entry">
      <div class="who">🗓️ ${fmtSlotDate(s.date)} <span style="font-weight:400; color:var(--grey);">(${s.duree} min)</span></div>
      ${timezoneLineHTML(s.date)}
      <div class="meta">${s.reservedBy ? `✅ Réservé par <b>${s.reservedName}</b>` : '⬜ Libre'}</div>
      ${s.reservedBy ? zoomButtonHTML(s.id, s.date, s.duree, s.zoomJoinUrl) : ''}
      <div class="teacher-entry-actions">
        ${s.reservedBy && (new Date(s.date).getTime() - Date.now()) > 3600000 && !(s.rescheduleRequest && s.rescheduleRequest.status==='pending') ? `<button onclick="toggleAdminRescheduleForm('${s.id}')" style="background:none; color:var(--navy);">🔁 Demander une replanification</button>` : ''}
        ${s.reservedBy && (new Date(s.date).getTime() - Date.now()) > 3600000 ? `<button onclick="adminCancelReservation('${s.id}')" style="background:none; color:var(--bad);">Annuler la réservation</button>` : ''}
        <button onclick="deleteDisponibilite('${s.id}')" style="background:none; color:var(--grey);">🗑 Supprimer le créneau</button>
      </div>
      ${adminRescheduleFormOpenId === s.id ? adminRescheduleFormHTML(s) : ''}
      ${s.reservedBy && (new Date(s.date).getTime() - Date.now()) <= 3600000 ? `<p style="font-size:11.5px; color:var(--grey); margin-top:6px;">Annulation ou replanification impossible à moins d'1h du cours.</p>` : ''}
    </div>
  `).join('');
  }
}
let openRecapId = null;
function toggleRecap(id){
  openRecapId = (openRecapId === id) ? null : id;
  renderPastSessions();
}
function recapEditorHTML(s){
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">📚 Récap du cours — ${s.reservedName || ''} · ${fmtSlotDate(s.date)}</p>
    <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">Vocabulaire vu pendant ce cours
      <textarea id="recap-vocab-${s.id}" placeholder="un mot — sa traduction&#10;une expression — son sens..." style="width:100%; min-height:90px; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;">${s.vocab || ''}</textarea>
    </label>
    <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">Lien de l'enregistrement Zoom (Google Drive, une fois que tu l'as téléversé)
      <input type="url" id="recap-rec-${s.id}" value="${s.recordingUrl || ''}" placeholder="https://drive.google.com/..." style="width:100%; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:7px;">
    </label>
    <div class="teacher-entry-actions" style="margin-top:10px;">
      <button onclick="saveSessionRecap('${s.id}')">Enregistrer</button>
      <button onclick="toggleRecap('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}
async function saveSessionRecap(id){
  const vocab = document.getElementById('recap-vocab-'+id).value.trim();
  const recordingUrl = document.getElementById('recap-rec-'+id).value.trim();
  const updates = { vocab, recordingUrl };
  if(vocab && recordingUrl){
    // Preuve manuelle que le cours a bien eu lieu — annule toute anomalie détectée par les clics.
    updates.anomalie = false;
  }
  try{
    await db.collection('disponibilites').doc(id).update(updates);
    openRecapId = null;
  }catch(e){ alert("Impossible d'enregistrer pour le moment."); }
  await loadAdminDispo();
}
function renderPastSessions(){
  const el = document.getElementById('admin-past-list');
  if(!el) return;
  const now = Date.now();
  const past = dispoData
    .filter(s => s.reservedBy && new Date(s.date).getTime() < now - 3600000)
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  if(past.length===0){ el.innerHTML = `<p class="teacher-empty">Aucun cours passé pour le moment.</p>`; return; }
  el.innerHTML = past.map(s => `
    <div class="teacher-entry">
      <div class="who">🗓️ ${fmtSlotDate(s.date)} <span style="font-weight:400; color:var(--grey);">— ${s.reservedName}</span></div>
      <div class="meta">${s.anomalie ? '<b style="color:var(--bad);">⚠️ Anomalie : pas rejoint par les deux</b> · ' : ''}${s.vocab ? '✅ Vocabulaire ajouté' : '⬜ Pas encore de vocabulaire'} · ${s.recordingUrl ? "🎥 Enregistrement disponible" : "⬜ Pas encore d'enregistrement"}</div>
      <div class="teacher-entry-actions">
        ${s.anomalie ? `<button onclick="toggleRescheduleForm('${s.id}')" style="background:none; color:var(--bad);">📅 Proposer un nouveau créneau</button>` : ''}
        <button onclick="toggleRecap('${s.id}')">${openRecapId===s.id ? 'Fermer' : '📝 Ajouter vocabulaire / enregistrement'}</button>
      </div>
      ${openRecapId === s.id ? recapEditorHTML(s) : ''}
      ${rescheduleFormOpenId === s.id ? rescheduleFormHTML(s) : ''}
    </div>
  `).join('');
}
async function loadTeacherHistorique(){
  const body = document.getElementById('teacher-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    dispoData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ dispoData = []; }
  detectAnomalies();
  renderTeacherHistorique();
}
function renderTeacherHistorique(){
  const body = document.getElementById('teacher-body');
  if(!body) return;
  const anomalies = dispoData.filter(s=>s.anomalie && s.reservedBy);
  body.innerHTML = `
    ${anomalies.length ? `<div class="storage-note" style="background:var(--bad-bg); color:var(--bad);">⚠️ ${anomalies.length} cours en anomalie (toi et l'élève n'avez pas tous les deux cliqué sur le lien Zoom) — à replanifier ci-dessous.</div>` : ''}
    <p style="font-size:12.5px; color:var(--grey); margin:-6px 0 16px;">Ajoute le vocabulaire vu et le lien de l'enregistrement (téléversé sur ton Drive) pour chaque cours donné.</p>
    <div id="admin-past-list"></div>
  `;
  renderPastSessions();
}
/* Un cours est en "anomalie" si sa date+durée est passée depuis au moins 30 min,
   qu'il était réservé, que ni l'élève ni la professeure n'ont cliqué sur le lien Zoom,
   ET que la professeure n'a pas déjà confirmé manuellement (vocabulaire + enregistrement). */
async function detectAnomalies(){
  const now = Date.now();
  for(const s of dispoData){
    if(!s.reservedBy) continue;
    if(s.vocab && s.recordingUrl) continue; // preuve manuelle que le cours a eu lieu
    const endsAt = new Date(s.date).getTime() + (s.duree||45)*60000;
    const isPast = now > endsAt + 30*60000;
    const noShow = !(s.clickedByStudent && s.clickedByTeacher); // anomalie sauf si les DEUX ont cliqué
    if(isPast && noShow && !s.anomalie && !s.anomalieHandled){
      s.anomalie = true;
      try{ await db.collection('disponibilites').doc(s.id).update({ anomalie: true }); }catch(e){ /* non bloquant */ }
    }
  }
}
/* ---- Replanification (avec confirmation de l'autre partie) ---- */
let rescheduleFormOpenId = null;
function toggleRescheduleForm(id){
  rescheduleFormOpenId = (rescheduleFormOpenId === id) ? null : id;
  renderPastSessions();
}
function rescheduleFormHTML(s){
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">📅 Proposer un nouveau créneau à ${s.reservedName || "l'élève"}</p>
    <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:8px;">Nouvelle date et heure
      <input type="datetime-local" id="reschedule-date-${s.id}" oninput="previewTZ('reschedule-date-${s.id}','reschedule-tz-${s.id}')" style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;">
    </label>
    <div id="reschedule-tz-${s.id}"></div>
    <div class="teacher-entry-actions" style="margin-top:8px;">
      <button onclick="submitRescheduleProposal('${s.id}')">Envoyer la proposition</button>
      <button onclick="toggleRescheduleForm('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}
async function submitRescheduleProposal(id){
  const val = document.getElementById('reschedule-date-'+id).value;
  if(!val){ alert('Choisis une date et une heure.'); return; }
  const slot = dispoData.find(s=>s.id===id);
  const proposedDate = new Date(val).toISOString();
  try{
    await db.collection('disponibilites').doc(id).update({
      rescheduleRequest: { by:'teacher', proposedDate, proposedDuree: slot ? slot.duree : 45, status:'pending' }
    });
  }catch(e){ alert("Impossible d'envoyer la proposition pour le moment."); return; }
  if(slot && slot.reservedEmail){
    try{ await callDriveScript({ action:'notifyReschedule', to:'student', email: slot.reservedEmail, name: slot.reservedName, oldDate: fmtSlotDate(slot.date), newDate: fmtSlotDate(proposedDate) }); }catch(e){ /* non bloquant */ }
  }
  rescheduleFormOpenId = null;
  alert("Proposition envoyée — en attente de confirmation de l'élève (dans son espace ou par mail).");
  await loadTeacherHistorique();
}
async function acceptStudentReschedule(id){
  const slot = dispoData.find(s=>s.id===id);
  if(!slot || !slot.rescheduleRequest) return;
  const newDate = slot.rescheduleRequest.proposedDate;
  try{
    await db.collection('disponibilites').doc(id).update({
      date: newDate, rescheduleRequest: null, anomalie: false, anomalieHandled: true, zoomJoinUrl: null
    });
  }catch(e){ alert("Impossible d'accepter pour le moment."); return; }
  await ensureZoomMeeting(id, newDate, slot.duree, slot.reservedName);
  await loadAdminDispo();
}
async function rejectStudentReschedule(id){
  try{ await db.collection('disponibilites').doc(id).update({ rescheduleRequest: null }); }
  catch(e){ alert("Impossible de refuser pour le moment."); return; }
  await loadAdminDispo();
}
async function addDisponibilite(){
  const startVal = document.getElementById('dispo-start').value;
  const weeks = Math.max(1, parseInt(document.getElementById('dispo-weeks').value, 10) || 1);
  const duree = parseInt(document.getElementById('dispo-duree').value, 10) || 45;
  const eleveVal = document.getElementById('dispo-eleve').value;
  if(!startVal){ alert('Choisis une date de départ.'); return; }
  const dayTimes = readSelectedDayTimes('dispo');
  if(dayTimes.length===0){ alert('Coche au moins un jour de la semaine et renseigne son heure.'); return; }
  const dates = generateWeeklyDates(startVal, dayTimes, weeks, duree);
  let name = null;
  if(eleveVal){ [, name] = eleveVal.split('|'); }

  let created = 0;
  for(const occDate of dates){
    const dateISO = occDate.toISOString();
    const slot = { date: dateISO, duree, reservedBy: null, reservedName: null, reservedEmail: null, ts: firebase.firestore.FieldValue.serverTimestamp() };
    if(eleveVal){
      const [id, nm, email] = eleveVal.split('|');
      slot.reservedBy = id; slot.reservedName = nm; slot.reservedEmail = email;
    }
    try{
      const ref = await db.collection('disponibilites').add(slot);
      if(eleveVal){ await ensureZoomMeeting(ref.id, dateISO, duree, name); }
      created++;
    }catch(e){ /* on continue avec les occurrences suivantes même si une échoue */ }
  }
  if(created===0){ alert("Impossible d'ajouter ce(s) créneau(x) pour le moment."); return; }
  if(created > 1) alert(`${created} créneaux créés.`);
  await loadAdminDispo();
}
function prefillPackCount(){
  const eleveVal = document.getElementById('pack-eleve').value;
  const countEl = document.getElementById('pack-quick-count');
  if(!eleveVal || !countEl) return;
  const [id] = eleveVal.split('|');
  const s = studentsData.find(x=>x.id===id);
  const pack = (s && s.pack) || {};
  const remaining = Math.max(1, (pack.total||0) - (pack.used||0));
  countEl.value = Math.min(remaining, FORFAIT_MAX);
  refreshRecurrencePreview('pack');
}
function fillPackDatesQuick(){
  const startVal = document.getElementById('pack-quick-start').value;
  const count = Math.max(1, Math.min(FORFAIT_MAX, parseInt(document.getElementById('pack-quick-count').value, 10) || 1));
  if(!startVal){ alert('Choisis la date de départ.'); return; }
  const dayTimes = readSelectedDayTimes('pack');
  if(dayTimes.length===0){ alert('Coche au moins un jour de la semaine et renseigne son heure.'); return; }
  const duree = parseInt(document.getElementById('pack-duree').value, 10) || 45;
  const dates = generateCountDates(startVal, dayTimes, count, duree);
  dates.forEach((occ,i)=>{
    const input = document.getElementById('pack-date-'+(i+1));
    if(!input) return;
    const pad = n => String(n).padStart(2,'0');
    input.value = `${occ.getFullYear()}-${pad(occ.getMonth()+1)}-${pad(occ.getDate())}T${pad(occ.getHours())}:${pad(occ.getMinutes())}`;
    previewTZ('pack-date-'+(i+1), 'pack-tz-'+(i+1));
  });
}
async function reserverPack(){
  const eleveVal = document.getElementById('pack-eleve').value;
  const duree = parseInt(document.getElementById('pack-duree').value, 10) || 45;
  if(!eleveVal){ alert('Choisis un élève.'); return; }
  const [id, name, email] = eleveVal.split('|');
  const dates = [];
  for(let i=1;i<=FORFAIT_MAX;i++){
    const v = document.getElementById('pack-date-'+i).value;
    if(v) dates.push(new Date(v).toISOString());
  }
  if(dates.length===0){ alert('Renseigne au moins une date.'); return; }

  const s = studentsData.find(x=>x.id===id);
  const pack = (s && s.pack) || {};
  const remaining = (pack.total||0) - (pack.used||0);
  if(pack.total && (pack.total < FORFAIT_MIN || pack.total > FORFAIT_MAX)){
    alert(`Ce forfait (${pack.total} séances) est en dehors des limites autorisées (${FORFAIT_MIN} à ${FORFAIT_MAX} séances). Corrige d'abord le forfait dans « Élèves & niveaux ».`);
    return;
  }
  if(pack.total && dates.length > remaining){
    if(!confirm(`Attention : ${name} n'a que ${remaining} séance(s) restante(s) dans son forfait, tu es sur le point d'en créer ${dates.length}. Continuer quand même ?`)) return;
  }

  let created = 0;
  const baseUsed = pack.used || 0;
  for(const dateISO of dates){
    try{
      const ref = await db.collection('disponibilites').add({
        date: dateISO, duree, reservedBy: id, reservedName: name, reservedEmail: email, isPack: true,
        ts: firebase.firestore.FieldValue.serverTimestamp()
      });
      await ensureZoomMeeting(ref.id, dateISO, duree, name, baseUsed + created + 1);
      created++;
    }catch(e){ /* on continue avec les autres dates même si une échoue */ }
  }
  if(created > 0){
    try{
      await db.collection('eleves').doc(id).update({ 'pack.used': (pack.used||0) + created });
    }catch(e){ /* non bloquant */ }
  }
  alert(`${created} séance(s) créée(s) pour ${name}.`);
  await loadAdminDispo();
}
async function notifyCancellation(email, prenom, dateStr){
  try{
    const r = await callDriveScript({ action:'notifyCancel', email, prenom, dateStr });
    if(!r || !r.ok) console.warn('notifyCancel: échec côté script.', r);
  }catch(e){ console.warn('notifyCancel a échoué.', e); }
}
async function notifyTeacherOfCancellation(studentName, dateStr){
  try{
    const r = await callDriveScript({ action:'notifyTeacherCancel', teacherEmail: TEACHER_EMAIL, studentName, dateStr });
    if(!r || !r.ok) console.warn('notifyTeacherCancel: échec côté script.', r);
  }catch(e){ console.warn('notifyTeacherCancel a échoué.', e); }
}
async function deleteDisponibilite(id){
  const slot = dispoData.find(s=>s.id===id);
  if(!confirm('Supprimer ce créneau ?')) return;
  if(slot && slot.reservedBy){
    try{
      const r = await processCancellation(slot, 'teacher');
      if(r.refundDue) alert(`⚠️ ${slot.reservedName} a droit à un remboursement (2 annulations tardives dépassées de ton côté sur 30 jours). Pense à le faire manuellement.`);
    }catch(e){ /* non bloquant */ }
    await notifyCancellation(slot.reservedEmail, slot.reservedName, fmtSlotDate(slot.date));
  }
  try{ await db.collection('disponibilites').doc(id).delete(); }
  catch(e){ alert('Impossible de supprimer pour le moment.'); return; }
  await loadAdminDispo();
}
async function adminCancelReservation(id){
  const slot = dispoData.find(s=>s.id===id);
  if(!confirm('Annuler la réservation de cet élève ?')) return;
  try{
    const r = await processCancellation(slot, 'teacher');
    if(r.refundDue) alert(`⚠️ ${slot.reservedName} a droit à un remboursement (2 annulations tardives dépassées de ton côté sur 30 jours). Pense à le faire manuellement.`);
  }catch(e){ alert("Impossible d'annuler pour le moment."); return; }
  if(slot && slot.reservedEmail){
    await notifyCancellation(slot.reservedEmail, slot.reservedName, fmtSlotDate(slot.date));
  }
  await loadAdminDispo();
}

/* ---- Forum ---- */
let forumData = [];
let forumOpenReplyId = null;
async function loadForum(){
  const body = document.getElementById('forum-body');
  if(body) body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  try{
    const snap = await db.collection('forum').orderBy('ts', 'desc').get();
    forumData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ forumData = []; }
  renderForumBody();
}
function renderForum(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <p class="eyebrow">Entraide</p>
    <h1 class="page-title">💬 Forum</h1>
    <p style="font-size:14px; color:var(--grey); margin-bottom:16px;">Pose une question, ta professeure (ou un autre élève) peut te répondre ici.</p>
    <div class="rec-box">
      <p class="rec-consigne" style="font-weight:700;">✏️ Nouvelle question</p>
      <textarea id="forum-new-q" placeholder="Écris ta question ici..." style="width:100%; min-height:70px; margin-top:8px; padding:10px; border:1px solid var(--line); border-radius:8px; font-family:'Inter',sans-serif; font-size:14px;"></textarea>
      <button class="rec-btn" style="margin-top:8px;" onclick="postForumQuestion()">Publier ma question</button>
    </div>
    <h2 class="section-title">Questions du groupe</h2>
    <div id="forum-body"><p class="teacher-empty">Chargement…</p></div>
  `;
  loadForum();
}
function renderForumBody(){
  const body = document.getElementById('forum-body');
  if(!body) return;
  if(forumData.length===0){ body.innerHTML = '<p class="teacher-empty">Pas encore de question — sois le premier à en poser une !</p>'; return; }
  body.innerHTML = forumData.map(q=>{
    const replies = (q.replies || []).map(r => `
      <div class="forum-reply ${r.isTeacher ? 'forum-reply-teacher' : ''}">
        <b>${r.authorName}${r.isTeacher ? ' <span class="admin-pill" style="margin-left:4px;">Professeure</span>' : ''}</b>
        <p>${r.text}</p>
      </div>
    `).join('');
    return `
      <div class="forum-thread">
        <div class="forum-q">
          <b>${q.authorName}${q.isTeacherAuthor ? ' <span class="admin-pill" style="margin-left:4px;">Professeure</span>' : ''}</b>
          <p>${q.question}</p>
        </div>
        ${replies ? `<div class="forum-replies">${replies}</div>` : ''}
        ${forumOpenReplyId === q.id ? `
          <div style="margin-top:8px;">
            <textarea id="forum-reply-${q.id}" placeholder="Ta réponse..." style="width:100%; min-height:50px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;"></textarea>
            <button class="rec-btn" style="margin-top:6px;" onclick="postForumReply('${q.id}')">Envoyer</button>
            <button onclick="toggleForumReply('${q.id}')" style="background:none; color:var(--grey); margin-left:8px;">Annuler</button>
          </div>
        ` : `<button onclick="toggleForumReply('${q.id}')" style="background:none; color:var(--accent-2, #6f42c1); font-weight:700; margin-top:6px;">↩ Répondre</button>`}
      </div>
    `;
  }).join('');
}
function toggleForumReply(id){
  forumOpenReplyId = (forumOpenReplyId === id) ? null : id;
  renderForumBody();
}
async function postForumQuestion(){
  const ta = document.getElementById('forum-new-q');
  const text = ta.value.trim();
  if(!text) return;
  try{
    await db.collection('forum').add({
      question: text, authorName: `${student.prenom} ${student.nom}`, authorUid: student.uid,
      isTeacherAuthor: isTeacher, replies: [], ts: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){ alert("Impossible de publier ta question pour le moment."); return; }
  await loadForum();
}
async function postForumReply(id){
  const ta = document.getElementById('forum-reply-'+id);
  const text = ta.value.trim();
  if(!text) return;
  const q = forumData.find(x=>x.id===id);
  const replies = (q && q.replies) ? [...q.replies] : [];
  replies.push({ text, authorName: `${student.prenom} ${student.nom}`, isTeacher: isTeacher, ts: new Date().toISOString() });
  try{
    await db.collection('forum').doc(id).update({ replies });
    forumOpenReplyId = null;
  }catch(e){ alert("Impossible d'envoyer la réponse pour le moment."); return; }
  await loadForum();
}

function renderDossiers(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <p class="eyebrow">Niveau ${niveau}</p>
    <h1 class="page-title">Dossiers du niveau ${niveau}</h1>
    <div id="next-course-banner"></div>
    <div class="objectif-box">
      <p class="fr">Le niveau ${niveau} comptera <b>9 dossiers</b> au total. Pour l'instant, le <b>Dossier 0</b> est disponible — les suivants arriveront au fur et à mesure. Chaque dossier est découpé en <b>5 unités</b> ; tu avances à ton rythme, que tu aies 1, 2, 3, 4 ou 5 séances par semaine avec ta professeure. Avec 4 séances/semaine par exemple, tu peux terminer tout le dossier en un peu plus d'une semaine — ce n'est jamais bloqué sur 5 semaines.</p>
      <p class="pt">🇧🇷 O nível ${niveau} terá 9 módulos ao todo. Por enquanto, o Módulo 0 está disponível — os próximos chegarão aos poucos. Cada módulo tem <b>5 unidades</b>; você avança no seu próprio ritmo, tenha 1, 2, 3, 4 ou 5 aulas por semana. Com 4 aulas/semana, por exemplo, dá para terminar o módulo em pouco mais de uma semana — nunca é travado em 5 semanas.</p>
    </div>
    <div class="dossier-grid" id="dossier-grid"></div>
  `;
  loadNextCourseBanner();
  const grid = document.getElementById('dossier-grid');
  dossiersMenu.forEach(d=>{
    const isOpen = d.open && niveau === 'A1';
    const el = document.createElement('div');
    el.className = 'dossier-card ' + (isOpen ? 'open' : 'locked');
    let statusText = isOpen ? '● Disponible' : '🔒 Bientôt disponible';
    if(isOpen && student.uniteCourante){
      const w = weeks.find(x=>x.tag===student.uniteCourante);
      if(w) statusText = `↻ Reprendre — Unité ${w.id}/5`;
    }
    el.innerHTML = `
      <div><div class="num">${d.num}</div><div class="name">${d.name}</div></div>
      <div class="status">${statusText}</div>
    `;
    if(isOpen){
      el.onclick = ()=>{
        const w = weeks.find(x=>x.tag===student.uniteCourante);
        goWeek(w ? w.id : 1);
      };
    }
    grid.appendChild(el);
  });
}
