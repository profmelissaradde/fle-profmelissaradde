/* ======================= THÈME DE LA SEMAINE — PARCOURS (format v2) =======================
   Ce fichier ajoute un second format de thème, plus riche, SANS toucher aux anciens thèmes :
   - un thème avec  version: 2  est rendu par ce moteur (parcours en 9 activités, exercices variés,
     correction automatique + correction par la professeure, sauvegarde et reprise, bilan) ;
   - un thème sans  version  (tous les thèmes publiés jusqu'au 18/10/2026) garde l'ancien rendu
     (renderTemas / renderTeacherTemas dans 03-donnees-themes-semaine.js), inchangé.

   STRUCTURE D'UN THÈME v2 (voir 12-theme-entretien-embauche.js pour un exemple complet)
   { id, version:2, statut:"brouillon"|"publie", date_debut, periode, titre_fr, titre_pt, sub_fr, sub_pt,
     niveaux: { A0:{...}, A1:{...}, A2:{...}, B1:{...}, B2:{...} } }
   Chaque niveau : { duree:{min,max}, intro_fr, intro_pt, objectifs:[{fr,pt}], grammaire:[...], activites:[...] }
   Chaque activité : { id, comp, titre_fr, titre_pt, dur, consigne_fr, consigne_pt,
                       rappel?:{fr,pt}, texte?:{titre,fr,source}, video?:{id,label,verification:{statut,note}},
                       items:[...] }
   Types d'items : qcm · court · trous · association · ordre · mixte · choix_justif · ouverte · oral

   DONNÉES FIRESTORE (toujours sous le champ "temas" du document élève, comme avant) :
     eleves/{uid}.temas.{temaId}.v2.niveau          niveau effectivement utilisé
     eleves/{uid}.temas.{temaId}.v2.r.{itemId}       réponse de l'élève {v, ok, st, n, ts}
     eleves/{uid}.temas.{temaId}.v2.a.{actId}        activité terminée {done, ts}
     eleves/{uid}.temas.{temaId}.v2.fb.{itemId}      retour de la professeure {verdict, c, ts}
     eleves/{uid}.temas.{temaId}.review              note globale (inchangé)
     eleves/{uid}.niveauTheme                        niveau de thème forcé par la professeure (ex: A0)
   PILOTAGE (professeure) : config/temas — publication, vidéos, contenus modifiés, nouveaux thèmes.
*/

const TP_NIVEAUX = ['A0','A1','A2','B1','B2'];
const TP_COMP = {
  intro:       {icone:'🧭', fr:'Introduction',            pt:'Introdução'},
  vocabulaire: {icone:'📚', fr:'Vocabulaire en contexte', pt:'Vocabulário em contexto'},
  ce:          {icone:'📖', fr:'Compréhension écrite',    pt:'Compreensão escrita'},
  co:          {icone:'🎧', fr:'Compréhension orale',     pt:'Compreensão oral'},
  grammaire:   {icone:'🧩', fr:'Grammaire',               pt:'Gramática'},
  conjugaison: {icone:'🔁', fr:'Conjugaison & transformation', pt:'Conjugação & transformação'},
  ee:          {icone:'✍️', fr:'Production écrite',       pt:'Produção escrita'},
  eo:          {icone:'🗣️', fr:'Production orale',        pt:'Produção oral'},
  synthese:    {icone:'🏁', fr:'Synthèse',                pt:'Síntese'}
};
const TP_TYPES_AUTO = ['qcm','court','trous','association','ordre'];

/* ---------------------------------------------------------------------------------------------
   1. CONFIGURATION PILOTÉE PAR LA PROFESSEURE (config/temas)
   --------------------------------------------------------------------------------------------- */
let tpConfig = {loaded:false, loading:null, themes:{}, nouveaux:{}, error:null};

async function tpLoadConfig(force){
  if(tpConfig.loaded && !force) return tpConfig;
  if(tpConfig.loading && !force) return tpConfig.loading;
  tpConfig.loading = (async ()=>{
    try{
      if(!db) throw new Error('Firestore indisponible');
      const doc = await db.collection('config').doc('temas').get();
      const d = doc.exists ? doc.data() : {};
      tpConfig.themes = d.themes || {};
      tpConfig.nouveaux = d.nouveaux || {};
      tpConfig.error = null;
    }catch(e){
      /* Lecture refusée ou hors ligne : on retombe sur le contenu du code (statut compris). */
      console.warn('config/temas non lisible — contenu du code utilisé :', e && e.message);
      tpConfig.themes = tpConfig.themes || {}; tpConfig.nouveaux = tpConfig.nouveaux || {};
      tpConfig.error = (e && e.message) || String(e);
    }
    /* Thèmes créés depuis l'espace enseignante : ajoutés à la fin de la liste (= plus récents). */
    Object.keys(tpConfig.nouveaux).forEach(id=>{
      if(temasSemanas.some(t=>t.id===id)) return;
      try{
        const t = JSON.parse(tpConfig.nouveaux[id]);
        if(t && t.id === id && t.version === 2) temasSemanas.push(t);
      }catch(e){ console.warn('Thème créé illisible :', id, e); }
    });
    tpConfig.loaded = true; tpConfig.loading = null;
    if(typeof isTeacher !== 'undefined' && isTeacher) tpSyncCalendrier();
    return tpConfig;
  })();
  return tpConfig.loading;
}
function tpThemeCfg(id){ return (tpConfig.themes && tpConfig.themes[id]) || {}; }
function tpIsV2(t){ return !!(t && t.version === 2); }

/* "publie" | "brouillon". Les anciens thèmes (sans statut) restent publiés. Une décision prise
   dans l'espace enseignante (config/temas) l'emporte sur la valeur écrite dans le code. */
function tpStatut(t){
  if(!t) return 'publie';
  const cfg = tpThemeCfg(t.id);
  if(typeof cfg.publie === 'boolean') return cfg.publie ? 'publie' : 'brouillon';
  return t.statut === 'brouillon' ? 'brouillon' : 'publie';
}

/* Contenu effectif d'un niveau : contenu du code, éventuellement remplacé par la version
   modifiée par la professeure, puis vidéo éventuellement remplacée. */
function tpLevelData(t, lvl, draftOverride){
  if(!t || !t.niveaux) return null;
  const cfg = tpThemeCfg(t.id);
  let data = t.niveaux[lvl] || null;
  if(draftOverride){ data = draftOverride; }
  else if(cfg.contenu && cfg.contenu[lvl]){
    try{ data = JSON.parse(cfg.contenu[lvl]); }catch(e){ console.warn('Contenu modifié illisible', t.id, lvl, e); }
  }
  if(!data) return null;
  data = JSON.parse(JSON.stringify(data)); // copie : on ne modifie jamais la source
  const v = cfg.videos && cfg.videos[lvl];
  if(v && v.id){
    const act = (data.activites||[]).find(a=>a.comp==='co');
    if(act){
      act.video = {...(act.video||{}), id:v.id, label:v.label || (act.video && act.video.label) || 'Vidéo',
        verification:{statut: v.verifiee ? 'verifiee' : 'a_valider', note: v.note || '', date: v.date || ''}};
    }
  }
  return data;
}
function tpNiveauxDisponibles(t){ return TP_NIVEAUX.filter(l => t && t.niveaux && (t.niveaux[l] || (tpThemeCfg(t.id).contenu||{})[l])); }

/* Niveau du parcours pour un élève : niveau forcé par la professeure (ex. A0), sinon niveau
   attribué ; C1/C2 → B2 (niveau le plus proche) ; à défaut, le plus proche disponible. */
function tpNiveauPour(t, niveauEleve, niveauForce){
  const dispo = tpNiveauxDisponibles(t);
  if(niveauForce && dispo.includes(niveauForce)) return niveauForce;
  let n = niveauEleve;
  if(n === 'C1' || n === 'C2') n = 'B2';
  if(dispo.includes(n)) return n;
  const order = TP_NIVEAUX.indexOf(n);
  if(order >= 0){
    for(let d=1; d<TP_NIVEAUX.length; d++){
      if(dispo.includes(TP_NIVEAUX[order-d])) return TP_NIVEAUX[order-d];
      if(dispo.includes(TP_NIVEAUX[order+d])) return TP_NIVEAUX[order+d];
    }
  }
  return dispo[0] || 'A1';
}

/* ---------------------------------------------------------------------------------------------
   2. CORRECTION AUTOMATIQUE
   --------------------------------------------------------------------------------------------- */
function tpEsc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function tpStripAccents(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g,''); }
/* Normalisation tolérante : casse, espaces, apostrophes typographiques, ponctuation finale,
   espaces autour des apostrophes/traits d'union, œ → oe. Les accents sont gardés ici. */
function tpNorm(s){
  return String(s==null?'':s).toLowerCase()
    .replace(/[’‘`´]/g,"'").replace(/ | /g,' ')
    .replace(/œ/g,'oe').replace(/æ/g,'ae')
    .replace(/[.,;:!?«»"“”()…\[\]]/g,' ')
    .replace(/\s*'\s*/g,"'").replace(/\s*-\s*/g,'-')
    .replace(/\s+/g,' ').trim();
}
/* Compare une réponse à une liste de réponses acceptées.
   → {ok:true}                       réponse exacte
   → {ok:true, accent:"forme"}       juste à un accent près (toléré, mais signalé)
   → {ok:false, accent:"forme"}      juste à un accent près, mais l'item exige les accents
   → {ok:false}                      réponse différente */
function tpMatch(answer, accept, accents){
  const a = tpNorm(answer);
  if(!a) return {ok:false, vide:true};
  const list = (accept||[]).map(String);
  if(list.some(x => tpNorm(x) === a)) return {ok:true};
  const a2 = tpStripAccents(a);
  const hit = list.find(x => tpStripAccents(tpNorm(x)) === a2);
  if(hit) return accents === 'strict' ? {ok:false, accent:hit} : {ok:true, accent:hit};
  return {ok:false};
}
function tpTrousParts(texte){ return String(texte||'').split('___'); }

/* Évalue un item. Renvoie l'objet enregistré {v, ok, st, ...}
   st = "auto"      corrigé automatiquement (ok vrai/faux)
        "attente"   en attente de correction par la professeure
        "avis"      réponse personnelle (pas de bonne/mauvaise réponse) */
function tpEvaluer(item, v){
  const res = {v, ok:null, st:'attente'};
  switch(item.type){
    case 'qcm':
      res.ok = (v === item.correct); res.st = 'auto'; break;
    case 'court': {
      const m = tpMatch(v, item.accept, item.accents);
      res.ok = m.ok; res.st = 'auto'; if(m.accent) res.accent = m.accent; break;
    }
    case 'trous': {
      const det = (item.blancs||[]).map((acc,i)=> tpMatch((v||[])[i], acc, item.accents));
      res.det = det.map(m => m.ok ? (m.accent ? 2 : 1) : 0); // 1 = juste, 2 = juste à un accent près, 0 = faux
      res.ok = det.every(m=>m.ok); res.st = 'auto'; break;
    }
    case 'association': {
      const det = (item.paires||[]).map((p,i)=> (v||[])[i] === i);
      res.det = det.map(x=>x?1:0); res.ok = det.every(Boolean); res.st = 'auto'; break;
    }
    case 'ordre': {
      const cible = [item.unites.join(' ')].concat(item.accept||[]);
      const m = tpMatch(v, cible, 'souple');
      res.ok = m.ok; res.st = 'auto'; break;
    }
    case 'mixte': {
      /* Transformation / reformulation / correction d'erreurs : si la réponse correspond à une
         réponse acceptée → corrigé automatiquement. Sinon, elle n'est PAS comptée fausse :
         elle part en correction chez la professeure. */
      const m = tpMatch(v, item.accept, item.accents);
      if(m.ok){ res.ok = true; res.st = 'auto'; if(m.accent) res.accent = m.accent; }
      else { res.ok = null; res.st = 'attente'; if(m.accent) res.accent = m.accent; }
      break;
    }
    case 'choix_justif':
      res.okChoix = (v && v.choix === item.correct); res.ok = null; res.st = 'attente'; break;
    case 'ouverte':
      res.st = item.avis ? 'avis' : 'attente'; break;
    case 'oral':
      res.st = 'attente'; break;
  }
  return res;
}
function tpReponseVide(item, v){
  switch(item.type){
    case 'qcm': return !(typeof v === 'number');
    case 'trous': return !Array.isArray(v) || v.every(x => !String(x||'').trim());
    case 'association': return !Array.isArray(v) || v.some(x => typeof x !== 'number' || x < 0);
    case 'choix_justif': return !v || typeof v.choix !== 'number' || !String(v.justif||'').trim();
    case 'oral': return !v || !v.url;
    default: return !String(v==null?'':v).trim();
  }
}
function tpMots(s){ return String(s||'').trim().split(/\s+/).filter(Boolean).length; }

/* ---------------------------------------------------------------------------------------------
   3. ÉTAT (élève réel ou aperçu)
   --------------------------------------------------------------------------------------------- */
/* tpCtx = { tema, lvl, data, preview, showKeys, state:{r,a,fb}, actIdx, container, draft } */
let tpCtx = null;
let tpPreviewStates = {};      // états d'aperçu (jamais écrits dans Firestore), par thème+niveau
const tpActIdxMemo = {};       // activité ouverte, mémorisée par thème+niveau pour la session

function tpStudentState(temaId){
  student.temas = student.temas || {};
  student.temas[temaId] = student.temas[temaId] || {};
  const t = student.temas[temaId];
  t.v2 = t.v2 || {};
  t.v2.r = t.v2.r || {}; t.v2.a = t.v2.a || {}; t.v2.fb = t.v2.fb || {};
  return t.v2;
}
function tpItemsOf(act){ return act.items || []; }
function tpActStatus(act, state){
  const items = tpItemsOf(act);
  if(!items.length) return (state.a[act.id] && state.a[act.id].done) ? 'fait' : 'afaire';
  const rs = items.map(it => state.r[it.id]);
  const repondus = rs.filter(r => r && r.st && r.st !== 'brouillon');
  if(!repondus.length) return rs.some(Boolean) ? 'encours' : 'afaire';
  if(repondus.length < items.length) return 'encours';
  const attente = items.filter(it => { const r = state.r[it.id]; return r && r.st === 'attente'; });
  if(!attente.length) return 'fait';
  const valides = attente.filter(it => state.fb[it.id] && state.fb[it.id].verdict === 'valide');
  return valides.length === attente.length ? 'valide' : 'attente';
}
function tpActDone(act, state){ return ['fait','attente','valide'].includes(tpActStatus(act, state)); }
function tpAllDone(data, state){ return !!data && (data.activites||[]).every(a => tpActDone(a, state)); }
/* Score des items corrigés automatiquement (y compris la partie « choix » des choix justifiés). */
function tpScore(data, state){
  let ok = 0, total = 0, attente = 0, valides = 0, aRevoir = 0;
  (data.activites||[]).forEach(a => tpItemsOf(a).forEach(it=>{
    const r = state.r[it.id];
    if(!r || r.st === 'brouillon') return;
    if(r.st === 'auto'){ total++; if(r.ok) ok++; }
    if(it.type === 'choix_justif'){ total++; if(r.okChoix) ok++; }
    if(r.st === 'attente'){
      attente++;
      const fb = state.fb[it.id];
      if(fb && fb.verdict === 'valide') valides++;
      if(fb && fb.verdict === 'a_revoir') aRevoir++;
    }
  }));
  return {ok, total, attente, valides, aRevoir};
}
/* Utilisé par l'ancien code (liste des thèmes, certificat) : un thème v2 est « terminé » quand
   toutes ses activités sont faites. */
function tpTemaAllDoneFor(temaId, temasObj, niveauEleve, niveauForce){
  const t = getTema(temaId);
  if(!tpIsV2(t)) return null;
  const st = temasObj && temasObj[temaId] && temasObj[temaId].v2;
  if(!st) return false;
  const lvl = st.niveau || tpNiveauPour(t, niveauEleve, niveauForce);
  const data = tpLevelData(t, lvl);
  return tpAllDone(data, {r:st.r||{}, a:st.a||{}, fb:st.fb||{}});
}

/* Écriture Firestore groupée (élève). En aperçu ou pour le compte professeure en « vue élève »,
   rien n'est écrit. */
async function tpPersist(updates){
  if(!tpCtx || tpCtx.preview || isTeacher || !student.uid || !db) return true;
  if(tpRO()) return false;
  const temaId = tpCtx.tema.id;
  const payload = {};
  Object.keys(updates).forEach(k => {
    const val = updates[k];
    payload[`temas.${temaId}.v2.${k}`] = (val && typeof val === 'object' && !Array.isArray(val))
      ? {...val, ts: firebase.firestore.FieldValue.serverTimestamp()} : val;
  });
  payload[`temas.${temaId}.v2.niveau`] = tpCtx.lvl;
  payload.temaEcriture = temaId; /* thème déclaré : les règles Firestore vérifient qu'il est ouvert */
  try{ await db.collection('eleves').doc(student.uid).update(payload); return true; }
  catch(e){ console.error('Sauvegarde du thème impossible :', e); tpToast("⚠️ Sauvegarde impossible pour le moment (connexion ?). Tes réponses restent affichées : réessaie dans un instant."); return false; }
}
function tpToast(msg){
  let el = document.getElementById('tp-toast');
  if(!el){ el = document.createElement('div'); el.id = 'tp-toast'; el.className = 'tp-toast'; document.body.appendChild(el); }
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(el._t); el._t = setTimeout(()=>{ el.style.display = 'none'; }, 4500);
}

/* ---------------------------------------------------------------------------------------------
   4. RENDU ÉLÈVE (également utilisé pour l'aperçu de la professeure)
   --------------------------------------------------------------------------------------------- */
/* Point d'entrée appelé par renderTemas() pour un thème v2. */
function tpRenderStudent(container, tema, weeksHTML){
  const lvl = tpNiveauPour(tema, niveau, student.niveauTheme);
  const data = tpLevelData(tema, lvl);
  const state = isTeacher ? tpPreviewState(tema.id, lvl) : tpStudentState(tema.id);
  /* Un élève qui a déjà commencé à un niveau garde ce niveau (ses réponses y sont attachées),
     sauf si la professeure a forcé un autre niveau depuis. */
  let lvlUsed = lvl;
  if(!isTeacher && state.niveau && state.niveau !== lvl && !student.niveauTheme && tpLevelData(tema, state.niveau)) lvlUsed = state.niveau;
  tpCtx = {tema, lvl:lvlUsed, data: lvlUsed===lvl ? data : tpLevelData(tema, lvlUsed), preview:isTeacher, showKeys:false,
           state, container, weeksHTML, mode:'eleve', lectureSeule: temaEstArchive(tema.id)};
  tpCtx.actIdx = tpActIdxMemo[`${tema.id}_${lvlUsed}`] != null ? tpActIdxMemo[`${tema.id}_${lvlUsed}`] : (tpCtx.lectureSeule ? 0 : tpFirstOpenAct(tpCtx.data, state));
  tpDraw();
}
function tpPreviewState(temaId, lvl){
  const k = `${temaId}_${lvl}`;
  if(!tpPreviewStates[k]) tpPreviewStates[k] = {r:{}, a:{}, fb:{}};
  return tpPreviewStates[k];
}
function tpFirstOpenAct(data, state){
  if(!data) return 0;
  const i = (data.activites||[]).findIndex(a => !tpActDone(a, state));
  return i < 0 ? (data.activites||[]).length : i; // length = écran « Bilan »
}

function tpDraw(){
  const ctx = tpCtx; if(!ctx || !ctx.container) return;
  const {tema, lvl, data, state} = ctx;
  if(!data){ ctx.container.innerHTML = `<p class="teacher-empty">Ce thème n'a pas encore de contenu pour le niveau ${lvl}.</p>`; return; }
  const acts = data.activites || [];
  const nbDone = acts.filter(a => tpActDone(a, state)).length;
  const pct = acts.length ? Math.round(100*nbDone/acts.length) : 0;
  const duree = data.duree ? `${data.duree.min}–${data.duree.max} min` : '';
  const chips = acts.map((a,i)=>{
    const s = tpActStatus(a, state);
    const ic = {afaire:'⬜', encours:'✏️', fait:'✅', attente:'🕓', valide:'🟢'}[s];
    return `<button class="tema-chip tp-chip ${s} ${i===ctx.actIdx?'current':''}" onclick="tpGoAct(${i})" title="${tpEsc(tpStatusLabel(s))}">${ic} ${i+1}. ${tpEsc((TP_COMP[a.comp]||{}).fr || a.titre_fr)}</button>`;
  }).join('') + `<button class="tema-chip tp-chip ${ctx.actIdx===acts.length?'current':''}" onclick="tpGoAct(${acts.length})">🏆 Bilan</button>`;

  const previewBanner = ctx.preview ? `<div class="tp-preview-banner">👁️ <b>Aperçu ${tpEsc(lvl)}</b> — exactement ce que voit l'élève. Rien n'est enregistré.
      ${ctx.mode==='prof' ? `<label style="margin-left:10px;"><input type="checkbox" ${ctx.showKeys?'checked':''} onchange="tpToggleKeys(this.checked)"> Afficher les corrigés</label>
      <button class="tp-mini-btn" onclick="tpResetPreview()">↺ Vider les réponses d'essai</button>` : ''}
      ${ctx.draft ? '<br>⚠️ Contenu NON enregistré (brouillon de l\'éditeur).' : ''}</div>` : '';

  const header = ctx.mode === 'prof' ? '' : `
    <div class="tema-header">
      <p class="tema-period">📅 ${tpEsc(tema.periode)}</p>
      <h1>🍅 ${tema.titre_fr}</h1>
      <p class="tema-sub">${tema.sub_fr || ''} · 🇧🇷 ${tema.titre_pt}${tema.sub_pt ? ' — ' + tema.sub_pt : ''}</p>
    </div>
    <div class="tema-week-tabs">${ctx.weeksHTML || ''}</div>`;

  ctx.container.innerHTML = `
    ${previewBanner}
    ${header}
    ${ctx.lectureSeule ? temaArchiveBannerHTML() : ''}
    <p class="section-label tp-meta">Niveau ${tpEsc(lvl)}${ctx.preview ? '' : (student.niveauTheme ? ' (choisi par ta professeure pour ce thème)' : ' (attribué par ta professeure)')} · ⏱️ Travail estimé : ${duree} · ${acts.length} activités</p>
    <div class="tp-progress" role="progressbar" aria-label="Progression du parcours" aria-valuemin="0" aria-valuemax="${acts.length}" aria-valuenow="${nbDone}"><div class="tp-progress-bar" style="width:${pct}%"></div></div>
    <p class="tp-progress-label">${nbDone} / ${acts.length} activités terminées (${pct} %)</p>
    ${typeof cheminHTML === 'function' ? cheminHTML(ctx) : `<div class="tema-status-bar tp-sommaire">${chips}</div>
    <div class="tp-legend">⬜ à faire · ✏️ commencée · ✅ terminée (corrigée automatiquement) · 🕓 envoyée, en attente de correction · 🟢 validée par ta professeure</div>`}
    <div id="tp-act-zone"></div>
  `;
  const zone = document.getElementById('tp-act-zone');
  zone.innerHTML = ctx.actIdx >= acts.length ? tpBilanHTML() : tpActHTML(acts[ctx.actIdx], ctx.actIdx);
  tpAfterDraw();
}
function tpStatusLabel(s){ return {afaire:'À faire', encours:'Commencée', fait:'Terminée', attente:'En attente de correction', valide:'Validée par la professeure'}[s] || s; }
function tpGoAct(i){
  if(!tpCtx) return;
  tpCtx.actIdx = i; tpActIdxMemo[`${tpCtx.tema.id}_${tpCtx.lvl}`] = i;
  tpDraw();
  const z = document.getElementById('tp-act-zone');
  if(z && z.scrollIntoView) z.scrollIntoView({behavior:'smooth', block:'start'});
}
function tpToggleKeys(v){ if(tpCtx){ tpCtx.showKeys = v; tpDraw(); } }
function tpResetPreview(){
  if(!tpCtx || !tpCtx.preview) return;
  tpCtx.state.r = {}; tpCtx.state.a = {}; tpCtx.state.fb = {};
  tpDraw();
}

function tpActHTML(act, idx){
  const ctx = tpCtx, state = ctx.state;
  const comp = TP_COMP[act.comp] || {icone:'•', fr:'', pt:''};
  const status = tpActStatus(act, state);
  const items = tpItemsOf(act);
  let inner = '';
  if(act.comp === 'intro'){ inner += tpIntroHTML(); }
  if(act.consigne_fr) inner += `<p class="tema-consigne">${act.consigne_fr}</p>`;
  if(act.consigne_pt) inner += `<p class="tema-consigne-pt">🇧🇷 ${act.consigne_pt}</p>`;
  if(act.rappel) inner += `<div class="lecon-box tp-rappel"><p class="tp-rappel-title">📌 À retenir</p><div class="fr">${act.rappel.fr}</div>${act.rappel.pt ? `<div class="pt tp-pt">🇧🇷 ${act.rappel.pt}</div>` : ''}</div>`;
  if(act.texte) inner += `<div class="tp-doc">${act.texte.titre ? `<p class="tp-doc-title">${act.texte.titre}</p>` : ''}<div class="tp-doc-body">${act.texte.fr}</div>${act.texte.source ? `<p class="tp-doc-source">${act.texte.source}</p>` : ''}</div>`;
  if(act.video) inner += tpVideoHTML(act.video);
  /* Les items de compréhension viennent avant les questions d'avis (séparées visuellement). */
  let avisStarted = false;
  inner += items.map((it,i)=>{
    let sep = '';
    if(it.avis && !avisStarted){ avisStarted = true; sep = `<div class="tp-avis-sep">🗨️ Ton avis personnel — <i>ces questions ne sont pas des questions de compréhension : il n'y a pas de bonne ou de mauvaise réponse.</i><br><span class="tp-pt">🇧🇷 Sua opinião — não há resposta certa ou errada.</span></div>`; }
    return sep + tpItemHTML(it, i+1);
  }).join('');

  const hasItems = items.length > 0;
  const allAnswered = hasItems && items.every(it => { const r = state.r[it.id]; return r && r.st && r.st !== 'brouillon'; });
  const autoItems = items.filter(it => { const r = state.r[it.id]; return r && r.st === 'auto'; });
  const lockedAuto = autoItems.length > 0;
  let actions = '';
  if(ctx.lectureSeule){
    actions = `<p class="ee-note" style="margin:0;">🗄️ Consultation uniquement — ${hasItems ? (allAnswered ? 'tes réponses et tes corrections sont affichées ci-dessus.' : 'les exercices non faits ne peuvent plus être complétés.') : 'tu peux relire cette page.'}</p>`;
  } else if(!hasItems){
    const done = state.a[act.id] && state.a[act.id].done;
    actions = `<button class="rec-btn" onclick="tpMarkRead('${act.id}')">${done ? '✅ C\'est noté — continuer' : 'J\'ai lu, je commence →'}</button>`;
  } else {
    actions = `<button class="rec-btn tp-validate" onclick="tpValider('${act.id}')">${allAnswered ? '📤 Renvoyer mes réponses modifiées' : '✔️ Valider mes réponses'}</button>
      ${lockedAuto ? `<button class="tp-mini-btn" onclick="tpRefaire('${act.id}')">↺ Refaire les exercices corrigés automatiquement</button>` : ''}
      <p class="ee-note" id="tp-act-msg-${act.id}" style="margin:6px 0 0;"></p>`;
  }
  const acts = ctx.data.activites;
  const nav = `<div class="week-footer tp-nav">
      <button ${idx===0?'disabled':''} onclick="tpGoAct(${idx-1})">← Activité précédente</button>
      <button onclick="tpGoAct(${idx+1})">${idx===acts.length-1 ? 'Voir mon bilan →' : 'Activité suivante →'}</button>
    </div>`;
  return `<div class="tema-skill-card tp-act">
      <div class="tema-skill-top"><span class="tema-skill-icon">${comp.icone}</span><h3 class="tema-skill-name">${idx+1}. ${act.titre_fr || comp.fr}</h3><span class="tema-skill-dur">${tpEsc(act.dur||'')}</span></div>
      <p class="tema-skill-name-pt">🇧🇷 ${act.titre_pt || comp.pt}</p>
      <p class="tp-act-status ${status}">${tpStatusLabel(status)}</p>
      ${inner}
      <div class="tp-actions">${actions}</div>
    </div>${nav}`;
}
function tpIntroHTML(){
  const d = tpCtx.data;
  const obj = (d.objectifs||[]).map(o=>`<li>${o.fr}${o.pt ? `<span class="pt tp-pt">🇧🇷 ${o.pt}</span>` : ''}</li>`).join('');
  const gram = (d.grammaire||[]).map(g=>`<li>${g}</li>`).join('');
  const plan = (d.activites||[]).map((a,i)=>`<li>${(TP_COMP[a.comp]||{}).icone||''} ${a.titre_fr} <span class="tp-dim">(${tpEsc(a.dur||'')})</span></li>`).join('');
  return `<div class="objectif-box"><p class="fr">${d.intro_fr||''}</p>${d.intro_pt ? `<p class="pt">🇧🇷 ${d.intro_pt}</p>` : ''}</div>
    <div class="tp-intro-grid">
      <div><p class="tp-rappel-title">🎯 Objectifs</p><ul class="tp-list">${obj}</ul></div>
      <div><p class="tp-rappel-title">🧩 Grammaire de la semaine</p><ul class="tp-list">${gram}</ul></div>
    </div>
    <p class="tp-rappel-title">🗺️ Ton parcours</p><ol class="tp-list">${plan}</ol>`;
}
function tpVideoHTML(v){
  const ctx = tpCtx;
  const verif = v.verification || {};
  const warn = (ctx.preview && verif.statut !== 'verifiee') ? `<div class="tp-warn">⚠️ <b>Vidéo non vérifiée</b> (visible uniquement par la professeure) — ${tpEsc(verif.note || 'contenu à vérifier avant publication')}. Aucune question factuelle n'a été rédigée sur son contenu : seules des consignes ouvertes, corrigées par la professeure, sont proposées.</div>` : '';
  const times = Array.isArray(v.reperes) && v.reperes.length ? `<p class="tp-dim">⏱️ Repères : ${v.reperes.map(r=>tpEsc(r)).join(' · ')}</p>` : '';
  return `${warn}<div class="media-block"><p class="section-label">▶ Regarder / Écouter — Assistir / Ouvir</p>
    <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}" loading="lazy" allowfullscreen title="${tpEsc(v.label||'Vidéo')}"></iframe>
    <p class="source-link" style="margin-top:4px;">🎬 ${tpEsc(v.label||'')} — <a href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener">ouvrir sur YouTube</a></p>${times}</div>`;
}

/* ---- Items ---- */
function tpItemHTML(it, num){
  const ctx = tpCtx, r = ctx.state.r[it.id], fb = ctx.state.fb[it.id];
  const answered = r && r.st && r.st !== 'brouillon';
  const ro = !!ctx.lectureSeule;
  const locked = (answered && r.st === 'auto') || ro;
  const typeLabel = {qcm:'Choix multiple', court:'Réponse courte', trous:'Phrases à trous', association:'Associer', ordre:'Remettre dans l\'ordre',
    mixte:({transformation:'Transformer', reformulation:'Reformuler', correction:'Corriger l\'erreur', connecteurs:'Relier', reecriture:'Réécrire'}[it.sous_type] || 'Transformer'),
    choix_justif:'Choisir et justifier', ouverte: it.avis ? 'Ton avis' : 'Réponse rédigée', oral:'Enregistrement'}[it.type] || '';
  const corr = it.type==='ouverte' || it.type==='oral' || it.type==='choix_justif' ? (it.avis ? '' : '👩‍🏫 corrigé par ta professeure')
    : it.type==='mixte' ? '⚙️ auto + 👩‍🏫 si ta réponse est différente' : '⚙️ correction automatique';
  let body = '';
  const val = r ? r.v : undefined;
  const dis = locked ? 'disabled' : '';
  switch(it.type){
    case 'qcm': {
      body = `<div class="exo-options">${it.options.map((o,i)=>{
        let cls = '';
        if(answered && r.st==='auto'){ if(i===it.correct) cls='correct'; else if(i===val) cls='wrong'; }
        else if(val===i) cls = 'tp-selected';
        return `<button class="exo-opt ${cls}" ${dis} onclick="tpPick('${it.id}',${i})">${o}</button>`;
      }).join('')}</div>`;
      break;
    }
    case 'court':
    case 'mixte': {
      const big = it.type==='mixte' && (it.lignes||1) > 1;
      body = big
        ? `<textarea class="ee-textarea tp-input" id="tpf-${it.id}" rows="${it.lignes}" ${dis} oninput="tpDraft('${it.id}')" placeholder="Ta réponse / Sua resposta">${tpEsc(val||'')}</textarea>`
        : `<input type="text" class="tp-input tp-line" id="tpf-${it.id}" value="${tpEsc(val||'')}" ${dis} oninput="tpDraft('${it.id}')" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse / Sua resposta">`;
      break;
    }
    case 'trous': {
      const parts = tpTrousParts(it.texte);
      body = `<p class="tp-trous">${parts.map((p,i)=>{
        if(i===parts.length-1) return p;
        const v = (val||[])[i] || '';
        let cls = '';
        if(answered && r.det){ cls = r.det[i]===0 ? 'bad' : 'ok'; }
        return `${p}<input type="text" class="tp-input tp-blank ${cls}" id="tpf-${it.id}-${i}" aria-label="Réponse ${i+1}${parts.length>2 ? ' sur ' + (parts.length-1) : ''}" value="${tpEsc(v)}" ${dis} oninput="tpDraft('${it.id}')" autocomplete="off" autocapitalize="off" spellcheck="false" size="${Math.max(6, Math.min(18, ((it.blancs[i]||[''])[0]||'').length+2))}">`;
      }).join('')}</p>`;
      break;
    }
    case 'association': {
      const droites = (it.paires||[]).map((p,i)=>({t:p[1], i}));
      const ordre = tpShuffleStable(droites.map(d=>d.i), it.id);
      body = `<div class="tp-assoc">${(it.paires||[]).map((p,i)=>{
        const v = (val||[])[i];
        let cls = ''; if(answered && r.det) cls = r.det[i] ? 'ok' : 'bad';
        return `<div class="tp-assoc-row ${cls}"><span class="tp-assoc-left">${p[0]}</span><span class="tp-assoc-arrow">→</span>
          <select class="tp-input" id="tpf-${it.id}-${i}" aria-label="Associer : ${tpEsc(String(p[0]).replace(/<[^>]+>/g,''))}" ${dis} onchange="tpDraft('${it.id}')"><option value="-1">— choisir —</option>
          ${ordre.map(j=>`<option value="${j}" ${v===j?'selected':''}>${tpEsc(it.paires[j][1])}</option>`).join('')}</select></div>`;
      }).join('')}</div>`;
      break;
    }
    case 'ordre': {
      const ordreIdx = tpShuffleStable(it.unites.map((_,i)=>i), it.id);
      const choisis = ctx._ordre && ctx._ordre[it.id] ? ctx._ordre[it.id] : null;
      if(locked){
        body = `<p class="tp-ordre-result">${val ? tpEsc(val) : '<span class="tp-dim">—</span>'}</p>`;
      } else {
        const sel = choisis || [];
        body = `<div class="tp-ordre-built" id="tpo-built-${it.id}">${sel.length ? sel.map(i=>`<span class="tp-token on">${tpEsc(it.unites[i])}</span>`).join(' ') : (val ? `<span class="tp-dim">Réponse enregistrée : ${tpEsc(val)}</span>` : '<span class="tp-dim">Clique sur les éléments dans le bon ordre…</span>')}</div>
          <div class="tp-ordre-pool">${ordreIdx.map(i=>`<button class="tp-token ${sel.includes(i)?'used':''}" ${sel.includes(i)?'disabled':''} onclick="tpOrdreAdd('${it.id}',${i})">${tpEsc(it.unites[i])}</button>`).join('')}</div>
          <button class="tp-mini-btn" onclick="tpOrdreReset('${it.id}')">↺ Recommencer</button>`;
      }
      break;
    }
    case 'choix_justif': {
      const v = (r && r._modif) ? r._modif : (val || {});
      body = `<div class="exo-options">${it.options.map((o,i)=>`<button class="exo-opt ${v.choix===i?'tp-selected':''}" ${ro?'disabled':''} onclick="tpPickChoix('${it.id}',${i})">${o}</button>`).join('')}</div>
        <p class="tp-sub">Justifie ton choix :</p>
        <textarea class="ee-textarea tp-input" id="tpf-${it.id}" rows="2" ${ro?'disabled':''} oninput="tpDraft('${it.id}')" placeholder="Parce que… / Porque…">${tpEsc(v.justif||'')}</textarea>`;
      break;
    }
    case 'ouverte': {
      const n = tpMots(val);
      body = `<textarea class="ee-textarea tp-input" id="tpf-${it.id}" rows="${it.lignes||5}" ${ro?'disabled':''} oninput="tpDraft('${it.id}'); tpCount('${it.id}',${it.min_mots||0})" placeholder="Écris ta réponse ici… / Escreva sua resposta aqui…">${tpEsc(val||'')}</textarea>
        ${it.min_mots ? `<p class="tp-dim" id="tpc-${it.id}">${n} mot(s) — objectif : au moins ${it.min_mots} mots</p>` : ''}`;
      break;
    }
    case 'oral': {
      const v = val || {};
      body = `<div class="rec-box">${ro ? '' : `<div class="rec-controls">
          <button class="rec-btn" id="tprec-btn-${it.id}" onclick="tpToggleRec('${it.id}')">● Enregistrer</button>
          <span class="rec-time" id="tprec-time-${it.id}">00:00</span></div>`}
          <div id="tprec-player-${it.id}">${v.url ? `<audio class="rec-audio" controls src="${tpEsc(v.url)}"></audio>` : ''}</div>
          ${ro ? '' : `<p class="rec-status ${v.url?'ok':''}" id="tprec-status-${it.id}">${v.url ? '✅ Enregistrement envoyé à ta professeure. Tu peux t\'enregistrer à nouveau si tu veux.' : 'Ton enregistrement sera envoyé à ta professeure.'}</p>`}</div>`;
      break;
    }
  }
  /* Retour après validation */
  let feedback = '';
  if(answered){
    if(r.st === 'auto'){
      feedback = r.ok
        ? `<p class="exo-feedback ok">✔ Correct ! / Correto!${r.accent ? ` <span class="tp-dim">(attention aux accents : « ${tpEsc(r.accent)} »)</span>` : ''}</p>`
        : `<p class="exo-feedback bad">✘ Pas encore. ${tpSolutionHTML(it)}${r.accent ? ` <span class="tp-dim">— c'était presque ça : vérifie les accents (« ${tpEsc(r.accent)} »).</span>` : ''}</p>`;
      if(it.explication) feedback += `<p class="tp-expl">💡 ${it.explication}</p>`;
    } else if(r.st === 'attente'){
      if(it.type==='mixte') feedback = `<p class="exo-feedback tp-wait">🕓 Ta réponse est différente de la réponse modèle : elle n'est pas comptée fausse, ta professeure va la vérifier.${r.accent ? ` (Vérifie aussi les accents.)` : ''}</p>${it.modele || (it.accept&&it.accept[0]) ? `<p class="tp-expl">📝 Exemple de réponse attendue : <i>${tpEsc(it.modele || it.accept[0])}</i></p>` : ''}`;
      else if(it.type==='choix_justif') feedback = `<p class="exo-feedback ${r.okChoix?'ok':'bad'}">${r.okChoix ? '✔ Bon choix !' : '✘ Ce n\'est pas le bon choix. ' + tpSolutionHTML(it)} Ta justification est envoyée à ta professeure.</p>${it.explication ? `<p class="tp-expl">💡 ${it.explication}</p>` : ''}`;
      else feedback = `<p class="exo-feedback tp-wait">🕓 Envoyé à ta professeure — en attente de correction.</p>${it.modele ? `<details class="tp-model"><summary>Voir un exemple de réponse</summary><p>${it.modele}</p></details>` : ''}`;
    } else if(r.st === 'avis'){
      feedback = `<p class="exo-feedback ok">✅ Merci ! Réponse enregistrée.</p>`;
    }
  }
  if(ro && !answered){
    feedback = `<p class="exo-feedback tp-dim">${r && r.st==='brouillon' && !tpReponseVide(it, r.v) ? '✏️ Brouillon jamais soumis avant l\'archivage.' : '— Non fait avant l\'archivage.'}</p>`;
  }
  if(fb && (fb.c || fb.verdict)){
    feedback += `<div class="tp-fb ${fb.verdict==='valide'?'ok':'revoir'}">👩‍🏫 <b>${fb.verdict==='valide' ? 'Validé par ta professeure' : 'À retravailler'}</b>${fb.c ? ` — ${tpEsc(fb.c)}` : ''}${fb.verdict==='a_revoir' && !ro ? '<br><span class="tp-dim">Corrige ta réponse puis clique sur « Renvoyer ».</span>' : ''}</div>`;
  }
  const keys = (ctx.showKeys && !answered) ? `<p class="tp-key">🔑 ${tpSolutionHTML(it, true)}${it.explication ? ` — ${it.explication}` : ''}</p>` : '';
  return `<div class="exo-box tp-item ${it.avis ? 'tp-item-avis' : ''}" id="tpi-${it.id}">
      <div class="tp-item-head"><span class="tp-num">${num}</span><span class="tp-type">${typeLabel}</span><span class="tp-corr">${corr}</span></div>
      ${it.consigne ? `<p class="exo-consigne">${it.consigne}</p>` : ''}
      ${it.consigne_pt ? `<p class="exo-consigne-pt">🇧🇷 ${it.consigne_pt}</p>` : ''}
      ${it.q ? `<p class="exo-question">${it.q}</p>` : ''}
      ${it.aide_pt ? `<p class="tp-aide">🇧🇷 Ajuda : ${it.aide_pt}</p>` : ''}
      ${body}${feedback}${keys}
    </div>`;
}
function tpSolutionHTML(it, forKey){
  switch(it.type){
    case 'qcm': case 'choix_justif': return `Bonne réponse : <b>${it.options[it.correct]}</b>.`;
    case 'court': case 'mixte': return (it.accept && it.accept.length) ? `Réponse attendue : <b>${tpEsc(it.accept[0])}</b>${it.accept.length>1 ? ` <span class="tp-dim">(acceptées aussi : ${it.accept.slice(1).map(tpEsc).join(' / ')})</span>` : ''}.` : (it.modele ? `Exemple : <i>${it.modele}</i>` : '');
    case 'trous': return `Réponses : ${(it.blancs||[]).map((b,i)=>`(${i+1}) <b>${tpEsc(b[0])}</b>`).join(' · ')}.`;
    case 'association': return `Bonnes paires : ${(it.paires||[]).map(p=>`${p[0]} → <b>${tpEsc(p[1])}</b>`).join(' · ')}.`;
    case 'ordre': return `Bon ordre : <b>${tpEsc(it.unites.join(' '))}</b>.`;
    case 'ouverte': case 'oral': return it.modele ? `Exemple / critères : ${it.modele}` : (forKey ? 'Réponse libre, corrigée par la professeure.' : '');
  }
  return '';
}
/* Mélange déterministe (même ordre à chaque affichage pour un même item). */
function tpShuffleStable(arr, seedStr){
  let seed = 0; for(const ch of String(seedStr)) seed = (seed*31 + ch.charCodeAt(0)) >>> 0;
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ seed = (seed*1103515245 + 12345) >>> 0; const j = seed % (i+1); [a[i],a[j]] = [a[j],a[i]]; }
  if(a.length > 1 && a.every((x,i)=>x===arr[i])) a.push(a.shift()); // jamais dans l'ordre de la solution
  return a;
}

/* ---- Interactions ---- */
function tpFindItem(itemId){
  for(const a of (tpCtx.data.activites||[])) for(const it of tpItemsOf(a)) if(it.id===itemId) return {act:a, item:it};
  return null;
}
/* Lecture seule : thème archivé (et non rouvert) pour l'élève. */
function tpRO(){ return !!(tpCtx && tpCtx.lectureSeule); }
function tpPick(itemId, i){
  if(tpRO()) return;
  const r = tpCtx.state.r[itemId];
  if(r && r.st === 'auto') return;
  tpCtx.state.r[itemId] = {v:i, st:'brouillon', n:(r && r.n) || 0};
  tpQueueDraft(itemId);
  tpRedrawItem(itemId);
}
function tpPickChoix(itemId, i){
  if(tpRO()) return;
  const f = tpFindItem(itemId); if(!f) return;
  const cur = tpCollect(f.item) || {};
  const r = tpCtx.state.r[itemId];
  const v = {choix:i, justif:cur.justif||''};
  if(r && r.st && r.st !== 'brouillon'){ r._modif = v; }   // déjà envoyé : renvoyé avec « Renvoyer »
  else { tpCtx.state.r[itemId] = {v, st:'brouillon', n:(r && r.n) || 0}; tpQueueDraft(itemId); }
  tpRedrawItem(itemId);
}
function tpOrdreAdd(itemId, i){
  if(tpRO()) return;
  tpCtx._ordre = tpCtx._ordre || {};
  const sel = tpCtx._ordre[itemId] = tpCtx._ordre[itemId] || [];
  if(!sel.includes(i)) sel.push(i);
  const f = tpFindItem(itemId);
  if(f && sel.length === f.item.unites.length){
    const r0 = tpCtx.state.r[itemId];
    tpCtx.state.r[itemId] = {v: sel.map(k=>f.item.unites[k]).join(' '), st:'brouillon', n:(r0 && r0.n) || 0};
    tpQueueDraft(itemId);
  }
  tpRedrawItem(itemId);
}
function tpOrdreReset(itemId){
  if(tpRO()) return;
  tpCtx._ordre = tpCtx._ordre || {};
  tpCtx._ordre[itemId] = [];
  const r = tpCtx.state.r[itemId];
  if(r && r.st === 'brouillon') delete tpCtx.state.r[itemId];
  tpRedrawItem(itemId);
}
function tpCount(itemId, min){
  const el = document.getElementById('tpc-'+itemId), ta = document.getElementById('tpf-'+itemId);
  if(el && ta){ const n = tpMots(ta.value); el.textContent = `${n} mot(s) — objectif : au moins ${min} mots`; el.classList.toggle('ok', n >= min); }
}
function tpRedrawItem(itemId){
  const f = tpFindItem(itemId); if(!f) return;
  const el = document.getElementById('tpi-'+itemId); if(!el) return;
  const num = tpItemsOf(f.act).indexOf(f.item) + 1;
  const tmp = document.createElement('div'); tmp.innerHTML = tpItemHTML(f.item, num);
  el.replaceWith(tmp.firstElementChild);
}
/* Lit la réponse actuellement saisie dans la page. */
function tpCollect(it){
  const r = tpCtx.state.r[it.id];
  const g = id => document.getElementById(id);
  switch(it.type){
    case 'qcm': return r ? r.v : undefined;
    case 'court': case 'mixte': case 'ouverte': { const el = g('tpf-'+it.id); return el ? el.value : (r ? r.v : ''); }
    case 'trous': return tpTrousParts(it.texte).slice(0,-1).map((_,i)=>{ const el = g(`tpf-${it.id}-${i}`); return el ? el.value : ''; });
    case 'association': return (it.paires||[]).map((_,i)=>{ const el = g(`tpf-${it.id}-${i}`); return el ? parseInt(el.value,10) : -1; });
    case 'ordre': return r ? r.v : '';
    case 'choix_justif': { const el = g('tpf-'+it.id); const src = r && r._modif ? r._modif : (r && r.v ? r.v : {}); return {choix: src.choix, justif: el ? el.value : (src.justif||'')}; }
    case 'oral': return r ? r.v : null;
  }
}
/* Brouillon : les saisies sont gardées en mémoire immédiatement et sauvegardées dans Firestore
   (au plus une écriture toutes les 2 s par item) tant que l'activité n'est pas validée. */
const tpDraftTimers = {};
function tpDraft(itemId){
  if(tpRO()) return;
  const f = tpFindItem(itemId); if(!f) return;
  const v = tpCollect(f.item);
  const r = tpCtx.state.r[itemId];
  if(r && r.st && r.st !== 'brouillon'){
    /* Réponse déjà envoyée (correction prof) : on garde la modification en mémoire,
       elle sera renvoyée avec le bouton « Renvoyer ». */
    r._modif = v; return;
  }
  tpCtx.state.r[itemId] = {v, st:'brouillon', n:(r && r.n) || 0};
  tpQueueDraft(itemId);
}
function tpQueueDraft(itemId){
  if(!tpCtx || tpCtx.preview || tpRO()) return;
  clearTimeout(tpDraftTimers[itemId]);
  tpDraftTimers[itemId] = setTimeout(()=>{
    const r = tpCtx && tpCtx.state.r[itemId];
    if(r && r.st === 'brouillon') tpPersist({[`r.${itemId}`]: {v: r.v === undefined ? null : r.v, st:'brouillon', n: r.n || 0}});
  }, 2000);
}

async function tpValider(actId){
  if(tpRO()) return;
  const act = (tpCtx.data.activites||[]).find(a=>a.id===actId); if(!act) return;
  const items = tpItemsOf(act);
  const updates = {};
  const manquants = [];
  items.forEach(it=>{
    const prev = tpCtx.state.r[it.id];
    if(prev && prev.st === 'auto') return; // déjà corrigé automatiquement (verrouillé)
    let v = tpCollect(it);
    if(prev && prev._modif !== undefined) v = prev._modif;
    if(tpReponseVide(it, v)){ if(!(prev && prev.st && prev.st!=='brouillon')) manquants.push(it); return; }
    if(prev && prev.st && prev.st !== 'brouillon' && JSON.stringify(prev.v) === JSON.stringify(v)) return; // inchangé
    if(it.type === 'ouverte' && it.min_mots && tpMots(v) < Math.ceil(it.min_mots*0.6)){ manquants.push(it); return; }
    const res = tpEvaluer(it, v);
    res.n = ((prev && prev.n) || 0) + 1;
    tpCtx.state.r[it.id] = res;
    clearTimeout(tpDraftTimers[it.id]);
    updates[`r.${it.id}`] = res;
  });
  const msgEl = () => document.getElementById('tp-act-msg-'+actId);
  if(Object.keys(updates).length){
    if(tpActDone(act, tpCtx.state)) { tpCtx.state.a[actId] = {done:true}; updates[`a.${actId}`] = {done:true}; }
    const ok = await tpPersist(updates);
    tpDraw();
    const m = msgEl();
    if(m) m.innerHTML = (manquants.length ? `⚠️ ${manquants.length} réponse(s) manquante(s) ou trop courte(s) — complète-les puis valide à nouveau. ` : '') + (ok ? '✅ Réponses enregistrées.' : '');
  } else {
    const m = msgEl();
    if(m) m.textContent = manquants.length ? `⚠️ Réponds à toutes les questions avant de valider (${manquants.length} manquante(s) ou trop courte(s)).` : 'Rien de nouveau à envoyer.';
  }
  if(manquants.length){ const el = document.getElementById('tpi-'+manquants[0].id); if(el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'center'}); }
}
async function tpRefaire(actId){
  if(tpRO()) return;
  const act = (tpCtx.data.activites||[]).find(a=>a.id===actId); if(!act) return;
  if(!confirm('Refaire les exercices corrigés automatiquement de cette activité ? Tes réponses actuelles seront effacées (ta professeure garde le nombre d\'essais).')) return;
  const updates = {};
  tpItemsOf(act).forEach(it=>{
    const r = tpCtx.state.r[it.id];
    if(r && r.st === 'auto'){ tpCtx.state.r[it.id] = {v:null, st:'brouillon', n:r.n}; updates[`r.${it.id}`] = {v:null, st:'brouillon', n:r.n||1}; }
    if(tpCtx._ordre) delete tpCtx._ordre[it.id];
  });
  await tpPersist(updates);
  tpDraw();
}
async function tpMarkRead(actId){
  if(tpRO()){ tpGoAct(tpCtx.actIdx + 1); return; }
  if(!(tpCtx.state.a[actId] && tpCtx.state.a[actId].done)){
    tpCtx.state.a[actId] = {done:true};
    await tpPersist({[`a.${actId}`]: {done:true}});
  }
  tpGoAct(tpCtx.actIdx + 1);
}

/* ---- Enregistrement audio (même circuit Drive que l'ancien thème) ---- */
const tpRecorders = {};
async function tpToggleRec(itemId){
  if(tpRO()) return;
  const btn = document.getElementById('tprec-btn-'+itemId), status = document.getElementById('tprec-status-'+itemId);
  if(!tpRecorders[itemId] || !tpRecorders[itemId].active){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mr = new MediaRecorder(stream); const chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, {type: mr.mimeType || 'audio/webm'});
        const localUrl = URL.createObjectURL(blob);
        const ext = (blob.type||'').includes('mp4') ? 'm4a' : 'webm';
        stream.getTracks().forEach(t=>t.stop()); clearInterval(tpRecorders[itemId].timer);
        const player = document.getElementById('tprec-player-'+itemId);
        if(player) player.innerHTML = `<audio class="rec-audio" controls src="${localUrl}"></audio><br><a class="rec-dl" href="${localUrl}" download="${itemId}-secours.${ext}">⬇ Copie locale (secours) / Cópia local</a>`;
        if(tpCtx.preview){ tpCtx.state.r[itemId] = {v:{url:localUrl}, st:'brouillon'}; if(status){ status.textContent = 'Aperçu : enregistrement local uniquement (non envoyé).'; } return; }
        if(status){ status.textContent = 'Envoi en cours…'; status.className = 'rec-status'; }
        try{
          const tema = tpCtx.tema;
          const fileName = `${tpCtx.lvl}_${slug(student.prenom)}-${slug(student.nom)}_THEME-${slug(tema.titre_fr)}-${itemId}_${Date.now()}.${ext}`;
          const b64 = await blobToBase64(blob);
          const result = await callDriveScript({action:'upload', fileName, mimeType: blob.type || 'audio/webm', base64: b64});
          if(!result || !result.ok) throw new Error(result && result.error || 'échec Drive');
          tpCtx.state.r[itemId] = {v:{url: result.viewUrl, fileId: result.fileId}, st:'brouillon', n:((tpCtx.state.r[itemId]||{}).n||0)};
          try{
            await db.collection('enregistrements').add({
              uid: student.uid, prenom: student.prenom, nom: student.nom, email: student.email, telephone: student.telephone,
              niveau: tpCtx.lvl, dossier: 'Thème de la semaine', semaine: tema.titre_fr, jour: 'Production orale', activite: tema.titre_fr,
              driveUrl: result.viewUrl, driveFileId: result.fileId, type:'tema', temaId: tema.id, itemId,
              ts: firebase.firestore.FieldValue.serverTimestamp()
            });
          }catch(e2){ /* non bloquant */ }
          if(status){ status.textContent = '✅ Enregistrement envoyé. Clique sur « Valider mes réponses » pour terminer l\'activité.'; status.className = 'rec-status ok'; }
          tpQueueDraft(itemId);
        }catch(e){
          if(status){ status.textContent = "⚠ Échec de l'envoi — utilise la copie locale ci-dessus et envoie-la par message à ta professeure."; status.className = 'rec-status bad'; }
        }
      };
      mr.start();
      let seconds = 0; const timeEl = document.getElementById('tprec-time-'+itemId);
      const timer = setInterval(()=>{ seconds++; if(timeEl) timeEl.textContent = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }, 1000);
      tpRecorders[itemId] = {mr, active:true, timer};
      if(btn){ btn.textContent = '■ Arrêter'; btn.classList.add('recording'); }
      if(status){ status.textContent = 'Enregistrement en cours…'; status.className = 'rec-status'; }
    }catch(err){
      if(status){ status.textContent = "Micro non disponible : autorise l'accès au micro dans ton navigateur."; status.className = 'rec-status bad'; }
    }
  } else {
    tpRecorders[itemId].mr.stop(); tpRecorders[itemId].active = false;
    if(btn){ btn.textContent = '● Enregistrer'; btn.classList.remove('recording'); }
  }
}
function tpAfterDraw(){ /* réservé (ex. focus) */ }

/* ---- Bilan ---- */
function tpBilanHTML(){
  const ctx = tpCtx, d = ctx.data, st = ctx.state;
  const acts = d.activites || [];
  const sc = tpScore(d, st);
  const done = tpAllDone(d, st);
  const rows = acts.map((a,i)=>{
    const s = tpActStatus(a, st);
    const its = tpItemsOf(a);
    const auto = its.filter(it => st.r[it.id] && st.r[it.id].st==='auto');
    const okA = auto.filter(it => st.r[it.id].ok).length;
    return `<tr><td>${(TP_COMP[a.comp]||{}).icone||''} ${i+1}. ${a.titre_fr}</td><td>${auto.length ? `${okA}/${auto.length}` : '—'}</td><td>${tpStatusLabel(s)}</td></tr>`;
  }).join('');
  const teacher = (student.temas && student.temas[ctx.tema.id] && student.temas[ctx.tema.id].review) || null;
  const pct = sc.total ? Math.round(100*sc.ok/sc.total) : null;
  return `<div class="tema-skill-card tp-act">
    <div class="tema-skill-top"><span class="tema-skill-icon">🏆</span><h3 class="tema-skill-name">Bilan de ton parcours</h3></div>
    <p class="tema-skill-name-pt">🇧🇷 Balanço do seu percurso</p>
    <div class="tp-bilan-kpis">
      <div><b>${pct===null ? '—' : pct + ' %'}</b><span>exercices auto réussis (${sc.ok}/${sc.total})</span></div>
      <div><b>${sc.attente}</b><span>réponses envoyées à ta professeure</span></div>
      <div><b>${sc.valides}</b><span>déjà validées</span></div>
      <div><b>${sc.aRevoir}</b><span>à retravailler</span></div>
    </div>
    <table class="bilan-table"><thead><tr><th>Activité</th><th>Auto</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table>
    ${teacher && (teacher.note || teacher.comment) ? `<div class="objectif-box" style="margin-top:14px;"><p class="fr"><span class="label-fr">Ta professeure —</span> ${teacher.note ? `<b>${tpEsc(teacher.note)}</b> ` : ''}${tpEsc(teacher.comment||'')}</p></div>` : ''}
    <p class="tp-rappel-title" style="margin-top:14px;">🎯 Rappel des objectifs</p>
    <ul class="tp-list">${(d.objectifs||[]).map(o=>`<li>${o.fr}</li>`).join('')}</ul>
    <div id="tema-cert-zone" style="margin-top:14px;">${done ? (ctx.preview ? '<p class="tp-dim">(Aperçu : le certificat apparaît ici quand toutes les activités sont faites.)</p>' : certificateBlockHTML()) : `<div class="tema-cert-locked"><p>🔒 Ton certificat se débloque quand les ${acts.length} activités sont terminées.</p><p class="pt">🇧🇷 Seu certificado é desbloqueado quando as ${acts.length} atividades estiverem concluídas.</p></div>`}</div>
  </div>
  <div class="week-footer tp-nav"><button onclick="tpGoAct(${acts.length-1})">← Dernière activité</button><div></div></div>`;
}

/* ---------------------------------------------------------------------------------------------
   5. ESPACE ENSEIGNANTE
   --------------------------------------------------------------------------------------------- */
let tpTeacherPreviewLvl = null;
let tpEditorLvl = null;
let tpEditorDraft = {};     // {`${temaId}_${lvl}`: texte JSON en cours d'édition}

function tpTeacherWeeksHTML(){
  return [...temasSemanas].reverse().map(t=>{
    const active = t.id === teacherTemaSelectedId;
    const brouillon = tpStatut(t) === 'brouillon';
    return `<button class="tema-week-tab ${active?'active':''}" onclick="setTeacherTemaWeek('${t.id}')">
      ${brouillon ? '📝 ' : ''}${t.titre_fr}<span class="tema-week-tab-date">${t.periode} · ${tpEtatLabel(tpEtatTheme(t)).replace(/ \(.*\)/,'')}${tpIsV2(t) ? ' · parcours' : ''}</span></button>`;
  }).join('');
}

/* Contrôle qualité d'un niveau : ce qui manque ou reste à vérifier avant publication. */
function tpCheckLevel(t, lvl){
  const d = tpLevelData(t, lvl);
  const pb = [], ok = [];
  if(!d){ pb.push('Pas de contenu.'); return {pb, ok, d}; }
  const comps = (d.activites||[]).map(a=>a.comp);
  const requis = ['intro','vocabulaire','ce','co','grammaire','conjugaison','ee','eo','synthese'];
  const manque = requis.filter(c=>!comps.includes(c));
  if(manque.length) pb.push('Activités manquantes : ' + manque.map(c=>TP_COMP[c].fr).join(', ')); else ok.push('Les 9 types d\'activités sont présents');
  const ids = new Set(); let doublons = 0, nbItems = 0, nbAuto = 0, nbProf = 0;
  (d.activites||[]).forEach(a => tpItemsOf(a).forEach(it=>{
    nbItems++; if(ids.has(it.id)) doublons++; ids.add(it.id);
    if(TP_TYPES_AUTO.includes(it.type)) nbAuto++; else nbProf++;
    const err = tpValidateItem(it); if(err) pb.push(`Item ${it.id} : ${err}`);
  }));
  if(doublons) pb.push(`${doublons} identifiant(s) d'item en double.`);
  ok.push(`${nbItems} exercices (${nbAuto} corrigés automatiquement, ${nbProf} avec correction prof ou mixte)`);
  const nbGram = (d.activites||[]).filter(a=>a.comp==='grammaire').length;
  if(nbGram < 1) pb.push('Aucune activité de grammaire.');
  const co = (d.activites||[]).find(a=>a.comp==='co');
  if(co){
    if(!co.video || !co.video.id) pb.push('Compréhension orale sans vidéo.');
    else if(!co.video.verification || co.video.verification.statut !== 'verifiee') pb.push(`🎬 Vidéo « ${co.video.label||co.video.id} » NON vérifiée — ${(co.video.verification && co.video.verification.note) || 'à regarder avant publication'}.`);
    else ok.push('Vidéo vérifiée');
  }
  if(!d.duree) pb.push('Durée indicative absente.');
  return {pb, ok, d};
}
function tpValidateItem(it){
  if(!it.id) return 'id manquant';
  switch(it.type){
    case 'qcm': if(!Array.isArray(it.options) || typeof it.correct!=='number' || !it.options[it.correct]) return 'options/correct invalides'; break;
    case 'choix_justif': if(!Array.isArray(it.options) || typeof it.correct!=='number' || !it.options[it.correct]) return 'options/correct invalides'; break;
    case 'court': if(!Array.isArray(it.accept) || !it.accept.length) return 'liste "accept" vide'; break;
    case 'trous': if(tpTrousParts(it.texte).length-1 !== (it.blancs||[]).length) return 'nombre de ___ différent du nombre de "blancs"'; if((it.blancs||[]).some(b=>!Array.isArray(b)||!b.length)) return 'un blanc sans réponse'; break;
    case 'association': if(!Array.isArray(it.paires) || it.paires.length < 2) return 'au moins 2 paires'; break;
    case 'ordre': if(!Array.isArray(it.unites) || it.unites.length < 2) return 'au moins 2 unités'; break;
    case 'mixte': if(!Array.isArray(it.accept)) return 'liste "accept" manquante'; break;
    case 'ouverte': case 'oral': break;
    default: return `type inconnu « ${it.type} »`;
  }
  return '';
}

function tpRenderTeacher(body, tema){
  const cfg = tpThemeCfg(tema.id);
  const statut = tpStatut(tema);
  const lvls = tpNiveauxDisponibles(tema);
  if(!tpTeacherPreviewLvl || !lvls.includes(tpTeacherPreviewLvl)) tpTeacherPreviewLvl = null;
  const checks = lvls.map(l=>{
    const c = tpCheckLevel(tema, l);
    const modif = cfg.contenu && cfg.contenu[l];
    return `<details class="tp-check" ${c.pb.length ? 'open' : ''}><summary><b>${l}</b> ${c.pb.length ? `⚠️ ${c.pb.length} point(s) à vérifier` : '✅ prêt'}${modif ? ' · ✏️ contenu modifié' : ''}${c.d && c.d.duree ? ` · ⏱️ ${c.d.duree.min}–${c.d.duree.max} min` : ''}</summary>
      <ul class="tp-list">${c.pb.map(p=>`<li class="bad">${tpEsc(p)}</li>`).join('')}${c.ok.map(p=>`<li class="ok">${tpEsc(p)}</li>`).join('')}</ul></details>`;
  }).join('');
  const toutesVideosOk = lvls.every(l=>{ const d = tpLevelData(tema,l); const co = d && (d.activites||[]).find(a=>a.comp==='co'); return !co || (co.video && co.video.verification && co.video.verification.statut==='verifiee'); });

  const pilotage = `<div class="tp-pilot">
    <p class="tp-rappel-title">🛠️ Pilotage du thème « ${tema.titre_fr} »</p>
    <p style="margin:4px 0 10px;">Statut : <b class="${statut==='publie'?'tp-ok':'tp-bad'}">${statut==='publie' ? '✅ Publié (visible par les élèves' + (tema.date_debut ? ' à partir du ' + tema.date_debut : '') + ')' : '📝 Brouillon (invisible pour les élèves)'}</b>
      ${statut==='publie'
        ? `<button class="tp-mini-btn" onclick="tpSetPublie('${tema.id}', false)">Repasser en brouillon</button>`
        : `<button class="rec-btn" onclick="tpSetPublie('${tema.id}', true)">📢 Publier ce thème</button>`}</p>
    <p style="margin:0 0 8px;">Situation aujourd'hui : <b>${tpEtatLabel(tpEtatTheme(tema))}</b> — un seul thème est interactif à la fois ; les précédents passent automatiquement en lecture seule.</p>
    ${tpCalendrierSync.etat==='erreur' ? `<p class="tp-warn">⚠️ Le calendrier d'archivage n'a pas pu être publié dans config/temasCalendrier (${tpEsc(tpCalendrierSync.erreur)}). Sans lui, les règles Firestore refuseront les réponses des élèves : vérifie les règles (docs/THEME-PARCOURS.md).</p>` : ''}
    ${!toutesVideosOk && statut!=='publie' ? '<p class="tp-warn">⚠️ Au moins une vidéo n\'est pas marquée « vérifiée ». Regarde-la, complète si besoin les questions (éditeur ci-dessous) et coche « vérifiée » avant de publier.</p>' : ''}
    ${tpConfig.error ? `<p class="tp-warn">⚠️ Lecture de config/temas impossible (${tpEsc(tpConfig.error)}). Le statut et les modifications enregistrés dans l'application ne peuvent pas être pris en compte : vérifie les règles Firestore (voir le README du module).</p>` : ''}
    <p class="tp-rappel-title">✅ Contrôle avant publication</p>${checks}
    <p class="tp-rappel-title" style="margin-top:12px;">👁️ Prévisualiser comme un élève</p>
    <div class="tp-lvl-row">${lvls.map(l=>`<button class="tab-btn ${tpTeacherPreviewLvl===l?'active':''}" onclick="tpTeacherPreview('${l}')">${l}</button>`).join('')}
      ${tpTeacherPreviewLvl ? `<button class="tp-mini-btn" onclick="tpTeacherPreview(null)">Fermer l'aperçu</button>` : ''}</div>
    <div id="tp-teacher-preview"></div>
    <details class="tp-check" ${tpEditorLvl ? 'open' : ''}><summary><b>✏️ Modifier le contenu, la vidéo, créer un thème</b></summary>${tpEditorHTML(tema)}</details>
  </div>`;

  const elevesHTML = studentsData.length ? studentsData.map(s=>{
    const lvl = tpStudentLvl(tema, s);
    const d = tpLevelData(tema, lvl);
    const st = tpStateOf(s, tema.id);
    const acts = d ? d.activites : [];
    const nb = acts.filter(a=>tpActDone(a, st)).length;
    const sc = d ? tpScore(d, st) : {ok:0,total:0,attente:0,valides:0,aRevoir:0};
    const aCorriger = sc.attente - sc.valides - sc.aRevoir;
    const review = (s.temas && s.temas[tema.id] && s.temas[tema.id].review) || null;
    return `<div class="teacher-entry">
      <div class="who">${tpEsc(s.prenom)} ${tpEsc(s.nom)} · <span style="color:var(--ok)">Parcours ${lvl}</span>${s.niveauTheme ? ' <span class="tp-dim">(forcé)</span>' : ''}${s.niveau ? ` <span class="tp-dim">— niveau attribué ${tpEsc(s.niveau)}</span>` : ''}${temaRouvertPour(tema.id, s) ? ' · <b style="color:var(--ok)">🔓 rouvert</b>' : ''}</div>
      <div class="meta">Progression : <b>${nb}/${acts.length}</b> activités · auto : ${sc.ok}/${sc.total} ${aCorriger>0 ? `· <b style="color:var(--bad)">🕓 ${aCorriger} réponse(s) à corriger</b>` : ''} ${review && review.note ? `· 📝 ${tpEsc(review.note)}` : ''}</div>
      <div class="teacher-entry-actions"><button onclick="toggleTemaReview('${s.id}')">${openTemaReviewId===s.id ? 'Fermer' : '👁️ Voir, corriger & noter'}</button></div>
      ${openTemaReviewId === s.id ? tpTeacherReviewHTML(s, tema, lvl, d, st) : ''}
    </div>`;
  }).join('') : '<p class="teacher-empty">Aucun élève inscrit pour le moment.</p>';

  body.innerHTML = `<div class="tema-week-tabs">${tpTeacherWeeksHTML()}</div>${pilotage}
    <div class="storage-note">🍅 Suivi des élèves — le parcours utilisé est celui du niveau attribué (C1/C2 → B2), sauf si tu forces un niveau de thème (ex. A0) dans la fiche de l'élève.</div>${elevesHTML}`;
  if(tpTeacherPreviewLvl) tpMountTeacherPreview(tema, tpTeacherPreviewLvl);
}
function tpStateOf(s, temaId){
  const v2 = (s.temas && s.temas[temaId] && s.temas[temaId].v2) || {};
  return {r: v2.r||{}, a: v2.a||{}, fb: v2.fb||{}, niveau: v2.niveau};
}
function tpStudentLvl(tema, s){
  const v2 = s.temas && s.temas[tema.id] && s.temas[tema.id].v2;
  if(v2 && v2.niveau && !s.niveauTheme && tpLevelData(tema, v2.niveau)) return v2.niveau;
  return tpNiveauPour(tema, s.niveau, s.niveauTheme);
}
function tpTeacherPreview(lvl){
  tpTeacherPreviewLvl = lvl;
  renderTeacherTemas();
  if(lvl){ const z = document.getElementById('tp-teacher-preview'); if(z && z.scrollIntoView) z.scrollIntoView({behavior:'smooth', block:'start'}); }
}
function tpMountTeacherPreview(tema, lvl, draftData){
  const zone = document.getElementById('tp-teacher-preview'); if(!zone) return;
  const data = tpLevelData(tema, lvl, draftData);
  const prevKeys = tpCtx && tpCtx.mode==='prof' && tpCtx.tema.id===tema.id ? tpCtx.showKeys : false;
  tpCtx = {tema, lvl, data, preview:true, showKeys:prevKeys, state: tpPreviewState(tema.id + (draftData?'_draft':''), lvl), container: zone, mode:'prof', draft: !!draftData};
  tpCtx.actIdx = tpActIdxMemo[`${tema.id}_${lvl}`] || 0;
  tpDraw();
}

/* Fiche de correction d'un élève */
function tpTeacherReviewHTML(s, tema, lvl, d, st){
  if(!d) return '<p class="teacher-empty">Pas de contenu pour ce niveau.</p>';
  const review = (s.temas && s.temas[tema.id] && s.temas[tema.id].review) || {};
  const acts = (d.activites||[]).map((a,ai)=>{
    const its = tpItemsOf(a);
    if(!its.length) return `<p class="tp-dim">${ai+1}. ${a.titre_fr} — ${st.a[a.id] && st.a[a.id].done ? '✅ lu' : '⬜'}</p>`;
    const rows = its.map((it,ii)=>{
      const r = st.r[it.id]; const fb = st.fb[it.id] || {};
      let rep = '<span class="tp-dim">— pas encore répondu</span>';
      if(r && r.v != null) rep = tpFormatAnswer(it, r);
      let etat = '';
      if(r && r.st==='auto') etat = r.ok ? '<span class="tp-ok">✔ auto</span>' : '<span class="tp-bad">✘ auto</span>';
      else if(r && r.st==='attente') etat = fb.verdict==='valide' ? '<span class="tp-ok">🟢 validé</span>' : fb.verdict==='a_revoir' ? '<span class="tp-bad">↺ à revoir</span>' : '<span class="tp-bad">🕓 à corriger</span>';
      else if(r && r.st==='avis') etat = '🗨️ avis';
      else if(r && r.st==='brouillon') etat = '<span class="tp-dim">✏️ brouillon</span>';
      const needsTeacher = r && (r.st==='attente' || r.st==='avis' || r.st==='auto');
      const fid = `${s.id}__${it.id}`.replace(/[^a-zA-Z0-9_-]/g,'_');
      return `<div class="tp-rev-item">
        <p class="tp-rev-q"><b>${ai+1}.${ii+1}</b> ${it.q || it.consigne || ''} ${etat} ${r && r.n>1 ? `<span class="tp-dim">(${r.n} essais)</span>` : ''}</p>
        <div class="tp-rev-a">${rep}</div>
        <p class="tp-dim">Attendu : ${tpSolutionHTML(it, true) || '—'}</p>
        ${needsTeacher ? `<div class="tp-rev-fb"><input type="text" id="tpfb-${fid}" value="${tpEsc(fb.c||'')}" placeholder="Commentaire pour l'élève (optionnel)">
          <button onclick="tpSaveFb('${s.id}','${it.id}','valide','${fid}')">✓ Valider</button>
          <button onclick="tpSaveFb('${s.id}','${it.id}','a_revoir','${fid}')" style="background:var(--bad);">↺ À retravailler</button>
          ${fb.verdict ? `<span class="tp-dim">enregistré : ${fb.verdict==='valide'?'validé':'à revoir'}</span>` : ''}</div>` : ''}
      </div>`;
    }).join('');
    return `<details class="tp-check" ${its.some(it=>st.r[it.id] && st.r[it.id].st==='attente' && !(st.fb[it.id]&&st.fb[it.id].verdict)) ? 'open' : ''}><summary>${(TP_COMP[a.comp]||{}).icone||''} ${ai+1}. ${a.titre_fr} — ${tpStatusLabel(tpActStatus(a, st))}</summary>${rows}</details>`;
  }).join('');
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">🍅 ${tema.titre_fr} — ${tpEsc(s.prenom)} ${tpEsc(s.nom)} · parcours ${lvl}</p>
    <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Niveau du thème pour cet élève :
      <select id="tpniv-${s.id}" onchange="tpSetNiveauTheme('${s.id}', this.value)" style="margin-left:6px; padding:4px 6px;">
        <option value="">Niveau attribué (${tpEsc(s.niveau||'—')})</option>
        ${TP_NIVEAUX.map(l=>`<option value="${l}" ${s.niveauTheme===l?'selected':''}>${l}</option>`).join('')}
      </select></label>
    <p class="tp-dim">Forcer un niveau (ex. A0) s'applique à tous les thèmes « parcours ». Les réponses déjà données restent attachées au niveau où elles ont été faites.</p>
    ${tpReouvertureHTML(s, tema.id)}
    ${acts}
    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; align-items:center;">
      <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Note globale
        <input type="text" id="temanote-${s.id}" value="${review.note != null ? tpEsc(review.note) : ''}" placeholder="ex: 16/20" style="width:90px; margin-left:6px; padding:6px 8px; border:1px solid var(--line); border-radius:6px; font-size:13px;">
      </label>
    </div>
    <textarea id="temacomment-${s.id}" placeholder="Commentaire global pour l'élève (optionnel)" style="width:100%; min-height:60px; margin-top:8px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;">${tpEsc(review.comment || '')}</textarea>
    <div class="teacher-entry-actions" style="margin-top:8px;">
      <button onclick="saveTemaReview('${s.id}')">Enregistrer la note</button>
      <button onclick="toggleTemaReview('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}
function tpFormatAnswer(it, r){
  const v = r.v;
  switch(it.type){
    case 'qcm': return tpEsc(it.options[v] != null ? it.options[v].replace(/<[^>]+>/g,'') : v);
    case 'trous': return (v||[]).map((x,i)=>`(${i+1}) <b>${tpEsc(x)}</b>${r.det ? (r.det[i] ? ' ✔' : ' ✘') : ''}`).join(' · ');
    case 'association': return (it.paires||[]).map((p,i)=>`${p[0]} → ${tpEsc((it.paires[(v||[])[i]]||[])[1] || '?')}${r.det ? (r.det[i] ? ' ✔' : ' ✘') : ''}`).join('<br>');
    case 'choix_justif': return `Choix : <b>${tpEsc((it.options[(v||{}).choix]||'').replace(/<[^>]+>/g,''))}</b> ${r.okChoix ? '✔' : '✘'}<br>Justification : <span class="tp-pre">${tpEsc((v||{}).justif)}</span>`;
    case 'oral': return v && v.url ? `<audio class="rec-audio" controls src="${tpEsc(v.url)}"></audio> <a class="source-link" href="${tpEsc(v.url)}" target="_blank" rel="noopener">Ouvrir sur le Drive</a>` : '—';
    default: return `<span class="tp-pre">${tpEsc(v)}</span>${it.min_mots ? ` <span class="tp-dim">(${tpMots(v)} mots)</span>` : ''}`;
  }
}
async function tpSaveFb(studentId, itemId, verdict, fid){
  const el = document.getElementById('tpfb-'+fid);
  const c = el ? el.value.trim() : '';
  try{
    await db.collection('eleves').doc(studentId).update({
      [`temas.${teacherTemaSelectedId}.v2.fb.${itemId}`]: {verdict, c, ts: new Date().toISOString()}
    });
    const s = studentsData.find(x=>x.id===studentId);
    if(s){ s.temas = s.temas||{}; s.temas[teacherTemaSelectedId] = s.temas[teacherTemaSelectedId]||{}; const t = s.temas[teacherTemaSelectedId]; t.v2 = t.v2||{}; t.v2.fb = t.v2.fb||{}; t.v2.fb[itemId] = {verdict, c}; }
    renderTeacherTemas();
  }catch(e){ alert("Impossible d'enregistrer la correction : " + (e && e.message ? e.message : e)); }
}
async function tpSetNiveauTheme(studentId, lvl){
  try{
    await db.collection('eleves').doc(studentId).update({niveauTheme: lvl || firebase.firestore.FieldValue.delete()});
    const s = studentsData.find(x=>x.id===studentId); if(s){ if(lvl) s.niveauTheme = lvl; else delete s.niveauTheme; }
    renderTeacherTemas();
  }catch(e){ alert("Impossible d'enregistrer le niveau : " + (e && e.message ? e.message : e)); }
}

/* ---- Écriture de config/temas (professeure uniquement) ---- */
async function tpWriteConfig(patch){
  await db.collection('config').doc('temas').set(patch, {merge:true});
}
async function tpSetPublie(temaId, publie){
  const t = getTema(temaId);
  if(publie){
    const lvls = tpNiveauxDisponibles(t);
    const pbs = lvls.flatMap(l => tpCheckLevel(t, l).pb.map(p => `${l} : ${p}`));
    if(pbs.length && !confirm(`Points encore à vérifier :\n\n- ${pbs.slice(0,12).join('\n- ')}${pbs.length>12?'\n…':''}\n\nPublier quand même ?`)) return;
  }
  try{
    await tpWriteConfig({themes:{[temaId]:{publie, majPublie: new Date().toISOString()}}});
    tpConfig.themes[temaId] = {...tpThemeCfg(temaId), publie};
    await tpSyncCalendrier();
    renderTeacherTemas();
  }catch(e){ alert("Impossible d'enregistrer la publication (règles Firestore de config/temas ?) : " + (e && e.message ? e.message : e)); }
}

function tpEditorHTML(tema){
  const lvls = TP_NIVEAUX;
  const lvl = tpEditorLvl || (tpNiveauxDisponibles(tema)[0] || 'A1');
  const cfg = tpThemeCfg(tema.id);
  const key = `${tema.id}_${lvl}`;
  const current = tpLevelData(tema, lvl);
  const txt = tpEditorDraft[key] != null ? tpEditorDraft[key] : (current ? JSON.stringify(current, null, 2) : '');
  const vcfg = (cfg.videos||{})[lvl] || {};
  const co = current && (current.activites||[]).find(a=>a.comp==='co');
  return `<div class="tp-editor">
    <div class="tp-lvl-row">${lvls.map(l=>`<button class="tab-btn ${l===lvl?'active':''}" onclick="tpEditorSetLvl('${l}')">${l}</button>`).join('')}</div>
    <p class="tp-rappel-title">🎬 Vidéo de compréhension orale (${lvl})</p>
    <p class="tp-dim">Actuelle : ${co && co.video ? `${tpEsc(co.video.label)} (${tpEsc(co.video.id)}) — ${co.video.verification && co.video.verification.statut==='verifiee' ? '✅ vérifiée' : '⚠️ non vérifiée'}` : 'aucune'}</p>
    <div class="tp-form-row">
      <input type="text" id="tpv-id" placeholder="Lien ou identifiant YouTube" value="${tpEsc(vcfg.id || (co && co.video ? co.video.id : ''))}">
      <input type="text" id="tpv-label" placeholder="Titre affiché" value="${tpEsc(vcfg.label || (co && co.video ? co.video.label : ''))}">
    </div>
    <label class="tp-dim"><input type="checkbox" id="tpv-ok" ${(co && co.video && co.video.verification && co.video.verification.statut==='verifiee') ? 'checked' : ''}> J'ai regardé la vidéo en entier et toutes les questions de l'activité correspondent à son contenu.</label>
    <input type="text" id="tpv-note" placeholder="Note de vérification (ex. vérifiée le 20/10 avec les sous-titres)" value="${tpEsc(vcfg.note||'')}" style="width:100%; margin-top:6px;">
    <div class="teacher-entry-actions"><button onclick="tpSaveVideo('${tema.id}','${lvl}')">Enregistrer la vidéo</button></div>
    <p class="tp-dim">⚠️ Si tu changes de vidéo, pense à adapter les questions de l'activité « Compréhension orale » dans l'éditeur ci-dessous.</p>

    <p class="tp-rappel-title" style="margin-top:14px;">🧾 Contenu du niveau ${lvl} (activités, questions, corrigés, objectifs)</p>
    <p class="tp-dim">Format JSON. Tu peux ajouter/supprimer des activités et des exercices, changer les consignes, les réponses acceptées (<code>accept</code>), les explications, la durée (<code>duree</code>) et les objectifs grammaticaux (<code>grammaire</code>). Ne change pas l'<code>id</code> d'un exercice auquel des élèves ont déjà répondu. Types : qcm, court, trous (« ___ » + blancs), association (paires), ordre (unites), mixte (accept + modele), choix_justif, ouverte (min_mots, avis), oral.</p>
    <textarea id="tp-json" class="tp-json" spellcheck="false" oninput="tpEditorDraft['${key}']=this.value">${tpEsc(txt)}</textarea>
    <p id="tp-json-msg" class="tp-dim"></p>
    <div class="teacher-entry-actions">
      <button onclick="tpEditorCheck('${tema.id}','${lvl}')">Vérifier</button>
      <button onclick="tpEditorPreview('${tema.id}','${lvl}')">👁️ Prévisualiser ce brouillon</button>
      <button onclick="tpEditorSave('${tema.id}','${lvl}')">💾 Enregistrer pour les élèves</button>
      ${cfg.contenu && cfg.contenu[lvl] ? `<button style="background:var(--grey);" onclick="tpEditorReset('${tema.id}','${lvl}')">↺ Revenir au contenu d'origine</button>` : ''}
    </div>
    <p class="tp-rappel-title" style="margin-top:14px;">➕ Créer le thème d'une nouvelle semaine</p>
    <p class="tp-dim">Crée une copie de ce thème (tous niveaux, en <b>brouillon</b>) que tu modifies ensuite niveau par niveau avec l'éditeur.</p>
    <div class="tp-form-row">
      <input type="text" id="tpn-titre" placeholder="Titre (FR)"><input type="text" id="tpn-titre-pt" placeholder="Título (PT)">
      <input type="date" id="tpn-date" title="Date de début (visible à partir de)"><input type="text" id="tpn-periode" placeholder="Période (ex. 26 octobre → 1er novembre 2026)">
    </div>
    <div class="teacher-entry-actions"><button onclick="tpCreateTheme('${tema.id}')">Créer le brouillon</button></div>
  </div>`;
}
function tpEditorSetLvl(l){ tpEditorLvl = l; renderTeacherTemas(); }
function tpParseEditor(){
  const ta = document.getElementById('tp-json'); const msg = document.getElementById('tp-json-msg');
  try{
    const d = JSON.parse(ta.value);
    const errs = [];
    if(!Array.isArray(d.activites) || !d.activites.length) errs.push('"activites" doit être une liste non vide.');
    const ids = new Set();
    (d.activites||[]).forEach((a,i)=>{
      if(!a.id) errs.push(`Activité ${i+1} sans id.`);
      if(!TP_COMP[a.comp]) errs.push(`Activité ${a.id||i+1} : comp inconnu « ${a.comp} ».`);
      (a.items||[]).forEach(it=>{ const e = tpValidateItem(it); if(e) errs.push(`${it.id||'?'} : ${e}`); if(ids.has(it.id)) errs.push(`id en double : ${it.id}`); ids.add(it.id); });
    });
    if(errs.length){ msg.innerHTML = '<span class="tp-bad">❌ ' + errs.map(tpEsc).join('<br>') + '</span>'; return null; }
    msg.innerHTML = '<span class="tp-ok">✅ JSON valide.</span>';
    return d;
  }catch(e){ msg.innerHTML = `<span class="tp-bad">❌ JSON invalide : ${tpEsc(e.message)}</span>`; return null; }
}
function tpEditorCheck(){ tpParseEditor(); }
function tpEditorPreview(temaId, lvl){
  const d = tpParseEditor(); if(!d) return;
  tpTeacherPreviewLvl = lvl;
  const t = getTema(temaId);
  tpMountTeacherPreview(t, lvl, d);
  const z = document.getElementById('tp-teacher-preview'); if(z && z.scrollIntoView) z.scrollIntoView({behavior:'smooth', block:'start'});
}
async function tpEditorSave(temaId, lvl){
  const d = tpParseEditor(); if(!d) return;
  const str = JSON.stringify(d);
  if(str.length > 200000){ alert('Contenu trop volumineux (> 200 Ko).'); return; }
  if(!confirm(`Enregistrer ce contenu pour le niveau ${lvl} ? ${tpStatut(getTema(temaId))==='publie' ? 'Le thème est PUBLIÉ : les élèves verront la modification immédiatement.' : 'Le thème est en brouillon.'}`)) return;
  try{
    await tpWriteConfig({themes:{[temaId]:{contenu:{[lvl]: str}}}});
    tpConfig.themes[temaId] = tpThemeCfg(temaId); tpConfig.themes[temaId].contenu = {...(tpConfig.themes[temaId].contenu||{}), [lvl]: str};
    delete tpEditorDraft[`${temaId}_${lvl}`];
    renderTeacherTemas();
  }catch(e){ alert("Impossible d'enregistrer (règles Firestore de config/temas ?) : " + (e && e.message ? e.message : e)); }
}
async function tpEditorReset(temaId, lvl){
  if(!confirm(`Revenir au contenu d'origine pour ${lvl} ? Tes modifications enregistrées seront supprimées.`)) return;
  try{
    await db.collection('config').doc('temas').update({[`themes.${temaId}.contenu.${lvl}`]: firebase.firestore.FieldValue.delete()});
    if(tpConfig.themes[temaId] && tpConfig.themes[temaId].contenu) delete tpConfig.themes[temaId].contenu[lvl];
    delete tpEditorDraft[`${temaId}_${lvl}`];
    renderTeacherTemas();
  }catch(e){ alert("Impossible : " + (e && e.message ? e.message : e)); }
}
function tpYoutubeId(s){
  s = String(s||'').trim();
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if(m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : '';
}
async function tpSaveVideo(temaId, lvl){
  const id = tpYoutubeId(document.getElementById('tpv-id').value);
  if(!id){ alert('Lien ou identifiant YouTube invalide.'); return; }
  const v = {id, label: document.getElementById('tpv-label').value.trim(), verifiee: document.getElementById('tpv-ok').checked,
             note: document.getElementById('tpv-note').value.trim(), date: new Date().toISOString()};
  try{
    await tpWriteConfig({themes:{[temaId]:{videos:{[lvl]: v}}}});
    tpConfig.themes[temaId] = tpThemeCfg(temaId); tpConfig.themes[temaId].videos = {...(tpConfig.themes[temaId].videos||{}), [lvl]: v};
    renderTeacherTemas();
  }catch(e){ alert("Impossible d'enregistrer la vidéo : " + (e && e.message ? e.message : e)); }
}
async function tpCreateTheme(fromId){
  const titre = document.getElementById('tpn-titre').value.trim();
  const titrePt = document.getElementById('tpn-titre-pt').value.trim();
  const date = document.getElementById('tpn-date').value;
  const periode = document.getElementById('tpn-periode').value.trim();
  if(!titre || !date || !periode){ alert('Titre, date de début et période sont obligatoires.'); return; }
  const id = `${slug(titre)}-${date}`;
  if(temasSemanas.some(t=>t.id===id)){ alert('Un thème avec cet identifiant existe déjà.'); return; }
  const src = getTema(fromId);
  const niveaux = {};
  tpNiveauxDisponibles(src).forEach(l => { niveaux[l] = tpLevelData(src, l); });
  const t = {id, version:2, statut:'brouillon', date_debut: date, periode, titre_fr: titre, titre_pt: titrePt || titre,
             sub_fr: src.sub_fr || '', sub_pt: src.sub_pt || '', niveaux};
  /* Les vidéos du thème source ne sont pas reprises comme « vérifiées ». */
  Object.values(niveaux).forEach(d => (d.activites||[]).forEach(a => { if(a.video) a.video.verification = {statut:'a_valider', note:'Copiée d\'un autre thème — à remplacer et vérifier'}; }));
  const str = JSON.stringify(t);
  try{
    await tpWriteConfig({nouveaux:{[id]: str}, themes:{[id]:{publie:false}}});
    tpConfig.nouveaux[id] = str; tpConfig.themes[id] = {publie:false};
    temasSemanas.push(t);
    await tpSyncCalendrier();
    teacherTemaSelectedId = id; tpEditorLvl = null; tpTeacherPreviewLvl = null;
    renderTeacherTemas();
    alert('Brouillon créé. Modifie maintenant chaque niveau avec l\'éditeur (le contenu copié est un modèle à remplacer).');
  }catch(e){ alert("Impossible de créer le thème : " + (e && e.message ? e.message : e)); }
}


/* ---------------------------------------------------------------------------------------------
   6. ARCHIVAGE : CALENDRIER POUR LES RÈGLES FIRESTORE + RÉOUVERTURE PAR LA PROFESSEURE
   --------------------------------------------------------------------------------------------- */
/* Les règles Firestore ne peuvent pas lire le code de l'application : la professeure publie
   donc dans config/temasCalendrier, pour chaque thème publié, sa période d'activité
   {debut, fin} (horodatages). Un thème est « en cours » de son début jusqu'au début du thème
   publié suivant (même règle que temaCourantId). Le calendrier est recalculé et republié
   automatiquement à chaque connexion de la professeure, à chaque publication et à chaque
   création de thème : un thème préparé à l'avance (date_debut future) prend donc le relais
   tout seul à minuit UTC de sa date de début, même si personne ne se connecte. */
function tpDebutMs(t){ return t.date_debut ? Date.parse(t.date_debut + 'T00:00:00Z') : 0; }
function tpCalendrier(){
  const pub = temasSemanas.filter(t => tpStatut(t) !== 'brouillon');
  const periodes = {};
  pub.forEach((t, i) => {
    const debut = tpDebutMs(t);
    const suivants = pub.slice(i + 1).map(tpDebutMs);
    const fin = suivants.length ? Math.min(...suivants) : null;
    periodes[t.id] = {debut, fin};
  });
  return periodes;
}
let tpCalendrierSync = {etat:'inconnu', erreur:null};
async function tpSyncCalendrier(){
  if(!db || !isTeacher) return;
  const periodes = tpCalendrier();
  const signature = JSON.stringify(periodes);
  try{
    const ref = db.collection('config').doc('temasCalendrier');
    const doc = await ref.get();
    if(doc.exists && doc.data().signature === signature){ tpCalendrierSync = {etat:'ok', erreur:null}; return; }
    const TS = firebase.firestore.Timestamp;
    const data = {};
    Object.keys(periodes).forEach(id => {
      data[id] = {debut: TS.fromDate(new Date(periodes[id].debut)), fin: periodes[id].fin == null ? null : TS.fromDate(new Date(periodes[id].fin))};
      /* Thème attribué à certains élèves seulement (Pédagogie › Thèmes › Parcours) : les règles
         Firestore n'acceptent alors que les réponses de ces élèves. */
      if(Array.isArray(periodes[id].eleves)) data[id].eleves = periodes[id].eleves;
    });
    await ref.set({periodes: data, signature, maj: new Date().toISOString()});
    tpCalendrierSync = {etat:'ok', erreur:null};
  }catch(e){
    console.error('Calendrier des thèmes non publié :', e);
    tpCalendrierSync = {etat:'erreur', erreur:(e && e.message) || String(e)};
  }
}
/* Situation d'un thème aujourd'hui : "en_cours" | "archive" | "a_venir" | "brouillon". */
function tpEtatTheme(t){
  if(tpStatut(t) === 'brouillon') return 'brouillon';
  if(t.id === temaCourantId()) return 'en_cours';
  return tpDebutMs(t) > Date.now() ? 'a_venir' : 'archive';
}
function tpEtatLabel(e){ return {en_cours:'🟢 En cours (interactif)', archive:'🗄️ Archivé (lecture seule)', a_venir:'⏳ À venir', brouillon:'📝 Brouillon'}[e] || e; }

/* Bloc de réouverture exceptionnelle d'un thème archivé, pour un élève (fiche élève). */
function tpReouvertureHTML(s, temaId){
  const t = getTema(temaId);
  const etat = tpEtatTheme(t);
  if(etat !== 'archive') return `<p class="tp-dim">Situation du thème : ${tpEtatLabel(etat)}.</p>`;
  const ouvert = temaRouvertPour(temaId, s);
  return `<div class="tp-reopen ${ouvert ? 'on' : ''}">
    ${ouvert ? '🔓 <b>Thème rouvert pour cet élève</b> — il peut de nouveau répondre et modifier ses réponses.' : '🗄️ Thème archivé : l\'élève le consulte en lecture seule.'}
    <button onclick="tpSetRouvert('${s.id}','${temaId}', ${ouvert ? 'false' : 'true'})">${ouvert ? '🔒 Refermer' : '🔓 Rouvrir exceptionnellement'}</button>
  </div>`;
}
async function tpSetRouvert(studentId, temaId, ouvrir){
  if(ouvrir && !confirm('Rouvrir ce thème archivé pour cet élève ? Il pourra de nouveau répondre et modifier ses réponses jusqu\'à ce que tu le refermes.')) return;
  try{
    await db.collection('eleves').doc(studentId).update({[`temasRouverts.${temaId}`]: ouvrir ? true : firebase.firestore.FieldValue.delete()});
    const s = studentsData.find(x => x.id === studentId);
    if(s){ s.temasRouverts = s.temasRouverts || {}; if(ouvrir) s.temasRouverts[temaId] = true; else delete s.temasRouverts[temaId]; }
    renderTeacherTemas();
  }catch(e){ alert('Impossible de modifier l\'accès : ' + (e && e.message ? e.message : e)); }
}
