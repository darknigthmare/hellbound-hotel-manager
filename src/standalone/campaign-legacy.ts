import type { PentagramStageId } from '../lib/pentagram-stages';

export interface StoryChapter {
  opponent: string;
  stage: PentagramStageId;
  scene: string;
}

export interface StoryRoute {
  title: string;
  intro: string;
  chapters: readonly [StoryChapter, StoryChapter, StoryChapter];
  ending: string;
}

function duel(opponent: string, stage: PentagramStageId, scene: string): StoryChapter {
  return { opponent, stage, scene };
}

// Original exhibition fiction. The scenes use the locations available to the standalone.
export const LEGACY_STORY_ROUTES: Readonly<Record<string, StoryRoute>> = {
  hb_vortex: {
    title: 'Le passage libre',
    intro: 'Pour une soirée d’exhibition, Vortex doit garder libre le chemin entre la scène et la sortie. Les techniciens ont déplacé les barrières après sa première ronde. Il refait le parcours avant l’arrivée des invités.',
    chapters: [
      duel('hb_verosika', 'vee-broadcast-studio', 'Verosika répète sa sortie sur un plateau loué. Vortex lui propose un essai à pleine vitesse pour vérifier que personne ne restera coincé derrière les enceintes.'),
      duel('hb_loona', 'imp-reception', 'Loona a trouvé un raccourci dans le plan de circulation. Ils essaient chacun de tenir le passage pendant que les autres installent le matériel.'),
      duel('hb_beelzebub', 'bee-party', 'Bee veut traverser la salle pour rejoindre les invités du fond. Vortex lui ouvre une voie, puis la laisse tester elle-même chaque changement de direction.'),
    ],
    ending: 'La dernière barrière est déplacée avant l’ouverture des portes. Vortex reste près de la sortie, assez loin des enceintes pour entendre ceux qui ont besoin de passer. Bee lui garde une place pour la fin de la soirée.',
  },
  hb_glitz: {
    title: 'La marque déplacée',
    intro: 'Glitz retrouve sa marque de départ déplacée d’un pas vers le bord du plateau. Pour une nouvelle exhibition, elle veut reprendre le numéro depuis son entrée, avec assez de place pour décider elle-même de son dernier mouvement.',
    chapters: [
      duel('hb_glam', 'mammon-show', 'Glam a déjà réglé le croisement au centre. Les jumelles reprennent le passage pour choisir laquelle prendra la ligne intérieure.'),
      duel('hb_fizzarolli', 'ozzies-cabaret', 'Fizzarolli connaît une scène où les marques changent chaque soir. Glitz y essaie son nouveau départ pendant qu’il lui dispute le prochain temps fort.'),
      duel('hb_mammon', 'mammon-show', 'Mammon a remis la marque au bord du plateau pour dégager la vue de sa tribune. Glitz entre avant le signal et ramène le centre du numéro sous ses propres pieds.'),
    ],
    ending: 'Glitz retire le ruban du sol et le roule entre ses doigts. Au prochain départ, Glam se place à sa hauteur. Elles commencent lorsque leurs regards se croisent, sans attendre le geste de la tribune.',
  },
  hb_glam: {
    title: 'Un temps de plus',
    intro: 'Le conducteur d’une exhibition coupe le dernier mouvement de Glam pour avancer le salut final. Elle garde la page d’origine et cherche un espace où le numéro pourra aller jusqu’au bout.',
    chapters: [
      duel('hb_glitz', 'mammon-show', 'Glitz veut garder l’entrée rapide. Glam lui propose un essai où chacune conserve un temps entier pour terminer son passage.'),
      duel('hb_verosika', 'vee-broadcast-studio', 'Verosika répète un final sur le plateau voisin. Glam teste son arrêt face à une partenaire qui refuse de laisser tomber le rythme.'),
      duel('hb_asmodeus', 'ozzies-cabaret', 'Asmodeus lui ouvre la scène du cabaret pour un dernier essai. Glam traverse le plateau et défend jusqu’au silence la durée qu’elle a choisie.'),
    ],
    ending: 'Glam termine le mouvement avant de saluer. Le silence dure un instant de plus que prévu. Dans les coulisses, elle rend à Glitz le conducteur corrigé, avec deux places pour signer.',
  },
  hz_katie_killjoy: {
    title: 'Le dernier mot',
    intro: 'Un sujet préparé par Katie revient du montage avec sa dernière phrase coupée. Elle quitte le bureau de 666 News avec la bande originale et exige une place dans le prochain direct.',
    chapters: [
      duel('hz_tom_trench', 'vee-broadcast-studio', 'Tom répète déjà la transition vers la publicité sur un plateau loué. Katie lui dispute la marque au sol pour récupérer les secondes qui lui manquent.'),
      duel('charlie', 'hotel-exterior', 'Charlie refuse de refaire l’entrée spectaculaire demandée par la présentatrice. Katie descend sur le perron et tente d’imposer elle-même le cadrage de son reportage.'),
      duel('vox', 'vee-broadcast-studio', 'Vox a remplacé le sujet par un écran publicitaire. Le voyant rouge s’allume avant que Katie ait regagné son siège. Elle garde la bande en main et avance vers le centre du plateau.'),
    ],
    ending: 'Le sujet passe enfin sans coupe. Katie attend que le voyant s’éteigne pour barrer le nom du monteur. Sur son conducteur, elle réserve déjà deux fois plus de temps au bulletin suivant.',
  },
  hz_tom_trench: {
    title: 'Trente secondes de direct',
    intro: 'Tom reçoit un conducteur où toutes ses interventions tiennent dans la marge. Une panne de retour lui laisse trente secondes à remplir seul. Il part chercher sa bande avant qu’on lui retire aussi ce créneau.',
    chapters: [
      duel('velvette', 'vee-broadcast-studio', 'Velvette a découpé son essai en une série de réactions muettes. Tom vient récupérer la version avec le son pendant qu’elle teste le rythme du montage.'),
      duel('husk', 'hotel-bar', 'La cassette a été laissée au bar avec une facture impayée. Husk dégage le comptoir et demande au présentateur de tenir sa place le temps de retrouver le bon reçu.'),
      duel('hz_katie_killjoy', 'vee-broadcast-studio', 'Katie a déplacé sa chaise juste hors du champ. Le compte à rebours démarre. Tom pose son conducteur sur la table et se remet sur sa marque avant le générique.'),
    ],
    ending: 'Tom termine sa phrase pendant que le voyant est encore rouge. Il ne reste qu’une seconde avant la coupure. Il la garde, assis bien droit, puis range lui-même sa cassette.',
  },
  hb_stella: {
    title: 'Le carton sans nom',
    intro: 'Au palais, Stella découvre un carton d’invitation qui ne porte aucun nom. Tous les invités prétendent l’avoir reçu d’un autre. Elle traverse les salons pour trouver qui a décidé de la place des convives.',
    chapters: [
      duel('hb_striker', 'stolas-palace', 'Striker attend dans une galerie avec le pli cacheté. Stella veut le reprendre avant qu’il ne réclame des frais pour une livraison qu’elle ne reconnaît pas.'),
      duel('hb_andrealphus', 'stolas-palace', 'Andrealphus a disposé les sièges selon son propre plan. Stella repousse le premier fauteuil pour lui rappeler que la réception porte encore son nom.'),
      duel('hb_stolas', 'stolas-palace', 'Stolas tient la liste originale à l’entrée du salon. Stella exige qu’il lise le dernier nom. Entre eux, le carton vide occupe déjà toute la table.'),
    ],
    ending: 'Stella déchire le carton et fait déplacer sa chaise au bout de la table. La réception commence avec un couvert de moins. Elle attend que chacun remarque lequel.',
  },
  hb_mammon: {
    title: 'Les frais du rappel',
    intro: 'Le tableau de caisse de Mammon affiche un rappel gratuit. Persuadé qu’une clause a disparu, il descend de sa tribune avec le contrat et veut reprendre chaque numéro depuis le début.',
    chapters: [
      duel('hb_crimson', 'crimson-mansion', 'Crimson conserve le reçu de location du matériel. Mammon réclame la colonne des suppléments avant qu’une autre signature ne vienne la recouvrir.'),
      duel('hb_fizzarolli', 'mammon-show', 'Fizzarolli a laissé une marque vide au milieu du plateau. Mammon s’y installe pour refaire lui-même le passage dont il conteste la durée.'),
      duel('hb_asmodeus', 'ozzies-cabaret', 'Asmodeus a accueilli les artistes après le spectacle. Mammon se présente avec sa facture, décidé à faire compter les applaudissements dans le prix de la salle.'),
    ],
    ending: 'Mammon ressort avec sa facture intacte et aucune signature. De retour au guichet, il ajoute une ligne « frais de réclamation » au prochain contrat. Le panneau du rappel gratuit reste visible derrière lui.',
  },
  hz_mimzy: {
    title: 'La recette du rappel',
    intro: 'Mimzy promet une soirée au bénéfice de l’hôtel. Quand la recette disparaît, personne ne s’étonne de la voir déjà près de la sortie. Elle pose son manteau et revient sur scène.',
    chapters: [
      duel('husk', 'hotel-bar', 'Husk a trouvé une pièce dans le piano. Il ferme le comptoir et met Mimzy au défi de refaire son numéro, pas à pas, jusqu’au moment où le couvercle a claqué.'),
      duel('velvette', 'vee-broadcast-studio', 'Sur une vidéo de Velvette, deux mains emportent la caisse derrière le rideau. Mimzy entre sur le plateau au beau milieu de la rediffusion pour faire reculer l’image.'),
      duel('alastor', 'hotel-lobby', 'Alastor a racheté la dette de la soirée. Il lui tend la caisse et allume son micro pour recueillir ses remerciements. Mimzy veut rendre l’argent sans lui devoir un autre rappel.'),
    ],
    ending: 'Husk compte jusqu’à la dernière pièce. Mimzy glisse son propre cachet dans le bocal. Du bar, elle entend Charlie annoncer son nom une seconde fois. Cette fois elle y retourne les mains vides.',
  },
  hb_sallie_may: {
    title: 'La cloche des deux sœurs',
    intro: 'La vieille cloche du ranch arrive chez I.M.P. dans un carton adressé à Millie. Sallie May avait demandé qu’on répare le battant. Le bon de livraison porte déjà la mention « accessoire de tournage ».',
    chapters: [
      duel('hb_moxxie', 'imp-reception', 'Moxxie a rangé le battant dans un étui et répète son entrée musicale. Sallie May lui propose une seule prise pour lui faire entendre la différence entre un tintement et l’appel du troupeau.'),
      duel('hb_blitzo', 'pentagram-rooftops', 'Blitzø a suspendu la cloche au-dessus du décor pour sa publicité. Sallie May monte avant la prise. Il veut conserver sa dernière cascade, elle veut conserver la cloche entière.'),
      duel('hb_millie', 'imp-reception', 'Millie a peint leurs initiales sous le bronze. Devant la porte du bureau, les sœurs reprennent leur vieux jeu du ranch. Celle qui tient le seuil décidera où accrocher la cloche.'),
    ],
    ending: 'Les deux sœurs la rapportent au ranch. Sallie May laisse à Millie la ficelle du battant et une longue seconde de silence. Au premier coup, leur père ouvre la porte avant même de les voir.',
  },
  charlie: {
    title: 'Une place à la table',
    intro: 'Charlie prépare une soirée portes ouvertes. Elle a dressé la table pour douze. Le premier visiteur vient vérifier si la porte résistera à une charge.',
    chapters: [
      duel('vaggie', 'hotel-lobby', 'Vaggie place une chaise devant la réception. Si Charlie peut la protéger pendant leur entraînement, elle acceptera de laisser entrer les visiteurs.'),
      duel('alastor', 'hotel-bar', 'Alastor propose de retransmettre la soirée. Charlie entend déjà les rires enregistrés. Elle veut récupérer le micro avant l’ouverture.'),
      duel('adam', 'hotel-exterior', 'Adam barre le perron. Derrière Charlie, les invités attendent sa décision. Elle descend d’une marche et lui laisse juste assez de place pour rebrousser chemin.'),
    ],
    ending: 'Les invités gagnent la salle. Charlie reste un instant seule à la réception. Elle rouvre le registre à la première ligne blanche et le tourne vers la porte, pour laisser le prochain visiteur écrire son propre nom.',
  },
  vaggie: {
    title: 'Le double des clefs',
    intro: 'Une porte de service est restée ouverte toute la nuit. Vaggie recommence sa ronde, clefs au poing, alors que Charlie veut confier un double aux résidents.',
    chapters: [
      duel('husk', 'hotel-bar', 'Husk a vu passer le trousseau. Il refuse de livrer un nom à quelqu’un qui entre dans son bar la lance en avant.'),
      duel('carmilla', 'carmine-industries', 'Sur le quai de Carmilla, un trait de craie figure une porte. Vaggie doit apprendre à tenir le passage sans se laisser entraîner hors de sa garde.'),
      duel('lute', 'heaven-embassy', 'Lute attend devant la grille. Vaggie reconnaît sa façon de laisser une ouverture. Cette fois, elle décide elle-même du moment où avancer.'),
    ],
    ending: 'Vaggie retrouve le double dans la poche de son propre manteau. Elle le remet à Husk et inscrit un deuxième nom sur le tableau des rondes.',
  },
  angeldust: {
    title: 'Hors champ',
    intro: 'Une caméra suit Angel jusque devant sa chambre. Sur la cassette de la veille, un pensionnaire apparaît par erreur. Angel veut reprendre la bande.',
    chapters: [
      duel('cherribomb', 'pentagram-rooftops', 'Cherri a repéré le fourgon de tournage. Elle joue les gardes sur le toit pour qu’Angel répète le trajet sans attirer les caméras.'),
      duel('velvette', 'vee-broadcast-studio', 'La bande est déjà au montage. Velvette verrouille la régie dès qu’Angel pose un pied sur le plateau.'),
      duel('valentino', 'vee-broadcast-studio', 'Valentino a gardé la bobine originale. Angel traverse le champ une dernière fois, les yeux sur la porte de la régie.'),
    ],
    ending: 'De retour à l’hôtel, Angel coupe trois secondes de pellicule, rend la cassette au pensionnaire et lui laisse le choix de la regarder.',
  },
  alastor: {
    title: 'Le silence entre deux stations',
    intro: 'Une mire bleue occupe la fréquence d’Alastor. Quelqu’un imite sa voix pour annoncer la fermeture de l’hôtel. Le démon de la radio règle son poste à la main.',
    chapters: [
      duel('husk', 'hotel-bar', 'Husk débranche la radio du bar. Avant de la rendre, il exige qu’Alastor écoute le faux bulletin jusqu’à la fin.'),
      duel('velvette', 'pentagram-rooftops', 'Une antenne mobile relaie le bulletin. Velvette attend sur le toit, le doigt posé sur le bouton de diffusion.'),
      duel('vox', 'vee-broadcast-studio', 'La régie ouvre les micros. Le visage de Vox envahit le moniteur en attendant la première insulte pour lancer son jingle. Alastor lui offre cinq secondes de silence en direct.'),
    ],
    ending: 'Les lettres de la mire s’éteignent une à une. Sur les postes de l’hôtel, on entend des couverts et quelqu’un qui rit. Alastor laisse tourner la bande.',
  },
  husk: {
    title: 'La dernière tournée',
    intro: 'On a organisé un tournoi de cartes à son comptoir sans le prévenir. Husk cherche le propriétaire du paquet truqué avant que les dettes ne s’accumulent.',
    chapters: [
      duel('angeldust', 'hotel-bar', 'Angel reconnaît les cartes. Il veut d’abord savoir si Husk serait capable de repérer la même feinte deux fois.'),
      duel('cherribomb', 'hotel-exterior', 'Une caisse pleine de jetons bloque l’escalier. Cherri revendique la mise et propose de la jouer à quitte ou double.'),
      duel('alastor', 'hotel-lobby', 'Alastor a distribué la première main. Husk dépose les jetons devant lui et refuse de jouer avec les dettes de ses clients.'),
    ],
    ending: 'Husk inscrit « boissons seulement » sur l’ardoise, retourne le paquet contre le mur et sert de l’eau au dernier joueur encore assis.',
  },
  niffty: {
    title: 'La trace sur le tapis',
    intro: 'Une traînée de suie traverse le hall tout juste ciré. Niffty noue son tablier et suit les empreintes jusqu’à la sortie.',
    chapters: [
      duel('sirpentious', 'hotel-lobby', 'Une roue de la machine de Pentious porte la même trace. Niffty doit la faire passer sur un torchon propre pour comparer les marques.'),
      duel('cherribomb', 'hotel-exterior', 'Des confettis collent à la suie sur les marches. Cherri cache le sachet derrière son dos quand Niffty approche avec sa pelle.'),
      duel('husk', 'hotel-bar', 'Les empreintes aboutissent au bar. Husk refuse qu’on déplace son comptoir pendant le service, même de quelques centimètres.'),
    ],
    ending: 'Sous le comptoir, Niffty trouve son propre seau qui fuit. Elle le place dans un autre seau et affiche un petit panneau pour dévier le trafic.',
  },
  sirpentious: {
    title: 'Le frein de secours',
    intro: 'Le prototype de Pentious sait ouvrir une porte, porter une valise et servir le thé. Il reste un défaut sérieux dans la commande d’arrêt.',
    chapters: [
      duel('niffty', 'hotel-lobby', 'Niffty a déjà trouvé le bouton rouge. Pentious doit atteindre la console avant qu’elle n’active le mauvais mécanisme.'),
      duel('carmilla', 'carmine-industries', 'Carmilla lui prête un quai vide. Elle commence l’essai de charge avant qu’il n’ait fini son discours sur la sécurité.'),
      duel('cherribomb', 'pentagram-rooftops', 'Cherri a récupéré la machine sur un toit. Elle parie que Pentious ne pourra pas enclencher le frein en plein mouvement.'),
    ],
    ending: 'Le prototype s’immobilise à un doigt du bord. Pentious oublie de revendiquer sa victoire et ajoute un deuxième bouton, à hauteur de Niffty.',
  },
  lucifer: {
    title: 'Un seul spectateur',
    intro: 'Lucifer a construit une scène pour la fête de Charlie. Sa fille lui demande d’aider les invités qui ne trouvent pas l’entrée.',
    chapters: [
      duel('husk', 'hotel-bar', 'Le plan d’évacuation disparaît derrière un automate. Husk invite le roi à déplacer son chef-d’œuvre sans renverser un seul verre.'),
      duel('alastor', 'hotel-lobby', 'Alastor a installé son propre panneau indicateur. Les deux flèches pointent maintenant vers deux portes différentes.'),
      duel('charlie', 'hotel-exterior', 'Charlie l’attend sur le perron pour un exercice. Il doit la suivre jusqu’au hall, en lui laissant choisir la cadence.'),
    ],
    ending: 'Lucifer replie la grande scène. Assis sur une caisse près de l’entrée, il remet un petit canard en bois à chaque visiteur qui passe.',
  },
  cherribomb: {
    title: 'Le compte à rebours',
    intro: 'Cherri prépare un feu d’artifice sur les toits. Elle découvre que le public le plus proche regarde depuis la fenêtre de l’hôtel.',
    chapters: [
      duel('angeldust', 'hotel-bar', 'Angel veut un signal clair avant le premier éclat. Cherri lui montre son rythme en tapant sur le comptoir.'),
      duel('vaggie', 'hotel-exterior', 'Vaggie réserve un couloir sur le perron pour les spectateurs. Cherri doit lui prouver qu’elle peut tenir toute sa mise en scène dans cet espace.'),
      duel('sirpentious', 'pentagram-rooftops', 'Pentious propose son propre finale et installe sa machine sur la même marque au sol. Un duel décidera qui donne le top.'),
    ],
    ending: 'Au dernier instant, Cherri tend la commande à Pentious. Les deux signatures s’allument ensemble au-dessus du toit.',
  },
  vox: {
    title: 'Sept secondes de retard',
    intro: 'Le signal de Vox prend sept secondes de retard à chaque passage près de l’hôtel. Sa régie veut meubler. Vox décide de remonter la coupure en direct.',
    chapters: [
      duel('velvette', 'vee-broadcast-studio', 'Velvette a remplacé l’antenne par un défilé. Vox réclame son créneau avant que la nouvelle programmation n’atteigne les écrans.'),
      duel('husk', 'hotel-bar', 'Tous les postes du bar sont réglés sur la même fréquence. Husk refuse qu’un technicien monte derrière son comptoir.'),
      duel('alastor', 'vee-broadcast-studio', 'Alastor s’est invité devant le micro. Vox apparaît sur l’écran du plateau. Son image accuse déjà du retard. Il coupe le retour et défie le démon de la radio en direct.'),
    ],
    ending: 'Le signal retrouve son rythme. Sur le dernier écran, le sourire d’Alastor persiste sept secondes de trop. Vox baisse seul l’interrupteur.',
  },
  valentino: {
    title: 'Le plateau vide',
    intro: 'Le rideau se lève sur un studio désert. Valentino veut récupérer la clef de la régie avant que son créneau soit attribué à une autre émission.',
    chapters: [
      duel('velvette', 'vee-broadcast-studio', 'Velvette a déjà changé les marques sur le sol. Ses assistants attendent que l’un des deux quitte le plateau.'),
      duel('vox', 'pentagram-rooftops', 'Sur le toit, Vox réclame ses minutes d’antenne. Le voyant rouge reste allumé pendant leur dispute.'),
      duel('angeldust', 'vee-broadcast-studio', 'Angel dépose son badge au bord du cadre. Valentino doit franchir le plateau sous les yeux d’une équipe qui a cessé de filmer.'),
    ],
    ending: 'Valentino récupère sa régie et rallume tous les écrans. Il découvre que son émission est seule sur la grille et que personne ne tient la caméra.',
  },
  velvette: {
    title: 'Le dernier essayage',
    intro: 'À dix minutes de l’ouverture, un câble traverse son podium. Velvette veut résoudre le problème avant que Vox ne transforme son défilé en lancement télévisé.',
    chapters: [
      duel('carmilla', 'carmine-industries', 'Carmilla garde la dernière passerelle disponible. Velvette doit prouver que son équipe saura la dégager rapidement.'),
      duel('valentino', 'vee-broadcast-studio', 'Valentino occupe déjà le premier rang et refuse de céder le passage aux techniciens.'),
      duel('vox', 'vee-broadcast-studio', 'Vox fait monter son écran au milieu de la scène. Velvette reste sur la ligne de lumière et lui dispute le premier plan.'),
    ],
    ending: 'Le câble sert finalement de ligne à suivre. La première silhouette entre en scène exactement à l’heure, sans regarder la caméra.',
  },
  adam: {
    title: 'La place en tête d’affiche',
    intro: 'Une affiche de concert porte le nom d’Adam en minuscules. Il descend réclamer le haut de l’affiche et découvre un événement organisé par les résidents.',
    chapters: [
      duel('lute', 'heaven-embassy', 'Lute bloque la sortie le temps de vérifier ses intentions. Adam veut franchir la grille avant la balance.'),
      duel('lucifer', 'hotel-exterior', 'Lucifer a installé sa propre estrade sur le perron. Un seul des deux peut rester au centre.'),
      duel('charlie', 'hotel-lobby', 'Charlie présente les artistes dans l’ordre du programme. Adam a jusqu’au prochain changement de plateau pour imposer son numéro.'),
    ],
    ending: 'Adam monte enfin sur scène. Une seule silhouette applaudit au fond. Lute lui montre l’horloge et lui fait signe de terminer son rappel.',
  },
  emily: {
    title: 'Un siège de plus',
    intro: 'Emily prépare une rencontre à l’ambassade. Le protocole réserve toutes les chaises aux officiels et laisse les témoins debout sur le parvis.',
    chapters: [
      duel('vaggie', 'hotel-exterior', 'Vaggie veut savoir comment seront protégés les invités. Elle dessine un passage étroit sur les marches pour mettre Emily à l’épreuve.'),
      duel('lute', 'heaven-embassy', 'Lute a fermé le passage latéral. Emily doit tenir sa place en vue des deux files qui se forment.'),
      duel('sera', 'heaven-embassy', 'Sera exige une garantie avant d’ouvrir les portes. Emily place sa propre chaise sur le seuil et défend sa proposition.'),
    ],
    ending: 'La réunion commence un siège plus court à la tribune. Emily écoute depuis l’escalier, assise à côté du premier témoin.',
  },
  sera: {
    title: 'La séance ajournée',
    intro: 'Une réunion à huis clos commence alors que trois demandes d’audience attendent encore. Sera suspend la séance et descend chercher les dossiers.',
    chapters: [
      duel('lute', 'heaven-embassy', 'Lute veut sceller la grille avant la nuit. Sera lui demande de tenir la position pendant qu’elle inspecte le passage.'),
      duel('charlie', 'hotel-lobby', 'Charlie refuse de remettre ses témoignages sans droit de réponse. Sera accepte les conditions de son exercice.'),
      duel('emily', 'heaven-embassy', 'Emily a invité les témoins à la tribune. Les deux anges doivent départager leurs méthodes devant ceux qui attendent.'),
    ],
    ending: 'Sera rayonne le mot « ajournée », rouvre le registre et donne la parole au témoin dont le dossier est resté fermé le plus longtemps.',
  },
  lute: {
    title: 'La ligne du parvis',
    intro: 'Lute reçoit une grille à garder et une limite à ne pas franchir. Au bout du parvis, une silhouette familière vient à sa rencontre.',
    chapters: [
      duel('emily', 'heaven-embassy', 'Emily demande une traversée pour ses messagers. Lute lui accorde un essai chronométré entre les deux colonnes.'),
      duel('carmilla', 'carmine-industries', 'Une trace retrouvée sur le parvis mène à l’atelier. Carmilla attend Lute derrière une marque de craie identique.'),
      duel('vaggie', 'heaven-embassy', 'Vaggie se tient exactement sur l’ancienne limite. Pour l’affronter, Lute doit choisir de quel côté elle posera le pied.'),
    ],
    ending: 'Lute regagne sa garde. Dans son rapport, elle dessine le passage laissé libre et signe elle-même la modification du périmètre.',
  },
  carmilla: {
    title: 'Le poids de la livraison',
    intro: 'Une caisse revient à l’atelier trop légère. Carmilla reprend la feuille de route et vérifie elle-même les trois relais du convoi.',
    chapters: [
      duel('zestial', 'cannibal-town-square', 'Zestial connaît le nom du transporteur. Il veut savoir si Carmilla cherche un responsable ou une disparue.'),
      duel('velvette', 'vee-broadcast-studio', 'Velvette a gardé la seule image du déchargement. Elle prétend que le prix du visionnage se règle sur son plateau.'),
      duel('vaggie', 'carmine-industries', 'Vaggie rapporte la pièce manquante. Carmilla lui demande de refaire le passage sous pression pour découvrir la faille du quai.'),
    ],
    ending: 'Une seconde signature devient obligatoire au départ des convois. Carmilla laisse la première case vide et prend la ronde suivante.',
  },
  rosie: {
    title: 'Le service du dimanche',
    intro: 'Rosie veut réunir deux tablées qui ne s’adressent plus la parole. Elle porte elle-même les cartons d’invitation à travers la ville.',
    chapters: [
      duel('niffty', 'hotel-lobby', 'Niffty a inversé les cartons pour les classer par couleur. Rosie doit les retrouver avant le départ du coursier.'),
      duel('zestial', 'cannibal-town-square', 'Zestial attend qu’elle précise qui s’assiéra au milieu. Rosie lui réserve cette place à condition qu’il tienne sa ligne.'),
      duel('alastor', 'cannibal-town-square', 'Alastor arrive avec son micro. Rosie entend conserver la conversation du dimanche à ceux qui sont présents.'),
    ],
    ending: 'Rosie sert la soupe en personne. Les cartons n’ont finalement servi qu’à caler un pied de table, et personne ne demande de les remettre.',
  },
  zestial: {
    title: 'Le courrier sans sceau',
    intro: 'Un message anonyme demande à Zestial de se présenter avant minuit. Il cherche la main qui l’a plié avant de franchir le seuil indiqué.',
    chapters: [
      duel('rosie', 'cannibal-town-square', 'Rosie reconnaît le papier, mais impose la discrétion de sa place à celui qui vient y chercher des réponses.'),
      duel('velvette', 'vee-broadcast-studio', 'La régie affiche le message agrandi. Zestial doit traverser le plateau avant que Velvette n’en lise la dernière ligne.'),
      duel('carmilla', 'carmine-industries', 'Carmilla a préparé un exercice à huis clos. Zestial comprend pourquoi l’invitation ne portait aucune signature.'),
    ],
    ending: 'Le courrier brûle dans la lampe de l’atelier. Zestial laisse sur la table une enveloppe vide, déjà pliée pour leur prochaine rencontre.',
  },
  zeezi: {
    title: 'Le passage des géants',
    intro: 'Le parcours d’un défilé passe sous une enseigne trop basse pour Zeezi. Elle parcourt l’itinéraire à pied avant l’arrivée du premier char.',
    chapters: [
      duel('cherribomb', 'pentagram-rooftops', 'Cherri a posé le signal de départ sur le toit. Zeezi doit gagner le temps nécessaire pour faire modifier le trajet.'),
      duel('carmilla', 'carmine-industries', 'Carmilla ouvre son quai à titre d’essai. Un duel montre si le détour laisse assez d’espace aux spectateurs.'),
      duel('velvette', 'vee-broadcast-studio', 'Velvette tient au cadre prévu pour la diffusion. Zeezi traverse le plateau pour lui montrer ce que son cadrage exclut.'),
    ],
    ending: 'Le défilé emprunte le quai. Les plus petits spectateurs regardent depuis les épaules de Zeezi, au-dessus de toutes les enseignes.',
  },
  baxter: {
    title: 'L’expérience témoin',
    intro: 'Un instrument de Baxter réagit à chaque mensonge prononcé dans le hall. Pour publier ses résultats, il lui faut des conditions expérimentales moins désastreuses.',
    chapters: [
      duel('niffty', 'hotel-lobby', 'Niffty a nettoyé la moitié des capteurs. Baxter essaie de sauver un échantillon témoin pendant qu’elle termine sa ronde.'),
      duel('sirpentious', 'carmine-industries', 'Pentious propose un étalonnage comparatif. Les deux inventeurs sont convaincus que seul l’autre appareil dérive.'),
      duel('alastor', 'hotel-bar', 'Alastor prend place devant le dernier capteur intact. Baxter doit finir ses mesures avant le début de l’émission.'),
    ],
    ending: 'Le détecteur réagissait au bourdonnement du micro. Baxter barre le titre de son article, garde ses chiffres et recommence sur une page neuve.',
  },
  abel: {
    title: 'Le nom sur la grille',
    intro: 'Au contrôle de l’ambassade, on annonce Abel sous un autre nom. Il décide de porter lui-même le registre jusqu’à la personne qui le signe.',
    chapters: [
      duel('emily', 'heaven-embassy', 'Emily propose une répétition de son entrée. Abel doit avancer sans attendre qu’on lui ouvre le passage.'),
      duel('adam', 'hotel-exterior', 'Adam occupe déjà les marches et couvre toutes les présentations. Abel demande que l’on reprenne depuis le début.'),
      duel('lute', 'heaven-embassy', 'Lute garde le registre. Abel prononce son nom une seconde fois et maintient sa place devant la grille.'),
    ],
    ending: 'Abel inscrit lui-même les quatre lettres. Sur le registre, le nom tient dans la marge. À la prochaine entrée, le garde le prononce correctement.',
  },
  hb_blitzo: {
    title: 'Le contrat sans client',
    intro: 'Blitzø arrive à Pentagram City pour un contrat payé d’avance. Le dossier contient une adresse, une heure et une photo de sa propre camionnette.',
    chapters: [
      duel('hb_moxxie', 'imp-reception', 'Au bureau d’I.M.P., Moxxie demande un exercice de reconnaissance avant que le patron fonce au rendez-vous. Le premier qui découvre le piège mènera l’opération.'),
      duel('hb_millie', 'hotel-exterior', 'Millie a repéré une seconde équipe. Elle fait répéter à Blitzø le repli sur les marches avant de lui montrer le poste du guetteur.'),
      duel('hb_striker', 'pentagram-rooftops', 'Striker a rédigé le contrat pour isoler Blitzø. Sur le toit de la ville, le patron entend son équipe au bout de la radio et la laisse branchée.'),
    ],
    ending: 'Blitzø reprend la photo de la camionnette et la colle dans le dossier. Au dos, il note les trois voix qui ont répondu quand il a appelé.',
  },
  hb_moxxie: {
    title: 'La part manquante',
    intro: 'Les chiffres du dernier contrat ne tombent pas juste. Moxxie emporte le registre à Pentagram City, où quelqu’un a signé la réception à sa place.',
    chapters: [
      duel('hb_millie', 'imp-reception', 'À la réception d’I.M.P., Millie remarque qu’il serre le registre trop fort. Elle lui propose un tour d’échauffement avant de l’accompagner au rendez-vous.'),
      duel('hb_blitzo', 'hotel-lobby', 'Blitzø veut reprendre le dossier. Moxxie lui demande de jouer le rôle du guetteur pendant sa reconstitution.'),
      duel('hb_crimson', 'carmine-industries', 'Au quai de livraison, Crimson prépare un deuxième reçu. Moxxie garde le registre ouvert à sa propre signature.'),
    ],
    ending: 'Moxxie corrige une ligne et rend chaque part à son destinataire. Sa propre case porte enfin son écriture.',
  },
  hb_millie: {
    title: 'Une sortie pour deux',
    intro: 'Pendant une livraison à Pentagram City, la porte coupe-feu se ferme entre Millie et son équipe. Elle longe les toits pour trouver l’autre sortie.',
    chapters: [
      duel('hb_loona', 'hotel-exterior', 'Loona attend derrière la première issue. Millie veut tester le verrou pendant que sa collègue garde les marches.'),
      duel('hb_blitzo', 'pentagram-rooftops', 'Blitzø a trouvé une sortie pour une seule personne. Millie lui fait recommencer l’exercice en gardant de la place à sa gauche.'),
      duel('hb_striker', 'carmine-industries', 'Striker tient la sortie de service. Millie cale la porte avant de lui faire face pour que ses équipiers puissent la rejoindre.'),
    ],
    ending: 'Quand Moxxie arrive avec le passe, la porte est déjà ouverte. Millie retire sa cale après avoir compté les quatre membres de l’équipe.',
  },
  hb_loona: {
    title: 'Ne quittez pas',
    intro: 'En déplacement au Hazbin Hotel, Loona reçoit trois appels muets au standard d’I.M.P. Le quatrième laisse entendre la sonnerie du téléphone posé devant elle.',
    chapters: [
      duel('hb_moxxie', 'imp-reception', 'De retour au standard, Moxxie recrée l’appel depuis l’autre extrémité de la réception. Loona teste la distance nécessaire pour repérer la fuite.'),
      duel('hb_millie', 'hotel-exterior', 'Millie monte la garde devant le dernier relais. Loona doit atteindre l’entrée sans faire sonner leur téléphone témoin.'),
      duel('hb_blitzo', 'pentagram-rooftops', 'Blitzø a bricolé un relais pour rester joignable. Loona lui réclame le combiné avant que toute la ville n’entende leur conversation.'),
    ],
    ending: 'Loona coupe la boucle. Un seul téléphone sonne dans le silence et elle décroche avant la deuxième sonnerie.',
  },
  hb_stolas: {
    title: 'La carte incomplète',
    intro: 'Stolas examine une carte du ciel à Pentagram City. Un tracé récent indique un passage vers le mauvais toit. Il suit les annotations pour retrouver leur origine.',
    chapters: [
      duel('hb_blitzo', 'hotel-exterior', 'Blitzø a utilisé la carte comme plan de livraison. Stolas lui demande de rejouer le trajet exact, détours compris.'),
      duel('hb_striker', 'pentagram-rooftops', 'Striker a compris l’utilité du faux passage. Stolas doit garder le bord du toit en vue pendant toute la rencontre.'),
      duel('hb_andrealphus', 'heaven-embassy', 'Sur le parvis désert, Andrealphus a reporté ses propres coordonnées. Stolas replie la carte et s’oriente à la lumière des étoiles.'),
    ],
    ending: 'Stolas efface une seule ligne. Dans la marge subsiste le dessin maladroit d’une camionnette, devenu le repère le plus précis de toute la carte.',
  },
  hb_striker: {
    title: 'Le prix du détour',
    intro: 'Striker attend un paiement à Pentagram City. Le messager a changé trois fois de rendez-vous. Il décide de suivre le trajet dans le sens inverse.',
    chapters: [
      duel('hb_moxxie', 'hotel-exterior', 'Moxxie a photographié la première enveloppe. Striker lui réclame le cliché au pied des marches.'),
      duel('hb_millie', 'carmine-industries', 'Millie attend au deuxième relais. Elle connaît le prochain nom, mais entend faire perdre du temps au chasseur.'),
      duel('hb_blitzo', 'pentagram-rooftops', 'Blitzø l’attend au point de départ avec une enveloppe vide. Les deux rivaux comprennent enfin qui a gagné du temps sur qui.'),
    ],
    ending: 'Striker conserve l’enveloppe. Sur le prochain contrat, il ajoute à la main une ligne consacrée aux frais de déplacement.',
  },
  hb_verosika: {
    title: 'Le rappel imprévu',
    intro: 'Le concert de Verosika à Pentagram City a été interrompu juste avant le rappel. Elle refuse de partir avant d’avoir retrouvé ce qui a coupé le retour de scène.',
    chapters: [
      duel('hb_fizzarolli', 'vee-broadcast-studio', 'Fizzarolli a prolongé son interlude pour meubler. Verosika teste le micro pendant qu’il occupe le plateau.'),
      duel('hb_asmodeus', 'hotel-bar', 'Asmodeus a réservé la petite salle pour les artistes. Il demande à Verosika si elle peut tenir un public sans retour sonore.'),
      duel('hb_blitzo', 'pentagram-rooftops', 'Le câble aboutit au poste d’observation de Blitzø. Elle monte sur le toit pour lui faire entendre les dernières mesures.'),
    ],
    ending: 'Dans la salle redevenue silencieuse, Verosika reprend exactement sur le mot interrompu. Cette fois, c’est le public qui lui renvoie sa voix.',
  },
  hb_fizzarolli: {
    title: 'Sans filet',
    intro: 'Fizzarolli doit inaugurer un plateau provisoire. Son accessoire principal a disparu et le public arrive déjà par la porte de service.',
    chapters: [
      duel('hb_blitzo', 'hotel-exterior', 'Blitzø propose une improvisation à deux. Fizz lui demande de refaire leur entrée sur des marches beaucoup plus courtes.'),
      duel('hb_verosika', 'vee-broadcast-studio', 'Verosika répète sur la même marque. Les deux artistes essaient de traverser le plateau sans jamais se voler leur lumière.'),
      duel('hb_asmodeus', 'ozzies-cabaret', 'De retour chez Ozzie’s pour la première, Asmodeus veut annuler le numéro trop risqué. Fizz lui présente une version où c’est lui qui décide quand lâcher prise.'),
    ],
    ending: 'Fizz entre les mains vides. Au premier rire, il aperçoit Asmodeus qui laisse enfin retomber le filet derrière le rideau.',
  },
  hb_asmodeus: {
    title: 'La loge du fond',
    intro: 'Une réception à Pentagram City attend Asmodeus sur scène. Derrière le rideau, la loge d’un artiste ouvre directement sur la file du public.',
    chapters: [
      duel('hb_verosika', 'vee-broadcast-studio', 'Verosika connaît l’autre entrée. Elle lui fait refaire son passage pour vérifier que les techniciens pourront aussi l’emprunter.'),
      duel('hb_blitzo', 'hotel-exterior', 'Blitzø prétend pouvoir tenir seul le cordon de sécurité. Asmodeus vient tester la promesse en personne.'),
      duel('hb_fizzarolli', 'ozzies-cabaret', 'Au terme de la tournée, Fizz attend chez Ozzie’s, dans le cercle de la Luxure. Il demande le dernier mot sur sa sortie. Asmodeus accepte de suivre son rythme.'),
    ],
    ending: 'Asmodeus fait poser un loquet à l’intérieur de la loge. La prochaine entrée en scène commencera quand l’artiste l’aura choisi.',
  },
  hb_beelzebub: {
    title: 'À la bonne cadence',
    intro: 'À la fête de Pentagram City, la musique s’accélère à chaque morceau. Bee remarque que les derniers rangs ont cessé de danser.',
    chapters: [
      duel('hb_loona', 'hotel-bar', 'Loona garde la sortie libre. Bee descend de scène pour tester l’espace qu’il reste autour des enceintes.'),
      duel('hb_verosika', 'vee-broadcast-studio', 'Verosika tient la régie. Bee propose de régler le prochain couplet sur le pas des gens au fond de la salle.'),
      duel('hb_asmodeus', 'hotel-lobby', 'Asmodeus a prévu un final monumental. Bee lui dispute le centre du hall pour laisser entendre les voix au dernier rang.'),
    ],
    ending: 'La musique reprend plus lentement. Bee finit son verre près de la porte, à l’endroit où elle peut enfin entendre tout le monde.',
  },
  hb_crimson: {
    title: 'La signature au carbone',
    intro: 'Deux exemplaires du même reçu portent la signature de Crimson. Un seul comporte le montant qu’il avait prévu de déclarer.',
    chapters: [
      duel('hb_blitzo', 'hotel-lobby', 'Blitzø possède le double carbone. Il a convoqué Crimson sous les yeux des clients de l’hôtel.'),
      duel('hb_millie', 'hotel-exterior', 'Millie ferme le raccourci vers la camionnette. Crimson tente de la contourner avant que le double change encore de mains.'),
      duel('hb_moxxie', 'carmine-industries', 'Moxxie tient le reçu au quai de livraison. Deux signatures les attendent, avec assez de témoins pour trancher.'),
    ],
    ending: 'Crimson reprend le reçu original et le plie dans sa poche. Sur le quai, trois témoins ont déjà recopié le montant.',
  },
  hb_andrealphus: {
    title: 'Le sceau dans la glace',
    intro: 'Andrealphus fait transporter une lettre sous un sceau de glace à Pentagram City. Lorsqu’il réclame son pli, la cire de remplacement est encore tiède.',
    chapters: [
      duel('hb_millie', 'hotel-exterior', 'Millie a réceptionné le colis. Elle refuse de quitter son poste tant que la relève ne s’est pas présentée.'),
      duel('hb_striker', 'pentagram-rooftops', 'Striker a gardé le fragment de glace tombé du colis. Il en demande un prix supérieur à celui du transport.'),
      duel('hb_stolas', 'heaven-embassy', 'Le pli attend sur le parvis. Stolas a reconnu l’écriture sous le sceau et veut qu’Andrealphus lise lui-même la lettre à haute voix.'),
    ],
    ending: 'La glace fond dans sa paume. Andrealphus récupère une feuille intacte et découvre combien il est difficile d’ordonner qu’on oublie une phrase déjà lue.',
  },
};

type StoryBeat = 'intro' | 'rival' | 'ending';

const illustrations: Readonly<Record<string, Partial<Record<StoryBeat, string>>>> = {
  charlie: { intro: 'charlie-intro', ending: 'charlie-ending' },
  hz_mimzy: { intro: 'mimzy-intro' },
  hb_sallie_may: { intro: 'sallie-intro' },
  hb_loona: { intro: 'loona-intro', rival: 'loona-blitzo-rival', ending: 'loona-ending' },
  alastor: { intro: 'alastor-intro', rival: 'alastor-vox-rival', ending: 'alastor-ending' },
  lucifer: { intro: 'lucifer-charlie-hotel-stage-plan-wave-b' },
  vaggie: { intro: 'vaggie-intro', rival: 'vaggie-lute-rival', ending: 'vaggie-ending' },
  lute: { rival: 'vaggie-lute-rival' },
  hb_fizzarolli: { intro: 'fizz-intro', rival: 'fizz-rival', ending: 'fizz-ending' },
  hb_asmodeus: { intro: 'ozzie-intro', rival: 'fizz-rival', ending: 'ozzie-ending' },
  vox: { rival: 'alastor-vox-rival' },
  hb_blitzo: { intro: 'blitzo-intro', rival: 'blitzo-striker-rival', ending: 'blitzo-imp-file-wave-b' },
  hb_striker: { rival: 'blitzo-striker-rival' },
};

export function legacyStoryIllustration(fighterId: string, kind: StoryBeat): string | undefined {
  const file = illustrations[fighterId]?.[kind];
  return file ? `/assets/story/infernal-versus/${file}.webp` : undefined;
}
