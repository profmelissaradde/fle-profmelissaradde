/* ======================= PARCOURS PÉDAGOGIQUE EN CHEMIN =======================
   Chaque thème de la semaine est présenté comme un chemin d'étapes reliées. Le chemin lit la
   progression DÉJÀ enregistrée (eleves/{uid}.temas.{id}) : aucune donnée n'est déplacée.

   Réglages par thème (config/temas.themes.{id}, écrits par la professeure) :
     parcours    {mode: "libre" | "defi" | "guide", seuil: 0–100}
                 libre : toutes les étapes ouvertes
                 defi  : (par défaut) le défi final s'ouvre quand les autres étapes sont faites
                 guide : chaque étape s'ouvre quand la précédente est réussie
                 seuil : % de bonnes réponses (exercices corrigés automatiquement) pour qu'une
                         étape compte comme réussie
     ordre       {A1: [idActivité, …], …}       ordre des activités par niveau
     attribution {mode: "tous" | "selection", eleves: {uid: true}}
     couleur     "#RRGGBB"                       couleur du chemin et de la carte du thème
     archiveLe   "AAAA-MM-JJ"                    archivage anticipé (lecture seule dès ce jour) */

const CHEMIN_ETAPES = {
  intro:'Découvrir le thème', vocabulaire:'Apprendre le vocabulaire', grammaire:'Comprendre la grammaire',
  conjugaison:"S'entraîner", ce:'Lire et comprendre', co:'Écouter et comprendre', ee:'Écrire', eo:'Parler',
  synthese:'Défi final'
};
const CHEMIN_V1 = [['co','Écouter et comprendre','🎧'],['ce','Lire et comprendre','📖'],['ee','Écrire','✍️'],['eo','Parler','🗣️']];

function cheminCfg(temaId){
  const c = (typeof tpThemeCfg === 'function' ? tpThemeCfg(temaId) : {}) || {};
  const p = c.parcours || {};
  return {mode: ['libre','defi','guide'].includes(p.mode) ? p.mode : 'defi', seuil: Math.max(0, Math.min(100, Number(p.seuil) || 0)),
    couleur: (typeof clrHex === 'function' && clrHex(c.couleur)) || '', attribution: c.attribution || {mode:'tous'}, archiveLe: c.archiveLe || '', ordre: c.ordre || {}};
}

/* ---- Ordre des activités, attribution, archivage anticipé ---- */
(function(){
  const baseLevel = window.tpLevelData;
  window.tpLevelData = function(t, lvl, draftOverride){
    const d = baseLevel.apply(this, arguments);
    if(!d || draftOverride || !t) return d;
    const ordre = (cheminCfg(t.id).ordre || {})[lvl];
    if(Array.isArray(ordre) && ordre.length && Array.isArray(d.activites)){
      const pos = id => { const i = ordre.indexOf(id); return i < 0 ? 999 : i; };
      d.activites = d.activites.map((a, i) => ({a, i})).sort((x, y) => (pos(x.a.id) - pos(y.a.id)) || (x.i - y.i)).map(x => x.a);
    }
    return d;
  };
  const baseVisible = window.temaEstVisibleEleve;
  window.temaEstVisibleEleve = function(t){
    if(!baseVisible.apply(this, arguments)) return false;
    if(isTeacher || !t) return true;
    const at = cheminCfg(t.id).attribution;
    return !(at && at.mode === 'selection') || !!(at.eleves && student && at.eleves[student.uid]);
  };
  const baseCourant = window.temaCourantId;
  window.temaCourantId = function(isoDate){
    const id = baseCourant.apply(this, arguments);
    if(!id) return id;
    const a = cheminCfg(id).archiveLe;
    const d = isoDate || temaAujourdhuiIso();
    return a && a <= d ? null : id;
  };
  const baseCal = window.tpCalendrier;
  window.tpCalendrier = function(){
    const periodes = baseCal.apply(this, arguments);
    Object.keys(periodes).forEach(id=>{
      const c = cheminCfg(id);
      if(c.archiveLe){
        const ms = Date.parse(c.archiveLe + 'T00:00:00Z');
        if(!isNaN(ms)) periodes[id].fin = periodes[id].fin == null ? ms : Math.min(periodes[id].fin, ms);
      }
      if(c.attribution && c.attribution.mode === 'selection') periodes[id].eleves = Object.keys(c.attribution.eleves || {}).filter(u => c.attribution.eleves[u]).sort();
    });
    return periodes;
  };
})();

/* ---- États des étapes (format parcours) ---- */
function cheminScoreAct(act, state){
  let ok = 0, total = 0;
  (act.items || []).forEach(it=>{ const r = state.r[it.id]; if(r && r.st === 'auto'){ total++; if(r.ok) ok++; } });
  return {ok, total, pct: total ? Math.round(100*ok/total) : null};
}
function cheminReussie(act, state, seuil){
  if(!tpActDone(act, state)) return false;
  const sc = cheminScoreAct(act, state);
  return sc.pct == null || sc.pct >= seuil;
}
/* Raison du verrouillage d'une activité (null = ouverte). */
function cheminVerrou(ctx, idx){
  if(!ctx || !ctx.data || ctx.lectureSeule) return null;
  const acts = ctx.data.activites || [];
  if(idx >= acts.length) return null;
  const cfg = cheminCfg(ctx.tema.id);
  if(cfg.mode === 'libre') return null;
  if(cfg.mode === 'guide'){
    for(let j = 0; j < idx; j++){
      if(!cheminReussie(acts[j], ctx.state, cfg.seuil)) return `Termine d'abord l'étape ${j+1} « ${CHEMIN_ETAPES[acts[j].comp] || acts[j].titre_fr} »${cfg.seuil ? ` avec au moins ${cfg.seuil} % de bonnes réponses` : ''}.`;
    }
    return null;
  }
  if(acts[idx].comp !== 'synthese') return null;
  const avant = acts.filter(a => a.comp !== 'synthese');
  const manque = avant.filter(a => !cheminReussie(a, ctx.state, cfg.seuil)).length;
  return manque ? `Le défi final s'ouvre quand les autres étapes sont terminées${cfg.seuil ? ` (au moins ${cfg.seuil} % de bonnes réponses)` : ''} : encore ${manque} étape${manque>1?'s':''}.` : null;
}

function cheminHTML(ctx){
  const acts = ctx.data.activites || [];
  const cfg = cheminCfg(ctx.tema.id);
  const lab = {afaire:'à faire', encours:'commencée', fait:'terminée', attente:'envoyée, en attente de correction', valide:'validée par ta professeure'};
  const noeuds = acts.map((a, i)=>{
    const st = tpActStatus(a, ctx.state);
    const verrou = cheminVerrou(ctx, i);
    const sc = cheminScoreAct(a, ctx.state);
    const aRevoir = st === 'fait' && sc.pct != null && cfg.seuil && sc.pct < cfg.seuil;
    const etat = verrou ? 'verrou' : (aRevoir ? 'revoir' : (['fait','valide'].includes(st) ? 'fait' : (st === 'attente' ? 'attente' : (st === 'encours' ? 'encours' : 'afaire'))));
    const icone = etat === 'fait' ? uiIcon('check') : (etat === 'verrou' ? uiIcon('lock') : `<span>${(TP_COMP[a.comp]||{}).icone || (i+1)}</span>`);
    const nom = CHEMIN_ETAPES[a.comp] || a.titre_fr;
    const detail = verrou ? 'verrouillée' : (aRevoir ? `à retravailler (${sc.pct} %)` : lab[st]);
    return `<li class="chemin-etape ${etat} ${i===ctx.actIdx?'courante':''}" data-i="${i}">
      <button type="button" class="chemin-noeud" onclick="tpGoAct(${i})" ${i===ctx.actIdx?'aria-current="step"':''} aria-label="Étape ${i+1} : ${esc(nom)} — ${detail}">${icone}</button>
      <span class="chemin-label"><b>${i+1}. ${esc(nom)}</b><span>${a.dur ? esc(a.dur) + ' · ' : ''}${detail}${sc.total && etat !== 'verrou' && tpActDone(a, ctx.state) ? ` · ${sc.ok}/${sc.total}` : ''}</span></span></li>`;
  });
  const tout = acts.length && acts.every(a => tpActDone(a, ctx.state));
  noeuds.push(`<li class="chemin-etape fin ${tout?'fait':''} ${ctx.actIdx>=acts.length?'courante':''}" data-i="${acts.length}">
      <button type="button" class="chemin-noeud" onclick="tpGoAct(${acts.length})" ${ctx.actIdx>=acts.length?'aria-current="step"':''} aria-label="Mes résultats${tout ? ' — thème terminé' : ''}">${uiIcon('trophy')}</button>
      <span class="chemin-label"><b>Mes résultats</b><span>${tout ? 'thème terminé 🎉' : 'bilan et certificat'}</span></span></li>`);
  const modeTxt = {libre:'Étapes dans l\'ordre de ton choix.', defi:'Le défi final s\'ouvre à la fin du parcours.', guide:'Les étapes s\'ouvrent l\'une après l\'autre.'}[cfg.mode];
  return `<nav class="chemin-wrap" aria-label="Parcours du thème" style="${cfg.couleur ? `--c-path:${cfg.couleur};` : ''}">
      <p class="chemin-aide">${uiIcon('route')} ${modeTxt}${ctx.preview && cfg.mode !== 'libre' ? ' <b>Aperçu : les étapes verrouillées restent ouvertes pour toi.</b>' : ''}</p>
      <div class="chemin-zone"><svg class="chemin-trace" aria-hidden="true" focusable="false"></svg><ol class="chemin">${noeuds.join('')}</ol></div>
    </nav>`;
}
/* Place les étapes en lacets (4 par rangée sur grand écran) et trace le chemin qui les relie. */
function cheminTracer(){
  document.querySelectorAll('.chemin-zone').forEach(zone=>{
    const ol = zone.querySelector('.chemin'), svg = zone.querySelector('.chemin-trace');
    if(!ol || !svg) return;
    const items = Array.from(ol.children);
    const cols = zone.clientWidth >= 640 ? 4 : 1;
    items.forEach((li, i)=>{
      if(cols === 1){ li.style.gridRow = ''; li.style.gridColumn = ''; return; }
      const r = Math.floor(i / cols), c = r % 2 === 0 ? i % cols : cols - 1 - (i % cols);
      li.style.gridRow = String(r + 1); li.style.gridColumn = String(c + 1);
    });
    ol.style.setProperty('--cols', cols);
    const base = zone.getBoundingClientRect();
    const pts = items.map(li => { const b = li.querySelector('.chemin-noeud').getBoundingClientRect(); return [b.left - base.left + b.width/2, b.top - base.top + b.height/2]; });
    svg.setAttribute('width', zone.clientWidth); svg.setAttribute('height', zone.clientHeight);
    svg.setAttribute('viewBox', `0 0 ${zone.clientWidth} ${zone.clientHeight}`);
    /* Changement de rangée (grand écran) : le chemin contourne l'étiquette de l'étape par le
       bord de la colonne, avec des virages arrondis. */
    const colW = cols > 1 ? (ol.clientWidth / cols) : 0;
    const seg = (a, b, i) => {
      if(Math.abs(a[1] - b[1]) < 2 || cols === 1) return ` L ${b[0]} ${b[1]}`;
      const li = items[i - 1];
      const droite = parseInt(li.style.gridColumn, 10) === cols;
      const ex = a[0] + (droite ? 1 : -1) * (colW / 2 + 4), r = 16, sx = droite ? 1 : -1;
      return ` L ${ex - sx*r} ${a[1]} Q ${ex} ${a[1]} ${ex} ${a[1] + r} L ${ex} ${b[1] - r} Q ${ex} ${b[1]} ${ex - sx*r} ${b[1]} L ${b[0]} ${b[1]}`;
    };
    let d = '', dFait = '';
    const dernierFait = items.reduce((m, li, i) => li.classList.contains('fait') || li.classList.contains('attente') ? i : m, -1);
    pts.forEach((p, i)=>{ if(i === 0){ d = `M ${p[0]} ${p[1]}`; dFait = d; } else { const s = seg(pts[i-1], p, i); d += s; if(i <= dernierFait + 1 && dernierFait >= 0 && i <= dernierFait) dFait += s; } });
    svg.innerHTML = `<path class="trace-fond" d="${d}"/>${dernierFait > 0 ? `<path class="trace-fait" d="${dFait}"/>` : ''}`;
  });
}
window.addEventListener('resize', ()=>{ clearTimeout(window.__cheminT); window.__cheminT = setTimeout(cheminTracer, 120); });
window.tpAfterDraw = function(){ requestAnimationFrame(cheminTracer); };

/* Ouverture d'une étape : respect du verrouillage (sauf aperçu de la professeure). */
(function(){
  const baseGo = window.tpGoAct;
  window.tpGoAct = function(i){
    if(tpCtx && !tpCtx.preview){
      const v = cheminVerrou(tpCtx, i);
      if(v){ uiNotify('🔒 ' + v, 'warning'); return; }
    }
    return baseGo.apply(this, arguments);
  };
  const baseFirst = window.tpFirstOpenAct;
  window.tpFirstOpenAct = function(data, state){
    const i = baseFirst.apply(this, arguments);
    if(!tpCtx || !data) return i;
    const cfg = cheminCfg(tpCtx.tema.id);
    if(cfg.mode !== 'guide' || !cfg.seuil) return i;
    const j = (data.activites || []).findIndex(a => !cheminReussie(a, state, cfg.seuil));
    return j < 0 ? i : Math.min(i, j);
  };
})();

/* Petit chemin (points) pour la carte du thème sur l'accueil. */
function cheminMiniHTML(tema){
  const t = (student.temas && student.temas[tema.id]) || {};
  let etats = [];
  if(tpIsV2(tema)){
    const lvl = (t.v2 && t.v2.niveau) || tpNiveauPour(tema, niveau, student.niveauTheme);
    const d = tpLevelData(tema, lvl); if(!d) return '';
    const st = {r:(t.v2&&t.v2.r)||{}, a:(t.v2&&t.v2.a)||{}, fb:(t.v2&&t.v2.fb)||{}};
    etats = d.activites.map(a => { const s = tpActStatus(a, st); return ['fait','valide','attente'].includes(s) ? 'fait' : (s === 'encours' ? 'encours' : ''); });
  } else {
    etats = CHEMIN_V1.map(([k]) => t[k] && t[k].done ? 'fait' : '');
  }
  const c = cheminCfg(tema.id).couleur;
  return `<div class="chemin-mini" aria-hidden="true" style="${c ? `--c-path:${c};` : ''}">${etats.map(e => `<span class="${e}"></span>`).join('')}</div>`;
}

/* ---- Anciens thèmes (4 activités sur une page) : chemin court ---- */
(function(){
  const base = window.renderTemas;
  window.renderTemas = function(){
    base.apply(this, arguments);
    if(screen !== 'temas') return;
    const grid = document.getElementById('tema-skill-grid');
    if(!grid || !temaSelectedId) return;
    const tema = getTema(temaSelectedId);
    if(tpIsV2(tema)) return;
    const t = (student.temas && student.temas[tema.id]) || {};
    Array.from(grid.children).forEach((card, i) => { if(CHEMIN_V1[i]) card.id = 'etape-' + CHEMIN_V1[i][0]; });
    const tout = CHEMIN_V1.every(([k]) => t[k] && t[k].done);
    const c = cheminCfg(tema.id).couleur;
    const html = `<nav class="chemin-wrap" aria-label="Parcours du thème" style="${c ? `--c-path:${c};` : ''}"><div class="chemin-zone"><svg class="chemin-trace" aria-hidden="true" focusable="false"></svg><ol class="chemin">
      ${CHEMIN_V1.map(([k, nom, ic], i) => { const fait = !!(t[k] && t[k].done);
        return `<li class="chemin-etape ${fait ? 'fait' : 'afaire'}"><button type="button" class="chemin-noeud" onclick="cheminAllerV1('${k}')" aria-label="Étape ${i+1} : ${nom} — ${fait ? 'terminée' : 'à faire'}">${fait ? uiIcon('check') : `<span>${ic}</span>`}</button><span class="chemin-label"><b>${i+1}. ${nom}</b><span>${fait ? 'terminée' : 'à faire'}</span></span></li>`; }).join('')}
      <li class="chemin-etape fin ${tout ? 'fait' : ''}"><button type="button" class="chemin-noeud" onclick="cheminAllerV1('cert')" aria-label="Mes résultats et certificat">${uiIcon('trophy')}</button><span class="chemin-label"><b>Mes résultats</b><span>${tout ? 'thème terminé 🎉' : 'certificat'}</span></span></li>
    </ol></div></nav>`;
    const bar = document.getElementById('tema-status-bar');
    (bar || grid).insertAdjacentHTML('beforebegin', html);
    if(bar) bar.hidden = true;
    requestAnimationFrame(cheminTracer);
  };
})();
function cheminAllerV1(k){
  const el = document.getElementById(k === 'cert' ? 'tema-cert-zone' : 'etape-' + k);
  if(el){ el.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'}); el.setAttribute('tabindex', '-1'); el.focus({preventScroll:true}); }
}

/* ---- Espace professeure : réglages du parcours d'un thème ---- */
let cheminOrdreLvl = null;
(function(){
  const base = window.tpRenderTeacher;
  window.tpRenderTeacher = function(body, tema){
    base.apply(this, arguments);
    const pilot = body.querySelector('.tp-pilot');
    if(!pilot) return;
    const ps = pilot.querySelectorAll(':scope > p');
    const apres = ps[2] || ps[1] || ps[0]; /* après « Situation aujourd'hui » */
    if(apres) apres.insertAdjacentHTML('afterend', cheminReglagesHTML(tema));
  };
})();
function cheminReglagesHTML(tema){
  const cfg = cheminCfg(tema.id);
  const v2 = tpIsV2(tema);
  const lvls = v2 ? tpNiveauxDisponibles(tema) : [];
  if(!cheminOrdreLvl || !lvls.includes(cheminOrdreLvl)) cheminOrdreLvl = lvls[0] || null;
  const d = cheminOrdreLvl ? tpLevelData(tema, cheminOrdreLvl) : null;
  const sel = cfg.attribution.mode === 'selection';
  const eleves = studentsData.filter(s => s.niveau);
  return `<details class="tp-check chemin-reglages" open><summary><b>Parcours : chemin, ordre, attribution</b> · ${({libre:'étapes libres', defi:'défi final verrouillé', guide:'étapes guidées'})[cfg.mode]}${cfg.seuil ? ` · seuil ${cfg.seuil} %` : ''}${sel ? ` · ${Object.keys(cfg.attribution.eleves||{}).filter(u=>cfg.attribution.eleves[u]).length} élève(s)` : ' · tous les élèves'}${cfg.archiveLe ? ` · archivé le ${esc(cfg.archiveLe)}` : ''}</summary>
    <div class="form-grid">
      <fieldset class="check-group"><legend>Ouverture des étapes</legend>
        ${[['libre','Toutes ouvertes'],['defi','Défi final verrouillé jusqu\'à la fin du parcours (par défaut)'],['guide','Une étape après l\'autre']].map(([v,l])=>`<label class="check-row"><input type="radio" name="ch-mode-${tema.id}" value="${v}" ${cfg.mode===v?'checked':''}> ${l}</label>`).join('')}
      </fieldset>
      <div>
        <div class="field"><label for="ch-seuil-${tema.id}">Seuil de réussite d'une étape (%)</label><input id="ch-seuil-${tema.id}" type="number" min="0" max="100" step="5" value="${cfg.seuil}" aria-describedby="ch-seuil-aide"><p class="field-help" id="ch-seuil-aide">0 = une étape terminée suffit. Ne concerne que les exercices corrigés automatiquement ; les réponses que tu corriges comptent dès leur envoi.</p></div>
        <div class="field"><label for="ch-coul-${tema.id}">Couleur du thème</label><input id="ch-coul-${tema.id}" type="color" value="${cfg.couleur || '#55786C'}"> <label class="check-row"><input type="checkbox" id="ch-coul-def-${tema.id}" ${cfg.couleur ? '' : 'checked'}> Couleur de la plateforme</label></div>
      </div>
    </div>
    <fieldset class="check-group"><legend>Attribution</legend>
      <label class="check-row"><input type="radio" name="ch-attr-${tema.id}" value="tous" ${sel?'':'checked'} onchange="document.getElementById('ch-eleves-${tema.id}').hidden=true"> Tous les élèves inscrits</label>
      <label class="check-row"><input type="radio" name="ch-attr-${tema.id}" value="selection" ${sel?'checked':''} onchange="document.getElementById('ch-eleves-${tema.id}').hidden=false"> Seulement certains élèves</label>
      <div id="ch-eleves-${tema.id}" class="eleves-pick" ${sel?'':'hidden'}>${eleves.length ? eleves.map(s=>`<label class="check-row"><input type="checkbox" name="ch-el-${tema.id}" value="${s.id}" ${cfg.attribution.eleves && cfg.attribution.eleves[s.id] ? 'checked' : ''}> ${esc(s.prenom)} ${esc(s.nom||'')} <span class="tp-dim">${esc(s.niveau)}</span></label>`).join('') : '<p class="tp-dim">Aucun élève avec un niveau attribué.</p>'}</div>
    </fieldset>
    ${v2 && d ? `<fieldset class="check-group"><legend>Ordre des activités</legend>
      <div class="ui-filters" role="group" aria-label="Niveau">${lvls.map(l=>`<button type="button" class="ui-chip" aria-pressed="${cheminOrdreLvl===l}" onclick="cheminOrdreLvl='${l}'; renderTeacherTemas()">${l}</button>`).join('')}</div>
      <ol class="ordre-list" id="ch-ordre-${tema.id}">${d.activites.map((a,i)=>`<li data-id="${esc(a.id)}"><span>${(TP_COMP[a.comp]||{}).icone||''} ${esc(a.titre_fr || '')}</span>
        <span class="ordre-btns"><button type="button" onclick="cheminOrdreBouger(this,-1)" aria-label="Monter ${esc(a.titre_fr||'')}">↑</button><button type="button" onclick="cheminOrdreBouger(this,1)" aria-label="Descendre ${esc(a.titre_fr||'')}">↓</button></span></li>`).join('')}</ol>
      <p class="field-help">Les élèves qui ont déjà commencé gardent leurs réponses : seul l'ordre d'affichage change.</p></fieldset>` : ''}
    <div class="btn-row"><button type="button" class="rec-btn" onclick="cheminEnregistrer('${tema.id}')">Enregistrer le parcours</button>
      ${cfg.archiveLe ? `<button type="button" class="tp-mini-btn" onclick="cheminArchiver('${tema.id}', false)">Annuler l'archivage anticipé</button>`
        : (typeof tpEtatTheme === 'function' && tpEtatTheme(tema) === 'en_cours' ? `<button type="button" class="tp-mini-btn" onclick="cheminArchiver('${tema.id}', true)">Archiver maintenant (lecture seule)</button>` : '')}</div>
  </details>`;
}
function cheminOrdreBouger(btn, sens){
  const li = btn.closest('li'), ol = li.parentElement;
  if(sens < 0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
  if(sens > 0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
  btn.focus();
}
async function cheminEnregistrer(temaId){
  const v = (sel) => document.querySelector(sel);
  const mode = (v(`input[name="ch-mode-${temaId}"]:checked`) || {}).value || 'defi';
  const seuil = Math.max(0, Math.min(100, Number((v('#ch-seuil-' + temaId) || {}).value) || 0));
  const couleur = (v('#ch-coul-def-' + temaId) || {}).checked ? '' : ((v('#ch-coul-' + temaId) || {}).value || '');
  const attrMode = (v(`input[name="ch-attr-${temaId}"]:checked`) || {}).value || 'tous';
  /* Écriture fusionnée (merge) : les élèves décochés sont écrits à false, sinon ils resteraient. */
  const eleves = {};
  Object.keys((cheminCfg(temaId).attribution || {}).eleves || {}).forEach(u => { eleves[u] = false; });
  document.querySelectorAll(`input[name="ch-el-${temaId}"]`).forEach(x => { eleves[x.value] = attrMode === 'selection' && x.checked; });
  if(attrMode === 'selection' && !Object.values(eleves).some(Boolean)){ uiNotify('Coche au moins un élève, ou choisis « Tous les élèves inscrits ».', 'warning'); return; }
  const patch = {parcours: {mode, seuil}, couleur, attribution: {mode: attrMode, eleves}};
  const ol = v('#ch-ordre-' + temaId);
  if(ol && cheminOrdreLvl){
    const ordre = Object.assign({}, cheminCfg(temaId).ordre);
    ordre[cheminOrdreLvl] = Array.from(ol.children).map(li => li.dataset.id);
    patch.ordre = ordre;
  }
  try{
    await tpWriteConfig({themes: {[temaId]: patch}});
    tpConfig.themes[temaId] = Object.assign({}, tpThemeCfg(temaId), patch);
    await tpSyncCalendrier();
    journaliser('theme', 'Parcours du thème modifié', {theme: temaId, mode, seuil, attribution: attrMode});
    uiNotify('Parcours enregistré.', 'success');
    renderTeacherTemas();
  }catch(e){ uiNotify("Enregistrement impossible (règles Firestore de config/temas ?).", 'error'); }
}
async function cheminArchiver(temaId, archiver){
  const msg = archiver ? 'Archiver ce thème dès aujourd\'hui ? Les élèves pourront le consulter mais plus y répondre (sauf si tu le rouvres pour l\'un d\'eux).' : 'Annuler l\'archivage anticipé ? Le thème redeviendra interactif jusqu\'au début du thème suivant.';
  if(!confirm(msg)) return;
  const val = archiver ? new Date().toISOString().slice(0,10) : '';
  try{
    await tpWriteConfig({themes: {[temaId]: {archiveLe: val}}});
    tpConfig.themes[temaId] = Object.assign({}, tpThemeCfg(temaId), {archiveLe: val});
    await tpSyncCalendrier();
    journaliser('theme', archiver ? 'Thème archivé manuellement' : 'Archivage anticipé annulé', {theme: temaId});
    renderTeacherTemas();
  }catch(e){ uiNotify("Enregistrement impossible pour le moment.", 'error'); }
}
