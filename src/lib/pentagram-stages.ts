export type HotelStageId =
  | 'hotel-lobby'
  | 'hotel-bar'
  | 'hotel-exterior'
  | 'pentagram-rooftops'
  | 'cannibal-town-square'
  | 'carmine-industries'
  | 'heaven-embassy'
  | 'vee-broadcast-studio';

export type PentagramStageId = HotelStageId
  | 'imp-reception'
  | 'ozzies-cabaret'
  | 'wrath-ranch'
  | 'heaven-court'
  | 'pentious-workshop'
  | 'looloo-land'
  | 'stolas-palace'
  | 'bee-party'
  | 'dhorks'
  | 'crimson-mansion'
  | 'mammon-show'
  | 'western-lair'
  | 'goetia-court'
  | 'hh-heaven-gates'
  | 'imp-exterior'
  | 'oops-warehouse'
  | 'sinsmas-balcony'
  | 'spring-broken-beach'
  | 'murder-family-house'
  | 'cash-circus';

export interface PentagramSoundtrackScore {
  id: string;
  title: string;
  bpm: number;
  rootMidi: number;
  swing: number;
  drive: number;
  seed: number;
  chordProgression: readonly (readonly number[])[];
  bassPattern: readonly number[];
  leadPattern: readonly (number | null)[];
}

export interface PentagramStage {
  id: PentagramStageId;
  name: string;
  district: string;
  description: string;
  loreBasis: string;
  imagePath: string;
  thumbnailPath: string;
  scenery?: { middle?: string; near?: string };
  imagePosition: string;
  accent: string;
  shadow: string;
  floor: string;
  soundtrack: PentagramSoundtrackScore;
}

/*
 * Every location is presented by the UI as a gameplay-only Simulation AU
 * reconstruction. Every path points to project-owned artwork, including the
 * OpenAI-created stage set under /assets/stages/hazbin.
 *
 * All score data below is an original, purpose-built collection of short
 * chord/bass/brass motifs. It does not transcribe franchise songs or dialogue.
 */
export const PENTAGRAM_STAGES: readonly PentagramStage[] = [
  {
    id: 'hotel-lobby',
    name: 'Hazbin Hotel Lobby',
    district: 'Hazbin Hotel',
    description: 'A velvet-and-gold exhibition floor framed by the hotel staircase.',
    loreBasis: 'The hotel lobby is the residents’ shared reception and meeting space.',
    imagePath: '/assets/stages/hazbin/hotel-lobby.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/hotel-lobby.webp',
    scenery: {
      middle: '/assets/stages/hazbin/hotel-lobby/luggage-cart.webp',
      near: '/assets/stages/hazbin/hotel-lobby/valance.webp',
    },
    imagePosition: 'center 52%',
    accent: '#f2c94c',
    shadow: '#5b0718',
    floor: '#2a1017',
    soundtrack: {
      id: 'red-velvet-rumble',
      title: 'Red Velvet Rumble',
      bpm: 128,
      rootMidi: 38,
      swing: 0.55,
      drive: 0.76,
      seed: 1717,
      chordProgression: [
        [0, 3, 7, 10],
        [5, 8, 12, 15],
        [8, 11, 15, 18],
        [7, 11, 14, 17],
        [0, 3, 7, 10],
        [3, 7, 10, 14],
        [5, 8, 12, 15],
        [7, 11, 14, 17],
      ],
      bassPattern: [0, 7, 12, 7, 0, 10, 7, 12],
      leadPattern: [12, null, 15, 17, null, 10, 12, null, 19, null, 17, 15, 14, null, 10, null],
    },
  },
  {
    id: 'hotel-bar',
    name: 'Last Call Bar',
    district: 'Hazbin Hotel',
    description: 'A close-quarters cabaret lane built around the hotel’s bar.',
    loreBasis: 'The hotel bar is Husk’s usual post and a recurring resident gathering place.',
    imagePath: '/assets/stages/hazbin/hotel-bar/room.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/hotel-bar.webp',
    scenery: {
      middle: '/assets/stages/hazbin/hotel-bar/stool.webp',
      near: '/assets/stages/hazbin/hotel-bar/lamp.webp',
    },
    imagePosition: 'center 55%',
    accent: '#ffb35c',
    shadow: '#3d0712',
    floor: '#241114',
    soundtrack: {
      id: 'last-call-uppercut',
      title: 'Last Call Uppercut',
      bpm: 116,
      rootMidi: 36,
      swing: 0.68,
      drive: 0.62,
      seed: 1933,
      chordProgression: [
        [0, 3, 7, 10],
        [6, 9, 13, 16],
        [5, 8, 12, 15],
        [7, 10, 14, 17],
        [0, 3, 7, 10],
        [10, 13, 17, 20],
        [5, 9, 12, 15],
        [7, 11, 14, 17],
      ],
      bassPattern: [0, 12, 7, 10, 0, 7, 12, 5],
      leadPattern: [7, null, 10, 12, 15, null, 12, null, 6, 7, null, 10, 3, null, 5, null],
    },
  },
  {
    id: 'hotel-exterior',
    name: 'Hotel Front Steps',
    district: 'Pentagram City',
    description: 'A broad night-time lane beneath the hotel sign and city glow.',
    loreBasis: 'The hotel exterior anchors the project’s central location in Pentagram City.',
    imagePath: '/assets/stages/hazbin/hotel-exterior/room-wave-b.webp',
    thumbnailPath: '/assets/stages/hazbin/hotel-exterior/thumb-wave-b.webp',
    scenery: {
      middle: '/assets/stages/hazbin/hotel-exterior/planter-wave-b.webp',
      near: '/assets/stages/hazbin/hotel-exterior/lantern-wave-b.webp',
    },
    imagePosition: 'center 48%',
    accent: '#ff596f',
    shadow: '#310611',
    floor: '#1c0a10',
    soundtrack: {
      id: 'check-in-after-dark',
      title: 'Check-In After Dark',
      bpm: 136,
      rootMidi: 41,
      swing: 0.42,
      drive: 0.88,
      seed: 2009,
      chordProgression: [
        [0, 3, 7, 10],
        [3, 6, 10, 13],
        [8, 12, 15, 19],
        [7, 10, 14, 17],
        [0, 3, 7, 10],
        [5, 8, 12, 15],
        [3, 7, 10, 14],
        [7, 11, 14, 17],
      ],
      bassPattern: [0, 0, 12, 7, 0, 10, 12, 7],
      leadPattern: [12, 15, null, 19, 17, null, 15, 12, null, 10, 12, 15, 7, null, 10, null],
    },
  },
  {
    id: 'pentagram-rooftops',
    name: 'Pentagram Rooftops',
    district: 'Pentagram City',
    description: 'A neon skyline reconstruction with a long, readable tournament lane.',
    loreBasis: 'Pentagram City is the principal urban setting around the hotel.',
    imagePath: '/assets/stages/hazbin/pentagram-rooftops.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/pentagram-rooftops.webp',
    scenery: {
      middle: '/assets/stages/hazbin/pentagram-rooftops/vent-wave-b.webp',
      near: '/assets/stages/hazbin/pentagram-rooftops/finial-wave-b.webp',
    },
    imagePosition: 'center 44%',
    accent: '#ff4f9a',
    shadow: '#25051f',
    floor: '#180b1d',
    soundtrack: {
      id: 'neon-sinners-swing',
      title: 'Neon Sinners’ Swing',
      bpm: 142,
      rootMidi: 40,
      swing: 0.35,
      drive: 0.96,
      seed: 2024,
      chordProgression: [
        [0, 3, 7, 10],
        [8, 11, 15, 18],
        [5, 8, 12, 15],
        [10, 13, 17, 20],
        [0, 3, 7, 10],
        [3, 6, 10, 13],
        [5, 9, 12, 15],
        [7, 11, 14, 17],
      ],
      bassPattern: [0, 12, 0, 7, 10, 12, 7, 15],
      leadPattern: [19, null, 15, 12, 10, null, 15, 17, 12, null, 19, 22, 17, 15, null, 10],
    },
  },
  {
    id: 'cannibal-town-square',
    name: 'Cannibal Town Square',
    district: 'Cannibal Town',
    description: 'A tidy old-fashioned square rebuilt as a theatrical sparring pavilion.',
    loreBasis: 'Cannibal Town is Rosie’s distinct Pentagram City community.',
    imagePath: '/assets/stages/hazbin/cannibal-town-square.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/cannibal-town-square.webp',
    scenery: {
      middle: '/assets/stages/hazbin/cannibal-town-square/flower-cart-wave-b.webp',
      near: '/assets/stages/hazbin/cannibal-town-square/awning.webp',
    },
    imagePosition: 'center 54%',
    accent: '#f5d58b',
    shadow: '#421019',
    floor: '#321b1b',
    soundtrack: {
      id: 'crimson-promenade',
      title: 'Crimson Promenade',
      bpm: 124,
      rootMidi: 39,
      swing: 0.74,
      drive: 0.7,
      seed: 1919,
      chordProgression: [
        [0, 3, 7, 10],
        [5, 8, 12, 15],
        [2, 5, 9, 12],
        [7, 11, 14, 17],
        [0, 3, 7, 10],
        [8, 11, 15, 18],
        [5, 9, 12, 15],
        [7, 10, 14, 17],
      ],
      bassPattern: [0, 7, 12, 10, 0, 3, 7, 12],
      leadPattern: [12, 15, 17, null, 19, 17, 15, null, 10, 12, null, 15, 8, 10, 12, null],
    },
  },
  {
    id: 'carmine-industries',
    name: 'Carmine Industries',
    district: 'Pentagram City',
    description: 'A steel-and-crimson showroom reconstructed as a precise footwork arena.',
    loreBasis: 'Carmilla Carmine’s weapons enterprise includes the offices where Hell’s Overlords meet.',
    imagePath: '/assets/stages/hazbin/carmine-industries/room.webp',
    thumbnailPath: '/assets/stages/hazbin/carmine-industries/thumb.webp',
    scenery: {
      middle: '/assets/stages/hazbin/carmine-industries/rack.webp',
      near: '/assets/stages/hazbin/carmine-industries/crate.webp',
    },
    imagePosition: 'center 58%',
    accent: '#ff6b6b',
    shadow: '#27080d',
    floor: '#241015',
    soundtrack: {
      id: 'steel-toe-staccato',
      title: 'Steel-Toe Staccato',
      bpm: 134,
      rootMidi: 37,
      swing: 0.48,
      drive: 0.9,
      seed: 1808,
      chordProgression: [
        [0, 3, 7, 10],
        [2, 5, 9, 12],
        [6, 9, 13, 16],
        [5, 8, 12, 15],
        [0, 4, 7, 10],
        [8, 11, 15, 18],
        [3, 6, 10, 13],
        [7, 10, 14, 17],
      ],
      bassPattern: [0, 7, 0, 12, 3, 10, 7, 13],
      leadPattern: [12, 13, null, 19, 15, null, 10, 12, 18, null, 15, 13, 7, 10, null, 12],
    },
  },
  {
    id: 'vee-broadcast-studio',
    name: 'Vee Broadcast Studio',
    district: 'Media district',
    description: 'A hostile neon studio reconstructed with screens kept safely off-air.',
    loreBasis: 'Vox and the Vees operate through Pentagram City’s television and media network.',
    imagePath: '/assets/stages/hazbin/vee-broadcast-studio.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/vee-broadcast-studio.webp',
    scenery: {
      middle: '/assets/stages/hazbin/vee-broadcast-studio/camera.webp',
      near: '/assets/stages/hazbin/vee-broadcast-studio/monitor.webp',
    },
    imagePosition: 'center 48%',
    accent: '#4de1ff',
    shadow: '#120b3a',
    floor: '#100d24',
    soundtrack: {
      id: 'dead-air-duel',
      title: 'Dead Air Duel',
      bpm: 146,
      rootMidi: 35,
      swing: 0.28,
      drive: 1,
      seed: 1950,
      chordProgression: [
        [0, 3, 7, 10],
        [1, 4, 8, 11],
        [6, 9, 13, 16],
        [7, 10, 14, 17],
        [0, 3, 7, 10],
        [10, 13, 17, 20],
        [5, 8, 12, 15],
        [7, 11, 14, 17],
      ],
      bassPattern: [0, 12, 7, 12, 0, 13, 7, 10],
      leadPattern: [12, null, 13, 19, 18, null, 15, 12, 22, 19, null, 13, 15, 10, null, 7],
    },
  },
  {
    id: 'heaven-embassy',
    name: 'Heaven Embassy & Clock Tower',
    district: 'Pentagram City',
    description: 'A luminous embassy forecourt beneath the city’s ominous extermination clock.',
    loreBasis: 'Heaven’s embassy and clock tower are Pentagram City landmarks tied to the extermination schedule.',
    imagePath: '/assets/stages/hazbin/heaven-embassy.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/heaven-embassy.webp',
    scenery: {
      middle: '/assets/stages/hazbin/heaven-embassy/railing-wave-b.webp',
      near: '/assets/stages/hazbin/heaven-embassy/pendant-wave-b.webp',
    },
    imagePosition: 'center 46%',
    accent: '#ffe8a3',
    shadow: '#171531',
    floor: '#20203b',
    soundtrack: {
      id: 'halo-clock-downbeat',
      title: 'Halo Clock Downbeat',
      bpm: 130,
      rootMidi: 43,
      swing: 0.52,
      drive: 0.82,
      seed: 365,
      chordProgression: [
        [0, 4, 7, 11],
        [9, 12, 16, 19],
        [5, 9, 12, 16],
        [7, 11, 14, 18],
        [0, 3, 7, 11],
        [4, 7, 11, 14],
        [5, 8, 12, 16],
        [7, 10, 14, 18],
      ],
      bassPattern: [0, 12, 7, 11, 0, 16, 12, 7],
      leadPattern: [19, 16, null, 23, 21, 19, null, 14, 16, null, 12, 19, 11, 14, 18, null],
    },
  },
] as const;

const IMP_RECEPTION = '/assets/stages/helluva/imp-reception';
const OZZIES_CABARET = '/assets/stages/helluva/ozzies-cabaret';
const WRATH_RANCH = '/assets/stages/helluva/wrath-ranch';
const HEAVEN_COURT = '/assets/stages/hazbin/heaven-court';
const PENTIOUS_WORKSHOP = '/assets/stages/hazbin/pentious-workshop';
const LOOLOO_LAND = '/assets/stages/helluva/looloo-land';
const STOLAS_PALACE = '/assets/stages/helluva/stolas-palace';
const BEE_PARTY = '/assets/stages/helluva/bee-party';
const DHORKS = '/assets/stages/helluva/dhorks';
const CRIMSON_MANSION = '/assets/stages/helluva/crimson-mansion';
const MAMMON_SHOW = '/assets/stages/helluva/mammon-show';
const WESTERN_LAIR = '/assets/stages/helluva/western-lair';
const GOETIA_COURT = '/assets/stages/helluva/goetia-court';
const HH_HEAVEN_GATES = '/assets/stages/hazbin/hh-heaven-gates';
const IMP_EXTERIOR = '/assets/stages/helluva/imp-exterior';
const OOPS_WAREHOUSE = '/assets/stages/helluva/oops-warehouse';
const SINSMAS_BALCONY = '/assets/stages/helluva/sinsmas-balcony';
const SPRING_BROKEN_BEACH = '/assets/stages/helluva/spring-broken-beach';
const MURDER_FAMILY_HOUSE = '/assets/stages/helluva/murder-family-house';
const CASH_CIRCUS = '/assets/stages/helluva/cash-circus';

export const STANDALONE_STAGES: readonly PentagramStage[] = [...PENTAGRAM_STAGES, {
  id: 'imp-reception',
  name: 'I.M.P. · Réception',
  district: 'Imp City',
  description: 'Le comptoir de la réception borde une piste entre la porte et les fenêtres de l’agence.',
  loreBasis: 'Les bureaux d’I.M.P. apparaissent dans Helluva Boss, S1 E1, Murder Family. La piste et son mobilier sont une adaptation de jeu.',
  imagePath: `${IMP_RECEPTION}/room.webp`,
  thumbnailPath: `${IMP_RECEPTION}/thumb.webp`,
  scenery: { middle: `${IMP_RECEPTION}/desk.webp`, near: `${IMP_RECEPTION}/lamp.webp` },
  imagePosition: 'center 58%',
  accent: '#f39ba5',
  shadow: '#33152b',
  floor: '#301626',
  soundtrack: {
    id: 'imp-office-hours', title: 'Standard occupé', bpm: 134, rootMidi: 38,
    swing: 0.57, drive: 0.8, seed: 1334,
    chordProgression: [[0, 3, 7, 10], [1, 5, 8, 11], [5, 8, 12, 15], [7, 11, 14, 17]],
    bassPattern: [0, 0, 7, 10, 12, 7, 5, 1],
    leadPattern: [12, null, 15, 13, null, 10, 7, null, 13, 12, null, 8, 7, null, 1, null],
  },
}, {
  id: 'ozzies-cabaret',
  name: 'Ozzie’s · Cabaret',
  district: 'Anneau de la Luxure',
  description: 'La piste du dîner-spectacle se prolonge entre les tables en cœur et le rideau de scène.',
  loreBasis: 'Helluva Boss, S1 E7, Ozzie’s. La salle de spectacle d’Asmodeus accueille Fizzarolli et le numéro de Moxxie. La largeur de la piste est adaptée au duel.',
  imagePath: `${OZZIES_CABARET}/room.webp`,
  thumbnailPath: `${OZZIES_CABARET}/thumb.webp`,
  scenery: { middle: `${OZZIES_CABARET}/table.webp`, near: `${OZZIES_CABARET}/curtain.webp` },
  imagePosition: 'center 48%',
  accent: '#f79adb',
  shadow: '#24153c',
  floor: '#301543',
  soundtrack: {
    id: 'ozzies-after-hours', title: 'Après le rappel', bpm: 108, rootMidi: 39,
    swing: 0.64, drive: 0.7, seed: 7108,
    chordProgression: [[0, 3, 7, 10], [5, 8, 12, 15], [2, 5, 8, 12], [7, 11, 14, 17]],
    bassPattern: [0, 7, 10, 8, 7, 5, 3, 1],
    leadPattern: [null, 10, 12, null, 15, 14, 12, null, 8, null, 10, 7, 5, null, 3, null],
  },
}, {
  id: 'wrath-ranch',
  name: 'Wrath · Ranch',
  district: 'Anneau de la Colère',
  description: 'Une cour poussiéreuse entre la grange, les clôtures et les mesas du ranch.',
  loreBasis: 'Reconstruction AU inspirée des fermes de l’anneau de la Colère dans Helluva Boss. La piste de duel et le placement du mobilier sont des adaptations de jeu.',
  imagePath: `${WRATH_RANCH}/room.webp`,
  thumbnailPath: `${WRATH_RANCH}/thumb.webp`,
  scenery: { middle: `${WRATH_RANCH}/hay.webp`, near: `${WRATH_RANCH}/pennant.webp` },
  imagePosition: 'center 63%',
  accent: '#f6b267',
  shadow: '#4a1820',
  floor: '#6b3627',
  soundtrack: {
    id: 'wrath-dust-reel', title: 'Poussière de Wrath', bpm: 132, rootMidi: 36,
    swing: 0.63, drive: 0.82, seed: 15132,
    chordProgression: [[0, 3, 7, 10], [5, 8, 12, 15], [0, 3, 7, 10], [7, 11, 14, 17]],
    bassPattern: [0, 7, 12, 7, 5, 12, 7, 10],
    leadPattern: [7, 12, null, 15, 12, 10, null, 7, 5, null, 8, 12, 14, 10, null, 7],
  },
}, {
  id: 'heaven-court',
  name: 'Paradis · Cour céleste',
  district: 'Paradis',
  description: 'Une salle d’audience claire sous les voûtes dorées et les galeries célestes.',
  loreBasis: 'Reconstruction AU inspirée de l’architecture céleste de Hazbin Hotel. La piste, les proportions et l’affrontement ne reproduisent pas une scène canonique.',
  imagePath: `${HEAVEN_COURT}/room.webp`,
  thumbnailPath: `${HEAVEN_COURT}/thumb.webp`,
  scenery: { middle: `${HEAVEN_COURT}/lectern.webp`, near: `${HEAVEN_COURT}/crystal.webp` },
  imagePosition: 'center 56%',
  accent: '#f7e6a8',
  shadow: '#3a244f',
  floor: '#a18daa',
  soundtrack: {
    id: 'ivory-hearing', title: 'Audience d’ivoire', bpm: 110, rootMidi: 45,
    swing: 0.38, drive: 0.64, seed: 6110,
    chordProgression: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 18]],
    bassPattern: [0, 12, 7, 4, 5, 12, 9, 7],
    leadPattern: [19, null, 16, 12, null, 14, 16, 19, 21, null, 19, 16, 14, null, 11, 12],
  },
}, {
  id: 'pentious-workshop',
  name: 'Sir Pentious · Atelier',
  district: 'Pentagram City',
  description: 'Un atelier de cuivre et de machines où les inventions entourent une piste dégagée.',
  loreBasis: 'Atelier original de simulation AU fondé sur l’imagerie d’inventeur de Sir Pentious. Cette salle n’est pas présentée comme une pièce attestée de la série.',
  imagePath: `${PENTIOUS_WORKSHOP}/room.webp`,
  thumbnailPath: `${PENTIOUS_WORKSHOP}/thumb.webp`,
  scenery: { middle: `${PENTIOUS_WORKSHOP}/bench.webp`, near: `${PENTIOUS_WORKSHOP}/hoist.webp` },
  imagePosition: 'center 58%',
  accent: '#e8b455',
  shadow: '#2b1720',
  floor: '#372123',
  soundtrack: {
    id: 'brass-coil-combo', title: 'Bobines de cuivre', bpm: 138, rootMidi: 37,
    swing: 0.46, drive: 0.88, seed: 13827,
    chordProgression: [[0, 3, 7, 10], [2, 5, 8, 12], [6, 9, 13, 16], [7, 11, 14, 17]],
    bassPattern: [0, 0, 7, 12, 2, 8, 6, 13],
    leadPattern: [12, 15, null, 13, 18, null, 15, 10, 7, 12, null, 19, 18, 13, null, 10],
  },
}, {
  id: 'looloo-land',
  name: 'Loo Loo Land · Allée centrale',
  district: 'Anneau de l’Avarice',
  description: 'Une allée de fête foraine entre les attractions, les stands et les fanions défraîchis.',
  loreBasis: 'Reconstruction AU inspirée du parc Loo Loo Land de Helluva Boss. L’allée et les distances entre attractions sont adaptées au duel.',
  imagePath: `${LOOLOO_LAND}/room.webp`,
  thumbnailPath: `${LOOLOO_LAND}/thumb.webp`,
  scenery: { middle: `${LOOLOO_LAND}/booth.webp`, near: `${LOOLOO_LAND}/pennants.webp` },
  imagePosition: 'center 61%',
  accent: '#e8b84a',
  shadow: '#40351f',
  floor: '#64513c',
  soundtrack: {
    id: 'midway-misstep', title: 'Dernier tour de manège', bpm: 144, rootMidi: 40,
    swing: 0.7, drive: 0.9, seed: 2144,
    chordProgression: [[0, 3, 7, 10], [3, 6, 10, 13], [8, 11, 15, 18], [7, 11, 14, 17]],
    bassPattern: [0, 7, 12, 10, 3, 10, 8, 7],
    leadPattern: [12, 15, 19, null, 18, 15, 13, null, 10, 12, 15, null, 13, 10, 7, null],
  },
}, {
  id: 'stolas-palace',
  name: 'Palais de Stolas · Terrasse',
  district: 'Domaine des Ars Goetia',
  description: 'Une terrasse mauve sous le ciel rose, encadrée par les balustrades et les bannières du palais.',
  loreBasis: 'Repères du palais de Stolas dans Helluva Boss, The Circus, S2 E1. Terrasse intacte antérieure à Sinsmas. La piste et les distances sont une reconstruction de simulation AU.',
  imagePath: `${STOLAS_PALACE}/room.webp`,
  thumbnailPath: `${STOLAS_PALACE}/thumb.webp`,
  scenery: { middle: `${STOLAS_PALACE}/prop-middle.webp`, near: `${STOLAS_PALACE}/prop-near.webp` },
  imagePosition: 'center 60%',
  accent: '#e6acd4',
  shadow: '#392847',
  floor: '#63506f',
  soundtrack: {
    id: 'goetia-dusk', title: 'Crépuscule de Goetia', bpm: 112, rootMidi: 42,
    swing: 0.42, drive: 0.66, seed: 241121,
    chordProgression: [[0, 3, 7, 11], [5, 8, 12, 15], [8, 12, 15, 19], [7, 11, 14, 18]],
    bassPattern: [0, 7, 12, 3, 5, 12, 8, 7],
    leadPattern: [19, null, 15, 14, null, 12, 15, null, 20, 19, null, 15, 14, null, 11, 12],
  },
}, {
  id: 'bee-party',
  name: 'Beelzebub · Réception',
  district: 'Anneau de la Gourmandise',
  description: 'Un atrium ambré à alvéoles, bordé de balcons et de lumières cyan autour de la piste.',
  loreBasis: 'Réception de Beelzebub dans Helluva Boss, Queen Bee, S1 E8. La géométrie de duel et le placement des objets sont une adaptation de simulation AU.',
  imagePath: `${BEE_PARTY}/room.webp`,
  thumbnailPath: `${BEE_PARTY}/thumb.webp`,
  scenery: { middle: `${BEE_PARTY}/prop-middle.webp`, near: `${BEE_PARTY}/prop-near.webp` },
  imagePosition: 'center 60%',
  accent: '#73e8df',
  shadow: '#4d254c',
  floor: '#c48a5c',
  soundtrack: {
    id: 'honey-afterparty', title: 'Après la fête', bpm: 138, rootMidi: 40,
    swing: 0.32, drive: 0.9, seed: 241128,
    chordProgression: [[0, 4, 7, 10], [5, 9, 12, 15], [9, 12, 16, 19], [7, 11, 14, 17]],
    bassPattern: [0, 12, 7, 10, 5, 12, 9, 7],
    leadPattern: [12, 16, null, 19, 17, null, 16, 12, 21, null, 19, 16, 14, null, 10, 12],
  },
}, {
  id: 'dhorks',
  name: 'D.H.O.R.K.S. · Interrogatoire',
  district: 'Terre',
  description: 'Un miroir sombre et une lumière zénithale encadrent le carrelage de la salle d’interrogatoire.',
  loreBasis: 'Helluva Boss, Truth Seekers, S1 E6. Salle intacte avant l’évasion, sans installation de portail ultérieure. La piste élargie et la caméra extérieure relocalisée sont une reconstruction AU.',
  imagePath: `${DHORKS}/room.webp`,
  thumbnailPath: `${DHORKS}/thumb.webp`,
  scenery: { middle: `${DHORKS}/prop-middle.webp`, near: `${DHORKS}/prop-near.webp` },
  imagePosition: 'center 65%',
  accent: '#abbc8b',
  shadow: '#17201a',
  floor: '#343b2b',
  soundtrack: {
    id: 'observation-window', title: 'Derrière la vitre', bpm: 122, rootMidi: 35,
    swing: 0.28, drive: 0.74, seed: 26112461,
    chordProgression: [[0, 3, 6, 10], [1, 5, 8, 12], [6, 9, 12, 16], [7, 10, 13, 17]],
    bassPattern: [0, 0, 6, 7, 1, 8, 6, 10],
    leadPattern: [12, null, 13, 18, null, 15, 10, null, 13, 12, null, 16, 18, null, 13, 10],
  },
}, {
  id: 'crimson-mansion',
  name: 'Demeure de Crimson · Salon',
  district: 'Anneau de l’Avarice',
  description: 'Un salon vert à boiseries, cheminée et vitrine éclairée, bordé d’un fauteuil haut et d’une lampe à franges.',
  loreBasis: 'Helluva Boss, Exes and Oohs, S2 E3. Repères du salon ordinaire avant l’activation du gag mural. Pièce vidée, meubles repositionnés et parquet élargi pour une simulation AU.',
  imagePath: `${CRIMSON_MANSION}/room.webp`,
  thumbnailPath: `${CRIMSON_MANSION}/thumb.webp`,
  scenery: { middle: `${CRIMSON_MANSION}/prop-middle.webp`, near: `${CRIMSON_MANSION}/prop-near.webp` },
  imagePosition: 'center 65%',
  accent: '#89c45c',
  shadow: '#102d24',
  floor: '#302a1e',
  soundtrack: {
    id: 'emerald-house-rules', title: 'Les règles de la maison', bpm: 118, rootMidi: 39,
    swing: 0.66, drive: 0.72, seed: 26112423,
    chordProgression: [[0, 3, 7, 10], [2, 5, 8, 11], [5, 8, 12, 16], [7, 11, 14, 17]],
    bassPattern: [0, 7, 10, 12, 2, 8, 5, 11],
    leadPattern: [15, null, 12, 10, 14, null, 17, 15, null, 16, 12, 8, 11, null, 14, 10],
  },
}, {
  id: 'mammon-show',
  name: 'Concours de Mammon · Scène',
  district: 'Anneau de l’Avarice',
  description: 'Une scène pourpre et or sous les ampoules du théâtre, avec enceintes et treillis lumineux sur les bords.',
  loreBasis: 'Helluva Boss, Mammon’s Magnificent Musical Mid-Season Special, S2 E7. Théâtre intact du concours, vidé et élargi pour la simulation AU. Ornements circulaires et assemblage du projecteur adaptés au jeu.',
  imagePath: `${MAMMON_SHOW}/room.webp`,
  thumbnailPath: `${MAMMON_SHOW}/thumb.webp`,
  scenery: { middle: `${MAMMON_SHOW}/prop-middle.webp`, near: `${MAMMON_SHOW}/prop-near.webp` },
  imagePosition: 'center 65%',
  accent: '#f3d64b',
  shadow: '#470e53',
  floor: '#4b1264',
  soundtrack: {
    id: 'gilded-truss-encore', title: 'Rappel sous les projecteurs', bpm: 146, rootMidi: 41,
    swing: 0.36, drive: 0.92, seed: 26112427,
    chordProgression: [[0, 4, 7, 10], [3, 7, 10, 14], [8, 12, 15, 18], [7, 11, 14, 17]],
    bassPattern: [0, 12, 7, 3, 10, 8, 15, 7],
    leadPattern: [16, null, 19, 22, 14, null, 15, 19, 20, 18, null, 15, 17, null, 14, 12],
  },
}, {
  id: 'western-lair',
  name: 'Repaire de Striker · Mine',
  district: 'Anneau de la Colère',
  description: 'Des rails courbes et de petites lampes cyan traversent une caverne bleu-gris, avec une piste de pierre dégagée.',
  loreBasis: 'Helluva Boss, Western Energy, S2 E4. Mine intacte avant l’arrivée du van. La piste frontale élargie, le radiocassette et le tronçon de rail repositionnés sont une adaptation de simulation AU.',
  imagePath: `${WESTERN_LAIR}/room.webp`,
  thumbnailPath: `${WESTERN_LAIR}/thumb.webp`,
  scenery: { middle: `${WESTERN_LAIR}/prop-middle.webp`, near: `${WESTERN_LAIR}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#73e6f5',
  shadow: '#222b45',
  floor: '#354f6d',
  soundtrack: {
    id: 'cyan-track-reel', title: 'La voie bleue', bpm: 132, rootMidi: 36,
    swing: 0.62, drive: 0.82, seed: 261124204,
    chordProgression: [[0, 3, 7, 10], [5, 8, 12, 15], [2, 5, 9, 12], [7, 10, 14, 17]],
    bassPattern: [0, 7, 12, 3, 5, 12, 2, 10],
    leadPattern: [12, null, 7, 15, 14, null, 10, 12, 17, 15, null, 9, 14, null, 7, 10],
  },
}, {
  id: 'goetia-court',
  name: 'Tribunal infernal · Mastermind',
  district: 'Tribunal de l’Enfer',
  description: 'Les gradins pourpres et les yeux noirs surplombent une fosse orange, derrière le balcon du duel.',
  loreBasis: 'Helluva Boss, Mastermind, S2 E11. Tribunal infernal intact et vidé, distinct d’une institution exclusivement Goetia. Balcon frontal élargi, tribune flottante et balustrade déplacées pour la simulation AU.',
  imagePath: `${GOETIA_COURT}/room.webp`,
  thumbnailPath: `${GOETIA_COURT}/thumb.webp`,
  scenery: { middle: `${GOETIA_COURT}/prop-middle.webp`, near: `${GOETIA_COURT}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#ff7145',
  shadow: '#270b2d',
  floor: '#650c35',
  soundtrack: {
    id: 'verdict-over-embers', title: 'Audience sur les braises', bpm: 114, rootMidi: 33,
    swing: 0.3, drive: 0.85, seed: 261124211,
    chordProgression: [[0, 3, 6, 10], [6, 9, 12, 15], [5, 8, 11, 15], [7, 10, 13, 17]],
    bassPattern: [0, 0, 6, 12, 5, 11, 7, 13],
    leadPattern: [12, null, 18, 15, null, 10, 9, null, 17, 15, 11, null, 13, 10, null, 7],
  },
}, {
  id: 'hh-heaven-gates',
  name: 'Paradis · Portes célestes',
  district: 'Paradis',
  description: 'Les portes d’or fermées se dressent sous trois yeux lumineux, au bout d’une approche claire et réfléchissante.',
  loreBasis: 'Hazbin Hotel, Welcome to Heaven, S1 E6. Portes intactes et fermées de la saison 1, d’après le plan couleur de production et le clip officiel. Approche élargie, pupitre et grille repositionnés pour la simulation AU.',
  imagePath: `${HH_HEAVEN_GATES}/room.webp`,
  thumbnailPath: `${HH_HEAVEN_GATES}/thumb.webp`,
  scenery: { middle: `${HH_HEAVEN_GATES}/prop-middle.webp`, near: `${HH_HEAVEN_GATES}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#f4cd68',
  shadow: '#ad9dc2',
  floor: '#f9e3b4',
  soundtrack: {
    id: 'gilded-threshold', title: 'Le seuil doré', bpm: 108, rootMidi: 46,
    swing: 0.4, drive: 0.6, seed: 261124106,
    chordProgression: [[0, 4, 7, 11], [4, 7, 11, 14], [9, 12, 16, 19], [7, 11, 14, 18]],
    bassPattern: [0, 12, 4, 11, 9, 16, 7, 14],
    leadPattern: [19, null, 16, 23, 21, null, 16, 14, 24, 21, null, 19, 18, null, 14, 12],
  },
}, {
  id: 'imp-exterior',
  name: 'I.M.P. · Rue des bureaux',
  district: 'Imp City',
  description: 'La façade de briques et les fenêtres roses des bureaux dominent une ruelle au ciel pourpre.',
  loreBasis: 'Helluva Boss, Murder Family, S1 E1. Repères extérieurs des bureaux I.M.P. La rue élargie, les avis muraux et la fenêtre déportée en bord de cadre sont une reconstruction de simulation AU.',
  imagePath: `${IMP_EXTERIOR}/room.webp`,
  thumbnailPath: `${IMP_EXTERIOR}/thumb.webp`,
  scenery: { middle: `${IMP_EXTERIOR}/prop-middle.webp`, near: `${IMP_EXTERIOR}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#ef527c', shadow: '#420d2c', floor: '#482e3c',
  soundtrack: {
    id: 'after-hours-contract', title: 'Contrat après la fermeture', bpm: 134, rootMidi: 38,
    swing: 0.46, drive: 0.78, seed: 261124501,
    chordProgression: [[0, 3, 7, 10], [3, 7, 10, 14], [6, 9, 13, 16], [7, 10, 14, 17]],
    bassPattern: [0, 7, 3, 12, 6, 13, 7, 10],
    leadPattern: [15, null, 12, 19, 14, null, 10, 13, 16, null, 15, 12, 17, null, 14, 7],
  },
}, {
  id: 'oops-warehouse',
  name: 'Oops · Entrepôt',
  district: 'Anneau de l’Avarice',
  description: 'Un entrepôt vert bleuté, des poutres industrielles et des cartons entourent une piste de béton libre.',
  loreBasis: 'Helluva Boss, Oops, S2 E6. Repères de l’entrepôt avant les dégâts. L’espace de duel élargi, la cage vide et les cartons déplacés vers les bords relèvent de la simulation AU.',
  imagePath: `${OOPS_WAREHOUSE}/room.webp`,
  thumbnailPath: `${OOPS_WAREHOUSE}/thumb.webp`,
  scenery: { middle: `${OOPS_WAREHOUSE}/prop-middle.webp`, near: `${OOPS_WAREHOUSE}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#86b9a9', shadow: '#0d212a', floor: '#2d4145',
  soundtrack: {
    id: 'empty-crate-echo', title: 'Échos entre les caisses', bpm: 126, rootMidi: 35,
    swing: 0.31, drive: 0.84, seed: 261124506,
    chordProgression: [[0, 3, 6, 10], [5, 8, 12, 15], [1, 5, 8, 11], [7, 10, 14, 17]],
    bassPattern: [0, 0, 6, 12, 5, 8, 1, 7],
    leadPattern: [12, null, 18, 15, 13, null, 8, 10, 17, null, 14, 12, 16, null, 11, 7],
  },
}, {
  id: 'sinsmas-balcony',
  name: 'Blitzø · Balcon de Sinsmas',
  district: 'Imp City',
  description: 'Un balcon métallique illuminé par une guirlande domine les silhouettes fuchsia de la ville.',
  loreBasis: 'Helluva Boss, Sinsmas, S2 E12. Balcon de l’appartement de Blitzø et guirlande de fête. Largeur de la plateforme, garde-corps de bord et profondeur des lumières adaptés à la simulation AU.',
  imagePath: `${SINSMAS_BALCONY}/room.webp`,
  thumbnailPath: `${SINSMAS_BALCONY}/thumb.webp`,
  scenery: { middle: `${SINSMAS_BALCONY}/prop-middle.webp`, near: `${SINSMAS_BALCONY}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#fa79c4', shadow: '#30062e', floor: '#3d203b',
  soundtrack: {
    id: 'pink-sky-refrain', title: 'Refrain sous le ciel rose', bpm: 110, rootMidi: 43,
    swing: 0.5, drive: 0.62, seed: 261124512,
    chordProgression: [[0, 3, 7, 11], [8, 12, 15, 19], [5, 8, 12, 16], [7, 11, 14, 18]],
    bassPattern: [0, 7, 12, 3, 8, 15, 5, 11],
    leadPattern: [19, null, 15, 12, 20, null, 19, 15, 17, null, 12, 16, 18, null, 14, 11],
  },
}, {
  id: 'spring-broken-beach',
  name: 'Plage · Spring Broken',
  district: 'Terre',
  description: 'La plage et la promenade ensoleillée encadrent une piste de sable, entre planches de surf et parasol.',
  loreBasis: 'Helluva Boss, Spring Broken, S1 E3. Motifs de la plage et de la promenade. La scène est vidée et le sol de duel élargi pour la simulation AU ; les accessoires sont déplacés vers les bords.',
  imagePath: `${SPRING_BROKEN_BEACH}/room.webp`,
  thumbnailPath: `${SPRING_BROKEN_BEACH}/thumb.webp`,
  scenery: { middle: `${SPRING_BROKEN_BEACH}/prop-middle.webp`, near: `${SPRING_BROKEN_BEACH}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#f9d27f', shadow: '#4a6279', floor: '#d6ad78',
  soundtrack: {
    id: 'sand-and-surf-contract', title: 'Contrat sur le sable', bpm: 132, rootMidi: 41,
    swing: 0.53, drive: 0.74, seed: 261125103,
    chordProgression: [[0, 4, 7, 10], [5, 9, 12, 15], [2, 5, 9, 12], [7, 11, 14, 17]],
    bassPattern: [0, 7, 12, 10, 5, 12, 2, 7],
    leadPattern: [16, null, 19, 14, 12, null, 17, 15, 21, null, 17, 14, 19, null, 11, 12],
  },
}, {
  id: 'murder-family-house',
  name: 'Martha · Maison dans la clairière',
  district: 'Terre',
  description: 'La maison de bois rouge et toiture bleue se découpe dans une clairière nocturne.',
  loreBasis: 'Helluva Boss, Murder Family, S1 E1. La maison, sa jardinière et le feuillage de la clairière servent de références. Cadrage frontal, piste et implantation des accessoires adaptés à la simulation AU.',
  imagePath: `${MURDER_FAMILY_HOUSE}/room.webp`,
  thumbnailPath: `${MURDER_FAMILY_HOUSE}/thumb.webp`,
  scenery: { middle: `${MURDER_FAMILY_HOUSE}/prop-middle.webp`, near: `${MURDER_FAMILY_HOUSE}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#cc718c', shadow: '#182738', floor: '#29434b',
  soundtrack: {
    id: 'clearing-after-dark', title: 'La clairière après minuit', bpm: 118, rootMidi: 34,
    swing: 0.34, drive: 0.73, seed: 261125101,
    chordProgression: [[0, 3, 6, 10], [1, 5, 8, 11], [5, 8, 12, 15], [7, 10, 13, 17]],
    bassPattern: [0, 6, 0, 12, 1, 8, 5, 7],
    leadPattern: [15, null, 12, 18, 13, null, 11, 8, 17, null, 15, 12, 10, null, 13, 7],
  },
}, {
  id: 'cash-circus',
  name: 'Cirque de Cash · Piste',
  district: 'Enfer',
  description: 'Une piste de cirque vide, des rideaux rouges et une arche à ampoules entourent le duel.',
  loreBasis: 'Helluva Boss, The Circus, S2 E1. Repères du cirque de Cash. Le point de vue aplati, la largeur de la piste et les fragments de balustrade et d’arche relèvent de la simulation AU.',
  imagePath: `${CASH_CIRCUS}/room.webp`,
  thumbnailPath: `${CASH_CIRCUS}/thumb.webp`,
  scenery: { middle: `${CASH_CIRCUS}/prop-middle.webp`, near: `${CASH_CIRCUS}/prop-near.webp` },
  imagePosition: 'center bottom',
  accent: '#efb959', shadow: '#4a1630', floor: '#814448',
  soundtrack: {
    id: 'empty-ring-reprise', title: 'Reprise sur la piste vide', bpm: 140, rootMidi: 39,
    swing: 0.64, drive: 0.82, seed: 261125201,
    chordProgression: [[0, 3, 7, 10], [3, 7, 10, 14], [6, 9, 12, 15], [7, 11, 14, 17]],
    bassPattern: [0, 12, 7, 3, 6, 12, 7, 11],
    leadPattern: [19, 15, null, 12, 22, 19, null, 15, 18, 15, null, 12, 17, 14, null, 11],
  },
}];

export const DEFAULT_PENTAGRAM_STAGE = PENTAGRAM_STAGES[0];

export function getPentagramStage(stageId: string): PentagramStage {
  return STANDALONE_STAGES.find(stage => stage.id === stageId) ?? DEFAULT_PENTAGRAM_STAGE;
}

export function getPentagramStageVisualProperties(
  stage: PentagramStage,
  imageVariant: 'full' | 'thumbnail' = 'full',
): Record<string, string> {
  return {
    '--arena-stage-art': `url("${imageVariant === 'thumbnail' ? stage.thumbnailPath : stage.imagePath}")`,
    '--arena-stage-position': stage.imagePosition,
    '--arena-stage-accent': stage.accent,
    '--arena-stage-shadow': stage.shadow,
    '--arena-stage-floor': stage.floor,
  };
}
