import type { PentagramStageId } from '../lib/pentagram-stages';
import type { NarrativeFilters } from './campaign';

export interface GlobalCampaignChapter {
  id: string;
  title: string;
  fighterId: string;
  opponentId: string;
  stageId: PentagramStageId;
  scene: string;
  objective: string;
  dialogue: readonly { speakerId: string; line: string }[];
  afterVictory: string;
  retry: string;
}

/**
 * An original AU crossover, separate from the 43 personal routes.
 * Hazbin residents stay in Pride. Hellborn travel on their own side of the story.
 * No victory changes a soul contract, grants redemption, or establishes a canon meeting.
 */
export const GLOBAL_CAMPAIGN = {
  id: 'signal-libre',
  version: 1,
  title: 'La nuit du signal libre',
  subtitle: 'Deux équipes, neuf chapitres, une porte à laisser ouverte.',
  status: 'simulation_au',
  spoilerTier: 'season_2',
  premise: 'Une invitation falsifiée transforme les portes ouvertes de l’hôtel en spectacle sous contrat. L’équipe de Charlie et I.M.P. suivent séparément les copies de l’accord, puis choisissent de rendre la parole à ceux que la publicité voulait exposer.',
  intro: 'Charlie prépare une soirée où chacun peut venir, parler ou repartir. À l’autre bout de Pride, I.M.P. reçoit une mission de récupération : retrouver la caisse contenant les autorisations de tournage. Quand Angel découvre son nom sur une affiche qu’il n’a jamais approuvée, la même question relie les deux équipes : qui a signé pour les absents ? Cette rencontre entre les séries, ses contrats et tous ses duels appartiennent à une continuité AU originale.',
  continuity: 'Simulation AU originale inspirée des personnages des deux séries. Les rencontres inter-séries, le montage publicitaire et leurs conséquences sont inventés. Les lieux sont des reconstitutions de jeu. Les contrats d’âme et la rédemption ne sont jamais réglés par une victoire d’arène.',
  ending: 'Le dernier écran s’éteint, mais les copies du document continuent de circuler. Charlie ouvre sans caméra. Angel décide de rester au bar et n’a pas à expliquer pourquoi ; son contrat n’a pas disparu, et son choix de ce soir lui appartient. Loona conserve le numéro de la réception, Moxxie classe le reçu et Blitzø réclame le paiement de la récupération, sans ajouter de nom à la liste. Fizz retourne à sa scène avec son propre texte. Alastor laisse sa fréquence vide juste assez longtemps pour que l’on entende les conversations dans le hall. Aucun adversaire n’a changé de nature, aucune âme n’a été déclarée sauvée. La première invitée franchit le seuil, regarde les chaises et choisit celle qui lui plaît.',
  nextHook: 'Au matin, l’hôtel garde une copie vierge de l’invitation. La prochaine signature devra venir de la personne qu’elle engage.',
  chapters: [
    {
      id: 'seuil-ouvert', title: 'Une invitation sans petites lignes',
      fighterId: 'charlie', opponentId: 'vaggie', stageId: 'hotel-lobby',
      scene: 'Une affiche promet une démonstration de rédemption en direct et porte le nom de l’hôtel. Charlie n’a autorisé qu’une visite. Avant de chercher le responsable, Vaggie exige de sécuriser le hall : si une foule arrive, la porte devra rester une sortie aussi bien qu’une entrée. Elles répètent un duel de protection, sans public, pendant qu’Angel compare l’affiche à l’invitation originale.',
      objective: 'Tenir le seuil pendant l’exercice de Vaggie et préparer une sortie libre.',
      dialogue: [
        { speakerId: 'charlie', line: 'Je veux qu’ils puissent entrer. Je veux aussi qu’ils puissent changer d’avis.' },
        { speakerId: 'vaggie', line: 'Alors on commence par garder ce passage.' },
      ],
      afterVictory: 'Le hall est prêt. Angel repère un numéro de livraison au dos de l’affiche ; le même numéro figure sur une mission reçue par I.M.P.',
      retry: 'Vaggie interrompt la répétition. Le passage est remis en place ; Charlie peut reprendre le même exercice.',
    },
    {
      id: 'caisse-imp', title: 'Le nom au bas du reçu',
      fighterId: 'hb_blitzo', opponentId: 'hb_moxxie', stageId: 'imp-reception',
      scene: 'Le client a payé pour récupérer une caisse, sans dire à qui appartiennent les papiers qu’elle contient. Blitzø veut partir immédiatement ; Moxxie refuse de traiter une liste de noms comme une liste de cibles. Il lui propose une répétition de l’extraction dans le bureau, avec une consigne claire : rapporter les documents et laisser leurs propriétaires en vie. Le duel met leur coordination à l’épreuve avant le départ.',
      objective: 'Terminer l’exercice d’extraction et accepter une mission de récupération précise.',
      dialogue: [
        { speakerId: 'hb_moxxie', line: 'Une adresse de livraison ne nous dit pas qui a consenti.' },
        { speakerId: 'hb_blitzo', line: 'D’accord. On ramène la caisse. Les petites lignes, tu me les lis en route.' },
      ],
      afterVictory: 'Le reçu mène au matériel d’un plateau des Vees. Loona appelle le numéro de retour : Angel répond depuis le studio.',
      retry: 'Moxxie marque une pause avant le départ. La caisse factice reste au même endroit et la répétition reprend sans perdre les informations trouvées.',
    },
    {
      id: 'prise-originale', title: 'La prise que personne ne signe',
      fighterId: 'angeldust', opponentId: 'valentino', stageId: 'vee-broadcast-studio',
      scene: 'Angel retrouve l’invitation utilisée comme accessoire de tournage. Valentino veut conserver son image dans la bande promotionnelle. Angel ne prétend pas annuler son contrat en remportant un duel ; il veut seulement atteindre la sortie avec une copie du montage et choisir s’il participe à cette soirée. Un affrontement d’arène ouvre un passage pendant que Husk l’attend au téléphone.',
      objective: 'Gagner le passage jusqu’à la copie du montage et quitter le plateau.',
      dialogue: [
        { speakerId: 'angeldust', line: 'Mon nom sur ton affiche ne dit pas ce que je ferai ce soir.' },
        { speakerId: 'valentino', line: 'Tu crois pouvoir décider du moment où le spectacle s’arrête ?' },
      ],
      afterVictory: 'Angel emporte une copie, pas une libération magique. Le numéro du transporteur permet à Loona de vérifier où la caisse a été détournée.',
      retry: 'Angel recule avant que la confrontation ne se referme. Le soutien de Husk reste disponible ; le duel de ce chapitre peut être retenté.',
    },
    {
      id: 'bon-passage', title: 'Reconnaître celui qui passe',
      fighterId: 'hb_loona', opponentId: 'hb_vortex', stageId: 'imp-exterior',
      scene: 'Vortex a accompagné un convoi portant le même numéro, sans prendre part au contrat publicitaire. Il ne remettra pas son double à quelqu’un qui se contente d’agiter un badge. Loona lui expose ce qu’Angel a trouvé. Ils règlent ensuite, par un exercice convenu, le passage à tenir si l’équipe revient avec des personnes poursuivies. La confiance vient de cette conversation ; le duel vérifie leur préparation.',
      objective: 'Passer le contrôle de Vortex pendant l’exercice et sécuriser le point de rendez-vous.',
      dialogue: [
        { speakerId: 'hb_vortex', line: 'Je peux reconnaître un badge. Je préfère savoir qui je laisse entrer.' },
        { speakerId: 'hb_loona', line: 'Alors garde mon numéro. Je préviendrai avant qu’on revienne.' },
      ],
      afterVictory: 'Vortex confie le double du bordereau. Une partie du matériel doit passer par un dépôt de Carmilla ; l’autre a quitté Pride avec Striker.',
      retry: 'Vortex suspend l’exercice. Le bordereau reste à l’abri et Loona peut recommencer le passage.',
    },
    {
      id: 'chargement-ferme', title: 'Ce que l’atelier laisse sortir',
      fighterId: 'vaggie', opponentId: 'carmilla', stageId: 'carmine-industries',
      scene: 'Le dépôt de Carmilla contient une caisse d’équipements ordinaires destinés au plateau. Vaggie demande qu’elle soit retenue le temps de comparer les bons. Carmilla refuse que son quai devienne un champ de bataille improvisé : elle teste la discipline de Vaggie dans une confrontation encadrée. Les résidents de l’hôtel restent à Pentagram City tandis que l’équipe hellborn poursuit la seconde livraison.',
      objective: 'Achever l’épreuve de Carmilla pour organiser le retrait du matériel sans exposer le quai.',
      dialogue: [
        { speakerId: 'carmilla', line: 'Tu protèges une porte. Pense aussi à ceux qui travaillent derrière.' },
        { speakerId: 'vaggie', line: 'Personne ici ne servira de diversion.' },
      ],
      afterVictory: 'Les deux bons portent des clauses différentes. Vaggie garde le premier à Pride ; Millie suit le second jusqu’au repaire de Striker.',
      retry: 'Carmilla arrête l’épreuve avant la zone de chargement. Vaggie reprend au début de ce duel ; les copies déjà trouvées sont conservées.',
    },
    {
      id: 'seconde-copie', title: 'Le prix de la seconde copie',
      fighterId: 'hb_millie', opponentId: 'hb_striker', stageId: 'western-lair',
      scene: 'Striker a détourné la caisse afin de revendre la signature qui permettrait de remettre le spectacle en route. Millie retrouve les papiers dans son repaire. Elle ne négocie pas le nom de ses collègues : le duel lui permet de dégager la caisse, puis de la rapporter à Moxxie. Cette mission et ce marché sont propres à cette fiction AU.',
      objective: 'Récupérer la seconde copie et quitter le repaire avec les papiers intacts.',
      dialogue: [
        { speakerId: 'hb_striker', line: 'Quelqu’un finira par payer pour récupérer ces noms.' },
        { speakerId: 'hb_millie', line: 'Tu peux garder ton prix. Je prends la caisse.' },
      ],
      afterVictory: 'Le document révèle un achat de droits promotionnels par Mammon. Fizz accepte d’examiner la campagne dont son visage fait aussi partie.',
      retry: 'Millie se replie au bord du repaire. La tentative suivante recommence ce duel, avec les cinq chapitres précédents déjà validés.',
    },
    {
      id: 'rappel-refuse', title: 'Un rappel à son nom',
      fighterId: 'hb_fizzarolli', opponentId: 'hb_mammon', stageId: 'mammon-show',
      scene: 'Mammon a réservé une séquence promotionnelle pour vendre la soirée comme un nouveau numéro. Fizz monte sur le plateau avec une copie de l’affiche. Il refuse d’y jouer le rôle qu’on lui a choisi et transforme le duel d’exhibition prévu en occasion de faire entendre ce refus. La victoire coupe le numéro de ce soir ; elle ne réécrit ni le passé ni les rapports de pouvoir.',
      objective: 'Terminer le duel du plateau et interrompre le rappel publicitaire annoncé sans accord.',
      dialogue: [
        { speakerId: 'hb_mammon', line: 'Le public a déjà vu l’affiche. Ça compte comme une promesse !' },
        { speakerId: 'hb_fizzarolli', line: 'Alors il va m’entendre la corriger.' },
      ],
      afterVictory: 'Le refus de Fizz est enregistré. Avec les deux copies du contrat, il peut maintenant être diffusé sans les coupes prévues par la régie de Vox.',
      retry: 'Fizz quitte momentanément la marque centrale. Il peut revenir jouer le même duel ; aucune signature supplémentaire n’est créée par une défaite.',
    },
    {
      id: 'frequence-vide', title: 'Un silence dans la régie',
      fighterId: 'alastor', opponentId: 'vox', stageId: 'vee-broadcast-studio',
      scene: 'Alastor n’offre aucune aide désintéressée : il veut priver Vox de l’exclusivité du récit. Charlie accepte qu’il ouvre une fenêtre d’émission, sans lui céder l’accueil de l’hôtel. Dans le studio, leur rivalité devient un duel pour le contrôle momentané de la diffusion. Pendant cet intervalle, les copies et le refus de Fizz sont rendus publics ; leur existence ne dépendra plus d’un seul écran.',
      objective: 'Gagner l’intervalle de diffusion nécessaire à la publication des copies.',
      dialogue: [
        { speakerId: 'vox', line: 'Sans mon signal, ton petit scandale reste une conversation de couloir.' },
        { speakerId: 'alastor', line: 'Les couloirs ont parfois une excellente acoustique.' },
      ],
      afterVictory: 'Les copies circulent. Velvette se rend à l’hôtel avec une dernière proposition : reprendre l’ouverture sous une image contrôlée, en échange de la fin de la campagne hostile.',
      retry: 'La fenêtre de diffusion se referme. Les documents restent copiés ; Alastor peut disputer à nouveau ce même contrôle de régie.',
    },
    {
      id: 'porte-sans-camera', title: 'La porte sans caméra',
      fighterId: 'charlie', opponentId: 'velvette', stageId: 'hotel-exterior',
      scene: 'Velvette propose à Charlie une image impeccable : une victoire, un sourire et des invités qui suivent le conducteur. Charlie refuse de faire de leur accueil la récompense d’un spectacle. Lorsque Velvette impose un dernier duel sur le perron, l’équipe garde les sorties ouvertes. Charlie défend l’accès à l’hôtel, puis doit tenir sa promesse après la victoire : laisser chacun décider, même si personne ne reste.',
      objective: 'Défendre le seuil et ouvrir la soirée sans imposer de rôle aux invités.',
      dialogue: [
        { speakerId: 'velvette', line: 'Une bonne image peut leur faire oublier toute cette histoire.' },
        { speakerId: 'charlie', line: 'Je ne veux pas qu’ils oublient. Je veux qu’ils puissent choisir.' },
      ],
      afterVictory: 'Le perron se vide de ses caméras. Charlie rentre la première, déplace une chaise et laisse la porte ouverte.',
      retry: 'L’équipe protège toujours les sorties. Charlie peut reprendre le dernier duel sans rejouer les huit chapitres validés.',
    },
  ] as const satisfies readonly GlobalCampaignChapter[],
} as const;

export const GLOBAL_CAMPAIGN_ENDING_ID = `${GLOBAL_CAMPAIGN.id}:${GLOBAL_CAMPAIGN.version}`;
export const GLOBAL_CAMPAIGN_CAST = [...new Set(GLOBAL_CAMPAIGN.chapters.flatMap(chapter => [chapter.fighterId, chapter.opponentId]))];

export function campaignAvailable(rosterIds: readonly string[], filters: Pick<NarrativeFilters, 'allowSeasonTwo'> = {}): boolean {
  return filters.allowSeasonTwo !== false && GLOBAL_CAMPAIGN_CAST.every(id => rosterIds.includes(id));
}
