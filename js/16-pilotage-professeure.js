/* ======================= ESPACE PROFESSEURE : PILOTAGE =======================
   Onglets ajoutés par la refonte, construits sur les données et les fonctions existantes
   (aucune règle métier nouvelle) :
     accueil     Tableau de bord : cours du jour / à venir, ce qui demande une action,
                 progression des élèves, actions rapides
     anomalies   Reports & anomalies : séances passées en anomalie, demandes et propositions
                 de report en attente, synchronisations Zoom à surveiller
     finances    Forfaits, paiements à encaisser, historique, séances consommées, liens C6
     annonces    Annonces générales (publication et historique)
   + fiche élève centralisée (cours, parcours, enregistrements, messages, suivi)
   + journal d'activité (journaliser), utilisé par tous les modules. */

/* ---------------------------------------------------------------------------
   JOURNAL D'ACTIVITÉ — ajout seul (règles Firestore : ni modification ni suppression)
   --------------------------------------------------------------------------- */
async function journaliser(type, message, details){
  try{
    if(!db || !auth.currentUser) return;
    await db.collection('journal').add({
      type: String(type).slice(0, 40),
      message: String(message || '').slice(0, 500),
      details: details ? JSON.stringify(details).slice(0, 1500) : '',
      par: auth.currentUser.uid,
      parNom: `${student.prenom || ''} ${student.nom || ''}`.trim().slice(0, 80),
      ts: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){ /* le journal ne doit jamais bloquer une action */ }
}
/* Erreurs JavaScript inattendues : journalisées (une fois par message et par session). */
(function(){
  const vus = new Set();
  function noter(msg, src){
    const k = String(msg).slice(0, 200);
    if(vus.has(k) || vus.size > 20) return;
    vus.add(k);
    journaliser('erreur', k, {source: src || '', ecran: screen, onglet: screen === 'teacher' ? teacherTab : ''});
  }
  window.addEventListener('error', e=>{ if(e && e.message) noter(e.message, (e.filename||'').split('/').pop() + ':' + (e.lineno||'')); });
  window.addEventListener('unhandledrejection', e=>{ const r = e && e.reason; noter(r && r.message ? r.message : String(r), 'promesse'); });
})();

/* ---------------------------------------------------------------------------
   OUTILS COMMUNS
   --------------------------------------------------------------------------- */
function profFmtJour(d){ try{ return new Date(d).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'}); }catch(e){ return ''; } }
function profFmtDateCourte(d){ try{ return new Date(d).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'}); }catch(e){ return ''; } }
function profEmptyHTML(icon, titre, texte){
  return `<div class="ui-empty">${uiIcon(icon)}<p class="ui-empty-title">${titre}</p>${texte ? `<p>${texte}</p>` : ''}</div>`;
}
function profStatHTML(label, valeur, ton, action){
  return `<${action ? 'button type="button" onclick="' + action + '"' : 'div'} class="stat-tile ${ton || ''}"><span class="stat-value">${valeur}</span><span class="stat-label">${label}</span></${action ? 'button' : 'div'}>`;
}
function profBody(){ return document.getElementById('teacher-body'); }
function profOnTab(tab){ return screen === 'teacher' && teacherTab === tab; }
const profCache = {slots:null, slotsAt:0};

/* Créneaux utiles au pilotage : 120 jours passés → futur, plus toutes les anomalies.
   (Les écrans Planning et Historique gardent leurs propres chargements complets.) */
async function profLoadSlots(force){
  if(!force && profCache.slots && Date.now() - profCache.slotsAt < 60000) return profCache.slots;
  const cut = new Date(Date.now() - 120*86400000).toISOString();
  const byId = {};
  try{
    const snap = await db.collection('disponibilites').where('date', '>=', cut).orderBy('date').get();
    snap.docs.forEach(d=>{ byId[d.id] = {id:d.id, ...d.data()}; });
  }catch(e){ console.warn('Créneaux non chargés :', e && e.message); }
  try{
    const snap = await db.collection('disponibilites').where('anomalie', '==', true).get();
    snap.docs.forEach(d=>{ byId[d.id] = {id:d.id, ...d.data()}; });
  }catch(e){ /* non bloquant */ }
  profCache.slots = Object.values(byId).sort((a,b)=> new Date(a.date) - new Date(b.date));
  profCache.slotsAt = Date.now();
  return profCache.slots;
}
async function profEnsureStudents(){
  if(!studentsData.length) await loadTeacherStudentsQuiet();
  if(typeof loadPackSlotsByStudent === 'function' && !Object.keys(packSlotsByStudent || {}).length) await loadPackSlotsByStudent();
}

/* Ce qui demande une action (partagé par le tableau de bord, l'onglet Reports & anomalies et le compteur du menu). */
function profIssues(slots){
  const now = Date.now();
  const res = {anomalies:[], demandesEleves:[], propositions:[], zoom:[]};
  (slots || []).forEach(s=>{
    if(!s.reservedBy || s.experimentalCancelled || s.definitivelyCancelled) return;
    const req = s.rescheduleRequest || {};
    if(s.anomalie && !rptPropositionEnAttente(s)) res.anomalies.push(s);
    else if(rptPropositionEnAttente(s)) res.propositions.push(s);
    if(req.by === 'student' && req.status === 'pending' && new Date(s.date).getTime() > now - 3600000) res.demandesEleves.push(s);
    if(rptZoomSyncEnCours(s)) res.zoom.push(s);
  });
  res.total = res.anomalies.length + res.demandesEleves.length + res.zoom.filter(s=>s.zoomSync.status === 'error').length;
  return res;
}
function profSetCount(n){
  if(navCounts.aTraiter === n) return;
  navCounts.aTraiter = n;
  renderSidebar(); renderPageHead();
}

/* Progression d'un élève sur un thème (v1 ou parcours v2). */
function profThemeProgress(s, tema){
  const t = (s.temas && s.temas[tema.id]) || {};
  if(typeof tpIsV2 === 'function' && tpIsV2(tema)){
    const lvl = (t.v2 && t.v2.niveau) || tpNiveauPour(tema, s.niveau, s.niveauTheme);
    const d = tpLevelData(tema, lvl);
    if(!d) return {done:0, total:0, aCorriger:0};
    const st = {r:(t.v2&&t.v2.r)||{}, a:(t.v2&&t.v2.a)||{}, fb:(t.v2&&t.v2.fb)||{}};
    const sc = tpScore(d, st);
    return {done: d.activites.filter(a=>tpActDone(a, st)).length, total: d.activites.length, aCorriger: Math.max(0, sc.attente - sc.valides - sc.aRevoir)};
  }
  const keys = ['co','ce','ee','eo'];
  const aCorriger = ['ee','eo'].filter(k => t[k] && t[k].done && !(t.review && t.review.note)).length;
  return {done: keys.filter(k=>t[k] && t[k].done).length, total: 4, aCorriger: t.review ? 0 : aCorriger};
}
function profVoirSansNiveau(){
  teacherTab = 'eleves'; screen = 'teacher'; render();
  setTimeout(()=>{ if(typeof uiSetStudentFilter === 'function') uiSetStudentFilter('sansNiveau'); }, 500);
}
function profThemeCourant(){
  try{
    const id = (typeof temaCourantId === 'function' && temaCourantId()) || temaMostRecentId();
    return getTema(id);
  }catch(e){ return null; }
}

/* ---------------------------------------------------------------------------
   TABLEAU DE BORD
   --------------------------------------------------------------------------- */
let profDash = null;
async function profDashboardLoad(){
  const body = profBody();
  if(body && !profDash) body.innerHTML = `<div class="dash-grid">${'<div class="ui-skeleton" style="height:120px"></div>'.repeat(4)}</div>`;
  await Promise.all([profEnsureStudents(), (typeof tpLoadConfig === 'function' ? tpLoadConfig() : null)]);
  const slots = await profLoadSlots(true);
  profDash = {slots, issues: profIssues(slots)};
  profSetCount(profDash.issues.total);
  if(profOnTab('accueil')) profDashboardRender();
}
function profDashboardRender(){
  const body = profBody(); if(!body || !profDash) return;
  const now = Date.now();
  const slots = profDash.slots, iss = profDash.issues;
  const debutJour = new Date(); debutJour.setHours(0,0,0,0);
  const finJour = new Date(debutJour.getTime() + 86400000);
  const dans7 = now + 7*86400000;
  const reserves = slots.filter(s => s.reservedBy && !s.experimentalCancelled && !s.definitivelyCancelled && !s.anomalie);
  const aujourdhui = reserves.filter(s => { const t = new Date(s.date).getTime(); return t >= debutJour.getTime() && t < finJour.getTime(); });
  const aVenir = reserves.filter(s => { const t = new Date(s.date).getTime(); return t >= Math.max(now - 3600000, finJour.getTime()) && t < dans7; });
  const libres = slots.filter(s => !s.reservedBy && !s.isExperimental && new Date(s.date).getTime() > now).length;

  const flags = s => (typeof uiStudentFlags === 'function' ? uiStudentFlags(s) : {});
  const aRenouveler = studentsData.filter(s => flags(s).renouveler);
  const paiementsPack = studentsData.filter(s => flags(s).paiement);
  const coursImpayes = slots.filter(s => s.reservedBy && !s.isPack && !s.isExperimental && s.paymentStatus === 'pending');
  const sansNiveau = studentsData.filter(s => !s.niveau);
  const tema = profThemeCourant();
  const progres = tema ? studentsData.filter(s=>s.niveau).map(s => ({s, p: profThemeProgress(s, tema)})) : [];
  const aCorriger = progres.reduce((n, x) => n + (x.p.aCorriger || 0), 0);
  const profilsModifies = studentsData.filter(s => s.profilMaj && s.profilMaj.at && (now - new Date(s.profilMaj.at.toDate ? s.profilMaj.at.toDate() : s.profilMaj.at).getTime()) < 7*86400000);
  const unread = navUnreadProf();

  const coursLigne = s => `<li class="course-row">
      <span class="course-time">${uiIcon('clock')}${fmtSlotDate(s.date)}</span>
      <span class="course-who">${esc(s.reservedName || 'Élève')}${s.isExperimental ? ' <span class="badge badge-info">Cours expérimental</span>' : ''}${s.isPack ? '' : (s.paymentStatus === 'pending' ? ' <span class="badge badge-warning">Paiement en attente</span>' : '')}</span>
      ${rptBadgeHTML(s, true)}
      <span class="course-actions">${s.zoomJoinUrl ? `<button type="button" class="btn btn-secondary btn-sm" onclick="profOuvrirZoom('${s.id}')">Ouvrir Zoom</button>` : '<span class="badge">Lien Zoom à venir</span>'}</span>
    </li>`;

  const todo = [];
  const addTodo = (n, ton, texte, action, label) => { if(n) todo.push(`<li class="todo-row ${ton}"><span class="todo-n">${n}</span><span class="todo-txt">${texte}</span><button type="button" class="btn btn-secondary btn-sm" onclick="${action}">${label}</button></li>`); };
  addTodo(iss.anomalies.length, 'danger', `séance${iss.anomalies.length>1?'s':''} en anomalie à replanifier`, "goTeacherTab('anomalies')", 'Traiter');
  addTodo(iss.demandesEleves.length, 'warning', `demande${iss.demandesEleves.length>1?'s':''} de report d'élève${iss.demandesEleves.length>1?'s':''}`, "goTeacherTab('anomalies')", 'Répondre');
  addTodo(iss.zoom.filter(s=>s.zoomSync.status==='error').length, 'danger', 'synchronisation Zoom en échec', "goTeacherTab('anomalies')", 'Voir');
  addTodo(iss.propositions.length, 'info', `proposition${iss.propositions.length>1?'s':''} de report en attente de réponse`, "goTeacherTab('anomalies')", 'Suivre');
  addTodo(unread, 'info', `message${unread>1?'s':''} non lu${unread>1?'s':''}`, "goTeacherTab('messages')", 'Lire');
  addTodo(aCorriger, 'warning', `réponse${aCorriger>1?'s':''} du thème à corriger`, "goTeacherTab('temas')", 'Corriger');
  addTodo(paiementsPack.length + coursImpayes.length, 'warning', `paiement${paiementsPack.length + coursImpayes.length>1?'s':''} en attente`, "goTeacherTab('finances')", 'Voir');
  const aRegul = studentsData.filter(s => s.pack && Number(s.pack.total) && forfaitBilanEleve(s).statut === 'a_regulariser').length;
  addTodo(aRegul, 'danger', `forfait${aRegul>1?'s':''} à régulariser (séances en anomalie ou à vérifier)`, "goTeacherTab('finances')", 'Voir');
  addTodo(aRenouveler.length, 'warning', `forfait${aRenouveler.length>1?'s':''} à renouveler bientôt`, "goTeacherTab('finances')", 'Voir');
  addTodo(sansNiveau.length, 'info', `élève${sansNiveau.length>1?'s':''} sans niveau attribué`, "profVoirSansNiveau()", 'Attribuer');
  addTodo(profilsModifies.length, 'info', `profil${profilsModifies.length>1?'s':''} modifié${profilsModifies.length>1?'s':''} par ${profilsModifies.length>1?'des élèves':'un élève'} cette semaine`, `openAdminStudentSection('${profilsModifies[0] ? profilsModifies[0].id : ''}','profil')`, 'Voir');

  const progresHTML = !tema ? '' : (progres.length ? `<ul class="progress-list">${progres.sort((a,b)=>(a.p.done/a.p.total||0)-(b.p.done/b.p.total||0)).slice(0, 8).map(({s,p})=>{
      const pct = p.total ? Math.round(100*p.done/p.total) : 0;
      return `<li><button type="button" class="progress-row" onclick="openAdminStudentSection('${s.id}','parcours')">
        <span class="progress-name">${esc(s.prenom)} ${esc(s.nom || '')}</span>
        <span class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.done}" aria-label="Progression de ${esc(s.prenom)}"><span style="width:${pct}%"></span></span>
        <span class="progress-val">${p.done}/${p.total}</span></button></li>`;
    }).join('')}</ul>${progres.length > 8 ? `<button type="button" class="btn-link" onclick="goTeacherTab('temas')">Voir les ${progres.length} élèves</button>` : ''}`
    : profEmptyHTML('users', 'Aucun élève avec un niveau', 'La progression apparaîtra dès qu\'un niveau sera attribué.'));

  body.innerHTML = `
    <p class="dash-hello">Bonjour ${esc(student.prenom || 'Melissa')} · ${profFmtJour(new Date())}</p>
    <div class="stat-row">
      ${profStatHTML('cours aujourd\'hui', aujourdhui.length, '', "goTeacherTab('dispo')")}
      ${profStatHTML('cours dans les 7 jours', aVenir.length + aujourdhui.length, '', "goTeacherTab('dispo')")}
      ${profStatHTML('à traiter', iss.total, iss.total ? 'danger' : 'ok', "goTeacherTab('anomalies')")}
      ${profStatHTML('élèves inscrits', studentsData.length, '', "goTeacherTab('eleves')")}
      ${profStatHTML('créneaux libres à venir', libres, '', "goTeacherTab('dispo')")}
    </div>
    <div class="dash-cols">
      <section class="dash-card dash-wide" aria-labelledby="dash-cours-t">
        <h2 id="dash-cours-t">${uiIcon('calendar')} Aujourd'hui</h2>
        ${aujourdhui.length ? `<ul class="course-list">${aujourdhui.map(coursLigne).join('')}</ul>` : profEmptyHTML('calendar', 'Aucun cours aujourd\'hui', '')}
        <h3 class="dash-sub-title">Les 7 prochains jours</h3>
        ${aVenir.length ? `<ul class="course-list">${aVenir.slice(0, 8).map(coursLigne).join('')}</ul>${aVenir.length > 8 ? `<button type="button" class="btn-link" onclick="goTeacherTab('dispo')">Voir les ${aVenir.length} cours</button>` : ''}` : profEmptyHTML('calendar', 'Aucun cours réservé cette semaine', '')}
      </section>
      <section class="dash-card" aria-labelledby="dash-todo-t">
        <h2 id="dash-todo-t">${uiIcon('alert')} À traiter</h2>
        ${todo.length ? `<ul class="todo-list">${todo.join('')}</ul>` : profEmptyHTML('check', 'Tout est à jour', 'Rien ne demande ton attention pour le moment.')}
      </section>
      <section class="dash-card" aria-labelledby="dash-prog-t">
        <h2 id="dash-prog-t">${uiIcon('route')} Progression${tema ? ` — ${esc(tema.titre_fr)}` : ''}</h2>
        ${progresHTML}
      </section>
      <section class="dash-card" aria-labelledby="dash-quick-t">
        <h2 id="dash-quick-t">${uiIcon('plus')} Actions rapides</h2>
        <div class="quick-grid">
          <button type="button" class="quick-btn" onclick="goTeacherTab('dispo')">${uiIcon('calendar')}<span>Ajouter un créneau</span></button>
          <button type="button" class="quick-btn" onclick="goTeacherTab('dispo')">${uiIcon('wallet')}<span>Créer un forfait</span></button>
          <button type="button" class="quick-btn" onclick="goTeacherTab('annonces')">${uiIcon('megaphone')}<span>Publier une annonce</span></button>
          <button type="button" class="quick-btn" onclick="goTeacherTab('temas')">${uiIcon('book')}<span>Gérer les thèmes</span></button>
          <button type="button" class="quick-btn" onclick="goTeacherTab('messages')">${uiIcon('chat')}<span>Écrire à un élève</span></button>
          <button type="button" class="quick-btn" onclick="goTeacherTab('ressources')">${uiIcon('library')}<span>Ajouter une ressource</span></button>
        </div>
      </section>
    </div>`;
}
registerTeacherTab('accueil', ()=>{ profDash = null; profDashboardLoad(); });

/* ---------------------------------------------------------------------------
   REPORTS & ANOMALIES (réutilise l'historique existant, filtré)
   --------------------------------------------------------------------------- */
function profIsIssue(s){
  if(!s.reservedBy) return false;
  const req = s.rescheduleRequest || {};
  return !!(s.anomalie || rptPropositionEnAttente(s) || (req.status === 'pending') || rptZoomSyncEnCours(s));
}
registerTeacherTab('anomalies', async ()=>{ await profEnsureStudents(); loadTeacherHistorique(); });
(function(){
  const baseHisto = window.renderTeacherHistorique;
  window.renderTeacherHistorique = function(){
    if(profOnTab('anomalies')) return profAnomaliesRender();
    return baseHisto.apply(this, arguments);
  };
  const basePast = window.renderPastSessions;
  window.renderPastSessions = function(){
    if(!profOnTab('anomalies')) return basePast.apply(this, arguments);
    const all = dispoData;
    const filtres = all.filter(s => profIsIssue(s) || ['a_verifier'].includes(forfaitEtatSeance(s)) || (s.consommation && s.consommation.statut && s.anomalieHandled && (Date.now() - new Date(s.consommation.at).getTime()) < 7*86400000));
    dispoData = filtres;
    try{ basePast.apply(this, arguments); } finally { dispoData = all; }
    /* Même ordre que la liste existante (passées, plus récentes d'abord) : on complète chaque carte. */
    const passees = filtres.filter(s => s.reservedBy && new Date(s.date).getTime() < Date.now() - 3600000).sort((a,b)=> new Date(b.date) - new Date(a.date));
    const cartes = document.querySelectorAll('#admin-past-list > .teacher-entry');
    passees.forEach((x, i) => { if(cartes[i]) cartes[i].insertAdjacentHTML('beforeend', profAnomalieDetailHTML(x)); });
    const el = document.getElementById('admin-past-list');
    if(el && /Aucun cours passé/.test(el.textContent)) el.innerHTML = profEmptyHTML('check', 'Aucune séance passée à régulariser', 'Les séances en anomalie apparaîtront ici avec les actions pour proposer un report.');
  };
})();
/* Détail d'une séance à régulariser : motif, forfait, proposition et relances, décision, historique. */
function profAnomalieDetailHTML(x){
  const etat = forfaitEtatSeance(x);
  const motif = x.anomalie || etat === 'a_verifier'
    ? (x.clickedByStudent && !x.clickedByTeacher ? "L'élève a rejoint Zoom, pas toi" : (!x.clickedByStudent && x.clickedByTeacher ? "Tu as rejoint Zoom, pas l'élève" : "Personne n'a rejoint le lien Zoom de la plateforme"))
    : '';
  const eleve = studentsData.find(e => e.id === x.reservedBy);
  const forfait = x.isPack ? (eleve && eleve.pack && eleve.pack.total ? `Forfait de ${eleve.pack.total} séances — ${forfaitBilanEleve(eleve).utilisees}/${eleve.pack.total} utilisées` : 'Séance de forfait') : (x.isExperimental ? 'Cours expérimental' : "Cours à l'unité");
  return `<div class="anomalie-detail">
    <p class="meta">${forfaitEtatHTML(etat)} ${motif ? `· Motif : ${motif}` : ''} · ${forfait} · <b>${FORFAIT_ETATS[etat] && FORFAIT_ETATS[etat].decompte ? 'décomptée du forfait' : 'non décomptée'}</b></p>
    ${forfaitPropositionHTML(x)}${forfaitDecisionFormHTML(x)}${forfaitHistoriqueHTML(x)}</div>`;
}
/* Ouvre Zoom depuis le tableau de bord EN ENREGISTRANT le clic (clickedByTeacher), comme le
   bouton du planning : c'est ce clic qui prouve que le cours a eu lieu (voir 20-forfaits.js). */
function profOuvrirZoom(slotId){
  const s = ((profDash && profDash.slots) || []).find(x => x.id === slotId);
  if(s && s.zoomJoinUrl) zoomUrlMap[slotId] = s.zoomJoinUrl;
  openZoomLink(slotId);
}
function profAnomaliesRender(){
  const body = profBody(); if(!body) return;
  const now = Date.now();
  const iss = profIssues(dispoData);
  profSetCount(iss.total);
  const futurs = dispoData.filter(s => profIsIssue(s) && new Date(s.date).getTime() >= now - 3600000)
    .sort((a,b)=> new Date(a.date) - new Date(b.date));
  body.innerHTML = `
    <p class="page-intro">Une séance est en anomalie quand toi et l'élève n'avez pas tous les deux rejoint le lien Zoom : elle n'est comptée ni comme effectuée ni comme à venir tant qu'elle n'est pas replanifiée.</p>
    <div class="stat-row">
      ${profStatHTML('séances en anomalie', iss.anomalies.length, iss.anomalies.length ? 'danger' : 'ok')}
      ${profStatHTML('demandes d\'élèves', iss.demandesEleves.length, iss.demandesEleves.length ? 'warning' : '')}
      ${profStatHTML('propositions en attente', iss.propositions.length, '')}
      ${profStatHTML('synchronisations Zoom', iss.zoom.length, iss.zoom.some(s=>s.zoomSync.status==='error') ? 'danger' : '')}
    </div>
    <h2 class="section-title">Séances à venir à suivre</h2>
    ${futurs.length ? futurs.map(s=>{
      const req = s.rescheduleRequest || {};
      return `<div class="teacher-entry">
        <div class="who">${uiIcon('calendar')} ${fmtSlotDate(s.date)} <span class="tp-dim">— ${esc(s.reservedName || 'Élève')}</span></div>
        <div class="meta">${req.by === 'student' && req.status === 'pending' ? '<span class="badge badge-warning">Demande de report de l\'élève</span> ' : ''}${rptBadgeHTML(s, true)}</div>
        ${forfaitPropositionHTML(s)}
        <div class="teacher-entry-actions"><button type="button" onclick="goTeacherTab('dispo')">Ouvrir dans le planning</button></div>
      </div>`;
    }).join('') : profEmptyHTML('check', 'Rien à suivre sur les séances à venir', '')}
    <h2 class="section-title">Séances passées à régulariser</h2>
    <div id="admin-past-list"></div>`;
  renderPastSessions();
}

/* ---------------------------------------------------------------------------
   ÉVITER LES RENDUS D'UN AUTRE ONGLET
   Certaines actions existantes rechargent « leur » écran à la fin (ex. marquer un forfait
   payé recharge la liste des élèves). Depuis un autre onglet, on réaffiche l'onglet courant.
   --------------------------------------------------------------------------- */
function profRefreshCurrent(){
  if(screen !== 'teacher') return;
  const loader = TEACHER_TABS[teacherTab];
  if(loader) loader();
}
(function(){
  const owners = {renderTeacherStudentsList:['eleves'], renderAdminDispo:['dispo']};
  Object.keys(owners).forEach(name=>{
    const base = window[name];
    if(typeof base !== 'function') return;
    window[name] = function(){
      if(screen === 'teacher' && !owners[name].includes(teacherTab)){
        /* Boutons « Fermer » des formulaires d'annonce / de liens réutilisés : on réaffiche l'onglet. */
        if(['annonces','finances'].includes(teacherTab) && !arguments.length) profRefreshCurrent();
        return;
      }
      return base.apply(this, arguments);
    };
  });
})();

/* ---------------------------------------------------------------------------
   FINANCES
   --------------------------------------------------------------------------- */
let profFin = null;
async function profFinancesLoad(){
  await profEnsureStudents();
  if(typeof loadPackSlotsByStudent === 'function') await loadPackSlotsByStudent();
  const slots = await profLoadSlots(true);
  if(typeof loadPaymentLinks === 'function'){ try{ await loadPaymentLinks(); }catch(e){} }
  profFin = {slots};
  /* Les actions existantes (markPaymentReceived) cherchent le créneau dans dispoData. */
  dispoData = slots;
  if(profOnTab('finances')) profFinancesRender();
}
function profPrixForfait(n){
  try{ return calculerPrixForfait(n).total; }catch(e){ return null; }
}
function profMontant(v){ return v == null ? '—' : 'R$ ' + Number(v).toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function profFinancesRender(){
  const body = profBody(); if(!body || !profFin) return;
  const now = Date.now();
  const slots = profFin.slots;
  const flags = s => (typeof uiStudentFlags === 'function' ? uiStudentFlags(s) : {});
  const avecForfait = studentsData.filter(s => s.pack && Number(s.pack.total));
  const bilans = {}; avecForfait.forEach(s => { bilans[s.id] = forfaitBilanEleve(s); });
  const restantes = avecForfait.reduce((n, s) => n + bilans[s.id].restantes, 0);
  const aRegulariser = avecForfait.filter(s => bilans[s.id].statut === 'a_regulariser').length;
  const packsEnAttente = studentsData.filter(s => flags(s).paiement);
  const coursEnAttente = slots.filter(s => s.reservedBy && !s.isPack && !s.isExperimental && s.paymentStatus === 'pending');
  const aRenouveler = studentsData.filter(s => flags(s).renouveler);

  const encaisser = [
    ...packsEnAttente.map(s => `<tr><td>${esc(s.prenom)} ${esc(s.nom||'')}</td><td>Forfait de ${s.pack.total} séances</td><td>${profMontant(profPrixForfait(Number(s.pack.total)))}</td>
      <td><button type="button" class="btn btn-sm" onclick="profFinAction(()=>markPackPaid('${s.id}'), 'forfait marqué payé', '${s.id}')">Marquer comme payé</button></td></tr>`),
    ...coursEnAttente.map(s => `<tr><td>${esc(s.reservedName || 'Élève')}</td><td>Cours du ${fmtSlotDate(s.date)}</td><td>${profMontant(typeof PRIX_COURS !== 'undefined' ? PRIX_COURS : null)}</td>
      <td><button type="button" class="btn btn-sm" onclick="profFinAction(()=>markPaymentReceived('${s.id}'), 'cours marqué payé', '${s.reservedBy}')">Marquer comme payé</button></td></tr>`)
  ];

  const ordreStatut = {a_regulariser:0, termine:1, a_renouveler:2, proche:3, actif:4, aucun:5};
  const forfaits = avecForfait.sort((a,b)=> (ordreStatut[bilans[a.id].statut] - ordreStatut[bilans[b.id].statut]) || (bilans[a.id].restantes - bilans[b.id].restantes)).map(s=>{
    const p = s.pack, b = bilans[s.id];
    const paiement = p.paymentStatus === 'paid' ? '<span class="badge badge-success">Payé</span>'
      : (p.paymentLinks && Object.keys(p.paymentLinks).length ? '<span class="badge badge-warning">En attente</span>' : '<span class="badge">Liens à envoyer</span>');
    return `<tr><td>${esc(s.prenom)} ${esc(s.nom||'')}</td><td>${b.total}</td><td>${b.utilisees}${b.decomptees ? ` <span class="tp-dim">(dont ${b.decomptees} décomptée${b.decomptees>1?'s':''})</span>` : ''}</td><td><b>${b.restantes}</b></td>
      <td>${b.programmees}</td><td>${b.anomalies ? `<b style="color:var(--c-danger)">${b.anomalies}</b>` : 0}${b.aVerifier ? ` <span class="badge badge-warning">+${b.aVerifier} à vérifier</span>` : ''}</td>
      <td>${paiement}${p.notaFiscalSent ? ' <span class="badge badge-success">Nota envoyée</span>' : (p.paymentStatus === 'paid' ? ' <span class="badge">Nota à envoyer</span>' : '')}</td>
      <td>${forfaitStatutHTML(b)}</td>
      <td><button type="button" class="btn btn-secondary btn-sm" onclick="openAdminStudentSection('${s.id}','forfait')">Gérer</button></td></tr>`;
  }).join('');

  const histo = [
    ...studentsData.filter(s => s.pack && s.pack.paymentStatus === 'paid' && s.pack.paymentConfirmedAt)
      .map(s => ({d: s.pack.paymentConfirmedAt, qui: `${s.prenom} ${s.nom||''}`, quoi: `Forfait de ${s.pack.total} séances`, nf: s.pack.notaFiscalSent})),
    ...slots.filter(s => s.paymentStatus === 'paid' && s.paymentConfirmedAt)
      .map(s => ({d: s.paymentConfirmedAt, qui: s.reservedName || 'Élève', quoi: `Cours du ${fmtSlotDate(s.date)}`, nf: s.notaFiscalSent}))
  ].sort((a,b)=> new Date(b.d) - new Date(a.d)).slice(0, 30);

  /* Séances effectuées par mois (6 derniers mois). */
  const mois = [];
  for(let i=5; i>=0; i--){ const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); mois.push({k: d.getFullYear() + '-' + d.getMonth(), label: d.toLocaleDateString('fr-FR', {month:'long', year:'numeric'}), pack:0, unite:0, essai:0}); }
  slots.forEach(s=>{
    if(!s.reservedBy || s.anomalie || s.experimentalCancelled || s.definitivelyCancelled) return;
    const fin = new Date(s.date).getTime() + (s.duree||45)*60000;
    if(fin > now) return;
    const d = new Date(s.date), k = d.getFullYear() + '-' + d.getMonth();
    const m = mois.find(x=>x.k===k); if(!m) return;
    if(s.isExperimental) m.essai++; else if(s.isPack) m.pack++; else m.unite++;
  });

  body.innerHTML = `
    <div class="stat-row">
      ${profStatHTML('forfaits en cours', avecForfait.length, '')}
      ${profStatHTML('séances restantes (tous forfaits)', restantes, '')}
      ${profStatHTML('paiements en attente', packsEnAttente.length + coursEnAttente.length, packsEnAttente.length + coursEnAttente.length ? 'warning' : 'ok')}
      ${profStatHTML('forfaits à régulariser', aRegulariser, aRegulariser ? 'danger' : 'ok', "goTeacherTab('controle')")}
      ${profStatHTML('forfaits à renouveler', aRenouveler.length, aRenouveler.length ? 'warning' : '')}
    </div>
    <h2 class="section-title">À encaisser</h2>
    ${encaisser.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Objet</th><th scope="col">Montant (tarif actuel)</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>${encaisser.join('')}</tbody></table></div>`
      : profEmptyHTML('check', 'Aucun paiement en attente', '')}
    <h2 class="section-title">Forfaits</h2>
    ${forfaits ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Forfait</th><th scope="col">Réalisées</th><th scope="col">Restantes</th><th scope="col">Programmées</th><th scope="col">Anomalies</th><th scope="col">Paiement</th><th scope="col">Statut</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>${forfaits}</tbody></table></div>`
      : profEmptyHTML('wallet', 'Aucun forfait en cours', 'Les forfaits se créent depuis Cours › Planning (« Réserver un forfait »).')}
    <h2 class="section-title">Séances effectuées par mois</h2>
    <div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Mois</th><th scope="col">Forfait</th><th scope="col">À l'unité</th><th scope="col">Cours expérimental</th><th scope="col">Total</th></tr></thead>
      <tbody>${mois.slice().reverse().map(m=>`<tr><td>${m.label}</td><td>${m.pack}</td><td>${m.unite}</td><td>${m.essai}</td><td><b>${m.pack+m.unite+m.essai}</b></td></tr>`).join('')}</tbody></table></div>
    <p class="tp-dim">Calculé sur les 120 derniers jours de créneaux ; les séances en anomalie ne sont pas comptées.</p>
    <h2 class="section-title">Derniers paiements reçus</h2>
    ${histo.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Date</th><th scope="col">Élève</th><th scope="col">Objet</th><th scope="col">Nota fiscal</th></tr></thead>
      <tbody>${histo.map(h=>`<tr><td>${profFmtDateCourte(h.d)}</td><td>${esc(h.qui)}</td><td>${esc(h.quoi)}</td><td>${h.nf ? '<span class="badge badge-success">Envoyée</span>' : '—'}</td></tr>`).join('')}</tbody></table></div>`
      : profEmptyHTML('wallet', 'Aucun paiement enregistré pour le moment', '')}
    <h2 class="section-title">Liens de paiement C6 Bank (cours à l'unité)</h2>
    ${typeof paymentLinksEditorHTML === 'function' ? paymentLinksEditorHTML() : ''}
    <p class="tp-dim">« Réalisées » : séances qui ont eu lieu (Zoom rejoint par vous deux, ou confirmées par toi) et séances décomptées sur décision motivée. Une séance en anomalie n'est jamais décomptée tant qu'elle n'est pas régularisée. Les tarifs se modifient dans Paramètres › Réglages › Tarifs.</p>`;
}
async function profFinAction(fn, libelle, eleveId){
  await fn();
  journaliser('paiement', libelle, {eleve: eleveId});
  profCache.slotsAt = 0;
  await profFinancesLoad();
}
registerTeacherTab('finances', ()=>{ profFin = null; profFinancesLoad(); });

/* ---------------------------------------------------------------------------
   ANNONCES
   --------------------------------------------------------------------------- */
async function profAnnoncesLoad(){
  const body = profBody(); if(!body) return;
  let annonces = [];
  try{
    const snap = await db.collection('annonces').orderBy('ts', 'desc').limit(30).get();
    annonces = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ annonces = null; }
  if(!profOnTab('annonces')) return;
  body.innerHTML = `
    <p class="page-intro">Une annonce s'affiche dans l'accueil de chaque élève, avec une pastille de notification, jusqu'à ce qu'il clique sur « J'ai vu ». Seule la plus récente est affichée.</p>
    ${typeof announcementFormHTML === 'function' ? announcementFormHTML() : ''}
    <h2 class="section-title">Annonces publiées</h2>
    ${annonces === null ? '<p class="tp-warn">Impossible de charger les annonces pour le moment.</p>'
      : (annonces.length ? annonces.map((a, i)=>`<div class="teacher-entry">
        <div class="who">${a.ts && a.ts.toDate ? profFmtJour(a.ts.toDate()) : ''} ${i === 0 ? '<span class="badge badge-success">Affichée aux élèves</span>' : ''}</div>
        <div class="meta" style="white-space:pre-wrap;">${esc(a.text || '')}</div>
        <div class="teacher-entry-actions"><button type="button" class="btn-danger" onclick="profSupprimerAnnonce('${a.id}')">Supprimer</button></div>
      </div>`).join('') : profEmptyHTML('megaphone', 'Aucune annonce publiée', ''))}
    <h2 class="section-title">Rappels automatiques</h2>
    <div class="teacher-entry"><div class="meta">Envoyés par ton Apps Script, sans action de ta part : rappel par e-mail 24 h avant chaque cours, avec boutons confirmer / annuler / reporter ; annulation automatique des cours non payés ; e-mails de proposition et de confirmation de report ; nouvelles tentatives de synchronisation Zoom toutes les 10 minutes. Leur réglage reste dans l'Apps Script (voir Paramètres › Intégrations).</div></div>`;
}
(function(){
  const base = window.publishAnnouncement;
  if(typeof base !== 'function') return;
  window.publishAnnouncement = async function(){
    const el = document.getElementById('announcement-text');
    const txt = el ? el.value.trim() : '';
    await base.apply(this, arguments);
    if(txt) journaliser('annonce', 'Annonce publiée', {extrait: txt.slice(0, 120)});
    if(profOnTab('annonces')) profAnnoncesLoad();
  };
})();
async function profSupprimerAnnonce(id){
  if(!confirm("Supprimer cette annonce ? Elle ne sera plus affichée aux élèves (si c'était la plus récente, la précédente reprendra sa place).")) return;
  try{
    await db.collection('annonces').doc(id).delete();
    journaliser('annonce', 'Annonce supprimée', {id});
    uiNotify('Annonce supprimée.', 'success');
    if(typeof loadLatestAnnouncement === 'function') loadLatestAnnouncement();
  }catch(e){ uiNotify("Suppression impossible : les règles Firestore publiées n'autorisent peut-être pas encore cette action.", 'error'); }
  profAnnoncesLoad();
}
registerTeacherTab('annonces', ()=>profAnnoncesLoad());

/* ---------------------------------------------------------------------------
   FICHE ÉLÈVE CENTRALISÉE
   --------------------------------------------------------------------------- */
const FICHE_SECTIONS = [['dossiers','Dossiers & bilans'],['parcours','Thèmes'],['cours','Cours'],['forfait','Forfait'],
  ['profil','Profil & niveau'],['suivi','Objectifs & difficultés'],['enregistrements','Enregistrements'],['messages','Messages']];
function ficheSectionHTML(section, s){
  if(section === 'parcours') return ficheParcoursHTML(s);
  if(['cours','suivi','enregistrements'].includes(section)){
    setTimeout(()=>ficheLoadAsync(section, s), 0);
    return `<div id="fiche-async" aria-live="polite"><p class="teacher-empty" role="status">Chargement…</p></div>`;
  }
  if(section === 'messages'){
    return `<div class="teacher-entry"><div class="meta">La conversation avec ${esc(s.prenom)} s'ouvre dans Communication › Messages.</div>
      <div class="teacher-entry-actions"><button type="button" onclick="ficheOuvrirMessages('${s.id}')">Ouvrir la conversation</button></div></div>`;
  }
  return null;
}
function ficheOuvrirMessages(uid){
  teacherTab = 'messages'; screen = 'teacher'; render();
  let n = 0;
  const t = setInterval(()=>{ n++; if(typeof openTeacherThread === 'function' && document.getElementById('teacher-body') && !/Chargement/.test(document.getElementById('teacher-body').textContent)){ clearInterval(t); try{ openTeacherThread(uid); }catch(e){} } if(n > 30) clearInterval(t); }, 150);
}
function ficheParcoursHTML(s){
  const themes = temasSemanas.filter(t => typeof tpStatut !== 'function' || tpStatut(t) !== 'brouillon').slice().reverse();
  if(!s.niveau) return '<p class="teacher-empty">Le niveau doit d\'abord être attribué.</p>';
  return `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Thème</th><th scope="col">Période</th><th scope="col">Progression</th><th scope="col">À corriger</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>
    ${themes.map(t=>{ const p = profThemeProgress(s, t); const etat = typeof tpEtatTheme === 'function' ? tpEtatTheme(t) : '';
      return `<tr><td>${esc(t.titre_fr)} ${etat === 'en_cours' ? '<span class="badge badge-success">En cours</span>' : ''}</td><td>${esc(t.periode || '')}</td><td>${p.done} / ${p.total}</td>
        <td>${p.aCorriger ? `<span class="badge badge-warning">${p.aCorriger}</span>` : '—'}</td>
        <td><button type="button" class="btn btn-secondary btn-sm" onclick="ficheOuvrirTheme('${t.id}','${s.id}')">Voir & corriger</button></td></tr>`; }).join('')}
    </tbody></table></div>`;
}
function ficheOuvrirTheme(temaId, uid){
  if(typeof teacherTemaSelectedId !== 'undefined') teacherTemaSelectedId = temaId;
  if(typeof openTemaReviewId !== 'undefined') openTemaReviewId = uid;
  teacherTab = 'temas'; screen = 'teacher'; render();
}
async function ficheLoadAsync(section, s){
  const el = document.getElementById('fiche-async'); if(!el) return;
  try{
    if(section === 'cours'){
      const snap = await db.collection('disponibilites').where('reservedBy', '==', s.id).get();
      const slots = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> new Date(b.date) - new Date(a.date));
      const c = rptCompteurs(slots);
      const now = Date.now();
      el.innerHTML = `<p class="rpt-counters">${rptCompteursHTML(c)}</p>
        ${slots.length ? `<ul class="course-list">${slots.map(x=>{
          const etat = rptEtat(x, now);
          const lab = {anomalie:'<span class="badge badge-danger">Anomalie</span>', report_propose:'<span class="badge badge-warning">Report proposé</span>', zoom_attente:'<span class="badge badge-warning">Zoom en attente</span>', zoom_erreur:'<span class="badge badge-danger">Zoom en échec</span>', a_venir:'<span class="badge badge-info">À venir</span>', effectuee:'<span class="badge badge-success">Effectuée</span>', a_verifier:'<span class="badge badge-warning">Passée, à vérifier</span>', annulee:'<span class="badge">Annulée</span>'}[etat] || '';
          return `<li class="course-row"><span class="course-time">${uiIcon('clock')}${fmtSlotDate(x.date)}</span><span class="course-who">${lab}${x.isExperimental ? ' <span class="badge">Cours expérimental</span>' : ''}${x.isPack ? ' <span class="badge">Forfait</span>' : ''}${x.experimentalCancelled || x.definitivelyCancelled ? ' <span class="badge">Annulée</span>' : ''}</span>${x.vocab ? '<span class="tp-dim">Récap ajouté</span>' : ''}</li>`;
        }).join('')}</ul>` : profEmptyHTML('calendar', 'Aucun cours réservé', '')}`;
    }
    if(section === 'enregistrements'){
      const snap = await db.collection('enregistrements').where('uid', '==', s.id).get();
      const recs = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> ((b.ts&&b.ts.seconds)||0) - ((a.ts&&a.ts.seconds)||0));
      el.innerHTML = recs.length ? recs.map(r=>`<div class="teacher-entry"><div class="who">${uiIcon('mic')} ${esc(r.activite || r.semaine || 'Enregistrement')}</div>
          <div class="meta">${esc(r.dossier || '')}${r.jour ? ' · ' + esc(r.jour) : ''}${r.ts && r.ts.toDate ? ' · ' + profFmtDateCourte(r.ts.toDate()) : ''}</div>
          ${r.driveUrl ? `<div class="teacher-entry-actions"><a class="btn btn-secondary btn-sm" href="${esc(r.driveUrl)}" target="_blank" rel="noopener">Écouter dans Drive</a></div>` : ''}</div>`).join('')
        : profEmptyHTML('mic', 'Aucun enregistrement', '');
    }
    if(section === 'suivi'){
      const doc = await db.collection('suiviEleves').doc(s.id).get();
      const d = doc.exists ? doc.data() : {};
      const objEleve = s.objectifs ? `<div class="teacher-entry"><div class="who">Objectifs indiqués par l'élève</div><div class="meta" style="white-space:pre-wrap;">${esc(s.objectifs)}</div></div>` : '';
      el.innerHTML = `${objEleve}
        <p class="page-intro">Notes privées : visibles uniquement par toi (collection « suiviEleves », jamais lisible par l'élève).</p>
        <div class="field"><label for="suivi-obj">Objectifs de travail</label><textarea id="suivi-obj" rows="3">${esc(d.objectifs || '')}</textarea></div>
        <div class="field"><label for="suivi-diff">Difficultés observées</label><textarea id="suivi-diff" rows="3">${esc(d.difficultes || '')}</textarea></div>
        <div class="field"><label for="suivi-notes">Notes libres</label><textarea id="suivi-notes" rows="3">${esc(d.notes || '')}</textarea></div>
        <button type="button" class="btn" onclick="ficheSaveSuivi('${s.id}')">Enregistrer</button>
        ${d.maj ? `<p class="tp-dim">Dernière mise à jour : ${profFmtDateCourte(d.maj.toDate ? d.maj.toDate() : d.maj)}</p>` : ''}`;
    }
  }catch(e){
    el.innerHTML = `<p class="tp-warn">Chargement impossible pour le moment. ${section === 'suivi' ? 'Les nouvelles règles Firestore (collection suiviEleves) sont-elles publiées ?' : ''}</p>`;
  }
}
async function ficheSaveSuivi(uid){
  const v = id => (document.getElementById(id) || {}).value || '';
  try{
    await db.collection('suiviEleves').doc(uid).set({objectifs: v('suivi-obj').slice(0, 3000), difficultes: v('suivi-diff').slice(0, 3000), notes: v('suivi-notes').slice(0, 5000), maj: firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
    uiNotify('Suivi enregistré.', 'success');
  }catch(e){ uiNotify("Enregistrement impossible : vérifie que les nouvelles règles Firestore sont publiées.", 'error'); }
}
/* Informations personnelles saisies par l'élève (onglet Profil & niveau de la fiche). */
function ficheProfilPersoHTML(s){
  const ligne = (l, v) => v ? `<div><dt>${l}</dt><dd>${esc(v)}</dd></div>` : '';
  const prefs = s.preferences || {};
  const notif = s.notifications || {};
  const maj = s.profilMaj && s.profilMaj.at ? profFmtDateCourte(s.profilMaj.at.toDate ? s.profilMaj.at.toDate() : s.profilMaj.at) : '';
  return `<div class="teacher-entry"><div class="who">Informations personnelles${maj ? ` <span class="badge badge-info">Modifiées le ${maj}</span>` : ''}</div>
    <dl class="info-list">
      ${ligne('Nom d\'affichage', s.nomAffiche)}${ligne('E-mail', s.email)}${ligne('Téléphone', [s.whatsappCode, s.telephone].filter(Boolean).join(' '))}
      ${ligne('Fuseau horaire', s.timezone)}${ligne('Langue préférée', s.langue === 'fr' ? 'Français uniquement' : (s.langue === 'fr-pt' ? 'Français avec traductions' : ''))}
      ${ligne('Objectifs', s.objectifs)}${ligne('Préférences pédagogiques', [prefs.rythme, prefs.focus].filter(Boolean).join(' · '))}
      ${ligne('Contact WhatsApp', notif.whatsapp === false ? 'Ne souhaite pas être contacté(e) sur WhatsApp' : (s.notifications ? 'Accepté' : ''))}
    </dl>${s.profilMaj && s.profilMaj.champs ? `<p class="tp-dim">Derniers champs modifiés : ${esc(s.profilMaj.champs.join(', '))}</p>` : ''}</div>`;
}

/* ---------------------------------------------------------------------------
   JOURNALISATION DES ACTIONS SENSIBLES EXISTANTES
   --------------------------------------------------------------------------- */
(function(){
  function suivre(nom, type, libelle, detailsFn){
    const base = window[nom];
    if(typeof base !== 'function') return;
    window[nom] = async function(){
      const args = Array.from(arguments);
      const r = await base.apply(this, args);
      journaliser(type, libelle, detailsFn ? detailsFn(args) : {args: args.filter(a => typeof a !== 'function').slice(0, 3)});
      return r;
    };
  }
  suivre('saveAdminProfile', 'eleve', 'Niveau / rythme modifié', a => ({eleve:a[0], niveau:(document.getElementById('niv-'+a[0])||{}).value}));
  suivre('saveAdminPack', 'forfait', 'Forfait modifié', a => ({eleve:a[0]}));
  suivre('tpSetPublie', 'theme', 'Publication de thème modifiée', a => ({theme:a[0], publie:a[1]}));
  suivre('tpEditorSave', 'theme', 'Contenu de thème modifié', a => ({theme:a[0], niveau:a[1]}));
  suivre('tpSetRouvert', 'theme', 'Thème rouvert / refermé pour un élève', a => ({eleve:a[0], theme:a[1], ouvert:a[2]}));
  suivre('tpSetNiveauTheme', 'theme', 'Niveau de thème forcé', a => ({eleve:a[0], niveau:a[1]}));
  suivre('rptAppliquer', 'seance', 'Séance déplacée', a => ({seance:a[0] && a[0].id, nouvelleDate:a[1]}));
  suivre('rptProposer', 'seance', 'Report proposé', a => ({seance:a[0] && a[0].id, date:a[1]}));
  suivre('deleteDisponibilite', 'seance', 'Créneau supprimé');
  suivre('adminCancelReservation', 'seance', 'Réservation annulée par la professeure');
  suivre('savePaymentLinks', 'paiement', 'Liens de paiement modifiés', ()=>({}));
})();
