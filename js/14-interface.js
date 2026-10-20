/* ======================= INTERFACE : NOTIFICATIONS, FILTRES, ACCESSIBILITÉ =======================
   1. Notifications accessibles à la place des alert() du navigateur.
   4. « Élèves » : recherche et filtres (à traiter, forfait à renouveler, sans niveau…).
   5. Accessibilité : éléments cliquables utilisables au clavier, libellés des champs.
   La navigation (menus, barre inférieure, focus au changement d'écran) est dans 15-navigation.js. */
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

  /* 2. NAVIGATION et 3. TABLEAU DE BORD : déplacés dans 15-navigation.js et
     18-espace-eleve.js (architecture par rubriques). */

  /* ---------------------------------------------------------------------------
     4. ÉLÈVES & NIVEAUX : recherche et filtres
     --------------------------------------------------------------------------- */
  const studentFilter = {q:'', f:'tous'};
  function studentFlags(s){
    const p = (typeof packSlotsByStudent !== 'undefined' && packSlotsByStudent[s.id]) || null;
    const c = p && p.compteurs;
    const pack = s.pack || {};
    const b = (typeof forfaitBilanEleve === 'function' && pack.total) ? forfaitBilanEleve(s) : null;
    return {
      anomalie: !!((c && (c.anomalies > 0 || c.zoomAttente > 0)) || (b && b.statut === 'a_regulariser')),
      /* Solde réel du forfait : une anomalie non résolue ne déclenche jamais « à renouveler ». */
      renouveler: !!(b && ['a_renouveler','termine','proche'].includes(b.statut)),
      paiement: !!(pack.paymentLinks && Object.keys(pack.paymentLinks).length && pack.paymentStatus !== 'paid'),
      sansNiveau: !s.niveau
    };
  }
  window.uiStudentFlags = studentFlags;
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
    /* Tableaux affichés en cartes sur téléphone : chaque cellule reprend le titre de sa colonne. */
    (root || document).querySelectorAll('table.ui-table').forEach(t=>{
      const heads = Array.from(t.querySelectorAll('thead th')).map(th=>th.textContent.trim());
      t.querySelectorAll('tbody tr').forEach(tr=> Array.from(tr.children).forEach((td, i)=>{ if(heads[i] && !td.hasAttribute('data-label')) td.setAttribute('data-label', heads[i]); }));
    });
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
     RACCORDEMENT
     --------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    observer.observe(document.body, {childList:true, subtree:true});
    enhance(document);
  });
  if(document.readyState !== 'loading'){ observer.observe(document.body, {childList:true, subtree:true}); }
})();
