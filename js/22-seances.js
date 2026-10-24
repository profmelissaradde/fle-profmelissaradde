/* ============================================================================
   SÉANCES — source unique, statut unique, priorités, fiche séance, espace Cours
   ----------------------------------------------------------------------------
   Avant : chaque onglet relisait la collection « disponibilites » et calculait
   son propre statut ; les demandes de report et les anomalies étaient gérées à
   trois endroits. Ici :
     SEANCES / seancesCharger()  une seule lecture partagée (cache court) ;
     seanceStatut()              un seul libellé de statut, partout ;
     pilotage()                  une seule liste de priorités (menu, tableau de
                                 bord, onglet « À traiter ») ;
     seanceOuvrir(id)            la fiche séance : le même panneau, quelle que
                                 soit la page d'où l'on vient.
   Les règles métier restent là où elles étaient : décompte des forfaits
   (20-forfaits.js), réponses et reports (Apps Script, appelés via 13 et 21).
   ============================================================================ */
const SEANCES = {liste: [], at: 0, enCours: null, events: [], eventsAt: 0};

async function seancesCharger(force){
  if(!force && SEANCES.at && Date.now() - SEANCES.at < 20000) return SEANCES.liste;
  if(SEANCES.enCours) return SEANCES.enCours;
  SEANCES.enCours = (async ()=>{
    try{
      const snap = await db.collection('disponibilites').orderBy('date').get();
      SEANCES.liste = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> String(a.date).localeCompare(String(b.date)));
      SEANCES.at = Date.now();
    }catch(e){ console.warn('Séances non chargées :', e && e.message); }
    dispoData = SEANCES.liste;                  /* les actions existantes cherchent la séance ici */
    if(isTeacher) await seancesDetecterAnomalies();
    pilotageMajCompteur();
    return SEANCES.liste;
  })();
  try{ return await SEANCES.enCours; } finally { SEANCES.enCours = null; }
}
/* Règle inchangée (anciennement detectAnomalies) : séance passée de plus de 30 min après
   la fin, sans les deux clics Zoom, sans récapitulatif complet et jamais régularisée.
   Elle s'exécute maintenant à chaque chargement, et non plus seulement à l'ouverture d'un onglet. */
async function seancesDetecterAnomalies(){
  const now = Date.now();
  for(const s of SEANCES.liste){
    if(!s.reservedBy || s.anomalie || s.anomalieHandled || s.experimentalCancelled || s.definitivelyCancelled) continue;
    if(s.vocab && s.recordingUrl) continue;
    if(s.consommation && s.consommation.statut) continue;
    const fin = new Date(s.date).getTime() + (s.duree || 45) * 60000;
    if(now > fin + 30*60000 && !(s.clickedByStudent && s.clickedByTeacher)){
      s.anomalie = true;
      try{ await db.collection('disponibilites').doc(s.id).update({anomalie: true}); }catch(e){ /* non bloquant */ }
    }
  }
}
function detectAnomalies(){ return seancesDetecterAnomalies(); }
async function seancesEvenements(force){
  if(!force && SEANCES.eventsAt && Date.now() - SEANCES.eventsAt < 20000) return SEANCES.events;
  try{
    const depuis = new Date(Date.now() - 60*86400000).toISOString();
    const snap = await db.collection('evenementsCours').where('at', '>=', depuis).get();
    SEANCES.events = snap.docs.map(d=>({id:d.id, ...d.data()})).filter(e => String(e.at) >= depuis)
      .sort((a,b)=> String(b.at).localeCompare(String(a.at)));
  }catch(e){ SEANCES.events = []; }
  SEANCES.eventsAt = Date.now();
  return SEANCES.events;
}
function seancesNotifsChangees(){
  /* Une nouvelle réponse d'élève est arrivée : les listes se mettent à jour. */
  SEANCES.at = 0; SEANCES.eventsAt = 0;
  if(screen === 'teacher' && ['atraiter','dispo','accueil'].includes(teacherTab)) profRefreshCurrent();
  seanceRafraichir();
}

/* ---------------------------------------------------------------------------
   STATUT UNIQUE D'UNE SÉANCE
   --------------------------------------------------------------------------- */
const SEANCE_STATUTS = {
  libre:               {label:'Libre',                        ton:''},
  reservee:            {label:'Réservé',                      ton:'info'},
  a_confirmer:         {label:'Confirmation attendue',        ton:'warning'},
  confirme:            {label:'Confirmé',                     ton:'success'},
  deplacement_demande: {label:'Déplacement demandé',          ton:'warning'},
  report_propose:      {label:'Nouvelle date proposée',       ton:'info'},
  zoom_erreur:         {label:'Zoom à resynchroniser',        ton:'danger'},
  zoom_attente:        {label:'Zoom en cours de mise à jour', ton:'info'},
  en_cours:            {label:'En cours',                     ton:'info'},
  realisee:            {label:'Réalisée',                     ton:'success'},
  decomptee:           {label:'Décomptée',                    ton:''},
  annulee:             {label:'Annulée',                      ton:''},
  anomalie:            {label:'Anomalie à régulariser',       ton:'danger'},
  a_verifier:          {label:'À vérifier',                   ton:'warning'}
};
function seanceStatut(s, now){
  now = now || Date.now();
  if(!s.reservedBy) return 'libre';
  if(s.experimentalCancelled || s.definitivelyCancelled) return s.definitivelyCancelled && s.cancelledBy === 'student' ? 'decomptee' : 'annulee';
  const debut = new Date(s.date).getTime(), fin = debut + (s.duree || 45) * 60000;
  if(s.zoomSync && s.zoomSync.status === 'error') return 'zoom_erreur';
  if(fin < now){
    const e = typeof forfaitEtatSeance === 'function' ? forfaitEtatSeance(s, now) : (s.anomalie ? 'anomalie' : 'realisee');
    return SEANCE_STATUTS[e] ? e : (e === 'programmee' ? 'a_verifier' : 'realisee');
  }
  if(debut <= now) return 'en_cours';
  const st = typeof suiviStatutCli === 'function' ? suiviStatutCli(s) : (s.confirmed ? 'confirme' : 'sans_rappel');
  if(st === 'deplacement_demande') return 'deplacement_demande';
  if(st === 'report_propose') return 'report_propose';
  if(s.zoomSync && ['pending','retry'].includes(s.zoomSync.status)) return 'zoom_attente';
  if(st === 'confirme') return 'confirme';
  if(st === 'en_attente') return 'a_confirmer';
  return 'reservee';
}
function seanceBadgeHTML(s, now){
  const k = seanceStatut(s, now); const d = SEANCE_STATUTS[k];
  return `<span class="badge ${d.ton ? 'badge-' + d.ton : ''}">${d.label}</span>`;
}
function seanceTypeLabel(s){ return s.isExperimental ? "Cours d'essai" : (s.isPack ? 'Forfait' : "À l'unité"); }

/* ---------------------------------------------------------------------------
   PRIORITÉS (une seule source pour le menu, le tableau de bord et « À traiter »)
   --------------------------------------------------------------------------- */
const PILOTAGE_TYPES = {
  demande_report:       {label:'Demande de déplacement',          filtre:'reports'},
  proposition_refusee:  {label:"Proposition refusée par l'élève", filtre:'reports'},
  anomalie:             {label:'Séance en anomalie',              filtre:'anomalies'},
  a_verifier:           {label:'Séance passée à vérifier',        filtre:'anomalies'},
  zoom_erreur:          {label:'Zoom à resynchroniser',           filtre:'zoom'},
  non_confirme:         {label:'Pas encore confirmé',             filtre:'confirmations'},
  proposition_attente:  {label:"Nouvelle date en attente de l'élève", filtre:'reports'},
  attente_confirmation: {label:'Confirmation attendue',           filtre:'confirmations'},
  zoom_attente:         {label:'Zoom en cours de mise à jour',    filtre:'zoom'}
};
function pilotage(slots, now){
  now = now || Date.now();
  const urgent = [], prevoir = [];
  const add = (liste, s, type, detail) => liste.push({s, type, detail: detail || ''});
  (slots || []).forEach(s=>{
    if(!s.reservedBy || s.experimentalCancelled || s.definitivelyCancelled) return;
    const debut = new Date(s.date).getTime();
    const req = s.rescheduleRequest || {};
    const passe = debut + (s.duree || 45) * 60000 < now;
    if(s.zoomSync && s.zoomSync.status === 'error') add(urgent, s, 'zoom_erreur', s.zoomSync.lastError || '');
    if(req.by === 'student' && req.status === 'pending' && debut > now - 3600000){ add(urgent, s, 'demande_report', '3 disponibilités proposées'); return; }
    if(passe){
      const e = typeof forfaitEtatSeance === 'function' ? forfaitEtatSeance(s, now) : '';
      if(req.by === 'teacher' && req.status === 'refused' && s.anomalie) add(urgent, s, 'proposition_refusee', 'Propose une autre date ou régularise');
      else if(e === 'anomalie') add(urgent, s, 'anomalie', '');
      else if(e === 'a_verifier') add(urgent, s, 'a_verifier', '');
      else if(e === 'report_propose') add(prevoir, s, 'proposition_attente', req.proposedDate ? 'Proposé : ' + fmtSlotDate(req.proposedDate) : '');
      return;
    }
    if(req.by === 'teacher' && req.status === 'pending'){ add(prevoir, s, 'proposition_attente', req.proposedDate ? 'Proposé : ' + fmtSlotDate(req.proposedDate) : ''); return; }
    if(s.zoomSync && ['pending','retry'].includes(s.zoomSync.status)) add(prevoir, s, 'zoom_attente', '');
    if(seanceStatut(s, now) === 'a_confirmer'){
      if(debut - now < 3*3600000) add(urgent, s, 'non_confirme', 'Le cours commence bientôt');
      else add(prevoir, s, 'attente_confirmation', 'Rappel envoyé, pas encore de réponse');
    }
  });
  const tri = (a,b)=> new Date(a.s.date) - new Date(b.s.date);
  urgent.sort(tri); prevoir.sort(tri);
  return {urgent, prevoir};
}
function pilotageMajCompteur(){
  if(!isTeacher || typeof navCounts === 'undefined') return;
  const n = pilotage(SEANCES.liste).urgent.length;
  if(navCounts.aTraiter === n) return;
  navCounts.aTraiter = n;
  if(typeof updateNavChrome === 'function') updateNavChrome();
}

/* ---------------------------------------------------------------------------
   LISTES (composant commun : agenda, historique, fiche élève, à traiter)
   --------------------------------------------------------------------------- */
function seanceLigneHTML(s, opts){
  opts = opts || {};
  const qui = s.reservedBy ? esc(s.reservedName || 'Élève') : '<span class="tp-dim">Créneau libre</span>';
  const extra = opts.detail ? `<span class="seance-detail">${opts.detail}</span>` : '';
  const recap = opts.recap && s.reservedBy && !s.isExperimental
    ? `<span class="seance-detail">${s.vocab ? 'Vocabulaire ✓' : 'Vocabulaire à ajouter'} · ${s.recordingUrl ? 'Enregistrement ✓' : 'Enregistrement à ajouter'}</span>` : '';
  return `<li><button type="button" class="seance-row${opts.sansEleve ? ' no-who' : ''}" onclick="seanceOuvrir('${s.id}')">
    <span class="seance-when">${opts.heureSeule ? fmtHeure(s.date) : fmtSlotDate(s.date)}<span class="tp-dim"> · ${s.duree || 45} min</span></span>
    ${opts.sansEleve ? '' : `<span class="seance-who">${qui}</span>`}
    <span class="seance-meta">${opts.label ? `<span class="badge ${opts.ton ? 'badge-' + opts.ton : ''}">${opts.label}</span>` : seanceBadgeHTML(s)}${s.reservedBy ? ` <span class="tp-dim">${seanceTypeLabel(s)}</span>` : ''}${extra}${recap}</span>
    <span class="seance-go" aria-hidden="true">›</span></button>${opts.zoom && seanceZoomOuvert(s) ? `<button type="button" class="btn btn-sm seance-zoom" onclick="profOuvrirZoom('${s.id}')">Ouvrir Zoom</button>` : ''}</li>`;
}
/* Accès direct à Zoom (tableau de bord, agenda du jour) : le clic est enregistré comme preuve de présence. */
function seanceZoomOuvert(s){
  if(!s.reservedBy || !s.zoomJoinUrl || s.anomalie || s.experimentalCancelled || s.definitivelyCancelled) return false;
  if(typeof rptZoomSyncEnCours === 'function' && rptZoomSyncEnCours(s)) return false;
  return typeof zoomAccess === 'function' ? zoomAccess(s.date, s.duree).open : false;
}
function seanceListeHTML(slots, opts){ return `<ul class="seance-list">${slots.map(s => seanceLigneHTML(s, opts)).join('')}</ul>`; }
function fmtHeure(iso){ try{ return new Date(iso).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}).replace(':', 'h'); }catch(e){ return ''; } }
function fmtJourLong(d){ return d.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'}); }

/* ---------------------------------------------------------------------------
   FICHE SÉANCE (panneau unique)
   --------------------------------------------------------------------------- */
let seanceOuverte = null;
function seanceDialog(){
  let d = document.getElementById('seance-dialog');
  if(!d){
    d = document.createElement('dialog');
    d.id = 'seance-dialog'; d.className = 'sheet'; d.setAttribute('aria-labelledby', 'seance-titre');
    d.addEventListener('close', ()=>{ seanceOuverte = null; });
    d.addEventListener('click', e => { if(e.target === d) d.close(); });
    document.body.appendChild(d);
  }
  return d;
}
let seanceContexte = '';
/* Changer de page referme la fiche (elle appartient à la page d'où on l'a ouverte). */
onAfterRender(()=>{ if(seanceOuverte && seanceContexte !== screen + '/' + teacherTab) seanceFermer(); });
async function seanceOuvrir(id){
  if(!isTeacher) return;
  seanceOuverte = id;
  seanceContexte = screen + '/' + teacherTab;
  const d = seanceDialog();
  d.innerHTML = `<div class="sheet-body"><p class="teacher-empty" role="status">Chargement…</p></div>`;
  if(!d.open){ try{ d.showModal(); }catch(e){ d.setAttribute('open', ''); } }
  await seanceRafraichir();
}
function seanceFermer(){ const d = document.getElementById('seance-dialog'); if(d && d.open) d.close(); seanceOuverte = null; }
async function seanceRafraichir(){
  const id = seanceOuverte; if(!id) return;
  const d = seanceDialog();
  let s = null, evs = [];
  try{
    const doc = await db.collection('disponibilites').doc(id).get();
    if(doc.exists){ s = {id, ...doc.data()}; const i = SEANCES.liste.findIndex(x => x.id === id); if(i >= 0) SEANCES.liste[i] = s; else SEANCES.liste.push(s); }
  }catch(e){ /* séance gardée en mémoire ci-dessous */ }
  if(!s) s = SEANCES.liste.find(x => x.id === id) || null;
  if(!s){
    d.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2 id="seance-titre">Séance introuvable</h2><button type="button" class="btn-icon" onclick="seanceFermer()" aria-label="Fermer">${uiIcon('close')}</button></div><p>Cette séance a été supprimée ou n'est pas accessible.</p></div>`;
    return;
  }
  try{
    const snap = await db.collection('evenementsCours').where('seanceId', '==', id).get();
    evs = snap.docs.map(x=>({id:x.id, ...x.data()})).filter(e => e.seanceId === id).sort((a,b)=> String(b.at).localeCompare(String(a.at)));
  }catch(e){ evs = []; }
  if(!studentsData.length && typeof loadTeacherStudentsQuiet === 'function') await loadTeacherStudentsQuiet();
  if(seanceOuverte !== id) return;
  const scroll = d.querySelector('.sheet-body') ? d.querySelector('.sheet-body').scrollTop : 0;
  d.innerHTML = seanceFicheHTML(s, evs);
  const b = d.querySelector('.sheet-body'); if(b) b.scrollTop = scroll;
  if(typeof window.uiEnhance === 'function') window.uiEnhance(d);
}
function seanceSection(titre, contenu){ return contenu ? `<section class="sheet-section"><h3>${titre}</h3>${contenu}</section>` : ''; }
function seanceFicheHTML(s, evs){
  const now = Date.now();
  const debut = new Date(s.date).getTime(), fin = debut + (s.duree || 45) * 60000;
  const passe = fin < now, futur = debut > now;
  const req = s.rescheduleRequest || {};
  const eleve = studentsData.find(e => e.id === s.reservedBy);
  const parts = [];

  /* Élève et forfait */
  if(s.reservedBy){
    let forfait = seanceTypeLabel(s);
    if(s.isPack && eleve && eleve.pack && eleve.pack.total){
      const b = forfaitBilanEleve(eleve);
      forfait = `Forfait de ${b.total} séances — ${b.utilisees} utilisées, ${b.restantes} restantes`;
    }
    const etat = passe && typeof forfaitEtatSeance === 'function' ? forfaitEtatSeance(s) : null;
    const decompte = etat && FORFAIT_ETATS[etat] ? (FORFAIT_ETATS[etat].decompte ? 'décomptée du forfait' : 'non décomptée') : '';
    const paiement = !s.isPack && !s.isExperimental
      ? (s.paymentStatus === 'paid' ? '<span class="badge badge-success">Payé</span>' : '<span class="badge badge-warning">Paiement en attente</span>') : '';
    parts.push(seanceSection('Élève', `<p class="sheet-line"><b>${esc(s.reservedName || 'Élève')}</b>${s.reservedEmail ? ` <span class="tp-dim">· ${esc(s.reservedEmail)}</span>` : ''}</p>
      <p class="sheet-line">${esc(forfait)}${decompte ? ` · <b>${decompte}</b>` : ''} ${paiement}</p>
      ${eleve ? `<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" onclick="seanceFermer(); openAdminStudentSection('${eleve.id}','cours')">Ouvrir la fiche de l'élève</button></div>` : ''}`));
  }

  /* Ce qu'il faut faire maintenant */
  const actions = [];
  if(s.reservedBy && req.by === 'student' && req.status === 'pending'){
    const av = [req.availability1, req.availability2, req.availability3].filter(Boolean);
    actions.push(`<div class="sheet-callout warning"><p><b>L'élève demande à déplacer ce cours.</b> Le cours reste prévu le ${fmtSlotDate(s.date)} tant que tu n'as pas répondu.</p>
      ${av.length ? `<ul class="choice-list">${av.map(a=>`<li><span>${fmtSlotDate(a)}</span><button type="button" class="btn btn-sm" onclick="seanceChoisirDispo('${s.id}','${esc(a)}')">Choisir</button></li>`).join('')}</ul>` : ''}
      <div class="field"><label for="seance-motif">Message à l'élève si tu refuses (facultatif)</label><input id="seance-motif" type="text" maxlength="300"></div>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="seanceRefuserDemande('${s.id}')">Refuser (le cours est maintenu)</button></div>
      <p class="field-help">Aucune date ne convient ? Propose-en une autre ci-dessous.</p></div>`);
  }
  if(s.reservedBy && futur && seanceStatut(s, now) === 'a_confirmer'){
    actions.push(`<div class="sheet-callout"><p>Rappel envoyé, l'élève n'a pas encore confirmé.</p>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="seanceMarquerConfirme('${s.id}')">Marquer comme confirmé</button>
      ${debut - now > 3600000 ? `<button type="button" class="btn btn-ghost btn-sm" onclick="seanceRelancerRappel('${s.id}')">Renvoyer le rappel</button>` : ''}</div></div>`);
  }
  if(s.zoomSync && ['error','retry','pending'].includes(s.zoomSync.status)){
    actions.push(`<div class="sheet-callout ${s.zoomSync.status === 'error' ? 'danger' : ''}"><p>${s.zoomSync.status === 'error' ? 'La réunion Zoom n\'a pas pu être mise à jour' : 'La réunion Zoom est en cours de mise à jour'}${s.zoomSync.lastError ? ' : ' + esc(s.zoomSync.lastError) : ''}.</p>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="rptRelancerZoom('${s.id}')">Réessayer maintenant</button></div></div>`);
  }
  if(passe && s.reservedBy){
    const prop = typeof forfaitPropositionHTML === 'function' ? forfaitPropositionHTML(s) : '';
    const decision = typeof forfaitDecisionFormHTML === 'function' ? forfaitDecisionFormHTML(s) : '';
    if(s.anomalie || prop || decision){
      const motif = s.anomalie ? (s.clickedByStudent && !s.clickedByTeacher ? "L'élève a rejoint Zoom, pas toi." : (!s.clickedByStudent && s.clickedByTeacher ? "Tu as rejoint Zoom, pas l'élève." : "Personne n'a rejoint le lien Zoom de la plateforme.")) : '';
      actions.push(`${motif ? `<div class="sheet-callout danger"><p><b>Séance en anomalie.</b> ${motif} Elle n'est pas décomptée tant qu'elle n'est pas régularisée.</p></div>` : ''}${prop}${decision}`);
    }
  }
  if(actions.length) parts.push(seanceSection('À faire', actions.join('')));

  /* Zoom et confirmation pour une séance à venir */
  if(s.reservedBy && !passe && !s.experimentalCancelled && !s.definitivelyCancelled){
    const v = s.suivi && s.suivi.date === s.date ? s.suivi : null;
    const conf = v ? `Réponse reçue par ${SUIVI_CANAUX[v.canal] || v.canal}${v.par === 'administratrice' ? ' (toi)' : ''} le ${suiviFmt(v.at)}.`
      : (s.reminderSentForDate === s.date ? 'Rappel 24 h envoyé.' : 'Le rappel part 24 h avant le cours.');
    parts.push(seanceSection('Cours', `<p class="sheet-line">${conf}</p>${zoomButtonHTML(s.id, s.date, s.duree, s.zoomJoinUrl, s)}`));
  }

  /* Paiement d'un cours à l'unité */
  if(s.reservedBy && !s.isPack && !s.isExperimental){
    let pay = '';
    if(s.paymentStatus !== 'paid') pay = `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="markPaymentReceived('${s.id}')">Marquer comme payé</button></div>`;
    else if(!s.notaFiscalSent) pay = `<p class="sheet-line">Nota fiscal à envoyer${s.cpfNaNota ? ` (CPF demandé : <b>${esc(s.cpfNaNota)}</b>)` : ''}.</p>
      <div class="field"><label for="nota-file-${s.id}">Fichier de la nota (PDF ou image)</label><input type="file" id="nota-file-${s.id}" accept="application/pdf,image/*"></div>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="sendNotaFiscal('${s.id}','nota-file-${s.id}')">Téléverser et envoyer</button></div>`;
    else pay = `<p class="sheet-line">Payé · nota fiscal envoyée${s.notaFiscalUrl ? ` — <a href="${esc(s.notaFiscalUrl)}" target="_blank" rel="noopener">voir</a>` : ''}.</p>`;
    parts.push(seanceSection('Paiement', pay));
  }

  /* Récapitulatif pédagogique */
  if(s.reservedBy && !s.isExperimental && debut < now + 3600000 && !s.experimentalCancelled){
    parts.push(seanceSection('Récapitulatif pour l\'élève', `<div class="field"><label for="recap-vocab-${s.id}">Vocabulaire vu pendant le cours</label><textarea id="recap-vocab-${s.id}" rows="4" placeholder="un mot — sa traduction">${esc(s.vocab || '')}</textarea></div>
      <div class="field"><label for="recap-rec-${s.id}">Lien de l'enregistrement (Google Drive)</label><input type="url" id="recap-rec-${s.id}" value="${esc(s.recordingUrl || '')}" placeholder="https://drive.google.com/…"></div>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="saveSessionRecap('${s.id}')">Enregistrer le récapitulatif</button></div>`));
  }

  /* Modifier */
  const modif = [];
  if(s.reservedBy && !s.experimentalCancelled && !s.definitivelyCancelled && (futur || s.anomalie || seanceStatut(s, now) === 'a_verifier')){
    modif.push(`<div class="field"><label for="seance-nouvelle-date">Nouvelle date et heure</label><input type="datetime-local" id="seance-nouvelle-date" oninput="previewTZ('seance-nouvelle-date','seance-nouvelle-tz')"><div id="seance-nouvelle-tz" class="tp-dim"></div></div>
      <div class="btn-row"><button type="button" class="btn btn-sm" onclick="seanceProposer('${s.id}')">Proposer à l'élève</button>
      ${futur || !s.anomalie ? `<button type="button" class="btn btn-ghost btn-sm" onclick="seanceDeplacer('${s.id}')">Déplacer directement</button>` : ''}</div>
      <p class="field-help">${futur || !s.anomalie ? "« Proposer » attend l'accord de l'élève (e-mail avec boutons) ; « Déplacer directement » est réservé aux urgences." : "La séance reste en anomalie et n'est pas décomptée jusqu'à la réponse de l'élève."} Zoom suit automatiquement.</p>`);
  }
  if(s.reservedBy && futur && !s.experimentalCancelled && !s.definitivelyCancelled)
    modif.push(`<div class="btn-row"><button type="button" class="btn btn-danger btn-sm" onclick="seanceAnnuler('${s.id}')">Annuler la réservation</button></div>`);
  if(!s.reservedBy)
    modif.push(`<div class="btn-row"><button type="button" class="btn btn-danger btn-sm" onclick="seanceSupprimer('${s.id}')">Supprimer ce créneau libre</button></div>`);
  if(modif.length) parts.push(seanceSection(s.reservedBy ? 'Modifier ce cours' : 'Créneau', modif.join('')));

  /* Historique */
  const histo = (evs.length ? `<ul class="tp-list">${evs.map(suiviEvenementHTML).join('')}</ul>` : '<p class="tp-dim">Aucune réponse enregistrée pour cette séance.</p>')
    + (typeof forfaitHistoriqueHTML === 'function' ? forfaitHistoriqueHTML(s) : '');
  if(s.reservedBy) parts.push(seanceSection('Historique', histo));

  return `<div class="sheet-body">
    <div class="sheet-head">
      <div><p class="eyebrow">${s.reservedBy ? esc(seanceTypeLabel(s)) : 'Créneau'}</p>
        <h2 id="seance-titre">${fmtSlotDate(s.date)} <span class="tp-dim">· ${s.duree || 45} min</span></h2>
        <p class="sheet-line">${seanceBadgeHTML(s, now)}${s.originalDate ? ` <span class="tp-dim">initialement le ${fmtSlotDate(s.originalDate)}</span>` : ''}</p>
        ${timezoneLineHTML(s.date)}</div>
      <button type="button" class="btn-icon" onclick="seanceFermer()" aria-label="Fermer la fiche">${uiIcon('close')}</button>
    </div>
    ${parts.join('')}
  </div>`;
}

/* ---- Actions de la fiche (toutes passent par les fonctions existantes ou le serveur) ---- */
async function seanceApres(){ SEANCES.at = 0; await seancesCharger(true); await seanceRafraichir(); profRefreshCurrent(); }
function seanceTrouver(id){ return SEANCES.liste.find(x => x.id === id); }
async function seanceServeur(payload, succes){
  try{
    const r = await rptCall(payload);
    if(!r.ok) throw new Error(r.error || 'Action impossible.');
    uiNotify(r.already ? 'Déjà enregistré.' : succes, 'success');
  }catch(e){ uiNotify(e.message, 'error'); }
  await seanceApres();
}
function seanceMarquerConfirme(id){
  if(!confirm("Marquer ce cours comme confirmé (par exemple si l'élève t'a répondu par message) ?")) return;
  seanceServeur({action:'lessonAction', slotId:id, type:'confirm'}, 'Cours marqué comme confirmé.');
}
function seanceRelancerRappel(id){
  if(!confirm("Renvoyer à l'élève l'e-mail de rappel (mêmes boutons Confirmer / Annuler / Déplacer) ?")) return;
  seanceServeur({action:'resendReminder', slotId:id}, 'Rappel renvoyé.');
}
function seanceRefuserDemande(id){
  if(!confirm("Refuser la demande de déplacement ? Le cours reste à sa date d'origine et l'élève est prévenu(e) par e-mail.")) return;
  const el = document.getElementById('seance-motif');
  seanceServeur({action:'refuseRescheduleRequest', slotId:id, motif: el ? el.value : ''}, "Demande refusée, l'élève est prévenu(e).");
}
async function seanceChoisirDispo(id, iso){
  const s = seanceTrouver(id); if(!s) return;
  if(!confirm(`Déplacer le cours au ${fmtSlotDate(iso)} ? La réunion Zoom suit et l'élève est prévenu(e).`)) return;
  try{ const r = await rptAppliquer(s, iso, s.duree || 45, 'student_availability'); if(r.ok) uiNotify(`Cours déplacé au ${fmtSlotDate(r.newDate)}. ${rptMessageZoom(r)}`, 'success'); }
  catch(e){ uiNotify(e.message, 'error'); }
  await seanceApres();
}
function seanceDateSaisie(){
  const v = (document.getElementById('seance-nouvelle-date') || {}).value;
  if(!v){ uiNotify('Choisis une date et une heure.', 'warning'); return null; }
  return new Date(v).toISOString();
}
async function seanceProposer(id){
  const s = seanceTrouver(id); const iso = seanceDateSaisie(); if(!s || !iso) return;
  try{
    const r = await rptProposer(s, iso, s.duree || 45);
    if(r.ok){
      uiNotify("Proposition envoyée à l'élève" + (r.emailed ? ' par e-mail' : '') + '.', 'success');
      try{ await postSystemMessage(s.reservedBy, s.reservedName, `📅 Je te propose de déplacer ton cours du ${fmtSlotDate(s.date)} au ${fmtSlotDate(iso)} : tu peux accepter ou refuser depuis l'e-mail reçu ou ta page d'accueil.`, true); }catch(e){}
    }
  }catch(e){ uiNotify(e.message, 'error'); }
  await seanceApres();
}
async function seanceDeplacer(id){
  const s = seanceTrouver(id); const iso = seanceDateSaisie(); if(!s || !iso) return;
  if(!confirm(`Déplacer directement le cours au ${fmtSlotDate(iso)}, sans attendre l'accord de l'élève ?`)) return;
  try{ const r = await rptAppliquer(s, iso, s.duree || 45, 'direct'); if(r.ok) uiNotify(`Cours déplacé au ${fmtSlotDate(r.newDate)}. ${rptMessageZoom(r)}`, 'success'); }
  catch(e){ uiNotify(e.message, 'error'); }
  await seanceApres();
}
async function seanceAnnuler(id){ await adminCancelReservation(id); await seanceApres(); }
async function seanceSupprimer(id){
  const s = seanceTrouver(id);
  if(s && s.reservedBy){ uiNotify("Ce créneau est réservé : annule d'abord la réservation (l'historique de l'élève est conservé).", 'warning'); return; }
  await deleteDisponibilite(id);
  seanceFermer();
}

/* ---------------------------------------------------------------------------
   COURS › AGENDA
   --------------------------------------------------------------------------- */
let agendaFiltre = 'tous';
function agendaJour(key){ adminSelectedDay = adminSelectedDay === key ? null : key; agendaRender(); }
function agendaJourNav(delta){ adminCalDate = new Date(adminCalDate.getFullYear(), adminCalDate.getMonth() + delta, 1); agendaRender(); }
function agendaSetFiltre(f){ agendaFiltre = f; agendaRender(); }
function agendaRender(){
  const body = profBody(); if(!body || !profOnTab('dispo')) return;
  const now = Date.now();
  const toutes = SEANCES.liste.filter(s => !s.experimentalCancelled || s.reservedBy);
  const markers = {};
  toutes.forEach(s => { if(new Date(s.date).getTime() >= now - 86400000*40) markers[toDateKey(new Date(s.date))] = {color: s.reservedBy ? 'var(--c-primary)' : 'var(--c-success)'}; });
  let liste = adminSelectedDay
    ? toutes.filter(s => toDateKey(new Date(s.date)) === adminSelectedDay)
    : toutes.filter(s => new Date(s.date).getTime() + (s.duree || 45) * 60000 >= now - 3600000 && new Date(s.date).getTime() < now + 21*86400000);
  if(agendaFiltre === 'reserves') liste = liste.filter(s => s.reservedBy && !s.experimentalCancelled && !s.definitivelyCancelled);
  if(agendaFiltre === 'libres') liste = liste.filter(s => !s.reservedBy);
  const jours = {};
  liste.forEach(s => { const k = toDateKey(new Date(s.date)); (jours[k] = jours[k] || []).push(s); });
  const groupes = Object.keys(jours).sort().map(k => {
    const d = new Date(jours[k][0].date);
    return `<section class="agenda-day" aria-label="${esc(fmtJourLong(d))}"><h3 class="agenda-day-title">${fmtJourLong(d)}${k === toDateKey(new Date()) ? ' <span class="badge badge-info">Aujourd\'hui</span>' : ''}</h3>${seanceListeHTML(jours[k], {heureSeule:true, zoom:true})}</section>`;
  }).join('');
  const manquants = SEANCES.liste.filter(s => s.reservedBy && !s.isExperimental && !s.zoomJoinUrl && new Date(s.date).getTime() >= now).length;
  const nb = f => (f === 'reserves' ? toutes.filter(s => s.reservedBy) : f === 'libres' ? toutes.filter(s => !s.reservedBy) : toutes).filter(s => adminSelectedDay ? toDateKey(new Date(s.date)) === adminSelectedDay : (new Date(s.date).getTime() >= now - 3600000 && new Date(s.date).getTime() < now + 21*86400000)).length;
  body.innerHTML = `
    <div class="page-actions">
      <button type="button" class="btn" onclick="goTeacherTab('disponibilites')">${uiIcon('plus')} Ouvrir des créneaux</button>
      <button type="button" class="btn btn-secondary" onclick="goTeacherTab('forfait-nouveau')">${uiIcon('wallet')} Nouveau forfait</button>
    </div>
    <div class="agenda">
      <div class="agenda-cal">${buildCalendarHTML(adminCalDate.getFullYear(), adminCalDate.getMonth(), markers, adminSelectedDay, 'agendaJour')}
        <p class="tp-dim agenda-legend"><span class="dot dot-primary"></span> réservé <span class="dot dot-success"></span> libre</p></div>
      <div class="agenda-list">
        <div class="ui-filters" role="group" aria-label="Filtrer l'agenda">
          ${[['tous','Tout'],['reserves','Réservés'],['libres','Libres']].map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${agendaFiltre===id}" onclick="agendaSetFiltre('${id}')">${l}<span class="n">${nb(id)}</span></button>`).join('')}
          ${adminSelectedDay ? `<button type="button" class="btn btn-ghost btn-sm" onclick="agendaJour('${adminSelectedDay}')">${uiIcon('close')} Tous les jours</button>` : ''}
        </div>
        <p class="tp-dim">${adminSelectedDay ? 'Séances du jour choisi.' : 'Séances des trois prochaines semaines. Choisis un jour dans le calendrier pour voir une autre date.'}</p>
        ${groupes || profEmptyHTML('calendar', adminSelectedDay ? 'Aucune séance ce jour-là' : 'Aucune séance à venir', 'Ouvre des créneaux pour que tes élèves puissent réserver.')}
        ${manquants ? `<p class="tp-warn">${manquants} cours à venir sans lien Zoom. <button type="button" class="btn btn-ghost btn-sm" onclick="regenerateMissingZoomLinks()">Créer les liens manquants</button></p>` : ''}
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------------
   COURS › À TRAITER (remplace « Reports & anomalies » et « Confirmations & demandes »)
   --------------------------------------------------------------------------- */
let aTraiter = {filtre:'tout', q:''};
const ATRAITER_FILTRES = [['tout','Tout'],['reports','Reports'],['anomalies','Anomalies'],['confirmations','Confirmations'],['zoom','Zoom']];
async function aTraiterLoad(){
  await Promise.all([seancesCharger(true), seancesEvenements(true), profEnsureStudents()]);
  if(profOnTab('atraiter')) aTraiterRender();
}
function aTraiterSetFiltre(f){ aTraiter.filtre = f; aTraiterRender(); }
function aTraiterRecherche(v){
  aTraiter.q = v; aTraiterRender();
  const el = document.getElementById('atraiter-q'); if(el){ el.focus(); el.setSelectionRange(v.length, v.length); }
}
function aTraiterRender(){
  const body = profBody(); if(!body || !profOnTab('atraiter')) return;
  const now = Date.now();
  const p = pilotage(SEANCES.liste, now);
  const q = aTraiter.q.trim().toLowerCase();
  const garde = it => (aTraiter.filtre === 'tout' || PILOTAGE_TYPES[it.type].filtre === aTraiter.filtre) && (!q || String(it.s.reservedName || '').toLowerCase().includes(q));
  const tous = p.urgent.concat(p.prevoir);
  const n = f => tous.filter(it => f === 'tout' || PILOTAGE_TYPES[it.type].filtre === f).length;
  const ligne = (it, ton) => seanceLigneHTML(it.s, {label: PILOTAGE_TYPES[it.type].label, ton, detail: it.detail ? esc(it.detail) : ''});
  const urg = p.urgent.filter(garde), prev = p.prevoir.filter(garde);
  const recents = SEANCES.events.filter(e => ['lesson_confirmed','lesson_cancelled','lesson_auto_cancelled','lesson_reschedule_requested','lesson_reschedule_refused','lesson_rescheduled','lesson_unconfirmed'].includes(e.type)
    && now - new Date(e.at).getTime() < 7*86400000 && (!q || String(e.eleveNom || '').toLowerCase().includes(q))
    && (aTraiter.filtre === 'tout' || (aTraiter.filtre === 'confirmations' && /confirmed|cancel|unconfirmed/.test(e.type)) || (aTraiter.filtre === 'reports' && /reschedul/.test(e.type)))).slice(0, 30);
  body.innerHTML = `
    <p class="page-intro">Tout ce qui demande une réponse de ta part sur les séances : demandes de déplacement, confirmations, anomalies, synchronisation Zoom. Chaque ligne ouvre la fiche de la séance.</p>
    <div class="ui-filters" role="group" aria-label="Filtrer">
      ${ATRAITER_FILTRES.map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${aTraiter.filtre===id}" onclick="aTraiterSetFiltre('${id}')">${l}<span class="n">${n(id)}</span></button>`).join('')}
    </div>
    <div class="field field-search"><label for="atraiter-q">Rechercher un élève</label><input id="atraiter-q" type="search" value="${esc(aTraiter.q)}" oninput="aTraiterRecherche(this.value)" autocomplete="off"></div>
    <h2 class="section-title">À faire maintenant <span class="count-pill danger">${urg.length}</span></h2>
    ${urg.length ? `<ul class="seance-list">${urg.map(it => ligne(it, 'danger')).join('')}</ul>` : profEmptyHTML('check', 'Rien d\'urgent', '')}
    <h2 class="section-title">À suivre <span class="count-pill">${prev.length}</span></h2>
    ${prev.length ? `<ul class="seance-list">${prev.map(it => ligne(it, 'info')).join('')}</ul>` : profEmptyHTML('check', 'Rien en attente', '')}
    <h2 class="section-title">Réponses des 7 derniers jours</h2>
    ${recents.length ? `<ul class="event-list">${recents.map(e => `<li><button type="button" class="event-row" onclick="seanceOuvrir('${e.seanceId}')">${suiviEvenementHTML(e).replace(/^<li>|<\/li>$/g, '')} — <b>${esc(e.eleveNom || '')}</b></button></li>`).join('')}</ul>`
      : '<p class="tp-dim">Aucune réponse enregistrée cette semaine.</p>'}`;
}

/* ---------------------------------------------------------------------------
   COURS › HISTORIQUE
   --------------------------------------------------------------------------- */
let histo = {filtre:'tous', q:'', n:40};
function histoSet(k, v){ histo[k] = v; if(k !== 'n') histo.n = 40; renderTeacherHistorique(); if(k === 'q'){ const el = document.getElementById('histo-q'); if(el){ el.focus(); el.setSelectionRange(v.length, v.length); } } }
function renderTeacherHistorique(){
  const body = profBody(); if(!body || !profOnTab('historique')) return;
  const now = Date.now();
  const q = histo.q.trim().toLowerCase();
  const passees = SEANCES.liste.filter(s => s.reservedBy && new Date(s.date).getTime() + (s.duree || 45) * 60000 < now)
    .sort((a,b)=> new Date(b.date) - new Date(a.date));
  const garde = s => {
    if(q && !String(s.reservedName || '').toLowerCase().includes(q)) return false;
    if(histo.filtre === 'recap') return !s.isExperimental && !s.experimentalCancelled && !s.definitivelyCancelled && !(s.vocab && s.recordingUrl);
    if(histo.filtre === 'regulariser') return ['anomalie','a_verifier','report_propose'].includes(seanceStatut(s, now));
    return true;
  };
  const liste = passees.filter(garde);
  const nb = f => passees.filter(s => { const o = histo.filtre; histo.filtre = f; const r = garde(s); histo.filtre = o; return r; }).length;
  body.innerHTML = `
    <p class="page-intro">Séances passées. Ouvre une séance pour ajouter le vocabulaire et l'enregistrement, ou pour la régulariser.</p>
    <div class="ui-filters" role="group" aria-label="Filtrer l'historique">
      ${[['tous','Toutes'],['recap','Récapitulatif à compléter'],['regulariser','À régulariser']].map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${histo.filtre===id}" onclick="histoSet('filtre','${id}')">${l}<span class="n">${nb(id)}</span></button>`).join('')}
    </div>
    <div class="field field-search"><label for="histo-q">Rechercher un élève</label><input id="histo-q" type="search" value="${esc(histo.q)}" oninput="histoSet('q', this.value)" autocomplete="off"></div>
    ${liste.length ? seanceListeHTML(liste.slice(0, histo.n), {recap:true}) : profEmptyHTML('clock', 'Aucune séance', '')}
    ${liste.length > histo.n ? `<div class="btn-row"><button type="button" class="btn btn-secondary" onclick="histoSet('n', ${histo.n + 40})">Afficher plus (${liste.length - histo.n} restantes)</button></div>` : ''}`;
}
async function loadTeacherHistorique(){
  await Promise.all([seancesCharger(true), profEnsureStudents()]);
  renderTeacherHistorique(); aTraiterRender(); seanceRafraichir();
}

/* ---------------------------------------------------------------------------
   COURS › DISPONIBILITÉS et FORFAITS › NOUVEAU FORFAIT
   --------------------------------------------------------------------------- */
function dispoTabRender(){
  const body = profBody(); if(!body || !profOnTab('disponibilites')) return;
  const now = Date.now();
  const libres = SEANCES.liste.filter(s => !s.reservedBy && !s.isExperimental && new Date(s.date).getTime() > now);
  body.innerHTML = dispoFormHTML() + `<h2 class="section-title">Créneaux libres à venir <span class="count-pill">${libres.length}</span></h2>
    ${libres.length ? seanceListeHTML(libres.slice(0, 60)) : profEmptyHTML('calendar', 'Aucun créneau libre', 'Les élèves ne peuvent rien réserver pour le moment.')}`;
}
function packTabRender(){
  const body = profBody(); if(!body || !profOnTab('forfait-nouveau')) return;
  body.innerHTML = packFormHTML();
}

/* ---- Points d'entrée appelés par les actions existantes (05, 04, 13…) ---- */
function renderAdminDispo(){
  if(profOnTab('dispo')) agendaRender();
  else if(profOnTab('disponibilites')) dispoTabRender();
  else if(profOnTab('forfait-nouveau')) packTabRender();
}
async function loadAdminDispo(){
  await Promise.all([seancesCharger(true), (studentsData.length ? null : loadTeacherStudentsQuiet())]);
  if(typeof loadPackSlotsByStudent === 'function') await loadPackSlotsByStudent();
  if(typeof loadPaymentLinks === 'function'){ try{ await loadPaymentLinks(); }catch(e){} }
  renderAdminDispo();
  if(profOnTab('atraiter')) aTraiterRender();
  if(profOnTab('historique')) renderTeacherHistorique();
  if(['finances','accueil'].includes(teacherTab) && screen === 'teacher') profRefreshCurrent();
  seanceRafraichir();
}

registerTeacherTab('dispo', ()=> loadAdminDispo());
registerTeacherTab('disponibilites', ()=> loadAdminDispo());
registerTeacherTab('forfait-nouveau', ()=> loadAdminDispo());
registerTeacherTab('atraiter', ()=> aTraiterLoad());
registerTeacherTab('historique', ()=> loadTeacherHistorique());
/* Anciens onglets : ils ouvrent l'emplacement unique. */
registerTeacherTab('anomalies', ()=>{ teacherTab = 'atraiter'; render(); });
registerTeacherTab('confirmations', ()=>{ teacherTab = 'atraiter'; render(); });
