import { HelluvaBossSpoilerScope } from '../../types';

export const HELLUVA_BOSS_DATA_VERSION = 1;

export type HelluvaRosterTier = 'primary' | 'supporting' | 'secondary';

export interface HelluvaCharacterProfile {
  id: string;
  name: string;
  alias: string;
  species: string;
  role: string;
  affiliation: string;
  playable: boolean;
  rosterTier: HelluvaRosterTier;
  spoilerScope: HelluvaBossSpoilerScope;
  description: string;
  canonNote: string;
  sourceRef: string;
  portrait: string;
}

export interface HelluvaLoreProfile {
  id: string;
  title: string;
  category: 'company' | 'world_rule' | 'faction' | 'location' | 'item' | 'continuity';
  spoilerScope: HelluvaBossSpoilerScope;
  description: string;
  sourceRef: string;
}

export interface HelluvaContractDefinition {
  id: string;
  chapter: number;
  order: number;
  title: string;
  client: string;
  location: string;
  difficulty: 'routine' | 'risky' | 'dangerous' | 'crisis';
  summary: string;
  prerequisiteId: string | null;
  entryCost: number;
  reward: number;
  completionHeat: number;
  /** Presentation-only Simulation AU cast; it never changes engine effects. */
  featuredCharacterIds: readonly string[];
  phaseBriefs: readonly [string, string, string];
  tactics: readonly [HelluvaContractTactic, HelluvaContractTactic, HelluvaContractTactic];
}

export interface HelluvaContractTactic {
  id: string;
  label: string;
  description: string;
}

export interface HelluvaChoiceEffects {
  funds?: number;
  heat?: number;
  cohesion?: number;
  discretion?: number;
  reputation?: number;
  fatigue?: number;
}

export interface HelluvaApproachChoice {
  id: string;
  phaseIndex: 0 | 1 | 2;
  label: string;
  description: string;
  effects: HelluvaChoiceEffects;
}

export interface HelluvaSpriteSheet {
  id: string;
  path: string;
  spoilerScope: HelluvaBossSpoilerScope;
  characters: readonly string[];
}

const portrait = (id: string) => `/assets/sprites/helluva/portraits/${id}.png`;

type HelluvaCharacterSeed = Omit<HelluvaCharacterProfile, 'rosterTier'>;

const HELLUVA_PRIMARY_CHARACTER_IDS = new Set([
  'hb_blitzo',
  'hb_moxxie',
  'hb_millie',
  'hb_loona',
  'hb_stolas',
]);

const HELLUVA_SECONDARY_CHARACTER_IDS = new Set([
  'hb_alessio',
  'hb_arick_burnz',
  'hb_counselor_jimmy',
  'hb_yogirt',
  'hb_emberlynn_pinkle',
  'hb_kendra',
  'hb_rita',
  'hb_better_than_blitzo_guy',
  'hb_loo_loo',
  'hb_jesse',
  'hb_miles',
  'hb_bombproof',
  'hb_muffy',
  'hb_dr_somna',
  'hb_vikki',
  'hb_gigi',
  'hb_russ',
  'hb_dennis',
  'hb_ralphie',
  'hb_catfish_monster',
  'hb_elder_jaws',
  'hb_bethany_ghostfucker',
  'hb_karen_client',
  'hb_toledo_the_igor',
  'hb_brennon_ragers',
  'hb_uggie',
  'hb_skips',
  'hb_queef',
  'hb_ace',
  'hb_gerardo_velazquez',
  'hb_frank_mctickly_wrigglers',
  'hb_driveso',
  'hb_joe_smoe',
  'hb_paulie_paesano',
  'hb_luigi_paesano',
  'hb_william_diddle',
  'hb_adrian',
  'hb_mr_mayor',
  'hb_gerald',
  'hb_rick',
  'hb_coco',
  'hb_apple',
  'hb_kat',
  'hb_milky',
  'hb_kiki',
  'hb_josh',
  'hb_stolas_family_butler',
  'hb_mister_butler',
  'hb_marthas_daughter',
  'hb_marthas_son',
  'hb_harold_patriot',
  'hb_dolores',
  'hb_big_woobly',
  'hb_hellhound_adoption_lady',
  'hb_gerardos_wife',
  'hb_diddle_secretary',
  'hb_bigfoot_waiter',
  'hb_gorilla_suit_guy',
  'hb_travis',
  'hb_tour_guide_guy',
  'hb_rachel_cherub',
  'hb_bea_cherub',
  'hb_beau_cherub',
  'hb_honey_cherub',
]);

const resolveHelluvaRosterTier = (characterId: string): HelluvaRosterTier => {
  if (HELLUVA_PRIMARY_CHARACTER_IDS.has(characterId)) return 'primary';
  if (HELLUVA_SECONDARY_CHARACTER_IDS.has(characterId)) return 'secondary';
  return 'supporting';
};

export const HELLUVA_CHARACTERS: readonly HelluvaCharacterProfile[] = ([
  {
    id: 'hb_blitzo',
    name: 'Blitzø',
    alias: 'Blitz',
    species: 'Imp',
    role: 'Founder and field leader',
    affiliation: 'I.M.P.',
    playable: true,
    spoilerScope: 'season_1',
    description: 'The impulsive founder of Immediate Murder Professionals, directing jobs while carrying much of the company\'s interpersonal chaos.',
    canonNote: 'Company leadership and family relationships are canon; operational scores in this extension are Simulation AU.',
    sourceRef: 'Helluva Boss Season 1 (I.M.P. series premise)',
    portrait: portrait('hb_blitzo')
  },
  {
    id: 'hb_moxxie',
    name: 'Moxxie',
    alias: 'Weapons specialist',
    species: 'Imp',
    role: 'Marksman and tactical planner',
    affiliation: 'I.M.P.',
    playable: true,
    spoilerScope: 'season_1',
    description: 'A precision-minded weapons specialist whose planning, ethics and anxiety often collide with Blitzø\'s improvisation.',
    canonNote: 'His marriage to Millie and employment at I.M.P. are canon.',
    sourceRef: 'Helluva Boss Season 1 (I.M.P. core cast)',
    portrait: portrait('hb_moxxie')
  },
  {
    id: 'hb_millie',
    name: 'Millie',
    alias: 'Combat specialist',
    species: 'Imp',
    role: 'Close-quarters operative',
    affiliation: 'I.M.P.',
    playable: true,
    spoilerScope: 'season_1',
    description: 'A formidable Wrath-born fighter and committed teammate, equally defined by her combat skill and devotion to Moxxie.',
    canonNote: 'Her combat ability, marriage and I.M.P. role are canon.',
    sourceRef: 'Helluva Boss Season 1 (I.M.P. core cast)',
    portrait: portrait('hb_millie')
  },
  {
    id: 'hb_loona',
    name: 'Loona',
    alias: 'Receptionist and tracker',
    species: 'Hellhound',
    role: 'Reception, tracking and field support',
    affiliation: 'I.M.P.',
    playable: true,
    spoilerScope: 'season_1',
    description: 'Blitzø\'s adopted daughter and I.M.P. receptionist, with powerful tracking, disguise and combat capabilities.',
    canonNote: 'Her adoption and I.M.P. position are canon; mission assignment is Simulation AU.',
    sourceRef: 'Helluva Boss Season 1 (I.M.P. core cast)',
    portrait: portrait('hb_loona')
  },
  {
    id: 'hb_stolas',
    name: 'Stolas',
    alias: 'Goetia liaison',
    species: 'Ars Goetia demon',
    role: 'Prince of the Ars Goetia',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A Goetia prince whose relationship with Blitzø and access to powerful magic shape much of the series.',
    canonNote: 'His exact status changes during Season 2; this extension never treats him as hotel staff.',
    sourceRef: 'Helluva Boss Season 1',
    portrait: portrait('hb_stolas')
  },
  {
    id: 'hb_octavia',
    name: 'Octavia',
    alias: 'Via',
    species: 'Ars Goetia demon',
    role: 'Daughter of Stolas and Stella',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Stolas and Stella\'s daughter, navigating the damage caused by her family\'s conflict on her own terms.',
    canonNote: 'Gameplay choices may respect or protect her boundaries, but never force forgiveness.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_octavia')
  },
  {
    id: 'hb_fizzarolli',
    name: 'Fizzarolli',
    alias: 'Fizz',
    species: 'Imp',
    role: 'Cybernetic performer and Ozzie\'s headliner',
    affiliation: 'Ozzie\'s',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A celebrated cybernetic performer introduced as Ozzie\'s headliner, with a long-standing rivalry and history with Blitzø.',
    canonNote: 'His relationships remain descriptive canon; any contract support is Simulation AU.',
    sourceRef: 'Helluva Boss S1E7',
    portrait: portrait('hb_fizzarolli')
  },
  {
    id: 'hb_verosika',
    name: 'Verosika Mayday',
    alias: 'Pop star',
    species: 'Succubus',
    role: 'Pop star and Blitzø\'s former partner',
    affiliation: 'Verosika\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A famous succubus musician and Blitzø\'s former partner, carrying legitimate anger beneath their public rivalry.',
    canonNote: 'The extension does not rewrite her history or require reconciliation.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_verosika')
  },
  {
    id: 'hb_asmodeus',
    name: 'Asmodeus',
    alias: 'Ozzie',
    species: 'Deadly Sin (Lust)',
    role: 'Sin of Lust and owner of Ozzie\'s',
    affiliation: 'Lust Ring / Ozzie\'s',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The Sin of Lust, a major infernal authority and the owner of Ozzie\'s, where Fizzarolli performs as headliner.',
    canonNote: 'Authority and relationship facts are canon; campaign leverage values are Simulation AU.',
    sourceRef: 'Helluva Boss S1E7',
    portrait: portrait('hb_asmodeus')
  },
  {
    id: 'hb_beelzebub',
    name: 'Beelzebub',
    alias: 'Queen Bee',
    species: 'Deadly Sin (Gluttony)',
    role: 'Sin of Gluttony',
    affiliation: 'Gluttony Ring',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The exuberant Sin of Gluttony, perceptive about the emotional currents beneath the parties she hosts.',
    canonNote: 'Her social reach is canon; any support operation is Simulation AU.',
    sourceRef: 'Helluva Boss S1E8',
    portrait: portrait('hb_beelzebub')
  },
  {
    id: 'hb_striker',
    name: 'Striker',
    alias: 'Assassin',
    species: 'Demon (imp-like; exact lineage unspecified)',
    role: 'Assassin',
    affiliation: 'Independent contracts',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A highly capable assassin whose anti-royal rhetoric and hired violence repeatedly put him against I.M.P. and Stolas.',
    canonNote: 'He is a threat profile, not a recruitable crew member.',
    sourceRef: 'Helluva Boss S1E5',
    portrait: portrait('hb_striker')
  },
  {
    id: 'hb_stella',
    name: 'Stella',
    alias: 'Goetia antagonist',
    species: 'Ars Goetia demon',
    role: 'Ars Goetia noble',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Stolas\'s estranged wife and an active source of personal and political danger in the Goetia conflict.',
    canonNote: 'Her antagonism is canon; the campaign does not invent a redemption arc.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_stella')
  },
  {
    id: 'hb_crimson',
    name: 'Crimson',
    alias: 'Crime boss',
    species: 'Imp',
    role: 'Crime boss',
    affiliation: 'Crimson\'s syndicate',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Moxxie\'s abusive father and the head of a Greed Ring criminal organization.',
    canonNote: 'The campaign treats his abuse as harm, never as a source of victim blame.',
    sourceRef: 'Helluva Boss S2E3',
    portrait: portrait('hb_crimson')
  },
  {
    id: 'hb_vortex',
    name: 'Vortex',
    alias: 'Tex',
    species: 'Hellhound',
    role: 'Bodyguard',
    affiliation: 'Verosika\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A level-headed hellhound bodyguard who becomes an important social contact for Loona.',
    canonNote: 'His existing relationships remain canon; contract appearances are Simulation AU.',
    sourceRef: 'Helluva Boss S1E3 and S1E8',
    portrait: portrait('hb_vortex')
  },
  {
    id: 'hb_sallie_may',
    name: 'Sallie May',
    alias: 'Wrath Ring family',
    species: 'Imp',
    role: 'Millie\'s sister',
    affiliation: 'Rough n\' Tumbleweed Ranch',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Millie\'s sharp-tongued sister and a capable Wrath Ring contact with her own life beyond I.M.P.',
    canonNote: 'Family status is canon; operational involvement is Simulation AU.',
    sourceRef: 'Helluva Boss S1E5 and Helluva Shorts',
    portrait: portrait('hb_sallie_may')
  },
  {
    id: 'hb_andrealphus',
    name: 'Andrealphus',
    alias: 'Goetia schemer',
    species: 'Ars Goetia demon',
    role: 'Ars Goetia noble',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Stella\'s calculating brother, using status, procedure and family conflict to pursue Goetia power.',
    canonNote: 'He remains an external political threat, never an I.M.P. employee.',
    sourceRef: 'Helluva Boss Season 2',
    portrait: portrait('hb_andrealphus')
  },
  {
    id: 'hb_paimon',
    name: 'Paimon',
    alias: 'Goetia patriarch',
    species: 'Goetic demon',
    role: 'King of the Ars Goetia and father of Stolas',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Stolas\'s father, shown in a childhood flashback arranging his son\'s betrothal to Stella as part of Goetia family expectations.',
    canonNote: 'His family role and the arranged betrothal are canon; any contract appearance is Simulation AU.',
    sourceRef: 'Helluva Boss S2E1',
    portrait: portrait('hb_paimon')
  },
  {
    id: 'hb_barbie_wire',
    name: 'Barbie Wire',
    alias: 'Barbie',
    species: 'Imp',
    role: 'Blitzø\'s twin sister and former circus performer',
    affiliation: 'Former All-Imp Circus / independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Blitzø\'s estranged twin sister, formerly part of the family circus and later encountered while pursuing a life apart from him.',
    canonNote: 'Their estrangement and her refusal to reconcile on demand are canon; operational cooperation is Simulation AU.',
    sourceRef: 'Helluva Boss S2E5',
    portrait: portrait('hb_barbie_wire')
  },
  {
    id: 'hb_cash_buckzo',
    name: 'Cash Buckzo',
    alias: 'Cash',
    species: 'Imp',
    role: 'Circus proprietor and father of Blitzø and Barbie Wire',
    affiliation: 'All-Imp Circus (disbanded)',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The circus proprietor who raised Blitzø and Barbie Wire, portrayed in flashbacks as manipulative toward his son.',
    canonNote: 'His family and circus history are canon; the extension does not soften or excuse his treatment of Blitzø.',
    sourceRef: 'Helluva Boss S2E1',
    portrait: portrait('hb_cash_buckzo')
  },
  {
    id: 'hb_wally_wackford',
    name: 'Wally Wackford',
    alias: 'Entrepreneur',
    species: 'Imp',
    role: 'Showman and recurring entrepreneur',
    affiliation: 'Independent ventures',
    playable: false,
    spoilerScope: 'season_1',
    description: 'An enthusiastic imp showman repeatedly seen promoting ventures, performing and inserting himself into public events.',
    canonNote: 'His recurring self-promotion is canon; any contract sponsorship or assistance is Simulation AU.',
    sourceRef: 'Helluva Boss Season 1',
    portrait: portrait('hb_wally_wackford')
  },
  {
    id: 'hb_mammon',
    name: 'Mammon',
    alias: 'Sin of Greed',
    species: 'Deadly Sin (Greed)',
    role: 'Sin of Greed and infernal business tycoon',
    affiliation: 'Greed Ring / Mammon\'s brand',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The Sin of Greed, whose entertainment empire and clown pageant exploit performers for profit and spectacle.',
    canonNote: 'His authority and treatment of performers are canon; campaign leverage values are Simulation AU.',
    sourceRef: 'Helluva Boss S2E7',
    portrait: portrait('hb_mammon')
  },
  {
    id: 'hb_chazwick_thurman',
    name: 'Chazwick Thurman',
    alias: 'Chaz / Zahc',
    species: 'Demon (shark-like; exact species unspecified)',
    role: 'Con artist with ties to Moxxie and Millie\'s past',
    affiliation: 'Independent / temporary Crimson associate',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A boastful con artist whose past relationships with Moxxie and Millie become part of a failed scheme involving Crimson.',
    canonNote: 'Those past relationships and the scheme are canon; he is not treated as an I.M.P. recruit.',
    sourceRef: 'Helluva Boss S2E3',
    portrait: portrait('hb_chazwick_thurman')
  },
  {
    id: 'hb_glitz',
    name: 'Glitz',
    alias: 'Pageant twin',
    species: 'Demon (fish-like; exact species unspecified)',
    role: 'Performer and clown-pageant contestant',
    affiliation: 'Glitz and Glam / Mammon\'s pageant',
    playable: false,
    spoilerScope: 'season_2',
    description: 'One half of the performance duo Glitz and Glam, competing in Mammon\'s clown pageant with a polished, aggressive act.',
    canonNote: 'Her pageant role and partnership with Glam are canon; contract involvement is Simulation AU.',
    sourceRef: 'Helluva Boss S2E7',
    portrait: portrait('hb_glitz')
  },
  {
    id: 'hb_glam',
    name: 'Glam',
    alias: 'Pageant twin',
    species: 'Demon (fish-like; exact species unspecified)',
    role: 'Performer and clown-pageant contestant',
    affiliation: 'Glitz and Glam / Mammon\'s pageant',
    playable: false,
    spoilerScope: 'season_2',
    description: 'One half of the performance duo Glitz and Glam, matching her twin in a tightly coordinated bid for Mammon\'s approval.',
    canonNote: 'Her pageant role and partnership with Glitz are canon; contract involvement is Simulation AU.',
    sourceRef: 'Helluva Boss S2E7',
    portrait: portrait('hb_glam')
  },
  {
    id: 'hb_cletus',
    name: 'Cletus',
    alias: 'C.H.E.R.U.B. operative',
    species: 'Cherub angel',
    role: 'C.H.E.R.U.B. operative and spokesperson',
    affiliation: 'Former C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A member and prominent spokesperson of the cherub team that tries to protect a living human from I.M.P.',
    canonNote: 'His celestial mission and conflict with I.M.P. are canon; later contract encounters are Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_cletus')
  },
  {
    id: 'hb_collin',
    name: 'Collin',
    alias: 'C.H.E.R.U.B. operative',
    species: 'Cherub angel',
    role: 'Compassionate C.H.E.R.U.B. operative',
    affiliation: 'Former C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A comparatively hesitant member of the cherub team sent to preserve a human life against I.M.P.\'s contract.',
    canonNote: 'His membership and role in the confrontation are canon; no alliance with I.M.P. is implied.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_collin')
  },
  {
    id: 'hb_keenie',
    name: 'Keenie',
    alias: 'C.H.E.R.U.B. operative',
    species: 'Cherub angel',
    role: 'Combat-oriented C.H.E.R.U.B. operative',
    affiliation: 'Former C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A forceful member of the cherub trio whose attempt to protect a human target brings the team into direct conflict with I.M.P.',
    canonNote: 'Her membership and opposition to I.M.P. are canon; gameplay appearances remain Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_keenie')
  },
  {
    id: 'hb_vassago',
    name: 'Vassago',
    alias: 'Goetia prince',
    species: 'Goetic demon',
    role: 'Prince of the Ars Goetia and court member',
    affiliation: 'Ars Goetia',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A Goetia noble who questions proceedings when Stolas is absent and insists that his testimony should be heard.',
    canonNote: 'His conduct in the proceeding is canon; the extension does not infer a standing alliance with I.M.P.',
    sourceRef: 'Helluva Boss S2E11',
    portrait: portrait('hb_vassago')
  },
  {
    id: 'hb_robo_fizz',
    name: 'Robo Fizz',
    alias: 'Loo Loo Land robot',
    species: 'Demonic animatronic',
    role: 'Mammon-branded robotic entertainer',
    affiliation: 'Loo Loo Land / Mammon\'s brand',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A mass-produced robotic imitation of Fizzarolli used as Loo Loo Land\'s headline performer and security threat.',
    canonNote: 'This profile is the animatronic product, not Fizzarolli himself, and never merges their identities.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_robo_fizz')
  },
  {
    id: 'hb_agent_one',
    name: 'Agent One',
    alias: 'D.H.O.R.K.S. co-leader',
    species: 'Human',
    role: 'Paranormal investigator and field commander',
    affiliation: 'D.H.O.R.K.S.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the two agents leading D.H.O.R.K.S. investigations into demonic activity and I.M.P. incursions in the living world.',
    canonNote: 'His command role and opposition to I.M.P. are canon; campaign counter-intelligence outcomes are Simulation AU.',
    sourceRef: 'Helluva Boss S1E6',
    portrait: portrait('hb_agent_one')
  },
  {
    id: 'hb_agent_two',
    name: 'Agent Two',
    alias: 'D.H.O.R.K.S. co-leader',
    species: 'Human',
    role: 'Paranormal investigator and field commander',
    affiliation: 'D.H.O.R.K.S.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the two agents leading D.H.O.R.K.S. investigations into demonic activity and I.M.P. incursions in the living world.',
    canonNote: 'Her command role and opposition to I.M.P. are canon; campaign counter-intelligence outcomes are Simulation AU.',
    sourceRef: 'Helluva Boss S1E6',
    portrait: portrait('hb_agent_two')
  },
  {
    id: 'hb_satan',
    name: 'Satan',
    alias: 'Sin of Wrath',
    species: 'Deadly Sin (Wrath)',
    role: 'Sin of Wrath and infernal judicial authority',
    affiliation: 'Wrath Ring / infernal court',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The Sin of Wrath, presiding as a major judicial authority when I.M.P. is brought before Hell\'s ruling powers.',
    canonNote: 'His authority and courtroom role are canon; operational support or opposition in contracts is Simulation AU.',
    sourceRef: 'Helluva Boss S2E11',
    portrait: portrait('hb_satan')
  },
  {
    id: 'hb_joe',
    name: 'Joe',
    alias: 'Wrath Ring rancher',
    species: 'Imp',
    role: 'Father of Millie and Sallie May',
    affiliation: 'Rough n\' Tumbleweed Ranch',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Millie and Sallie May\'s father, a Wrath Ring rancher introduced during the Harvest Moon Festival.',
    canonNote: 'His family and ranch ties are canon; any mission assistance is Simulation AU.',
    sourceRef: 'Helluva Boss S1E5',
    portrait: portrait('hb_joe')
  },
  {
    id: 'hb_lin',
    name: 'Lin',
    alias: 'Wrath Ring rancher',
    species: 'Imp',
    role: 'Mother of Millie and Sallie May',
    affiliation: 'Rough n\' Tumbleweed Ranch',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Millie and Sallie May\'s mother, a direct and capable member of their Wrath Ring ranching family.',
    canonNote: 'Her family and ranch ties are canon; any mission assistance is Simulation AU.',
    sourceRef: 'Helluva Boss S1E5',
    portrait: portrait('hb_lin')
  },
  {
    id: 'hb_leviathan',
    name: 'Leviathan',
    alias: 'Sin of Envy',
    species: 'Deadly Sin (Envy)',
    role: 'Sin of Envy',
    affiliation: 'Envy Ring / infernal court',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The Sin of Envy, physically present among Hell\'s ruling powers during the infernal court proceeding.',
    canonNote: 'The series gives Leviathan a silent cameo here; this profile does not invent dialogue, motives or a more precise species.',
    sourceRef: 'Helluva Boss S2E11',
    portrait: portrait('hb_leviathan')
  },
  {
    id: 'hb_belphegor',
    name: 'Belphegor',
    alias: 'Sin of Sloth',
    species: 'Deadly Sin (Sloth)',
    role: 'Sin of Sloth',
    affiliation: 'Sloth Ring / infernal court',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The Sin of Sloth, physically present among Hell\'s ruling powers during the infernal court proceeding.',
    canonNote: 'The series gives Belphegor a silent cameo here; this profile does not invent dialogue, motives or a more precise species.',
    sourceRef: 'Helluva Boss S2E11',
    portrait: portrait('hb_belphegor')
  },
  {
    id: 'hb_rolando',
    name: 'Rolando',
    alias: 'One Star Wonder infester',
    species: 'Infester demon',
    role: 'Possessive hotel antagonist',
    affiliation: 'One Star Wonder / independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'An infester demon haunting the One Star Wonder and using possession and psychological attacks against I.M.P.',
    canonNote: 'His nature and antagonism are canon; he remains a threat profile rather than a recruitable operative.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_rolando')
  },
  {
    id: 'hb_mrs_mayberry',
    name: 'Mrs. Mayberry',
    alias: 'I.M.P. client',
    species: 'Sinner demon (former human)',
    role: 'Client who hires I.M.P. after her death',
    affiliation: 'I.M.P. client',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A newly arrived sinner who hires I.M.P. to target the woman she blamed for the collapse of her human life.',
    canonNote: 'She is presented in this roster as the sinner client seen in Hell, not only as her former human self.',
    sourceRef: 'Helluva Boss S1E1',
    portrait: portrait('hb_mrs_mayberry')
  },
  {
    id: 'hb_martha',
    name: 'Martha',
    alias: 'Murder Family matriarch',
    species: 'Sinner demon (former human)',
    role: 'Former living-world target and recurring sinner',
    affiliation: 'Murder Family / independent',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The matriarch targeted by I.M.P. in the living world, later seen in Hell as a sinner rather than restored to human life.',
    canonNote: 'Her target status and later recurrence are canon; the profile does not duplicate her human and sinner forms.',
    sourceRef: 'Helluva Boss S1E1 and S2E9',
    portrait: portrait('hb_martha')
  },
  {
    id: 'hb_tilla',
    name: 'Tilla',
    alias: 'Circus family matriarch',
    species: 'Imp',
    role: 'Deceased mother of Blitzø and Barbie Wire',
    affiliation: 'All-Imp Circus (deceased)',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Blitzø and Barbie Wire\'s mother, preserved in family photographs and memories connected to their former circus life.',
    canonNote: 'Tilla is deceased; this archival profile never presents her as resurrected, recruitable or playable.',
    sourceRef: 'Helluva Boss S1E7 and S2E6',
    portrait: portrait('hb_tilla')
  },
  {
    id: 'hb_moxxies_mother',
    name: 'Moxxie\'s mother',
    alias: 'Unnamed in canon',
    species: 'Imp',
    role: 'Deceased mother of Moxxie',
    affiliation: 'Crimson\'s family (deceased)',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Moxxie\'s unnamed mother, remembered through childhood flashbacks that reveal the harm surrounding Crimson\'s household.',
    canonNote: 'Canon provides no first name; she is deceased and appears only through memory, never as a resurrected or playable operative.',
    sourceRef: 'Helluva Boss S2E3',
    portrait: portrait('hb_moxxies_mother')
  },
  {
    id: 'hb_loopty_goopty',
    name: 'Loopty Goopty',
    alias: 'Robotics client',
    species: 'Sinner demon (former human)',
    role: 'I.M.P. client and robotics co-founder',
    affiliation: 'Lyle-Loopty Robotics / I.M.P. client',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A newly arrived sinner and former robotics inventor who hires I.M.P. to pursue his elderly business partner.',
    canonNote: 'His client status and shared robotics business are canon; contract scoring remains Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_loopty_goopty')
  },
  {
    id: 'hb_lyle_lipton',
    name: 'Lyle Lipton',
    alias: 'Robotics co-founder',
    species: 'Sinner demon (former human)',
    role: 'Former living-world target and robotics co-founder',
    affiliation: 'Lyle-Loopty Robotics',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Loopty Goopty\'s elderly former business partner, targeted by I.M.P. while C.H.E.R.U.B. tries to preserve his life.',
    canonNote: 'His former human target status and later sinner state are canon; those forms share one profile.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_lyle_lipton')
  },
  {
    id: 'hb_deerie',
    name: 'Deerie',
    alias: 'C.H.E.R.U.B. authority',
    species: 'Cherub angel',
    role: 'Heavenly authority over the cherub team',
    affiliation: 'C.H.E.R.U.B. / Heaven',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A heavenly authority who meets the cherub trio after their failed living-world assignment and bars their return.',
    canonNote: 'Her ruling and celestial affiliation are canon; no alliance with I.M.P. is implied.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_deerie')
  },
  {
    id: 'hb_alessio',
    name: 'Alessio',
    alias: 'Crimson\'s bodyguard',
    species: 'Demon (shark-like; exact species unspecified)',
    role: 'Personal bodyguard and syndicate enforcer',
    affiliation: 'Crimson\'s syndicate',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Crimson\'s calm personal bodyguard, carrying out his orders and surviving the confrontation surrounding Chaz\'s arranged wedding.',
    canonNote: 'His loyalty to Crimson is canon; this profile never turns him into an I.M.P. recruit or assigns a more precise species.',
    sourceRef: 'Helluva Boss S2E3',
    portrait: portrait('hb_alessio')
  },
  {
    id: 'hb_arick_burnz',
    name: 'Arick “Burnie” Burnz',
    alias: 'Burnie',
    species: 'Imp',
    role: 'Review blogger and obsessive former Fizzarolli fan',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'An obsessive fan turned hostile review blogger who confronts Fizzarolli during Mammon\'s clown pageant.',
    canonNote: 'Arick dies during that confrontation; this archival profile never presents him as resurrected or playable.',
    sourceRef: 'Helluva Boss S2E7',
    portrait: portrait('hb_arick_burnz')
  },
  {
    id: 'hb_counselor_jimmy',
    name: 'Counselor Jimmy',
    alias: 'Jimmy',
    species: 'Human',
    role: 'Camp counselor and criminal drug supplier',
    affiliation: 'Camp Ivannakummore / Barbie Wire\'s supply line',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A Camp Ivannakummore counselor who supplies Barbie Wire\'s human-world drug operation and murders a coworker who discovers it.',
    canonNote: 'Jimmy dies during the camp confrontation; he remains an archival threat profile, never a recruitable operative.',
    sourceRef: 'Helluva Boss S2E5',
    portrait: portrait('hb_counselor_jimmy')
  },
  {
    id: 'hb_yogirt',
    name: 'Yogirt',
    alias: 'Satan\'s therapist',
    species: 'Demon (exact species unspecified)',
    role: 'Personal therapist and anger-management aide',
    affiliation: 'Satan\'s staff / infernal court',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Satan\'s personal therapist, present beside him during the infernal court proceeding to help regulate his anger.',
    canonNote: 'His therapeutic role is canon; contract appearances are Simulation AU and do not grant him judicial authority.',
    sourceRef: 'Helluva Boss S2E11',
    portrait: portrait('hb_yogirt')
  },
  {
    id: 'hb_emberlynn_pinkle',
    name: 'Emberlynn Pinkle',
    alias: 'Former I.M.P. target',
    species: 'Sinner demon (former human)',
    role: 'Former human target and obsessive demon fan',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'specials',
    description: 'A human college student targeted by I.M.P. who later appears in Hell as a sinner while continuing her fixation on demons.',
    canonNote: 'Her human target and sinner appearances share one profile; her fixation on Blitzø is unrequited and never reframed as a mutual relationship.',
    sourceRef: 'Helluva Shorts: Mission: Weeaboo-boo',
    portrait: portrait('hb_emberlynn_pinkle')
  },
  {
    id: 'hb_kendra',
    name: 'Kendra',
    alias: 'Barbie Wire\'s girlfriend',
    species: 'Hellborn demon (exact species unspecified)',
    role: 'Barbie Wire\'s girlfriend and concerned support figure',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'specials',
    description: 'Barbie Wire\'s girlfriend, shown trying to contact her and confronting the instability surrounding Barbie\'s work and recovery.',
    canonNote: 'The short shows their relationship under strain; this profile does not invent a breakup, reconciliation or operational alliance.',
    sourceRef: 'Helluva Shorts: Barbie\'s Bad Day',
    portrait: portrait('hb_kendra')
  },
  {
    id: 'hb_rita',
    name: 'Rita',
    alias: 'One Star Wonder victim',
    species: 'Sinner demon (former human)',
    role: 'Former human victim and witness to Rolando\'s attacks',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A sinner who tells Loona and Millie how Rolando killed her when she was human at the One Star Wonder.',
    canonNote: 'Her account and former human identity are canon; any operational use of her testimony is Simulation AU.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_rita')
  },
  {
    id: 'hb_better_than_blitzo_guy',
    name: 'Better Than Blitzo Guy',
    alias: 'Anti-Blitzo partygoer',
    species: 'Incubus demon',
    role: 'Partygoer who dances with Stolas',
    affiliation: 'Verosika\'s Anti-Blitzo party',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A partygoer who asks Stolas to dance after his performance at Verosika\'s Anti-Blitzo party.',
    canonNote: 'The dance and kiss shown on screen are canon; this profile does not invent a name, lasting romance or alliance.',
    sourceRef: 'Helluva Boss S2E9',
    portrait: portrait('hb_better_than_blitzo_guy')
  },
  {
    id: 'hb_loo_loo',
    name: 'Loo Loo',
    alias: 'Apple mascot',
    species: 'Demon (exact species unspecified)',
    role: 'Loo Loo Land mascot and greeter',
    affiliation: 'Loo Loo Land',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The performer inside Loo Loo Land\'s apple-themed mascot costume, greeting visitors and defending the park\'s reputation.',
    canonNote: 'The performer\'s identity and exact species are unspecified; this profile does not merge Loo Loo with Lucifer\'s Lu Lu World.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_loo_loo')
  },
  {
    id: 'hb_jesse',
    name: 'Jesse',
    alias: 'Ozzie\'s bouncer',
    species: 'Incubus demon',
    role: 'Door security and bouncer',
    affiliation: 'Ozzie\'s',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The incubus bouncer at Ozzie\'s who enforces the venue\'s couples-only entry rule when Blitzø arrives alone.',
    canonNote: 'His employment and door policy are canon; any security coordination in a contract is Simulation AU.',
    sourceRef: 'Helluva Boss S1E7',
    portrait: portrait('hb_jesse')
  },
  {
    id: 'hb_miles',
    name: 'Miles',
    alias: 'Fizzarolli fan',
    species: 'Imp',
    role: 'Young fan and aspiring clown',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A young deaf imp who communicates in sign language and shares an encouraging exchange with Fizzarolli at Mammon\'s clown pageant.',
    canonNote: 'His fan interaction with Fizzarolli is canon; the extension does not turn him into an employee or field operative.',
    sourceRef: 'Helluva Boss S2E7',
    portrait: portrait('hb_miles')
  },
  {
    id: 'hb_bombproof',
    name: 'Bombproof',
    alias: 'Striker\'s steed',
    species: 'Hell Horse',
    role: 'Striker\'s mount and companion animal',
    affiliation: 'Striker',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Striker\'s flame-maned hell horse, first seen carrying him during the Harvest Moon Festival.',
    canonNote: 'Bombproof belongs with Striker; the extension never treats him as an I.M.P. vehicle or recruitable crew member.',
    sourceRef: 'Helluva Boss S1E5',
    portrait: portrait('hb_bombproof')
  },
  {
    id: 'hb_muffy',
    name: 'Muffy',
    alias: 'St. An\'s receptionist',
    species: 'Baphomet demon',
    role: 'Hospital nurse and receptionist',
    affiliation: 'St. An\'s Hospital',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A baphomet nurse and receptionist who checks Blitzø and Loona into St. An\'s Hospital for Loona\'s Hellbies shot.',
    canonNote: 'Her hospital position is canon; any administrative assistance in contracts is Simulation AU.',
    sourceRef: 'Helluva Boss S2E4',
    portrait: portrait('hb_muffy')
  },
  {
    id: 'hb_dr_somna',
    name: 'Dr. Somna',
    alias: 'St. An\'s doctor',
    species: 'Baphomet demon',
    role: 'Hospital doctor',
    affiliation: 'St. An\'s Hospital',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The doctor at St. An\'s Hospital who administers Loona\'s required Hellbies vaccination.',
    canonNote: 'His medical role is canon; this profile does not infer broader authority or I.M.P. membership.',
    sourceRef: 'Helluva Boss S2E4',
    portrait: portrait('hb_dr_somna')
  },
  {
    id: 'hb_vikki',
    name: 'Vikki',
    alias: 'Queen Bee partygoer',
    species: 'Poodle hellhound',
    role: 'Partygoer and hostile acquaintance of Loona',
    affiliation: 'Independent / Beelzebub\'s party circle',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A poodle hellhound at Beelzebub\'s party whose mutual dislike with Loona is made clear.',
    canonNote: 'Their hostility is canon; the extension does not invent its origin or turn Vikki into a permanent rival faction.',
    sourceRef: 'Helluva Boss S1E8',
    portrait: portrait('hb_vikki')
  },
  {
    id: 'hb_gigi',
    name: 'Gigi',
    alias: 'Queen Bee partygoer',
    species: 'Hellhound',
    role: 'Friend and social contact of Loona',
    affiliation: 'Independent / Beelzebub\'s party circle',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A hellhound who befriends Loona at Beelzebub\'s party and becomes part of her social circle.',
    canonNote: 'Their friendship is canon; mission support and campaign effects remain Simulation AU.',
    sourceRef: 'Helluva Boss S1E8',
    portrait: portrait('hb_gigi')
  },
  {
    id: 'hb_russ',
    name: 'Russ',
    alias: 'Loona\'s friend',
    species: 'Hellhound',
    role: 'Partygoer and social contact of Loona',
    affiliation: 'Independent / Beelzebub\'s party circle',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A hellhound who befriends Loona at Beelzebub\'s party and later attends the Sinsmas gathering at Blitzø\'s apartment with Gigi.',
    canonNote: 'His friendship and later party appearance are canon; this profile does not turn him into an I.M.P. operative.',
    sourceRef: 'Helluva Boss S1E8',
    portrait: portrait('hb_russ')
  },
  {
    id: 'hb_dennis',
    name: 'Dennis',
    alias: 'Queen Bee partygoer',
    species: 'Imp',
    role: 'Partygoer and brief acquaintance of Blitzø',
    affiliation: 'Independent / Beelzebub\'s party circle',
    playable: false,
    spoilerScope: 'season_1',
    description: 'An imp seen making out with a drunken Blitzø at Beelzebub\'s party, later appearing among the guests at Verosika\'s Anti-Blitzo party.',
    canonNote: 'His brief encounters are canon; no lasting relationship, employment or operational role is inferred.',
    sourceRef: 'Helluva Boss S1E8',
    portrait: portrait('hb_dennis')
  },
  {
    id: 'hb_ralphie',
    name: 'Ralphie',
    alias: 'Martha\'s husband',
    species: 'Human',
    role: 'Murder Family hunter and father',
    affiliation: 'Martha\'s family',
    playable: false,
    spoilerScope: 'season_1',
    description: 'Martha\'s husband and the father of their two children, who joins his family in hunting I.M.P. after the attempted hit on Martha.',
    canonNote: 'Ralphie dies in the missile strike on the family home; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Boss S1E1',
    portrait: portrait('hb_ralphie')
  },
  {
    id: 'hb_catfish_monster',
    name: 'Catfish Monster',
    alias: 'Beelzejuice mutant',
    species: 'Mutant catfish',
    role: 'Beach rampage threat',
    affiliation: 'Independent Earth creature',
    playable: false,
    spoilerScope: 'season_1',
    description: 'An ordinary Earth catfish transformed into a giant monster after exposure to Verosika\'s Beelzejuice, endangering beachgoers and swallowing Moxxie.',
    canonNote: 'Millie kills the creature during its rampage; it remains deceased and is never resurrected or playable.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_catfish_monster')
  },
  {
    id: 'hb_elder_jaws',
    name: 'Elder Jaws',
    alias: 'Syndicate priest',
    species: 'Demon (shark-like; exact species unspecified)',
    role: 'Officiant for Crimson\'s ceremonies',
    affiliation: 'Crimson\'s syndicate',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The priest who officiates Crimson\'s forced wedding arrangement for Moxxie and Chaz, then survives Millie\'s attack by leaving the ceremony.',
    canonNote: 'His officiant role and survival are canon; a Simulation AU contract appearance does not make him an I.M.P. ally.',
    sourceRef: 'Helluva Boss S2E3',
    portrait: portrait('hb_elder_jaws')
  },
  {
    id: 'hb_bethany_ghostfucker',
    name: 'Bethany Ghostfucker',
    alias: 'Ghost Fuckers star',
    species: 'Human',
    role: 'Actress and paranormal adult-show host',
    affiliation: 'Ghost Fuckers',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The human actress starring in the in-universe Ghost Fuckers program watched by Blitzø, whose persona he later uses as a disguise at the One Star Wonder.',
    canonNote: 'Only her screen persona and show are established; the extension does not invent paranormal powers or an I.M.P. connection.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_bethany_ghostfucker')
  },
  {
    id: 'hb_karen_client',
    name: 'Karen Client',
    alias: 'Unnamed Sinsmas client',
    species: 'Sinner demon (former human)',
    role: 'Client requesting a living-world hit',
    affiliation: 'I.M.P. client',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A sinner who hires I.M.P. to kill her ex-husband after he leaves her for another man, before Blitzø calls off the hit on his new family.',
    canonNote: '“Karen Client” is a production label, not a confirmed personal name; her contract never makes her a recruitable operative.',
    sourceRef: 'Helluva Boss S2E12',
    portrait: portrait('hb_karen_client')
  },
  {
    id: 'hb_toledo_the_igor',
    name: 'Toledo the Igor',
    alias: 'One Star Wonder bellhop',
    species: 'Human',
    role: 'Hotel bellhop',
    affiliation: 'One Star Wonder',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The hunchbacked bellhop working behind the front desk at the One Star Wonder while Rolando conceals his murderous activity.',
    canonNote: 'Toledo is presumed alive after the hotel incident; the series does not establish his death, demonic nature or loyalty to Rolando.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_toledo_the_igor')
  },
  {
    id: 'hb_brennon_ragers',
    name: 'Brennon Ragers',
    alias: 'Holly\'s Wood celebrity',
    species: 'Human',
    role: 'Television celebrity',
    affiliation: 'Holly\'s Wood entertainment industry',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A Los Angeles television celebrity whom Blitzø is mistaken for after Octavia arrives through a portal and accidentally lands on the real actor.',
    canonNote: 'Brennon dies when Octavia lands on him; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Boss S2E2',
    portrait: portrait('hb_brennon_ragers')
  },
  {
    id: 'hb_uggie',
    name: 'Uggie',
    alias: 'Sitcom pug',
    species: 'Pug (Earth dog)',
    role: 'Animal actor',
    affiliation: 'Sweetie! I\'m in the House!!',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A pug appearing in the Holly\'s Wood sitcom that triggers Blitzø\'s memory of adopting Loona during a scene about taking in a dog.',
    canonNote: 'Uggie\'s status after the chaotic studio shoot is unknown; this profile does not declare the dog dead, recruited or playable.',
    sourceRef: 'Helluva Boss S2E2',
    portrait: portrait('hb_uggie')
  },
  {
    id: 'hb_skips',
    name: 'Skips',
    alias: 'Crystal-bearing contact',
    species: 'Succubus demon',
    role: 'Information source and portal contact',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'season_2',
    description: 'A succubus whom Blitzø confronts for information about Barbie Wire before using Skips\'s Asmodean Crystal to reach Earth.',
    canonNote: 'The encounter and crystal use are canon; no continuing alliance, death or I.M.P. membership is established.',
    sourceRef: 'Helluva Boss S2E5',
    portrait: portrait('hb_skips')
  },
  {
    id: 'hb_queef',
    name: 'Queef',
    alias: 'Fizzarolli\'s albino Quieve',
    species: 'Quieve',
    role: 'Companion animal with wheeled hind-leg support',
    affiliation: 'Fizzarolli\'s pets',
    playable: false,
    spoilerScope: 'season_2',
    description: 'Fizzarolli\'s cheerful albino Quieve, distinguished by wheels supporting her missing hind legs and seen among his nine pets in Greed.',
    canonNote: 'Her official name is Queef; “Precious” was an obsolete storyboard label and is never used as canon here. She is not playable.',
    sourceRef: 'Helluva Boss S2E6',
    portrait: portrait('hb_queef')
  },
  {
    id: 'hb_ace',
    name: 'Ace',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s entourage',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'specials',
    description: 'A member of Verosika Mayday\'s succubus crew who attends Chaz\'s funeral with Josh after appearing alongside the entourage in the series.',
    canonNote: 'Ace remains part of Verosika\'s team; the funeral cameo does not transfer him to I.M.P. or make him playable.',
    sourceRef: 'Helluva Shorts: Mission: It\'s Chaz Funeral',
    portrait: portrait('hb_ace')
  },
  {
    id: 'hb_gerardo_velazquez',
    name: 'Gerardo Velazquez',
    alias: 'The Farmer',
    species: 'Human',
    role: 'Goat farmer and I.M.P. target',
    affiliation: 'Velazquez farm',
    playable: false,
    spoilerScope: 'specials',
    description: 'A goat farmer near Tijuana who captures Blitzø and exhibits him as a chupacabra after I.M.P. attacks his animals.',
    canonNote: 'Gerardo dies when his damaged windmill falls on him; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Shorts: Mission: Chupacabras',
    portrait: portrait('hb_gerardo_velazquez')
  },
  {
    id: 'hb_frank_mctickly_wrigglers',
    name: 'Frank McTickly Wrigglers',
    alias: 'Mr. Wrigglers',
    species: 'Human',
    role: 'Children\'s entertainer and I.M.P. target',
    affiliation: 'Hugging Dove Charity',
    playable: false,
    spoilerScope: 'specials',
    description: 'A charitable children\'s entertainer targeted by I.M.P. who spends his final day saying goodbye to his many adopted children.',
    canonNote: 'Frank dies when Blitzø completes the contract; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Shorts: Mission: Orphan Time',
    portrait: portrait('hb_frank_mctickly_wrigglers')
  },
  {
    id: 'hb_driveso',
    name: 'Driveso',
    alias: 'Reckless driver',
    species: 'Human',
    role: 'Road hazard and incidental antagonist',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'specials',
    description: 'A dangerously reckless New Mexico driver whose collision kills I.M.P.\'s target and provokes Blitzø into a prolonged road chase.',
    canonNote: 'Moxxie shoots Driveso after the chase; he remains deceased and is never resurrected or playable.',
    sourceRef: 'Helluva Shorts: Mission: Bad Drivezo',
    portrait: portrait('hb_driveso')
  },
  {
    id: 'hb_joe_smoe',
    name: 'Joe Smoe',
    alias: 'Bad Drivezo target',
    species: 'Human',
    role: 'I.M.P. assassination target',
    affiliation: 'Independent',
    playable: false,
    spoilerScope: 'specials',
    description: 'A living-world target pursued on the road by Blitzø and Moxxie before Driveso\'s reckless driving forces his car over a cliff.',
    canonNote: 'Joe Smoe dies in the crash; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Shorts: Mission: Bad Drivezo',
    portrait: portrait('hb_joe_smoe')
  },
  {
    id: 'hb_paulie_paesano',
    name: 'Paulie Paesano',
    alias: 'The Gabagool Tool',
    species: 'Human',
    role: 'Mafia heir and I.M.P. target',
    affiliation: 'Paesano crime family',
    playable: false,
    spoilerScope: 'specials',
    description: 'Luigi Paesano\'s son and would-be crime boss, targeted after murdering a family confidant who caught him skimming inventory.',
    canonNote: 'Paulie dies when Moxxie crushes him under an angel statue; he is never resurrected or playable.',
    sourceRef: 'Helluva Shorts: Mission: Whacked Off',
    portrait: portrait('hb_paulie_paesano')
  },
  {
    id: 'hb_luigi_paesano',
    name: 'Luigi Paesano',
    alias: 'Paesano family boss',
    species: 'Human',
    role: 'Mafia boss and Paulie\'s father',
    affiliation: 'Paesano crime family',
    playable: false,
    spoilerScope: 'specials',
    description: 'The head of the Paesano crime family, whose harsh preparation of Paulie masks a willingness to sacrifice himself to protect his son.',
    canonNote: 'Luigi survives the short and learns of Paulie\'s death; no alliance with Moxxie or I.M.P. is implied.',
    sourceRef: 'Helluva Shorts: Mission: Whacked Off',
    portrait: portrait('hb_luigi_paesano')
  },
  {
    id: 'hb_william_diddle',
    name: 'William Diddle',
    alias: 'Douchecorp CEO',
    species: 'Human',
    role: 'Corporate executive and I.M.P. target',
    affiliation: 'Douchecorp',
    playable: false,
    spoilerScope: 'specials',
    description: 'The corrupt chief executive targeted at Douchecorp, whose identity Blitzø temporarily assumes after the assassination succeeds by accident.',
    canonNote: 'William dies when Blitzø falls through the air duct onto him; this archival profile never resurrects him or makes him playable.',
    sourceRef: 'Helluva Shorts: Mission: Big Boss',
    portrait: portrait('hb_william_diddle')
  },
  {
    id: 'hb_adrian',
    name: 'Adrian',
    alias: 'Whistler\'s Creek witness',
    species: 'Human',
    role: 'Local witness and self-proclaimed Sasquatch tracker',
    affiliation: 'Whistler\'s Creek community',
    playable: false,
    spoilerScope: 'specials',
    description: 'A diner regular dismissed as the village idiot whose stories nevertheless direct I.M.P. toward the Sasquatch hiding near Whistler\'s Creek.',
    canonNote: 'Adrian survives the short; his claims are partly vindicated, but he never joins I.M.P. or becomes playable.',
    sourceRef: 'Helluva Shorts: Mission: Bigfoot',
    portrait: portrait('hb_adrian')
  },
  {
    id: 'hb_mr_mayor',
    name: 'Mr. Mayor',
    alias: 'Whistler\'s Creek mayor',
    species: 'Sasquatch',
    role: 'Mayor and concealed I.M.P. target',
    affiliation: 'Whistler\'s Creek',
    playable: false,
    spoilerScope: 'specials',
    description: 'The Sasquatch serving as the local mayor, hiding his identity in plain sight and redirecting I.M.P. toward a human in a gorilla costume.',
    canonNote: 'Mr. Mayor is explicitly the Sasquatch target and survives by deceiving I.M.P.; he is never a human, recruit or playable profile.',
    sourceRef: 'Helluva Shorts: Mission: Bigfoot',
    portrait: portrait('hb_mr_mayor')
  },
  {
    id: 'hb_gerald',
    name: 'Gerald',
    alias: 'Pharmacy manager',
    species: 'Baphomet demon',
    role: 'Sloth Ring pharmacy manager',
    affiliation: 'Sloth Ring pharmacy',
    playable: false,
    spoilerScope: 'specials',
    description: 'Barbie Wire\'s manager at a Sloth Ring pharmacy, tasked with firing her after the human death exposes the operation\'s drug supply line.',
    canonNote: 'Gerald enforces the employer\'s strike policy rather than acting from a personal feud; he is not an I.M.P. operative.',
    sourceRef: 'Helluva Shorts: Barbie\'s Bad Day',
    portrait: portrait('hb_gerald')
  },
  {
    id: 'hb_rick',
    name: 'Rick',
    alias: 'Sandwich shop worker',
    species: 'Imp',
    role: 'Deli worker and former circus associate',
    affiliation: 'Ricky n Dicky\'s Deli',
    playable: false,
    spoilerScope: 'specials',
    description: 'An imp working at his father\'s Greed Ring sandwich shop who serves Barbie half a sandwich despite the family\'s refusal to keep serving her.',
    canonNote: 'His former circus association and deli work are canon; the extension does not turn that history into I.M.P. membership.',
    sourceRef: 'Helluva Shorts: Barbie\'s Bad Day',
    portrait: portrait('hb_rick')
  },
  {
    id: 'hb_coco',
    name: 'Coco',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A member of Verosika\'s succubus crew introduced during its Spring Break work in the living world.',
    canonNote: 'Crew membership and later background appearances are canon; any intelligence support in a contract is Simulation AU.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_coco')
  },
  {
    id: 'hb_apple',
    name: 'Apple',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A member of Verosika\'s succubus crew introduced during the group\'s Spring Break operation.',
    canonNote: 'Crew membership and later background appearances are canon; any mission coordination in this extension is Simulation AU.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_apple')
  },
  {
    id: 'hb_kat',
    name: 'Kat',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A succubus who works with Verosika\'s crew and first appears during Spring Break.',
    canonNote: 'Only her established crew membership and appearances are treated as canon; contract activity is Simulation AU.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_kat')
  },
  {
    id: 'hb_milky',
    name: 'Milky',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A member of Verosika\'s succubus crew who first works alongside the group during Spring Break.',
    canonNote: 'Her crew membership and on-screen social appearances are canon; operational assistance is Simulation AU.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_milky')
  },
  {
    id: 'hb_kiki',
    name: 'Kiki',
    alias: 'Verosika crew bassist',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A succubus in Verosika\'s crew, later also seen performing bass at the Anti-Blitz party.',
    canonNote: 'Her crew and performance appearances are canon; any field role in a contract remains Simulation AU.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_kiki')
  },
  {
    id: 'hb_josh',
    name: 'Josh',
    alias: 'Verosika crew member',
    species: 'Succubus demon',
    role: 'Performer and member of Verosika\'s crew',
    affiliation: 'Verosika Mayday\'s crew',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A member of Verosika\'s crew who tries to charm Loona during the group\'s Spring Break appearance.',
    canonNote: 'That encounter and his crew membership are canon; contract participation is Simulation AU and grants no I.M.P. status.',
    sourceRef: 'Helluva Boss S1E3',
    portrait: portrait('hb_josh')
  },
  {
    id: 'hb_stolas_family_butler',
    name: 'Stolas\' Family Butler',
    alias: 'Unnamed family butler',
    species: 'Imp',
    role: 'Domestic servant to Stolas\' household',
    affiliation: 'Goetia household staff',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The imp servant seen attending Stolas\' household, including during Stella and Stolas\' argument before Loo Loo Land.',
    canonNote: 'His household employment and appearances are canon; courier or escort duties in contracts are Simulation AU.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_stolas_family_butler')
  },
  {
    id: 'hb_mister_butler',
    name: 'Mister Butler',
    alias: 'Paimon\'s family butler',
    species: 'Imp',
    role: 'Butler serving the Goetia family',
    affiliation: 'Paimon\'s household',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The imp butler who assists Paimon and reminds him of young Stolas\' identity during a childhood flashback.',
    canonNote: 'His service to Paimon in the flashback is canon; any later courier assignment is Simulation AU.',
    sourceRef: 'Helluva Boss S2E1',
    portrait: portrait('hb_mister_butler')
  },
  {
    id: 'hb_marthas_daughter',
    name: 'Martha\'s Daughter',
    alias: 'Unnamed Murder Family daughter',
    species: 'Human',
    role: 'Member of Martha and Ralphie\'s family',
    affiliation: 'Martha\'s family',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The unnamed daughter present at Martha and Ralphie\'s isolated family home when I.M.P. arrives for Mayberry\'s contract.',
    canonNote: 'The series does not establish a personal name or independent occupation; all contract use beyond that appearance is Simulation AU.',
    sourceRef: 'Helluva Boss S1E1',
    portrait: portrait('hb_marthas_daughter')
  },
  {
    id: 'hb_marthas_son',
    name: 'Martha\'s Son',
    alias: 'Unnamed Murder Family son',
    species: 'Human',
    role: 'Member of Martha and Ralphie\'s family',
    affiliation: 'Martha\'s family',
    playable: false,
    spoilerScope: 'season_1',
    description: 'The unnamed son present at Martha and Ralphie\'s isolated family home during Mayberry\'s I.M.P. contract.',
    canonNote: 'The series does not establish a personal name or independent occupation; all added mission context is Simulation AU.',
    sourceRef: 'Helluva Boss S1E1',
    portrait: portrait('hb_marthas_son')
  },
  {
    id: 'hb_harold_patriot',
    name: 'Harold',
    alias: 'The Patriot',
    species: 'Human',
    role: 'Elderly One Star Wonder guest',
    affiliation: 'One Star Wonder guests',
    playable: false,
    spoilerScope: 'season_2',
    description: 'An elderly hotel guest who confronts the apparent paranormal disturbance at the One Star Wonder alongside Dolores.',
    canonNote: 'His hotel encounter and veteran claim are canon; investigative or witness assistance in a contract is Simulation AU.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_harold_patriot')
  },
  {
    id: 'hb_dolores',
    name: 'Dolores',
    alias: 'Yelling Old Dolores',
    species: 'Human',
    role: 'Elderly One Star Wonder guest',
    affiliation: 'One Star Wonder guests',
    playable: false,
    spoilerScope: 'season_2',
    description: 'An elderly hotel guest who stays at the One Star Wonder with Harold during the disturbance caused by Rolando.',
    canonNote: 'Her stay and response to the hotel incident are canon; any later testimony or coordination is Simulation AU.',
    sourceRef: 'Helluva Boss S2E10',
    portrait: portrait('hb_dolores')
  },
  {
    id: 'hb_hellhound_adoption_lady',
    name: 'Hellhound Adoption Center Lady',
    alias: 'Unnamed adoption worker',
    species: 'Hellhound',
    role: 'Worker at the Hellhound Adoption Center',
    affiliation: 'Hellhound Adoption Center',
    playable: false,
    spoilerScope: 'season_2',
    description: 'The elderly hellhound worker who processes Blitz\'s adoption of Loona shortly before Loona ages out of the center.',
    canonNote: 'Her role in Loona\'s adoption flashback is canon; any records support or operational involvement is Simulation AU.',
    sourceRef: 'Helluva Boss S2E2',
    portrait: portrait('hb_hellhound_adoption_lady')
  },
  {
    id: 'hb_travis',
    name: 'Travis',
    alias: 'Hazbin crossover cameo',
    species: 'Demon (exact species unspecified)',
    role: 'Pentagram City film-industry worker and prospective I.M.P. client cameo',
    affiliation: 'Pentagram City adult film industry',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A Hazbin Hotel character who makes a non-speaking Helluva Boss cameo while waiting in line for I.M.P.\'s Spring Break discount.',
    canonNote: 'The visible Spring Broken cameo is the only physical Hazbin-to-Helluva character crossover represented; contract involvement beyond the queue is Simulation AU.',
    sourceRef: 'Helluva Boss S1E3 / Hazbin Hotel crossover cameo',
    portrait: portrait('hb_travis')
  },
  {
    id: 'hb_tour_guide_guy',
    name: 'Tour Guide Guy',
    alias: 'Unnamed bus tour guide',
    species: 'Human',
    role: 'Living-world tour guide',
    affiliation: 'Independent tour company',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A human bus tour guide first seen during the C.H.E.R.U.B. opera outing and later encountered again in Los Angeles.',
    canonNote: 'His tour-guide appearances are canon; any route intelligence or evacuation assistance is Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_tour_guide_guy')
  },
  {
    id: 'hb_big_woobly',
    name: 'Big Woobly',
    alias: 'Loo Loo Land dinosaur',
    species: 'Dinosaur animatronic',
    role: 'Amusement-park attraction',
    affiliation: 'Loo Loo Land',
    playable: false,
    spoilerScope: 'season_1',
    description: 'A large blue-grey dinosaur animatronic installed as a stationary attraction at Loo Loo Land.',
    canonNote: 'Its park appearance is canon, but the series establishes no independent sentience; any contract use is Simulation AU.',
    sourceRef: 'Helluva Boss S1E2',
    portrait: portrait('hb_big_woobly')
  },
  {
    id: 'hb_gerardos_wife',
    name: 'Gerardo\'s Wife',
    alias: 'Unnamed rancher',
    species: 'Human',
    role: 'Gerardo Velazquez\'s wife',
    affiliation: 'Velazquez family ranch',
    playable: false,
    spoilerScope: 'specials',
    description: 'Gerardo\'s Spanish-speaking wife, who confronts Blitz and later mourns Gerardo after the Chupacabras mission.',
    canonNote: 'Her marriage, confrontation and grief are canon; any later witness role is Simulation AU, and no personal name is invented.',
    sourceRef: 'Helluva Shorts: Mission: Chupacabras',
    portrait: portrait('hb_gerardos_wife')
  },
  {
    id: 'hb_diddle_secretary',
    name: 'William Diddle\'s Secretary',
    alias: 'Unnamed Douchecorp secretary',
    species: 'Human',
    role: 'Corporate secretary',
    affiliation: 'Douchecorp',
    playable: false,
    spoilerScope: 'specials',
    description: 'A secretary employed at Douchecorp headquarters during I.M.P.\'s mission targeting William Diddle.',
    canonNote: 'Only her employment and appearance are established; any witness role in a Simulation AU contract does not make her an I.M.P. ally.',
    sourceRef: 'Helluva Shorts: Mission: Big Boss',
    portrait: portrait('hb_diddle_secretary')
  },
  {
    id: 'hb_bigfoot_waiter',
    name: 'Bigfoot Waiter',
    alias: 'Unnamed diner waiter',
    species: 'Human',
    role: 'Diner waiter and local witness',
    affiliation: 'Whistler\'s Creek diner',
    playable: false,
    spoilerScope: 'specials',
    description: 'The diner waiter encountered during I.M.P.\'s search for a Sasquatch, later revealed to have a secret relationship with Mr. Mayor.',
    canonNote: 'His job and relationship are canon; any intelligence he supplies in the extension is Simulation AU.',
    sourceRef: 'Helluva Shorts: Mission: Bigfoot',
    portrait: portrait('hb_bigfoot_waiter')
  },
  {
    id: 'hb_gorilla_suit_guy',
    name: 'Gorilla Suit Guy',
    alias: 'Big Honker\'s promoter',
    species: 'Human',
    role: 'Costumed sandwich-shop promoter',
    affiliation: 'Big Honker\'s Hoagies',
    playable: false,
    spoilerScope: 'specials',
    description: 'A human wearing a gorilla costume to promote a Bigfoot-themed sandwich shop in Whistler\'s Creek.',
    canonNote: 'His promotional job and mistaken-target encounter are canon; contract use is Simulation AU, and a possible connection to Adrian remains unconfirmed.',
    sourceRef: 'Helluva Shorts: Mission: Bigfoot',
    portrait: portrait('hb_gorilla_suit_guy')
  },
  {
    id: 'hb_rachel_cherub',
    name: 'Rachel',
    alias: 'C.H.E.R.U.B. employee',
    species: 'Cherub',
    role: 'Celestial support staff',
    affiliation: 'C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the cherub employees seen accompanying Deerie when Cletus, Collin and Keenie return to Heaven.',
    canonNote: 'Her name, appearance and staff membership are canon; no individual authority or field actions are invented, and contract use is Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_rachel_cherub')
  },
  {
    id: 'hb_bea_cherub',
    name: 'Bea',
    alias: 'C.H.E.R.U.B. employee',
    species: 'Cherub',
    role: 'Celestial support staff',
    affiliation: 'C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the cherub employees present with Deerie during the C.H.E.R.U.B. team\'s return to Heaven.',
    canonNote: 'Her name, appearance and staff membership are canon; no individual authority or field actions are invented, and contract use is Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_bea_cherub')
  },
  {
    id: 'hb_beau_cherub',
    name: 'Beau',
    alias: 'C.H.E.R.U.B. employee',
    species: 'Cherub',
    role: 'Celestial support staff',
    affiliation: 'C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the cherub employees accompanying Deerie when the expelled C.H.E.R.U.B. operatives reach Heaven.',
    canonNote: 'His name, appearance and staff membership are canon; no individual authority or field actions are invented, and contract use is Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_beau_cherub')
  },
  {
    id: 'hb_honey_cherub',
    name: 'Honey',
    alias: 'C.H.E.R.U.B. employee',
    species: 'Cherub',
    role: 'Celestial support staff',
    affiliation: 'C.H.E.R.U.B.',
    playable: false,
    spoilerScope: 'season_1',
    description: 'One of the cherub employees seen beside Deerie at the gates of Heaven after C.H.E.R.U.B.\'s living-world mission.',
    canonNote: 'Her name, appearance and staff membership are canon; no individual authority or field actions are invented, and contract use is Simulation AU.',
    sourceRef: 'Helluva Boss S1E4',
    portrait: portrait('hb_honey_cherub')
  }
] as const satisfies readonly HelluvaCharacterSeed[]).map((profile) => ({
  ...profile,
  rosterTier: resolveHelluvaRosterTier(profile.id),
}));

export const HELLUVA_LORE: readonly HelluvaLoreProfile[] = [
  {
    id: 'hb_lore_shared_universe',
    title: 'One Hellaverse, Separate Storylines',
    category: 'continuity',
    spoilerScope: 'season_1',
    description: 'Helluva Boss and Hazbin Hotel share the Hellaverse setting, but follow different casts and storylines. This module never assumes a canon hotel/I.M.P. crossover.',
    sourceRef: 'Prime Video / Amazon MGM Studios series overview'
  },
  {
    id: 'hb_lore_imp',
    title: 'Immediate Murder Professionals',
    category: 'company',
    spoilerScope: 'season_1',
    description: 'I.M.P. is Blitzø\'s assassination startup. Blitzø, Moxxie, Millie and Loona form its core operating team.',
    sourceRef: 'Helluva Boss series premise'
  },
  {
    id: 'hb_lore_living_world',
    title: 'Living-World Contracts',
    category: 'world_rule',
    spoilerScope: 'season_1',
    description: 'I.M.P. accepts clients in Hell and travels to the living world to pursue contracted targets. Contract scores and outcomes here are original Simulation AU gameplay.',
    sourceRef: 'Helluva Boss series premise'
  },
  {
    id: 'hb_lore_goetia',
    title: 'Ars Goetia Family',
    category: 'faction',
    spoilerScope: 'season_1',
    description: 'Stolas, Octavia and Stella belong to a powerful infernal aristocratic sphere distinct from ordinary imp society.',
    sourceRef: 'Helluva Boss Season 1'
  },
  {
    id: 'hb_lore_andrealphus',
    title: 'Andrealphus and Goetia Politics',
    category: 'faction',
    spoilerScope: 'season_2',
    description: 'Season 2 introduces Andrealphus as Stella\'s brother and an active participant in the Goetia family conflict.',
    sourceRef: 'Helluva Boss Season 2'
  },
  {
    id: 'hb_lore_grimoire',
    title: 'Stolas\'s Grimoire',
    category: 'item',
    spoilerScope: 'season_1',
    description: 'The grimoire is tied to I.M.P.\'s early access to the living world. This game does not invent fuel, ammunition or ownership rules for it.',
    sourceRef: 'Helluva Boss Season 1'
  },
  {
    id: 'hb_lore_crystal',
    title: 'Asmodean Crystal Access',
    category: 'item',
    spoilerScope: 'season_2',
    description: 'Season 2 changes how living-world access is handled. The campaign models portal access only as available, compromised or suspended rather than inventing a consumable resource.',
    sourceRef: 'Helluva Boss Season 2'
  },
  {
    id: 'hb_lore_simulation_boundary',
    title: 'Original Contracts Are Simulation AU',
    category: 'continuity',
    spoilerScope: 'season_1',
    description: 'Funds, heat, discretion, crew fatigue, choices, contracts and endings are management-game systems. They are not events claimed to happen in the series.',
    sourceRef: 'Extension manual note'
  }
] as const;

export const HELLUVA_CONTRACTS: readonly HelluvaContractDefinition[] = [
  {
    id: 'hb_contract_01_report', chapter: 1, order: 1, title: 'The Impossible Report',
    client: 'I.M.P. internal review', location: 'Imp City office', difficulty: 'routine',
    summary: 'Reconstruct a dangerously incomplete client file before anyone opens a portal on the wrong coordinates.',
    prerequisiteId: null, entryCost: 20, reward: 260, completionHeat: 0,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona', 'hb_cash_buckzo', 'hb_wally_wackford', 'hb_tilla'],
    phaseBriefs: ['Audit the client file and identify the missing facts.', 'Verify the target trail without exposing the company.', 'Choose what the final report admits and archive the evidence.'],
    tactics: [
      { id: 'red_thread_audit', label: 'Red-thread audit', description: 'Rebuild the file from receipts, portal timestamps and contradictions before anyone acts.' },
      { id: 'four_way_reconstruction', label: 'Four-way reconstruction', description: 'Give each I.M.P. operative one part of the report, then reconcile their findings together.' },
      { id: 'impossible_hunch', label: 'Blitzø\'s impossible hunch', description: 'Follow the one outrageous theory that explains every missing page if it happens to be right.' }
    ]
  },
  {
    id: 'hb_contract_02_clean', chapter: 1, order: 2, title: 'An Almost Clean Contract',
    client: 'Newly arrived sinner', location: 'Living world suburb', difficulty: 'routine',
    summary: 'Complete a straightforward revenge contract while teaching the crew how this campaign scores exposure and teamwork.',
    prerequisiteId: 'hb_contract_01_report', entryCost: 45, reward: 340, completionHeat: 2,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona', 'hb_barbie_wire', 'hb_mrs_mayberry', 'hb_martha', 'hb_loopty_goopty', 'hb_lyle_lipton', 'hb_emberlynn_pinkle', 'hb_ralphie', 'hb_gerardo_velazquez', 'hb_frank_mctickly_wrigglers', 'hb_driveso', 'hb_joe_smoe', 'hb_william_diddle', 'hb_adrian', 'hb_mr_mayor', 'hb_marthas_daughter', 'hb_marthas_son', 'hb_big_woobly', 'hb_gerardos_wife', 'hb_diddle_secretary', 'hb_bigfoot_waiter', 'hb_gorilla_suit_guy'],
    phaseBriefs: ['Confirm the client, target and exit conditions.', 'Approach the target through a crowded neighborhood.', 'Remove the trail and settle the client invoice.'],
    tactics: [
      { id: 'neighborhood_ghost', label: 'Neighborhood ghost route', description: 'Use service alleys and empty houses to reach the target without becoming local gossip.' },
      { id: 'decoy_delivery', label: 'Decoy delivery team', description: 'Stage a harmless delivery while the rest of the crew controls the exits.' },
      { id: 'suburban_fireworks', label: 'Suburban fireworks', description: 'Turn the quiet block into a dazzling distraction and finish before anyone understands it.' }
    ]
  },
  {
    id: 'hb_contract_03_camera', chapter: 1, order: 3, title: 'Witness on Camera',
    client: 'Confidential sinner client', location: 'Living world media district', difficulty: 'risky',
    summary: 'A bystander recorded an infernal transformation. Recover the footage before it reaches a public feed.',
    prerequisiteId: 'hb_contract_02_clean', entryCost: 60, reward: 410, completionHeat: 4,
    featuredCharacterIds: ['hb_loona', 'hb_verosika', 'hb_vortex', 'hb_barbie_wire', 'hb_wally_wackford', 'hb_robo_fizz', 'hb_rolando', 'hb_rita', 'hb_better_than_blitzo_guy', 'hb_loo_loo', 'hb_vikki', 'hb_gigi', 'hb_russ', 'hb_dennis', 'hb_catfish_monster', 'hb_bethany_ghostfucker', 'hb_toledo_the_igor', 'hb_brennon_ragers', 'hb_uggie', 'hb_ace', 'hb_coco', 'hb_apple', 'hb_kat', 'hb_milky', 'hb_kiki', 'hb_josh', 'hb_harold_patriot', 'hb_dolores', 'hb_travis', 'hb_tour_guide_guy'],
    phaseBriefs: ['Trace every copy of the recording.', 'Reach the witness and the backup server.', 'Decide whether to erase, replace or bury the evidence.'],
    tactics: [
      { id: 'cold_storage_sweep', label: 'Cold-storage sweep', description: 'Trace metadata and backups until every copy of the infernal footage has an owner.' },
      { id: 'witness_bargain', label: 'Witness protection bargain', description: 'Offer the witness a safe exit while the crew divides the server and street work.' },
      { id: 'hijack_broadcast', label: 'Hijack the broadcast', description: 'Replace the dangerous clip with an impossible spectacle that discredits the original.' }
    ]
  },
  {
    id: 'hb_contract_04_cherub', chapter: 1, order: 4, title: 'Protection Included',
    client: 'High-risk sinner client', location: 'Living world hospital', difficulty: 'dangerous',
    summary: 'A protected target draws celestial interference, forcing I.M.P. to finish the job without turning the district into proof of Hell.',
    prerequisiteId: 'hb_contract_03_camera', entryCost: 75, reward: 500, completionHeat: 6,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_cletus', 'hb_collin', 'hb_keenie', 'hb_deerie', 'hb_muffy', 'hb_dr_somna', 'hb_rachel_cherub', 'hb_bea_cherub', 'hb_beau_cherub', 'hb_honey_cherub'],
    phaseBriefs: ['Map celestial patrol patterns and civilian traffic.', 'Separate the target from the protection detail.', 'Exit before the celestial response can establish a pattern.'],
    tactics: [
      { id: 'chapel_blind_clock', label: 'Chapel blind clock', description: 'Exploit the short interval when the ward, cameras and celestial patrol stop overlapping.' },
      { id: 'split_halo_patrol', label: 'Split the halo patrol', description: 'Coordinate two diversions so the protection detail leaves the target uncovered.' },
      { id: 'crash_sanctified_ward', label: 'Crash the sanctified ward', description: 'Overload every defense at once and escape through the confusion before reinforcements land.' }
    ]
  },
  {
    id: 'hb_contract_05_dhorks', chapter: 2, order: 5, title: 'The D.H.O.R.K.S. Trail',
    client: 'I.M.P. counter-intelligence', location: 'Living world government annex', difficulty: 'dangerous',
    summary: 'A surveillance team is rebuilding I.M.P.\'s movement pattern. Feed it a false route or destroy the trace.',
    prerequisiteId: 'hb_contract_04_cherub', entryCost: 85, reward: 560, completionHeat: 5,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona', 'hb_agent_one', 'hb_agent_two'],
    phaseBriefs: ['Identify the investigators and their collection point.', 'Enter the annex while a second team is watching.', 'Plant disinformation or erase the operational archive.'],
    tactics: [
      { id: 'paper_ghost', label: 'Paper ghost', description: 'Build a credible false identity that can walk through the annex without touching an alarm.' },
      { id: 'two_team_false_trail', label: 'Two-team false trail', description: 'Let one pair seed a decoy route while the other reaches the real collection point.' },
      { id: 'sign_decoy_file', label: 'Sign the decoy file', description: 'Give D.H.O.R.K.S. a flamboyant fake pattern too irresistible for them to ignore.' }
    ]
  },
  {
    id: 'hb_contract_06_blindspot', chapter: 2, order: 6, title: 'Blind Spot',
    client: 'I.M.P. survival contract', location: 'D.H.O.R.K.S. field facility', difficulty: 'crisis',
    summary: 'Break the first major surveillance net while choosing between evidence destruction, rescue and long-term misdirection.',
    prerequisiteId: 'hb_contract_05_dhorks', entryCost: 100, reward: 650, completionHeat: 8,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona'],
    phaseBriefs: ['Build a route through the facility\'s blind zones.', 'Secure the crew and the evidence room under pressure.', 'Choose which objective survives when the extraction window closes.'],
    tactics: [
      { id: 'dead_angle_crawl', label: 'Dead-angle crawl', description: 'Cross the facility only when its cameras and response teams are looking elsewhere.' },
      { id: 'crew_first_breach', label: 'Crew-first breach', description: 'Link every objective to a protected rally point so nobody is traded for evidence.' },
      { id: 'burn_surveillance_grid', label: 'Burn the surveillance grid', description: 'Turn the whole net against itself and leave D.H.O.R.K.S. staring at static.' }
    ]
  },
  {
    id: 'hb_contract_07_family_debt', chapter: 2, order: 7, title: 'Syndicate Pressure',
    client: 'Protected informant', location: 'Greed Ring', difficulty: 'dangerous',
    summary: 'A Greed Ring syndicate is pressuring an I.M.P. associate for operational intelligence. Extract the informant without forcing loyalty or reconciliation.',
    prerequisiteId: 'hb_contract_06_blindspot', entryCost: 90, reward: 610, completionHeat: 3,
    featuredCharacterIds: ['hb_moxxie', 'hb_millie', 'hb_crimson', 'hb_chazwick_thurman', 'hb_barbie_wire', 'hb_sallie_may', 'hb_moxxies_mother', 'hb_alessio', 'hb_counselor_jimmy', 'hb_kendra', 'hb_elder_jaws', 'hb_karen_client', 'hb_skips', 'hb_gerald', 'hb_rick'],
    phaseBriefs: ['Let the informant define the operation\'s safety boundaries.', 'Move the informant past syndicate collectors.', 'Choose a protection plan that does not turn safety into another debt.'],
    tactics: [
      { id: 'boundary_first_extraction', label: 'Boundary-first extraction', description: 'Build the route around the informant\'s consent, safe contacts and absolute limits.' },
      { id: 'associate_chosen_escort', label: 'Associate-chosen escort', description: 'Let the protected associate choose who handles each stage of the Greed Ring crossing.' },
      { id: 'break_collectors_line', label: 'Break the collectors\' line', description: 'Draw the syndicate into a loud false collection while the informant takes the real exit.' }
    ]
  },
  {
    id: 'hb_contract_08_warehouse', chapter: 2, order: 8, title: 'The Greed Warehouse',
    client: 'Independent Greed Ring broker', location: 'Greed Ring warehouse district', difficulty: 'dangerous',
    summary: 'Recover a syndicate ledger before it can be sold to every rival with a grudge against I.M.P.',
    prerequisiteId: 'hb_contract_07_family_debt', entryCost: 105, reward: 690, completionHeat: 4,
    featuredCharacterIds: ['hb_moxxie', 'hb_millie', 'hb_crimson', 'hb_chazwick_thurman'],
    phaseBriefs: ['Survey the warehouse shifts and false ledgers.', 'Reach the vault without triggering a district-wide fight.', 'Extract the real ledger and decide what copies remain.'],
    tactics: [
      { id: 'shift_change_infiltration', label: 'Shift-change infiltration', description: 'Enter between warehouse crews, when every guard assumes someone else checked the manifest.' },
      { id: 'vault_relay', label: 'Vault relay', description: 'Pass codes, keys and the real ledger through a timed chain that keeps the crew moving.' },
      { id: 'warehouse_riot_decoy', label: 'Warehouse riot decoy', description: 'Start a spectacular argument over the false ledgers while I.M.P. empties the real vault.' }
    ]
  },
  {
    id: 'hb_contract_09_red_ledger', chapter: 3, order: 9, title: 'The Red Ledger',
    client: 'I.M.P. strategic operation', location: 'Greed Ring safehouse', difficulty: 'crisis',
    summary: 'Use the recovered ledger to cut criminal leverage, expose a network or buy a temporary ceasefire.',
    prerequisiteId: 'hb_contract_08_warehouse', entryCost: 115, reward: 760, completionHeat: 5,
    featuredCharacterIds: ['hb_asmodeus', 'hb_mammon', 'hb_glitz', 'hb_glam', 'hb_crimson', 'hb_leviathan', 'hb_belphegor', 'hb_arick_burnz', 'hb_miles', 'hb_paulie_paesano', 'hb_luigi_paesano'],
    phaseBriefs: ['Verify which names can be acted on safely.', 'Reach the syndicate archive before it relocates.', 'Burn, expose or leverage the ledger without sacrificing the crew.'],
    tactics: [
      { id: 'quiet_leverage_map', label: 'Quiet leverage map', description: 'Verify every connection and cut only the links that cannot endanger protected names.' },
      { id: 'protected_disclosure', label: 'Protected disclosure', description: 'Divide the evidence so exposure, leverage and crew safety remain under shared control.' },
      { id: 'broadcast_red_ledger', label: 'Broadcast the red ledger', description: 'Make the syndicate fear the story of the ledger before revealing how much I.M.P. truly holds.' }
    ]
  },
  {
    id: 'hb_contract_10_bounty', chapter: 3, order: 10, title: 'Bounty Season',
    client: 'I.M.P. defensive operation', location: 'Wrath Ring badlands', difficulty: 'crisis',
    summary: 'A rival assassin hunts Blitzø and Stolas. Turn the pursuit into a controlled extraction rather than a fatal canon rewrite.',
    prerequisiteId: 'hb_contract_09_red_ledger', entryCost: 125, reward: 820, completionHeat: 4,
    featuredCharacterIds: ['hb_blitzo', 'hb_stolas', 'hb_striker', 'hb_stella', 'hb_vassago', 'hb_sallie_may', 'hb_joe', 'hb_lin', 'hb_satan', 'hb_bombproof'],
    phaseBriefs: ['Track the hunter without using Stolas as bait.', 'Choose a trap, duel or evacuation route.', 'Leave the badlands with every canon character alive.'],
    tactics: [
      { id: 'counter_hunter_trail', label: 'Counter-hunter trail', description: 'Read the assassin\'s spoor backward and prepare an exit before springing any trap.' },
      { id: 'badlands_crossfire', label: 'Badlands crossfire', description: 'Coordinate scouts, cover and evacuation so the hunter never isolates a crew member.' },
      { id: 'public_challenge', label: 'Public challenge', description: 'Turn the pursuit into a brazen contest that pulls the bounty hunter away from every vulnerable target.' }
    ]
  },
  {
    id: 'hb_contract_11_open_door', chapter: 3, order: 11, title: 'A Door Left Open',
    client: 'Neutral Goetia intermediary', location: 'Pride Ring transit route', difficulty: 'dangerous',
    summary: 'Protect a courier carrying personal effects while respecting Octavia\'s right to distance, contact or silence.',
    prerequisiteId: 'hb_contract_10_bounty', entryCost: 110, reward: 790, completionHeat: 2,
    featuredCharacterIds: ['hb_stolas', 'hb_octavia', 'hb_stella', 'hb_andrealphus', 'hb_vassago', 'hb_paimon', 'hb_stolas_family_butler', 'hb_mister_butler', 'hb_hellhound_adoption_lady'],
    phaseBriefs: ['Confirm the courier\'s consent and the delivery boundary.', 'Escort the package through political surveillance.', 'Deliver, defer or secure the message without forcing a response.'],
    tactics: [
      { id: 'unmarked_transit', label: 'Unmarked transit', description: 'Move the courier through ordinary routes that give Goetia observers nothing useful to catalogue.' },
      { id: 'consent_led_escort', label: 'Consent-led escort', description: 'Let the courier set every handoff, pause and fallback point while I.M.P. protects the perimeter.' },
      { id: 'royal_convoy_decoy', label: 'Royal convoy decoy', description: 'Stage an ostentatious noble procession far from the courier\'s quiet path.' }
    ]
  },
  {
    id: 'hb_contract_12_open_portal', chapter: 3, order: 12, title: 'Portal Open',
    client: 'I.M.P. final operation', location: 'Imp City and the living world', difficulty: 'crisis',
    summary: 'Contain a living-world breach and an infernal injunction at once. Cumulative funds, heat, cohesion, discretion, reputation and fatigue determine the shape of the final extraction.',
    prerequisiteId: 'hb_contract_11_open_door', entryCost: 150, reward: 1000, completionHeat: 10,
    featuredCharacterIds: ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona', 'hb_stolas', 'hb_fizzarolli', 'hb_asmodeus', 'hb_beelzebub', 'hb_mammon', 'hb_yogirt', 'hb_jesse', 'hb_queef'],
    phaseBriefs: ['Divide the crew between the breach and the legal threat.', 'Hold the portal route while evidence and civilians converge.', 'Commit to the extraction plan earned by the campaign\'s cumulative metrics.'],
    tactics: [
      { id: 'metric_balanced_extraction', label: 'Metric-balanced extraction', description: 'Spend the campaign\'s remaining resources to reduce the weakest operational metric before the portal closes.' },
      { id: 'crew_linked_corridor', label: 'Crew-linked corridor', description: 'Turn accumulated trust and discipline into a relay between civilians, evidence and the last exit.' },
      { id: 'legendary_last_exit', label: 'Legendary last exit', description: 'Convert I.M.P.\'s hard-won reputation into a final distraction nobody in either world will forget.' }
    ]
  }
] as const;

export const HELLUVA_APPROACHES: readonly HelluvaApproachChoice[] = [
  {
    id: 'verified_intel', phaseIndex: 0, label: 'Buy verified intelligence',
    description: 'Spend more now to reduce exposure and give the team a precise plan.',
    effects: { funds: -350, heat: -6, cohesion: 1, discretion: 10, fatigue: 1 }
  },
  {
    id: 'crew_briefing', phaseIndex: 0, label: 'Run a full crew briefing',
    description: 'Build agreement and assign stop conditions before the portal opens.',
    effects: { funds: -30, heat: -1, cohesion: 8, discretion: 3, fatigue: 5 }
  },
  {
    id: 'wing_it', phaseIndex: 0, label: 'Improvise from the van',
    description: 'Save preparation money, gain swagger and accept a much noisier opening.',
    effects: { funds: 0, heat: 2, cohesion: -5, discretion: -7, reputation: 4, fatigue: 3 }
  },
  {
    id: 'silent_entry', phaseIndex: 1, label: 'Silent entry',
    description: 'Use disguises, timing and controlled movement to keep the operation invisible.',
    effects: { funds: -45, heat: -7, discretion: 9, fatigue: 10 }
  },
  {
    id: 'precision_team', phaseIndex: 1, label: 'Precision teamwork',
    description: 'Balance Moxxie\'s plan, Millie\'s force, Loona\'s tracking and Blitzø\'s timing.',
    effects: { funds: -200, heat: 1, cohesion: 6, reputation: 4, fatigue: 2 }
  },
  {
    id: 'full_spectacle', phaseIndex: 1, label: 'Full spectacle',
    description: 'Make the operation fast, memorable and extremely difficult to explain afterward.',
    effects: { funds: -10, heat: 2, cohesion: -10, discretion: -10, reputation: 9, fatigue: 4 }
  },
  {
    id: 'erase_trail', phaseIndex: 2, label: 'Erase the trail',
    description: 'Spend time and cash eliminating evidence before anyone celebrates.',
    effects: { funds: -80, heat: -6, cohesion: -4, discretion: 10, reputation: -2, fatigue: 12 }
  },
  {
    id: 'paid_recovery', phaseIndex: 2, label: 'Pay the crew and recover',
    description: 'Prioritize medical checks, food, honest debriefing and protected rest.',
    effects: { funds: -350, cohesion: 10, reputation: 2, fatigue: -8 }
  },
  {
    id: 'calling_card', phaseIndex: 2, label: 'Leave a calling card',
    description: 'Turn the outcome into marketing and accept the attention that follows.',
    effects: { funds: 25, heat: 20, cohesion: 10, discretion: -12, reputation: 14, fatigue: 2 }
  }
] as const;

/**
 * Returns the three stable phase archetypes dressed in the selected contract's
 * narrative tactics. Choice ids deliberately remain the archetype ids so old
 * saves, audit logs and deterministic simulations keep working across copy edits.
 */
export function getHelluvaApproachesForContract(
  contractId: string,
  phaseIndex: 0 | 1 | 2
): HelluvaApproachChoice[] {
  const contract = HELLUVA_CONTRACTS.find(candidate => candidate.id === contractId);
  if (!contract) return [];

  return HELLUVA_APPROACHES
    .filter(approach => approach.phaseIndex === phaseIndex)
    .map((approach, tacticIndex) => {
      const tactic = contract.tactics[tacticIndex];
      return {
        ...approach,
        label: `${tactic.label} · ${approach.label}`,
        description: `${tactic.description} ${approach.description}`
      };
    });
}

export const HELLUVA_CREW_IDS = ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona'] as const;

export const HELLUVA_SPRITE_SHEETS = [
  {
    id: 'helluva-core',
    path: '/assets/sprites/helluva/sheets/helluva-core.png',
    spoilerScope: 'season_1',
    characters: ['Blitzø', 'Moxxie', 'Millie', 'Loona']
  },
  {
    id: 'helluva-allies',
    path: '/assets/sprites/helluva/sheets/helluva-allies.png',
    spoilerScope: 'season_1',
    characters: ['Stolas', 'Octavia', 'Fizzarolli', 'Verosika Mayday']
  },
  {
    id: 'helluva-powers',
    path: '/assets/sprites/helluva/sheets/helluva-powers.png',
    spoilerScope: 'season_1',
    characters: ['Asmodeus', 'Beelzebub', 'Striker', 'Stella']
  },
  {
    id: 'helluva-extended',
    path: '/assets/sprites/helluva/sheets/helluva-extended.png',
    spoilerScope: 'season_2',
    characters: ['Crimson', 'Vortex', 'Sallie May', 'Andrealphus']
  },
  {
    id: 'helluva-origins',
    path: '/assets/sprites/helluva/sheets/helluva-origins.png',
    spoilerScope: 'season_2',
    characters: ['Paimon', 'Barbie Wire', 'Cash Buckzo', 'Wally Wackford']
  },
  {
    id: 'helluva-rivals',
    path: '/assets/sprites/helluva/sheets/helluva-rivals.png',
    spoilerScope: 'season_2',
    characters: ['Mammon', 'Chazwick Thurman', 'Glitz', 'Glam']
  },
  {
    id: 'helluva-celestial',
    path: '/assets/sprites/helluva/sheets/helluva-celestial.png',
    spoilerScope: 'season_2',
    characters: ['Cletus', 'Collin', 'Keenie', 'Vassago']
  },
  {
    id: 'helluva-operatives',
    path: '/assets/sprites/helluva/sheets/helluva-operatives.png',
    spoilerScope: 'season_2',
    characters: ['Robo Fizz', 'Agent One', 'Agent Two', 'Satan']
  },
  {
    id: 'helluva-powers-and-kin',
    path: '/assets/sprites/helluva/sheets/helluva-powers-and-kin.png',
    spoilerScope: 'season_2',
    characters: ['Joe', 'Lin', 'Leviathan', 'Belphegor']
  },
  {
    id: 'helluva-hauntings',
    path: '/assets/sprites/helluva/sheets/helluva-hauntings.png',
    spoilerScope: 'season_2',
    characters: ['Rolando', 'Mrs. Mayberry', 'Martha', 'Tilla']
  },
  {
    id: 'helluva-legacies',
    path: '/assets/sprites/helluva/sheets/helluva-legacies.png',
    spoilerScope: 'season_2',
    characters: ['Moxxie\'s mother', 'Loopty Goopty', 'Lyle Lipton', 'Deerie']
  },
  {
    id: 'helluva-secondary-underworld',
    path: '/assets/sprites/helluva/sheets/helluva-secondary-underworld.png',
    spoilerScope: 'season_2',
    characters: ['Alessio', 'Arick “Burnie” Burnz', 'Counselor Jimmy', 'Yogirt']
  },
  {
    id: 'helluva-secondary-humans',
    path: '/assets/sprites/helluva/sheets/helluva-secondary-humans.png',
    spoilerScope: 'specials',
    characters: ['Emberlynn Pinkle', 'Kendra', 'Rita', 'Better Than Blitzo Guy']
  },
  {
    id: 'helluva-secondary-rides',
    path: '/assets/sprites/helluva/sheets/helluva-secondary-rides.png',
    spoilerScope: 'season_2',
    characters: ['Loo Loo', 'Jesse', 'Miles', 'Bombproof']
  },
  {
    id: 'helluva-secondary-nightlife',
    path: '/assets/sprites/helluva/sheets/helluva-secondary-nightlife.png',
    spoilerScope: 'season_2',
    characters: ['Muffy', 'Dr. Somna', 'Vikki', 'Gigi']
  },
  {
    id: 'helluva-friends-and-foes',
    path: '/assets/sprites/helluva/sheets/helluva-friends-and-foes.png',
    spoilerScope: 'season_1',
    characters: ['Russ', 'Dennis', 'Ralphie', 'Catfish Monster']
  },
  {
    id: 'helluva-greed-and-ghosts',
    path: '/assets/sprites/helluva/sheets/helluva-greed-and-ghosts.png',
    spoilerScope: 'season_2',
    characters: ['Elder Jaws', 'Bethany Ghostfucker', 'Karen Client', 'Toledo the Igor']
  },
  {
    id: 'helluva-stars-and-strays',
    path: '/assets/sprites/helluva/sheets/helluva-stars-and-strays.png',
    spoilerScope: 'season_2',
    characters: ['Brennon Ragers', 'Uggie', 'Skips', 'Queef']
  },
  {
    id: 'helluva-shorts-targets-a',
    path: '/assets/sprites/helluva/sheets/helluva-shorts-targets-a.png',
    spoilerScope: 'specials',
    characters: ['Ace', 'Gerardo Velazquez', 'Frank McTickly Wrigglers', 'Driveso']
  },
  {
    id: 'helluva-shorts-targets-b',
    path: '/assets/sprites/helluva/sheets/helluva-shorts-targets-b.png',
    spoilerScope: 'specials',
    characters: ['Joe Smoe', 'Paulie Paesano', 'Luigi Paesano', 'William Diddle']
  },
  {
    id: 'helluva-shorts-locals',
    path: '/assets/sprites/helluva/sheets/helluva-shorts-locals.png',
    spoilerScope: 'specials',
    characters: ['Adrian', 'Mr. Mayor', 'Gerald', 'Rick']
  },
  {
    id: 'helluva-verosika-crew-a',
    path: '/assets/sprites/helluva/sheets/helluva-verosika-crew-a.png',
    spoilerScope: 'season_1',
    characters: ['Coco', 'Apple', 'Kat', 'Milky']
  },
  {
    id: 'helluva-verosika-crew-b',
    path: '/assets/sprites/helluva/sheets/helluva-verosika-crew-b.png',
    spoilerScope: 'season_2',
    characters: ['Kiki', 'Josh', 'Stolas\' Family Butler', 'Mister Butler']
  },
  {
    id: 'helluva-family-fallout',
    path: '/assets/sprites/helluva/sheets/helluva-family-fallout.png',
    spoilerScope: 'season_2',
    characters: ['Martha\'s Daughter', 'Martha\'s Son', 'Harold', 'Dolores']
  },
  {
    id: 'helluva-turning-points',
    path: '/assets/sprites/helluva/sheets/helluva-turning-points.png',
    spoilerScope: 'season_2',
    characters: ['Hellhound Adoption Center Lady', 'Travis', 'Tour Guide Guy', 'Big Woobly']
  },
  {
    id: 'helluva-shorts-witnesses',
    path: '/assets/sprites/helluva/sheets/helluva-shorts-witnesses.png',
    spoilerScope: 'specials',
    characters: ['Gerardo\'s Wife', 'William Diddle\'s Secretary', 'Bigfoot Waiter', 'Gorilla Suit Guy']
  },
  {
    id: 'helluva-cherub-staff',
    path: '/assets/sprites/helluva/sheets/helluva-cherub-staff.png',
    spoilerScope: 'season_1',
    characters: ['Rachel', 'Bea', 'Beau', 'Honey']
  }
] as const satisfies readonly HelluvaSpriteSheet[];
