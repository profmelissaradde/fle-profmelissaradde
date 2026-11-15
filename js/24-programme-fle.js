/* ======================= PROGRAMME PÉDAGOGIQUE FLE 2026-2027 =======================
   Rubrique professeure « Programme pédagogique FLE » : calendrier (année / mois / semaine),
   fiches et séances (parcours 1 à 4 séances, formats 15 / 20 / 30 min d'oral), bibliothèque
   filtrable, PowerPoint privés, suivi et import du paquet de contenus.

   SÉCURITÉ (voir docs/PROGRAMME-FLE.md)
   - Ce fichier ne contient AUCUN contenu pédagogique, corrigé ni lien : il est public (GitHub Pages).
   - Les contenus sont importés par la professeure dans des collections Firestore lisibles par elle
     seule (programmeSemaines, programmeFiches, programmePptx, programmeSuivi).
   - Les .pptx sont dans un dossier Drive privé ; téléchargement et remplacement passent par
     l'Apps Script, qui revérifie l'UID de la professeure à chaque appel.
   - Les élèves ne lisent que programmeEleve publié (exercices interactifs, sans notes ni fiches),
     via le moteur de thèmes v2 (js/11). Aucun bouton n'est la seule barrière : les règles le sont. */

const PROG_NIV = ['A1','A2','B1','B2','C1','C2'];
const PROG_COL = {A1:'#2E6B4F', A2:'#1F6F78', B1:'#3D5A80', B2:'#5B4B8A', C1:'#9A4F63', C2:'#2A3340'};
const PROG_DEG = {1:'Découverte', 2:'Application', 3:'Approfondissement', 4:'Production', 5:'Défi'};
const PROG_ETAPE = {1:'Échauffement', 2:'Expression guidée', 3:'Expression développée', 4:'Interaction', 5:'Correction et réemploi'};
const PROG_COMP = {vocabulaire:'Vocabulaire', ce:'Compréhension écrite', grammaire:'Grammaire', conjugaison:'Conjugaison', eo:'Expression orale', ee:'Expression écrite', synthese:'Synthèse / défi'};
const PROG_PARCOURS = {'1':['U'], '2':['P2-S1','P2-S2'], '3':['S1','S2','P3-S3'], '4':['S1','S2','S3','S4']};
const PROG_DECK_LABEL = {S1:'Séance 1 sur 4', S2:'Séance 2 sur 4', S3:'Séance 3 sur 4', S4:'Séance 4 sur 4', 'P3-S3':'Séance 3 sur 3', 'P2-S1':'Séance 1 sur 2', 'P2-S2':'Séance 2 sur 2', U:'Séance unique'};
const PROG_STATUTS = {cree:'Créé', valide:'Validé'};
const PROG_MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

const prog = {semaines:null, pptx:null, suivi:null, fiches:{}, erreur:null, chargement:null};
const progUI = {
  cal:{mode:'annee', mois:null, semaine:null},
  fiche:{semaine:null, niveau:'A1', parcours:'4', format:'B', edition:false},
  biblio:{niveau:'', age:'', domaine:'', competence:'', grammaire:'', degre:'', seances:'', oral:'', type:'', q:''},
  pptx:{q:'', niveau:'', semaine:'', seance:'', version:'prof', audit:null},
  import:{log:[], enCours:false}
};

/* ---------- utilitaires ---------- */
function progDateFr(iso, an){ const d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + PROG_MOIS[d.getMonth()] + (an ? ' ' + d.getFullYear() : ''); }
function progPeriode(s){ return `${progDateFr(s.debut)} → ${progDateFr(s.fin, true)}`; }
function progNivChip(n){ return `<span class="prog-niv" style="--niv:${PROG_COL[n] || '#3D5A80'}">${esc(n)}</span>`; }
function progSemaine(id){ return (prog.semaines || []).find(s => s.id === id); }
function progSemaineCourante(){
  const auj = new Date().toISOString().slice(0, 10), l = prog.semaines || [];
  return (l.find(s => s.debut <= auj && auj <= s.fin) || l.find(s => s.debut > auj) || l[l.length - 1] || {}).id;
}
function progSuivi(semaine, niv){ return (prog.suivi || {})[`${semaine}_${niv}`] || {}; }
function progPptxDe(semaine, niv){ return (prog.pptx || []).filter(p => p.semaineId === semaine && p.niveau === niv); }
function progErreurHTML(){
  return `<div class="tp-warn"><p><b>Le programme ne peut pas être lu.</b> ${esc(prog.erreur || '')}</p>
    <p>Vérifie que les nouvelles règles Firestore sont publiées (docs/PROGRAMME-FLE.md, étape 2) et que le paquet de contenus a été importé (onglet Import).</p></div>`;
}

/* ---------- chargement (professeure) ---------- */
async function progCharger(force){
  if(prog.semaines && !force) return prog;
  if(prog.chargement && !force) return prog.chargement;
  prog.chargement = (async ()=>{
    try{
      const [sem, ppt, sui] = await Promise.all([
        db.collection('programmeSemaines').get(),
        db.collection('programmePptx').get(),
        db.collection('programmeSuivi').get()]);
      prog.semaines = sem.docs.map(d => ({id:d.id, ...d.data()})).sort((a, b) => a.debut < b.debut ? -1 : 1);
      prog.pptx = ppt.docs.map(d => ({docId:d.id, ...d.data()}));
      prog.suivi = Object.fromEntries(sui.docs.map(d => [d.id, d.data()]));
      prog.erreur = null;
    }catch(e){ prog.erreur = (e && e.message) || String(e); prog.semaines = prog.semaines || []; prog.pptx = prog.pptx || []; prog.suivi = prog.suivi || {}; }
    prog.chargement = null; return prog;
  })();
  return prog.chargement;
}
async function progFiche(semaine, niv){
  const id = `${semaine}_${niv}`;
  if(prog.fiches[id] !== undefined) return prog.fiches[id];
  try{
    const d = await db.collection('programmeFiches').doc(id).get();
    prog.fiches[id] = d.exists ? JSON.parse(d.data().data) : null;
  }catch(e){ prog.fiches[id] = null; prog.erreur = (e && e.message) || String(e); }
  return prog.fiches[id];
}
async function progSuiviMaj(semaine, niv, patch){
  const id = `${semaine}_${niv}`;
  await db.collection('programmeSuivi').doc(id).set({semaine, niveau:niv, ...patch, maj: firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
  const d = await db.collection('programmeSuivi').doc(id).get();
  prog.suivi[id] = d.data();
}

/* ---------- parcours élève publiés (appelé par tpLoadConfig, js/11) ---------- */
async function progEleveCharger(){
  if(typeof db === 'undefined' || !db || typeof temasSemanas === 'undefined') return;
  const prof = typeof isTeacher !== 'undefined' && isTeacher;
  let q = db.collection('programmeEleve');
  if(!prof) q = q.where('publie', '==', true);
  const snap = await q.get();
  const themes = [];
  snap.docs.forEach(d => { try{ const t = JSON.parse(d.data().theme); if(t && t.id === d.id && t.version === 2) themes.push(t); }catch(e){ console.warn('Parcours illisible :', d.id); } });
  themes.sort((a, b) => a.date_debut < b.date_debut ? -1 : 1).forEach(t => {
    if(temasSemanas.some(x => x.id === t.id)) return;
    /* Insertion chronologique : après le dernier thème dont la date de début est antérieure ou égale. */
    let pos = temasSemanas.length;
    for(let i = temasSemanas.length - 1; i >= 0; i--){ const dd = temasSemanas[i].date_debut || ''; if(dd > t.date_debut) pos = i; else break; }
    temasSemanas.splice(pos, 0, t);
  });
}

/* ---------- onglet : calendrier ---------- */
async function progCalendrierLoad(){
  const body = profBody(); if(!body) return;
  await progCharger();
  if(!profOnTab('prog-calendrier')) return;
  progCalendrierRender();
}
function progStatutsNiv(s){
  return PROG_NIV.map(n => {
    const su = progSuivi(s.id, n), np = progPptxDe(s.id, n).length, att = Object.keys(su.attributions || {}).length;
    const etat = su.fiche ? (su.statut === 'valide' ? 'valide' : 'cree') : 'vide';
    return `<span class="prog-dot ${etat}" title="${n} : ${su.fiche ? PROG_STATUTS[su.statut || 'cree'] : 'à produire'}${np ? ' · ' + np + ' PowerPoint' : ''}${att ? ' · attribué à ' + att + ' élève(s)' : ''}">${n}</span>`;
  }).join('');
}
function progCarteSemaine(s){
  return `<button type="button" class="prog-week ${s.bilan ? 'bilan' : ''} ${s.id === progSemaineCourante() ? 'courante' : ''}" onclick="progUI.cal.mode='semaine'; progUI.cal.semaine='${s.id}'; progCalendrierRender()">
    <span class="prog-week-dates">S${String(s.semaineIso).padStart(2, '0')} · ${esc(progPeriode(s))}</span>
    <span class="prog-week-title">${esc(s.titre)}</span>
    <span class="prog-week-meta">${esc(s.domaine.split(',')[0])} · ${esc(s.ton)}</span>
    <span class="prog-dots">${progStatutsNiv(s)}</span></button>`;
}
function progCalendrierRender(){
  const body = profBody(); if(!body) return;
  if(prog.erreur && !(prog.semaines || []).length){ body.innerHTML = progErreurHTML(); return; }
  if(!(prog.semaines || []).length){ body.innerHTML = profEmptyHTML('calendar', 'Aucun calendrier importé', 'Importe le paquet de contenus depuis l\'onglet « Import ».'); return; }
  const v = progUI.cal;
  const modes = [['annee','Année'],['mois','Mois'],['semaine','Semaine']];
  let html = `<p class="page-intro">${prog.semaines.length} semaines, du ${esc(progDateFr(prog.semaines[0].debut, true))} au ${esc(progDateFr(prog.semaines[prog.semaines.length - 1].fin, true))}. Pastilles : <span class="prog-dot vide">vide</span> à produire · <span class="prog-dot cree">créé</span> fiche importée · <span class="prog-dot valide">validé</span> fiche validée.</p>
    <div class="ui-filters" role="group" aria-label="Vue du calendrier">${modes.map(([k, l]) => `<button type="button" class="ui-chip" aria-pressed="${v.mode === k}" onclick="progUI.cal.mode='${k}'; progCalendrierRender()">${l}</button>`).join('')}</div>`;
  if(v.mode === 'annee'){
    const parMois = {};
    prog.semaines.forEach(s => { const k = s.debut.slice(0, 7); (parMois[k] = parMois[k] || []).push(s); });
    html += Object.keys(parMois).map(k => `<h2 class="section-title">${PROG_MOIS[+k.slice(5) - 1]} ${k.slice(0, 4)}</h2><div class="prog-weeks">${parMois[k].map(progCarteSemaine).join('')}</div>`).join('');
  } else if(v.mode === 'mois'){
    const mois = Array.from(new Set(prog.semaines.map(s => s.debut.slice(0, 7))));
    if(!v.mois || !mois.includes(v.mois)) v.mois = (progSemaine(progSemaineCourante()) || prog.semaines[0]).debut.slice(0, 7);
    const liste = prog.semaines.filter(s => s.debut.slice(0, 7) === v.mois);
    html += `<div class="field prog-select"><label for="prog-mois">Mois</label><select id="prog-mois" onchange="progUI.cal.mois=this.value; progCalendrierRender()">${mois.map(m => `<option value="${m}" ${m === v.mois ? 'selected' : ''}>${PROG_MOIS[+m.slice(5) - 1]} ${m.slice(0, 4)}</option>`).join('')}</select></div>`;
    html += liste.map(s => `<article class="settings-card prog-month-week"><h2>${esc(s.titre)} <span class="badge">${esc(progPeriode(s))}</span>${s.bilan ? ' <span class="badge badge-info">Bilan</span>' : ''}</h2>
      <p class="tp-dim">${esc(s.accroche)}</p>
      <div class="prog-table-wrap"><table class="prog-table"><thead><tr><th>Niveau</th><th>Objectif communicatif</th><th>Grammaire</th><th>Ressources</th></tr></thead><tbody>
      ${PROG_NIV.map(n => { const L = s.niveaux[n], su = progSuivi(s.id, n); return `<tr><td>${progNivChip(n)}</td><td>${esc(L.communication)}</td><td>${esc(L.grammaire)}</td><td>${su.fiche ? '<span class="badge badge-success">Fiche</span> ' : '<span class="badge">À produire</span> '}${progPptxDe(s.id, n).length ? `<span class="badge badge-info">${progPptxDe(s.id, n).length} PPTX</span>` : ''}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="progUI.cal.mode='semaine'; progUI.cal.semaine='${s.id}'; progCalendrierRender()">Voir la semaine</button></div></article>`).join('');
  } else {
    if(!v.semaine || !progSemaine(v.semaine)) v.semaine = progSemaineCourante();
    const s = progSemaine(v.semaine), i = prog.semaines.indexOf(s);
    html += `<div class="prog-week-nav">
      <button type="button" class="btn btn-ghost btn-sm" ${i <= 0 ? 'disabled' : ''} onclick="progUI.cal.semaine='${(prog.semaines[i - 1] || {}).id}'; progCalendrierRender()">← Semaine précédente</button>
      <select aria-label="Choisir une semaine" onchange="progUI.cal.semaine=this.value; progCalendrierRender()">${prog.semaines.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>S${String(x.semaineIso).padStart(2, '0')} ${x.annee} · ${esc(x.titre).slice(0, 60)}</option>`).join('')}</select>
      <button type="button" class="btn btn-ghost btn-sm" ${i >= prog.semaines.length - 1 ? 'disabled' : ''} onclick="progUI.cal.semaine='${(prog.semaines[i + 1] || {}).id}'; progCalendrierRender()">Semaine suivante →</button></div>`;
    html += progSemaineHTML(s);
  }
  body.innerHTML = html;
}
function progSemaineHTML(s){
  return `<article class="settings-card prog-week-detail">
    <p class="eyebrow">${esc(s.annee)} · Semaine ${String(s.semaineIso).padStart(2, '0')} · ${esc(progPeriode(s))}${s.bilan ? ' · semaine bilan' : ''}</p>
    <h2>${esc(s.titre)}</h2>
    <p class="prog-accroche">${esc(s.accroche)}</p>
    <div class="prog-grid3">
      <div><h3>Scénario</h3><p>${esc(s.scenario)}</p></div>
      <div><h3>Mission finale</h3><p>${esc(s.mission)}</p></div>
      <div><h3>Culture francophone</h3><p>${esc(s.culture)}</p></div></div>
    <h3>Variantes selon l'âge (indépendantes du niveau)</h3>
    <ul class="prog-ages"><li><b>Enfants</b> — ${esc(s.ages.enfant)}</li><li><b>Adolescents</b> — ${esc(s.ages.ado)}</li><li><b>Adultes</b> — ${esc(s.ages.adulte)}</li></ul>
    <div class="prog-table-wrap"><table class="prog-table"><thead><tr><th>Niveau</th><th>Communication</th><th>Grammaire</th><th>Phonétique</th><th>Vocabulaire</th><th>Ressources et progression</th></tr></thead><tbody>
    ${PROG_NIV.map(n => { const L = s.niveaux[n], su = progSuivi(s.id, n), np = progPptxDe(s.id, n).length, att = Object.keys(su.attributions || {}).length;
      return `<tr><td>${progNivChip(n)}</td><td>${esc(L.communication)}</td><td>${esc(L.grammaire)}</td><td>${esc(L.phonetique)}</td><td>${esc(L.vocabulaire.join(', ') || L.vocabulaireNote)}</td>
      <td>${su.fiche ? `<button type="button" class="btn btn-secondary btn-sm" onclick="progOuvrirFiche('${s.id}','${n}')">Fiche ${su.statut === 'valide' ? '(validée)' : ''}</button>` : '<span class="badge">À produire</span>'}
        ${np ? ` <button type="button" class="btn btn-ghost btn-sm" onclick="progUI.pptx.semaine='${s.id}'; progUI.pptx.niveau='${n}'; setTeacherTab('prog-pptx')">${np} PPTX</button>` : ''}
        ${att ? ` <span class="badge badge-info">${att} élève(s)</span>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div></article>`;
}
function progOuvrirFiche(semaine, niv){ progUI.fiche.semaine = semaine; progUI.fiche.niveau = niv; progUI.fiche.edition = false; setTeacherTab('prog-fiches'); }

/* ---------- onglet : fiches et séances ---------- */
async function progFichesLoad(){
  const body = profBody(); if(!body) return;
  await progCharger();
  if(typeof profEnsureStudents === 'function'){ try{ await profEnsureStudents(); }catch(e){} }
  const f = progUI.fiche;
  const dispo = Object.values(prog.suivi || {}).filter(x => x.fiche).sort((a, b) => a.semaine < b.semaine ? -1 : 1);
  if(!f.semaine){ const c = dispo[0]; if(c){ f.semaine = c.semaine; f.niveau = c.niveau; } }
  if(f.semaine) await progFiche(f.semaine, f.niveau);
  if(!profOnTab('prog-fiches')) return;
  progFichesRender();
}
function progFichesRender(){
  const body = profBody(); if(!body) return;
  if(prog.erreur && !(prog.semaines || []).length){ body.innerHTML = progErreurHTML(); return; }
  const f = progUI.fiche;
  const semAvecFiche = Array.from(new Set(Object.values(prog.suivi || {}).filter(x => x.fiche).map(x => x.semaine))).sort();
  if(!semAvecFiche.length){ body.innerHTML = profEmptyHTML('book', 'Aucune fiche importée', 'Les fiches détaillées arrivent avec le paquet de contenus (onglet « Import »). Le calendrier, lui, couvre déjà toutes les semaines.'); return; }
  const F = prog.fiches[`${f.semaine}_${f.niveau}`];
  const s = progSemaine(f.semaine) || {titre:'', niveaux:{}};
  const sel = `<div class="prog-selects">
    <div class="field"><label for="pf-sem">Semaine</label><select id="pf-sem" onchange="progUI.fiche.semaine=this.value; progFichesLoad()">${semAvecFiche.map(id => { const x = progSemaine(id) || {}; return `<option value="${id}" ${id === f.semaine ? 'selected' : ''}>${id} · ${esc(x.titre || '')}</option>`; }).join('')}</select></div>
    <div class="field"><label for="pf-niv">Niveau</label><select id="pf-niv" onchange="progUI.fiche.niveau=this.value; progFichesLoad()">${PROG_NIV.map(n => `<option ${n === f.niveau ? 'selected' : ''} ${progSuivi(f.semaine, n).fiche ? '' : 'disabled'}>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="pf-par">Séances par semaine</label><select id="pf-par" onchange="progUI.fiche.parcours=this.value; progFichesRender()">${['1','2','3','4'].map(p => `<option value="${p}" ${p === f.parcours ? 'selected' : ''}>${p} séance${p > 1 ? 's' : ''}</option>`).join('')}</select></div>
    <div class="field"><label for="pf-fmt">Temps d'oral</label><select id="pf-fmt" onchange="progUI.fiche.format=this.value; progFichesRender()">${[['A','15 min (format A)'],['B','20 min (format B)'],['C','30 min (format C)']].map(([k, l]) => `<option value="${k}" ${k === f.format ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>`;
  if(!F){ body.innerHTML = sel + '<p class="tp-warn">Cette fiche n\'a pas encore été produite ou importée.</p>'; return; }
  const su = progSuivi(f.semaine, f.niveau);
  const EX = Object.fromEntries(F.ex.map(e => [e.id, e]));
  const decks = PROG_PARCOURS[f.parcours].map(c => F.decks.find(d => d.code === c)).filter(Boolean);
  const pt = (a, b) => `${esc(a)}${b ? `<span class="prog-pt">${esc(b)}</span>` : ''}`;
  body.innerHTML = sel + `
  <article class="settings-card">
    <div class="prog-fiche-head">${progNivChip(F.niveau)}<div><h2>${esc(F.theme)}</h2><p class="tp-dim">${esc(progPeriode(s))} · explications ${F.langue === 'bilingue' ? 'bilingues français-portugais' : F.langue === 'fr+pt' ? 'en français, portugais ponctuel' : 'en français'}</p></div>
      <span class="badge ${su.statut === 'valide' ? 'badge-success' : 'badge-warning'}">${PROG_STATUTS[su.statut || 'cree']}</span></div>
    <div class="btn-row">
      ${su.statut === 'valide' ? `<button type="button" class="btn btn-ghost btn-sm" onclick="progStatut('cree')">Repasser en « créé »</button>` : `<button type="button" class="btn btn-sm" onclick="progStatut('valide')">Valider la fiche</button>`}
      <button type="button" class="btn btn-secondary btn-sm" onclick="progPublierParcours(true)">Publier le parcours élève</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="progPublierParcours(false)">Retirer la publication</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="window.print()">Imprimer la fiche</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="progUI.fiche.edition=!progUI.fiche.edition; progFichesRender()">${f.edition ? 'Fermer l\'éditeur' : 'Modifier la fiche (JSON)'}</button></div>
    ${f.edition ? `<div class="field"><label for="pf-json">Fiche complète (JSON) — garde les identifiants d'exercices</label><textarea id="pf-json" rows="16" class="prog-json">${esc(JSON.stringify(F, null, 1))}</textarea></div><div class="btn-row"><button type="button" class="btn btn-sm" onclick="progFicheEnregistrer()">Enregistrer la fiche</button></div>` : ''}
    <div class="prog-grid3">
      <div><h3>Objectifs</h3><ul>${F.objectifs.map(o => `<li>${pt(o[0], o[1])}</li>`).join('')}</ul><p><b>À retenir :</b> ${pt(F.essentiel[0], F.essentiel[1])}</p></div>
      <div><h3>Grammaire</h3><p><b>${esc(F.gram.titre)}</b></p><ul>${F.gram.regles.map(r => `<li>${pt(r[0], r[1])}</li>`).join('')}</ul></div>
      <div><h3>Phonétique</h3><p><b>${esc(F.phon.titre)}</b></p><p>${pt(F.phon.explication[0], F.phon.explication[1])}</p><p><i>${esc(F.phon.virelangue)}</i></p></div></div>
    <details class="prog-details"><summary>Vocabulaire (${F.vocab.length}), contrastes français-portugais et erreurs fréquentes</summary>
      <div class="prog-table-wrap"><table class="prog-table"><tbody>${F.vocab.map(v => `<tr><td><b>${esc(v[0])}</b></td><td class="prog-pt-cell">${esc(v[1])}</td><td>${esc(v[2])}</td></tr>`).join('')}</tbody></table></div>
      <h3>Français / portugais</h3><ul>${F.gram.contraste.map(c => `<li>${pt(c[0], c[1])}</li>`).join('')}</ul>
      <h3>Erreurs fréquentes des Brésiliens</h3><ul>${F.gram.erreurs.map(e => `<li><s>${esc(e[0])}</s> → <b>${esc(e[1])}</b> — ${esc(e[2])}</li>`).join('')}</ul>
      <h3>Culture : ${esc(F.culture.titre)}</h3><p>${pt(F.culture.texte[0], F.culture.texte[1])}</p></details>
    <details class="prog-details"><summary>Document « ${esc(F.texte.titre)} » et corrigé</summary>
      ${F.texte.lignes.map(l => `<p><b>${esc(l[0])}</b> ${esc(l[1])}</p>`).join('')}
      <ol>${F.texte.questions.map(q => `<li>${esc(q[0])} <span class="prog-answer">${esc(q[1])}</span></li>`).join('')}</ol></details>
    <details class="prog-details"><summary>Variantes enfant / adolescent / adulte</summary><ul>${Object.entries(F.variantes).map(([k, v]) => `<li><b>${esc(k)}</b> — ${esc(v)}</li>`).join('')}</ul></details>
  </article>
  <h2 class="section-title">Parcours ${f.parcours} séance${f.parcours > 1 ? 's' : ''} · oral ${({A:'15', B:'20', C:'30'})[f.format]} minutes</h2>
  ${decks.map(d => progDeckHTML(F, d, EX)).join('')}
  ${progElevesHTML(F, su)}`;
}
function progDeckHTML(F, d, EX){
  const f = progUI.fiche;
  const files = (prog.pptx || []).filter(p => p.semaineId === F.semaine && p.niveau === F.niveau && p.seance === d.code);
  const oral = d.oral.map(i => F.oral[i]);
  const etapes = {A:[1,2,3,4], B:[1,2,3,4,5], C:[1,2,3,4,5]}[f.format];
  return `<article class="settings-card prog-deck">
    <h3>${esc(d.titre)} <span class="badge">${d.ex.length} exercices · ${oral.length} activités orales</span></h3>
    <p class="tp-dim">${esc(d.histoire)}</p>
    <div class="btn-row">${files.sort((a, b) => a.version < b.version ? 1 : -1).map(p => `<button type="button" class="btn btn-secondary btn-sm" onclick="progPptxTelecharger('${p.docId}')">${uiIcon('book')} PowerPoint ${p.version === 'prof' ? 'professeure' : 'projection'} (${p.diapositives} diapositives)</button>`).join('') || '<span class="badge">PowerPoint non importé</span>'}</div>
    <div class="prog-table-wrap"><table class="prog-table"><thead><tr><th>Min</th><th>Étape</th><th>Contenu</th></tr></thead><tbody>${d.formats[f.format].map(r => `<tr><td>${r.min || '—'}</td><td>${esc(r.etape)}</td><td>${esc(r.contenu)}</td></tr>`).join('')}</tbody></table></div>
    <details class="prog-details"><summary>Exercices et corrigés</summary>${d.ex.map((id, k) => progExerciceHTML(F, EX[id], k + 1)).join('')}</details>
    <details class="prog-details"><summary>Banque orale (format ${f.format})</summary>${oral.filter(o => etapes.includes(o.etape)).map(progOralHTML).join('')}</details>
    ${d.roles.length ? `<details class="prog-details"><summary>Jeux de rôle</summary>${d.roles.map(i => F.roles[i]).map(r => `<div class="prog-item"><p><b>${esc(r.titre)}</b> — ${esc(r.roles)}</p><p>${esc(r.situation)}</p><ul>${r.consignes.map(c => `<li>${esc(c)}</li>`).join('')}</ul><p class="tp-dim">Expressions : ${r.expressions.map(esc).join(' · ')}<br>Critères : ${r.criteres.map(esc).join(' · ')}</p></div>`).join('')}</details>` : ''}
    <p class="tp-dim">Activité de secours : ${F.secours.filter(a => a.seance === d.secours).map(a => `<b>${esc(a.titre)}</b> (${esc(a.duree)}) — ${esc(a.consigne)}`).join(' ') || '—'}<br>Travail personnel : ${esc(F.devoirs[d.devoirs] || '—')}</p>
  </article>`;
}
function progCorrige(e){
  const t = e.type;
  if(t === 'association') return e.paires.map(p => `${p[0]} → ${p[1]}`);
  if(t === 'trous'){ let k = 0; return [e.texte.replace(/___/g, () => '[' + e.blancs[k++].join(' / ') + ']')]; }
  if(t === 'qcm' || t === 'choix_justif') return e.items.map(it => `${it.q} → ${it.options[it.correct]}${it.expl ? ' (' + it.expl + ')' : ''}`);
  if(['court','correction','transformation'].includes(t)) return e.items.map(it => `${it.q} → ${it.accept[0]}${it.expl ? ' (' + it.expl + ')' : ''}`);
  if(t === 'ordre') return e.items.map(it => it.unites.join(' '));
  if(t === 'ouverte') return ['Modèle / critères : ' + e.modele];
  return ['Production orale : correction différée.'];
}
function progExerciceTexte(F, e){
  return `${PROG_DEG[e.deg]} — ${e.consigne}\n` + (e.texte ? e.texte + '\n' : '') + (e.paires ? e.paires.map(p => '- ' + p[0]).join('\n') + '\n' : '') + (e.items ? e.items.map((it, i) => `${i + 1}. ${it.q || (it.unites || []).join(' / ')}${it.options ? ' (' + it.options.join(' / ') + ')' : ''}`).join('\n') + '\n' : '') + 'Corrigé :\n' + progCorrige(e).join('\n');
}
function progExerciceHTML(F, e, num){
  return `<div class="prog-item"><p><b>Ex. ${num} · ${PROG_DEG[e.deg]}</b> <span class="badge">${PROG_COMP[e.comp] || esc(e.comp)}</span> ${esc(e.consigne)}${e.consigne_pt ? `<span class="prog-pt">${esc(e.consigne_pt)}</span>` : ''}</p>
    ${e.support ? `<p class="prog-support">${esc(e.support)}</p>` : ''}${e.texte ? `<p>${esc(e.texte)}</p>` : ''}
    ${e.items && e.type !== 'ordre' ? `<ol>${e.items.map(it => `<li>${esc(it.q)}${it.options ? ' — ' + it.options.map(esc).join(' / ') : ''}</li>`).join('')}</ol>` : ''}
    <p class="prog-answer">${progCorrige(e).map(esc).join('<br>')}</p>
    <button type="button" class="btn btn-ghost btn-sm" onclick="progCopier('${e.id}')">Copier l'activité (réutiliser)</button></div>`;
}
function progOralHTML(o){
  return `<div class="prog-item"><p><b>${PROG_ETAPE[o.etape]} · ${o.duree} min</b> — ${esc(o.q)}</p>
    <ul class="prog-oral"><li><b>Objectif :</b> ${esc(o.objectif)}</li><li><b>Réponse possible :</b> ${esc(o.reponse)}</li><li><b>Difficultés :</b> ${esc(o.difficultes)}</li>
    <li><b>Relances :</b> ${o.relances.map(esc).join(' / ')}</li><li><b>Plus simple :</b> ${esc(o.simple)}</li><li><b>Plus exigeant :</b> ${esc(o.exigeant)}</li></ul></div>`;
}
async function progCopier(id){
  const F = prog.fiches[`${progUI.fiche.semaine}_${progUI.fiche.niveau}`]; const e = F && F.ex.find(x => x.id === id);
  if(!e) return;
  try{ await navigator.clipboard.writeText(progExerciceTexte(F, e)); uiNotify('Activité copiée : tu peux la coller dans une autre séance ou une adaptation.', 'success'); }
  catch(err){ uiNotify('Copie impossible dans ce navigateur.', 'error'); }
}
async function progStatut(statut){
  const f = progUI.fiche;
  try{ await progSuiviMaj(f.semaine, f.niveau, {statut}); journaliser('pedagogie', `Programme FLE : fiche ${f.semaine} ${f.niveau} → ${PROG_STATUTS[statut]}`); progFichesRender(); }
  catch(e){ uiNotify('Mise à jour impossible : vérifie les règles Firestore.', 'error'); }
}
async function progFicheEnregistrer(){
  const f = progUI.fiche; const ta = document.getElementById('pf-json');
  let data; try{ data = JSON.parse(ta.value); }catch(e){ uiNotify('JSON invalide : ' + e.message, 'error'); return; }
  if(data.niveau !== f.niveau || !Array.isArray(data.ex) || !Array.isArray(data.decks)){ uiNotify('La fiche doit garder son niveau, ses exercices (ex) et ses séances (decks).', 'error'); return; }
  try{
    await db.collection('programmeFiches').doc(`${f.semaine}_${f.niveau}`).set({semaine:f.semaine, niveau:f.niveau, data:JSON.stringify(data), maj: firebase.firestore.FieldValue.serverTimestamp(), modifieeParProf:true}, {merge:true});
    prog.fiches[`${f.semaine}_${f.niveau}`] = data; f.edition = false;
    uiNotify('Fiche enregistrée. Pense à régénérer les PowerPoint si tu as modifié des exercices.', 'success'); progFichesRender();
  }catch(e){ uiNotify('Enregistrement impossible.', 'error'); }
}
async function progPublierParcours(publie){
  const f = progUI.fiche; const id = 'programme-' + f.semaine.toLowerCase();
  try{
    const d = await db.collection('programmeEleve').doc(id).get();
    if(!d.exists){ uiNotify('Le parcours élève de cette semaine n\'a pas été importé.', 'error'); return; }
    if(publie && !confirm('Publier les exercices interactifs de cette semaine pour les élèves (tous niveaux) ? Ils deviendront visibles à partir de la date de début de la semaine. Les fiches et PowerPoint restent privés.')) return;
    await db.collection('programmeEleve').doc(id).update({publie, majPublie: firebase.firestore.FieldValue.serverTimestamp()});
    if(typeof tpWriteConfig === 'function'){ await tpWriteConfig({themes:{[id]:{publie, majPublie: new Date().toISOString()}}}); if(tpConfig && tpConfig.themes) tpConfig.themes[id] = {...(tpConfig.themes[id] || {}), publie}; }
    if(typeof tpSyncCalendrier === 'function') await tpSyncCalendrier();
    journaliser('pedagogie', `Programme FLE : parcours ${f.semaine} ${publie ? 'publié' : 'retiré'}`);
    uiNotify(publie ? 'Parcours publié : il apparaît aussi dans Pédagogie › Thèmes de la semaine (correction, attribution).' : 'Publication retirée.', 'success');
  }catch(e){ uiNotify('Publication impossible : ' + (e && e.message || e), 'error'); }
}

/* --- élèves : attribution, séances terminées, difficultés, adaptation --- */
function progElevesHTML(F, su){
  const f = progUI.fiche;
  const eleves = (typeof studentsData !== 'undefined' ? studentsData : []).filter(s => s.niveau === F.niveau);
  const att = su.attributions || {}, ter = su.terminees || {}, notes = su.notes || {}, adapt = su.adaptations || {};
  const decks = PROG_PARCOURS[f.parcours];
  return `<h2 class="section-title">Élèves de niveau ${esc(F.niveau)}</h2>
  ${eleves.length ? eleves.map(s => { const a = att[s.id], codes = a ? PROG_PARCOURS[a.parcours] : decks;
    return `<article class="teacher-entry"><div class="who">${esc(((s.prenom || '') + ' ' + (s.nom || '')).trim() || s.email || s.id)} ${a ? `<span class="badge badge-info">Attribué · ${a.parcours} séance(s)/semaine</span>` : '<span class="badge">Non attribué</span>'}</div>
      <div class="teacher-entry-actions">
        ${a ? `<button type="button" class="del" onclick="progAttribuer('${s.id}', null)">Retirer l'attribution</button>` : `<button type="button" onclick="progAttribuer('${s.id}', '${f.parcours}')">Attribuer (parcours ${f.parcours} séance${f.parcours > 1 ? 's' : ''})</button>`}
        ${codes.map(c => `<label class="check-row"><input type="checkbox" ${(ter[s.id] || {})[c] ? 'checked' : ''} onchange="progTerminee('${s.id}','${c}', this.checked)"> ${esc(PROG_DECK_LABEL[c])} terminée</label>`).join('')}</div>
      <div class="form-grid"><div class="field"><label for="pn-${s.id}">Difficultés observées</label><textarea id="pn-${s.id}" rows="2" maxlength="1000">${esc(notes[s.id] || '')}</textarea></div>
        <div class="field"><label for="pa-${s.id}">Adaptation de la séance (activité réutilisée, contenu ajusté…)</label><textarea id="pa-${s.id}" rows="2" maxlength="2000">${esc(adapt[s.id] || '')}</textarea></div></div>
      <div class="btn-row"><button type="button" class="btn btn-sm btn-secondary" onclick="progNoteEleve('${s.id}')">Enregistrer les notes</button></div></article>`; }).join('')
    : profEmptyHTML('users', 'Aucun élève de ce niveau', 'Les niveaux se règlent dans la fiche de chaque élève.')}`;
}
async function progAttribuer(uid, parcours){
  const f = progUI.fiche; const s = (studentsData || []).find(x => x.id === uid) || {};
  const val = parcours ? {parcours, nom: `${s.prenom || ''} ${s.nom || ''}`.trim(), ts: new Date().toISOString()} : firebase.firestore.FieldValue.delete();
  try{ await progSuiviMaj(f.semaine, f.niveau, {attributions:{[uid]: val}}); progFichesRender(); }
  catch(e){ uiNotify('Attribution impossible.', 'error'); }
}
async function progTerminee(uid, code, ok){
  const f = progUI.fiche;
  try{ await progSuiviMaj(f.semaine, f.niveau, {terminees:{[uid]:{[code]: ok ? new Date().toISOString() : firebase.firestore.FieldValue.delete()}}}); }
  catch(e){ uiNotify('Enregistrement impossible.', 'error'); }
}
async function progNoteEleve(uid){
  const f = progUI.fiche; const v = id => ((document.getElementById(id) || {}).value || '').slice(0, 2000);
  try{ await progSuiviMaj(f.semaine, f.niveau, {notes:{[uid]: v('pn-' + uid)}, adaptations:{[uid]: v('pa-' + uid)}}); uiNotify('Notes enregistrées (visibles par toi seule).', 'success'); }
  catch(e){ uiNotify('Enregistrement impossible.', 'error'); }
}

/* ---------- onglet : bibliothèque ---------- */
async function progBiblioLoad(){
  const body = profBody(); if(!body) return;
  await progCharger();
  const avec = Object.values(prog.suivi || {}).filter(x => x.fiche);
  await Promise.all(avec.map(x => progFiche(x.semaine, x.niveau)));
  if(!profOnTab('prog-bibliotheque')) return;
  progBiblioRender();
}
function progBiblioItems(){
  const items = [];
  (prog.semaines || []).forEach(s => PROG_NIV.forEach(n => {
    const L = s.niveaux[n];
    items.push({type:'semaine', semaine:s, niveau:n, titre:s.titre, texte:`${L.communication} · ${L.grammaire}`, grammaire:L.grammaire, domaine:s.domaine});
    const F = prog.fiches[`${s.id}_${n}`]; if(!F) return;
    const decksDe = id => F.decks.filter(d => d.ex.includes(id)).flatMap(d => d.parcours);
    F.ex.forEach(e => items.push({type:'exercice', semaine:s, niveau:n, titre:`${PROG_DEG[e.deg]} — ${e.consigne}`, e, deg:e.deg, comp:e.comp, grammaire:F.gram.titre, domaine:s.domaine, parcours:decksDe(e.id)}));
    F.oral.forEach((o, i) => items.push({type:'oral', semaine:s, niveau:n, titre:`${PROG_ETAPE[o.etape]} — ${o.q}`, o, comp:'eo', grammaire:F.gram.titre, domaine:s.domaine, etape:o.etape, parcours:F.decks.filter(d => d.oral.includes(i)).flatMap(d => d.parcours)}));
    F.roles.forEach((r, i) => items.push({type:'role', semaine:s, niveau:n, titre:`Jeu de rôle — ${r.titre}`, r, comp:'eo', grammaire:F.gram.titre, domaine:s.domaine, parcours:F.decks.filter(d => d.roles.includes(i)).flatMap(d => d.parcours)}));
  }));
  (prog.pptx || []).forEach(p => { const s = progSemaine(p.semaineId); if(s) items.push({type:'pptx', semaine:s, niveau:p.niveau, titre:`PowerPoint ${PROG_DECK_LABEL[p.seance] || p.seance} (${p.version})`, p, domaine:s.domaine, grammaire:(s.niveaux[p.niveau] || {}).grammaire || '', parcours:p.parcours}); });
  return items;
}
function progBiblioRender(){
  const body = profBody(); if(!body) return;
  if(prog.erreur && !(prog.semaines || []).length){ body.innerHTML = progErreurHTML(); return; }
  const b = progUI.biblio;
  const domaines = Array.from(new Set((prog.semaines || []).map(s => s.domaine.split(/[,(]/)[0].trim()))).sort();
  const sel = (id, label, opts, val) => `<div class="field"><label for="pb-${id}">${label}</label><select id="pb-${id}" onchange="progUI.biblio['${id}']=this.value; progBiblioRender()"><option value="">Tous</option>${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(val) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  let items = progBiblioItems();
  const q = b.q.trim().toLowerCase(), g = b.grammaire.trim().toLowerCase();
  items = items.filter(it => (!b.niveau || it.niveau === b.niveau) && (!b.type || it.type === b.type)
    && (!b.domaine || it.domaine.toLowerCase().startsWith(b.domaine.toLowerCase()))
    && (!b.competence || it.comp === b.competence)
    && (!b.degre || it.deg === +b.degre)
    && (!b.seances || (it.parcours || []).includes(b.seances))
    && (!b.oral || it.type !== 'oral' || ({'15':[1,2,3,4], '20':[1,2,3,4,5], '30':[1,2,3,4,5]}[b.oral] || []).includes(it.etape))
    && (!g || (it.grammaire || '').toLowerCase().includes(g))
    && (!q || (it.titre + ' ' + (it.texte || '') + ' ' + it.semaine.titre).toLowerCase().includes(q)));
  if(b.oral) items = items.filter(it => ['oral','role','pptx','semaine'].includes(it.type));
  const total = items.length; items = items.slice(0, 120);
  body.innerHTML = `<p class="page-intro">Toutes les activités du programme : les semaines du calendrier, et pour les semaines produites, chaque exercice (avec corrigé), activité orale, jeu de rôle et PowerPoint. Le filtre « âge » affiche la variante correspondante : le niveau et l'âge restent indépendants.</p>
  <div class="settings-card prog-filters">
    <div class="field"><label for="pb-q">Recherche</label><input id="pb-q" type="search" value="${esc(b.q)}" placeholder="mot-clé, thème…" onchange="progUI.biblio.q=this.value; progBiblioRender()"></div>
    ${sel('niveau', 'Niveau CECRL', PROG_NIV.map(n => [n, n]), b.niveau)}
    ${sel('age', 'Âge', [['enfant','Enfants'],['ado','Adolescents'],['adulte','Adultes']], b.age)}
    ${sel('domaine', 'Thématique', domaines.map(d => [d, d]), b.domaine)}
    ${sel('competence', 'Compétence', Object.entries(PROG_COMP), b.competence)}
    <div class="field"><label for="pb-g">Point grammatical</label><input id="pb-g" type="search" value="${esc(b.grammaire)}" placeholder="subjonctif, passé composé…" onchange="progUI.biblio.grammaire=this.value; progBiblioRender()"></div>
    ${sel('degre', 'Difficulté', Object.entries(PROG_DEG).map(([k, v]) => [k, k + ' — ' + v]), b.degre)}
    ${sel('seances', 'Séances / semaine', [['1','1'],['2','2'],['3','3'],['4','4']], b.seances)}
    ${sel('oral', 'Durée de conversation', [['15','15 min'],['20','20 min'],['30','30 min']], b.oral)}
    ${sel('type', 'Type de support', [['semaine','Semaine du calendrier'],['exercice','Exercice'],['oral','Activité orale'],['role','Jeu de rôle'],['pptx','PowerPoint']], b.type)}
    <div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" onclick="Object.keys(progUI.biblio).forEach(k=>progUI.biblio[k]=''); progBiblioRender()">Effacer les filtres</button></div></div>
  <p class="tp-dim" role="status">${total} résultat(s)${total > 120 ? ' — 120 premiers affichés, affine les filtres' : ''}.</p>
  <div class="prog-results">${items.map(progBiblioCarte).join('') || profEmptyHTML('library', 'Aucun résultat', 'Élargis les filtres.')}</div>`;
}
function progBiblioCarte(it){
  const age = progUI.biblio.age ? `<p class="prog-age"><b>Variante ${({enfant:'enfants', ado:'adolescents', adulte:'adultes'})[progUI.biblio.age]} :</b> ${esc(it.semaine.ages[progUI.biblio.age])}</p>` : '';
  const ouvrir = `<button type="button" class="btn btn-ghost btn-sm" onclick="progOuvrirFiche('${it.semaine.id}','${it.niveau}')">Ouvrir la fiche</button>`;
  let detail = '';
  if(it.type === 'exercice') detail = `<p class="prog-answer">${progCorrige(it.e).map(esc).join('<br>')}</p>`;
  if(it.type === 'oral') detail = `<p class="tp-dim">Objectif : ${esc(it.o.objectif)} · Relances : ${it.o.relances.map(esc).join(' / ')}</p>`;
  if(it.type === 'role') detail = `<p class="tp-dim">${esc(it.r.situation)}</p>`;
  if(it.type === 'semaine') detail = `<p class="tp-dim">${esc(it.texte)}</p>`;
  const action = it.type === 'pptx' ? `<button type="button" class="btn btn-secondary btn-sm" onclick="progPptxTelecharger('${it.p.docId}')">Télécharger</button>`
    : it.type === 'semaine' ? `<button type="button" class="btn btn-ghost btn-sm" onclick="progUI.cal.mode='semaine'; progUI.cal.semaine='${it.semaine.id}'; setTeacherTab('prog-calendrier')">Voir la semaine</button>${progSuivi(it.semaine.id, it.niveau).fiche ? ouvrir : ''}` : ouvrir;
  return `<article class="teacher-entry prog-result"><div class="who">${progNivChip(it.niveau)} ${esc(it.titre).slice(0, 220)}</div>
    <div class="meta">${esc(it.semaine.id)} · ${esc(it.semaine.titre)}${it.comp ? ' · ' + esc(PROG_COMP[it.comp] || it.comp) : ''}${it.parcours && it.parcours.length ? ' · parcours ' + Array.from(new Set(it.parcours)).sort().join(', ') + ' séance(s)' : ''}</div>
    ${detail}${age}<div class="teacher-entry-actions">${action}</div></article>`;
}

/* ---------- onglet : mes PowerPoint (privé) ---------- */
async function progPptxLoad(){
  const body = profBody(); if(!body) return;
  await progCharger(true);
  if(!profOnTab('prog-pptx')) return;
  progPptxRender();
}
function progPptxRender(){
  const body = profBody(); if(!body) return;
  if(prog.erreur && !(prog.pptx || []).length){ body.innerHTML = progErreurHTML(); return; }
  const v = progUI.pptx;
  const q = v.q.trim().toLowerCase();
  const liste = (prog.pptx || []).filter(p => (!v.niveau || p.niveau === v.niveau) && (!v.semaine || p.semaineId === v.semaine) && (!v.seance || p.seance === v.seance) && (!v.version || p.version === v.version)
    && (!q || `${p.theme} ${p.fichier} ${(p.titres || []).join(' ')}`.toLowerCase().includes(q)))
    .sort((a, b) => (a.semaineId + a.niveau + a.seance + a.version) < (b.semaineId + b.niveau + b.seance + b.version) ? -1 : 1);
  const semaines = Array.from(new Set((prog.pptx || []).map(p => p.semaineId))).sort();
  const aud = v.audit;
  body.innerHTML = `<p class="page-intro">Bibliothèque privée : les fichiers sont dans ton Google Drive, dans un dossier jamais partagé. Ils ne sont téléchargeables que par ton compte (vérification côté serveur à chaque téléchargement) et n'apparaissent jamais dans l'espace élève. Version « prof » : conducteur, notes et diapositive de corrigé après chaque exercice. Version « projection » : à partager à l'écran pendant le cours.</p>
  <div class="settings-card prog-filters">
    <div class="field"><label for="pp-q">Recherche</label><input id="pp-q" type="search" value="${esc(v.q)}" placeholder="thème, titre de diapositive…" onchange="progUI.pptx.q=this.value; progPptxRender()"></div>
    <div class="field"><label for="pp-s">Semaine</label><select id="pp-s" onchange="progUI.pptx.semaine=this.value; progPptxRender()"><option value="">Toutes</option>${semaines.map(s => `<option ${s === v.semaine ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="field"><label for="pp-n">Niveau</label><select id="pp-n" onchange="progUI.pptx.niveau=this.value; progPptxRender()"><option value="">Tous</option>${PROG_NIV.map(n => `<option ${n === v.niveau ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="pp-se">Séance / parcours</label><select id="pp-se" onchange="progUI.pptx.seance=this.value; progPptxRender()"><option value="">Toutes</option>${Object.entries(PROG_DECK_LABEL).map(([k, l]) => `<option value="${k}" ${k === v.seance ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label for="pp-v">Version</label><select id="pp-v" onchange="progUI.pptx.version=this.value; progPptxRender()"><option value="">Toutes</option><option value="prof" ${v.version === 'prof' ? 'selected' : ''}>Professeure</option><option value="projection" ${v.version === 'projection' ? 'selected' : ''}>Projection</option></select></div></div>
  <div class="settings-card"><h2>Contrôle des accès</h2>
    <p>Vérifie, directement dans Drive, qu'aucun fichier ni dossier de la bibliothèque n'est partagé (lien public ou personne ajoutée).</p>
    <div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" onclick="progPptxAudit(false)">Vérifier les accès</button>${aud && aud.problemes && aud.problemes.length ? `<button type="button" class="btn btn-sm" onclick="progPptxAudit(true)">Tout remettre en privé</button>` : ''}</div>
    ${aud ? (aud.erreur ? `<p class="tp-warn">${esc(aud.erreur)}</p>` : aud.problemes.length ? `<p class="tp-warn">${aud.problemes.length} élément(s) partagé(s) :</p><ul>${aud.problemes.map(x => `<li>${esc(x.type)} ${esc(x.chemin)} — ${esc(x.acces)}${x.personnes ? ', ' + x.personnes + ' personne(s)' : ''}</li>`).join('')}</ul>` : `<p class="badge badge-success">${aud.total} fichier(s) vérifié(s) : tout est privé${aud.corrige ? ' (corrigé)' : ''}.</p>`) : ''}</div>
  <p class="tp-dim" role="status">${liste.length} fichier(s).</p>
  ${liste.length ? `<ul class="res-admin">${liste.map(p => `<li class="teacher-entry">
    <div class="who">${progNivChip(p.niveau)} ${esc(PROG_DECK_LABEL[p.seance] || p.seance)} · ${p.version === 'prof' ? 'Professeure' : 'Projection'} <span class="badge">${esc(p.semaineId)}</span></div>
    <div class="meta">${esc(p.theme)} · parcours ${esc((p.parcours || []).join(', '))} séance(s)/semaine · ${p.diapositives} diapositives · ${Math.round((p.taille || 0) / 1024)} Ko<br><span class="tp-dim">${esc(p.chemin || p.fichier)}</span></div>
    <details><summary>Aperçu du plan</summary><ol class="prog-plan">${(p.titres || []).map(t => `<li>${esc(t)}</li>`).join('')}</ol></details>
    <div class="teacher-entry-actions">
      <button type="button" onclick="progPptxTelecharger('${p.docId}')">Télécharger</button>
      ${p.fileId ? `<a href="https://drive.google.com/file/d/${encodeURIComponent(p.fileId)}/view" target="_blank" rel="noopener noreferrer">Ouvrir dans Drive (aperçu, modification)</a>` : ''}
      <label class="btn btn-ghost btn-sm prog-file">Remplacer…<input type="file" accept=".pptx" onchange="progPptxRemplacer('${p.docId}', this.files[0])"></label>
      <button type="button" class="del" onclick="progPptxSupprimer('${p.docId}')">Supprimer</button></div></li>`).join('')}</ul>`
    : profEmptyHTML('book', 'Aucun PowerPoint', 'Importe le paquet de contenus (onglet « Import »).')}`;
}
function progB64Blob(b64, mime){ const bin = atob(b64), a = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], {type: mime}); }
async function progPptxTelecharger(docId){
  const p = (prog.pptx || []).find(x => x.docId === docId); if(!p || !p.fileId){ uiNotify('Fichier non disponible : il n\'a pas encore été envoyé dans ton Drive.', 'error'); return; }
  uiNotify('Téléchargement en cours…', 'info');
  try{
    const r = await callDriveScript({action:'progPptxDownload', fileId:p.fileId});
    const url = URL.createObjectURL(progB64Blob(r.base64, r.mime || 'application/vnd.openxmlformats-officedocument.presentationml.presentation'));
    const a = document.createElement('a'); a.href = url; a.download = r.nom || (docId + '.pptx'); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }catch(e){ uiNotify('Téléchargement impossible : ' + (e && e.message || e), 'error'); }
}
async function progPptxEnvoyer(meta, file){
  const b64 = await blobToBase64(file);
  const r = await callDriveScript({action:'progPptxUpload', chemin: meta.dossier, fileName: meta.nomFichier, base64: b64});
  return r;
}
async function progPptxRemplacer(docId, file){
  const p = (prog.pptx || []).find(x => x.docId === docId); if(!p || !file) return;
  if(!/\.pptx$/i.test(file.name)){ uiNotify('Choisis un fichier .pptx.', 'error'); return; }
  if(!confirm(`Remplacer « ${p.nomFichier} » par « ${file.name} » ? L'ancienne version part dans la corbeille de ton Drive (récupérable 30 jours).`)) return;
  try{
    const r = await progPptxEnvoyer(p, file);
    await db.collection('programmePptx').doc(docId).set({fileId:r.fileId, taille:r.taille, chemin:r.chemin, remplaceLe: firebase.firestore.FieldValue.serverTimestamp(), modifieParProf:true}, {merge:true});
    journaliser('pedagogie', 'Programme FLE : PowerPoint remplacé', {fichier:p.nomFichier});
    uiNotify('PowerPoint remplacé.', 'success'); progPptxLoad();
  }catch(e){ uiNotify('Remplacement impossible : ' + (e && e.message || e), 'error'); }
}
async function progPptxSupprimer(docId){
  const p = (prog.pptx || []).find(x => x.docId === docId); if(!p) return;
  if(!confirm(`Supprimer « ${p.nomFichier} » de la bibliothèque ? Le fichier part dans la corbeille de ton Drive.`)) return;
  try{ if(p.fileId) await callDriveScript({action:'progPptxDelete', fileId:p.fileId}); await db.collection('programmePptx').doc(docId).delete(); uiNotify('Supprimé.', 'success'); progPptxLoad(); }
  catch(e){ uiNotify('Suppression impossible : ' + (e && e.message || e), 'error'); }
}
async function progPptxAudit(corriger){
  if(corriger && !confirm('Remettre en privé tous les fichiers et dossiers partagés de la bibliothèque ?')) return;
  try{ const r = await callDriveScript({action:'progPptxAudit', corriger}); progUI.pptx.audit = r; }
  catch(e){ progUI.pptx.audit = {erreur: 'Vérification impossible : ' + (e && e.message || e) + ' (as-tu déployé la nouvelle version de l\'Apps Script et créé la propriété PROGRAMME_FOLDER_ID ?)'}; }
  progPptxRender();
}

/* ---------- onglet : suivi (tableau de bord) ---------- */
async function progSuiviLoad(){
  const body = profBody(); if(!body) return;
  await progCharger(true);
  if(!profOnTab('prog-suivi')) return;
  const sem = prog.semaines || [];
  if(prog.erreur && !sem.length){ body.innerHTML = progErreurHTML(); return; }
  const cases = sem.length * PROG_NIV.length;
  const su = Object.values(prog.suivi || {});
  const creees = su.filter(x => x.fiche).length, validees = su.filter(x => x.fiche && x.statut === 'valide').length;
  const attribuees = su.filter(x => Object.keys(x.attributions || {}).length).length;
  const terminees = su.reduce((n, x) => n + Object.values(x.terminees || {}).reduce((m, t) => m + Object.keys(t || {}).length, 0), 0);
  let publies = 0; try{ publies = (await db.collection('programmeEleve').where('publie', '==', true).get()).size; }catch(e){}
  body.innerHTML = `<p class="page-intro">État réel du programme : ce qui est créé, validé, attribué et terminé. Une case vide signifie « à produire » — rien n'est compté tant que la fiche n'a pas été importée.</p>
  <div class="stat-row">${profStatHTML('semaines au calendrier', sem.length)}${profStatHTML(`fiches créées (sur ${cases})`, creees, creees ? '' : 'warn')}${profStatHTML('fiches validées', validees)}${profStatHTML('PowerPoint', (prog.pptx || []).length)}${profStatHTML('parcours élèves publiés', publies)}${profStatHTML('fiches attribuées', attribuees)}${profStatHTML('séances terminées', terminees)}</div>
  <div class="prog-table-wrap"><table class="prog-table prog-matrix"><thead><tr><th>Semaine</th>${PROG_NIV.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>
  ${sem.map(s => `<tr><th scope="row"><button type="button" class="prog-link" onclick="progUI.cal.mode='semaine'; progUI.cal.semaine='${s.id}'; setTeacherTab('prog-calendrier')">${esc(s.id)}</button><span class="tp-dim"> ${esc(s.titre).slice(0, 48)}</span></th>
    ${PROG_NIV.map(n => { const x = progSuivi(s.id, n), np = progPptxDe(s.id, n).length, a = Object.keys(x.attributions || {}).length, t = Object.values(x.terminees || {}).reduce((m, v) => m + Object.keys(v || {}).length, 0);
      return `<td>${x.fiche ? `<button type="button" class="prog-cell ${x.statut === 'valide' ? 'valide' : 'cree'}" onclick="progOuvrirFiche('${s.id}','${n}')">${PROG_STATUTS[x.statut || 'cree']}${np ? ' · ' + np + ' PPTX' : ''}${a ? ' · ' + a + ' élève(s)' : ''}${t ? ' · ' + t + ' séance(s) terminée(s)' : ''}</button>` : '<span class="prog-cell vide">—</span>'}</td>`; }).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}

/* ---------- onglet : import du paquet de contenus ---------- */
function progImportRender(){
  const body = profBody(); if(!body) return;
  const st = progUI.import;
  body.innerHTML = `<p class="page-intro">Le paquet de contenus (calendrier, fiches avec corrigés, parcours élèves, PowerPoint) n'est jamais déposé sur GitHub. Décompresse le fichier .zip reçu sur ton ordinateur, puis sélectionne le dossier ici : tout est envoyé dans tes espaces privés (Firestore professeure et dossier Drive privé). L'import peut être relancé : ce qui est déjà présent et identique n'est pas renvoyé.</p>
  <div class="settings-card">
    <h2>Importer un paquet</h2>
    <div class="field"><label for="pi-dir">Dossier du paquet décompressé</label><input id="pi-dir" type="file" webkitdirectory directory multiple ${st.enCours ? 'disabled' : ''}></div>
    <label class="check-row"><input type="checkbox" id="pi-force"> Remplacer aussi les PowerPoint déjà présents (sinon seuls les nouveaux ou modifiés sont envoyés)</label>
    <div class="btn-row"><button type="button" class="btn" ${st.enCours ? 'disabled' : ''} onclick="progImporter()">${st.enCours ? 'Import en cours…' : 'Importer'}</button></div>
    ${st.log.length ? `<ol class="prog-log" aria-live="polite">${st.log.map(l => `<li class="${l.t}">${esc(l.m)}</li>`).join('')}</ol>` : ''}</div>`;
}
function progLog(m, t){ progUI.import.log.push({m, t: t || ''}); if(profOnTab('prog-import')) progImportRender(); }
async function progImporter(){
  const inp = document.getElementById('pi-dir'); const files = Array.from((inp && inp.files) || []);
  const force = !!(document.getElementById('pi-force') || {}).checked;
  if(!files.length){ uiNotify('Sélectionne le dossier du paquet décompressé.', 'error'); return; }
  const rel = f => (f.webkitRelativePath || f.name).replace(/\\/g, '/');
  const trouve = suffix => files.find(f => rel(f).endsWith(suffix));
  const lire = async f => JSON.parse(await f.text());
  progUI.import = {log:[], enCours:true}; progImportRender();
  try{
    /* 1. calendrier */
    const fc = trouve('/calendrier.json') || trouve('calendrier.json');
    if(fc){
      const cal = await lire(fc); let batch = db.batch(), n = 0;
      for(const s of cal){ batch.set(db.collection('programmeSemaines').doc(s.id), s); if(++n % 400 === 0){ await batch.commit(); batch = db.batch(); } }
      await batch.commit(); progLog(`Calendrier : ${cal.length} semaines enregistrées.`, 'ok');
    } else progLog('Pas de calendrier.json dans ce dossier.', 'warn');
    /* 2. fiches */
    const fiches = files.filter(f => /\/fiches\/[^/]+\.json$/.test(rel(f)));
    for(const f of fiches){
      const F = await lire(f); const id = `${F.semaine}_${F.niveau}`;
      const avant = await db.collection('programmeFiches').doc(id).get();
      if(avant.exists && avant.data().modifieeParProf && !confirm(`La fiche ${id} a été modifiée sur la plateforme. La remplacer par celle du paquet ?`)){ progLog(`Fiche ${id} conservée (modifiée par toi).`, 'warn'); continue; }
      await db.collection('programmeFiches').doc(id).set({semaine:F.semaine, niveau:F.niveau, theme:F.theme, data:JSON.stringify(F), importe: firebase.firestore.FieldValue.serverTimestamp(), modifieeParProf:false});
      const s0 = (prog.suivi || {})[id] || {};
      await db.collection('programmeSuivi').doc(id).set({semaine:F.semaine, niveau:F.niveau, fiche:true, statut: s0.statut || 'cree'}, {merge:true});
      delete prog.fiches[id];
    }
    progLog(`Fiches : ${fiches.length} importée(s).`, fiches.length ? 'ok' : 'warn');
    /* 3. parcours élèves (jamais publiés automatiquement) */
    const parc = files.filter(f => /parcours-eleve-[^/]+\.json$/.test(rel(f)));
    for(const f of parc){
      const T = await lire(f); const ref = db.collection('programmeEleve').doc(T.id); const avant = await ref.get();
      await ref.set({theme: JSON.stringify(T), semaine: T.programme, publie: avant.exists ? !!avant.data().publie : false, importe: firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
      progLog(`Parcours élève ${T.programme} : importé (${avant.exists && avant.data().publie ? 'reste publié' : 'non publié — à publier depuis la fiche'}).`, 'ok');
    }
    /* 4. PowerPoint → Drive privé */
    const fm = files.find(f => /\/pptx\/manifest\.json$/.test(rel(f)));
    if(fm){
      const man = await lire(fm); const index = Object.fromEntries((await db.collection('programmePptx').get()).docs.map(d => [d.id, d.data()]));
      let envoyes = 0, ignores = 0, erreurs = 0;
      for(const [k, m] of man.entries()){
        const nomFichier = m.fichier.split('/').pop(), dossier = m.fichier.split('/').slice(0, -1).join('/'), docId = nomFichier.replace(/\.pptx$/i, '');
        const file = files.find(f => rel(f).endsWith('/pptx/' + m.fichier));
        if(!file){ progLog(`Manquant : ${m.fichier}`, 'warn'); erreurs++; continue; }
        const deja = index[docId];
        if(deja && deja.fileId && deja.taille === m.taille && !force && !deja.modifieParProf){ ignores++; continue; }
        if(deja && deja.modifieParProf && !force){ progLog(`${nomFichier} : conservé (remplacé par toi sur la plateforme).`, 'warn'); ignores++; continue; }
        try{
          const r = await progPptxEnvoyer({dossier, nomFichier}, file);
          await db.collection('programmePptx').doc(docId).set({...m, nomFichier, dossier, fileId:r.fileId, chemin:r.chemin, taille:m.taille, importe: firebase.firestore.FieldValue.serverTimestamp(), modifieParProf:false});
          envoyes++;
          if(envoyes % 8 === 0) progLog(`PowerPoint : ${envoyes} envoyé(s)… (${k + 1}/${man.length})`);
        }catch(e){ erreurs++; progLog(`Échec ${nomFichier} : ${e && e.message || e}`, 'bad'); if(erreurs >= 3 && !envoyes){ progLog('Arrêt : vérifie le déploiement de l\'Apps Script et la propriété PROGRAMME_FOLDER_ID.', 'bad'); break; } }
      }
      progLog(`PowerPoint : ${envoyes} envoyé(s) dans ton Drive privé, ${ignores} déjà à jour, ${erreurs} erreur(s).`, erreurs ? 'warn' : 'ok');
    } else progLog('Pas de PowerPoint dans ce dossier (pptx/manifest.json absent).', 'warn');
    journaliser('pedagogie', 'Programme FLE : paquet importé');
    prog.semaines = null; await progCharger(true);
    if(typeof tpLoadConfig === 'function'){ try{ await progEleveCharger(); await tpSyncCalendrier(); }catch(e){} }
    progLog('Import terminé.', 'ok');
  }catch(e){ progLog('Import interrompu : ' + (e && e.message || e) + ' — vérifie que les règles Firestore du programme sont publiées.', 'bad'); }
  progUI.import.enCours = false; progImportRender();
}

registerTeacherTab('prog-calendrier', ()=>progCalendrierLoad());
registerTeacherTab('prog-fiches', ()=>progFichesLoad());
registerTeacherTab('prog-bibliotheque', ()=>progBiblioLoad());
registerTeacherTab('prog-pptx', ()=>progPptxLoad());
registerTeacherTab('prog-suivi', ()=>progSuiviLoad());
registerTeacherTab('prog-import', ()=>progImportRender());
