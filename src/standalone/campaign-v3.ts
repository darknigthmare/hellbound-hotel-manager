// Narrative-only runtime projection of docs/standalone/campaign-design-v3.json.
// Parity is checked by standalone-narrative.test.ts; move/illustration proposals are not runtime assets.
import type { StoryRoute } from './campaign';

export const V3_STORY_ROUTES = {
  "charlie": {
    "title": "Une chambre, un choix",
    "premise": "Une journée de portes ouvertes est détournée en démonstration de force ; Charlie doit en reprendre le sens.",
    "motivation": "Obtenir une chance réelle pour les résidents, sans les réduire à des exemples publicitaires.",
    "stakes": "La confiance de l’équipe et le droit des invités à refuser le spectacle.",
    "intro": "Charlie prépare une chambre pour un visiteur qui ne croit pas à l’hôtel. Une campagne hostile transforme son invitation en défi public. Pour protéger l’accueil, elle accepte des duels limités, puis découvre que gagner ne suffira pas à convaincre.",
    "chapters": [
      {
        "title": "Apprendre à tenir la porte",
        "opponent": "vaggie",
        "stage": "hotel-lobby",
        "scene": "Vaggie transforme la répétition de l’accueil en exercice de protection du seuil.",
        "dramaticPurpose": "Ancrer la retenue et montrer que protéger précède convaincre.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-cast"
        ]
      },
      {
        "title": "La promesse découpée",
        "opponent": "velvette",
        "stage": "vee-broadcast-studio",
        "scene": "Velvette propose de réduire le projet à une image de victoire ; Charlie refuse cette condition.",
        "dramaticPurpose": "Faire payer le choix d’une parole honnête plutôt que d’une audience immédiate.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Le droit d’essayer",
        "opponent": "adam",
        "stage": "heaven-embassy",
        "scene": "Une confrontation d’archives oppose l’argument de Charlie au refus d’Adam.",
        "dramaticPurpose": "Clore le débat par une limite posée à la violence, sans prouver une ascension.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      }
    ],
    "rival": {
      "fighterId": "adam",
      "canonRelationship": "Adam est l’interlocuteur antagoniste de Charlie dans la confrontation avec le Paradis en S1.",
      "dramaticReason": "Il met à l’épreuve sa conviction qu’une personne ne se résume pas à sa condamnation.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-s1"
      ]
    },
    "ending": "Charlie laisse la clé à portée du visiteur et se retire pour qu’il puisse choisir. L’équipe rouvre la porte malgré la mauvaise couverture médiatique. L’image finale montre une place libre, pas une âme transformée.",
    "nextHook": "Le visiteur reviendra-t-il de lui-même lorsque personne ne filme ?",
    "continuity": {
      "scope": "custom",
      "incarnation": "Charlie, modèle série S1 ; tenue de combat seulement dans le duel final.",
      "spoilerTier": "season_1",
      "guardrails": [
        "La rédemption reste un choix et un processus, jamais une récompense automatique de victoire.",
        "Ne pas donner à Charlie un pouvoir de purifier ou de posséder les âmes.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "vaggie": {
    "title": "Le seuil que je choisis",
    "premise": "Une fausse alerte oblige Vaggie à choisir entre poursuivre un agresseur et garder l’hôtel ouvert.",
    "motivation": "Se définir par ceux qu’elle protège plutôt que par l’ordre qu’elle a quitté.",
    "stakes": "L’évacuation des résidents et sa capacité à faire confiance aux autres.",
    "intro": "Vaggie repère une brèche dans la défense du hall et veut tout verrouiller. Charlie lui demande de préserver un passage pour les invités. Une provocation liée à son passé lui offre une cible facile, mais éloignée de ceux qui comptent.",
    "chapters": [
      {
        "title": "La portée juste",
        "opponent": "carmilla",
        "stage": "carmine-industries",
        "scene": "Carmilla impose un exercice où reculer vers la sortie des civils vaut mieux qu’une poursuite.",
        "dramaticPurpose": "Transformer la maîtrise de l’arme en décision de protection.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-carmilla"
        ]
      },
      {
        "title": "Une aide qui déborde",
        "opponent": "alastor",
        "stage": "hotel-exterior",
        "scene": "Alastor propose une défense spectaculaire qui envahit l’espace d’accueil.",
        "dramaticPurpose": "Faire affirmer à Vaggie une limite à un allié puissant.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-cast"
        ]
      },
      {
        "title": "Au-delà de l’ancien ordre",
        "opponent": "lute",
        "stage": "heaven-embassy",
        "scene": "Lute provoque Vaggie dans une reconstitution de conflit personnel ; Vaggie maintient la ligne de sortie.",
        "dramaticPurpose": "Choisir la sécurité de l’hôtel malgré la possibilité d’une vengeance.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "lute",
      "canonRelationship": "Le registre existant relie Vaggie et Lute à la force d’extermination ; les détails précis de leur passé exigent un contrôle direct S1E06–E08 avant dialogue canonique.",
      "dramaticReason": "Lute personnifie l’ancienne discipline ; le duel proposé teste le choix actuel de Vaggie.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-carmilla",
        "hh-i-project"
      ]
    },
    "ending": "Vaggie pose sa lance près de l’entrée au lieu de fermer la porte. Les résidents réparent la brèche avec elle, preuve que la défense n’a plus à reposer sur une seule personne. Charlie vient prendre le prochain tour de garde.",
    "nextHook": "La prochaine alerte sera confiée à quelqu’un d’autre : Vaggie saura-t-elle réellement se reposer ?",
    "continuity": {
      "scope": "custom",
      "incarnation": "Vaggie série S1E07–E08 ; œil et ailes conformes à cette incarnation.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Conserver l’asymétrie du visage et l’état des ailes du modèle choisi.",
        "Ne pas transformer sa relation avec Charlie en obéissance magique.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "angeldust": {
    "title": "Le contrat ne raconte pas tout",
    "premise": "Angel veut terminer une journée à l’hôtel sans laisser quelqu’un d’autre décider de chacune de ses heures.",
    "motivation": "Faire respecter une limite concrète et garder le soutien de ses amis.",
    "stakes": "Un rendez-vous promis à l’équipe et la possibilité de demander de l’aide sans perdre la face.",
    "intro": "Angel promet d’être là pour le repas du soir, puis reçoit une nouvelle injonction professionnelle. Il masque son inquiétude par une plaisanterie, mais Husk la remarque. La campagne suit une limite modeste, choisir de rentrer, plutôt qu’une libération miraculeuse.",
    "chapters": [
      {
        "title": "Sans numéro de bravoure",
        "opponent": "husk",
        "stage": "hotel-bar",
        "scene": "Husk lui propose une répétition de combat où arrêter une série au bon moment est l’objectif.",
        "dramaticPurpose": "Faire reconnaître la fatigue et la possibilité d’un appui.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-husk-angel"
        ]
      },
      {
        "title": "Rentrer ensemble",
        "opponent": "cherribomb",
        "stage": "pentagram-rooftops",
        "scene": "Une dispute amicale éclate sur le meilleur moyen de répondre à la pression ; Angel refuse une escalade.",
        "dramaticPurpose": "Distinguer loyauté et fuite en avant.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "La limite du plateau",
        "opponent": "valentino",
        "stage": "vee-broadcast-studio",
        "scene": "Angel affronte l’obstacle qui l’empêche de quitter un plateau de simulation.",
        "dramaticPurpose": "Rendre tangible un refus sans prétendre annuler le contrat.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1",
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "valentino",
      "canonRelationship": "Le projet retient Valentino comme employeur abusif d’Angel ; le synopsis officiel S1E04 confirme le conflit avec son patron sans détailler toutes les clauses.",
      "dramaticReason": "Le rival oppose une logique de possession à une décision quotidienne d’Angel.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-s1",
        "hh-i-husk-angel",
        "hh-i-project"
      ]
    },
    "ending": "Angel revient tard, mais la table l’attend. Il pose son téléphone face contre table et explique ce dont il a besoin pour la prochaine journée. Le contrat n’est pas effacé ; la victoire est un choix tenu et une demande d’aide entendue.",
    "nextHook": "Husk lui propose de préparer ensemble la prochaine limite, hors caméra.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Angel Dust série S1, tenue principale ; aucune variante sexualisée imposée.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Le contrat et ses contraintes ne disparaissent pas par une victoire d’arène.",
        "Ne pas mettre en scène l’exploitation comme une récompense ou un gag érotique.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "alastor": {
    "title": "Fréquence propriétaire",
    "premise": "Un relais médiatique détourne la voix d’Alastor ; il veut reprendre la maîtrise de son spectacle.",
    "motivation": "Rester celui qui choisit le cadre et la dernière parole.",
    "stakes": "Son prestige, sans prétendre que l’hôtel lui appartient.",
    "intro": "Un poste placé dans le hall rediffuse une émission coupée en morceaux. Alastor sourit, mais refuse que sa présence serve la publicité d’un autre. Il transforme la recherche du relais en promenade soigneusement mise en scène.",
    "chapters": [
      {
        "title": "Le relais bricolé",
        "opponent": "sirpentious",
        "stage": "pentious-workshop",
        "scene": "Une invention d’archives reproduit accidentellement le signal ; Alastor exige qu’on l’arrête.",
        "dramaticPurpose": "Identifier l’erreur technique avant de découvrir la récupération médiatique.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Deux maîtres de cérémonie",
        "opponent": "lucifer",
        "stage": "hotel-lobby",
        "scene": "Lucifer refuse que la réparation du hall devienne le triomphe d’Alastor.",
        "dramaticPurpose": "Montrer que l’influence sur Charlie n’est pas une propriété.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "L’antenne n’appartient à personne",
        "opponent": "vox",
        "stage": "vee-broadcast-studio",
        "scene": "Vox tente de cadrer le duel pour en faire une victoire d’audience.",
        "dramaticPurpose": "Opposer deux formes de domination du récit.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      }
    ],
    "rival": {
      "fighterId": "vox",
      "canonRelationship": "La rivalité de diffusion entre le retour d’Alastor et les Vees est explicitement annoncée dans S1E02.",
      "dramaticReason": "Vox est celui qui pourrait rendre Alastor dépendant d’un écran et d’un montage.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-s1",
        "hh-i-overlords",
        "hh-i-project"
      ]
    },
    "ending": "Le relais se tait et Alastor ramène le poste au hall, parfaitement réglé. Un voyant muet demeure dans le fond du boîtier : il a gagné cette émission, pas le contrôle de toute la ville. Son sourire rend l’issue volontairement ambiguë.",
    "nextHook": "Quelqu’un d’autre a conservé une copie de la bande.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Alastor série S1, avant les changements contractuels éventuels de S2.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Ne pas présenter ses liens contractuels de S2 comme connus dans cette campagne d’archives S1.",
        "Aucune victoire n’acquiert automatiquement l’âme du vaincu.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "husk": {
    "title": "La dernière mise",
    "premise": "Une dette imaginaire de l’arène tente de ramener Husk à la logique du pari ; il choisit de fermer la table.",
    "motivation": "Arrêter de risquer l’avenir d’un autre pour prouver qu’il peut encore gagner.",
    "stakes": "Le bar comme lieu de confiance plutôt que comme table de jeu.",
    "intro": "Husk trouve une table de cartes installée à la place de son comptoir. On lui promet une victoire assez grande pour régler tous les comptes. Il reconnaît le piège et commence par empêcher Angel d’en payer le prix.",
    "chapters": [
      {
        "title": "Ne pas suivre la mise",
        "opponent": "angeldust",
        "stage": "hotel-bar",
        "scene": "Angel veut l’aider à gagner ; Husk lui propose un duel d’entraînement dont on peut annoncer la fin.",
        "dramaticPurpose": "Dissocier soutien et surenchère.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-husk-angel"
        ]
      },
      {
        "title": "La sortie vaut plus",
        "opponent": "valentino",
        "stage": "vee-broadcast-studio",
        "scene": "Husk ouvre un passage dans un plateau qui retient la soirée d’Angel.",
        "dramaticPurpose": "Le faire agir pour quelqu’un sans jouer son sauveur tout-puissant.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Refuser la table",
        "opponent": "alastor",
        "stage": "hotel-lobby",
        "scene": "Alastor offre une dernière manche aux règles avantageuses en apparence.",
        "dramaticPurpose": "Gagner le droit d’arrêter dans la fiction AU, pas une libération juridique.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "alastor",
      "canonRelationship": "Le registre de production associe Husk à Alastor, mais les clauses et l’état précis du lien ne sont pas réécrits ici.",
      "dramaticReason": "Alastor propose la tentation d’une issue spectaculaire là où Husk doit poser une limite sobre.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-husk-angel",
        "hh-i-project"
      ]
    },
    "ending": "Husk range les cartes et remet le comptoir à sa place. Il garde une chaise pour Angel, puis finit sa tâche sans lancer un nouveau pari. Ses difficultés demeurent, mais ce soir aucune autre personne n’a été mise sur la table.",
    "nextHook": "La prochaine fois qu’il perdra, il devra demander du soutien sans transformer cela en dette.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Husk série S1 ; tenue de barman, sans retour automatique à un rang antérieur.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Une victoire contre Alastor ne rompt aucun lien contractuel.",
        "Ne pas présenter l’alcool comme un bonus de soin ou la solution à sa détresse.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "niffty": {
    "title": "Service de nuit",
    "premise": "Une inspection du hall devient une chasse aux dangers que les autres ont laissés derrière eux.",
    "motivation": "Finir sa tâche et obtenir que l’équipe prenne ses avertissements au sérieux.",
    "stakes": "Un couloir praticable pour les résidents ; la propreté devient un gag concret, pas une morale.",
    "intro": "Niffty trouve une traînée de débris qui traverse les zones censées être sûres. Les grands personnages parlent stratégie au-dessus de sa tête. Elle suit les petits indices jusqu’à une menace que personne ne surveille.",
    "chapters": [
      {
        "title": "Après la fête",
        "opponent": "cherribomb",
        "stage": "hotel-bar",
        "scene": "Niffty veut dégager les tessons avant une nouvelle démonstration explosive.",
        "dramaticPurpose": "Installer la précision de ses objectifs contre le désordre.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Le câble de trop",
        "opponent": "hz_tom_trench",
        "stage": "hotel-lobby",
        "scene": "Un reportage de simulation laisse ses câbles dans le passage ; Niffty récupère le chemin.",
        "dramaticPurpose": "Transformer un obstacle banal en enquête visuelle.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "L’angle oublié",
        "opponent": "adam",
        "stage": "hotel-exterior",
        "scene": "Une scène d’archives place Adam dans un angle que les grands combattants ont négligé.",
        "dramaticPurpose": "Faire payer le mépris de sa petite taille sans réécrire le final.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-niffty-adam"
        ]
      }
    ],
    "rival": {
      "fighterId": "adam",
      "canonRelationship": "Le clip officiel du final relie Niffty à la chute d’Adam.",
      "dramaticReason": "Il ne regarde pas le danger à sa propre hauteur ; Niffty s’y trouve déjà.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-niffty-adam",
        "hh-i-project"
      ]
    },
    "ending": "Le couloir est enfin libre et Niffty plante un minuscule panneau de travail, sans texte lisible. L’équipe constate que la voie d’évacuation était son véritable chantier. Elle aperçoit aussitôt une nouvelle tache et abandonne la cérémonie de remerciement.",
    "nextHook": "Une tache qui revient au même endroit suggère un autre petit problème du bâtiment.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Niffty série S1 ; modèle de petite taille à œil unique.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Le lien d’âme avec Alastor reste non confirmé.",
        "Sa victoire contre Adam ne lui confère pas une capacité universelle à tuer tout être.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "sirpentious": {
    "title": "Une machine pour rester",
    "premise": "Un dispositif conçu pour impressionner l’hôtel doit être reconverti en outil d’évacuation.",
    "motivation": "Être utile à une équipe plutôt que gagner l’admiration d’un public.",
    "stakes": "Le bon fonctionnement d’une sortie pendant une alerte de simulation.",
    "intro": "Pentious présente une machine dont personne n’a demandé la puissance. Une panne ferme le passage qu’elle devait protéger. Il doit accepter les critiques de ses alliés avant de lui trouver une fonction qui aide réellement.",
    "chapters": [
      {
        "title": "La démonstration ratée",
        "opponent": "cherribomb",
        "stage": "pentious-workshop",
        "scene": "Cherri teste la solidité du montage et expose son manque de contrôle.",
        "dramaticPurpose": "Faire de l’échec technique le départ de l’arc.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "La confiance ne se câble pas",
        "opponent": "angeldust",
        "stage": "hotel-lobby",
        "scene": "Angel teste le passage après la réparation et refuse d’être traité comme cobaye.",
        "dramaticPurpose": "Obtenir un consentement concret au lieu d’une approbation générale.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Le temps gagné",
        "opponent": "adam",
        "stage": "hotel-exterior",
        "scene": "Le duel d’archives représente le temps nécessaire à une évacuation.",
        "dramaticPurpose": "Donner un but collectif à sa machine, sans prétendre modifier le sacrifice canonique.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1",
          "hh-i-s2"
        ]
      }
    ],
    "rival": {
      "fighterId": "adam",
      "canonRelationship": "La confrontation Enfer–Paradis appartient au final S1 ; ce duel précis et son dispositif sont AU.",
      "dramaticReason": "Adam incarne l’épreuve qui rend la puissance individuelle insuffisante.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-s2",
        "hh-i-project"
      ]
    },
    "ending": "La machine reste cabossée, mais le couloir est ouvert et les autres sont passés. Pentious inscrit mentalement une amélioration au lieu de revendiquer un triomphe. Un carton d’archives de l’interface, hors illustration, rappelle séparément son destin canonique au Paradis.",
    "nextHook": "Un ancien plan pose la question de ce qui mérite d’être conservé après lui.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Pentious pécheur de S1 pour les combats ; ne pas mélanger avec son incarnation céleste.",
      "spoilerTier": "season_1",
      "guardrails": [
        "La rédemption de Pentious est un événement canonique ; cette route d’archives ne la déclenche pas à nouveau.",
        "Ne pas transposer ses machines de combat dans son modèle céleste sans référence.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "lucifer": {
    "title": "Laisser une place",
    "premise": "Lucifer veut résoudre en une soirée ce que Charlie construit jour après jour.",
    "motivation": "Apprendre à soutenir sa fille sans remplacer son projet par un numéro royal.",
    "stakes": "La confiance de Charlie et la capacité de l’hôtel à rester son œuvre.",
    "intro": "Lucifer arrive avec une solution spectaculaire et un décor déjà imaginé. Charlie lui demande seulement de tenir une porte pendant qu’elle travaille. L’attaque simulée le force à comprendre la différence entre être indispensable et être présent.",
    "chapters": [
      {
        "title": "Le meilleur numéro",
        "opponent": "alastor",
        "stage": "hotel-lobby",
        "scene": "Les deux hommes se disputent l’espace de scène et gênent le travail de l’hôtel.",
        "dramaticPurpose": "Montrer le coût concret de la rivalité d’ego.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Suivre le plan",
        "opponent": "vaggie",
        "stage": "hotel-exterior",
        "scene": "Vaggie impose à Lucifer de garder un secteur précis sans réorganiser toute la défense.",
        "dramaticPurpose": "Le faire accepter une compétence qui n’est pas la sienne.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-cast"
        ]
      },
      {
        "title": "Assez pour aujourd’hui",
        "opponent": "adam",
        "stage": "hotel-exterior",
        "scene": "Une confrontation d’archives oppose sa protection à l’agression d’Adam.",
        "dramaticPurpose": "Finir le combat au moment où le danger cesse.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-lucifer-adam"
        ]
      }
    ],
    "rival": {
      "fighterId": "adam",
      "canonRelationship": "Le combat Lucifer–Adam est identifié par un clip officiel du final S1.",
      "dramaticReason": "Adam offre à Lucifer l’excuse parfaite d’une démonstration sans limite ; sa retenue donne un sens à la victoire.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-lucifer-adam"
      ]
    },
    "ending": "Lucifer aide à replacer un meuble sans magie spectaculaire. Charlie choisit elle-même où le mettre et il écoute. Son cadeau final est une présence disponible, pas une nouvelle propriété sur l’hôtel.",
    "nextHook": "La prochaine invitation ne comportera aucune urgence à résoudre.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Lucifer série S1 ; ailes et transformations seulement après validation des références.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Son rôle de père ne lui donne pas le contrôle des décisions de Charlie.",
        "Ne pas déduire une omnipotence ou une capacité à annuler toute règle de l’Enfer.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "cherribomb": {
    "title": "Une explosion de moins",
    "premise": "Cherri veut faire taire une menace visant Angel, mais chaque raccourci risque de lui compliquer la vie.",
    "motivation": "Être une alliée sur laquelle compter quand il faut aussi savoir s’arrêter.",
    "stakes": "La sortie d’Angel et la sécurité de ceux qui se trouvent autour de la cible.",
    "intro": "Cherri a déjà choisi où poser sa charge lorsque Husk lui montre les gens derrière le mur. Elle accepte d’essayer une autre approche, convaincue qu’elle pourra toujours tout faire sauter ensuite. Une vieille rivalité d’atelier devient un exercice de précision.",
    "chapters": [
      {
        "title": "La charge utile",
        "opponent": "sirpentious",
        "stage": "pentious-workshop",
        "scene": "Dans une scène d’archives, Pentious lui demande de casser une pièce sans détruire l’ensemble.",
        "dramaticPurpose": "Introduire la précision comme défi personnel.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Rester pour aider",
        "opponent": "husk",
        "stage": "hotel-bar",
        "scene": "Husk refuse une expédition impulsive et teste sa capacité à laisser une sortie.",
        "dramaticPurpose": "Opposer deux formes d’aide à Angel.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-husk-angel"
        ]
      },
      {
        "title": "Ouvrir sans ensevelir",
        "opponent": "valentino",
        "stage": "vee-broadcast-studio",
        "scene": "Cherri dégage le passage d’un plateau de simulation au lieu d’attaquer ses occupants.",
        "dramaticPurpose": "Faire d’une explosion contrôlée une décision de loyauté.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "valentino",
      "canonRelationship": "La relation personnelle directe Cherri–Valentino n’est pas établie par les sources primaires consultées ; l’opposition de cette route est AU.",
      "dramaticReason": "Valentino bloque la sortie qu’elle veut rendre à son ami.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cherri-baxter",
        "hh-i-project"
      ]
    },
    "ending": "La porte tombe, le bâtiment tient et Angel choisit lui-même de la franchir. Cherri range la seconde bombe, encore intacte. Elle s’éloigne avec lui sans demander à être félicitée pour celle qu’elle n’a pas utilisée.",
    "nextHook": "Une conversation avec Baxter attend : casser un mur ne répond pas à tout ce qu’elle veut savoir de Pentious.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Cherri série Prime Video ; fidélité du modèle à revalider avant toute nouvelle base READY.",
      "spoilerTier": "season_2",
      "guardrails": [
        "Ne pas réutiliser automatiquement son modèle du pilote.",
        "Les explosions sont des conventions de combat ; pas de recette ni de propriété angélique inventée.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "vox": {
    "title": "Audience captive",
    "premise": "Vox fabrique un événement pour imposer sa version de l’hôtel ; son rival refuse le cadre prévu.",
    "motivation": "Être la seule source que la ville regarde.",
    "stakes": "Le contrôle du montage et la dépendance de ses partenaires à son audience.",
    "intro": "Vox prépare une émission censée se terminer par une humiliation parfaite. Velvette veut garder sa propre stratégie et Charlie refuse la question piégée. Chaque duel oblige Vox à remplacer une personne réelle par une image plus commode.",
    "chapters": [
      {
        "title": "Le plan de diffusion",
        "opponent": "velvette",
        "stage": "vee-broadcast-studio",
        "scene": "Les partenaires disputent le contrôle du conducteur d’émission.",
        "dramaticPurpose": "Faire apparaître les intérêts concurrents au sein des Vees.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Une réponse hors sujet",
        "opponent": "charlie",
        "stage": "hotel-lobby",
        "scene": "Charlie détourne l’attention vers les résidents que l’émission coupe du cadre.",
        "dramaticPurpose": "Montrer la résistance de ce que Vox ne peut simplifier.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s2"
        ]
      },
      {
        "title": "L’invité sans écran",
        "opponent": "alastor",
        "stage": "vee-broadcast-studio",
        "scene": "Alastor accepte le duel mais sabote son rythme de spectacle.",
        "dramaticPurpose": "Amener Vox à choisir entre gagner et rester visible.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      }
    ],
    "rival": {
      "fighterId": "alastor",
      "canonRelationship": "La rivalité de diffusion avec Alastor est ancrée dans S1E02.",
      "dramaticReason": "Alastor peut lui refuser l’unique chose dont cette campagne fait sa condition de victoire : un cadre maîtrisé.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-s2",
        "hh-i-overlords"
      ]
    },
    "ending": "Les écrans affichent une victoire, mais le studio est vide. Vox regarde la courbe d’audience sur un écran sans chiffres lisibles et remarque qu’un canal reste éteint. Le récit se termine sur cette absence que son montage ne corrige pas.",
    "nextHook": "La prochaine émission sera construite pour l’unique spectateur qu’il n’a pas obtenu.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Vox série S1 pour cette campagne ; écran et costume cohérents avec ce modèle.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Les écrans ne permettent pas de déduire un contrôle mental universel.",
        "Sa victoire d’audience dans l’AU ne remplace pas les événements S2.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "valentino": {
    "title": "Plateau fermé",
    "premise": "Valentino veut reprendre la main sur une production que ses partenaires et son employé refusent de traiter comme sa propriété totale.",
    "motivation": "Restaurer une autorité menacée ; cet objectif antagoniste n’est pas approuvé par le récit.",
    "stakes": "La fermeture du plateau et l’isolement croissant du personnage.",
    "intro": "Valentino trouve un plateau presque désert à l’heure d’une prise. Il exige qu’on lui ramène une équipe, mais chacun a une autre priorité. La campagne dévoile comment sa recherche de contrôle détruit les conditions de son propre spectacle.",
    "chapters": [
      {
        "title": "Le budget n’est pas un ordre",
        "opponent": "velvette",
        "stage": "vee-broadcast-studio",
        "scene": "Velvette refuse de sacrifier sa propre opération pour réparer une colère de Valentino.",
        "dramaticPurpose": "Montrer les limites de son autorité parmi les Vees.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "L’accès ne se rachète pas",
        "opponent": "husk",
        "stage": "hotel-bar",
        "scene": "Husk bloque une intervention de Valentino dans l’espace de repos d’Angel.",
        "dramaticPurpose": "Opposer un lieu d’accueil à son cadre de production.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "La prise refusée",
        "opponent": "angeldust",
        "stage": "vee-broadcast-studio",
        "scene": "Angel refuse la dernière mise en scène de la soirée et cherche la sortie.",
        "dramaticPurpose": "Faire de l’autonomie adverse le véritable enjeu, même si Valentino gagne le match.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1",
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "angeldust",
      "canonRelationship": "Le conflit employeur–Angel est établi par S1E04 ; les détails contractuels ne sont pas développés dans la source primaire consultée.",
      "dramaticReason": "Angel peut lui refuser une présence sincère que le pouvoir de production ne remplace pas.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-overlords",
        "hh-i-project"
      ]
    },
    "ending": "Le vainqueur demeure sur un plateau vide, entouré de matériel coûteux et silencieux. Valentino exige une nouvelle prise, mais personne ne se presse. Sa victoire mécanique s’achève sur un échec relationnel explicite.",
    "nextHook": "Les autres Vees évaluent désormais le coût de ses colères.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Valentino série S1 ; tenue de studio conservée.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Le traitement narratif reste celui d’un antagoniste abusif, sans glamour de la coercition.",
        "Aucune nouvelle clause de contrat ni capacité à signer une âme par un coup.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "velvette": {
    "title": "Le prix d’une image",
    "premise": "Velvette veut lancer une campagne dont personne ne pourra récupérer le crédit, mais la ville résiste au cadre choisi.",
    "motivation": "Obtenir une influence autonome au sein des Vees.",
    "stakes": "Sa capacité à distinguer une tendance utile d’une provocation destructrice.",
    "intro": "Velvette prépare une image parfaite pour annoncer son prochain événement. Vox veut y placer sa marque et les autres Overlords contestent le message. Elle doit décider ce qui mérite d’être conservé quand la réalité refuse sa composition.",
    "chapters": [
      {
        "title": "Hors du logo",
        "opponent": "vox",
        "stage": "vee-broadcast-studio",
        "scene": "Vox veut cadrer son lancement comme un produit de sa propre chaîne.",
        "dramaticPurpose": "Installer l’enjeu d’indépendance entre partenaires.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Un public qui répond",
        "opponent": "rosie",
        "stage": "cannibal-town-square",
        "scene": "Rosie refuse que sa communauté serve de simple arrière-plan à une campagne AU.",
        "dramaticPurpose": "Faire exister le public comme acteur plutôt que décor.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-overlords"
        ]
      },
      {
        "title": "Ce que l’image cache",
        "opponent": "carmilla",
        "stage": "carmine-industries",
        "scene": "Carmilla oppose le coût concret d’un conflit à la force d’une image provocante.",
        "dramaticPurpose": "Rejouer leur opposition de méthode sans recopier la scène chantée.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-respectless"
        ]
      }
    ],
    "rival": {
      "fighterId": "carmilla",
      "canonRelationship": "Velvette et Carmilla sont opposées dans le clip officiel Respectless.",
      "dramaticReason": "Carmilla oblige Velvette à répondre des conséquences d’une provocation, pas seulement de son impact visuel.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-overlords",
        "hh-i-respectless",
        "hh-i-project"
      ]
    },
    "ending": "Velvette écarte son affiche la plus agressive et conserve une image moins facile à récupérer. Elle n’est pas devenue altruiste ; elle a appris qu’un public qui reste vaut mieux qu’une foule qui s’enflamme une seconde. Le téléphone montre un visuel sans chiffres ni slogans intégrés.",
    "nextHook": "Vox propose de diffuser ce succès à condition de se l’attribuer.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Velvette série S1 ; une seule tenue validée par illustration.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Changer de look n’autorise pas à lui attribuer une magie de métamorphose.",
        "L’influence sociale n’est pas un pouvoir de contrôle direct des pensées.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "adam": {
    "title": "Le rappel du premier homme",
    "premise": "Une campagne d’archives explore l’assurance d’Adam jusqu’au point où son spectacle ne suffit plus.",
    "motivation": "Imposer sa supériorité et faire taire toute contestation.",
    "stakes": "Son besoin d’avoir raison, présenté comme faiblesse antagoniste.",
    "intro": "Adam arrive à une répétition de jugement comme à son propre concert. Il croit que chaque adversaire confirmera sa place au sommet. Les rencontres l’obligent à entendre des choix qu’il préfère traiter comme des erreurs.",
    "chapters": [
      {
        "title": "Un pécheur au centre",
        "opponent": "sirpentious",
        "stage": "heaven-embassy",
        "scene": "Pentious réclame une écoute dans une audience d’archives AU.",
        "dramaticPurpose": "Faire apparaître ce qu’Adam refuse de considérer.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s2"
        ]
      },
      {
        "title": "Le refus n’est pas une preuve",
        "opponent": "charlie",
        "stage": "heaven-court",
        "scene": "Charlie maintient une question malgré l’intimidation.",
        "dramaticPurpose": "Séparer autorité et argument.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Le spectacle interrompu",
        "opponent": "lucifer",
        "stage": "hotel-exterior",
        "scene": "La reconstitution du combat final oppose sa certitude à une force qui lui répond.",
        "dramaticPurpose": "Terminer sur la fragilité de sa domination.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-lucifer-adam"
        ]
      }
    ],
    "rival": {
      "fighterId": "lucifer",
      "canonRelationship": "Lucifer et Adam se combattent dans le final S1.",
      "dramaticReason": "Lucifer peut arrêter son numéro sans accepter la règle qu’Adam prétend incarner.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-lucifer-adam",
        "hh-i-niffty-adam"
      ]
    },
    "ending": "Même après une victoire mécanique, Adam réclame encore des applaudissements à un espace vide. Le récit se ferme comme une archive avant que l’interface rappelle séparément l’issue canonique S1. Rien dans cette fin alternative ne le ramène dans le présent.",
    "nextHook": "Cette archive peut être relue du point de vue de ceux qui ont dû lui répondre.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Adam vivant, incarnation d’archives S1 uniquement.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Adam est mort à la fin S1 ; cette route n’est ni une résurrection ni une suite officielle.",
        "Sa rhétorique sur le salut n’est pas une règle fiable de rédemption.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "emily": {
    "title": "Une preuve à entendre",
    "premise": "Emily veut qu’un témoignage soit entendu avant qu’un protocole ne le referme.",
    "motivation": "Défendre l’examen honnête d’un fait dérangeant.",
    "stakes": "Le droit de poser une question sans la transformer immédiatement en condamnation.",
    "intro": "Une audience de simulation se prépare autour d’un dossier dont la conclusion semble déjà écrite. Emily demande qu’on laisse le témoin finir. Les obstacles sont moins des monstres que des personnes convaincues de protéger le même lieu.",
    "chapters": [
      {
        "title": "L’ordre des paroles",
        "opponent": "abel",
        "stage": "hh-heaven-gates",
        "scene": "Abel tente de respecter un ordre de passage qui exclut le témoin.",
        "dramaticPurpose": "Installer un désaccord de méthode sans inventer de hiérarchie.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-abel"
        ]
      },
      {
        "title": "La sécurité avant l’écoute",
        "opponent": "lute",
        "stage": "heaven-embassy",
        "scene": "Lute exige la fermeture du passage pendant l’audience AU.",
        "dramaticPurpose": "Faire peser un coût sur le choix d’entendre.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Garder la question ouverte",
        "opponent": "sera",
        "stage": "heaven-court",
        "scene": "Emily refuse qu’une conclusion rassurante précède l’examen du dossier.",
        "dramaticPurpose": "Opposer deux réponses à la responsabilité plutôt que deux alignements moraux simples.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "sera",
      "canonRelationship": "Le registre de production place Emily et Sera dans la sphère céleste ; la relation exacte et les dialogues demandent le contrôle direct de S1E06.",
      "dramaticReason": "Sera représente l’autorité dont Emily veut obtenir une écoute réelle, sans lui retirer toute complexité.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-s2",
        "hh-i-project"
      ]
    },
    "ending": "Le dossier demeure ouvert sur la table. Emily ne proclame pas un verdict qu’elle ne peut pas prouver ; elle obtient que le témoin puisse revenir. Le siège laissé libre devient le signe visuel de cette possibilité.",
    "nextHook": "Il faudra maintenant entendre une personne dont elle n’apprécie pas la réponse.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Emily série, scène AU de discussion céleste ; détail du modèle à comparer aux références.",
      "spoilerTier": "season_2",
      "guardrails": [
        "Aucun pouvoir de rédemption instantanée ou de jugement absolu n’est inventé.",
        "Les ailes et halos doivent rester ceux de l’incarnation retenue, sans rang nouveau.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "sera": {
    "title": "Le poids du siège",
    "premise": "Sera doit maintenir une audience lorsque la prudence qu’elle invoque menace d’en rendre toute conclusion impossible.",
    "motivation": "Protéger l’institution tout en assumant ce qu’elle ne sait pas.",
    "stakes": "La crédibilité d’un ordre capable de reconnaître une preuve nouvelle.",
    "intro": "Sera prépare un protocole qui doit empêcher l’audience de déraper. Une question de Charlie révèle que le protocole peut aussi empêcher d’apprendre. Quand la force entre dans la salle, elle doit décider à qui s’applique réellement sa règle.",
    "chapters": [
      {
        "title": "La demande précise",
        "opponent": "charlie",
        "stage": "heaven-court",
        "scene": "Charlie refuse une réponse générale et demande ce qui sera effectivement examiné.",
        "dramaticPurpose": "Déplacer Sera du principe vers une décision concrète.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Le doute loyal",
        "opponent": "emily",
        "stage": "heaven-court",
        "scene": "Emily insiste pour que le dossier reste ouvert.",
        "dramaticPurpose": "Montrer qu’un désaccord peut venir d’une volonté de protéger le même lieu.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "La force dans la salle",
        "opponent": "lute",
        "stage": "heaven-embassy",
        "scene": "Lute veut interrompre l’audience ; Sera lui impose les limites du cadre qu’elle préside.",
        "dramaticPurpose": "Appliquer sa propre règle à son camp.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "lute",
      "canonRelationship": "Le lien hiérarchique précis Sera–Lute n’est pas certifié par les pages consultées ; le conflit de cette audience est explicitement AU.",
      "dramaticReason": "Lute oblige Sera à distinguer protection et fermeture systématique.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-s1",
        "hh-i-s2",
        "hh-i-project"
      ]
    },
    "ending": "Sera quitte le siège élevé pour refermer elle-même la porte de l’armurerie, pas celle de l’audience. Le dossier reste sur la table, accompagné d’une place pour les objections. L’issue ne prétend pas réparer d’un coup les décisions passées.",
    "nextHook": "Le prochain témoignage pourrait démontrer une erreur qu’elle devra nommer publiquement.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Sera série, incarnation du tribunal céleste ; scène AU.",
      "spoilerTier": "season_2",
      "guardrails": [
        "La sécurité du Paradis est une motivation, pas une preuve d’infaillibilité.",
        "Ne pas inventer le pouvoir de lire, peser ou effacer les âmes.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "lute": {
    "title": "L’ordre et la faille",
    "premise": "Une route d’archives suit Lute lorsqu’une mission devient une affaire personnelle.",
    "motivation": "Rétablir une certitude qu’une ancienne adversaire met en danger.",
    "stakes": "La distinction entre discipline et ressentiment.",
    "intro": "Lute reçoit dans la simulation un itinéraire simple : identifier une brèche et la refermer. Chaque rencontre lui offre l’occasion d’abandonner cette limite pour poursuivre une personne. Son assurance militaire masque la peur d’avoir à réexaminer l’ordre lui-même.",
    "chapters": [
      {
        "title": "L’arme ne décide pas",
        "opponent": "carmilla",
        "stage": "carmine-industries",
        "scene": "Carmilla refuse une saisie de matériel dans cette rencontre AU.",
        "dramaticPurpose": "Montrer qu’un outil ne garantit pas la supériorité.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Une porte qu’on refuse de fermer",
        "opponent": "charlie",
        "stage": "hotel-exterior",
        "scene": "Charlie protège l’accès des résidents plutôt que de répondre à la provocation.",
        "dramaticPurpose": "Opposer une mission de protection à une logique d’exclusion.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-cast"
        ]
      },
      {
        "title": "La poursuite choisie",
        "opponent": "vaggie",
        "stage": "heaven-embassy",
        "scene": "Lute abandonne son trajet initial pour chercher un duel avec Vaggie.",
        "dramaticPurpose": "Révéler le ressort personnel de la campagne.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "vaggie",
      "canonRelationship": "Le registre conserve une opposition Lute–Vaggie ; la mise en scène et les échanges de cette route sont nouveaux et AU.",
      "dramaticReason": "Vaggie représente la possibilité d’un choix que Lute préfère interpréter comme une faute.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-project"
      ]
    },
    "ending": "Lute atteint la fin de son itinéraire mais constate qu’elle a quitté son poste pour obtenir le duel. Elle redresse son arme comme si le geste pouvait effacer ce détour. La dernière image laisse cette contradiction visible, sans annoncer une conversion.",
    "nextHook": "L’archive de Vaggie raconte la même rencontre en privilégiant ceux qui ont pu s’échapper.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Lute avant blessure, incarnation d’archives S1 ; sélectionner le costume pré-blessure existant.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Ne pas mélanger les bras et blessures de deux incarnations.",
        "Le modèle vivant d’Adam appartient aux archives ; aucun retour au présent n’est sous-entendu.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "carmilla": {
    "title": "Fermer l’atelier",
    "premise": "Un lot de matériel devient prétexte à une escalade ; Carmilla veut protéger les personnes avant les marchandises.",
    "motivation": "Garder la maîtrise de ce qu’elle laisse sortir de son atelier.",
    "stakes": "La sécurité des proches et des ouvriers, pas la conquête d’un territoire.",
    "intro": "Carmilla trouve une commande préparée pour un usage qu’elle refuse de cautionner dans cette histoire AU. Elle ordonne la fermeture de l’atelier, mais tout le monde n’y voit pas une mesure de protection. Pour tenir cette décision, elle doit expliquer une limite et l’appliquer.",
    "chapters": [
      {
        "title": "Ce que protège l’appui",
        "opponent": "vaggie",
        "stage": "carmine-industries",
        "scene": "Un exercice apprend à Vaggie à couvrir une sortie en restant mobile.",
        "dramaticPurpose": "Montrer la transmission comme première forme de protection.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-carmilla"
        ]
      },
      {
        "title": "La provocation rentable",
        "opponent": "velvette",
        "stage": "vee-broadcast-studio",
        "scene": "Velvette veut transformer le refus de Carmilla en preuve de faiblesse.",
        "dramaticPurpose": "Faire choisir le coût d’une mauvaise image plutôt qu’une mauvaise guerre.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-respectless"
        ]
      },
      {
        "title": "La porte du stock",
        "opponent": "lute",
        "stage": "carmine-industries",
        "scene": "Lute réclame l’accès au lot dans une confrontation AU.",
        "dramaticPurpose": "Concrétiser la limite dans l’espace de l’atelier.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "lute",
      "canonRelationship": "Aucune rivalité personnelle Carmilla–Lute n’est établie par les pages consultées ; la saisie proposée est AU.",
      "dramaticReason": "Lute représente la demande de force à laquelle Carmilla choisit de ne pas livrer son atelier.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-overlords",
        "hh-i-carmilla",
        "hh-i-respectless",
        "hh-i-project"
      ]
    },
    "ending": "Carmilla ferme le registre de sortie, puis ouvre la porte latérale pour que les travailleurs rentrent chez eux. Les armes restent au second plan, les visages reprennent la première place. La victoire laisse une commande perdue et des personnes sauves.",
    "nextHook": "Velvette diffusera le refus ; Carmilla devra l’assumer devant les autres Overlords.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Carmilla série S1, modèle de l’atelier et de la transmission à Vaggie.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Le combat de protection ne devient pas un désir général de guerre.",
        "Ne pas ajouter de formule de métal angélique ou de fabrication d’arme inexistante dans les sources.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "rosie": {
    "title": "La table et la porte",
    "premise": "Rosie organise une réception qui doit rester un accord entre personnes, malgré ceux qui veulent y voir une dette.",
    "motivation": "Préserver l’autorité de son accueil et l’autonomie de sa communauté.",
    "stakes": "Une alliance utile qui ne transforme pas les invités en possessions.",
    "intro": "Une longue table est dressée pour discuter d’un soutien à l’hôtel. Chacun arrive avec une idée différente de ce que l’invitation lui donne. Rosie décide que la première négociation portera sur la façon d’entrer et de sortir de sa maison.",
    "chapters": [
      {
        "title": "Les règles de la table",
        "opponent": "niffty",
        "stage": "cannibal-town-square",
        "scene": "Niffty veut réorganiser la réception selon son propre ordre.",
        "dramaticPurpose": "Installer l’accueil comme pratique précise et comique.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Demander vraiment",
        "opponent": "charlie",
        "stage": "cannibal-town-square",
        "scene": "Charlie doit expliquer ce qu’elle demande sans promettre pour tout le monde.",
        "dramaticPurpose": "Faire de l’alliance un consentement explicite.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Une invitation n’est pas un titre",
        "opponent": "alastor",
        "stage": "hotel-lobby",
        "scene": "Alastor voudrait raconter l’accord comme son succès personnel.",
        "dramaticPurpose": "Rosie reprend la parole sur ce qu’elle a elle-même décidé.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-overlords"
        ]
      }
    ],
    "rival": {
      "fighterId": "alastor",
      "canonRelationship": "Rosie et Alastor sont deux Overlords identifiés officiellement ; cette négociation et sa portée contractuelle sont AU.",
      "dramaticReason": "Il tente d’être le narrateur d’un choix dont elle reste l’autrice.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-overlords",
        "hh-i-s1",
        "hh-i-project"
      ]
    },
    "ending": "Rosie referme un couvert et en ajoute un autre, signe que l’accord peut évoluer. La table reste ouverte à un voisin qui n’a encore rien promis. L’alliance existe, mais l’image ne montre ni chaîne ni signature d’âme.",
    "nextHook": "Le premier désaccord concret devra être réglé autour de la même table.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Rosie série S1 ; campagne d’archives avant toute révélation contractuelle ultérieure.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Ne pas inférer une espèce précise ou une nouvelle relation contractuelle depuis son rang.",
        "Le soutien de sa communauté n’est pas une télépathie ni une invocation gratuite.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "zestial": {
    "title": "Avant le verdict",
    "premise": "Zestial demande de différer une décision dont les conséquences dépassent l’enthousiasme du conseil.",
    "motivation": "Obtenir assez d’informations pour qu’un accord engage réellement ceux qui le prennent.",
    "stakes": "La différence entre prudence et immobilisme.",
    "intro": "Une proposition de riposte arrive avant les preuves qui devraient la soutenir. Zestial demande un délai et se voit accuser de peur. Pour que sa prudence ne soit pas un simple retrait, il accepte de se déplacer et d’examiner lui-même les objections.",
    "chapters": [
      {
        "title": "La provocation immédiate",
        "opponent": "velvette",
        "stage": "carmine-industries",
        "scene": "Velvette veut faire voter avant la fin de l’examen.",
        "dramaticPurpose": "Rendre le coût social de la prudence visible.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1",
          "hh-i-overlords"
        ]
      },
      {
        "title": "L’image qui manque",
        "opponent": "vox",
        "stage": "vee-broadcast-studio",
        "scene": "Vox présente une séquence coupée ; Zestial demande ce qui se trouve hors cadre.",
        "dramaticPurpose": "Transformer le doute en vérification active.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Décider quand même",
        "opponent": "carmilla",
        "stage": "carmine-industries",
        "scene": "Carmilla demande une décision concrète après l’enquête.",
        "dramaticPurpose": "Éviter une fin où la prudence consiste à ne jamais choisir.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-overlords"
        ]
      }
    ],
    "rival": {
      "fighterId": "carmilla",
      "canonRelationship": "Zestial et Carmilla sont officiellement identifiés comme Overlords ; la décision et le duel de cette route sont AU.",
      "dramaticReason": "Carmilla est la bonne rivale parce qu’elle refuse aussi bien la précipitation que l’attente sans fin.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-overlords",
        "hh-i-s1",
        "hh-i-project"
      ]
    },
    "ending": "Zestial ferme deux dossiers et en laisse un sur la table, celui sur lequel il accepte d’engager sa parole. L’image donne un poids à sa décision sans la présenter comme une vérité surnaturelle. La communauté devra encore en supporter les conséquences.",
    "nextHook": "Une preuve nouvelle pourrait exiger qu’il revienne sur ce choix.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Zestial série S1, silhouette du conseil des Overlords.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Son ancienneté apparente n’établit ni omniscience ni pouvoir temporel.",
        "Aucun poison, toile magique ou invocation déduit de sa seule silhouette.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "zeezi": {
    "title": "La salle appartient au public",
    "premise": "Une grande soirée AU devient une opération d’image qui ne laisse plus de place à ceux qui viennent y assister.",
    "motivation": "Conserver un événement dont l’énergie vient des participants.",
    "stakes": "La possibilité d’un spectacle qui ne serve pas uniquement le contrôle des organisateurs.",
    "intro": "Zeezi découvre que la scène a été agrandie au point de bloquer l’entrée. Le lancement promet une foule immense mais ne lui laisse aucun espace. Elle entreprend de remettre les corps réels au centre du plan.",
    "chapters": [
      {
        "title": "Une image trop serrée",
        "opponent": "velvette",
        "stage": "vee-broadcast-studio",
        "scene": "Velvette veut un cadrage qui exclut les places les moins flatteuses.",
        "dramaticPurpose": "Installer un désaccord sur le public visible.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-overlords"
        ]
      },
      {
        "title": "L’écran devant la scène",
        "opponent": "vox",
        "stage": "vee-broadcast-studio",
        "scene": "Vox couvre l’espace d’écrans pour sa diffusion.",
        "dramaticPurpose": "Faire choisir entre présence et audience distante.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s2"
        ]
      },
      {
        "title": "La jauge et le risque",
        "opponent": "carmilla",
        "stage": "carmine-industries",
        "scene": "Carmilla exige que les accès soient praticables avant de prêter le lieu dans l’AU.",
        "dramaticPurpose": "Mettre la sécurité au même niveau que la fierté artistique.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-overlords"
        ]
      }
    ],
    "rival": {
      "fighterId": "carmilla",
      "canonRelationship": "Aucune relation personnelle Zeezi–Carmilla n’est établie par la source officielle consultée ; la négociation du lieu est AU.",
      "dramaticReason": "Carmilla lui oppose une contrainte concrète que son enthousiasme doit intégrer.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-project"
      ]
    },
    "ending": "La scène finale est plus petite, mais la salle respire. Zeezi reste au niveau du public plutôt que sur une estrade inaccessible. L’image donne une présence à un personnage encore peu documenté sans lui inventer un empire ni un pouvoir.",
    "nextHook": "Le succès attire ceux qui voudront à nouveau racheter le cadre.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Zeezi modèle série S2 du registre ; référence visuelle à contrôler avant nouvelles vues.",
      "spoilerTier": "season_2",
      "guardrails": [
        "Le guide officiel confirme l’identité, pas une gamme de pouvoirs soniques ou sismiques.",
        "Ne pas transformer son gabarit en preuve de force illimitée.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "baxter": {
    "title": "La preuve sans cobaye",
    "premise": "Baxter veut produire une mesure incontestable, mais découvre qu’un dispositif exact peut poser la mauvaise question.",
    "motivation": "Faire reconnaître son travail sans sacrifier l’autonomie des personnes étudiées.",
    "stakes": "La confiance nécessaire pour que quelqu’un accepte de participer à une expérience AU.",
    "intro": "Baxter prépare un appareil de démonstration dans l’atelier de simulation. Cherri arrive avec une question sur Pentious à laquelle aucun cadran ne répond. Charlie refuse ensuite que les résidents deviennent des échantillons sans accord.",
    "chapters": [
      {
        "title": "La question personnelle",
        "opponent": "cherribomb",
        "stage": "pentious-workshop",
        "scene": "Cherri interrompt une démonstration pour demander ce que Baxter sait de Pentious.",
        "dramaticPurpose": "Opposer mémoire et mesure sans inventer leur passé.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-cherri-baxter"
        ]
      },
      {
        "title": "Le prototype d’archives",
        "opponent": "sirpentious",
        "stage": "pentious-workshop",
        "scene": "Un duel déclaré d’archives compare deux méthodes de montage ; ce n’est pas le retour de Pentious en Enfer.",
        "dramaticPurpose": "Faire de la rivalité technique une proposition explicitement hors chronologie.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s2",
          "hh-i-project"
        ]
      },
      {
        "title": "Le droit de ne pas participer",
        "opponent": "charlie",
        "stage": "hotel-lobby",
        "scene": "Charlie arrête un test dont les règles n’ont pas été expliquées aux volontaires.",
        "dramaticPurpose": "Donner une limite éthique concrète au désir de preuve.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-cast"
        ]
      }
    ],
    "rival": {
      "fighterId": "charlie",
      "canonRelationship": "L’appartenance de Charlie au projet hôtelier est officielle ; le test, ses règles et le conflit avec Baxter sont AU.",
      "dramaticReason": "Charlie exige une preuve construite avec les personnes, pas seulement sur elles.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-cherri-baxter",
        "hh-i-project"
      ]
    },
    "ending": "Baxter débranche une sonde et laisse un bouton d’arrêt accessible à l’autre côté de la table. Sa première observation consigne un refus, sans le traiter comme une erreur. Cherri attend encore une conversation, et il accepte enfin de s’asseoir.",
    "nextHook": "Le prochain test commencera par une question à laquelle le sujet peut ne pas répondre.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Baxter série S2 ; incarnation du registre courant, aucun modèle de préproduction repris automatiquement.",
      "spoilerTier": "season_2",
      "guardrails": [
        "Le lien avec Pentious ne permet pas d’inventer les détails d’un passé commun.",
        "Aucune potion de rédemption, duplication d’âme ou expérience forcée présentée comme canon.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "abel": {
    "title": "Une parole à soi",
    "premise": "Abel doit transmettre une consigne ambiguë et découvre que la répéter sans question est aussi un choix.",
    "motivation": "Trouver une façon de parler qui lui appartienne.",
    "stakes": "La possibilité de laisser passer un témoignage au lieu de masquer l’incertitude derrière le protocole.",
    "intro": "Une file attend devant les portes célestes dans cette scène AU. Abel reçoit deux consignes incompatibles et tente d’abord de contenter tout le monde. L’arrivée d’un témoin transforme son hésitation en décision qu’il devra assumer.",
    "chapters": [
      {
        "title": "Faire place à la question",
        "opponent": "emily",
        "stage": "hh-heaven-gates",
        "scene": "Emily lui demande de préciser ce qui bloque réellement le passage.",
        "dramaticPurpose": "Transformer l’hésitation en problème nommé.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Dire ce qu’on ignore",
        "opponent": "sera",
        "stage": "heaven-court",
        "scene": "Abel expose la contradiction du protocole sans inventer une réponse rassurante.",
        "dramaticPurpose": "Le faire parler directement à une autorité du cadre AU.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "La consigne ne suffit plus",
        "opponent": "lute",
        "stage": "heaven-embassy",
        "scene": "Lute exige une exécution immédiate ; Abel maintient le passage le temps d’une clarification.",
        "dramaticPurpose": "Donner un coût à sa parole propre.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "lute",
      "canonRelationship": "Aucune relation précise Abel–Lute n’est certifiée par les métadonnées officielles consultées ; cette opposition est une rencontre AU.",
      "dramaticReason": "Lute incarne la pression d’agir avant de comprendre, au centre de cette campagne.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-cast",
        "hh-i-abel",
        "hh-i-project"
      ]
    },
    "ending": "Abel laisse un espace ouvert dans la file et revient vers la table des consignes pour obtenir une réponse claire. Il ne devient pas soudain un chef omniscient. Sa victoire consiste à signer sa propre décision, sans nom lisible dans l’image.",
    "nextHook": "La prochaine consigne sera correcte mais difficile : il faudra alors choisir de la défendre ou de la contester.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Abel série S2 ; apparence courante du registre, rang et généalogie non extrapolés.",
      "spoilerTier": "season_2",
      "guardrails": [
        "L’identité officielle ne suffit pas à établir une parenté ou un rang par référence biblique.",
        "Aucun héritage automatique des attaques d’Adam.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "hz_mimzy": {
    "title": "L’addition après le rappel",
    "premise": "Mimzy cherche un endroit où finir son numéro, mais les dégâts qu’elle entraîne demandent plus qu’une bonne sortie de scène.",
    "motivation": "Conserver sa place sans laisser systématiquement quelqu’un d’autre régler les conséquences.",
    "stakes": "La possibilité d’être invitée à nouveau pour elle-même.",
    "intro": "Mimzy arrive avec un accessoire cassé et une histoire très travaillée. Le bar veut d’abord savoir qui paiera la réparation. Elle tente plusieurs entrées spectaculaires avant de comprendre qu’aucune n’efface ce qui attend en coulisse.",
    "chapters": [
      {
        "title": "Le comptoir n’est pas une coulisse",
        "opponent": "husk",
        "stage": "hotel-bar",
        "scene": "Husk demande qu’elle retire le matériel qui gêne son travail.",
        "dramaticPurpose": "Donner un coût concret à son charme.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Un numéro de trop",
        "opponent": "lucifer",
        "stage": "hotel-lobby",
        "scene": "Lucifer occupe déjà l’espace avec sa propre démonstration ; Mimzy doit composer avec une autre vedette.",
        "dramaticPurpose": "Distinguer présence et monopolisation de l’attention.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Rester pour la suite",
        "opponent": "alastor",
        "stage": "hotel-exterior",
        "scene": "Alastor refuse d’être seulement la sortie de secours de son récit AU.",
        "dramaticPurpose": "Mettre leur lien à l’épreuve sans inventer de clause.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "hh-i-mimzy"
        ]
      }
    ],
    "rival": {
      "fighterId": "alastor",
      "canonRelationship": "Mimzy connaît assez Alastor pour raconter son histoire dans un clip officiel ; la dette précise de cette campagne est inventée.",
      "dramaticReason": "Alastor est celui devant qui sa narration charmante risque de ne plus suffire.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "hh-i-mimzy",
        "hh-i-s1",
        "hh-i-project"
      ]
    },
    "ending": "Mimzy retire elle-même un morceau du décor abîmé. Son dernier salut s’adresse à une équipe qui travaille encore, pas à un public forcé. Elle laisse un accessoire réparé au comptoir, sans promesse de conversion miraculeuse.",
    "nextHook": "La prochaine invitation comportera une vraie responsabilité en coulisse.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Mimzy série S1 ; silhouette et tenue de scène du registre.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Son lien avec Alastor ne prouve aucun contrat d’âme.",
        "Ne pas lui attribuer une magie vocale ou une armée personnelle sans référence.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "hz_katie_killjoy": {
    "title": "Le direct se retourne",
    "premise": "Katie veut imposer une conclusion à son émission, mais chaque invité rend le montage plus difficile.",
    "motivation": "Rester celle qui choisit la dernière phrase.",
    "stakes": "Son autorité à l’antenne et le travail de l’équipe qu’elle traite comme invisible.",
    "intro": "Katie prépare un plateau où chaque objet favorise déjà son angle. Charlie répond autrement que prévu et Tom garde un élément qu’elle voulait couper. Quand un diffuseur réclame le contrôle du direct, Katie découvre le prix de sa propre méthode.",
    "chapters": [
      {
        "title": "L’invitée qui répond",
        "opponent": "charlie",
        "stage": "vee-broadcast-studio",
        "scene": "Charlie refuse la conclusion imposée à la question.",
        "dramaticPurpose": "Montrer le montage avant même le montage.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s2"
        ]
      },
      {
        "title": "Le collègue dans le champ",
        "opponent": "hz_tom_trench",
        "stage": "vee-broadcast-studio",
        "scene": "Tom maintient un fait de terrain qu’elle voudrait supprimer.",
        "dramaticPurpose": "Faire exister le travail partagé derrière son autorité.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Qui possède le direct",
        "opponent": "vox",
        "stage": "vee-broadcast-studio",
        "scene": "Vox demande le contrôle final de cette émission AU.",
        "dramaticPurpose": "Retourner contre Katie le rapport de force qu’elle imposait aux autres.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1",
          "hh-i-s2"
        ]
      }
    ],
    "rival": {
      "fighterId": "vox",
      "canonRelationship": "Katie et Vox appartiennent au cadre médiatique du projet, mais la subordination précise et ce conflit éditorial ne sont pas affirmés comme canon.",
      "dramaticReason": "Vox lui refuse le contrôle du dernier mot ; l’antagonisme porte sur la propriété du cadre.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-s2",
        "hh-i-project"
      ]
    },
    "ending": "Katie garde le direct, mais la caméra cadre aussi Tom et les techniciens anonymes. Elle tente de reprendre le centre puis choisit, pour une fois, de finir avec un plan large. Le changement reste fragile et intéressé, sans réhabilitation déclarée.",
    "nextHook": "La prochaine erreur à l’antenne sera la sienne : acceptera-t-elle de la laisser visible ?",
    "continuity": {
      "scope": "custom",
      "incarnation": "Katie modèle série du registre ; pas de transfert automatique du pilote.",
      "spoilerTier": "season_2",
      "guardrails": [
        "Ne pas importer ses scènes du pilote comme preuves de la continuité série.",
        "Le contrôle éditorial ne donne pas de contrôle mental ; aucune forme démoniaque non vérifiée.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "hz_tom_trench": {
    "title": "Une phrase entière",
    "premise": "Tom veut ramener un témoignage intact du terrain jusqu’au direct.",
    "motivation": "Finir une intervention qui ne serve pas seulement de relance à quelqu’un d’autre.",
    "stakes": "La place d’un témoin et celle de son propre travail.",
    "intro": "Tom revient avec un matériel abîmé mais un témoignage complet. Le passage dans l’hôtel puis au studio menace d’en couper chaque partie gênante. Il doit défendre un fil simple : laisser la personne finir sa phrase.",
    "chapters": [
      {
        "title": "Le câble et le passage",
        "opponent": "niffty",
        "stage": "hotel-lobby",
        "scene": "Niffty veut retirer son matériel du couloir ; Tom apprend à enregistrer sans bloquer la vie du lieu.",
        "dramaticPurpose": "Relier la qualité du reportage au respect du terrain.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      },
      {
        "title": "Le témoin choisit",
        "opponent": "angeldust",
        "stage": "hotel-bar",
        "scene": "Angel refuse une question qui dépasse ce qu’il a accepté de raconter.",
        "dramaticPurpose": "Donner à Tom une limite à respecter avant de demander qu’on respecte son travail.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-s1"
        ]
      },
      {
        "title": "Jusqu’au point final",
        "opponent": "hz_katie_killjoy",
        "stage": "vee-broadcast-studio",
        "scene": "Katie veut couper la conclusion ; Tom défend la diffusion entière du témoignage AU.",
        "dramaticPurpose": "Faire de sa prise de parole une responsabilité envers quelqu’un d’autre.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "hh-i-project"
        ]
      }
    ],
    "rival": {
      "fighterId": "hz_katie_killjoy",
      "canonRelationship": "Le binôme de plateau Katie–Tom appartient au registre de production ; ce désaccord éditorial est une histoire AU.",
      "dramaticReason": "Katie est la personne qui peut interrompre la phrase au dernier moment, là où le combat devient une métaphore claire.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "hh-i-project"
      ]
    },
    "ending": "Le voyant du micro reste allumé jusqu’au silence choisi par le témoin. Tom ne vole pas la conclusion pour en faire son triomphe ; il repose simplement le micro. Sur le plan large, sa chaise n’est plus cachée derrière le bureau.",
    "nextHook": "Il faudra couvrir un événement dont le témoin ne sera pas sympathique sans retomber dans le même raccourci.",
    "continuity": {
      "scope": "custom",
      "incarnation": "Tom modèle série du registre ; masque et costume constants.",
      "spoilerTier": "season_1",
      "guardrails": [
        "Le masque à gaz ne prouve ni guerre passée ni pouvoir toxique.",
        "Ne pas transposer un gag du pilote dans la série sans nouvelle source.",
        "La campagne est une simulation AU ; ses duels, dialogues et issues ne remplacent aucun événement diffusé."
      ]
    }
  },
  "hb_blitzo": {
    "title": "Les noms au dos du contrat",
    "premise": "Un commanditaire AU a inscrit les membres d’I.M.P. comme garanties d’une mission.",
    "motivation": "Refuser qu’un travail transforme son équipe en dommages acceptables.",
    "stakes": "La sécurité immédiate du bureau, et sa capacité à laisser les autres choisir de l’aider.",
    "intro": "Blitzø reçoit une cible, un acompte et une seconde page qu’il n’avait pas lue. Au verso, quelqu’un a ajouté les horaires de Moxxie, Millie et Loona. Il veut d’abord résoudre cela seul, puis comprend que le contrat est précisément conçu pour l’isoler.",
    "chapters": [
      {
        "title": "Le plan partagé",
        "opponent": "hb_moxxie",
        "stage": "imp-reception",
        "scene": "Moxxie bloque la porte avec le dossier original. Le duel d’entraînement oppose l’improvisation du patron à un itinéraire qui ménage une retraite pour toute l’équipe.",
        "dramaticPurpose": "Faire accepter à Blitzø qu’une préparation commune protège mieux que sa seule bravade.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_prime2",
          "HB3_truth"
        ]
      },
      {
        "title": "Personne ne reste derrière",
        "opponent": "hb_loona",
        "stage": "imp-exterior",
        "scene": "Loona a intercepté le messager, mais refuse de remettre les coordonnées avant de connaître le plan. Elle teste sa capacité à garder une sortie ouverte au lieu de poursuivre chaque provocation.",
        "dramaticPurpose": "Transformer son réflexe de contrôle en confiance concrète envers sa fille.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_stars",
          "HB3_registry"
        ]
      },
      {
        "title": "Une seule signature",
        "opponent": "hb_striker",
        "stage": "western-lair",
        "scene": "Striker détient la page de garantie et attend une chasse en solitaire. Blitzø vient pour détruire cette page, pas pour accepter le marché d’un partenaire plus efficace.",
        "dramaticPurpose": "Affronter le contre-modèle qui considère les attachements comme des faiblesses.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_striker",
      "canonRelationship": "Assassins rivaux confrontés dans la série.",
      "dramaticReason": "Striker matérialise la tentation d’être intouchable en ne tenant à personne.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Le dossier brûle dans un cendrier du bureau, après que chacun a vérifié que ses coordonnées ont été retirées. Blitzø laisse Moxxie rédiger la prochaine procédure et Loona garder la copie. Il colle tout de même sa photo sur la couverture, pour gâcher un peu le sérieux de la scène.",
    "nextHook": "Le commanditaire a acheté un second exemplaire ; l’équipe décide ensemble si le prochain contrat vaut le déplacement.",
    "continuity": {
      "scope": "S1–S2, avant The Full Moon",
      "incarnation": "Blitzø adulte, tenue I.M.P. et armes à feu de série",
      "spoilerTier": "season_2",
      "guardrails": [
        "Ne pas lui attribuer une magie innée de portail : l’accès intermondes dépend du dispositif de l’incarnation choisie.",
        "Le rival Striker reste un assassin hostile ; une victoire ne le recrute pas et ne guérit pas les relations de Blitzø."
      ]
    }
  },
  "hb_moxxie": {
    "title": "Une signature qui manque",
    "premise": "Un ancien registre criminel AU continue d’utiliser son nom pour garantir des dettes.",
    "motivation": "Faire disparaître cette prise sur sa vie sans demander à Millie de choisir à sa place.",
    "stakes": "Le droit de décider des risques qu’il prend et d’assumer un refus devant Crimson.",
    "intro": "Un avis de paiement arrive à I.M.P. avec une signature de Moxxie qu’il ne reconnaît pas. Crimson ne demande pas vraiment de l’argent : il veut que son fils revienne répondre. Moxxie prépare le trajet, garde l’avis et demande de l’aide avec une condition, parler lui-même au bout du chemin.",
    "chapters": [
      {
        "title": "Le tempo de départ",
        "opponent": "hb_millie",
        "stage": "imp-reception",
        "scene": "Millie propose de faire sauter la porte de la demeure. Moxxie lui demande un exercice où elle le presse sans décider de sa riposte, pour trouver l’espace de parler puis agir.",
        "dramaticPurpose": "Poser une coopération conjugale qui respecte sa décision.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_registry",
          "HB3_truth"
        ]
      },
      {
        "title": "La clause de sortie",
        "opponent": "hb_blitzo",
        "stage": "imp-exterior",
        "scene": "Blitzø veut traiter la dette comme un simple contrat d’élimination. Moxxie défend son plan de récupération du registre lors d’une répétition de l’extraction.",
        "dramaticPurpose": "Le faire tenir sa stratégie face à une autorité plus bruyante.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_prime2"
        ]
      },
      {
        "title": "Le nom rayé",
        "opponent": "hb_crimson",
        "stage": "crimson-mansion",
        "scene": "Crimson conserve le registre au bout de la table et offre une chaise à Moxxie. Il doit traverser la pièce pour retirer la page sans accepter la place préparée pour lui.",
        "dramaticPurpose": "Transformer le refus familial en objectif matériel clairement jouable.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_registry",
          "HB3_prime2"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_crimson",
      "canonRelationship": "Crimson est son père abusif.",
      "dramaticReason": "L’autorité paternelle et criminelle transforme chaque concession en nouvelle dette.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_registry",
        "HB3_prime2"
      ]
    },
    "ending": "Moxxie retire la page portant son nom et laisse le reste du registre sur la table. Sur le retour, il ne chante pas pour masquer le silence ; Millie lui prend simplement la main. Au bureau, il conserve la page comme preuve, sans la remettre dans un dossier de famille.",
    "nextHook": "Une victime de la même comptabilité demande conseil, et Moxxie doit décider jusqu’où il peut aider.",
    "continuity": {
      "scope": "S1–S2, après Exes and Oohs",
      "incarnation": "Moxxie adulte, costume I.M.P., armes de série",
      "spoilerTier": "season_2",
      "guardrails": [
        "Crimson est son père abusif : aucune victoire ne force le pardon, la loyauté ni une réconciliation.",
        "Sa compétence armée et son sens musical ne deviennent ni magie sonore ni faiblesse universelle au corps à corps."
      ]
    }
  },
  "hb_millie": {
    "title": "Ce que l’on rapporte à Wrath",
    "premise": "Une cargaison d’outils du ranch est détournée en matériel pour un duel clandestin AU.",
    "motivation": "Protéger un lieu dont elle vient en imposant elle-même la méthode de récupération.",
    "stakes": "Son autonomie de cheffe de terrain et la sécurité de ses proches au ranch.",
    "intro": "Millie découvre la marque du ranch sur une caisse de matériel saisie pendant une mission. Sallie May lui dit que d’autres caisses manquent, et refuse qu’on présente cela comme une occasion de spectacle. Millie propose de les retrouver ensemble, en prenant pour une fois la tête de toute l’opération.",
    "chapters": [
      {
        "title": "Le terrain des sœurs",
        "opponent": "hb_sallie_may",
        "stage": "wrath-ranch",
        "scene": "Sallie May lui dispute la piste laissée par les caisses. Leur duel d’entraînement sert à déterminer un trajet qui protège les bêtes et les ouvriers du ranch.",
        "dramaticPurpose": "Montrer une égalité entre les sœurs plutôt qu’une aide subalterne.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_belles",
          "HB3_registry"
        ]
      },
      {
        "title": "La bonne couverture",
        "opponent": "hb_moxxie",
        "stage": "imp-reception",
        "scene": "Moxxie a prévu un poste de tir trop loin de la porte. Millie lui fait répéter son entrée et lui demande de suivre son signal plutôt que de la ralentir.",
        "dramaticPurpose": "Faire entendre son expertise pratique au sein du couple.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_truth",
          "HB3_registry"
        ]
      },
      {
        "title": "La palissade ne t’appartient pas",
        "opponent": "hb_striker",
        "stage": "wrath-ranch",
        "scene": "Striker a fixé la dernière caisse au centre d’un parcours de tir. Millie brise l’itinéraire qu’il veut lui imposer pour ramener les outils hors de sa ligne de feu.",
        "dramaticPurpose": "Opposer son rapport concret aux gens de Wrath au prestige solitaire de Striker.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_striker",
      "canonRelationship": "Striker a affronté les membres d’I.M.P., dont Millie.",
      "dramaticReason": "Il réduit leur terre d’origine à un décor pour sa supériorité ; elle défend les personnes qui y vivent.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Les caisses reviennent avec des planches cassées, mais leurs outils sont encore utiles. Millie confie les réparations à ceux qui connaissent le ranch et prend le temps de rester au repas. Moxxie range son plan de couverture avec une correction écrite par elle.",
    "nextHook": "Sallie May lui propose une tâche sans contrat, dont Millie devra choisir la date elle-même.",
    "continuity": {
      "scope": "S1–S2, avant Sinsmas",
      "incarnation": "Millie adulte en tenue I.M.P., arme lourde référencée",
      "spoilerTier": "season_2",
      "guardrails": [
        "Son histoire garde un objectif propre, au-delà du sauvetage de son mari.",
        "Ne pas injecter de révélation de fin S2 dans cet instantané antérieur ; aucune décision familiale n’est une récompense de combat."
      ]
    }
  },
  "hb_loona": {
    "title": "Les numéros que l’on garde",
    "premise": "Une liste de contacts privés AU est copiée sur les passes d’une fête.",
    "motivation": "Récupérer les données sans laisser Blitzø décider à qui elle a le droit de parler.",
    "stakes": "La confiance de nouveaux amis et la possibilité de protéger quelqu’un sans l’enfermer.",
    "intro": "Loona retrouve son numéro sur un laissez-passer qu’elle n’a jamais distribué. Vortex lui apprend qu’un lot entier circule déjà, et elle remonte le trajet avant de prévenir Blitzø. Ce choix la protège de ses questions pendant une heure ; il rend leur dernière discussion inévitable.",
    "chapters": [
      {
        "title": "Contrôle à l’entrée",
        "opponent": "hb_vortex",
        "stage": "spring-broken-beach",
        "scene": "Vortex refuse de lui remettre un lot sans savoir lesquels sont copiés. Ils testent ensemble un parcours d’interception, Loona devant reconnaître le bon porteur sans bloquer tous les invités.",
        "dramaticPurpose": "Faire de leur lien un échange entre adultes compétents.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_spring",
          "HB3_bee"
        ]
      },
      {
        "title": "La fête en retrait",
        "opponent": "hb_beelzebub",
        "stage": "bee-party",
        "scene": "Bee veut que les personnes concernées puissent partir discrètement. Loona lui dispute le centre de la salle pour créer un espace où l’on parle sans être observé.",
        "dramaticPurpose": "Apprendre à protéger l’intimité plutôt qu’à simplement gagner une bagarre.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_bee"
        ]
      },
      {
        "title": "Ma porte, aussi",
        "opponent": "hb_blitzo",
        "stage": "imp-reception",
        "scene": "Blitzø a barricadé le bureau après avoir reçu un passe falsifié. Loona doit rouvrir le passage et lui faire remettre les copies sans accepter une surveillance permanente de ses contacts.",
        "dramaticPurpose": "Faire du dernier affrontement une frontière familiale claire.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_stars",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_blitzo",
      "canonRelationship": "Blitzø est son père adoptif.",
      "dramaticReason": "Sa protection excessive heurte le besoin d’autonomie qu’elle défend dans cette affaire AU.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_stars",
        "HB3_registry"
      ]
    },
    "ending": "Les passes sont détruits et Loona garde seulement les numéros que leurs propriétaires lui ont donnés. Blitzø enlève lui-même la chaîne de la porte ; elle lui envoie un message pour dire quand elle rentrera. Ce message est un choix, pas le prix de sa liberté.",
    "nextHook": "Un appel d’une nouvelle connaissance peut ouvrir une mission qu’elle choisit de mener sans son père.",
    "continuity": {
      "scope": "S1–S2, repères Seeing Stars",
      "incarnation": "Loona adulte, forme hellhound habituelle",
      "spoilerTier": "season_2",
      "guardrails": [
        "Aucune relation romantique avec Vortex n’est imposée : son couple avec Bee et ses propres limites restent respectés.",
        "L’adoption par Blitzø ne crée ni dette d’obéissance ni fin imposant affection ou pardon."
      ]
    }
  },
  "hb_stolas": {
    "title": "La page que l’on refuse de céder",
    "premise": "Une copie AU d’un atlas du palais est utilisée pour prétendre qu’un accès privé a été accordé.",
    "motivation": "Défendre une frontière personnelle sans demander à quelqu’un de rester par dette.",
    "stakes": "Le contrôle d’un espace privé et sa faculté de formuler une demande honnête.",
    "intro": "Une page d’atlas manque au palais, mais le grimoire est toujours à sa place. Le document volé sert à présenter chaque porte ouverte comme une promesse définitive. Stolas décide de récupérer la copie sans remettre sa vie affective dans la même transaction.",
    "chapters": [
      {
        "title": "La clé prêtée",
        "opponent": "hb_blitzo",
        "stage": "stolas-palace",
        "scene": "Blitzø connaît le passage utilisé pour emporter la page. Stolas lui propose une épreuve de garde et doit accepter qu’il parte après lui avoir montré la sortie.",
        "dramaticPurpose": "Séparer une aide ponctuelle d’une obligation intime.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_circus",
          "HB3_fullmoon"
        ]
      },
      {
        "title": "La commande interrompue",
        "opponent": "hb_stella",
        "stage": "stolas-palace",
        "scene": "Stella exige que la copie soit traitée comme un accord acquis. Le duel met en jeu l’accès à la galerie, pas un vote sur la validité de leurs blessures.",
        "dramaticPurpose": "Nommer la violence du rapport familial sans inventer un pardon.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_circus",
          "HB3_western"
        ]
      },
      {
        "title": "L’atlas fermé",
        "opponent": "hb_andrealphus",
        "stage": "goetia-court",
        "scene": "Andrealphus présente la page comme un précédent politique. Stolas traverse l’espace glacé pour récupérer le document, puis ferme lui-même l’atlas.",
        "dramaticPurpose": "Affronter le calcul qui transforme les liens personnels en propriété.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_andrealphus",
      "canonRelationship": "Andrealphus est le frère de Stella et un adversaire politique de Stolas.",
      "dramaticReason": "Il convertit la vulnérabilité familiale en revendication de pouvoir.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Stolas replace la page dans un atlas désormais fermé et laisse une clé sur une table vide. Il écrit une invitation dont l’acceptation n’est pas exigée, puis la range sans l’envoyer dans cette scène. La victoire protège une limite ; elle ne résout pas son couple ni sa paternité.",
    "nextHook": "La prochaine porte devra être ouverte sur demande, avec la possibilité d’entendre non.",
    "continuity": {
      "scope": "S1–S2, incarnation explicitement antérieure à Mastermind",
      "incarnation": "Stolas prince avec pouvoirs et grimoire, tenue adulte de série",
      "spoilerTier": "season_2",
      "guardrails": [
        "L’incarnation jouable précède la sanction de Mastermind ; une fin ne restaure pas automatiquement ses pouvoirs dans l’état tardif.",
        "Le grimoire n’est ni un accessoire d’Octavia à gagner, ni une preuve de consentement de Blitzø à une relation."
      ]
    }
  },
  "hb_striker": {
    "title": "Le prix du trophée",
    "premise": "Une arme volée au repaire de Striker est exposée comme trophée lors d’une vente AU.",
    "motivation": "Récupérer ce qui fait sa réputation et punir ceux qui l’ont traité comme une pièce remplaçable.",
    "stakes": "Son prestige professionnel ; il préfère risquer le paiement plutôt qu’être présenté comme domestiqué.",
    "intro": "Striker reconnaît son étui dans une vitrine qu’il n’a jamais autorisée. L’étiquette annonce déjà un prochain exploit, comme si quelqu’un possédait aussi son futur. Il suit la vente de l’arme en remontant une chaîne de commanditaires qu’il prétend mépriser.",
    "chapters": [
      {
        "title": "La vitrine du palais",
        "opponent": "hb_stella",
        "stage": "stolas-palace",
        "scene": "Stella traite la perte de l’arme comme un problème d’employé. Striker force l’accès à la galerie pour reprendre l’étui et trouver où est partie son contenu.",
        "dramaticPurpose": "Rendre visible sa dépendance aux puissants qu’il insulte.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western"
        ]
      },
      {
        "title": "Le lot de rechange",
        "opponent": "hb_crimson",
        "stage": "crimson-mansion",
        "scene": "Crimson a échangé l’arme contre une faveur. Striker lui dispute le passage vers la caisse d’expédition sans pouvoir se cacher derrière un contrat avantageux.",
        "dramaticPurpose": "L’obliger à agir pour sa réputation sans rémunération garantie.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_oops"
        ]
      },
      {
        "title": "Le meilleur des deux",
        "opponent": "hb_blitzo",
        "stage": "western-lair",
        "scene": "Blitzø a intercepté la caisse parce qu’elle vise I.M.P. Striker exige un duel pour reprendre l’arme ; Blitzø refuse que gagner prouve quoi que ce soit sur le droit de tuer son équipe.",
        "dramaticPurpose": "Faire s’entrechoquer deux visions de la compétence et de l’attachement.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_blitzo",
      "canonRelationship": "Striker et Blitzø sont des assassins rivaux.",
      "dramaticReason": "Il veut faire de Blitzø le témoin forcé de sa supériorité, là où celui-ci protège des personnes.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Striker reprend son étui et détruit la vitrine qui devait l’accompagner. Il conserve pourtant le paiement reçu de la noblesse dans une poche séparée. La contradiction reste entière lorsqu’il repart seul, persuadé d’avoir réglé le problème.",
    "nextHook": "Une nouvelle offre lui promet précisément la reconnaissance qu’il vient de refuser d’acheter.",
    "continuity": {
      "scope": "S1–S2, repères Western Energy et Oops",
      "incarnation": "Striker adulte, tenue de chasseur et armes à vérifier par modèle",
      "spoilerTier": "season_2",
      "guardrails": [
        "Son discours contre les puissants n’en fait pas un libérateur : il accepte des commandes de puissants.",
        "Une arme bénie doit être identifiée ; toutes ses balles ne sont pas automatiquement létales pour toute espèce."
      ]
    }
  },
  "hb_verosika": {
    "title": "Le refrain à elle",
    "premise": "Un concert AU est vendu comme une nouvelle occasion de parler de Blitzø au lieu de sa musique.",
    "motivation": "Reprendre la maîtrise de sa soirée et choisir elle-même ce qui mérite une réponse.",
    "stakes": "Son espace professionnel, son équipe et le droit de ne pas transformer une blessure en marchandise.",
    "intro": "Verosika découvre que l’accès à ses loges est promis dans une campagne de promotion qu’elle n’a pas approuvée. Le programme promet surtout une apparition de son ex. Elle garde la date du concert et change ce que le public va y voir.",
    "chapters": [
      {
        "title": "La porte des loges",
        "opponent": "hb_vortex",
        "stage": "spring-broken-beach",
        "scene": "Vortex veut verrouiller tout le plateau. Verosika lui fait éprouver une entrée où les artistes circulent encore, mais où l’invitation mensongère ne suffit plus à passer.",
        "dramaticPurpose": "Concilier sécurité et autonomie professionnelle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_spring"
        ]
      },
      {
        "title": "Le prix de l’affiche",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Un distributeur de Mammon relaie la publicité AU. Verosika monte sur son plateau pour retirer les visuels qu’il transforme en promesse de scandale.",
        "dramaticPurpose": "Distinguer sa réussite d’un récit imposé par un vendeur de spectacle.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "HB3_mammon",
          "HB3_spring"
        ]
      },
      {
        "title": "La chanson n’est pas pour toi",
        "opponent": "hb_blitzo",
        "stage": "apology-party",
        "scene": "Blitzø vient s’expliquer pendant la répétition. Verosika lui dispute l’espace du micro ; le duel s’achève quand elle récupère le temps de son propre numéro.",
        "dramaticPurpose": "Mettre une limite sans exiger de pardon ni rejouer une romance.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_spring",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_blitzo",
      "canonRelationship": "Blitzø est son ancien partenaire, leur rupture nourrit un conflit durable.",
      "dramaticReason": "Il tend à recentrer sur lui une scène qu’elle veut consacrer à sa propre vie.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_spring",
        "HB3_registry"
      ]
    },
    "ending": "Le concert commence sans annonce d’invité surprise. Verosika salue son équipe avant la salle et laisse le micro vide pendant quelques secondes, juste parce qu’elle le peut. Le public entend un nouveau morceau original du jeu, sans que le récit prétende réparer son passé.",
    "nextHook": "Une tournée peut maintenant se construire autour de ses choix artistiques, avec de nouvelles obligations à négocier.",
    "continuity": {
      "scope": "S1–S2, repères Spring Broken et soirées publiques",
      "incarnation": "Verosika adulte, forme succube de scène",
      "spoilerTier": "season_2",
      "guardrails": [
        "Sa colère envers Blitzø est légitime ; une campagne ne l’oblige ni à renouer ni à le séduire.",
        "Le chant de jeu ne doit pas être présenté comme un contrôle mental irrésistible attesté."
      ]
    }
  },
  "hb_fizzarolli": {
    "title": "Le visage sur la boîte",
    "premise": "Un lot AU d’anciennes boîtes utilise encore son image pour annoncer un numéro qu’il n’a pas accepté.",
    "motivation": "Décider à quoi son visage sert maintenant et qui peut annoncer sa présence.",
    "stakes": "L’autonomie d’un artiste après une relation professionnelle abusive.",
    "intro": "Fizzarolli reçoit une boîte de produits qui promet une représentation privée de sa part. Il croit d’abord à un mauvais reste de stock, puis découvre la date du lendemain. Il veut annuler la promesse sans laisser quelqu’un d’autre choisir la manière de parler à sa place.",
    "chapters": [
      {
        "title": "L’ancien partenaire",
        "opponent": "hb_blitzo",
        "stage": "cash-circus",
        "scene": "Blitzø reconnaît l’ancien procédé de vente. Ils répètent un numéro de diversion où Fizz choisit lui-même son entrée et refuse le rôle de victime à secourir.",
        "dramaticPurpose": "Faire du passé commun un outil choisi, pas une dette.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_circus",
          "HB3_oops"
        ]
      },
      {
        "title": "L’aide sans cage",
        "opponent": "hb_asmodeus",
        "stage": "ozzies-cabaret",
        "scene": "Asmodeus propose d’intervenir immédiatement. Fizz lui demande un exercice de scène où il peut annoncer son propre refus pendant qu’Ozzie tient le passage.",
        "dramaticPurpose": "Préserver une relation protectrice sans effacer sa voix.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_oops",
          "HB3_mammon"
        ]
      },
      {
        "title": "Le produit ne répond plus",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Mammon installe la boîte au centre du numéro comme si le contenu lui appartenait encore. Fizz prend la place de l’emballage puis en sort à son propre signal.",
        "dramaticPurpose": "Affronter la réduction d’une personne à une marque.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_mammon",
      "canonRelationship": "Mammon a exploité son talent dans son dispositif de spectacle.",
      "dramaticReason": "L’adversaire veut conserver le produit alors que Fizz veut exister sans promesse vendue en son nom.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_mammon",
        "HB3_registry"
      ]
    },
    "ending": "Fizzarolli retire sa silhouette des boîtes et laisse les emballages vides sur le plateau. À Ozzie’s, il annonce un petit numéro dont il a choisi le prix, le début et la fin. Le rideau se ferme avant que quelqu’un réclame un rappel.",
    "nextHook": "Un nouveau projet de duo devra lui laisser le droit de dire non, même à un ami.",
    "continuity": {
      "scope": "S1–S2, après le concours de Mammon",
      "incarnation": "Fizzarolli adulte, membres cybernétiques et tenue de scène",
      "spoilerTier": "season_2",
      "guardrails": [
        "Fizzarolli n’est pas Robo Fizz : aucune duplication industrielle de son corps n’est une capacité personnelle.",
        "Son handicap et son histoire ne servent pas de gag de démembrement ; les prothèses restent des membres maîtrisés par lui."
      ]
    }
  },
  "hb_asmodeus": {
    "title": "Le prix de la porte ouverte",
    "premise": "Un promoteur AU vend l’accès aux artistes d’Ozzie’s comme un droit attaché au billet.",
    "motivation": "Protéger les choix des artistes sans décider leurs vies à leur place.",
    "stakes": "Ce que le cabaret promet vraiment à ses clients et ceux qui y travaillent.",
    "intro": "Asmodeus reçoit un lot de billets assortis de privilèges qu’il n’a jamais accordés. Le public les croit authentiques parce que le décor porte son nom. Il peut fermer la salle, mais Fizz lui demande d’abord d’écouter ceux qui avaient choisi d’y jouer.",
    "chapters": [
      {
        "title": "La garantie du ravisseur",
        "opponent": "hb_crimson",
        "stage": "crimson-mansion",
        "scene": "Crimson conserve la première série de faux accès pour négocier une faveur. Ozzie vient récupérer le stock sans échanger un artiste contre un autre avantage.",
        "dramaticPurpose": "Refuser la logique d’otage et de transaction personnelle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_oops"
        ]
      },
      {
        "title": "La voix derrière le rideau",
        "opponent": "hb_fizzarolli",
        "stage": "ozzies-cabaret",
        "scene": "Fizz veut maintenir le numéro et fixe ses conditions. Leur répétition devient une épreuve où Ozzie doit protéger une sortie sans couper l’artiste du public.",
        "dramaticPurpose": "Rendre visible la différence entre soutien et contrôle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_oops",
          "HB3_mammon"
        ]
      },
      {
        "title": "Le billet ne donne pas tout",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Mammon défend la valeur marchande des privilèges vendus. Asmodeus brise le guichet AU et laisse une voie de sortie aux artistes avant le dernier échange.",
        "dramaticPurpose": "Opposer une relation choisie au droit d’achat que prétend Mammon.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_mammon",
      "canonRelationship": "Mammon et Asmodeus s’opposent autour du traitement de Fizzarolli.",
      "dramaticReason": "Mammon traite le désir comme une prestation due ; Ozzie refuse que le paiement remplace le choix.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_mammon"
      ]
    },
    "ending": "Les faux billets sont échangés contre un remboursement, sans accès supplémentaire aux loges. Le spectacle reprend avec une sortie visible que chacun peut utiliser. Asmodeus reste en retrait au premier salut, jusqu’à ce que Fizz lui fasse signe.",
    "nextHook": "Le cabaret devra apprendre à faire respecter cette promesse chaque soir, même quand le public proteste.",
    "continuity": {
      "scope": "S1–S2, repères Ozzie’s et concours de Mammon",
      "incarnation": "Asmodeus adulte, forme courante de souverain de la Luxure",
      "spoilerTier": "season_2",
      "guardrails": [
        "Sa puissance n’autorise pas un contrôle du consentement ou des relations affectives.",
        "Le concours et l’économie AU du jeu ne redéfinissent pas ses pouvoirs légaux ou son rang canon."
      ]
    }
  },
  "hb_beelzebub": {
    "title": "La fête et la faim",
    "premise": "Un sponsor AU transforme la soirée en concours où il faudrait consommer toujours davantage pour rester.",
    "motivation": "Rétablir une fête dont personne n’a besoin de payer l’ambiance avec son mal-être.",
    "stakes": "La confiance de ses invités et le droit de s’arrêter.",
    "intro": "Bee arrive dans sa salle et découvre une barrière entre le buffet et les invités sans ticket. Un compteur promet une récompense au dernier encore debout. Elle comprend que quelqu’un a repris les signes de sa fête pour en changer le principe.",
    "chapters": [
      {
        "title": "Le passage au calme",
        "opponent": "hb_vortex",
        "stage": "bee-party",
        "scene": "Vortex sécurise un coin où l’on peut s’éloigner du bruit. Bee teste avec lui une circulation qui ne ressemble pas à une expulsion.",
        "dramaticPurpose": "Associer son hospitalité à une protection concrète.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_bee"
        ]
      },
      {
        "title": "Pas obligée de sourire",
        "opponent": "hb_loona",
        "stage": "bee-party",
        "scene": "Loona refuse qu’on lui dise comment profiter de la soirée. Bee accepte une épreuve où gagner signifie laisser une distance plutôt que forcer un rapprochement.",
        "dramaticPurpose": "Respecter une limite sans la prendre comme une offense.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_bee"
        ]
      },
      {
        "title": "Ce qui ne se compte pas",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Mammon revendique le compteur AU comme un moteur de recettes. Bee l’affronte pour retirer le mécanisme de sa salle, pas pour interdire tout excès dans son royaume.",
        "dramaticPurpose": "Opposer l’appétit partagé au profit tiré de l’épuisement.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "HB3_bee",
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_mammon",
      "canonRelationship": "Aucune rivalité personnelle précise avec Mammon n’est établie ici ; les deux sont des Péchés.",
      "dramaticReason": "Ce duel original confronte une fête hospitalière à une logique de consommation forcée.",
      "relationshipStatus": "original_au_encounter",
      "sourceIds": [
        "HB3_bee",
        "HB3_mammon"
      ]
    },
    "ending": "Le compteur disparaît, mais le buffet reste ouvert. Bee installe un fauteuil dans un endroit où l’on entend encore la musique sans être obligé de danser. Elle rejoint Vortex lorsque le dernier invité a choisi soit de rester, soit de rentrer.",
    "nextHook": "Une prochaine fête devra accueillir des besoins incompatibles sans prétendre que Bee les connaît d’avance.",
    "continuity": {
      "scope": "S1–S2, repère Queen Bee",
      "incarnation": "Bee adulte, forme de fête habituelle",
      "spoilerTier": "season_2",
      "guardrails": [
        "Sa perception de l’ambiance n’est pas une lecture omnisciente de l’esprit.",
        "Vortex n’est pas une récompense de route et le conflit de Loona ne se résout pas en rivalité romantique obligatoire."
      ]
    }
  },
  "hb_crimson": {
    "title": "La place vide",
    "premise": "Un repas de recrutement AU tourne à l’humiliation quand personne n’accepte la chaise réservée au successeur.",
    "motivation": "Rétablir son autorité en forçant les autres à reconnaître sa version de la famille.",
    "stakes": "La peur qui tient son organisation ; il confond présence, obéissance et affection.",
    "intro": "Crimson a dressé une table trop longue pour le nombre de personnes venues. La chaise de Moxxie reste vide et les invités regardent ailleurs. Il transforme cet affront en démonstration de force, persuadé qu’un siège occupé suffira à réparer sa réputation.",
    "chapters": [
      {
        "title": "Le prix de la présence",
        "opponent": "hb_striker",
        "stage": "crimson-mansion",
        "scene": "Striker réclame un paiement avant de rester dîner. Crimson lui dispute l’accès à la caisse, découvrant que la peur n’achète pas gratuitement les compétences.",
        "dramaticPurpose": "Montrer le coût réel de son autorité transactionnelle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_oops"
        ]
      },
      {
        "title": "La famille choisie",
        "opponent": "hb_millie",
        "stage": "imp-reception",
        "scene": "Millie refuse de livrer l’emploi du temps de Moxxie. Crimson vient imposer sa demande à I.M.P. et rencontre une limite qu’il ne peut présenter comme de la désobéissance filiale.",
        "dramaticPurpose": "Opposer son cadre familial à un soutien volontaire.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_registry",
          "HB3_prime2"
        ]
      },
      {
        "title": "La chaise ne suffit pas",
        "opponent": "hb_moxxie",
        "stage": "crimson-mansion",
        "scene": "Moxxie revient récupérer un objet personnel AU laissé dans la maison. Crimson place la chaise entre lui et la sortie, tentant de transformer cette visite en retour définitif.",
        "dramaticPurpose": "Séparer la victoire d’arène du droit de posséder une personne.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_registry",
          "HB3_prime2"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_moxxie",
      "canonRelationship": "Moxxie est son fils et sa victime dans un rapport familial abusif.",
      "dramaticReason": "Crimson croit que gagner un affrontement peut obliger Moxxie à reprendre la place qu’il lui assigne.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_registry",
        "HB3_prime2"
      ]
    },
    "ending": "Crimson remonte lui-même la chaise renversée et ordonne qu’on serve le repas. La place reste vide dans le dernier plan, même si le joueur a remporté le duel. Il annonce que tout s’est déroulé comme prévu à des convives qui évitent de le regarder.",
    "nextHook": "Pour couvrir cette humiliation, il cherche un nouveau partenaire dont l’obéissance pourra s’acheter.",
    "continuity": {
      "scope": "S2, repères Exes and Oohs et Oops",
      "incarnation": "Crimson adulte, costume et arme de l’épisode choisi",
      "spoilerTier": "season_2",
      "guardrails": [
        "La route expose un chef abusif ; elle ne valide pas l’idée qu’un enfant lui doit obéissance.",
        "Son pouvoir est criminel et matériel, sans pacte d’âme ou magie de souverain inventés."
      ]
    }
  },
  "hb_sallie_may": {
    "title": "Une journée qui compte",
    "premise": "Une visite AU prévue avec Millie se retrouve absorbée par les urgences d’I.M.P.",
    "motivation": "Demander du temps partagé sans réduire sa propre vie à attendre sa sœur.",
    "stakes": "Un lien familial entretenu par des choix concrets, et non seulement par la proximité passée.",
    "intro": "Sallie May arrive avec deux billets pour une sortie, et trouve Millie déjà appelée sur une mission. Elle accepte de donner un coup de main, puis entend qu’on prévoit de la garder pour la suivante. Elle décide que la journée aura bien lieu, sans transformer sa demande en ordre.",
    "chapters": [
      {
        "title": "Pas une remplaçante",
        "opponent": "hb_moxxie",
        "stage": "imp-reception",
        "scene": "Moxxie prépare un poste de soutien pour elle. Sallie May lui fait tester le passage, puis refuse que l’efficacité de l’exercice tienne lieu d’accord pour être embauchée.",
        "dramaticPurpose": "Distinguer compétence et disponibilité permanente.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_belles",
          "HB3_registry"
        ]
      },
      {
        "title": "Le planning du patron",
        "opponent": "hb_blitzo",
        "stage": "imp-exterior",
        "scene": "Blitzø annonce une dernière urgence AU. Sallie May lui dispute la sortie du bureau pour faire comprendre qu’elle peut partir après avoir aidé.",
        "dramaticPurpose": "Poser une limite professionnelle sans renier l’entraide.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "HB3_prime2",
          "HB3_belles"
        ]
      },
      {
        "title": "À la même heure",
        "opponent": "hb_millie",
        "stage": "wrath-ranch",
        "scene": "Les sœurs se retrouvent au ranch avant la tombée du jour. Leur duel amical reprend un jeu physique familial inventé pour la route ; chacune doit écouter le rythme de l’autre.",
        "dramaticPurpose": "Faire du rival final une relation à entretenir, pas un ennemi à éliminer.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_belles",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_millie",
      "canonRelationship": "Millie est sa sœur.",
      "dramaticReason": "L’affection ne suffit pas à compenser les rendez-vous manqués dans cette histoire originale.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_belles"
      ]
    },
    "ending": "Les billets sont trop tardifs pour leur sortie, alors les sœurs restent dehors jusqu’à l’allumage des lampes du ranch. Elles choisissent ensemble une prochaine date et Sallie May repart d’abord, parce qu’elle a aussi quelque chose de prévu. La promesse tient à ce geste réciproque.",
    "nextHook": "Millie devra un jour être la visiteuse, sans transformer le ranch en annexe d’I.M.P.",
    "continuity": {
      "scope": "S1 et Hell’s Belles, repères S2 sans événement tardif imposé",
      "incarnation": "Sallie May adulte, tenue de ranch ou de sortie clairement choisie",
      "spoilerTier": "season_2",
      "guardrails": [
        "Elle possède une vie hors d’I.M.P. : une visite ne la recrute pas automatiquement.",
        "La différence entre les sœurs ne devient ni jalousie canon affirmée ni gag sur son identité."
      ]
    }
  },
  "hb_andrealphus": {
    "title": "Les marches du palais",
    "premise": "Une réception AU doit transformer son accès au palais en spectacle de légitimité.",
    "motivation": "Faire paraître inévitable une autorité encore contestée.",
    "stakes": "L’écart entre contrôler un lieu et obtenir l’adhésion de ceux qui y vivent.",
    "intro": "Andrealphus fait recouvrir les marches d’un décor de glace parfaitement symétrique. Il veut que chaque arrivée ressemble à un hommage, même celle des personnes qui le contestent. Les premières fissures viennent de ceux qu’il pensait pouvoir placer comme du mobilier.",
    "chapters": [
      {
        "title": "La mauvaise alliée",
        "opponent": "hb_stella",
        "stage": "stolas-palace",
        "scene": "Stella refuse la place latérale prévue pour elle. Andrealphus tente de contenir sa colère sans laisser voir à ses invités que leur alliance a deux volontés.",
        "dramaticPurpose": "Montrer le coût de traiter un proche comme une variable.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      },
      {
        "title": "Le témoin encombrant",
        "opponent": "hb_striker",
        "stage": "goetia-court",
        "scene": "Striker réclame publiquement une contrepartie dans cette affaire AU. Andrealphus veut le repousser hors de la salle avant que le lien entre prestige et violence louée soit trop visible.",
        "dramaticPurpose": "Faire revenir le moyen brutal sous la façade respectable.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "HB3_western"
        ]
      },
      {
        "title": "L’escalier ne vaut pas un trône",
        "opponent": "hb_stolas",
        "stage": "sinsmas-balcony",
        "scene": "Un Stolas de l’incarnation pré-sanction affronte cette mise en scène dans une simulation assumée. Andrealphus défend les marches de glace comme si leur conservation prouvait la justesse de sa position.",
        "dramaticPurpose": "Opposer la maîtrise d’un décor à l’autorité qu’il prétend en tirer.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_sinsmas",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_stolas",
      "canonRelationship": "Andrealphus est un adversaire familial et politique de Stolas.",
      "dramaticReason": "Il veut convertir une victoire visible en légitimité durable.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Les marches restent debout, mais la réception se termine plus vite que prévu. Andrealphus fait effacer les traces des invités et commande une nouvelle couche de glace. Le palais paraît impeccable lorsque la caméra recule assez pour montrer qu’il est vide.",
    "nextHook": "Il lui manque encore des témoins prêts à rester après la cérémonie.",
    "continuity": {
      "scope": "S2, repères Western Energy à Sinsmas ; confrontations AU entre instantanés",
      "incarnation": "Andrealphus adulte, forme aviaire de noble Goetia",
      "spoilerTier": "season_2",
      "guardrails": [
        "La glace est attestée dans Sinsmas, mais les géométries de piège restent des adaptations de jeu.",
        "Un duel gagné ne lui transfère ni titre de Stolas ni garde d’Octavia ; celle-ci n’est jamais une récompense."
      ]
    }
  },
  "hb_stella": {
    "title": "L’ordre qui ne revient pas",
    "premise": "Un ordre AU qu’elle croyait exécuté est suspendu sans qu’on lui demande son avis.",
    "motivation": "Reprendre l’initiative au sein d’une alliance où son frère décide de ce qui lui convient.",
    "stakes": "Son emprise sur les autres, avec la contradiction entre exiger son autonomie et nier celle de Stolas.",
    "intro": "Stella reçoit le retour intact d’un objet confié à Striker comme preuve d’exécution d’un ordre AU. Il lui annonce qu’un autre avis a changé la priorité. Elle remonte la chaîne, furieuse de découvrir dans son propre camp le contrôle qu’elle veut exercer ailleurs.",
    "chapters": [
      {
        "title": "L’employé refuse",
        "opponent": "hb_striker",
        "stage": "western-lair",
        "scene": "Striker garde la contrepartie et refuse de repartir sans nouvel accord. Stella tente de reprendre l’objet confié plutôt que d’admettre qu’il a ses propres exigences.",
        "dramaticPurpose": "Mettre à nu la fragilité de sa violence déléguée.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western"
        ]
      },
      {
        "title": "La porte de Stolas",
        "opponent": "hb_stolas",
        "stage": "stolas-palace",
        "scene": "Stolas refuse d’entendre l’échec de sa commande comme un problème qu’il devrait réparer. Le duel AU oppose son refus de céder à l’habitude de Stella d’occuper toute la pièce.",
        "dramaticPurpose": "Garder visible la responsabilité de Stella dans la menace.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_circus",
          "HB3_western"
        ]
      },
      {
        "title": "Le calcul du frère",
        "opponent": "hb_andrealphus",
        "stage": "goetia-court",
        "scene": "Andrealphus explique qu’un ordre différé lui rapporte davantage. Stella défend sa décision au milieu d’un espace qu’il a déjà organisé sans elle.",
        "dramaticPurpose": "Montrer que leur alliance de pouvoir ne signifie pas une confiance réciproque.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_western",
          "HB3_registry"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_andrealphus",
      "canonRelationship": "Andrealphus est son frère et intervient dans ses calculs autour de Stolas.",
      "dramaticReason": "Elle refuse d’être réduite à un levier dans son plan tout en réclamant le même contrôle sur les autres.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_western",
        "HB3_registry"
      ]
    },
    "ending": "Stella ferme elle-même un nouveau pli, puis le garde dans un tiroir dont elle emporte la clé. Rien ne prouve qu’elle ait renoncé à nuire ; elle a seulement cessé d’annoncer chaque intention à son frère. La dernière image ne lui offre ni pardon ni nouvelle victime.",
    "nextHook": "Le prochain conflit dépendra de ce qu’elle choisira réellement de faire de ce pli.",
    "continuity": {
      "scope": "S1–S2, repère Western Energy",
      "incarnation": "Stella adulte, tenue aristocratique de série",
      "spoilerTier": "season_2",
      "guardrails": [
        "Aucun arsenal magique, projectile de plumes ou pouvoir de glace n’est confirmé ici pour Stella.",
        "Sa violence et son projet contre Stolas ne sont ni excusés par le duel ni effacés par une fin romantique."
      ]
    }
  },
  "hb_mammon": {
    "title": "La caisse applaudit",
    "premise": "Une soirée AU reste populaire alors qu’une partie du public n’a rien acheté.",
    "motivation": "Transformer chaque réaction de la salle en revenu mesurable.",
    "stakes": "La possibilité, insupportable pour lui, qu’une valeur existe sans lui rapporter d’argent.",
    "intro": "Mammon écoute un enregistrement de sa salle et entend des applaudissements après une coupure publicitaire. La caisse est pourtant restée immobile. Il descend vérifier quel élément du spectacle a osé susciter une réaction gratuite.",
    "chapters": [
      {
        "title": "Le geste non facturé",
        "opponent": "hb_glitz",
        "stage": "mammon-show",
        "scene": "Glitz a ajouté une pose finale que le conducteur ne prévoyait pas. Mammon entre sur le plateau pour reprendre ce moment et y fixer son propre signal.",
        "dramaticPurpose": "Montrer sa volonté de posséder jusqu’aux initiatives rentables des artistes.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      },
      {
        "title": "L’image qui s’en va",
        "opponent": "hb_fizzarolli",
        "stage": "mammon-show",
        "scene": "Fizzarolli veut emporter un décor portant son image. Mammon lui dispute l’objet AU comme si l’ancienne association professionnelle suffisait à l’immobiliser.",
        "dramaticPurpose": "Faire buter sa propriété commerciale supposée sur une personne réelle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      },
      {
        "title": "Le rappel gratuit",
        "opponent": "hb_asmodeus",
        "stage": "ozzies-cabaret",
        "scene": "À Ozzie’s, un rappel est annoncé sans nouveau billet dans cette histoire AU. Mammon vient reprendre le micro et exiger un guichet supplémentaire.",
        "dramaticPurpose": "Affronter une scène où son calcul n’est pas la seule règle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_asmodeus",
      "canonRelationship": "Asmodeus s’oppose à son traitement de Fizzarolli.",
      "dramaticReason": "Ozzie incarne une limite à ce que Mammon prétend pouvoir acheter et revendre.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_mammon"
      ]
    },
    "ending": "Mammon installe une machine qui fait applaudir la salle à chaque pièce insérée. Le test est assourdissant et le compteur satisfait enfin ses attentes. Quand il se retourne vers les gradins, les derniers spectateurs sont déjà partis.",
    "nextHook": "Il prépare une campagne pour vendre le silence qu’il vient de fabriquer.",
    "continuity": {
      "scope": "S2, repère du concours annuel",
      "incarnation": "Mammon adulte, forme habituelle de maître de spectacle",
      "spoilerTier": "season_2",
      "guardrails": [
        "Son rang de Péché de l’Avarice n’est pas un pouvoir automatiquement applicable aux âmes de tous les adversaires.",
        "Les clauses et frais de campagne sont une satire AU, pas de nouveaux contrats canoniques."
      ]
    }
  },
  "hb_vortex": {
    "title": "Fin de service",
    "premise": "Une tournée AU a supprimé le remplacement qui devait permettre sa sortie de service.",
    "motivation": "Assurer la protection promise sans devenir disponible à toute heure.",
    "stakes": "Une limite professionnelle qui laisse aussi une place à sa vie personnelle.",
    "intro": "Vortex découvre que le dernier trajet de la soirée lui a été attribué alors qu’il devait être remplacé. Il pourrait partir sans prévenir ou accepter encore, mais choisit de mettre le problème sur la table. Avant cela, il vérifie qu’aucune personne ne paiera physiquement le prix du manque d’organisation.",
    "chapters": [
      {
        "title": "Passage de relais",
        "opponent": "hb_loona",
        "stage": "imp-reception",
        "scene": "Loona teste avec lui une extraction simple et indique où sa propre disponibilité s’arrête. Le duel vérifie une coopération de terrain sans lui imposer un emploi.",
        "dramaticPurpose": "Construire une solution qui ne transfère pas la contrainte à quelqu’un d’autre.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_spring",
          "HB3_bee"
        ]
      },
      {
        "title": "Le temps laissé vide",
        "opponent": "hb_beelzebub",
        "stage": "bee-party",
        "scene": "Bee prépare un accueil qui fonctionne même si Vortex arrive plus tard. Leur exercice met à l’épreuve sa tendance à rester au centre de tous les passages.",
        "dramaticPurpose": "Lui permettre d’accepter une aide sans devoir surveiller toute la salle.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_bee"
        ]
      },
      {
        "title": "La dernière escorte",
        "opponent": "hb_verosika",
        "stage": "spring-broken-beach",
        "scene": "Verosika veut vérifier la sortie du concert avant d’accepter un autre dispositif. Vortex tient son rôle pendant l’épreuve puis lui remet les clés du véhicule au signal convenu.",
        "dramaticPurpose": "Prouver qu’un service fiable peut avoir une fin clairement annoncée.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_spring"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_verosika",
      "canonRelationship": "Verosika est liée à son activité de garde du corps.",
      "dramaticReason": "Le rival final est professionnel : faire reconnaître une limite sans transformer la patronne en ennemie canon.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_spring",
        "HB3_registry"
      ]
    },
    "ending": "Le dernier véhicule part avec un relais prévenu et un itinéraire communiqué. Vortex retire son badge avant de rejoindre Bee ; il garde son téléphone, mais le pose face contre la table. Le plan dure assez longtemps pour montrer qu’il peut rester assis.",
    "nextHook": "Une prochaine mission devra être acceptée avant d’être inscrite sur son planning.",
    "continuity": {
      "scope": "S1–S2, repères Spring Broken et Queen Bee",
      "incarnation": "Vortex adulte, forme hellhound habituelle",
      "spoilerTier": "season_2",
      "guardrails": [
        "Son travail de garde du corps n’établit pas un arsenal complet ou une maîtrise martiale précise.",
        "Son lien avec Bee est respecté ; Loona n’est jamais remise au gagnant comme partenaire."
      ]
    }
  },
  "hb_glitz": {
    "title": "L’entrée en double",
    "premise": "Un montage AU réduit le numéro du duo à une seule silhouette interchangeable.",
    "motivation": "Obtenir une entrée où son travail puisse être identifié sans détruire le duo.",
    "stakes": "La reconnaissance personnelle à l’intérieur d’une image vendue par deux.",
    "intro": "Glitz revoit un extrait promotionnel et ne peut plus distinguer laquelle des deux apparaît sur le dernier plan. Mammon trouve ce flou commode, puisqu’il lui suffit d’annoncer le duo. Elle veut reprendre l’entrée, gagner sa place et prouver que ce nom double contient deux artistes.",
    "chapters": [
      {
        "title": "Deux départs",
        "opponent": "hb_glam",
        "stage": "mammon-show",
        "scene": "Glam tient le départ habituel du numéro. Glitz propose un duel de marques au sol où chacune doit conserver son propre trajet au lieu de masquer l’autre.",
        "dramaticPurpose": "Poser la rivalité artistique comme négociation interne, sans inventer une haine canon.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon",
          "HB3_registry"
        ]
      },
      {
        "title": "L’économie d’une silhouette",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Mammon préfère la version facile à reproduire. Glitz lui dispute le centre de la scène pour rendre visible le coût de cette simplification.",
        "dramaticPurpose": "Faire de la distinction individuelle un enjeu face à la marque.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      },
      {
        "title": "À la même hauteur",
        "opponent": "hb_fizzarolli",
        "stage": "ozzies-cabaret",
        "scene": "Une répétition AU face à Fizzarolli lui offre un concurrent au style reconnaissable. Elle doit gagner l’espace avec sa propre entrée plutôt qu’en copiant une allonge cybernétique.",
        "dramaticPurpose": "La mesurer à un artiste identifié sans lui voler son motif.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_fizzarolli",
      "canonRelationship": "Fizzarolli et le duo sont concurrents au concours de Mammon.",
      "dramaticReason": "Il représente la reconnaissance d’un style personnel qu’elle cherche à défendre dans cette route AU.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_mammon"
      ]
    },
    "ending": "Le nouveau plan de promotion garde les deux artistes entièrement dans le cadre. Glitz refuse la coupe qui l’aurait isolée en effaçant Glam, puis réclame une lumière distincte pour chacune. Elle n’a pas perdu le goût de gagner ; elle a précisé ce qu’elle veut voir sur la victoire.",
    "nextHook": "Le duo devra décider quel désaccord peut enrichir son prochain numéro sans devenir une rupture.",
    "continuity": {
      "scope": "S2, repère du concours de Mammon",
      "incarnation": "Glitz adulte, modèle individuel du duo à verrouiller sur référence",
      "spoilerTier": "season_2",
      "guardrails": [
        "Ne pas permuter son modèle avec celui de Glam : la référence et les noms restent liés aux assets individuels.",
        "Aucune eau, glace, hypnose ou espèce précise n’est déduite de son apparence aquatique."
      ]
    }
  },
  "hb_glam": {
    "title": "Le temps du second salut",
    "premise": "Un rappel AU coupe la fin de Glam pour vendre plus vite le numéro suivant.",
    "motivation": "Défendre la durée de son travail sans demander à Glitz de disparaître pour lui laisser une place.",
    "stakes": "La maîtrise du rythme et la continuité d’un duo que la programmation voudrait rendre remplaçable.",
    "intro": "Glam termine un mouvement et découvre que le rideau est déjà descendu. On lui explique que son arrêt était assez beau pour servir de transition. Elle veut garder ce silence à elle, non comme un temps mort vendu au prochain spectacle.",
    "chapters": [
      {
        "title": "Le croisement conservé",
        "opponent": "hb_glitz",
        "stage": "mammon-show",
        "scene": "Glitz veut conserver l’entrée rapide qui fait leur efficacité. Glam défend un essai où leurs trajectoires se croisent sans qu’aucune coupe la conclusion de l’autre.",
        "dramaticPurpose": "Donner une forme jouable à la négociation entre deux artistes.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon",
          "HB3_registry"
        ]
      },
      {
        "title": "Tenir une salle",
        "opponent": "hb_verosika",
        "stage": "ozzies-cabaret",
        "scene": "Dans cette rencontre AU, Verosika teste un final capable de tenir l’attention sans accélérer. Glam doit maintenir sa place sous une pression scénique très différente.",
        "dramaticPurpose": "Lui faire éprouver un autre rapport au public sans en faire une élève canon.",
        "relationshipBasis": "original_au_encounter",
        "sourceIds": [
          "HB3_spring",
          "HB3_mammon"
        ]
      },
      {
        "title": "Le dernier temps n’est pas à vendre",
        "opponent": "hb_mammon",
        "stage": "mammon-show",
        "scene": "Mammon déclenche la fermeture du rideau avant la fin. Glam lui dispute la commande et termine son geste alors que son signal réclame déjà un autre numéro.",
        "dramaticPurpose": "Transformer une différence de rythme en refus concret du contrôle extérieur.",
        "relationshipBasis": "canon_relationship",
        "sourceIds": [
          "HB3_mammon"
        ]
      }
    ],
    "rival": {
      "fighterId": "hb_mammon",
      "canonRelationship": "Mammon organise le concours auquel participe le duo.",
      "dramaticReason": "Il veut convertir chaque intervalle en produit, même si cela supprime la décision artistique.",
      "relationshipStatus": "canon_relationship",
      "sourceIds": [
        "HB3_mammon"
      ]
    },
    "ending": "Le rideau descend après le second salut. Glam reste un instant dans l’obscurité avant de rejoindre Glitz ; aucune n’a besoin de mimer le geste de l’autre. Au prochain départ, elles attendent de se voir prêtes, et la salle attend avec elles.",
    "nextHook": "Le duo possède maintenant un rythme à défendre lorsqu’un nouveau contrat promettra plus de visibilité.",
    "continuity": {
      "scope": "S2, repère du concours de Mammon",
      "incarnation": "Glam adulte, modèle individuel du duo à verrouiller sur référence",
      "spoilerTier": "season_2",
      "guardrails": [
        "Ses capacités d’acrobate ne prouvent ni pouvoir élémentaire ni vol autonome illimité.",
        "Les émotions et choix de cette campagne sont AU ; la série n’établit pas ici une opposition personnelle durable à Glitz."
      ]
    }
  }
} as const satisfies Readonly<Record<string, StoryRoute>>;
