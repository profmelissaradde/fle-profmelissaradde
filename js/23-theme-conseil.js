/* ===================== THÈME 26 octobre → 1er novembre 2026 : « Un petit conseil ! » (parcours v2) =====================
   Construit à partir des supports « Un petit conseil ! » (matériel élève, guide du professeur, diaporama et
   activités) : vocabulaire (conseil, avis, situation, problème, décision, erreur, solution, courage), verbes
   (conseiller, devoir, hésiter), expressions « À ta place » et « Mieux vaut », grammaire « il faut que +
   subjonctif », questions/réponses, situations à conseiller, le mauvais conseiller, texte à jouer, proverbes
   et débat « doit-on toujours dire la vérité à quelqu'un qu'on aime ? ».

   Progression par niveau :
     A0  tu dois / vous devez + infinitif, « un conseil »
     A1  devoir au présent, impératif, il faut + infinitif
     A2  conditionnel de conseil (tu devrais, à ta place je…), mieux vaut + infinitif
     B1  il faut que + subjonctif (réguliers et irréguliers), demander et réagir à un conseil
     B2  subjonctif après les verbes de conseil, conditionnel passé (à ta place, j'aurais…), argumentation

   ⚠️ statut: "brouillon" — invisible pour les élèves tant que la professeure ne l'a pas publié
   (Pédagogie › Thèmes de la semaine › Publier). Raison : les vidéos n'ont pas pu être regardées ;
   seuls le titre, la chaîne et la description ont été vérifiés (voir "verification"). AUCUNE question
   factuelle n'a été rédigée sur leur contenu : les activités d'écoute sont des tâches ouvertes,
   corrigées par la professeure, qui peut ajouter des questions précises après visionnage.

   Les textes de compréhension écrite reprennent les textes du matériel (Texte 1, Texte 2, texte à jouer)
   ou ont été rédigés pour ce parcours (personnes fictives, aucune statistique). */
(function(){
  const V_ELISABETH = {
    id: "BMudSMGXryk",
    label: "Donner des conseils en français — Niveau A1 de FLE (La prof Elisabeth)",
    verification: {statut:"a_valider", note:"titre, chaîne et description vérifiés sur YouTube le 24/10/2026 (la description annonce l'impératif, il faut + infinitif et pouvoir + infinitif) ; contenu non regardé — à vérifier avant publication"}
  };
  const V_PROFESOR = {
    id: "Eb9MNLP_LGI",
    label: "Donner des conseils en français — Tu dois, tu peux, il faut (French Easy by El Profesor, 3 min)",
    verification: {statut:"a_valider", note:"titre, chaîne, durée (3:03) et description vérifiés sur YouTube le 24/10/2026 (leçon A2 : tu dois, tu peux, il faut, demander un conseil) ; contenu non regardé — à vérifier avant publication"}
  };
  const SUBJ_RAPPEL_FR = `<p><b>Il faut que + subjonctif</b> exprime une nécessité ou un conseil fort.</p>
    <p><b>Formation</b> : radical de <i>ils</i> au présent (ils <b>parl</b>ent, ils <b>finiss</b>ent, ils <b>prenn</b>ent) + <b>-e, -es, -e, -ent</b> ; pour <i>nous</i> et <i>vous</i>, les formes de l'imparfait (<b>-ions, -iez</b>).</p>
    <table class="tp-table"><tr><th>parler</th><th>prendre</th><th>finir</th></tr>
    <tr><td>que je parle</td><td>que je prenne</td><td>que je finisse</td></tr>
    <tr><td>que tu parles</td><td>que tu prennes</td><td>que tu finisses</td></tr>
    <tr><td>qu'il parle</td><td>qu'il prenne</td><td>qu'il finisse</td></tr>
    <tr><td>que nous parlions</td><td>que nous prenions</td><td>que nous finissions</td></tr>
    <tr><td>que vous parliez</td><td>que vous preniez</td><td>que vous finissiez</td></tr>
    <tr><td>qu'ils parlent</td><td>qu'ils prennent</td><td>qu'ils finissent</td></tr></table>
    <p><b>Irréguliers à retenir</b> : être → que je <b>sois</b>, que nous <b>soyons</b> · avoir → que j'<b>aie</b>, qu'il <b>ait</b> · faire → que je <b>fasse</b> · aller → que j'<b>aille</b>, que nous <b>allions</b> · pouvoir → que je <b>puisse</b> · savoir → que je <b>sache</b> · vouloir → que je <b>veuille</b>.</p>`;
  const SUBJ_RAPPEL_PT = "Em português também usamos o subjuntivo depois de « é preciso que » (é preciso que você <b>fale</b>). Em francês é igual: « il faut que tu <b>parles</b> ». Mas « il faut + infinitivo » (il faut parler) é uma regra geral, sem pessoa definida.";

  const theme = {
    id: "conseil-2026-10-26",
    version: 2,
    statut: "brouillon",
    date_debut: "2026-10-26",
    periode: "26 octobre → 1er novembre 2026",
    titre_fr: "Un petit conseil !",
    titre_pt: "Um conselhinho!",
    sub_fr: "Demander, donner et recevoir un conseil en français : avec naturel, avec tact, et avec nuance.",
    sub_pt: "Pedir, dar e receber um conselho em francês: com naturalidade, com tato e com nuance.",
    niveaux: {

      /* ============================================== A0 ============================================== */
      A0: {
        duree: {min:30, max:45},
        intro_fr: "Tout le monde a besoin d'un conseil un jour. Cette semaine, tu apprends les mots pour demander de l'aide et pour dire à un ami ce qu'il doit faire, avec « tu dois » et « vous devez ».",
        intro_pt: "Todo mundo precisa de um conselho um dia. Esta semana, você aprende as palavras para pedir ajuda e para dizer a um amigo o que ele deve fazer, com « tu dois » e « vous devez ».",
        objectifs: [
          {fr:"Comprendre les mots « un conseil », « un problème », « une solution ».", pt:"Entender as palavras « un conseil », « un problème », « une solution »."},
          {fr:"Donner un conseil simple avec « Tu dois + verbe ».", pt:"Dar um conselho simples com « Tu dois + verbo »."},
          {fr:"Demander un conseil : « Qu'est-ce que je fais ? »", pt:"Pedir um conselho: « Qu'est-ce que je fais ? »"}
        ],
        grammaire: ["Le verbe <b>devoir</b> : je dois, tu dois, vous devez", "<b>Devoir + infinitif</b> : Tu dois dormir.", "La négation simple : Tu ne dois pas…"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Les mots du conseil", titre_pt:"As palavras do conselho", dur:"5 min",
            consigne_fr:"Associe chaque mot à sa traduction, puis complète.", consigne_pt:"Associe cada palavra à sua tradução e depois complete.",
            items:[
              {id:"a0-voc-1", type:"association", consigne:"Associe le mot à sa traduction.", paires:[["un conseil","um conselho"],["un problème","um problema"],["une solution","uma solução"],["un ami","um amigo"],["le chef","o chefe"],["une erreur","um erro"]]},
              {id:"a0-voc-2", type:"qcm", q:"J'ai un problème. Je cherche une…", options:["solution","erreur","chef"], correct:0},
              {id:"a0-voc-3", type:"qcm", q:"« Tu dois dormir. » C'est…", options:["un conseil","un problème","une erreur"], correct:0, explication:"« Tu dois dormir » : c'est <b>un conseil</b> pour un ami fatigué."},
              {id:"a0-voc-4", type:"trous", texte:"Mon amie me donne un bon ___ .", blancs:[["conseil"]], aide_pt:"conselho = conseil"}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Mon amie a un problème", titre_pt:"Minha amiga tem um problema", dur:"5 min",
            consigne_fr:"Lis le petit texte. Réponds aux questions.", consigne_pt:"Leia o pequeno texto. Responda às perguntas.",
            texte:{titre:"Mon amie et son chef", fr:"<p>Mon amie a un problème avec son chef. Elle ne sait pas quoi faire. Je lui dis : « Tu dois lui parler. » Elle hésite. Elle a peur.</p>", source:"Texte 1 du matériel « Un petit conseil ! » (début, simplifié)."},
            items:[
              {id:"a0-ce-1", type:"qcm", q:"Mon amie a un problème avec…", options:["sa mère","son chef","son voisin"], correct:1},
              {id:"a0-ce-2", type:"qcm", q:"Mon conseil, c'est :", options:["« Tu dois lui parler. »","« Tu dois partir. »","« Tu dois dormir. »"], correct:0},
              {id:"a0-ce-3", type:"qcm", q:"Mon amie a…", options:["peur","faim","froid"], correct:0, aide_pt:"avoir peur = ter medo"},
              {id:"a0-ce-4", type:"court", q:"Recopie le verbe qui suit « Tu dois » dans le texte.", accept:["parler","lui parler"]}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter des conseils", titre_pt:"Ouvir conselhos", dur:"5 min",
            consigne_fr:"Regarde le début de la vidéo. Ce n'est pas grave si tu ne comprends pas tout : écoute les mots que tu connais.", consigne_pt:"Assista ao começo do vídeo. Não tem problema se você não entender tudo: ouça as palavras que você conhece.",
            video: V_ELISABETH,
            items:[
              {id:"a0-co-1", type:"ouverte", q:"Écris 3 mots que tu entends et que tu comprends.", lignes:2},
              {id:"a0-co-2", type:"ouverte", q:"Écris un conseil que tu entends (même avec des fautes).", lignes:2},
              {id:"a0-co-3", type:"ouverte", avis:true, q:"Tu as compris… beaucoup ? un peu ? pas beaucoup ? Écris un mot.", lignes:1}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Tu dois + verbe", titre_pt:"Tu dois + verbo", dur:"6 min",
            rappel:{fr:"<p><b>Devoir</b> : je dois · tu dois · il/elle doit · nous devons · vous devez · ils/elles doivent</p><p>👉 Pour donner un conseil : <b>tu dois + verbe à l'infinitif</b> : <i>Tu dois dormir. Vous devez parler.</i></p><p>👉 Négation : <i>Tu <b>ne</b> dois <b>pas</b> travailler trop.</i></p>",
                    pt:"Depois de « devoir », o verbo fica no infinitivo, como em português: « você deve <b>dormir</b> » = « tu dois <b>dormir</b> »."},
            items:[
              {id:"a0-gr-1", type:"trous", texte:"Tu ___ dormir. Vous ___ parler au chef. Je ___ travailler.", blancs:[["dois"],["devez"],["dois"]], accents:"strict"},
              {id:"a0-gr-2", type:"qcm", q:"Tu es fatigué. Tu dois…", options:["dormir","dors","dormez"], correct:0, explication:"Après <b>devoir</b>, le verbe est à l'infinitif : <i>Tu dois <b>dormir</b>.</i>"},
              {id:"a0-gr-3", type:"qcm", q:"Tu as faim. Tu dois…", options:["manger","dormir","partir"], correct:0},
              {id:"a0-gr-4", type:"choix_justif", q:"Madame, vous ___ boire de l'eau.", options:["dois","devez"], correct:1, explication:"Avec <b>vous</b> : vous <b>devez</b>.", consigne:"Choisis, puis explique en une phrase (en français ou en portugais)."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Transformer et remettre en ordre", titre_pt:"Transformar e ordenar", dur:"4 min",
            items:[
              {id:"a0-cj-1", type:"mixte", sous_type:"transformation", consigne:"Écris la phrase avec « vous ».", q:"Tu dois parler.", accept:["Vous devez parler."]},
              {id:"a0-cj-2", type:"mixte", sous_type:"transformation", consigne:"Écris la phrase à la forme négative.", q:"Tu dois partir.", accept:["Tu ne dois pas partir."]},
              {id:"a0-cj-3", type:"ordre", consigne:"Remets les mots dans l'ordre.", unites:["Tu","dois","parler","à","ton","chef"]},
              {id:"a0-cj-4", type:"ordre", consigne:"Remets la question dans l'ordre.", unites:["Qu'est-ce","que","je","fais"]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Un conseil pour un ami (écrit)", titre_pt:"Um conselho para um amigo (escrita)", dur:"5 min",
            items:[
              {id:"a0-ee-1", type:"ouverte", q:"Ton ami est fatigué et stressé. Écris-lui 3 conseils avec « Tu dois… ».", consigne_pt:"Seu amigo está cansado e estressado. Escreva 3 conselhos com « Tu dois… ».", lignes:4, min_mots:10,
               modele:"Tu dois dormir. Tu dois boire de l'eau. Tu dois parler à ton chef."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Un conseil pour un ami (oral)", titre_pt:"Um conselho para um amigo (oral)", dur:"3 min",
            items:[
              {id:"a0-eo-1", type:"oral", q:"Enregistre-toi : ton ami a un problème avec son chef. Dis « Bonjour ! » puis donne 2 conseils avec « Tu dois… ».", consigne_pt:"Grave-se: seu amigo tem um problema com o chefe. Diga « Bonjour ! » e dê 2 conselhos com « Tu dois… »."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Petits problèmes, petits conseils", titre_pt:"Pequenos problemas, pequenos conselhos", dur:"5 min",
            consigne_fr:"Choisis le bon conseil pour chaque problème.", consigne_pt:"Escolha o conselho certo para cada problema.",
            items:[
              {id:"a0-sy-1", type:"association", consigne:"Associe le problème au conseil.", paires:[["J'ai faim.","Tu dois manger."],["Je suis fatigué.","Tu dois dormir."],["J'ai froid.","Tu dois mettre un pull."],["J'ai un problème avec mon chef.","Tu dois lui parler."]]},
              {id:"a0-sy-2", type:"ouverte", q:"Écris un petit problème (« J'ai… » ou « Je suis… ») et le conseil que tu donnes.", lignes:2, min_mots:6, modele:"Je suis stressé. — Tu dois te reposer."}
            ]}
        ]
      },

      /* ============================================== A1 ============================================== */
      A1: {
        duree: {min:35, max:45},
        intro_fr: "Donner un conseil, c'est aider quelqu'un. Cette semaine, tu apprends à demander un conseil, à en donner avec « devoir », « il faut » et l'impératif, et à parler de la personne à qui tu demandes conseil.",
        intro_pt: "Dar um conselho é ajudar alguém. Esta semana, você aprende a pedir um conselho, a dar conselhos com « devoir », « il faut » e o imperativo, e a falar da pessoa a quem você pede conselho.",
        objectifs: [
          {fr:"Demander un conseil : « Tu as un conseil pour moi ? »", pt:"Pedir um conselho: « Tu as un conseil pour moi ? »"},
          {fr:"Donner un conseil avec devoir, il faut + infinitif et l'impératif.", pt:"Dar um conselho com devoir, il faut + infinitivo e o imperativo."},
          {fr:"Dire à qui je demande conseil et pourquoi.", pt:"Dizer a quem eu peço conselho e por quê."}
        ],
        grammaire: ["<b>Devoir</b> au présent + infinitif", "<b>Il faut</b> + infinitif (règle générale)", "L'impératif pour conseiller : Parle ! Ne pars pas !", "Les pronoms <b>lui</b> / <b>leur</b> : Je <b>lui</b> parle."],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Le vocabulaire du conseil", titre_pt:"O vocabulário do conselho", dur:"6 min",
            items:[
              {id:"a1-voc-1", type:"association", consigne:"Associe chaque mot à sa définition.", paires:[
                ["un conseil","une idée pour aider quelqu'un"],
                ["un avis","ce que je pense d'une situation"],
                ["un problème","une situation difficile"],
                ["une solution","la réponse à un problème"],
                ["une décision","un choix"],
                ["une erreur","une chose qui n'est pas juste"]]},
              {id:"a1-voc-2", type:"trous", texte:"Je voudrais ton ___ sur cette situation. Il faut prendre une ___ rapidement.", blancs:[["avis","conseil"],["décision"]]},
              {id:"a1-voc-3", type:"qcm", q:"« Tout le monde peut faire une erreur. » Ça veut dire…", options:["Todo mundo pode errar.","Ninguém erra.","Todo mundo tem razão."], correct:0}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Mon amie et son chef", titre_pt:"Minha amiga e o chefe dela", dur:"7 min",
            consigne_fr:"Lis le texte, puis réponds.", consigne_pt:"Leia o texto e depois responda.",
            texte:{titre:"Texte 1", fr:"<p>Mon amie a un problème avec son chef. Elle ne sait pas quoi faire. Je lui dis : « Tu dois lui parler. » Elle hésite. Elle a peur de sa réaction. Mais attendre ne sert à rien. À sa place, je prendrais rendez-vous aujourd'hui.</p>", source:"Texte 1 du matériel « Un petit conseil ! »."},
            items:[
              {id:"a1-ce-1", type:"qcm", q:"Pourquoi l'amie hésite-t-elle ?", options:["Elle a peur de la réaction de son chef.","Elle n'a pas le temps.","Elle n'aime pas son travail."], correct:0},
              {id:"a1-ce-2", type:"qcm", q:"« Attendre ne sert à rien » veut dire…", options:["Esperar não adianta nada.","Esperar é uma boa ideia.","É preciso esperar."], correct:0},
              {id:"a1-ce-3", type:"court", q:"Quel est le premier conseil donné ? Recopie-le.", accept:["Tu dois lui parler","Tu dois lui parler."]},
              {id:"a1-ce-4", type:"qcm", q:"Quand faut-il prendre rendez-vous, selon le narrateur ?", options:["demain","aujourd'hui","dans un mois"], correct:1},
              {id:"a1-ce-5", type:"ouverte", q:"Tu es d'accord avec ce conseil ? Réponds en 1 ou 2 phrases avec « parce que ».", lignes:2, modele:"Oui, je suis d'accord parce que le problème ne va pas disparaître tout seul."}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter des conseils", titre_pt:"Ouvir conselhos", dur:"6 min",
            consigne_fr:"Regarde la vidéo. Tu peux mettre les sous-titres en français et faire pause.", consigne_pt:"Assista ao vídeo. Você pode ativar as legendas em francês e pausar.",
            video: V_ELISABETH,
            items:[
              {id:"a1-co-1", type:"ouverte", q:"Écris 3 conseils que tu entends dans la vidéo.", lignes:3},
              {id:"a1-co-2", type:"ouverte", q:"Quelles structures entends-tu pour donner un conseil ? (ex. impératif, il faut…) Donne un exemple pour chacune.", lignes:3},
              {id:"a1-co-3", type:"ouverte", avis:true, q:"Quel conseil de la vidéo est le plus utile pour toi ? Pourquoi ?", lignes:2}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Devoir, il faut, l'impératif", titre_pt:"Devoir, il faut, o imperativo", dur:"7 min",
            rappel:{fr:"<p><b>Devoir</b> : je dois · tu dois · il/elle doit · nous devons · vous devez · ils/elles doivent + <b>infinitif</b>.</p><p><b>Il faut + infinitif</b> = une règle pour tout le monde : <i>Il faut écouter avant de donner un conseil.</i></p><p><b>Impératif</b> (tu / nous / vous, sans pronom sujet) : <i>Parle ! Parlons ! Parlez !</i> — Attention : <i>tu parles</i> → <i>Parle !</i> (pas de -s pour les verbes en -er). Négation : <i>Ne pars pas !</i></p>",
                    pt:"No imperativo dos verbos em -er, a forma de « tu » perde o -s: « tu parles » → « <b>Parle !</b> »."},
            items:[
              {id:"a1-gr-1", type:"trous", texte:"Nous ___ (devoir) écouter. Elle ___ (devoir) partir. Ils ___ (devoir) décider. Vous ___ (devoir) attendre.", blancs:[["devons"],["doit"],["doivent"],["devez"]], accents:"strict"},
              {id:"a1-gr-2", type:"mixte", sous_type:"transformation", consigne:"Transforme en impératif.", q:"Tu dois parler à ton chef.", accept:["Parle à ton chef !","Parle à ton chef."]},
              {id:"a1-gr-3", type:"mixte", sous_type:"transformation", consigne:"Transforme en impératif.", q:"Vous devez prendre une décision.", accept:["Prenez une décision !","Prenez une décision."]},
              {id:"a1-gr-4", type:"mixte", sous_type:"transformation", consigne:"Transforme en impératif négatif.", q:"Tu ne dois pas hésiter.", accept:["N'hésite pas !","N'hésite pas."]},
              {id:"a1-gr-5", type:"qcm", q:"« ___ écouter avant de donner un conseil. » (règle générale)", options:["Il faut","Tu dois","Écoute"], correct:0, explication:"<b>Il faut + infinitif</b> exprime une règle générale, pour tout le monde."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Les pronoms lui / leur", titre_pt:"Os pronomes lui / leur", dur:"7 min",
            rappel:{fr:"<p>On parle <b>à</b> quelqu'un, on donne un conseil <b>à</b> quelqu'un : <i>à mon amie</i> → <b>lui</b> ; <i>à mes amis</i> → <b>leur</b>.</p><p>Le pronom se place avant le verbe : <i>Je <b>lui</b> parle. Tu dois <b>lui</b> parler. Je <b>leur</b> donne un conseil.</i></p>", pt:"« lui » serve para homem e para mulher: « je lui parle » = eu falo com ele / com ela."},
            items:[
              {id:"a1-cj-1", type:"mixte", sous_type:"transformation", consigne:"Remplace « à mon amie » par lui ou leur.", q:"Je parle à mon amie.", accept:["Je lui parle."]},
              {id:"a1-cj-2", type:"mixte", sous_type:"transformation", consigne:"Remplace par lui ou leur.", q:"Je donne un conseil à mes parents.", accept:["Je leur donne un conseil."]},
              {id:"a1-cj-3", type:"mixte", sous_type:"transformation", consigne:"Remplace par lui ou leur.", q:"Tu dois parler à ton chef.", accept:["Tu dois lui parler."]},
              {id:"a1-cj-4", type:"ordre", consigne:"Remets la question dans l'ordre.", unites:["Tu","as","un","conseil","pour","moi"]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Un message à un ami", titre_pt:"Uma mensagem a um amigo", dur:"8 min",
            items:[
              {id:"a1-ee-1", type:"ouverte", q:"Ton ami t'écrit : « Je déteste mon travail mais j'ai besoin d'argent. » Réponds-lui (40 mots minimum) avec au moins un « tu dois », un « il faut » et un impératif.", lignes:6, min_mots:40,
               modele:"Critères : salutation, au moins 3 conseils avec trois structures différentes (devoir, il faut, impératif), une phrase d'encouragement, formule finale (Bisous, À bientôt…)."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"À qui demandes-tu conseil ?", titre_pt:"A quem você pede conselho?", dur:"4 min",
            items:[
              {id:"a1-eo-1", type:"oral", q:"Enregistre-toi (5-6 phrases) : à qui demandes-tu conseil en général ? Pourquoi ? Raconte une situation où tu as demandé un conseil.", consigne_pt:"Grave-se (5-6 frases): a quem você costuma pedir conselho? Por quê? Conte uma situação em que você pediu um conselho."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Situations à conseiller", titre_pt:"Situações para aconselhar", dur:"6 min",
            consigne_fr:"Lis les quatre situations.", consigne_pt:"Leia as quatro situações.",
            texte:{fr:"<p>1. « Mon chef a repris une de mes idées sans me citer. »<br>2. « J'ai reçu une offre de travail à l'étranger mais ma famille ne veut pas y aller. »<br>3. « Je déteste mon travail mais j'ai besoin d'argent. »<br>4. « Mon ami me ment depuis des mois. »</p>", source:"Activité 1 du matériel « Un petit conseil ! »."},
            items:[
              {id:"a1-sy-1", type:"qcm", q:"Situation 4 : quel conseil est le plus adapté ?", options:["Parle-lui calmement de ce que tu sais.","Ne dis rien et pars.","Mens-lui aussi."], correct:0},
              {id:"a1-sy-2", type:"mixte", sous_type:"transformation", consigne:"Transforme en impératif.", q:"Tu dois demander l'avis de ta famille.", accept:["Demande l'avis de ta famille !","Demande l'avis de ta famille."]},
              {id:"a1-sy-3", type:"ouverte", q:"Choisis une situation et donne 2 conseils : un avec « tu dois », un avec l'impératif.", lignes:3, min_mots:15}
            ]}
        ]
      },

      /* ============================================== A2 ============================================== */
      A2: {
        duree: {min:45, max:60},
        intro_fr: "Donner un bon conseil, c'est plus difficile qu'on ne le pense : il faut écouter, comprendre la situation et choisir les bons mots. Cette semaine, tu apprends à conseiller avec douceur grâce au conditionnel : « tu devrais », « à ta place, je… », et à recommander avec « mieux vaut ».",
        intro_pt: "Dar um bom conselho é mais difícil do que parece: é preciso ouvir, entender a situação e escolher as palavras certas. Esta semana, você aprende a aconselhar com delicadeza graças ao condicional: « tu devrais », « à ta place, je… », e a recomendar com « mieux vaut ».",
        objectifs: [
          {fr:"Comprendre un texte sur la manière de donner un conseil.", pt:"Entender um texto sobre a maneira de dar um conselho."},
          {fr:"Conseiller avec douceur : tu devrais, à ta place je + conditionnel.", pt:"Aconselhar com delicadeza: tu devrais, à ta place je + condicional."},
          {fr:"Recommander avec « mieux vaut + infinitif » et « conseiller de + infinitif ».", pt:"Recomendar com « mieux vaut + infinitivo » e « conseiller de + infinitivo »."}
        ],
        grammaire: ["Le <b>conditionnel présent</b> : radical du futur + -ais, -ais, -ait, -ions, -iez, -aient", "<b>Tu devrais / Vous devriez</b> + infinitif", "<b>À ta place / À votre place</b>, je + conditionnel", "<b>Mieux vaut</b> + infinitif · <b>conseiller à quelqu'un de</b> + infinitif"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Mots et verbes du conseil", titre_pt:"Palavras e verbos do conselho", dur:"7 min",
            items:[
              {id:"a2-voc-1", type:"association", consigne:"Associe le verbe à son sens.", paires:[["conseiller","aconselhar"],["hésiter","hesitar"],["devoir","dever"],["réagir","reagir"],["se tromper","enganar-se"],["prendre une décision","tomar uma decisão"]]},
              {id:"a2-voc-2", type:"trous", texte:"Elle ___ à dire ce qu'elle pense vraiment. Il faut du ___ pour parler franchement. Nous cherchons une ___ ensemble.", blancs:[["hésite"],["courage"],["solution"]]},
              {id:"a2-voc-3", type:"qcm", q:"« Je lui conseille de parler directement à son chef. » La construction est…", options:["conseiller à quelqu'un de + infinitif","conseiller quelqu'un que + verbe","conseiller pour + nom"], correct:0}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Un conseil, est-ce toujours bienvenu ?", titre_pt:"Um conselho é sempre bem-vindo?", dur:"10 min",
            consigne_fr:"Lis le texte, puis réponds.", consigne_pt:"Leia o texto e depois responda.",
            texte:{titre:"Texte 2", fr:"<p>Il est parfois difficile de savoir si un conseil est vraiment bienvenu. Quand quelqu'un nous demande notre avis, nous pensons qu'il veut une réponse honnête. Mais souvent, il cherche surtout quelqu'un qui l'écoute. Donner un conseil non sollicité peut même blesser, surtout si la personne a déjà pris une décision. Il vaut donc mieux commencer par poser des questions : « Qu'est-ce que tu as déjà essayé ? » ou « Tu veux que je te donne mon avis ou tu préfères juste en parler ? »</p><p>Parfois, les gens ont besoin de réfléchir à voix haute, pas nécessairement d'entendre des solutions. Dans ces moments-là, le meilleur conseil est souvent de ne pas en donner du tout — juste écouter, poser des questions ouvertes et laisser l'autre trouver sa propre réponse.</p>", source:"Texte 2 du matériel « Un petit conseil ! »."},
            items:[
              {id:"a2-ce-1", type:"qcm", q:"Selon le texte, une personne qui demande notre avis cherche souvent…", options:["quelqu'un qui l'écoute","une solution immédiate","quelqu'un qui décide pour elle"], correct:0},
              {id:"a2-ce-2", type:"qcm", q:"Un conseil « non sollicité », c'est un conseil…", options:["qu'on n'a pas demandé","très utile","donné par un professionnel"], correct:0},
              {id:"a2-ce-3", type:"qcm", q:"Que faut-il faire avant de donner un conseil, selon le texte ?", options:["poser des questions","donner plusieurs solutions","parler de soi"], correct:0},
              {id:"a2-ce-4", type:"court", q:"Recopie une des deux questions proposées par le texte.", accept:["Qu'est-ce que tu as déjà essayé ?","Tu veux que je te donne mon avis ou tu préfères juste en parler ?"]},
              {id:"a2-ce-5", type:"ouverte", q:"Le texte dit que « le meilleur conseil est souvent de ne pas en donner du tout ». Tu es d'accord ? Explique en 2 ou 3 phrases.", lignes:3, min_mots:20}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter une leçon sur le conseil", titre_pt:"Ouvir uma aula sobre o conselho", dur:"6 min",
            consigne_fr:"Regarde la vidéo (environ 3 minutes). Tu peux la regarder deux fois.", consigne_pt:"Assista ao vídeo (cerca de 3 minutos). Você pode assistir duas vezes.",
            video: V_PROFESOR,
            items:[
              {id:"a2-co-1", type:"ouverte", q:"Note 3 phrases de conseil que tu entends.", lignes:3},
              {id:"a2-co-2", type:"ouverte", q:"Reformule chaque phrase notée avec « Tu devrais… » pour la rendre plus douce.", lignes:3},
              {id:"a2-co-3", type:"ouverte", avis:true, q:"Selon toi, « tu dois » et « tu devrais » : quelle différence de ton ?", lignes:2}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Conseiller avec le conditionnel", titre_pt:"Aconselhar com o condicional", dur:"9 min",
            rappel:{fr:"<p><b>Conditionnel présent</b> = radical du futur + terminaisons de l'imparfait : je prendr<b>ais</b>, tu prendr<b>ais</b>, il prendr<b>ait</b>, nous prendr<b>ions</b>, vous prendr<b>iez</b>, ils prendr<b>aient</b>.</p><p>Radicaux irréguliers : devoir → <b>devr</b>- · faire → <b>fer</b>- · aller → <b>ir</b>- · être → <b>ser</b>- · avoir → <b>aur</b>- · attendre → <b>attendr</b>-.</p><p>👉 <b>Tu devrais</b> / <b>Vous devriez</b> + infinitif · 👉 <b>À ta place</b>, j'<b>attendrais</b> encore un peu. · 👉 <b>Mieux vaut</b> + infinitif : <i>Mieux vaut prévenir que guérir.</i></p>",
                    pt:"« Tu devrais » = « você deveria » : é mais suave que « tu dois » (você deve). « À ta place » = « no seu lugar »."},
            items:[
              {id:"a2-gr-1", type:"trous", texte:"Tu ___ (devoir) lui parler. Vous ___ (devoir) vous reposer. À ta place, j'___ (attendre) encore un peu. À ta place, je ___ (faire) une liste.", blancs:[["devrais"],["devriez"],["attendrais"],["ferais"]], accents:"strict"},
              {id:"a2-gr-2", type:"mixte", sous_type:"transformation", consigne:"Rends le conseil plus doux avec « tu devrais ».", q:"Tu dois dormir plus.", accept:["Tu devrais dormir plus."]},
              {id:"a2-gr-3", type:"mixte", sous_type:"transformation", consigne:"Reformule avec « À ta place, je… ».", q:"Tu dois prendre rendez-vous aujourd'hui.", accept:["À ta place, je prendrais rendez-vous aujourd'hui.","À ta place je prendrais rendez-vous aujourd'hui."]},
              {id:"a2-gr-4", type:"qcm", q:"« ___ prévenir que guérir. »", options:["Mieux vaut","Il vaut","Tu devrais"], correct:0, explication:"Proverbe : <b>Mieux vaut</b> prévenir que guérir (= é melhor prevenir do que remediar)."},
              {id:"a2-gr-5", type:"choix_justif", q:"Pour un conseil poli à un collègue :", options:["Vous devez partir.","Vous devriez partir."], correct:1, consigne:"Choisis, puis explique la différence de ton.", explication:"Le conditionnel (<b>devriez</b>) adoucit le conseil ; « vous devez » ressemble à un ordre."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Du conseil à l'ordre", titre_pt:"Do conselho à ordem", dur:"7 min",
            items:[
              {id:"a2-cj-1", type:"mixte", sous_type:"transformation", consigne:"Transforme l'ordre en conseil doux (« tu devrais »).", q:"Parle à ton chef !", accept:["Tu devrais parler à ton chef."]},
              {id:"a2-cj-2", type:"mixte", sous_type:"transformation", consigne:"Reformule avec « conseiller de ».", q:"Je lui dis : « Tu devrais postuler. »", accept:["Je lui conseille de postuler."]},
              {id:"a2-cj-3", type:"trous", texte:"Si j'étais toi, j'___ (aller) voir un médecin. À votre place, nous ___ (être) plus prudents.", blancs:[["irais"],["serions"]], accents:"strict"},
              {id:"a2-cj-4", type:"ordre", consigne:"Remets le conseil dans l'ordre.", unites:["À ta place,","j'attendrais","encore","un peu"]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Répondre à une demande de conseil", titre_pt:"Responder a um pedido de conselho", dur:"10 min",
            items:[
              {id:"a2-ee-1", type:"ouverte", q:"Une amie t'écrit : « J'ai reçu une offre de travail à l'étranger mais ma famille ne veut pas y aller. Qu'est-ce que tu ferais à ma place ? » Réponds-lui (70-90 mots) : pose une question, puis donne 3 conseils (tu devrais, à ta place, mieux vaut).", lignes:8, min_mots:70,
               modele:"Critères : empathie au début, au moins une question ouverte, 3 structures de conseil différentes au conditionnel ou avec « mieux vaut », conclusion qui laisse le choix à l'amie."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Un conseil que j'ai suivi", titre_pt:"Um conselho que eu segui", dur:"5 min",
            items:[
              {id:"a2-eo-1", type:"oral", q:"Enregistre-toi (1 min 30) : raconte un conseil qu'on t'a donné. Tu l'as suivi ? C'était une bonne idée ? Que conseillerais-tu à quelqu'un dans la même situation ?", consigne_pt:"Grave-se (1min30): conte um conselho que te deram. Você seguiu? Foi uma boa ideia? O que você aconselharia a alguém na mesma situação?"}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Le mauvais conseiller", titre_pt:"O mau conselheiro", dur:"8 min",
            consigne_fr:"Lis le dialogue : A donne des conseils sans écouter.", consigne_pt:"Leia o diálogo: A dá conselhos sem ouvir.",
            texte:{fr:"<p>— Tu devrais vraiment aller lui parler. Je sais exactement ce que tu ressens — moi, dans ta situation, j'aurais déjà réglé ça depuis longtemps.<br>— Mais tu ne connais pas tous les détails.<br>— Peu importe ! À ta place, je n'hésiterais pas. Mieux vaut en finir maintenant que de souffrir encore six mois.<br>— C'est facile à dire pour toi…<br>— Fais-moi confiance. Tu verras, mon conseil est le bon.</p>", source:"Activité 3 « Texte à jouer » du matériel « Un petit conseil ! »."},
            items:[
              {id:"a2-sy-1", type:"qcm", q:"Quel est le principal problème du conseiller ?", options:["Il n'écoute pas et ne pose aucune question.","Il parle trop doucement.","Il ne donne aucun conseil."], correct:0},
              {id:"a2-sy-2", type:"court", q:"Recopie la phrase où le conseiller utilise « À ta place ».", accept:["À ta place, je n'hésiterais pas.","À ta place je n'hésiterais pas"]},
              {id:"a2-sy-3", type:"ouverte", q:"Réécris la réponse du conseiller après « Mais tu ne connais pas tous les détails. » : il pose une question et donne un conseil plus doux (3-4 phrases).", lignes:4, min_mots:25, modele:"Tu as raison, raconte-moi. Qu'est-ce qui te fait peur exactement ? Si tu veux, à ta place, j'attendrais un peu avant de lui parler."}
            ]}
        ]
      },

      /* ============================================== B1 ============================================== */
      B1: {
        duree: {min:50, max:60},
        intro_fr: "Demander, donner, recevoir un conseil : trois gestes délicats. Cette semaine, tu exprimes une nécessité avec « il faut que + subjonctif », tu nuances tes conseils et tu apprends à réagir quand on te conseille — même quand tu n'es pas d'accord.",
        intro_pt: "Pedir, dar, receber um conselho: três gestos delicados. Esta semana, você expressa uma necessidade com « il faut que + subjuntivo », dá conselhos com nuance e aprende a reagir quando te aconselham — mesmo quando não concorda.",
        objectifs: [
          {fr:"Exprimer une nécessité ou un conseil fort avec « il faut que + subjonctif ».", pt:"Expressar uma necessidade ou um conselho forte com « il faut que + subjuntivo »."},
          {fr:"Demander un conseil et y réagir avec nuance.", pt:"Pedir um conselho e reagir com nuance."},
          {fr:"Distinguer un conseil d'un ordre et argumenter.", pt:"Distinguir um conselho de uma ordem e argumentar."}
        ],
        grammaire: ["<b>Il faut que</b> + subjonctif présent (verbes réguliers)", "Subjonctifs irréguliers : être, avoir, faire, aller, pouvoir, savoir", "<b>Il faut</b> + infinitif (général) / <b>il faut que</b> + subjonctif (personne précise)", "Réagir : Je comprends ton point de vue, mais… · C'est une bonne idée, je n'y avais pas pensé."],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Demander, donner, réagir", titre_pt:"Pedir, dar, reagir", dur:"7 min",
            items:[
              {id:"b1-voc-1", type:"association", consigne:"Associe chaque phrase à sa fonction.", paires:[
                ["Qu'est-ce que tu ferais à ma place ?","demander un conseil"],
                ["Selon toi, qu'est-ce que je devrais faire ?","demander un avis"],
                ["Il faut que tu lui parles avant la réunion.","donner un conseil fort"],
                ["C'est une bonne idée, je n'y avais pas pensé.","accepter un conseil"],
                ["Je comprends ton point de vue, mais…","nuancer un conseil"],
                ["C'est difficile à mettre en pratique parce que…","exprimer une difficulté"]]},
              {id:"b1-voc-2", type:"trous", texte:"Je manque de ___ sur cette situation : j'ai besoin de l'avis de quelqu'un d'extérieur. Il essaie de garder son esprit ___ face aux conseils de ses parents.", blancs:[["recul"],["critique"]], aide_pt:"manquer de recul = faltar distanciamento ; esprit critique = senso crítico"},
              {id:"b1-voc-3", type:"qcm", q:"« Un conseil bienveillant » est un conseil…", options:["donné avec gentillesse et bonne intention","donné sans réfléchir","que personne ne veut entendre"], correct:0}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Écouter avant de conseiller", titre_pt:"Ouvir antes de aconselhar", dur:"10 min",
            consigne_fr:"Lis le texte, puis réponds.", consigne_pt:"Leia o texto e depois responda.",
            texte:{titre:"Texte 2", fr:"<p>Il est parfois difficile de savoir si un conseil est vraiment bienvenu. Quand quelqu'un nous demande notre avis, nous pensons qu'il veut une réponse honnête. Mais souvent, il cherche surtout quelqu'un qui l'écoute. Donner un conseil non sollicité peut même blesser, surtout si la personne a déjà pris une décision. Il vaut donc mieux commencer par poser des questions : « Qu'est-ce que tu as déjà essayé ? » ou « Tu veux que je te donne mon avis ou tu préfères juste en parler ? »</p><p>Parfois, les gens ont besoin de réfléchir à voix haute, pas nécessairement d'entendre des solutions. Dans ces moments-là, le meilleur conseil est souvent de ne pas en donner du tout — juste écouter, poser des questions ouvertes et laisser l'autre trouver sa propre réponse. C'est une forme de respect et de confiance envers l'autre personne.</p>", source:"Texte 2 du matériel « Un petit conseil ! »."},
            items:[
              {id:"b1-ce-1", type:"qcm", q:"Quelle est l'idée principale du texte ?", options:["Avant de conseiller, il faut surtout écouter.","Il faut toujours donner son avis honnêtement.","Les conseils non demandés sont les plus utiles."], correct:0},
              {id:"b1-ce-2", type:"qcm", q:"Pourquoi un conseil non sollicité peut-il blesser ?", options:["La personne a peut-être déjà pris sa décision.","Il est toujours faux.","Il est donné par un inconnu."], correct:0},
              {id:"b1-ce-3", type:"qcm", q:"Selon le texte, ne pas donner de conseil est…", options:["une forme de respect et de confiance","un manque de politesse","une erreur"], correct:0},
              {id:"b1-ce-4", type:"court", q:"Trouve dans le texte l'expression qui signifie « pensar em voz alta ».", accept:["réfléchir à voix haute"]},
              {id:"b1-ce-5", type:"ouverte", q:"Pense à une situation réelle : as-tu déjà donné un conseil alors que l'autre voulait seulement être écouté ? Raconte en 3-4 phrases.", lignes:4, min_mots:30}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter et nuancer", titre_pt:"Ouvir e matizar", dur:"7 min",
            consigne_fr:"Regarde la vidéo (environ 3 minutes). Elle est de niveau A2 : ta tâche est de rendre les conseils plus nuancés.", consigne_pt:"Assista ao vídeo (cerca de 3 minutos). Ele é de nível A2: sua tarefa é deixar os conselhos mais matizados.",
            video: V_PROFESOR,
            items:[
              {id:"b1-co-1", type:"ouverte", q:"Note 3 conseils entendus dans la vidéo.", lignes:3},
              {id:"b1-co-2", type:"ouverte", q:"Reformule ces 3 conseils : un avec « il faut que + subjonctif », un avec « à ta place », un avec « je te conseille de ».", lignes:4},
              {id:"b1-co-3", type:"ouverte", avis:true, q:"Les structures de la vidéo te semblent-elles plutôt des conseils ou des ordres ? Pourquoi ?", lignes:3}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Il faut que + subjonctif", titre_pt:"Il faut que + subjuntivo", dur:"10 min",
            rappel:{fr: SUBJ_RAPPEL_FR, pt: SUBJ_RAPPEL_PT},
            items:[
              {id:"b1-gr-1", type:"trous", texte:"Il faut que tu lui ___ (parler) avant la réunion. Il faut que nous ___ (prendre) une décision ensemble. Il faut qu'elle ___ (comprendre) la situation. Il faut que vous ___ (choisir) une solution rapidement.", blancs:[["parles"],["prenions"],["comprenne"],["choisissiez"]], accents:"strict"},
              {id:"b1-gr-2", type:"trous", texte:"Il faut que vous ___ (être) à l'heure. Il faut que tu ___ (faire) attention à ce que tu dis. Il faut qu'il ___ (avoir) du courage. Il faut que j'___ (aller) le voir.", blancs:[["soyez"],["fasses"],["ait"],["aille"]], accents:"strict"},
              {id:"b1-gr-3", type:"qcm", q:"Quelle phrase est une règle générale (sans personne précise) ?", options:["Il faut écouter avant de conseiller.","Il faut que tu écoutes avant de conseiller."], correct:0, explication:"<b>Il faut + infinitif</b> = règle générale ; <b>il faut que + subjonctif</b> = une personne précise."},
              {id:"b1-gr-4", type:"mixte", sous_type:"transformation", consigne:"Transforme avec « il faut que ».", q:"Tu dois réfléchir avant de répondre.", accept:["Il faut que tu réfléchisses avant de répondre."]},
              {id:"b1-gr-5", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur.", q:"Il faut que tu es patient.", accept:["Il faut que tu sois patient.","Il faut que tu sois patiente."]}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Varier les structures", titre_pt:"Variar as estruturas", dur:"8 min",
            items:[
              {id:"b1-cj-1", type:"mixte", sous_type:"transformation", consigne:"Reformule avec « il faut que ».", q:"Vous devez prendre une décision aujourd'hui.", accept:["Il faut que vous preniez une décision aujourd'hui."]},
              {id:"b1-cj-2", type:"mixte", sous_type:"transformation", consigne:"Reformule avec « À ta place, je… ».", q:"Il faut que tu attendes encore un peu.", accept:["À ta place, j'attendrais encore un peu.","À ta place j'attendrais encore un peu."]},
              {id:"b1-cj-3", type:"mixte", sous_type:"transformation", consigne:"Reformule avec « Mieux vaut ».", q:"Il est préférable de prévenir plutôt que de guérir.", accept:["Mieux vaut prévenir que guérir."]},
              {id:"b1-cj-4", type:"trous", texte:"Je comprends ton point de ___ , mais c'est difficile à mettre en ___ .", blancs:[["vue"],["pratique"]]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Courrier des lecteurs", titre_pt:"Carta dos leitores", dur:"15 min",
            items:[
              {id:"b1-ee-1", type:"ouverte", q:"Une lectrice écrit à un magazine : « Mon chef a repris une de mes idées sans me citer. Je n'ose pas en parler. » Tu réponds dans la rubrique « Un petit conseil » (130-160 mots) : montre que tu comprends, pose une question, donne 3 conseils variés (il faut que, à votre place, je vous conseille de), propose une phrase qu'elle pourrait dire à son chef.", lignes:12, min_mots:130,
               modele:"Critères : vouvoiement cohérent, empathie, au moins 2 subjonctifs corrects, 3 structures différentes, phrase concrète pour le chef, conclusion qui respecte son choix."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Conseil ou ordre ?", titre_pt:"Conselho ou ordem?", dur:"6 min",
            items:[
              {id:"b1-eo-1", type:"oral", q:"Enregistre-toi (environ 2 min) : quelle est la différence entre donner un conseil et donner un ordre ? Donne un exemple de chaque et dis comment le ton peut transformer l'un en l'autre.", consigne_pt:"Grave-se (cerca de 2 min): qual é a diferença entre dar um conselho e dar uma ordem? Dê um exemplo de cada um."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Proverbes et conseils universels", titre_pt:"Provérbios e conselhos universais", dur:"10 min",
            consigne_fr:"Voici cinq proverbes français.", consigne_pt:"Aqui estão cinco provérbios franceses.",
            texte:{fr:"<p>« Mieux vaut prévenir que guérir. »<br>« Aide-toi et le ciel t'aidera. »<br>« L'expérience est la mère de la sagesse. »<br>« Il ne faut pas vendre la peau de l'ours avant de l'avoir tué. »<br>« Les conseilleurs ne sont pas les payeurs. »</p>", source:"Activité 5 du matériel « Un petit conseil ! »."},
            items:[
              {id:"b1-sy-1", type:"association", consigne:"Associe chaque proverbe à son sens.", paires:[
                ["Mieux vaut prévenir que guérir.","Il est préférable d'éviter un problème que de le réparer."],
                ["Aide-toi et le ciel t'aidera.","Il faut d'abord agir soi-même."],
                ["Il ne faut pas vendre la peau de l'ours avant de l'avoir tué.","Il ne faut pas compter sur un résultat avant de l'avoir obtenu."],
                ["Les conseilleurs ne sont pas les payeurs.","Celui qui conseille ne subit pas les conséquences."]]},
              {id:"b1-sy-2", type:"ouverte", q:"Existe-t-il un équivalent brésilien de « Mieux vaut prévenir que guérir » ? Lequel ? Explique en 1-2 phrases.", lignes:2},
              {id:"b1-sy-3", type:"ouverte", q:"Quel proverbe préfères-tu ? Donne un exemple personnel où il s'est appliqué (ou non), en 4-5 phrases.", lignes:5, min_mots:40}
            ]}
        ]
      },

      /* ============================================== B2 ============================================== */
      B2: {
        duree: {min:55, max:70},
        intro_fr: "Un conseil engage : celui qui le donne prend une part de responsabilité, celui qui le reçoit garde sa liberté. Cette semaine, tu affines ta façon de conseiller (subjonctif après les verbes de conseil, conditionnel passé), tu analyses un « mauvais conseiller » et tu débats : doit-on toujours dire la vérité à quelqu'un qu'on aime ?",
        intro_pt: "Um conselho compromete: quem o dá assume parte da responsabilidade, quem o recebe mantém sua liberdade. Esta semana, você refina sua maneira de aconselhar (subjuntivo após verbos de conselho, condicional passado), analisa um « mau conselheiro » e debate: devemos sempre dizer a verdade a quem amamos?",
        objectifs: [
          {fr:"Formuler des conseils nuancés et des regrets : à ta place, j'aurais…", pt:"Formular conselhos matizados e arrependimentos: à ta place, j'aurais…"},
          {fr:"Employer le subjonctif après les expressions de conseil et de nécessité.", pt:"Empregar o subjuntivo após expressões de conselho e necessidade."},
          {fr:"Argumenter dans un débat et conclure de façon nuancée.", pt:"Argumentar num debate e concluir com nuance."}
        ],
        grammaire: ["Subjonctif après <b>il vaudrait mieux que, il est préférable que, je te conseille de / je souhaite que</b>", "<b>Conditionnel passé</b> : à ta place, j'aurais / je serais + participe passé", "Hypothèse au passé : si + plus-que-parfait, conditionnel passé", "Connecteurs : d'un côté… de l'autre, cependant, en revanche, certes… mais"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Nuances du conseil", titre_pt:"Nuances do conselho", dur:"8 min",
            items:[
              {id:"b2-voc-1", type:"association", consigne:"Associe l'expression à son sens.", paires:[
                ["prendre du recul","regarder une situation avec distance"],
                ["un conseil non sollicité","un avis qu'on n'a pas demandé"],
                ["se mettre sur la défensive","réagir comme si on était attaqué"],
                ["brouiller le jugement","empêcher de penser clairement"],
                ["prendre une part de responsabilité","être en partie responsable"],
                ["un mensonge bienveillant","une petite fausseté pour protéger"]]},
              {id:"b2-voc-2", type:"trous", texte:"Trop d'émotion peut ___ le jugement, mais trop de distance peut rendre le conseil froid. Ma première réaction est parfois de me mettre sur la ___ .", blancs:[["brouiller"],["défensive"]]},
              {id:"b2-voc-3", type:"qcm", q:"« Les conseilleurs ne sont pas les payeurs » critique…", options:["ceux qui conseillent sans assumer les conséquences","les personnes qui paient trop cher","ceux qui refusent les conseils"], correct:0}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Faut-il se méfier des bons conseils ?", titre_pt:"É preciso desconfiar dos bons conselhos?", dur:"12 min",
            consigne_fr:"Lis la chronique, puis réponds.", consigne_pt:"Leia a crônica e depois responda.",
            texte:{titre:"Chronique « Un petit conseil ? »", fr:"<p>Nous avons tous, un jour, suivi un conseil qui semblait juste sur le moment et qui ne correspondait pas vraiment à ce que nous voulions. Le problème n'était pas forcément le conseil lui-même, mais la manière dont nous l'avions reçu : comme une réponse toute faite, plutôt que comme une piste parmi d'autres.</p><p>Un bon conseiller ne décide pas à la place de l'autre. Il pose des questions, reformule, propose des options et laisse la personne trancher. Il sait aussi reconnaître les sujets sur lesquels il vaut mieux qu'il se taise : les choix de vie très personnels, les questions médicales, les décisions qui ne le regardent pas. Certes, donner son avis est une marque d'attention ; cependant, imposer une solution revient souvent à se mettre soi-même au centre.</p><p>Quant à celui qui reçoit un conseil, il lui faut garder son esprit critique. Écouter avec respect n'oblige pas à obéir. On peut remercier, réfléchir, puis faire autrement : c'est sa vie et sa décision.</p>", source:"Chronique rédigée pour ce parcours à partir des réponses modèles du matériel « Un petit conseil ! »."},
            items:[
              {id:"b2-ce-1", type:"qcm", q:"Selon l'auteur, pourquoi regrette-t-on parfois d'avoir suivi un conseil ?", options:["Parce qu'on l'a pris comme une réponse toute faite.","Parce que tous les conseils sont mauvais.","Parce que le conseiller mentait."], correct:0},
              {id:"b2-ce-2", type:"qcm", q:"Que fait un bon conseiller, selon le texte ?", options:["Il propose des options et laisse l'autre trancher.","Il décide rapidement à la place de l'autre.","Il refuse de donner son avis."], correct:0},
              {id:"b2-ce-3", type:"court", q:"Relève le connecteur de concession utilisé dans le 2e paragraphe (premier mot de la phrase).", accept:["Certes"]},
              {id:"b2-ce-4", type:"qcm", q:"« Il vaut mieux qu'il se taise » : le verbe « se taise » est au…", options:["subjonctif présent","indicatif présent","conditionnel présent"], correct:0},
              {id:"b2-ce-5", type:"ouverte", q:"« Imposer une solution revient souvent à se mettre soi-même au centre. » Explique cette phrase avec tes mots et dis si tu es d'accord (60-80 mots).", lignes:6, min_mots:60}
            ]},
          {id:"co", comp:"co", titre_fr:"Analyser une leçon", titre_pt:"Analisar uma aula", dur:"8 min",
            consigne_fr:"Regarde la vidéo (environ 3 minutes, niveau A2). Ta tâche est critique : comment rendre ces conseils plus adaptés à un contexte délicat ?", consigne_pt:"Assista ao vídeo (cerca de 3 minutos, nível A2). Sua tarefa é crítica: como tornar esses conselhos mais adequados a um contexto delicado?",
            video: V_PROFESOR,
            items:[
              {id:"b2-co-1", type:"ouverte", q:"Note les structures de conseil présentées dans la vidéo et classe-les de la plus directe à la plus douce.", lignes:3},
              {id:"b2-co-2", type:"ouverte", q:"Reformule deux conseils entendus pour un contexte délicat (un ami en deuil, un collègue en conflit avec sa direction), avec « il vaudrait mieux que » et « à ta place, j'aurais… ».", lignes:4},
              {id:"b2-co-3", type:"ouverte", avis:true, q:"Une leçon de grammaire suffit-elle pour savoir conseiller ? Qu'est-ce qui ne s'apprend pas dans un cours ?", lignes:3}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Subjonctif et conditionnel passé", titre_pt:"Subjuntivo e condicional passado", dur:"10 min",
            rappel:{fr:"<p><b>Subjonctif</b> après <i>il faut que, il vaudrait mieux que, il est préférable que, je souhaite que, je te conseille de</i> (+ infinitif) mais <i>je préférerais que</i> (+ subjonctif) : <i>Il vaudrait mieux que tu <b>attendes</b>. Je préférerais que vous <b>soyez</b> présents.</i></p><p><b>Conditionnel passé</b> = avoir/être au conditionnel + participe passé : <i>À ta place, j'<b>aurais attendu</b>. À sa place, je <b>serais parti(e)</b>.</i> Il exprime un regret ou un conseil qui arrive trop tard.</p><p><b>Hypothèse au passé</b> : <i>Si j'<b>avais écouté</b> ce conseil, je n'<b>aurais</b> pas <b>fait</b> cette erreur.</i></p>",
                    pt:"« À ta place, j'aurais attendu » = « no seu lugar, eu teria esperado » — um conselho sobre algo que já aconteceu."},
            items:[
              {id:"b2-gr-1", type:"trous", texte:"Il vaudrait mieux que tu ___ (attendre) sa réponse. Je préférerais que vous ___ (être) honnêtes avec elle. Il est préférable qu'il ___ (savoir) la vérité.", blancs:[["attendes"],["soyez"],["sache"]], accents:"strict"},
              {id:"b2-gr-2", type:"trous", texte:"À ta place, j'___ (attendre) avant de répondre. À sa place, elle ___ (partir) plus tôt.", blancs:[["aurais attendu"],["serait partie"]], accents:"strict"},
              {id:"b2-gr-3", type:"mixte", sous_type:"transformation", consigne:"Transforme en hypothèse au passé.", q:"Si j'écoute ce conseil, je ne fais pas cette erreur.", accept:["Si j'avais écouté ce conseil, je n'aurais pas fait cette erreur."]},
              {id:"b2-gr-4", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur de mode.", q:"Il vaudrait mieux que tu prends du recul.", accept:["Il vaudrait mieux que tu prennes du recul."]},
              {id:"b2-gr-5", type:"qcm", q:"Je te conseille ___ réfléchir avant de répondre.", options:["de","que tu","à"], correct:0, explication:"<b>Conseiller à quelqu'un de + infinitif</b>."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Reformuler avec tact", titre_pt:"Reformular com tato", dur:"10 min",
            items:[
              {id:"b2-cj-1", type:"ouverte", consigne:"Réécris ce conseil brutal de façon bienveillante et nuancée (2-3 phrases).", q:"« Quitte ce travail, il est nul et ton chef aussi. »", lignes:3,
               modele:"Je comprends que tu sois épuisé. Peut-être qu'il vaudrait mieux que tu prennes un peu de recul avant de décider ; à ta place, je chercherais d'abord une autre offre."},
              {id:"b2-cj-2", type:"mixte", sous_type:"transformation", consigne:"Transforme avec « il vaudrait mieux que ».", q:"Tu devrais lui dire la vérité.", accept:["Il vaudrait mieux que tu lui dises la vérité."]},
              {id:"b2-cj-3", type:"mixte", sous_type:"transformation", consigne:"Transforme en regret avec « À ta place, je… » au conditionnel passé.", q:"Tu as accepté ce poste trop vite.", accept:["À ta place, je n'aurais pas accepté ce poste trop vite.","À ta place, je n'aurais pas accepté ce poste si vite.","À ta place je n'aurais pas accepté ce poste trop vite."]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Essai : le conseil, une responsabilité ?", titre_pt:"Ensaio: o conselho, uma responsabilidade?", dur:"20 min",
            items:[
              {id:"b2-ee-1", type:"ouverte", q:"« Donner un conseil, c'est aussi prendre une responsabilité. » Discutez cette affirmation (200-250 mots) en concédant au moins un argument adverse. Contraintes : deux subjonctifs, un conditionnel passé, une hypothèse au passé, trois connecteurs (certes, cependant, en revanche…).", lignes:14, min_mots:200,
               modele:"Critères : introduction avec problématique, deux parties (thèse / concession), exemples concrets, connecteurs variés, conclusion nuancée, contraintes grammaticales respectées."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Débat : toujours dire la vérité ?", titre_pt:"Debate: sempre dizer a verdade?", dur:"8 min",
            items:[
              {id:"b2-eo-1", type:"oral", q:"Enregistre-toi (environ 2 min) : doit-on toujours dire la vérité à quelqu'un qu'on aime ? Choisis un camp (« oui, toujours » ou « un mensonge bienveillant peut protéger »), donne deux arguments, réfute un argument adverse et conclus de façon nuancée.", consigne_pt:"Grave-se (cerca de 2 min): devemos sempre dizer a verdade a quem amamos? Escolha um lado, dê dois argumentos, refute um argumento contrário e conclua com nuance."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Le mauvais conseiller, version longue", titre_pt:"O mau conselheiro, versão longa", dur:"12 min",
            consigne_fr:"Relis le dialogue : A conseille avec certitude, B n'arrive pas à s'expliquer.", consigne_pt:"Releia o diálogo: A aconselha com certeza, B não consegue se explicar.",
            texte:{fr:"<p>— Tu devrais vraiment aller lui parler. Je sais exactement ce que tu ressens — moi, dans ta situation, j'aurais déjà réglé ça depuis longtemps.<br>— Mais tu ne connais pas tous les détails.<br>— Peu importe ! À ta place, je n'hésiterais pas. Mieux vaut en finir maintenant que de souffrir encore six mois.<br>— C'est facile à dire pour toi…<br>— Fais-moi confiance. Tu verras, mon conseil est le bon.</p>", source:"Activité 3 « Texte à jouer » du matériel « Un petit conseil ! »."},
            items:[
              {id:"b2-sy-1", type:"qcm", q:"« Je sais exactement ce que tu ressens » pose problème parce que…", options:["le conseiller prétend comprendre sans avoir écouté","c'est une phrase trop longue","elle exprime un doute"], correct:0},
              {id:"b2-sy-2", type:"court", q:"Relève la phrase au conditionnel passé prononcée par le conseiller (à partir de « moi »).", accept:["moi, dans ta situation, j'aurais déjà réglé ça depuis longtemps","moi dans ta situation j'aurais déjà réglé ça depuis longtemps","j'aurais déjà réglé ça depuis longtemps"]},
              {id:"b2-sy-3", type:"ouverte", q:"Réécris le dialogue complet (6-8 répliques) avec un conseiller empathique : il pose au moins deux questions ouvertes, reformule, propose une option avec « il vaudrait mieux que » et laisse la décision à B.", lignes:10, min_mots:90},
              {id:"b2-sy-4", type:"ouverte", avis:true, q:"« Il faut se méfier des bons conseils comme des mauvais. » (citation attribuée par le matériel à l'humoriste Alphonse Allais) Qu'en penses-tu ? 3-4 phrases.", lignes:4, min_mots:30}
            ]}
        ]
      }
    }
  };

  if(typeof temasSemanas !== 'undefined' && !temasSemanas.some(t => t.id === theme.id)) temasSemanas.push(theme);
})();
