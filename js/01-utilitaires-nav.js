/* ======================= DONNÉES : NIVEAUX (liste utilisée par la professeure) ======================= */
const niveauxMenu = [
  {code:"A1", name:"Débutant"},
  {code:"A2", name:"Élémentaire"},
  {code:"B1", name:"Intermédiaire"},
  {code:"B2", name:"Intermédiaire avancé"},
  {code:"C1", name:"Avancé"},
  {code:"C2", name:"Maîtrise"},
];

/* ======================= DONNÉES : DOSSIERS ======================= */
const dossiersMenu = [
  {num:0, name:"Se présenter & phonétique", open:true},
  {num:1, name:"À venir", open:false},
  {num:2, name:"À venir", open:false},
  {num:3, name:"À venir", open:false},
  {num:4, name:"À venir", open:false},
  {num:5, name:"À venir", open:false},
  {num:6, name:"À venir", open:false},
  {num:7, name:"À venir", open:false},
  {num:8, name:"À venir", open:false},
];

/* ======================= DONNÉES : SEMAINES (Dossier 0) ======================= */
const weeks = [
  {
    id:1, tag:"S1", color:"#3a6df0",
    title_fr:"La phonétique complète du français",
    title_pt:"A fonética completa do francês",
    objectif_fr:"Poser des bases solides de prononciation (alphabet, voyelles orales et nasales, consonnes difficiles, accentuation, liaison) avant d'aborder le vocabulaire et la grammaire.",
    objectif_pt:"Construir uma base sólida de pronúncia (alfabeto, vogais orais e nasais, consoantes difíceis, acentuação, ligação) antes de avançar para vocabulário e gramática.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"L'alphabet français : écouter, répéter, épeler",
        title_pt:"O alfabeto francês: ouvir, repetir, soletrar",
        media:[{type:"audio", url:"https://www.podcastfrancaisfacile.com/wp-content/uploads/files/alphabet.mp3", label:"Écouter l'alphabet (audio)"}],
        link:{url:"https://www.podcastfrancaisfacile.com/premiers-pas/alphabet.html", label:"Voir la leçon complète — Podcast Français Facile"},
        exo:{type:"qcm", q:"Quelle lettre n'existe pas dans l'alphabet français ?", options:["W","K","Ñ","Y"], correct:2},
        rec:{fr:"Épelle ton prénom et ton nom de famille, lettre par lettre.", pt:"Soletre seu nome e sobrenome, letra por letra."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Les voyelles orales du français",
        title_pt:"As vogais orais do francês",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"Tableau des sons du français — Podcast Français Facile"},
        exo:{type:"qcm", q:"Quelle graphie correspond au son [u] (comme dans « vous ») ?", options:["OU","U","EU","OI"], correct:0},
        rec:{fr:"Répète à voix haute : chat, chapeau, tableau, beau.", pt:"Repita em voz alta as palavras acima."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Les voyelles nasales (on, an/en, in, un)",
        title_pt:"As vogais nasais (on, an/en, in, un)",
        media:[{type:"video", id:"asboHKWbPsg", label:"Les voyelles nasales — leçon + 50 exercices"}],
        link:{url:"https://www.francaisavecpierre.com/les-voyelles-nasales-en-francais/", label:"Exercice interactif — Français avec Pierre"},
        exo:{type:"qcm", q:"Quel mot contient une voyelle nasale ?", options:["chat","bon","ami","tu"], correct:1},
        rec:{fr:"Répète : bonjour, maman, vin, un, bon, banc.", pt:"Repita as palavras com sons nasais."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Les consonnes difficiles : R, S/Z, CH/J, U/OU",
        title_pt:"As consoantes difíceis: R, S/Z, CH/J, U/OU",
        link:{url:"https://www.francepodcasts.com/category/phonetique/", label:"Fiches de phonétique — France Podcasts"},
        exo:{type:"qcm", q:"« Rue » et « roue » se distinguent surtout par quel son ?", options:["U vs OU","R vs L","E vs I"], correct:0},
        rec:{fr:"Répète ces paires : tu/tout, rue/roue, chou/joue.", pt:"Repita esses pares de palavras."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"L'accentuation et la liaison",
        title_pt:"A acentuação e a ligação (liaison)",
        media:[{type:"video", id:"xsfdNAPfwoU", label:"Voyelles nasales, liaisons et syllabes complexes"}],
        exo:{type:"qcm", q:"En français, l'accent tonique tombe toujours sur…", options:["la première syllabe","la dernière syllabe","la syllabe du milieu"], correct:1},
        rec:{fr:"Lis à voix haute : « Je m'appelle Melissa et je suis française et brésilienne. »", pt:"Leia essa frase em voz alta."}}
    ],
    oral_title_fr:"Sons et prononciation", oral_title_pt:"Sons e pronúncia",
    oral:[
      {fr:"Épeler à voix haute son prénom, son nom, puis 3 mots vus dans la semaine.", pt:"Soletrar em voz alta seu nome e sobrenome, depois 3 palavras vistas na semana."},
      {fr:"Jeu d'écoute : le professeur dit un mot, l'élève doit dire quel son il entend.", pt:"Jogo de escuta: a professora diz uma palavra, o aluno diz que som ouviu."},
      {fr:"Répétition guidée des sons les plus difficiles pour un lusophone.", pt:"Repetição guiada dos sons mais difíceis para um lusófono."},
      {fr:"Lecture à voix haute de 5 phrases courtes en travaillant l'accent final et la liaison.", pt:"Leitura em voz alta de 5 frases curtas trabalhando o acento final e a ligação."}
    ]
  },
  {
    id:2, tag:"S2", color:"#06a77d",
    title_fr:"Se présenter et faire connaissance",
    title_pt:"Se apresentar e conhecer alguém",
    objectif_fr:"Saluer, dire son nom et prénom, épeler son identité, utiliser les verbes être et s'appeler, accorder les adjectifs de nationalité au masculin/féminin.",
    objectif_pt:"Cumprimentar, dizer nome e sobrenome, soletrar sua identidade, usar os verbos être e s'appeler, fazer a concordância dos adjetivos de nacionalidade.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Saluer : bonjour, bonsoir, au revoir",
        title_pt:"Cumprimentar: bonjour, bonsoir, au revoir",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Salutations de base + 15 dialogues"},
        exo:{type:"qcm", q:"Quelle salutation utilise-t-on le soir, en arrivant ?", options:["Bonjour","Bonsoir","Bonne nuit"], correct:1},
        rec:{fr:"Dis : bonjour, bonsoir, au revoir, à bientôt.", pt:"Diga essas quatro saudações em voz alta."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Se présenter : phrases modèles",
        title_pt:"Se apresentar: frases-modelo",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Se présenter, phrases modèles + modèles DELF A1"},
        exo:{type:"texte", q:"Complète : « Je ___ Melissa. »", accept:["m'appelle","mappelle","m appelle"]},
        rec:{fr:"Présente-toi en 2 phrases (nom, prénom).", pt:"Apresente-se em 2 frases (nome, sobrenome)."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Les verbes être et s'appeler",
        title_pt:"Os verbos être e s'appeler",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Page débutant — verbes et présentation"},
        exo:{type:"qcm", q:"Comment conjugue-t-on ÊTRE à la 1ère personne (je) ?", options:["suis","es","est"], correct:0},
        rec:{fr:"Dis à voix haute : je suis, tu es, il est / je m'appelle, tu t'appelles.", pt:"Diga essa conjugação em voz alta."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Masculin/féminin des nationalités",
        title_pt:"Masculino/feminino das nacionalidades",
        link:{url:"https://www.francepodcasts.com/2019/12/23/les-nationalites/", label:"Les nationalités — règles et exemples"},
        exo:{type:"texte", q:"Quel est le féminin de « brésilien » ?", accept:["brésilienne","bresilienne"]},
        rec:{fr:"Dis 3 nationalités au masculin, puis au féminin.", pt:"Diga 3 nacionalidades no masculino e no feminino."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Épeler son identité + révision",
        title_pt:"Soletrar sua identidade + revisão",
        link:{url:"https://www.podcastfrancaisfacile.com/premiers-pas/alphabet.html", label:"Rappel : l'alphabet (audio)"},
        exo:{type:"qcm", q:"Quelle lettre suit le K dans l'alphabet ?", options:["J","L","M"], correct:1},
        rec:{fr:"Enregistre ta présentation complète (4 phrases) pour la séance orale.", pt:"Grave sua apresentação completa (4 frases) para a aula."}}
    ],
    oral_title_fr:"Se présenter", oral_title_pt:"Se apresentar",
    oral:[
      {fr:"Chacun se présente à tour de rôle (nom, prénom, nationalité) sans support écrit.", pt:"Cada um se apresenta por vez, sem apoio escrito."},
      {fr:"Jeu de rôle : « rencontre dans un café ».", pt:"Jogo de papéis: 'encontro em um café'."},
      {fr:"Questions/réponses libres : « Comment tu t'appelles ? », « Tu es d'où ? »", pt:"Perguntas e respostas livres sobre nome e origem."}
    ]
  },
  {
    id:3, tag:"S3", color:"#ef476f",
    title_fr:"Nationalités, pays et langues",
    title_pt:"Nacionalidades, países e línguas",
    objectif_fr:"Nommer des pays et nationalités (accord masculin/féminin), utiliser les articles définis et le genre des noms de pays, dire quelle(s) langue(s) on parle.",
    objectif_pt:"Nomear países e nacionalidades, usar os artigos definidos e o gênero dos nomes de países, dizer qual(is) língua(s) se fala.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Pays, habitants, capitales",
        title_pt:"Países, habitantes, capitais",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Liste pays / habitants / capitales (audio)"},
        exo:{type:"qcm", q:"Quelle est la capitale de la France ?", options:["Lyon","Marseille","Paris"], correct:2},
        rec:{fr:"Dis le nom de 5 pays et leur capitale.", pt:"Diga o nome de 5 países e suas capitais."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Les nationalités en vidéo",
        title_pt:"As nacionalidades em vídeo",
        media:[{type:"video", id:"zt1Se2Knufo", label:"Les nationalités — vocabulaire niveau A1"}],
        exo:{type:"texte", q:"Comment dit-on « brésiliennes » (féminin pluriel) ?", accept:["brésiliennes","bresiliennes"]},
        rec:{fr:"Dis 5 nationalités au féminin.", pt:"Diga 5 nacionalidades no feminino."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Genre des pays + articles définis",
        title_pt:"Gênero dos países + artigos definidos",
        link:{url:"https://www.francepodcasts.com/2019/12/23/les-nationalites/", label:"Le genre des noms de pays — France Podcasts"},
        exo:{type:"qcm", q:"Quel article utilise-t-on avec « Brésil » ?", options:["le","la","les"], correct:0},
        rec:{fr:"Dis : le Brésil, la France, les États-Unis.", pt:"Diga esses três nomes de países com o artigo."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Dire quelle langue on parle",
        title_pt:"Dizer qual língua se fala",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Page débutant — langues et nationalités"},
        exo:{type:"texte", q:"Complète : « Au Brésil, on parle ___. »", accept:["portugais"]},
        rec:{fr:"Dis : Je parle... / Au Brésil, on parle...", pt:"Diga essas duas frases sobre você e seu país."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Mots transparents + personnalités",
        title_pt:"Palavras transparentes + personalidades",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Page débutant — mots et personnalités françaises"},
        exo:{type:"qcm", q:"Lequel de ces mots est presque identique en français et en portugais ?", options:["hôpital / hospital","chien / cachorro","table / mesa"], correct:0},
        rec:{fr:"Nomme 3 personnalités françaises connues.", pt:"Diga o nome de 3 personalidades francesas conhecidas."}}
    ],
    oral_title_fr:"Pays, langues, nationalités", oral_title_pt:"Países, línguas, nacionalidades",
    oral:[
      {fr:"Tour du monde à l'oral : « Je viens du Brésil, je suis brésilien(ne), je parle portugais. »", pt:"Volta ao mundo oral."},
      {fr:"Jeu de devinettes sur les nationalités et pays.", pt:"Jogo de adivinhação sobre nacionalidades e países."},
      {fr:"Discussion libre sur des personnalités françaises ou brésiliennes connues.", pt:"Conversa livre sobre personalidades conhecidas."}
    ]
  },
  {
    id:4, tag:"S4", color:"#e8590c",
    title_fr:"Compter de 0 à 69",
    title_pt:"Contar de 0 a 69",
    objectif_fr:"Comprendre et dire les nombres de 0 à 69, noter un nombre entendu, donner et comprendre un numéro de téléphone.",
    objectif_pt:"Compreender e dizer os números de 0 a 69, anotar um número ouvido, dar e entender um número de telefone.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Les nombres de 0 à 9",
        title_pt:"Os números de 0 a 9",
        link:{url:"https://www.francepodcasts.com/2019/04/13/les-chiffres-de-0-a-9-compter-en-francais/", label:"Les chiffres de 0 à 9 (audio)"},
        exo:{type:"qcm", q:"Comment écrit-on 7 en lettres ?", options:["sept","six","huit"], correct:0},
        rec:{fr:"Compte à voix haute de 0 à 9.", pt:"Conte em voz alta de 0 a 9."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Les nombres de 10 à 19",
        title_pt:"Os números de 10 a 19",
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/nombres_francais_compter-de-zero-a-100_les_nombres_en_francais_facile_apprendre_a_compter.html", label:"Compter de zéro à 100 (vidéo par étapes)"},
        exo:{type:"qcm", q:"Quel nombre vient après « treize » ?", options:["quatorze","quinze","douze"], correct:0},
        rec:{fr:"Compte à voix haute de 10 à 19.", pt:"Conte em voz alta de 10 a 19."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Les nombres de 20 à 69",
        title_pt:"Os números de 20 a 69",
        media:[{type:"audio", url:"https://www.podcastfrancaisfacile.com/wp-content/uploads/2021/11/serie-1.mp3", label:"Écoute : série de nombres 1"}],
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/entrainement-nombres-de-1-a-100-exercice-decoute.html", label:"Entraînement nombres de 1 à 100"},
        exo:{type:"qcm", q:"Comment dit-on 47 ?", options:["quarante-sept","quatre-sept","cinquante-sept"], correct:0},
        rec:{fr:"Compte à voix haute de 20 à 69, par dizaines.", pt:"Conte em voz alta de 20 a 69, de dez em dez."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Le numéro de téléphone",
        title_pt:"O número de telefone",
        media:[{type:"audio", url:"https://www.podcastfrancaisfacile.com/wp-content/uploads/files/serie-1-1.mp3", label:"Écoute : numéros de téléphone"}],
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/les-numeros-de-telephone.html", label:"Exercice complet — numéros de téléphone"},
        exo:{type:"qcm", q:"Dans l'audio, quel est le numéro de téléphone de Pierre ?", options:["02 38 47 21 52","06 41 58 30 12","03 54 32 31 49"], correct:0},
        rec:{fr:"Dis ton numéro de téléphone en français.", pt:"Diga seu número de telefone em francês."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Dictée de nombres + révision",
        title_pt:"Ditado de números + revisão",
        link:{url:"https://www.podcastfrancaisfacile.com/apprendre-le-francais/apprendre-les-nombres-en-francais", label:"Index complet — apprendre les nombres"},
        exo:{type:"qcm", q:"60 + 6 = ?", options:["soixante-six","soixante-dix-neuf","cinquante-six"], correct:0},
        rec:{fr:"Dicte 5 nombres entre 0 et 69, pour réviser.", pt:"Dite 5 números entre 0 e 69, para revisar."}}
    ],
    oral_title_fr:"Les nombres", oral_title_pt:"Os números",
    oral:[
      {fr:"Compter à voix haute ensemble de 0 à 69, puis à l'envers.", pt:"Contar em voz alta juntos de 0 a 69, depois ao contrário."},
      {fr:"Dicter et faire dicter des numéros de téléphone.", pt:"Ditar e pedir para ditar números de telefone."},
      {fr:"Petit jeu de calcul oral simple.", pt:"Pequeno jogo de cálculo oral."}
    ]
  },
  {
    id:5, tag:"S5", color:"#8338ec",
    title_fr:"Personnalités, classe et bilan",
    title_pt:"Personalidades, sala de aula e balanço",
    objectif_fr:"Identifier des personnalités françaises connues, utiliser des formules pour communiquer en classe, consolider l'ensemble du module à l'oral.",
    objectif_pt:"Identificar personalidades francesas conhecidas, usar fórmulas para se comunicar em sala de aula, consolidar todo o módulo.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Personnalités françaises connues",
        title_pt:"Personalidades francesas conhecidas",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Page débutant — culture et personnalités"},
        exo:{type:"qcm", q:"Quel était le métier d'Édith Piaf ?", options:["Chanteuse","Actrice","Écrivaine"], correct:0},
        rec:{fr:"Présente une personnalité française en 2 phrases.", pt:"Apresente uma personalidade francesa em 2 frases."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Communiquer en classe",
        title_pt:"Comunicar-se em sala de aula",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"50 phrases pour communiquer en classe"},
        exo:{type:"qcm", q:"Comment demande-t-on une répétition ?", options:["Vous pouvez répéter ?","Vous pouvez chanter ?","Vous pouvez dormir ?"], correct:0},
        rec:{fr:"Dis 5 formules utiles en classe.", pt:"Diga 5 fórmulas úteis para a sala de aula."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Révision : phonétique + nombres",
        title_pt:"Revisão: fonética + números",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"Rappel — tableau des sons du français"},
        exo:{type:"qcm", q:"Quel nombre contient une voyelle nasale ?", options:["cinq","un","deux"], correct:1},
        rec:{fr:"Compte de 0 à 69 en variant le rythme.", pt:"Conte de 0 a 69 variando o ritmo."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Révision : se présenter + nationalités",
        title_pt:"Revisão: se apresentar + nacionalidades",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Rappel — se présenter et nationalités"},
        exo:{type:"texte", q:"Complète : « Je suis brésilienne, je ___ du Brésil. »", accept:["viens"]},
        rec:{fr:"Refais ta présentation complète.", pt:"Refaça sua apresentação completa."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Bilan et auto-évaluation",
        title_pt:"Balanço e autoavaliação",
        link:{url:"https://www.podcastfrancaisfacile.com/", label:"Podcast Français Facile — pour continuer"},
        exo:null,
        rec:{fr:"Enregistre un bilan oral : ce que tu as appris ce mois-ci.", pt:"Grave um balanço oral do que você aprendeu."}}
    ],
    oral_title_fr:"Bilan oral du module", oral_title_pt:"Balanço oral do módulo",
    oral:[
      {fr:"Présentation orale complète : nom, nationalité, pays, langues, un numéro.", pt:"Apresentação oral completa."},
      {fr:"Mini-entretien type DELF A1.", pt:"Mini-entrevista tipo DELF A1."},
      {fr:"Utilisation active des formules de classe.", pt:"Uso ativo das fórmulas de sala de aula."},
      {fr:"Retour oral du professeur.", pt:"Retorno oral da professora."}
    ]
  }
];

const bilanItems = [
  "Reconnaître et prononcer les sons du français (voyelles orales, nasales)",
  "Épeler mon nom et mon prénom en français",
  "Me présenter (nom, prénom, nationalité)",
  "Dire quelle(s) langue(s) je parle et d'où je viens",
  "Compter de 0 à 69 et donner un numéro de téléphone",
  "Utiliser des formules pour communiquer en classe"
];

/* ======================= UTILITAIRES ======================= */
function slug(s){
  return (s||"").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-+|-+$)/g,'') || "eleve";
}
function norm(s){
  return s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'");
}
function fmtDate(ts){
  try{
    const d = ts && ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }catch(e){ return ''; }
}
function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function digitsOnly(v){ return (v || '').replace(/\D/g,''); }

function formatCPFValue(v){
  const d = digitsOnly(v).slice(0,11);
  return d
    .replace(/^(\d{3})(\d)/,'$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,'.$1-$2');
}
function isValidCPF(v){
  const cpf = digitsOnly(v);
  if(cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for(let i=0;i<9;i++) sum += Number(cpf[i]) * (10-i);
  let d1 = (sum * 10) % 11; if(d1===10) d1=0;
  if(d1 !== Number(cpf[9])) return false;
  sum = 0;
  for(let i=0;i<10;i++) sum += Number(cpf[i]) * (11-i);
  let d2 = (sum * 10) % 11; if(d2===10) d2=0;
  return d2 === Number(cpf[10]);
}
const WHATSAPP_CODES = [
  ['+55','Brésil'],['+33','France'],['+351','Portugal'],['+1','États-Unis / Canada'],
  ['+34','Espagne'],['+39','Italie'],['+44','Royaume-Uni'],['+49','Allemagne'],
  ['+41','Suisse'],['+32','Belgique'],['+352','Luxembourg'],['+31','Pays-Bas'],
  ['+353','Irlande'],['+54','Argentine'],['+56','Chili'],['+57','Colombie'],
  ['+51','Pérou'],['+52','Mexique'],['+598','Uruguay'],['+595','Paraguay'],
  ['+591','Bolivie'],['+593','Équateur'],['+58','Venezuela'],['+81','Japon'],
  ['+82','Corée du Sud'],['+86','Chine'],['+61','Australie'],['+64','Nouvelle-Zélande']
];
function whatsappCodeOptions(selected='+55'){
  return WHATSAPP_CODES.map(([code,name])=>`<option value="${code}" ${code===selected?'selected':''}>${code} — ${name}</option>`).join('');
}
function normalizeWhatsApp(code, value){
  let d = digitsOnly(value);
  const prefix = digitsOnly(code);
  if(d.startsWith(prefix)) d = d.slice(prefix.length);
  while(d.startsWith('0')) d = d.slice(1);
  if(d.length < 6 || d.length > 14) return null;
  return '+' + prefix + d;
}
function detectedTimezone(){
  try{ return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'; }
  catch(e){ return 'Europe/Paris'; }
}
function timezoneOptions(selected){
  let zones = [];
  try{
    zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
  }catch(e){}
  if(!zones.length) zones = ['Europe/Paris','America/Sao_Paulo','America/Manaus','America/Fortaleza','America/Recife','America/Bahia'];
  if(selected && !zones.includes(selected)) zones.unshift(selected);
  return zones.map(z=>`<option value="${z}" ${z===selected?'selected':''}>${z}</option>`).join('');
}
function maskSignupCPF(el){ el.value = formatCPFValue(el.value); }

function togglePw(id, btn){
  const input = document.getElementById(id);
  if(!input) return;
  if(input.type === 'password'){ input.type = 'text'; btn.textContent = '🙈'; }
  else{ input.type = 'password'; btn.textContent = '👁'; }
}
function blobToBase64(blob){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onloadend = ()=> resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
/* Appel au Google Apps Script (upload/suppression dans le Drive de la prof).
   Content-Type text/plain volontaire : ça évite le préflight CORS qui bloquerait
   sinon les requêtes vers un Web App Apps Script depuis un autre nom de domaine. */
async function callDriveScript(payload){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('Réponse HTTP ' + res.status);
  return await res.json();
}

/* ======================= SIDEBAR ======================= */
function renderSidebar(){
  const sb = document.getElementById('sidebar');
  let html = `
    <p class="cover-label">${niveau ? 'Niveau '+niveau+(screen==='week'||screen==='bilan'?' · Dossier 0':'') : 'Français langue étrangère'}</p>
    <h1 class="cover-title">FLE</h1>
  `;
  if(student.prenom && screen!=='login'){
    let progressLine = niveau ? 'Niveau '+niveau : (isTeacher ? 'Compte professeure' : "En attente d'attribution");
    if(niveau && student.uniteCourante){
      const w = weeks.find(x=>x.tag===student.uniteCourante);
      if(w) progressLine += ` · Unité ${w.id}/5`;
    }
    html += `<div class="student-badge"><b>${student.prenom} ${student.nom}</b>${isTeacher ? '<span class="admin-pill">⚙️ Admin</span>' : ''}${progressLine}</div>
    <button class="nav-btn" onclick="goLogin()">🚪 Se déconnecter</button>`;
  }
  if(screen==='week' || screen==='bilan'){
    html += `<button class="nav-btn" onclick="goDossiers()">← Retour aux dossiers</button><div class="nav-sep"></div><nav class="weeks">`;
    weeks.forEach(w=>{
      html += `<button class="nav-btn ${(screen==='week'&&current===w.id)?'active':''}" style="--tag-color:${w.color}" onclick="goWeek(${w.id})"><span class="tag">${w.tag}</span> ${w.title_fr}</button>`;
    });
    html += `<button class="nav-btn ${screen==='bilan'?'active':''}" style="--tag-color:${BILAN_COLOR}" onclick="goBilan()"><span class="tag">✓</span> Bilan final</button></nav>`;
  }
  if(isTeacher && screen!=='login'){
    html += `<div class="nav-sep"></div><p class="nav-section-label">Vue élève (aperçu complet)</p>
      <div class="niveau-switch" style="display:flex; flex-wrap:wrap; gap:6px; padding:0 14px 10px;">
        ${niveauxMenu.map(n=>`<button class="tab-btn ${niveau===n.code?'active':''}" style="padding:4px 10px; font-size:12px;" onclick="setAdminNiveau('${n.code}')">${n.code}</button>`).join('')}
      </div>`;
  }
  if(student.prenom && niveau && screen!=='login'){
    html += `<div class="nav-sep"></div><button class="nav-btn ${screen==='temas'?'active':''}" style="--tag-color:#e08a1e" onclick="goTemas()"><span class="tag">🍅</span> Thème de la semaine</button>`;
    html += `<button class="nav-btn ${screen==='survie'?'active':''}" style="--tag-color:#ef476f" onclick="goSurvie()"><span class="tag">🆘</span> Phrases de survie</button>`;
  }
  if(student.prenom && screen!=='login'){
    html += `<div class="nav-sep"></div><button class="nav-btn ${screen==='reserver'?'active':''}" style="--tag-color:#06a77d" onclick="goReserver()"><span class="tag">📅</span> ${isTeacher ? 'Disponibilités' : 'Réserver un cours'}</button>`;
    html += `<button class="nav-btn ${screen==='forum'?'active':''}" style="--tag-color:#6f42c1" onclick="goForum()"><span class="tag">💬</span> Forum</button>`;
    if(!isTeacher){
      html += `<button class="nav-btn ${screen==='messages'?'active':''}" style="--tag-color:#0d9488" onclick="goMessages()"><span class="tag">✉️</span> Message à Melissa${studentUnreadCount>0?` <span class="admin-pill" style="background:var(--bad); color:#fff;">${studentUnreadCount}</span>`:''}</button>`;
      html += `<button class="nav-btn ${screen==='historique'?'active':''}" style="--tag-color:#8338ec" onclick="goHistorique()"><span class="tag">📚</span> Historique de mes cours</button>`;
    }
  }
  if(isTeacher && screen!=='login'){
    html += `<div class="nav-sep"></div><p class="nav-section-label">Admin</p>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='eleves'?'active':''}" onclick="goTeacherTab('eleves')"><span class="tag">👤</span> Élèves & niveaux</button>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='rec'?'active':''}" onclick="goTeacherTab('rec')"><span class="tag">🎙️</span> Enregistrements</button>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='temas'?'active':''}" onclick="goTeacherTab('temas')"><span class="tag">🍅</span> Suivi thème</button>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='experimental'?'active':''}" onclick="goTeacherTab('experimental')"><span class="tag">🧪</span> Cours expérimental</button>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='messages'?'active':''}" onclick="goTeacherTab('messages')"><span class="tag">✉️</span> Messages${teacherUnreadTotal()>0?` <span class="admin-pill" style="background:var(--bad); color:#fff;">${teacherUnreadTotal()}</span>`:''}</button>`;
    html += `<button class="nav-btn ${screen==='teacher'&&teacherTab==='historique'?'active':''}" onclick="goTeacherTab('historique')"><span class="tag">📚</span> Historique</button>`;
  }
  if(screen==='login' || screen==='verify' || screen==='waiting'){
    html += `<div class="sidebar-foot">🎙️ Les exercices audio sont enregistrés et envoyés directement à ta professeure.</div>`;
  }
  sb.innerHTML = html;
}

/* ======================= NAVIGATION ======================= */
function goLogin(){ isTeacher=false; teacherTab='eleves'; niveau=null; current=null; try{ auth.signOut(); }catch(e){} screen='login'; render(); }
function goWaiting(){ screen='waiting'; render(); }
function goDossiers(){ screen='dossiers'; render(); }
function goSurvie(){ screen='survie'; render(); }
function goTemas(){ screen='temas'; render(); }
/* Change le niveau affiché pour le compte admin (aperçu élève) — jamais écrit dans
   Firestore, aucun forfait ni attribution requis. Si on est sur un écran élève qui
   dépend du niveau, on reste dessus ; sinon on ouvre directement les dossiers. */
function setAdminNiveau(code){
  if(!isTeacher) return;
  niveau = code;
  if(screen!=='temas' && screen!=='dossiers' && screen!=='survie' && screen!=='week' && screen!=='bilan'){
    screen = 'dossiers';
  }
  render();
}
function goReserver(){ screen='reserver'; render(); }
function goForum(){ screen='forum'; render(); }
function goMessages(){ screen='messages'; render(); }
function goHistorique(){ screen='historique'; render(); }
function goTeacherTab(tab){ teacherTab = tab; screen='teacher'; render(); }
function goWeek(id){
  screen='week'; current=id;
  const w = weeks.find(x=>x.id===id);
  if(w) saveProgress(w.tag);
  render();
}
function goBilan(){ screen='bilan'; render(); }
function goTeacher(){ screen='teacher'; render(); }


/* Un dossier peut exister dans plusieurs niveaux : chaque bilan est donc rangé
   sous une clé "NIVEAU_D<numéro>", ex. "A1_D0" pour le Dossier 0 en A1. */
const CURRENT_DOSSIER_NUM = 0;
function bilanKey(niveauCode, dossierNum){ return `${niveauCode}_D${dossierNum}`; }

/* Conseil personnalisé : combien d'activités par jour selon le nombre de séances/semaine attribué par la prof. */
function rhythmMessage(){
  const freq = student.frequence;
  if(!freq){
    return {
      fr: "5 activités courtes (~15 min chacune) à faire avant ta prochaine séance — en un jour ou étalées sur plusieurs, selon ton rythme.",
      pt: "5 atividades curtas (~15 min cada) para fazer antes da próxima aula — em um dia ou espalhadas em vários, no seu ritmo."
    };
  }
  const table = {
    1: {fr:"Tu vois ta professeure 1 fois par semaine : fais environ 1 activité par jour, pour arriver aux 5 avant la séance suivante.",
        pt:"Você vê sua professora 1 vez por semana: faça cerca de 1 atividade por dia, para chegar às 5 antes da próxima aula."},
    2: {fr:"Tu vois ta professeure 2 fois par semaine : fais 2 à 3 activités entre chaque séance.",
        pt:"Você vê sua professora 2 vezes por semana: faça de 2 a 3 atividades entre cada aula."},
    3: {fr:"Tu vois ta professeure 3 fois par semaine : fais 1 à 2 activités par jour entre les séances.",
        pt:"Você vê sua professora 3 vezes por semana: faça de 1 a 2 atividades por dia entre as aulas."},
    4: {fr:"Tu vois ta professeure 4 fois par semaine : fais 1 à 2 activités par jour, ou regroupe-les si tu préfères.",
        pt:"Você vê sua professora 4 vezes por semana: faça de 1 a 2 atividades por dia, ou agrupe-as se preferir."},
    5: {fr:"Tu vois ta professeure presque tous les jours : fais les 5 activités en une seule fois, ou 1 par jour, selon ton temps disponible.",
        pt:"Você vê sua professora quase todos os dias: faça as 5 atividades de uma vez, ou 1 por dia, conforme seu tempo disponível."}
  };
  return table[freq] || table[1];
}

function afterAuth(uid, record){
  student = {
    prenom:record.prenom, nom:record.nom, email:record.email, telephone:record.telephone, uid,
    uniteCourante: record.uniteCourante || null, frequence: record.frequence || null,
    bilans: record.bilans || {}, completed: record.completed || {}, temas: record.temas || {}
  };
  startStudentMessagesListener();
  if(record.niveau){ niveau = record.niveau; screen = 'dossiers'; }
  else { niveau = null; screen = 'waiting'; }
  render();
}
async function refreshBilan(){
  if(!student.uid) return;
  try{
    const doc = await db.collection('eleves').doc(student.uid).get();
    if(doc.exists){ student.bilans = doc.data().bilans || {}; }
  }catch(e){ /* ignore */ }
  render();
}
async function saveProgress(tag){
  student.uniteCourante = tag;
  if(!student.uid) return;
  try{ await db.collection('eleves').doc(student.uid).update({uniteCourante: tag}); }
  catch(e){ /* non bloquant */ }
}
