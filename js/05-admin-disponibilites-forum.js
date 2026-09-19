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
    try{
      await db.collection('disponibilites').doc(slot.id).update({ definitivelyCancelled: true, cancelledBy: by });
    }catch(e){ /* non bloquant */ }

    if(by === 'teacher'){
      result.refundDue = true;
      try{
        await db.collection('eleves').doc(studentId).update({ refundDue: true });
      }catch(e){ /* non bloquant */ }
    }
  } else {
    try{
      await db.collection('disponibilites').doc(slot.id).update({
        reservedBy: null,
        reservedName: null,
        reservedEmail: null,
        zoomJoinUrl: null
      });

      if(slot.isPack){
        const pack = studentDoc.pack || {};
        await db.collection('eleves').doc(studentId).update({
          'pack.used': Math.max(0, (pack.used||0) - 1)
        });
      }
    }catch(e){ /* non bloquant */ }
  }

  return result;
}

async function annulerReservation(id){
  if(!confirm('Annuler cette réservation ?')) return;

  const slot = dispoData.find(s=>s.id===id) || {
    id,
    date: null,
    reservedBy: student.uid,
    isPack:false
  };

  try{
    const r = await processCancellation(slot, 'student');

    if(r.excessive){
      alert("Tu as déjà annulé ou manqué 2 cours à moins d'une heure du début au cours des 30 derniers jours. Cette séance est donc définitivement perdue — contacte ta professeure si besoin.");
    }
  }catch(e){
    alert("Impossible d'annuler pour le moment.");
    return;
  }

  try{
    await notifyTeacherOfCancellation(
      `${student.prenom} ${student.nom}`,
      fmtSlotDate(slot.date)
    );
  }catch(e){ /* non bloquant */ }

  await postSystemMessage(
    student.uid,
    `${student.prenom} ${student.nom}`,
    `❌ J'ai annulé mon cours du ${fmtSlotDate(slot.date)}.`,
    false
  );

  await loadDispoEleve();
  if(document.getElementById('next-course-banner')) await loadNextCourseBanner();
}


/* ---- Bannière "prochain cours" affichée sur la page d'accueil (dossiers) ---- */
async function loadNextCourseBanner(){
  const el = document.getElementById('next-course-banner');
  if(!el || isTeacher || !student.uid) return;

  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    const now = Date.now();

    const mine = snap.docs
      .map(d=>({id:d.id, ...d.data()}))
      .filter(s =>
        s.reservedBy === student.uid &&
        !s.experimentalCancelled &&
        new Date(s.date).getTime() >= now - 3600000
      )
      .sort((a,b)=> new Date(a.date) - new Date(b.date));

    if(mine.length===0){
      el.innerHTML = '';
      return;
    }

    const s = mine[0];
    /* Pour un cours expérimental, l'annulation/replanification par l'élève est
       possible jusqu'à 24h avant le cours (pas 1h comme pour les cours
       classiques) — règle confirmée par Melissa. */
    const canModify = s.isExperimental
      ? (new Date(s.date).getTime() - now) > 24*3600000
      : (new Date(s.date).getTime() - now) > 3600000;
    const pendingFromTeacher = s.rescheduleRequest && s.rescheduleRequest.by==='teacher' && s.rescheduleRequest.status==='pending';
    const pendingFromMe = s.rescheduleRequest && s.rescheduleRequest.by==='student' && s.rescheduleRequest.status==='pending';
    const cancelFn = s.isExperimental ? 'cancelExperimentalTrial' : 'annulerReservation';

    el.innerHTML = `
      <div class="slot-card slot-mine" style="margin-bottom:18px;">
        <div class="slot-date">
          🎥 Ton prochain cours : ${fmtSlotDate(s.date)}
          <span class="slot-dur">(${s.duree} min)</span>
        </div>

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
        ${canModify ? `<button class="rec-btn" style="background:none; color:var(--bad); margin-top:8px; margin-left:10px;" onclick="${cancelFn}('${s.id}')">Annuler ${s.isExperimental ? 'mon cours expérimental' : 'ma réservation'}</button>` : ''}
        ${canModify && !pendingFromMe && !pendingFromTeacher ? `<button class="rec-btn" style="background:none; color:var(--navy); margin-top:8px; margin-left:10px;" onclick="toggleStudentReschedule('${s.id}')">${studentRescheduleId===s.id ? "Fermer" : "🔁 Demander une replanification"}</button>` : ''}
        ${!canModify ? `<p style="font-size:11.5px; color:var(--grey); margin-top:6px;">${s.isExperimental ? 'Annulation ou demande de replanification possible jusqu\'à 24h avant le cours seulement — contacte ta professeure directement en dessous de ce délai.' : "Annulation ou demande de replanification possible jusqu'à 1h avant le cours seulement."}</p>` : ''}
        ${studentRescheduleId===s.id ? studentRescheduleFormHTML(s) : ''}
      </div>
    `;
  }catch(e){
    el.innerHTML = '';
  }
}

/* Bannière "payer mon forfait" — student.pack est déjà en mémoire (chargé à la
   connexion), donc pas besoin d'appel Firestore ici. 5 liens (un par moyen de
   paiement), comme pour un cours à l'unité (voir paymentOptionsHTML). */
function renderPackPaymentBanner(){
  const el = document.getElementById('pack-payment-banner');
  if(!el || isTeacher || !student.uid) return;
  const pack = student.pack || {};
  const links = pack.paymentLinks || {};
  const flow = paymentFlowHTML('pack', links);
  if(!flow || pack.paymentStatus === 'paid'){
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `
    <div class="storage-note" style="background:#FFF7E6; margin-bottom:18px;">
      💳 <b>Ton forfait est prêt !</b> Choisis ton mode de paiement pour l'activer :
      ${flow}
      <div style="margin-top:10px;">
        <label style="font-size:12px; font-weight:700; color:var(--navy); display:block;">CPF sur la nota fiscal (facultatif)</label>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <input type="text" id="cpf-pack" value="${pack.cpfNaNota||''}" placeholder="000.000.000-00" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:6px;">
          <button onclick="saveCpfNaNotaPack()">Enregistrer</button>
        </div>
        <p id="cpf-pack-fb" style="font-size:11px; color:var(--ok); display:none; margin-top:4px;">✅ Enregistré</p>
      </div>
      <p style="font-size:11.5px; color:var(--grey); margin-top:8px;">Ta professeure validera ton paiement dès qu'elle le recevra.</p>
    </div>
  `;
}
async function saveCpfNaNotaPack(){
  const el = document.getElementById('cpf-pack');
  const val = el ? el.value.trim() : '';
  try{ await db.collection('eleves').doc(student.uid).update({ 'pack.cpfNaNota': val }); }
  catch(e){ alert("Impossible d'enregistrer pour le moment."); return; }
  student.pack = student.pack || {};
  student.pack.cpfNaNota = val;
  const fb = document.getElementById('cpf-pack-fb');
  if(fb) fb.style.display = 'block';
}


/* ---- Admin : gérer les disponibilités ---- */
let adminCalDate = new Date();
let adminSelectedDay = null;

function selectAdminDayNav(delta){
  adminCalDate = new Date(
    adminCalDate.getFullYear(),
    adminCalDate.getMonth()+delta,
    1
  );
  renderAdminDispo();
}

function selectAdminDay(key){
  adminSelectedDay = (adminSelectedDay === key) ? null : key;
  renderAdminDispo();
}

async function loadAdminDispo(){
  const body = document.getElementById('teacher-body');

  if(body){
    body.innerHTML = '<p class="teacher-empty">Chargement…</p>';
  }

  try{
    const snap = await db.collection('disponibilites').orderBy('date').get();
    dispoData = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){
    dispoData = [];
  }

  if(studentsData.length===0){
    await loadTeacherStudentsQuiet();
  }

  await loadPaymentLinks();

  renderAdminDispo();
}

let adminRescheduleFormOpenId = null;
let paymentLinksEditorOpen = false;

function togglePaymentLinksEditor(){
  paymentLinksEditorOpen = !paymentLinksEditorOpen;
  renderAdminDispo();
}

/* Éditeur des 5 liens de paiement C6 Bank, modifiable depuis l'app (voir
   loadPaymentLinks dans 04-reservation-cours.js) — ce sont des liens à usage
   unique côté C6, donc appelés à changer régulièrement ; Melissa n'a jamais
   besoin de toucher au code pour les mettre à jour. */
function paymentLinksEditorHTML(){
  return `
    <div class="rec-box" style="margin-bottom:16px;">
      <p class="rec-consigne" style="font-weight:700;">💳 Liens de paiement (C6 Bank)</p>
      <p style="font-size:12px; color:var(--grey); margin:2px 0 10px;">Ce sont ces liens que tes élèves classiques voient pour payer un cours réservé. Mets-les à jour ici si un lien change ou expire.</p>
      ${PAYMENT_METHODS.map(f=>`
        <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:8px;">
          ${f.label}
          <input type="url" id="paylink-${f.key}" value="${paymentLinks[f.key]||''}" placeholder="https://api-gateway.c6bank.info/..." style="width:100%; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:7px;">
        </label>
      `).join('')}
      <div class="teacher-entry-actions" style="margin-top:10px;">
        <button onclick="savePaymentLinks()">Enregistrer les liens</button>
        <button onclick="togglePaymentLinksEditor()" style="background:none; color:var(--grey);">Fermer</button>
      </div>
      <p class="exo-feedback ok" id="paylinks-fb" style="display:none; color:var(--ok); margin-top:6px;">✅ Liens enregistrés.</p>
    </div>
  `;
}
async function savePaymentLinks(){
  const updates = {};
  PAYMENT_METHODS.forEach(f=>{
    const el = document.getElementById('paylink-'+f.key);
    updates[f.key] = el ? el.value.trim() : '';
  });
  try{
    await db.collection('config').doc('paiement').set(updates, {merge:true});
  }catch(e){
    console.error('savePaymentLinks a échoué :', e);
    alert("Impossible d'enregistrer les liens pour le moment. Détail dans la console (F12) : " + (e && e.message ? e.message : e));
    return;
  }
  paymentLinks = {...paymentLinks, ...updates};
  const fb = document.getElementById('paylinks-fb');
  if(fb){ fb.style.display = 'block'; }
}

/* Marque manuellement un cours comme payé — Melissa clique dessus une fois
   qu'elle a reçu l'e-mail de confirmation C6 Bank (Pix reçu, débit ou crédit
   approuvé). Rien n'est automatique : le paiement se passe hors de l'app. */
async function markPaymentReceived(id){
  const slot = dispoData.find(s=>s.id===id);
  try{
    await db.collection('disponibilites').doc(id).update({
      paymentStatus: 'paid',
      paymentConfirmedAt: new Date().toISOString()
    });
  }catch(e){
    alert("Impossible d'enregistrer pour le moment.");
    return;
  }
  if(slot && slot.reservedEmail){
    try{
      await callDriveScript({
        action: 'notifyPaymentReceived',
        email: slot.reservedEmail,
        prenom: (slot.reservedName || '').split(' ')[0] || slot.reservedName,
        context: `ton cours du ${fmtSlotDate(slot.date)}`
      });
    }catch(e){ /* non bloquant */ }
  }
  await loadAdminDispo();
}

/* Envoi de la nota fiscal (téléversée par Melissa depuis son logiciel de
   facturation) : upload sur son Drive (même mécanisme que les enregistrements),
   puis e-mail automatique à l'élève avec le lien. */
async function sendNotaFiscal(id, inputElId){
  const input = document.getElementById(inputElId);
  const file = input && input.files && input.files[0];
  if(!file){ alert('Choisis d\'abord le fichier de la nota fiscal.'); return; }
  const slot = dispoData.find(s=>s.id===id);
  let base64;
  try{ base64 = await fileToBase64(file); }
  catch(e){ alert("Impossible de lire le fichier."); return; }
  let uploadResult;
  try{
    uploadResult = await callDriveScript({
      action: 'upload',
      fileName: `nota-fiscal-${(slot && slot.reservedName) || 'eleve'}-${id}.pdf`,
      mimeType: file.type || 'application/pdf',
      base64
    });
  }catch(e){ alert("Impossible de téléverser la nota fiscale pour le moment."); return; }
  if(!uploadResult || !uploadResult.ok){ alert("Le téléversement a échoué."); return; }
  try{
    await db.collection('disponibilites').doc(id).update({
      notaFiscalUrl: uploadResult.viewUrl,
      notaFiscalSent: true,
      notaFiscalSentAt: new Date().toISOString()
    });
  }catch(e){ alert("Impossible d'enregistrer pour le moment."); return; }
  if(slot && slot.reservedEmail){
    try{
      await callDriveScript({
        action: 'notifyNotaFiscal',
        email: slot.reservedEmail,
        prenom: (slot.reservedName || '').split(' ')[0] || slot.reservedName,
        notaFiscalUrl: uploadResult.viewUrl
      });
    }catch(e){ /* non bloquant */ }
  }
  await loadAdminDispo();
}

function toggleAdminRescheduleForm(id){
  adminRescheduleFormOpenId =
    (adminRescheduleFormOpenId === id) ? null : id;

  renderAdminDispo();
}

function adminRescheduleFormHTML(s){
  return `
    <div class="rec-box" style="margin-top:10px;">
      <p class="rec-consigne" style="font-weight:700;">
        🔁 Demander une replanification à ${s.reservedName || "l'élève"}
      </p>

      <p style="font-size:12.5px; color:var(--grey);">
        Propose un nouveau créneau. L'élève devra l'accepter ou le refuser dans son espace.
      </p>

      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:8px;">
        Nouvelle date et heure

        <input
          type="datetime-local"
          id="admin-reschedule-date-${s.id}"
          oninput="previewTZ('admin-reschedule-date-${s.id}','admin-reschedule-tz-${s.id}')"
          style="display:block; width:100%; box-sizing:border-box; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;"
        >
      </label>

      <div id="admin-reschedule-tz-${s.id}"></div>

      <div class="teacher-entry-actions" style="margin-top:8px;">
        <button onclick="submitAdminRescheduleRequest('${s.id}')">
          Envoyer la demande
        </button>

        <button
          onclick="toggleAdminRescheduleForm('${s.id}')"
          style="background:none; color:var(--grey);"
        >
          Fermer
        </button>
      </div>
    </div>
  `;
}

async function submitAdminRescheduleRequest(id){
  const slot = dispoData.find(s=>s.id===id);
  const input = document.getElementById('admin-reschedule-date-'+id);

  if(!slot || !input || !input.value){
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

  alert(
    "Demande envoyée à l'élève. Le cours actuel reste réservé jusqu'à sa réponse."
  );

  await postSystemMessage(
    slot.reservedBy,
    slot.reservedName,
    `📅 Je te propose de déplacer ton cours du ${fmtSlotDate(slot.date)} au ${fmtSlotDate(proposedDate)}. Va dans « Réserver un cours » pour confirmer ou refuser.`,
    true
  );

  await loadAdminDispo();
}


/* ---- Récurrence par jours de la semaine (créneaux + forfaits) ---- */
const WEEKDAYS_FR = [
  {value:1, label:'Lun'},
  {value:2, label:'Mar'},
  {value:3, label:'Mer'},
  {value:4, label:'Jeu'},
  {value:5, label:'Ven'},
  {value:6, label:'Sam'},
  {value:0, label:'Dim'}
];

function weekdayPickerHTML(prefix){
  return `
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      ${
        WEEKDAYS_FR.map(d => `
          <div style="display:flex; align-items:center; gap:4px; font-size:12.5px; background:#fff; border:1px solid var(--line); border-radius:6px; padding:5px 8px;">
            <label style="display:flex; align-items:center; gap:4px;">
              <input
                type="checkbox"
                id="${prefix}-day-${d.value}"
                onchange="toggleDayTime('${prefix}',${d.value})"
              >
              ${d.label}
            </label>

            <input
              type="time"
              id="${prefix}-time-${d.value}"
              placeholder="de"
              style="display:none; width:80px; padding:3px 4px; border:1px solid var(--line); border-radius:4px;"
              onchange="refreshRecurrencePreview('${prefix}')"
            >

            <span
              id="${prefix}-sep-${d.value}"
              style="display:none; color:var(--grey);"
            >
              à
            </span>

            <input
              type="time"
              id="${prefix}-timeend-${d.value}"
              placeholder="à (optionnel)"
              title="Heure de fin, seulement si tu veux plusieurs créneaux à la suite (demi-journée)"
              style="display:none; width:80px; padding:3px 4px; border:1px solid var(--line); border-radius:4px;"
              onchange="refreshRecurrencePreview('${prefix}')"
            >
          </div>
        `).join('')
      }
    </div>
  `;
}

function toggleDayTime(prefix, value){
  const chk = document.getElementById(`${prefix}-day-${value}`);
  const time = document.getElementById(`${prefix}-time-${value}`);
  const sep = document.getElementById(`${prefix}-sep-${value}`);
  const timeEnd = document.getElementById(`${prefix}-timeend-${value}`);

  if(!chk || !time) return;

  const show = chk.checked ? 'inline-block' : 'none';

  time.style.display = show;

  if(sep){
    sep.style.display = chk.checked ? 'inline' : 'none';
  }

  if(timeEnd){
    timeEnd.style.display = show;
  }

  if(!chk.checked){
    time.value = '';

    if(timeEnd){
      timeEnd.value = '';
    }
  }

  refreshRecurrencePreview(prefix);
}

function readSelectedDayTimes(prefix){
  const out = [];

  WEEKDAYS_FR.forEach(d=>{
    const chk = document.getElementById(`${prefix}-day-${d.value}`);
    const time = document.getElementById(`${prefix}-time-${d.value}`);
    const timeEnd = document.getElementById(`${prefix}-timeend-${d.value}`);

    if(chk && chk.checked && time && time.value){
      out.push({
        weekday: d.value,
        time: time.value,
        timeEnd: (timeEnd && timeEnd.value) || null
      });
    }
  });

  return out;
}

function expandDayTimes(dayTimes, dureeMinutes){
  const expanded = [];

  dayTimes.forEach(dt=>{
    if(dt.timeEnd){
      const [sh,sm] = dt.time.split(':').map(Number);
      const [eh,em] = dt.timeEnd.split(':').map(Number);

      let startMin = sh*60+sm;
      let endMin = eh*60+em;

      if(endMin <= startMin){
        endMin += 24*60;
      }

      while(startMin + dureeMinutes <= endMin){
        const dayOffset = Math.floor(startMin / (24*60));
        const minOfDay = startMin % (24*60);

        const hh = String(
          Math.floor(minOfDay/60)
        ).padStart(2,'0');

        const mm = String(
          minOfDay%60
        ).padStart(2,'0');

        expanded.push({
          weekday: dt.weekday,
          time: `${hh}:${mm}`,
          dayOffset
        });

        startMin += dureeMinutes;
      }
    }else{
      expanded.push({
        weekday: dt.weekday,
        time: dt.time,
        dayOffset: 0
      });
    }
  });

  return expanded;
}

function nextOccurrence(startDateStr, weekday, timeStr){
  const [h,m] = timeStr.split(':').map(Number);

  const d = new Date(startDateStr+'T00:00:00');

  const diff =
    (weekday - d.getDay() + 7) % 7;

  d.setDate(
    d.getDate() + diff
  );

  d.setHours(
    h,
    m,
    0,
    0
  );

  return d;
}

function generateWeeklyDates(
  startDateStr,
  dayTimes,
  weeks,
  dureeMinutes
){
  const expanded =
    expandDayTimes(
      dayTimes,
      dureeMinutes || 45
    );

  const dates = [];

  expanded.forEach(dt=>{
    const base =
      nextOccurrence(
        startDateStr,
        dt.weekday,
        dt.time
      );

    base.setDate(
      base.getDate() + (dt.dayOffset||0)
    );

    for(let w=0; w<weeks; w++){
      dates.push(
        new Date(
          base.getTime() +
          w*7*24*3600*1000
        )
      );
    }
  });

  dates.sort((a,b)=>a-b);

  return dates;
}

function generateCountDates(
  startDateStr,
  dayTimes,
  count,
  dureeMinutes
){
  const expanded =
    expandDayTimes(
      dayTimes,
      dureeMinutes || 45
    );

  if(expanded.length===0){
    return [];
  }

  const next = expanded.map(dt=>{
    const base =
      nextOccurrence(
        startDateStr,
        dt.weekday,
        dt.time
      );

    base.setDate(
      base.getDate() + (dt.dayOffset||0)
    );

    return base;
  });

  const out = [];

  while(out.length < count){
    let minIdx = 0;

    for(let i=1;i<next.length;i++){
      if(next[i] < next[minIdx]){
        minIdx = i;
      }
    }

    out.push(
      new Date(next[minIdx])
    );

    next[minIdx] =
      new Date(
        next[minIdx].getTime() +
        7*24*3600*1000
      );
  }

  return out;
}

function refreshRecurrencePreview(prefix){
  const previewEl =
    document.getElementById(
      prefix+'-preview'
    );

  if(!previewEl){
    return;
  }

  const dayTimes =
    readSelectedDayTimes(prefix);

  let dates = [];

  if(prefix==='dispo'){
    const startVal =
      document.getElementById('dispo-start')?.value;

    const weeks =
      Math.max(
        1,
        parseInt(
          document.getElementById('dispo-weeks')?.value,
          10
        ) || 1
      );

    const duree =
      parseInt(
        document.getElementById('dispo-duree')?.value,
        10
      ) || 45;

    if(startVal && dayTimes.length){
      dates =
        generateWeeklyDates(
          startVal,
          dayTimes,
          weeks,
          duree
        );
    }
  }else if(prefix==='pack'){
    const startVal =
      document.getElementById('pack-quick-start')?.value;

    const count =
      Math.max(
        1,
        Math.min(
          FORFAIT_MAX,
          parseInt(
            document.getElementById('pack-quick-count')?.value,
            10
          ) || 1
        )
      );

    const duree =
      parseInt(
        document.getElementById('pack-duree')?.value,
        10
      ) || 45;

    if(startVal && dayTimes.length){
      dates =
        generateCountDates(
          startVal,
          dayTimes,
          count,
          duree
        );
    }
  }

  if(!dates.length){
    previewEl.innerHTML = '';
    return;
  }

  previewEl.innerHTML = `
    <div style="font-size:11.5px; color:var(--grey); margin-top:6px; max-height:120px; overflow-y:auto;">
      📋 ${dates.length} date(s) :
      ${dates.map(d=>fmtSlotDate(d.toISOString())).join(' · ')}
    </div>
  `;
}
function renderAdminDispo(){
  const body = document.getElementById('teacher-body');
  if(!body) return;

  const now = Date.now();

  let upcoming = dispoData.filter(
    s => new Date(s.date).getTime() >= now - 3600000
  );

  const markers = {};

  upcoming.forEach(s=>{
    markers[toDateKey(new Date(s.date))] = {
      color: s.reservedBy ? '#e08a1e' : '#06a77d'
    };
  });

  const studentOptions = studentsData.map(s=>`
    <option value="${s.id}|${s.prenom} ${s.nom}|${s.email||''}">
      ${s.prenom} ${s.nom}${s.niveau ? ' · '+s.niveau : ''}
    </option>
  `).join('');

  const packStudentOptions = studentsData.map(s=>{
    const pack = s.pack || {};
    const remaining = (pack.total||0) - (pack.used||0);

    return `
      <option value="${s.id}|${s.prenom} ${s.nom}|${s.email||''}">
        ${s.prenom} ${s.nom}${s.niveau ? ' · '+s.niveau : ''}
        — forfait ${
          pack.total
            ? `${pack.used||0}/${pack.total} (${remaining} restante${remaining>1?'s':''})`
            : 'non défini'
        }
      </option>
    `;
  }).join('');

  const packRows =
    Array.from(
      {length: FORFAIT_MAX},
      (_,i)=>i+1
    ).map(i => `
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
        <span style="font-size:12px; color:var(--grey); width:22px;">
          ${i}.
        </span>

        <input
          type="datetime-local"
          id="pack-date-${i}"
          oninput="previewTZ('pack-date-${i}','pack-tz-${i}'); updatePackPriceHint();"
          style="padding:6px 8px; border:1px solid var(--line); border-radius:6px;"
        >

        <div
          id="pack-tz-${i}"
          style="font-size:11.5px; color:var(--grey);"
        ></div>
      </div>
    `).join('');

  const pendingFromStudents =
    dispoData.filter(
      s =>
        s.rescheduleRequest &&
        s.rescheduleRequest.by==='student' &&
        s.rescheduleRequest.status==='pending'
    );

  const pendingHTML =
    pendingFromStudents.length
      ? `
        <div class="rec-box" style="border-color:#8338ec;">
          <p class="rec-consigne" style="font-weight:700;">
            📅 Demandes de replanification des élèves
          </p>

          ${
            pendingFromStudents.map(s=>{
              const r = s.rescheduleRequest || {};

              const avails = [
                r.availability1,
                r.availability2,
                r.availability3
              ].filter(Boolean);

              return `
                <div class="teacher-entry">
                  <div class="who">
                    ${s.reservedName}
                    — cours actuel :
                    ${fmtSlotDate(s.date)}
                  </div>

                  ${
                    avails.length
                      ? `
                        <div class="meta" style="margin-top:7px;">
                          <b>Disponibilités proposées :</b>

                          ${
                            avails.map((d,i)=>`
                              <div style="margin-top:6px;">
                                ${i+1}. ${fmtSlotDate(d)}

                                <button
                                  class="rec-btn"
                                  style="margin-left:8px;"
                                  onclick="acceptStudentAvailability('${s.id}','${d}')"
                                >
                                  Accepter
                                </button>
                              </div>
                            `).join('')
                          }
                        </div>
                      `
                      : `
                        <div class="meta">
                          ${
                            r.proposedDate
                              ? `Propose : <b>${fmtSlotDate(r.proposedDate)}</b>`
                              : "Demande un changement d'horaire."
                          }
                        </div>

                        <div class="teacher-entry-actions">
                          ${
                            r.proposedDate
                              ? `<button onclick="acceptStudentReschedule('${s.id}')">Accepter</button>`
                              : ''
                          }
                        </div>
                      `
                  }

                  <div
                    class="teacher-entry-actions"
                    style="margin-top:8px;"
                  >
                    <button
                      onclick="toggleAdminRescheduleForm('${s.id}')"
                      style="background:none; color:var(--navy);"
                    >
                      Proposer un autre créneau
                    </button>

                    <button
                      onclick="rejectStudentReschedule('${s.id}')"
                      style="background:none; color:var(--bad);"
                    >
                      Refuser
                    </button>
                  </div>

                  ${
                    adminRescheduleFormOpenId === s.id
                      ? adminRescheduleFormHTML(s)
                      : ''
                  }
                </div>
              `;
            }).join('')
          }
        </div>
      `
      : '';

  body.innerHTML = `
    <div class="teacher-entry-actions" style="margin-bottom:10px;">
      <button onclick="togglePaymentLinksEditor()">${paymentLinksEditorOpen ? 'Fermer' : '💳 Liens de paiement'}</button>
    </div>
    ${paymentLinksEditorOpen ? paymentLinksEditorHTML() : ''}

    ${pendingHTML}

    <div class="rec-box">
      <p class="rec-consigne" style="font-weight:700;">
        ➕ Ajouter un créneau
      </p>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-top:10px;">
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          À partir du

          <input
            type="date"
            id="dispo-start"
            onchange="refreshRecurrencePreview('dispo')"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;"
          >
        </label>

        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          Durée (minutes)

          <input
            type="number"
            id="dispo-duree"
            value="45"
            min="15"
            step="5"
            onchange="refreshRecurrencePreview('dispo')"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:100px;"
          >
        </label>

        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          Nombre de semaines

          <input
            type="number"
            id="dispo-weeks"
            value="1"
            min="1"
            max="26"
            onchange="refreshRecurrencePreview('dispo')"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:90px;"
          >
        </label>

        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          Réserver directement pour (optionnel)

          <select
            id="dispo-eleve"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; min-width:180px;"
          >
            <option value="">
              — Laisser libre —
            </option>

            ${studentOptions}
          </select>
        </label>
      </div>

      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:12px;">
        Jours de la semaine — une heure précise, ou une plage « de / à » pour une demi-journée de créneaux à la suite
      </label>

      <div style="margin-top:6px;">
        ${weekdayPickerHTML('dispo')}
      </div>

      <div id="dispo-preview"></div>

      <button
        class="rec-btn"
        style="margin-top:12px;"
        onclick="addDisponibilite()"
      >
        Créer le(s) créneau(x)
      </button>

      <p style="font-size:12px; color:var(--grey); margin:8px 0 0;">
        💡 Une heure de « à » optionnelle : par ex. Lundi de 9h à 13h avec des cours de 45 min → 5 créneaux à la suite ce jour-là. Ajoute « Nombre de semaines » pour répéter tout ça sur plusieurs semaines. En général jusqu'à 4 jours par semaine, exceptionnellement 6.
      </p>
    </div>

    <div class="rec-box" style="margin-top:16px;">
      <p class="rec-consigne" style="font-weight:700;">
        📦 Réserver un forfait (plusieurs dates, un seul élève)
      </p>

      <p style="font-size:12.5px; color:var(--grey); margin:4px 0 10px;">
        Ces séances sont réservées directement pour l'élève — il ne les choisit pas lui-même dans la liste des créneaux libres. Laisse vides les dates que tu n'utilises pas.
      </p>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:12px;">
        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          Élève

          <select
            id="pack-eleve"
            onchange="prefillPackCount()"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; min-width:260px;"
          >
            <option value="">
              — Choisir un élève —
            </option>

            ${packStudentOptions}
          </select>
        </label>

        <label style="font-size:12.5px; font-weight:700; color:var(--navy);">
          Durée par séance (minutes)

          <input
            type="number"
            id="pack-duree"
            value="45"
            min="15"
            step="5"
            onchange="refreshRecurrencePreview('pack')"
            style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px; width:100px;"
          >
        </label>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin-bottom:12px; background:var(--cream); border:1px solid var(--line); border-radius:8px; padding:10px 12px;">
        <label style="font-size:12px; font-weight:700; color:var(--navy);">
          ⚡ Remplissage rapide — à partir du

          <input
            type="date"
            id="pack-quick-start"
            onchange="refreshRecurrencePreview('pack')"
            style="display:block; margin-top:4px; padding:6px 8px; border:1px solid var(--line); border-radius:6px;"
          >
        </label>

        <label style="font-size:12px; font-weight:700; color:var(--navy);">
          Nombre de séances

          <input
            type="number"
            id="pack-quick-count"
            value="1"
            min="1"
            max="${FORFAIT_MAX}"
            onchange="refreshRecurrencePreview('pack')"
            style="display:block; margin-top:4px; padding:6px 8px; border:1px solid var(--line); border-radius:6px; width:70px;"
          >
        </label>
      </div>

      <label style="font-size:12px; font-weight:700; color:var(--navy);">
        Jours de la semaine — une heure précise, ou une plage « de / à » pour une demi-journée
      </label>

      <div style="margin-top:6px;">
        ${weekdayPickerHTML('pack')}
      </div>

      <div id="pack-preview"></div>

      <p style="font-size:11.5px; color:var(--grey); margin:8px 0 10px;">
        Ça pré-remplit les champs ci-dessous, dans l'ordre chronologique en combinant les jours cochés — tu peux ensuite corriger ou vider une date ponctuellement (vacances, jour férié…) avant de créer les séances.
      </p>

      <button
        class="rec-btn"
        onclick="fillPackDatesQuick()"
        type="button"
      >
        Remplir les dates ci-dessous
      </button>

      ${packRows}

      <div style="margin-top:14px; padding-top:12px; border-top:1px dashed var(--line);">
        <div id="pack-price-hint"></div>
        <p style="font-size:12px; font-weight:700; color:var(--navy); margin:8px 0 6px;">💳 Liens de paiement du forfait (l'élève choisira parmi ceux que tu remplis)</p>
        ${PAYMENT_METHODS.map(m=>`
          <label style="font-size:11.5px; color:var(--grey); display:block; margin-top:4px;">
            ${m.label}
            <input type="url" id="pack-paylink-${m.key}" placeholder="https://..." style="width:100%; margin-top:2px; padding:6px 8px; border:1px solid var(--line); border-radius:5px;">
          </label>
        `).join('')}
        <p style="font-size:11px; color:var(--grey); margin-top:6px;">Laisse-les vides si tu préfères les remplir plus tard, dans « Élèves & niveaux » — mais l'élève ne verra rien à payer tant qu'aucun lien n'est renseigné quelque part.</p>
      </div>

      <button
        class="rec-btn"
        style="margin-top:8px;"
        onclick="reserverPack()"
      >
        📦 Créer les séances du forfait
      </button>
    </div>

    <h2 class="section-title">
      Calendrier
    </h2>

    <p style="font-size:12.5px; color:var(--grey); margin:-6px 0 10px;">
      🟢 créneau libre · 🟠 réservé — clique sur un jour pour filtrer la liste
    </p>

    ${
      buildCalendarHTML(
        adminCalDate.getFullYear(),
        adminCalDate.getMonth(),
        markers,
        adminSelectedDay,
        'selectAdminDay'
      )
    }

    <h2 class="section-title">
      Créneaux à venir
      ${
        adminSelectedDay
          ? `
            <button
              onclick="selectAdminDay('${adminSelectedDay}')"
              style="background:none; color:#e08a1e; font-size:12px; font-weight:700; vertical-align:middle;"
            >
              ✕ voir tous les jours
            </button>
          `
          : ''
      }
    </h2>

    <div id="admin-dispo-list"></div>
  `;

  if(adminSelectedDay){
    upcoming = upcoming.filter(
      s =>
        toDateKey(new Date(s.date)) ===
        adminSelectedDay
    );
  }

  const list =
    document.getElementById(
      'admin-dispo-list'
    );

  if(upcoming.length===0){
    list.innerHTML = `
      <p class="teacher-empty">
        ${
          adminSelectedDay
            ? 'Aucun créneau ce jour-là.'
            : 'Aucun créneau à venir. Ajoutes-en un ci-dessus pour que tes élèves puissent réserver.'
        }
      </p>
    `;
  }else{
    list.innerHTML =
      upcoming.map(s=>`
        <div class="teacher-entry">
          <div class="who">
            🗓️ ${fmtSlotDate(s.date)}
            <span style="font-weight:400; color:var(--grey);">
              (${s.duree} min)
            </span>
          </div>

          ${timezoneLineHTML(s.date)}

          <div class="meta">
            ${
              s.reservedBy
                ? `✅ Réservé par <b>${s.reservedName}</b>`
                : '⬜ Libre'
            }
            ${
              s.reservedBy && !s.isExperimental
                ? (s.paymentStatus === 'paid'
                    ? ' · <span style="color:var(--ok);">💳 Payé</span>'
                    : ' · <span style="color:var(--bad);">💳 Paiement en attente</span>')
                : ''
            }
          </div>

          ${
            s.reservedBy
              ? zoomButtonHTML(
                  s.id,
                  s.date,
                  s.duree,
                  s.zoomJoinUrl
                )
              : ''
          }

          <div class="teacher-entry-actions">
            ${
              s.reservedBy && !s.isExperimental && s.paymentStatus !== 'paid'
                ? `
                  <button
                    onclick="markPaymentReceived('${s.id}')"
                    style="background:none; color:var(--ok);"
                  >
                    ✅ Paiement reçu
                  </button>
                `
                : ''
            }
          </div>

          ${
            s.reservedBy && !s.isExperimental && s.paymentStatus === 'paid' && !s.notaFiscalSent
              ? `
                <div class="rec-box" style="margin-top:8px;">
                  <p class="rec-consigne" style="font-weight:700;">📎 Envoyer la nota fiscal</p>
                  ${s.cpfNaNota ? `<p style="font-size:12px; color:var(--grey); margin:2px 0 8px;">CPF demandé sur la note : <b>${s.cpfNaNota}</b></p>` : `<p style="font-size:12px; color:var(--grey); margin:2px 0 8px;">L'élève n'a pas demandé de CPF sur la note.</p>`}
                  <input type="file" id="nota-file-${s.id}" accept="application/pdf,image/*" style="margin-bottom:8px;">
                  <div class="teacher-entry-actions">
                    <button onclick="sendNotaFiscal('${s.id}', 'nota-file-${s.id}')">Téléverser et envoyer</button>
                  </div>
                </div>
              `
              : ''
          }
          ${
            s.notaFiscalSent
              ? `<p style="font-size:12px; color:var(--ok); margin-top:6px;">✅ Nota fiscal envoyée — <a href="${s.notaFiscalUrl}" target="_blank" rel="noopener">voir le fichier</a></p>`
              : ''
          }

          <div class="teacher-entry-actions">
            ${
              s.reservedBy &&
              (new Date(s.date).getTime() - Date.now()) > 3600000 &&
              !(
                s.rescheduleRequest &&
                s.rescheduleRequest.status==='pending'
              )
                ? `
                  <button
                    onclick="toggleAdminRescheduleForm('${s.id}')"
                    style="background:none; color:var(--navy);"
                  >
                    🔁 Demander une replanification
                  </button>
                `
                : ''
            }

            ${
              s.reservedBy &&
              (new Date(s.date).getTime() - Date.now()) > 3600000
                ? `
                  <button
                    onclick="adminCancelReservation('${s.id}')"
                    style="background:none; color:var(--bad);"
                  >
                    Annuler la réservation
                  </button>
                `
                : ''
            }

            <button
              onclick="deleteDisponibilite('${s.id}')"
              style="background:none; color:var(--grey);"
            >
              🗑 Supprimer le créneau
            </button>
          </div>

          ${
            adminRescheduleFormOpenId === s.id
              ? adminRescheduleFormHTML(s)
              : ''
          }

          ${
            s.reservedBy &&
            (new Date(s.date).getTime() - Date.now()) <= 3600000
              ? `
                <p style="font-size:11.5px; color:var(--grey); margin-top:6px;">
                  Annulation ou replanification impossible à moins d'1h du cours.
                </p>
              `
              : ''
          }
        </div>
      `).join('');
  }
}

let openRecapId = null;

function toggleRecap(id){
  openRecapId =
    (openRecapId === id)
      ? null
      : id;

  renderPastSessions();
}

function recapEditorHTML(s, saveFn, toggleFn){
  saveFn = saveFn || 'saveSessionRecap';
  toggleFn = toggleFn || 'toggleRecap';
  return `
    <div class="rec-box" style="margin-top:10px;">
      <p class="rec-consigne" style="font-weight:700;">
        📚 Récap du cours — ${s.reservedName || ''} · ${fmtSlotDate(s.date)}
      </p>

      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">
        Vocabulaire vu pendant ce cours

        <textarea
          id="recap-vocab-${s.id}"
          placeholder="un mot — sa traduction&#10;une expression — son sens..."
          style="width:100%; min-height:90px; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;"
        >${s.vocab || ''}</textarea>
      </label>

      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:10px;">
        Lien de l'enregistrement Zoom (Google Drive, une fois que tu l'as téléversé)

        <input
          type="url"
          id="recap-rec-${s.id}"
          value="${s.recordingUrl || ''}"
          placeholder="https://drive.google.com/..."
          style="width:100%; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:7px;"
        >
      </label>

      <div class="teacher-entry-actions" style="margin-top:10px;">
        <button onclick="${saveFn}('${s.id}')">
          Enregistrer
        </button>

        <button
          onclick="${toggleFn}('${s.id}')"
          style="background:none; color:var(--grey);"
        >
          Fermer
        </button>
      </div>
    </div>
  `;
}

async function saveSessionRecap(id){
  const vocab =
    document.getElementById(
      'recap-vocab-'+id
    ).value.trim();

  const recordingUrl =
    document.getElementById(
      'recap-rec-'+id
    ).value.trim();

  const updates = {
    vocab,
    recordingUrl
  };

  if(vocab && recordingUrl){
    updates.anomalie = false;
  }

  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .update(updates);

    openRecapId = null;
  }catch(e){
    alert(
      "Impossible d'enregistrer pour le moment."
    );
  }

  await loadAdminDispo();
}

function renderPastSessions(){
  const el =
    document.getElementById(
      'admin-past-list'
    );

  if(!el) return;

  const now = Date.now();

  const past =
    dispoData
      .filter(
        s =>
          s.reservedBy &&
          new Date(s.date).getTime() <
            now - 3600000
      )
      .sort(
        (a,b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  if(past.length===0){
    el.innerHTML =
      `<p class="teacher-empty">Aucun cours passé pour le moment.</p>`;
    return;
  }

  el.innerHTML =
    past.map(s => `
      <div class="teacher-entry">
        <div class="who">
          🗓️ ${fmtSlotDate(s.date)}
          <span style="font-weight:400; color:var(--grey);">
            — ${s.reservedName}
          </span>
        </div>

        <div class="meta">
          ${
            s.anomalie
              ? '<b style="color:var(--bad);">⚠️ Anomalie : pas rejoint par les deux</b> · '
              : ''
          }

          ${
            s.isExperimental
              ? ''
              : `
                ${s.vocab ? '✅ Vocabulaire ajouté' : '⬜ Pas encore de vocabulaire'}
                ·
                ${s.recordingUrl ? "🎥 Enregistrement disponible" : "⬜ Pas encore d'enregistrement"}
              `
          }
        </div>

        <div class="teacher-entry-actions">
          ${
            s.anomalie
              ? `
                <button
                  onclick="toggleRescheduleForm('${s.id}')"
                  style="background:none; color:var(--bad);"
                >
                  📅 Proposer un nouveau créneau
                </button>
                <button
                  onclick="dismissAnomalie('${s.id}')"
                  style="background:none; color:var(--ok);"
                  title="À utiliser si vous avez bien rejoint le cours tous les deux — l'anomalie vient alors d'un bug de suivi, pas d'une absence."
                >
                  ✅ On a bien rejoint tous les deux
                </button>
              `
              : ''
          }

          ${
            s.isExperimental
              ? ''
              : `
                <button onclick="toggleRecap('${s.id}')">
                  ${openRecapId===s.id ? 'Fermer' : '📝 Ajouter vocabulaire / enregistrement'}
                </button>
              `
          }
        </div>

        ${
          !s.isExperimental && openRecapId === s.id
            ? recapEditorHTML(s)
            : ''
        }

        ${
          rescheduleFormOpenId === s.id
            ? rescheduleFormHTML(s)
            : ''
        }
      </div>
    `).join('');
}

async function loadTeacherHistorique(){
  const body =
    document.getElementById(
      'teacher-body'
    );

  if(body){
    body.innerHTML =
      '<p class="teacher-empty">Chargement…</p>';
  }

  try{
    const snap =
      await db
        .collection('disponibilites')
        .orderBy('date')
        .get();

    dispoData =
      snap.docs.map(
        d=>({
          id:d.id,
          ...d.data()
        })
      );
  }catch(e){
    dispoData = [];
  }

  detectAnomalies();
  renderTeacherHistorique();
}

function renderTeacherHistorique(){
  const body =
    document.getElementById(
      'teacher-body'
    );

  if(!body) return;

  const anomalies =
    dispoData.filter(
      s =>
        s.anomalie &&
        s.reservedBy
    );

  body.innerHTML = `
    ${
      anomalies.length
        ? `
          <div
            class="storage-note"
            style="background:var(--bad-bg); color:var(--bad);"
          >
            ⚠️ ${anomalies.length} cours en anomalie
            (toi et l'élève n'avez pas tous les deux cliqué sur le lien Zoom)
            — à replanifier ci-dessous.
          </div>
        `
        : ''
    }

    <p style="font-size:12.5px; color:var(--grey); margin:-6px 0 16px;">
      Ajoute le vocabulaire vu et le lien de l'enregistrement
      (téléversé sur ton Drive) pour chaque cours donné.
    </p>

    <div id="admin-past-list"></div>
  `;

  renderPastSessions();
}

async function detectAnomalies(){
  const now = Date.now();

  for(const s of dispoData){
    if(!s.reservedBy) continue;
    if(s.vocab && s.recordingUrl) continue;

    const endsAt =
      new Date(s.date).getTime() +
      (s.duree||45)*60000;

    const isPast =
      now > endsAt + 30*60000;

    const noShow =
      !(s.clickedByStudent && s.clickedByTeacher);

    if(
      isPast &&
      noShow &&
      !s.anomalie &&
      !s.anomalieHandled
    ){
      s.anomalie = true;

      try{
        await db
          .collection('disponibilites')
          .doc(s.id)
          .update({
            anomalie: true
          });
      }catch(e){ /* non bloquant */ }
    }
  }
}

/* Corrige une fausse anomalie : le suivi des clics Zoom repose sur une écriture
   Firestore individuelle par personne (clickedByTeacher / clickedByStudent, voir
   openZoomLink dans 04-reservation-cours.js) qui échoue parfois en silence — le
   plus souvent parce que les règles de sécurité Firestore bloquent l'écriture
   du côté élève sur la collection "disponibilites". Le cours a alors bien eu
   lieu, mais Firestore ne l'a jamais su. Ce bouton permet à la professeure de
   corriger ça manuellement quand elle sait que les deux ont bien rejoint. */
async function dismissAnomalie(id){
  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .update({
        anomalie: false,
        anomalieHandled: true,
        clickedByTeacher: true,
        clickedByStudent: true
      });
  }catch(e){
    alert("Impossible de corriger l'anomalie pour le moment.");
    return;
  }
  await loadTeacherHistorique();
}


/* ---- Replanification (avec confirmation de l'autre partie) ---- */
let rescheduleFormOpenId = null;

function toggleRescheduleForm(id){
  rescheduleFormOpenId =
    (rescheduleFormOpenId === id)
      ? null
      : id;

  renderPastSessions();
}

function rescheduleFormHTML(s, submitFn, toggleFn){
  submitFn = submitFn || 'submitRescheduleProposal';
  toggleFn = toggleFn || 'toggleRescheduleForm';
  return `
    <div class="rec-box" style="margin-top:10px;">
      <p class="rec-consigne" style="font-weight:700;">
        📅 Proposer un nouveau créneau à ${s.reservedName || "l'élève"}
      </p>

      <label style="font-size:12.5px; font-weight:700; color:var(--navy); display:block; margin-top:8px;">
        Nouvelle date et heure

        <input
          type="datetime-local"
          id="reschedule-date-${s.id}"
          oninput="previewTZ('reschedule-date-${s.id}','reschedule-tz-${s.id}')"
          style="display:block; margin-top:4px; padding:8px; border:1px solid var(--line); border-radius:6px;"
        >
      </label>

      <div id="reschedule-tz-${s.id}"></div>

      <div class="teacher-entry-actions" style="margin-top:8px;">
        <button onclick="${submitFn}('${s.id}')">
          Envoyer la proposition
        </button>

        <button
          onclick="${toggleFn}('${s.id}')"
          style="background:none; color:var(--grey);"
        >
          Fermer
        </button>
      </div>
    </div>
  `;
}

async function submitRescheduleProposal(id){
  const val =
    document.getElementById(
      'reschedule-date-'+id
    ).value;

  if(!val){
    alert(
      'Choisis une date et une heure.'
    );
    return;
  }

  const slot =
    dispoData.find(
      s=>s.id===id
    );

  const proposedDate =
    new Date(val).toISOString();

  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .update({
        rescheduleRequest: {
          by:'teacher',
          proposedDate,
          proposedDuree:
            slot ? slot.duree : 45,
          status:'pending'
        }
      });
  }catch(e){
    alert(
      "Impossible d'envoyer la proposition pour le moment."
    );
    return;
  }

  if(slot && slot.reservedEmail){
    try{
      await callDriveScript({
        action:'notifyReschedule',
        to:'student',
        email: slot.reservedEmail,
        name: slot.reservedName,
        oldDate: fmtSlotDate(slot.date),
        newDate: fmtSlotDate(proposedDate)
      });
    }catch(e){ /* non bloquant */ }
  }

  rescheduleFormOpenId = null;

  alert(
    "Proposition envoyée — en attente de confirmation de l'élève (dans son espace ou par mail)."
  );

  await loadTeacherHistorique();
}

/* Variante de submitRescheduleProposal pour un cours expérimental : lit et
   recharge experimentalSlots (pas dispoData / loadTeacherHistorique), pour ne
   pas faire sauter la professeure vers l'onglet Historique par erreur. */
async function toggleExperimentalReschedule(id){
  rescheduleFormOpenId = (rescheduleFormOpenId === id) ? null : id;
  const listEl = document.getElementById('experimental-slots-list');
  if(listEl) listEl.innerHTML = renderExperimentalSlotsHTML();
}
async function submitExperimentalReschedule(id){
  const val = document.getElementById('reschedule-date-'+id).value;
  if(!val){ alert('Choisis une date et une heure.'); return; }
  const slot = experimentalSlots.find(s=>s.id===id);
  const proposedDate = new Date(val).toISOString();
  try{
    await db.collection('disponibilites').doc(id).update({
      rescheduleRequest: { by:'teacher', proposedDate, proposedDuree: slot ? slot.duree : 45, status:'pending' }
    });
  }catch(e){
    alert("Impossible d'envoyer la proposition pour le moment.");
    return;
  }
  if(slot && slot.reservedEmail){
    try{
      await callDriveScript({
        action:'notifyReschedule', to:'student', email: slot.reservedEmail, name: slot.reservedName,
        oldDate: fmtSlotDate(slot.date), newDate: fmtSlotDate(proposedDate)
      });
    }catch(e){ /* non bloquant */ }
  }
  rescheduleFormOpenId = null;
  alert("Proposition envoyée — en attente de confirmation de l'élève (dans son espace ou par mail).");
  await loadExperimentalAdmin();
}

/* Annulation d'un cours expérimental à l'initiative de la professeure — ne vide
   jamais reservedBy/reservedName (voir cancelExperimentalTrial, côté élève, dans
   04-reservation-cours.js, pour la même règle). */
async function cancelExperimentalSlotAdmin(id){
  if(!confirm('Annuler ce cours expérimental ?')) return;
  try{
    await db.collection('disponibilites').doc(id).update({
      experimentalCancelled: true,
      zoomJoinUrl: null
    });
  }catch(e){
    alert("Impossible d'annuler pour le moment.");
    return;
  }
  await loadExperimentalAdmin();
}

async function acceptStudentReschedule(id){
  const slot =
    dispoData.find(
      s=>s.id===id
    );

  if(!slot || !slot.rescheduleRequest){
    return;
  }

  const newDate =
    slot.rescheduleRequest.proposedDate;

  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .update({
        date: newDate,
        rescheduleRequest: null,
        anomalie: false,
        anomalieHandled: true,
        zoomJoinUrl: null
      });
  }catch(e){
    alert(
      "Impossible d'accepter pour le moment."
    );
    return;
  }

  await ensureZoomMeeting(
    id,
    newDate,
    slot.duree,
    slot.reservedName
  );

  await postSystemMessage(
    slot.reservedBy,
    slot.reservedName,
    `✅ J'ai confirmé ton cours au ${fmtSlotDate(newDate)}.`,
    true
  );

  await loadAdminDispo();
}

async function rejectStudentReschedule(id){
  const slot =
    dispoData.find(
      s=>s.id===id
    );

  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .update({
        rescheduleRequest: null
      });
  }catch(e){
    alert(
      "Impossible de refuser pour le moment."
    );
    return;
  }

  if(slot){
    await postSystemMessage(
      slot.reservedBy,
      slot.reservedName,
      `❌ Je ne peux pas déplacer ton cours à l'horaire proposé. Contacte-moi pour qu'on en discute.`,
      true
    );
  }

  await loadAdminDispo();
}

async function addDisponibilite(){
  const startVal =
    document.getElementById(
      'dispo-start'
    ).value;

  const weeks =
    Math.max(
      1,
      parseInt(
        document.getElementById(
          'dispo-weeks'
        ).value,
        10
      ) || 1
    );

  const duree =
    parseInt(
      document.getElementById(
        'dispo-duree'
      ).value,
      10
    ) || 45;

  const eleveVal =
    document.getElementById(
      'dispo-eleve'
    ).value;

  if(!startVal){
    alert(
      'Choisis une date de départ.'
    );
    return;
  }

  const dayTimes =
    readSelectedDayTimes('dispo');

  if(dayTimes.length===0){
    alert(
      'Coche au moins un jour de la semaine et renseigne son heure.'
    );
    return;
  }

  const dates =
    generateWeeklyDates(
      startVal,
      dayTimes,
      weeks,
      duree
    );

  let name = null;

  if(eleveVal){
    [, name] = eleveVal.split('|');
  }

  let created = 0;

  for(const occDate of dates){
    const dateISO =
      occDate.toISOString();

    const slot = {
      date: dateISO,
      duree,
      reservedBy: null,
      reservedName: null,
      reservedEmail: null,
      ts:
        firebase.firestore.FieldValue.serverTimestamp()
    };

    if(eleveVal){
      const [id, nm, email] =
        eleveVal.split('|');

      slot.reservedBy = id;
      slot.reservedName = nm;
      slot.reservedEmail = email;
    }

    try{
      const ref =
        await db
          .collection('disponibilites')
          .add(slot);

      if(eleveVal){
        await ensureZoomMeeting(
          ref.id,
          dateISO,
          duree,
          name
        );
      }

      created++;
    }catch(e){
      /* on continue */
    }
  }

  if(created===0){
    alert(
      "Impossible d'ajouter ce(s) créneau(x) pour le moment."
    );
    return;
  }

  if(created > 1){
    alert(
      `${created} créneaux créés.`
    );
  }

  await loadAdminDispo();
}

function prefillPackCount(){
  const eleveVal =
    document.getElementById(
      'pack-eleve'
    ).value;

  const countEl =
    document.getElementById(
      'pack-quick-count'
    );

  if(!eleveVal || !countEl){
    return;
  }

  const [id] =
    eleveVal.split('|');

  const s =
    studentsData.find(
      x=>x.id===id
    );

  const pack =
    (s && s.pack) || {};

  const remaining =
    Math.max(
      1,
      (pack.total||0) -
      (pack.used||0)
    );

  countEl.value =
    Math.min(
      remaining,
      FORFAIT_MAX
    );

  refreshRecurrencePreview('pack');
}

function fillPackDatesQuick(){
  const startVal =
    document.getElementById(
      'pack-quick-start'
    ).value;

  const count =
    Math.max(
      1,
      Math.min(
        FORFAIT_MAX,
        parseInt(
          document.getElementById(
            'pack-quick-count'
          ).value,
          10
        ) || 1
      )
    );

  if(!startVal){
    alert(
      'Choisis la date de départ.'
    );
    return;
  }

  const dayTimes =
    readSelectedDayTimes('pack');

  if(dayTimes.length===0){
    alert(
      'Coche au moins un jour de la semaine et renseigne son heure.'
    );
    return;
  }

  const duree =
    parseInt(
      document.getElementById(
        'pack-duree'
      ).value,
      10
    ) || 45;

  const dates =
    generateCountDates(
      startVal,
      dayTimes,
      count,
      duree
    );

  dates.forEach((occ,i)=>{
    const input =
      document.getElementById(
        'pack-date-'+(i+1)
      );

    if(!input) return;

    const pad =
      n =>
        String(n)
          .padStart(2,'0');

    input.value =
      `${occ.getFullYear()}-${pad(occ.getMonth()+1)}-${pad(occ.getDate())}T${pad(occ.getHours())}:${pad(occ.getMinutes())}`;

    previewTZ(
      'pack-date-'+(i+1),
      'pack-tz-'+(i+1)
    );
  });

  updatePackPriceHint();
}

/* Paliers de parcelamento Crédito C6 Bank — purement indicatif pour Melissa :
   elle doit choisir la bonne option de son côté en générant le lien C6, cette
   plateforme ne crée aucun lien elle-même. */
function parcelamentoC6(total){
  if(total <= 299) return "1x (jusqu'à R$ 299)";
  if(total <= 599) return "jusqu'à 2x (R$ 300 – 599)";
  if(total <= 899) return "jusqu'à 3x (R$ 600 – 899)";
  return "jusqu'à 4x (R$ 900 et plus)";
}
function calculerPrixForfait(nbSeances){
  const remise = nbSeances >= FORFAIT_MIN && nbSeances <= FORFAIT_MAX;
  const total = PRIX_COURS * nbSeances * (remise ? (1 - FORFAIT_REMISE) : 1);
  return { total, remise, parcelamento: parcelamentoC6(total) };
}
/* Recalcule au fil du remplissage des dates du forfait (voir oninput sur
   chaque pack-date-N, et l'appel à la fin de fillPackDatesQuick ci-dessus). */
function updatePackPriceHint(){
  const el = document.getElementById('pack-price-hint');
  if(!el) return;
  let nb = 0;
  for(let i=1;i<=FORFAIT_MAX;i++){
    const input = document.getElementById('pack-date-'+i);
    if(input && input.value) nb++;
  }
  if(nb === 0){ el.innerHTML = ''; return; }
  const { total, remise, parcelamento } = calculerPrixForfait(nb);
  el.innerHTML = `
    <p style="font-size:12.5px; margin:0; background:var(--cream); border-radius:6px; padding:8px 10px;">
      <b>${nb} séance${nb>1?'s':''}</b> × R$ ${PRIX_COURS}${remise ? ` avec ${(FORFAIT_REMISE*100).toFixed(0)}% de remise` : ''} =
      <b>R$ ${total.toFixed(2).replace('.',',')}</b>
      — modalité Crédito à choisir chez C6 : <b>${parcelamento}</b>
    </p>
  `;
}

async function reserverPack(){
  const eleveVal =
    document.getElementById(
      'pack-eleve'
    ).value;

  const duree =
    parseInt(
      document.getElementById(
        'pack-duree'
      ).value,
      10
    ) || 45;

  if(!eleveVal){
    alert(
      'Choisis un élève.'
    );
    return;
  }

  const [id, name, email] =
    eleveVal.split('|');

  const dates = [];

  for(let i=1;i<=FORFAIT_MAX;i++){
    const v =
      document.getElementById(
        'pack-date-'+i
      ).value;

    if(v){
      dates.push(
        new Date(v).toISOString()
      );
    }
  }

  if(dates.length===0){
    alert(
      'Renseigne au moins une date.'
    );
    return;
  }

  const s =
    studentsData.find(
      x=>x.id===id
    );

  const pack =
    (s && s.pack) || {};

  const remaining =
    (pack.total||0) -
    (pack.used||0);

  if(
    pack.total &&
    (
      pack.total < FORFAIT_MIN ||
      pack.total > FORFAIT_MAX
    )
  ){
    alert(
      `Ce forfait (${pack.total} séances) est en dehors des limites autorisées (${FORFAIT_MIN} à ${FORFAIT_MAX} séances). Corrige d'abord le forfait dans « Élèves & niveaux ».`
    );
    return;
  }

  if(
    pack.total &&
    dates.length > remaining
  ){
    if(
      !confirm(
        `Attention : ${name} n'a que ${remaining} séance(s) restante(s) dans son forfait, tu es sur le point d'en créer ${dates.length}. Continuer quand même ?`
      )
    ){
      return;
    }
  }

  let created = 0;
  const baseUsed = pack.used || 0;

  for(const dateISO of dates){
    try{
      const ref =
        await db
          .collection('disponibilites')
          .add({
            date: dateISO,
            duree,
            reservedBy: id,
            reservedName: name,
            reservedEmail: email,
            isPack: true,
            ts:
              firebase.firestore.FieldValue.serverTimestamp()
          });

      await ensureZoomMeeting(
        ref.id,
        dateISO,
        duree,
        name,
        baseUsed + created + 1
      );

      created++;
    }catch(e){
      /* on continue */
    }
  }

  if(created > 0){
    try{
      await db
        .collection('eleves')
        .doc(id)
        .update({
          'pack.used':
            (pack.used||0) +
            created
        });
    }catch(e){
      /* non bloquant */
    }
  }

  /* Liens de paiement du forfait, remplis dans ce même formulaire — évite
     d'avoir à refaire l'étape séparément dans « Élèves & niveaux » juste
     après, et surtout évite d'oublier de le faire, comme c'était arrivé. */
  const newPackLinks = {};
  PAYMENT_METHODS.forEach(m=>{
    const el = document.getElementById('pack-paylink-'+m.key);
    const val = el ? el.value.trim() : '';
    if(val) newPackLinks[m.key] = val;
  });
  if(created > 0 && Object.keys(newPackLinks).length){
    try{
      await db.collection('eleves').doc(id).update({
        'pack.paymentLinks': newPackLinks,
        'pack.paymentStatus': 'pending'
      });
    }catch(e){ /* non bloquant */ }
    try{
      await callDriveScript({
        action: 'notifyPackPayment',
        email,
        prenom: (name || '').split(' ')[0] || name,
        paymentLinks: newPackLinks
      });
    }catch(e){ /* non bloquant */ }
  }

  alert(
    `${created} séance(s) créée(s) pour ${name}.` +
    (Object.keys(newPackLinks).length ? ' Les liens de paiement ont été envoyés.' : '')
  );

  await loadAdminDispo();
}

async function notifyCancellation(
  email,
  prenom,
  dateStr
){
  try{
    const r =
      await callDriveScript({
        action:'notifyCancel',
        email,
        prenom,
        dateStr
      });

    if(!r || !r.ok){
      console.warn(
        'notifyCancel: échec côté script.',
        r
      );
    }
  }catch(e){
    console.warn(
      'notifyCancel a échoué.',
      e
    );
  }
}

async function notifyTeacherOfCancellation(
  studentName,
  dateStr
){
  try{
    const r =
      await callDriveScript({
        action:'notifyTeacherCancel',
        teacherEmail: TEACHER_EMAIL,
        studentName,
        dateStr
      });

    if(!r || !r.ok){
      console.warn(
        'notifyTeacherCancel: échec côté script.',
        r
      );
    }
  }catch(e){
    console.warn(
      'notifyTeacherCancel a échoué.',
      e
    );
  }
}

async function deleteDisponibilite(id){
  const slot =
    dispoData.find(
      s=>s.id===id
    );

  if(
    !confirm(
      'Supprimer ce créneau ?'
    )
  ){
    return;
  }

  if(slot && slot.reservedBy){
    try{
      const r =
        await processCancellation(
          slot,
          'teacher'
        );

      if(r.refundDue){
        alert(
          `⚠️ ${slot.reservedName} a droit à un remboursement (2 annulations tardives dépassées de ton côté sur 30 jours). Pense à le faire manuellement.`
        );
      }
    }catch(e){
      /* non bloquant */
    }

    await notifyCancellation(
      slot.reservedEmail,
      slot.reservedName,
      fmtSlotDate(slot.date)
    );

    await postSystemMessage(
      slot.reservedBy,
      slot.reservedName,
      `❌ Ton cours du ${fmtSlotDate(slot.date)} a été annulé.`,
      true
    );
  }

  try{
    await db
      .collection('disponibilites')
      .doc(id)
      .delete();
  }catch(e){
    alert(
      'Impossible de supprimer pour le moment.'
    );
    return;
  }

  await loadAdminDispo();
}

async function adminCancelReservation(id){
  const slot =
    dispoData.find(
      s=>s.id===id
    );

  if(
    !confirm(
      'Annuler la réservation de cet élève ?'
    )
  ){
    return;
  }

  try{
    const r =
      await processCancellation(
        slot,
        'teacher'
      );

    if(r.refundDue){
      alert(
        `⚠️ ${slot.reservedName} a droit à un remboursement (2 annulations tardives dépassées de ton côté sur 30 jours). Pense à le faire manuellement.`
      );
    }
  }catch(e){
    alert(
      "Impossible d'annuler pour le moment."
    );
    return;
  }

  if(slot && slot.reservedEmail){
    await notifyCancellation(
      slot.reservedEmail,
      slot.reservedName,
      fmtSlotDate(slot.date)
    );

    await postSystemMessage(
      slot.reservedBy,
      slot.reservedName,
      `❌ Ton cours du ${fmtSlotDate(slot.date)} a été annulé.`,
      true
    );
  }

  await loadAdminDispo();
}
/* ---- Messagerie privée élève ↔ professeure + présence en ligne ---- */

function formatElapsed(ms){
  const s = Math.floor(ms/1000);

  if(s < 60){
    return "à l'instant";
  }

  const m = Math.floor(s/60);

  if(m < 60){
    return `${m} min`;
  }

  const h = Math.floor(m/60);

  if(h < 24){
    return `${h} h`;
  }

  const d = Math.floor(h/24);

  return `${d} j`;
}

function fileToBase64(file){
  return new Promise(
    (resolve, reject)=>{
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          String(reader.result)
            .split(',')[1] || ''
        );

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}


/* ---- Présence ---- */
let presenceHeartbeatInterval = null;

function startPresenceHeartbeatFor(docId){
  if(
    presenceHeartbeatInterval ||
    !docId
  ){
    return;
  }

  const beat = ()=>{
    db.collection('presence')
      .doc(docId)
      .set(
        {
          lastSeen:
            firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          merge:true
        }
      )
      .catch(()=>{});
  };

  beat();

  presenceHeartbeatInterval =
    setInterval(
      beat,
      20000
    );

  document.addEventListener(
    'visibilitychange',
    ()=>{
      if(
        document.visibilityState==='visible'
      ){
        beat();
      }
    }
  );
}

function startTeacherPresenceHeartbeat(){
  startPresenceHeartbeatFor(
    'teacher'
  );
}

function startStudentPresenceHeartbeat(){
  if(student && student.uid){
    startPresenceHeartbeatFor(
      student.uid
    );
  }
}

let presenceUnsub = null;

function listenPresence(){
  if(presenceUnsub){
    presenceUnsub();
  }

  presenceUnsub =
    db.collection('presence')
      .doc('teacher')
      .onSnapshot(
        snap=>{
          const el =
            document.getElementById(
              'presence-badge'
            );

          if(!el) return;

          const data =
            snap.data();

          const lastSeenMs =
            (
              data &&
              data.lastSeen &&
              data.lastSeen.toMillis
            )
              ? data.lastSeen.toMillis()
              : 0;

          if(!lastSeenMs){
            el.innerHTML =
              "⚫ Melissa n'est pas encore en ligne";
            return;
          }

          const online =
            (
              Date.now() -
              lastSeenMs
            ) < 60000;

          el.innerHTML =
            online
              ? '🟢 Melissa est en ligne'
              : `⚫ Hors ligne depuis ${formatElapsed(Date.now()-lastSeenMs)}`;
        },
        ()=>{
          /* silencieux */
        }
      );
}


/* Côté prof : présence des élèves */
let teacherPresenceMap = {};
let teacherPresenceUnsubs = {};

function ensureStudentPresenceListener(uid){
  if(
    !uid ||
    teacherPresenceUnsubs[uid]
  ){
    return;
  }

  teacherPresenceUnsubs[uid] =
    db.collection('presence')
      .doc(uid)
      .onSnapshot(
        snap=>{
          const data =
            snap.data();

          teacherPresenceMap[uid] =
            (
              data &&
              data.lastSeen &&
              data.lastSeen.toMillis
            )
              ? data.lastSeen.toMillis()
              : 0;

          if(
            screen==='teacher' &&
            teacherTab==='messages'
          ){
            renderTeacherMessages();
          }
        },
        ()=>{}
      );
}

function presenceLabel(uid){
  const lastSeenMs =
    teacherPresenceMap[uid];

  if(!lastSeenMs){
    return '⚫ Jamais connecté(e)';
  }

  const online =
    (
      Date.now() -
      lastSeenMs
    ) < 60000;

  return online
    ? '🟢 En ligne'
    : `⚫ Hors ligne depuis ${formatElapsed(Date.now()-lastSeenMs)}`;
}


/* ---- Message système ---- */
async function postSystemMessage(
  studentUid,
  studentName,
  text,
  senderIsTeacher
){
  if(!studentUid){
    return;
  }

  try{
    await db
      .collection('messages')
      .add({
        studentUid,
        studentName:
          studentName || 'Élève',
        senderUid:
          senderIsTeacher
            ? TEACHER_UID
            : studentUid,
        senderIsTeacher,
        isSystemMessage: true,
        text,
        readByTeacher:
          senderIsTeacher,
        readByStudent:
          !senderIsTeacher,
        ts:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  }catch(e){
    /* non bloquant */
  }
}


/* ---- Bulle de message ---- */
let editingMessageId = null;

function messageBubbleHTML(
  m,
  mine,
  kind
){
  if(m.isSystemMessage){
    return `
      <div style="text-align:center; margin:10px 0;">
        <span style="display:inline-block; background:#eef1f5; color:var(--grey); font-size:12px; padding:6px 12px; border-radius:100px;">
          ${esc(m.text)}
        </span>
      </div>
    `;
  }

  if(editingMessageId === m.id){
    return `
      <div
        style="margin-bottom:8px; text-align:${mine?'right':'left'};"
        data-msg-id="${m.id}"
      >
        <div style="display:inline-flex; gap:6px; align-items:center; max-width:90%;">
          <input
            type="text"
            id="edit-input-${m.id}"
            value="${esc(m.text)}"
            style="padding:6px 8px; border:1px solid var(--line); border-radius:6px; font-size:13px; min-width:160px;"
            onkeydown="if(event.key==='Enter') saveEditMessage('${m.id}','${kind}')"
          >

          <button
            onclick="saveEditMessage('${m.id}','${kind}')"
            style="background:none; border:0; cursor:pointer;"
          >
            ✓
          </button>

          <button
            onclick="cancelEditMessage('${kind}')"
            style="background:none; border:0; cursor:pointer;"
          >
            ✕
          </button>
        </div>
      </div>
    `;
  }

  let attachmentHtml = '';

  if(m.attachmentUrl){
    if(
      m.attachmentType &&
      m.attachmentType.startsWith('image/')
    ){
      attachmentHtml = `
        <a
          href="${esc(m.attachmentUrl)}"
          target="_blank"
          rel="noopener"
        >
          <img
            src="${esc(m.attachmentUrl)}"
            style="max-width:220px; max-height:220px; border-radius:8px; display:block; margin-top:6px;"
          >
        </a>
      `;
    }else{
      attachmentHtml = `
        <a
          href="${esc(m.attachmentUrl)}"
          target="_blank"
          rel="noopener"
          style="display:inline-flex; align-items:center; gap:6px; margin-top:6px; padding:8px 10px; background:#fff; border:1px solid var(--line); border-radius:8px; font-size:12.5px; color:var(--navy); text-decoration:none;"
        >
          📎 ${esc(m.attachmentName||'Fichier')}
        </a>
      `;
    }
  }

  const editedTag =
    m.edited
      ? ` <span style="opacity:.7;">(modifié)</span>`
      : '';

  const editBtn =
    mine
      ? `
        <button
          onclick="startEditMessage('${m.id}','${kind}')"
          style="background:none; border:0; cursor:pointer; opacity:.6; padding:0; margin-left:6px;"
          title="Modifier"
        >
          ✏️
        </button>
      `
      : '';

  return `
    <div
      style="margin-bottom:8px; text-align:${mine?'right':'left'};"
      data-msg-id="${m.id}"
    >
      <span
        style="display:inline-block; background:${mine?'var(--brand-blue)':'#eee'}; color:${mine?'#fff':'#20232b'}; padding:8px 12px; border-radius:12px; max-width:78%; font-size:13.5px; text-align:left;"
      >
        ${m.text ? esc(m.text) : ''}
        ${attachmentHtml}
      </span>

      <div style="font-size:10.5px; color:var(--grey); margin-top:2px;">
        ${m.ts?fmtDate(m.ts):''}
        ${editedTag}
        ${editBtn}
      </div>
    </div>
  `;
}

function startEditMessage(id, kind){
  editingMessageId = id;
  refreshMessagesView(kind);
}

function cancelEditMessage(kind){
  editingMessageId = null;
  refreshMessagesView(kind);
}

async function saveEditMessage(
  id,
  kind
){
  const input =
    document.getElementById(
      'edit-input-'+id
    );

  if(!input){
    return;
  }

  const text =
    input.value.trim();

  if(!text){
    alert(
      'Le message ne peut pas être vide.'
    );
    return;
  }

  try{
    await db
      .collection('messages')
      .doc(id)
      .update({
        text,
        edited:true,
        editedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  }catch(e){
    alert(
      "Impossible de modifier ce message pour le moment."
    );
  }

  editingMessageId = null;
  refreshMessagesView(kind);
}

function refreshMessagesView(kind){
  if(kind==='teacher'){
    renderTeacherMessages();
  }else{
    renderMessagesBody();
  }
}


/* ---- Supprimer une conversation ---- */
async function deleteConversationForMe(
  studentUid,
  kind
){
  if(
    !confirm(
      "Supprimer cette conversation de ta vue ? Elle restera visible pour l'autre personne."
    )
  ){
    return;
  }

  const field =
    kind==='teacher'
      ? 'hiddenForTeacher'
      : 'hiddenForStudent';

  try{
    const snap =
      await db
        .collection('messages')
        .where(
          'studentUid',
          '==',
          studentUid
        )
        .get();

    const batch =
      db.batch();

    snap.docs.forEach(
      d=>
        batch.update(
          d.ref,
          {
            [field]: true
          }
        )
    );

    await batch.commit();
  }catch(e){
    alert(
      'Impossible de supprimer pour le moment.'
    );
    return;
  }

  if(kind==='teacher'){
    closeTeacherThread();
  }else{
    renderMessagesBody();
  }
}

async function deleteConversationForEveryone(
  studentUid,
  kind
){
  if(
    !confirm(
      'Supprimer définitivement toute la conversation, pour les deux côtés ? Cette action est irréversible.'
    )
  ){
    return;
  }

  try{
    const snap =
      await db
        .collection('messages')
        .where(
          'studentUid',
          '==',
          studentUid
        )
        .get();

    const batch =
      db.batch();

    snap.docs.forEach(
      d=>batch.delete(d.ref)
    );

    await batch.commit();
  }catch(e){
    alert(
      'Impossible de supprimer pour le moment.'
    );
    return;
  }

  if(kind==='teacher'){
    closeTeacherThread();
  }else{
    renderMessagesBody();
  }
}


/* ---- Pièces jointes ---- */
async function handleAttachmentChange(
  kind,
  inputEl
){
  const file =
    inputEl.files &&
    inputEl.files[0];

  if(!file){
    return;
  }

  if(file.size > 8*1024*1024){
    alert(
      'Fichier trop volumineux (8 Mo maximum).'
    );

    inputEl.value='';
    return;
  }

  const textEl =
    document.getElementById(
      'thread-input'
    );

  const caption =
    textEl
      ? textEl.value.trim()
      : '';

  const statusEl =
    document.getElementById(
      kind+'-attach-status'
    );

  if(statusEl){
    statusEl.textContent =
      'Envoi du fichier…';
  }

  try{
    const base64 =
      await fileToBase64(file);

    const result =
      await callDriveScript({
        action:'upload',
        fileName:file.name,
        mimeType:
          file.type ||
          'application/octet-stream',
        base64
      });

    if(!result || !result.ok){
      throw new Error(
        'upload failed'
      );
    }

    const payload = {
      text: caption,
      attachmentUrl:
        result.viewUrl,
      attachmentName:
        file.name,
      attachmentType:
        file.type || '',
      ts:
        firebase.firestore.FieldValue.serverTimestamp()
    };

    if(kind==='teacher'){
      if(!teacherOpenThreadUid){
        throw new Error(
          'no thread open'
        );
      }

      await db
        .collection('messages')
        .add({
          studentUid:
            teacherOpenThreadUid,
          studentName:
            teacherOpenThreadName,
          senderUid:
            auth.currentUser.uid,
          senderIsTeacher:true,
          readByTeacher:true,
          readByStudent:false,
          ...payload
        });
    }else{
      await db
        .collection('messages')
        .add({
          studentUid:
            student.uid,
          studentName:
            `${student.prenom} ${student.nom}`,
          senderUid:
            student.uid,
          senderIsTeacher:false,
          readByTeacher:false,
          readByStudent:true,
          ...payload
        });
    }

    if(textEl){
      textEl.value = '';
    }
  }catch(e){
    alert(
      "Impossible d'envoyer le fichier pour le moment."
    );
  }

  inputEl.value = '';

  if(statusEl){
    statusEl.textContent = '';
  }
}


/* ---- Côté élève ---- */
let studentMsgUnsub = null;
let studentThreadMessages = [];
let studentUnreadCount = 0;

function startStudentMessagesListener(){
  if(
    studentMsgUnsub ||
    isTeacher ||
    !student.uid
  ){
    return;
  }

  studentMsgUnsub =
    db.collection('messages')
      .where(
        'studentUid',
        '==',
        student.uid
      )
      .onSnapshot(
        snap=>{
          const msgs =
            snap.docs
              .map(
                d=>({
                  id:d.id,
                  ...d.data()
                })
              )
              .filter(
                m=>!m.hiddenForStudent
              );

          msgs.sort(
            (a,b)=>
              (a.ts?.toMillis?.()||0) -
              (b.ts?.toMillis?.()||0)
          );

          studentThreadMessages =
            msgs;

          studentUnreadCount =
            msgs.filter(
              m =>
                m.senderIsTeacher &&
                !m.readByStudent
            ).length;

          if(screen==='messages'){
            msgs
              .filter(
                m =>
                  m.senderIsTeacher &&
                  !m.readByStudent
              )
              .forEach(m=>{
                db.collection('messages')
                  .doc(m.id)
                  .update({
                    readByStudent:true
                  })
                  .catch(()=>{});
              });
          }

          renderSidebar();

          if(screen==='messages'){
            renderMessagesBody();
          }
        },
        err=>{
          console.error(err);
        }
      );
}

function renderMessages(){
  const c =
    document.getElementById(
      'content'
    );

  c.innerHTML = `
    <p class="eyebrow">
      Contact
    </p>

    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap;">
      <h1 class="page-title">
        ✉️ Message à ta professeure
      </h1>

      <div>
        <button
          onclick="deleteConversationForMe('${student.uid}','student')"
          style="background:none; color:var(--grey); font-size:12px;"
        >
          🗑 Supprimer pour moi
        </button>

        <button
          onclick="deleteConversationForEveryone('${student.uid}','student')"
          style="background:none; color:var(--bad); font-size:12px;"
        >
          🗑 Supprimer pour tout le monde
        </button>
      </div>
    </div>

    <div
      id="presence-badge"
      style="margin-bottom:12px; font-size:13px; color:var(--grey);"
    >
      Vérification…
    </div>

    <div
      id="thread-messages"
      style="max-height:440px; overflow-y:auto; border:1px solid var(--line); border-radius:8px; padding:12px; background:#fafafa;"
    ></div>

    <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
      <input
        id="thread-input"
        type="text"
        placeholder="Écris ton message…"
        style="flex:1; padding:10px; border:1px solid var(--line); border-radius:8px;"
        onkeydown="if(event.key==='Enter') sendStudentMessage()"
      >

      <label
        style="cursor:pointer; padding:9px 12px; border:1px solid var(--line); border-radius:8px; background:#fff;"
        title="Joindre une photo ou un fichier"
      >
        📎

        <input
          type="file"
          style="display:none"
          onchange="handleAttachmentChange('student', this)"
        >
      </label>

      <button
        class="rec-btn"
        onclick="sendStudentMessage()"
      >
        Envoyer
      </button>
    </div>

    <div
      id="student-attach-status"
      style="font-size:11.5px; color:var(--grey); margin-top:4px;"
    ></div>
  `;

  listenPresence();
  startStudentMessagesListener();
  renderMessagesBody();
}

function renderMessagesBody(){
  const el =
    document.getElementById(
      'thread-messages'
    );

  if(!el){
    return;
  }

  el.innerHTML =
    studentThreadMessages.length
      ? studentThreadMessages
          .map(
            m=>
              messageBubbleHTML(
                m,
                !m.senderIsTeacher,
                'student'
              )
          )
          .join('')
      : '<p class="teacher-empty">Écris ton premier message ci-dessous.</p>';

  el.scrollTop =
    el.scrollHeight;
}

async function sendStudentMessage(){
  const input =
    document.getElementById(
      'thread-input'
    );

  if(!input){
    return;
  }

  const text =
    input.value.trim();

  if(!text){
    return;
  }

  input.value = '';

  try{
    await db
      .collection('messages')
      .add({
        studentUid:
          student.uid,

        studentName:
          `${student.prenom} ${student.nom}`,

        senderUid:
          student.uid,

        senderIsTeacher:
          false,

        text,

        readByTeacher:
          false,

        readByStudent:
          true,

        ts:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  }catch(e){
    alert(
      "Impossible d'envoyer le message pour le moment."
    );
  }
}


/* ============================================================
   CÔTÉ PROFESSEURE
   CORRECTION :
   - charge tous les élèves depuis "eleves"
   - permet d'ouvrir une conversation même sans message existant
   - inclut les élèves expérimentaux
   ============================================================ */

let teacherMsgUnsub = null;
let teacherMsgThreads = [];

/* NOUVEAU */
let teacherAllStudents = [];

let teacherOpenThreadUid = null;
let teacherOpenThreadName = '';

function startTeacherMessagesListener(){
  if(teacherMsgUnsub){
    return;
  }

  teacherMsgUnsub =
    db.collection('messages')
      .orderBy('ts','asc')
      .onSnapshot(
        snap=>{
          const byStudent = {};
          const toMarkRead = [];

          snap.docs.forEach(d=>{
            const m =
              d.data();

            if(m.hiddenForTeacher){
              return;
            }

            if(!byStudent[m.studentUid]){
              byStudent[m.studentUid] = {
                studentUid:
                  m.studentUid,

                studentName:
                  m.studentName ||
                  'Élève',

                lastText:'',
                lastTs:null,
                unread:0,
                msgs:[]
              };
            }

            const t =
              byStudent[m.studentUid];

            t.lastText =
              m.text ||
              (
                m.attachmentUrl
                  ? '📎 Pièce jointe'
                  : ''
              );

            t.lastTs = m.ts;

            t.msgs.push({
              id:d.id,
              ...m
            });

            if(
              !m.senderIsTeacher &&
              !m.readByTeacher
            ){
              t.unread++;

              if(
                teacherOpenThreadUid ===
                  m.studentUid &&
                screen==='teacher' &&
                teacherTab==='messages'
              ){
                toMarkRead.push(
                  d.id
                );
              }
            }
          });

          teacherMsgThreads =
            Object.values(byStudent)
              .sort(
                (a,b)=>
                  (b.lastTs?.toMillis?.()||0) -
                  (a.lastTs?.toMillis?.()||0)
              );

          teacherMsgThreads.forEach(
            t=>
              ensureStudentPresenceListener(
                t.studentUid
              )
          );

          toMarkRead.forEach(
            id=>
              db.collection('messages')
                .doc(id)
                .update({
                  readByTeacher:true
                })
                .catch(()=>{})
          );

          renderSidebar();

          if(
            screen==='teacher' &&
            teacherTab==='messages'
          ){
            renderTeacherMessages();
          }
        },
        err=>{
          console.error(err);
        }
      );
}

function teacherUnreadTotal(){
  return teacherMsgThreads.reduce(
    (s,t)=>s+t.unread,
    0
  );
}


/* CORRIGÉ */
async function loadTeacherMessages(){
  startTeacherMessagesListener();

  try{
    const snap =
      await db
        .collection('eleves')
        .get();

    teacherAllStudents =
      snap.docs
        .map(d=>({
          uid:d.id,
          ...d.data()
        }))
        .filter(
          s=>s.uid
        )
        .sort(
          (a,b)=>{
            const nameA =
              `${a.prenom||''} ${a.nom||''}`.trim() ||
              a.email ||
              '';

            const nameB =
              `${b.prenom||''} ${b.nom||''}`.trim() ||
              b.email ||
              '';

            return nameA.localeCompare(
              nameB,
              'fr'
            );
          }
        );

    teacherAllStudents.forEach(
      s=>
        ensureStudentPresenceListener(
          s.uid
        )
    );

  }catch(e){
    console.error(
      'Erreur chargement élèves pour la messagerie :',
      e
    );

    teacherAllStudents = [];
  }

  renderTeacherMessages();
}


/* CORRIGÉ */
function openTeacherThread(uid){
  teacherOpenThreadUid = uid;

  const t =
    teacherMsgThreads.find(
      x=>x.studentUid===uid
    );

  const s =
    teacherAllStudents.find(
      x=>x.uid===uid
    );

  teacherOpenThreadName =
    t
      ? t.studentName
      : (
          s
            ? (
                `${s.prenom||''} ${s.nom||''}`.trim() ||
                s.email ||
                'Élève'
              )
            : 'Élève'
        );

  renderTeacherMessages();
}

function closeTeacherThread(){
  teacherOpenThreadUid = null;
  renderTeacherMessages();
}


/* CORRIGÉ */
function renderTeacherMessages(){
  const body =
    document.getElementById(
      'teacher-body'
    );

  if(!body){
    return;
  }


  /* Conversation ouverte */
  if(teacherOpenThreadUid){
    const thread =
      teacherMsgThreads.find(
        t =>
          t.studentUid ===
          teacherOpenThreadUid
      );

    const msgs =
      thread
        ? thread.msgs
        : [];

    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
        <button
          onclick="closeTeacherThread()"
          style="background:none; color:var(--navy);"
        >
          ← Retour aux conversations
        </button>

        <div>
          <button
            onclick="deleteConversationForMe('${teacherOpenThreadUid}','teacher')"
            style="background:none; color:var(--grey); font-size:12px;"
          >
            🗑 Supprimer pour moi
          </button>

          <button
            onclick="deleteConversationForEveryone('${teacherOpenThreadUid}','teacher')"
            style="background:none; color:var(--bad); font-size:12px;"
          >
            🗑 Supprimer pour tout le monde
          </button>
        </div>
      </div>

      <h3 style="margin:0 0 4px;">
        ${esc(teacherOpenThreadName)}
      </h3>

      <div style="font-size:12.5px; color:var(--grey); margin-bottom:10px;">
        ${presenceLabel(teacherOpenThreadUid)}
      </div>

      <div
        id="thread-messages"
        style="max-height:420px; overflow-y:auto; border:1px solid var(--line); border-radius:8px; padding:12px; background:#fafafa;"
      >
        ${
          msgs.length
            ? msgs
                .map(
                  m=>
                    messageBubbleHTML(
                      m,
                      m.senderIsTeacher,
                      'teacher'
                    )
                )
                .join('')
            : '<p class="teacher-empty">Aucun message pour le moment.</p>'
        }
      </div>

      <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
        <input
          id="thread-input"
          type="text"
          placeholder="Écrire un message…"
          style="flex:1; padding:10px; border:1px solid var(--line); border-radius:8px;"
          onkeydown="if(event.key==='Enter') sendTeacherMessage()"
        >

        <label
          style="cursor:pointer; padding:9px 12px; border:1px solid var(--line); border-radius:8px; background:#fff;"
          title="Joindre une photo ou un fichier"
        >
          📎

          <input
            type="file"
            style="display:none"
            onchange="handleAttachmentChange('teacher', this)"
          >
        </label>

        <button
          class="rec-btn"
          onclick="sendTeacherMessage()"
        >
          Envoyer
        </button>
      </div>

      <div
        id="teacher-attach-status"
        style="font-size:11.5px; color:var(--grey); margin-top:4px;"
      ></div>
    `;

    const el =
      document.getElementById(
        'thread-messages'
      );

    if(el){
      el.scrollTop =
        el.scrollHeight;
    }

    return;
  }


  /*
    On garde les conversations existantes
    et on ajoute les élèves qui n'ont
    encore jamais envoyé de message.
  */
  const existingUids =
    new Set(
      teacherMsgThreads.map(
        t=>t.studentUid
      )
    );

  const studentsWithoutThread =
    teacherAllStudents
      .filter(
        s =>
          !existingUids.has(
            s.uid
          )
      )
      .map(s=>({
        studentUid:
          s.uid,

        studentName:
          `${s.prenom||''} ${s.nom||''}`.trim() ||
          s.email ||
          'Élève',

        lastText:'',
        lastTs:null,
        unread:0,
        msgs:[]
      }));

  const allThreads = [
    ...teacherMsgThreads,
    ...studentsWithoutThread
  ];

  if(allThreads.length===0){
    body.innerHTML =
      `<p class="teacher-empty">Aucun élève pour le moment.</p>`;

    return;
  }

  body.innerHTML =
    allThreads.map(t=>`
      <div
        class="teacher-entry"
        style="cursor:pointer;"
        onclick="openTeacherThread('${t.studentUid}')"
      >
        <div class="who">
          ${esc(t.studentName)}

          ${
            t.unread
              ? `
                <span
                  class="admin-pill"
                  style="background:var(--bad); color:#fff;"
                >
                  ${t.unread}
                </span>
              `
              : ''
          }
        </div>

        <div class="meta">
          ${
            t.lastText
              ? esc(
                  t.lastText.slice(
                    0,
                    90
                  )
                )
              : 'Aucune conversation — cliquer pour écrire'
          }
        </div>

        <div
          class="meta"
          style="font-size:11.5px;"
        >
          ${presenceLabel(t.studentUid)}
        </div>
      </div>
    `).join('');
}

async function sendTeacherMessage(){
  const input =
    document.getElementById(
      'thread-input'
    );

  if(!input){
    return;
  }

  const text =
    input.value.trim();

  if(
    !text ||
    !teacherOpenThreadUid
  ){
    return;
  }

  input.value = '';

  try{
    await db
      .collection('messages')
      .add({
        studentUid:
          teacherOpenThreadUid,

        studentName:
          teacherOpenThreadName,

        senderUid:
          auth.currentUser.uid,

        senderIsTeacher:
          true,

        text,

        readByTeacher:
          true,

        readByStudent:
          false,

        ts:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  }catch(e){
    alert(
      "Impossible d'envoyer le message pour le moment."
    );
  }
}


/* ---- Forum ---- */
let forumData = [];
let forumOpenReplyId = null;

async function loadForum(){
  const body =
    document.getElementById(
      'forum-body'
    );

  if(body){
    body.innerHTML =
      '<p class="teacher-empty">Chargement…</p>';
  }

  try{
    const snap =
      await db
        .collection('forum')
        .orderBy(
          'ts',
          'desc'
        )
        .get();

    forumData =
      snap.docs.map(
        d=>({
          id:d.id,
          ...d.data()
        })
      );
  }catch(e){
    forumData = [];
  }

  renderForumBody();
}

function renderForum(){
  const c =
    document.getElementById(
      'content'
    );

  c.innerHTML = `
    <p class="eyebrow">
      Entraide
    </p>

    <h1 class="page-title">
      💬 Forum
    </h1>

    <p style="font-size:14px; color:var(--grey); margin-bottom:16px;">
      Pose une question, ta professeure (ou un autre élève) peut te répondre ici.
    </p>

    <div class="rec-box">
      <p class="rec-consigne" style="font-weight:700;">
        ✏️ Nouvelle question
      </p>

      <textarea
        id="forum-new-q"
        placeholder="Écris ta question ici..."
        style="width:100%; min-height:70px; margin-top:8px; padding:10px; border:1px solid var(--line); border-radius:8px; font-family:'Inter',sans-serif; font-size:14px;"
      ></textarea>

      <button
        class="rec-btn"
        style="margin-top:8px;"
        onclick="postForumQuestion()"
      >
        Publier ma question
      </button>
    </div>

    <h2 class="section-title">
      Questions du groupe
    </h2>

    <div id="forum-body">
      <p class="teacher-empty">
        Chargement…
      </p>
    </div>
  `;

  loadForum();
}

function renderForumBody(){
  const body =
    document.getElementById(
      'forum-body'
    );

  if(!body){
    return;
  }

  if(forumData.length===0){
    body.innerHTML =
      '<p class="teacher-empty">Pas encore de question — sois le premier à en poser une !</p>';

    return;
  }

  body.innerHTML =
    forumData.map(q=>{
      const replies =
        (q.replies || [])
          .map(r => `
            <div class="forum-reply ${r.isTeacher ? 'forum-reply-teacher' : ''}">
              <b>
                ${r.authorName}

                ${
                  r.isTeacher
                    ? ' <span class="admin-pill" style="margin-left:4px;">Professeure</span>'
                    : ''
                }
              </b>

              <p>
                ${r.text}
              </p>
            </div>
          `)
          .join('');

      return `
        <div class="forum-thread">
          <div class="forum-q">
            <b>
              ${q.authorName}

              ${
                q.isTeacherAuthor
                  ? ' <span class="admin-pill" style="margin-left:4px;">Professeure</span>'
                  : ''
              }
            </b>

            <p>
              ${q.question}
            </p>
          </div>

          ${
            replies
              ? `
                <div class="forum-replies">
                  ${replies}
                </div>
              `
              : ''
          }

          ${
            forumOpenReplyId === q.id
              ? `
                <div style="margin-top:8px;">
                  <textarea
                    id="forum-reply-${q.id}"
                    placeholder="Ta réponse..."
                    style="width:100%; min-height:50px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;"
                  ></textarea>

                  <button
                    class="rec-btn"
                    style="margin-top:6px;"
                    onclick="postForumReply('${q.id}')"
                  >
                    Envoyer
                  </button>

                  <button
                    onclick="toggleForumReply('${q.id}')"
                    style="background:none; color:var(--grey); margin-left:8px;"
                  >
                    Annuler
                  </button>
                </div>
              `
              : `
                <button
                  onclick="toggleForumReply('${q.id}')"
                  style="background:none; color:var(--accent-2, #6f42c1); font-weight:700; margin-top:6px;"
                >
                  ↩ Répondre
                </button>
              `
          }
        </div>
      `;
    }).join('');
}

function toggleForumReply(id){
  forumOpenReplyId =
    (forumOpenReplyId === id)
      ? null
      : id;

  renderForumBody();
}

async function postForumQuestion(){
  const ta =
    document.getElementById(
      'forum-new-q'
    );

  const text =
    ta.value.trim();

  if(!text){
    return;
  }

  try{
    await db
      .collection('forum')
      .add({
        question: text,
        authorName:
          `${student.prenom} ${student.nom}`,
        authorUid:
          student.uid,
        isTeacherAuthor:
          isTeacher,
        replies: [],
        ts:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  }catch(e){
    alert(
      "Impossible de publier ta question pour le moment."
    );
    return;
  }

  await loadForum();
}

async function postForumReply(id){
  const ta =
    document.getElementById(
      'forum-reply-'+id
    );

  const text =
    ta.value.trim();

  if(!text){
    return;
  }

  const q =
    forumData.find(
      x=>x.id===id
    );

  const replies =
    (q && q.replies)
      ? [...q.replies]
      : [];

  replies.push({
    text,
    authorName:
      `${student.prenom} ${student.nom}`,
    isTeacher:
      isTeacher,
    ts:
      new Date().toISOString()
  });

  try{
    await db
      .collection('forum')
      .doc(id)
      .update({
        replies
      });

    forumOpenReplyId = null;
  }catch(e){
    alert(
      "Impossible d'envoyer la réponse pour le moment."
    );
    return;
  }

  await loadForum();
}

function renderDossiers(){
  const c =
    document.getElementById(
      'content'
    );

  c.innerHTML = `
    <p class="eyebrow">
      Niveau ${niveau}
    </p>

    <h1 class="page-title">
      Dossiers du niveau ${niveau}
    </h1>

    <div id="next-course-banner"></div>
    <div id="pack-payment-banner"></div>

    <div class="objectif-box">
      <p class="fr">
        Le niveau ${niveau} comptera <b>9 dossiers</b> au total. Pour l'instant, les <b>Dossiers 0 et 1</b> sont disponibles — les suivants arriveront au fur et à mesure. Chaque dossier est découpé en <b>5 unités</b> ; tu avances à ton rythme, que tu aies 1, 2, 3, 4 ou 5 séances par semaine avec ta professeure. Avec 4 séances/semaine par exemple, tu peux terminer tout un dossier en un peu plus d'une semaine — ce n'est jamais bloqué sur 5 semaines.
      </p>

      <p class="pt">
        🇧🇷 O nível ${niveau} terá 9 módulos ao todo. Por enquanto, os <b>Módulos 0 e 1</b> estão disponíveis — os próximos chegarão aos poucos. Cada módulo tem <b>5 unidades</b>; você avança no seu próprio ritmo, tenha 1, 2, 3, 4 ou 5 aulas por semana. Com 4 aulas/semana, por exemplo, dá para terminar um módulo em pouco mais de uma semana — nunca é travado em 5 semanas.
      </p>
    </div>

    <div
      class="dossier-grid"
      id="dossier-grid"
    ></div>
  `;

  loadNextCourseBanner();
  renderPackPaymentBanner();

  const grid =
    document.getElementById(
      'dossier-grid'
    );

  dossiersMenu.forEach(d=>{
    const isOpen =
      d.open &&
      niveau === 'A1';

    const el =
      document.createElement(
        'div'
      );

    el.className =
      'dossier-card ' +
      (
        isOpen
          ? 'open'
          : 'locked'
      );

    let statusText =
      isOpen
        ? '● Disponible'
        : '🔒 Bientôt disponible';

    if(isOpen){
      /* Chaque dossier garde sa propre progression : on pointe "weeks" vers le
         contenu du dossier d.num avant de chercher l'unité en cours pour CE
         dossier précis (student.uniteCourante est maintenant { [num]: tag }). */
      setActiveDossier(d.num);
      const tagCourant = student.uniteCourante && student.uniteCourante[d.num];
      if(tagCourant){
        const w = weeks.find(x => x.tag === tagCourant);
        if(w){
          statusText = `↻ Reprendre — Unité ${w.id}/5`;
        }
      }
    }

    el.innerHTML = `
      <div>
        <div class="num">
          ${d.num}
        </div>

        <div class="name">
          ${d.name}
        </div>
      </div>

      <div class="status">
        ${statusText}
      </div>
    `;

    if(isOpen){
      el.onclick = ()=>{
        setActiveDossier(d.num);
        const tagCourant = student.uniteCourante && student.uniteCourante[d.num];
        const w = tagCourant ? weeks.find(x => x.tag === tagCourant) : null;
        goWeek(w ? w.id : 1);
      };
    }

    grid.appendChild(el);
  });
}
