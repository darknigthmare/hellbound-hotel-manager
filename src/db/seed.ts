import { DatabaseState, Character, Room, Faction, Relationship, LoreEntry, ResourceLedger, StaffTask, RehabilitationPlan, RehabilitationSession, Incident, ReputationState, TimelineState, AuditLog, AppSettings } from '../types';

export function getSeedData(): DatabaseState {
  const characters: Character[] = [
    {
      id: 'charlie',
      name: 'Charlie Morningstar',
      alias: 'Princess of Hell',
      type: 'fallen_angel',
      role: 'founder',
      status: 'staff',
      riskLevel: 'low',
      charlieTrust: 100,
      rehabProgress: 100,
      contracts: [],
      notes: 'Extremely optimistic. Seeking to establish a rehabilitation program for damned souls. Family connections are politically significant but strained.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'The idealistic founder of the redemption initiative, utilizing royal influence to advocate for peaceful rehabilitation of sinners.'
    },
    {
      id: 'vaggie',
      name: 'Vaggie',
      alias: 'Manager V',
      type: 'angel',
      role: 'manager',
      status: 'staff',
      riskLevel: 'low',
      charlieTrust: 100,
      rehabProgress: 100,
      contracts: [],
      notes: 'Handles logistics and physical security. Protective of Charlie. Tactical background. High vigilance against external threats.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'season_1', // spoiler: angel background
      description: 'The operations manager and head of security at the hotel, focused on structural discipline and defensive safety.'
    },
    {
      id: 'angeldust',
      name: 'Angel Dust',
      alias: 'Angel',
      type: 'sinner',
      role: 'resident',
      status: 'resident',
      riskLevel: 'high',
      charlieTrust: 45,
      rehabProgress: 20,
      contracts: ['Soul contract with Valentino (studio-bound terms)'],
      notes: 'First official resident. High relapsing rate due to external employment pressures and emotional instability. Needs constant supervision.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'A prominent hotel resident dealing with external soul contracts, substance dependency, and complex rehabilitation requirements.'
    },
    {
      id: 'alastor',
      name: 'Alastor',
      alias: 'The Radio Demon',
      type: 'overlord',
      role: 'sponsor',
      status: 'staff',
      riskLevel: 'catastrophic',
      charlieTrust: 30,
      rehabProgress: 0,
      contracts: ['Unspecified owner deal limits his autonomy'],
      notes: 'A powerful Overlord providing facilities and media broadcast power to the hotel. Motivations remain highly suspect. Do not sign agreements with him.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'A notorious media-oriented Overlord acting as the hotel\'s patron, offering defense and assistance while maintaining personal agendas.'
    },
    {
      id: 'husk',
      name: 'Husk',
      alias: 'Husker',
      type: 'sinner',
      role: 'bartender',
      status: 'staff',
      riskLevel: 'medium',
      charlieTrust: 75,
      rehabProgress: 50,
      contracts: ['Soul bound by Alastor\'s contract'],
      notes: 'Assigned by Alastor as bartender. Cynical but observant. Valuable for reading resident temperaments and de-escalation at the bar.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'An experienced former Overlord now acting as the hotel bartender and front-line counselor for distressed residents.'
    },
    {
      id: 'niffty',
      name: 'Niffty',
      alias: 'Clean Demon',
      type: 'sinner',
      role: 'housekeeper',
      status: 'staff',
      riskLevel: 'low',
      charlieTrust: 80,
      rehabProgress: 40,
      contracts: ['Assigned by Alastor'],
      notes: 'Hyper-focused on cleaning and pest elimination. Unpredictable impulses around sharp objects. Highly loyal but lacks logical restraint.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'The energetic housekeeper of the facility, managing sanitary conditions and structural pest control.'
    },
    {
      id: 'sirpentious',
      name: 'Sir Pentious',
      alias: 'The Snake',
      type: 'sinner',
      role: 'antagonist',
      status: 'applicant',
      riskLevel: 'medium',
      charlieTrust: 15,
      rehabProgress: 10,
      contracts: [],
      notes: 'Initially an antagonist deploying clockwork warmachines. Possesses technical expertise. Confirmed to transition status under Season 1 progress.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E02',
      spoilerLevel: 'season_1',
      description: 'A Victorian-era inventor and sinner who transitions from a low-level threat to a committed hotel resident seeking redemption.'
    },
    {
      id: 'lucifer',
      name: 'Lucifer Morningstar',
      alias: 'King of Hell',
      type: 'fallen_angel',
      role: 'external',
      status: 'external',
      riskLevel: 'catastrophic',
      charlieTrust: 90,
      rehabProgress: 100,
      contracts: [],
      notes: 'Charlie\'s father. Suffering from long-term clinical isolation and political apathy. Holds ultimate authority in the realm. Potential major ally.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E05',
      spoilerLevel: 'season_1',
      description: 'The ruler of Hell and Charlie\'s father, whose political influence and celestial status offer significant protection to the hotel.'
    },
    {
      id: 'cherribomb',
      name: 'Cherri Bomb',
      alias: 'Bomb Queen',
      type: 'sinner',
      role: 'ally',
      status: 'external',
      riskLevel: 'high',
      charlieTrust: 50,
      rehabProgress: 15,
      contracts: [],
      notes: 'Close associate of Angel Dust. Highly destructive combat preferences. Responds poorly to structure, but defends residents in crises.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: 'A chaotic sinner specialized in explosives and turf wars, acting as an external defender of the hotel\'s residents.'
    },
    {
      id: 'vox',
      name: 'Vox',
      alias: 'The TV Demon',
      type: 'overlord',
      role: 'antagonist',
      status: 'banned',
      riskLevel: 'catastrophic',
      charlieTrust: 0,
      rehabProgress: 0,
      contracts: [],
      notes: 'Leader of the Vees. Employs electronic surveillance and propaganda. Actively seeks to discredit the hotel to maintain sinner control.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E02',
      spoilerLevel: 'none',
      description: 'A media and technology Overlord who coordinates digital broadcasts and hostile public relations campaigns against the hotel.'
    },
    {
      id: 'valentino',
      name: 'Valentino',
      alias: 'Val',
      type: 'overlord',
      role: 'antagonist',
      status: 'banned',
      riskLevel: 'catastrophic',
      charlieTrust: 0,
      rehabProgress: 0,
      contracts: ['Holds contract on Angel Dust\'s external labor'],
      notes: 'Controls adult entertainment studio. Highly abusive and volatile. Poses severe threat to Angel Dust\'s mental stability.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E02',
      spoilerLevel: 'none',
      description: 'A powerful and volatile Overlord controlling entertainment contracts, acting as a major antagonist to resident rehabilitation.'
    },
    {
      id: 'velvette',
      name: 'Velvette',
      alias: 'Fashion Vee',
      type: 'overlord',
      role: 'antagonist',
      status: 'banned',
      riskLevel: 'high',
      charlieTrust: 10,
      rehabProgress: 0,
      contracts: [],
      notes: 'Designs fashion trends. Handles public relations and social media campaigns for the Vees. Vocal opponent of the hotel\'s ideals.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E02',
      spoilerLevel: 'none',
      description: 'An Overlord managing social media trends and fashion, utilizing influencer status to coordinate marketing against the hotel.'
    },
    {
      id: 'adam',
      name: 'Adam',
      alias: 'The First Man',
      type: 'angel',
      role: 'antagonist',
      status: 'banned',
      riskLevel: 'catastrophic',
      charlieTrust: 0,
      rehabProgress: 0,
      contracts: [],
      notes: 'Commander of the Exorcist army. Conducts annual purge of sinners. Aggressive, highly hostile to the concept of sinner redemption.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'season_1',
      description: 'The leader of the heavenly military forces responsible for conducting annual population control campaigns in Hell.'
    },
    {
      id: 'emily',
      name: 'Emily',
      alias: 'Seraphim Emily',
      type: 'angel',
      role: 'ally',
      status: 'external',
      riskLevel: 'medium',
      charlieTrust: 85,
      rehabProgress: 100,
      contracts: [],
      notes: 'Younger Seraph of Heaven. Open-minded. Genuinely interested in checking if redemption is possible. Resists standard extermination policy.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E06',
      spoilerLevel: 'season_1',
      description: 'A high-ranking celestial Seraph who supports administrative transparency and the investigation of soul redemption.'
    },
    {
      id: 'sera',
      name: 'Sera',
      alias: 'High Seraphim',
      type: 'angel',
      role: 'external',
      status: 'external',
      riskLevel: 'high',
      charlieTrust: 40,
      rehabProgress: 100,
      contracts: [],
      notes: 'High Seraph of Heaven. Authorized the Exorcist purges to prevent potential uprising. Fears chaotic expansion of Hellbound populations.',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E06',
      spoilerLevel: 'season_1',
      description: 'The senior Seraph of Heaven responsible for defensive policies and authorization of military operations in Hell.'
    }
  ];

  const rooms: Room[] = [
    {
      number: '101',
      floor: 1,
      type: 'standard',
      occupantId: 'angeldust',
      capacity: 1,
      status: 'messy',
      dangerLevel: 'high',
      restrictions: ['no_substances', 'curfew_10pm'],
      maintenanceNotes: 'Requires regular cleanup. Traces of pink web patterns found on fixtures.',
      repairCost: 0,
      lastInspectionDate: '2026-06-25',
      lastInspectedBy: 'niffty'
    },
    {
      number: '102',
      floor: 1,
      type: 'standard',
      occupantId: null,
      capacity: 2,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: [],
      maintenanceNotes: 'Freshly swept. Standard utilities functional.',
      repairCost: 0,
      lastInspectionDate: '2026-06-28',
      lastInspectedBy: 'niffty'
    },
    {
      number: '201',
      floor: 2,
      type: 'suite',
      occupantId: 'vaggie', // Charlie lives here too but we track primary occupant
      capacity: 2,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: ['staff_only'],
      maintenanceNotes: 'Maintained by Vaggie. Clean and structurally secure.',
      repairCost: 0,
      lastInspectionDate: '2026-06-28',
      lastInspectedBy: 'vaggie'
    },
    {
      number: '202',
      floor: 2,
      type: 'secured_room',
      occupantId: 'alastor',
      capacity: 1,
      status: 'cursed',
      dangerLevel: 'catastrophic',
      restrictions: ['restricted_access', 'magical_interference_warning'],
      maintenanceNotes: 'Shadows seem to shift independently. Distant radio static emitted from shadows.',
      repairCost: 0,
      lastInspectionDate: '2026-06-20',
      lastInspectedBy: 'niffty'
    },
    {
      number: '301',
      floor: 3,
      type: 'staff_room',
      occupantId: 'charlie',
      capacity: 1,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: ['staff_only'],
      maintenanceNotes: 'Administrative charts and colorful posters cover the walls.',
      repairCost: 0,
      lastInspectionDate: '2026-06-29',
      lastInspectedBy: 'charlie'
    },
    {
      number: '001',
      floor: 0,
      type: 'standard',
      occupantId: 'husk',
      capacity: 1,
      status: 'messy',
      dangerLevel: 'medium',
      restrictions: ['no_cheating_cards'],
      maintenanceNotes: 'Smells of cheap alcohol and tobacco. Playing cards scattered on desk.',
      repairCost: 0,
      lastInspectionDate: '2026-06-26',
      lastInspectedBy: 'niffty'
    },
    {
      number: '002',
      floor: 0,
      type: 'staff_room',
      occupantId: 'niffty',
      capacity: 1,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: [],
      maintenanceNotes: 'Extremely clean. Under-bed storage full of taxidermy bugs.',
      repairCost: 0,
      lastInspectionDate: '2026-06-29',
      lastInspectedBy: 'niffty'
    },
    {
      number: '404',
      floor: 4,
      type: 'damaged_room',
      occupantId: null,
      capacity: 1,
      status: 'damaged',
      dangerLevel: 'high',
      restrictions: ['no_entry'],
      maintenanceNotes: 'Wall breached by local turf war artillery. Structural integrity compromised.',
      repairCost: 850,
      lastInspectionDate: '2026-06-24',
      lastInspectedBy: 'vaggie'
    }
  ];

  const factions: Faction[] = [
    { id: 'hotel', name: 'Hazbin Hotel', description: 'The rehabilitation initiative led by Charlie Morningstar.', influence: 15 },
    { id: 'heaven', name: 'Heavenly Seraphim', description: 'The ruling celestial administration of Heaven.', influence: 90 },
    { id: 'exorcists', name: 'Exorcist Army', description: 'The military division tasked with yearly population audits.', influence: 80 },
    { id: 'vees', name: 'The Vees', description: 'Overlord media/tech cartel consisting of Vox, Valentino, and Velvette.', influence: 75 },
    { id: 'overlords', name: 'Independent Overlords', description: 'Feudal soul merchants ruling territory in the Pentagram.', influence: 65 },
    { id: 'morningstar', name: 'Morningstar Royalty', description: 'The ruling sovereign household of Hell.', influence: 95 }
  ];

  const relationships: Relationship[] = [
    { id: 'r1', charAId: 'charlie', charBId: 'vaggie', type: 'romantic', notes: 'Committed partners. Vaggie acts as protector; Charlie provides the vision.' },
    { id: 'r2', charAId: 'charlie', charBId: 'lucifer', type: 'family', notes: 'Father and daughter. Deep care but long emotional distance.' },
    { id: 'r3', charAId: 'angeldust', charBId: 'valentino', type: 'contract_bound', notes: 'Abusive soul contract binding Angel Dust to Valentino\'s studio work.' },
    { id: 'r4', charAId: 'husk', charBId: 'alastor', type: 'contract_bound', notes: 'Husk\'s soul is owned by Alastor, forcing his service at the bar.' },
    { id: 'r5', charAId: 'niffty', charBId: 'alastor', type: 'contract_bound', notes: 'Summoned and bound by Alastor to perform housekeeping.' },
    { id: 'r6', charAId: 'angeldust', charBId: 'husk', type: 'ally', notes: 'Growing mutual trust. Husk understands the burden of binding contracts.' },
    { id: 'r7', charAId: 'angeldust', charBId: 'cherribomb', type: 'ally', notes: 'Close personal friends. Frequently engage in chaotic recreational activities.' },
    { id: 'r8', charAId: 'vox', charBId: 'alastor', type: 'enemy', notes: 'Rivalry between traditional broadcasting and modern network media.' },
    { id: 'r9', charAId: 'vox', charBId: 'valentino', type: 'romantic', notes: 'Allies within the Vees cartel with volatile personal dynamics.' },
    { id: 'r10', charAId: 'velvette', charBId: 'vox', type: 'ally', notes: 'Coordinated members of the Vees media empire.' }
  ];

  const rehabilitationPlans: RehabilitationPlan[] = [
    {
      id: 'plan_angeldust',
      characterId: 'angeldust',
      goals: ['De-escalate defense mechanisms', 'Establish boundary setting at work', 'Reduce consumption of chaotic substances'],
      obstacles: ['Coercive studio owner', 'Fear of vulnerability', 'Peer pressure from street turf wars'],
      triggers: ['Contact with Valentino', 'Feelings of isolation', 'Public media criticism'],
      empathyScore: 40,
      accountabilityScore: 30,
      impulseControlScore: 25,
      cooperationScore: 60,
      charlieNotes: 'He wants to improve, but his external environment keeps dragging him down. Empathy workshops are showing minor progress.',
      vaggieNotes: 'High liability but he respects the house rules when sober. Security must remain alert when he leaves for work.',
      staffPrivateNotes: 'Contracts with Valentino severely restrict his schedule, inducing heavy stress that triggers relapse.',
      isRedeemedConfirmed: false
    },
    {
      id: 'plan_sirpentious',
      characterId: 'sirpentious',
      goals: ['Cease aggressive territory invasions', 'Develop collaborative engineering skills', 'Acknowledge mistakes to fellow residents'],
      obstacles: ['Overwhelming need to fit in with Overlords', 'Paranoia regarding double-agents'],
      triggers: ['Criticism of his machinery', 'Insecurity about his social standing'],
      empathyScore: 35,
      accountabilityScore: 40,
      impulseControlScore: 45,
      cooperationScore: 50,
      charlieNotes: 'He is eager to please! His dramatic villain persona is just cover for loneliness.',
      vaggieNotes: 'Keep his weapons workshop under surveillance. Let Husk keep an eye on him in the game room.',
      staffPrivateNotes: 'Prone to spying for the Vees out of intimidation, but exhibits genuine remorse.',
      isRedeemedConfirmed: false
    }
  ];

  const rehabilitationSessions: RehabilitationSession[] = [
    {
      id: 's1',
      planId: 'plan_angeldust',
      date: '2026-06-27',
      type: 'empathy_workshop',
      summary: 'Participated in non-violent communication session. Exhibited dry humor but protected a newer sinner during roleplay.',
      empathyDelta: 5,
      accountabilityDelta: 2,
      impulseControlDelta: 0,
      cooperationDelta: 4,
      conductedBy: 'charlie'
    },
    {
      id: 's2',
      planId: 'plan_angeldust',
      date: '2026-06-28',
      type: 'therapy_like_checkin',
      summary: 'Post-shift check-in at the bar. Discussed work fatigue with Husk. Expressed safety concerns but declined deep sharing.',
      empathyDelta: 0,
      accountabilityDelta: 3,
      impulseControlDelta: 2,
      cooperationDelta: 5,
      conductedBy: 'husk'
    }
  ];

  const incidents: Incident[] = [
    {
      id: 'inc1',
      date: '2026-06-23',
      location: 'Lobby Entrance',
      residentsInvolved: ['sirpentious', 'cherribomb'],
      type: 'property_damage',
      severity: 'medium',
      summary: 'Sir Pentious attempted an assault using a steam-powered drilling tank. Cherri Bomb countered with explosive munitions.',
      consequences: 'Severe damage to the front wall, debris littered across the lobby, broken glass.',
      repairCost: 350,
      reputationImpact: -5,
      trustImpact: -10,
      actionTaken: 'Attack repelled by Vaggie and Cherri Bomb. Sir Pentious retreated. Reconstruction scheduled.',
      status: 'resolved',
      loreLink: 'lore_turf_war',
      tags: ['turf_war', 'property_damage']
    },
    {
      id: 'inc2',
      date: '2026-06-27',
      location: 'Studio District (External)',
      residentsInvolved: ['angeldust', 'valentino'],
      type: 'relapse',
      severity: 'high',
      summary: 'Angel Dust experienced a high-stress workplace conflict resulting in chemical relapse post-shift.',
      consequences: 'Absent from scheduled morning rehabilitation workshop. Heavy exhaustion.',
      repairCost: 0,
      reputationImpact: -2,
      trustImpact: -5,
      actionTaken: 'Brought back to hotel by Husk. Placed under 24h rest schedule. Empathy check-in scheduled.',
      status: 'contained',
      loreLink: 'lore_val_contract',
      tags: ['relapse', 'workplace_stress']
    }
  ];

  const staffTasks: StaffTask[] = [
    {
      id: 't1',
      date: '2026-06-29',
      title: 'Inspect First Floor Rooms',
      type: 'room_inspection',
      assignedTo: 'niffty',
      mentalWorkload: 2,
      status: 'pending',
      notes: 'Inspect for dust mites and minor structural cracks. Ensure standard safety locks are intact.'
    },
    {
      id: 't2',
      date: '2026-06-29',
      title: 'Review Security Perimeter',
      type: 'heaven_watch',
      assignedTo: 'vaggie',
      mentalWorkload: 5,
      status: 'in_progress',
      notes: 'Evaluate weapon stocks and structural integrity of the main gates before the next Purge countdown.'
    },
    {
      id: 't3',
      date: '2026-06-29',
      title: 'Resident Intake Interview',
      type: 'new_sinner_intake',
      assignedTo: 'charlie',
      mentalWorkload: 4,
      status: 'pending',
      notes: 'Prepare orientation packages and check trust metrics for incoming applicants.'
    }
  ];

  const reputation: ReputationState = {
    sinnerReputation: 15,
    redemptionCredibility: 5,
    internalTrust: 60,
    heavenAttention: 35,
    overlordHostility: 25,
    veesInfluence: 70,
    mediaChaos: 40
  };

  const timeline: TimelineState = {
    current: 'season_1_start',
    hideSpoilers: true,
    spoilerLevel: 'season_1',
    hotelState: 'original'
  };

  const loreCodex: LoreEntry[] = [
    {
      id: 'lore_hotel',
      title: 'Hazbin Hotel Initiative',
      entityName: 'Hazbin Hotel',
      category: 'location',
      description: 'A grand estate established in the Pride Ring of Hell to provide sanctuary and rehabilitation programs for sinners wishing to ascend to Heaven.',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      timelineScope: 'season_1_start',
      isLocked: true
    },
    {
      id: 'lore_turf_war',
      title: 'Urban Turf Wars',
      entityName: 'Pride Ring Territory',
      category: 'event',
      description: 'Frequent battles fought between sinners and Overlords to claim districts and resource networks. Sir Pentious and Cherri Bomb are regular combatants.',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      timelineScope: 'pilot_legacy',
      isLocked: true
    },
    {
      id: 'lore_val_contract',
      title: 'Valentino\'s Entertainment Contracts',
      entityName: 'Valentino',
      category: 'contract',
      description: 'Binding agreements that lease a sinner\'s soul and labor to Valentino\'s studios. Angel Dust is bound under a contract governing studio shifts.',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S1E04',
      spoilerLevel: 'season_1',
      timelineScope: 'season_1_start',
      isLocked: true
    },
    {
      id: 'lore_purges',
      title: 'Annual Purge Protocol',
      entityName: 'Heaven Exorcists',
      category: 'world_rule',
      description: 'A yearly military operation where exorcists descend to prune the population of Hell. Authorized under agreements between Lucifer and Sera.',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S1E01',
      spoilerLevel: 'season_1',
      timelineScope: 'season_1_start',
      isLocked: true
    }
  ];

  const resourceLedger: ResourceLedger[] = [
    { id: 'res1', date: '2026-06-01', type: 'income', category: 'donation', amount: 5000, description: 'Royal stipend allocation from the Morningstar Household.' },
    { id: 'res2', date: '2026-06-24', type: 'expense', category: 'repair', amount: 350, description: 'Purchased bricks and mortar for repairing lobby wall damages from incident #inc1.' },
    { id: 'res3', date: '2026-06-25', type: 'expense', category: 'bar_stock', amount: 200, description: 'Restocked whiskey and generic card decks for Husk\'s bar area.' },
    { id: 'res4', date: '2026-06-28', type: 'expense', category: 'cleaning_supplies', amount: 80, description: 'Detergents, industrial disinfectants, and replacement brooms for Niffty.' }
  ];

  const auditLogs: AuditLog[] = [
    { id: 'log1', timestamp: '2026-06-29T00:00:00Z', action: 'DATABASE_INITIALIZATION', details: 'Seed database loaded successfully with baseline Hazbin lore and characters.' }
  ];

  const settings: AppSettings = {
    appName: 'Hellbound Hotel Manager',
    randomEventsEnabled: true,
    theme: 'default-artdeco'
  };

  return {
    characters,
    rooms,
    rehabilitationPlans,
    rehabilitationSessions,
    incidents,
    staffTasks,
    reputation,
    timeline,
    loreCodex,
    factions,
    relationships,
    resourceLedger,
    auditLogs,
    settings
  };
}
