import type { SpoilerLevel } from '../types';

export type HazbinCanonStatus = 'canon' | 'semi_canon' | 'pilot_legacy' | 'simulation_au';

export type HazbinDirectoryCategory =
  | 'hotel'
  | 'hell'
  | 'heaven'
  | 'overlord'
  | 'family'
  | 'legacy'
  | 'human'
  | 'simulation_au';

export type HazbinRosterTier = 'primary' | 'supporting' | 'secondary';

export type HazbinTimelineLabel =
  | 'pilot_legacy'
  | 'season_1'
  | 'season_2'
  | 'future'
  | 'simulation_au';

export const HAZBIN_EXPANSION_ASSET_STATUS: 'ready' | 'planned' = 'ready';

export interface HazbinDirectoryProfile {
  id: string;
  name: string;
  alias: string;
  category: HazbinDirectoryCategory;
  role: string;
  bio: string;
  canonStatus: HazbinCanonStatus;
  timeline: HazbinTimelineLabel;
  spoilerLevel: SpoilerLevel;
  sourceLabel: string;
  rosterTier: HazbinRosterTier;
  fighterEligible: boolean;
  existingOperationalProfile: boolean;
  referenceUnavailable?: boolean;
  sharedHelluvaProfileId?: string;
  portrait: string;
  spriteSheetId: string;
  sheetPath: string;
  sheetRow: 0 | 1 | 2 | 3;
  assetStatus: 'ready' | 'planned' | 'reference_unavailable';
}

export interface HazbinSpriteSheet {
  id: string;
  title: string;
  path: string;
  characters: readonly string[];
  continuity: string;
  spoilerLevel: SpoilerLevel;
  assetStatus: 'ready' | 'planned';
}

type HazbinProfileSeed = Omit<
  HazbinDirectoryProfile,
  'portrait' | 'sheetPath' | 'spoilerLevel' | 'assetStatus'
>;

const SPOILER_RANK: Record<SpoilerLevel, number> = {
  none: 0,
  season_1: 1,
  season_2: 2,
  future: 3,
};

const timelineSpoilerLevel = (timeline: HazbinTimelineLabel): SpoilerLevel => {
  if (timeline === 'season_2') return 'season_2';
  if (timeline === 'future') return 'future';
  if (timeline === 'season_1') return 'season_1';
  return 'none';
};

const profile = (seed: HazbinProfileSeed): HazbinDirectoryProfile => {
  const assetStatus = seed.referenceUnavailable
    ? 'reference_unavailable'
    : seed.existingOperationalProfile
      ? 'ready'
      : HAZBIN_EXPANSION_ASSET_STATUS;
  const portrait = seed.referenceUnavailable
    ? ''
    : seed.existingOperationalProfile
    ? `/assets/sprites/portraits/${seed.id}.png`
    : `/assets/sprites/hazbin/portraits/${seed.id}.png`;
  const sheetPath = seed.referenceUnavailable
    ? ''
    : seed.existingOperationalProfile
    ? `/assets/sprites/sheets/${seed.spriteSheetId}.png`
    : `/assets/sprites/hazbin/sheets/hazbin-${seed.spriteSheetId}.png`;

  return {
    ...seed,
    spoilerLevel: timelineSpoilerLevel(seed.timeline),
    portrait,
    sheetPath,
    assetStatus,
  };
};

export function isHazbinSpoilerVisible(
  hideSpoilers: boolean,
  selectedLevel: SpoilerLevel,
  contentLevel: SpoilerLevel,
): boolean {
  return !hideSpoilers || SPOILER_RANK[contentLevel] <= SPOILER_RANK[selectedLevel];
}

/**
 * Read-only reference directory. These profiles are deliberately not inserted
 * into the hotel save seed: only the first 24 mirror existing operational
 * records, while the remaining entries form a separate lore/reference index.
 */
export const HAZBIN_DIRECTORY_PROFILES: readonly HazbinDirectoryProfile[] = [
  profile({ id: 'charlie', name: 'Charlie Morningstar', alias: 'Princess of Hell', category: 'hotel', role: 'Hotel founder', bio: 'The princess of Hell leads the hotel and argues that sinners can change.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-a', sheetRow: 0 }),
  profile({ id: 'vaggie', name: 'Vaggie', alias: 'Hotel manager', category: 'hotel', role: 'Manager and protector', bio: 'Charlie\'s partner manages hotel operations and defends its residents.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E01 and S1E06', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-a', sheetRow: 1 }),
  profile({ id: 'angeldust', name: 'Angel Dust', alias: 'Angel', category: 'hotel', role: 'Resident', bio: 'The hotel\'s first public resident balances survival, performance work and recovery.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-a', sheetRow: 2 }),
  profile({ id: 'alastor', name: 'Alastor', alias: 'The Radio Demon', category: 'hotel', role: 'Overlord patron', bio: 'A powerful radio-themed Overlord supports the hotel for motives of his own.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-a', sheetRow: 3 }),
  profile({ id: 'husk', name: 'Husk', alias: 'Husker', category: 'hotel', role: 'Bartender', bio: 'A cynical former Overlord tends bar and offers blunt, perceptive advice.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E04', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-b', sheetRow: 0 }),
  profile({ id: 'niffty', name: 'Niffty', alias: 'Hotel housekeeper', category: 'hotel', role: 'Housekeeper', bio: 'The hotel\'s energetic housekeeper tackles messes with alarming enthusiasm.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-b', sheetRow: 1 }),
  profile({ id: 'sirpentious', name: 'Sir Pentious', alias: 'Inventor', category: 'hotel', role: 'Resident and inventor', bio: 'A theatrical inventor joins the hotel and becomes central to its proof of redemption.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E02 and S1E08', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-b', sheetRow: 2 }),
  profile({ id: 'lucifer', name: 'Lucifer Morningstar', alias: 'King of Hell', category: 'family', role: 'Royal ally', bio: 'Charlie\'s father rules Hell and reluctantly reconnects with her project.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E05 and S1E08', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'core-b', sheetRow: 3 }),
  profile({ id: 'cherribomb', name: 'Cherri Bomb', alias: 'Explosives specialist', category: 'hell', role: 'External ally', bio: 'Angel Dust\'s close friend brings explosive skill and fierce loyalty to a fight.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'hell-antagonists', sheetRow: 0 }),
  profile({ id: 'vox', name: 'Vox', alias: 'The TV Demon', category: 'overlord', role: 'Vees leader', bio: 'A technology and broadcast Overlord weaponizes media influence against his rivals.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E02', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'hell-antagonists', sheetRow: 1 }),
  profile({ id: 'valentino', name: 'Valentino', alias: 'Studio Overlord', category: 'overlord', role: 'Antagonist', bio: 'An abusive entertainment Overlord controls Angel Dust through a binding contract.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E04', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'hell-antagonists', sheetRow: 2 }),
  profile({ id: 'velvette', name: 'Velvette', alias: 'Fashion Vee', category: 'overlord', role: 'Vees strategist', bio: 'The social-media and fashion member of the Vees shapes trends and public pressure.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'hell-antagonists', sheetRow: 3 }),
  profile({ id: 'adam', name: 'Adam', alias: 'First Man', category: 'heaven', role: 'Exorcist commander', bio: 'The Season 1 commander of Heaven\'s extermination force rejects Charlie\'s proposal.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'primary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'heaven', sheetRow: 0 }),
  profile({ id: 'emily', name: 'Emily', alias: 'Seraphim', category: 'heaven', role: 'Celestial ally', bio: 'A compassionate Seraph supports an honest examination of sinner redemption.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E06', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'heaven', sheetRow: 1 }),
  profile({ id: 'sera', name: 'Sera', alias: 'High Seraphim', category: 'heaven', role: 'Celestial authority', bio: 'Heaven\'s senior Seraph carries responsibility for its defensive policy toward Hell.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E06', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'heaven', sheetRow: 2 }),
  profile({ id: 'lute', name: 'Lute', alias: 'Exorcist lieutenant', category: 'heaven', role: 'Exorcist officer', bio: 'A disciplined and hostile exorcist officer serves beside Adam in Season 1.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'heaven', sheetRow: 3 }),
  profile({ id: 'carmilla', name: 'Carmilla Carmine', alias: 'Arms dealer', category: 'overlord', role: 'Overlord and mother', bio: 'An Overlord weapons dealer protects her daughters and understands angelic steel.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03 and S1E07', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'overlords', sheetRow: 0 }),
  profile({ id: 'rosie', name: 'Rosie', alias: 'Cannibal Town Overlord', category: 'overlord', role: 'Overlord ally', bio: 'Cannibal Town\'s poised Overlord helps Charlie rally support for the hotel.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E07', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'overlords', sheetRow: 1 }),
  profile({ id: 'zestial', name: 'Zestial', alias: 'Ancient Overlord', category: 'overlord', role: 'Senior Overlord', bio: 'A feared elder Overlord attends Carmilla\'s council and commands wide respect.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'overlords', sheetRow: 2 }),
  profile({ id: 'zeezi', name: 'Zeezi', alias: 'Overlord Zeezi', category: 'overlord', role: 'Overlord', bio: 'A distinctive Overlord appears among Hell\'s assembled power holders.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'overlords', sheetRow: 3 }),
  profile({ id: 'baxter', name: 'Baxter', alias: 'Inventor', category: 'hotel', role: 'Season 2 resident', bio: 'A technically minded sinner joins the hotel\'s expanding Season 2 intake.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'season2-au', sheetRow: 0 }),
  profile({ id: 'abel', name: 'Abel', alias: 'Exorcist commander', category: 'heaven', role: 'Season 2 exorcist commander', bio: 'Adam\'s son assumes command responsibilities within Heaven\'s exorcist forces during Season 2.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'season2-au', sheetRow: 1 }),
  profile({ id: 'sim_applicant_marlow', name: 'Marlow Glass', alias: 'Guarded applicant', category: 'simulation_au', role: 'Gameplay applicant', bio: 'A non-canon applicant used to test consent-led intake and trust-building systems.', canonStatus: 'simulation_au', timeline: 'simulation_au', sourceLabel: 'Hellbound Hotel Manager Simulation AU', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'season2-au', sheetRow: 2 }),
  profile({ id: 'sim_applicant_ember', name: 'Ember Vale', alias: 'Restless applicant', category: 'simulation_au', role: 'Gameplay applicant', bio: 'A non-canon applicant used to test coping and restorative gameplay systems.', canonStatus: 'simulation_au', timeline: 'simulation_au', sourceLabel: 'Hellbound Hotel Manager Simulation AU', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: true, spriteSheetId: 'season2-au', sheetRow: 3 }),

  profile({ id: 'hz_lilith', name: 'Lilith Morningstar', alias: 'Queen of Hell', category: 'family', role: 'Morningstar royal', bio: 'Charlie\'s absent mother remains a major political and family presence.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S1E08 and Season 2', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'family-media', sheetRow: 0 }),
  profile({ id: 'hz_mimzy', name: 'Mimzy', alias: 'Alastor\'s old acquaintance', category: 'hell', role: 'Visitor and performer', bio: 'A lively acquaintance from Alastor\'s past brings danger to the hotel.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E05', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'family-media', sheetRow: 1 }),
  profile({ id: 'hz_katie_killjoy', name: 'Katie Killjoy', alias: 'News anchor', category: 'hell', role: 'Hell media personality', bio: 'A hostile television anchor frames Charlie\'s project for Hell\'s news audience.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E01', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'family-media', sheetRow: 2 }),
  profile({ id: 'hz_tom_trench', name: 'Tom Trench', alias: 'News co-anchor', category: 'hell', role: '666 News co-anchor', bio: 'A gas-mask-wearing sinner demon co-anchors 666 News with Katie Killjoy and remains visible in the main series.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel pilot, Season 1 and Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'family-media', sheetRow: 3 }),

  profile({ id: 'hz_frank_egg_boi', name: 'Frank', alias: 'Egg Boi', category: 'hell', role: 'Sir Pentious companion', bio: 'A named Egg Boi follows Sir Pentious through his schemes and alliances.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'companions', sheetRow: 0 }),
  profile({ id: 'hz_razzle', name: 'Razzle', alias: 'Royal companion', category: 'family', role: 'Morningstar guardian', bio: 'One of Charlie\'s small royal companions can assume a larger battle form.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'companions', sheetRow: 1 }),
  profile({ id: 'hz_dazzle', name: 'Dazzle', alias: 'Royal companion', category: 'family', role: 'Morningstar guardian', bio: 'Charlie\'s second royal companion dies while defending the hotel during the Season 1 finale.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E08', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'companions', sheetRow: 2 }),
  profile({ id: 'hz_keekee', name: 'KeeKee', alias: 'Hotel key', category: 'hotel', role: 'Magical hotel companion', bio: 'The living key-shaped cat is closely tied to Charlie and the hotel itself.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'companions', sheetRow: 3 }),

  profile({ id: 'hz_la_catrina_sinner', name: 'La Catrina sinner', alias: 'Recurring hotel patron', category: 'hotel', role: 'Season 2 hotel patron', bio: 'A skeletal La Catrina-styled sinner stays at the rebuilt hotel in New Pentious and Behind Closed Doors, leaves during Silenced, and returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E03 Behind Closed Doors, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'hotel-patrons', sheetRow: 0 }),
  profile({ id: 'hz_eel_sinner', name: 'Eel sinner', alias: 'Recurring hotel patron', category: 'hotel', role: 'Season 2 hotel patron', bio: 'A sea-creature-like sinner stays at the rebuilt hotel in New Pentious and Behind Closed Doors, then consults a hallway map before leaving in Silenced.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E03 Behind Closed Doors and S2E05 Silenced', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'hotel-patrons', sheetRow: 1 }),
  profile({ id: 'hz_egyptian_sinner', name: 'Egyptian sinner', alias: 'Recurring hotel patron', category: 'hotel', role: 'Season 2 hotel patron', bio: 'An Egyptian-styled sinner stays at the rebuilt hotel, appears in Behind Closed Doors and the Silenced therapy session, then returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E03 Behind Closed Doors, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'hotel-patrons', sheetRow: 2 }),
  profile({ id: 'hz_ant_sinner', name: 'Ant sinner', alias: 'Recurring hotel patron', category: 'hotel', role: 'Season 2 hotel patron', bio: 'An ant-like sinner stays at the rebuilt hotel, appears throughout Behind Closed Doors, receives Vaggie\'s help and joins therapy in Silenced, then returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E03 Behind Closed Doors, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'hotel-patrons', sheetRow: 3 }),

  profile({ id: 'hz_kitty', name: 'Kitty', alias: 'Valentino\'s Robo Fizz', category: 'hell', role: 'Vees servant and combat model', bio: 'Valentino\'s custom Robo Fizz serves the Vees and later fights Husk and Cherri Bomb with roller-skating mobility and dagger hands in Curtain Call. This Vees model remains distinct from the Robo Fizz seen in Helluva Boss.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E02 Radio Killed the Video Star, S1E04 Masquerade, S2E01 New Pentious, S2E06 Scream Rain and S2E08 Curtain Call', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'vees-casino', sheetRow: 0 }),
  profile({ id: 'hz_huskette_cat', name: 'Huskette cat-like waitress', alias: 'Casino Huskette', category: 'hell', role: 'Casino waitress and backing vocalist', bio: 'A cat-like Huskette works in Husk\'s casino and joins the backing vocals for Love In A Bottle.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E06 Scream Rain; Love In A Bottle production asset name', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'vees-casino', sheetRow: 1 }),
  profile({ id: 'hz_huskette_spider', name: 'Huskette spider-like waitress', alias: 'Casino Huskette', category: 'hell', role: 'Casino waitress and backing vocalist', bio: 'A spider-like Huskette works in Husk\'s casino and joins the backing vocals for Love In A Bottle.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E06 Scream Rain; Love In A Bottle production asset name', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'vees-casino', sheetRow: 2 }),
  profile({ id: 'hz_huskette_imp', name: 'Huskette imp-like waitress', alias: 'Casino Huskette', category: 'hell', role: 'Casino waitress and backing vocalist', bio: 'An imp-like Huskette works in Husk\'s casino and joins the backing vocals for Love In A Bottle.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E06 Scream Rain; Love In A Bottle production asset name', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'vees-casino', sheetRow: 3 }),

  profile({ id: 'hz_reporter_demon', name: 'Reporter demon', alias: '666 News reporter', category: 'hell', role: 'Hell media reporter', bio: 'A 666 News reporter questions Charlie during New Pentious, repeatedly fixates on killing his wife, and later watches the news in It\'s A Deal. KillWifeGuy is a production nickname rather than a confirmed personal name.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious and S2E04 It\'s A Deal', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'season2-voiced-locals', sheetRow: 0 }),
  profile({ id: 'hz_goldfish_sinner', name: 'Goldfish sinner', alias: 'Valentino\'s doomed date', category: 'hell', role: 'Pentagram City local', bio: 'Valentino courts a goldfish-like sinner during New Pentious, then feeds her to Shok.wav; a later Vox monitor image does not establish that she survived.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious and S2E07 Weapon of Mass Distraction', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'season2-voiced-locals', sheetRow: 1 }),
  profile({ id: 'hz_fangirl_goat', name: 'Goat-like fangirl sinner', alias: 'Niffty fan', category: 'hotel', role: 'Season 2 hotel visitor', bio: 'A goat-like sinner visits the rebuilt hotel as an enthusiastic Niffty fan and returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'season2-voiced-locals', sheetRow: 2 }),
  profile({ id: 'hz_fangirl_apple_tree', name: 'Apple-tree fangirl sinner', alias: 'Niffty fan', category: 'hotel', role: 'Season 2 hotel visitor', bio: 'An apple-tree-like sinner asks Niffty to stab her, leaves the hotel during Silenced, and returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'season2-voiced-locals', sheetRow: 3 }),

  profile({ id: 'hz_conjoined_twins', name: 'Conjoined Twin sinners', alias: 'Recurring hotel patrons', category: 'hotel', role: 'Season 2 hotel patrons', bio: 'The conjoined Twin sinners first appear in the pilot, then stay at the rebuilt hotel in New Pentious and Behind Closed Doors before leaving during Silenced.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel pilot; S2E01 New Pentious, S2E03 Behind Closed Doors and S2E05 Silenced', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'recurring-patrons-ii', sheetRow: 0 }),
  profile({ id: 'hz_western_sinner', name: 'Western sinner', alias: 'Recurring hotel patron', category: 'hotel', role: 'Season 2 hotel patron', bio: 'A Western-styled sinner stays at the rebuilt hotel, visits its bar, leaves during Silenced, and returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E03 Behind Closed Doors, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'recurring-patrons-ii', sheetRow: 1 }),
  profile({ id: 'hz_goth_bird_sinner', name: 'Goth bird-like sinner', alias: 'Recurring hotel goer', category: 'hotel', role: 'Season 2 hotel goer', bio: 'A goth bird-like sinner arrives at the rebuilt hotel, later appears at Vox\'s rally, and returns in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious, S2E05 Silenced and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'recurring-patrons-ii', sheetRow: 2 }),
  profile({ id: 'hz_rose_sinner', name: 'Rose-like sinner', alias: 'Recurring hotel goer', category: 'hotel', role: 'Season 2 hotel goer', bio: 'A rose-like sinner visits the rebuilt hotel in New Pentious and returns among the city ensemble in Curtain Call.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'recurring-patrons-ii', sheetRow: 3 }),

  profile({ id: 'hz_fat_nuggets', name: 'Fat Nuggets', alias: 'Angel\'s pet pig', category: 'hotel', role: 'Resident companion', bio: 'Angel Dust\'s cherished pet provides a rare source of uncomplicated comfort.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'heaven-pets', sheetRow: 0 }),
  profile({ id: 'hz_st_peter', name: 'St. Peter', alias: 'Heaven\'s greeter', category: 'heaven', role: 'Celestial gatekeeper', bio: 'He welcomes arrivals at Heaven\'s gates during Charlie\'s official visit.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E06', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'heaven-pets', sheetRow: 1 }),
  profile({ id: 'hz_speaker_of_god', name: 'Speaker of God', alias: 'Celestial representative', category: 'heaven', role: 'Heaven authority', bio: 'A Season 2 celestial representative speaks with institutional authority.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'heaven-pets', sheetRow: 2 }),
  profile({ id: 'hz_molly', name: 'Molly', alias: 'Angel\'s sister', category: 'heaven', role: 'Heaven resident', bio: 'Angel Dust\'s sister appears among Heaven\'s residents after earlier official family material established her connection to Angel.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E06 and Season 2', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'heaven-pets', sheetRow: 3 }),

  profile({ id: 'hz_clara_carmine', name: 'Clara Carmine', alias: 'Carmine daughter', category: 'family', role: 'Carmilla\'s daughter', bio: 'One of Carmilla Carmine\'s daughters supports the family operation.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'carmine-overlords', sheetRow: 0 }),
  profile({ id: 'hz_odette_carmine', name: 'Odette Carmine', alias: 'Carmine daughter', category: 'family', role: 'Carmilla\'s daughter', bio: 'One of Carmilla Carmine\'s daughters appears within the Overlord\'s close family.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'carmine-overlords', sheetRow: 1 }),
  profile({ id: 'hz_maestro', name: 'Maestro', alias: 'Season 2 figure', category: 'overlord', role: 'Hell power player', bio: 'A named Season 2 figure expands the circle of Hell\'s influential residents.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'carmine-overlords', sheetRow: 2 }),
  profile({ id: 'hz_prick', name: 'Prick', alias: 'Cactus Overlord', category: 'overlord', role: 'Overlord and saloon owner', bio: 'A cactus-like Overlord fights recurring turf wars with Hatchet and appears in the Doomsday District before Season 2 escalates the conflict.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03 and Season 2', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'carmine-overlords', sheetRow: 3 }),

  profile({ id: 'hz_hatchet', name: 'Hatchet', alias: 'Overlord rival', category: 'overlord', role: 'Overlord and Wyvern owner', bio: 'A draconic Overlord enjoys violence and maintains a recurring turf-war rivalry with Prick.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E03 and Season 2', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'overlord-fringe', sheetRow: 0 }),
  profile({ id: 'hz_shok_wav', name: 'Shok.wav', alias: 'Vox\'s demon shark', category: 'hell', role: 'Vox companion and biomechanical pet', bio: 'Vox\'s enormous biomechanical demon shark was created by Baxter and functions as a loyal pet and combat threat.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'overlord-fringe', sheetRow: 1 }),
  profile({ id: 'hz_susan', name: 'Susan', alias: 'Cannibal Town resident', category: 'hell', role: 'Local resident', bio: 'An irritable Cannibal Town resident challenges Charlie\'s attempt to rally the district.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E07', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'overlord-fringe', sheetRow: 2 }),
  profile({ id: 'hz_rooster', name: 'Rooster', alias: 'Named Hell resident', category: 'hell', role: 'Season 2 local', bio: 'A named Season 2 local adds to the expanded population of Pentagram City.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'overlord-fringe', sheetRow: 3 }),

  profile({ id: 'hz_ethan', name: 'Ethan', alias: 'Named city resident', category: 'hell', role: 'Season 2 local', bio: 'A named Season 2 resident appears within the city\'s wider ensemble.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'season2-network', sheetRow: 0 }),
  profile({ id: 'hz_melissa', name: 'Melissa', alias: 'Velvette\'s assistant', category: 'hell', role: 'Vees employee', bio: 'A demon working for Velvette first appears around the Vees\' media operation and returns in later series material.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E02 and Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'season2-network', sheetRow: 1 }),
  profile({ id: 'hz_salina', name: 'Salina', alias: 'Named city resident', category: 'hell', role: 'Season 2 local', bio: 'A named Season 2 resident appears within the city\'s wider ensemble.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'season2-network', sheetRow: 2 }),
  profile({ id: 'hz_zack_rabbit', name: 'Zack Rabbit', alias: 'Named city resident', category: 'hell', role: 'Season 2 local', bio: 'A rabbit-like named resident belongs to Season 2\'s expanded city cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'season2-network', sheetRow: 3 }),

  profile({ id: 'hz_myk_mic_guy', name: 'Myk the Mic Guy', alias: 'Media worker', category: 'hell', role: 'City media local', bio: 'A named media worker forms part of the city\'s broadcast-facing background cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-a', sheetRow: 0 }),
  profile({ id: 'hz_man_meat', name: 'Man Meat', alias: 'Named city resident', category: 'hell', role: 'City local', bio: 'A named background resident helps populate Pentagram City beyond the principal cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-a', sheetRow: 1 }),
  profile({ id: 'hz_buddy_mcsluggy', name: 'Buddy McSluggy', alias: 'Named city resident', category: 'hell', role: 'City local', bio: 'A named background resident helps populate Pentagram City beyond the principal cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-a', sheetRow: 2 }),
  profile({ id: 'hz_bryrin', name: 'Bryrin', alias: 'Named city resident', category: 'hell', role: 'City local', bio: 'A named background resident helps populate Pentagram City beyond the principal cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-a', sheetRow: 3 }),

  profile({ id: 'hz_tiffany_titfucker', name: 'Tiffany Titfucker', alias: 'Mentioned character', category: 'hell', role: 'Unseen performer', bio: 'An unseen performer is mentioned by name, but no canon visual design has been published; the directory deliberately does not invent one.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E04 — mentioned only, never shown', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, referenceUnavailable: true, spriteSheetId: 'lore-only', sheetRow: 0 }),
  profile({ id: 'hz_egg_boiz', name: 'Egg Boiz', alias: 'Sir Pentious crew', category: 'hell', role: 'Companion collective', bio: 'Sir Pentious commands a large collective of loyal egg-shaped minions, with Frank as its best-known named member.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel Season 1', rosterTier: 'supporting', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-b', sheetRow: 0 }),
  profile({ id: 'hz_rocky', name: 'Rocky', alias: 'Named city resident', category: 'hell', role: 'City local', bio: 'A named background resident appears in the expanded city ensemble.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-b', sheetRow: 1 }),
  profile({ id: 'hz_dia', name: 'Dia', alias: 'Named performer', category: 'hell', role: 'City performer', bio: 'A named performer appears within Hell\'s entertainment industry.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-b', sheetRow: 2 }),
  profile({ id: 'hz_summer', name: 'Summer', alias: 'Named performer', category: 'hell', role: 'City performer', bio: 'A named performer appears within Hell\'s entertainment industry.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named background role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'city-names-b', sheetRow: 3 }),

  profile({ id: 'hz_arackniss', name: 'Arackniss', alias: 'Angel\'s brother', category: 'family', role: 'Angel family member', bio: 'Angel Dust\'s brother comes from legacy official character material; his series role remains pending.', canonStatus: 'semi_canon', timeline: 'future', sourceLabel: 'Official legacy character material; series role pending', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'angel-family', sheetRow: 0 }),
  profile({ id: 'hz_angel_father', name: 'Angel Dust’s father', alias: 'Name unconfirmed', category: 'family', role: 'Angel family member', bio: 'Angel Dust’s father is kept unnamed because no canon series name is confirmed.', canonStatus: 'semi_canon', timeline: 'future', sourceLabel: 'Official legacy family material; fandom names excluded', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'angel-family', sheetRow: 1 }),
  profile({ id: 'hz_crymini', name: 'Crymini', alias: 'Pilot-era character', category: 'legacy', role: 'Legacy sinner concept', bio: 'A pilot-era sinner design retained as a legacy reference, not a current hotel resident.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'angel-family', sheetRow: 2 }),
  profile({ id: 'hz_villa', name: 'Villa', alias: 'Legacy character', category: 'legacy', role: 'Legacy character concept', bio: 'A legacy official design whose place in the current series continuity remains unconfirmed.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'angel-family', sheetRow: 3 }),

  profile({ id: 'hz_hellsa_von_eldritch', name: 'Helsa von Eldritch', alias: 'Eldritch daughter', category: 'legacy', role: 'Legacy Hell aristocrat', bio: 'A member of the von Eldritch family preserved from official pilot-era character material.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'eldritch-legacy', sheetRow: 0 }),
  profile({ id: 'hz_seviathan_von_eldritch', name: 'Seviathan von Eldritch', alias: 'Eldritch son', category: 'legacy', role: 'Legacy Hell aristocrat', bio: 'A member of the von Eldritch family preserved from official pilot-era character material.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'eldritch-legacy', sheetRow: 1 }),
  profile({ id: 'hz_frederick_von_eldritch', name: 'Frederick von Eldritch', alias: 'Eldritch patriarch', category: 'legacy', role: 'Legacy Hell aristocrat', bio: 'The von Eldritch patriarch belongs to official legacy family material.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'eldritch-legacy', sheetRow: 2 }),
  profile({ id: 'hz_bethesda_von_eldritch', name: 'Bethesda von Eldritch', alias: 'Eldritch matriarch', category: 'legacy', role: 'Legacy Hell aristocrat', bio: 'The von Eldritch matriarch belongs to official legacy family material.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot-era official material', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'eldritch-legacy', sheetRow: 3 }),

  profile({ id: 'hz_roo', name: 'Roo', alias: 'Future legacy figure', category: 'legacy', role: 'Unresolved future figure', bio: 'A teased official character is kept outside current series canon until an on-screen role is established.', canonStatus: 'semi_canon', timeline: 'future', sourceLabel: 'Official creator-era teaser; series role pending', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'legacy-history', sheetRow: 0 }),
  profile({ id: 'hz_eve', name: 'Eve', alias: 'Biblical figure', category: 'legacy', role: 'Unresolved historical figure', bio: 'A referenced historical figure whose complete role in the series remains unresolved.', canonStatus: 'semi_canon', timeline: 'future', sourceLabel: 'Series and official legacy references; full role pending', rosterTier: 'supporting', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'legacy-history', sheetRow: 1 }),
  profile({ id: 'hz_british_gentleman', name: 'British Gentleman', alias: 'Human-era figure', category: 'human', role: 'Historical background figure', bio: 'An unnamed human-era figure is catalogued descriptively without inventing an identity.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Official legacy human-history material', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'legacy-history', sheetRow: 2 }),
  profile({ id: 'hz_female_victim', name: 'Female Victim', alias: 'Human-era figure', category: 'human', role: 'Historical background figure', bio: 'An unnamed human-era victim is catalogued descriptively without inventing an identity.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Official legacy human-history material', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'legacy-history', sheetRow: 3 }),

  profile({ id: 'hz_the_killer', name: 'The Killer', alias: 'Human-history figure', category: 'human', role: 'Historical antagonist', bio: 'A human-history figure is identified only by the role supplied on screen or in official credits.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 human-history sequence', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'human-history', sheetRow: 0 }),
  profile({ id: 'hz_human_hunter', name: 'Human Hunter', alias: 'Human-history figure', category: 'human', role: 'Historical combatant', bio: 'A human-history figure is identified only by the role supplied on screen or in official credits.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 human-history sequence', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'human-history', sheetRow: 1 }),
  profile({ id: 'hz_harry', name: 'Harry', alias: 'Human-history figure', category: 'human', role: 'Historical figure', bio: 'A named figure appears within Season 2\'s exploration of human history.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 human-history sequence', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'human-history', sheetRow: 2 }),
  profile({ id: 'hz_carrie', name: 'Carrie', alias: 'Human-history figure', category: 'human', role: 'Historical figure', bio: 'A named figure appears within Season 2\'s exploration of human history.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 human-history sequence', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'human-history', sheetRow: 3 }),

  profile({ id: 'hz_larry', name: 'Larry', alias: 'Named crossover figure', category: 'human', role: 'Human-world figure', bio: 'A named human-world figure belongs to the series\' wider crossover-facing cast.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'human-crossovers', sheetRow: 0 }),
  profile({ id: 'hz_robert_bob_sinclaire', name: 'Robert “Bob” Sinclaire', alias: 'Named human figure', category: 'human', role: 'Human-world figure', bio: 'A named human-world figure is indexed separately from Hell\'s operational roster.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 named role', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'human-crossovers', sheetRow: 1 }),
  profile({ id: 'hz_crying_exorcist', name: 'Crying Exorcist', alias: 'Unnamed exorcist', category: 'heaven', role: 'Celestial soldier', bio: 'An unnamed exorcist is catalogued by an on-screen descriptor without inventing a personal name.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel Season 2 background role', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'human-crossovers', sheetRow: 2 }),
  profile({ id: 'hz_travis', name: 'Travis', alias: 'Hell resident', category: 'hell', role: 'Background resident', bio: 'A recurring named background resident connects several corners of the Hellaverse.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel main-series background role; shared identity with the Helluva directory entry', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, sharedHelluvaProfileId: 'hb_travis', spriteSheetId: 'human-crossovers', sheetRow: 3 }),

  profile({ id: 'hz_gator_sinner', name: 'Gator sinner', alias: 'Recurring sinner', category: 'hotel', role: 'Recurring hotel patron', bio: 'A gator-like sinner first appears around VoxTek and is later rescued by Charlie before checking into the hotel.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S1E02 Radio Killed the Video Star and S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-a', sheetRow: 0 }),
  profile({ id: 'hz_velvette_assistant', name: 'Velvette\'s assistant', alias: 'Vees staffer', category: 'hell', role: 'Velvette assistant', bio: 'A wolf-like sinner works for Velvette and remains part of the Vees\' wider staff presence.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S1E02 Radio Killed the Video Star and S2E04 It\'s A Deal', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-a', sheetRow: 1 }),
  profile({ id: 'hz_shark_gang_leader', name: 'Shark Gang Leader', alias: 'Shark gang member', category: 'hell', role: 'Armed gang leader', bio: 'The speaking shark-like gang leader is distinguished from the other gang members by his hat, coat and firearm.', canonStatus: 'canon', timeline: 'season_1', sourceLabel: 'Hazbin Hotel S1E01 Overture and S1E04 Masquerade', rosterTier: 'secondary', fighterEligible: true, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-a', sheetRow: 2 }),
  profile({ id: 'hz_cactus_sinner', name: 'Cactus sinner', alias: 'Entertainment District resident', category: 'hell', role: 'Background sinner', bio: 'A cactus-like sinner appears in the Entertainment District during the conflict surrounding Vox and Alastor.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E04 It\'s A Deal', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-a', sheetRow: 3 }),

  profile({ id: 'hz_jack_in_box_sinner', name: 'Jack-in-the-box sinner', alias: 'Vox party attendee', category: 'hell', role: 'Season 2 party attendee', bio: 'A jack-in-the-box-like sinner attends Vox\'s party and is identified only by a descriptive on-screen label.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E08 Curtain Call', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-b', sheetRow: 0 }),
  profile({ id: 'hz_orphan_imp', name: 'Orphan Imp', alias: 'Young imp', category: 'hell', role: 'Season 2 background imp', bio: 'A young orphan imp appears while Vox publicly stages charitable treatment in Pentagram City.', canonStatus: 'canon', timeline: 'season_2', sourceLabel: 'Hazbin Hotel S2E01 New Pentious', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-b', sheetRow: 1 }),
  profile({ id: 'hz_top_hat_demon', name: 'Top Hat Demon', alias: 'Pilot news-studio heckler', category: 'legacy', role: 'Pilot media bystander', bio: 'A top-hat-like demon heckles Charlie during her pilot-era appearance at the 666 News studio.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot — 666 News studio sequence', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-b', sheetRow: 2 }),
  profile({ id: 'hz_roadkill_sinner', name: 'Roadkill sinner', alias: 'Pilot road casualty', category: 'legacy', role: 'Pilot background sinner', bio: 'A roadkill-like sinner is struck by Travis during the pilot and remains catalogued as pilot legacy rather than current-series canon.', canonStatus: 'pilot_legacy', timeline: 'pilot_legacy', sourceLabel: 'Hazbin Hotel pilot — Pentagram City street sequence', rosterTier: 'secondary', fighterEligible: false, existingOperationalProfile: false, spriteSheetId: 'tertiary-locals-b', sheetRow: 3 }),
] as const;

const READY_SHEETS: readonly Omit<HazbinSpriteSheet, 'spoilerLevel' | 'assetStatus'>[] = [
  { id: 'core-a', title: 'Hotel founders and residents I', path: '/assets/sprites/sheets/core-a.png', characters: ['Charlie Morningstar', 'Vaggie', 'Angel Dust', 'Alastor'], continuity: 'Season 1 reference designs' },
  { id: 'core-b', title: 'Hotel founders and residents II', path: '/assets/sprites/sheets/core-b.png', characters: ['Husk', 'Niffty', 'Sir Pentious', 'Lucifer Morningstar'], continuity: 'Season 1 reference designs' },
  { id: 'hell-antagonists', title: 'Allies and the Vees', path: '/assets/sprites/sheets/hell-antagonists.png', characters: ['Cherri Bomb', 'Vox', 'Valentino', 'Velvette'], continuity: 'Main-series reference designs' },
  { id: 'heaven', title: 'Heaven delegation', path: '/assets/sprites/sheets/heaven.png', characters: ['Adam', 'Emily', 'Sera', 'Lute'], continuity: 'Season 1 continuity' },
  { id: 'overlords', title: 'Overlords and external powers', path: '/assets/sprites/sheets/overlords.png', characters: ['Carmilla Carmine', 'Rosie', 'Zestial', 'Zeezi'], continuity: 'Main-series reference designs' },
  { id: 'season2-au', title: 'Season 2 and Simulation AU', path: '/assets/sprites/sheets/season2-au.png', characters: ['Baxter', 'Abel', 'Marlow Glass', 'Ember Vale'], continuity: 'Canon profiles and clearly separated Simulation AU originals' },
];

const EXPANSION_SHEETS: readonly Omit<HazbinSpriteSheet, 'spoilerLevel' | 'assetStatus'>[] = [
  { id: 'family-media', title: 'Royal family, old friends and media', path: '/assets/sprites/hazbin/sheets/hazbin-family-media.png', characters: ['Lilith Morningstar', 'Mimzy', 'Katie Killjoy', 'Tom Trench'], continuity: 'Canon and pilot-legacy labels remain profile-specific' },
  { id: 'companions', title: 'Hotel companions', path: '/assets/sprites/hazbin/sheets/hazbin-companions.png', characters: ['Frank', 'Razzle', 'Dazzle', 'KeeKee'], continuity: 'Main-series companion references' },
  { id: 'hotel-patrons', title: 'Season 2 hotel patrons', path: '/assets/sprites/hazbin/sheets/hazbin-hotel-patrons.png', characters: ['La Catrina sinner', 'Eel sinner', 'Egyptian sinner', 'Ant sinner'], continuity: 'Recurring Season 2 hotel-patron designs' },
  { id: 'vees-casino', title: 'Vees and casino cast', path: '/assets/sprites/hazbin/sheets/hazbin-vees-casino.png', characters: ['Kitty', 'Huskette cat-like waitress', 'Huskette spider-like waitress', 'Huskette imp-like waitress'], continuity: 'Main-series Kitty and Season 2 casino references' },
  { id: 'season2-voiced-locals', title: 'Season 2 voiced locals', path: '/assets/sprites/hazbin/sheets/hazbin-season2-voiced-locals.png', characters: ['Reporter demon', 'Goldfish sinner', 'Goat-like fangirl sinner', 'Apple-tree fangirl sinner'], continuity: 'Season 2 named-by-description roles; production nicknames are not treated as canon names' },
  { id: 'recurring-patrons-ii', title: 'Recurring hotel patrons II', path: '/assets/sprites/hazbin/sheets/hazbin-recurring-patrons-ii.png', characters: ['Conjoined Twin sinners', 'Western sinner', 'Goth bird-like sinner', 'Rose-like sinner'], continuity: 'Recurring Season 2 hotel-goer designs' },
  { id: 'heaven-pets', title: 'Pets, Heaven and family', path: '/assets/sprites/hazbin/sheets/hazbin-heaven-pets.png', characters: ['Fat Nuggets', 'St. Peter', 'Speaker of God', 'Molly'], continuity: 'Canon and future-reference labels remain profile-specific' },
  { id: 'carmine-overlords', title: 'Carmine family and new powers', path: '/assets/sprites/hazbin/sheets/hazbin-carmine-overlords.png', characters: ['Clara Carmine', 'Odette Carmine', 'Maestro', 'Prick'], continuity: 'Season 1 and Season 2 references' },
  { id: 'overlord-fringe', title: 'Overlord fringe and locals', path: '/assets/sprites/hazbin/sheets/hazbin-overlord-fringe.png', characters: ['Hatchet', 'Shok.wav', 'Susan', 'Rooster'], continuity: 'Main-series references' },
  { id: 'season2-network', title: 'Season 2 network', path: '/assets/sprites/hazbin/sheets/hazbin-season2-network.png', characters: ['Ethan', 'Melissa', 'Salina', 'Zack Rabbit'], continuity: 'Season 2 named roles' },
  { id: 'city-names-a', title: 'Pentagram City names I', path: '/assets/sprites/hazbin/sheets/hazbin-city-names-a.png', characters: ['Myk the Mic Guy', 'Man Meat', 'Buddy McSluggy', 'Bryrin'], continuity: 'Season 2 named background roles' },
  { id: 'city-names-b', title: 'Pentagram City names II', path: '/assets/sprites/hazbin/sheets/hazbin-city-names-b.png', characters: ['Egg Boiz', 'Rocky', 'Dia', 'Summer'], continuity: 'Season 1 companions and Season 2 named background roles' },
  { id: 'angel-family', title: 'Angel family and legacy residents', path: '/assets/sprites/hazbin/sheets/hazbin-angel-family.png', characters: ['Arackniss', 'Angel Dust’s father', 'Crymini', 'Villa'], continuity: 'Semi-canon and pilot-legacy references; no fandom names' },
  { id: 'eldritch-legacy', title: 'Von Eldritch legacy', path: '/assets/sprites/hazbin/sheets/hazbin-eldritch-legacy.png', characters: ['Helsa von Eldritch', 'Seviathan von Eldritch', 'Frederick von Eldritch', 'Bethesda von Eldritch'], continuity: 'Pilot-era official character material' },
  { id: 'legacy-history', title: 'Legacy and unresolved history', path: '/assets/sprites/hazbin/sheets/hazbin-legacy-history.png', characters: ['Roo', 'Eve', 'British Gentleman', 'Female Victim'], continuity: 'Future and pilot-legacy labels remain profile-specific' },
  { id: 'human-history', title: 'Human history', path: '/assets/sprites/hazbin/sheets/hazbin-human-history.png', characters: ['The Killer', 'Human Hunter', 'Harry', 'Carrie'], continuity: 'Season 2 human-history references' },
  { id: 'human-crossovers', title: 'Human and crossover figures', path: '/assets/sprites/hazbin/sheets/hazbin-human-crossovers.png', characters: ['Larry', 'Robert “Bob” Sinclaire', 'Crying Exorcist', 'Travis'], continuity: 'Main-series named and descriptive roles' },
  { id: 'tertiary-locals-a', title: 'Recurring tertiary locals I', path: '/assets/sprites/hazbin/sheets/hazbin-tertiary-locals-a.png', characters: ['Gator sinner', 'Velvette\'s assistant', 'Shark Gang Leader', 'Cactus sinner'], continuity: 'Main-series tertiary designs with descriptive labels' },
  { id: 'tertiary-locals-b', title: 'Recurring tertiary locals II', path: '/assets/sprites/hazbin/sheets/hazbin-tertiary-locals-b.png', characters: ['Jack-in-the-box sinner', 'Orphan Imp', 'Top Hat Demon', 'Roadkill sinner'], continuity: 'Main-series and explicitly labelled pilot-legacy designs' },
];

const getSheetSpoilerLevel = (sheetId: string): SpoilerLevel => HAZBIN_DIRECTORY_PROFILES
  .filter(({ spriteSheetId }) => spriteSheetId === sheetId)
  .reduce<SpoilerLevel>((highest, profileEntry) => (
    SPOILER_RANK[profileEntry.spoilerLevel] > SPOILER_RANK[highest]
      ? profileEntry.spoilerLevel
      : highest
  ), 'none');

export const HAZBIN_SPRITE_SHEETS: readonly HazbinSpriteSheet[] = [
  ...READY_SHEETS.map((sheet) => ({
    ...sheet,
    spoilerLevel: getSheetSpoilerLevel(sheet.id),
    assetStatus: 'ready' as const,
  })),
  ...EXPANSION_SHEETS.map((sheet) => ({
    ...sheet,
    spoilerLevel: getSheetSpoilerLevel(sheet.id),
    assetStatus: HAZBIN_EXPANSION_ASSET_STATUS,
  })),
];

export const HAZBIN_EXISTING_PROFILE_COUNT = HAZBIN_DIRECTORY_PROFILES.filter(
  ({ existingOperationalProfile }) => existingOperationalProfile,
).length;

export const HAZBIN_DIRECTORY_ONLY_PROFILE_COUNT = HAZBIN_DIRECTORY_PROFILES.length
  - HAZBIN_EXISTING_PROFILE_COUNT;

export const HAZBIN_PLANNED_PROFILE_COUNT = HAZBIN_DIRECTORY_PROFILES.filter(
  ({ assetStatus }) => assetStatus === 'planned',
).length;

export const HAZBIN_REFERENCE_UNAVAILABLE_PROFILE_COUNT = HAZBIN_DIRECTORY_PROFILES.filter(
  ({ assetStatus }) => assetStatus === 'reference_unavailable',
).length;
