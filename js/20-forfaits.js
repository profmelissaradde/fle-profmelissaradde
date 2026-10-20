/* ======================= FORFAITS : UNE SEULE LOGIQUE DE DÉCOMPTE =======================
   Toutes les interfaces (Finances, Élèves, fiche élève, réservation de forfait, espace élève,
   alertes de renouvellement, tableau de bord) calculent le solde d'un forfait ICI, à partir
   des séances réelles — jamais à partir du compteur « pack.used ».

   Pourquoi : « pack.used » est augmenté dès qu'une séance du forfait est PROGRAMMÉE
   (reserverPack) et diminué quand une annulation est tolérée (Apps Script). Il compte donc
   les séances engagées, pas les séances consommées : une séance en anomalie y restait comptée
   comme « utilisée ». Ce compteur est conservé tel quel (historique, Apps Script) mais n'est
   plus affiché comme « séances utilisées ».

   Règles (une date passée ne signifie JAMAIS à elle seule « réalisée ») :
     realisee        décision « réalisée » de la professeure, ou preuve existante : les deux
                     liens Zoom cliqués, ou anomalie levée (« corriger l'anomalie »), ou
                     vocabulaire + enregistrement ajoutés                        → décomptée
     decomptee       décision motivée de la professeure (absence, annulation tardive au-delà
                     des tolérances), ou annulation tardive excessive de l'élève déjà appliquée
                     par la règle existante (definitivelyCancelled)                → décomptée
     annulee         annulée par la professeure, annulation tolérée, cours expérimental annulé,
                     décision « annuler sans décompte »                        → non décomptée
     anomalie        séance passée non confirmée, signalée en anomalie        → non décomptée
     report_propose  anomalie avec une proposition de nouvelle date en attente → non décomptée
     a_verifier      séance passée sans preuve de réalisation ni anomalie       → non décomptée
     programmee      séance future (y compris report accepté, Zoom en cours) → non décomptée

   Une séance est comptée UNE seule fois : le calcul part de la liste des séances, chacune
   ayant un seul état. Aucune action ne peut donc décompter deux fois. */

const FORFAIT_ETATS = {
  realisee:       {label:'Réalisée',              badge:'badge-success', decompte:true,  mobilise:false},
  decomptee:      {label:'Décomptée',             badge:'badge-warning', decompte:true,  mobilise:false},
  annulee:        {label:'Annulée sans décompte', badge:'',              decompte:false, mobilise:false},
  anomalie:       {label:'En anomalie',           badge:'badge-danger',  decompte:false, mobilise:true},
  report_propose: {label:'Report proposé',        badge:'badge-warning', decompte:false, mobilise:true},
  a_verifier:     {label:'Passée, à vérifier',    badge:'badge-warning', decompte:false, mobilise:true},
  programmee:     {label:'Programmée',            badge:'badge-info',    decompte:false, mobilise:true}
};

function forfaitPreuveRealisation(s){
  return !!((s.clickedByStudent && s.clickedByTeacher) || s.anomalieHandled || (s.vocab && s.recordingUrl));
}
function forfaitEtatSeance(s, now){
  now = now || Date.now();
  const c = s.consommation && s.consommation.statut;
  if(c === 'realisee') return 'realisee';
  if(c === 'decomptee') return 'decomptee';
  if(c === 'annulee') return 'annulee';
  if(s.experimentalCancelled) return 'annulee';
  if(s.definitivelyCancelled) return s.cancelledBy === 'teacher' ? 'annulee' : 'decomptee';
  if(s.anomalie) return (typeof rptPropositionEnAttente === 'function' && rptPropositionEnAttente(s)) ? 'report_propose' : 'anomalie';
  const fin = new Date(s.date).getTime() + (Number(s.duree) || 45) * 60000;
  if(!(fin < now)) return 'programmee';
  return forfaitPreuveRealisation(s) ? 'realisee' : 'a_verifier';
}

/* Séances rattachées au forfait EN COURS d'un élève.
   - Séance avec packId : rattachée au forfait qui porte cet identifiant.
   - Séance sans packId (créée avant cette version) : rattachée au forfait en cours, sauf si
     ce forfait a été démarré après la séance (pack.debut), auquel cas elle appartient à un
     forfait précédent. */
function forfaitSeancesCourantes(eleve, slots){
  const pack = (eleve && eleve.pack) || {};
  const uid = eleve && (eleve.id || eleve.uid);
  return (slots || []).filter(s => {
    if(!s || !s.isPack || s.reservedBy !== uid) return false;
    if(s.packId) return !!pack.id && s.packId === pack.id;
    if(pack.debut) return new Date(s.date).getTime() >= new Date(pack.debut).getTime();
    return true;
  });
}

const FORFAIT_STATUTS = {
  aucun:        {label:'Aucun forfait',             badge:''},
  a_regulariser:{label:'À régulariser',             badge:'badge-danger'},
  termine:      {label:'Terminé',                   badge:''},
  a_renouveler: {label:'À renouveler',              badge:'badge-warning'},
  proche:       {label:"Proche de l'épuisement",    badge:'badge-warning'},
  actif:        {label:'Actif',                     badge:'badge-success'}
};

function forfaitBilan(eleve, slots, now){
  now = now || Date.now();
  const pack = (eleve && eleve.pack) || {};
  const total = Math.max(0, Number(pack.total) || 0);
  const seances = forfaitSeancesCourantes(eleve, slots).map(s => ({s, etat: forfaitEtatSeance(s, now)}))
    .sort((a,b) => new Date(a.s.date) - new Date(b.s.date));
  const n = e => seances.filter(x => x.etat === e).length;
  const b = {
    total, seances,
    realisees: n('realisee'), decomptees: n('decomptee'), annulees: n('annulee'),
    anomalies: n('anomalie') + n('report_propose'), reportsProposes: n('report_propose'),
    aVerifier: n('a_verifier'), programmees: n('programmee'),
    demandesEleve: seances.filter(x => { const r = x.s.rescheduleRequest || {}; return r.by === 'student' && r.status === 'pending'; }).length,
    zoomEnErreur: seances.filter(x => x.s.zoomSync && x.s.zoomSync.status === 'error' && x.s.zoomSync.targetDate === x.s.date).length,
    engageesHistorique: Number(pack.used) || 0
  };
  b.utilisees = b.realisees + b.decomptees;
  b.restantes = Math.max(0, total - b.utilisees);
  b.mobilisees = b.programmees + b.anomalies + b.aVerifier;
  b.reservables = Math.max(0, b.restantes - b.mobilisees);
  b.depassement = Math.max(0, b.utilisees + b.mobilisees - total);
  b.prochaine = (seances.find(x => x.etat === 'programmee') || {}).s || null;
  let st = 'actif';
  if(!total) st = 'aucun';
  else if(b.anomalies || b.aVerifier) st = 'a_regulariser';
  else if(b.utilisees >= total) st = 'termine';
  else if(b.reservables === 0) st = 'a_renouveler';
  else if(b.restantes <= 2) st = 'proche';
  b.statut = st;
  b.statutLabel = FORFAIT_STATUTS[st].label;
  return b;
}
function forfaitStatutHTML(b){
  const st = FORFAIT_STATUTS[b.statut] || FORFAIT_STATUTS.actif;
  return `<span class="badge ${st.badge}">${st.label}</span>`;
}
function forfaitEtatHTML(etat){
  const e = FORFAIT_ETATS[etat] || {label: etat, badge:''};
  return `<span class="badge ${e.badge}">${e.label}</span>`;
}
/* Résumé lisible (une ligne) — mêmes chiffres partout. */
function forfaitResumeHTML(b){
  if(!b.total) return 'aucun forfait défini';
  const parts = [`<b>${b.utilisees}/${b.total}</b> séance${b.utilisees>1?'s':''} utilisée${b.utilisees>1?'s':''}`, `${b.restantes} restante${b.restantes>1?'s':''}`];
  if(b.programmees) parts.push(`${b.programmees} programmée${b.programmees>1?'s':''}`);
  if(b.anomalies) parts.push(`<b style="color:var(--c-danger)">${b.anomalies} en anomalie</b>`);
  if(b.aVerifier) parts.push(`<b style="color:var(--c-warning)">${b.aVerifier} à vérifier</b>`);
  parts.push(`${b.reservables} encore à réserver`);
  return parts.join(' · ');
}

/* Séances de forfait de tous les élèves (une requête), utilisées par les écrans professeure. */
function forfaitSlotsDe(uid){ return (packSlotsByStudent[uid] && packSlotsByStudent[uid].slots) || []; }
function forfaitBilanEleve(eleve){ return forfaitBilan(eleve, forfaitSlotsDe(eleve.id || eleve.uid)); }

/* ---------------------------------------------------------------------------
   DÉCISIONS SUR UNE SÉANCE (professeure) — transaction, idempotence, historique
   --------------------------------------------------------------------------- */
const FORFAIT_DECISIONS = {
  realisee: {label:'Marquer comme réalisée', confirm:"Confirmer que ce cours a bien eu lieu ? Il sera décompté du forfait."},
  annulee:  {label:'Annuler sans décompte', confirm:"Annuler ce cours sans le décompter ? La séance redevient disponible dans le forfait."},
  decomptee:{label:'Décompter définitivement', confirm:"Décompter définitivement ce cours du forfait ? À réserver aux cas prévus par les règles (absence non excusée, annulation tardive au-delà des tolérances)."},
  retablir: {label:'Annuler la décision', confirm:"Annuler la décision prise sur ce cours ? Il redevient « en anomalie »."}
};
const FORFAIT_MOTIFS_DECOMPTE = ['Absence de l\'élève non excusée', 'Annulation tardive au-delà des tolérances', 'Autre (préciser)'];
async function forfaitDecider(slotId, decision, motif){
  const def = FORFAIT_DECISIONS[decision];
  if(!def || !isTeacher) return {ok:false, error:'Action non autorisée.'};
  motif = String(motif || '').trim().slice(0, 500);
  if((decision === 'decomptee' || decision === 'annulee') && !motif){ uiNotify('Indique un motif : il est conservé dans l\'historique de la séance.', 'warning'); return {ok:false}; }
  if(!confirm(def.confirm + (motif ? `\n\nMotif : ${motif}` : ''))) return {ok:false, cancelled:true};
  const ref = db.collection('disponibilites').doc(slotId);
  const quand = new Date().toISOString();
  let avant = null, apres = null;
  try{
    await db.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) throw new Error('Séance introuvable.');
      const s = doc.data();
      avant = {etat: forfaitEtatSeance(s), consommation: s.consommation || null, anomalie: !!s.anomalie};
      const deja = s.consommation && s.consommation.statut;
      if(decision !== 'retablir' && deja === decision) { apres = avant; return; } /* idempotent */
      const upd = {};
      const hist = Array.isArray(s.rescheduleHistory) ? s.rescheduleHistory.slice(-39) : [];
      const req = s.rescheduleRequest;
      if(decision === 'retablir'){
        upd.consommation = null; upd.anomalie = true; upd.anomalieHandled = false;
      } else {
        upd.consommation = {statut: decision, motif, par: auth.currentUser.uid, at: quand, etatAvant: avant.etat};
        upd.anomalie = false;
        /* Une proposition de report encore ouverte n'a plus d'objet : elle est close, et le lien
           de l'e-mail ne peut plus déplacer la séance (statut ≠ pending côté Apps Script). */
        if(req && req.by === 'teacher' && req.status === 'pending') upd.rescheduleRequest = Object.assign({}, req, {status:'annulee', closedAt: quand, closedReason: 'decision_' + decision});
      }
      hist.push({ts: quand, type: 'decision', decision, motif, by: 'teacher', etatAvant: avant.etat});
      upd.rescheduleHistory = hist;
      tx.update(ref, upd);
      apres = {decision};
    });
  }catch(e){ uiNotify("La décision n'a pas pu être enregistrée : " + (e && e.message ? e.message : e), 'error'); return {ok:false}; }
  if(typeof journaliser === 'function') journaliser('seance', `Décision sur une séance : ${def.label}`, {seance: slotId, motif, avant, apres});
  uiNotify('Décision enregistrée.', 'success');
  if(typeof loadPackSlotsByStudent === 'function') await loadPackSlotsByStudent();
  if(typeof profCache !== 'undefined') profCache.slotsAt = 0;
  return {ok:true};
}
/* Formulaire inline de décision (évite les fenêtres prompt()). */
function forfaitDecisionFormHTML(s){
  const etat = forfaitEtatSeance(s);
  const id = s.id;
  const decide = s.consommation && s.consommation.statut;
  if(decide){
    const d = s.consommation;
    return `<div class="decision-box"><p class="tp-dim">Décision : <b>${FORFAIT_ETATS[d.statut] ? FORFAIT_ETATS[d.statut].label : d.statut}</b>${d.motif ? ` — « ${esc(d.motif)} »` : ''}${d.at ? ` · ${new Date(d.at).toLocaleDateString('fr-FR')}` : ''}</p>
      <button type="button" class="btn btn-ghost btn-sm" onclick="forfaitAgir('${id}','retablir')">${FORFAIT_DECISIONS.retablir.label}</button></div>`;
  }
  if(!['anomalie','report_propose','a_verifier'].includes(etat)) return '';
  return `<div class="decision-box" role="group" aria-label="Régulariser la séance">
    <p class="decision-title">Régulariser cette séance</p>
    <div class="field"><label for="motif-${id}">Motif / justification (conservé dans l'historique)</label>
      <input id="motif-${id}" type="text" maxlength="500" list="motifs-decompte" placeholder="ex. Zoom ouvert depuis un autre appareil ; problème technique ; absence…"></div>
    <datalist id="motifs-decompte">${FORFAIT_MOTIFS_DECOMPTE.map(m=>`<option value="${esc(m)}">`).join('')}</datalist>
    <div class="btn-row">
      <button type="button" class="btn btn-sm" onclick="forfaitAgir('${id}','realisee')">${uiIcon('check')} ${FORFAIT_DECISIONS.realisee.label}</button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="forfaitAgir('${id}','annulee')">${FORFAIT_DECISIONS.annulee.label}</button>
      <button type="button" class="btn btn-danger btn-sm" onclick="forfaitAgir('${id}','decomptee')">${FORFAIT_DECISIONS.decomptee.label}</button>
    </div></div>`;
}
async function forfaitAgir(slotId, decision){
  const el = document.getElementById('motif-' + slotId);
  const r = await forfaitDecider(slotId, decision, el ? el.value : '');
  if(r.ok) profRefreshCurrent();
}

/* Relance de l'élève pour une proposition de report (Apps Script : e-mail + compteur). */
async function forfaitRelancer(slotId){
  if(!confirm("Renvoyer à l'élève l'e-mail de proposition (mêmes boutons Accepter / Refuser) ?")) return;
  try{
    const r = await rptCall({action:'remindProposal', slotId});
    if(!r.ok) throw new Error(r.error || 'Relance impossible.');
    uiNotify(`Relance envoyée (${r.reminders} relance${r.reminders>1?'s':''} au total).`, 'success');
    journaliser('seance', 'Relance de proposition de report', {seance: slotId, relances: r.reminders});
  }catch(e){ uiNotify(e.message, 'error'); }
  if(typeof loadPackSlotsByStudent === 'function') await loadPackSlotsByStudent();
  profRefreshCurrent();
}
function forfaitPropositionHTML(s){
  const req = s.rescheduleRequest || {};
  if(!(req.by === 'teacher')) return '';
  const st = {pending:'en attente de réponse', accepted:'acceptée', refused:'refusée', annulee:'close'}[req.status] || req.status;
  const rel = req.reminders ? ` · ${req.reminders} relance${req.reminders>1?'s':''}${req.lastReminderAt ? `, la dernière le ${new Date(req.lastReminderAt).toLocaleString('fr-FR', {dateStyle:'short', timeStyle:'short'})}` : ''}` : '';
  const env = req.createdAt || req.sentAt ? ` · envoyée le ${new Date(req.createdAt || req.sentAt).toLocaleDateString('fr-FR')}` : '';
  const exp = req.expiresAt ? ` · lien valable jusqu'au ${new Date(req.expiresAt).toLocaleDateString('fr-FR')}` : '';
  return `<p class="meta">📨 Proposition du ${req.proposedDate ? fmtSlotDate(req.proposedDate) : '—'} : <b>${st}</b>${env}${rel}${exp}</p>
    ${req.status === 'pending' ? `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="forfaitRelancer('${s.id}')">Relancer l'élève</button></div>` : ''}`;
}
function forfaitHistoriqueHTML(s){
  const h = Array.isArray(s.rescheduleHistory) ? s.rescheduleHistory : [];
  if(!h.length) return '';
  const lab = {proposed:'Proposition envoyée', accepted:'Report accepté', refused:'Proposition refusée', decision:'Décision', reminder:'Relance', moved:'Séance déplacée', zoom:'Synchronisation Zoom'};
  return `<details class="seance-histo"><summary>Historique (${h.length})</summary><ul class="tp-list">${h.slice().reverse().map(e=>`<li>${e.ts ? new Date(e.ts).toLocaleString('fr-FR', {dateStyle:'short', timeStyle:'short'}) : ''} — ${lab[e.type] || esc(e.type)}${e.decision ? ' : ' + esc((FORFAIT_DECISIONS[e.decision]||{}).label || e.decision) : ''}${e.to ? ' → ' + fmtSlotDate(e.to) : ''}${e.via ? ` (via ${esc(e.via)})` : ''}${e.motif ? ` — « ${esc(e.motif)} »` : ''}</li>`).join('')}</ul></details>`;
}

/* ---------------------------------------------------------------------------
   NOUVEAU FORFAIT (renouvellement) — l'ancien forfait et ses séances sont conservés
   --------------------------------------------------------------------------- */
function forfaitNouvelId(){ return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
async function forfaitDemarrerNouveau(uid){
  const s = studentsData.find(x => x.id === uid);
  if(!s) return;
  const b = forfaitBilanEleve(s);
  const el = document.getElementById('nouveau-forfait-' + uid);
  const total = parseInt(el && el.value, 10);
  if(!(total >= FORFAIT_MIN && total <= FORFAIT_MAX)){ uiNotify(`Le nouveau forfait doit contenir entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances.`, 'warning'); return; }
  const avert = [];
  if(b.anomalies || b.aVerifier) avert.push(`${b.anomalies + b.aVerifier} séance(s) du forfait actuel restent à régulariser`);
  if(b.programmees) avert.push(`${b.programmees} séance(s) programmée(s) resteront rattachées à l'ancien forfait`);
  if(b.restantes) avert.push(`il reste ${b.restantes} séance(s) non consommée(s) dans l'ancien forfait`);
  if(!confirm(`Démarrer un nouveau forfait de ${total} séances pour ${s.prenom} ?\n\nL'ancien forfait (${b.utilisees}/${b.total} utilisées) est archivé avec son paiement et sa nota fiscal ; ses séances restent dans l'historique.${avert.length ? '\n\nAttention : ' + avert.join(' ; ') + '.' : ''}`)) return;
  const ancien = s.pack || {};
  const ancienId = ancien.id || forfaitNouvelId();
  const archive = {
    id: ancienId, total: Number(ancien.total) || 0, debut: ancien.debut || null, fin: new Date().toISOString(),
    paymentStatus: ancien.paymentStatus || null, paymentConfirmedAt: ancien.paymentConfirmedAt || null,
    notaFiscalSent: !!ancien.notaFiscalSent, notaFiscalUrl: ancien.notaFiscalUrl || null,
    bilan: {realisees: b.realisees, decomptees: b.decomptees, annulees: b.annulees, anomalies: b.anomalies, programmees: b.programmees, restantes: b.restantes}
  };
  try{
    const batch = db.batch();
    /* Les séances sans identifiant de forfait sont rattachées EXPLICITEMENT à l'ancien forfait. */
    b.seances.forEach(x => { if(!x.s.packId) batch.update(db.collection('disponibilites').doc(x.s.id), {packId: ancienId}); });
    const nouveauId = forfaitNouvelId();
    batch.update(db.collection('eleves').doc(uid), {
      forfaitsPrecedents: firebase.firestore.FieldValue.arrayUnion(archive),
      pack: {id: nouveauId, total, used: 0, debut: new Date().toISOString()}
    });
    await batch.commit();
    journaliser('forfait', 'Nouveau forfait démarré', {eleve: uid, ancien: archive, nouveau: {id: nouveauId, total}});
    uiNotify('Nouveau forfait créé. Ajoute les liens de paiement dans l\'onglet Forfait.', 'success');
  }catch(e){ uiNotify("Le nouveau forfait n'a pas pu être créé : " + (e && e.message ? e.message : e), 'error'); return; }
  await loadTeacherStudents();
}
/* Avant de programmer des séances de forfait : le forfait en cours doit avoir un identifiant. */
async function forfaitAssurerId(uid){
  const s = studentsData.find(x => x.id === uid);
  if(!s || !s.pack || !s.pack.total) return null;
  if(s.pack.id) return s.pack.id;
  const id = forfaitNouvelId();
  try{
    /* Les séances déjà créées (sans packId) restent rattachées à ce forfait : pas de « debut ». */
    await db.collection('eleves').doc(uid).update({'pack.id': id});
    s.pack.id = id;
    return id;
  }catch(e){ return null; }
}

/* ---------------------------------------------------------------------------
   AFFICHAGE : liste des séances du forfait (fiche élève › Forfait)
   --------------------------------------------------------------------------- */
function forfaitDetailHTML(s){
  const b = forfaitBilanEleve(s);
  if(!b.total) return '';
  const k = (l, v, cls) => `<div class="stat-tile ${cls||''}"><span class="stat-value">${v}</span><span class="stat-label">${l}</span></div>`;
  const precedents = Array.isArray(s.forfaitsPrecedents) ? s.forfaitsPrecedents : [];
  return `<section class="forfait-detail" aria-label="Décompte du forfait">
    <div class="forfait-head"><h3>Forfait de ${b.total} séances</h3>${forfaitStatutHTML(b)}</div>
    <div class="stat-row">
      ${k('utilisées', `${b.utilisees}/${b.total}`)}${k('restantes', b.restantes)}${k('programmées', b.programmees)}
      ${k('en anomalie', b.anomalies, b.anomalies ? 'danger' : '')}${b.aVerifier ? k('à vérifier', b.aVerifier, 'warning') : ''}${k('encore à réserver', b.reservables)}
    </div>
    ${b.decomptees ? `<p class="tp-dim">Dont ${b.decomptees} séance(s) décomptée(s) pour absence ou annulation tardive.</p>` : ''}
    ${b.depassement ? `<p class="tp-warn">⚠️ ${b.depassement} séance(s) de plus que le forfait sont programmées ou à régulariser.</p>` : ''}
    <ol class="seance-list">${b.seances.map(({s:x, etat}, i)=>`<li class="seance-row ${etat}">
      <div class="seance-top"><span class="seance-n">${i+1}</span><span class="seance-date">${fmtSlotDate(x.date)}${x.originalDate ? ` <span class="tp-dim">(initialement le ${fmtSlotDate(x.originalDate)})</span>` : ''}</span>${forfaitEtatHTML(etat)}</div>
      ${forfaitPropositionHTML(x)}${forfaitDecisionFormHTML(x)}${forfaitHistoriqueHTML(x)}</li>`).join('')}</ol>
    <p class="tp-dim">Compteur historique « séances engagées » : ${b.engageesHistorique} (il compte les séances programmées, il n'est plus utilisé pour le solde).</p>
    <div class="settings-card nouveau-forfait"><h4>Démarrer un nouveau forfait</h4>
      <p class="page-intro">L'ancien forfait est archivé avec son paiement et sa nota fiscal ; ses séances restent rattachées à lui.</p>
      <div class="btn-row"><label class="sr-only" for="nouveau-forfait-${s.id}">Nombre de séances</label><input id="nouveau-forfait-${s.id}" type="number" min="${FORFAIT_MIN}" max="${FORFAIT_MAX}" value="${b.total}" style="width:90px">
      <button type="button" class="btn btn-secondary" onclick="forfaitDemarrerNouveau('${s.id}')">Démarrer le nouveau forfait</button></div></div>
    ${precedents.length ? `<details class="seance-histo"><summary>Forfaits précédents (${precedents.length})</summary><ul class="tp-list">${precedents.slice().reverse().map(p=>`<li>${p.total} séances${p.fin ? `, clos le ${new Date(p.fin).toLocaleDateString('fr-FR')}` : ''} — ${p.bilan ? `${p.bilan.realisees + p.bilan.decomptees} utilisées` : ''} · ${p.paymentStatus === 'paid' ? 'payé' : 'paiement ' + (p.paymentStatus || '—')}${p.notaFiscalSent ? ' · nota fiscal envoyée' : ''}</li>`).join('')}</ul></details>` : ''}
  </section>`;
}

/* ---------------------------------------------------------------------------
   CONTRÔLE DES DONNÉES (Paramètres › Contrôle des forfaits)
   Rapport en lecture seule ; seules des corrections sans ambiguïté sont proposées, avec
   aperçu, sauvegarde téléchargeable et journal (anciennes et nouvelles valeurs).
   --------------------------------------------------------------------------- */
async function forfaitAudit(){
  await profEnsureStudents();
  await loadPackSlotsByStudent();
  let tous = [];
  try{ tous = (await db.collection('disponibilites').get()).docs.map(d=>({id:d.id, ...d.data()})); }catch(e){}
  const eleves = studentsData.filter(s => s.pack && Number(s.pack.total));
  const lignes = [];
  eleves.forEach(s=>{
    const b = forfaitBilanEleve(s);
    const pb = [];
    const toutes = forfaitSlotsDe(s.id);
    const nonRattachees = toutes.filter(x => !x.packId).length;
    if(b.engageesHistorique !== b.utilisees) pb.push({type:'compteur', grave:false, txt:`L'ancien affichage indiquait ${b.engageesHistorique}/${b.total} utilisées ; le décompte réel est ${b.utilisees}/${b.total}${b.anomalies ? ` (${b.anomalies} en anomalie non décomptées)` : ''}${b.programmees ? `, ${b.programmees} programmée(s)` : ''}.`});
    if(b.aVerifier) pb.push({type:'a_verifier', grave:true, txt:`${b.aVerifier} séance(s) passée(s) sans preuve de réalisation ni anomalie : à vérifier une par une.`});
    if(b.anomalies) pb.push({type:'anomalie', grave:true, txt:`${b.anomalies} séance(s) en anomalie à régulariser (proposer un report, ou décider).`});
    if(b.depassement) pb.push({type:'depassement', grave:true, txt:`${b.depassement} séance(s) de plus que le forfait (${b.total}) : possible mélange avec un ancien forfait. À vérifier, aucune correction automatique.`});
    if(!s.pack.id && nonRattachees) pb.push({type:'rattachement', grave:false, txt:`${nonRattachees} séance(s) sans identifiant de forfait : elles sont comptées dans le forfait en cours. Correction proposée : les rattacher explicitement (sans rien changer d'autre).`, corrige:'rattacher'});
    const parDate = {};
    toutes.forEach(x => { (parDate[x.date] = parDate[x.date] || []).push(x.id); });
    const doublons = Object.entries(parDate).filter(([,ids]) => ids.length > 1);
    if(doublons.length) pb.push({type:'doublon', grave:true, txt:`${doublons.length} date(s) avec plusieurs séances du même élève (${doublons.map(([d])=>fmtSlotDate(d)).join(', ')}).`});
    lignes.push({s, b, pb});
  });
  /* Réunions Zoom partagées par plusieurs séances futures. */
  const now = Date.now(), parMeeting = {};
  tous.filter(x => x.zoomMeetingId && x.reservedBy && new Date(x.date).getTime() > now).forEach(x => { (parMeeting[x.zoomMeetingId] = parMeeting[x.zoomMeetingId] || []).push(x); });
  const zoomDoublons = Object.entries(parMeeting).filter(([,l]) => l.length > 1);
  const orphelines = tous.filter(x => x.isPack && x.reservedBy && !studentsData.some(s => s.id === x.reservedBy));
  return {lignes, zoomDoublons, orphelines, total: tous.length};
}
let forfaitAuditCache = null;
async function forfaitAuditLoad(){
  const body = profBody(); if(!body) return;
  body.innerHTML = '<p class="teacher-empty" role="status">Analyse des séances…</p>';
  forfaitAuditCache = await forfaitAudit();
  if(profOnTab('controle')) forfaitAuditRender();
}
function forfaitAuditRender(){
  const body = profBody(); if(!body || !forfaitAuditCache) return;
  const {lignes, zoomDoublons, orphelines, total} = forfaitAuditCache;
  const nbGraves = lignes.reduce((n, l) => n + l.pb.filter(p => p.grave).length, 0);
  body.innerHTML = `<p class="page-intro">Rapport en lecture seule sur ${total} séances et ${lignes.length} forfait(s). Rien n'est modifié sans ton accord : les situations ambiguës sont seulement signalées. Avant toute correction, une sauvegarde des données concernées est téléchargée et l'opération est inscrite au journal (anciennes et nouvelles valeurs).</p>
    <div class="btn-row"><button type="button" class="btn btn-secondary" onclick="forfaitAuditSauvegarde()">Télécharger une sauvegarde (JSON) des forfaits et séances</button></div>
    <div class="stat-row">${profStatHTML('forfaits analysés', lignes.length)}${profStatHTML('points à traiter', nbGraves, nbGraves ? 'danger' : 'ok')}${profStatHTML('réunions Zoom partagées', zoomDoublons.length, zoomDoublons.length ? 'warning' : 'ok')}${profStatHTML('séances orphelines', orphelines.length, orphelines.length ? 'warning' : 'ok')}</div>
    ${lignes.map(({s, b, pb}) => `<div class="teacher-entry">
      <div class="who">${esc(s.prenom)} ${esc(s.nom || '')} ${forfaitStatutHTML(b)}</div>
      <div class="meta">${forfaitResumeHTML(b)}</div>
      ${pb.length ? `<ul class="audit-list">${pb.map(p => `<li class="${p.grave ? 'grave' : ''}">${p.txt}${p.corrige === 'rattacher' ? ` <button type="button" class="btn btn-secondary btn-sm" onclick="forfaitAuditRattacher('${s.id}')">Aperçu de la correction</button>` : ''}</li>`).join('')}</ul>` : '<p class="tp-dim">Aucune incohérence détectée.</p>'}
      <div class="teacher-entry-actions"><button type="button" onclick="openAdminStudentSection('${s.id}','forfait')">Ouvrir le forfait</button></div>
    </div>`).join('') || profEmptyHTML('wallet', 'Aucun forfait en cours', '')}
    ${zoomDoublons.length ? `<h2 class="section-title">Réunions Zoom utilisées par plusieurs séances à venir</h2><ul class="audit-list">${zoomDoublons.map(([m, l]) => `<li class="grave">Réunion ${esc(m)} : ${l.map(x => `${esc(x.reservedName || '')} le ${fmtSlotDate(x.date)}`).join(' ; ')}</li>`).join('')}</ul>` : ''}
    ${orphelines.length ? `<h2 class="section-title">Séances de forfait d'élèves introuvables</h2><ul class="audit-list">${orphelines.map(x => `<li>${esc(x.reservedName || x.reservedBy)} le ${fmtSlotDate(x.date)}</li>`).join('')}</ul>` : ''}`;
}
function forfaitAuditSauvegarde(){
  const data = {exporte: new Date().toISOString(), eleves: studentsData.map(s => ({id: s.id, prenom: s.prenom, nom: s.nom, pack: s.pack || null, forfaitsPrecedents: s.forfaitsPrecedents || []})),
    seances: Object.keys(packSlotsByStudent).flatMap(uid => forfaitSlotsDe(uid))};
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], {type:'application/json'}));
  a.download = `sauvegarde-forfaits-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  journaliser('forfait', 'Sauvegarde des forfaits téléchargée', {eleves: data.eleves.length, seances: data.seances.length});
}
async function forfaitAuditRattacher(uid){
  const s = studentsData.find(x => x.id === uid); if(!s) return;
  const sansId = forfaitSlotsDe(uid).filter(x => !x.packId && forfaitSeancesCourantes(s, [x]).length);
  const id = s.pack.id || forfaitNouvelId();
  if(!confirm(`Aperçu de la correction pour ${s.prenom} :\n\n- identifiant du forfait en cours : ${id}\n- ${sansId.length} séance(s) reçoivent cet identifiant :\n${sansId.slice(0, 16).map(x => '   • ' + fmtSlotDate(x.date)).join('\n')}\n\nAucun autre champ n'est modifié (dates, paiement, nota fiscal, réunions Zoom restent identiques). Appliquer ?`)) return;
  forfaitAuditSauvegarde();
  try{
    const batch = db.batch();
    if(!s.pack.id) batch.update(db.collection('eleves').doc(uid), {'pack.id': id});
    sansId.forEach(x => batch.update(db.collection('disponibilites').doc(x.id), {packId: id}));
    await batch.commit();
    journaliser('forfait', 'Séances rattachées explicitement au forfait en cours', {eleve: uid, packId: id, seances: sansId.map(x => x.id), avant: {packId: null}, apres: {packId: id}});
    uiNotify('Correction appliquée.', 'success');
  }catch(e){ uiNotify('Correction impossible : ' + (e && e.message ? e.message : e), 'error'); }
  forfaitAuditLoad();
}
registerTeacherTab('controle', ()=>forfaitAuditLoad());
