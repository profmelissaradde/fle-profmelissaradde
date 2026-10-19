/* ======================= INTERFACE : NAVIGATION MOBILE, NOTIFICATIONS, ACCESSIBILITÉ =======================
   Couche d'ergonomie posée APRÈS tous les écrans existants (aucune règle métier modifiée) :
   1. Notifications accessibles à la place des alert() du navigateur.
   2. Mobile : barre du haut (titre + Menu), barre de navigation inférieure (4 destinations
      principales + « Plus »), barre latérale transformée en menu coulissant.
   3. Tableau de bord élève : prochain cours, thème de la semaine (progression), forfait.
   4. « Élèves & niveaux » : recherche et filtres (à traiter, forfait à renouveler, sans niveau…).
   5. Accessibilité : éléments cliquables utilisables au clavier, focus déplacé sur le contenu
      au changement d'écran, page de la navigation indiquée (aria-current), annonces vocales. */
(function(){
  /* ---------------------------------------------------------------------------
     1. NOTIFICATIONS
     --------------------------------------------------------------------------- */
  let toastBox = null;
  function ensureToastBox(){
    if(toastBox && document.body.contains(toastBox)) return toastBox;
    toastBox = document.createElement('div');
    toastBox.className = 'ui-toasts';
    toastBox.setAttribute('aria-live', 'polite');
    toastBox.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastBox);
    return toastBox;
  }
  function guessType(msg){
    const m = String(msg || '');
    if(/^\s*(⚠️|❌|✘)|impossible|erreur|échec|n'a pas pu|invalide|refus/i.test(m)) return 'error';
    if(/^\s*(✅|🎉|✔)|bien été|enregistré|envoyé|confirmé|déplacé|synchronisée/i.test(m)) return 'success';
    if(/^\s*(⏳|📌)|attente|merci de|choisis|renseigne/i.test(m)) return 'warning';
    return 'info';
  }
  window.uiNotify = function(message, type, opts){
    type = type || guessType(message);
    opts = opts || {};
    const box = ensureToastBox();
    const el = document.createElement('div');
    el.className = 'ui-toast ' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const icon = {success:'✅', error:'⚠️', warning:'⏳', info:'ℹ️'}[type];
    const clean = String(message == null ? '' : message).replace(/^\s*(✅|⚠️|❌|✘|✔|⏳|ℹ️)\s*/, '');
    el.innerHTML = `<span class="ui-toast-icon" aria-hidden="true">${icon}</span><div class="ui-toast-msg"></div><button class="ui-toast-close" type="button" aria-label="Fermer la notification">×</button>`;
    el.querySelector('.ui-toast-msg').textContent = clean;
    const close = ()=>{ el.remove(); };
    el.querySelector('.ui-toast-close').onclick = close;
    box.appendChild(el);
    while(box.children.length > 3) box.firstChild.remove();
    const delay = opts.duration || (type === 'error' ? 12000 : Math.min(10000, 4000 + clean.length * 40));
    setTimeout(close, delay);
    return el;
  };
  /* Les messages existants passent par alert() : on les affiche de façon non bloquante et
     lisible. confirm() reste natif (il doit bloquer pour attendre la réponse). */
  window.alert = function(message){ window.uiNotify(message); };

  /* ---------------------------------------------------------------------------
     2. NAVIGATION
     --------------------------------------------------------------------------- */
  const SCREEN_TITLES = {
    dossiers:'Accueil', week:'Unité', bilan:'Bilan', temas:'Thème de la semaine', survie:'Phrases de survie',
    reserver:'Cours', forum:'Forum', messages:'Messages', historique:'Historique', profil:'Mon profil',
    regles:'Règles & fonctionnement', 'admin-cours':'Vue des cours', experimental:'Mon cours expérimental',
    waiting:'Bienvenue', teacher:'Espace enseignante'
  };
  const TEACHER_TAB_TITLES = {eleves:'Élèves & niveaux', rec:'Enregistrements', temas:'Suivi du thème', dispo:'Disponibilités', experimental:'Cours expérimental', historique:'Historique', messages:'Messages'};

  function navItems(){
    if(!student || !student.prenom || ['login','verify'].includes(screen)) return [];
    if(isTeacher){
      const unread = typeof teacherUnreadTotal === 'function' ? teacherUnreadTotal() : 0;
      return [
        {id:'t-eleves', label:'Élèves', ic:'👥', go:()=>goTeacherTab('eleves'), active: screen==='teacher' && teacherTab==='eleves'},
        {id:'t-planning', label:'Planning', ic:'📅', go:()=>goReserver(), active: screen==='reserver'},
        {id:'t-theme', label:'Thème', ic:'📝', go:()=>goTeacherTab('temas'), active: screen==='teacher' && teacherTab==='temas'},
        {id:'t-messages', label:'Messages', ic:'✉️', go:()=>goTeacherTab('messages'), active: screen==='teacher' && teacherTab==='messages', badge: unread}
      ];
    }
    const unread = typeof studentUnreadCount !== 'undefined' ? studentUnreadCount : 0;
    if(typeof isExperimentalStudent === 'function' && isExperimentalStudent()){
      return [
        {id:'e-home', label:'Mon cours', ic:'🏠', go:()=>goExperimentalHome(), active: screen==='experimental'},
        {id:'e-messages', label:'Messages', ic:'✉️', go:()=>goMessages(), active: screen==='messages', badge: unread},
        {id:'e-histo', label:'Historique', ic:'📚', go:()=>goHistorique(), active: screen==='historique'}
      ];
    }
    if(!niveau){
      return [
        {id:'w-home', label:'Accueil', ic:'🏠', go:()=>goWaiting(), active: screen==='waiting'},
        {id:'w-cours', label:'Cours', ic:'📅', go:()=>goReserver(), active: screen==='reserver'},
        {id:'w-messages', label:'Messages', ic:'✉️', go:()=>goMessages(), active: screen==='messages', badge: unread}
      ];
    }
    return [
      {id:'s-home', label:'Accueil', ic:'🏠', go:()=>goDossiers(), active: ['dossiers','week','bilan'].includes(screen)},
      {id:'s-theme', label:'Thème', ic:'📝', go:()=>goTemas(), active: screen==='temas'},
      {id:'s-cours', label:'Cours', ic:'📅', go:()=>goReserver(), active: screen==='reserver'},
      {id:'s-messages', label:'Messages', ic:'✉️', go:()=>goMessages(), active: screen==='messages', badge: unread}
    ];
  }
  let currentItems = [];
  window.uiNavGo = function(id){
    const it = currentItems.find(x=>x.id===id);
    closeDrawer(false);
    if(it) it.go();
  };

  function ensureChrome(){
    if(!document.querySelector('.topbar')){
      const tb = document.createElement('header');
      tb.className = 'topbar';
      tb.innerHTML = `<span class="topbar-brand">FLE · Melissa Radde</span><span class="topbar-title" id="topbar-title" aria-live="polite"></span>
        <button class="topbar-menu-btn" type="button" id="topbar-menu-btn" aria-controls="sidebar" aria-expanded="false"><span aria-hidden="true">☰</span> Menu</button>`;
      document.body.insertBefore(tb, document.querySelector('.app'));
      tb.querySelector('#topbar-menu-btn').onclick = ()=> toggleDrawer();
      const ov = document.createElement('div');
      ov.className = 'nav-overlay';
      ov.onclick = ()=> closeDrawer(true);
      document.body.appendChild(ov);
      const bn = document.createElement('nav');
      bn.className = 'bottomnav';
      bn.id = 'bottomnav';
      bn.setAttribute('aria-label', 'Navigation principale');
      document.body.appendChild(bn);
    }
  }
  function isMobile(){ return window.matchMedia('(max-width: 899px)').matches; }
  function setSidebarInert(){
    const sb = document.getElementById('sidebar');
    if(!sb) return;
    const hidden = isMobile() && !document.body.classList.contains('nav-open');
    if(hidden){ sb.setAttribute('aria-hidden', 'true'); sb.setAttribute('inert', ''); }
    else { sb.removeAttribute('aria-hidden'); sb.removeAttribute('inert'); }
  }
  function openDrawer(){
    document.body.classList.add('nav-open');
    const btn = document.getElementById('topbar-menu-btn'); if(btn) btn.setAttribute('aria-expanded', 'true');
    setSidebarInert();
    const first = document.querySelector('#sidebar .sidebar-close') || document.querySelector('#sidebar button');
    if(first) setTimeout(()=>first.focus(), 60);
  }
  function closeDrawer(returnFocus){
    if(!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    const btn = document.getElementById('topbar-menu-btn'); if(btn) btn.setAttribute('aria-expanded', 'false');
    setSidebarInert();
    if(returnFocus && btn) btn.focus();
  }
  function toggleDrawer(){ document.body.classList.contains('nav-open') ? closeDrawer(true) : openDrawer(); }
  window.uiOpenMenu = openDrawer;
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && document.body.classList.contains('nav-open')) closeDrawer(true); });
  window.addEventListener('resize', ()=>{ if(!isMobile()) closeDrawer(false); setSidebarInert(); });
  /* Un choix dans le menu coulissant le referme. */
  document.addEventListener('click', e=>{
    if(!document.body.classList.contains('nav-open')) return;
    const b = e.target.closest('#sidebar .nav-btn');
    if(b) setTimeout(()=>closeDrawer(false), 0);
  });

  function updateChrome(){
    ensureChrome();
    currentItems = navItems();
    const bn = document.getElementById('bottomnav');
    const tb = document.querySelector('.topbar');
    const show = currentItems.length > 0;
    document.body.classList.toggle('no-bottomnav', !show);
    if(tb) tb.style.display = show ? '' : 'none';
    if(bn){
      bn.style.display = show ? '' : 'none';
      const anyActive = currentItems.some(i=>i.active);
      bn.innerHTML = currentItems.map(i=>`<button type="button" onclick="uiNavGo('${i.id}')" ${i.active ? 'aria-current="page"' : ''}>
          <span class="ic" aria-hidden="true">${i.ic}</span><span>${i.label}</span>
          ${i.badge ? `<span class="dot" aria-label="${i.badge} non lu${i.badge>1?'s':''}">${i.badge}</span>` : ''}</button>`).join('')
        + `<button type="button" onclick="uiOpenMenu()" ${!anyActive ? 'aria-current="page"' : ''} aria-controls="sidebar"><span class="ic" aria-hidden="true">☰</span><span>Plus</span></button>`;
    }
    const t = document.getElementById('topbar-title');
    if(t){
      let title = SCREEN_TITLES[screen] || '';
      if(screen === 'teacher') title = TEACHER_TAB_TITLES[teacherTab] || title;
      if(screen === 'reserver' && isTeacher) title = 'Planning & disponibilités';
      t.textContent = title;
    }
    /* Bouton de fermeture du menu coulissant (mobile) */
    const sb = document.getElementById('sidebar');
    if(sb && !sb.querySelector('.sidebar-close')){
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'nav-btn sidebar-close'; c.style.display = 'none';
      c.innerHTML = '<span class="tag" aria-hidden="true">✕</span> Fermer le menu';
      c.onclick = ()=> closeDrawer(true);
      sb.insertBefore(c, sb.firstChild);
    }
    if(sb){
      sb.querySelectorAll('.nav-btn').forEach(b=>{
        if(b.classList.contains('active')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
    }
    setSidebarInert();
  }

  /* ---------------------------------------------------------------------------
     3. TABLEAU DE BORD ÉLÈVE
     --------------------------------------------------------------------------- */
  function themeProgress(tema){
    const t = (student.temas && student.temas[tema.id]) || {};
    if(typeof tpIsV2 === 'function' && tpIsV2(tema)){
      const lvl = (t.v2 && t.v2.niveau) || tpNiveauPour(tema, niveau, student.niveauTheme);
      const d = tpLevelData(tema, lvl);
      if(!d) return {done:0, total:0};
      const st = {r:(t.v2&&t.v2.r)||{}, a:(t.v2&&t.v2.a)||{}, fb:(t.v2&&t.v2.fb)||{}};
      return {done: d.activites.filter(a=>tpActDone(a, st)).length, total: d.activites.length, duree: d.duree};
    }
    const keys = ['co','ce','ee','eo'];
    return {done: keys.filter(k=>t[k] && t[k].done).length, total: 4};
  }
  function dashboardHTML(){
    const pack = student.pack || {};
    const total = Number(pack.total) || 0, used = Number(pack.used) || 0;
    const reste = Math.max(0, total - used);
    return `<section class="dash-grid" aria-label="Tableau de bord">
      <div class="dash-next-course" id="dash-next-course"></div>
      <article class="dash-card dash-theme" id="dash-theme-card" aria-live="polite">
        <h2>Thème de la semaine</h2>
        <div class="ui-skeleton" style="height:22px; width:70%;"></div>
        <div class="ui-skeleton" style="height:8px;"></div>
      </article>
      <article class="dash-card">
        <h2>Mes dossiers</h2>
        <p class="dash-main">Niveau ${niveau}</p>
        <p class="dash-sub">Continue ton dossier là où tu t'es arrêté(e).</p>
        <a class="btn btn-secondary" href="#dossier-grid">Voir mes dossiers</a>
      </article>
      ${total ? `<article class="dash-card">
        <h2>Mon forfait</h2>
        <p class="dash-main">${reste} séance${reste>1?'s':''} restante${reste>1?'s':''}</p>
        <div class="dash-progress" role="img" aria-label="${used} séances utilisées sur ${total}"><span style="width:${Math.min(100, Math.round(100*used/total))}%"></span></div>
        <p class="dash-sub">${used} / ${total} utilisées</p>
        <button class="btn btn-secondary" type="button" onclick="goReserver()">Réserver un cours</button>
      </article>` : `<article class="dash-card">
        <h2>Mes cours</h2>
        <p class="dash-main">Réserver un cours</p>
        <p class="dash-sub">Choisis un créneau dans le calendrier.</p>
        <button class="btn btn-secondary" type="button" onclick="goReserver()">Voir les créneaux</button>
      </article>`}
    </section>`;
  }
  async function fillThemeCard(){
    const card = document.getElementById('dash-theme-card');
    if(!card) return;
    try{
      if(typeof tpLoadConfig === 'function' && !tpConfig.loaded) await tpLoadConfig();
      const id = typeof temaCourantId === 'function' ? (temaCourantId() || temaMostRecentVisibleId()) : temaMostRecentVisibleId();
      const tema = getTema(id);
      const p = themeProgress(tema);
      const pct = p.total ? Math.round(100 * p.done / p.total) : 0;
      const label = p.done === 0 ? 'Commencer' : (p.done >= p.total ? 'Revoir' : 'Continuer');
      if(!document.getElementById('dash-theme-card')) return;
      card.innerHTML = `<h2>Thème de la semaine</h2>
        <p class="dash-main">${tema.titre_fr}</p>
        <p class="dash-sub">${tema.periode}${p.duree ? ` · ${p.duree.min}–${p.duree.max} min` : ''}</p>
        <div class="dash-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.done}" aria-label="Progression du thème"><span style="width:${pct}%"></span></div>
        <p class="dash-sub">${p.done} / ${p.total} activités terminées</p>
        <button class="btn" type="button" onclick="goTemas()">${label} →</button>`;
    }catch(e){
      card.innerHTML = `<h2>Thème de la semaine</h2><p class="dash-sub">Le thème n'a pas pu être chargé.</p><button class="btn btn-secondary" type="button" onclick="goTemas()">Ouvrir le thème</button>`;
    }
  }
  if(typeof window.renderDossiers === 'function'){
    const baseRenderDossiers = window.renderDossiers;
    window.renderDossiers = function(){
      baseRenderDossiers();
      if(isTeacher || (typeof isStudentExperimental === 'function' && isStudentExperimental())) return;
      const c = document.getElementById('content');
      const title = c && c.querySelector('h1.page-title');
      if(!title) return;
      title.textContent = `Bonjour ${student.prenom || ''} 👋`;
      const eyebrow = c.querySelector('.eyebrow'); if(eyebrow) eyebrow.textContent = `Niveau ${niveau} · Tableau de bord`;
      const wrap = document.createElement('div');
      wrap.innerHTML = dashboardHTML();
      title.after(wrap.firstElementChild);
      /* Le prochain cours (bannière existante, remplie de façon asynchrone) prend la 1re place. */
      const banner = document.getElementById('next-course-banner');
      const slot = document.getElementById('dash-next-course');
      if(banner && slot) slot.appendChild(banner);
      const grid = document.getElementById('dossier-grid');
      if(grid && !(grid.previousElementSibling && grid.previousElementSibling.matches('.section-title'))){
        const h = document.createElement('h2'); h.className = 'section-title'; h.textContent = 'Mes dossiers';
        grid.before(h);
      }
      fillThemeCard();
    };
  }

  /* ---------------------------------------------------------------------------
     4. ÉLÈVES & NIVEAUX : recherche et filtres
     --------------------------------------------------------------------------- */
  const studentFilter = {q:'', f:'tous'};
  function studentFlags(s){
    const p = (typeof packSlotsByStudent !== 'undefined' && packSlotsByStudent[s.id]) || null;
    const c = p && p.compteurs;
    const pack = s.pack || {};
    return {
      anomalie: !!(c && (c.anomalies > 0 || c.zoomAttente > 0)),
      renouveler: !!(pack.total && p && p.upcoming <= 2),
      paiement: !!(pack.paymentLinks && Object.keys(pack.paymentLinks).length && pack.paymentStatus !== 'paid'),
      sansNiveau: !s.niveau
    };
  }
  const FILTERS = [
    {id:'tous', label:'Tous'},
    {id:'anomalie', label:'⚠️ À traiter'},
    {id:'renouveler', label:'📦 Forfait à renouveler'},
    {id:'paiement', label:'💳 Paiement en attente'},
    {id:'sansNiveau', label:'Sans niveau'}
  ];
  window.uiSetStudentFilter = function(f){ studentFilter.f = f; renderStudentsFlatList(); };
  window.uiSearchStudents = function(v){
    studentFilter.q = v;
    clearTimeout(window.__uiSearchT);
    window.__uiSearchT = setTimeout(()=>{
      renderStudentsFlatList();
      const i = document.getElementById('ui-student-search');
      if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    }, 180);
  };
  if(typeof window.renderStudentsFlatList === 'function'){
    const baseFlat = window.renderStudentsFlatList;
    window.renderStudentsFlatList = function(){
      const all = studentsData;
      const q = studentFilter.q.trim().toLowerCase();
      const counts = {};
      FILTERS.forEach(f=> counts[f.id] = f.id === 'tous' ? all.length : all.filter(s=>studentFlags(s)[f.id]).length);
      const filtered = all.filter(s=>{
        if(studentFilter.f !== 'tous' && !studentFlags(s)[studentFilter.f]) return false;
        if(!q) return true;
        return `${s.prenom||''} ${s.nom||''} ${s.email||''}`.toLowerCase().includes(q);
      });
      studentsData = filtered;
      try{ baseFlat(); } finally { studentsData = all; }
      const body = document.getElementById('teacher-body');
      if(!body || !all.length) return;
      if(!filtered.length) body.innerHTML = `<p class="teacher-empty">Aucun élève ne correspond à ce filtre.</p>`;
      const bar = document.createElement('div');
      bar.innerHTML = `<div class="ui-filters" role="group" aria-label="Filtrer les élèves">
          <label class="sr-only" for="ui-student-search">Rechercher un élève</label>
          <input type="search" id="ui-student-search" placeholder="Rechercher (nom, e-mail)…" value="${(studentFilter.q||'').replace(/"/g,'&quot;')}" oninput="uiSearchStudents(this.value)">
          ${FILTERS.map(f=>`<button type="button" class="ui-chip" aria-pressed="${studentFilter.f===f.id}" onclick="uiSetStudentFilter('${f.id}')">${f.label}<span class="n">${counts[f.id]}</span></button>`).join('')}
        </div>
        <p class="ui-results" aria-live="polite">${filtered.length} élève${filtered.length>1?'s':''} affiché${filtered.length>1?'s':''}${studentFilter.f!=='tous' || q ? ` sur ${all.length}` : ''}</p>`;
      body.insertBefore(bar.lastElementChild, body.firstChild);
      body.insertBefore(bar.firstElementChild, body.firstChild);
    };
  }

  /* ---------------------------------------------------------------------------
     5. ACCESSIBILITÉ
     --------------------------------------------------------------------------- */
  /* Les cartes et zones cliquables qui ne sont pas des boutons deviennent utilisables au
     clavier et annoncées comme des boutons. */
  function enhance(root){
    (root || document).querySelectorAll('[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(label):not([role])').forEach(el=>{
      if(el.classList.contains('locked') || el.classList.contains('empty')) return;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    });
    (root || document).querySelectorAll('.dossier-card.locked').forEach(el=> el.setAttribute('aria-disabled', 'true'));
    (root || document).querySelectorAll('iframe:not([title])').forEach(f=> f.setAttribute('title', 'Vidéo'));
    (root || document).querySelectorAll('.teacher-empty').forEach(el=>{ if(/Chargement/.test(el.textContent)) el.setAttribute('role', 'status'); });
    (root || document).querySelectorAll('textarea:not([aria-label]):not([id])').forEach(t=>{ if(t.placeholder) t.setAttribute('aria-label', t.placeholder); });
    /* Libellés : <label> sans « for » dans un bloc .field → relié à son champ ; sinon nom
       accessible déduit du placeholder, du title ou du texte du conteneur. */
    (root || document).querySelectorAll('.field').forEach(f=>{
      const l = f.querySelector('label:not([for])'), c = f.querySelector('input:not([type=hidden]),select,textarea');
      if(l && c && c.id && !l.contains(c)) l.htmlFor = c.id;
    });
    (root || document).querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea').forEach(i=>{
      if(i.getAttribute('aria-label') || i.getAttribute('aria-labelledby')) return;
      if(i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`)) return;
      if(i.closest('label')) return;
      let name = i.placeholder || i.title || '';
      if(!name && i.parentElement){
        const clone = i.parentElement.cloneNode(true);
        clone.querySelectorAll('input,select,textarea,button,option').forEach(x=>x.remove());
        name = clone.textContent.replace(/\s+/g,' ').trim().slice(0, 80);
      }
      if(!name && i.type === 'checkbox') name = 'Case à cocher';
      if(name) i.setAttribute('aria-label', name);
    });
  }
  document.addEventListener('keydown', e=>{
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target;
    if(el && el.getAttribute && el.getAttribute('role') === 'button' && el.tagName !== 'BUTTON'){
      e.preventDefault();
      el.click();
    }
  });
  let enhanceQueued = false;
  const observer = new MutationObserver(()=>{
    if(enhanceQueued) return;
    enhanceQueued = true;
    requestAnimationFrame(()=>{ enhanceQueued = false; enhance(document); });
  });

  /* ---------------------------------------------------------------------------
     RACCORDEMENT : après chaque rendu d'écran
     --------------------------------------------------------------------------- */
  let lastScreenKey = null;
  const baseRender = window.render;
  window.render = function(){
    baseRender.apply(this, arguments);
    updateChrome();
    const key = screen + '|' + (screen === 'teacher' ? teacherTab : '') + '|' + (screen === 'week' ? current : '');
    if(lastScreenKey !== null && key !== lastScreenKey){
      /* Nouvel écran : le focus va au contenu (lecteurs d'écran, clavier). */
      const c = document.getElementById('content');
      if(c && !(document.activeElement && document.activeElement.matches('input,textarea,select'))) c.focus({preventScroll:true});
    }
    lastScreenKey = key;
  };
  const baseSidebar = window.renderSidebar;
  window.renderSidebar = function(){
    baseSidebar.apply(this, arguments);
    updateChrome();
  };
  document.addEventListener('DOMContentLoaded', ()=>{
    ensureChrome(); updateChrome();
    observer.observe(document.body, {childList:true, subtree:true});
    enhance(document);
  });
  if(document.readyState !== 'loading'){ ensureChrome(); updateChrome(); observer.observe(document.body, {childList:true, subtree:true}); }
})();
