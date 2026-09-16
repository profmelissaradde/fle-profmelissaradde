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
