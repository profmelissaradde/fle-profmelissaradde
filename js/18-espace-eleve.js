/* ======================= ESPACE ÉLÈVE : ACCUEIL, PROFIL, EXERCICES, RESSOURCES =======================
   accueil     résumé personnalisé : prochain cours, annonce, thème en cours, priorités, forfait
   profil      « Mon profil » modifiable (champs autorisés uniquement — voir firestore.rules)
   exercices   activités du thème en cours, résultats et corrections des thèmes passés
   ressources  bibliothèque de liens choisis par Melissa (collection « ressources »)
   + onglet professeure Pédagogie › Ressources (ajout, modification, ordre, publication). */

/* ---------------------------------------------------------------------------
   AVATARS (illustrations simples, aucun stockage de photo)
   --------------------------------------------------------------------------- */
const AVATARS = {
  feuille: {bg:'#DCE7E0', fg:'#3E5A50', svg:'<path d="M7 17c0-6 4-10 10-10 0 6-4 10-10 10z"/><path d="M7 17l6-6"/>'},
  soleil:  {bg:'#FBF0DC', fg:'#8A5A12', svg:'<circle cx="12" cy="12" r="3.5"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"/>'},
  vague:   {bg:'#E6EDF5', fg:'#3D5A80', svg:'<path d="M4 10c2-2 4-2 6 0s4 2 6 0 3-2 4-1"/><path d="M4 15c2-2 4-2 6 0s4 2 6 0 3-2 4-1"/>'},
  montagne:{bg:'#E7EDE8', fg:'#3E5A50', svg:'<path d="M3 18l6-9 4 6 2-3 6 6z"/>'},
  etoile:  {bg:'#F3E8E3', fg:'#8C5A4B', svg:'<path d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8 7.4 18.3l.9-5.2L4.5 9.5l5.2-.7z"/>'},
  fleur:   {bg:'#F6E4E8', fg:'#9A4F63', svg:'<circle cx="12" cy="12" r="2"/><path d="M12 10c-2-4 2-6 2-3M14 12c4-2 6 2 3 2M12 14c2 4-2 6-2 3M10 12c-4 2-6-2-3-2"/>'},
  livre:   {bg:'#DCE8F5', fg:'#1F3A5F', svg:'<path d="M5 6.5c2.5-1 5-1 7 .5 2-1.5 4.5-1.5 7-.5V18c-2.5-1-5-1-7 .5-2-1.5-4.5-1.5-7-.5z"/><path d="M12 7v11.5"/>'},
  lune:    {bg:'#EEF0F3', fg:'#2A3340', svg:'<path d="M16.5 15.5A6 6 0 0 1 9 6a6.5 6.5 0 1 0 7.5 9.5z"/>'}
};
function profilAvatarHTML(s, taille){
  s = s || {};
  const a = AVATARS[s.avatar];
  const init = (((s.prenom||'').trim()[0] || '') + ((s.nom||'').trim()[0] || '')).toUpperCase() || '•';
  if(a) return `<span class="avatar ${taille||''}" style="background:${a.bg};color:${a.fg}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${a.svg}</svg></span>`;
  return `<span class="avatar ${taille||''}" aria-hidden="true">${esc(init)}</span>`;
}
function avatarChoixHTML(name, actuel){
  const opt = (v, inner, label) => `<label class="avatar-opt"><input type="radio" name="${name}" value="${v}" ${actuel===v || (!actuel && v==='') ? 'checked' : ''}><span class="sr-only">${label}</span>${inner}</label>`;
  return opt('', `<span class="avatar md" aria-hidden="true">${esc(navInitials())}</span>`, 'Initiales')
    + Object.keys(AVATARS).map(k => opt(k, profilAvatarHTML({avatar:k}, 'md'), 'Avatar ' + k)).join('');
}

/* Langue d'interface : français seul = traductions portugaises masquées. */
function eleveAppliquerLangue(){
  document.body.classList.toggle('sans-pt', !isTeacher && student && student.langue === 'fr');
}
onAfterRender(eleveAppliquerLangue);

/* Champs du profil chargés après la connexion (afterAuth ne garde que l'essentiel). */
let eleveProfilCharge = false;
async function eleveChargerProfil(force){
  if(isTeacher || !student || !student.uid) return;
  if(eleveProfilCharge && !force) return;
  try{
    const d = await db.collection('eleves').doc(student.uid).get();
    if(d.exists){
      const r = d.data();
      ['nomAffiche','avatar','langue','objectifs','preferences','notifications','apparence','timezone','whatsappCode','telephone','country','niveau','frequence','pack','prenom','nom']
        .forEach(k => { if(r[k] !== undefined) student[k] = r[k]; });
      eleveProfilCharge = true;
      if(student.apparence && typeof apparenceChoisirTheme === 'function'){ try{ localStorage.setItem('fle-theme', student.apparence); }catch(e){} apparenceAppliquer((plateforme.data||{}).apparence || {}); }
      eleveAppliquerLangue();
      renderSidebar();
    }
  }catch(e){ /* non bloquant */ }
}
onAfterRender(()=>{ if(!isTeacher && student && student.uid && !eleveProfilCharge && auth.currentUser) eleveChargerProfil(); });

/* ---------------------------------------------------------------------------
   ACCUEIL
   --------------------------------------------------------------------------- */
function eleveThemeCourant(){
  try{
    const id = (typeof temaCourantId === 'function' && temaCourantId()) || temaMostRecentVisibleId();
    const t = getTema(id);
    return temaEstVisibleEleve(t) ? t : null;
  }catch(e){ return null; }
}
function eleveProgression(tema){ return profThemeProgress({temas: student.temas, niveau, niveauTheme: student.niveauTheme}, tema); }
function renderAccueil(){
  const c = document.getElementById('content'); if(!c) return;
  const pack = student.pack || {};
  const total = Number(pack.total) || 0;
  c.innerHTML = `
    <div class="hello">${profilAvatarHTML(student, 'lg')}<div><p class="eyebrow">Niveau ${esc(niveau)} · Accueil</p><h1 class="page-title">Bonjour ${esc(student.nomAffiche || student.prenom || '')} 👋</h1></div></div>
    <div id="announcement-banner"></div>
    <div id="pack-payment-banner"></div>
    <section class="dash-grid" aria-label="Mon tableau de bord">
      <div class="dash-next-course" id="next-course-banner"><div class="ui-skeleton" style="height:96px"></div></div>
      <article class="dash-card dash-theme" id="dash-theme-card" aria-live="polite"><h2>Thème de la semaine</h2><div class="ui-skeleton" style="height:22px;width:70%"></div></article>
      <article class="dash-card" id="dash-todo-card"><h2>À faire</h2><div class="ui-skeleton" style="height:60px"></div></article>
      ${total ? `<article class="dash-card" id="dash-forfait-card"><h2>Mon forfait</h2><div class="ui-skeleton" style="height:48px"></div></article>`
      : `<article class="dash-card"><h2>Mes cours</h2><p class="dash-main">Réserver un cours</p><p class="dash-sub">Choisis un créneau dans le calendrier.</p>
        <button class="btn btn-secondary" type="button" onclick="goReserver()">Voir les créneaux</button></article>`}
      <article class="dash-card"><h2>Mes dossiers</h2><p class="dash-main">Niveau ${esc(niveau)}</p><p class="dash-sub">Continue ton dossier là où tu t'es arrêté(e).</p>
        <button class="btn btn-secondary" type="button" onclick="goDossiers()">Voir mes dossiers</button></article>
      <article class="dash-card" id="dash-prof-card" hidden></article>
    </section>`;
  if(typeof loadNextCourseBanner === 'function') loadNextCourseBanner().then(()=>{ const el = document.getElementById('next-course-banner'); if(el && !el.innerHTML.trim()) el.innerHTML = `<article class="dash-card"><h2>Prochain cours</h2><p class="dash-sub">Aucun cours réservé pour le moment.</p><button class="btn" type="button" onclick="goReserver()">Réserver un cours</button></article>`; });
  if(typeof renderAnnouncementBanner === 'function') renderAnnouncementBanner();
  if(typeof renderPackPaymentBanner === 'function') renderPackPaymentBanner();
  accueilRemplir();
}
/* Solde du forfait de l'élève connecté (ses propres séances, lecture autorisée par les règles). */
async function eleveForfaitBilan(){
  if(isTeacher || !student || !student.uid || !(student.pack && Number(student.pack.total))) return null;
  try{
    const snap = await db.collection('disponibilites').where('reservedBy', '==', student.uid).get();
    return forfaitBilan(student, snap.docs.map(d=>({id:d.id, ...d.data()})));
  }catch(e){ return null; }
}
function eleveForfaitCarteHTML(b){
  const pct = b.total ? Math.min(100, Math.round(100 * b.utilisees / b.total)) : 0;
  return `<h2>Mon forfait</h2>
    <p class="dash-main">${b.restantes} séance${b.restantes>1?'s':''} restante${b.restantes>1?'s':''}</p>
    <div class="dash-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${b.total}" aria-valuenow="${b.utilisees}" aria-label="${b.utilisees} séances utilisées sur ${b.total}"><span style="width:${pct}%"></span></div>
    <p class="dash-sub">${b.utilisees} / ${b.total} utilisées${b.programmees ? ` · ${b.programmees} programmée${b.programmees>1?'s':''}` : ''}${b.anomalies ? ` · ${b.anomalies} à reprogrammer (non décomptée${b.anomalies>1?'s':''})` : ''}</p>
    ${b.reservables ? `<button class="btn btn-secondary" type="button" onclick="goReserver()">Voir mes cours</button>` : ''}`;
}
async function accueilRemplir(){
  try{ await Promise.all([(typeof tpLoadConfig === 'function' && !tpConfig.loaded) ? tpLoadConfig() : null, plateformeCharger()]); }catch(e){}
  if(screen !== 'accueil') return;
  const pc = document.getElementById('dash-prof-card');
  const prof = (plateforme.data && plateforme.data.profil) || {};
  if(pc && prof.presentation){
    pc.innerHTML = `<h2>Ta professeure</h2><div class="hello sm">${profilAvatarHTML({prenom:'Melissa', nom:'Radde', avatar: prof.avatar}, 'md')}<p class="dash-main">${esc(prof.nomAffiche || 'Melissa Radde')}</p></div><p class="dash-sub">${esc(prof.presentation)}</p>`;
    pc.hidden = false;
  }
  const card = document.getElementById('dash-theme-card');
  const tema = eleveThemeCourant();
  if(card){
    if(!tema) card.innerHTML = `<h2>Thème de la semaine</h2><p class="dash-sub">Pas de thème en cours cette semaine. Tu peux revoir les thèmes précédents.</p><button class="btn btn-secondary" type="button" onclick="goTemas()">Voir les thèmes</button>`;
    else {
      const p = eleveProgression(tema);
      const pct = p.total ? Math.round(100 * p.done / p.total) : 0;
      const label = p.done === 0 ? 'Commencer' : (p.done >= p.total ? 'Revoir' : 'Continuer');
      card.innerHTML = `<h2>Thème de la semaine</h2><p class="dash-main">${tema.titre_fr}</p><p class="dash-sub">${esc(tema.periode || '')}</p>
        ${typeof cheminMiniHTML === 'function' ? cheminMiniHTML(tema) : ''}
        <div class="dash-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.done}" aria-label="Progression du thème"><span style="width:${pct}%"></span></div>
        <p class="dash-sub">${p.done} / ${p.total} étapes terminées</p>
        <button class="btn" type="button" onclick="goTemas()">${label} →</button>`;
    }
  }
  const todo = document.getElementById('dash-todo-card');
  if(todo){
    const items = [];
    if(tema){
      const p = eleveProgression(tema);
      if(p.done < p.total) items.push(`<li><button type="button" class="todo-link" onclick="goTemas()">${uiIcon('route')}<span>Avancer dans « ${esc(tema.titre_fr)} » (${p.total - p.done} étape${p.total-p.done>1?'s':''})</span></button></li>`);
    }
    const corr = exercicesCorrections().filter(x => x.verdict === 'a_revoir').length;
    if(corr) items.push(`<li><button type="button" class="todo-link" onclick="screen='exercices'; render()">${uiIcon('pen')}<span>${corr} réponse${corr>1?'s':''} à revoir après correction</span></button></li>`);
    const unread = navUnreadEleve();
    if(unread) items.push(`<li><button type="button" class="todo-link" onclick="goMessages()">${uiIcon('chat')}<span>${unread} message${unread>1?'s':''} de Melissa</span></button></li>`);
    /* Forfait : solde réel calculé à partir des séances (20-forfaits.js). */
    const fb = await eleveForfaitBilan();
    if(fb){
      fb.seances.filter(x => x.etat === 'report_propose').forEach(x => items.unshift(`<li><button type="button" class="todo-link" onclick="document.getElementById('next-course-banner').scrollIntoView({behavior:'smooth'})">${uiIcon('calendar')}<span>Melissa te propose une nouvelle date pour ton cours du ${fmtSlotDate(x.s.date)} : confirme ou refuse</span></button></li>`));
      const sansProp = fb.seances.filter(x => x.etat === 'anomalie').length;
      if(sansProp) items.push(`<li><span class="todo-link">${uiIcon('clock')}<span>${sansProp} cours n'${sansProp>1?'ont':'a'} pas eu lieu : ${sansProp>1?'ils restent':'il reste'} dans ton forfait, Melissa va te proposer une nouvelle date.</span></span></li>`);
      if(['termine','a_renouveler'].includes(fb.statut)) items.push(`<li><button type="button" class="todo-link" onclick="goMessages()">${uiIcon('wallet')}<span>${fb.statut === 'termine' ? 'Ton forfait est terminé' : 'Toutes les séances de ton forfait sont programmées'} : parle du renouvellement avec Melissa</span></button></li>`);
      const fc = document.getElementById('dash-forfait-card');
      if(fc) fc.innerHTML = eleveForfaitCarteHTML(fb);
    }
    todo.innerHTML = `<h2>À faire</h2>${items.length ? `<ul class="todo-simple">${items.join('')}</ul>` : `<p class="dash-sub">${uiIcon('check')} Tout est à jour. Bravo !</p>`}`;
  }
}
registerScreen('accueil', renderAccueil);

/* « Mes dossiers » : les bannières (prochain cours, annonce, paiement) sont maintenant sur l'accueil. */
(function(){
  const base = window.renderDossiers;
  if(typeof base !== 'function') return;
  window.renderDossiers = function(){
    base.apply(this, arguments);
    ['announcement-banner','next-course-banner','pack-payment-banner'].forEach(id=>{ const el = document.getElementById(id); if(el && !isTeacher) el.remove(); });
  };
})();

/* ---------------------------------------------------------------------------
   MON PROFIL
   --------------------------------------------------------------------------- */
const PROFIL_RYTHMES = [['', '— Non précisé —'], ['regulier', 'Régulier (chaque semaine)'], ['intensif', 'Intensif'], ['libre', 'À mon rythme']];
const PROFIL_FOCUS = [['', '— Non précisé —'], ['oral', "L'oral (parler, comprendre)"], ['ecrit', "L'écrit"], ['grammaire', 'La grammaire'], ['vocabulaire', 'Le vocabulaire'], ['pro', 'Le français professionnel']];
async function renderProfilEleve(){
  const c = document.getElementById('content'); if(!c) return;
  c.innerHTML = '<p class="teacher-empty" role="status">Chargement…</p>';
  await eleveChargerProfil(true);
  if(screen !== 'profil') return;
  const s = student, pack = s.pack || {}, prefs = s.preferences || {}, notif = s.notifications || {};
  const total = Number(pack.total) || 0;
  const opts = (liste, v) => liste.map(([k,l]) => `<option value="${k}" ${v===k?'selected':''}>${l}</option>`).join('');
  const tema = niveau ? eleveThemeCourant() : null;
  const prog = tema ? eleveProgression(tema) : null;
  const theme = s.apparence || apparenceThemeUtilisateur();
  c.innerHTML = `
    <div class="hello">${profilAvatarHTML(s, 'lg')}<div><p class="eyebrow">Mon espace</p><h1 class="page-title">Mon profil</h1></div></div>
    <section class="dash-grid" aria-label="Mon parcours">
      <article class="dash-card"><h2>Niveau</h2><p class="dash-main">${s.niveau ? esc(s.niveau) : 'En cours d\'attribution'}</p><p class="dash-sub">Attribué par ta professeure.</p></article>
      ${prog ? `<article class="dash-card"><h2>Thème en cours</h2><p class="dash-main">${prog.done} / ${prog.total}</p><p class="dash-sub">${tema.titre_fr}</p></article>` : ''}
      <article class="dash-card" id="profil-forfait-card"><h2>Forfait</h2>${total ? '<div class="ui-skeleton" style="height:40px"></div>' : '<p class="dash-sub">Aucun forfait en cours.</p>'}</article>
      ${s.frequence ? `<article class="dash-card"><h2>Rythme</h2><p class="dash-main">${s.frequence} séance${s.frequence>1?'s':''} / semaine</p></article>` : ''}
    </section>
    <form class="settings-card" id="profil-form" onsubmit="event.preventDefault(); profilEnregistrer()" novalidate>
      <h2>Mes informations</h2>
      <fieldset class="avatar-picker"><legend>Avatar</legend>${avatarChoixHTML('pf-avatar', s.avatar || '')}</fieldset>
      <div class="form-grid">
        <div class="field"><label for="pf-prenom">Prénom</label><input id="pf-prenom" type="text" maxlength="60" autocomplete="given-name" required value="${esc(s.prenom||'')}"></div>
        <div class="field"><label for="pf-nom">Nom</label><input id="pf-nom" type="text" maxlength="60" autocomplete="family-name" required value="${esc(s.nom||'')}"></div>
        <div class="field"><label for="pf-affiche">Nom d'affichage <span class="tp-dim">(facultatif)</span></label><input id="pf-affiche" type="text" maxlength="40" value="${esc(s.nomAffiche||'')}" placeholder="ex. ${esc(s.prenom||'Ana')}"></div>
        <div class="field"><label for="pf-email">E-mail de connexion</label><input id="pf-email" type="email" value="${esc(s.email||'')}" disabled aria-describedby="pf-email-aide"><p class="field-help" id="pf-email-aide">Pour changer d'adresse, écris à Melissa.</p></div>
        <div class="field"><label for="pf-wa">Indicatif WhatsApp</label><select id="pf-wa">${whatsappCodeOptions(s.whatsappCode || '+55')}</select></div>
        <div class="field"><label for="pf-tel">Numéro WhatsApp</label><input id="pf-tel" type="tel" maxlength="20" autocomplete="tel-national" inputmode="tel" value="${esc(s.telephone||'')}"></div>
        <div class="field"><label for="pf-tz">Fuseau horaire</label><select id="pf-tz" aria-describedby="pf-tz-aide">${timezoneOptions(s.timezone)}</select><p class="field-help" id="pf-tz-aide">Utilisé pour l'heure de tes cours et des rappels.</p></div>
        <div class="field"><label for="pf-langue">Langue de la plateforme</label><select id="pf-langue">${opts([['fr-pt','Français avec traductions en portugais'],['fr','Français uniquement']], s.langue || 'fr-pt')}</select></div>
      </div>
      <h2>Mes objectifs et préférences</h2>
      <div class="field"><label for="pf-obj">Mes objectifs d'apprentissage</label><textarea id="pf-obj" rows="3" maxlength="1000" placeholder="ex. Passer un entretien d'embauche en français, voyager…">${esc(s.objectifs||'')}</textarea></div>
      <div class="form-grid">
        <div class="field"><label for="pf-rythme">Rythme préféré</label><select id="pf-rythme">${opts(PROFIL_RYTHMES, prefs.rythme || '')}</select></div>
        <div class="field"><label for="pf-focus">Ce que je veux travailler en priorité</label><select id="pf-focus">${opts(PROFIL_FOCUS, prefs.focus || '')}</select></div>
      </div>
      <h2>Notifications et affichage</h2>
      <p class="field-help">Tu reçois automatiquement : un e-mail de rappel 24 h avant chaque cours (avec les boutons confirmer, annuler ou reporter), les e-mails de proposition de report, et les annonces de Melissa sur ton accueil.</p>
      <label class="check-row"><input type="checkbox" id="pf-notif-wa" ${notif.whatsapp === false ? '' : 'checked'}> Melissa peut me contacter sur WhatsApp</label>
      <div class="field"><label for="pf-theme">Mode d'affichage</label><select id="pf-theme">${opts([['clair','Clair'],['sombre','Sombre'],['auto',"Comme mon appareil"]], theme)}</select></div>
      <p class="form-err" id="pf-err" role="alert"></p>
      <div class="btn-row"><button type="submit" class="btn" id="pf-save">Enregistrer mes informations</button></div>
    </form>
    <section class="settings-card"><h2>Mot de passe</h2>
      <p class="page-intro">Pour ta sécurité, le changement se fait par e-mail : tu recevras un lien pour choisir un nouveau mot de passe.</p>
      <button type="button" class="btn btn-secondary" onclick="profilMotDePasse()">Recevoir le lien par e-mail</button></section>
    <h2 class="section-title">Mes dossiers</h2>
    <div id="profil-dossiers"></div>`;
  if(typeof window.profilDossiersHTML === 'function') document.getElementById('profil-dossiers').innerHTML = window.profilDossiersHTML(s);
  if(total){ const fb = await eleveForfaitBilan(); const el = document.getElementById('profil-forfait-card'); if(el && fb) el.innerHTML = eleveForfaitCarteHTML(fb) + (pack.paymentStatus === 'paid' ? '<p class="dash-sub">Paiement reçu.</p>' : ''); }
}
registerScreen('profil', ()=>{ if(!isTeacher) renderProfilEleve(); });

async function profilEnregistrer(){
  const v = id => ((document.getElementById(id) || {}).value || '').trim();
  const err = document.getElementById('pf-err');
  const prenom = v('pf-prenom'), nom = v('pf-nom'), tel = v('pf-tel');
  const pb = [];
  if(!prenom) pb.push('Le prénom est obligatoire.');
  if(!nom) pb.push('Le nom est obligatoire.');
  if(tel && !/^[0-9 ()+.-]{6,20}$/.test(tel)) pb.push('Le numéro WhatsApp ne doit contenir que des chiffres (6 à 20 caractères).');
  if(pb.length){ if(err) err.textContent = pb.join(' '); return; }
  if(err) err.textContent = '';
  const maj = {
    prenom: prenom.slice(0,60), nom: nom.slice(0,60), nomAffiche: v('pf-affiche').slice(0,40),
    whatsappCode: v('pf-wa').slice(0,8), telephone: tel.slice(0,20), timezone: v('pf-tz').slice(0,60),
    langue: v('pf-langue') === 'fr' ? 'fr' : 'fr-pt', objectifs: v('pf-obj').slice(0,1000),
    preferences: {rythme: v('pf-rythme').slice(0,20), focus: v('pf-focus').slice(0,20)},
    notifications: {whatsapp: !!(document.getElementById('pf-notif-wa') || {}).checked},
    apparence: ['clair','sombre','auto'].includes(v('pf-theme')) ? v('pf-theme') : 'clair',
    avatar: ((document.querySelector('input[name="pf-avatar"]:checked') || {}).value || '').slice(0,20)
  };
  const champs = Object.keys(maj).filter(k => JSON.stringify(maj[k]) !== JSON.stringify(student[k] === undefined ? (k === 'langue' ? 'fr-pt' : (k==='nomAffiche'||k==='objectifs'||k==='avatar'||k==='telephone' ? '' : undefined)) : student[k]));
  if(!champs.length){ uiNotify('Aucune modification à enregistrer.', 'info'); return; }
  const sensibles = champs.filter(k => ['prenom','nom'].includes(k));
  if(sensibles.length && !confirm("Ton prénom ou ton nom va changer. Il sera utilisé dans les prochains e-mails et réservations (les cours déjà réservés gardent l'ancien nom). Continuer ?")) return;
  const btn = document.getElementById('pf-save'); if(btn){ btn.disabled = true; btn.textContent = 'Enregistrement…'; }
  try{
    const upd = {};
    champs.forEach(k => { upd[k] = maj[k]; });
    upd.profilMaj = {at: firebase.firestore.FieldValue.serverTimestamp(), champs};
    await db.collection('eleves').doc(student.uid).update(upd);
    champs.forEach(k => { student[k] = maj[k]; });
    apparenceChoisirTheme(maj.apparence);
    journaliser('profil', 'Profil modifié par l\'élève', {champs});
    uiNotify('Tes informations sont enregistrées.', 'success');
    render();
  }catch(e){
    console.error(e);
    if(err) err.textContent = "L'enregistrement n'a pas pu se faire. Vérifie ta connexion et réessaie ; si le problème continue, écris à Melissa.";
  }finally{ if(btn){ btn.disabled = false; btn.textContent = 'Enregistrer mes informations'; } }
}
async function profilMotDePasse(){
  if(!student.email){ uiNotify("Aucune adresse e-mail n'est associée à ce compte.", 'error'); return; }
  if(!confirm(`Envoyer un lien de changement de mot de passe à ${student.email} ?`)) return;
  try{ await auth.sendPasswordResetEmail(student.email); uiNotify(`E-mail envoyé à ${student.email}. Pense à vérifier les spams.`, 'success'); }
  catch(e){ uiNotify("L'e-mail n'a pas pu être envoyé pour le moment. Réessaie dans quelques minutes.", 'error'); }
}

/* ---------------------------------------------------------------------------
   MES EXERCICES
   --------------------------------------------------------------------------- */
/* Corrections de Melissa sur les thèmes au format parcours (verdict + commentaire). */
function exercicesCorrections(){
  const res = [];
  Object.keys(student.temas || {}).forEach(id=>{
    const t = student.temas[id], fb = t && t.v2 && t.v2.fb;
    if(!fb) return;
    Object.keys(fb).forEach(itemId => res.push({temaId:id, itemId, verdict: fb[itemId].verdict, c: fb[itemId].c || ''}));
  });
  return res;
}
function renderExercices(){
  const c = document.getElementById('content'); if(!c) return;
  if(typeof tpLoadConfig === 'function' && !tpConfig.loaded){
    c.innerHTML = '<p class="teacher-empty" role="status">Chargement…</p>';
    tpLoadConfig().then(()=>{ if(screen === 'exercices') renderExercices(); });
    return;
  }
  const courant = eleveThemeCourant();
  let html = `<p class="eyebrow">Mon parcours</p><h1 class="page-title">Mes exercices</h1>`;
  if(courant && tpIsV2(courant)){
    const lvl = tpNiveauPour(courant, niveau, student.niveauTheme);
    const st = tpStudentState(courant.id);
    const data = tpLevelData(courant, (st.niveau && tpLevelData(courant, st.niveau)) ? st.niveau : lvl);
    const acts = data ? data.activites : [];
    const lab = {afaire:['À faire',''], encours:['Commencée','badge-info'], fait:['Terminée','badge-success'], attente:['En attente de correction','badge-warning'], valide:['Validée par Melissa','badge-success']};
    html += `<h2 class="section-title">${courant.titre_fr} <span class="badge badge-success">En cours</span></h2>
      <ul class="exo-list">${acts.map((a,i)=>{ const s = tpActStatus(a, st); const l = lab[s] || [s,''];
        return `<li><button type="button" class="exo-row" onclick="exercicesOuvrir('${courant.id}', ${i})"><span class="exo-ic" aria-hidden="true">${(TP_COMP[a.comp]||{}).icone || '•'}</span>
          <span class="exo-t">${a.titre_fr || (TP_COMP[a.comp]||{}).fr}<span class="tp-dim">${esc(a.dur || '')}</span></span><span class="badge ${l[1]}">${l[0]}</span></button></li>`; }).join('')}</ul>`;
  } else if(courant){
    html += `<h2 class="section-title">${courant.titre_fr} <span class="badge badge-success">En cours</span></h2>
      <div class="teacher-entry"><div class="meta">4 activités : compréhension orale, compréhension écrite, expression écrite, expression orale.</div><div class="teacher-entry-actions"><button type="button" onclick="goTemas()">Ouvrir le thème</button></div></div>`;
  } else {
    html += profEmptyHTML('route', 'Pas de thème en cours', 'Le prochain thème apparaîtra ici dès sa publication.');
  }
  const passes = temasSemanasVisiveisEleve().filter(t => !courant || t.id !== courant.id).slice().reverse();
  html += `<h2 class="section-title">Mes résultats</h2>`;
  html += passes.length ? `<div class="table-wrap"><table class="ui-table"><thead><tr><th scope="col">Thème</th><th scope="col">Étapes</th><th scope="col">Exercices corrigés automatiquement</th><th scope="col">Note / avis de Melissa</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody>
    ${passes.map(t=>{
      const p = eleveProgression(t);
      let auto = '—', avis = '—';
      const tt = (student.temas || {})[t.id] || {};
      if(tpIsV2(t)){
        const st = {r:(tt.v2&&tt.v2.r)||{}, a:(tt.v2&&tt.v2.a)||{}, fb:(tt.v2&&tt.v2.fb)||{}};
        const d = tpLevelData(t, (tt.v2 && tt.v2.niveau) || tpNiveauPour(t, niveau, student.niveauTheme));
        if(d){ const sc = tpScore(d, st); if(sc.total) auto = `${sc.ok} / ${sc.total}`; if(sc.attente) avis = `${sc.valides} validée(s)${sc.aRevoir ? `, ${sc.aRevoir} à revoir` : ''}${sc.attente - sc.valides - sc.aRevoir > 0 ? `, ${sc.attente - sc.valides - sc.aRevoir} en attente` : ''}`; }
      } else {
        const ok = ['co','ce'].filter(k => tt[k] && tt[k].done && tt[k].correct).length, faits = ['co','ce'].filter(k => tt[k] && tt[k].done).length;
        if(faits) auto = `${ok} / ${faits}`;
        if(tt.review && (tt.review.note || tt.review.comment)) avis = esc([tt.review.note, tt.review.comment].filter(Boolean).join(' — '));
      }
      return `<tr><td>${t.titre_fr}<br><span class="tp-dim">${esc(t.periode || '')}</span></td><td>${p.done} / ${p.total}</td><td>${auto}</td><td>${avis}</td>
        <td><button type="button" class="btn btn-secondary btn-sm" onclick="goTemaWeek('${t.id}')">Revoir</button></td></tr>`;
    }).join('')}</tbody></table></div>` : profEmptyHTML('trophy', 'Pas encore de résultats', 'Tes résultats des thèmes terminés s\'afficheront ici.');
  const corr = exercicesCorrections().filter(x => x.c);
  if(corr.length){
    html += `<h2 class="section-title">Commentaires de Melissa</h2>${corr.slice(-10).reverse().map(x=>`<div class="teacher-entry"><div class="who">${esc(getTema(x.temaId).titre_fr)} <span class="badge ${x.verdict==='valide'?'badge-success':'badge-warning'}">${x.verdict==='valide'?'Validé':'À revoir'}</span></div><div class="meta">${esc(x.c)}</div></div>`).join('')}`;
  }
  c.innerHTML = html;
}
function exercicesOuvrir(temaId, idx){
  temaSelectedId = temaId; screen = 'temas'; render();
  setTimeout(()=>{ if(typeof tpGoAct === 'function' && tpCtx && tpCtx.tema && tpCtx.tema.id === temaId) tpGoAct(idx); }, 50);
}
registerScreen('exercices', renderExercices);

/* ---------------------------------------------------------------------------
   RESSOURCES
   --------------------------------------------------------------------------- */
const RESSOURCE_TYPES = {document:'Document', video:'Vidéo', audio:'Audio', page:'Page web', exercice:'Exercice en ligne'};
function ressourceUrlValide(u){ try{ const x = new URL(u); return x.protocol === 'https:'; }catch(e){ return false; } }
async function ressourcesCharger(prof){
  let q = db.collection('ressources');
  if(!prof) q = q.where('publie', '==', true);
  const snap = await q.get();
  return snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=> (a.ordre||0) - (b.ordre||0) || String(a.titre).localeCompare(String(b.titre)));
}
function ressourceCarteHTML(r){
  return `<article class="res-card"><span class="badge">${RESSOURCE_TYPES[r.type] || 'Lien'}</span>
    <h3>${esc(r.titre)}</h3>${r.description ? `<p>${esc(r.description)}</p>` : ''}
    <p class="tp-dim">${r.niveaux && r.niveaux.length ? 'Niveaux ' + r.niveaux.map(esc).join(', ') : 'Tous niveaux'}</p>
    <a class="btn btn-secondary btn-sm" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${uiIcon('link')} Ouvrir<span class="sr-only"> ${esc(r.titre)} (nouvel onglet)</span></a></article>`;
}
let ressourcesFiltre = 'tous';
async function renderRessources(){
  const c = document.getElementById('content'); if(!c) return;
  c.innerHTML = `<p class="eyebrow">Mes ressources</p><h1 class="page-title">Ressources</h1><div id="res-zone"><div class="res-grid">${'<div class="ui-skeleton" style="height:140px"></div>'.repeat(3)}</div></div>`;
  let liste = [];
  try{ liste = await ressourcesCharger(false); }
  catch(e){ const z = document.getElementById('res-zone'); if(z) z.innerHTML = '<p class="tp-warn">Les ressources ne peuvent pas être chargées pour le moment.</p>'; return; }
  if(screen !== 'ressources') return;
  liste = liste.filter(r => r.publie !== false && (!r.niveaux || !r.niveaux.length || r.niveaux.includes(niveau)));
  const types = Array.from(new Set(liste.map(r=>r.type).filter(Boolean)));
  const vue = liste.filter(r => ressourcesFiltre === 'tous' || r.type === ressourcesFiltre);
  const z = document.getElementById('res-zone'); if(!z) return;
  z.innerHTML = liste.length ? `${types.length > 1 ? `<div class="ui-filters" role="group" aria-label="Filtrer par type"><button type="button" class="ui-chip" aria-pressed="${ressourcesFiltre==='tous'}" onclick="ressourcesFiltre='tous'; renderRessources()">Tout</button>${types.map(t=>`<button type="button" class="ui-chip" aria-pressed="${ressourcesFiltre===t}" onclick="ressourcesFiltre='${t}'; renderRessources()">${RESSOURCE_TYPES[t] || t}</button>`).join('')}</div>` : ''}
    <div class="res-grid">${vue.map(ressourceCarteHTML).join('')}</div>`
    : profEmptyHTML('library', 'Aucune ressource pour le moment', 'Melissa ajoutera ici des documents, vidéos et liens utiles pour ton niveau.');
}
registerScreen('ressources', renderRessources);

/* Onglet professeure : Pédagogie › Ressources */
let resEditionId = null;
let resListeProf = [];
async function ressourcesProfLoad(){
  const body = profBody(); if(!body) return;
  try{ resListeProf = await ressourcesCharger(true); }
  catch(e){ body.innerHTML = '<p class="tp-warn">Lecture impossible : publie les nouvelles règles Firestore (collection « ressources »).</p>'; return; }
  if(profOnTab('ressources')) ressourcesProfRender();
}
function ressourcesProfRender(){
  const body = profBody(); if(!body) return;
  const r = resListeProf.find(x => x.id === resEditionId) || {titre:'', url:'', type:'document', description:'', niveaux:[], publie:true};
  const niveaux = (typeof niveauxMenu !== 'undefined' ? niveauxMenu.map(n=>n.code) : ['A1','A2','B1','B2','C1','C2']);
  body.innerHTML = `
    <p class="page-intro">Des liens (documents, vidéos, pages) que tes élèves retrouvent dans « Mes ressources », filtrés selon leur niveau. Aucun fichier n'est stocké sur la plateforme.</p>
    <form class="settings-card" onsubmit="event.preventDefault(); ressourceEnregistrer()" novalidate>
      <h2>${resEditionId ? 'Modifier la ressource' : 'Ajouter une ressource'}</h2>
      <div class="form-grid">
        <div class="field"><label for="res-titre">Titre</label><input id="res-titre" type="text" maxlength="120" required value="${esc(r.titre)}"></div>
        <div class="field"><label for="res-url">Lien (https://…)</label><input id="res-url" type="url" maxlength="500" required value="${esc(r.url)}" placeholder="https://"></div>
        <div class="field"><label for="res-type">Type</label><select id="res-type">${Object.keys(RESSOURCE_TYPES).map(k=>`<option value="${k}" ${r.type===k?'selected':''}>${RESSOURCE_TYPES[k]}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label for="res-desc">Description courte</label><textarea id="res-desc" rows="2" maxlength="400">${esc(r.description||'')}</textarea></div>
      <fieldset class="check-group"><legend>Niveaux (aucun coché = tous les niveaux)</legend>${niveaux.map(n=>`<label class="check-row"><input type="checkbox" name="res-niv" value="${n}" ${(r.niveaux||[]).includes(n)?'checked':''}> ${n}</label>`).join('')}</fieldset>
      <label class="check-row"><input type="checkbox" id="res-publie" ${r.publie !== false ? 'checked' : ''}> Visible par les élèves</label>
      <p class="form-err" id="res-err" role="alert"></p>
      <div class="btn-row"><button type="submit" class="btn">${resEditionId ? 'Enregistrer' : 'Ajouter'}</button>${resEditionId ? `<button type="button" class="btn btn-ghost" onclick="resEditionId=null; ressourcesProfRender()">Annuler</button>` : ''}</div>
    </form>
    <h2 class="section-title">Bibliothèque (${resListeProf.length})</h2>
    ${resListeProf.length ? `<ul class="res-admin">${resListeProf.map((x,i)=>`<li class="teacher-entry">
        <div class="who">${esc(x.titre)} <span class="badge">${RESSOURCE_TYPES[x.type] || 'Lien'}</span> ${x.publie === false ? '<span class="badge badge-warning">Masquée</span>' : '<span class="badge badge-success">Visible</span>'}</div>
        <div class="meta">${x.niveaux && x.niveaux.length ? 'Niveaux ' + x.niveaux.map(esc).join(', ') : 'Tous niveaux'} · <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.url).slice(0, 60)}</a></div>
        <div class="teacher-entry-actions">
          <button type="button" onclick="ressourceDeplacer('${x.id}', -1)" ${i===0?'disabled':''} aria-label="Monter ${esc(x.titre)}">↑</button>
          <button type="button" onclick="ressourceDeplacer('${x.id}', 1)" ${i===resListeProf.length-1?'disabled':''} aria-label="Descendre ${esc(x.titre)}">↓</button>
          <button type="button" onclick="resEditionId='${x.id}'; ressourcesProfRender(); window.scrollTo(0,0)">Modifier</button>
          <button type="button" class="del" onclick="ressourceSupprimer('${x.id}')">Supprimer</button></div></li>`).join('')}</ul>`
      : profEmptyHTML('library', 'Aucune ressource', 'Ajoute ton premier lien avec le formulaire ci-dessus.')}`;
}
async function ressourceEnregistrer(){
  const v = id => ((document.getElementById(id) || {}).value || '').trim();
  const err = document.getElementById('res-err');
  const data = {titre: v('res-titre').slice(0,120), url: v('res-url').slice(0,500), type: v('res-type'), description: v('res-desc').slice(0,400),
    niveaux: Array.from(document.querySelectorAll('input[name="res-niv"]:checked')).map(x=>x.value), publie: !!(document.getElementById('res-publie') || {}).checked};
  const pb = [];
  if(!data.titre) pb.push('Le titre est obligatoire.');
  if(!ressourceUrlValide(data.url)) pb.push('Le lien doit commencer par https://');
  if(pb.length){ if(err) err.textContent = pb.join(' '); return; }
  try{
    if(resEditionId){ await db.collection('ressources').doc(resEditionId).update({...data, maj: firebase.firestore.FieldValue.serverTimestamp()}); }
    else { data.ordre = (resListeProf.reduce((m,x)=>Math.max(m, x.ordre||0), 0)) + 1; data.cree = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('ressources').add(data); }
    journaliser('parametres', resEditionId ? 'Ressource modifiée' : 'Ressource ajoutée', {titre: data.titre});
    uiNotify(resEditionId ? 'Ressource modifiée.' : 'Ressource ajoutée.', 'success');
    resEditionId = null;
    ressourcesProfLoad();
  }catch(e){ if(err) err.textContent = "Enregistrement impossible : vérifie que les nouvelles règles Firestore sont publiées."; }
}
async function ressourceDeplacer(id, sens){
  const i = resListeProf.findIndex(x => x.id === id), j = i + sens;
  if(i < 0 || j < 0 || j >= resListeProf.length) return;
  const a = resListeProf[i], b = resListeProf[j];
  try{
    const batch = db.batch();
    batch.update(db.collection('ressources').doc(a.id), {ordre: j + 1});
    batch.update(db.collection('ressources').doc(b.id), {ordre: i + 1});
    resListeProf.forEach((x, k) => { if(k !== i && k !== j && x.ordre !== k + 1) batch.update(db.collection('ressources').doc(x.id), {ordre: k + 1}); });
    await batch.commit();
    ressourcesProfLoad();
  }catch(e){ uiNotify("Réorganisation impossible pour le moment.", 'error'); }
}
async function ressourceSupprimer(id){
  const r = resListeProf.find(x => x.id === id);
  if(!confirm(`Supprimer la ressource « ${r ? r.titre : ''} » ? Les élèves ne la verront plus.`)) return;
  try{ await db.collection('ressources').doc(id).delete(); journaliser('parametres', 'Ressource supprimée', {titre: r && r.titre}); uiNotify('Ressource supprimée.', 'success'); ressourcesProfLoad(); }
  catch(e){ uiNotify('Suppression impossible pour le moment.', 'error'); }
}
registerTeacherTab('ressources', ()=>ressourcesProfLoad());
