/* ===================== THÈME 19 → 25 octobre 2026 : « Vous voulez ce poste ? » (parcours v2) =====================
   Construit à partir des supports « Vous voulez ce poste ? » (matériel élève, guide du professeur,
   diaporamas) : vocabulaire, verbes, expressions, adjectifs qualificatifs, questions/réponses,
   jeu de rôle, question piège, pitch de 60 secondes, photos de candidats, histoire d'entretien.

   ⚠️ statut: "brouillon" — invisible pour les élèves tant que la professeure ne l'a pas publié
   (bouton « Publier » dans Admin › Suivi thème). Raison : les deux vidéos n'ont pas pu être vérifiées
   par transcription (voir "verification" ci-dessous). AUCUNE question factuelle n'a été rédigée sur
   leur contenu : les activités de compréhension orale sont des tâches ouvertes corrigées par la
   professeure. Après visionnage, elle peut ajouter des questions précises (avec repères temporels)
   via l'éditeur et cocher « vidéo vérifiée ».

   Les textes de compréhension écrite ont été rédigés pour ce parcours (documents réalistes,
   personnes et entreprises fictives, aucune statistique inventée). */
(function(){
  const V_ELISABETH = {
    id: "NSXWNXmnEEs",
    label: "Un entretien d'embauche en français — Dialogues pour le DELF A2 (La prof Elisabeth, 7 min 26)",
    verification: {statut:"a_valider", note:"titre, chaîne et durée vérifiés sur YouTube le 19/10/2026 ; contenu non vérifié (transcription inaccessible) — à regarder avant publication"}
  };
  const V_INSTANT = {
    id: "fKf-DbVW6qA",
    label: "Comment préparer son entretien d'embauche — Instant FLE (niveau A2-B1)",
    verification: {statut:"a_valider", note:"titre, chaîne et description vérifiés le 19/10/2026 (la description annonce des conseils pour avant, pendant et après l'entretien, écrits à l'écran) ; contenu non vérifié — à regarder avant publication"}
  };
  const ADJ_RAPPEL_FR = `<table class="tp-table"><tr><th>Masculin</th><th>Féminin</th><th>Règle</th></tr>
    <tr><td>rigoureux, curieux, ambitieux</td><td>rigoureuse, curieuse, ambitieuse</td><td>-eux → -euse</td></tr>
    <tr><td>créatif, actif, proactif</td><td>créative, active, proactive</td><td>-if → -ive</td></tr>
    <tr><td>organisé, motivé</td><td>organisée, motivée</td><td>+ e</td></tr>
    <tr><td>persévérant, polyvalent</td><td>persévérante, polyvalente</td><td>+ e (le t se prononce)</td></tr>
    <tr><td>autonome, fiable, efficace, diplomate</td><td>(identique)</td><td>finit déjà par -e</td></tr></table>
    <p>Au pluriel, on ajoute <b>-s</b> (organisés, créatives), sauf -eux qui ne change pas (rigoureux). Pour nuancer : <b>assez</b> &lt; <b>plutôt</b> &lt; <b>très</b> + adjectif.</p>`;

  const theme = {
    id: "entretien-2026-10-19",
    version: 2,
    statut: "brouillon",
    date_debut: "2026-10-19",
    periode: "19 → 25 octobre 2026",
    titre_fr: "Vous voulez ce poste ?",
    titre_pt: "Você quer esse cargo?",
    sub_fr: "Un vrai cahier d'activités pour réussir un entretien d'embauche en français : se présenter, parler de ses qualités, convaincre.",
    sub_pt: "Um verdadeiro caderno de atividades para ter sucesso numa entrevista de emprego em francês: apresentar-se, falar das qualidades, convencer.",
    niveaux: {

      /* ============================================== A0 ============================================== */
      A0: {
        duree: {min:30, max:45},
        intro_fr: "Un entretien d'embauche, c'est un rendez-vous pour obtenir un travail. Cette semaine, tu apprends à dire qui tu es, ce que tu fais et comment tu es. Tu vas lire une petite annonce, écouter un entretien et te présenter à l'écrit et à l'oral.",
        intro_pt: "Uma entrevista de emprego é um encontro para conseguir um trabalho. Esta semana, você aprende a dizer quem você é, o que faz e como você é. Você vai ler um pequeno anúncio, ouvir uma entrevista e se apresentar por escrito e oralmente.",
        objectifs: [
          {fr:"Dire mon nom, ma nationalité et ma profession.", pt:"Dizer meu nome, minha nacionalidade e minha profissão."},
          {fr:"Comprendre une petite annonce d'emploi très simple.", pt:"Entender um anúncio de emprego muito simples."},
          {fr:"Dire une ou deux qualités avec « Je suis… ».", pt:"Dizer uma ou duas qualidades com « Je suis… »."}
        ],
        grammaire: ["Le verbe <b>être</b> au présent (je suis, vous êtes, il/elle est)", "Le verbe <b>avoir</b> (j'ai … ans, j'ai … ans d'expérience)", "Masculin / féminin des adjectifs simples (organisé → organisée)"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Les mots de l'entretien", titre_pt:"As palavras da entrevista", dur:"5 min",
            consigne_fr:"Associe chaque mot français à sa traduction, puis complète.", consigne_pt:"Associe cada palavra francesa à sua tradução e depois complete.",
            items:[
              {id:"a0-voc-1", type:"association", consigne:"Associe le mot à sa traduction.", paires:[["un entretien","uma entrevista"],["un poste","um cargo"],["le salaire","o salário"],["un recruteur","um recrutador"],["une qualité","uma qualidade"],["un défaut","um defeito"]]},
              {id:"a0-voc-2", type:"qcm", q:"Le recruteur pose des…", options:["questions","salaires","postes"], correct:0, explication:"Le recruteur <b>pose des questions</b> au candidat. (poser une question = fazer uma pergunta)"},
              {id:"a0-voc-3", type:"qcm", q:"Le contraire de « une qualité », c'est…", options:["un poste","un défaut","un salaire"], correct:1},
              {id:"a0-voc-4", type:"trous", texte:"Je cherche un ___ dans un restaurant.", blancs:[["travail","emploi","poste","job"]], aide_pt:"procurar um trabalho = chercher un travail", explication:"On peut dire <i>un travail</i>, <i>un emploi</i> ou <i>un poste</i>."}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Lire une petite annonce", titre_pt:"Ler um pequeno anúncio", dur:"5 min",
            consigne_fr:"Lis l'annonce. Réponds aux questions.", consigne_pt:"Leia o anúncio. Responda às perguntas.",
            texte:{titre:"OFFRE D'EMPLOI", fr:"<p>Le restaurant <b>« Le Petit Paris »</b> cherche un serveur ou une serveuse.</p><p>📍 Lieu : Lyon<br>🕕 Horaires : du mardi au samedi, de 18 h à 23 h<br>✅ Profil : vous êtes souriant(e) et organisé(e). Vous parlez français et anglais.<br>📩 Envoyez votre CV par e-mail.</p>", source:"Document créé pour ce parcours (restaurant fictif)."},
            items:[
              {id:"a0-ce-1", type:"qcm", q:"Le restaurant cherche…", options:["un cuisinier","un serveur ou une serveuse","un vendeur"], correct:1},
              {id:"a0-ce-2", type:"qcm", q:"Le restaurant est à…", options:["Paris","Lyon","Marseille"], correct:1, explication:"Attention : le restaurant s'appelle « Le Petit Paris », mais il est à <b>Lyon</b>."},
              {id:"a0-ce-3", type:"court", q:"Combien de jours par semaine ? (écris le nombre)", accept:["5","cinq","5 jours","cinq jours"], explication:"Mardi, mercredi, jeudi, vendredi, samedi = <b>5 jours</b>."},
              {id:"a0-ce-4", type:"qcm", q:"Le travail est…", options:["le matin","l'après-midi","le soir"], correct:2, explication:"De 18 h à 23 h, c'est <b>le soir</b>."},
              {id:"a0-ce-5", type:"qcm", q:"Quelles langues faut-il parler ?", options:["Français et anglais","Français et espagnol","Seulement français"], correct:0}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter un entretien", titre_pt:"Ouvir uma entrevista", dur:"5 min",
            consigne_fr:"Regarde le début de la vidéo (2 minutes). Ce n'est pas grave si tu ne comprends pas tout : écoute les mots que tu connais.", consigne_pt:"Assista ao começo do vídeo (2 minutos). Não tem problema se você não entender tudo: ouça as palavras que você conhece.",
            video: V_ELISABETH,
            items:[
              {id:"a0-co-1", type:"ouverte", q:"Écris 3 mots que tu entends et que tu comprends.", lignes:2, modele:"Par exemple : entretien, travail, bonjour, expérience…"},
              {id:"a0-co-2", type:"ouverte", q:"Écris une question que tu entends (même avec des fautes).", lignes:2},
              {id:"a0-co-3", type:"ouverte", avis:true, q:"Tu as compris… beaucoup ? un peu ? pas beaucoup ? Écris un mot.", lignes:1}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Être et avoir · masculin et féminin", titre_pt:"Ser/estar e ter · masculino e feminino", dur:"6 min",
            rappel:{fr:"<p><b>Être</b> : je suis · tu es · il/elle est · nous sommes · vous êtes · ils/elles sont<br><b>Avoir</b> : j'ai · tu as · il/elle a · nous avons · vous avez · ils/elles ont</p><p>👉 L'âge et l'expérience se disent avec <b>avoir</b> : <i>J'ai 25 ans. J'ai deux ans d'expérience.</i></p><p>👉 Féminin : souvent <b>+ e</b> : organisé → organisé<b>e</b>.</p>",
                    pt:"Atenção: em francês a idade se diz com o verbo <b>avoir</b> (ter): « J'ai 25 ans » — nunca « Je suis 25 ans »."},
            items:[
              {id:"a0-gr-1", type:"trous", texte:"Je ___ brésilienne. Vous ___ français ? J'___ 25 ans. Elle ___ organisée.", blancs:[["suis"],["êtes"],["ai"],["est"]], accents:"strict"},
              {id:"a0-gr-2", type:"qcm", q:"Marie est très…", options:["organisé","organisée","organisés"], correct:1, explication:"Marie = féminin singulier → organis<b>ée</b>."},
              {id:"a0-gr-3", type:"qcm", q:"J'… deux ans d'expérience.", options:["suis","ai","es"], correct:1, aide_pt:"experiência = avoir", explication:"L'expérience se dit avec <b>avoir</b> : <i>j'ai deux ans d'expérience</i>."},
              {id:"a0-gr-4", type:"choix_justif", q:"Paulo est…", options:["sérieux","sérieuse"], correct:0, explication:"Paulo est un homme → masculin : <b>sérieux</b>.", consigne:"Choisis, puis explique en une phrase (en français ou en portugais)."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Transformer et remettre en ordre", titre_pt:"Transformar e ordenar", dur:"4 min",
            items:[
              {id:"a0-cj-1", type:"mixte", sous_type:"transformation", consigne:"Écris la phrase au féminin.", q:"Il est organisé.", accept:["Elle est organisée."]},
              {id:"a0-cj-2", type:"mixte", sous_type:"transformation", consigne:"Écris la phrase au féminin.", q:"Il est sérieux.", accept:["Elle est sérieuse."]},
              {id:"a0-cj-3", type:"ordre", consigne:"Remets les mots dans l'ordre.", unites:["Je","suis","rigoureuse","et","organisée"]},
              {id:"a0-cj-4", type:"ordre", consigne:"Remets les mots dans l'ordre.", unites:["J'ai","deux","ans","d'expérience"]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Je me présente (écrit)", titre_pt:"Eu me apresento (escrita)", dur:"5 min",
            items:[
              {id:"a0-ee-1", type:"ouverte", q:"Présente-toi pour un entretien : ton prénom, ta nationalité, ta profession et 2 qualités.", consigne_pt:"Apresente-se: nome, nacionalidade, profissão e 2 qualidades.", lignes:5, min_mots:15,
               modele:"Bonjour, je m'appelle Ana. Je suis brésilienne. Je suis vendeuse. Je suis organisée et souriante."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Je me présente (oral)", titre_pt:"Eu me apresento (oral)", dur:"3 min",
            items:[
              {id:"a0-eo-1", type:"oral", q:"Enregistre-toi : dis bonjour et présente-toi en 4 phrases (nom, nationalité, profession, une qualité).", consigne_pt:"Grave-se: diga bom dia e apresente-se em 4 frases."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Je réponds à l'annonce", titre_pt:"Eu respondo ao anúncio", dur:"5 min",
            consigne_fr:"Tu veux le poste au restaurant « Le Petit Paris ». ", consigne_pt:"Você quer o cargo no restaurante « Le Petit Paris ».",
            items:[
              {id:"a0-sy-1", type:"qcm", q:"Pour écrire au restaurant, tu commences par…", options:["Salut !","Bonjour Madame, Monsieur,","Coucou !"], correct:1, explication:"Avec un recruteur, on utilise un registre poli : <b>Bonjour Madame, Monsieur,</b>"},
              {id:"a0-sy-2", type:"ouverte", q:"Écris un petit message (3-4 phrases) au restaurant : salue, présente-toi, donne 2 qualités et dis « Je voudrais ce poste ».", lignes:4, min_mots:15,
               modele:"Bonjour Madame, Monsieur, je m'appelle Lucas. Je suis brésilien. Je suis souriant et organisé. Je parle portugais et un peu français. Je voudrais ce poste. Merci !"}
            ]}
        ]
      },

      /* ============================================== A1 ============================================== */
      A1: {
        duree: {min:35, max:45},
        intro_fr: "Un entretien d'embauche, ça se prépare ! Cette semaine, tu apprends à te présenter, à parler de ton expérience, de tes qualités et de tes défauts, et à poser des questions polies avec « vous ».",
        intro_pt: "Uma entrevista de emprego se prepara! Esta semana, você aprende a se apresentar, a falar da sua experiência, das suas qualidades e defeitos, e a fazer perguntas educadas com « vous ».",
        objectifs: [
          {fr:"Me présenter : nom, âge, ville, expérience, langues.", pt:"Apresentar-me: nome, idade, cidade, experiência, idiomas."},
          {fr:"Décrire mes qualités et un défaut avec des adjectifs bien accordés.", pt:"Descrever minhas qualidades e um defeito com adjetivos bem concordados."},
          {fr:"Poser et comprendre des questions simples au vouvoiement.", pt:"Fazer e entender perguntas simples com « vous »."}
        ],
        grammaire: ["Accord des adjectifs : -eux/-euse, -if/-ive, -é/-ée", "Assez / plutôt / très + adjectif", "Présent : verbes en -er, être, avoir", "La question avec « vous » (intonation, est-ce que, inversion)"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Le vocabulaire de l'entretien", titre_pt:"O vocabulário da entrevista", dur:"6 min",
            items:[
              {id:"a1-voc-1", type:"association", consigne:"Associe chaque mot à sa définition.", paires:[
                ["un entretien d'embauche","un rendez-vous pour obtenir un travail"],
                ["un recruteur","la personne qui choisit le candidat"],
                ["un poste","un travail précis dans une entreprise"],
                ["le salaire","l'argent reçu pour son travail"],
                ["les compétences","ce qu'on sait faire"],
                ["un défaut","un point faible"]]},
              {id:"a1-voc-2", type:"trous", texte:"Elle a passé trois ___ avant d'obtenir ce poste. Il a développé des ___ en communication.", blancs:[["entretiens","entretiens d'embauche"],["compétences"]]},
              {id:"a1-voc-3", type:"qcm", q:"« Le recruteur lui a posé des questions sur ses expériences passées. » Ici, « passées » veut dire…", options:["anteriores (avant)","futuras (après)","atuais (maintenant)"], correct:0}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Une annonce et une candidature", titre_pt:"Um anúncio e uma candidatura", dur:"7 min",
            consigne_fr:"Lis l'annonce et le message de Claire.", consigne_pt:"Leia o anúncio e a mensagem de Claire.",
            texte:{titre:"L'annonce et le message", fr:"<p><b>📢 Annonce</b> — L'agence <b>Voyage Plus</b> cherche un(e) assistant(e) commercial(e). Vous parlez anglais et espagnol. Vous êtes organisé(e) et communicatif/communicative. Envoyez votre CV avant le 30 octobre.</p><p><b>✉️ Message de Claire</b><br>Bonjour,<br>Je m'appelle Claire Martin. J'ai 28 ans et j'habite à Bordeaux. J'ai cinq ans d'expérience dans la vente. Je parle trois langues : français, anglais et espagnol. Je suis rigoureuse et autonome, et j'aime relever des défis. Je suis disponible pour un entretien le lundi ou le mardi.<br>Cordialement,<br>Claire Martin</p>", source:"Document créé pour ce parcours (agence et personne fictives), à partir du texte d'échauffement du matériel."},
            items:[
              {id:"a1-ce-1", type:"qcm", q:"Quel poste propose l'agence ?", options:["Directrice commerciale","Assistant(e) commercial(e)","Guide touristique"], correct:1},
              {id:"a1-ce-2", type:"court", q:"Combien d'années d'expérience a Claire ? (en chiffres ou en lettres)", accept:["5","cinq","5 ans","cinq ans"]},
              {id:"a1-ce-3", type:"qcm", q:"Quelles qualités Claire donne-t-elle ?", options:["Organisée et communicative","Rigoureuse et autonome","Créative et curieuse"], correct:1},
              {id:"a1-ce-4", type:"qcm", q:"Claire parle les langues demandées dans l'annonce ?", options:["Oui : anglais et espagnol (et français)","Non, seulement le français","Seulement l'anglais"], correct:0},
              {id:"a1-ce-5", type:"ouverte", q:"À ton avis, Claire est une bonne candidate ? Réponds en 1 ou 2 phrases avec « parce que ».", lignes:2, modele:"Oui, parce qu'elle parle anglais et espagnol et parce qu'elle a cinq ans d'expérience. Mais elle ne dit pas qu'elle est organisée."}
            ]},
          {id:"co", comp:"co", titre_fr:"Écouter un entretien", titre_pt:"Ouvir uma entrevista", dur:"6 min",
            consigne_fr:"Regarde la vidéo jusqu'à 3:00. Tu peux mettre les sous-titres en français et faire pause.", consigne_pt:"Assista ao vídeo até 3:00. Você pode ativar as legendas em francês e pausar.",
            video: V_ELISABETH,
            items:[
              {id:"a1-co-1", type:"ouverte", q:"Écris 4 mots du vocabulaire de l'entretien que tu entends.", lignes:2},
              {id:"a1-co-2", type:"ouverte", q:"Écris 2 questions que tu entends (même incomplètes).", lignes:3},
              {id:"a1-co-3", type:"ouverte", avis:true, q:"Quelle question te semble la plus difficile pour toi ? Pourquoi ?", lignes:2}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Les adjectifs pour parler de soi", titre_pt:"Os adjetivos para falar de si", dur:"7 min",
            rappel:{fr: ADJ_RAPPEL_FR, pt:"Em português « rigoroso/rigorosa » muda no final, em francês também: rigour<b>eux</b> / rigour<b>euse</b>. Atenção à pronúncia: no feminino a última consoante é pronunciada (créati<b>v</b>e, persévéran<b>t</b>e)."},
            items:[
              {id:"a1-gr-1", type:"trous", texte:"Elle est très ___ (créatif). Ma collègue est ___ (sérieux). Julie est assez ___ (organisé). Paula est ___ (autonome). Elle est ___ (ambitieux) mais réaliste.", blancs:[["créative"],["sérieuse"],["organisée"],["autonome"],["ambitieuse"]]},
              {id:"a1-gr-2", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur et réécris la phrase.", q:"Elle est très curieux.", accept:["Elle est très curieuse."]},
              {id:"a1-gr-3", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur et réécris la phrase.", q:"Ils sont communicatif.", accept:["Ils sont communicatifs."]},
              {id:"a1-gr-4", type:"choix_justif", q:"Marc est ___ : il aime bouger et faire du sport.", options:["actif","active"], correct:0, explication:"Marc = masculin → <b>actif</b> (féminin : active)."},
              {id:"a1-gr-5", type:"qcm", q:"Laquelle de ces phrases est la plus forte ?", options:["Je suis assez organisé.","Je suis plutôt organisé.","Je suis très organisé."], correct:2, explication:"assez &lt; plutôt &lt; <b>très</b>."}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Le présent et les questions polies", titre_pt:"O presente e as perguntas educadas", dur:"7 min",
            rappel:{fr:"<p>Verbes en -er : je travaill<b>e</b>, tu travaill<b>es</b>, il travaill<b>e</b>, nous travaill<b>ons</b>, vous travaill<b>ez</b>, ils travaill<b>ent</b>.</p><p>En entretien on dit <b>vous</b>. Trois façons de poser une question : <i>Vous parlez anglais ?</i> · <i>Est-ce que vous parlez anglais ?</i> · <i>Parlez-vous anglais ?</i> (plus formel)</p>", pt:"« Vous » é a forma educada (o senhor / a senhora). Na entrevista, use sempre « vous »."},
            items:[
              {id:"a1-cj-1", type:"trous", texte:"Je ___ (travailler) dans une banque. Vous ___ (parler) anglais ? Nous ___ (chercher) un vendeur. Elle ___ (avoir) dix ans d'expérience. Tu ___ (être) disponible lundi ?", blancs:[["travaille"],["parlez"],["cherchons"],["a"],["es"]], accents:"strict"},
              {id:"a1-cj-2", type:"mixte", sous_type:"transformation", consigne:"Transforme la question avec « vous ».", q:"Tu parles espagnol ?", accept:["Vous parlez espagnol ?","Est-ce que vous parlez espagnol ?","Parlez-vous espagnol ?"]},
              {id:"a1-cj-3", type:"mixte", sous_type:"transformation", consigne:"Transforme la question avec « vous ».", q:"Tu es disponible demain ?", accept:["Vous êtes disponible demain ?","Est-ce que vous êtes disponible demain ?","Êtes-vous disponible demain ?"]},
              {id:"a1-cj-4", type:"ordre", consigne:"Remets la question du recruteur dans l'ordre.", unites:["Quelles","sont","vos","principales","qualités"]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Je réponds à l'annonce", titre_pt:"Eu respondo ao anúncio", dur:"8 min",
            items:[
              {id:"a1-ee-1", type:"ouverte", q:"Réponds à l'annonce de Voyage Plus, comme Claire : présente-toi (nom, âge, ville), ton expérience, tes langues, 2 qualités avec assez/plutôt/très et tes disponibilités.", lignes:7, min_mots:40,
               modele:"Critères : formule de politesse (Bonjour, … Cordialement), présent correct, adjectifs accordés, au moins un « assez / plutôt / très », disponibilités."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"« Parlez-moi de vous. »", titre_pt:"« Fale-me sobre você. »", dur:"4 min",
            items:[
              {id:"a1-eo-1", type:"oral", q:"Enregistre-toi : réponds à « Parlez-moi de vous. » puis à « Quel est votre défaut ? » (5 à 6 phrases en tout).", consigne_pt:"Grave-se: responda a « Fale-me sobre você » e « Qual é o seu defeito? » (5 a 6 frases)."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Choisir un candidat", titre_pt:"Escolher um candidato", dur:"6 min",
            consigne_fr:"L'agence Voyage Plus hésite entre trois candidats. Lis les profils.", consigne_pt:"A agência hesita entre três candidatos. Leia os perfis.",
            texte:{fr:"<p><b>Lucas</b>, 30 ans : très créatif, parle anglais, mais souvent en retard.<br><b>Inès</b>, 45 ans : organisée, parle quatre langues, un peu impatiente.<br><b>Hugo</b>, 22 ans : pas d'expérience, très motivé et curieux, parle anglais et espagnol.</p>"},
            items:[
              {id:"a1-sy-1", type:"court", q:"Qui parle quatre langues ?", accept:["Inès","Ines"]},
              {id:"a1-sy-2", type:"mixte", sous_type:"transformation", consigne:"Écris la phrase au féminin.", q:"Il est très motivé et curieux.", accept:["Elle est très motivée et curieuse."]},
              {id:"a1-sy-3", type:"ouverte", q:"Qui choisis-tu pour le poste ? Écris 3 phrases : « Je choisis… parce qu'il/elle est… Mais il/elle est un peu… »", lignes:3, min_mots:20}
            ]}
        ]
      },

      /* ============================================== A2 ============================================== */
      A2: {
        duree: {min:45, max:60},
        intro_fr: "Un entretien d'embauche, ça se prépare : le vocabulaire, la posture, les réponses aux questions pièges… tout compte. Cette semaine, tu racontes ton parcours au passé, tu organises ta présentation et tu t'entraînes à convaincre un recruteur.",
        intro_pt: "Uma entrevista de emprego se prepara: o vocabulário, a postura, as respostas às perguntas difíceis… tudo conta. Esta semana, você conta seu percurso no passado, organiza sua apresentação e treina para convencer um recrutador.",
        objectifs: [
          {fr:"Comprendre une convocation à un entretien.", pt:"Entender uma convocação para entrevista."},
          {fr:"Raconter mon parcours au passé composé, avec d'abord / ensuite / enfin.", pt:"Contar meu percurso no passé composé, com d'abord / ensuite / enfin."},
          {fr:"Utiliser se présenter, poser sa candidature, convaincre, mettre en valeur.", pt:"Usar se présenter, poser sa candidature, convaincre, mettre en valeur."},
          {fr:"Répondre positivement à une question piège.", pt:"Responder de forma positiva a uma pergunta difícil."}
        ],
        grammaire: ["Passé composé avec avoir et être (accord avec être)", "Participes irréguliers : eu, été, fait, pris, convaincu", "Verbes pronominaux : je me suis présenté(e)", "Il y a / depuis · connecteurs d'abord, ensuite, puis, enfin"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"2 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Verbes et expressions de l'entretien", titre_pt:"Verbos e expressões da entrevista", dur:"6 min",
            items:[
              {id:"a2-voc-1", type:"association", consigne:"Associe chaque expression à sa traduction.", paires:[["poser sa candidature","candidatar-se"],["convaincre","convencer"],["se présenter","apresentar-se"],["mettre en valeur","valorizar, destacar"],["embaucher","contratar"],["licencier","demitir"]]},
              {id:"a2-voc-2", type:"trous", texte:"J'ai posé ma ___ pour ce poste il y a deux semaines. Elle n'a pas osé parler du ___ lors du premier entretien. Lors de l'entretien, elle a su mettre en ___ son expérience internationale.", blancs:[["candidature"],["salaire"],["valeur"]]},
              {id:"a2-voc-3", type:"qcm", q:"« Face à des dizaines de candidats, il a réussi à tirer son épingle du jeu. » Cela veut dire qu'il…", options:["a abandonné","s'est démarqué face à la concurrence","a triché pendant l'entretien"], correct:1}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Une convocation à un entretien", titre_pt:"Uma convocação para entrevista", dur:"8 min",
            texte:{titre:"Objet : Convocation à un entretien — Poste de chargé(e) de clientèle", fr:"<p>Madame Souza,</p><p>Nous avons bien reçu votre candidature pour le poste de chargé(e) de clientèle et nous vous en remercions. Votre profil a retenu notre attention. Nous avons le plaisir de vous inviter à un entretien le <b>jeudi 5 novembre à 10 h</b>, dans nos locaux, 12 rue des Lilas, à Nantes.</p><p>L'entretien durera environ 45 minutes. Il se déroulera en deux parties : d'abord, un échange avec Mme Lefèvre, responsable des ressources humaines ; ensuite, une courte mise en situation avec un client fictif.</p><p>Merci d'apporter une pièce d'identité et une copie de vos diplômes. Si ce créneau ne vous convient pas, merci de nous contacter avant le lundi 2 novembre.</p><p>Cordialement,<br>Thomas Garnier, assistant RH</p>", source:"Document créé pour ce parcours (entreprise et personnes fictives)."},
            items:[
              {id:"a2-ce-1", type:"qcm", q:"Pourquoi Mme Souza reçoit-elle cet e-mail ?", options:["Elle est embauchée.","Elle est invitée à un entretien.","Sa candidature est refusée."], correct:1},
              {id:"a2-ce-2", type:"court", q:"Combien de temps dure l'entretien ?", accept:["45 minutes","environ 45 minutes","45 min","quarante-cinq minutes","environ quarante-cinq minutes","45"]},
              {id:"a2-ce-3", type:"qcm", q:"Que se passe-t-il pendant la deuxième partie ?", options:["Un échange avec la responsable RH","Une mise en situation avec un client fictif","La signature du contrat"], correct:1},
              {id:"a2-ce-4", type:"mixte", sous_type:"reformulation", q:"Quels documents Mme Souza doit-elle apporter ?", accept:["une pièce d'identité et une copie de ses diplômes","une pièce d'identité et une copie de vos diplômes","une pièce d'identité et ses diplômes","une pièce d'identité et une copie des diplômes"], modele:"Une pièce d'identité et une copie de ses diplômes."},
              {id:"a2-ce-5", type:"qcm", q:"« Votre profil a retenu notre attention » signifie que…", options:["l'entreprise trouve son profil intéressant","l'entreprise a perdu son CV","elle doit changer son profil"], correct:0},
              {id:"a2-ce-6", type:"qcm", q:"Si elle n'est pas disponible le 5 novembre, elle doit…", options:["ne pas venir","contacter l'entreprise avant le 2 novembre","venir le lundi"], correct:1}
            ]},
          {id:"co", comp:"co", titre_fr:"Un entretien en vidéo", titre_pt:"Uma entrevista em vídeo", dur:"8 min",
            consigne_fr:"Regarde toute la vidéo (7 min). Prends des notes, fais pause si nécessaire.", consigne_pt:"Assista ao vídeo inteiro (7 min). Faça anotações, pause se necessário.",
            video: V_ELISABETH,
            items:[
              {id:"a2-co-1", type:"ouverte", q:"Liste 4 questions posées pendant l'entretien (écris-les comme tu les entends).", lignes:4},
              {id:"a2-co-2", type:"ouverte", q:"Relève 2 expressions utiles pour te présenter que tu pourrais réutiliser.", lignes:2},
              {id:"a2-co-3", type:"ouverte", avis:true, q:"Le candidat ou la candidate te semble-t-il / elle convaincant(e) ? Pourquoi ? (2 phrases)", lignes:2}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Raconter son parcours au passé composé", titre_pt:"Contar o percurso no passé composé", dur:"9 min",
            rappel:{fr:"<p><b>avoir</b> + participe passé : j'<b>ai travaillé</b>, elle <b>a convaincu</b>, ils <b>ont pris</b>.<br><b>être</b> + participe passé pour les verbes de mouvement (aller, partir, arriver, venir, devenir…) et les verbes pronominaux : elle <b>est partie</b>, je <b>me suis présenté(e)</b>. Avec être, le participe s'accorde avec le sujet.</p><p>Participes irréguliers : avoir → <b>eu</b> · être → <b>été</b> · faire → <b>fait</b> · prendre → <b>pris</b> · convaincre → <b>convaincu</b>.</p>",
                    pt:"Em português usamos o pretérito perfeito (trabalhei); em francês, o passé composé tem dois auxiliares. « Eu cheguei » = « je <b>suis</b> arrivé(e) », não « j'ai arrivé »."},
            items:[
              {id:"a2-gr-1", type:"trous", texte:"J'___ (travailler) cinq ans dans cette entreprise. Elle ___ (poser) sa candidature hier. Nous ___ (partir) en Espagne en 2022. Il ___ (convaincre) le recruteur. Ils ___ (prendre) une décision rapidement.", blancs:[["ai travaillé"],["a posé"],["sommes partis","sommes parties"],["a convaincu"],["ont pris"]], accents:"strict"},
              {id:"a2-gr-2", type:"trous", texte:"Je ___ (se présenter) devant le jury.", blancs:[["me suis présenté","me suis présentée"]], accents:"strict", explication:"Verbe pronominal → auxiliaire <b>être</b> : je <b>me suis présenté(e)</b>."},
              {id:"a2-gr-3", type:"choix_justif", q:"Hier, elle ___ arrivée en retard à l'entretien.", options:["a","est"], correct:1, explication:"<i>Arriver</i> est un verbe de mouvement → <b>être</b> : elle est arrivé<b>e</b>."},
              {id:"a2-gr-4", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur.", q:"Elle a parti à 8 heures.", accept:["Elle est partie à 8 heures.","Elle est partie à huit heures."]},
              {id:"a2-gr-5", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur.", q:"J'ai convaincé le directeur.", accept:["J'ai convaincu le directeur."]}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Transformer et organiser", titre_pt:"Transformar e organizar", dur:"8 min",
            items:[
              {id:"a2-cj-1", type:"mixte", sous_type:"reecriture", lignes:2, consigne:"Réécris au passé composé.", q:"Je pose ma candidature, je passe un entretien et je signe mon contrat.", accept:["J'ai posé ma candidature, j'ai passé un entretien et j'ai signé mon contrat."]},
              {id:"a2-cj-2", type:"ordre", consigne:"Remets la présentation dans l'ordre logique.", unites:["D'abord, j'ai fait des études de commerce.","Ensuite, j'ai travaillé deux ans dans une agence.","Enfin, je suis devenue responsable d'équipe."]},
              {id:"a2-cj-3", type:"trous", texte:"J'ai posé ma candidature ___ deux semaines. Je travaille dans cette entreprise ___ 2021.", blancs:[["il y a"],["depuis"]], explication:"<b>il y a</b> + durée = moment passé (há duas semanas) ; <b>depuis</b> = action qui continue (desde 2021)."},
              {id:"a2-cj-4", type:"mixte", sous_type:"transformation", consigne:"Mets la phrase au féminin (c'est Juliana qui parle).", q:"Je suis allé à Paris et je me suis présenté au directeur.", accept:["Je suis allée à Paris et je me suis présentée au directeur."]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Répondre à la convocation", titre_pt:"Responder à convocação", dur:"10 min",
            items:[
              {id:"a2-ee-1", type:"ouverte", q:"Réponds à l'e-mail de M. Garnier : confirme ta présence (ou propose un autre créneau), puis présente ton parcours en 5-6 phrases au passé composé avec d'abord / ensuite / enfin.", lignes:9, min_mots:60,
               modele:"Critères : formules d'ouverture et de clôture, confirmation claire, au moins 4 verbes au passé composé (avec avoir ET être), 3 connecteurs chronologiques."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Pitch de 60 secondes", titre_pt:"Pitch de 60 segundos", dur:"5 min",
            items:[
              {id:"a2-eo-1", type:"oral", q:"Choisis un poste (responsable marketing digital, décorateur/décoratrice d'intérieur, animateur/animatrice) et vends-toi en 60 secondes : ton parcours (passé composé), 2 qualités, ta motivation. Top, c'est parti !", consigne_pt:"Escolha um cargo e se venda em 60 segundos: percurso, 2 qualidades, motivação."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"La question piège", titre_pt:"A pergunta difícil", dur:"8 min",
            consigne_fr:"Le recruteur demande : « Pourquoi avez-vous quitté votre dernier emploi ? »", consigne_pt:"O recrutador pergunta: « Por que você saiu do seu último emprego? »",
            items:[
              {id:"a2-sy-1", type:"qcm", q:"Quelle réponse est la plus stratégique ?", options:["« Mon chef était horrible, je ne le supportais plus. »","« Je ne sais pas, c'est compliqué. »","« J'ai beaucoup appris, mais je cherchais de nouveaux défis. »"], correct:2, explication:"On reste positif : on parle de ce qu'on a appris et de son envie d'évoluer, jamais en critiquant son ancien employeur."},
              {id:"a2-sy-2", type:"mixte", sous_type:"reformulation", lignes:2, consigne:"Reformule cette réponse de façon positive.", q:"« Je suis parti parce que mon travail était ennuyeux. »", accept:[], modele:"J'ai beaucoup appris dans ce poste, mais je cherchais un travail plus varié et de nouveaux défis."},
              {id:"a2-sy-3", type:"ouverte", q:"Raconte une histoire d'entretien (réelle ou imaginaire : pour un travail, une école…) en 6-8 phrases au passé composé : contexte, ce qui s'est passé, comment ça s'est terminé.", lignes:8, min_mots:60}
            ]}
        ]
      },

      /* ============================================== B1 ============================================== */
      B1: {
        duree: {min:60, max:90},
        intro_fr: "L'entretien d'embauche est un exercice particulier : il faut se vendre sans paraître prétentieux, montrer sa motivation sans sembler désespéré, et répondre aux questions difficiles avec calme et précision. Cette semaine, tu analyses les erreurs à éviter, tu argumentes sur ton profil et tu affrontes les questions pièges.",
        intro_pt: "A entrevista de emprego é um exercício particular: é preciso se vender sem parecer pretensioso, mostrar motivação sem parecer desesperado e responder às perguntas difíceis com calma e precisão.",
        objectifs: [
          {fr:"Comprendre un article de conseils et son implicite.", pt:"Entender um artigo de conselhos e o que está implícito."},
          {fr:"Argumenter sur mes qualités avec des exemples concrets.", pt:"Argumentar sobre minhas qualidades com exemplos concretos."},
          {fr:"Formuler des demandes polies et des hypothèses (conditionnel).", pt:"Formular pedidos educados e hipóteses (condicional)."},
          {fr:"Raconter une expérience en alternant imparfait et passé composé.", pt:"Contar uma experiência alternando imparfait e passé composé."}
        ],
        grammaire: ["Conditionnel présent : politesse, souhait, hypothèse (si + imparfait)", "Pronoms relatifs qui, que, où, dont", "Imparfait / passé composé", "Connecteurs : car, donc, pourtant, cependant", "Subjonctif après « il faut que » (initiation)"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"3 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Le lexique du recrutement", titre_pt:"O léxico do recrutamento", dur:"7 min",
            items:[
              {id:"b1-voc-1", type:"association", consigne:"Associe chaque expression à son sens.", paires:[
                ["les prétentions salariales","le salaire que le candidat demande"],
                ["les perspectives d'évolution","les possibilités de progresser dans l'entreprise"],
                ["un package salarial","fixe, variable et avantages"],
                ["relever un défi","accepter une tâche difficile"],
                ["dénigrer","critiquer de façon injuste"],
                ["une mise en situation","un exercice qui simule le travail réel"]]},
              {id:"b1-voc-2", type:"trous", texte:"Mes ___ salariales sont négociables selon les responsabilités du poste. Je cherche un poste avec de vraies ___ d'évolution. Lors de l'entretien, elle a su ___ en valeur son expérience internationale.", blancs:[["prétentions"],["perspectives"],["mettre"]]},
              {id:"b1-voc-3", type:"mixte", sous_type:"reformulation", consigne:"Reformule avec l'expression « tirer son épingle du jeu ».", q:"Malgré la forte concurrence, elle a réussi à se démarquer.", accept:["Malgré la forte concurrence, elle a réussi à tirer son épingle du jeu.","Malgré la forte concurrence, elle a tiré son épingle du jeu."]}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Cinq erreurs à éviter", titre_pt:"Cinco erros a evitar", dur:"12 min",
            texte:{titre:"Entretien d'embauche : cinq erreurs que les recruteurs pardonnent difficilement", fr:`<p>Vous avez décroché un entretien : bravo, le plus dur semble fait. Pourtant, c'est souvent à ce moment-là que tout se joue. Voici cinq erreurs fréquentes.</p>
<p><b>1. Arriver sans rien savoir de l'entreprise.</b> Le recruteur ne vous demandera pas de réciter l'histoire de la société, mais il remarquera tout de suite si vous ignorez ce qu'elle fait. Dix minutes de recherche suffisent pour montrer votre intérêt.</p>
<p><b>2. Réciter son CV.</b> Votre interlocuteur l'a déjà lu. Ce qu'il attend, c'est le sens de votre parcours : pourquoi vous avez fait ces choix et ce que vous en avez appris.</p>
<p><b>3. Dénigrer son ancien employeur.</b> Même si votre dernier poste s'est mal terminé, critiquer votre ancien patron est un piège. Le recruteur n'entend pas seulement ce que vous dites de lui : il imagine ce que vous direz de sa propre entreprise dans deux ans.</p>
<p><b>4. Choisir un faux défaut.</b> « Je suis trop perfectionniste » : les recruteurs ont entendu cette réponse des centaines de fois. Elle donne l'impression d'une phrase apprise par cœur. Mieux vaut citer un vrai point faible, puis expliquer comment vous y travaillez.</p>
<p><b>5. Ne poser aucune question.</b> À la fin, quand on vous demande « Avez-vous des questions ? », répondre « non » peut laisser penser que le poste ne vous intéresse pas vraiment. Interrogez plutôt votre interlocuteur sur l'équipe, les priorités des premiers mois ou l'intégration des nouveaux employés.</p>
<p>En résumé, un bon entretien n'est pas un interrogatoire : c'est une conversation dans laquelle chacun cherche à savoir si la collaboration a du sens.</p>`, source:"Article rédigé pour ce parcours, dans le style de la presse emploi."},
            items:[
              {id:"b1-ce-1", type:"qcm", q:"Quelle est l'idée principale de l'article ?", options:["L'entretien est une simple formalité après le CV.","Certaines erreurs fréquentes peuvent faire échouer un candidat pourtant qualifié.","Il faut apprendre ses réponses par cœur."], correct:1},
              {id:"b1-ce-2", type:"qcm", q:"Pourquoi « je suis trop perfectionniste » est-elle une mauvaise réponse, selon l'auteur ?", options:["Parce que le perfectionnisme est un défaut grave.","Parce qu'elle est trop banale et semble apprise par cœur.","Parce que les recruteurs n'aiment pas les gens rigoureux."], correct:1},
              {id:"b1-ce-3", type:"court", q:"Trouve dans le texte un verbe qui signifie « critiquer de façon injuste ».", accept:["dénigrer","dénigrer son ancien employeur"], accents:"strict"},
              {id:"b1-ce-4", type:"qcm", q:"« Il imagine ce que vous direz de sa propre entreprise dans deux ans. » Que sous-entend l'auteur ?", options:["Que le recruteur veut savoir où vous serez dans deux ans.","Qu'un candidat qui critique son ancien patron risque de critiquer aussi son futur employeur.","Que le recruteur connaît votre ancien patron."], correct:1, explication:"C'est l'implicite : la critique révèle un comportement qui pourrait se répéter."},
              {id:"b1-ce-5", type:"choix_justif", q:"Selon l'article, il vaut mieux éviter de parler de ses défauts.", options:["Vrai","Faux"], correct:1, consigne:"Vrai ou faux ? Justifie avec une phrase du texte.", explication:"Faux : l'auteur conseille de citer <i>un vrai point faible</i> et d'expliquer comment on y travaille."},
              {id:"b1-ce-6", type:"ouverte", avis:true, q:"Laquelle de ces cinq erreurs te semble la plus grave ? Justifie en 3-4 phrases.", lignes:4, min_mots:30}
            ]},
          {id:"co", comp:"co", titre_fr:"Conseils en vidéo : avant, pendant, après", titre_pt:"Conselhos em vídeo: antes, durante, depois", dur:"10 min",
            consigne_fr:"Regarde la vidéo. Selon sa description, elle donne des conseils pour avant, pendant et après l'entretien, écrits à l'écran : fais pause pour bien lire.", consigne_pt:"Assista ao vídeo. Segundo a descrição, ele dá conselhos para antes, durante e depois da entrevista, escritos na tela: pause para ler bem.",
            video: V_INSTANT,
            items:[
              {id:"b1-co-1", type:"ouverte", q:"Note au moins 2 conseils pour chaque moment : AVANT / PENDANT / APRÈS l'entretien (reformule avec tes mots).", lignes:6},
              {id:"b1-co-2", type:"ouverte", q:"Quel conseil de la vidéo correspond à une des cinq erreurs de l'article ? Explique le lien en 2-3 phrases.", lignes:3},
              {id:"b1-co-3", type:"ouverte", avis:true, q:"Quel conseil te semble le plus utile pour toi ? Pourquoi ?", lignes:2}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Conditionnel et pronoms relatifs", titre_pt:"Condicional e pronomes relativos", dur:"12 min",
            rappel:{fr:"<p><b>Conditionnel présent</b> = radical du futur + terminaisons de l'imparfait : je voudr<b>ais</b>, vous pourr<b>iez</b>, nous aimer<b>ions</b>. Il sert à être poli (<i>Je voudrais savoir…</i>), à exprimer un souhait (<i>J'aimerais évoluer…</i>) et une hypothèse : <b>si + imparfait → conditionnel</b> (<i>Si j'étais recruté, je commencerais par…</i>).</p><p><b>Relatifs</b> : <b>qui</b> = sujet · <b>que</b> = COD · <b>où</b> = lieu/temps · <b>dont</b> = remplace « de + nom » (être fier <b>de</b>, parler <b>de</b>, avoir besoin <b>de</b>).</p>",
                    pt:"Nunca use o condicional depois de « si »: « Si j'étais » (e não « si je serais »), como em português « Se eu fosse… eu começaria »."},
            items:[
              {id:"b1-gr-1", type:"trous", texte:"Je ___ (vouloir) savoir quelles sont les perspectives d'évolution. ___ (pouvoir)-vous me donner plus d'informations ? Si j'étais recruté, je ___ (commencer) par rencontrer l'équipe. Nous ___ (aimer) avoir votre réponse avant vendredi.", blancs:[["voudrais"],["Pourriez"],["commencerais"],["aimerions"]], accents:"strict"},
              {id:"b1-gr-2", type:"mixte", sous_type:"transformation", consigne:"Rends la phrase plus polie (conditionnel).", q:"Je veux connaître le salaire.", accept:["Je voudrais connaître le salaire.","J'aimerais connaître le salaire.","Je souhaiterais connaître le salaire.","Pourriez-vous m'indiquer le salaire ?"]},
              {id:"b1-gr-3", type:"mixte", sous_type:"transformation", consigne:"Fais une hypothèse avec « si + imparfait → conditionnel ».", q:"être recruté → proposer un nouveau projet", accept:["Si j'étais recruté, je proposerais un nouveau projet.","Si j'étais recrutée, je proposerais un nouveau projet."]},
              {id:"b1-gr-4", type:"trous", texte:"C'est un poste ___ correspond à mes compétences. L'entreprise ___ je travaille est à Lyon. Le projet ___ je suis le plus fier est une application mobile. Les qualités ___ le recruteur cherche sont la rigueur et l'autonomie.", blancs:[["qui"],["où"],["dont"],["que"]], accents:"strict", explication:"être fier <b>de</b> qqch → <b>dont</b> ; chercher qqch (COD) → <b>que</b>."},
              {id:"b1-gr-5", type:"mixte", sous_type:"connecteurs", consigne:"Relie les deux phrases avec un pronom relatif.", q:"J'ai obtenu un diplôme. Je suis très fier de ce diplôme.", accept:["J'ai obtenu un diplôme dont je suis très fier.","J'ai obtenu un diplôme dont je suis très fière."]},
              {id:"b1-gr-6", type:"mixte", sous_type:"connecteurs", consigne:"Relie les deux phrases avec un pronom relatif.", q:"J'ai géré une équipe. Cette équipe comptait huit personnes.", accept:["J'ai géré une équipe qui comptait huit personnes."]}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Imparfait, passé composé et connecteurs", titre_pt:"Imparfait, passé composé e conectores", dur:"12 min",
            rappel:{fr:"<p><b>Imparfait</b> = le décor, la situation, l'état (<i>j'étais stressé, il pleuvait</i>). <b>Passé composé</b> = l'action ponctuelle qui fait avancer l'histoire (<i>le recruteur est entré</i>).</p>", pt:"É parecido com o português: imperfeito (eu estava) × pretérito perfeito (ele entrou)."},
            items:[
              {id:"b1-cj-1", type:"choix_justif", q:"Pendant que j'___ dans le couloir, le recruteur est arrivé.", options:["attendais","ai attendu"], correct:0, explication:"Action en cours (le décor) interrompue par une autre → <b>imparfait</b> : j'attendais."},
              {id:"b1-cj-2", type:"mixte", sous_type:"reecriture", lignes:4, consigne:"Réécris ce paragraphe au passé (imparfait et passé composé).", q:"Je suis stressé. Le recruteur entre dans la salle et me pose une question difficile. Je ne sais pas quoi répondre, alors je respire et je réponds calmement.",
               accept:["J'étais stressé. Le recruteur est entré dans la salle et m'a posé une question difficile. Je ne savais pas quoi répondre, alors j'ai respiré et j'ai répondu calmement.","J'étais stressée. Le recruteur est entré dans la salle et m'a posé une question difficile. Je ne savais pas quoi répondre, alors j'ai respiré et j'ai répondu calmement."]},
              {id:"b1-cj-3", type:"trous", texte:"Je n'ai pas beaucoup d'expérience, ___ je suis très motivé. J'ai géré trois projets en même temps, ___ je sais m'organiser. Je souhaite quitter mon poste ___ il n'offre plus de perspectives.", blancs:[["mais","pourtant","cependant","toutefois","néanmoins"],["donc","alors","c'est pourquoi"],["car","parce qu'","parce que","puisqu'"]]},
              {id:"b1-cj-4", type:"trous", texte:"Il faut que vous ___ (être) à l'heure. Il faut que je ___ (préparer) mes réponses. Il faut que nous ___ (faire) des recherches sur l'entreprise.", blancs:[["soyez"],["prépare"],["fassions"]], accents:"strict", explication:"Après <b>il faut que</b> → subjonctif : que vous <b>soyez</b>, que je <b>prépare</b>, que nous <b>fassions</b>."}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Répondre aux questions difficiles", titre_pt:"Responder às perguntas difíceis", dur:"15 min",
            items:[
              {id:"b1-ee-1", type:"ouverte", q:"Rédige tes réponses (120-150 mots au total) à deux questions : « Quel est votre principal défaut ? » (interdit : « je suis perfectionniste » !) et « Pourquoi devrions-nous vous choisir ? ». Utilise un exemple concret au passé, au moins un conditionnel et deux pronoms relatifs.", lignes:12, min_mots:120,
               modele:"Critères : vrai défaut + action pour progresser, exemple au passé (imparfait/PC), argumentation organisée (d'abord, de plus, enfin), conditionnel, 2 relatifs, registre poli."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Jeu de rôle : la question piège", titre_pt:"Role-play: a pergunta difícil", dur:"8 min",
            items:[
              {id:"b1-eo-1", type:"oral", q:"Enregistre-toi (environ 1 min 30) : réponds à UNE de ces questions pièges — « Pourquoi a-t-il fallu deux ans pour trouver un emploi ? » ou « Vous avez été licencié(e) ? ». Sois honnête, positif/positive et stratégique.", consigne_pt:"Grave-se (cerca de 1 min 30) respondendo a UMA dessas perguntas difíceis, com honestidade e estratégia."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"Mise en situation : recruter un(e) animateur/animatrice", titre_pt:"Situação: recrutar um(a) animador(a)", dur:"12 min",
            consigne_fr:"Tu travailles aux ressources humaines d'un centre de loisirs. Trois candidats ont passé l'entretien.", consigne_pt:"Você trabalha no RH de um centro de lazer. Três candidatos fizeram a entrevista.",
            texte:{fr:"<p><b>Candidat A</b> — 10 ans d'expérience, très organisé, mais il a parlé pendant 20 minutes sans poser une seule question.<br><b>Candidate B</b> — 2 ans d'expérience, créative et empathique ; elle a raconté comment elle avait géré un conflit entre deux enfants.<br><b>Candidat C</b> — diplôme récent, très motivé, mais il a critiqué son ancien responsable de stage.</p>"},
            items:[
              {id:"b1-sy-1", type:"qcm", q:"D'après l'article, quel candidat a commis l'erreur n° 3 ?", options:["Le candidat A","La candidate B","Le candidat C"], correct:2},
              {id:"b1-sy-2", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur dans cette phrase du candidat C.", q:"Je souhaite que vous me donnez une réponse rapidement.", accept:["Je souhaite que vous me donniez une réponse rapidement.","Je souhaiterais que vous me donniez une réponse rapidement."], explication:"Après <b>souhaiter que</b> → subjonctif : que vous me <b>donniez</b>."},
              {id:"b1-sy-3", type:"ouverte", q:"Rédige un court compte rendu (80-100 mots) à ta directrice : quel candidat recommandes-tu et pourquoi ? Utilise au moins un connecteur d'opposition (pourtant, cependant…) et une phrase au conditionnel.", lignes:8, min_mots:80}
            ]}
        ]
      },

      /* ============================================== B2 ============================================== */
      B2: {
        duree: {min:70, max:90},
        intro_fr: "« Parlez-moi de vous. » Ces questions semblent simples, mais elles révèlent bien plus qu'on ne le pense. Cette semaine, tu analyses de façon critique le rituel de l'entretien d'embauche : authenticité ou mise en scène ? Tu nuances, tu concèdes, tu argumentes dans un registre soutenu.",
        intro_pt: "« Fale-me sobre você. » Essas perguntas parecem simples, mas revelam muito mais do que se imagina. Esta semana, você analisa de forma crítica o ritual da entrevista de emprego: autenticidade ou encenação?",
        objectifs: [
          {fr:"Comprendre une tribune et en dégager la thèse, les nuances et l'implicite.", pt:"Entender um artigo de opinião: tese, nuances e implícito."},
          {fr:"Argumenter de façon nuancée : concession, opposition, hypothèse.", pt:"Argumentar com nuance: concessão, oposição, hipótese."},
          {fr:"Maîtriser le subjonctif, l'irréel du passé, la voix passive et les relatifs composés.", pt:"Dominar o subjuntivo, o irreal do passado, a voz passiva e os relativos compostos."},
          {fr:"Adapter mon registre à une situation professionnelle exigeante.", pt:"Adaptar meu registro a uma situação profissional exigente."}
        ],
        grammaire: ["Subjonctif : opinion négative, doute, concession (bien que, quoique, à condition que)", "Indicatif ou subjonctif après penser / croire", "Irréel du passé : si + plus-que-parfait → conditionnel passé", "Voix passive", "Relatifs composés : auquel, lequel, duquel, au cours duquel/de laquelle"],
        activites: [
          {id:"intro", comp:"intro", titre_fr:"Présentation du thème", titre_pt:"Apresentação do tema", dur:"3 min"},
          {id:"voc", comp:"vocabulaire", titre_fr:"Nuances lexicales", titre_pt:"Nuances lexicais", dur:"8 min",
            items:[
              {id:"b2-voc-1", type:"association", consigne:"Associe chaque terme à sa définition.", paires:[
                ["l'aisance","la facilité naturelle à s'exprimer"],
                ["un biais","une distorsion du jugement"],
                ["codifié","organisé selon des règles fixes"],
                ["la posture","l'attitude adoptée, parfois jouée"],
                ["évincer","écarter quelqu'un d'une sélection"],
                ["un savoir-être","une qualité comportementale"]]},
              {id:"b2-voc-2", type:"qcm", q:"Quel mot est le plus péjoratif pour qualifier un candidat très sûr de lui ?", options:["assuré","confiant","prétentieux"], correct:2},
              {id:"b2-voc-3", type:"mixte", sous_type:"reformulation", consigne:"Reformule avec « mettre en valeur ».", q:"Pendant l'entretien, elle a su souligner de façon positive son expérience à l'étranger.", accept:["Pendant l'entretien, elle a su mettre en valeur son expérience à l'étranger."]}
            ]},
          {id:"ce", comp:"ce", titre_fr:"Tribune : l'entretien, un théâtre ?", titre_pt:"Artigo de opinião: a entrevista, um teatro?", dur:"15 min",
            texte:{titre:"L'entretien d'embauche, un théâtre qui ne dit pas son nom ?", fr:`<p>Chaque jour, des milliers de candidats entrent dans un bureau avec un texte appris par cœur. « Parlez-moi de vous », « Quels sont vos défauts ? », « Où vous voyez-vous dans cinq ans ? » : les questions sont connues, les réponses aussi. Le rituel est si codifié qu'on peut se demander ce qu'il évalue encore.</p>
<p>Les défenseurs de l'entretien affirment qu'il permet de rencontrer une personne au-delà de son CV. L'argument n'est pas sans fondement : une conversation révèle la manière de raisonner, d'écouter, de réagir à l'imprévu. Encore faut-il que la conversation ait réellement lieu. Or, à force de conseils et de coachings, beaucoup de candidats ne répondent plus : ils récitent. Et le recruteur, lui-même pressé, finit souvent par noter la performance plutôt que la compétence.</p>
<p>Le danger est connu : l'entretien favorise ceux qui maîtrisent ses codes. L'aisance orale, l'assurance, voire l'apparence physique pèsent parfois davantage que l'expérience réelle. Une candidate brillante mais réservée peut ainsi être évincée au profit d'un candidat qui « présente bien ». Les psychologues parlent de biais ; les candidats, plus simplement, d'injustice.</p>
<p>Faut-il pour autant supprimer l'entretien ? Ce serait jeter le bébé avec l'eau du bain. Bien qu'il soit imparfait, il reste l'un des rares moments où l'entreprise et le candidat peuvent s'évaluer mutuellement. Mieux vaudrait le transformer : l'associer à des mises en situation concrètes, former les recruteurs à reconnaître leurs propres préjugés, et accepter qu'un candidat hésite, se corrige, réfléchisse à voix haute.</p>
<p>Car au fond, la meilleure réponse à « Parlez-moi de vous » n'est peut-être pas la plus fluide, mais la plus sincère.</p>`, source:"Tribune rédigée pour ce parcours (texte argumentatif original)."},
            items:[
              {id:"b2-ce-1", type:"qcm", q:"Quelle est la thèse de l'auteur ?", options:["Il faut supprimer l'entretien d'embauche, devenu inutile.","L'entretien, trop codifié et sujet aux biais, doit être transformé plutôt que supprimé.","L'entretien est le meilleur outil de recrutement qui existe."], correct:1},
              {id:"b2-ce-2", type:"choix_justif", q:"L'auteur rejette totalement l'argument des défenseurs de l'entretien.", options:["Vrai","Faux"], correct:1, consigne:"Vrai ou faux ? Justifie en citant le texte.", explication:"Faux : il concède que l'argument « n'est pas sans fondement » avant de le nuancer (« Encore faut-il que… »)."},
              {id:"b2-ce-3", type:"court", q:"Quelle expression idiomatique l'auteur utilise-t-il pour dire « rejeter une chose utile en voulant éliminer ses défauts » ?", accept:["jeter le bébé avec l'eau du bain"]},
              {id:"b2-ce-4", type:"qcm", q:"Dans « ils récitent », que reproche implicitement l'auteur aux candidats ?", options:["De parler trop lentement","De réciter des réponses préparées au lieu de dialoguer réellement","D'avoir oublié leur texte"], correct:1},
              {id:"b2-ce-5", type:"mixte", sous_type:"reformulation", consigne:"Reformule sans « bien que », avec « même si » (attention au mode du verbe).", q:"Bien qu'il soit imparfait, il reste l'un des rares moments d'évaluation mutuelle.", accept:["Même s'il est imparfait, il reste l'un des rares moments d'évaluation mutuelle."], explication:"<b>même si</b> + indicatif ; <b>bien que</b> + subjonctif."},
              {id:"b2-ce-6", type:"ouverte", q:"Expliquez la métaphore du théâtre : qui sont les acteurs, quel est le texte, qui est le public ? En quoi cette image sert-elle l'argumentation ? (4-5 phrases)", lignes:5, min_mots:50}
            ]},
          {id:"co", comp:"co", titre_fr:"Analyse critique d'une vidéo de conseils", titre_pt:"Análise crítica de um vídeo de conselhos", dur:"12 min",
            consigne_fr:"Regarde cette vidéo de conseils (niveau A2-B1, destinée aux apprenants). Ton travail n'est pas seulement de comprendre, mais de l'analyser à la lumière de la tribune.", consigne_pt:"Assista a este vídeo de conselhos. Seu trabalho não é só entender, mas analisá-lo à luz do artigo de opinião.",
            video: V_INSTANT,
            items:[
              {id:"b2-co-1", type:"ouverte", q:"Relève 3 conseils donnés dans la vidéo. Pour chacun, dis si l'auteur de la tribune le jugerait utile ou s'il contribuerait au « théâtre » qu'il dénonce. Justifie.", lignes:8, min_mots:80},
              {id:"b2-co-2", type:"ouverte", q:"Quel public la vidéo vise-t-elle, et comment son format (texte à l'écran, rythme) est-il adapté à ce public ?", lignes:3},
              {id:"b2-co-3", type:"ouverte", avis:true, q:"Selon toi, ce type de conseils aide-t-il les candidats à être plus authentiques ou plus formatés ?", lignes:3}
            ]},
          {id:"gram", comp:"grammaire", titre_fr:"Subjonctif et concession", titre_pt:"Subjuntivo e concessão", dur:"12 min",
            rappel:{fr:"<p><b>Subjonctif</b> après : la nécessité (<i>il est essentiel que</i>), le doute (<i>je doute que</i>), l'opinion <u>négative</u> ou interrogative (<i>je ne pense pas que</i>), la concession (<i>bien que, quoique</i>), la condition (<i>à condition que, pourvu que</i>).</p><p>⚠️ <i>Je pense que / je crois que</i> à la forme affirmative → <b>indicatif</b>. <i>Même si</i> → <b>indicatif</b>.</p>",
                    pt:"Em português dizemos « embora seja » (subjuntivo) — em francês também: « bien qu'il <b>soit</b> ». Mas « acho que é » = « je pense que c'<b>est</b> » (indicativo)."},
            items:[
              {id:"b2-gr-1", type:"trous", texte:"Bien que le candidat ___ (être) brillant, le jury a hésité. Il est essentiel que vous ___ (savoir) mettre en valeur vos compétences. Je doute que ce test ___ (pouvoir) révéler la personnalité. Il acceptera le poste à condition que l'entreprise lui ___ (faire) confiance.", blancs:[["soit"],["sachiez"],["puisse"],["fasse"]], accents:"strict"},
              {id:"b2-gr-2", type:"choix_justif", q:"Je pense que l'entretien ___ utile, mais insuffisant.", options:["est","soit"], correct:0, explication:"<b>Penser que</b> à la forme affirmative → indicatif : <i>est</i>."},
              {id:"b2-gr-3", type:"qcm", q:"Je ne pense pas que l'entretien ___ suffisant pour juger un candidat.", options:["est","soit","sera"], correct:1, explication:"Opinion à la forme <b>négative</b> → subjonctif : <i>soit</i>."},
              {id:"b2-gr-4", type:"mixte", sous_type:"connecteurs", consigne:"Relie les deux phrases avec « bien que ».", q:"Le candidat manquait d'expérience. Il a été retenu.", accept:["Bien que le candidat ait manqué d'expérience, il a été retenu.","Bien qu'il ait manqué d'expérience, le candidat a été retenu.","Bien que le candidat manque d'expérience, il a été retenu.","Bien que le candidat manquât d'expérience, il a été retenu."]},
              {id:"b2-gr-5", type:"qcm", q:"Quelle phrase est correcte ?", options:["Même s'il soit motivé, il manque d'expérience.","Bien qu'il est motivé, il manque d'expérience.","Bien qu'il soit motivé, il manque d'expérience."], correct:2}
            ]},
          {id:"gram2", comp:"grammaire", titre_fr:"Hypothèses, voix passive, relatifs composés", titre_pt:"Hipóteses, voz passiva, relativos compostos", dur:"12 min",
            rappel:{fr:"<p><b>Irréel du passé</b> : si + <b>plus-que-parfait</b> → <b>conditionnel passé</b> (<i>Si j'avais mieux préparé, j'aurais obtenu le poste</i>).</p><p><b>Voix passive</b> : être (au temps du verbe actif) + participe passé accordé : <i>Le jury a retenu trois candidats</i> → <i>Trois candidats <b>ont été retenus</b> par le jury</i>.</p><p><b>Relatifs composés</b> : préposition + lequel/laquelle… ; à + lequel = <b>auquel</b>, de + lequel = <b>duquel</b> (tenir <b>à</b> → auquel ; au cours <b>de</b> → au cours duquel / de laquelle).</p>"},
            items:[
              {id:"b2-g2-1", type:"trous", texte:"Si j'avais mieux préparé cet entretien, j'___ (obtenir) le poste. Si le recruteur ___ (poser) d'autres questions, j'aurais pu montrer mes compétences.", blancs:[["aurais obtenu"],["avait posé"]], accents:"strict"},
              {id:"b2-g2-2", type:"mixte", sous_type:"transformation", consigne:"Transforme en irréel du passé.", q:"Si je réponds calmement, je convaincs le jury.", accept:["Si j'avais répondu calmement, j'aurais convaincu le jury."]},
              {id:"b2-g2-3", type:"mixte", sous_type:"transformation", consigne:"Mets à la voix passive.", q:"Le jury a retenu trois candidats.", accept:["Trois candidats ont été retenus par le jury."]},
              {id:"b2-g2-4", type:"mixte", sous_type:"transformation", consigne:"Mets à la voix passive.", q:"Les recruteurs évalueront chaque candidature.", accept:["Chaque candidature sera évaluée par les recruteurs."]},
              {id:"b2-g2-5", type:"trous", texte:"C'est un projet ___ je tiens beaucoup. La réunion au cours de ___ la décision a été prise a duré deux heures.", blancs:[["auquel"],["laquelle"]], accents:"strict"}
            ]},
          {id:"conj", comp:"conjugaison", titre_fr:"Changer de registre et corriger", titre_pt:"Mudar de registro e corrigir", dur:"10 min",
            items:[
              {id:"b2-cj-1", type:"ouverte", consigne:"Réécris ce message oral dans un registre écrit professionnel et soutenu.", q:"« Bon, en fait, j'ai quitté ma boîte parce que mon chef, franchement, il me laissait pas évoluer. »", lignes:3,
               modele:"J'ai quitté mon précédent employeur car le poste ne m'offrait plus de perspectives d'évolution à la hauteur de mes ambitions."},
              {id:"b2-cj-2", type:"mixte", sous_type:"correction", consigne:"Corrige l'erreur de mode.", q:"Bien que je suis motivé, je n'ai pas été retenu.", accept:["Bien que je sois motivé, je n'ai pas été retenu.","Bien que j'aie été motivé, je n'ai pas été retenu.","Bien que je sois motivée, je n'ai pas été retenue.","Bien que j'aie été motivée, je n'ai pas été retenue."]},
              {id:"b2-cj-3", type:"mixte", sous_type:"reecriture", lignes:3, consigne:"Réécris le paragraphe à la voix passive (les sujets deviennent : « Les candidatures », « Trois profils », « La décision finale »).", q:"La DRH a examiné les candidatures. Elle a sélectionné trois profils. Le directeur prendra la décision finale.",
               accept:["Les candidatures ont été examinées par la DRH. Trois profils ont été sélectionnés. La décision finale sera prise par le directeur.","Les candidatures ont été examinées par la DRH. Trois profils ont été sélectionnés par elle. La décision finale sera prise par le directeur."]}
            ]},
          {id:"ee", comp:"ee", titre_fr:"Essai argumenté", titre_pt:"Ensaio argumentativo", dur:"20 min",
            items:[
              {id:"b2-ee-1", type:"ouverte", q:"« L'entretien d'embauche récompense davantage l'aisance que la compétence. » Discutez cette affirmation (200-250 mots) en concédant au moins un argument adverse. Contraintes : une hypothèse au passé, deux subjonctifs, une phrase à la voix passive, un relatif composé.", lignes:14, min_mots:200,
               modele:"Critères : introduction avec problématique, deux parties (thèse / concession), connecteurs logiques variés, conclusion nuancée, contraintes grammaticales respectées, registre soutenu."}
            ]},
          {id:"eo", comp:"eo", titre_fr:"Débat : faut-il remplacer l'entretien ?", titre_pt:"Debate: é preciso substituir a entrevista?", dur:"8 min",
            items:[
              {id:"b2-eo-1", type:"oral", q:"Enregistre-toi (environ 2 min) : une mise en situation pratique devrait-elle remplacer l'entretien classique ? Défends une position nuancée, avec une concession et un exemple.", consigne_pt:"Grave-se (cerca de 2 min): uma situação prática deveria substituir a entrevista clássica? Defenda uma posição com nuance."}
            ]},
          {id:"synth", comp:"synthese", titre_fr:"La question piège la plus délicate", titre_pt:"A pergunta difícil mais delicada", dur:"12 min",
            consigne_fr:"Le recruteur demande : « Vous avez demandé une augmentation et on vous l'a refusée. Pourquoi ? »", consigne_pt:"O recrutador pergunta: « Você pediu um aumento e foi recusado. Por quê? »",
            items:[
              {id:"b2-sy-1", type:"qcm", q:"Quelle réponse est la plus stratégique ?", options:["« Mon manager ne reconnaissait pas mon travail, c'est pour ça que je pars. »","« Le budget était gelé cette année-là ; j'ai alors négocié des responsabilités supplémentaires, ce qui m'a permis de progresser. »","« Je préfère ne pas en parler. »"], correct:1, explication:"La réponse B reconnaît le fait, l'explique sans accuser, et montre une capacité à rebondir."},
              {id:"b2-sy-2", type:"mixte", sous_type:"reformulation", consigne:"Exprime l'opposition avec « bien que ».", q:"Mon manager a refusé, mais je comprends sa décision.", accept:["Bien que mon manager ait refusé, je comprends sa décision."]},
              {id:"b2-sy-3", type:"ouverte", q:"Rédige ta propre réponse (100-130 mots), dans un registre soutenu, avec une concession, un relatif composé et une phrase au conditionnel passé.", lignes:9, min_mots:100},
              {id:"b2-sy-4", type:"ouverte", q:"Photos de candidats : un recruteur se fait souvent une première impression en quelques secondes, à partir de l'apparence. En t'appuyant sur la tribune, explique en 4-5 phrases pourquoi c'est un biais et comment un recruteur pourrait s'en protéger.", lignes:5, min_mots:50}
            ]}
        ]
      }
    }
  };

  if(typeof temasSemanas !== 'undefined' && !temasSemanas.some(t => t.id === theme.id)) temasSemanas.push(theme);
})();
