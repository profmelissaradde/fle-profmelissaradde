/* ======================= ESPACE PROFESSEURE : PILOTAGE =======================
     accueil     Tableau de bord par priorité : à faire maintenant, à prévoir, vue d'ensemble
                 (les séances et priorités viennent de 22-seances.js)
     finances    Forfaits & paiements : à encaisser, notas à envoyer, forfaits, historique, liens C6
     annonces    Annonces générales (publication et historique)
   + fiche élève centralisée (cours & confirmations, parcours, enregistrements, messages, suivi)
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


async function profLoadSlots(force){
  /* Source commune des séances (22-seances.js). */
  await seancesCharger(force);
  return SEANCES.liste;
}
async function profEnsureStudents(){
  if(!studentsData.length) await loadTeacherStudentsQuiet();
  if(typeof loadPackSlotsByStudent === 'function' && !Object.keys(packSlotsByStudent || {}).length) await loadPackSlotsByStudent();
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
   TABLEAU DE BORD — trois niveaux : à faire maintenant, à prévoir, vue d'ensemble.
   Les séances viennent de la source commune (22-seances.js) ; aucun calcul propre.
   --------------------------------------------------------------------------- */
let profDash = null;
async function profDashboardLoad(){
  const body = profBody();
  if(body && !profDash) body.innerHTML = `<div class="dash-grid">${'<div class="ui-skeleton" style="height:120px"></div>'.repeat(3)}</div>`;
  await Promise.all([profEnsureStudents(), (typeof tpLoadConfig === 'function' ? tpLoadConfig() : null), seancesCharger(true), seancesEvenements()]);
  profDash = {slots: SEANCES.liste};
  if(profOnTab('accueil')) profDashboardRender();
}
function profDashboardRender(){
  const body = profBody(); if(!body || !profDash) return;
  const now = Date.now();
  const slots = SEANCES.liste;
  const p = pilotage(slots, now);
  const debutJour = new Date(); debutJour.setHours(0,0,0,0);
  const finJour = new Date(debutJour.getTime() + 86400000);
  const actifs = slots.filter(s => s.reservedBy && !s.experimentalCancelled && !s.definitivelyCancelled);
  const aujourdhui = actifs.filter(s => { const t = new Date(s.date).getTime(); return t >= debutJour.getTime() && t < finJour.getTime(); });
  const semaine = actifs.filter(s => { const t = new Date(s.date).getTime(); return t >= finJour.getTime() && t < finJour.getTime() + 6*86400000; });
  const libres = slots.filter(s => !s.reservedBy && !s.isExperimental && new Date(s.date).getTime() > now).length;
  const debutMois = new Date(); debutMois.setDate(1); debutMois.setHours(0,0,0,0);
  const realiseesMois = actifs.filter(s => new Date(s.date).getTime() >= debutMois.getTime() && seanceStatut(s, now) === 'realisee').length;

  const flags = s => (typeof uiStudentFlags === 'function' ? uiStudentFlags(s) : {});
  const aRenouveler = studentsData.filter(s => flags(s).renouveler);
  const paiementsPack = studentsData.filter(s => flags(s).paiement);
  const coursImpayes = slots.filter(s => s.reservedBy && !s.isPack && !s.isExperimental && s.paymentStatus === 'pending' && !s.experimentalCancelled);
  const notas = slots.filter(s => s.reservedBy && !s.isPack && !s.isExperimental && s.paymentStatus === 'paid' && !s.notaFiscalSent).length
    + studentsData.filter(s => s.pack && s.pack.paymentStatus === 'paid' && !s.pack.notaFiscalSent).length;
  const sansNiveau = studentsData.filter(s => !s.niveau);
  const tema = profThemeCourant();
  const progres = tema ? studentsData.filter(s=>s.niveau).map(s => ({s, p: profThemeProgress(s, tema)})) : [];
  const aCorriger = progres.reduce((n, x) => n + (x.p.aCorriger || 0), 0);
  const unread = navUnreadProf();
  const notifs = navCounts.notifs || 0;

  const prevoir = [];
  const addP = (n, texte, action, label) => { if(n) prevoir.push(`<li class="todo-row"><span class="todo-n">${n}</span><span class="todo-txt">${texte}</span><button type="button" class="btn btn-ghost btn-sm" onclick="${action}">${label}</button></li>`); };
  addP(p.prevoir.length, `séance${p.prevoir.length>1?'s':''} en attente (confirmation, nouvelle date, Zoom)`, "goTeacherTab('atraiter')", 'Suivre');
  addP(aRenouveler.length, `forfait${aRenouveler.length>1?'s':''} bientôt épuisé${aRenouveler.length>1?'s':''}`, "goTeacherTab('finances')", 'Voir');
  addP(paiementsPack.length + coursImpayes.length, `paiement${paiementsPack.length + coursImpayes.length>1?'s':''} à vérifier`, "goTeacherTab('finances')", 'Voir');
  addP(notas, `nota${notas>1?'s':''} fiscal${notas>1?'es':''} à envoyer`, "goTeacherTab('finances')", 'Envoyer');
  addP(aCorriger, `réponse${aCorriger>1?'s':''} du thème à corriger`, "goTeacherTab('temas')", 'Corriger');
  addP(unread, `message${unread>1?'s':''} non lu${unread>1?'s':''}`, "goTeacherTab('messages')", 'Lire');
  addP(notifs, `notification${notifs>1?'s':''} non lue${notifs>1?'s':''}`, "goTeacherTab('notifications')", 'Voir');
  addP(sansNiveau.length, `élève${sansNiveau.length>1?'s':''} sans niveau attribué`, "profVoirSansNiveau()", 'Attribuer');

  const urgentHTML = p.urgent.length
    ? `<ul class="seance-list">${p.urgent.slice(0, 6).map(it => seanceLigneHTML(it.s, {label: PILOTAGE_TYPES[it.type].label, ton:'danger', detail: it.detail ? esc(it.detail) : ''})).join('')}</ul>
       ${p.urgent.length > 6 ? `<button type="button" class="btn-link" onclick="goTeacherTab('atraiter')">Voir les ${p.urgent.length} éléments</button>` : ''}`
    : `<p class="dash-calm">${uiIcon('check')} Rien d'urgent : aucune demande de report, anomalie ou erreur Zoom en attente.</p>`;
  const activite = (SEANCES.events || []).slice(0, 6);

  body.innerHTML = `
    <p class="dash-hello">Bonjour ${esc(student.prenom || 'Melissa')} · ${profFmtJour(new Date())}</p>
    <section class="dash-card dash-urgent ${p.urgent.length ? 'has-items' : ''}" aria-labelledby="dash-urg-t">
      <h2 id="dash-urg-t">${uiIcon('alert')} À faire maintenant ${p.urgent.length ? `<span class="count-pill danger">${p.urgent.length}</span>` : ''}</h2>
      ${urgentHTML}
    </section>
    <div class="dash-cols dash-main-cols">
      <section class="dash-card dash-wide" aria-labelledby="dash-cours-t">
        <h2 id="dash-cours-t">${uiIcon('calendar')} Aujourd'hui</h2>
        ${aujourdhui.length ? seanceListeHTML(aujourdhui, {heureSeule:true, zoom:true}) : profEmptyHTML('calendar', 'Aucun cours aujourd\'hui', '')}
        <h3 class="dash-sub-title">Les 6 jours suivants</h3>
        ${semaine.length ? seanceListeHTML(semaine.slice(0, 8)) + (semaine.length > 8 ? `<button type="button" class="btn-link" onclick="goTeacherTab('dispo')">Voir l'agenda (${semaine.length} cours)</button>` : '') : profEmptyHTML('calendar', 'Aucun cours réservé', '')}
      </section>
      <section class="dash-card" aria-labelledby="dash-prev-t">
        <h2 id="dash-prev-t">${uiIcon('clock')} À prévoir</h2>
        ${prevoir.length ? `<ul class="todo-list">${prevoir.join('')}</ul>` : profEmptyHTML('check', 'Tout est à jour', '')}
      </section>
    </div>
    <h2 class="section-title">Vue d'ensemble</h2>
    <div class="stat-row">
      ${profStatHTML('élèves inscrits', studentsData.length, '', "goTeacherTab('eleves')")}
      ${profStatHTML('cours dans les 7 jours', aujourdhui.length + semaine.length, '', "goTeacherTab('dispo')")}
      ${profStatHTML('séances réalisées ce mois-ci', realiseesMois, '')}
      ${profStatHTML('créneaux libres à venir', libres, '', "goTeacherTab('disponibilites')")}
    </div>
    <div class="dash-cols">
      <section class="dash-card" aria-labelledby="dash-act-t">
        <h2 id="dash-act-t">${uiIcon('chat')} Activité récente</h2>
        ${activite.length ? `<ul class="event-list">${activite.map(e => `<li><button type="button" class="event-row" onclick="seanceOuvrir('${e.seanceId}')">${suiviEvenementHTML(e).replace(/^<li>|<\/li>$/g, '')} — <b>${esc(e.eleveNom || '')}</b></button></li>`).join('')}</ul>` : '<p class="tp-dim">Les confirmations, annulations et reports apparaîtront ici.</p>'}
      </section>
      <section class="dash-card" aria-labelledby="dash-prog-t">
        <h2 id="dash-prog-t">${uiIcon('route')} Progression${tema ? ` — ${esc(tema.titre_fr)}` : ''}</h2>
        ${!tema ? '<p class="tp-dim">Aucun thème en cours.</p>' : (progres.length ? `<ul class="progress-list">${progres.sort((a,b)=>(a.p.done/a.p.total||0)-(b.p.done/b.p.total||0)).slice(0, 6).map(({s,p})=>{
            const pct = p.total ? Math.round(100*p.done/p.total) : 0;
            return `<li><button type="button" class="progress-row" onclick="openAdminStudentSection('${s.id}','parcours')">
              <span class="progress-name">${esc(s.prenom)} ${esc(s.nom || '')}</span>
              <span class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.done}" aria-label="Progression de ${esc(s.prenom)}"><span style="width:${pct}%"></span></span>
              <span class="progress-val">${p.done}/${p.total}</span></button></li>`; }).join('')}</ul>` : '<p class="tp-dim">La progression apparaîtra dès qu\'un niveau sera attribué.</p>')}
      </section>
    </div>`;
}
registerTeacherTab('accueil', ()=>{ profDash = null; profDashboardLoad(); });

/* Ouvre Zoom depuis le tableau de bord EN ENREGISTRANT le clic (clickedByTeacher), comme le
   bouton du planning : c'est ce clic qui prouve que le cours a eu lieu (voir 20-forfaits.js). */
function profOuvrirZoom(slotId){
  const s = (typeof SEANCES !== 'undefined' ? SEANCES.liste : []).find(x => x.id === slotId);
  if(s && s.zoomJoinUrl) zoomUrlMap[slotId] = s.zoomJoinUrl;
  openZoomLink(slotId);
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
  if(typeof seanceRafraichir === 'function') seanceRafraichir();
}
(function(){
  const owners = {renderTeacherStudentsList:['eleves']};
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
    ${(()=>{
      const notas = [
        ...studentsData.filter(x => x.pack && x.pack.paymentStatus === 'paid' && !x.pack.notaFiscalSent).map(x => `<tr><td>${esc(x.prenom)} ${esc(x.nom||'')}</td><td>Forfait de ${x.pack.total} séances</td><td><button type="button" class="btn btn-secondary btn-sm" onclick="openAdminStudentSection('${x.id}','forfait')">Envoyer</button></td></tr>`),
        ...slots.filter(x => x.reservedBy && !x.isPack && !x.isExperimental && x.paymentStatus === 'paid' && !x.notaFiscalSent).map(x => `<tr><td>${esc(x.reservedName || 'Élève')}</td><td>Cours du ${fmtSlotDate(x.date)}</td><td><button type="button" class="btn btn-secondary btn-sm" onclick="seanceOuvrir('${x.id}')">Envoyer</button></td></tr>`)
      ];
      return notas.length ? `<h2 class="section-title">Notas fiscais à envoyer</h2><div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Objet</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>${notas.join('')}</tbody></table></div>` : '';
    })()}
    <h2 class="section-title">Forfaits</h2>
    ${forfaits ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Élève</th><th scope="col">Forfait</th><th scope="col">Réalisées</th><th scope="col">Restantes</th><th scope="col">Programmées</th><th scope="col">Anomalies</th><th scope="col">Paiement</th><th scope="col">Statut</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>${forfaits}</tbody></table></div>`
      : profEmptyHTML('wallet', 'Aucun forfait en cours', 'Les forfaits se créent depuis Forfaits & paiements › Nouveau forfait.')}
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
  if(typeof SEANCES !== 'undefined') SEANCES.at = 0;
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
    <p class="tp-dim">Les e-mails automatiques (rappel 24 h, relances, annulations) se règlent dans Paramètres › Réglages › Annulations & automatisations.</p>`;
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
const FICHE_SECTIONS = [['dossiers','Dossiers & bilans'],['parcours','Thèmes'],['cours','Cours & confirmations'],['forfait','Forfait'],
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
      await seancesCharger();
      const slots = SEANCES.liste.filter(x => x.reservedBy === s.id).sort((a,b)=> new Date(b.date) - new Date(a.date));
      const c = rptCompteurs(slots);
      el.innerHTML = `<p class="rpt-counters">${rptCompteursHTML(c)}</p>
        ${slots.length ? seanceListeHTML(slots, {sansEleve:true}) : profEmptyHTML('calendar', 'Aucun cours réservé', '')}
        <h3 class="sub-title">Réponses aux rappels et tolérances</h3>
        <div id="fiche-reponses" aria-live="polite"><p class="teacher-empty" role="status">Chargement…</p></div>`;
      suiviFicheCharger(s, false);
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
