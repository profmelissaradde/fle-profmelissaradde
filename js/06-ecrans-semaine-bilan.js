/* ======================= MÉDIA / EXERCICE / ENREGISTREMENT ======================= */
function mediaHTML(day){
  let html = '';
  if(day.media){
    day.media.forEach(m=>{
      if(m.type==='audio'){
        html += `<div class="media-block"><p class="section-label">🎧 Écouter — Ouvir</p><audio controls src="${m.url}"></audio></div>`;
      } else if(m.type==='video'){
        html += `<div class="media-block"><p class="section-label">▶ Regarder — Assistir</p><iframe src="https://www.youtube.com/embed/${m.id}" loading="lazy" allowfullscreen></iframe></div>`;
      }
    });
  }
  if(day.link){
    html += `<a class="source-link" href="${day.link.url}" target="_blank" rel="noopener">🔗 ${day.link.label}</a>`;
  }
  return html;
}
function exoHTML(day, uid){
  if(!day.exo) return '';
  if(day.exo.type==='qcm'){
    const opts = day.exo.options.map((o,i)=>`<button class="exo-opt" onclick="answerQCM('${uid}',${i},${day.exo.correct})">${o}</button>`).join('');
    return `<div class="exo-box">
      <p class="exo-consigne"><span class="label-fr">Consigne —</span> Choisis la bonne réponse.</p>
      <p class="exo-consigne-pt">🇧🇷 Escolha a resposta certa.</p>
      <p class="exo-question">${day.exo.q}</p>
      <div class="exo-options" id="opts-${uid}">${opts}</div>
      <p class="exo-feedback" id="fb-${uid}"></p>
    </div>`;
  }
  if(day.exo.type==='texte'){
    return `<div class="exo-box">
      <p class="exo-consigne"><span class="label-fr">Consigne —</span> Complète la phrase.</p>
      <p class="exo-consigne-pt">🇧🇷 Complete a frase.</p>
      <p class="exo-question">${day.exo.q}</p>
      <div class="exo-text-row">
        <input type="text" id="in-${uid}" placeholder="Ta réponse / Sua resposta">
        <button onclick='checkTexte("${uid}", ${JSON.stringify(day.exo.accept)})'>Vérifier</button>
      </div>
      <p class="exo-feedback" id="fb-${uid}"></p>
    </div>`;
  }
  return '';
}
function recHTML(day, uid){
  return `<div class="rec-box">
    <p class="rec-consigne"><span class="label-fr">🎙️ À enregistrer —</span> ${day.rec.fr}</p>
    <p class="rec-consigne-pt">🇧🇷 ${day.rec.pt}</p>
    <div class="rec-controls">
      <button class="rec-btn" id="btn-${uid}" onclick="toggleRec('${uid}')">● Enregistrer</button>
      <span class="rec-time" id="time-${uid}">00:00</span>
    </div>
    <div id="player-${uid}"></div>
    <p class="rec-status" id="status-${uid}">Ton enregistrement sera envoyé automatiquement à ta professeure.</p>
  </div>`;
}

/* ======================= ÉCRAN : SEMAINE ======================= */
function renderWeek(w){
  const c = document.getElementById('content');
  const idx = weeks.findIndex(x=>x.id===w.id);
  c.innerHTML = `
    <p class="eyebrow">Dossier 0 · Unité ${w.id} / 5</p>
    <h1 class="page-title">${w.title_fr}</h1>
    <div class="objectif-box">
      <p class="fr"><span class="label-fr">Objectif —</span> ${w.objectif_fr}</p>
      <p class="pt">🇧🇷 <span class="label-pt">Objetivo —</span> ${w.objectif_pt}</p>
    </div>
    <p class="section-label" style="margin:0 0 4px; font-size:13px; text-transform:none; letter-spacing:0; font-weight:600; color:var(--ink);">📌 ${rhythmMessage().fr}</p>
    <p class="section-label" style="margin:0 0 12px; font-size:12px; text-transform:none; letter-spacing:0; font-weight:400; color:var(--pt); font-style:italic;">🇧🇷 ${rhythmMessage().pt}</p>
    <div class="day-grid" id="day-grid"></div>
    <div class="oral-box">
      <h4>🗣️ Séance orale (1h) — ${w.oral_title_fr}</h4>
      <p class="pt-title">🇧🇷 ${w.oral_title_pt}</p>
      <ul class="oral-list">${w.oral.map(o=>`<li>${o.fr}<span class="pt">🇧🇷 ${o.pt}</span></li>`).join('')}</ul>
    </div>
    <div class="week-footer">
      <button id="prevBtn" ${idx===0?'disabled':''}>← Unité précédente</button>
      <button id="nextBtn">${idx===weeks.length-1 ? 'Voir le bilan final →' : 'Unité suivante →'}</button>
    </div>
  `;
  const grid = document.getElementById('day-grid');
  w.days.forEach((day,i)=>{
    const uid = `w${w.id}d${i+1}`;
    const key = activityKey(w.tag, day.num);
    const done = !!(student.completed && student.completed[key]);
    if(done){ exoDone[uid] = true; recDone[uid] = true; celebrated[uid] = true; }
    const el = document.createElement('div');
    el.className = 'day-card';
    el.innerHTML = `
      <div class="day-top"><span class="day-num">${day.num}</span><span class="day-dur">${day.dur}</span>${done ? '<span class="done-badge">✅ Fait</span>' : ''}</div>
      <h3 class="day-title">${day.title_fr}</h3>
      <p class="day-title-pt">🇧🇷 ${day.title_pt}</p>
      ${mediaHTML(day)}
      ${exoHTML(day, uid)}
      ${recHTML(day, uid)}
    `;
    grid.appendChild(el);
  });
  document.getElementById('prevBtn').onclick = ()=>{ if(weeks[idx-1]) goWeek(weeks[idx-1].id); };
  document.getElementById('nextBtn').onclick = ()=>{ if(weeks[idx+1]) goWeek(weeks[idx+1].id); else goBilan(); };
}

/* ======================= ÉCRAN : BILAN ======================= */
function renderBilan(){
  const c = document.getElementById('content');
  const key = bilanKey(niveau, CURRENT_DOSSIER_NUM);
  const bilanData = (student.bilans || {})[key];
  let body;
  if(bilanData){
    const rows = bilanItems.map((t,i)=>{
      const ok = bilanData.items && bilanData.items[i];
      return `<tr><td>${t}</td><td class="check">${ok ? '✅' : '➖'}</td></tr>`;
    }).join('');
    body = `
      <table class="bilan-table"><thead><tr><th>Je sais... / Eu sei...</th><th>Prof</th></tr></thead>
      <tbody>${rows}</tbody></table>
      ${(bilanData.note20 !== undefined && bilanData.note20 !== null && bilanData.note20 !== '') ? `<div class="grade-badge">📝 Note : <b>${bilanData.note20}</b> / 20</div>` : ''}
      ${bilanData.note ? `<div class="objectif-box" style="margin-top:18px;"><p class="fr"><span class="label-fr">Commentaire de ta professeure —</span> ${bilanData.note}</p></div>` : ''}
      <p class="rec-status" style="margin-top:14px;">Dernière mise à jour : ${fmtDate(bilanData.date)}</p>
    `;
  } else {
    body = `
      <div class="objectif-box">
        <p class="fr">Ta professeure n'a pas encore complété ton bilan. Elle le fera avec toi à la fin de l'unité 5, pendant votre séance.</p>
        <p class="pt">🇧🇷 Sua professora ainda não preencheu seu balanço. Ela fará isso com você no final da unidade 5, durante a aula.</p>
      </div>
    `;
  }
  c.innerHTML = `
    <p class="eyebrow">Dossier 0 · Bilan final</p>
    <h1 class="page-title">Bilan de fin de module</h1>
    ${body}
    <div class="week-footer">
      <button onclick="goWeek(5)">← Retour à l'unité 5</button>
      <button onclick="refreshBilan()">↻ Actualiser</button>
    </div>
  `;
}

