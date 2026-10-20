/* ======================= PARAMÈTRES DE LA PLATEFORME =======================
   Un seul document de configuration, modifiable par la professeure uniquement
   (règles Firestore : config/{docId} — lecture élèves connectés, écriture professeure) :

   config/plateforme = {
     tarifs:    {prixCours, remise (0–0,5), forfaitMin, forfaitMax},
     apparence: {palette: "sauge" | "bleu-rose" | "perso", primaire, accent,
                 saison: {actif, nom, accent, debut, fin}},
     regles:    [{titre, texte}],          // texte de la page « Règles & fonctionnement »
     profil:    {nomAffiche, presentation, avatar}
   }
   Sans document (ou champ absent), les valeurs historiques du code s'appliquent : rien ne
   change tant que Melissa ne modifie rien. */

const PLATEFORME_DEFAUTS = {
  tarifs: {prixCours: 87, remise: 0.10, forfaitMin: 5, forfaitMax: 16},
  apparence: {palette: 'sauge', primaire: '', accent: '', saison: {actif:false, nom:'', accent:'', debut:'', fin:''}},
  profil: {nomAffiche: 'Melissa Radde', presentation: '', avatar: ''}
};
const plateforme = {charge:false, chargement:null, data:{}, erreur:null};

/* ---- Couleurs : contraste WCAG ---- */
function clrHex(h){ h = String(h||'').trim(); if(/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h.slice(1).split('').map(c=>c+c).join(''); return /^#[0-9a-f]{6}$/i.test(h) ? h.toUpperCase() : null; }
function clrRgb(h){ h = clrHex(h); return h ? [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)) : null; }
function clrLum(h){ const c = clrRgb(h); if(!c) return 0; const v = c.map(x=>{ x/=255; return x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4); }); return 0.2126*v[0] + 0.7152*v[1] + 0.0722*v[2]; }
function clrContraste(a, b){ const x = clrLum(a), y = clrLum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
function clrMix(a, b, t){ const x = clrRgb(a), y = clrRgb(b); if(!x || !y) return a; return '#' + x.map((v,i)=>Math.round(v*(1-t) + y[i]*t).toString(16).padStart(2,'0')).join('').toUpperCase(); }
/* Assombrit jusqu'à atteindre le contraste demandé sur le fond donné. */
function clrLisible(c, fond, cible){ let x = clrHex(c); for(let i=0; i<20 && x && clrContraste(x, fond) < cible; i++) x = clrMix(x, '#000000', 0.12); return x; }

/* Vérifie une palette personnalisée ; renvoie la liste des problèmes (vide = utilisable). */
function apparenceVerifier(primaire, accent){
  const pb = [];
  const p = clrHex(primaire), a = clrHex(accent);
  if(primaire && !p) pb.push('La couleur principale doit être au format #RRGGBB.');
  if(accent && !a) pb.push("La couleur d'accent doit être au format #RRGGBB.");
  if(p){
    const r = clrContraste(p, '#FFFFFF');
    if(r < 4.5) pb.push(`Couleur principale trop claire : le texte blanc des boutons n'aurait qu'un contraste de ${r.toFixed(1)}:1 (minimum 4,5:1). Choisis une teinte plus foncée.`);
  }
  return pb;
}
/* Variables CSS dérivées d'une couleur principale / d'accent (mode clair). */
function apparenceVariables(primaire, accent){
  const v = {};
  const p = clrHex(primaire), a = clrHex(accent);
  if(p){
    v['--c-primary'] = p;
    v['--c-primary-hover'] = clrMix(p, '#000000', 0.15);
    v['--c-primary-ink'] = clrLisible(p, '#FFFFFF', 7);
    v['--c-primary-soft'] = clrMix(p, '#FFFFFF', 0.82);
    v['--c-strong'] = clrLisible(p, '#FFFFFF', 7);
    v['--focus'] = `0 0 0 3px #F8F7F4, 0 0 0 5px ${clrLisible(p, '#FFFFFF', 7)}`;
  }
  if(a){
    v['--c-rose'] = a;
    v['--c-rose-soft'] = clrMix(a, '#FFFFFF', 0.75);
    v['--c-rose-ink'] = clrLisible(a, '#F8F7F4', 4.6);
  }
  return v;
}

/* ---- Application de l'apparence ---- */
const APP_STYLE_ID = 'apparence-perso';
function apparenceThemeUtilisateur(){
  try{ return localStorage.getItem('fle-theme') || 'clair'; }catch(e){ return 'clair'; }
}
function apparenceAppliquer(app){
  app = app || {};
  const root = document.documentElement;
  const palette = app.palette === 'bleu-rose' ? 'bleu-rose' : 'sauge';
  root.setAttribute('data-palette', palette);
  let theme = (student && student.apparence) || apparenceThemeUtilisateur();
  if(!['clair','sombre','auto'].includes(theme)) theme = 'clair';
  root.setAttribute('data-theme', theme);
  /* Couleurs personnalisées et accent saisonnier : surcharges en mode clair uniquement
     (le thème sombre garde ses couleurs vérifiées). */
  let vars = {};
  if(app.palette === 'perso' && !apparenceVerifier(app.primaire, app.accent).length) vars = apparenceVariables(app.primaire, app.accent);
  const s = app.saison || {};
  const auj = new Date().toISOString().slice(0,10);
  if(s.actif && clrHex(s.accent) && (!s.debut || auj >= s.debut) && (!s.fin || auj <= s.fin)) Object.assign(vars, apparenceVariables(null, s.accent));
  let el = document.getElementById(APP_STYLE_ID);
  if(!el){ el = document.createElement('style'); el.id = APP_STYLE_ID; document.head.appendChild(el); }
  const decl = Object.keys(vars).map(k=>`${k}:${vars[k]};`).join('');
  el.textContent = decl ? `:root[data-theme="clair"]{${decl}} @media (prefers-color-scheme: light){:root[data-theme="auto"]{${decl}}}` : '';
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--c-bg').trim() || '#F8F7F4');
  try{ localStorage.setItem('fle-apparence', JSON.stringify(app)); }catch(e){}
}
/* Dès le chargement (avant connexion) : dernière apparence connue sur cet appareil. */
(function(){
  let app = null;
  try{ app = JSON.parse(localStorage.getItem('fle-apparence') || 'null'); }catch(e){}
  apparenceAppliquer(app || {});
})();
function apparenceChoisirTheme(theme){
  try{ localStorage.setItem('fle-theme', theme); }catch(e){}
  if(student) student.apparence = theme;
  apparenceAppliquer(plateforme.data.apparence || {});
}

/* ---- Chargement de la configuration ---- */
function plateformeVal(chemin){
  const parts = chemin.split('.');
  let v = plateforme.data, d = PLATEFORME_DEFAUTS;
  for(const k of parts){ v = v && v[k]; d = d && d[k]; }
  return v != null && v !== '' ? v : d;
}
function plateformeAppliquerTarifs(){
  const t = Object.assign({}, PLATEFORME_DEFAUTS.tarifs, plateforme.data.tarifs || {});
  PRIX_COURS = Number(t.prixCours) || PLATEFORME_DEFAUTS.tarifs.prixCours;
  FORFAIT_REMISE = Math.min(0.5, Math.max(0, Number(t.remise)));
  FORFAIT_MIN = Math.max(1, parseInt(t.forfaitMin, 10) || PLATEFORME_DEFAUTS.tarifs.forfaitMin);
  FORFAIT_MAX = Math.max(FORFAIT_MIN, parseInt(t.forfaitMax, 10) || PLATEFORME_DEFAUTS.tarifs.forfaitMax);
}
async function plateformeCharger(force){
  if(plateforme.charge && !force) return plateforme.data;
  if(plateforme.chargement && !force) return plateforme.chargement;
  plateforme.chargement = (async ()=>{
    try{
      const doc = await db.collection('config').doc('plateforme').get();
      plateforme.data = doc.exists ? doc.data() : {};
      plateforme.erreur = null;
    }catch(e){ plateforme.data = plateforme.data || {}; plateforme.erreur = (e && e.message) || String(e); }
    plateforme.charge = true; plateforme.chargement = null;
    plateformeAppliquerTarifs();
    apparenceAppliquer(plateforme.data.apparence || {});
    return plateforme.data;
  })();
  return plateforme.chargement;
}
/* Chargée une fois connecté (élève ou professeure). */
onAfterRender(()=>{
  if(!plateforme.charge && !plateforme.chargement && auth.currentUser && student && student.uid && db) plateformeCharger();
});
async function plateformeEnregistrer(patch, libelle){
  await db.collection('config').doc('plateforme').set({...patch, maj: new Date().toISOString()}, {merge:true});
  Object.keys(patch).forEach(k => { plateforme.data[k] = patch[k]; });
  plateformeAppliquerTarifs();
  apparenceAppliquer(plateforme.data.apparence || {});
  journaliser('parametres', libelle, patch);
}

/* ---- Règles affichées aux élèves ---- */
const REGLES_DEFAUT = [
  {titre:'Réservation et replanification', texte:'Les cours sont réservés depuis la plateforme selon les créneaux disponibles. Une demande de déplacement peut être faite tant que le cours est à plus d’une heure de son début.'},
  {titre:'Annulation tardive et absence', texte:'Une annulation ou une absence à moins d’une heure du cours est considérée comme tardive. Deux tolérances sont prévues sur une période de 30 jours.'},
  {titre:'Forfaits', texte:'Les forfaits contiennent entre {FORFAIT_MIN} et {FORFAIT_MAX} séances. Le nombre de séances utilisées et restantes est visible dans « Mon profil ».'},
  {titre:'Suivi pédagogique', texte:'Chaque dossier possède son propre bilan. Lorsqu’un dossier est terminé et évalué, il apparaît comme « Accompli ».'},
  {titre:'Communication', texte:'La messagerie de la plateforme est le point de contact privilégié pour les questions liées aux cours et à l’organisation.'}
];
let reglesEdition = false;
function reglesListe(){
  const r = plateforme.data.regles;
  return Array.isArray(r) && r.length ? r : REGLES_DEFAUT;
}
function reglesTexte(t){ return esc(t).replace(/\{FORFAIT_MIN\}/g, FORFAIT_MIN).replace(/\{FORFAIT_MAX\}/g, FORFAIT_MAX).replace(/\n/g, '<br>'); }
function reglesHTMLPerso(){
  if(!plateforme.charge){ plateformeCharger().then(()=>{ if(screen === 'regles') render(); }); }
  const liste = reglesListe();
  if(isTeacher && reglesEdition){
    return `<p class="eyebrow">Paramètres</p><h1 class="page-title">Modifier les règles affichées</h1>
      <p class="page-intro">Ce texte est affiché aux élèves dans « Mon profil › Règles & fonctionnement ». Il décrit les règles : les modifier ici ne change pas le fonctionnement des réservations (délai d'une heure, tolérances), qui reste celui de la plateforme. Tu peux écrire {FORFAIT_MIN} et {FORFAIT_MAX} pour reprendre les valeurs des tarifs.</p>
      <div id="regles-editeur">${liste.map((r,i)=>reglesBlocEditeur(r, i)).join('')}</div>
      <div class="btn-row"><button type="button" class="btn btn-secondary" onclick="reglesAjouter()">${uiIcon('plus')} Ajouter une rubrique</button></div>
      <div class="btn-row"><button type="button" class="btn" onclick="reglesEnregistrer()">Enregistrer</button>
        <button type="button" class="btn btn-ghost" onclick="reglesEdition=false; render()">Annuler</button>
        <button type="button" class="btn btn-ghost" onclick="reglesReinitialiser()">Revenir au texte d'origine</button></div>`;
  }
  return `<p class="eyebrow">Informations</p><h1 class="page-title">Règles & fonctionnement</h1>
    ${isTeacher ? `<div class="btn-row"><button type="button" class="btn btn-secondary" onclick="reglesEdition=true; render()">${uiIcon('pen')} Modifier ce texte</button></div>` : ''}
    <div class="objectif-box"><p class="fr">Tu trouveras ici les règles utiles pour les cours et l'utilisation de la plateforme. En cas de situation particulière, écris-moi directement dans la messagerie.</p></div>
    ${liste.map(r=>`<div class="teacher-entry"><div class="who">${esc(r.titre)}</div><div class="meta" style="line-height:1.65;margin-top:6px;">${reglesTexte(r.texte)}</div></div>`).join('')}`;
}
function reglesBlocEditeur(r, i){
  return `<fieldset class="regle-bloc"><legend>Rubrique ${i+1}</legend>
    <div class="field"><label for="regle-t-${i}">Titre</label><input id="regle-t-${i}" type="text" maxlength="120" value="${esc(r.titre)}"></div>
    <div class="field"><label for="regle-x-${i}">Texte</label><textarea id="regle-x-${i}" rows="3" maxlength="2000">${esc(r.texte)}</textarea></div>
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('fieldset').remove()">Retirer cette rubrique</button></fieldset>`;
}
function reglesAjouter(){
  const box = document.getElementById('regles-editeur');
  const i = box.querySelectorAll('fieldset').length + Date.now() % 1000;
  box.insertAdjacentHTML('beforeend', reglesBlocEditeur({titre:'', texte:''}, i));
}
async function reglesEnregistrer(){
  const blocs = Array.from(document.querySelectorAll('#regles-editeur fieldset')).map(f=>({
    titre: (f.querySelector('input').value || '').trim().slice(0, 120),
    texte: (f.querySelector('textarea').value || '').trim().slice(0, 2000)
  })).filter(b => b.titre || b.texte);
  if(!blocs.length){ uiNotify('Ajoute au moins une rubrique.', 'warning'); return; }
  try{ await plateformeEnregistrer({regles: blocs}, 'Règles affichées modifiées'); reglesEdition = false; uiNotify('Règles enregistrées.', 'success'); render(); }
  catch(e){ uiNotify("Enregistrement impossible pour le moment (règles Firestore de config ?).", 'error'); }
}
async function reglesReinitialiser(){
  if(!confirm("Remettre le texte d'origine des règles ?")) return;
  try{ await plateformeEnregistrer({regles: []}, "Règles affichées réinitialisées"); reglesEdition = false; render(); }
  catch(e){ uiNotify('Réinitialisation impossible pour le moment.', 'error'); }
}

/* ---- Onglet Paramètres › Réglages ---- */
let paramSection = 'tarifs';
const PARAM_SECTIONS = [['tarifs','Tarifs & forfaits'],['apparence','Apparence'],['profil','Mon profil'],['integrations','Intégrations']];
async function paramLoad(){
  const body = profBody(); if(!body) return;
  await plateformeCharger(true);
  if(profOnTab('parametres')) paramRender();
}
function paramSetSection(id){ paramSection = id; paramRender(); }
function paramRender(){
  const body = profBody(); if(!body) return;
  const nav = `<div class="ui-filters" role="group" aria-label="Sections des réglages">${PARAM_SECTIONS.map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${paramSection===id}" onclick="paramSetSection('${id}')">${l}</button>`).join('')}</div>`;
  let html = '';
  if(plateforme.erreur) html += `<p class="tp-warn">Lecture de config/plateforme impossible (${esc(plateforme.erreur)}). Les valeurs par défaut sont utilisées.</p>`;
  if(paramSection === 'tarifs') html += paramTarifsHTML();
  if(paramSection === 'apparence') html += paramApparenceHTML();
  if(paramSection === 'profil') html += paramProfilHTML();
  if(paramSection === 'integrations') html += paramIntegrationsHTML();
  body.innerHTML = nav + html;
  if(paramSection === 'tarifs') paramTarifsApercu();
  if(paramSection === 'integrations') paramIntegrationsVerifier();
}
registerTeacherTab('parametres', ()=>paramLoad());

function paramTarifsHTML(){
  const t = Object.assign({}, PLATEFORME_DEFAUTS.tarifs, plateforme.data.tarifs || {});
  return `<section class="settings-card" aria-labelledby="tarifs-t"><h2 id="tarifs-t">Tarifs & forfaits</h2>
    <p class="page-intro">Utilisés pour le prix affiché lors de la réservation d'un forfait et pour le montant à encaisser. Les liens de paiement C6 Bank, eux, sont créés chez C6 : pense à les mettre à jour (Finances) si le prix change.</p>
    <div class="form-grid">
      <div class="field"><label for="tar-prix">Prix d'un cours à l'unité (R$)</label><input id="tar-prix" type="number" min="1" step="1" value="${t.prixCours}" oninput="paramTarifsApercu()"></div>
      <div class="field"><label for="tar-remise">Remise sur les forfaits (%)</label><input id="tar-remise" type="number" min="0" max="50" step="1" value="${Math.round(Number(t.remise)*100)}" oninput="paramTarifsApercu()"></div>
      <div class="field"><label for="tar-min">Forfait : nombre minimum de séances</label><input id="tar-min" type="number" min="1" max="60" step="1" value="${t.forfaitMin}" oninput="paramTarifsApercu()"></div>
      <div class="field"><label for="tar-max">Forfait : nombre maximum de séances</label><input id="tar-max" type="number" min="1" max="60" step="1" value="${t.forfaitMax}" oninput="paramTarifsApercu()"></div>
    </div>
    <div id="tar-apercu" class="info-box" aria-live="polite"></div>
    <div class="btn-row"><button type="button" class="btn" onclick="paramTarifsEnregistrer()">Enregistrer les tarifs</button></div></section>`;
}
function paramTarifsLire(){
  const n = id => Number((document.getElementById(id) || {}).value);
  return {prixCours: n('tar-prix'), remise: n('tar-remise')/100, forfaitMin: Math.round(n('tar-min')), forfaitMax: Math.round(n('tar-max'))};
}
function paramTarifsErreurs(t){
  const e = [];
  if(!(t.prixCours > 0)) e.push('Le prix doit être supérieur à 0.');
  if(!(t.remise >= 0 && t.remise <= 0.5)) e.push('La remise doit être comprise entre 0 et 50 %.');
  if(!(t.forfaitMin >= 1)) e.push('Le minimum doit être au moins 1.');
  if(!(t.forfaitMax >= t.forfaitMin)) e.push('Le maximum doit être supérieur ou égal au minimum.');
  return e;
}
function paramTarifsApercu(){
  const el = document.getElementById('tar-apercu'); if(!el) return;
  const t = paramTarifsLire(), err = paramTarifsErreurs(t);
  if(err.length){ el.innerHTML = `<p class="tp-bad">${err.join(' ')}</p>`; return; }
  const ex = Math.min(t.forfaitMax, Math.max(t.forfaitMin, 10));
  const total = t.prixCours * ex * (1 - t.remise);
  el.innerHTML = `Exemple : un forfait de <b>${ex} séances</b> coûtera <b>${profMontant(total)}</b> (au lieu de ${profMontant(t.prixCours*ex)}) ; un cours à l'unité <b>${profMontant(t.prixCours)}</b>.`;
}
async function paramTarifsEnregistrer(){
  const t = paramTarifsLire(), err = paramTarifsErreurs(t);
  if(err.length){ uiNotify(err.join(' '), 'error'); return; }
  const avant = Object.assign({}, PLATEFORME_DEFAUTS.tarifs, plateforme.data.tarifs || {});
  if(!confirm(`Enregistrer les nouveaux tarifs ?\n\nCours : R$ ${avant.prixCours} → R$ ${t.prixCours}\nRemise : ${Math.round(avant.remise*100)} % → ${Math.round(t.remise*100)} %\nForfaits : ${avant.forfaitMin}–${avant.forfaitMax} → ${t.forfaitMin}–${t.forfaitMax} séances`)) return;
  try{ await plateformeEnregistrer({tarifs: t}, 'Tarifs modifiés'); uiNotify('Tarifs enregistrés.', 'success'); paramRender(); }
  catch(e){ uiNotify("Enregistrement impossible pour le moment (règles Firestore de config ?).", 'error'); }
}

function paramApparenceHTML(){
  const a = Object.assign({}, PLATEFORME_DEFAUTS.apparence, plateforme.data.apparence || {});
  const s = Object.assign({}, PLATEFORME_DEFAUTS.apparence.saison, a.saison || {});
  const choix = (v, l, d) => `<label class="choice-card"><input type="radio" name="app-palette" value="${v}" ${a.palette===v?'checked':''} onchange="paramApparenceApercu()"><span class="choice-swatch sw-${v}" aria-hidden="true"></span><span><b>${l}</b><br><span class="tp-dim">${d}</span></span></label>`;
  const theme = apparenceThemeUtilisateur();
  return `<section class="settings-card" aria-labelledby="app-t"><h2 id="app-t">Palette de la plateforme</h2>
    <p class="page-intro">Appliquée à tous les élèves. Les couleurs dont le contraste serait insuffisant sont refusées.</p>
    <div class="choice-grid" role="radiogroup" aria-label="Palette">
      ${choix('sauge','Sauge (par défaut)','Ivoire, sauge, vert doux, rose poudré')}
      ${choix('bleu-rose','Bleu profond & rose','Bleu profond, bleu clair, rose doux, blanc cassé')}
      ${choix('perso','Personnalisée','Tes propres couleurs principale et d\'accent')}
    </div>
    <div class="form-grid" id="app-perso" ${a.palette==='perso' ? '' : 'hidden'}>
      <div class="field"><label for="app-prim">Couleur principale (boutons, liens)</label><input id="app-prim" type="color" value="${clrHex(a.primaire) || '#55786C'}" oninput="paramApparenceApercu()"></div>
      <div class="field"><label for="app-acc">Couleur d'accent (traductions, détails)</label><input id="app-acc" type="color" value="${clrHex(a.accent) || '#D9BDB1'}" oninput="paramApparenceApercu()"></div>
    </div>
    <div id="app-verif" aria-live="polite"></div>
    <h3 class="dash-sub-title">Variation saisonnière (accent uniquement)</h3>
    <div class="form-grid">
      <label class="check-row"><input type="checkbox" id="sai-actif" ${s.actif?'checked':''}> Activer une couleur d'accent temporaire</label>
      <div class="field"><label for="sai-nom">Nom (pour toi)</label><input id="sai-nom" type="text" maxlength="40" value="${esc(s.nom||'')}" placeholder="ex. Automne"></div>
      <div class="field"><label for="sai-acc">Couleur d'accent</label><input id="sai-acc" type="color" value="${clrHex(s.accent) || '#C98F6B'}"></div>
      <div class="field"><label for="sai-debut">Du</label><input id="sai-debut" type="date" value="${esc(s.debut||'')}"></div>
      <div class="field"><label for="sai-fin">Au</label><input id="sai-fin" type="date" value="${esc(s.fin||'')}"></div>
    </div>
    <p class="tp-dim">La couleur de chaque thème de la semaine se choisit dans Pédagogie › Thèmes de la semaine.</p>
    <div class="btn-row"><button type="button" class="btn" onclick="paramApparenceEnregistrer()">Enregistrer l'apparence</button></div>
    </section>
    <section class="settings-card" aria-labelledby="app-mode-t"><h2 id="app-mode-t">Mode d'affichage sur cet appareil</h2>
      <p class="page-intro">Chaque élève choisit le sien dans « Mon profil ».</p>
      <div class="ui-filters" role="group" aria-label="Mode d'affichage">
        ${[['clair','Clair'],['sombre','Sombre'],['auto',"Comme l'appareil"]].map(([v,l])=>`<button type="button" class="ui-chip" aria-pressed="${theme===v}" onclick="apparenceChoisirTheme('${v}'); paramRender()">${l}</button>`).join('')}
      </div></section>`;
}
function paramApparenceLire(){
  const pal = (document.querySelector('input[name="app-palette"]:checked') || {}).value || 'sauge';
  const v = id => (document.getElementById(id) || {}).value || '';
  return {palette: pal, primaire: pal === 'perso' ? v('app-prim') : '', accent: pal === 'perso' ? v('app-acc') : '',
    saison: {actif: !!(document.getElementById('sai-actif') || {}).checked, nom: v('sai-nom').slice(0,40), accent: v('sai-acc'), debut: v('sai-debut'), fin: v('sai-fin')}};
}
function paramApparenceApercu(){
  const a = paramApparenceLire();
  const box = document.getElementById('app-perso'); if(box) box.hidden = a.palette !== 'perso';
  const el = document.getElementById('app-verif'); if(!el) return;
  if(a.palette !== 'perso'){ el.innerHTML = ''; return; }
  const pb = apparenceVerifier(a.primaire, a.accent);
  const v = apparenceVariables(a.primaire, a.accent);
  el.innerHTML = pb.length ? `<p class="tp-bad">${pb.join(' ')}</p>`
    : `<div class="palette-preview" style="--pp:${v['--c-primary']};--pps:${v['--c-primary-soft']};--ppi:${v['--c-primary-ink']};--pr:${v['--c-rose-soft']};--pri:${v['--c-rose-ink']}">
        <span class="pp-btn">Bouton</span><span class="pp-soft">Élément actif</span><span class="pp-pt">🇧🇷 Traduction</span>
        <span class="tp-dim">Contraste du bouton : ${clrContraste(v['--c-primary'], '#FFFFFF').toFixed(1)}:1 ✓</span></div>`;
}
async function paramApparenceEnregistrer(){
  const a = paramApparenceLire();
  const pb = a.palette === 'perso' ? apparenceVerifier(a.primaire, a.accent) : [];
  if(pb.length){ uiNotify(pb.join(' '), 'error'); return; }
  if(a.saison.actif && a.saison.debut && a.saison.fin && a.saison.fin < a.saison.debut){ uiNotify('La date de fin de la variation saisonnière précède la date de début.', 'error'); return; }
  try{ await plateformeEnregistrer({apparence: a}, 'Apparence modifiée'); uiNotify('Apparence enregistrée : elle s\'applique à tous à leur prochaine visite.', 'success'); paramRender(); }
  catch(e){ uiNotify("Enregistrement impossible pour le moment (règles Firestore de config ?).", 'error'); }
}

function paramProfilHTML(){
  const p = Object.assign({}, PLATEFORME_DEFAUTS.profil, plateforme.data.profil || {});
  return `<section class="settings-card" aria-labelledby="pp-t"><h2 id="pp-t">Mon profil de professeure</h2>
    <p class="page-intro">Affiché aux élèves sur leur page d'accueil.</p>
    <div class="field"><label for="pp-nom">Nom affiché</label><input id="pp-nom" type="text" maxlength="80" value="${esc(p.nomAffiche)}"></div>
    <div class="field"><label for="pp-pres">Présentation courte</label><textarea id="pp-pres" rows="3" maxlength="600" placeholder="ex. Professeure de FLE, je t'accompagne…">${esc(p.presentation)}</textarea></div>
    <fieldset class="avatar-picker"><legend>Avatar</legend>${typeof avatarChoixHTML === 'function' ? avatarChoixHTML('pp-av', p.avatar) : ''}</fieldset>
    <div class="btn-row"><button type="button" class="btn" onclick="paramProfilEnregistrer()">Enregistrer</button></div>
    <p class="tp-dim">Ton adresse de connexion (${esc(student.email || '')}) et ton mot de passe se gèrent dans Firebase Authentication.</p></section>`;
}
async function paramProfilEnregistrer(){
  const v = id => ((document.getElementById(id) || {}).value || '').trim();
  const av = (document.querySelector('input[name="pp-av"]:checked') || {}).value || '';
  try{ await plateformeEnregistrer({profil: {nomAffiche: v('pp-nom').slice(0,80) || 'Melissa Radde', presentation: v('pp-pres').slice(0,600), avatar: av}}, 'Profil de la professeure modifié'); uiNotify('Profil enregistré.', 'success'); }
  catch(e){ uiNotify("Enregistrement impossible pour le moment.", 'error'); }
}

function paramIntegrationsHTML(){
  return `<section class="settings-card" aria-labelledby="int-t"><h2 id="int-t">Intégrations</h2>
    <div class="status-list">
      <div class="status-row" id="int-firebase"><b>Firebase (connexion et données)</b><span class="badge">Vérification…</span></div>
      <div class="status-row" id="int-calendrier"><b>Calendrier d'archivage des thèmes (règles Firestore)</b><span class="badge">Vérification…</span></div>
      <div class="status-row" id="int-gas"><b>Google Apps Script (e-mails, Zoom, rappels)</b><span class="badge">Vérification…</span></div>
      <div class="status-row" id="int-zoom"><b>Synchronisations Zoom</b><span class="badge">Vérification…</span></div>
    </div>
    <p class="page-intro">Zoom n'est jamais appelé depuis le navigateur : les identifiants restent dans les propriétés de ton Apps Script. Les profils, niveaux et réponses vivent dans Firestore (protégés par les règles de sécurité) ; les fichiers audio et les notas fiscais dans ton Google Drive.</p>
    <h3 class="dash-sub-title">Automatisations de l'Apps Script</h3>
    <ul class="tp-list">
      <li>Rappel par e-mail 24 h avant chaque cours, avec confirmer / annuler / reporter.</li>
      <li>Annulation automatique des cours non payés.</li>
      <li>Propositions de report et confirmations par e-mail, déplacement de la réunion Zoom.</li>
      <li>Nouvelle tentative de synchronisation Zoom toutes les 10 minutes (déclencheur <code>retryZoomSyncs</code>).</li>
    </ul>
    <p class="tp-dim">Pour modifier ces automatismes (horaires, textes), il faut changer l'Apps Script puis déployer une nouvelle version : voir apps-script/README.md.</p></section>`;
}
async function paramIntegrationsVerifier(){
  const set = (id, ok, txt) => { const el = document.getElementById(id); if(el) el.querySelector('.badge').outerHTML = `<span class="badge ${ok===true?'badge-success':ok===false?'badge-danger':'badge-warning'}">${txt}</span>`; };
  try{ await db.collection('config').doc('temasCalendrier').get(); set('int-firebase', true, 'Connecté'); }
  catch(e){ set('int-firebase', false, 'Lecture refusée'); }
  if(typeof tpCalendrierSync !== 'undefined'){
    set('int-calendrier', tpCalendrierSync.etat === 'ok' ? true : (tpCalendrierSync.etat === 'erreur' ? false : null),
      tpCalendrierSync.etat === 'ok' ? 'Publié' : (tpCalendrierSync.etat === 'erreur' ? 'Non publié' : 'Pas encore vérifié'));
  }
  try{
    const slots = await profLoadSlots();
    const z = slots.filter(s => rptZoomSyncEnCours(s));
    const err = z.filter(s => s.zoomSync.status === 'error').length;
    set('int-zoom', err ? false : true, err ? `${err} en échec` : (z.length ? `${z.length} en cours` : 'Tout est à jour'));
  }catch(e){ set('int-zoom', null, 'Inconnu'); }
  try{
    const r = await Promise.race([callDriveScript({action:'listAvailableSlots'}), new Promise((_, rej)=>setTimeout(()=>rej(new Error('délai dépassé')), 15000))]);
    set('int-gas', !!r, r ? 'Répond' : 'Réponse vide');
  }catch(e){ set('int-gas', false, 'Ne répond pas'); }
}

/* ---- Journal d'activité ---- */
let journalFiltre = 'tous';
const JOURNAL_TYPES = [['tous','Tout'],['erreur','Erreurs'],['seance','Séances'],['paiement','Paiements'],['forfait','Forfaits'],['eleve','Élèves'],['profil','Profils élèves'],['theme','Thèmes'],['annonce','Annonces'],['parametres','Paramètres']];
async function journalLoad(){
  const body = profBody(); if(!body) return;
  let rows = [];
  try{
    const snap = await db.collection('journal').orderBy('ts', 'desc').limit(150).get();
    rows = snap.docs.map(d=>({id:d.id, ...d.data()}));
  }catch(e){ rows = null; }
  if(!profOnTab('journal')) return;
  const liste = rows ? rows.filter(r => journalFiltre === 'tous' || r.type === journalFiltre) : [];
  body.innerHTML = `<p class="page-intro">Les actions sensibles (niveaux, forfaits, paiements, séances déplacées, thèmes, paramètres) et les erreurs techniques sont enregistrées ici automatiquement. Le journal ne peut être ni modifié ni effacé.</p>
    <div class="ui-filters" role="group" aria-label="Filtrer le journal">${JOURNAL_TYPES.map(([id,l])=>`<button type="button" class="ui-chip" aria-pressed="${journalFiltre===id}" onclick="journalFiltre='${id}'; journalLoad()">${l}</button>`).join('')}</div>
    ${rows === null ? '<p class="tp-warn">Le journal ne peut pas être lu : publie les nouvelles règles Firestore (collection « journal »).</p>'
      : (liste.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Date</th><th scope="col">Type</th><th scope="col">Événement</th><th scope="col">Par</th></tr></thead><tbody>
        ${liste.map(r=>`<tr><td>${r.ts && r.ts.toDate ? r.ts.toDate().toLocaleString('fr-FR', {dateStyle:'short', timeStyle:'short'}) : ''}</td><td><span class="badge ${r.type==='erreur'?'badge-danger':''}">${esc(r.type)}</span></td>
          <td>${esc(r.message)}${r.details ? `<details><summary>Détails</summary><code class="code-wrap">${esc(r.details)}</code></details>` : ''}</td><td>${esc(r.parNom || '')}</td></tr>`).join('')}
        </tbody></table></div>` : profEmptyHTML('check', 'Aucun événement', ''))}`;
}
registerTeacherTab('journal', ()=>journalLoad());
