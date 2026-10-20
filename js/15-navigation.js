/* ======================= ARCHITECTURE : RUBRIQUES, NAVIGATION, CONTRÔLE D'ACCÈS =======================
   Source unique de l'organisation de la plateforme. Chaque rubrique déclare ses onglets ; un
   onglet pointe soit vers un écran (screen), soit vers un onglet de l'espace professeure
   (teacherTab). La barre latérale, la barre du haut, la barre inférieure (mobile), les onglets
   de page et le contrôle d'accès sont TOUS calculés à partir de ce modèle : ajouter une
   fonctionnalité = l'ajouter ici, une seule fois.

   Rôles :
     prof          compte de Melissa
     eleve         élève inscrit avec un niveau attribué
     attente       élève inscrit, niveau pas encore attribué
     experimental  élève au stade du cours expérimental (status === 'experimental')
   Les droits correspondent exactement à ceux qui existaient avant la refonte (voir
   docs/ARCHITECTURE.md) ; les règles Firestore restent la vraie barrière de sécurité. */

/* ---- Icônes (jeu unique, au trait, 24×24) ---- */
const UI_ICONS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  calendar:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  book:'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M8 7h8"/>',
  wallet:'<rect x="2.5" y="6" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M16.5 15h1.5"/><path d="M5 6l9.5-3 1.5 3"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  route:'<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  library:'<path d="M4 3v18M8 3v18"/><path d="M12 4.5l4-1 4.5 16.5-4 1z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  flask:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l4-4-4-4M14 12H4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock:'<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  alert:'<path d="M12 3 2 20h20z"/><path d="M12 9.5v4.5M12 17v.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  megaphone:'<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 21h7M9.5 17h5v4h-5z"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'
};
function uiIcon(name, cls){
  return `<svg class="ic ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${UI_ICONS[name] || ''}</svg>`;
}

/* ---- Modèle des espaces ---- */
function navRole(){
  if(isTeacher) return 'prof';
  if(typeof isStudentExperimental === 'function' && isStudentExperimental()) return 'experimental';
  if(!niveau) return 'attente';
  return 'eleve';
}
/* Compteurs affichés dans le menu (calculés ailleurs, lus ici). */
const navCounts = {aTraiter:0};
function navUnreadProf(){ return typeof teacherUnreadTotal === 'function' ? teacherUnreadTotal() : 0; }
function navUnreadEleve(){ return typeof studentUnreadCount !== 'undefined' ? studentUnreadCount : 0; }

const NAV_MODEL = {
  prof: [
    {id:'accueil', label:'Tableau de bord', icon:'home', tabs:[{tab:'accueil', label:"Vue d'ensemble"}]},
    {id:'eleves', label:'Élèves', icon:'users', tabs:[
      {tab:'eleves', label:'Tous les élèves'},
      {tab:'experimental', label:'Cours expérimental'}]},
    {id:'cours', label:'Cours', icon:'calendar', badge:()=>navCounts.aTraiter, tabs:[
      {tab:'dispo', label:'Planning & disponibilités'},
      {tab:'anomalies', label:'Reports & anomalies', badge:()=>navCounts.aTraiter},
      {tab:'historique', label:'Historique & récapitulatifs'}]},
    {id:'pedagogie', label:'Pédagogie', icon:'book', tabs:[
      {tab:'temas', label:'Thèmes de la semaine'},
      {screen:'temas', also:['dossiers','week','bilan'], label:'Aperçu élève', apercu:true},
      {screen:'admin-cours', label:'Dossiers & niveaux'},
      {tab:'rec', label:'Enregistrements'},
      {tab:'ressources', label:'Ressources'},
      {screen:'survie', label:'Phrases de survie'}]},
    {id:'finances', label:'Finances', icon:'wallet', tabs:[{tab:'finances', label:'Forfaits & paiements'}]},
    {id:'communication', label:'Communication', icon:'chat', badge:navUnreadProf, tabs:[
      {tab:'messages', label:'Messages', badge:navUnreadProf},
      {tab:'annonces', label:'Annonces'},
      {screen:'forum', label:'Forum'}]},
    {id:'parametres', label:'Paramètres', icon:'settings', tabs:[
      {tab:'parametres', label:'Réglages'},
      {screen:'regles', label:'Règles affichées'},
      {tab:'journal', label:"Journal d'activité"}]}
  ],
  eleve: [
    {id:'accueil', label:'Accueil', icon:'home', dot:()=>typeof hasUnseenAnnouncement==='function' && hasUnseenAnnouncement(), tabs:[{screen:'accueil', label:'Accueil'}]},
    {id:'parcours', label:'Mon parcours', icon:'route', tabs:[
      {screen:'temas', label:'Thème de la semaine'},
      {screen:'dossiers', also:['week','bilan'], label:'Mes dossiers'}]},
    {id:'cours', label:'Mes cours', icon:'calendar', tabs:[
      {screen:'reserver', label:'Réserver & à venir'},
      {screen:'historique', label:'Historique'}]},
    {id:'exercices', label:'Mes exercices', icon:'pen', tabs:[{screen:'exercices', label:'Mes exercices'}]},
    {id:'ressources', label:'Mes ressources', icon:'library', tabs:[
      {screen:'ressources', label:'Ressources'},
      {screen:'survie', label:'Phrases de survie'}]},
    {id:'messages', label:'Messages', icon:'chat', badge:navUnreadEleve, tabs:[
      {screen:'messages', label:'Messages à Melissa', badge:navUnreadEleve},
      {screen:'forum', label:'Forum'}]},
    {id:'profil', label:'Mon profil', icon:'user', tabs:[
      {screen:'profil', label:'Mon profil'},
      {screen:'regles', label:'Règles & fonctionnement'}]}
  ],
  attente: [
    {id:'accueil', label:'Accueil', icon:'home', tabs:[{screen:'waiting', label:'Accueil'}]},
    {id:'cours', label:'Mes cours', icon:'calendar', tabs:[
      {screen:'reserver', label:'Réserver & à venir'},
      {screen:'historique', label:'Historique'}]},
    {id:'messages', label:'Messages', icon:'chat', badge:navUnreadEleve, tabs:[
      {screen:'messages', label:'Messages à Melissa', badge:navUnreadEleve},
      {screen:'forum', label:'Forum'}]},
    {id:'profil', label:'Mon profil', icon:'user', tabs:[
      {screen:'profil', label:'Mon profil'},
      {screen:'regles', label:'Règles & fonctionnement'}]}
  ],
  experimental: [
    {id:'accueil', label:'Mon cours', icon:'flask', tabs:[{screen:'experimental', label:'Mon cours expérimental'}]},
    {id:'cours', label:'Historique', icon:'calendar', tabs:[{screen:'historique', label:'Historique de mes cours'}]},
    {id:'messages', label:'Messages', icon:'chat', badge:navUnreadEleve, tabs:[{screen:'messages', label:'Messages à Melissa', badge:navUnreadEleve}]},
    {id:'profil', label:'Mon profil', icon:'user', tabs:[
      {screen:'profil', label:'Mon profil'},
      {screen:'regles', label:'Règles & fonctionnement'}]}
  ]
};
/* Écrans de la barre inférieure (mobile), dans l'ordre ; le reste est dans « Plus ». */
const NAV_BOTTOM = {prof:['accueil','eleves','cours','communication'], eleve:['accueil','parcours','cours','messages'],
  attente:['accueil','cours','messages','profil'], experimental:['accueil','cours','messages','profil']};
/* Libellés courts pour la barre inférieure. */
const NAV_SHORT = {accueil:'Accueil', eleves:'Élèves', cours:'Cours', communication:'Messages', parcours:'Parcours',
  messages:'Messages', profil:'Profil', pedagogie:'Pédagogie', finances:'Finances', parametres:'Réglages'};

function navSections(){ return NAV_MODEL[navRole()] || []; }
function navTabMatches(t){
  if(t.tab) return screen === 'teacher' && teacherTab === t.tab;
  return screen === t.screen || (t.also || []).includes(screen);
}
function navCurrent(){
  const secs = navSections();
  for(const s of secs){ for(const t of s.tabs){ if(navTabMatches(t)) return {section:s, tab:t}; } }
  return {section:null, tab:null};
}
function navGo(sectionId, tabIndex){
  const s = navSections().find(x=>x.id===sectionId);
  if(!s) return;
  const t = s.tabs[tabIndex || 0];
  if(t.tab){ teacherTab = t.tab; screen = 'teacher'; }
  else { screen = t.screen; }
  if(typeof closeNavDrawer === 'function') closeNavDrawer(false);
  render();
}
/* Accueil de chaque rôle (après connexion, ou quand un écran n'est pas autorisé). */
function navHome(){
  const r = navRole();
  if(r === 'prof'){ teacherTab = 'accueil'; return 'teacher'; }
  if(r === 'experimental') return 'experimental';
  if(r === 'attente') return 'waiting';
  return 'accueil';
}
function goAccueil(){ screen = navHome(); render(); }

/* ---- Contrôle d'accès (appelé par render avant tout affichage) ---- */
const NAV_PUBLIC = ['login','verify'];
function navAllowedScreens(role){
  const set = new Set();
  (NAV_MODEL[role] || []).forEach(s => s.tabs.forEach(t => { if(t.screen) set.add(t.screen); (t.also||[]).forEach(x=>set.add(x)); }));
  if(role === 'prof') set.add('teacher');
  return set;
}
function navGuard(){
  if(NAV_PUBLIC.includes(screen)) return;
  if(!student || !student.uid){ screen = 'login'; return; }
  const role = navRole();
  if(!navAllowedScreens(role).has(screen)) screen = navHome();
}

/* ---- Barre latérale ---- */
function navInitials(){
  const p = (student.prenom || '').trim(), n = (student.nom || '').trim();
  return ((p[0] || '') + (n[0] || '')).toUpperCase() || '•';
}
function navAvatarHTML(){
  if(typeof profilAvatarHTML === 'function') return profilAvatarHTML(student, 'sm');
  return `<span class="avatar sm" aria-hidden="true">${navInitials()}</span>`;
}
function navRoleLabel(){
  const r = navRole();
  if(r === 'prof') return 'Professeure';
  if(r === 'experimental') return 'Cours expérimental';
  if(r === 'attente') return 'Niveau en cours d\'attribution';
  return 'Niveau ' + niveau;
}
function renderSidebar(){
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  const logged = student && student.prenom && !NAV_PUBLIC.includes(screen) && screen !== 'login';
  if(!logged){
    sb.innerHTML = `<div class="sb-brand"><span class="sb-logo" aria-hidden="true">FLE</span><span>Prof Melissa Radde</span></div>
      <p class="sidebar-foot">🎙️ Les exercices audio sont enregistrés et envoyés directement à ta professeure.</p>`;
    updateNavChrome();
    return;
  }
  const cur = navCurrent();
  const items = navSections().map(s=>{
    const active = cur.section && cur.section.id === s.id;
    const n = s.badge ? s.badge() : 0;
    const dot = s.dot ? s.dot() : false;
    return `<li><button type="button" class="nav-btn sb-item ${active?'active':''}" ${active?'aria-current="page"':''} onclick="navGo('${s.id}')">
        ${uiIcon(s.icon)}<span class="sb-label">${s.label}</span>
        ${n ? `<span class="sb-badge" aria-label="${n} à traiter">${n}</span>` : (dot ? '<span class="sb-dot" aria-label="Nouveau"></span>' : '')}
      </button></li>`;
  }).join('');
  sb.innerHTML = `
    <button type="button" class="nav-btn sidebar-close" onclick="closeNavDrawer(true)">${uiIcon('close')}<span>Fermer le menu</span></button>
    <div class="sb-brand"><span class="sb-logo" aria-hidden="true">FLE</span><span>Prof Melissa Radde</span></div>
    <div class="sb-user">${navAvatarHTML()}<div><b>${esc(student.prenom || '')} ${esc(student.nom || '')}</b><span>${navRoleLabel()}</span></div></div>
    <nav aria-label="Rubriques"><ul class="sb-list">${items}</ul></nav>
    <div class="sb-foot"><button type="button" class="nav-btn sb-item" onclick="goLogin()">${uiIcon('logout')}<span class="sb-label">Se déconnecter</span></button></div>`;
  updateNavChrome();
}

/* ---- En-tête de page : onglets de la rubrique ---- */
function renderPageHead(){
  const head = document.getElementById('page-head');
  if(!head) return;
  const logged = student && student.prenom && !NAV_PUBLIC.includes(screen);
  const cur = logged ? navCurrent() : {section:null};
  let html = '';
  if(cur.section && cur.section.tabs.length > 1){
    html += `<nav class="subnav" aria-label="${esc(cur.section.label)}"><div class="subnav-row">
      ${cur.section.tabs.map((t,i)=>{
        const on = cur.tab === t;
        const n = t.badge ? t.badge() : 0;
        return `<button type="button" class="subnav-tab" ${on?'aria-current="page"':''} onclick="navGo('${cur.section.id}', ${i})">${t.label}${n ? ` <span class="sb-badge">${n}</span>` : ''}</button>`;
      }).join('')}</div></nav>`;
  }
  /* Aperçu élève (professeure) : choix du niveau affiché. */
  if(isTeacher && cur.tab && cur.tab.apercu){
    html += `<div class="apercu-bar" role="group" aria-label="Niveau de l'aperçu">${uiIcon('eye')}<span>Aperçu élève — niveau</span>
      ${(typeof niveauxMenu !== 'undefined' ? niveauxMenu : []).map(n=>`<button type="button" class="ui-chip" aria-pressed="${niveau===n.code}" onclick="setAdminNiveau('${n.code}')">${n.code}</button>`).join('')}
      <span class="apercu-links"><button type="button" class="btn-link" onclick="goTemas()">Thème</button> · <button type="button" class="btn-link" onclick="goDossiers()">Dossiers</button></span></div>`;
  }
  /* Unités d'un dossier (écrans « week » et « bilan »). */
  if((screen === 'week' || screen === 'bilan') && typeof weeks !== 'undefined'){
    html += `<nav class="subnav subnav-units" aria-label="Unités du dossier"><div class="subnav-row">
      ${weeks.map(w=>`<button type="button" class="subnav-tab" ${screen==='week'&&current===w.id?'aria-current="page"':''} onclick="goWeek(${w.id})">${w.tag} · ${w.title_fr}</button>`).join('')}
      <button type="button" class="subnav-tab" ${screen==='bilan'?'aria-current="page"':''} onclick="goBilan()">✓ Bilan final</button></div></nav>`;
  }
  head.innerHTML = html;
  head.hidden = !html;
}

/* ---- Mobile : barre du haut, barre inférieure, menu coulissant ---- */
function navIsMobile(){ return window.matchMedia('(max-width: 899px)').matches; }
function navSetSidebarInert(){
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  const hidden = navIsMobile() && !document.body.classList.contains('nav-open');
  if(hidden){ sb.setAttribute('aria-hidden', 'true'); sb.setAttribute('inert', ''); }
  else { sb.removeAttribute('aria-hidden'); sb.removeAttribute('inert'); }
}
function openNavDrawer(){
  document.body.classList.add('nav-open');
  const btn = document.getElementById('topbar-menu-btn'); if(btn) btn.setAttribute('aria-expanded', 'true');
  navSetSidebarInert();
  const first = document.querySelector('#sidebar .sidebar-close');
  if(first) setTimeout(()=>first.focus(), 60);
}
function closeNavDrawer(returnFocus){
  if(!document.body.classList.contains('nav-open')) return;
  document.body.classList.remove('nav-open');
  const btn = document.getElementById('topbar-menu-btn'); if(btn) btn.setAttribute('aria-expanded', 'false');
  navSetSidebarInert();
  if(returnFocus && btn) btn.focus();
}
function toggleNavDrawer(){ document.body.classList.contains('nav-open') ? closeNavDrawer(true) : openNavDrawer(); }
function ensureNavChrome(){
  if(document.querySelector('.topbar')) return;
  const tb = document.createElement('header');
  tb.className = 'topbar';
  tb.innerHTML = `<span class="topbar-brand" aria-hidden="true">FLE</span><span class="topbar-title" id="topbar-title" aria-live="polite"></span>
    <button class="topbar-menu-btn" type="button" id="topbar-menu-btn" aria-controls="sidebar" aria-expanded="false">${uiIcon('menu')}<span>Menu</span></button>`;
  document.body.insertBefore(tb, document.querySelector('.app'));
  tb.querySelector('#topbar-menu-btn').onclick = ()=> toggleNavDrawer();
  const ov = document.createElement('div');
  ov.className = 'nav-overlay';
  ov.onclick = ()=> closeNavDrawer(true);
  document.body.appendChild(ov);
  const bn = document.createElement('nav');
  bn.className = 'bottomnav'; bn.id = 'bottomnav';
  bn.setAttribute('aria-label', 'Navigation principale');
  document.body.appendChild(bn);
}
function updateNavChrome(){
  ensureNavChrome();
  const logged = student && student.prenom && !NAV_PUBLIC.includes(screen) && screen !== 'login';
  const role = navRole();
  const cur = logged ? navCurrent() : {section:null};
  const tb = document.querySelector('.topbar');
  const bn = document.getElementById('bottomnav');
  document.body.classList.toggle('no-bottomnav', !logged);
  if(tb) tb.style.display = logged ? '' : 'none';
  if(bn){
    bn.style.display = logged ? '' : 'none';
    if(logged){
      const ids = NAV_BOTTOM[role] || [];
      const secs = navSections().filter(s => ids.includes(s.id));
      const inBottom = cur.section && ids.includes(cur.section.id);
      bn.innerHTML = secs.map(s=>{
        const on = cur.section && cur.section.id === s.id;
        const n = s.badge ? s.badge() : 0;
        const dot = !n && s.dot && s.dot();
        return `<button type="button" onclick="navGo('${s.id}')" ${on ? 'aria-current="page"' : ''}>
          ${uiIcon(s.icon)}<span>${NAV_SHORT[s.id] || s.label}</span>
          ${n ? `<span class="dot" aria-label="${n} non lu${n>1?'s':''} ou à traiter">${n}</span>` : (dot ? '<span class="dot dot-empty" aria-label="Nouveau"></span>' : '')}</button>`;
      }).join('') + `<button type="button" onclick="openNavDrawer()" ${!inBottom ? 'aria-current="page"' : ''} aria-controls="sidebar">${uiIcon('menu')}<span>Plus</span></button>`;
    }
  }
  const t = document.getElementById('topbar-title');
  if(t) t.textContent = cur.section ? (cur.tab && cur.section.tabs.length > 1 ? cur.tab.label : cur.section.label) : '';
  navSetSidebarInert();
}
document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && document.body.classList.contains('nav-open')) closeNavDrawer(true); });
window.addEventListener('resize', ()=>{ if(!navIsMobile()) closeNavDrawer(false); navSetSidebarInert(); });

/* Après chaque rendu : en-tête de page, chrome mobile, focus sur le contenu si l'écran change. */
let navLastKey = null;
onAfterRender(()=>{
  renderPageHead();
  updateNavChrome();
  const key = screen + '|' + (screen === 'teacher' ? teacherTab : '') + '|' + (screen === 'week' ? current : '');
  if(navLastKey !== null && key !== navLastKey){
    const c = document.getElementById('content');
    if(c && !(document.activeElement && document.activeElement.matches('input,textarea,select'))) c.focus({preventScroll:true});
  }
  navLastKey = key;
});

/* ---- Raccourcis de navigation historiques, conservés et réorientés ---- */
/* « Disponibilités » côté professeure = onglet Planning de la rubrique Cours. */
function goTeacherHome(){ teacherTab = 'accueil'; screen = 'teacher'; render(); }
