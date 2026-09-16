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
  {num:1, name:"Contacts", open:true},
  {num:2, name:"À venir", open:false},
  {num:3, name:"À venir", open:false},
  {num:4, name:"À venir", open:false},
  {num:5, name:"À venir", open:false},
  {num:6, name:"À venir", open:false},
  {num:7, name:"À venir", open:false},
  {num:8, name:"À venir", open:false},
];

/* ======================= DONNÉES : SEMAINES (Dossier 0) ======================= */
const weeksD0 = [
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
        rec:{fr:"Lis à voix haute : « Je m'appelle Melissa et je suis française et brésilienne. »", pt:"Leia essa frase em voz alta."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Épeler un prénom : se faire comprendre au téléphone",
        title_pt:"Soletrar um nome: se fazer entender ao telefone",
        link:{url:"https://www.podcastfrancaisfacile.com/premiers-pas/alphabet.html", label:"Rappel — l'alphabet et l'épellation"},
        exo:{type:"qcm", q:"En France, pour lever une ambiguïté sur une lettre au téléphone, on dit souvent « lettre comme + … ». Qu'utilise-t-on le plus souvent ?", options:["Un prénom (ex : « G comme Gérard »)","Une ville (ex : « V comme Venise », plutôt utilisé en Italie)","Un objet (ex : « B comme ballon », plutôt utilisé au Brésil)"], correct:0},
        rec:{fr:"On t'épelle un prénom étranger au téléphone (par ex. Nenad, Schin ou Yamamoto) : répète-le lettre par lettre pour vérifier que tu as bien compris.", pt:"Alguém soletra um nome estrangeiro ao telefone (por ex. Nenad, Schin ou Yamamoto): repita letra por letra para conferir que você entendeu."}}
    ],
    oral_title_fr:"Sons et prononciation", oral_title_pt:"Sons e pronúncia",
    oral:[
      {fr:"Épeler à voix haute son prénom, son nom, puis 3 mots vus dans la semaine.", pt:"Soletrar em voz alta seu nome e sobrenome, depois 3 palavras vistas na semana."},
      {fr:"Jeu d'écoute : le professeur dit un mot, l'élève doit dire quel son il entend.", pt:"Jogo de escuta: a professora diz uma palavra, o aluno diz que som ouviu."},
      {fr:"Répétition guidée des sons les plus difficiles pour un lusophone.", pt:"Repetição guiada dos sons mais difíceis para um lusófono."},
      {fr:"Lecture à voix haute de 5 phrases courtes en travaillant l'accent final et la liaison.", pt:"Leitura em voz alta de 5 frases curtas trabalhando o acento final e a ligação."},
      {fr:"Dictée de prénoms épelés à l'oral, comme au téléphone.", pt:"Ditado de nomes soletrados oralmente, como ao telefone."}
    ]
  },
  {
    id:2, tag:"S2", color:"#06a77d",
    title_fr:"Se présenter et faire connaissance",
    title_pt:"Se apresentar e conhecer alguém",
    objectif_fr:"Saluer, dire son nom et prénom, épeler son identité, utiliser les verbes être et s'appeler, accorder les adjectifs de nationalité au masculin/féminin, choisir entre tu et vous, et connaître quelques prénoms et noms de famille typiquement français.",
    objectif_pt:"Cumprimentar, dizer nome e sobrenome, soletrar sua identidade, usar os verbos être e s'appeler, fazer a concordância dos adjetivos de nacionalidade, escolher entre tu e vous, e conhecer alguns nomes e sobrenomes tipicamente franceses.",
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
        rec:{fr:"Dis à voix haute, comme dans l'exemple : « Je m'appelle Paul. Tu t'appelles comment ? Il s'appelle Karl Rainer. Elle s'appelle Isabelle. » puis « Je suis canadien. Il est allemand. Elle est française. Vous êtes russe ? »", pt:"Diga em voz alta essas conjugações de exemplo de s'appeler e être."}},
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
        rec:{fr:"Enregistre ta présentation complète (4 phrases) pour la séance orale.", pt:"Grave sua apresentação completa (4 frases) para a aula."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Point culture — Prénoms et noms de famille français",
        title_pt:"Ponto cultural — Nomes e sobrenomes franceses",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Prénoms et noms de famille français — ressources"},
        exo:{type:"qcm", q:"D'après le palmarès des noms de famille français, lequel de ces noms est parmi les plus portés en France ?", options:["Bernard","Silva","Kowalski"], correct:0},
        rec:{fr:"Dis 2 prénoms français classiques (par ex. Romane, Alexandre, Lucas, Marianne) et 2 prénoms français plus actuels que tu connais. Dis aussi quel nom de famille est le plus porté en France (Martin, puis Bernard, Thomas, Petit, Robert, Richard, Durand, Dubois, Moreau, Laurent).", pt:"Diga 2 nomes franceses clássicos e 2 mais atuais que você conhece. Diga também qual é o sobrenome mais comum na França (Martin, depois Bernard, Thomas, Petit, Robert, Richard, Durand, Dubois, Moreau, Laurent)."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Tu ou vous ? Choisir le bon registre",
        title_pt:"Tu ou vous? Escolher o registro certo",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Le tutoiement et le vouvoiement — explication et exemples"},
        exo:{type:"qcm", q:"Tu rencontres ta nouvelle professeure pour la première fois. Tu lui demandes son prénom, tu dis :", options:["Tu t'appelles comment ?","Vous vous appelez comment ?","Comment ça va ?"], correct:1},
        rec:{fr:"Pose la question « Tu t'appelles comment ? » à un ami imaginaire, puis « Vous vous appelez comment ? » à quelqu'un que tu vouvoies (ta professeure, par exemple).", pt:"Faça a pergunta « Tu t'appelles comment ? » para um amigo imaginário, depois « Vous vous appelez comment ? » para alguém que você trata por vous."}}
    ],
    oral_title_fr:"Se présenter", oral_title_pt:"Se apresentar",
    oral:[
      {fr:"Chacun se présente à tour de rôle (nom, prénom, nationalité) sans support écrit.", pt:"Cada um se apresenta por vez, sem apoio escrito."},
      {fr:"Jeu de rôle : « rencontre dans un café ».", pt:"Jogo de papéis: 'encontro em um café'."},
      {fr:"Questions/réponses libres : « Comment tu t'appelles ? », « Tu es d'où ? »", pt:"Perguntas e respostas livres sobre nome e origem."},
      {fr:"Jeu du cercle : chacun dit son prénom, puis on vérifie qui a mémorisé les prénoms des autres.", pt:"Jogo do círculo: cada um diz seu nome, depois verifica-se quem memorizou os nomes dos outros."}
    ]
  },
  {
    id:3, tag:"S3", color:"#ef476f",
    title_fr:"Nationalités, pays et langues",
    title_pt:"Nacionalidades, países e línguas",
    objectif_fr:"Nommer des pays et nationalités (accord masculin/féminin), utiliser les articles définis et le genre des noms de pays, dire quelle(s) langue(s) on parle, et situer la France dans le monde francophone et lusophone.",
    objectif_pt:"Nomear países e nacionalidades, usar os artigos definidos e o gênero dos nomes de países, dizer qual(is) língua(s) se fala, e situar a França no mundo francófono e lusófono.",
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
        rec:{fr:"Nomme 3 personnalités françaises connues.", pt:"Diga o nome de 3 personalidades francesas conhecidas."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"La Francophonie : où parle-t-on français dans le monde ?",
        title_pt:"A Francofonia: onde se fala francês no mundo?",
        link:{url:"https://fr.wikipedia.org/wiki/Francophonie", label:"La Francophonie — Wikipédia"},
        exo:{type:"qcm", q:"Le français est langue officielle…", options:["Seulement en France et en Belgique","Dans plus de 25 pays, sur plusieurs continents (Europe, Afrique, Amériques, Océanie)","Seulement en Europe"], correct:1},
        rec:{fr:"Cite 5 pays où l'on parle français, en plus de la France (par exemple : la Belgique, la Suisse, le Canada, le Sénégal, la Côte d'Ivoire, le Cameroun, Madagascar, Haïti...).", pt:"Cite 5 países onde se fala francês, além da França (por exemplo: Bélgica, Suíça, Canadá, Senegal, Costa do Marfim, Camarões, Madagascar, Haiti...)."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Le monde lusophone : le portugais aussi voyage",
        title_pt:"O mundo lusófono: o português também viaja",
        link:{url:"https://fr.wikipedia.org/wiki/Lusophonie", label:"La Lusophonie — Wikipédia"},
        exo:{type:"qcm", q:"En plus du Brésil et du Portugal, le portugais est langue officielle…", options:["en Angola et au Mozambique","en Argentine et au Chili","en Allemagne et en Autriche"], correct:0},
        rec:{fr:"Compare : dans combien de pays parle-t-on français ? Et portugais ? Lequel de ces deux chiffres te surprend le plus, et pourquoi ?", pt:"Compare: em quantos países se fala francês? E português? Qual desses dois números mais te surpreende, e por quê?"}}
    ],
    oral_title_fr:"Pays, langues, nationalités", oral_title_pt:"Países, línguas, nacionalidades",
    oral:[
      {fr:"Tour du monde à l'oral : « Je viens du Brésil, je suis brésilien(ne), je parle portugais. »", pt:"Volta ao mundo oral."},
      {fr:"Jeu de devinettes sur les nationalités et pays.", pt:"Jogo de adivinhação sobre nacionalidades e países."},
      {fr:"Discussion libre sur des personnalités françaises ou brésiliennes connues.", pt:"Conversa livre sobre personalidades conhecidas."},
      {fr:"Jeu de rôle « cocktail international » : se déplacer dans la salle, saluer, dire son prénom, sa nationalité et sa langue à plusieurs personnes différentes.", pt:"Jogo de papéis 'coquetel internacional': circular pela sala, cumprimentar, dizer nome, nacionalidade e língua para várias pessoas diferentes."}
    ]
  },
  {
    id:4, tag:"S4", color:"#e8590c",
    title_fr:"Compter de 0 à 69",
    title_pt:"Contar de 0 a 69",
    objectif_fr:"Comprendre et dire les nombres de 0 à 69, noter un nombre entendu, donner et comprendre un numéro de téléphone, et appliquer la règle de formation des nombres composés (« et » / tiret).",
    objectif_pt:"Compreender e dizer os números de 0 a 69, anotar um número ouvido, dar e entender um número de telefone, e aplicar a regra de formação dos números compostos («et» / hífen).",
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
        rec:{fr:"Dicte 5 nombres entre 0 et 69, pour réviser.", pt:"Dite 5 números entre 0 e 69, para revisar."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Nombres composés : la règle du « et » et du tiret",
        title_pt:"Números compostos: a regra do «et» e do hífen",
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/nombres_francais_compter-de-zero-a-100_les_nombres_en_francais_facile_apprendre_a_compter.html", label:"Rappel — formation des nombres composés"},
        exo:{type:"qcm", q:"Comment écrit-on 31 ?", options:["trente et un","trente-un","trente et une"], correct:0},
        rec:{fr:"Dis à voix haute, en faisant bien la liaison : vingt et un, trente et un, quarante et un, cinquante et un, soixante et un.", pt:"Diga em voz alta, fazendo bem a ligação: vingt et un, trente et un, quarante et un, cinquante et un, soixante et un."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Nombres dans la vraie vie : places, stands, numéros",
        title_pt:"Números na vida real: lugares, estandes, números",
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/entrainement-nombres-de-1-a-100-exercice-decoute.html", label:"Entraînement nombres — situations réelles"},
        exo:{type:"qcm", q:"Au cinéma, on te dit : « Il y a seize places. » Combien de places reste-t-il ?", options:["16","60","6"], correct:0},
        rec:{fr:"Dicte 3 numéros de stand comme dans un salon professionnel (une lettre + un nombre, par exemple « J vingt-quatre » ou « E onze »).", pt:"Dite 3 números de estande como em uma feira profissional (uma letra + um número, por exemplo «J vingt-quatre» ou «E onze»)."}}
    ],
    oral_title_fr:"Les nombres", oral_title_pt:"Os números",
    oral:[
      {fr:"Compter à voix haute ensemble de 0 à 69, puis à l'envers.", pt:"Contar em voz alta juntos de 0 a 69, depois ao contrário."},
      {fr:"Dicter et faire dicter des numéros de téléphone.", pt:"Ditar e pedir para ditar números de telefone."},
      {fr:"Petit jeu de calcul oral simple.", pt:"Pequeno jogo de cálculo oral."},
      {fr:"Jeu du « message secret » : associer des lettres à des nombres (A=1, B=2...) et faire deviner un mot à partir d'une suite de nombres dictés.", pt:"Jogo da 'mensagem secreta': associar letras a números (A=1, B=2...) e adivinhar uma palavra a partir de uma sequência de números ditados."}
    ]
  },
  {
    id:5, tag:"S5", color:"#8338ec",
    title_fr:"Personnalités, classe et bilan",
    title_pt:"Personalidades, sala de aula e balanço",
    objectif_fr:"Identifier des personnalités françaises connues dans différents domaines, reconnaître des mots français « transparents », utiliser des formules pour communiquer en classe, consolider l'ensemble du module à l'oral.",
    objectif_pt:"Identificar personalidades francesas conhecidas em diferentes áreas, reconhecer palavras francesas 'transparentes', usar fórmulas para se comunicar em sala de aula, consolidar todo o módulo.",
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
        rec:{fr:"Dis 5 formules utiles en classe (par exemple : « Je ne comprends pas », « Comment on dit... ? », « Vous pouvez répéter, s'il vous plaît ? », « Comment ça s'écrit ? », « Je peux poser une question ? »).", pt:"Diga 5 fórmulas úteis para a sala de aula."}},
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
        rec:{fr:"Enregistre un bilan oral : ce que tu as appris ce mois-ci.", pt:"Grave um balanço oral do que você aprendeu."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Personnalités françaises par domaine",
        title_pt:"Personalidades francesas por área",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Culture — personnalités françaises par domaine"},
        exo:{type:"qcm", q:"Zinedine Zidane est une personnalité française associée à quel domaine ?", options:["Le sport (football)","La mode","La littérature"], correct:0},
        rec:{fr:"Cite une personnalité française dans 3 domaines différents parmi : littérature (Marcel Proust, Albert Camus, Simone de Beauvoir, Victor Hugo), mode (Christian Dior, Gabrielle Chanel, Yves Saint Laurent, Jean-Paul Gaultier), sport (David Douillet, Michel Platini, Zinedine Zidane, Tony Parker) et cinéma (Juliette Binoche, Alain Delon, Gérard Depardieu, Marion Cotillard).", pt:"Cite uma personalidade francesa em 3 áreas diferentes entre: literatura, moda, esporte e cinema (veja os exemplos em francês)."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Mots transparents : ce que tu comprends déjà",
        title_pt:"Palavras transparentes: o que você já entende",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Vocabulaire — mots transparents français/portugais"},
        exo:{type:"qcm", q:"Quel mot français ressemble beaucoup au mot portugais « número » ?", options:["numéro","chiffre","code"], correct:0},
        rec:{fr:"Trouve 3 mots français qui ressemblent beaucoup à des mots portugais (comme numéro/número, téléphone/telefone, voyage/viagem, merci beaucoup).", pt:"Encontre 3 palavras francesas bem parecidas com palavras portuguesas (como numéro/número, téléphone/telefone, voyage/viagem)."}}
    ],
    oral_title_fr:"Bilan oral du module", oral_title_pt:"Balanço oral do módulo",
    oral:[
      {fr:"Présentation orale complète : nom, nationalité, pays, langues, un numéro.", pt:"Apresentação oral completa."},
      {fr:"Mini-entretien type DELF A1.", pt:"Mini-entrevista tipo DELF A1."},
      {fr:"Utilisation active des formules de classe.", pt:"Uso ativo das fórmulas de sala de aula."},
      {fr:"Retour oral du professeur.", pt:"Retorno oral da professora."},
      {fr:"Jeu final : chacun présente une personnalité française sans dire son nom, le groupe doit deviner qui c'est.", pt:"Jogo final: cada um apresenta uma personalidade francesa sem dizer o nome, o grupo deve adivinhar quem é."}
    ]
  }
];

const weeksD1 = [
  {
    id:1, tag:"S1", color:"#3a6df0",
    title_fr:"Saluer et prendre congé",
    title_pt:"Cumprimentar e se despedir",
    objectif_fr:"Saluer et prendre congé selon le moment de la journée et le type de relation (formelle/informelle), choisir entre tu et vous, distinguer les sons [y] et [u], et reconnaître l'intonation montante (question) et descendante (affirmation).",
    objectif_pt:"Cumprimentar e se despedir de acordo com o momento do dia e o tipo de relação (formal/informal), escolher entre tu e vous, distinguir os sons [y] e [u], e reconhecer a entonação ascendente (pergunta) e descendente (afirmação).",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Saluer selon le moment de la journée",
        title_pt:"Cumprimentar de acordo com o momento do dia",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Saluer le matin, l'après-midi, le soir — dialogues"},
        exo:{type:"qcm", q:"Lucas arrive à l'université le matin et rencontre son professeur. Il dit :", options:["Bonjour monsieur, comment allez-vous ?","Salut ! Vous allez bien ?","Au revoir, à demain !"], correct:0},
        rec:{fr:"Imagine que tu croises quelqu'un le matin, puis l'après-midi, puis le soir : dis une salutation adaptée à chaque moment.", pt:"Imagine que você encontra alguém de manhã, depois à tarde, depois à noite: diga uma saudação adequada para cada momento."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Bonjour ou bonne journée ? Saluer et prendre congé",
        title_pt:"Bonjour ou bonne journée? Cumprimentar e se despedir",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Formules pour saluer et prendre congé"},
        exo:{type:"qcm", q:"« Bonjour » et « bonne journée » : ces deux formules sont…", options:["Interchangeables, on peut utiliser l'une ou l'autre à tout moment","Différentes : « bonjour » sert à saluer, « bonne journée » sert à prendre congé","Utilisées seulement le soir"], correct:1},
        rec:{fr:"Dis 2 formules pour saluer (arriver) et 2 formules pour prendre congé (partir).", pt:"Diga 2 fórmulas para cumprimentar (chegar) e 2 fórmulas para se despedir (partir)."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Point culture — Tu ou vous ? Relation formelle ou informelle",
        title_pt:"Ponto cultural — Tu ou vous? Relação formal ou informal",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Le tutoiement et le vouvoiement en France"},
        exo:{type:"qcm", q:"« Tu » correspond à une relation…, « vous » correspond à une relation…", options:["informelle / formelle","formelle / informelle","les deux sont formelles"], correct:0},
        rec:{fr:"Donne un exemple de situation où on utilise « tu », et un exemple où on utilise « vous ».", pt:"Dê um exemplo de situação em que se usa «tu», e um exemplo em que se usa «vous»."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Phonétique — Distinguer [y] (tu) et [u] (vous)",
        title_pt:"Fonética — Distinguir [y] (tu) e [u] (vous)",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"Le son [y] et le son [u] — exercices"},
        exo:{type:"qcm", q:"Dans la phrase « Vous allez au musée du Louvre », combien de fois entend-on le son [u] ?", options:["2 fois","1 fois","3 fois"], correct:0},
        rec:{fr:"Répète ces deux phrases en marquant bien la différence : « Vous allez au musée du Louvre » et « Tu salues Lou et Luce ».", pt:"Repita essas duas frases marcando bem a diferença entre [y] e [u]."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Phonétique — L'intonation montante et descendante",
        title_pt:"Fonética — A entonação ascendente e descendente",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"Intonation de la question et de l'affirmation"},
        exo:{type:"qcm", q:"Pour poser une question à l'oral (sans « est-ce que »), la voix…", options:["Monte à la fin de la phrase","Descend à la fin de la phrase","Reste toujours plate"], correct:0},
        rec:{fr:"Dis la même phrase deux fois : une fois comme une question (voix qui monte), une fois comme une affirmation (voix qui descend). Par exemple : « Tu vas bien ? » / « Tu vas bien. »", pt:"Diga a mesma frase duas vezes: uma vez como pergunta (voz que sobe), uma vez como afirmação (voz que desce)."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Saluer sans les mots : la poignée de main, la bise",
        title_pt:"Cumprimentar sem palavras: o aperto de mão, o beijo no rosto",
        link:{url:"https://fr.wikipedia.org/wiki/Bise_(salutation)", label:"La bise en France — Wikipédia"},
        exo:{type:"qcm", q:"En France, deux collègues qui se rencontrent pour la première fois dans un cadre professionnel vont plutôt…", options:["Se serrer la main","Se faire la bise","Se taper dans la main"], correct:0},
        rec:{fr:"Compare : comment se saluent les gens dans ton pays, selon qu'ils se connaissent bien ou non ? Est-ce différent de la France ?", pt:"Compare: como as pessoas se cumprimentam no seu país, dependendo de se conhecerem bem ou não? É diferente da França?"}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Mise en pratique : saluer et prendre congé",
        title_pt:"Colocando em prática: cumprimentar e se despedir",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Récapitulatif — saluer et prendre congé"},
        exo:{type:"qcm", q:"Il est 20h, tu quittes un ami proche. Tu dis plutôt :", options:["Bonsoir monsieur, comment allez-vous ?","Salut, bonne soirée !","Bonjour, ça va ?"], correct:1},
        rec:{fr:"Imagine 3 courtes situations (le matin entre amis, l'après-midi avec un professeur, le soir avec un collègue) et joue chaque salutation à voix haute.", pt:"Imagine 3 situações curtas (de manhã entre amigos, à tarde com um professor, à noite com um colega) e represente cada saudação em voz alta."}}
    ],
    oral_title_fr:"Saluer et faire connaissance", oral_title_pt:"Cumprimentar e conhecer alguém",
    oral:[
      {fr:"Jeu de rôle « Lucas à l'université » : rejouer les rencontres de la journée (accueil, couloir, cafétéria, escalier) en variant tu/vous.", pt:"Jogo de papéis 'Lucas na universidade': reencenar os encontros do dia variando tu/vous."},
      {fr:"Par groupes de 2-3 : imaginer 3 situations de salutation (matin/après-midi/soir, formelle/informelle) et les jouer devant la classe ; les autres devinent le moment et le type de relation.", pt:"Em grupos de 2-3: imaginar 3 situações de saudação e representá-las; os outros adivinham o momento e o tipo de relação."},
      {fr:"Discussion : comment salue-t-on dans ta culture ? Compare avec les usages français.", pt:"Discussão: como se cumprimenta na sua cultura? Compare com os costumes franceses."}
    ]
  },
  {
    id:2, tag:"S2", color:"#06a77d",
    title_fr:"Se présenter sur un réseau social",
    title_pt:"Se apresentar em uma rede social",
    objectif_fr:"Utiliser le verbe avoir au présent, la négation ne... pas, les adjectifs possessifs et les jours de la semaine, dire son âge en faisant la liaison, comprendre un profil d'utilisateur en ligne, et demander poliment des informations.",
    objectif_pt:"Usar o verbo avoir no presente, a negação ne... pas, os adjetivos possessivos e os dias da semana, dizer sua idade fazendo a ligação, entender um perfil de usuário on-line, e pedir informações educadamente.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Le verbe avoir au présent",
        title_pt:"O verbo avoir no presente",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Le verbe avoir — conjugaison et exemples"},
        exo:{type:"texte", q:"Complète : « Vous ___ 20 ans ? »", accept:["avez"]},
        rec:{fr:"Dis à voix haute la conjugaison complète : j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont.", pt:"Diga em voz alta a conjugação completa do verbo avoir."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"La négation ne... pas",
        title_pt:"A negação ne... pas",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"La négation ne... pas — règle et exemples"},
        exo:{type:"qcm", q:"Où se placent « ne » et « pas » autour du verbe conjugué ?", options:["« ne » avant le verbe, « pas » après le verbe","« pas » avant le verbe, « ne » après le verbe","Les deux se placent après le verbe"], correct:0},
        rec:{fr:"Transforme à la négative : « Je suis étudiant » et « Elle a 20 ans ».", pt:"Transforme para a negativa: « Je suis étudiant » e « Elle a 20 ans »."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Comprendre un profil sur un site d'apprentissage de langues",
        title_pt:"Entender um perfil em um site de aprendizado de línguas",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Comprendre un profil en ligne — vocabulaire"},
        exo:{type:"qcm", q:"Sur un profil de site d'apprentissage de langues, on trouve généralement…", options:["Nom, âge, nationalité, langues parlées, études, disponibilités","Uniquement le nom et l'adresse postale","Uniquement une photo"], correct:0},
        rec:{fr:"Si tu créais un profil sur un site d'apprentissage de langues, que dirais-tu de toi (âge, langues, études ou travail) ?", pt:"Se você criasse um perfil em um site de aprendizado de línguas, o que diria sobre você (idade, línguas, estudos ou trabalho)?"}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Phonétique — Dire son âge et faire la liaison",
        title_pt:"Fonética — Dizer a idade e fazer a ligação",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"La liaison avec « ans » — exercices"},
        exo:{type:"qcm", q:"Dans « 20 ans », la liaison se fait avec quel son ?", options:["[t]","[z]","[s]"], correct:0},
        rec:{fr:"Dis à voix haute, en faisant bien la liaison : 2 ans, 3 ans, 7 ans, 10 ans, 20 ans, 30 ans.", pt:"Diga em voz alta, fazendo bem a ligação: 2 ans, 3 ans, 7 ans, 10 ans, 20 ans, 30 ans."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Les adjectifs possessifs + les jours de la semaine",
        title_pt:"Os adjetivos possessivos + os dias da semana",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Adjectifs possessifs et jours de la semaine"},
        exo:{type:"texte", q:"Complète : « Quel est ___ nom ? » (tu vouvoies la personne)", accept:["votre"]},
        rec:{fr:"Dis les 7 jours de la semaine, puis une phrase avec un adjectif possessif (par exemple « mon prénom », « ma langue maternelle »).", pt:"Diga os 7 dias da semana, depois uma frase com um adjetivo possessivo."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Demander poliment : « je voudrais... », « s'il vous plaît »",
        title_pt:"Pedir educadamente: « je voudrais... », « s'il vous plaît »",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Demander poliment — formules et article indéfini"},
        exo:{type:"texte", q:"Complète poliment : « Excusez-moi, je ___ des informations, s'il vous plaît. »", accept:["voudrais"]},
        rec:{fr:"Demande poliment 3 choses différentes en utilisant « je voudrais... » et « s'il vous plaît ».", pt:"Peça educadamente 3 coisas diferentes usando « je voudrais... » e « s'il vous plaît »."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Rédiger son propre profil",
        title_pt:"Redigir seu próprio perfil",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Modèles de présentation écrite niveau A1"},
        exo:null,
        rec:{fr:"Rédige et enregistre la présentation de ton profil : prénom, âge, nationalité, langues parlées, études ou travail, une disponibilité.", pt:"Redija e grave a apresentação do seu perfil: nome, idade, nacionalidade, línguas faladas, estudos ou trabalho, uma disponibilidade."}}
    ],
    oral_title_fr:"Se présenter en détail", oral_title_pt:"Se apresentar em detalhes",
    oral:[
      {fr:"Chacun présente son profil complet à l'oral (âge, nationalité, langues, études/travail).", pt:"Cada um apresenta seu perfil completo oralmente."},
      {fr:"Jeu des profils : afficher les profils écrits, circuler et deviner qui a écrit quoi.", pt:"Jogo dos perfis: exibir os perfis escritos, circular e adivinhar quem escreveu o quê."},
      {fr:"Mini-entretien : se poser des questions sur l'âge, les études, les disponibilités.", pt:"Mini-entrevista: fazer perguntas sobre idade, estudos, disponibilidades."}
    ]
  },
  {
    id:3, tag:"S3", color:"#ef476f",
    title_fr:"Questionner sur l'identité et donner ses coordonnées",
    title_pt:"Perguntar sobre a identidade e dar seus dados de contato",
    objectif_fr:"Comprendre un formulaire d'inscription, utiliser l'adjectif interrogatif « quel », dire les mois de l'année et sa date d'anniversaire, compter de 70 à 99, comprendre les numéros de téléphone français et donner une adresse électronique.",
    objectif_pt:"Entender um formulário de inscrição, usar o adjetivo interrogativo « quel », dizer os meses do ano e sua data de aniversário, contar de 70 a 99, entender os números de telefone franceses e dar um endereço eletrônico.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Comprendre un formulaire d'inscription",
        title_pt:"Entender um formulário de inscrição",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Le formulaire d'inscription — vocabulaire"},
        exo:{type:"qcm", q:"Dans un formulaire d'inscription français typique, quel est l'ordre le plus courant des informations demandées ?", options:["Nom, prénom, date de naissance, nationalité, adresse, téléphone","Téléphone, nom, adresse, prénom","Adresse, téléphone, nom, prénom"], correct:0},
        rec:{fr:"Cite 4 informations qu'on te demande souvent dans un formulaire d'inscription.", pt:"Cite 4 informações frequentemente pedidas em um formulário de inscrição."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"L'adjectif interrogatif « quel » pour questionner sur l'identité",
        title_pt:"O adjetivo interrogativo « quel » para perguntar sobre a identidade",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Quel, quelle, quels, quelles — règle et exemples"},
        exo:{type:"qcm", q:"Comment demande-t-on la nationalité de quelqu'un poliment ?", options:["Quelle est votre nationalité ?","Quel est votre nationalité ?","Quels sont votre nationalité ?"], correct:0},
        rec:{fr:"Pose 3 questions avec « quel/quelle » sur l'identité de quelqu'un (nom, date de naissance, numéro de téléphone).", pt:"Faça 3 perguntas com « quel/quelle » sobre a identidade de alguém."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Les mois de l'année et la date d'anniversaire",
        title_pt:"Os meses do ano e a data de aniversário",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Les mois de l'année — audio et exercices"},
        exo:{type:"texte", q:"Complète : « Ma date d'anniversaire, c'est ___ 15 février. » (complète avec l'article)", accept:["le"]},
        rec:{fr:"Dis les 12 mois de l'année, puis ta date d'anniversaire (par exemple « le 15 février »).", pt:"Diga os 12 meses do ano, depois sua data de aniversário."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Les nombres de 70 à 99",
        title_pt:"Os números de 70 a 99",
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/nombres_francais_compter-de-zero-a-100_les_nombres_en_francais_facile_apprendre_a_compter.html", label:"Compter de 70 à 99 — vidéo par étapes"},
        exo:{type:"qcm", q:"Comment dit-on 80 en français ?", options:["quatre-vingts","huit-dix","quatre-vingt-dix"], correct:0},
        rec:{fr:"Compte à voix haute de 70 à 99, en marquant bien « soixante-dix », « quatre-vingts » et « quatre-vingt-dix ».", pt:"Conte em voz alta de 70 a 99, marcando bem « soixante-dix », « quatre-vingts » e « quatre-vingt-dix »."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Point culture — Les numéros de téléphone en France",
        title_pt:"Ponto cultural — Os números de telefone na França",
        link:{url:"https://www.podcastfrancaisfacile.com/nombre/les-numeros-de-telephone.html", label:"Les numéros de téléphone français — exercice complet"},
        exo:{type:"qcm", q:"En France, un numéro de portable commence généralement par…", options:["06 ou 07","01 ou 02","09 uniquement"], correct:0},
        rec:{fr:"Dicte un numéro de téléphone français imaginaire, par séries de deux chiffres (par exemple : zéro six, dix-huit, soixante-treize...).", pt:"Dite um número de telefone francês imaginário, em séries de dois dígitos."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Comprendre et donner une adresse électronique",
        title_pt:"Entender e dar um endereço eletrônico",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Lire une adresse électronique en français"},
        exo:{type:"qcm", q:"Comment dit-on le symbole « @ » dans une adresse électronique en français ?", options:["arobase","chien","escargot"], correct:0},
        rec:{fr:"Épelle à voix haute une adresse électronique (réelle ou imaginaire), en disant « arobase », « point » et « tiret » quand il le faut.", pt:"Soletre em voz alta um endereço eletrônico (real ou imaginário), dizendo « arobase », « point » e « tiret » quando necessário."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Jeu de rôle : s'inscrire quelque part",
        title_pt:"Jogo de papéis: se inscrever em algum lugar",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Dialogue-modèle d'inscription"},
        exo:null,
        rec:{fr:"Joue les deux rôles : l'employé qui pose les questions (nom, date de naissance, adresse, téléphone, adresse mail) et la personne qui répond.", pt:"Represente os dois papéis: o funcionário que faz as perguntas e a pessoa que responde."}}
    ],
    oral_title_fr:"Donner ses coordonnées", oral_title_pt:"Dar seus dados de contato",
    oral:[
      {fr:"Jeu de rôle « inscription à la médiathèque » : un élève joue l'employé, l'autre le nouvel inscrit.", pt:"Jogo de papéis 'inscrição na biblioteca': um aluno faz o funcionário, o outro o novo inscrito."},
      {fr:"Dictée croisée de numéros de téléphone et d'adresses mail entre élèves.", pt:"Ditado cruzado de números de telefone e e-mails entre alunos."},
      {fr:"Tour de classe : chacun dit sa date d'anniversaire, la professeure ou un élève les classe dans l'ordre du calendrier.", pt:"Volta à turma: cada um diz sua data de aniversário, organizando-as na ordem do calendário."}
    ]
  },
  {
    id:4, tag:"S4", color:"#e8590c",
    title_fr:"Parler de soi : pays, passions et rêves",
    title_pt:"Falar de si: países, paixões e sonhos",
    objectif_fr:"Utiliser les prépositions devant les noms de pays (en/au/aux), situer la France dans la Francophonie, exprimer une passion et un rêve, conjuguer les verbes en -er au présent, et distinguer les sons [s] et [z].",
    objectif_pt:"Usar as preposições diante de nomes de países (en/au/aux), situar a França na Francofonia, expressar uma paixão e um sonho, conjugar os verbos em -er no presente, e distinguir os sons [s] e [z].",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"Comprendre une annonce de jeu-concours",
        title_pt:"Entender um anúncio de concurso",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Rêve et réalité — vocabulaire d'un jeu-concours"},
        exo:{type:"qcm", q:"Dans un jeu-concours, le « tirage au sort » sert à…", options:["Choisir le gagnant au hasard parmi les participants","Corriger les fautes d'orthographe","Payer l'inscription"], correct:0},
        rec:{fr:"Explique en une phrase la différence entre « rêve » et « réalité ».", pt:"Explique em uma frase a diferença entre « rêve » e « réalité »."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Écouter des candidats se présenter : âge, profession, pays",
        title_pt:"Ouvir candidatos se apresentarem: idade, profissão, país",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Se présenter : âge, profession, pays"},
        exo:{type:"qcm", q:"Un candidat dit : « J'ai 22 ans, je suis étudiant en journalisme, j'habite au Sénégal. » Que sait-on de lui ?", options:["Son âge, ses études et son pays","Seulement son âge","Seulement son pays"], correct:0},
        rec:{fr:"Présente-toi comme un candidat de jeu-concours : ton âge, ta profession ou tes études, ton pays.", pt:"Apresente-se como um candidato de concurso: sua idade, profissão ou estudos, seu país."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"Les prépositions devant les noms de pays (en / au / aux)",
        title_pt:"As preposições diante de nomes de países (en / au / aux)",
        link:{url:"https://www.francepodcasts.com/2019/12/23/les-nationalites/", label:"Prépositions et noms de pays — règle complète"},
        exo:{type:"qcm", q:"Quelle préposition utilise-t-on avec un pays féminin ou qui commence par une voyelle (ex : la Tunisie, l'Italie) ?", options:["en","au","aux"], correct:0},
        rec:{fr:"Dis : « J'habite en Tunisie / au Sénégal / au Canada / aux États-Unis / à Madagascar » en variant les pays.", pt:"Diga essas frases variando os países e as preposições correspondentes."}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Point culture — La Francophonie",
        title_pt:"Ponto cultural — A Francofonia",
        link:{url:"https://fr.wikipedia.org/wiki/Francophonie", label:"La Francophonie — Wikipédia"},
        exo:{type:"qcm", q:"TV5MONDE, la chaîne de télévision de cette leçon, est regardée surtout par…", options:["Des francophones dans le monde entier, y compris hors de France","Uniquement des Français vivant en France","Uniquement des touristes"], correct:0},
        rec:{fr:"Cite 3 pays francophones qui ne sont pas la France.", pt:"Cite 3 países francófonos que não sejam a França."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Associer un monument à son pays",
        title_pt:"Associar um monumento ao seu país",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Monuments célèbres et leur pays"},
        exo:{type:"qcm", q:"Big Ben se trouve…", options:["À Londres, en Angleterre","À Rome, en Italie","À Pékin, en Chine"], correct:0},
        rec:{fr:"Cite 3 monuments ou lieux célèbres et le pays où ils se trouvent (par exemple : le Colisée, à Rome, en Italie).", pt:"Cite 3 monumentos ou lugares famosos e o país onde se encontram."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Exprimer une passion et un rêve",
        title_pt:"Expressar uma paixão e um sonho",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Exprimer une passion et un rêve — formules"},
        exo:{type:"texte", q:"Complète : « Ma passion, c'___ le cyclisme. »", accept:["est"]},
        rec:{fr:"Dis : « Ma passion, c'est... » et « Je rêve de... » avec tes propres réponses.", pt:"Diga « Ma passion, c'est... » e « Je rêve de... » com suas próprias respostas."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Le présent des verbes en -er",
        title_pt:"O presente dos verbos em -er",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Le présent des verbes en -er — conjugaison"},
        exo:{type:"texte", q:"Conjugue « rêver » à la 1ère personne du pluriel : « Nous ___ »", accept:["rêvons","revons"]},
        rec:{fr:"Conjugue à voix haute le verbe « adorer » à toutes les personnes : j'adore, tu adores, il/elle adore, nous adorons, vous adorez, ils/elles adorent.", pt:"Conjugue em voz alta o verbo « adorer » em todas as pessoas."}},
      {num:"Étape 8", dur:"15 min",
        title_fr:"Phonétique — [s] et [z], et parler de son rêve de pays",
        title_pt:"Fonética — [s] e [z], e falar do seu sonho de país",
        link:{url:"https://www.podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html", label:"Discrimination [s]/[z] — exercices"},
        exo:{type:"qcm", q:"« Ils sont » et « ils ont » se distinguent surtout par…", options:["Le son [s] contre l'absence de [s], remplacé par la liaison en [z]","La voyelle finale","Le nombre de syllabes"], correct:0},
        rec:{fr:"Dis dans quel pays tu rêverais de vivre quelque temps, et pourquoi (utilise « je rêve de vivre... » et une préposition de pays correcte).", pt:"Diga em qual país você sonharia em viver algum tempo, e por quê."}}
    ],
    oral_title_fr:"Pays, passions et rêves", oral_title_pt:"Países, paixões e sonhos",
    oral:[
      {fr:"Jeu-concours façon TV5 : chacun se présente comme un candidat (âge, profession, pays, passion, rêve).", pt:"Jogo estilo TV5: cada um se apresenta como um candidato (idade, profissão, país, paixão, sonho)."},
      {fr:"Jeu des monuments : décrire un monument sans le nommer, les autres devinent le pays.", pt:"Jogo dos monumentos: descrever um monumento sem nomeá-lo, os outros adivinham o país."},
      {fr:"Discussion libre : dans quel pays rêvez-vous de vivre quelque temps ? Pourquoi ?", pt:"Discussão livre: em qual país vocês sonham em viver algum tempo? Por quê?"}
    ]
  },
  {
    id:5, tag:"S5", color:"#8338ec",
    title_fr:"Carnet de voyage : la France en Europe, et bilan",
    title_pt:"Diário de viagem: a França na Europa, e balanço",
    objectif_fr:"Situer la France en Europe et nommer ses pays voisins, reconnaître quelques symboles européens, connaître quelques chiffres-clés sur la France, s'entraîner sur des activités type DELF A1, et consolider l'ensemble du dossier à l'oral.",
    objectif_pt:"Situar a França na Europa e nomear seus países vizinhos, reconhecer alguns símbolos europeus, conhecer alguns números-chave sobre a França, treinar atividades tipo DELF A1, e consolidar todo o módulo oralmente.",
    days:[
      {num:"Étape 1", dur:"15 min",
        title_fr:"La France en Europe : l'hexagone et les pays voisins",
        title_pt:"A França na Europa: o hexágono e os países vizinhos",
        link:{url:"https://fr.wikipedia.org/wiki/France", label:"La France — géographie (Wikipédia)"},
        exo:{type:"qcm", q:"On dit souvent que la France a la forme d'un « hexagone ». Combien de côtés cela représente-t-il ?", options:["6","5","8"], correct:0},
        rec:{fr:"Cite 3 pays qui partagent une frontière avec la France (par exemple : la Belgique, l'Allemagne, l'Espagne...).", pt:"Cite 3 países que fazem fronteira com a França."}},
      {num:"Étape 2", dur:"15 min",
        title_fr:"Quelques symboles européens",
        title_pt:"Alguns símbolos europeus",
        link:{url:"https://fr.wikipedia.org/wiki/Union_europ%C3%A9enne", label:"L'Union européenne — Wikipédia"},
        exo:{type:"qcm", q:"Parmi ces éléments, lequel est un symbole souvent associé à la France ?", options:["Le TGV","La paella","Mozart"], correct:0},
        rec:{fr:"Cite un symbole (gastronomie, technologie, événement ou personnage célèbre) pour 2 pays européens différents.", pt:"Cite um símbolo (gastronomia, tecnologia, evento ou personagem famoso) para 2 países europeus diferentes."}},
      {num:"Étape 3", dur:"15 min",
        title_fr:"La France en chiffres",
        title_pt:"A França em números",
        link:{url:"https://fr.wikipedia.org/wiki/D%C3%A9mographie_de_la_France", label:"Démographie de la France — Wikipédia"},
        exo:{type:"qcm", q:"La France compte environ combien d'habitants ?", options:["66 millions","6 millions","660 millions"], correct:0},
        rec:{fr:"Compare : la France a environ 66 millions d'habitants et 22 régions. Et ton pays, connais-tu ces chiffres ?", pt:"Compare: a França tem cerca de 66 milhões de habitantes e 22 regiões. E o seu país, você conhece esses números?"}},
      {num:"Étape 4", dur:"15 min",
        title_fr:"Entraînement DELF A1 — Compréhension de l'oral",
        title_pt:"Treino DELF A1 — Compreensão oral",
        link:{url:"https://www.podcastfrancaisfacile.com/", label:"Podcast Français Facile — entraînements DELF A1"},
        exo:{type:"qcm", q:"Dans une activité type DELF A1, on te demande souvent de repérer…", options:["Un jour, un numéro de téléphone, une profession, un lieu","Uniquement des verbes irréguliers","Des textes littéraires complexes"], correct:0},
        rec:{fr:"Entraîne-toi : écoute une courte annonce ou un dialogue simple et note le jour, l'heure ou le numéro de téléphone mentionné.", pt:"Treine: ouça um anúncio curto ou um diálogo simples e anote o dia, a hora ou o número de telefone mencionado."}},
      {num:"Étape 5", dur:"15 min",
        title_fr:"Révision : saluer + tu/vous + coordonnées",
        title_pt:"Revisão: cumprimentar + tu/vous + dados de contato",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Rappel — saluer, tu/vous, coordonnées"},
        exo:{type:"qcm", q:"Comment demande-t-on poliment le numéro de téléphone de quelqu'un qu'on vouvoie ?", options:["Quel est votre numéro de téléphone ?","Quel est ton numéro de téléphone ?","Tu as un numéro ?"], correct:0},
        rec:{fr:"Refais une présentation complète avec tes coordonnées (nom, âge, téléphone, adresse mail).", pt:"Refaça uma apresentação completa com seus dados de contato."}},
      {num:"Étape 6", dur:"15 min",
        title_fr:"Révision : pays, prépositions, passions et rêves",
        title_pt:"Revisão: países, preposições, paixões e sonhos",
        link:{url:"https://www.podcastfrancaisfacile.com/francais-debutant-apprendre-le-francais", label:"Rappel — pays, passions, rêves"},
        exo:{type:"texte", q:"Complète : « Elle habite ___ Portugal. » (choisis la bonne préposition)", accept:["au"]},
        rec:{fr:"Redis ta passion et ton rêve de pays à visiter, en utilisant la bonne préposition.", pt:"Diga novamente sua paixão e seu sonho de país a visitar, usando a preposição correta."}},
      {num:"Étape 7", dur:"15 min",
        title_fr:"Bilan et auto-évaluation",
        title_pt:"Balanço e autoavaliação",
        link:{url:"https://www.podcastfrancaisfacile.com/", label:"Podcast Français Facile — pour continuer"},
        exo:null,
        rec:{fr:"Enregistre un bilan oral : ce que tu as appris dans ce dossier (salutations, coordonnées, pays, passions et rêves).", pt:"Grave um balanço oral do que você aprendeu neste módulo."}}
    ],
    oral_title_fr:"Bilan oral du dossier", oral_title_pt:"Balanço oral do módulo",
    oral:[
      {fr:"Présentation orale complète type DELF A1 : identité, coordonnées, pays, passions, rêve.", pt:"Apresentação oral completa tipo DELF A1."},
      {fr:"Jeu des symboles : présenter un symbole sans dire le pays, le groupe devine.", pt:"Jogo dos símbolos: apresentar um símbolo sem dizer o país, o grupo adivinha."},
      {fr:"Retour oral du professeur sur l'ensemble du dossier.", pt:"Retorno oral da professora sobre todo o módulo."}
    ]
  }
];

/* ======================= REGISTRE MULTI-DOSSIERS ======================= */
/* dossiersContent[n] donne le tableau d'unités ("weeks") du dossier n. "weeks"
   est un POINTEUR MUTABLE vers le dossier actuellement affiché — tout le code
   existant qui lit la variable "weeks" continue de fonctionner sans changement,
   il lit simplement le dossier actif. setActiveDossier(n) change ce pointeur
   et le numéro de dossier courant (CURRENT_DOSSIER_NUM, plus bas) ensemble —
   toujours appeler cette fonction avant d'entrer dans les unités d'un dossier. */
const dossiersContent = {0: weeksD0, 1: weeksD1};
let weeks = weeksD0;

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
    <p class="cover-label">${niveau ? 'Niveau '+niveau+(screen==='week'||screen==='bilan'?' · Dossier '+CURRENT_DOSSIER_NUM:'') : 'Français langue étrangère'}</p>
    <h1 class="cover-title">FLE</h1>
  `;
  if(student.prenom && screen!=='login'){
    let progressLine = niveau ? 'Niveau '+niveau : (isTeacher ? 'Compte professeure' : "En attente d'attribution");
    if(niveau && student.uniteCourante && student.uniteCourante[CURRENT_DOSSIER_NUM]){
      const w = weeks.find(x=>x.tag===student.uniteCourante[CURRENT_DOSSIER_NUM]);
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
  if(w) saveProgress(CURRENT_DOSSIER_NUM, w.tag);
  render();
}
function goBilan(){ screen='bilan'; render(); }
function goTeacher(){ screen='teacher'; render(); }


/* Un dossier peut exister dans plusieurs niveaux : chaque bilan est donc rangé
   sous une clé "NIVEAU_D<numéro>", ex. "A1_D0" pour le Dossier 0 en A1. */
let CURRENT_DOSSIER_NUM = 0;
function bilanKey(niveauCode, dossierNum){ return `${niveauCode}_D${dossierNum}`; }
/* Bascule le contenu affiché ("weeks") et le numéro de dossier courant ensemble.
   À appeler avant goWeek()/goBilan() quand on entre dans un nouveau dossier
   (voir renderDossiers dans 05-admin-disponibilites-forum.js). */
function setActiveDossier(num){
  CURRENT_DOSSIER_NUM = num;
  weeks = dossiersContent[num] || weeksD0;
}

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

/* Normalise uniteCourante : anciennes fiches = une chaîne pour le Dossier 0 ("S3"),
   nouvelles fiches = un objet { [numéroDossier]: tag }. Toujours renvoyer un objet. */
function normaliseUniteCourante(uc){
  if(typeof uc === 'string') return {0: uc};
  if(uc && typeof uc === 'object') return uc;
  return {};
}
function afterAuth(uid, record){
  student = {
    prenom:record.prenom, nom:record.nom, email:record.email, telephone:record.telephone, uid,
    uniteCourante: normaliseUniteCourante(record.uniteCourante), frequence: record.frequence || null,
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
/* student.uniteCourante est un objet { [numéroDossier]: "tag de l'unité" }, ex.
   {0:"S3", 1:"S1"} — un élève peut avancer dans plusieurs dossiers en parallèle.
   On réécrit le champ entier (pas de mise à jour par chemin pointé) pour rester
   compatible avec d'anciennes fiches où ce champ était encore une simple chaîne
   (voir la normalisation dans afterAuth). */
async function saveProgress(dossierNum, tag){
  if(!student.uniteCourante || typeof student.uniteCourante !== 'object'){ student.uniteCourante = {}; }
  student.uniteCourante[dossierNum] = tag;
  if(!student.uid) return;
  try{ await db.collection('eleves').doc(student.uid).update({uniteCourante: student.uniteCourante}); }
  catch(e){ /* non bloquant */ }
}
