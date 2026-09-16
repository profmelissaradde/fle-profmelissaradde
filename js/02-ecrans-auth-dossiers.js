/* ======================= ÉCRAN : CONNEXION / INSCRIPTION ======================= */
function renderLogin(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="auth-tabs">
          <button class="auth-tab ${authMode==='signup'?'active':''}" onclick="setAuthMode('signup')">Créer un compte</button>
          <button class="auth-tab ${authMode==='signin'?'active':''}" onclick="setAuthMode('signin')">Se connecter</button>
        </div>
        <div id="auth-body"></div>
      </div>
    </div>
  `;
  renderAuthBody();
}
function setAuthMode(mode){ authMode = mode; renderLogin(); }
function renderAuthBody(){
  const el = document.getElementById('auth-body');
  if(!el) return;
  if(authMode==='signup'){
    el.innerHTML = `
      <p class="sub">Crée ton compte. Ta professeure t'attribuera ensuite ton niveau.</p>
      <div class="field"><label>Prénom</label><input id="su-prenom" type="text" placeholder="Ex. João"></div>
      <div class="field"><label>Nom de famille</label><input id="su-nom" type="text" placeholder="Ex. Silva"></div>
      <div class="field"><label>E-mail</label><input id="su-email" type="email" placeholder="joao@exemple.com"></div>
      <div class="field"><label>Pays de résidence</label>
        <input id="su-country" type="text" autocomplete="country-name" placeholder="Ex. France, Brésil, Portugal">
      </div>
      <div class="field"><label>WhatsApp</label>
        <div style="display:grid;grid-template-columns:minmax(150px,42%) 1fr;gap:8px;">
          <select id="su-wa-code" style="width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;font:inherit;background:#fff;">${whatsappCodeOptions('+55')}</select>
          <input id="su-tel" type="tel" autocomplete="tel-national" placeholder="Numéro WhatsApp">
        </div>
      </div>
      <div class="field"><label>CPF</label><input id="su-cpf" type="text" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" oninput="maskSignupCPF(this)"></div>
      <div class="field"><label>Fuseau horaire</label><select id="su-timezone" style="width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;font:inherit;background:#fff;">${timezoneOptions(detectedTimezone())}</select></div>
      <div class="field"><label>Mot de passe</label><div class="pw-wrap"><input id="su-pw" type="password" placeholder="8 caractères minimum"><button type="button" class="pw-toggle" onclick="togglePw('su-pw',this)">👁</button></div></div>
      <div class="field"><label>Confirmer le mot de passe</label><div class="pw-wrap"><input id="su-pw2" type="password" placeholder="••••••••"><button type="button" class="pw-toggle" onclick="togglePw('su-pw2',this)">👁</button></div></div>
      <button class="primary-btn" id="su-btn" onclick="doSignup()">Créer mon compte →</button>
      <p class="login-err" id="auth-err"></p>
    `;
  } else {
    el.innerHTML = `
      <p class="sub">Connecte-toi avec ton e-mail et ton mot de passe.</p>
      <div class="field"><label>E-mail</label><input id="si-email" type="email" placeholder="joao@exemple.com"></div>
      <div class="field"><label>Mot de passe</label><div class="pw-wrap"><input id="si-pw" type="password" placeholder="••••••••"><button type="button" class="pw-toggle" onclick="togglePw('si-pw',this)">👁</button></div></div>
      <button class="primary-btn" id="si-btn" onclick="doSignin()">Se connecter →</button>
      <p class="login-err" id="auth-err"></p>
    `;
  }
}
function showAuthErr(msg){
  const err = document.getElementById('auth-err');
  if(err){ err.textContent = msg; err.style.display = 'block'; }
}
function friendlyAuthError(code){
  const map = {
    'auth/email-already-in-use': "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.",
    'auth/invalid-email': "Cet e-mail ne semble pas valide.",
    'auth/weak-password': "Le mot de passe doit contenir au moins 6 caractères.",
    'auth/user-not-found': "Aucun compte avec cet e-mail. Crée un compte.",
    'auth/wrong-password': "Mot de passe incorrect.",
    'auth/invalid-credential': "E-mail ou mot de passe incorrect.",
    'auth/too-many-requests': "Trop de tentatives. Réessaie dans quelques minutes."
  };
  return map[code] || "Une erreur est survenue. Réessaie.";
}
async function doSignup(){
  const prenom = document.getElementById('su-prenom').value.trim();
  const nom = document.getElementById('su-nom').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const country = document.getElementById('su-country').value.trim();
  const whatsappCode = document.getElementById('su-wa-code').value;
  const telephone = normalizeWhatsApp(whatsappCode, document.getElementById('su-tel').value);
  const cpf = digitsOnly(document.getElementById('su-cpf').value);
  const timezone = document.getElementById('su-timezone').value || detectedTimezone();
  const pw = document.getElementById('su-pw').value;
  const pw2 = document.getElementById('su-pw2').value;

  if(!prenom || !nom || !email || !country || !telephone || !cpf || !timezone || !pw || !pw2){
    showAuthErr('Merci de remplir tous les champs.'); return;
  }
  if(!isValidCPF(cpf)){ showAuthErr("Le CPF renseigné n'est pas valide."); return; }
  if(!isValidEmail(email)){ showAuthErr("Cet e-mail ne semble pas valide."); return; }
  if(pw.length < 8){ showAuthErr('Le mot de passe doit contenir au moins 8 caractères.'); return; }
  if(pw !== pw2){ showAuthErr('Les deux mots de passe ne correspondent pas.'); return; }

  const btn = document.getElementById('su-btn'); if(btn){ btn.disabled = true; btn.textContent = 'Création…'; }
  try{
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    const record = {
      prenom, nom, email, telephone, whatsappCode, country, cpf, timezone,
      niveau: null, frequence: null, uniteCourante: null,
      status: 'active', registrationSource: 'plateforme', experimentalLesson: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('eleves').doc(cred.user.uid).set(record);
    try{ await cred.user.sendEmailVerification(); }catch(e){ /* non bloquant — le compte reste valide même si l'e-mail échoue */ }
    student = {prenom, nom, email, telephone, whatsappCode, country, timezone, uid: cred.user.uid};
    screen = 'verify';
    render();
  }catch(e){
    showAuthErr(friendlyAuthError(e.code));
    if(btn){ btn.disabled = false; btn.textContent = 'Créer mon compte →'; }
  }
}
async function doSignin(){
  const email = document.getElementById('si-email').value.trim();
  const pw = document.getElementById('si-pw').value;
  if(!email || !pw){ showAuthErr('Merci de renseigner ton e-mail et ton mot de passe.'); return; }
  const btn = document.getElementById('si-btn'); if(btn){ btn.disabled = true; btn.textContent = 'Connexion…'; }
  try{
    const cred = await auth.signInWithEmailAndPassword(email, pw);
    if(cred.user.uid === TEACHER_UID){
      isTeacher = true;
      /* Le compte admin garde toujours son niveau "vue élève" (par défaut A1, modifiable
         dans la barre latérale via les pastilles de niveau) — pas besoin de forfait ni
         d'attribution de niveau côté Firestore pour accéder au Thème de la semaine, aux
         dossiers, etc. Voir setAdminNiveau() dans 01-utilitaires-nav.js. */
      niveau = niveau || 'A1'; current = null;
      student = {prenom:'Melissa', nom:'Radde', email: cred.user.email || email, telephone:'', uid: cred.user.uid, uniteCourante:null, frequence:null, temas:{}};
      teacherTab = 'eleves';
      screen = 'teacher';
      startTeacherPresenceHeartbeat();
      startTeacherMessagesListener();
      render();
      return;
    }
    const doc = await db.collection('eleves').doc(cred.user.uid).get();
    if(!doc.exists){ showAuthErr("Ce compte n'a pas de profil élève associé."); return; }
    const profileData = doc.data();
    if(profileData.status === 'archived'){
      await auth.signOut();
      showAuthErr("Ce compte a été archivé. Contacte la professeure si tu souhaites reprendre les cours.");
      return;
    }
    if(!cred.user.emailVerified){
      const d = doc.data();
      student = {prenom:d.prenom, nom:d.nom, email:d.email, telephone:d.telephone, uid: cred.user.uid};
      screen = 'verify';
      render();
      return;
    }
    afterAuth(cred.user.uid, doc.data());
  }catch(e){
    showAuthErr(friendlyAuthError(e.code));
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = 'Se connecter →'; }
  }
}

/* ======================= ÉCRAN : CONFIRMATION E-MAIL ======================= */
function renderVerify(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <h1>Confirme ton e-mail 📧</h1>
        <p class="sub">Un e-mail de confirmation a été envoyé à <b>${student.email}</b>. Ouvre-le et clique sur le lien, puis reviens ici.</p>
        <p class="sub" style="color:var(--pt); font-style:italic;">🇧🇷 Um e-mail de confirmação foi enviado para ${student.email}. Abra-o e clique no link, depois volte aqui.</p>
        <button class="primary-btn" onclick="checkVerification()">↻ J'ai confirmé, continuer</button>
        <button class="primary-btn" style="background:var(--grey); margin-top:8px;" onclick="resendVerification()">📨 Renvoyer l'e-mail</button>
        <p class="login-err" id="verify-err"></p>
      </div>
    </div>
  `;
}
async function checkVerification(){
  try{
    await auth.currentUser.reload();
    if(auth.currentUser.emailVerified){
      const doc = await db.collection('eleves').doc(auth.currentUser.uid).get();
      if(doc.exists) afterAuth(auth.currentUser.uid, doc.data());
    } else {
      const err = document.getElementById('verify-err');
      if(err){ err.textContent = "Pas encore confirmé — vérifie ta boîte mail (et les spams)."; err.style.display='block'; }
    }
  }catch(e){
    const err = document.getElementById('verify-err');
    if(err){ err.textContent = "Erreur, réessaie."; err.style.display='block'; }
  }
}
async function resendVerification(){
  try{
    await auth.currentUser.sendEmailVerification();
    const err = document.getElementById('verify-err');
    if(err){ err.textContent = "E-mail renvoyé !"; err.className='login-err'; err.style.color='var(--ok)'; err.style.display='block'; }
  }catch(e){
    const err = document.getElementById('verify-err');
    if(err){ err.textContent = "Impossible de renvoyer l'e-mail pour le moment, réessaie plus tard."; err.style.display='block'; }
  }
}
function renderWaiting(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <h1>Compte créé ✅</h1>
        <p class="sub">Merci ${student.prenom} ! Ta professeure doit maintenant t'attribuer ton niveau. Reviens un peu plus tard, ou clique sur « Vérifier » une fois qu'elle te l'a confirmé.</p>
        <p class="sub" style="color:var(--pt); font-style:italic;">🇧🇷 Obrigado, ${student.prenom}! Sua professora ainda precisa atribuir seu nível. Volte mais tarde, ou clique em "Verificar" depois que ela confirmar.</p>
        <button class="primary-btn" onclick="refreshNiveau()">↻ Vérifier mon niveau</button>
      </div>
    </div>
  `;
}
async function refreshNiveau(){
  try{
    const doc = await db.collection('eleves').doc(student.uid).get();
    if(doc.exists){
      const rec = doc.data();
      if(rec.niveau){ niveau = rec.niveau; screen = 'dossiers'; render(); return; }
    }
  }catch(e){}
  alert("Ton niveau n'a pas encore été attribué par ta professeure. Réessaie un peu plus tard.");
}

/* ======================= ÉCRAN : DOSSIERS ======================= */
/* ======================= ÉCRAN : PHRASES DE SURVIE ======================= */
const survieCategories = [
  {
    titre: "🏫 En classe", couleur:"#3a6df0",
    phrases: [
      ["Je ne comprends pas.", "Não entendo."],
      ["Vous pouvez répéter, s'il vous plaît ?", "Pode repetir, por favor?"],
      ["Comment on dit... en français ?", "Como se diz... em francês?"],
      ["Comment ça s'écrit ?", "Como se escreve isso?"],
      ["Pouvez-vous parler plus lentement ?", "Pode falar mais devagar?"],
      ["Je peux aller aux toilettes ?", "Posso ir ao banheiro?"]
    ]
  },
  {
    titre: "🚨 Urgences", couleur:"#ef476f",
    phrases: [
      ["Au secours !", "Socorro!"],
      ["Appelez une ambulance, s'il vous plaît.", "Chame uma ambulância, por favor."],
      ["Appelez la police.", "Chame a polícia."],
      ["J'ai besoin d'un médecin.", "Preciso de um médico."],
      ["Où est l'hôpital le plus proche ?", "Onde fica o hospital mais próximo?"],
      ["Je me suis perdu(e).", "Eu me perdi."]
    ]
  },
  {
    titre: "🧭 Se déplacer", couleur:"#06a77d",
    phrases: [
      ["Où sont les toilettes ?", "Onde fica o banheiro?"],
      ["Comment aller à la gare ?", "Como chego à estação?"],
      ["C'est loin d'ici ?", "É longe daqui?"],
      ["Un billet pour..., s'il vous plaît.", "Uma passagem para..., por favor."],
      ["Je cherche le métro/bus.", "Estou procurando o metrô/ônibus."],
      ["Pouvez-vous m'indiquer le chemin ?", "Pode me indicar o caminho?"]
    ]
  },
  {
    titre: "🍽️ Manger & acheter", couleur:"#e8590c",
    phrases: [
      ["L'addition, s'il vous plaît.", "A conta, por favor."],
      ["Combien ça coûte ?", "Quanto custa?"],
      ["Je voudrais..., s'il vous plaît.", "Eu gostaria de..., por favor."],
      ["Est-ce qu'il y a du gluten/lactose ?", "Tem glúten/lactose?"],
      ["Vous acceptez la carte bancaire ?", "Vocês aceitam cartão?"],
      ["C'est trop cher.", "Está muito caro."]
    ]
  },
  {
    titre: "🤝 Demander de l'aide", couleur:"#8338ec",
    phrases: [
      ["Pouvez-vous m'aider, s'il vous plaît ?", "Pode me ajudar, por favor?"],
      ["Je ne parle pas bien français.", "Não falo bem francês."],
      ["Parlez-vous anglais / portugais ?", "Você fala inglês / português?"],
      ["Je suis touriste / étudiant(e).", "Sou turista / estudante."],
      ["Excusez-moi de vous déranger.", "Desculpe incomodar."],
      ["Merci beaucoup, c'est gentil.", "Muito obrigado(a), muita gentileza."]
    ]
  }
];
function speakText(text, lang){
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }catch(e){ /* synthèse vocale non disponible sur ce navigateur */ }
}
function renderSurvie(){
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="week-footer" style="margin-top:0; margin-bottom:18px;"><button onclick="goDossiers()">← Retour aux dossiers</button><div></div></div>
    <p class="eyebrow">Toujours accessible, quel que soit ton niveau</p>
    <h1 class="page-title">🆘 Phrases de survie</h1>
    <div class="objectif-box">
      <p class="fr">Des phrases utiles à connaître par cœur, pour te débrouiller en classe et à l'extérieur, même grand débutant. Clique sur 🔊 pour écouter la prononciation.</p>
      <p class="pt">🇧🇷 Frases úteis para saber de cor, para se virar em sala de aula e fora dela, mesmo sendo iniciante. Clique em 🔊 para ouvir a pronúncia.</p>
    </div>
    <div id="survie-grid" class="day-grid"></div>
  `;
  const grid = document.getElementById('survie-grid');
  survieCategories.forEach(cat=>{
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.setProperty('--accent', cat.couleur);

    const h3 = document.createElement('h3');
    h3.className = 'day-title';
    h3.style.marginBottom = '12px';
    h3.textContent = cat.titre;
    card.appendChild(h3);

    cat.phrases.forEach(p=>{
      const row = document.createElement('div');
      row.style.cssText = 'padding:9px 0; border-top:1px solid var(--line);';

      const frP = document.createElement('p');
      frP.style.cssText = 'margin:0; font-weight:600; font-size:14.5px; display:flex; align-items:center; gap:8px;';
      const frSpan = document.createElement('span');
      frSpan.textContent = p[0];
      const frBtn = document.createElement('button');
      frBtn.className = 'speak-btn';
      frBtn.title = 'Écouter en français';
      frBtn.textContent = '🔊';
      frBtn.addEventListener('click', ()=> speakText(p[0], 'fr-FR'));
      frP.appendChild(frSpan);
      frP.appendChild(frBtn);

      const ptP = document.createElement('p');
      ptP.style.cssText = 'margin:2px 0 0; font-size:13px; color:var(--pt); font-style:italic; display:flex; align-items:center; gap:8px;';
      const ptSpan = document.createElement('span');
      ptSpan.textContent = '🇧🇷 ' + p[1];
      const ptBtn = document.createElement('button');
      ptBtn.className = 'speak-btn';
      ptBtn.title = 'Ouvir em português';
      ptBtn.textContent = '🔊';
      ptBtn.addEventListener('click', ()=> speakText(p[1], 'pt-BR'));
      ptP.appendChild(ptSpan);
      ptP.appendChild(ptBtn);

      row.appendChild(frP);
      row.appendChild(ptP);
      card.appendChild(row);
    });

    grid.appendChild(card);
  });
}
