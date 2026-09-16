/* ======================= PROFILS, RÈGLES & FICHES ÉLÈVES ======================= */
/* Extension volontairement construite avec les composants visuels déjà présents
   dans l'application : teacher-entry, objectif-box, tab-btn, rec-box, etc. */
(function(){
  let adminOpenStudentId = null;
  let adminStudentSection = 'dossiers';
  let adminOpenDossier = null;

  /* ---------- Navigation ---------- */
  const baseSidebar = window.renderSidebar;
  window.renderSidebar = function(){
    baseSidebar();
    const sb = document.getElementById('sidebar');
    if(!sb || !student || !student.prenom || screen === 'login') return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="nav-sep"></div>
      ${!isTeacher ? `<button class="nav-btn ${screen==='profil'?'active':''}" style="--tag-color:#3a6df0" onclick="goProfil()"><span class="tag">👤</span> Mon profil</button>` : ''}
      <button class="nav-btn ${screen==='regles'?'active':''}" style="--tag-color:#b8790a" onclick="goRegles()"><span class="tag">ℹ️</span> Règles & fonctionnement</button>`;
    while(wrap.firstChild) sb.appendChild(wrap.firstChild);
  };

  window.goProfil = function(){ if(isTeacher) return; screen='profil'; render(); };
  window.goRegles = function(){ screen='regles'; render(); };

  /* ---------- Règles ---------- */
  function rulesHTML(){
    return `
      <p class="eyebrow">Informations</p>
      <h1 class="page-title">Règles & fonctionnement</h1>
      <div class="objectif-box">
        <p class="fr">Tu trouveras ici les règles utiles pour les cours et l'utilisation de la plateforme. En cas de situation particulière, écris-moi directement dans la messagerie.</p>
      </div>
      ${ruleBlock('Réservation et replanification','Les cours sont réservés depuis la plateforme selon les créneaux disponibles. Une demande de déplacement peut être faite tant que le cours est à plus d’une heure de son début. Le créneau initial reste réservé jusqu’à l’acceptation de la nouvelle proposition.')}
      ${ruleBlock('Annulation tardive et absence','Une annulation ou une absence à moins d’une heure du cours est considérée comme tardive. Deux tolérances sont prévues sur une période de 30 jours. Au-delà, une séance annulée tardivement par l’élève est perdue.')}
      ${ruleBlock('Forfaits',`Les forfaits contiennent entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances. Le nombre de séances utilisées et restantes est visible dans « Mon profil ».`)}
      ${ruleBlock('Suivi pédagogique','Chaque dossier possède son propre bilan. Lorsqu’un dossier est terminé et évalué par la professeure, il apparaît comme « Accompli » dans le profil de l’élève avec son bilan et, lorsqu’elle est renseignée, sa note.')}
      ${ruleBlock('Communication','La messagerie de la plateforme est le point de contact privilégié pour les questions liées aux cours, aux exercices et à l’organisation.')}`;
  }
  function ruleBlock(title,text){
    return `<div class="teacher-entry"><div class="who">${title}</div><div class="meta" style="line-height:1.65;margin-top:6px;">${text}</div></div>`;
  }

  /* ---------- Helpers dossiers / bilans ---------- */
  function dossierKey(s,num){ return s.niveau ? bilanKey(s.niveau,num) : null; }
  function dossierBilan(s,num){ const k=dossierKey(s,num); return k && s.bilans ? s.bilans[k] : null; }
  function dossierName(num){ const d=(dossiersMenu||[]).find(x=>x.num===num); return d ? d.name : `Dossier ${num}`; }
  function dossierStatus(s,num){
    if(dossierBilan(s,num)) return 'done';
    if(num===CURRENT_DOSSIER_NUM) return 'current';
    return 'later';
  }
  function statusHTML(status){
    if(status==='done') return '<span class="done-badge">✓ Accompli</span>';
    if(status==='current') return '<span class="admin-pill">En cours</span>';
    return '<span class="admin-pill" style="color:var(--grey);">À venir</span>';
  }
  function dossierRowsHTML(s, admin){
    if(!s.niveau) return '<p class="teacher-empty">Le niveau doit d’abord être attribué.</p>';
    return (dossiersMenu||[]).map(d=>{
      const b=dossierBilan(s,d.num), status=dossierStatus(s,d.num);
      const clickable=admin || !!b;
      return `<div class="teacher-entry" ${clickable?`style="cursor:pointer;" onclick="${admin?`openAdminDossier('${s.id}',${d.num})`:`toggleStudentDossier(${d.num})`}"`:''}>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div><div class="who">Dossier ${d.num} — ${esc(d.name)}</div>${b&&b.date?`<div class="meta">Bilan du ${fmtSimpleDate(b.date)}</div>`:''}</div>
          <div style="display:flex;align-items:center;gap:8px;">${b&&b.note20!=null?`<span class="grade-badge" style="margin:0;padding:5px 10px;font-size:12px;">${b.note20}/20</span>`:''}${statusHTML(status)}</div>
        </div>
        ${!admin && b && window.__studentOpenDossier===d.num ? bilanReadHTML(b) : ''}
      </div>`;
    }).join('');
  }
  function fmtSimpleDate(v){
    try{ return new Date(v).toLocaleDateString('fr-FR'); }catch(e){ return ''; }
  }
  function bilanReadHTML(b){
    const checked=(b.items||[]).map((ok,i)=>ok&&bilanItems[i]?`<li>${esc(bilanItems[i])}</li>`:'').filter(Boolean).join('');
    return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line);">
      ${checked?`<div class="meta"><b>Acquis validés</b><ul style="margin:7px 0 0;padding-left:20px;line-height:1.6;">${checked}</ul></div>`:''}
      ${b.note?`<div class="meta" style="margin-top:9px;"><b>Commentaire de Melissa</b><br>${esc(b.note)}</div>`:''}
    </div>`;
  }
  window.toggleStudentDossier=function(num){ window.__studentOpenDossier=window.__studentOpenDossier===num?null:num; render(); };

  /* ---------- Profil élève ---------- */
  async function renderStudentProfile(){
    const c=document.getElementById('content'); if(!c)return;
    c.innerHTML='<p class="teacher-empty">Chargement…</p>';
    let s={...student};
    try{const d=await db.collection('eleves').doc(student.uid).get();if(d.exists)s={id:d.id,...d.data()};}catch(e){}
    const p=s.pack||{}, remaining=Math.max(0,(p.total||0)-(p.used||0));
    c.innerHTML=`
      <p class="eyebrow">Mon espace</p>
      <h1 class="page-title">Mon profil</h1>
      <div class="objectif-box">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
          <div><p class="fr" style="margin:0;font-weight:700;color:var(--navy);">${esc(s.prenom)} ${esc(s.nom)}</p><p class="meta" style="margin:4px 0 0;">${esc(s.email||'')}${s.telephone?' · '+esc(s.telephone):''}</p></div>
          ${s.niveau?`<span class="level-pill" style="margin:0;">Niveau ${esc(s.niveau)}</span>`:''}
        </div>
      </div>
      <div class="teacher-entry"><div class="who">Organisation des cours</div><div class="meta" style="margin-top:6px;">${s.frequence?`${s.frequence} séance${s.frequence>1?'s':''} par semaine`:'Rythme à définir'} · ${p.total?`${remaining} séance${remaining>1?'s':''} restante${remaining>1?'s':''} sur ${p.total}`:'Aucun forfait défini'}</div></div>
      <h2 class="section-title">Mes dossiers</h2>
      <p class="meta" style="margin:-5px 0 12px;">Ton bilan apparaît ici lorsqu'un dossier est accompli.</p>
      ${dossierRowsHTML(s,false)}`;
  }

  /* ---------- Rendu global ---------- */
  const baseRender=window.render;
  window.render=function(){
    if(screen==='profil'&&!isTeacher){renderSidebar();renderStudentProfile();window.scrollTo(0,0);return;}
    if(screen==='regles'){renderSidebar();const c=document.getElementById('content');if(c)c.innerHTML=rulesHTML();window.scrollTo(0,0);return;}
    return baseRender();
  };

  /* ---------- Liste élèves admin ---------- */
  window.renderTeacherStudentsList=function(){
    const body=document.getElementById('teacher-body');if(!body)return;
    if(adminOpenStudentId){const s=studentsData.find(x=>x.id===adminOpenStudentId);if(s){renderAdminStudent(s);return;}adminOpenStudentId=null;}
    if(!studentsData.length){body.innerHTML='<p class="teacher-empty">Aucun élève inscrit pour le moment.</p>';return;}
    body.innerHTML=`<div class="teacher-toolbar"><input id="student-filter" type="text" placeholder="Rechercher un élève…"></div><div id="student-list" style="margin-top:14px;"></div>`;
    const input=document.getElementById('student-filter');input.oninput=()=>renderAdminList(input.value);renderAdminList('');
  };
  function renderAdminList(q){
    const list=document.getElementById('student-list');if(!list)return;const n=norm(q||'');
    const arr=studentsData.filter(s=>!n||norm(`${s.prenom} ${s.nom} ${s.email||''}`).includes(n));
    list.innerHTML=arr.length?arr.map(s=>{
      const completed=(dossiersMenu||[]).filter(d=>!!dossierBilan(s,d.num)).length;
      return `<div class="teacher-entry" style="cursor:pointer;" onclick="openAdminStudent('${s.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div><div class="who">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}</div></div>
          <div style="display:flex;gap:7px;align-items:center;">${s.niveau?`<span class="level-pill" style="margin:0;padding:5px 10px;font-size:12px;">${esc(s.niveau)}</span>`:'<span class="admin-pill" style="color:var(--bad);">Niveau à attribuer</span>'}<span class="admin-pill">${completed} dossier${completed>1?'s':''} accompli${completed>1?'s':''}</span></div>
        </div>
      </div>`;
    }).join(''):'<p class="teacher-empty">Aucun élève ne correspond à cette recherche.</p>';
  }

  window.openAdminStudent=function(id){adminOpenStudentId=id;adminStudentSection='dossiers';adminOpenDossier=null;renderTeacherStudentsList();};
  window.closeAdminStudent=function(){adminOpenStudentId=null;adminOpenDossier=null;renderTeacherStudentsList();};
  window.setAdminStudentSection=function(section){adminStudentSection=section;adminOpenDossier=null;const s=studentsData.find(x=>x.id===adminOpenStudentId);if(s)renderAdminStudent(s);};

  function renderAdminStudent(s){
    const body=document.getElementById('teacher-body');if(!body)return;
    const p=s.pack||{};
    body.innerHTML=`
      <button class="tab-btn" onclick="closeAdminStudent()">← Tous les élèves</button>
      <div class="objectif-box" style="margin-top:14px;margin-bottom:16px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
          <div><p class="fr" style="margin:0;font-weight:700;color:var(--navy);">${esc(s.prenom)} ${esc(s.nom)}</p><p class="meta" style="margin:4px 0 0;">${esc(s.email||'')}${s.telephone?' · '+esc(s.telephone):''}</p></div>
          <button class="tab-btn" onclick="previewStudent('${s.id}')">Voir comme l'élève</button>
        </div>
      </div>
      <div class="teacher-tabs" style="flex-wrap:wrap;">${[['dossiers','Dossiers & bilans'],['profil','Profil'],['forfait','Forfait']].map(x=>`<button class="tab-btn ${adminStudentSection===x[0]?'active':''}" onclick="setAdminStudentSection('${x[0]}')">${x[1]}</button>`).join('')}</div>
      <div id="admin-student-section">${adminSectionHTML(s,p)}</div>`;
  }

  function adminSectionHTML(s,p){
    if(adminStudentSection==='profil'){
      return `<div class="teacher-entry"><div class="who">Informations pédagogiques</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;">
          <label class="field" style="margin:0;"><span style="display:block;font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:5px;">Niveau</span><select id="niv-${s.id}" style="padding:9px;border:1px solid var(--line);border-radius:8px;">${['',...niveauxMenu.map(n=>n.code)].map(x=>`<option value="${x}" ${(s.niveau||'')===x?'selected':''}>${x||'— À attribuer —'}</option>`).join('')}</select></label>
          <label class="field" style="margin:0;"><span style="display:block;font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:5px;">Rythme</span><select id="freq-${s.id}" style="padding:9px;border:1px solid var(--line);border-radius:8px;">${['',1,2,3,4,5].map(x=>`<option value="${x}" ${String(s.frequence||'')===String(x)?'selected':''}>${x?x+' séance'+(x>1?'s':'')+'/semaine':'— À définir —'}</option>`).join('')}</select></label>
        </div><button class="rec-btn" style="margin-top:12px;" onclick="saveAdminProfile('${s.id}')">Enregistrer</button></div>`;
    }
    if(adminStudentSection==='forfait'){
      return `<div class="teacher-entry"><div class="who">Forfait de cours</div><div class="meta" style="margin-top:5px;">${p.total?`${p.used||0}/${p.total} séances utilisées · ${Math.max(0,p.total-(p.used||0))} restantes`:'Aucun forfait défini'}</div><div class="field" style="margin-top:12px;max-width:220px;"><label>Nombre de séances (${FORFAIT_MIN}-${FORFAIT_MAX})</label><input type="number" id="admin-pack-${s.id}" min="${FORFAIT_MIN}" max="${FORFAIT_MAX}" value="${p.total||''}"></div><button class="rec-btn" onclick="saveAdminPack('${s.id}')">Enregistrer</button></div>`;
    }
    if(adminOpenDossier!==null) return dossierEditorHTML(s,adminOpenDossier);
    return `<p class="meta" style="margin:0 0 12px;">Ouvre un dossier pour compléter son bilan. L'enregistrement du bilan marque le dossier comme accompli.</p>${dossierRowsHTML(s,true)}`;
  }

  /* ---------- Bilan par dossier ---------- */
  window.openAdminDossier=function(id,num){adminOpenStudentId=id;adminOpenDossier=num;adminStudentSection='dossiers';const s=studentsData.find(x=>x.id===id);if(s)renderAdminStudent(s);};
  window.closeAdminDossier=function(){adminOpenDossier=null;const s=studentsData.find(x=>x.id===adminOpenStudentId);if(s)renderAdminStudent(s);};

  function dossierEditorHTML(s,num){
    if(!s.niveau) return `<div class="rec-box"><p class="rec-consigne">Attribue d'abord un niveau à ${esc(s.prenom)} dans l'onglet Profil.</p><button class="tab-btn" onclick="closeAdminDossier()">Retour aux dossiers</button></div>`;
    const key=bilanKey(s.niveau,num), b=(s.bilans&&s.bilans[key])||{}, items=b.items||[];
    return `<button class="tab-btn" onclick="closeAdminDossier()">← Dossiers & bilans</button>
      <div class="rec-box" style="margin-top:12px;">
        <p class="rec-consigne" style="font-weight:700;">Dossier ${num} — ${esc(dossierName(num))}</p>
        <p class="meta" style="margin:3px 0 12px;">Niveau ${esc(s.niveau)} · Le bilan enregistré marquera ce dossier comme accompli.</p>
        ${bilanItems.map((t,i)=>`<label style="display:flex;align-items:flex-start;gap:8px;font-size:13.5px;margin-bottom:7px;"><input type="checkbox" id="db-${s.id}-${num}-${i}" ${items[i]?'checked':''}> <span>${esc(t)}</span></label>`).join('')}
        <div class="field" style="margin-top:13px;max-width:130px;"><label>Note / 20</label><input id="db-note20-${s.id}-${num}" type="number" min="0" max="20" step="0.5" value="${b.note20!=null?b.note20:''}" placeholder="ex. 15"></div>
        <div class="field"><label>Commentaire pour l'élève</label><textarea id="db-comment-${s.id}-${num}" style="width:100%;min-height:80px;padding:9px;border:1px solid var(--line);border-radius:8px;font-family:'Inter',sans-serif;">${esc(b.note||'')}</textarea></div>
        <button class="rec-btn" onclick="saveDossierBilan('${s.id}',${num})">${b.date?'Mettre à jour le bilan':'Valider le dossier comme accompli'}</button>
      </div>`;
  }

  window.saveDossierBilan=async function(id,num){
    const s=studentsData.find(x=>x.id===id);if(!s||!s.niveau)return;
    const key=bilanKey(s.niveau,num);
    const items=bilanItems.map((_,i)=>document.getElementById(`db-${id}-${num}-${i}`).checked);
    const raw=document.getElementById(`db-note20-${id}-${num}`).value;
    const note20=raw===''?null:Number(raw);
    if(note20!==null&&(note20<0||note20>20)){alert('La note doit être comprise entre 0 et 20.');return;}
    const note=document.getElementById(`db-comment-${id}-${num}`).value.trim();
    await db.collection('eleves').doc(id).update({[`bilans.${key}`]:{items,note,note20,date:new Date().toISOString()}});
    await loadTeacherStudents();adminOpenStudentId=id;adminStudentSection='dossiers';adminOpenDossier=null;renderTeacherStudentsList();
  };

  window.saveAdminProfile=async function(id){
    const niv=document.getElementById('niv-'+id).value,f=document.getElementById('freq-'+id).value;
    await db.collection('eleves').doc(id).update({niveau:niv||null,frequence:f?parseInt(f,10):null});
    await loadTeacherStudents();adminOpenStudentId=id;adminStudentSection='profil';renderTeacherStudentsList();
  };
  window.saveAdminPack=async function(id){
    const v=parseInt(document.getElementById('admin-pack-'+id).value,10);
    if(!v||v<FORFAIT_MIN||v>FORFAIT_MAX){alert(`Le forfait doit contenir entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances.`);return;}
    const s=studentsData.find(x=>x.id===id),updates={'pack.total':v};if(!(s.pack&&typeof s.pack.used==='number'))updates['pack.used']=0;
    await db.collection('eleves').doc(id).update(updates);await loadTeacherStudents();adminOpenStudentId=id;adminStudentSection='forfait';renderTeacherStudentsList();
  };

  /* ---------- Aperçu élève ---------- */
  window.previewStudent=function(id){
    const s=studentsData.find(x=>x.id===id);if(!s)return;const body=document.getElementById('teacher-body'),p=s.pack||{},remaining=Math.max(0,(p.total||0)-(p.used||0));
    body.innerHTML=`<button class="tab-btn" onclick="openAdminStudent('${s.id}')">← Retour à la fiche</button>
      <div class="objectif-box" style="margin-top:14px;"><p class="fr" style="margin:0;"><b>Aperçu élève</b> — cette vue est en lecture seule.</p></div>
      <p class="eyebrow">Mon espace</p><h2 class="page-title" style="font-family:'Fraunces',serif;color:var(--navy);">Mon profil</h2>
      <div class="teacher-entry"><div class="who">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}</div></div>
      <div class="teacher-entry"><div class="who">Organisation des cours</div><div class="meta" style="margin-top:6px;">${s.frequence?`${s.frequence} séance${s.frequence>1?'s':''} par semaine`:'Rythme à définir'} · ${p.total?`${remaining} séance${remaining>1?'s':''} restante${remaining>1?'s':''} sur ${p.total}`:'Aucun forfait défini'}</div></div>
      <h2 class="section-title">Mes dossiers</h2>${dossierRowsHTML(s,false)}`;
  };
})();