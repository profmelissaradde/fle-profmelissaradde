/* ======================= ESPACE ÉLÈVE — COURS EXPÉRIMENTAL ======================= */
/*
  Les élèves inscrits via la page de cours expérimental n'ont pas encore de niveau.
  Ils ne doivent donc voir ni "Niveau null", ni les dossiers pédagogiques, ni le forum.
  Leur accueil affiche uniquement leur cours expérimental réservé et les accès utiles.
*/
(function(){
  function isExperimentalStudent(){
    return !isTeacher && !!student && (
      student.experimentalLesson === true ||
      student.registrationSource === 'cours-experimental' ||
      student.status === 'experimental'
    );
  }

  /* On remplace afterAuth pour envoyer les comptes expérimentaux vers leur espace dédié. */
  const baseAfterAuth = window.afterAuth;
  window.afterAuth = function(uid, record){
    const experimental = record && (
      record.experimentalLesson === true ||
      record.registrationSource === 'cours-experimental' ||
      record.status === 'experimental'
    );

    if(!experimental){
      return baseAfterAuth(uid, record);
    }

    student = {
      prenom: record.prenom || '',
      nom: record.nom || '',
      email: record.email || '',
      telephone: record.telephone || '',
      uid,
      uniteCourante: null,
      frequence: null,
      bilans: record.bilans || {},
      completed: record.completed || {},
      temas: record.temas || {},
      experimentalLesson: true,
      registrationSource: record.registrationSource || 'cours-experimental',
      status: record.status || 'experimental'
    };

    niveau = null;
    current = null;
    screen = 'experimental';
    startStudentMessagesListener();
    render();
  };

  function renderExperimentalHome(){
    const c = document.getElementById('content');
    if(!c) return;
    c.innerHTML = `
      <p class="eyebrow">Cours expérimental</p>
      <h1 class="page-title">Bienvenue ${student.prenom || ''} 👋</h1>
      <div class="objectif-box">
        <p class="fr">Ton espace est prêt. Tu retrouveras ici les informations de ton cours expérimental et ton accès Zoom lorsqu'il sera disponible.</p>
        <p class="pt">🇧🇷 Seu espaço está pronto. Aqui você encontrará as informações da sua aula experimental e o acesso ao Zoom quando estiver disponível.</p>
      </div>
      <div id="next-course-banner"><p style="color:var(--grey);">Chargement de ton cours…</p></div>
    `;
    if(typeof loadNextCourseBanner === 'function') loadNextCourseBanner();
  }

  /* Sidebar spécifique : pas de niveau, pas de dossiers, pas de réservation, pas de forum. */
  const baseRenderSidebar = window.renderSidebar;
  window.renderSidebar = function(){
    if(!isExperimentalStudent()){
      return baseRenderSidebar();
    }

    const sb = document.getElementById('sidebar');
    if(!sb) return;
    sb.innerHTML = `
      <p class="cover-label">Cours expérimental</p>
      <h1 class="cover-title">FLE</h1>
      <div class="student-badge">
        <b>${student.prenom || ''} ${student.nom || ''}</b>
        Cours expérimental
      </div>
      <button class="nav-btn ${screen==='experimental'?'active':''}" onclick="goExperimentalHome()"><span class="tag">🧪</span> Mon cours expérimental</button>
      <button class="nav-btn ${screen==='messages'?'active':''}" style="--tag-color:#0d9488" onclick="goMessages()"><span class="tag">✉️</span> Message à Melissa${typeof studentUnreadCount !== 'undefined' && studentUnreadCount>0 ? ` <span class="admin-pill" style="background:var(--bad); color:#fff;">${studentUnreadCount}</span>` : ''}</button>
      <button class="nav-btn ${screen==='historique'?'active':''}" style="--tag-color:#8338ec" onclick="goHistorique()"><span class="tag">📚</span> Historique de mes cours</button>
      <div class="nav-sep"></div>
      <button class="nav-btn" onclick="goLogin()">🚪 Se déconnecter</button>
    `;
  };

  window.goExperimentalHome = function(){
    if(!isExperimentalStudent()) return;
    screen = 'experimental';
    render();
  };

  /* Empêche aussi l'accès aux écrans masqués via la console ou un ancien état de navigation. */
  const baseGoDossiers = window.goDossiers;
  window.goDossiers = function(){
    if(isExperimentalStudent()) return goExperimentalHome();
    return baseGoDossiers();
  };
  const baseGoForum = window.goForum;
  window.goForum = function(){
    if(isExperimentalStudent()) return goExperimentalHome();
    return baseGoForum();
  };
  const baseGoReserver = window.goReserver;
  window.goReserver = function(){
    if(isExperimentalStudent()) return goExperimentalHome();
    return baseGoReserver();
  };

  /* Intercepte le rendu de l'écran expérimental, les autres écrans restent inchangés. */
  const baseRender = window.render;
  window.render = function(){
    if(isExperimentalStudent() && ['dossiers','forum','reserver','week','bilan','temas','survie','waiting'].includes(screen)){
      screen = 'experimental';
    }

    if(screen === 'experimental' && isExperimentalStudent()){
      const sidebar = document.getElementById('sidebar');
      if(sidebar) sidebar.style.display = '';
      renderSidebar();
      const contentEl = document.getElementById('content');
      if(contentEl) contentEl.style.setProperty('--accent', '#06a77d');
      renderExperimentalHome();
      window.scrollTo(0,0);
      return;
    }

    return baseRender();
  };
})();

/* ======================= MESSAGERIE PROF — TOUS LES ÉLÈVES ======================= */
/*
  La liste Messages de la professeure ne dépend plus seulement des conversations
  déjà existantes. Tous les profils Firestore sont proposés : élèves actifs,
  élèves expérimentaux et profils sans niveau. La professeure peut donc démarrer
  elle-même une nouvelle conversation avec n'importe lequel d'entre eux.
*/
(function(){
  let teacherMessageDirectory = [];

  function directoryStudent(uid){
    return teacherMessageDirectory.find(s => s.id === uid) || null;
  }

  function allTeacherMessageContacts(){
    const threadByUid = {};
    (teacherMsgThreads || []).forEach(t => { threadByUid[t.studentUid] = t; });

    const contacts = teacherMessageDirectory.map(s => {
      const existing = threadByUid[s.id];
      if(existing) return {...existing, profile:s};
      return {
        studentUid:s.id,
        studentName:`${s.prenom || ''} ${s.nom || ''}`.trim() || s.email || 'Élève',
        lastText:'', lastTs:null, unread:0, msgs:[], profile:s
      };
    });

    (teacherMsgThreads || []).forEach(t => {
      if(!contacts.some(c => c.studentUid === t.studentUid)) contacts.push(t);
    });

    return contacts.sort((a,b) => {
      const at = a.lastTs?.toMillis?.() || 0;
      const bt = b.lastTs?.toMillis?.() || 0;
      if(at !== bt) return bt - at;
      return (a.studentName || '').localeCompare(b.studentName || '', 'fr');
    });
  }

  async function loadTeacherMessageDirectory(){
    try{
      const snap = await db.collection('eleves').orderBy('nom').get();
      teacherMessageDirectory = snap.docs
        .map(d => ({id:d.id, ...d.data()}))
        .filter(s => s.status !== 'archived');
      teacherMessageDirectory.forEach(s => ensureStudentPresenceListener(s.id));
    }catch(e){
      console.error('Chargement annuaire messagerie :', e);
      teacherMessageDirectory = [];
    }
  }

  window.loadTeacherMessages = async function(){
    startTeacherMessagesListener();
    await loadTeacherMessageDirectory();
    renderTeacherMessages();
  };

  window.openTeacherThread = function(uid){
    teacherOpenThreadUid = uid;
    const t = (teacherMsgThreads || []).find(x => x.studentUid === uid);
    const s = directoryStudent(uid);
    teacherOpenThreadName = t ? t.studentName : (s ? (`${s.prenom || ''} ${s.nom || ''}`.trim() || s.email || 'Élève') : 'Élève');
    renderTeacherMessages();
  };

  window.renderTeacherMessages = function(){
    const body = document.getElementById('teacher-body');
    if(!body) return;

    if(teacherOpenThreadUid){
      const thread = (teacherMsgThreads || []).find(t => t.studentUid === teacherOpenThreadUid);
      const msgs = thread ? thread.msgs : [];
      const profile = directoryStudent(teacherOpenThreadUid);
      const typeLabel = profile && (profile.experimentalLesson === true || profile.registrationSource === 'cours-experimental' || profile.status === 'experimental')
        ? '<span class="admin-pill" style="margin-left:6px;background:#fff4d6;color:#8a5a00;">🧪 Expérimental</span>'
        : '';
      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
          <button onclick="closeTeacherThread()" style="background:none; color:var(--navy);">← Retour aux conversations</button>
          <div>
            <button onclick="deleteConversationForMe('${teacherOpenThreadUid}','teacher')" style="background:none; color:var(--grey); font-size:12px;">🗑 Supprimer pour moi</button>
            <button onclick="deleteConversationForEveryone('${teacherOpenThreadUid}','teacher')" style="background:none; color:var(--bad); font-size:12px;">🗑 Supprimer pour tout le monde</button>
          </div>
        </div>
        <h3 style="margin:0 0 4px;">${esc(teacherOpenThreadName)} ${typeLabel}</h3>
        ${profile && profile.email ? `<div style="font-size:12px;color:var(--grey);margin-bottom:3px;">${esc(profile.email)}</div>` : ''}
        <div style="font-size:12.5px; color:var(--grey); margin-bottom:10px;">${presenceLabel(teacherOpenThreadUid)}</div>
        <div id="thread-messages" style="max-height:420px; overflow-y:auto; border:1px solid var(--line); border-radius:8px; padding:12px; background:#fafafa;">
          ${msgs.length ? msgs.map(m=>messageBubbleHTML(m, m.senderIsTeacher, 'teacher')).join('') : '<p class="teacher-empty">Aucun message pour le moment — tu peux démarrer la conversation.</p>'}
        </div>
        <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
          <input id="thread-input" type="text" placeholder="Écrire un message…" style="flex:1; padding:10px; border:1px solid var(--line); border-radius:8px;" onkeydown="if(event.key==='Enter') sendTeacherMessage()">
          <label style="cursor:pointer; padding:9px 12px; border:1px solid var(--line); border-radius:8px; background:#fff;" title="Joindre une photo ou un fichier">📎<input type="file" style="display:none" onchange="handleAttachmentChange('teacher', this)"></label>
          <button class="rec-btn" onclick="sendTeacherMessage()">Envoyer</button>
        </div>
        <div id="teacher-attach-status" style="font-size:11.5px; color:var(--grey); margin-top:4px;"></div>
      `;
      const el = document.getElementById('thread-messages');
      if(el) el.scrollTop = el.scrollHeight;
      return;
    }

    const contacts = allTeacherMessageContacts();
    if(!contacts.length){
      body.innerHTML = '<p class="teacher-empty">Aucun élève inscrit pour le moment.</p>';
      return;
    }

    body.innerHTML = `
      <div class="teacher-toolbar" style="margin-bottom:14px;">
        <input id="teacher-message-filter" type="text" placeholder="Rechercher un élève…" oninput="renderTeacherMessages()">
      </div>
      <div id="teacher-message-contacts"></div>
    `;

    const filterEl = document.getElementById('teacher-message-filter');
    const previousFilter = window.__teacherMessageFilter || '';
    if(filterEl){
      filterEl.value = previousFilter;
      filterEl.oninput = function(){ window.__teacherMessageFilter = this.value; renderTeacherMessages(); };
    }
    const q = norm(previousFilter);
    const filtered = contacts.filter(c => {
      if(!q) return true;
      const p = c.profile || {};
      return norm(`${c.studentName || ''} ${p.email || ''} ${p.telephone || ''}`).includes(q);
    });

    const list = document.getElementById('teacher-message-contacts');
    if(!list) return;
    list.innerHTML = filtered.length ? filtered.map(t => {
      const p = t.profile || {};
      const experimental = p.experimentalLesson === true || p.registrationSource === 'cours-experimental' || p.status === 'experimental';
      return `
        <div class="teacher-entry" style="cursor:pointer;" onclick="openTeacherThread('${t.studentUid}')">
          <div class="who">${esc(t.studentName)} ${experimental ? '<span class="admin-pill" style="background:#fff4d6;color:#8a5a00;">🧪 Expérimental</span>' : ''} ${t.unread ? `<span class="admin-pill" style="background:var(--bad); color:#fff;">${t.unread}</span>` : ''}</div>
          <div class="meta">${p.email ? esc(p.email) : ''}${t.lastText ? `${p.email ? ' · ' : ''}${esc((t.lastText||'').slice(0,90))}` : ' · Nouvelle conversation'}</div>
          <div class="meta" style="font-size:11.5px;">${presenceLabel(t.studentUid)}</div>
        </div>`;
    }).join('') : '<p class="teacher-empty">Aucun élève ne correspond à cette recherche.</p>';
  };
})();
