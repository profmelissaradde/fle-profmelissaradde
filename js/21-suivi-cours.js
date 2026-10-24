/* ============================================================================
   SUIVI DES RÉPONSES AUX RAPPELS — confirmations, annulations, déplacements
   Source unique : le serveur (Apps Script, service coursAction_) écrit
     - disponibilites/{id}.suivi    statut actuel de la réservation
     - evenementsCours/{id}         historique (ajout seul, jamais modifié)
     - notificationsProf/{id}       notifications de Melissa (lu / actionRequise)
   Ce module ne fait qu'AFFICHER ces données et appeler le serveur : aucune
   règle (délais, tolérances, décompte du forfait) n'est recalculée ici.
   ============================================================================ */
const SUIVI_STATUTS = {
  en_attente: {label:'En attente de réponse', cls:'badge-warning'},
  confirme: {label:'Confirmé', cls:'badge-success'},
  deplacement_demande: {label:'Déplacement demandé', cls:'badge-info'},
  report_propose: {label:'Nouvelle date proposée', cls:'badge-info'},
  proposition_refusee: {label:"Proposition refusée par l'élève", cls:'badge-warning'},
  annule: {label:'Annulé', cls:''},
  annule_tardif: {label:'Annulé tardivement', cls:'badge-warning'},
  annule_auto: {label:'Annulé automatiquement', cls:'badge-danger'},
  sans_rappel: {label:'Rappel pas encore envoyé', cls:''}
};
const SUIVI_EVENEMENTS = {
  lesson_reminder_sent: 'Rappel 24 h envoyé', lesson_reminder_resent: 'Rappel renvoyé',
  lesson_confirmed: 'Cours confirmé', lesson_status_corrected: 'Statut corrigé par Melissa',
  lesson_cancel_requested: "Demande d'annulation", lesson_cancelled: 'Cours annulé', lesson_auto_cancelled: 'Annulé automatiquement (non confirmé à H-1)',
  lesson_unconfirmed: 'Non confirmé à H-1', lesson_reschedule_requested: 'Déplacement demandé',
  lesson_reschedule_proposed: 'Nouvelle date proposée', lesson_reschedule_accepted: 'Déplacement accepté',
  lesson_reschedule_refused: 'Déplacement refusé', lesson_rescheduled: 'Cours déplacé', lesson_completed: 'Séance réalisée'
};
const SUIVI_AUTEURS = {eleve:'élève', administratrice:'Melissa', automatisation:'automatisation'};
const SUIVI_CANAUX = {email:'e-mail', plateforme:'plateforme', automatisation:'automatique'};

/* Même lecture que suiviStatut_ côté serveur. */
function suiviStatutCli(s){
  if(s.definitivelyCancelled || s.experimentalCancelled){
    const st = (s.suivi || {}).statut;
    return st && st.indexOf('annule') === 0 ? st : 'annule';
  }
  const v = s.suivi || {};
  const annule = String(v.statut || '').indexOf('annule') === 0;
  if(v.statut && v.eleveId === s.reservedBy && v.date === s.date && !annule) return v.statut;
  const rq = s.rescheduleRequest;
  if(rq && rq.by === 'student' && rq.status === 'pending') return 'deplacement_demande';
  if(rq && rq.by === 'teacher' && rq.status === 'pending') return 'report_propose';
  if(s.confirmed === true) return 'confirme';
  return s.reminderSentForDate === s.date ? 'en_attente' : 'sans_rappel';
}
function suiviBadgeHTML(statut){ const d = SUIVI_STATUTS[statut] || {label: statut, cls:''}; return `<span class="badge ${d.cls}">${esc(d.label)}</span>`; }
function suiviFmt(iso){ try{ return new Date(iso).toLocaleString('fr-FR', {dateStyle:'short', timeStyle:'short'}); }catch(e){ return ''; } }
function suiviDetails(e){ try{ return e.details ? JSON.parse(e.details) : {}; }catch(x){ return {}; } }
function suiviEvenementHTML(e){
  const d = suiviDetails(e);
  const extra = [];
  if(d.tolerances) extra.push(`tolérance ${d.tolerances.utilisees}/2 utilisée`);
  if(d.decomptee) extra.push('séance décomptée');
  if(d.forfait && !d.decomptee) extra.push(esc(d.forfait));
  if(d.to) extra.push('→ ' + fmtSlotDate(d.to));
  if(d.disponibilites) extra.push('3 disponibilités proposées');
  if(d.motif && e.type !== 'lesson_rescheduled') extra.push('« ' + esc(d.motif) + ' »');
  return `<li><b>${suiviFmt(e.at)}</b> — ${esc(SUIVI_EVENEMENTS[e.type] || e.type)}
    <span class="tp-dim">· ${esc(SUIVI_CANAUX[e.canal] || e.canal || '')} · par ${esc(SUIVI_AUTEURS[e.auteur] || e.auteur || '')}${e.coursDate ? ' · cours du ' + fmtSlotDate(e.coursDate) : ''}</span>${extra.length ? ' — ' + extra.join(' · ') : ''}</li>`;
}

/* ---------------------------------------------------------------------------
   ONGLET PROFESSEURE : Cours › Confirmations et demandes
   --------------------------------------------------------------------------- */
let suiviCentre = {filtre:'tous', recherche:'', ouvert:null, data:null};
const SUIVI_FILTRES = [['tous','Tous'],['confirme','Confirmations'],['annulations','Annulations'],['deplacements','Demandes de déplacement'],['attente','En attente'],['auto','Annulations automatiques'],['erreurs','Erreurs de synchronisation']];
async function suiviCentreLoad(){
  const body = profBody(); if(!body) return;
  const now = Date.now();
  const depuis = new Date(now - 14*24*3600000).toISOString();
  if(typeof plateformeCharger === 'function'){ try{ await plateformeCharger(); }catch(e){} }
  try{
    const [snapS, snapE] = await Promise.all([
      db.collection('disponibilites').where('date', '>=', depuis).get(),
      db.collection('evenementsCours').where('at', '>=', new Date(now - 60*24*3600000).toISOString()).get().catch(()=>({docs:[]}))
    ]);
    const slots = snapS.docs.map(d=>({id:d.id, ...d.data()})).filter(s => s.date >= depuis);
    const events = snapE.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> String(b.at).localeCompare(String(a.at)));
    suiviCentre.data = {slots, events, now};
  }catch(e){
    if(profOnTab('confirmations')) body.innerHTML = `<p class="tp-warn">Lecture impossible pour le moment (${esc(e.message || e)}).</p>`;
    return;
  }
  if(profOnTab('confirmations')) suiviCentreRender();
}
function suiviCentreLignes(){
  const {slots, events, now} = suiviCentre.data;
  const lignes = [];
  slots.forEach(s=>{
    if(!s.reservedBy) return;
    const debut = new Date(s.date).getTime();
    const statut = suiviStatutCli(s);
    if(debut < now - 2*3600000 && String(statut).indexOf('annule') !== 0) return;   /* cours passés : suivis dans Reports & anomalies */
    const v = (s.suivi && s.suivi.date === s.date) ? s.suivi : null;
    lignes.push({id:s.id, slot:s, eleveId:s.reservedBy, nom:s.reservedName || 'Élève', date:s.date, statut,
      reponse: v ? `${SUIVI_CANAUX[v.canal] || v.canal}${v.par === 'administratrice' ? ' (Melissa)' : ''}` : (s.confirmed && s.confirmedAt ? 'e-mail' : '—'),
      reponduLe: v ? v.at : (s.confirmed && s.confirmedAt ? (s.confirmedAt.toDate ? s.confirmedAt.toDate().toISOString() : s.confirmedAt) : null),
      erreur: s.zoomSync && ['error','retry'].includes(s.zoomSync.status)});
  });
  /* Annulations dont le créneau a été libéré : la trace vient de l'événement. */
  events.filter(e => ['lesson_cancelled','lesson_auto_cancelled'].includes(e.type) && e.coursDate && new Date(e.coursDate).getTime() >= now - 7*24*3600000).forEach(e=>{
    if(lignes.some(l => l.id === e.seanceId && l.date === e.coursDate && l.eleveId === e.eleveId)) return;
    lignes.push({id:e.seanceId, slot:null, eleveId:e.eleveId, nom:e.eleveNom || 'Élève', date:e.coursDate, statut:e.nouveauStatut || 'annule',
      reponse: SUIVI_CANAUX[e.canal] || e.canal, reponduLe: e.at, erreur:false});
  });
  return lignes;
}
function suiviCentreFiltrer(l, f){
  if(f === 'tous') return true;
  if(f === 'confirme') return l.statut === 'confirme';
  if(f === 'annulations') return l.statut.indexOf('annule') === 0;
  if(f === 'deplacements') return ['deplacement_demande','report_propose','proposition_refusee'].includes(l.statut);
  if(f === 'attente') return l.statut === 'en_attente' || l.statut === 'sans_rappel';
  if(f === 'auto') return l.statut === 'annule_auto';
  if(f === 'erreurs') return l.erreur;
  return true;
}
function suiviCentreRender(){
  const body = profBody(); if(!body || !suiviCentre.data) return;
  const now = suiviCentre.data.now;
  const toutes = suiviCentreLignes();
  const q = suiviCentre.recherche.trim().toLowerCase();
  const prio = l => (l.statut === 'deplacement_demande' ? 0 : l.statut === 'en_attente' ? 1 : 2);
  const lignes = toutes.filter(l => suiviCentreFiltrer(l, suiviCentre.filtre) && (!q || l.nom.toLowerCase().includes(q)))
    .sort((a,b)=>{
      const fa = new Date(a.date).getTime() < now, fb = new Date(b.date).getTime() < now;
      if(fa !== fb) return fa ? 1 : -1;
      return (new Date(a.date) - new Date(b.date)) || (prio(a) - prio(b));
    });
  const n = f => toutes.filter(l => suiviCentreFiltrer(l, f)).length;
  const filtres = `<div class="ui-filters" role="group" aria-label="Filtrer les réponses">${SUIVI_FILTRES.map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${suiviCentre.filtre===id}" onclick="suiviCentreFiltre('${id}')">${l}<span class="n">${n(id)}</span></button>`).join('')}</div>`;
  const recherche = `<div class="field" style="max-width:340px;"><label for="suivi-q">Rechercher un élève</label><input id="suivi-q" type="search" value="${esc(suiviCentre.recherche)}" oninput="suiviCentreRecherche(this.value)" autocomplete="off"></div>`;
  const rows = lignes.map(l=>{
    const cle = l.id + '|' + l.date;
    const ouvert = suiviCentre.ouvert === cle;
    const s = l.slot;
    const futur = new Date(l.date).getTime() > now;
    const actions = [`<button type="button" class="btn btn-secondary btn-sm" aria-expanded="${ouvert}" onclick="suiviCentreOuvrir('${esc(cle)}')">${ouvert ? 'Fermer' : 'Voir'}</button>`];
    if(s && futur && l.statut === 'en_attente' && s.reservedEmail && new Date(l.date).getTime() - now > 3600000) actions.push(`<button type="button" class="btn btn-ghost btn-sm" onclick="suiviRelancer('${s.id}')">Relancer</button>`);
    const ligne = `<tr><td>${esc(l.nom)}${s && s.isExperimental ? ' <span class="badge">Expérimental</span>' : ''}</td><td>${fmtSlotDate(l.date)}</td><td>${esc(l.reponse || '—')}</td>
      <td>${suiviBadgeHTML(l.statut)}${l.erreur ? ' <span class="badge badge-danger">Zoom à synchroniser</span>' : ''}</td><td>${l.reponduLe ? suiviFmt(l.reponduLe) : '—'}</td>
      <td><div class="btn-row" style="margin:0;">${actions.join('')}</div></td></tr>`;
    return ligne + (ouvert ? `<tr class="suivi-detail"><td colspan="6">${suiviDetailHTML(l)}</td></tr>` : '');
  }).join('');
  const reglage = (typeof plateforme !== 'undefined' && plateforme.data && plateforme.data.confirmation && plateforme.data.confirmation.annulationAuto === true)
    ? 'Annulation automatique à H-1 : <b>activée</b>.' : 'Annulation automatique à H-1 : <b>désactivée</b> (tu es seulement prévenue).';
  body.innerHTML = `<p class="page-intro">Réponses aux e-mails de rappel et aux boutons de l'espace élève. Les données viennent directement de Firestore ; rien n'est simulé. ${reglage} <a href="#" onclick="paramSection='confirmation'; goTeacherTab('parametres'); return false;">Régler</a></p>
    ${filtres}${recherche}
    ${lignes.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Cours prévu</th><th scope="col">Réponse reçue</th><th scope="col">Statut</th><th scope="col">Date de réponse</th><th scope="col">Action</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : profEmptyHTML('check', 'Rien à afficher', suiviCentre.filtre === 'tous' ? 'Aucun cours réservé dans les 14 derniers jours ni à venir.' : 'Aucun cours ne correspond à ce filtre.')}`;
}
function suiviDetailHTML(l){
  const s = l.slot;
  const evs = suiviCentre.data.events.filter(e => e.seanceId === l.id && (!e.eleveId || e.eleveId === l.eleveId));
  let html = '';
  if(s){
    const rq = s.rescheduleRequest || {};
    const futur = new Date(s.date).getTime() > Date.now();
    if(rq.by === 'student' && rq.status === 'pending'){
      const av = [rq.availability1, rq.availability2, rq.availability3].filter(Boolean);
      html += `<p><b>Disponibilités proposées par l'élève</b> (le cours reste prévu le ${fmtSlotDate(s.date)} tant que tu n'as pas choisi) :</p>
        <ul class="tp-list">${av.map(a=>`<li>${fmtSlotDate(a)} <button type="button" class="btn btn-sm" onclick="suiviAccepterDispo('${s.id}','${esc(a)}')">Choisir ce créneau</button></li>`).join('')}</ul>
        <div class="field"><label for="suivi-motif-${s.id}">Message à l'élève (si tu refuses)</label><input id="suivi-motif-${s.id}" type="text" maxlength="300"></div>
        <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="suiviRefuserDemande('${s.id}')">Refuser la demande (cours maintenu)</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="suiviProposerAutre('${s.id}')">Proposer une autre date</button></div>`;
    } else if(futur && !s.definitivelyCancelled && !s.experimentalCancelled && suiviStatutCli(s) !== 'confirme'){
      html += `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="suiviMarquerConfirme('${s.id}')">Marquer comme confirmé</button></div>`;
    }
    if(s.zoomSync && ['error','retry'].includes(s.zoomSync.status)) html += `<p class="tp-warn">Réunion Zoom non synchronisée${s.zoomSync.lastError ? ' : ' + esc(s.zoomSync.lastError) : ''}. <button type="button" class="btn btn-ghost btn-sm" onclick="rptRelancerZoom('${s.id}').then(suiviCentreLoad)">Réessayer</button></p>`;
  }
  html += evs.length ? `<p><b>Historique</b></p><ul class="tp-list">${evs.map(suiviEvenementHTML).join('')}</ul>` : '<p class="tp-dim">Aucun événement enregistré pour ce cours (les réponses antérieures à cette mise à jour n\'ont pas d\'historique).</p>';
  if(l.eleveId) html += `<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" onclick="openAdminStudentSection('${l.eleveId}','reponses')">Fiche de l'élève</button></div>`;
  return html;
}
function suiviCentreFiltre(f){ suiviCentre.filtre = f; suiviCentreRender(); }
function suiviCentreRecherche(v){
  suiviCentre.recherche = v; suiviCentreRender();
  const el = document.getElementById('suivi-q'); if(el){ el.focus(); el.setSelectionRange(v.length, v.length); }
}
function suiviCentreOuvrir(cle){ suiviCentre.ouvert = suiviCentre.ouvert === cle ? null : cle; suiviCentreRender(); }
async function suiviAppel(payload, succes){
  try{
    const r = await rptCall(payload);
    if(!r.ok) throw new Error(r.error || 'Action impossible.');
    uiNotify(r.already ? 'Déjà enregistré.' : succes, 'success');
    return r;
  }catch(e){ uiNotify(e.message, 'error'); return null; }
  finally{ if(profOnTab('confirmations')) suiviCentreLoad(); }
}
function suiviRelancer(slotId){
  if(!confirm("Renvoyer à l'élève l'e-mail de rappel (mêmes boutons Confirmer / Annuler / Déplacer) ?")) return;
  suiviAppel({action:'resendReminder', slotId}, 'Rappel renvoyé.');
}
function suiviMarquerConfirme(slotId){
  if(!confirm("Marquer ce cours comme confirmé (par exemple si l'élève t'a répondu par message) ?")) return;
  suiviAppel({action:'lessonAction', slotId, type:'confirm'}, 'Cours marqué comme confirmé.');
}
function suiviRefuserDemande(slotId){
  if(!confirm("Refuser la demande de déplacement ? Le cours reste à sa date d'origine et l'élève est prévenu(e) par e-mail.")) return;
  const el = document.getElementById('suivi-motif-' + slotId);
  suiviAppel({action:'refuseRescheduleRequest', slotId, motif: el ? el.value : ''}, 'Demande refusée, élève prévenu(e).');
}
async function suiviAccepterDispo(slotId, iso){
  const s = (suiviCentre.data.slots || []).find(x => x.id === slotId); if(!s) return;
  if(!confirm(`Déplacer le cours au ${fmtSlotDate(iso)} ? La réunion Zoom sera synchronisée et l'élève prévenu(e).`)) return;
  try{
    const r = await rptAppliquer(s, iso, s.duree || 45, 'student_availability');
    if(r.ok) uiNotify(`Cours déplacé au ${fmtSlotDate(r.newDate)}. ${rptMessageZoom(r)}`, 'success');
  }catch(e){ uiNotify(e.message, 'error'); }
  suiviCentreLoad();
}
async function suiviProposerAutre(slotId){
  const s = (suiviCentre.data.slots || []).find(x => x.id === slotId); if(!s) return;
  const v = prompt('Nouvelle date proposée (format AAAA-MM-JJ HH:MM, ton heure locale) :');
  if(!v) return;
  const d = new Date(v.trim().replace(' ', 'T'));
  if(isNaN(d.getTime())){ uiNotify('Date non reconnue.', 'warning'); return; }
  try{
    const r = await rptProposer(s, d.toISOString(), s.duree || 45);
    if(r.ok) uiNotify("Proposition envoyée à l'élève.", 'success');
  }catch(e){ uiNotify(e.message, 'error'); }
  suiviCentreLoad();
}
registerTeacherTab('confirmations', ()=>{ suiviCentre.data = null; suiviCentreLoad(); });

/* ---------------------------------------------------------------------------
   NOTIFICATIONS DE LA PROFESSEURE (temps réel)
   --------------------------------------------------------------------------- */
let suiviNotifs = {liste:[], unsub:null, erreur:null};
function suiviNotifsDemarrer(){
  if(suiviNotifs.unsub || !isTeacher || !auth.currentUser) return;
  try{
    suiviNotifs.unsub = db.collection('notificationsProf').orderBy('at', 'desc').limit(150).onSnapshot(snap=>{
      suiviNotifs.liste = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> String(b.at).localeCompare(String(a.at)));
      suiviNotifs.erreur = null;
      navCounts.notifs = suiviNotifs.liste.filter(n => !n.lu).length;
      navCounts.demandes = suiviNotifs.liste.filter(n => n.actionRequise === true).length;
      if(typeof updateNavChrome === 'function') updateNavChrome();
      if(profOnTab('notifications')) suiviNotifsRender();
      if(profOnTab('confirmations') && suiviCentre.data) suiviCentreLoad();
    }, err=>{ suiviNotifs.erreur = err && err.message; suiviNotifs.unsub = null; });
  }catch(e){ suiviNotifs.unsub = null; }
}
function suiviNotifsArreter(){ if(suiviNotifs.unsub){ try{ suiviNotifs.unsub(); }catch(e){} suiviNotifs.unsub = null; } }
onAfterRender(()=>{ if(isTeacher) suiviNotifsDemarrer(); else suiviNotifsArreter(); });
let suiviNotifsFiltre = 'non_lues';
function suiviNotifsRender(){
  const body = profBody(); if(!body) return;
  const l = suiviNotifs.liste;
  const vis = l.filter(n => suiviNotifsFiltre === 'toutes' ? true : suiviNotifsFiltre === 'action' ? n.actionRequise === true : !n.lu);
  const chip = (id, lab, nb) => `<button type="button" class="ui-chip" aria-pressed="${suiviNotifsFiltre===id}" onclick="suiviNotifsFiltre='${id}'; suiviNotifsRender()">${lab}<span class="n">${nb}</span></button>`;
  body.innerHTML = `${suiviNotifs.erreur ? `<p class="tp-warn">Notifications indisponibles (${esc(suiviNotifs.erreur)}). Vérifie que les règles Firestore ont bien été publiées.</p>` : ''}
    <div class="ui-filters" role="group" aria-label="Filtrer les notifications">${chip('non_lues','Non lues', l.filter(n=>!n.lu).length)}${chip('action','Intervention requise', l.filter(n=>n.actionRequise===true).length)}${chip('toutes','Toutes', l.length)}</div>
    ${l.some(n=>!n.lu) ? `<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" onclick="suiviNotifsToutLu()">Tout marquer comme lu</button></div>` : ''}
    ${vis.length ? vis.map(n=>`<div class="teacher-entry${n.lu ? '' : ' is-unread'}">
        <div class="who">${n.lu ? '' : '<span class="badge badge-info">Nouveau</span> '}${n.actionRequise ? '<span class="badge badge-warning">Intervention requise</span> ' : ''}${esc(n.message || '')}</div>
        <div class="meta">${suiviFmt(n.at)}${n.coursDate ? ' · cours du ' + fmtSlotDate(n.coursDate) : ''}</div>
        <div class="teacher-entry-actions">${n.seanceId ? `<button type="button" onclick="suiviNotifOuvrir('${n.id}')">Voir le cours</button>` : ''}${n.lu ? '' : `<button type="button" style="background:none; color:var(--navy);" onclick="suiviNotifLu('${n.id}')">Marquer comme lu</button>`}</div></div>`).join('')
      : profEmptyHTML('check', suiviNotifsFiltre === 'non_lues' ? 'Aucune notification non lue' : 'Aucune notification', '')}`;
}
async function suiviNotifLu(id){
  try{ await db.collection('notificationsProf').doc(id).update({lu:true, luAt: new Date().toISOString()}); }
  catch(e){ uiNotify('Impossible de marquer comme lu pour le moment.', 'error'); }
}
async function suiviNotifsToutLu(){
  const ids = suiviNotifs.liste.filter(n=>!n.lu).map(n=>n.id);
  try{
    for(let i = 0; i < ids.length; i += 400){
      const b = db.batch();
      ids.slice(i, i + 400).forEach(id => b.update(db.collection('notificationsProf').doc(id), {lu:true, luAt: new Date().toISOString()}));
      await b.commit();
    }
  }catch(e){ uiNotify('Impossible de tout marquer comme lu pour le moment.', 'error'); }
}
function suiviNotifOuvrir(id){
  const n = suiviNotifs.liste.find(x => x.id === id); if(!n) return;
  if(!n.lu) suiviNotifLu(id);
  suiviCentre.ouvert = n.seanceId + '|' + n.coursDate;
  suiviCentre.filtre = 'tous'; suiviCentre.recherche = '';
  goTeacherTab('confirmations');
}
registerTeacherTab('notifications', ()=>{ suiviNotifsDemarrer(); suiviNotifsRender(); });

/* ---------------------------------------------------------------------------
   FICHE ÉLÈVE : Historique des réponses et confirmations
   --------------------------------------------------------------------------- */
if(typeof FICHE_SECTIONS !== 'undefined' && !FICHE_SECTIONS.some(x => x[0] === 'reponses')){
  const i = FICHE_SECTIONS.findIndex(x => x[0] === 'forfait');
  FICHE_SECTIONS.splice(i >= 0 ? i + 1 : FICHE_SECTIONS.length, 0, ['reponses', 'Réponses & confirmations']);
}
if(typeof ficheSectionHTML === 'function'){
  const _ficheSectionHTML = ficheSectionHTML;
  ficheSectionHTML = function(section, s){
    if(section !== 'reponses') return _ficheSectionHTML(section, s);
    setTimeout(()=>suiviFicheCharger(s, false), 0);
    return `<div id="fiche-reponses" aria-live="polite"><p class="teacher-empty" role="status">Chargement…</p></div>`;
  };
}
async function suiviFicheCharger(s, complet){
  const el = document.getElementById('fiche-reponses'); if(!el) return;
  try{
    const snap = await db.collection('evenementsCours').where('eleveId', '==', s.id).get();
    const evs = snap.docs.map(d=>({id:d.id, ...d.data()})).filter(e => e.eleveId === s.id).sort((a,b)=> String(b.at).localeCompare(String(a.at)));
    const ilY30 = Date.now() - 30*24*3600000;
    const log = Array.isArray(s.noShowLog) ? s.noShowLog : [];
    const tardives = log.filter(x => x && x.by === 'student' && x.late === true && new Date(x.ts).getTime() >= ilY30);
    const utilisees = Math.min(2, tardives.length);
    const prochaineLiberation = tardives.length ? new Date(Math.min(...tardives.map(x => new Date(x.ts).getTime())) + 30*24*3600000) : null;
    const vis = complet ? evs : evs.slice(0, 15);
    el.innerHTML = `<div class="stat-row">
        ${profStatHTML('tolérances utilisées (30 jours glissants)', `${utilisees} / 2`, utilisees >= 2 ? 'danger' : utilisees ? 'warning' : 'ok')}
        ${profStatHTML('tolérances restantes', Math.max(0, 2 - tardives.length), tardives.length >= 2 ? 'danger' : 'ok')}
        ${profStatHTML('confirmations', evs.filter(e => e.type === 'lesson_confirmed').length, '')}
        ${profStatHTML('annulations', evs.filter(e => ['lesson_cancelled','lesson_auto_cancelled'].includes(e.type)).length, '')}
      </div>
      ${prochaineLiberation && tardives.length ? `<p class="tp-dim">Une tolérance se libère le ${prochaineLiberation.toLocaleDateString('fr-FR')}.</p>` : ''}
      <p class="tp-dim">Tolérance : annulation à moins d'une heure ou cours non confirmé à H-1. Au-delà de 2 sur 30 jours, la séance est décomptée.</p>
      ${vis.length ? `<ul class="tp-list">${vis.map(suiviEvenementHTML).join('')}</ul>` : profEmptyHTML('clock', 'Aucune réponse enregistrée', "L'historique commence avec cette mise à jour : les réponses plus anciennes n'ont pas été enregistrées.")}
      ${!complet && evs.length > vis.length ? `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="suiviFicheCharger(studentsData.find(x=>x.id==='${s.id}'), true)">Voir l'historique complet (${evs.length})</button></div>` : ''}`;
  }catch(e){ el.innerHTML = `<p class="tp-warn">Historique indisponible (${esc(e.message || e)}).</p>`; }
}

/* ---------------------------------------------------------------------------
   DÉCISIONS SUR LES SÉANCES (forfaits) → événement dans l'historique
   --------------------------------------------------------------------------- */
async function suiviEvenementProf(slotId, type, details){
  try{
    const doc = await db.collection('disponibilites').doc(slotId).get();
    const s = doc.exists ? doc.data() : {};
    const at = new Date().toISOString();
    await db.collection('evenementsCours').doc(type + '_' + slotId + '_' + Date.now().toString(36)).set({
      type, at, eleveId: s.reservedBy || null, eleveNom: s.reservedName || null, seanceId: slotId, packId: s.packId || null, isPack: s.isPack === true,
      coursDate: s.date || null, canal: 'plateforme', auteur: 'administratrice', ancienStatut: details.avant || null, nouveauStatut: details.apres || null,
      resultat: 'ok', details: JSON.stringify(details).slice(0, 1500)
    });
  }catch(e){ console.warn('Événement non enregistré', e); }
}
if(typeof forfaitDecider === 'function'){
  const _forfaitDecider = forfaitDecider;
  forfaitDecider = async function(slotId, decision, motif){
    const r = await _forfaitDecider(slotId, decision, motif);
    if(r && r.ok) await suiviEvenementProf(slotId, decision === 'realisee' ? 'lesson_completed' : 'lesson_status_corrected', {decision, motif: motif || null, apres: decision});
    return r;
  };
}

/* ---------------------------------------------------------------------------
   ESPACE ÉLÈVE : statut + bouton « Confirmer mon cours »
   --------------------------------------------------------------------------- */
function suiviEleveBlocHTML(s){
  if(!s || s.isExperimental || s.experimentalCancelled || s.definitivelyCancelled) return '';
  const now = Date.now(), debut = new Date(s.date).getTime();
  if(!(debut > now)) return '';
  const st = suiviStatutCli(s);
  if(st === 'confirme'){
    const at = s.suivi && s.suivi.at ? s.suivi.at : null;
    return `<p class="suivi-eleve"><span class="badge badge-success">Confirmé</span>${at ? ` <span class="tp-dim">le ${suiviFmt(at)}</span>` : ''}</p>`;
  }
  if(st === 'deplacement_demande' || st === 'report_propose') return '';
  const rappel = s.reminderSentForDate === s.date;
  return `<p class="suivi-eleve">${rappel ? '<span class="badge badge-warning">Confirmation attendue</span> <span class="tp-dim">Merci de confirmer jusqu\'à 1 h avant le cours.</span>' : ''}</p>
    <button type="button" class="rec-btn" style="margin-top:6px;" onclick="suiviEleveConfirmer('${s.id}', this)">✅ Confirmer mon cours</button>`;
}
async function suiviEleveConfirmer(slotId, btn){
  if(btn){ btn.disabled = true; btn.textContent = 'Enregistrement…'; }
  try{
    const r = await callDriveScript({action:'lessonAction', slotId, type:'confirm'});
    uiNotify(r.message || 'Ton cours est bien confirmé.', 'success');
  }catch(e){
    const indispo = /action inconnue|Réponse HTTP|Failed to fetch|NetworkError|Load failed/i.test(e && e.message || '');
    uiNotify(indispo ? "La confirmation n'a pas pu être enregistrée pour le moment. Réessaie plus tard ou utilise le bouton de l'e-mail de rappel." : (e.message || 'Confirmation impossible.'), 'error');
    if(btn){ btn.disabled = false; btn.textContent = '✅ Confirmer mon cours'; }
    return;
  }
  if(typeof loadDispoEleve === 'function') await loadDispoEleve();
  if(document.getElementById('next-course-banner')) await loadNextCourseBanner();
}
/* Demande de déplacement depuis la plateforme → même service que l'e-mail.
   Renvoie true si le serveur a enregistré la demande, false s'il est injoignable
   (l'ancien circuit prend alors le relais), et lève une erreur s'il la refuse. */
async function suiviEleveDemanderDeplacement(slotId, dates){
  try{
    const r = await callDriveScript({action:'lessonAction', slotId, type:'reschedule_request', availability: dates});
    return {ok:true, message: r.message};
  }catch(e){
    if(/action inconnue|Réponse HTTP|Failed to fetch|NetworkError|Load failed/i.test(e && e.message || '')) return {ok:false};
    throw e;
  }
}
