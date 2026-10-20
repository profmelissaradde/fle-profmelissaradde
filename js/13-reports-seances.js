/* ======================= REPORTS DE SÉANCES & SYNCHRONISATION ZOOM =======================
   Toutes les modifications définitives de date passent par l'Apps Script (fonctions
   rpt*_ dans apps-script/Code.gs) : le navigateur ne modifie plus lui-même la date
   d'une séance ni son lien Zoom. Ce fichier regroupe les appels côté application et
   l'affichage des statuts, pour éviter de dupliquer ce code dans chaque écran.

   États d'une séance réservée (voir rptEtat) :
     anomalie         séance passée non confirmée (pas comptée comme effectuée)
     report_propose   anomalie / cours avec une proposition de la professeure en attente
     zoom_attente     nouvelle date enregistrée, réunion Zoom pas encore synchronisée
     zoom_erreur      synchronisation Zoom en échec (Melissa a été prévenue)
     a_venir          séance future confirmée
     effectuee        séance passée sans anomalie
*/

async function rptCall(payload){
  let r;
  try{ r = await callDriveScript(payload); }
  catch(e){ throw new Error("Le serveur ne répond pas pour le moment (" + (e && e.message ? e.message : e) + "). Réessaie dans quelques minutes : rien n'a été modifié."); }
  if(!r) throw new Error("Réponse vide du serveur. Réessaie dans quelques minutes.");
  return r;
}

/* Proposition de la professeure (anomalie ou cours à venir). */
async function rptProposer(slot, proposedISO, duree){
  let r = await rptCall({action:'proposeReschedule', slotId: slot.id, proposedDate: proposedISO, proposedDuree: duree || slot.duree || 45});
  if(!r.ok && r.conflict){
    if(!confirm(`⚠️ ${r.error}\n\nProposer quand même ce créneau ?`)) return {ok:false, cancelled:true};
    r = await rptCall({action:'proposeReschedule', slotId: slot.id, proposedDate: proposedISO, proposedDuree: duree || slot.duree || 45, ignoreConflicts: true});
  }
  if(!r.ok) throw new Error(r.error || 'Proposition impossible.');
  return r;
}

/* Réponse de l'élève à la proposition (même procédure que le lien de l'e-mail). */
async function rptRepondre(slot, decision){
  const req = slot.rescheduleRequest || {};
  const r = await rptCall({action:'respondReschedule', slotId: slot.id, proposalId: req.id || null, decision});
  if(!r.ok) throw new Error(r.error || 'Action impossible.');
  return r;
}

/* Décision de la professeure : une des disponibilités de l'élève, ou changement direct. */
async function rptAppliquer(slot, newISO, duree, reason){
  let r = await rptCall({action:'applyTeacherReschedule', slotId: slot.id, newDate: newISO, duree: duree || slot.duree || 45, reason});
  if(!r.ok && r.conflict){
    if(!confirm(`⚠️ ${r.error}\n\nDéplacer quand même ?`)) return {ok:false, cancelled:true};
    r = await rptCall({action:'applyTeacherReschedule', slotId: slot.id, newDate: newISO, duree: duree || slot.duree || 45, reason, ignoreConflicts: true});
  }
  if(!r.ok) throw new Error(r.error || 'Déplacement impossible.');
  return r;
}

async function rptRelancerZoom(slotId){
  try{
    const r = await rptCall({action:'retryZoomSync', slotId});
    alert(r.ok ? '✅ Réunion Zoom synchronisée.' : `⚠️ Synchronisation toujours impossible : ${r.error || r.zoomStatus || 'erreur inconnue'}. Une nouvelle tentative automatique aura lieu.`);
  }catch(e){ alert(e.message); }
  if(typeof loadAdminDispo === 'function' && screen === 'teacher' && teacherTab === 'dispo') await loadAdminDispo();
  else if(screen === 'teacher' && teacherTab === 'accueil' && typeof profDashboardLoad === 'function') await profDashboardLoad();
  else if(typeof loadTeacherHistorique === 'function') await loadTeacherHistorique();
}

/* Message de résultat d'une acceptation / d'un déplacement. */
function rptMessageZoom(r){
  if(!r) return '';
  if(r.zoomStatus === 'ok') return 'La réunion Zoom a été mise à jour automatiquement.';
  if(r.zoomStatus === 'error') return '⚠️ La réunion Zoom n\'a pas pu être mise à jour : Melissa a été prévenue.';
  return '⏳ Synchronisation Zoom en attente : elle se terminera automatiquement dans quelques minutes.';
}

/* ---- Statuts ---- */
function rptZoomSyncEnCours(s){
  const zs = s && s.zoomSync;
  return !!(zs && zs.status && zs.status !== 'ok' && zs.targetDate === s.date);
}
function rptPropositionEnAttente(s){
  return !!(s && s.rescheduleRequest && s.rescheduleRequest.by === 'teacher' && s.rescheduleRequest.status === 'pending');
}
function rptEtat(s, now){
  now = now || Date.now();
  if(s.anomalie) return rptPropositionEnAttente(s) ? 'report_propose' : 'anomalie';
  if(rptZoomSyncEnCours(s)) return s.zoomSync.status === 'error' ? 'zoom_erreur' : 'zoom_attente';
  const fin = new Date(s.date).getTime() + (s.duree || 45) * 60000;
  return fin < now ? 'effectuee' : 'a_venir';
}
/* Compteurs « Élèves et niveaux » : une séance en anomalie n'est ni effectuée ni à
   venir ; une séance reportée et acceptée compte comme « à venir » (même si Zoom est
   encore en cours de synchronisation). */
function rptCompteurs(slots, now){
  const c = {effectuees:0, aVenir:0, anomalies:0, zoomAttente:0, nextDate:null};
  (slots||[]).forEach(s=>{
    if(!s.reservedBy || s.experimentalCancelled || s.definitivelyCancelled) return;
    const e = rptEtat(s, now);
    if(e === 'anomalie' || e === 'report_propose'){ c.anomalies++; return; }
    if(e === 'effectuee'){ c.effectuees++; return; }
    c.aVenir++;
    if(e === 'zoom_attente' || e === 'zoom_erreur') c.zoomAttente++;
    if(!c.nextDate || new Date(s.date) < new Date(c.nextDate)) c.nextDate = s.date;
  });
  return c;
}
function rptCompteursHTML(c){
  return `📆 <b>${c.effectuees}</b> séance${c.effectuees>1?'s':''} effectuée${c.effectuees>1?'s':''} · <b>${c.aVenir}</b> à venir · <b style="color:${c.anomalies ? 'var(--bad)' : 'inherit'}">${c.anomalies}</b> anomalie${c.anomalies>1?'s':''} en attente`
    + (c.zoomAttente ? ` · <b style="color:var(--c-warning)">${c.zoomAttente} synchro Zoom en attente</b>` : '');
}

/* Badge pour les listes de l'espace enseignante. */
function rptBadgeHTML(s, withRetry){
  const parts = [];
  const req = s.rescheduleRequest || {};
  if(rptPropositionEnAttente(s)) parts.push(`<span class="rpt-badge wait">📨 Report proposé au ${fmtSlotDate(req.proposedDate)} — en attente de l'élève</span>`);
  else if(s.anomalie && req.by === 'teacher' && req.status === 'refused') parts.push(`<span class="rpt-badge bad">✋ Report du ${fmtSlotDate(req.proposedDate)} refusé par l'élève</span>`);
  if(rptZoomSyncEnCours(s)){
    const zs = s.zoomSync;
    parts.push(zs.status === 'error'
      ? `<span class="rpt-badge bad" title="${esc(zs.lastError||'')}">⚠️ Synchronisation Zoom en échec</span>`
      : `<span class="rpt-badge wait" title="${esc(zs.lastError||'')}">⏳ Synchronisation Zoom en attente</span>`);
    if(withRetry && isTeacher) parts.push(`<button class="rpt-mini" onclick="rptRelancerZoom('${s.id}')">↻ Relancer la synchronisation Zoom</button>`);
  } else if(s.originalDate && s.zoomSync && s.zoomSync.status === 'ok'){
    parts.push(`<span class="rpt-badge ok">🔁 Reporté (initialement le ${fmtSlotDate(s.originalDate)}) · Zoom à jour</span>`);
  }
  return parts.length ? `<div class="rpt-badges">${parts.join(' ')}</div>` : '';
}
