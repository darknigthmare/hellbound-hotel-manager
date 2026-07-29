/**
 * First-run narrative for Hellbound Hotel Manager.
 *
 * The sequence is explicitly a Simulation AU: the hotel staff keep their
 * canon roles, while Marlow Glass and every operational consequence belong
 * only to the game. Completing this prologue records a consent-led intake;
 * it never changes a soul's nature or confirms celestial redemption.
 */

export type HotelPrologueChapterId =
  | 'door-still-lit'
  | 'learn-the-house'
  | 'first-knock'
  | 'place-chosen';

export type HotelPrologueSpeakerId =
  | 'system'
  | 'charlie'
  | 'vaggie'
  | 'husk'
  | 'niffty'
  | 'sim_applicant_marlow';

export type HotelPrologueSceneKind =
  | 'cinematic'
  | 'guided_gameplay'
  | 'guided_dialogue'
  | 'mission';

export type HotelPrologueCamera =
  | 'establishing'
  | 'wide'
  | 'tracking'
  | 'conversation'
  | 'gameplay';

export type HotelPrologueMechanic =
  | 'cinematic'
  | 'move'
  | 'jump'
  | 'collect'
  | 'inspect'
  | 'dash'
  | 'avoid_pressure'
  | 'interact'
  | 'follow'
  | 'stabilize'
  | 'prepare_room'
  | 'mission_loop';

export type HotelPrologueCompletionKind =
  | 'screen_sequence_complete'
  | 'reach_marker'
  | 'jump_over_marker'
  | 'collect_all_markers'
  | 'inspect_all_points'
  | 'reach_target_with_dash'
  | 'reach_target_without_damage'
  | 'interact_at_target'
  | 'stay_near_partner'
  | 'hold_stability_window'
  | 'prepare_safe_bed'
  | 'complete_guided_shift';

export interface HotelPrologueSpeaker {
  id: HotelPrologueSpeakerId;
  name: string;
  portraitPath: string | null;
  continuity: 'canon_role' | 'simulation_au' | 'interface';
}

export interface HotelPrologueChapter {
  id: HotelPrologueChapterId;
  order: number;
  title: string;
  purpose: string;
}

export interface HotelPrologueScreen {
  id: string;
  speakerId: HotelPrologueSpeakerId;
  copy: string;
  durationMs: number;
}

export interface HotelPrologueObjective {
  id: string;
  label: string;
  instruction: string;
  completionKind: HotelPrologueCompletionKind;
}

export interface HotelPrologueTutorialCue {
  mechanic: HotelPrologueMechanic;
  prompt: string;
  controls: readonly string[];
  successCondition: string;
}

export interface HotelPrologueScene {
  id: string;
  chapterId: HotelPrologueChapterId;
  order: number;
  title: string;
  kind: HotelPrologueSceneKind;
  estimatedDurationMs: number;
  backgroundPath: string;
  camera: HotelPrologueCamera;
  focusCharacterIds: readonly HotelPrologueSpeakerId[];
  screens: readonly HotelPrologueScreen[];
  objective: HotelPrologueObjective;
  tutorial: HotelPrologueTutorialCue;
  completionFlag: string;
}

export interface HotelPrologueDefinition {
  id: string;
  version: number;
  continuity: 'simulation_au';
  candidateId: 'sim_applicant_marlow';
  disclaimer: string;
  chapters: readonly HotelPrologueChapter[];
  scenes: readonly HotelPrologueScene[];
  completionFlag: string;
  firstMissionUnlockFlag: string;
}

export interface HotelPrologueProgress {
  completedSceneCount: number;
  totalSceneCount: number;
  ratio: number;
  isComplete: boolean;
  currentScene: HotelPrologueScene | null;
  currentChapter: HotelPrologueChapter | null;
}

export const HOTEL_PROLOGUE_COPY_MAX_WORDS = 26;

export const HOTEL_PROLOGUE_VISUAL_PATHS = [
  '/assets/openai/dashboard-hotel-exterior.webp',
  '/assets/hotel_exterior.png',
  '/assets/hotel_lobby.png',
  '/assets/hotel_bar.png',
  '/assets/stages/hazbin/hotel-lobby.webp',
] as const;

export const HOTEL_PROLOGUE_SPEAKERS: Readonly<
  Record<HotelPrologueSpeakerId, HotelPrologueSpeaker>
> = {
  system: {
    id: 'system',
    name: 'Hellbound Hotel Manager',
    portraitPath: null,
    continuity: 'interface',
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie Morningstar',
    portraitPath: '/assets/sprites/portraits/charlie.png',
    continuity: 'canon_role',
  },
  vaggie: {
    id: 'vaggie',
    name: 'Vaggie',
    portraitPath: '/assets/sprites/portraits/vaggie.png',
    continuity: 'canon_role',
  },
  husk: {
    id: 'husk',
    name: 'Husk',
    portraitPath: '/assets/sprites/portraits/husk.png',
    continuity: 'canon_role',
  },
  niffty: {
    id: 'niffty',
    name: 'Niffty',
    portraitPath: '/assets/sprites/portraits/niffty.png',
    continuity: 'canon_role',
  },
  sim_applicant_marlow: {
    id: 'sim_applicant_marlow',
    name: 'Marlow Glass',
    portraitPath: '/assets/sprites/portraits/sim_applicant_marlow.png',
    continuity: 'simulation_au',
  },
};

export const HOTEL_PROLOGUE_CHAPTERS: readonly HotelPrologueChapter[] = [
  {
    id: 'door-still-lit',
    order: 0,
    title: 'A Door Still Lit',
    purpose: 'Establish the hotel promise, its pressure, and the player role without a text wall.',
  },
  {
    id: 'learn-the-house',
    order: 1,
    title: 'Learn the House',
    purpose: 'Meet the core staff while learning movement, collection, inspection, and observation.',
  },
  {
    id: 'first-knock',
    order: 2,
    title: 'The First Knock',
    purpose: 'Receive a Simulation AU applicant through safety-first and consent-led play.',
  },
  {
    id: 'place-chosen',
    order: 3,
    title: 'A Place Chosen',
    purpose: 'Prepare a room, stabilize the intake, and hand the player a clear first shift.',
  },
] as const;

function defineScene(scene: HotelPrologueScene): HotelPrologueScene {
  return scene;
}

export const HOTEL_PROLOGUE_SCENES: readonly HotelPrologueScene[] = [
  defineScene({
    id: 'intro-01-city-after-dark',
    chapterId: 'door-still-lit',
    order: 0,
    title: 'Pentagram After Dark',
    kind: 'cinematic',
    estimatedDurationMs: 36_000,
    backgroundPath: '/assets/openai/dashboard-hotel-exterior.webp',
    camera: 'establishing',
    focusCharacterIds: ['system'],
    screens: [
      {
        id: 'intro-01-a',
        speakerId: 'system',
        copy: 'Pentagram City never truly quiets. Every glowing sign competes for one more desperate soul.',
        durationMs: 5_800,
      },
      {
        id: 'intro-01-b',
        speakerId: 'system',
        copy: 'Deals, grudges, and spectacle travel faster than trust.',
        durationMs: 4_600,
      },
      {
        id: 'intro-01-c',
        speakerId: 'system',
        copy: 'Yet one building keeps its front door lit for anyone willing to enter.',
        durationMs: 5_400,
      },
      {
        id: 'intro-01-d',
        speakerId: 'charlie',
        copy: 'Tomorrow can start with something small: one safe room, one honest choice, one person heard.',
        durationMs: 6_200,
      },
    ],
    objective: {
      id: 'objective-intro-01',
      label: 'See the city',
      instruction: 'Follow the opening view toward the hotel.',
      completionKind: 'screen_sequence_complete',
    },
    tutorial: {
      mechanic: 'cinematic',
      prompt: 'The introduction advances automatically. Any input reveals subtitle and pause controls.',
      controls: [],
      successCondition: 'All four opening screens finish.',
    },
    completionFlag: 'hotel-prologue:intro-01',
  }),
  defineScene({
    id: 'intro-02-promise',
    chapterId: 'door-still-lit',
    order: 1,
    title: 'The Promise',
    kind: 'cinematic',
    estimatedDurationMs: 35_000,
    backgroundPath: '/assets/hotel_exterior.png',
    camera: 'wide',
    focusCharacterIds: ['charlie', 'vaggie'],
    screens: [
      {
        id: 'intro-02-a',
        speakerId: 'charlie',
        copy: 'The hotel offers sinners shelter and a chance to work on themselves without facing the city alone.',
        durationMs: 6_400,
      },
      {
        id: 'intro-02-b',
        speakerId: 'vaggie',
        copy: 'A promise needs locks, supplies, clear boundaries, and people who finish the difficult work.',
        durationMs: 6_000,
      },
      {
        id: 'intro-02-c',
        speakerId: 'charlie',
        copy: 'That is why you are here. Keep the place running while every resident chooses their own next step.',
        durationMs: 6_500,
      },
    ],
    objective: {
      id: 'objective-intro-02',
      label: 'Understand the promise',
      instruction: 'Learn what the hotel offers and what the player protects.',
      completionKind: 'screen_sequence_complete',
    },
    tutorial: {
      mechanic: 'cinematic',
      prompt: 'Watch how Charlie sets the goal and Vaggie defines its practical limits.',
      controls: [],
      successCondition: 'The hotel mission and player role are established.',
    },
    completionFlag: 'hotel-prologue:intro-02',
  }),
  defineScene({
    id: 'intro-03-pressure',
    chapterId: 'door-still-lit',
    order: 2,
    title: 'Pressure at Every Window',
    kind: 'cinematic',
    estimatedDurationMs: 38_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'tracking',
    focusCharacterIds: ['vaggie', 'husk', 'niffty'],
    screens: [
      {
        id: 'intro-03-a',
        speakerId: 'vaggie',
        copy: 'Threats outside matter, but neglect inside can break the hotel just as quickly.',
        durationMs: 5_400,
      },
      {
        id: 'intro-03-b',
        speakerId: 'niffty',
        copy: 'Loose boards, dirty rooms, missing supplies! Tiny disasters love becoming enormous disasters.',
        durationMs: 5_700,
      },
      {
        id: 'intro-03-c',
        speakerId: 'husk',
        copy: 'And a resident under pressure rarely announces it before things go sideways.',
        durationMs: 5_500,
      },
      {
        id: 'intro-03-d',
        speakerId: 'system',
        copy: 'A good shift reads the room, handles what is urgent, and leaves no one trapped by the solution.',
        durationMs: 6_400,
      },
    ],
    objective: {
      id: 'objective-intro-03',
      label: 'Read the pressure',
      instruction: 'Recognize maintenance, security, and resident wellbeing as connected systems.',
      completionKind: 'screen_sequence_complete',
    },
    tutorial: {
      mechanic: 'cinematic',
      prompt: 'Each later mission will turn one visible pressure into a playable objective.',
      controls: [],
      successCondition: 'The three operational pressure types are introduced.',
    },
    completionFlag: 'hotel-prologue:intro-03',
  }),
  defineScene({
    id: 'intro-04-knock',
    chapterId: 'door-still-lit',
    order: 3,
    title: 'Before the Knock',
    kind: 'cinematic',
    estimatedDurationMs: 34_000,
    backgroundPath: '/assets/stages/hazbin/hotel-lobby.webp',
    camera: 'wide',
    focusCharacterIds: ['charlie', 'vaggie'],
    screens: [
      {
        id: 'intro-04-a',
        speakerId: 'charlie',
        copy: 'We cannot decide who walks through that door, but we can decide how they are welcomed.',
        durationMs: 6_000,
      },
      {
        id: 'intro-04-b',
        speakerId: 'vaggie',
        copy: 'We verify safety first. Then we offer choices, not pressure.',
        durationMs: 5_000,
      },
      {
        id: 'intro-04-c',
        speakerId: 'system',
        copy: 'Tonight, before the first applicant arrives, the hotel must be ready.',
        durationMs: 5_200,
      },
    ],
    objective: {
      id: 'objective-intro-04',
      label: 'Open the shift',
      instruction: 'Enter the lobby and meet the team.',
      completionKind: 'screen_sequence_complete',
    },
    tutorial: {
      mechanic: 'cinematic',
      prompt: 'The camera settles into the playable side view when the final screen ends.',
      controls: [],
      successCondition: 'Control transfers to the player in the lobby.',
    },
    completionFlag: 'hotel-prologue:intro-04',
  }),
  defineScene({
    id: 'tutorial-05-find-charlie',
    chapterId: 'learn-the-house',
    order: 4,
    title: 'One Room at a Time',
    kind: 'guided_gameplay',
    estimatedDurationMs: 52_000,
    backgroundPath: '/assets/stages/hazbin/hotel-lobby.webp',
    camera: 'gameplay',
    focusCharacterIds: ['charlie', 'vaggie'],
    screens: [
      {
        id: 'tutorial-05-a',
        speakerId: 'charlie',
        copy: 'Welcome. We will learn the hotel one room at a time, and nobody expects perfection on your first shift.',
        durationMs: 6_400,
      },
      {
        id: 'tutorial-05-b',
        speakerId: 'vaggie',
        copy: 'Start simple. Walk to Charlie’s floor marker and keep your eyes on the route.',
        durationMs: 5_500,
      },
    ],
    objective: {
      id: 'objective-tutorial-05',
      label: 'Meet Charlie',
      instruction: 'Move across the lobby and stop inside Charlie’s marked area.',
      completionKind: 'reach_marker',
    },
    tutorial: {
      mechanic: 'move',
      prompt: 'Move left or right toward Charlie. The objective marker narrows as you approach.',
      controls: ['ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyA', 'KeyD'],
      successCondition: 'The player remains inside Charlie’s marker for one second.',
    },
    completionFlag: 'hotel-prologue:tutorial-05',
  }),
  defineScene({
    id: 'tutorial-06-cross-the-luggage',
    chapterId: 'learn-the-house',
    order: 5,
    title: 'Mind the Luggage',
    kind: 'guided_gameplay',
    estimatedDurationMs: 48_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'gameplay',
    focusCharacterIds: ['vaggie'],
    screens: [
      {
        id: 'tutorial-06-a',
        speakerId: 'vaggie',
        copy: 'Routes change fast during a crisis. Jump the luggage instead of forcing through it.',
        durationMs: 5_700,
      },
      {
        id: 'tutorial-06-b',
        speakerId: 'vaggie',
        copy: 'Landing safely matters more than looking impressive.',
        durationMs: 4_400,
      },
    ],
    objective: {
      id: 'objective-tutorial-06',
      label: 'Clear the route',
      instruction: 'Jump over the marked luggage and land inside the safe zone.',
      completionKind: 'jump_over_marker',
    },
    tutorial: {
      mechanic: 'jump',
      prompt: 'Jump while moving. The landing zone flashes when your path is safe.',
      controls: ['Space', 'KeyZ', 'KeyW', 'ArrowUp'],
      successCondition: 'The player crosses the obstacle and lands without taking pressure damage.',
    },
    completionFlag: 'hotel-prologue:tutorial-06',
  }),
  defineScene({
    id: 'tutorial-07-niffty-supplies',
    chapterId: 'learn-the-house',
    order: 6,
    title: 'Niffty’s Missing Tags',
    kind: 'guided_gameplay',
    estimatedDurationMs: 64_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'gameplay',
    focusCharacterIds: ['niffty'],
    screens: [
      {
        id: 'tutorial-07-a',
        speakerId: 'niffty',
        copy: 'Someone scattered my supply tags! Find all three before a tiny mess becomes a giant one.',
        durationMs: 5_700,
      },
      {
        id: 'tutorial-07-b',
        speakerId: 'niffty',
        copy: 'One is above the floor. A proper search uses the whole room!',
        durationMs: 5_200,
      },
    ],
    objective: {
      id: 'objective-tutorial-07',
      label: 'Recover the supply tags',
      instruction: 'Collect all three operation markers, including the airborne marker.',
      completionKind: 'collect_all_markers',
    },
    tutorial: {
      mechanic: 'collect',
      prompt: 'Touch every glowing marker. The HUD counts secured markers automatically.',
      controls: ['ArrowLeft', 'ArrowRight', 'Space'],
      successCondition: 'The marker counter reaches three of three.',
    },
    completionFlag: 'hotel-prologue:tutorial-07',
  }),
  defineScene({
    id: 'tutorial-08-husk-reads-room',
    chapterId: 'learn-the-house',
    order: 7,
    title: 'Read the Room',
    kind: 'guided_dialogue',
    estimatedDurationMs: 68_000,
    backgroundPath: '/assets/hotel_bar.png',
    camera: 'conversation',
    focusCharacterIds: ['husk'],
    screens: [
      {
        id: 'tutorial-08-a',
        speakerId: 'husk',
        copy: 'A clipboard shows what happened. A room shows what is about to happen.',
        durationMs: 5_200,
      },
      {
        id: 'tutorial-08-b',
        speakerId: 'husk',
        copy: 'Check the blocked exit, the empty water glass, and the chair facing the door.',
        durationMs: 5_700,
      },
      {
        id: 'tutorial-08-c',
        speakerId: 'husk',
        copy: 'Notice first. Intervene second.',
        durationMs: 3_900,
      },
    ],
    objective: {
      id: 'objective-tutorial-08',
      label: 'Inspect the bar',
      instruction: 'Visit the three highlighted pressure points and inspect each one.',
      completionKind: 'inspect_all_points',
    },
    tutorial: {
      mechanic: 'inspect',
      prompt: 'Approach a highlighted point and inspect it without starting an intervention.',
      controls: ['KeyE', 'KeyF'],
      successCondition: 'All three environmental observations appear in the objective strip.',
    },
    completionFlag: 'hotel-prologue:tutorial-08',
  }),
  defineScene({
    id: 'arrival-09-knock-at-door',
    chapterId: 'first-knock',
    order: 8,
    title: 'The First Knock',
    kind: 'guided_gameplay',
    estimatedDurationMs: 58_000,
    backgroundPath: '/assets/hotel_exterior.png',
    camera: 'gameplay',
    focusCharacterIds: ['vaggie', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'arrival-09-a',
        speakerId: 'vaggie',
        copy: 'Unknown sinner on the steps. We check the perimeter before anyone opens the door.',
        durationMs: 5_800,
      },
      {
        id: 'arrival-09-b',
        speakerId: 'sim_applicant_marlow',
        copy: 'I saw the sign. I am not promising anything. I just need somewhere quiet.',
        durationMs: 5_600,
      },
    ],
    objective: {
      id: 'objective-arrival-09',
      label: 'Reach the front steps',
      instruction: 'Dash to Vaggie’s checkpoint while keeping a safe distance from the applicant.',
      completionKind: 'reach_target_with_dash',
    },
    tutorial: {
      mechanic: 'dash',
      prompt: 'Hold dash while moving. Release it before stamina empties.',
      controls: ['ShiftLeft', 'ShiftRight'],
      successCondition: 'Reach Vaggie’s checkpoint after using dash once.',
    },
    completionFlag: 'hotel-prologue:arrival-09',
  }),
  defineScene({
    id: 'arrival-10-safe-approach',
    chapterId: 'first-knock',
    order: 9,
    title: 'A Safe Approach',
    kind: 'guided_gameplay',
    estimatedDurationMs: 72_000,
    backgroundPath: '/assets/hotel_exterior.png',
    camera: 'gameplay',
    focusCharacterIds: ['vaggie', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'arrival-10-a',
        speakerId: 'vaggie',
        copy: 'No weapons raised unless there is an actual threat. Take the clear route and avoid the city pressure.',
        durationMs: 6_300,
      },
      {
        id: 'arrival-10-b',
        speakerId: 'vaggie',
        copy: 'Do not crowd him. Leave the path back to the street visible.',
        durationMs: 5_000,
      },
    ],
    objective: {
      id: 'objective-arrival-10',
      label: 'Secure the approach',
      instruction: 'Cross the pressure lane and reach the reception boundary without losing composure.',
      completionKind: 'reach_target_without_damage',
    },
    tutorial: {
      mechanic: 'avoid_pressure',
      prompt: 'Read moving pressure waves, then jump or reposition instead of colliding.',
      controls: ['ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft'],
      successCondition: 'Reach the boundary with full resolve.',
    },
    completionFlag: 'hotel-prologue:arrival-10',
  }),
  defineScene({
    id: 'arrival-11-charlie-offers-choice',
    chapterId: 'first-knock',
    order: 10,
    title: 'An Offer, Not a Verdict',
    kind: 'guided_dialogue',
    estimatedDurationMs: 76_000,
    backgroundPath: '/assets/stages/hazbin/hotel-lobby.webp',
    camera: 'conversation',
    focusCharacterIds: ['charlie', 'sim_applicant_marlow', 'vaggie'],
    screens: [
      {
        id: 'arrival-11-a',
        speakerId: 'charlie',
        copy: 'You do not owe us a promise. We can offer safety and choices, if you want them.',
        durationMs: 6_000,
      },
      {
        id: 'arrival-11-b',
        speakerId: 'sim_applicant_marlow',
        copy: 'No contract? No audience waiting for me to fail?',
        durationMs: 4_500,
      },
      {
        id: 'arrival-11-c',
        speakerId: 'charlie',
        copy: 'No forced confession. We explain the boundaries, and you decide whether to stay.',
        durationMs: 5_700,
      },
      {
        id: 'arrival-11-d',
        speakerId: 'vaggie',
        copy: 'We also confirm a safe bed before admission. Nobody gets stranded in the lobby.',
        durationMs: 5_700,
      },
    ],
    objective: {
      id: 'objective-arrival-11',
      label: 'Begin the intake',
      instruction: 'Approach the reception marker and open the consent-led intake.',
      completionKind: 'interact_at_target',
    },
    tutorial: {
      mechanic: 'interact',
      prompt: 'Interact only when the target marker is in range. Dialogue pauses movement safely.',
      controls: ['KeyE', 'KeyF'],
      successCondition: 'The player starts the intake while standing inside reception.',
    },
    completionFlag: 'hotel-prologue:arrival-11',
  }),
  defineScene({
    id: 'arrival-12-recover-intake-kit',
    chapterId: 'first-knock',
    order: 11,
    title: 'The Intake Kit',
    kind: 'guided_gameplay',
    estimatedDurationMs: 78_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'gameplay',
    focusCharacterIds: ['charlie', 'niffty', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'arrival-12-a',
        speakerId: 'niffty',
        copy: 'The intake cards escaped! House rules, room key, emergency route: three important little rectangles.',
        durationMs: 6_200,
      },
      {
        id: 'arrival-12-b',
        speakerId: 'charlie',
        copy: 'Bring them here in any order. Marlow can read them before deciding.',
        durationMs: 5_200,
      },
      {
        id: 'arrival-12-c',
        speakerId: 'sim_applicant_marlow',
        copy: 'Let me see the emergency route first.',
        durationMs: 4_100,
      },
    ],
    objective: {
      id: 'objective-arrival-12',
      label: 'Recover the intake kit',
      instruction: 'Collect all three intake records, then return to reception.',
      completionKind: 'collect_all_markers',
    },
    tutorial: {
      mechanic: 'collect',
      prompt: 'Plan a route through all markers. The applicant remains safe at reception.',
      controls: ['ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft'],
      successCondition: 'All records are collected and the player returns to reception.',
    },
    completionFlag: 'hotel-prologue:arrival-12',
  }),
  defineScene({
    id: 'intake-13-walk-the-route',
    chapterId: 'place-chosen',
    order: 12,
    title: 'Walk the Route',
    kind: 'guided_gameplay',
    estimatedDurationMs: 74_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'gameplay',
    focusCharacterIds: ['niffty', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'intake-13-a',
        speakerId: 'niffty',
        copy: 'I cleared the quiet route upstairs! Stay close enough to see the markers, not close enough to crowd.',
        durationMs: 6_500,
      },
      {
        id: 'intake-13-b',
        speakerId: 'sim_applicant_marlow',
        copy: 'Show me the exits as we go. Then I will look at the room.',
        durationMs: 5_100,
      },
    ],
    objective: {
      id: 'objective-intake-13',
      label: 'Escort without crowding',
      instruction: 'Follow Marlow through the marked route while staying inside the support band.',
      completionKind: 'stay_near_partner',
    },
    tutorial: {
      mechanic: 'follow',
      prompt: 'Match your partner’s pace. The support band shows a respectful following distance.',
      controls: ['ArrowLeft', 'ArrowRight'],
      successCondition: 'Complete the route without leaving the support band for more than two seconds.',
    },
    completionFlag: 'hotel-prologue:intake-13',
  }),
  defineScene({
    id: 'intake-14-husk-makes-space',
    chapterId: 'place-chosen',
    order: 13,
    title: 'Make Space',
    kind: 'guided_dialogue',
    estimatedDurationMs: 82_000,
    backgroundPath: '/assets/hotel_bar.png',
    camera: 'conversation',
    focusCharacterIds: ['husk', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'intake-14-a',
        speakerId: 'husk',
        copy: 'Give him an exit and a little silence. If he stays, it should be his call.',
        durationMs: 6_000,
      },
      {
        id: 'intake-14-b',
        speakerId: 'sim_applicant_marlow',
        copy: 'Quiet is good. Questions can wait until I can think.',
        durationMs: 4_800,
      },
      {
        id: 'intake-14-c',
        speakerId: 'husk',
        copy: 'Keep the pressure indicator centered. Do not chase every swing.',
        durationMs: 5_100,
      },
    ],
    objective: {
      id: 'objective-intake-14',
      label: 'Stabilize the intake',
      instruction: 'Keep the conversation inside the safe pressure window until the timer fills.',
      completionKind: 'hold_stability_window',
    },
    tutorial: {
      mechanic: 'stabilize',
      prompt: 'Use small left and right adjustments to follow the moving stability target.',
      controls: ['ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyA', 'KeyD'],
      successCondition: 'Hold the safe window long enough to complete the conversation.',
    },
    completionFlag: 'hotel-prologue:intake-14',
  }),
  defineScene({
    id: 'intake-15-room-chosen',
    chapterId: 'place-chosen',
    order: 14,
    title: 'A Safe Bed',
    kind: 'guided_gameplay',
    estimatedDurationMs: 86_000,
    backgroundPath: '/assets/hotel_lobby.png',
    camera: 'gameplay',
    focusCharacterIds: ['vaggie', 'niffty', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'intake-15-a',
        speakerId: 'vaggie',
        copy: 'Check the lock, clear the route, and verify the bed before we record an admission.',
        durationMs: 5_900,
      },
      {
        id: 'intake-15-b',
        speakerId: 'niffty',
        copy: 'Clean sheets, no loose nails, no surprise pests. My favorite kind of checklist!',
        durationMs: 5_400,
      },
      {
        id: 'intake-15-c',
        speakerId: 'sim_applicant_marlow',
        copy: 'The room works. I want to stay tonight.',
        durationMs: 4_500,
      },
    ],
    objective: {
      id: 'objective-intake-15',
      label: 'Prepare the chosen room',
      instruction: 'Inspect the route, lock, and bed, then confirm that a safe place remains available.',
      completionKind: 'prepare_safe_bed',
    },
    tutorial: {
      mechanic: 'prepare_room',
      prompt: 'Complete every room checkpoint before returning the key to Marlow.',
      controls: ['ArrowLeft', 'ArrowRight', 'KeyE', 'KeyF'],
      successCondition: 'All safety checkpoints pass and Marlow chooses to accept the room.',
    },
    completionFlag: 'hotel-prologue:intake-15',
  }),
  defineScene({
    id: 'finale-16-first-shift',
    chapterId: 'place-chosen',
    order: 15,
    title: 'The First Real Shift',
    kind: 'mission',
    estimatedDurationMs: 110_000,
    backgroundPath: '/assets/stages/hazbin/hotel-lobby.webp',
    camera: 'gameplay',
    focusCharacterIds: ['charlie', 'vaggie', 'husk', 'niffty', 'sim_applicant_marlow'],
    screens: [
      {
        id: 'finale-16-a',
        speakerId: 'charlie',
        copy: 'Marlow chose to stay. That makes him a resident, not a result. Support starts now.',
        durationMs: 6_200,
      },
      {
        id: 'finale-16-b',
        speakerId: 'vaggie',
        copy: 'The objective strip now shows one urgent hotel operation at a time.',
        durationMs: 5_000,
      },
      {
        id: 'finale-16-c',
        speakerId: 'husk',
        copy: 'Read the room before you rush the target.',
        durationMs: 4_500,
      },
      {
        id: 'finale-16-d',
        speakerId: 'niffty',
        copy: 'Collect the markers, finish the intervention, and leave the lobby better than you found it!',
        durationMs: 5_800,
      },
      {
        id: 'finale-16-e',
        speakerId: 'charlie',
        copy: 'You know the team, the controls, and why the door stays open. Take the first shift.',
        durationMs: 6_000,
      },
    ],
    objective: {
      id: 'objective-finale-16',
      label: 'Complete the opening shift',
      instruction: 'Secure the operation markers and stabilize reception using every learned mechanic.',
      completionKind: 'complete_guided_shift',
    },
    tutorial: {
      mechanic: 'mission_loop',
      prompt: 'Follow the HUD: objective, markers, target, intervention, then persistent consequence.',
      controls: ['ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'KeyE', 'KeyF'],
      successCondition: 'The guided operation reaches success and unlocks the live campaign.',
    },
    completionFlag: 'hotel-prologue:finale-16',
  }),
] as const;

export const HOTEL_PROLOGUE: HotelPrologueDefinition = {
  id: 'hotel-first-arrival',
  version: 1,
  continuity: 'simulation_au',
  candidateId: 'sim_applicant_marlow',
  disclaimer:
    'Simulation AU onboarding sequence. Canon hotel staff retain their established roles; Marlow Glass and all playable consequences are non-canon. Completion records a consent-led hotel admission and support plan, never a celestial judgment or change to a soul.',
  chapters: HOTEL_PROLOGUE_CHAPTERS,
  scenes: HOTEL_PROLOGUE_SCENES,
  completionFlag: 'hotel-prologue:complete',
  firstMissionUnlockFlag: 'hotel-shift:campaign-unlocked',
};

export function getHotelPrologueScene(
  sceneId: string,
): HotelPrologueScene | undefined {
  return HOTEL_PROLOGUE_SCENES.find(scene => scene.id === sceneId);
}

export function getNextHotelPrologueScene(
  sceneId: string,
): HotelPrologueScene | undefined {
  const sceneIndex = HOTEL_PROLOGUE_SCENES.findIndex(scene => scene.id === sceneId);
  if (sceneIndex < 0) return undefined;
  return HOTEL_PROLOGUE_SCENES[sceneIndex + 1];
}

/**
 * Only contiguous completion counts. A malformed save containing a later flag
 * cannot skip onboarding mechanics or admit the applicant out of sequence.
 */
export function getHotelPrologueProgress(
  completedFlags: ReadonlySet<string> | readonly string[],
): HotelPrologueProgress {
  const completed = completedFlags instanceof Set
    ? completedFlags
    : new Set(completedFlags);
  let completedSceneCount = 0;
  for (const scene of HOTEL_PROLOGUE_SCENES) {
    if (!completed.has(scene.completionFlag)) break;
    completedSceneCount += 1;
  }
  const currentScene = HOTEL_PROLOGUE_SCENES[completedSceneCount] ?? null;
  const currentChapter = currentScene
    ? HOTEL_PROLOGUE_CHAPTERS.find(chapter => chapter.id === currentScene.chapterId) ?? null
    : null;
  const totalSceneCount = HOTEL_PROLOGUE_SCENES.length;
  return {
    completedSceneCount,
    totalSceneCount,
    ratio: totalSceneCount === 0 ? 1 : completedSceneCount / totalSceneCount,
    isComplete: completedSceneCount === totalSceneCount,
    currentScene,
    currentChapter,
  };
}
