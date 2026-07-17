export type PentagramStageId =
  | 'hotel-lobby'
  | 'hotel-bar'
  | 'hotel-exterior'
  | 'pentagram-rooftops'
  | 'cannibal-town-square'
  | 'carmine-industries'
  | 'heaven-embassy'
  | 'vee-broadcast-studio';

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
    imagePath: '/assets/hotel_bar.png',
    thumbnailPath: '/assets/stages/hazbin/thumbs/hotel-bar.webp',
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
    imagePath: '/assets/hotel_exterior.png',
    thumbnailPath: '/assets/stages/hazbin/thumbs/hotel-exterior.webp',
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
    imagePath: '/assets/stages/hazbin/carmine-industries.webp',
    thumbnailPath: '/assets/stages/hazbin/thumbs/carmine-industries.webp',
    imagePosition: 'center 50%',
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

export const DEFAULT_PENTAGRAM_STAGE = PENTAGRAM_STAGES[0];

export function getPentagramStage(stageId: string): PentagramStage {
  return PENTAGRAM_STAGES.find(stage => stage.id === stageId) ?? DEFAULT_PENTAGRAM_STAGE;
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
