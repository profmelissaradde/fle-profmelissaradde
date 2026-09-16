/* ======================= PROFILS, RÈGLES & FICHES ÉLÈVES ======================= */
(function(){
  let adminOpenStudentId = null;
  let adminStudentSection = 'profil';

  const baseSidebar = window.renderSidebar;
  window.renderSidebar = function(){
    baseSidebar();
    const sb = document.getElementById('sidebar');
    if(!sb || !student || !student.prenom || screen === 'login') return;

    const anchor = sb.querySelector('.nav-sep:last-of-type');
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="nav-sep"></div>
      ${!isTeacher ? `<button class="nav-btn ${screen==='profil'?'active':''}" style="--tag-color:#3a6df0" onclick="goProfil()"><span class="tag">👤</span> Mon profil</button>` : ''}
      <button class="nav-btn ${screen==='regles'?'active':''}" style="--tag-color:#b8790a" onclick="goRegles()"><span class="tag">ℹ️</span> Règles & fonctionnement</button>`;
    while(wrap.firstChild) sb.appendChild(wrap.firstChild);
  };

  window.goProfil = function(){ if(isTeacher) return; screen='profil'; render(); };
  window.goRegles = function(){ screen='regles'; render(); };

  function rulesHTML(){
    return `
      <p class="eyebrow">Informations</p>
      <h1 class="page-title">Règles & fonctionnement</h1>
      <div class="objectif-box"><p class="fr">Ces règles permettent de garder une organisation claire et équitable pour les cours. En cas de situation particulière, contacte Melissa directement depuis la messagerie.</p></div>
      <div class="teacher-entry"><div class="who">📅 Réservation et replanification</div><div class="meta" style="line-height:1.65;margin-top:7px;">Les cours sont réservés depuis la plateforme selon les créneaux disponibles. Une demande de déplacement peut être faite tant que le cours est à plus d'une heure de son début. Le créneau initial reste réservé jusqu'à l'acceptation de la nouvelle proposition.</div></div>
      <div class="teacher-entry"><div class="who">⏰ Annulation tardive et absence</div><div class="meta" style="line-height:1.65;margin-top:7px;">Une annulation ou absence à moins d'une heure du cours est considérée comme tardive. Deux tolérances sont prévues sur une période de 30 jours. Au-delà, une séance annulée tardivement par l'élève est perdue. Si l'annulation tardive vient de la professeure au-delà de cette tolérance, la séance doit être remboursée ou régularisée.</div></div>
      <div class="teacher-entry"><div class="who">📦 Forfaits</div><div class="meta" style="line-height:1.65;margin-top:7px;">Les forfaits contiennent entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances. Le nombre de séances utilisées et restantes est visible dans le profil de l'élève.</div></div>
      <div class="teacher-entry"><div class="who">🎓 Suivi pédagogique</div><div class="meta" style="line-height:1.65;margin-top:7px;">Le niveau, la progression, les activités réalisées, les bilans et les évaluations visibles sont consultables depuis « Mon profil ». Les notes privées de la professeure restent réservées à l'espace admin.</div></div>
      <div class="teacher-entry"><div class="who">💬 Communication</div><div class="meta" style="line-height:1.65;margin-top:7px;">La messagerie de la plateforme est le point de contact privilégié pour les questions liées aux cours, aux exercices et à l'organisation.</div></div>`;
  }

  async function renderStudentProfile(){
    const c=document.getElementById('content'); if(!c) return;
    c.innerHTML='<p class="teacher-empty">Chargement du profil…</p>';
    let s={...student};
    try{ const d=await db.collection('eleves').doc(student.uid).get(); if(d.exists) s={id:d.id,...d.data()}; }catch(e){}
    const stats=typeof completionStats==='function'?completionStats(s.completed):{total:Object.keys(s.completed||{}).length,thisWeek:0};
    const pack=s.pack||{}, total=pack.total||0, used=pack.used||0, remaining=Math.max(0,total-used);
    const evals=(s.evaluations||[]).filter(e=>e.visible!==false).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    const currentWeek=weeks.find(w=>w.tag===s.uniteCourante);
    c.innerHTML=`
      <p class="eyebrow">Mon espace</p><h1 class="page-title">Mon profil</h1>
      <div class="teacher-entry" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;"><div><div class="who" style="font-size:20px;">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}${s.telephone?' · '+esc(s.telephone):''}</div></div><span class="level-pill" style="margin:0;">${s.niveau?'Niveau '+esc(s.niveau):'Niveau à attribuer'}</span></div>
      </div>
      <div class="slot-grid" style="margin-top:14px;">
        <div class="slot-card"><div class="slot-date">📍 Progression</div><div class="meta">${currentWeek?`Unité ${currentWeek.id}/5 — ${esc(currentWeek.title_fr)}`:'Pas encore commencée'}</div><div class="meta" style="margin-top:5px;">${stats.total}/${typeof TOTAL_ACTIVITIES!=='undefined'?TOTAL_ACTIVITIES:'—'} activités réalisées</div></div>
        <div class="slot-card"><div class="slot-date">📦 Mon forfait</div><div class="meta">${total?`${used}/${total} séances utilisées`:'Aucun forfait défini'}</div>${total?`<div class="meta" style="margin-top:5px;"><b>${remaining}</b> séance${remaining>1?'s':''} restante${remaining>1?'s':''}</div>`:''}</div>
        <div class="slot-card"><div class="slot-date">🗓️ Mon rythme</div><div class="meta">${s.frequence?`${s.frequence} séance${s.frequence>1?'s':''} par semaine`:'Rythme non défini'}</div></div>
      </div>
      <h2 class="section-title">Mes évaluations</h2>
      ${evals.length?evals.map(e=>evaluationReadHTML(e)).join(''):'<p class="teacher-empty">Aucune évaluation publiée pour le moment.</p>'}
      <h2 class="section-title">Mes bilans</h2>
      ${studentBilansHTML(s)}`;
  }

  function studentBilansHTML(s){
    const bs=s.bilans||{}, keys=Object.keys(bs); if(!keys.length) return '<p class="teacher-empty">Aucun bilan disponible pour le moment.</p>';
    return keys.map(k=>{const b=bs[k]||{};return `<div class="teacher-entry"><div class="who">${esc(k.replace('_',' · '))}${b.note20!=null?` <span class="grade-badge" style="margin:0 0 0 8px;padding:4px 9px;font-size:12px;">${b.note20}/20</span>`:''}</div>${b.note?`<div class="meta" style="margin-top:7px;">${esc(b.note)}</div>`:''}</div>`;}).join('');
  }

  function evaluationReadHTML(e){
    const skills=e.skills||{};
    const labels={oral:'Expression orale',comprehension:'Compréhension',prononciation:'Prononciation',grammaire:'Grammaire & vocabulaire',ecrit:'Expression écrite'};
    return `<div class="teacher-entry"><div class="who">${esc(e.title||'Évaluation')} <span class="meta" style="font-weight:400;">${e.date?' · '+esc(e.date):''}</span></div><div style="display:flex;gap:7px;flex-wrap:wrap;margin:9px 0;">${Object.keys(labels).map(k=>skills[k]!=null?`<span class="admin-pill">${labels[k]} · ${skills[k]}/5</span>`:'').join('')}</div>${e.strengths?`<div class="meta"><b>Points forts :</b> ${esc(e.strengths)}</div>`:''}${e.workOn?`<div class="meta"><b>À travailler :</b> ${esc(e.workOn)}</div>`:''}${e.comment?`<div class="meta" style="margin-top:5px;">${esc(e.comment)}</div>`:''}</div>`;
  }

  const baseRender=window.render;
  window.render=function(){
    if(screen==='profil' && !isTeacher){ renderSidebar(); renderStudentProfile(); window.scrollTo(0,0); return; }
    if(screen==='regles'){ renderSidebar(); const c=document.getElementById('content'); if(c)c.innerHTML=rulesHTML(); window.scrollTo(0,0); return; }
    return baseRender();
  };

  window.renderTeacherStudentsList=function(){
    const body=document.getElementById('teacher-body'); if(!body)return;
    if(adminOpenStudentId){ const s=studentsData.find(x=>x.id===adminOpenStudentId); if(s){ renderAdminStudentCard(s); return; } adminOpenStudentId=null; }
    if(!studentsData.length){body.innerHTML='<p class="teacher-empty">Aucun élève inscrit pour le moment.</p>';return;}
    body.innerHTML=`<div class="teacher-toolbar" style="margin-bottom:14px;"><input id="student-card-filter" type="text" placeholder="Rechercher un élève…"></div><div id="student-cards"></div>`;
    const input=document.getElementById('student-card-filter'); input.oninput=()=>renderStudentCards(input.value); renderStudentCards('');
  };

  function renderStudentCards(q){
    const list=document.getElementById('student-cards'); if(!list)return; const n=norm(q||'');
    const arr=studentsData.filter(s=>!n||norm(`${s.prenom} ${s.nom} ${s.email||''}`).includes(n));
    list.innerHTML=arr.map(s=>{const st=completionStats(s.completed), p=s.pack||{}, rem=Math.max(0,(p.total||0)-(p.used||0));return `<div class="teacher-entry" style="cursor:pointer;padding:17px 18px;" onclick="openAdminStudent('${s.id}')"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;"><div><div class="who">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}</div></div><span class="admin-pill" style="${s.niveau?'background:var(--ok-bg);color:var(--ok);':'background:var(--bad-bg);color:var(--bad);'}">${s.niveau?'Niveau '+esc(s.niveau):'Niveau à attribuer'}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"><span class="admin-pill">✓ ${st.total} activités</span><span class="admin-pill">📅 ${s.frequence?s.frequence+'/sem.':'rythme à définir'}</span><span class="admin-pill">📦 ${p.total?rem+' restante'+(rem>1?'s':''):'aucun forfait'}</span></div></div>`;}).join('');
  }

  window.openAdminStudent=function(id){adminOpenStudentId=id;adminStudentSection='profil';renderTeacherStudentsList();};
  window.closeAdminStudent=function(){adminOpenStudentId=null;renderTeacherStudentsList();};
  window.setAdminStudentSection=function(section){adminStudentSection=section;const s=studentsData.find(x=>x.id===adminOpenStudentId);if(s)renderAdminStudentCard(s);};

  function renderAdminStudentCard(s){
    const body=document.getElementById('teacher-body'), st=completionStats(s.completed), p=s.pack||{}, rem=Math.max(0,(p.total||0)-(p.used||0));
    body.innerHTML=`<button class="tab-btn" onclick="closeAdminStudent()">← Tous les élèves</button>
      <div class="teacher-entry" style="margin-top:14px;padding:20px;"><div style="display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;"><div><div class="who" style="font-size:20px;">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}${s.telephone?' · '+esc(s.telephone):''}</div></div><button class="tab-btn" onclick="previewStudent('${s.id}')">👁 Voir comme l'élève</button></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:13px;"><span class="admin-pill">${s.niveau?'Niveau '+esc(s.niveau):'Niveau à attribuer'}</span><span class="admin-pill">✓ ${st.total} activités</span><span class="admin-pill">📦 ${p.total?rem+' restante'+(rem>1?'s':''):'aucun forfait'}</span></div></div>
      <div class="teacher-tabs" style="margin-top:14px;flex-wrap:wrap;">${[['profil','Profil'],['suivi','Suivi'],['evaluations','Évaluations'],['forfait','Forfait']].map(x=>`<button class="tab-btn ${adminStudentSection===x[0]?'active':''}" onclick="setAdminStudentSection('${x[0]}')">${x[1]}</button>`).join('')}</div>
      <div id="admin-student-section">${adminStudentSectionHTML(s)}</div>`;
  }

  function adminStudentSectionHTML(s){
    if(adminStudentSection==='profil') return `<div class="teacher-entry"><div class="who">Informations pédagogiques</div><div class="field" style="margin-top:12px;"><label>Niveau</label><select id="niv-${s.id}" style="padding:9px;border:1px solid var(--line);border-radius:8px;">${['',...niveauxMenu.map(n=>n.code)].map(x=>`<option value="${x}" ${(s.niveau||'')===x?'selected':''}>${x||'— À attribuer —'}</option>`).join('')}</select></div><div class="field"><label>Rythme</label><select id="freq-${s.id}" style="padding:9px;border:1px solid var(--line);border-radius:8px;">${['',1,2,3,4,5].map(x=>`<option value="${x}" ${String(s.frequence||'')===String(x)?'selected':''}>${x?x+' séance'+(x>1?'s':'')+'/semaine':'— À définir —'}</option>`).join('')}</select></div><button class="rec-btn" onclick="saveAdminProfile('${s.id}')">Enregistrer</button></div>`;
    if(adminStudentSection==='suivi'){const st=completionStats(s.completed),w=weeks.find(x=>x.tag===s.uniteCourante);return `<div class="slot-grid"><div class="slot-card"><div class="slot-date">Progression</div><div class="meta">${w?`Unité ${w.id}/5 — ${esc(w.title_fr)}`:'Pas encore commencée'}</div></div><div class="slot-card"><div class="slot-date">Activités</div><div class="meta">${st.total}/${TOTAL_ACTIVITIES} au total · ${st.thisWeek} cette semaine</div></div></div><div style="margin-top:14px;">${studentBilansHTML(s)}</div>`;}
    if(adminStudentSection==='forfait'){const p=s.pack||{};return `<div class="teacher-entry"><div class="who">Forfait de cours</div><div class="field" style="margin-top:12px;max-width:220px;"><label>Nombre de séances (${FORFAIT_MIN}-${FORFAIT_MAX})</label><input type="number" id="admin-pack-${s.id}" min="${FORFAIT_MIN}" max="${FORFAIT_MAX}" value="${p.total||''}"></div><div class="meta" style="margin-bottom:12px;">${p.total?`${p.used||0}/${p.total} séances utilisées · ${Math.max(0,p.total-(p.used||0))} restantes`:'Aucun forfait défini'}</div><button class="rec-btn" onclick="saveAdminPack('${s.id}')">Enregistrer le forfait</button></div>`;}
    const evals=s.evaluations||[]; return `<div class="teacher-entry"><div class="who">Nouvelle évaluation</div>${['oral','comprehension','prononciation','grammaire','ecrit'].map(k=>`<label style="display:inline-block;margin:10px 10px 0 0;font-size:12px;font-weight:700;">${k==='oral'?'Expression orale':k==='comprehension'?'Compréhension':k==='prononciation'?'Prononciation':k==='grammaire'?'Grammaire & vocabulaire':'Expression écrite'}<input id="ev-${k}" type="number" min="0" max="5" step="0.5" style="display:block;width:72px;margin-top:4px;"></label>`).join('')}<div class="field" style="margin-top:12px;"><label>Points forts</label><textarea id="ev-strengths" style="width:100%;min-height:60px;"></textarea></div><div class="field"><label>À travailler</label><textarea id="ev-work" style="width:100%;min-height:60px;"></textarea></div><div class="field"><label>Commentaire</label><textarea id="ev-comment" style="width:100%;min-height:60px;"></textarea></div><label style="font-size:13px;"><input id="ev-visible" type="checkbox" checked> Visible par l'élève</label><br><button class="rec-btn" style="margin-top:12px;" onclick="saveEvaluation('${s.id}')">Enregistrer l'évaluation</button></div><h2 class="section-title">Historique des évaluations</h2>${evals.length?evals.slice().reverse().map(e=>evaluationReadHTML(e)).join(''):'<p class="teacher-empty">Aucune évaluation.</p>'}`;
  }

  window.saveAdminProfile=async function(id){const niv=document.getElementById('niv-'+id).value,f=document.getElementById('freq-'+id).value;await db.collection('eleves').doc(id).update({niveau:niv||null,frequence:f?parseInt(f,10):null});await loadTeacherStudents();adminOpenStudentId=id;renderTeacherStudentsList();};
  window.saveAdminPack=async function(id){const el=document.getElementById('admin-pack-'+id),v=parseInt(el.value,10);if(!v||v<FORFAIT_MIN||v>FORFAIT_MAX){alert(`Le forfait doit contenir entre ${FORFAIT_MIN} et ${FORFAIT_MAX} séances.`);return;}const s=studentsData.find(x=>x.id===id),updates={'pack.total':v};if(!(s.pack&&typeof s.pack.used==='number'))updates['pack.used']=0;await db.collection('eleves').doc(id).update(updates);await loadTeacherStudents();adminOpenStudentId=id;adminStudentSection='forfait';renderTeacherStudentsList();};
  window.saveEvaluation=async function(id){const s=studentsData.find(x=>x.id===id);if(!s)return;const val=k=>{const v=document.getElementById('ev-'+k).value;return v===''?null:Number(v);};const ev={date:new Date().toISOString().slice(0,10),title:'Évaluation pédagogique',skills:{oral:val('oral'),comprehension:val('comprehension'),prononciation:val('prononciation'),grammaire:val('grammaire'),ecrit:val('ecrit')},strengths:document.getElementById('ev-strengths').value.trim(),workOn:document.getElementById('ev-work').value.trim(),comment:document.getElementById('ev-comment').value.trim(),visible:document.getElementById('ev-visible').checked};await db.collection('eleves').doc(id).update({evaluations:[...(s.evaluations||[]),ev]});await loadTeacherStudents();adminOpenStudentId=id;adminStudentSection='evaluations';renderTeacherStudentsList();};

  window.previewStudent=function(id){const s=studentsData.find(x=>x.id===id);if(!s)return;const body=document.getElementById('teacher-body'),p=s.pack||{},st=completionStats(s.completed),w=weeks.find(x=>x.tag===s.uniteCourante),evals=(s.evaluations||[]).filter(e=>e.visible!==false);body.innerHTML=`<button class="tab-btn" onclick="openAdminStudent('${s.id}')">← Retour à la fiche admin</button><div class="storage-note" style="margin-top:14px;">👁 Aperçu en lecture seule — voici ce que ${esc(s.prenom)} voit dans son profil.</div><p class="eyebrow" style="margin-top:18px;">Mon espace</p><h2 class="page-title" style="font-family:'Fraunces',serif;color:var(--navy);">Mon profil</h2><div class="teacher-entry"><div class="who" style="font-size:20px;">${esc(s.prenom)} ${esc(s.nom)}</div><div class="meta">${esc(s.email||'')}</div></div><div class="slot-grid" style="margin-top:14px;"><div class="slot-card"><div class="slot-date">📍 Progression</div><div class="meta">${w?`Unité ${w.id}/5 — ${esc(w.title_fr)}`:'Pas encore commencée'} · ${st.total}/${TOTAL_ACTIVITIES} activités</div></div><div class="slot-card"><div class="slot-date">📦 Mon forfait</div><div class="meta">${p.total?`${p.used||0}/${p.total} utilisées · ${Math.max(0,p.total-(p.used||0))} restantes`:'Aucun forfait défini'}</div></div></div><h2 class="section-title">Mes évaluations</h2>${evals.length?evals.map(e=>evaluationReadHTML(e)).join(''):'<p class="teacher-empty">Aucune évaluation publiée.</p>'}`;};
})();
