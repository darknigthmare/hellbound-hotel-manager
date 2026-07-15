import { HelluvaBossSpoilerScope } from '../../types';

export const HELLUVA_BOSS_DATA_VERSION = 1;

export interface HelluvaCharacterProfile {
  id: string;
  name: string;
  alias: string;
  species: string;
  role: string;
  affiliation: string;
  playable: boolean;
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

const portrait = (id: string) => `/assets/sprites/helluva/portraits/${id}.png`;

export const HELLUVA_CHARACTERS: readonly HelluvaCharacterProfile[] = [
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
  }
] as const;

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
    characters: ['Blitzø', 'Moxxie', 'Millie', 'Loona']
  },
  {
    id: 'helluva-allies',
    path: '/assets/sprites/helluva/sheets/helluva-allies.png',
    characters: ['Stolas', 'Octavia', 'Fizzarolli', 'Verosika Mayday']
  },
  {
    id: 'helluva-powers',
    path: '/assets/sprites/helluva/sheets/helluva-powers.png',
    characters: ['Asmodeus', 'Beelzebub', 'Striker', 'Stella']
  },
  {
    id: 'helluva-extended',
    path: '/assets/sprites/helluva/sheets/helluva-extended.png',
    characters: ['Crimson', 'Vortex', 'Sallie May', 'Andrealphus']
  }
] as const;
