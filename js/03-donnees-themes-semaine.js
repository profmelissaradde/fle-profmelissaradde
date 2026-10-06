/* ======================= DONNÉES : THÈMES DE LA SEMAINE (historique cumulatif) ======================= */
/* Chaque thème a un id stable et unique. Pour ajouter un nouveau thème, ajoute un objet à la fin
   du tableau — les thèmes précédents restent accessibles aux élèves et à la professeure. */
const temasSemanas = [
  {
    id: "cuisine-2026-08-17",
    periode: "17 → 22 août 2026",
    titre_fr: "En cuisine !",
    titre_pt: "Na cozinha!",
    sub_fr: "Un thème léger à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema leve para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde la vidéo et repère les mots que tu connais déjà.",
          consigne_pt: "Assista ao vídeo e identifique as palavras que você já conhece.",
          media: {type:"video", id:"GZS7z5fhUpY", label:"Le vocabulaire de la cuisine française — Easy French"},
          exo: {type:"qcm", q:"Comment dit-on « fogão » en français ?", options:["Le four","La cuisinière","Le frigo","L'évier"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "Bonjour ! Ma recette préférée, c'est la salade de fruits. C'est très simple. Il y a une pomme, une banane et une orange. Je coupe les fruits. Je mélange tout dans un grand bol. C'est frais et c'est bon pour le petit-déjeuner !",
          texte_pt: "Olá! Minha receita preferida é a salada de frutas. É muito simples. Tem uma maçã, uma banana e uma laranja. Eu corto as frutas. Eu misturo tudo em uma tigela grande. É fresco e é bom para o café da manhã!",
          exo: {type:"qcm", q:"Quels fruits sont dans la recette ?", options:["Pomme, banane, orange","Fraise, kiwi, mangue","Ananas, poire, raisin"], correct:0}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : qu'est-ce que tu manges le matin ? Utilise « Je mange... » et « J'aime... ».",
          consigne_pt: "Escreva 3 frases: o que você come de manhã? Use « Je mange... » e « J'aime... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis à voix haute 3 aliments que tu aimes et 1 que tu n'aimes pas.",
          consigne_pt: "Grave-se: diga em voz alta 3 alimentos que você gosta e 1 que não gosta."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde la vidéo et essaie de comprendre les étapes de la recette.",
          consigne_pt: "Assista ao vídeo e tente entender as etapas da receita.",
          media: {type:"video", id:"Ny5GHSMgglE", label:"Comprendre une recette — niveau A2"},
          exo: {type:"qcm", q:"Dans une recette, que fait-on en premier, en général ?", options:["On sert le plat","On lit les ingrédients","On lave la vaisselle"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "En France, le petit-déjeuner est souvent simple : du pain, du beurre, de la confiture, et un café ou un chocolat chaud. Le dimanche, certaines familles vont chercher des croissants à la boulangerie. Le déjeuner et le dîner sont plus importants : une entrée, un plat principal, parfois du fromage et un dessert.",
          texte_pt: "Na França, o café da manhã costuma ser simples: pão, manteiga, geleia, e um café ou chocolate quente. Aos domingos, algumas famílias vão buscar croissants na padaria. O almoço e o jantar são mais importantes: uma entrada, um prato principal, às vezes queijo e uma sobremesa.",
          link: {url:"https://www.lepointdufle.net/p/cuisine_gastronomie.htm", label:"Plus d'exercices — Le Point du FLE"},
          exo: {type:"qcm", q:"Qu'est-ce que certaines familles achètent le dimanche ?", options:["Des croissants","Du fromage","Un gâteau"], correct:0}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris une recette très simple (5-6 phrases) avec l'impératif : « Coupe... », « Mélange... », « Ajoute... ».",
          consigne_pt: "Escreva uma receita bem simples (5-6 frases) com o imperativo: « Coupe... », « Mélange... », « Ajoute... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "5 min",
          consigne_fr: "Enregistre-toi : explique en 4-5 phrases comment tu prépares ton plat préféré.",
          consigne_pt: "Grave-se: explique em 4-5 frases como você prepara seu prato preferido."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "6 min",
          consigne_fr: "Écoute cette célèbre chanson de Serge Gainsbourg, écrite comme une recette de cuisine. Repère les verbes à l'impératif.",
          consigne_pt: "Ouça esta famosa canção de Serge Gainsbourg, escrita como uma receita de cozinha. Identifique os verbos no imperativo.",
          media: {type:"video", id:"PL9_A7RNxc8", label:"Serge Gainsbourg — La recette de l'amour fou (1958)"},
          exo: {type:"qcm", q:"Cette chanson compare l'amour à…", options:["Un voyage","Une recette de cuisine","Un match de football"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "En France, la cuisine n'est pas seulement une nécessité, c'est un art de vivre. Les repas en famille ou entre amis durent souvent plus d'une heure : on parle, on partage, on prend le temps. Beaucoup de Français considèrent que bien manger fait partie de la qualité de vie, et que cuisiner ensemble renforce les liens familiaux.",
          texte_pt: "Na França, a culinária não é apenas uma necessidade, é uma arte de viver. As refeições em família ou entre amigos costumam durar mais de uma hora: conversa-se, compartilha-se, toma-se tempo. Muitos franceses consideram que comer bem faz parte da qualidade de vida, e que cozinhar juntos fortalece os laços familiares.",
          link: {url:"https://www.lepointdufle.net/p/cuisine_gastronomie.htm", label:"Ressources complémentaires — Le Point du FLE"},
          exo: {type:"qcm", q:"Selon le texte, pourquoi les repas durent-ils longtemps ?", options:["Parce que la cuisine est lente","Parce qu'on prend le temps de partager","Parce que les restaurants sont loin"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Écris un court paragraphe (6-8 phrases) sur un plat qui a une valeur particulière dans ta famille ou ta culture : d'où vient-il, qui le prépare, quand le mange-t-on ?",
          consigne_pt: "Escreva um parágrafo curto (6-8 frases) sobre um prato que tem um valor especial na sua família ou cultura: de onde vem, quem prepara, quando se come?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : cuisine maison ou fast-food, qu'est-ce qui compte le plus pour toi et pourquoi ?",
          consigne_pt: "Grave-se (1 min): comida caseira ou fast-food, o que importa mais para você e por quê?"
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "7 min",
          consigne_fr: "Regarde cette vidéo qui présente des spécialités régionales françaises. Note 3 plats que tu ne connaissais pas.",
          consigne_pt: "Assista a este vídeo que apresenta especialidades regionais francesas. Anote 3 pratos que você não conhecia.",
          media: {type:"video", id:"7q4NdNg-vsg", label:"Les spécialités de la cuisine française — vocabulaire thématique"},
          exo: {type:"qcm", q:"La cuisine française présentée dans la vidéo est surtout…", options:["Uniforme dans tout le pays","Très régionale et diverse","Uniquement sucrée"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "En 2010, l'UNESCO a inscrit le « repas gastronomique des Français » sur la liste du patrimoine culturel immatériel de l'humanité — une reconnaissance rare pour une pratique culinaire. Ce n'est pas un plat précis qui est célébré, mais un ensemble de rituels : le choix attentif des produits, l'accord entre mets et vins, l'art de la table, et surtout le plaisir d'être ensemble autour d'un repas qui peut durer plusieurs heures.",
          texte_pt: "Em 2010, a UNESCO inscreveu a \"refeição gastronômica dos franceses\" na lista do patrimônio cultural imaterial da humanidade — um reconhecimento raro para uma prática culinária. Não é um prato específico que é celebrado, mas um conjunto de rituais: a escolha cuidadosa dos produtos, a harmonia entre pratos e vinhos, a arte da mesa, e sobretudo o prazer de estar junto em uma refeição que pode durar várias horas.",
          link: {url:"https://ich.unesco.org/fr/RL/le-repas-gastronomique-des-francais-00437", label:"Lire l'article complet — UNESCO"},
          exo: {type:"qcm", q:"Qu'est-ce que l'UNESCO a précisément reconnu comme patrimoine ?", options:["Un plat français en particulier","Un ensemble de rituels autour du repas","Un restaurant historique"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un court texte argumentatif (8-10 phrases) : la gastronomie mérite-t-elle vraiment d'être reconnue comme un patrimoine culturel au même titre qu'un monument ou une langue ?",
          consigne_pt: "Redija um texto argumentativo curto (8-10 frases): a gastronomia realmente merece ser reconhecida como patrimônio cultural, no mesmo nível de um monumento ou de uma língua?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "8 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance cette idée — « La cuisine d'un pays en dit plus sur sa culture que son histoire politique. »",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance esta ideia — « A cozinha de um país diz mais sobre sua cultura do que sua história política »."
        }
      }
    }
  },
  {
    id: "planifier-2026-08-31",
    periode: "31 août → 6 septembre 2026",
    titre_fr: "Planifier ou improviser ?",
    titre_pt: "Planejar ou improvisar?",
    sub_fr: "Un thème léger à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema leve para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde la vidéo sur la routine quotidienne et repère les verbes que tu connais déjà.",
          consigne_pt: "Assista ao vídeo sobre a rotina diária e identifique os verbos que você já conhece.",
          media: {type:"video", id:"qpMegO7eW54", label:"Routine quotidienne — Français avec Pierre"},
          exo: {type:"qcm", q:"Dans la vidéo, que fait la personne juste après le réveil ?", options:["Elle se lève", "Elle part au travail", "Elle dîne"], correct:0}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "Le matin, j'écris une petite liste. Il y a trois choses à faire. Le soir, je regarde ma liste. Parfois, tout est fait. Parfois, je fais autre chose, et c'est bien aussi !",
          texte_pt: "De manhã, eu escrevo uma pequena lista. Tem três coisas para fazer. À noite, eu olho minha lista. Às vezes, tudo está feito. Às vezes, eu faço outra coisa, e isso também é bom!",
          exo: {type:"qcm", q:"Qu'est-ce que la personne fait le matin ?", options:["Elle dort", "Elle écrit une liste", "Elle voyage"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : qu'est-ce que tu vas faire demain ? Utilise « Je vais... » ou le futur simple.",
          consigne_pt: "Escreva 3 frases: o que você vai fazer amanhã? Use « Je vais... » ou o futuro simples."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis à voix haute 3 choses que tu planifies pour la semaine prochaine.",
          consigne_pt: "Grave-se: diga em voz alta 3 coisas que você planeja para a semana que vem."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde la vidéo sur les projets d'avenir et repère les verbes au futur simple.",
          consigne_pt: "Assista ao vídeo sobre projetos futuros e identifique os verbos no futuro simples.",
          media: {type:"video", id:"CleyL1EFT_0", label:"Mes projets d'avenir — niveau A2"},
          exo: {type:"qcm", q:"Le futur simple sert surtout à parler…", options:["Du passé", "De projets et d'intentions", "D'habitudes anciennes"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "Ce week-end, Léa a tout planifié : le marché samedi matin, une randonnée l'après-midi, un film le soir. Son amie Chloé préfère ne rien prévoir : « On verra bien sur place ! » Résultat : elles ont fait un compromis, avec un programme léger et du temps libre entre les activités.",
          texte_pt: "Neste fim de semana, Léa planejou tudo: a feira no sábado de manhã, uma caminhada à tarde, um filme à noite. Sua amiga Chloé prefere não prever nada: \"A gente vê na hora!\" Resultado: elas fizeram um meio-termo, com uma programação leve e tempo livre entre as atividades.",
          exo: {type:"qcm", q:"Comment Léa et Chloé ont-elles organisé leur week-end ?", options:["Tout était improvisé", "Tout était planifié à la minute près", "Un compromis entre planification et liberté"], correct:2}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris un petit programme pour ton prochain week-end (5-6 phrases), en utilisant le futur simple.",
          consigne_pt: "Escreva uma pequena programação para o seu próximo fim de semana (5-6 frases), usando o futuro simples."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "5 min",
          consigne_fr: "Enregistre-toi : explique en 4-5 phrases comment tu organises (ou pas) tes semaines.",
          consigne_pt: "Grave-se: explique em 4-5 frases como você organiza (ou não) suas semanas."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "6 min",
          consigne_fr: "Écoute cette chanson d'Amir. Repère l'expression du titre et les moments où elle revient dans les paroles.",
          consigne_pt: "Ouça esta canção de Amir. Identifique a expressão do título e os momentos em que ela aparece na letra.",
          media: {type:"video", id:"XRi1lhm6qAQ", label:"Amir — On verra bien (Clip officiel)"},
          exo: {type:"qcm", q:"L'expression « On verra bien ! » exprime…", options:["Une certitude absolue", "Une attitude décontractée face à l'avenir", "Un refus catégorique"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "En France, on dit souvent que les Français sont à la fois rigoureux et imprévisibles. Dans le milieu professionnel, les réunions sont planifiées, les délais respectés. Mais dans la vie personnelle, ils adorent la spontanéité : inviter des amis le jour même, partir en week-end à la dernière minute. Cette dualité reflète une culture qui valorise à la fois l'organisation et la liberté.",
          texte_pt: "Na França, costuma-se dizer que os franceses são ao mesmo tempo rigorosos e imprevisíveis. No meio profissional, as reuniões são planejadas, os prazos respeitados. Mas na vida pessoal, eles adoram a espontaneidade: convidar amigos no mesmo dia, viajar no último momento. Essa dualidade reflete uma cultura que valoriza ao mesmo tempo a organização e a liberdade.",
          link: {url:"https://www.lepointdufle.net/p/expression_francaise.htm", label:"Plus d'expressions françaises — Le Point du FLE"},
          exo: {type:"qcm", q:"Selon le texte, où les Français sont-ils le plus spontanés ?", options:["Au travail", "Dans leur vie personnelle", "Nulle part"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Écris un court paragraphe (6-8 phrases) sur ton propre équilibre entre planification et spontanéité : où te situes-tu, et pourquoi ?",
          consigne_pt: "Escreva um parágrafo curto (6-8 frases) sobre seu próprio equilíbrio entre planejamento e espontaneidade: onde você se situa, e por quê?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : racontez votre plus grand imprévu récent et comment vous avez réagi.",
          consigne_pt: "Grave-se (1 min): conte seu maior imprevisto recente e como você reagiu."
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "7 min",
          consigne_fr: "Regarde cette vidéo sur le droit à la déconnexion en France. Note les arguments présentés.",
          consigne_pt: "Assista a este vídeo sobre o direito à desconexão na França. Anote os argumentos apresentados.",
          media: {type:"video", id:"ba1-LYP2s20", label:"Le droit à la déconnexion"},
          exo: {type:"qcm", q:"Le droit à la déconnexion permet surtout…", options:["De travailler plus le week-end", "De ne pas être sollicité professionnellement en dehors des horaires de travail", "D'obtenir un salaire plus élevé"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "Depuis le 1er janvier 2017, la France reconnaît légalement le « droit à la déconnexion » : un salarié peut refuser de répondre à des e-mails ou des appels professionnels en dehors de ses horaires de travail, sans crainte de conséquences. Cette loi répond à une réalité nouvelle : les outils numériques ont brouillé la frontière entre vie professionnelle et vie personnelle, rendant la planification du repos aussi nécessaire que celle du travail.",
          texte_pt: "Desde 1º de janeiro de 2017, a França reconhece legalmente o \"direito à desconexão\": um funcionário pode se recusar a responder e-mails ou ligações profissionais fora do seu horário de trabalho, sem medo de consequências. Essa lei responde a uma realidade nova: as ferramentas digitais embaçaram a fronteira entre vida profissional e vida pessoal, tornando o planejamento do descanso tão necessário quanto o do trabalho.",
          link: {url:"https://fr.wikipedia.org/wiki/Droit_%C3%A0_la_d%C3%A9connexion", label:"En savoir plus — Wikipédia"},
          exo: {type:"qcm", q:"Depuis quand la France reconnaît-elle légalement ce droit ?", options:["2010", "2017", "2022"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un court texte argumentatif (8-10 phrases) : une loi peut-elle vraiment nous apprendre à mieux planifier notre temps libre ?",
          consigne_pt: "Redija um texto argumentativo curto (8-10 frases): uma lei pode realmente nos ensinar a planejar melhor nosso tempo livre?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "8 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance cette idée — « Il est impossible d'être à la fois organisé et spontané. »",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance esta ideia — « É impossível ser ao mesmo tempo organizado e espontâneo »."
        }
      }
    }
  },
  {
    id: "patrimoine-2026-09-14",
    periode: "14 → 20 septembre 2026",
    titre_fr: "Que laisserons-nous aux générations futures ?",
    titre_pt: "O que deixaremos para as gerações futuras?",
    sub_fr: "Un thème pour réfléchir à ce que nous transmettrons, à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema para refletir sobre o que vamos transmitir, para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde la vidéo sur les Journées du Patrimoine et repère les mots que tu connais déjà.",
          consigne_pt: "Assista ao vídeo sobre as Journées du Patrimoine e identifique as palavras que você já conhece.",
          media: {type:"video", id:"RaodWTbaKeU", label:"Les Journées européennes du patrimoine — présentation"},
          exo: {type:"qcm", q:"Les Journées du Patrimoine, c'est en quel mois ?", options:["En septembre","En décembre","En mars"], correct:0}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "Le patrimoine, c'est ce qui vient du passé. Un monument, une chanson, une recette : tout ça, c'est le patrimoine. Ma grand-mère m'a transmis sa recette de tarte aux pommes. Je vais la transmettre à mes enfants aussi.",
          texte_pt: "O patrimônio é o que vem do passado. Um monumento, uma canção, uma receita: tudo isso é patrimônio. Minha avó me transmitiu a receita de torta de maçã dela. Vou transmiti-la aos meus filhos também.",
          exo: {type:"qcm", q:"Qu'est-ce que la grand-mère a transmis ?", options:["Une maison","Une recette","Une langue"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : qu'est-ce que ta famille t'a transmis (une recette, une tradition, un objet) ? Utilise « On m'a transmis... ».",
          consigne_pt: "Escreva 3 frases: o que sua família transmitiu para você (uma receita, uma tradição, um objeto)? Use « On m'a transmis... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis à voix haute une chose que tu voudrais transmettre à tes enfants ou à de jeunes proches.",
          consigne_pt: "Grave-se: diga em voz alta uma coisa que você gostaria de transmitir aos seus filhos ou a jovens próximos."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde cette courte vidéo sur les Journées du Patrimoine et note deux lieux qu'on peut visiter.",
          consigne_pt: "Assista a este vídeo curto sobre as Journées du Patrimoine e anote dois lugares que se pode visitar.",
          media: {type:"video", id:"p3U0oHPhyOI", label:"Les pépites des Journées du Patrimoine 2025"},
          exo: {type:"qcm", q:"Pendant les Journées du Patrimoine, les monuments sont…", options:["Payants","Fermés au public","Gratuits"], correct:2}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "Chaque génération reçoit un héritage du passé : des monuments, des œuvres d'art, mais aussi une langue, des valeurs, des traditions. Aujourd'hui, avec les crises climatiques, une question se pose : que laisserons-nous vraiment aux générations futures ?",
          texte_pt: "Cada geração recebe uma herança do passado: monumentos, obras de arte, mas também uma língua, valores, tradições. Hoje, com as crises climáticas, uma pergunta se coloca: o que deixaremos realmente para as gerações futuras?",
          exo: {type:"qcm", q:"L'héritage immatériel, c'est par exemple…", options:["Une langue ou une tradition","Un monument en pierre","Une pièce de monnaie"], correct:0}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris un petit texte (5-6 phrases) sur une tradition de ta famille que tu voudrais transmettre. Utilise le futur simple : « Je transmettrai... ».",
          consigne_pt: "Escreva um pequeno texto (5-6 frases) sobre uma tradição da sua família que você gostaria de transmitir. Use o futuro simples: « Je transmettrai... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "5 min",
          consigne_fr: "Enregistre-toi : explique en 4-5 phrases ce que représente pour toi le mot « patrimoine ».",
          consigne_pt: "Grave-se: explique em 4-5 frases o que representa para você a palavra « patrimoine »."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "6 min",
          consigne_fr: "Écoute cette chanson de Jacques Brel sur les personnes âgées et la mémoire. Repère le vocabulaire lié au temps qui passe.",
          consigne_pt: "Ouça esta canção de Jacques Brel sobre os idosos e a memória. Identifique o vocabulário ligado à passagem do tempo.",
          media: {type:"video", id:"E18IBHnY5-Y", label:"Jacques Brel — Les Vieux (Clip officiel)"},
          exo: {type:"qcm", q:"Cette chanson parle surtout…", options:["Des enfants et de leurs projets d'avenir","Des personnes âgées et de ce qui s'efface avec le temps","D'un voyage à l'étranger"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "Chaque année, en septembre, la France célèbre les Journées du Patrimoine : pendant deux jours, des milliers de monuments habituellement fermés au public ouvrent gratuitement leurs portes. Mais le patrimoine, ce n'est pas seulement des pierres anciennes : c'est aussi la gastronomie, la langue, les savoir-faire artisanaux, la musique traditionnelle. Le patrimoine immatériel est souvent plus fragile que le patrimoine matériel : quand les derniers porteurs d'un savoir disparaissent sans l'avoir transmis, ce savoir meurt avec eux.",
          texte_pt: "Todo ano, em setembro, a França celebra as Journées du Patrimoine: durante dois dias, milhares de monumentos normalmente fechados ao público abrem suas portas gratuitamente. Mas o patrimônio não é apenas pedras antigas: é também a gastronomia, a língua, os saberes artesanais, a música tradicional. O patrimônio imaterial é muitas vezes mais frágil que o patrimônio material: quando os últimos portadores de um saber desaparecem sem tê-lo transmitido, esse saber morre com eles.",
          link: {url:"https://fr.wikipedia.org/wiki/Journ%C3%A9es_europ%C3%A9ennes_du_patrimoine", label:"En savoir plus — Wikipédia"},
          exo: {type:"qcm", q:"Pourquoi le patrimoine immatériel est-il plus fragile ?", options:["Parce qu'il coûte plus cher à entretenir","Parce qu'il peut disparaître si personne ne le transmet","Parce qu'il n'intéresse personne"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Écris un court paragraphe (6-8 phrases) sur un savoir-faire, une histoire ou une valeur transmis dans ta famille : qui te l'a transmis, et le transmettras-tu à ton tour ?",
          consigne_pt: "Escreva um parágrafo curto (6-8 frases) sobre um saber-fazer, uma história ou um valor transmitido na sua família: quem transmitiu para você, e você transmitirá também?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : que pensez-vous du mouvement des jeunes pour le climat, qui réclame des comptes à la génération précédente sur l'héritage qu'elle leur laisse ?",
          consigne_pt: "Grave-se (1 min): o que você acha do movimento dos jovens pelo clima, que cobra satisfações da geração anterior sobre a herança que ela está deixando?"
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "7 min",
          consigne_fr: "Regarde cette vidéo sur les éléments français inscrits au patrimoine immatériel de l'UNESCO. Note trois éléments qui te surprennent.",
          consigne_pt: "Assista a este vídeo sobre os elementos franceses inscritos no patrimônio imaterial da UNESCO. Anote três elementos que te surpreendem.",
          media: {type:"video", id:"RJgnl0TxzyM", label:"La France à l'UNESCO — les 22 chefs-d'œuvre de notre patrimoine immatériel"},
          exo: {type:"qcm", q:"Le patrimoine immatériel de l'UNESCO reconnaît…", options:["Seulement des monuments classés","Des pratiques, savoir-faire et traditions vivantes","Uniquement des langues officielles"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "En 2023, l'art du vitrail a été inscrit par l'UNESCO au patrimoine culturel immatériel de l'humanité, aux côtés des vignobles en terrasses de Bourgogne, reconnus en 2015 comme paysage culturel vivant. Ces deux exemples montrent que le patrimoine n'est pas figé : c'est un savoir-faire transmis de génération en génération, qui continue d'évoluer. La question n'est donc pas seulement de préserver le passé, mais de savoir ce que nous choisissons de transmettre — et à qui.",
          texte_pt: "Em 2023, a arte do vitral foi inscrita pela UNESCO no patrimônio cultural imaterial da humanidade, ao lado dos vinhedos em terraços da Borgonha, reconhecidos em 2015 como paisagem cultural viva. Esses dois exemplos mostram que o patrimônio não é estático: é um saber-fazer transmitido de geração em geração, que continua evoluindo. A questão não é apenas preservar o passado, mas saber o que escolhemos transmitir — e para quem.",
          link: {url:"https://ich.unesco.org/fr/etat/france", label:"Le patrimoine immatériel français — UNESCO"},
          exo: {type:"qcm", q:"Selon le texte, le patrimoine est…", options:["Un objet figé du passé","Un savoir-faire vivant, transmis et qui évolue","Une liste fermée établie une fois pour toutes"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (8-10 phrases) : peut-on vraiment parler d'un « devoir de transmission » envers les générations futures, ou chaque génération est-elle libre de vivre sans se soucier de ce qu'elle laissera ?",
          consigne_pt: "Redija um texto argumentativo (8-10 frases): podemos realmente falar de um « dever de transmissão » em relação às gerações futuras, ou cada geração é livre para viver sem se preocupar com o que vai deixar?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "8 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance cette citation attribuée à Saint-Exupéry — « Nous n'héritons pas de la terre de nos parents, nous l'empruntons à nos enfants. »",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance esta citação atribuída a Saint-Exupéry — « Não herdamos a terra de nossos pais, nós a tomamos emprestada de nossos filhos »."
        }
      }
    }
  },
  {
    id: "chiens-chats-2026-09-21",
    date_debut: "2026-09-21",
    periode: "21 → 27 septembre 2026",
    titre_fr: "Chiens, chats ou rien ?",
    titre_pt: "Cães, gatos ou nada?",
    sub_fr: "Un thème léger à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema leve para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde cette vidéo sur les Français et leurs animaux de compagnie et repère les mots que tu connais déjà.",
          consigne_pt: "Assista a este vídeo sobre os franceses e seus animais de estimação e identifique as palavras que você já conhece.",
          media: {type:"video", id:"xZQ4xxQG1Sk", label:"Les Français aiment-ils les animaux de compagnie ? — 5 minutes de français"},
          exo: {type:"qcm", q:"Beaucoup de Français ont…", options:["Un animal de compagnie","Une voiture de sport","Un bateau"], correct:0}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "J'ai un chien et un chat à la maison. Le matin, je promène mon chien dans le parc. Le soir, mon chat s'installe sur mes genoux. Je ne peux plus imaginer ma vie sans eux.",
          texte_pt: "Tenho um cachorro e um gato em casa. De manhã, levo meu cachorro para passear no parque. À noite, meu gato se instala no meu colo. Não consigo mais imaginar minha vida sem eles.",
          exo: {type:"qcm", q:"Où est le chat le soir ?", options:["Dans le parc","Sur les genoux","Chez le vétérinaire"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases sur un animal (le tien ou celui de quelqu'un que tu connais). Utilise « Il/Elle s'appelle... » et « Il/Elle aime... ».",
          consigne_pt: "Escreva 3 frases sobre um animal (o seu ou o de alguém que você conhece). Use « Il/Elle s'appelle... » e « Il/Elle aime... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis à voix haute si tu préfères les chiens ou les chats, et pourquoi (1 raison).",
          consigne_pt: "Grave-se: diga em voz alta se você prefere cães ou gatos, e por quê (1 razão)."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde ce reportage sur les animaux de compagnie en France et note deux informations qui te surprennent.",
          consigne_pt: "Assista a esta reportagem sobre os animais de estimação na França e anote duas informações que te surpreendem.",
          media: {type:"video", id:"e-fJs43BkYI", label:"Chiens, chats, nouveaux animaux de compagnie… la vie des bêtes à Bordeaux"},
          exo: {type:"qcm", q:"En France, on compte…", options:["Plus de 30 millions d'animaux de compagnie","Environ 3 millions d'animaux de compagnie","Moins d'un million d'animaux de compagnie"], correct:0}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "En France, on compte plus de 30 millions d'animaux domestiques dans les foyers : chats, chiens, lapins, poissons, oiseaux. Les Français accordent une grande importance à leurs compagnons : soins vétérinaires, jouets, alimentation adaptée. Le débat entre amateurs de chats et de chiens est un grand classique : les uns soulignent l'indépendance du chat, les autres la loyauté du chien.",
          texte_pt: "Na França, há mais de 30 milhões de animais domésticos nos lares: gatos, cães, coelhos, peixes, pássaros. Os franceses dão grande importância aos seus companheiros: cuidados veterinários, brinquedos, alimentação adequada. O debate entre amantes de gatos e de cães é um grande clássico: uns destacam a independência do gato, outros a lealdade do cão.",
          exo: {type:"qcm", q:"Selon le texte, les amateurs de chiens soulignent surtout…", options:["Leur indépendance","Leur loyauté","Leur silence"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris un petit texte (5-6 phrases) : es-tu plutôt « personne à chats » ou « personne à chiens » ? Utilise « Je suis plutôt... parce que... ».",
          consigne_pt: "Escreva um pequeno texto (5-6 frases): você é mais « pessoa de gatos » ou « pessoa de cães »? Use « Je suis plutôt... parce que... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "5 min",
          consigne_fr: "Enregistre-toi : explique en 4-5 phrases les qualités que tu apprécies le plus chez un animal de compagnie.",
          consigne_pt: "Grave-se: explique em 4-5 frases as qualidades que você mais aprecia em um animal de estimação."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "6 min",
          consigne_fr: "Écoute cette chanson de Georges Brassens, qui raconte l'histoire d'une bergère et d'un petit chat qu'elle adopte. Repère le vocabulaire de l'adoption et de la tendresse.",
          consigne_pt: "Ouça esta canção de Georges Brassens, que conta a história de uma pastora e de um gatinho que ela adota. Identifique o vocabulário da adoção e da ternura.",
          media: {type:"video", id:"zuxMhzKeozo", label:"Georges Brassens — Brave Margot"},
          exo: {type:"qcm", q:"Dans cette chanson, Margot…", options:["Perd son chat dans la forêt","Adopte un petit chat qui a perdu sa mère","Vend son chat au marché"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "Avoir un animal de compagnie, c'est aussi une responsabilité : il faut le nourrir, le promener, s'en occuper chaque jour. En France, beaucoup considèrent leur chien ou leur chat comme un membre de la famille à part entière. Mais perdre un animal peut être un vrai deuil, difficile à comprendre pour ceux qui n'en ont jamais eu.",
          texte_pt: "Ter um animal de estimação também é uma responsabilidade: é preciso alimentá-lo, passeá-lo, cuidar dele todos os dias. Na França, muitos consideram seu cão ou gato um membro da família por completo. Mas perder um animal pode ser um luto de verdade, difícil de entender para quem nunca teve um.",
          link: {url:"https://fr.wikipedia.org/wiki/Animal_de_compagnie", label:"En savoir plus — Wikipédia"},
          exo: {type:"qcm", q:"Selon le texte, perdre un animal…", options:["N'a aucune importance","Peut être un vrai deuil","Est toujours facile à vivre"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Écris un court paragraphe (6-8 phrases) sur la relation entre les humains et les animaux de compagnie : penses-tu qu'on puisse avoir un lien vraiment profond avec un animal ?",
          consigne_pt: "Escreva um parágrafo curto (6-8 frases) sobre a relação entre os humanos e os animais de estimação: você acha que é possível ter um vínculo realmente profundo com um animal?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : pensez-vous qu'il est raisonnable de dépenser beaucoup d'argent pour un animal (vétérinaire, accessoires, nourriture spéciale) ?",
          consigne_pt: "Grave-se (1 min): você acha razoável gastar muito dinheiro com um animal (veterinário, acessórios, comida especial)?"
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "7 min",
          consigne_fr: "Regarde ce reportage sur le business des animaux de compagnie en France. Note les secteurs économiques mentionnés.",
          consigne_pt: "Assista a esta reportagem sobre o business dos animais de estimação na França. Anote os setores econômicos mencionados.",
          media: {type:"video", id:"_bhqyz6-NfE", label:"Animaux de compagnie, à qui profite le business ?"},
          exo: {type:"qcm", q:"Le reportage montre que les animaux de compagnie…", options:["Ne génèrent aucune activité économique","Sont devenus un vrai marché économique (nourriture, soins, accessoires)","Sont interdits dans la plupart des foyers français"], correct:1}
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "« Plus je connais les hommes, plus j'aime mon chien », dit une expression populaire française, attribuée selon les sources à Frédéric II de Prusse ou à Blaise Pascal. Au-delà de la boutade, la question des droits des animaux soulève aujourd'hui de vrais débats juridiques et éthiques en France : maltraitance, exploitation commerciale, statut légal de l'animal — longtemps considéré comme un simple bien meuble avant d'être reconnu, depuis une loi de 2015, comme un être vivant doué de sensibilité.",
          texte_pt: "« Quanto mais conheço os homens, mais amo o meu cão », diz uma expressão popular francesa, atribuída conforme as fontes a Frederico II da Prússia ou a Blaise Pascal. Além da piada, a questão dos direitos dos animais levanta hoje verdadeiros debates jurídicos e éticos na França: maus-tratos, exploração comercial, estatuto legal do animal — durante muito tempo considerado um simples bem móvel antes de ser reconhecido, desde uma lei de 2015, como um ser vivo dotado de sensibilidade.",
          link: {url:"https://fr.wikipedia.org/wiki/Droits_des_animaux", label:"Le débat sur les droits des animaux — Wikipédia"},
          exo: {type:"qcm", q:"Depuis 2015, en droit français, l'animal est reconnu comme…", options:["Un simple bien meuble","Un être vivant doué de sensibilité","Une personne juridique à part entière"], correct:1}
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (8-10 phrases) : jusqu'où doit aller, selon vous, la protection légale des animaux de compagnie ?",
          consigne_pt: "Redija um texto argumentativo (8-10 frases): até onde deve ir, na sua opinião, a proteção legal dos animais de estimação?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "8 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance cette citation — « Plus je connais les hommes, plus j'aime mon chien. »",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance esta citação — « Quanto mais conheço os homens, mais amo o meu cão »."
        }
      }
    }
  },
  {
    id: "temps-argent-2026-09-28",
    periode: "28 septembre → 4 octobre 2026",
    titre_fr: "Le temps ou l'argent ?",
    titre_pt: "O tempo ou o dinheiro?",
    sub_fr: "Un thème pour débattre de tes priorités de vie, à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema para debater suas prioridades de vida, para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde cette vidéo sur le travail en France et repère les mots que tu comprends déjà.",
          consigne_pt: "Assista a este vídeo sobre o trabalho na França e identifique as palavras que você já conhece.",
          media: {type:"video", id:"Oh2YMQTnrzk", label:"Le travail en France — 5 minutes de français"},
          exos: [
            {type:"qcm", q:"En France, la semaine de travail classique est de combien d'heures ?", options:["35 heures","50 heures","60 heures"], correct:0},
            {type:"qcm", q:"Le droit à la déconnexion, ça veut dire…", options:["Ne plus répondre aux e-mails du travail le soir ou le week-end","Ne plus avoir internet","Changer de travail"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "Léo travaille 35 heures par semaine. Le week-end, il ne regarde jamais ses e-mails de travail. Pour lui, le temps libre est plus important que l'argent.",
          texte_pt: "Léo trabalha 35 horas por semana. No fim de semana, ele nunca olha seus e-mails de trabalho. Para ele, o tempo livre é mais importante que o dinheiro.",
          exos: [
            {type:"qcm", q:"Combien d'heures par semaine travaille Léo ?", options:["35 heures","50 heures","60 heures"], correct:0},
            {type:"qcm", q:"Pour Léo, qu'est-ce qui est le plus important ?", options:["Le temps libre","L'argent","Le travail"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : préfères-tu avoir plus de temps libre ou plus d'argent ? Utilise « Je préfère... parce que... ».",
          consigne_pt: "Escreva 3 frases: você prefere ter mais tempo livre ou mais dinheiro? Use « Je préfère... parce que... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "2 min",
          consigne_fr: "Enregistre-toi : dis à voix haute si tu préfères le temps libre ou l'argent, et donne une raison.",
          consigne_pt: "Grave-se: diga em voz alta se você prefere tempo livre ou dinheiro, e dê uma razão."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "6 min",
          consigne_fr: "Regarde cette vidéo sur le travail en France et note deux mots ou expressions liés à l'équilibre vie professionnelle / vie personnelle.",
          consigne_pt: "Assista a este vídeo sobre o trabalho na França e anote duas palavras ou expressões ligadas ao equilíbrio vida profissional / vida pessoal.",
          media: {type:"video", id:"Oh2YMQTnrzk", label:"Le travail en France — 5 minutes de français"},
          exos: [
            {type:"qcm", q:"Que signifie « les RTT » ?", options:["Des jours de repos en plus, en compensation du temps travaillé","Un impôt sur le salaire","Un type de contrat de travail"], correct:0},
            {type:"qcm", q:"D'après la vidéo, la pause déjeuner en France est considérée comme…", options:["Un moment important, presque sacré","Une perte de temps","Facultative"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "Je travaille beaucoup, mais j'essaie toujours de garder du temps pour moi. Le week-end, je déconnecte complètement : pas d'e-mails, pas de réunions. J'ai appris que l'argent peut attendre, mais certains moments ne reviennent pas. Le temps libre est un luxe que je choisis de protéger.",
          texte_pt: "Trabalho muito, mas sempre tento guardar tempo para mim. No fim de semana, desligo completamente: sem e-mails, sem reuniões. Aprendi que o dinheiro pode esperar, mas certos momentos não voltam. O tempo livre é um luxo que escolho proteger.",
          exos: [
            {type:"qcm", q:"Que fait cette personne le week-end ?", options:["Elle répond à ses e-mails de travail","Elle déconnecte complètement du travail","Elle travaille encore plus"], correct:1},
            {type:"qcm", q:"Selon le texte, qu'est-ce qui « peut attendre » ?", options:["Le temps libre","L'argent","Les amis"], correct:1}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris un petit texte (5-6 phrases) : comment organises-tu ton temps entre le travail (ou les études) et ta vie personnelle ?",
          consigne_pt: "Escreva um pequeno texto (5-6 frases): como você organiza seu tempo entre o trabalho (ou os estudos) e sua vida pessoal?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : explique en 4-5 phrases ce que tu ferais si tu avais plus de temps libre. Essaie d'utiliser « je voyagerais », « je ferais », « j'aurais » si tu peux.",
          consigne_pt: "Grave-se: explique em 4-5 frases o que você faria se tivesse mais tempo livre. Tente usar «je voyagerais», «je ferais», «j'aurais» se conseguir."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "8 min",
          consigne_fr: "Regarde cet extrait du documentaire ARTE sur le temps et l'argent, et repère au moins un exemple concret donné dans le reportage.",
          consigne_pt: "Assista a este trecho do documentário da ARTE sobre o tempo e o dinheiro, e identifique pelo menos um exemplo concreto dado na reportagem.",
          media: {type:"video", id:"U6jnmLUW9Jw", label:"Le temps, c'est de l'argent — ARTE, « C'est juste une question de temps » (2/4)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Ce documentaire est diffusé par quelle chaîne ?", options:["ARTE","TF1","France 2"], correct:0},
            {niveau:"moyen", type:"qcm", q:"D'après le reportage, le temps est devenu…", options:["Une marchandise, quelque chose qu'on achète et qu'on vend","Une chose gratuite pour tout le monde","Un droit garanti par la loi dans tous les pays"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Au-delà des exemples, quel est le sujet central du documentaire ?", options:["Le lien entre l'histoire du temps, le capitalisme et la mondialisation","La météo en France","Les vacances scolaires en Europe"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "À 35 ans, Camille avait tout ce qu'on considère comme une réussite : un bon salaire, un appartement à Paris, une carrière prometteuse. Mais elle travaillait soixante heures par semaine et ne voyait presque plus ses amis. Un jour, elle a refusé une promotion bien payée pour accepter un poste moins rémunéré mais avec des horaires plus humains. Aujourd'hui, elle dit qu'elle gagne moins, mais qu'elle vit mieux. Son histoire soulève une question que beaucoup évitent de se poser : si vous deviez choisir entre plus d'argent et plus de temps libre, que choisiriez-vous vraiment ?",
          texte_pt: "Aos 35 anos, Camille tinha tudo o que se considera sucesso: um bom salário, um apartamento em Paris, uma carreira promissora. Mas trabalhava sessenta horas por semana e quase não via mais os amigos. Um dia, recusou uma promoção bem paga para aceitar um cargo menos remunerado, mas com horários mais humanos. Hoje, ela diz que ganha menos, mas vive melhor. Sua história levanta uma questão que muitos evitam se fazer: se você tivesse que escolher entre mais dinheiro e mais tempo livre, o que escolheria de verdade?",
          link: {url:"https://fr.wikipedia.org/wiki/%C3%89quilibre_vie_professionnelle-vie_priv%C3%A9e", label:"Équilibre vie professionnelle-vie privée — Wikipédia"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Avant son changement, combien d'heures par semaine travaillait Camille ?", options:["35 heures","60 heures","80 heures"], correct:1},
            {niveau:"moyen", type:"qcm", q:"Qu'a-t-elle refusé ?", options:["Une promotion bien payée","Un licenciement","Des vacances supplémentaires"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quelle est la vraie question que soulève cette histoire, d'après le texte ?", options:["Si on devait choisir entre plus d'argent et plus de temps libre, que choisirait-on vraiment ?","Comment gagner plus d'argent rapidement ?","Pourquoi Camille a-t-elle déménagé à Paris ?"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un paragraphe (6-8 phrases) en utilisant le conditionnel présent : que ferais-tu si tu n'avais pas besoin de travailler ? Utilise au moins 3 verbes au conditionnel (par exemple : je voyagerais, je pourrais, j'aurais...).",
          consigne_pt: "Redija um parágrafo (6-8 frases) usando o condicional presente: o que você faria se não precisasse trabalhar? Use pelo menos 3 verbos no condicional (por exemplo: je voyagerais, je pourrais, j'aurais...)."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : es-tu d'accord avec l'idée « Le temps, c'est de l'argent » ? Utilise des connecteurs comme « d'un côté... de l'autre... » ou « certes, mais... » pour structurer ton avis.",
          consigne_pt: "Grave-se (1 min): você concorda com a ideia «Le temps, c'est de l'argent»? Use conectores como «d'un côté... de l'autre...» ou «certes, mais...» para estruturar sua opinião."
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "9 min",
          consigne_fr: "Regarde cet extrait du documentaire ARTE. Note trois exemples concrets donnés dans le reportage, dans trois pays différents.",
          consigne_pt: "Assista a este trecho do documentário da ARTE. Anote três exemplos concretos dados na reportagem, em três países diferentes.",
          media: {type:"video", id:"U6jnmLUW9Jw", label:"Le temps, c'est de l'argent — ARTE, « C'est juste une question de temps » (2/4)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Quel exemple illustre une pression extrême à « travailler plus », aux États-Unis ?", options:["Des ouvriers de l'industrie du poulet à qui l'on refuse le droit d'aller aux toilettes","Les congés payés","Les 35 heures"], correct:0},
            {niveau:"moyen", type:"qcm", q:"Qu'est-ce que la loi Mathys, mentionnée dans le reportage ?", options:["Elle permet aux parents d'enfants gravement malades de recevoir des dons de jours de repos","Elle interdit le travail le dimanche","Elle réduit le temps de travail légal à 32h"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quel phénomène japonais est cité comme conséquence extrême de la pression au travail ?", options:["Le karoshi (la mort par surmenage)","Le RTT","La retraite anticipée"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "« Le temps est ce que nous voulons le plus, mais ce que nous utilisons le pire », écrivait le philosophe William Penn au XVIIe siècle. Cette réflexion reste étonnamment actuelle : aujourd'hui encore, beaucoup rêvent de plus de temps libre tout en continuant de sacrifier leurs soirées et leurs week-ends pour gagner davantage. Le paradoxe est que l'argent, une fois un certain seuil de confort atteint, n'augmente plus vraiment le bonheur — alors que le temps de qualité passé avec ses proches, lui, continue d'y contribuer.",
          texte_pt: "« O tempo é o que mais queremos, mas o que pior utilizamos », escrevia o filósofo William Penn no século XVII. Essa reflexão permanece surpreendentemente atual: ainda hoje, muitos sonham com mais tempo livre enquanto continuam sacrificando suas noites e fins de semana para ganhar mais. O paradoxo é que o dinheiro, uma vez atingido certo patamar de conforto, não aumenta mais realmente a felicidade — enquanto o tempo de qualidade passado com entes queridos continua contribuindo para ela.",
          link: {url:"https://fr.wikipedia.org/wiki/William_Penn", label:"William Penn — Wikipédia"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Qui est l'auteur de la citation présentée dans le texte ?", options:["William Penn","Voltaire","Victor Hugo"], correct:0},
            {niveau:"moyen", type:"qcm", q:"Selon le texte, que se passe-t-il une fois un certain seuil de confort financier atteint ?", options:["L'argent supplémentaire n'augmente plus vraiment le bonheur","Le bonheur augmente proportionnellement à l'argent gagné","Le temps libre devient inutile"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quel est le paradoxe décrit dans le texte ?", options:["Vouloir plus de temps libre tout en sacrifiant son temps pour gagner plus d'argent","Vouloir travailler moins tout en étant payé davantage","Vouloir de l'argent sans jamais travailler"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "8 min",
          consigne_fr: "Rédige un texte argumentatif (8-10 phrases), en utilisant le conditionnel présent quand c'est pertinent : selon vous, le bonheur est-il plus lié au temps ou à l'argent ? Justifiez votre position avec au moins un exemple concret.",
          consigne_pt: "Redija um texto argumentativo (8-10 frases), usando o condicional presente quando pertinente: na sua opinião, a felicidade está mais ligada ao tempo ou ao dinheiro? Justifique sua posição com pelo menos um exemplo concreto."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "9 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance la citation de William Penn — « Le temps est ce que nous voulons le plus, mais ce que nous utilisons le pire. » Essaie d'utiliser au moins deux registres différents pour parler d'argent (par exemple « le salaire », registre courant, et « le fric », registre familier), pour montrer que tu maîtrises les nuances de registre.",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance a citação de William Penn — « O tempo é o que mais queremos, mas o que pior utilizamos. » Tente usar pelo menos dois registros diferentes para falar de dinheiro (por exemplo «le salaire», registro corrente, e «le fric», registro informal), para mostrar que você domina as nuances de registro."
        }
      },
      C1: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse", titre_pt: "Compreensão oral — análise", dur: "9 min",
          consigne_fr: "Regarde à nouveau l'extrait du documentaire ARTE, mais cette fois analyse le point de vue implicite du reportage, au-delà des faits présentés.",
          consigne_pt: "Assista novamente ao trecho do documentário da ARTE, mas desta vez analise o ponto de vista implícito da reportagem, além dos fatos apresentados.",
          media: {type:"video", id:"U6jnmLUW9Jw", label:"Le temps, c'est de l'argent — ARTE, « C'est juste une question de temps » (2/4)"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Le reportage établit un lien explicite entre l'histoire du temps et…", options:["Le capitalisme et la mondialisation","La météorologie","Les traditions culinaires régionales"], correct:0},
            {niveau:"difficile", type:"qcm", q:"À travers ses exemples (ouvriers de l'industrie du poulet, karoshi), quel présupposé le documentaire semble-t-il défendre ?", options:["Une critique de la marchandisation du temps par le système économique","Un éloge du progrès industriel sans réserve","Une simple comparaison touristique entre pays"], correct:0},
            {niveau:"très difficile", type:"qcm", q:"Pourquoi le documentaire mentionne-t-il à la fois la loi Mathys (France) et l'association de consommateurs allemande contre les réseaux sociaux ?", options:["Pour montrer que des résistances au « vol de temps » existent, sous des formes différentes selon les pays","Pour comparer uniquement les salaires moyens des deux pays","Pour démontrer la supériorité du modèle social allemand"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "En France, le débat sur la réduction du temps de travail ne date pas d'hier : la mise en place des 35 heures, à la fin des années 1990, aurait permis la création d'environ 350 000 emplois selon certaines estimations. Aujourd'hui, c'est la semaine de quatre jours qui alimente la réflexion : plusieurs expérimentations, en France comme à l'étranger, suggèrent que la productivité ne baisse pas nécessairement avec un jour de travail en moins — elle augmenterait même parfois. Reste une question de fond, plus philosophique qu'économique : au-delà des chiffres, que gagne-t-on vraiment à travailler moins ?",
          texte_pt: "Na França, o debate sobre a redução do tempo de trabalho não é recente: a implementação das 35 horas, no final dos anos 1990, teria permitido a criação de cerca de 350 mil empregos segundo algumas estimativas. Hoje, é a semana de quatro dias que alimenta a reflexão: várias experiências, na França e no exterior, sugerem que a produtividade não cai necessariamente com um dia de trabalho a menos — às vezes até aumentaria. Resta uma questão de fundo, mais filosófica do que econômica: além dos números, o que realmente se ganha ao trabalhar menos?",
          link: {url:"https://fr.wikipedia.org/wiki/Semaine_de_quatre_jours", label:"La semaine de quatre jours — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Selon le texte, la mise en place des 35 heures aurait eu quel effet ?", options:["La création d'environ 350 000 emplois","La suppression de 350 000 emplois","Aucun effet mesurable"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Que suggèrent les expérimentations sur la semaine de 4 jours mentionnées dans le texte ?", options:["La productivité ne baisse pas forcément, et peut même augmenter","La productivité baisse toujours de manière significative","Les salariés préfèrent travailler davantage de jours"], correct:0},
            {niveau:"très difficile", type:"qcm", q:"Quelle est la « question de fond » soulevée à la fin du texte ?", options:["Ce qu'on gagne réellement, au-delà des chiffres, à travailler moins","Comment calculer précisément un taux de productivité","Combien coûterait la semaine de 4 jours à l'État"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "6 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), en utilisant le subjonctif quand c'est pertinent (par exemple : « il est possible que... », « bien que... ») : la réduction du temps de travail est-elle avant tout une bonne politique économique, ou surtout une question de qualité de vie ? Nuance ta position.",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), usando o subjuntivo quando pertinente (por exemplo: «il est possible que...», «bien que...»): a redução do tempo de trabalho é sobretudo uma boa política econômica, ou principalmente uma questão de qualidade de vida? Nuance sua posição."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : présente les arguments pour et contre la semaine de 4 jours en France, puis donne ta position personnelle. Utilise au moins une structure au subjonctif.",
          consigne_pt: "Grave-se (cerca de 2 min): apresente os argumentos a favor e contra a semana de 4 dias na França, depois dê sua posição pessoal. Use pelo menos uma estrutura no subjuntivo."
        }
      },
      C2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse fine", titre_pt: "Compreensão oral — análise fina", dur: "9 min",
          consigne_fr: "Regarde à nouveau l'extrait du documentaire ARTE en portant attention à la construction rhétorique du reportage (comparaisons implicites, choix des mots).",
          consigne_pt: "Assista novamente ao trecho do documentário da ARTE prestando atenção à construção retórica da reportagem (comparações implícitas, escolha das palavras).",
          media: {type:"video", id:"U6jnmLUW9Jw", label:"Le temps, c'est de l'argent — ARTE, « C'est juste une question de temps » (2/4)"},
          exos: [
            {niveau:"difficile", type:"qcm", q:"En comparant implicitement la France, les États-Unis et le Japon, quel effet rhétorique le documentaire cherche-t-il à produire ?", options:["Montrer que le rapport au temps de travail varie culturellement, mais que la pression économique est mondiale","Prouver que la France est le seul pays à bien traiter ses travailleurs","Démontrer la supériorité générale du modèle américain"], correct:0},
            {niveau:"très difficile", type:"qcm", q:"L'expression « voleurs de temps », employée à propos des réseaux sociaux, relève de quel procédé stylistique ?", options:["Une métaphore qui assimile la captation de l'attention à un vol","Une comparaison scientifique chiffrée","Une citation directe attribuée à William Penn"], correct:0},
            {niveau:"expert", type:"qcm", q:"Quelle tension le documentaire met-il en lumière entre progrès technique et rapport au temps ?", options:["Le progrès censé faire gagner du temps peut aussi en faire perdre (réseaux sociaux, cadences industrielles)","Le progrès technique n'a aucun lien avec le temps de travail","Le temps de travail a disparu grâce à la technologie"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "Si William Penn avait pu observer notre époque, qu'aurait-il pensé des réseaux sociaux, des notifications incessantes, du droit à la déconnexion inscrit dans la loi française depuis 2017 ? Sans doute aurait-il vu, dans cette légifération même, la confirmation de son propos : si le temps s'était naturellement bien employé, nul n'aurait eu besoin d'en faire un droit. Le paradoxe contemporain n'est donc plus seulement individuel — travailler plus pour gagner plus — il est devenu structurel : nos outils mêmes, conçus pour nous faire gagner du temps, sont ceux qui nous en font perdre le plus.",
          texte_pt: "Se William Penn pudesse observar nossa época, o que teria pensado das redes sociais, das notificações incessantes, do direito à desconexão inscrito na lei francesa desde 2017? Sem dúvida teria visto, nessa própria legislação, a confirmação de seu argumento: se o tempo tivesse sido naturalmente bem empregado, ninguém teria precisado transformá-lo em um direito. O paradoxo contemporâneo não é mais apenas individual — trabalhar mais para ganhar mais — ele se tornou estrutural: são as próprias ferramentas concebidas para nos fazer ganhar tempo que são as que mais nos fazem perdê-lo.",
          link: {url:"https://fr.wikipedia.org/wiki/Droit_%C3%A0_la_d%C3%A9connexion", label:"Le droit à la déconnexion — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"D'après le texte, depuis quand le droit à la déconnexion est-il inscrit dans la loi française ?", options:["2017","1998","2020"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quel argument le texte tire-t-il du fait même que ce droit ait dû être inscrit dans la loi ?", options:["Cela confirme, selon l'auteur, que le temps n'est justement pas naturellement bien employé","Cela prouve que les Français ne travaillent pas assez","Cela montre surtout que la loi elle-même est inutile"], correct:0},
            {niveau:"expert", type:"qcm", q:"En quoi le texte affirme-t-il que le paradoxe est devenu « structurel » plutôt qu'« individuel » ?", options:["Parce que ce sont les outils eux-mêmes, censés faire gagner du temps, qui en font perdre","Parce que chaque individu choisit librement et isolément de perdre son temps","Parce que le problème ne concernerait que certains métiers précis"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "6 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), en utilisant au moins une fois le conditionnel passé ou le plus-que-parfait (hypothèse dans le passé, par exemple : « si j'avais choisi..., j'aurais... ») : la technologie nous fait-elle, au fond, gagner ou perdre du temps ? Développe une position nuancée, en reconnaissant explicitement au moins un contre-argument.",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), usando pelo menos uma vez o condicional passado ou o mais-que-perfeito (hipótese no passado, por exemplo: «si j'avais choisi..., j'aurais...»): a tecnologia, no fundo, nos faz ganhar ou perder tempo? Desenvolva uma posição nuançada, reconhecendo explicitamente pelo menos um contra-argumento."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : en t'appuyant sur la citation de William Penn, explique en quoi le rapport au temps a changé — ou n'a pas changé — depuis le XVIIe siècle. Utilise un registre soutenu et au moins une figure de style (métaphore, antithèse...).",
          consigne_pt: "Grave-se (cerca de 2 min): apoiando-se na citação de William Penn, explique em que medida a relação com o tempo mudou — ou não mudou — desde o século XVII. Use um registro elevado e pelo menos uma figura de linguagem (metáfora, antítese...)."
        }
      }
    }
  },
  /* ===================== THÈME 05 → 11 octobre 2026 : C'est une blague ? ===================== */
  {
    id: "blague-2026-10-05",
    date_debut: "2026-10-05",
    periode: "5 → 11 octobre 2026",
    titre_fr: "C'est une blague ?",
    titre_pt: "É piada?",
    sub_fr: "Un thème pour rire, raconter et comprendre l'humour français, à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema para rir, contar e entender o humor francês, para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde cette courte vidéo sur le « poisson d'avril », le jour des blagues en France. Écoute bien les dates.",
          consigne_pt: "Assista a este vídeo curto sobre o « poisson d'avril », o dia das brincadeiras na França. Preste atenção às datas.",
          media: {type:"video", id:"PF8_dAPMmIM", label:"D'où vient le poisson d'avril ? — Pratiks"},
          exos: [
            {type:"qcm", q:"En France, le jour des blagues, c'est…", options:["Le 1er janvier","Le 1er avril","Le 14 juillet"], correct:1},
            {type:"qcm", q:"Dans la vidéo, avant, la nouvelle année commençait…", options:["En avril","En août","En décembre"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "Tout le monde a une blague préférée. La semaine dernière, mon collègue m'a raconté une histoire très drôle. J'ai ri pendant dix minutes ! Rire, ça fait du bien.",
          texte_pt: "Todo mundo tem uma piada preferida. Na semana passada, meu colega me contou uma história muito engraçada. Eu ri durante dez minutos! Rir faz bem.",
          exos: [
            {type:"qcm", q:"Qui a raconté l'histoire ?", options:["Le professeur","La mère","Le collègue"], correct:2},
            {type:"qcm", q:"Combien de temps la personne a-t-elle ri ?", options:["Deux minutes","Dix minutes","Une heure"], correct:1}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : qu'est-ce qui te fait rire ? Utilise « Je ris quand... » et « C'est drôle ! ».",
          consigne_pt: "Escreva 3 frases: o que te faz rir? Use « Je ris quand... » e « C'est drôle ! »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis « C'est une blague ?! » avec un ton très surpris, puis dis en une phrase si tu aimes les blagues.",
          consigne_pt: "Grave-se: diga « C'est une blague ?! » com um tom bem surpreso, depois diga em uma frase se você gosta de piadas."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "6 min",
          consigne_fr: "Regarde la vidéo et essaie de comprendre les explications : pourquoi le 1er avril ? Pourquoi un poisson ?",
          consigne_pt: "Assista ao vídeo e tente entender as explicações: por que 1º de abril? Por que um peixe?",
          media: {type:"video", id:"PF8_dAPMmIM", label:"D'où vient le poisson d'avril ? — Pratiks"},
          exos: [
            {type:"qcm", q:"D'après la vidéo, au XVIe siècle, le roi décide que l'année commencera désormais…", options:["Le 1er avril","Le 1er janvier","Le 1er mai"], correct:1},
            {type:"qcm", q:"Qu'est-ce qu'on offrait « pour rire » à ceux qui fêtaient encore le Nouvel An en avril ?", options:["De l'argent","Des fleurs","De faux cadeaux"], correct:2},
            {type:"qcm", q:"Une explication du « poisson » : pendant le carême, les chrétiens ne devaient pas manger de…", options:["Viande","Pain","Fruits"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "L'humour est partout en France : entre amis, au bureau, dans les films. Mais attention, ce qui fait rire en France ne fait pas toujours rire ailleurs. Les Français aiment particulièrement l'ironie et l'autodérision. Raconter une blague sur soi-même est souvent vu comme un signe d'intelligence et de confiance.",
          texte_pt: "O humor está em toda parte na França: entre amigos, no escritório, nos filmes. Mas atenção, o que faz rir na França nem sempre faz rir em outros lugares. Os franceses gostam particularmente da ironia e da autodepreciação. Contar uma piada sobre si mesmo é muitas vezes visto como um sinal de inteligência e confiança.",
          exos: [
            {type:"qcm", q:"Qu'est-ce que les Français aiment particulièrement ?", options:["Les blagues physiques","Les histoires tristes","L'ironie et l'autodérision"], correct:2},
            {type:"qcm", q:"Raconter une blague sur soi-même est souvent vu comme…", options:["Un signe de confiance","Un manque de respect","Une erreur de politesse"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Raconte une petite anecdote drôle (5-6 phrases). Utilise l'imparfait pour le décor (« C'était..., il faisait..., j'étais... ») et le passé composé pour l'action (« tout à coup, il a... »).",
          consigne_pt: "Conte uma pequena anedota engraçada (5-6 frases). Use o imperfeito para o cenário (« C'était..., il faisait..., j'étais... ») e o passé composé para a ação (« tout à coup, il a... »)."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "4 min",
          consigne_fr: "Enregistre-toi : raconte en 4-5 phrases une blague que tu as faite ou qu'on t'a faite (un poisson d'avril, par exemple).",
          consigne_pt: "Grave-se: conte em 4-5 frases uma brincadeira que você fez ou que fizeram com você (um 1º de abril, por exemplo)."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "7 min",
          consigne_fr: "Écoute cette chanson de Boby Lapointe, grand amoureux des jeux de mots. Suis l'histoire du personnage et repère les sons « t » et « k » qui se répètent.",
          consigne_pt: "Ouça esta canção de Boby Lapointe, grande amante dos jogos de palavras. Acompanhe a história do personagem e identifique os sons « t » e « k » que se repetem.",
          media: {type:"video", id:"a7P8dcPsfyE", label:"Boby Lapointe — Ta Katie t'a quitté (Archive INA)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Où se passe l'histoire ?", options:["Sur une plage","Dans le bar d'une gare","Dans un avion"], correct:1},
            {niveau:"moyen", type:"qcm", q:"Pourquoi Igor, le personnage, est-il malheureux ?", options:["Sa Katie l'a quitté","Il a perdu son travail","Il a raté son train"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Le refrain « Ta Katie t'a quitté » joue sur les sons d'un objet. Lequel ?", options:["Un train qui freine","La pluie sur la fenêtre","Le tic-tac d'un réveil"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "Le quiproquo est l'un des plus vieux ressorts comiques : deux personnes parlent de choses différentes sans le savoir. Imaginez : votre ami vous annonce qu'« elle » est enfin arrivée, après trois semaines de retard. Vous pensez à sa belle-mère, il parle… de la plante qu'il a commandée pour son salon ! Molière utilisait déjà ce procédé au XVIIe siècle, et on le retrouve aujourd'hui dans les séries et les films. Pour un apprenant de français, les homophones et les mots ambigus créent aussi de nombreux quiproquos involontaires.",
          texte_pt: "O quiproquo é um dos mais antigos recursos cômicos: duas pessoas falam de coisas diferentes sem saber. Imagine: seu amigo anuncia que « ela » finalmente chegou, depois de três semanas de atraso. Você pensa na sogra dele, e ele está falando… da planta que encomendou para a sala! Molière já usava esse recurso no século XVII, e o encontramos hoje em séries e filmes. Para quem aprende francês, os homófonos e as palavras ambíguas também criam muitos mal-entendidos involuntários.",
          exos: [
            {niveau:"facile", type:"qcm", q:"Un quiproquo, c'est quand…", options:["Deux personnes parlent de choses différentes sans le savoir","On raconte une blague très longue","On se moque de quelqu'un"], correct:0},
            {niveau:"moyen", type:"qcm", q:"Dans l'exemple, de quoi parle vraiment l'ami ?", options:["De sa belle-mère","D'une plante","D'un colis perdu"], correct:1},
            {niveau:"difficile", type:"qcm", q:"Pourquoi les apprenants de français vivent-ils souvent des quiproquos ?", options:["Parce que les Français parlent trop vite","Parce que le français a beaucoup d'homophones et de mots ambigus","Parce que l'humour français est interdit à l'étranger"], correct:1}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "6 min",
          consigne_fr: "Raconte un quiproquo ou un malentendu que tu as vécu (6-8 phrases), en alternant imparfait (contexte) et passé composé (événements). Termine par la « chute » : comment le malentendu a été découvert.",
          consigne_pt: "Conte um quiproquo ou mal-entendido que você viveu (6-8 frases), alternando imperfeito (contexto) e passé composé (acontecimentos). Termine com o « desfecho »: como o mal-entendido foi descoberto."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : tes amis t'apprennent une expression française « normale »… qui est en fait très vulgaire, et tu l'utilises toute la soirée. Drôle ou pas drôle ? Où est la limite entre blague et méchanceté ?",
          consigne_pt: "Grave-se (1 min): seus amigos te ensinam uma expressão francesa « normal »… que na verdade é muito vulgar, e você a usa a noite toda. Engraçado ou não? Onde fica o limite entre brincadeira e maldade?"
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — Sketch", titre_pt: "Compreensão oral — Esquete", dur: "8 min",
          consigne_fr: "Écoute ce sketch célèbre de Raymond Devos (enregistré en public en 1957), maître du jeu de mots. Suis les aventures de l'automobiliste et repère les différents sens du mot « sens ».",
          consigne_pt: "Ouça este esquete famoso de Raymond Devos (gravado ao vivo em 1957), mestre do jogo de palavras. Acompanhe as aventuras do motorista e identifique os diferentes sentidos da palavra « sens ».",
          media: {type:"video", id:"pMUoWPh4G2k", label:"Raymond Devos — Le plaisir des sens (live, 1957)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Quel problème rencontre le narrateur, en voiture ?", options:["Il tombe en panne d'essence","Il arrive sur une place dont toutes les rues sont en sens interdit","Il perd ses clés"], correct:1},
            {niveau:"moyen", type:"qcm", q:"Que finit par faire le narrateur, faute de pouvoir sortir ?", options:["Il tourne en rond sur la place","Il abandonne sa voiture","Il prend le train"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Sur quoi repose l'essentiel de l'humour du sketch ?", options:["Sur des grimaces et des gestes","Sur des imitations de personnalités","Sur le double sens du mot « sens » : direction et signification"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "« L'humour, c'est l'arme blanche des hommes désarmés », écrivait Romain Gary. Écrivain, diplomate et résistant pendant la Seconde Guerre mondiale, Gary reste le seul auteur à avoir reçu deux fois le prix Goncourt — la seconde fois sous le pseudonyme d'Émile Ajar. Pour lui, l'humour n'est pas une fuite : c'est une manière de rester digne face à ce qui nous écrase, de reprendre un peu de pouvoir sur une situation qu'on ne contrôle pas. Rire d'une épreuve, ce n'est pas la nier, c'est refuser qu'elle ait le dernier mot.",
          texte_pt: "« O humor é a arma branca dos homens desarmados », escrevia Romain Gary. Escritor, diplomata e resistente durante a Segunda Guerra Mundial, Gary continua sendo o único autor a ter recebido duas vezes o prêmio Goncourt — a segunda vez sob o pseudônimo de Émile Ajar. Para ele, o humor não é uma fuga: é uma forma de permanecer digno diante do que nos esmaga, de retomar um pouco de poder sobre uma situação que não controlamos. Rir de uma provação não é negá-la, é recusar que ela tenha a última palavra.",
          link: {url:"https://fr.wikipedia.org/wiki/Romain_Gary", label:"Romain Gary — Wikipédia"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Qu'a d'unique Romain Gary dans l'histoire littéraire française ?", options:["Il a reçu deux fois le prix Goncourt","Il a écrit uniquement des comédies","Il n'a jamais publié sous son nom"], correct:0},
            {niveau:"moyen", type:"qcm", q:"Selon le texte, pour Gary, l'humour est surtout…", options:["Une façon de fuir la réalité","Une façon de rester digne face aux épreuves","Une technique pour vendre plus de livres"], correct:1},
            {niveau:"difficile", type:"qcm", q:"Que signifie « refuser qu'elle ait le dernier mot » à propos d'une épreuve ?", options:["Ne jamais parler de ses problèmes","Oublier complètement ce qui s'est passé","Ne pas laisser la difficulté décider seule de notre état d'esprit"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (8-10 phrases) à partir de la formule attribuée à Pierre Desproges : « On peut rire de tout, mais pas avec n'importe qui. » Existe-t-il des sujets dont on ne devrait jamais rire ? Donne au moins un exemple concret.",
          consigne_pt: "Redija um texto argumentativo (8-10 frases) a partir da frase atribuída a Pierre Desproges: « Pode-se rir de tudo, mas não com qualquer um. » Existem assuntos dos quais nunca se deveria rir? Dê pelo menos um exemplo concreto."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "7 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance la citation de Romain Gary — « L'humour, c'est l'arme blanche des hommes désarmés. » Donne un exemple (personnel, historique ou culturel) où l'humour a servi de résistance.",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance a citação de Romain Gary — « O humor é a arma branca dos homens desarmados. » Dê um exemplo (pessoal, histórico ou cultural) em que o humor serviu de resistência."
        }
      },
      C1: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse", titre_pt: "Compreensão oral — análise", dur: "8 min",
          consigne_fr: "Réécoute le sketch de Raymond Devos, mais cette fois analyse la mécanique du comique : comment une situation banale devient-elle absurde ?",
          consigne_pt: "Ouça novamente o esquete de Raymond Devos, mas desta vez analise a mecânica do cômico: como uma situação banal se torna absurda?",
          media: {type:"video", id:"pMUoWPh4G2k", label:"Raymond Devos — Le plaisir des sens (live, 1957)"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Le titre « Le plaisir des sens » joue sur…", options:["Les cinq sens (le plaisir sensuel) et le sens de circulation","La gastronomie française","La musique classique"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quel procédé Devos utilise-t-il principalement pour construire le comique ?", options:["La satire politique directe","Une logique rigoureuse poussée jusqu'à l'absurde, à partir d'une situation banale","Le comique de gestes et de chutes"], correct:1},
            {niveau:"très difficile", type:"qcm", q:"En quoi ce sketch peut-il se lire comme une petite fable sur la société ?", options:["Il fait l'éloge du code de la route","Il raconte un fait divers réel","Il montre des individus pris au piège de règles absurdes qu'ils respectent sans pouvoir en sortir"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "On dit souvent que l'humour est la dernière frontière de l'apprentissage d'une langue. Comprendre une blague suppose en effet de maîtriser bien plus que le vocabulaire : les références culturelles, le rythme, les sous-entendus, et surtout la polysémie des mots. Raymond Devos en avait fait son terrain de jeu, au point que le ministère de la Culture a créé un Grand Prix Raymond-Devos de la langue française. Paradoxalement, c'est précisément ce qui rend un jeu de mots brillant dans une langue qui le rend presque intraduisible dans une autre : on peut traduire une idée, beaucoup plus difficilement une sonorité.",
          texte_pt: "Costuma-se dizer que o humor é a última fronteira do aprendizado de uma língua. Entender uma piada supõe de fato dominar muito mais que o vocabulário: as referências culturais, o ritmo, os subentendidos e sobretudo a polissemia das palavras. Raymond Devos fez disso seu campo de jogo, a ponto de o Ministério da Cultura criar um Grande Prêmio Raymond-Devos da língua francesa. Paradoxalmente, é justamente o que torna um trocadilho brilhante numa língua que o torna quase intraduzível em outra: pode-se traduzir uma ideia, muito mais dificilmente uma sonoridade.",
          link: {url:"https://fr.wikipedia.org/wiki/Raymond_Devos", label:"Raymond Devos — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Selon le texte, comprendre une blague suppose de maîtriser…", options:["Uniquement le vocabulaire","Les références culturelles, le rythme, les sous-entendus et la polysémie","Seulement la grammaire"], correct:1},
            {niveau:"difficile", type:"qcm", q:"Quelle reconnaissance officielle est mentionnée à propos de Devos ?", options:["Un prix de la langue française créé à son nom par le ministère de la Culture","Une entrée à l'Académie française","Une rue à son nom à Paris"], correct:0},
            {niveau:"très difficile", type:"qcm", q:"Quel est le paradoxe exposé à la fin du texte ?", options:["Plus une blague est courte, plus elle est drôle","Les jeux de mots n'intéressent que les enfants","Ce qui fait la force d'un jeu de mots dans une langue est ce qui le rend intraduisible dans une autre"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), en utilisant le subjonctif quand c'est pertinent (« bien que... », « il est rare que... », « pour que... ») : l'humour peut-il vraiment se traduire d'une langue à l'autre ? Appuie-toi sur un exemple d'humour brésilien ou français.",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), usando o subjuntivo quando pertinente (« bien que... », « il est rare que... », « pour que... »): o humor pode realmente ser traduzido de uma língua para outra? Apoie-se em um exemplo de humor brasileiro ou francês."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : compare l'humour français et l'humour brésilien (ironie, autodérision, comique de situation…). Nuance ta position et utilise au moins une structure au subjonctif.",
          consigne_pt: "Grave-se (cerca de 2 min): compare o humor francês e o humor brasileiro (ironia, autodepreciação, comédia de situação…). Nuance sua posição e use pelo menos uma estrutura no subjuntivo."
        }
      },
      C2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse fine", titre_pt: "Compreensão oral — análise fina", dur: "8 min",
          consigne_fr: "Réécoute le sketch de Raymond Devos en portant attention à la construction rhétorique : ton du narrateur, enchaînements logiques, jeux sur la langue.",
          consigne_pt: "Ouça novamente o esquete de Raymond Devos prestando atenção à construção retórica: tom do narrador, encadeamentos lógicos, jogos com a língua.",
          media: {type:"video", id:"pMUoWPh4G2k", label:"Raymond Devos — Le plaisir des sens (live, 1957)"},
          exos: [
            {niveau:"difficile", type:"qcm", q:"Le sketch exploite un même mot employé avec plusieurs significations. Comment appelle-t-on ce phénomène ?", options:["L'hyperbole","La polysémie, exploitée ici comme une antanaclase","L'anaphore"], correct:1},
            {niveau:"très difficile", type:"qcm", q:"Le narrateur garde un ton calme et raisonné face à une situation absurde. Quel effet produit ce décalage ?", options:["Il renforce le comique : plus le ton est sérieux, plus l'absurde ressort","Il rend le sketch tragique","Il montre que le narrateur ne comprend pas la situation"], correct:0},
            {niveau:"expert", type:"qcm", q:"Pourquoi dit-on souvent que l'humour de Devos est presque intraduisible ?", options:["Parce qu'il ne parle que de la France","Parce que ses sketches sont trop longs","Parce qu'il travaille la matière même de la langue française : sonorités et doubles sens"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "En 1900, dans son essai Le Rire, Henri Bergson proposait une définition restée célèbre : le comique naîtrait « du mécanique plaqué sur du vivant ». Nous rions lorsqu'un être humain, censé être souple et adaptable, se comporte soudain comme une machine — le distrait qui répète un geste hors de propos, le bureaucrate qui applique une règle jusqu'à l'absurde. Mais Bergson ajoutait une dimension moins confortable : le rire serait aussi une sanction sociale, une manière pour le groupe de corriger celui qui s'écarte de la norme. Rire ensemble, c'est créer du lien ; rire de quelqu'un, c'est parfois l'exclure. Toute la question des limites de l'humour est déjà contenue dans cette ambivalence.",
          texte_pt: "Em 1900, em seu ensaio O Riso, Henri Bergson propunha uma definição que ficou célebre: o cômico nasceria « do mecânico aplicado sobre o vivo ». Rimos quando um ser humano, supostamente flexível e adaptável, se comporta de repente como uma máquina — o distraído que repete um gesto fora de propósito, o burocrata que aplica uma regra até o absurdo. Mas Bergson acrescentava uma dimensão menos confortável: o riso seria também uma sanção social, uma maneira de o grupo corrigir quem se afasta da norma. Rir junto é criar laço; rir de alguém é, às vezes, excluí-lo. Toda a questão dos limites do humor já está contida nessa ambivalência.",
          link: {url:"https://fr.wikipedia.org/wiki/Le_Rire_(Bergson)", label:"Le Rire de Bergson — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Selon Bergson, d'où naît le comique ?", options:["Du mécanique plaqué sur du vivant","De la tristesse partagée","De la surprise uniquement"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Quelle fonction moins confortable Bergson attribue-t-il au rire ?", options:["Une fonction médicale","Une sanction sociale qui corrige celui qui s'écarte de la norme","Une fonction purement esthétique"], correct:1},
            {niveau:"expert", type:"qcm", q:"En quoi cette ambivalence éclaire-t-elle le débat sur les limites de l'humour ?", options:["Elle prouve que l'humour n'a aucune limite","Elle montre que seul l'humour politique pose problème","Elle montre que le même rire peut unir un groupe ou exclure un individu"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), avec au moins une hypothèse au passé (« si... avait..., ... aurait... ») : le rire rassemble-t-il plus qu'il n'exclut ? Confronte Bergson à Romain Gary et reconnais explicitement au moins un contre-argument.",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), com pelo menos uma hipótese no passado (« si... avait..., ... aurait... »): o riso une mais do que exclui? Confronte Bergson com Romain Gary e reconheça explicitamente pelo menos um contra-argumento."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : « Comprendre une blague dans une langue étrangère, c'est la preuve ultime qu'on la maîtrise. » Discute cette affirmation dans un registre soutenu, avec au moins une figure de style (antithèse, métaphore…).",
          consigne_pt: "Grave-se (cerca de 2 min): « Entender uma piada numa língua estrangeira é a prova definitiva de que a dominamos. » Discuta essa afirmação num registro elevado, com pelo menos uma figura de linguagem (antítese, metáfora…)."
        }
      }
    }
  },
  /* ===================== THÈME 12 → 18 octobre 2026 : Un mois de liberté... et après ? =====================
     date_debut = 2026-10-12 : invisible pour les élèves avant lundi, visible tout de suite côté professeure. */
  {
    id: "liberte-2026-10-12",
    date_debut: "2026-10-12",
    periode: "12 → 18 octobre 2026",
    titre_fr: "Un mois de liberté... et après ?",
    titre_pt: "Um mês de liberdade... e depois?",
    sub_fr: "Un thème pour parler de tes envies, de ton temps libre et de ton rapport au travail, à faire en 15 à 30 minutes, à ton rythme.",
    sub_pt: "Um tema para falar dos seus desejos, do seu tempo livre e da sua relação com o trabalho, para fazer em 15 a 30 minutos, no seu ritmo.",
    niveaux: {
      A1: {
        duree: "≈ 15 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "5 min",
          consigne_fr: "Écoute cette chanson très célèbre (avec les sous-titres en français). Repère les mots que tu connais déjà.",
          consigne_pt: "Ouça esta canção muito famosa (com legendas em francês). Identifique as palavras que você já conhece.",
          media: {type:"video", id:"9Hv6R2fEdfA", label:"Georges Moustaki — Ma liberté (sous-titres en français)"},
          exos: [
            {type:"qcm", q:"Quel mot revient tout le temps dans la chanson ?", options:["Voyage","Liberté","Argent"], correct:1},
            {type:"qcm", q:"La chanson parle surtout…", options:["De la liberté et de l'amour","Du football","De la cuisine"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "4 min",
          texte_fr: "Imagine : un mois sans travail. Le matin, tu dors tard. L'après-midi, tu lis ou tu marches dans la ville. Le soir, tu vois tes amis. Tu fais ce que tu veux, quand tu veux !",
          texte_pt: "Imagine: um mês sem trabalho. De manhã, você dorme até tarde. À tarde, você lê ou caminha pela cidade. À noite, você vê seus amigos. Você faz o que quer, quando quer!",
          exos: [
            {type:"qcm", q:"Le matin, qu'est-ce qu'on fait ?", options:["On travaille","On dort tard","On fait du sport"], correct:1},
            {type:"qcm", q:"Le soir, on voit…", options:["Ses amis","Son patron","Le médecin"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "3 min",
          consigne_fr: "Écris 3 phrases : avec un mois libre, qu'est-ce que tu voudrais faire ? Utilise « Je voudrais... ».",
          consigne_pt: "Escreva 3 frases: com um mês livre, o que você gostaria de fazer? Use « Je voudrais... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "3 min",
          consigne_fr: "Enregistre-toi : dis à voix haute 3 choses que tu aimes faire pendant ton temps libre (« J'aime... »).",
          consigne_pt: "Grave-se: diga em voz alta 3 coisas que você gosta de fazer no seu tempo livre (« J'aime... »)."
        }
      },
      A2: {
        duree: "≈ 20 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "5 min",
          consigne_fr: "Regarde cette courte vidéo sur le congé sabbatique en France. Note la durée possible du congé.",
          consigne_pt: "Assista a este vídeo curto sobre a licença sabática na França. Anote a duração possível da licença.",
          media: {type:"video", id:"wK7OS9okTj4", label:"La Minute de vos Droits — Le congé sabbatique (CFDT)"},
          exos: [
            {type:"qcm", q:"Qui répond aux questions dans la vidéo ?", options:["Camille","Léo","Abdel"], correct:2},
            {type:"qcm", q:"Le congé sabbatique, c'est…", options:["Une pause dans sa carrière, sans perdre son contrat","Des vacances payées par l'État","Un nouveau travail"], correct:0},
            {type:"qcm", q:"Pendant le congé sabbatique, le salarié…", options:["Reçoit son salaire normal","N'est pas payé par son entreprise","Reçoit un double salaire"], correct:1}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "5 min",
          texte_fr: "Un mois de liberté totale : au début, c'est un rêve. On dort tard, on flâne, on reprend des projets oubliés. Mais quelques semaines plus tard, une question arrive : et après ? Sans programme, certaines personnes s'ennuient. D'autres découvrent une nouvelle version d'elles-mêmes.",
          texte_pt: "Um mês de liberdade total: no começo, é um sonho. Dorme-se até tarde, passeia-se sem pressa, retomam-se projetos esquecidos. Mas algumas semanas depois, chega uma pergunta: e depois? Sem programa, algumas pessoas se entediam. Outras descobrem uma nova versão de si mesmas.",
          exos: [
            {type:"qcm", q:"Que veut dire « flâner » ?", options:["Travailler beaucoup","Se promener sans se presser","Dormir toute la journée"], correct:1},
            {type:"qcm", q:"Selon le texte, sans programme, certaines personnes…", options:["S'ennuient","Gagnent plus d'argent","Déménagent"], correct:0}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "5 min",
          consigne_fr: "Écris un petit texte (5-6 phrases) au conditionnel présent : « Si j'avais un mois libre, je voyagerais / je lirais / je dormirais... ».",
          consigne_pt: "Escreva um pequeno texto (5-6 frases) no condicional presente: « Si j'avais un mois libre, je voyagerais / je lirais / je dormirais... »."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "5 min",
          consigne_fr: "Enregistre-toi : présente ton « mois parfait » en 4-5 phrases (« La première semaine, je me reposerais... ensuite, je... »).",
          consigne_pt: "Grave-se: apresente seu « mês perfeito » em 4-5 frases (« La première semaine, je me reposerais... ensuite, je... »)."
        }
      },
      B1: {
        duree: "≈ 25 min",
        co: {
          titre_fr: "Compréhension orale — Musique", titre_pt: "Compreensão oral — Música", dur: "7 min",
          consigne_fr: "Écoute « Ma liberté » de Georges Moustaki (1969). Suis l'histoire racontée par le chanteur : ce que la liberté lui a apporté… et ce qui se passe à la fin.",
          consigne_pt: "Ouça « Ma liberté » de Georges Moustaki (1969). Acompanhe a história contada pelo cantor: o que a liberdade lhe trouxe… e o que acontece no final.",
          media: {type:"video", id:"9Hv6R2fEdfA", label:"Georges Moustaki — Ma liberté (sous-titres en français)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"À qui le chanteur s'adresse-t-il dans la chanson ?", options:["À sa mère","À sa liberté, comme si c'était une personne","À son patron"], correct:1},
            {niveau:"moyen", type:"qcm", q:"Qu'est-ce que la liberté lui a permis de faire ?", options:["Partir, voyager, suivre ses envies","Devenir riche","Devenir célèbre"], correct:0},
            {niveau:"difficile", type:"qcm", q:"À la fin, pourquoi abandonne-t-il sa liberté ?", options:["Parce qu'il est malade","Parce qu'il doit travailler","Par amour pour une femme"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "6 min",
          texte_fr: "« Je sais ce que vous pensez : ne rien faire pendant un mois, c'est le rêve. Mais soyons honnêtes. Sans travail, sans projet, sans but précis… qu'est-ce qu'on devient ? Le travail, ce n'est pas juste un salaire. C'est une structure, une identité, un lien avec les autres. Moi, j'ai essayé. Et j'ai compris une chose : la liberté sans projet, c'est juste… du vide. »",
          texte_pt: "« Eu sei o que vocês estão pensando: não fazer nada durante um mês é o sonho. Mas sejamos honestos. Sem trabalho, sem projeto, sem objetivo preciso… o que a gente se torna? O trabalho não é só um salário. É uma estrutura, uma identidade, um vínculo com os outros. Eu tentei. E entendi uma coisa: a liberdade sem projeto é só… vazio. »",
          exos: [
            {niveau:"facile", type:"qcm", q:"Pour cette personne, le travail, c'est…", options:["Seulement un salaire","Une structure, une identité et un lien avec les autres","Une perte de temps"], correct:1},
            {niveau:"moyen", type:"qcm", q:"La personne parle-t-elle par expérience ?", options:["Oui, elle a essayé de ne rien faire","Non, elle imagine seulement","Non, elle répète ce que dit son patron"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Que veut dire « la liberté sans projet, c'est juste du vide » ?", options:["Qu'il faut toujours travailler le week-end","Que la liberté est dangereuse","Que le temps libre n'a de valeur que si on en fait quelque chose"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "6 min",
          consigne_fr: "Écris ton « mois parfait » semaine par semaine (6-8 phrases), au conditionnel présent, avec une vraie logique entre les semaines (repos, projets, voyage, retour…).",
          consigne_pt: "Escreva seu « mês perfeito » semana por semana (6-8 frases), no condicional presente, com uma lógica real entre as semanas (descanso, projetos, viagem, volta…)."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (1 min) : réponds au personnage du texte, qui dit que la liberté sans projet, c'est du vide. Es-tu d'accord ? Utilise « Je pense que... / Au contraire... / Mais si on réfléchit... ».",
          consigne_pt: "Grave-se (1 min): responda ao personagem do texto, que diz que a liberdade sem projeto é vazio. Você concorda? Use « Je pense que... / Au contraire... / Mais si on réfléchit... »."
        }
      },
      B2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale", titre_pt: "Compreensão oral", dur: "6 min",
          consigne_fr: "Regarde cette vidéo d'information juridique sur le congé sabbatique. Note les trois éléments clés : qui y a droit, combien de temps, à quelles conditions.",
          consigne_pt: "Assista a este vídeo de informação jurídica sobre a licença sabática. Anote os três elementos-chave: quem tem direito, quanto tempo, em que condições.",
          media: {type:"video", id:"wK7OS9okTj4", label:"La Minute de vos Droits — Le congé sabbatique (CFDT)"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Combien de temps peut durer un congé sabbatique ?", options:["Une semaine maximum","Exactement deux ans","Entre 6 et 11 mois"], correct:2},
            {niveau:"moyen", type:"qcm", q:"Quelle condition faut-il en général remplir pour y avoir droit ?", options:["Une ancienneté suffisante dans l'entreprise","Avoir plus de 50 ans","Être cadre"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Pendant le congé, que devient le contrat de travail ?", options:["Il est rompu définitivement","Il est suspendu, mais pas rompu","Il est transformé en CDD"], correct:1}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "8 min",
          texte_fr: "Le 20 juin 1936, le gouvernement du Front populaire, dirigé par Léon Blum, promulgue une loi qui accorde quinze jours de congés payés à tous les salariés. Pour beaucoup d'ouvriers, c'est la première fois qu'ils voient la mer. Les congés s'allongent ensuite progressivement, jusqu'à la cinquième semaine, accordée en 1982. Ce qui paraît aujourd'hui évident était alors révolutionnaire : l'idée qu'un travailleur a droit à du temps libre payé, non comme une récompense, mais comme une condition de sa dignité.",
          texte_pt: "Em 20 de junho de 1936, o governo da Frente Popular, dirigido por Léon Blum, promulga uma lei que concede quinze dias de férias remuneradas a todos os assalariados. Para muitos operários, é a primeira vez que veem o mar. As férias se alongam depois progressivamente, até a quinta semana, concedida em 1982. O que hoje parece evidente era então revolucionário: a ideia de que um trabalhador tem direito a tempo livre remunerado, não como recompensa, mas como condição de sua dignidade.",
          link: {url:"https://fr.wikipedia.org/wiki/Cong%C3%A9s_pay%C3%A9s_en_France", label:"Les congés payés en France — Wikipédia"},
          exos: [
            {niveau:"facile", type:"qcm", q:"Combien de jours de congés payés la loi de 1936 accorde-t-elle ?", options:["Quinze jours","Cinq semaines","Un mois"], correct:0},
            {niveau:"moyen", type:"qcm", q:"Quand la cinquième semaine de congés payés a-t-elle été accordée ?", options:["En 1936","En 1968","En 1982"], correct:2},
            {niveau:"difficile", type:"qcm", q:"Selon le texte, qu'est-ce qui était révolutionnaire en 1936 ?", options:["Le fait de partir à l'étranger","L'idée que le temps libre payé est un droit lié à la dignité, et non une récompense","La création des 35 heures"], correct:1}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "8 min",
          consigne_fr: "Rédige un texte argumentatif (8-10 phrases) : « Les vacances, c'est bien parce que ça ne dure pas toujours. » Es-tu d'accord ? Utilise le conditionnel présent pour imaginer une vie sans fin de vacances.",
          consigne_pt: "Redija um texto argumentativo (8-10 frases): « As férias são boas porque não duram para sempre. » Você concorda? Use o condicional presente para imaginar uma vida de férias sem fim."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "8 min",
          consigne_fr: "Enregistre-toi (1-2 min) : défends ou nuance cette idée — « S'ennuyer est nécessaire pour être créatif. » Utilise les expressions « lâcher prise » et « prendre du recul ».",
          consigne_pt: "Grave-se (1-2 min): defenda ou nuance esta ideia — « Entediar-se é necessário para ser criativo. » Use as expressões « lâcher prise » e « prendre du recul »."
        }
      },
      C1: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse", titre_pt: "Compreensão oral — análise", dur: "8 min",
          consigne_fr: "Réécoute « Ma liberté » de Moustaki (avec les sous-titres), mais cette fois analyse la manière dont la liberté est représentée et l'opposition qui structure la chanson.",
          consigne_pt: "Ouça novamente « Ma liberté » de Moustaki (com as legendas), mas desta vez analise a forma como a liberdade é representada e a oposição que estrutura a canção.",
          media: {type:"video", id:"9Hv6R2fEdfA", label:"Georges Moustaki — Ma liberté (sous-titres en français)"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Comment la liberté est-elle présentée dans la chanson ?", options:["Comme un concept juridique","Comme une compagne personnifiée, à qui l'on parle","Comme un objet qu'on achète"], correct:1},
            {niveau:"difficile", type:"qcm", q:"Quelle opposition structure la chanson ?", options:["La liberté et l'amour, l'amour étant vu comme un enfermement accepté","La ville et la campagne","La richesse et la pauvreté"], correct:0},
            {niveau:"très difficile", type:"qcm", q:"Quel regard le chanteur porte-t-il sur son choix final ?", options:["Il le regrette amèrement","Il affirme qu'on l'y a forcé","Il l'accepte avec tendresse, sans amertume"], correct:2}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "« L'homme est condamné à être libre », écrit Jean-Paul Sartre dans L'Être et le Néant (1943). La formule surprend : comment la liberté pourrait-elle être une condamnation ? Pour Sartre, l'être humain n'a pas de nature fixée à l'avance : « l'existence précède l'essence ». Nous ne choisissons pas d'être libres, mais une fois au monde, nous ne pouvons pas ne pas choisir — même refuser de choisir est encore un choix. D'où l'angoisse : sans excuse ni modèle imposé, nous sommes entièrement responsables de ce que nous faisons de notre vie. Un mois sans contrainte n'offrirait donc pas seulement du repos : il nous confronterait, sans filet, à cette responsabilité.",
          texte_pt: "« O homem está condenado a ser livre », escreve Jean-Paul Sartre em O Ser e o Nada (1943). A fórmula surpreende: como a liberdade poderia ser uma condenação? Para Sartre, o ser humano não tem uma natureza fixada de antemão: « a existência precede a essência ». Não escolhemos ser livres, mas uma vez no mundo, não podemos deixar de escolher — até recusar-se a escolher ainda é uma escolha. Daí a angústia: sem desculpa nem modelo imposto, somos inteiramente responsáveis pelo que fazemos da nossa vida. Um mês sem obrigações não ofereceria, portanto, apenas descanso: ele nos confrontaria, sem rede de proteção, com essa responsabilidade.",
          link: {url:"https://fr.wikipedia.org/wiki/L%27%C3%8Atre_et_le_N%C3%A9ant", label:"L'Être et le Néant — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Que signifie « l'existence précède l'essence » ?", options:["Que l'être humain n'a pas de nature fixée à l'avance et se définit par ses choix","Que la vie n'a aucune importance","Que tout est décidé dès la naissance"], correct:0},
            {niveau:"difficile", type:"qcm", q:"Pourquoi Sartre parle-t-il de « condamnation » ?", options:["Parce que la liberté est interdite par la loi","Parce que nous ne choisissons pas d'être libres et ne pouvons pas échapper au choix","Parce que la liberté rend paresseux"], correct:1},
            {niveau:"très difficile", type:"qcm", q:"Selon la conclusion du texte, que révélerait un mois sans contrainte ?", options:["Que le repos est inutile","Que le travail est toujours préférable","Notre pleine responsabilité face à l'usage de notre liberté"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), en utilisant le subjonctif quand c'est pertinent (« il faut que... », « bien que... », « à condition que... ») : les contraintes sont-elles un obstacle à la liberté, ou au contraire une condition pour la vivre pleinement ?",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), usando o subjuntivo quando pertinente (« il faut que... », « bien que... », « à condition que... »): as restrições são um obstáculo à liberdade, ou ao contrário uma condição para vivê-la plenamente?"
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : parmi l'argent, les horaires, le regard des autres, les factures, les traditions et les croyances limitantes, quels sont les 3 obstacles qui t'empêchent le plus d'être libre ? Classe-les et argumente, avec au moins une structure au subjonctif.",
          consigne_pt: "Grave-se (cerca de 2 min): entre o dinheiro, os horários, o olhar dos outros, as contas, as tradições e as crenças limitantes, quais são os 3 obstáculos que mais te impedem de ser livre? Classifique-os e argumente, com pelo menos uma estrutura no subjuntivo."
        }
      },
      C2: {
        duree: "≈ 30 min",
        co: {
          titre_fr: "Compréhension orale — analyse fine", titre_pt: "Compreensão oral — análise fina", dur: "8 min",
          consigne_fr: "Réécoute « Ma liberté » en portant attention aux procédés poétiques (personnification, images, paradoxes) et mets la chanson en regard de la formule de Sartre.",
          consigne_pt: "Ouça novamente « Ma liberté » prestando atenção aos recursos poéticos (personificação, imagens, paradoxos) e coloque a canção em diálogo com a fórmula de Sartre.",
          media: {type:"video", id:"9Hv6R2fEdfA", label:"Georges Moustaki — Ma liberté (sous-titres en français)"},
          exos: [
            {niveau:"difficile", type:"qcm", q:"La liberté est personnifiée tout au long de la chanson. Quel effet cela produit-il ?", options:["Le texte devient un manifeste politique","La séparation d'avec la liberté se lit comme une rupture amoureuse","La chanson devient humoristique"], correct:1},
            {niveau:"très difficile", type:"qcm", q:"L'image d'un enfermement choisi par amour repose sur quelle figure ?", options:["Une litote","Une anaphore","Un paradoxe proche de l'oxymore : la captivité désirée"], correct:2},
            {niveau:"expert", type:"qcm", q:"Mise en regard de Sartre, que suggère la fin de la chanson ?", options:["Que renoncer à sa liberté reste encore un acte libre","Que la liberté n'existe pas","Que l'amour est toujours une erreur"], correct:0}
          ]
        },
        ce: {
          titre_fr: "Compréhension écrite", titre_pt: "Compreensão escrita", dur: "9 min",
          texte_fr: "Au XVIIe siècle, Pascal affirmait que tout le malheur des hommes vient d'une seule chose : ne pas savoir demeurer en repos dans une chambre. Deux siècles plus tard, en 1880, Paul Lafargue publiait Le Droit à la paresse, pamphlet qui dénonçait l'« amour du travail » comme une folie collective. Les deux auteurs semblent s'opposer : l'un voit dans l'incapacité au repos une fuite devant soi-même, l'autre dans le travail sans fin une aliénation. Pourtant, ils se rejoignent sur un point : l'oisiveté n'est ni un vice ni une vertu en soi ; tout dépend de ce qu'elle révèle de nous. Un mois de liberté ne serait alors pas une parenthèse, mais un miroir.",
          texte_pt: "No século XVII, Pascal afirmava que toda a infelicidade dos homens vem de uma só coisa: não saber ficar em repouso num quarto. Dois séculos mais tarde, em 1880, Paul Lafargue publicava O Direito à Preguiça, panfleto que denunciava o « amor ao trabalho » como uma loucura coletiva. Os dois autores parecem se opor: um vê na incapacidade de repousar uma fuga de si mesmo, o outro vê no trabalho sem fim uma alienação. No entanto, eles se encontram num ponto: a ociosidade não é nem vício nem virtude em si; tudo depende do que ela revela sobre nós. Um mês de liberdade não seria então um parêntese, mas um espelho.",
          link: {url:"https://fr.wikipedia.org/wiki/Le_Droit_%C3%A0_la_paresse", label:"Le Droit à la paresse — Wikipédia"},
          exos: [
            {niveau:"moyen", type:"qcm", q:"Selon Pascal, d'où vient le malheur des hommes ?", options:["Du manque d'argent","De l'incapacité à rester en repos","De la paresse"], correct:1},
            {niveau:"difficile", type:"qcm", q:"Que dénonce Lafargue dans Le Droit à la paresse ?", options:["L'amour du travail comme folie collective","Les vacances trop longues","L'oisiveté des aristocrates uniquement"], correct:0},
            {niveau:"expert", type:"qcm", q:"Que signifie la formule finale « non une parenthèse, mais un miroir » ?", options:["Que les vacances doivent être photographiées","Qu'un mois libre ne sert à rien","Qu'un temps libre ne suspend pas notre vie : il révèle qui nous sommes"], correct:2}
          ]
        },
        ee: {
          titre_fr: "Expression écrite", titre_pt: "Expressão escrita", dur: "7 min",
          consigne_fr: "Rédige un texte argumentatif (10-12 phrases), avec au moins une hypothèse au passé (« si l'on m'avait offert..., j'aurais... ») : « L'oisiveté est la mère de tous les vices » — ce proverbe a-t-il encore un sens aujourd'hui ? Confronte Pascal et Lafargue et reconnais explicitement un contre-argument.",
          consigne_pt: "Redija um texto argumentativo (10-12 frases), com pelo menos uma hipótese no passado (« si l'on m'avait offert..., j'aurais... »): « A ociosidade é a mãe de todos os vícios » — esse provérbio ainda faz sentido hoje? Confronte Pascal e Lafargue e reconheça explicitamente um contra-argumento."
        },
        eo: {
          titre_fr: "Expression orale", titre_pt: "Expressão oral", dur: "6 min",
          consigne_fr: "Enregistre-toi (environ 2 min) : « L'homme est condamné à être libre. » La liberté est-elle un privilège ou un fardeau ? Réponds dans un registre soutenu, avec au moins une figure de style (antithèse, métaphore, chiasme…).",
          consigne_pt: "Grave-se (cerca de 2 min): « O homem está condenado a ser livre. » A liberdade é um privilégio ou um fardo? Responda num registro elevado, com pelo menos uma figura de linguagem (antítese, metáfora, quiasmo…)."
        }
      }
    }
  }
];

function getTema(id){
  return temasSemanas.find(t => t.id === id) || temasSemanas[temasSemanas.length - 1];
}
function temaMostRecentId(){
  return temasSemanas[temasSemanas.length - 1].id;
}

/* Un thème avec "date_debut" (format "AAAA-MM-JJ") ne doit apparaître côté élève qu'à
   partir de cette date (permet de préparer un thème à l'avance sans qu'il soit visible
   trop tôt). Sans "date_debut", le thème est visible immédiatement — comportement
   historique conservé pour tous les thèmes déjà publiés. Côté professeure, aucun
   filtre n'est appliqué : elle voit et peut préparer tous les thèmes, y compris ceux
   pas encore publiés aux élèves. */
function temaEstVisibleEleve(t){
  if(!t.date_debut) return true;
  const aujourdhui = new Date().toISOString().slice(0,10);
  return aujourdhui >= t.date_debut;
}
function temasSemanasVisiveisEleve(){
  const visiveis = temasSemanas.filter(temaEstVisibleEleve);
  return visiveis.length ? visiveis : [temasSemanas[0]]; // filet de sécurité, ne devrait jamais arriver
}
function temaMostRecentVisibleId(){
  const visiveis = temasSemanasVisiveisEleve();
  return visiveis[visiveis.length - 1].id;
}

let temaSelectedId = null;      // thème actuellement affiché côté élève
let teacherTemaSelectedId = null; // thème actuellement affiché côté professeure

/* Niveau effectif utilisé pour le thème : celui attribué par la professeure.
   L'élève n'a pas de sélecteur de niveau — C1/C2 utilisent le contenu B2 (niveau le plus proche). */
function temaNiveauEffectif(){
  const tema = getTema(temaSelectedId);
  if(tema.niveaux[niveau]) return niveau;
  if(niveau==='C1' || niveau==='C2') return 'B2';
  return 'A1';
}

function temaExoHTML(exo, uid, skill){
  if(!exo) return '';
  const opts = exo.options.map((o,i)=>`<button class="exo-opt" onclick="temaAnswerQCM('${uid}',${i},${exo.correct},'${skill}')">${o}</button>`).join('');
  const niveauBadge = exo.niveau ? `<span class="niveau-badge niveau-${exo.niveau}">${exo.niveau}</span>` : '';
  return `<div class="exo-box">
    ${niveauBadge}
    <p class="exo-consigne"><span class="label-fr">Consigne —</span> Choisis la bonne réponse.</p>
    <p class="exo-consigne-pt">🇧🇷 Escolha a resposta certa.</p>
    <p class="exo-question">${exo.q}</p>
    <div class="exo-options" id="opts-${uid}">${opts}</div>
    <p class="exo-feedback" id="fb-${uid}"></p>
  </div>`;
}
/* Plusieurs questions pour une même compétence (CO ou CE) — les thèmes plus
   anciens n'ont qu'un seul "exo" (voir temaExoHTML ci-dessus, toujours
   utilisée pour eux) ; les thèmes plus récents et plus exigeants peuvent
   fournir un tableau "exos" à la place, un sous-uid par question. La
   complétion (temaSaveField) reste suivie au niveau de la compétence dans
   son ensemble, comme avant — répondre à n'importe laquelle des questions
   met à jour le même statut. */
function temaExoListHTML(exos, uid, skill){
  if(!Array.isArray(exos) || !exos.length) return '';
  return exos.map((exo,i)=> temaExoHTML(exo, `${uid}_${i}`, skill)).join('');
}
async function temaAnswerQCM(uid, chosen, correct, skill){
  const container = document.getElementById('opts-'+uid);
  const buttons = container.querySelectorAll('.exo-opt');
  buttons.forEach((b,i)=>{
    b.disabled = true;
    if(i===correct) b.classList.add('correct');
    if(i===chosen && chosen!==correct) b.classList.add('wrong');
  });
  const ok = chosen===correct;
  const fb = document.getElementById('fb-'+uid);
  if(ok){ fb.textContent = '✔ Correct ! / Correto!'; fb.className = 'exo-feedback ok'; }
  else{ fb.textContent = '✘ La bonne réponse est en vert. / A resposta certa está em verde.'; fb.className = 'exo-feedback bad'; }
  await temaSaveField(skill, {done:true, correct:ok});
  renderTemaStatusBar();
}

async function temaSaveField(skill, data){
  const temaId = temaSelectedId;
  student.temas = student.temas || {};
  student.temas[temaId] = student.temas[temaId] || {};
  student.temas[temaId][skill] = { ...(student.temas[temaId][skill]||{}), ...data, ts: new Date().toISOString() };
  if(!student.uid) return;
  try{
    await db.collection('eleves').doc(student.uid).update({
      [`temas.${temaId}.${skill}`]: { ...data, ts: firebase.firestore.FieldValue.serverTimestamp() }
    });
  }catch(e){ /* non bloquant — reste enregistré localement pour cette session */ }
}

async function temaSaveEE(uid){
  const ta = document.getElementById(uid);
  const status = document.getElementById('eestatus-'+uid);
  const text = ta.value.trim();
  if(!text){ status.textContent = "Écris quelque chose avant d'envoyer. / Escreva algo antes de enviar."; status.className = 'ee-note'; return; }
  status.textContent = 'Envoi en cours…'; status.className = 'ee-note';
  const tema = getTema(temaSelectedId);
  try{
    const fileName = `${niveau}_${slug(student.prenom)}-${slug(student.nom)}_THEME-${slug(tema.titre_fr)}-expression-ecrite_${Date.now()}.txt`;
    const blob = new Blob([text], {type:'text/plain'});
    const b64 = await blobToBase64(blob);
    const result = await callDriveScript({ action:'upload', fileName, mimeType:'text/plain', base64: b64 });
    if(!result || !result.ok) throw new Error(result && result.error || 'échec Drive');
    await temaSaveField('ee', {done:true, text, driveUrl: result.viewUrl, driveFileId: result.fileId});
    status.textContent = '✅ Envoyé et enregistré sur le Drive de ta professeure ! / Enviado e salvo no Drive da professora!';
    status.className = 'rec-status ok';
  }catch(e){
    await temaSaveField('ee', {done:true, text});
    status.textContent = "✅ Envoyé à ta professeure (copie Drive indisponible pour le moment).";
    status.className = 'rec-status ok';
  }
  renderTemaStatusBar();
}

const temaRecorders = {};
async function temaToggleRec(uid){
  const btn = document.getElementById('btn-'+uid);
  const status = document.getElementById('status-'+uid);
  if(!temaRecorders[uid] || !temaRecorders[uid].active){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = e=>chunks.push(e.data);
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, {type: mr.mimeType || 'audio/webm'});
        const url = URL.createObjectURL(blob);
        const player = document.getElementById('player-'+uid);
        const ext = (blob.type||'').includes('mp4') ? 'm4a' : 'webm';
        player.innerHTML = `<audio class="rec-audio" controls src="${url}"></audio><br>
          <a class="rec-dl" href="${url}" download="${uid}-secours.${ext}">⬇ Copie locale (secours) / Cópia local</a>`;
        stream.getTracks().forEach(t=>t.stop());
        clearInterval(temaRecorders[uid].timer);
        status.textContent = 'Envoi en cours…';
        status.className = 'rec-status';
        const tema = getTema(temaSelectedId);
        try{
          const fileName = `${niveau}_${slug(student.prenom)}-${slug(student.nom)}_THEME-${slug(tema.titre_fr)}_${Date.now()}.${ext}`;
          const b64 = await blobToBase64(blob);
          const result = await callDriveScript({ action:'upload', fileName, mimeType: blob.type || 'audio/webm', base64: b64 });
          if(!result || !result.ok) throw new Error(result && result.error || 'échec Drive');
          await temaSaveField('eo', {done:true, driveUrl: result.viewUrl, driveFileId: result.fileId});
          try{
            await db.collection('enregistrements').add({
              uid: student.uid, prenom: student.prenom, nom: student.nom, email: student.email, telephone: student.telephone,
              niveau: niveau, dossier: "Thème de la semaine",
              semaine: tema.titre_fr, jour: "Expression orale", activite: tema.titre_fr,
              driveUrl: result.viewUrl, driveFileId: result.fileId,
              type: 'tema', temaId: tema.id,
              ts: firebase.firestore.FieldValue.serverTimestamp()
            });
          }catch(e2){ /* non bloquant */ }
          status.textContent = '✅ Enregistrement envoyé à ta professeure.'; status.className = 'rec-status ok';
          renderTemaStatusBar();
        }catch(e){
          status.textContent = "⚠ Échec de l'envoi — utilise la copie locale ci-dessus.";
          status.className = 'rec-status bad';
        }
      };
      mr.start();
      let seconds = 0;
      const timeEl = document.getElementById('time-'+uid);
      const timer = setInterval(()=>{
        seconds++;
        const m = String(Math.floor(seconds/60)).padStart(2,'0');
        const s = String(seconds%60).padStart(2,'0');
        timeEl.textContent = `${m}:${s}`;
      }, 1000);
      temaRecorders[uid] = {mr, active:true, timer};
      btn.textContent = '■ Arrêter';
      btn.classList.add('recording');
      status.textContent = 'Enregistrement en cours…';
      status.className = 'rec-status';
    }catch(err){
      status.textContent = "Micro non disponible : autorise l'accès au micro dans ton navigateur.";
      status.className = 'rec-status bad';
    }
  } else {
    temaRecorders[uid].mr.stop();
    temaRecorders[uid].active = false;
    btn.textContent = '● Enregistrer';
    btn.classList.remove('recording');
  }
}

function temaAllDone(temaId){
  const id = temaId || temaSelectedId;
  const t = (student.temas && student.temas[id]) || {};
  return !!(t.co && t.co.done && t.ce && t.ce.done && t.ee && t.ee.done && t.eo && t.eo.done);
}
function renderTemaStatusBar(){
  const bar = document.getElementById('tema-status-bar');
  if(!bar) return;
  const t = (student.temas && student.temas[temaSelectedId]) || {};
  const items = [
    {k:'co', label:'Compréhension orale'},
    {k:'ce', label:'Compréhension écrite'},
    {k:'ee', label:'Expression écrite'},
    {k:'eo', label:'Expression orale'},
  ];
  bar.innerHTML = items.map(it=>{
    const done = t[it.k] && t[it.k].done;
    return `<span class="tema-chip ${done?'done':''}">${done?'✅':'⬜'} ${it.label}</span>`;
  }).join('');
  const certZone = document.getElementById('tema-cert-zone');
  if(certZone){
    certZone.innerHTML = temaAllDone() ? certificateBlockHTML() : `
      <div class="tema-cert-locked">
        <p>🔒 Ton certificat souvenir se débloque quand tu as terminé les 4 activités du thème.</p>
        <p class="pt">🇧🇷 Seu certificado de lembrança é desbloqueado quando você terminar as 4 atividades do tema.</p>
      </div>`;
  }
}
function certificateBlockHTML(){
  const tema = getTema(temaSelectedId);
  const t = (student.temas && student.temas[temaSelectedId]) || {};
  const grade = t.review;
  return `
    <div class="tema-cert-unlocked">
      <p>🎉 Bravo, tu as terminé le thème « ${tema.titre_fr} » !</p>
      <p class="pt">🇧🇷 Parabéns, você terminou o tema "${tema.titre_fr}"!</p>
      ${grade && typeof grade.note !== 'undefined' && grade.note !== null ? `<p class="tema-grade">📝 Note de ta professeure : <b>${grade.note}</b>${grade.comment ? ' — ' + grade.comment : ''}</p>` : ''}
      <button class="primary-btn" style="width:auto; padding:12px 22px;" onclick="downloadCertificate()">🏆 Télécharger mon certificat</button>
    </div>
  `;
}
function downloadCertificate(){
  const tema = getTema(temaSelectedId);
  const cv = document.createElement('canvas');
  cv.width = 1200; cv.height = 850;
  const ctx = cv.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,1200,850);
  grad.addColorStop(0,'#182a6b'); grad.addColorStop(1,'#0f1c4d');
  ctx.fillStyle = grad; ctx.fillRect(0,0,1200,850);
  ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 6;
  ctx.strokeRect(30,30,1140,790);
  ctx.strokeStyle = 'rgba(255,183,3,.5)'; ctx.lineWidth = 2;
  ctx.strokeRect(46,46,1108,758);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe08a';
  ctx.font = '600 20px Georgia, serif';
  ctx.fillText('CERTIFICAT DE RÉUSSITE — FLE', 600, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 46px Georgia, serif';
  ctx.fillText(tema.titre_fr, 600, 235);
  ctx.font = '20px Georgia, serif';
  ctx.fillStyle = '#c9d3e6';
  ctx.fillText(tema.periode, 600, 280);
  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = '#dbe3f2';
  ctx.fillText('décerné à', 600, 360);
  ctx.font = '700 46px Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${student.prenom} ${student.nom}`, 600, 425);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#c9d3e6';
  ctx.fillText(`Niveau ${niveau} — a terminé les 4 activités de la semaine`, 600, 470);
  ctx.fillText('(compréhension orale, compréhension écrite, expression écrite, expression orale)', 600, 498);
  const t = (student.temas && student.temas[temaSelectedId]) || {};
  if(t.review && typeof t.review.note !== 'undefined' && t.review.note !== null){
    ctx.font = '700 26px Georgia, serif';
    ctx.fillStyle = '#ffb703';
    ctx.fillText(`Note : ${t.review.note}`, 600, 560);
  }
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillStyle = '#a9b6d2';
  ctx.fillText(`Prof Melissa Radde · FLE · ${new Date().toLocaleDateString('fr-FR')}`, 600, 760);
  const link = document.createElement('a');
  link.download = `certificat_${slug(student.prenom)}-${slug(student.nom)}_${slug(tema.titre_fr)}.png`;
  link.href = cv.toDataURL('image/png');
  link.click();
}

function goTemaWeek(id){
  temaSelectedId = id;
  renderTemas();
}

function renderTemas(){
  const c = document.getElementById('content');
  if(!temaSelectedId){ temaSelectedId = temaMostRecentVisibleId(); }
  // Si l'id sélectionné correspond à un thème pas encore publié (ex: ancien lien, ou
  // date système qui a reculé), on retombe sur le dernier thème visible.
  if(!temaEstVisibleEleve(getTema(temaSelectedId))){ temaSelectedId = temaMostRecentVisibleId(); }
  const tema = getTema(temaSelectedId);
  const effNiveau = temaNiveauEffectif();
  const data = tema.niveaux[effNiveau];
  student.temas = student.temas || {};

  // Sélecteur de semaines — plus récent en premier (seulement les thèmes déjà publiés)
  const weeksHTML = [...temasSemanasVisiveisEleve()].reverse().map(t=>{
    const done = temaAllDone(t.id);
    const active = t.id === temaSelectedId;
    return `<button class="tema-week-tab ${active?'active':''}" onclick="goTemaWeek('${t.id}')">
      ${done ? '✅ ' : ''}${t.titre_fr}<span class="tema-week-tab-date">${t.periode}</span>
    </button>`;
  }).join('');

  c.innerHTML = `
    <div class="week-footer" style="margin-top:0; margin-bottom:18px;"><button onclick="goDossiers()">← Retour aux dossiers</button><div></div></div>
    <div class="tema-header">
      <p class="tema-period">📅 ${tema.periode}</p>
      <h1>🍅 ${tema.titre_fr}</h1>
      <p class="tema-sub">${tema.sub_fr} · 🇧🇷 ${tema.titre_pt} — ${tema.sub_pt}</p>
    </div>
    <div class="tema-week-tabs">${weeksHTML}</div>
    <p class="section-label" style="margin:0 0 6px; font-size:12.5px; text-transform:none; letter-spacing:0; font-weight:600; color:var(--ink);">Niveau ${effNiveau} (attribué par ta professeure) · ⏱️ Durée totale estimée : ${data.duree}</p>
    <div class="tema-status-bar" id="tema-status-bar"></div>
    <div id="tema-cert-zone" style="margin-bottom:20px;"></div>
    <div class="tema-skill-grid" id="tema-skill-grid"></div>
  `;

  const grid = document.getElementById('tema-skill-grid');

  // Compréhension orale
  const coUid = `tema_${tema.id}_${effNiveau}_co`;
  const co = data.co;
  let coMedia = '';
  if(co.media && co.media.type==='video'){
    coMedia = `<div class="media-block"><p class="section-label">▶ Regarder / Écouter — Assistir / Ouvir</p><iframe src="https://www.youtube.com/embed/${co.media.id}" loading="lazy" allowfullscreen></iframe><p class="source-link" style="margin-top:4px;">🎵 ${co.media.label}</p></div>`;
  }
  grid.innerHTML += `
    <div class="tema-skill-card">
      <div class="tema-skill-top"><span class="tema-skill-icon">🎧</span><h3 class="tema-skill-name">${co.titre_fr}</h3><span class="tema-skill-dur">${co.dur}</span></div>
      <p class="tema-skill-name-pt">🇧🇷 ${co.titre_pt}</p>
      <p class="tema-consigne">${co.consigne_fr}</p>
      <p class="tema-consigne-pt">🇧🇷 ${co.consigne_pt}</p>
      ${coMedia}
      ${temaExoHTML(co.exo, coUid, 'co')}
      ${temaExoListHTML(co.exos, coUid, 'co')}
    </div>
  `;

  // Compréhension écrite
  const ceUid = `tema_${tema.id}_${effNiveau}_ce`;
  const ce = data.ce;
  const ceLink = ce.link ? `<a class="source-link" href="${ce.link.url}" target="_blank" rel="noopener">🔗 ${ce.link.label}</a>` : '';
  grid.innerHTML += `
    <div class="tema-skill-card">
      <div class="tema-skill-top"><span class="tema-skill-icon">📖</span><h3 class="tema-skill-name">${ce.titre_fr}</h3><span class="tema-skill-dur">${ce.dur}</span></div>
      <p class="tema-skill-name-pt">🇧🇷 ${ce.titre_pt}</p>
      <div class="media-block" style="background:var(--cream); border-radius:8px; padding:14px 16px; margin:8px 0;">
        <p style="margin:0; font-size:14.5px; line-height:1.6;">${ce.texte_fr}</p>
      </div>
      ${ceLink}
      ${temaExoHTML(ce.exo, ceUid, 'ce')}
      ${temaExoListHTML(ce.exos, ceUid, 'ce')}
    </div>
  `;

  // Expression écrite
  const eeUid = `tema_${tema.id}_${effNiveau}_ee`;
  const ee = data.ee;
  const savedEE = (student.temas[tema.id] && student.temas[tema.id].ee && student.temas[tema.id].ee.text) || '';
  grid.innerHTML += `
    <div class="tema-skill-card">
      <div class="tema-skill-top"><span class="tema-skill-icon">✍️</span><h3 class="tema-skill-name">${ee.titre_fr}</h3><span class="tema-skill-dur">${ee.dur}</span></div>
      <p class="tema-skill-name-pt">🇧🇷 ${ee.titre_pt}</p>
      <p class="tema-consigne">${ee.consigne_fr}</p>
      <p class="tema-consigne-pt">🇧🇷 ${ee.consigne_pt}</p>
      <textarea class="ee-textarea" id="${eeUid}" placeholder="Écris ta réponse ici... / Escreva sua resposta aqui...">${savedEE}</textarea>
      <div style="display:flex; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap;">
        <button class="rec-btn" onclick="temaSaveEE('${eeUid}')">📤 Envoyer à ma professeure</button>
        <p class="ee-note" id="eestatus-${eeUid}" style="margin:0;">${savedEE ? '✅ Déjà envoyé — tu peux le modifier et renvoyer.' : ''}</p>
      </div>
    </div>
  `;

  // Expression orale
  const eoUid = `tema_${tema.id}_${effNiveau}_eo`;
  const eo = data.eo;
  const savedEO = student.temas[tema.id] && student.temas[tema.id].eo;
  grid.innerHTML += `
    <div class="tema-skill-card">
      <div class="tema-skill-top"><span class="tema-skill-icon">🗣️</span><h3 class="tema-skill-name">${eo.titre_fr}</h3><span class="tema-skill-dur">${eo.dur}</span></div>
      <p class="tema-skill-name-pt">🇧🇷 ${eo.titre_pt}</p>
      <div class="rec-box">
        <p class="rec-consigne">${eo.consigne_fr}</p>
        <p class="rec-consigne-pt">🇧🇷 ${eo.consigne_pt}</p>
        <div class="rec-controls">
          <button class="rec-btn" id="btn-${eoUid}" onclick="temaToggleRec('${eoUid}')">● Enregistrer</button>
          <span class="rec-time" id="time-${eoUid}">00:00</span>
        </div>
        <div id="player-${eoUid}">${savedEO && savedEO.driveUrl ? `<audio class="rec-audio" controls src="${savedEO.driveUrl}"></audio>` : ''}</div>
        <p class="rec-status ${savedEO && savedEO.done ? 'ok' : ''}" id="status-${eoUid}">${savedEO && savedEO.done ? '✅ Déjà envoyé à ta professeure.' : "Ton enregistrement sera envoyé automatiquement à ta professeure."}</p>
      </div>
    </div>
  `;

  renderTemaStatusBar();
}

/* ---- Onglet professeure : Thème de la semaine ---- */
let openTemaReviewId = null;
/* Version robuste : si le chargement des élèves échoue, l'erreur s'affiche
   au lieu de laisser l'onglet bloqué sur « Chargement… ». */
async function loadTeacherTemas(){
  const body = document.getElementById('teacher-body');
  try{
    if(!teacherTemaSelectedId){ teacherTemaSelectedId = temaMostRecentId(); }
    if(studentsData.length===0){ await loadTeacherStudents(); }
    renderTeacherTemas();
  }catch(e){
    console.error('Thème de la semaine :', e);
    if(body) body.innerHTML = `<p class="teacher-empty">⚠️ Erreur de chargement : ${e.message}</p>`;
  }
}
function setTeacherTemaWeek(id){
  teacherTemaSelectedId = id;
  openTemaReviewId = null;
  renderTeacherTemas();
}
function toggleTemaReview(id){
  openTemaReviewId = (openTemaReviewId === id) ? null : id;
  renderTeacherTemas();
}
function temaReviewEditorHTML(s){
  const t = (s.temas && s.temas[teacherTemaSelectedId]) || {};
  const review = t.review || {};
  const ee = t.ee || {};
  const eo = t.eo || {};
  return `<div class="rec-box" style="margin-top:10px;">
    <p class="rec-consigne" style="font-weight:700;">🍅 ${getTema(teacherTemaSelectedId).titre_fr} — ${s.prenom} ${s.nom} · Niveau ${s.niveau || '—'}</p>
    <p style="font-size:13px; margin:6px 0;"><b>Compréhension orale :</b> ${t.co && t.co.done ? (t.co.correct ? '✅ Correct' : '⚠️ Répondu, mais faux') : '⬜ Pas encore fait'}</p>
    <p style="font-size:13px; margin:6px 0;"><b>Compréhension écrite :</b> ${t.ce && t.ce.done ? (t.ce.correct ? '✅ Correct' : '⚠️ Répondu, mais faux') : '⬜ Pas encore fait'}</p>
    <p style="font-size:13px; margin:10px 0 4px;"><b>Expression écrite :</b></p>
    ${ee.text ? `<div style="background:var(--cream); border-radius:8px; padding:10px 12px; font-size:13.5px; white-space:pre-wrap;">${ee.text}</div>${ee.driveUrl ? `<a class="source-link" href="${ee.driveUrl}" target="_blank" rel="noopener">🔗 Ouvrir le fichier sur le Drive</a>` : ''}` : '<p style="font-size:13px; color:var(--grey);">⬜ Pas encore envoyé.</p>'}
    <p style="font-size:13px; margin:10px 0 4px;"><b>Expression orale :</b></p>
    ${eo.driveUrl ? `<audio class="rec-audio" controls src="${eo.driveUrl}"></audio>` : '<p style="font-size:13px; color:var(--grey);">⬜ Pas encore envoyé.</p>'}
    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; align-items:center;">
      <label style="font-size:12.5px; font-weight:700; color:var(--navy);">Note
        <input type="text" id="temanote-${s.id}" value="${review.note != null ? review.note : ''}" placeholder="ex: 8/10" style="width:80px; margin-left:6px; padding:6px 8px; border:1px solid var(--line); border-radius:6px; font-size:13px;">
      </label>
    </div>
    <textarea id="temacomment-${s.id}" placeholder="Commentaire pour l'élève (optionnel)" style="width:100%; min-height:60px; margin-top:8px; padding:8px; border:1px solid var(--line); border-radius:7px; font-family:'Inter',sans-serif; font-size:13.5px;">${review.comment || ''}</textarea>
    <div class="teacher-entry-actions" style="margin-top:8px;">
      <button onclick="saveTemaReview('${s.id}')">Enregistrer la note</button>
      <button onclick="toggleTemaReview('${s.id}')" style="background:none; color:var(--grey);">Fermer</button>
    </div>
  </div>`;
}
async function saveTemaReview(id){
  const noteVal = document.getElementById(`temanote-${id}`).value.trim();
  const comment = document.getElementById(`temacomment-${id}`).value.trim();
  try{
    await db.collection('eleves').doc(id).update({
      [`temas.${teacherTemaSelectedId}.review`]: { note: noteVal || null, comment, ts: new Date().toISOString() }
    });
    openTemaReviewId = null;
  }catch(e){ alert("Impossible d'enregistrer la note pour le moment."); }
  await loadTeacherStudents();
  renderTeacherTemas();
}
function renderTeacherTemas(){
  const body = document.getElementById('teacher-body');
  if(!body) return;
  if(!teacherTemaSelectedId){ teacherTemaSelectedId = temaMostRecentId(); }
  const tema = getTema(teacherTemaSelectedId);
  const weeksHTML = [...temasSemanas].reverse().map(t=>{
    const active = t.id === teacherTemaSelectedId;
    return `<button class="tema-week-tab ${active?'active':''}" onclick="setTeacherTemaWeek('${t.id}')">
      ${t.titre_fr}<span class="tema-week-tab-date">${t.periode}</span>
    </button>`;
  }).join('');
  if(studentsData.length===0){
    body.innerHTML = `<div class="tema-week-tabs">${weeksHTML}</div><p class="teacher-empty">Aucun élève inscrit pour le moment.</p>`;
    return;
  }
  body.innerHTML = `<div class="tema-week-tabs">${weeksHTML}</div>
    <div class="storage-note">🍅 Thème affiché : <b>${tema.titre_fr}</b> (${tema.periode}). Le niveau utilisé pour chaque élève est celui attribué dans l'onglet « Élèves & niveaux ».</div>` +
    studentsData.map(s=>{
      const t = (s.temas && s.temas[teacherTemaSelectedId]) || {};
      const doneCount = ['co','ce','ee','eo'].filter(k=> t[k] && t[k].done).length;
      const allDone = doneCount===4;
      const review = t.review;
      return `<div class="teacher-entry">
        <div class="who">${s.prenom} ${s.nom} ${s.niveau ? '· <span style="color:var(--ok)">Niveau '+s.niveau+'</span>' : '· <span style="color:var(--bad)">non attribué</span>'}</div>
        <div class="meta">Progression thème : <b style="color:${allDone?'var(--ok)':'var(--navy)'}">${doneCount}/4</b> ${allDone ? '· 🏆 certificat débloqué' : ''} ${review && review.note != null ? `· 📝 Note donnée : <b>${review.note}</b>` : ''}</div>
        <div class="teacher-entry-actions">
          <button onclick="toggleTemaReview('${s.id}')">${openTemaReviewId===s.id ? 'Fermer' : '👁️ Voir & noter'}</button>
        </div>
        ${openTemaReviewId === s.id ? temaReviewEditorHTML(s) : ''}
      </div>`;
    }).join('');
}
