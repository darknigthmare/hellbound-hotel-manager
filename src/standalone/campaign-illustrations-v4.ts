import type { PentagramStageId } from '../lib/pentagram-stages';
import type { NarrativeFilters, StoryBeat, StoryRouteVersion } from './campaign';
import type { GLOBAL_CAMPAIGN } from './campaign-global';

interface IllustrationArtwork {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  stageId: PentagramStageId;
  cast: readonly string[];
  spoilerTier: 'season_1' | 'season_2';
}

type GlobalSceneId = (typeof GLOBAL_CAMPAIGN)['chapters'][number]['id'] | 'intro' | 'ending';

export interface GlobalCampaignIllustration extends IllustrationArtwork {
  scope: 'global';
  campaignId: typeof GLOBAL_CAMPAIGN.id;
  campaignVersion: typeof GLOBAL_CAMPAIGN.version;
  sceneId: GlobalSceneId;
}

export interface PersonalCampaignIllustration extends IllustrationArtwork {
  scope: 'personal';
  fighterId: string;
  routeVersion: 3;
  beat: StoryBeat;
}

export type CampaignIllustration = GlobalCampaignIllustration | PersonalCampaignIllustration;
type IllustrationFilters = Pick<NarrativeFilters, 'allowSeasonTwo'>;

/**
 * Only produced, reviewed artwork belongs here. Missing scenes keep the stage
 * and portraits fallback; a filename is never inferred from a character id.
 * Legacy V1 illustrations remain exclusively in campaign-legacy.ts.
 */
// BEGIN APPROVED NARRATIVE ARTWORK
export const CAMPAIGN_ILLUSTRATIONS_V4: readonly CampaignIllustration[] = [
  {
    "id": "global:signal-libre:1:seuil-ouvert",
    "scope": "global",
    "src": "/assets/story/global/signal-libre-ch01.webp",
    "alt": "Charlie et Vaggie préparent un exercice de protection dans le hall, en laissant libre la porte de l’hôtel.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "charlie",
      "vaggie"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "seuil-ouvert"
  },
  {
    "id": "global:signal-libre:1:caisse-imp",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/02-caisse-imp.webp",
    "alt": "Moxxie montre un reçu à Blitzø devant une caisse d’exercice, dans la réception I.M.P.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_blitzo",
      "hb_moxxie"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "caisse-imp"
  },
  {
    "id": "global:signal-libre:1:prise-originale",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/03-prise-originale.webp",
    "alt": "Angel repère la sortie du studio et une copie du montage pendant que Valentino se tient près de la régie.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "angeldust",
      "valentino"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "prise-originale"
  },
  {
    "id": "global:signal-libre:1:bon-passage",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/04-bon-passage.webp",
    "alt": "Loona et Vortex discutent de part et d’autre d’un passage dégagé devant les bureaux I.M.P.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-exterior",
    "cast": [
      "hb_loona",
      "hb_vortex"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "bon-passage"
  },
  {
    "id": "global:signal-libre:1:chargement-ferme",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/05-chargement-ferme.webp",
    "alt": "Carmilla encadre l’exercice de Vaggie près d’une caisse de matériel, avec la sortie du quai dégagée.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "vaggie",
      "carmilla"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "chargement-ferme"
  },
  {
    "id": "global:signal-libre:1:seconde-copie",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/06-seconde-copie.webp",
    "alt": "Millie atteint la caisse de documents dans le repaire de Striker, qui lui barre encore le passage.",
    "width": 1672,
    "height": 941,
    "stageId": "western-lair",
    "cast": [
      "hb_millie",
      "hb_striker"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "seconde-copie"
  },
  {
    "id": "global:signal-libre:1:rappel-refuse",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/07-rappel-refuse.webp",
    "alt": "Fizzarolli refuse le rappel promotionnel de Mammon en levant une main sur la scène verte du spectacle.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_fizzarolli",
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "rappel-refuse"
  },
  {
    "id": "global:signal-libre:1:frequence-vide",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/08-frequence-vide.webp",
    "alt": "Alastor et Vox se font face dans la régie, près des copies des documents et du support à diffuser.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "alastor",
      "vox"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "frequence-vide"
  },
  {
    "id": "global:signal-libre:1:porte-sans-camera",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/09-porte-sans-camera.webp",
    "alt": "Sur le perron, Charlie garde la porte ouverte face à Velvette et à son téléphone abaissé.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "charlie",
      "velvette"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "porte-sans-camera"
  },
  {
    "id": "global:signal-libre:1:intro",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/intro.webp",
    "alt": "Charlie observe deux invitations sur le comptoir du hall, devant une porte encore ouverte.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "charlie"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "intro"
  },
  {
    "id": "global:signal-libre:1:ending",
    "scope": "global",
    "src": "/assets/story/infernal-versus/campaign/signal-libre/v1/ending.webp",
    "alt": "Charlie laisse une invitée anonyme entrer et choisir sa chaise dans le hall sans caméra.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "charlie"
    ],
    "spoilerTier": "season_2",
    "campaignId": "signal-libre",
    "campaignVersion": 1,
    "sceneId": "ending"
  },
  {
    "id": "v3:charlie:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/charlie-intro.webp",
    "alt": "La clé encore chaude — Charlie aligne une seconde tasse pour un invité absent.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "charlie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "charlie",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:charlie:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/charlie-rival.webp",
    "alt": "Deux conceptions du salut — Charlie abaisse sa main ouverte tandis qu’Adam occupe l’espace supérieur.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "charlie",
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "charlie",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:charlie:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/charlie-ending.webp",
    "alt": "La place libre — Charlie s’écarte pour laisser le passage.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "charlie",
      "vaggie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "charlie",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:angeldust:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/angeldust-intro.webp",
    "alt": "Le repas et l’appel — Un de ses bras retient sa veste tandis qu’un autre hésite au-dessus du téléphone.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "angeldust"
    ],
    "spoilerTier": "season_1",
    "fighterId": "angeldust",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:angeldust:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/angeldust-rival.webp",
    "alt": "Sortie du cadre — Angel tire le rideau de côté pour rendre la sortie visible.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "angeldust",
      "valentino"
    ],
    "spoilerTier": "season_1",
    "fighterId": "angeldust",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:angeldust:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/angeldust-ending.webp",
    "alt": "Une chaise gardée — Angel dépose le téléphone et relâche les épaules.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "angeldust",
      "husk"
    ],
    "spoilerTier": "season_1",
    "fighterId": "angeldust",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:alastor:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/alastor-intro.webp",
    "alt": "Une voix déplacée — Alastor tourne un bouton avec une précision trop calme.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "alastor"
    ],
    "spoilerTier": "season_1",
    "fighterId": "alastor",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:alastor:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/alastor-rival.webp",
    "alt": "Le cadre et la fréquence — Alastor incline le micro pendant que Vox serre le bord de son pupitre.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "alastor",
      "vox"
    ],
    "spoilerTier": "season_1",
    "fighterId": "alastor",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:alastor:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/alastor-ending.webp",
    "alt": "Le voyant restant — Un petit voyant reste visible sous une plaque déplacée.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "alastor"
    ],
    "spoilerTier": "season_1",
    "fighterId": "alastor",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:husk:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/husk-intro.webp",
    "alt": "Une table de trop — Husk déplace un verre vide pour libérer une place.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "husk"
    ],
    "spoilerTier": "season_1",
    "fighterId": "husk",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:husk:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/husk-ending.webp",
    "alt": "Le comptoir retrouve sa place — Husk referme le tiroir.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "husk",
      "angeldust"
    ],
    "spoilerTier": "season_1",
    "fighterId": "husk",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_loona:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_loona-intro.webp",
    "alt": "Le contact copié — Elle retourne un passe pendant que son téléphone vibre.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_loona"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_loona",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_loona:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_loona-rival.webp",
    "alt": "Le seuil partagé — Loona tend la main ouverte vers la chaîne, sans posture infantile.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_loona",
      "hb_blitzo"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_loona",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_loona:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_loona-ending.webp",
    "alt": "Un message choisi — Elle envoie un message puis regarde la rue.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-exterior",
    "cast": [
      "hb_loona"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_loona",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_fizzarolli:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_fizzarolli-intro.webp",
    "alt": "La promesse emballée — Il regarde un créneau vierge imprimé sur la boîte, sans texte lisible.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_fizzarolli"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_fizzarolli",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_fizzarolli:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_fizzarolli-rival.webp",
    "alt": "Hors de la boîte — Une main mécanique plie le carton tandis que le visage reste calme.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_fizzarolli",
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_fizzarolli",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_fizzarolli:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_fizzarolli-ending.webp",
    "alt": "Pas de rappel — Fizz garde la corde et tourne le dos à la salle.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_fizzarolli",
      "hb_asmodeus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_fizzarolli",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_blitzo:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_blitzo-intro.webp",
    "alt": "La seconde page — Blitzø cache d’abord le verso avec sa paume, puis regarde les silhouettes.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_blitzo",
      "hb_moxxie",
      "hb_millie",
      "hb_loona"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_blitzo",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_blitzo:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_blitzo-rival.webp",
    "alt": "Pas de partenaire — Blitzø tient son arme bas et fixe le document, tandis que Striker cherche son regard.",
    "width": 1672,
    "height": 941,
    "stageId": "western-lair",
    "cast": [
      "hb_blitzo",
      "hb_striker"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_blitzo",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_blitzo:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_blitzo-ending.webp",
    "alt": "La prochaine mission — Blitzø pose sa photo pendant que les autres continuent à travailler.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_blitzo",
      "hb_moxxie",
      "hb_millie",
      "hb_loona"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_blitzo",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:vaggie:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vaggie-intro.webp",
    "alt": "Deux voies dans le hall — Elle trace mentalement une voie d’évacuation.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "vaggie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vaggie",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:vaggie:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vaggie-rival.webp",
    "alt": "Tenir sans poursuivre — Vaggie garde le pied arrière sur le seuil plutôt que d’avancer.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "vaggie",
      "lute"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vaggie",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:vaggie:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vaggie-ending.webp",
    "alt": "Le relais — Vaggie accepte de lâcher la poignée de sa lance.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "vaggie",
      "charlie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vaggie",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:niffty:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/niffty-intro.webp",
    "alt": "Simulation AU — Niffty : Le monde à hauteur de balai. Caméra très basse au niveau du sol du bar ; un tesson paraît énorme au premier plan, Niffty au centre suit la ligne de petits débris. Seules les jambes de Husk sont visibles loin derrière le comptoir, hors foyer.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "niffty",
      "husk"
    ],
    "spoilerTier": "season_1",
    "fighterId": "niffty",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:niffty:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/niffty-rival.webp",
    "alt": "Simulation AU — Niffty : Le point aveugle. Plan large bas devant les marches de l’hôtel. Adam, incarnation masquée S1, occupe la verticale à droite ; Niffty, beaucoup plus petite, ferme calmement un angle à sa gauche. Espace vide lisible entre eux, instant avant le duel.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "niffty",
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "niffty",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:niffty:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/niffty-ending.webp",
    "alt": "Simulation AU — Niffty : Enfin un passage. Au ras du sol dans le passage dégagé du hall, Niffty se retourne vers une minuscule tache ; un petit panneau de travail uni est décalé sur le côté. Charlie et Vaggie demeurent de petites silhouettes identifiables mais hors foyer dans le fond.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "niffty",
      "charlie",
      "vaggie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "niffty",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:sirpentious:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/sirpentious-rival.webp",
    "alt": "Simulation AU — Sir Pentious : La machine entre deux mondes. Plan large de profil devant les marches de l’hôtel. Petit mécanisme de porte AU au centre ; Pentious à gauche tient son levier, Adam masqué S1 haut à droite. Un passage d’évacuation reste dégagé au fond. Instant de confrontation avant impact.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "sirpentious",
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "sirpentious",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:sirpentious:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/sirpentious-ending.webp",
    "alt": "Simulation AU — Sir Pentious : Le passage fonctionne. Plan moyen dans un couloir AU ouvert sur le hall référencé. Levier tordu au premier plan, outils posés au sol, passage ouvert derrière. Pentious repose sur sa queue enroulée à côté et examine une petite pièce utile.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "sirpentious"
    ],
    "spoilerTier": "season_1",
    "fighterId": "sirpentious",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:lucifer:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lucifer-intro.webp",
    "alt": "Simulation AU — Lucifer Morningstar : Un cadeau trop grand. Plan large légèrement comique dans le hall : grand paquet fermé au premier plan, Lucifer fier devant, Charlie près d’une petite porte au fond. Lucifer mesure l’ouverture avec son regard et comprend que son colis gêne le travail.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "lucifer",
      "charlie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lucifer",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:lucifer:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lucifer-rival.webp",
    "alt": "Simulation AU — Lucifer Morningstar : La force retenue. Contre-plongée modérée devant la façade de l’hôtel. Lucifer de profil au premier plan referme sa main et retient son geste ; Adam masqué S1 reste à distance à droite. Fenêtre et marches de l’hôtel reconnaissables, espace clair entre eux.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "lucifer",
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lucifer",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:lucifer:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lucifer-ending.webp",
    "alt": "Simulation AU — Lucifer Morningstar : À la bonne place. Plan moyen domestique : un petit meuble entre Lucifer et Charlie. Lucifer soulève un côté tandis que Charlie indique l’emplacement avec sa main libre. Hall intact dans la profondeur et lumière chaude.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "lucifer",
      "charlie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lucifer",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:cherribomb:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/cherribomb-intro.webp",
    "alt": "Simulation AU — Cherri Bomb : Deux charges, une décision. Plan poitrine sur Cherri devant un mur de l’atelier AU. Son regard se détourne du geste de lancer et suit la main de Husk vers une fenêtre au fond. Un carton opaque au premier plan masque presque complètement l’accessoire inactif et le bas de son corps ; aucune forme de charge détaillée ni mèche visible.",
    "width": 1672,
    "height": 941,
    "stageId": "pentious-workshop",
    "cast": [
      "cherribomb",
      "husk"
    ],
    "spoilerTier": "season_2",
    "fighterId": "cherribomb",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:cherribomb:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/cherribomb-rival.webp",
    "alt": "Simulation AU — Cherri Bomb : La porte comme cible. Plan moyen latéral de Cherri au premier plan, cadrée poitrine, regard dirigé vers le verrou d’une porte de sortie à gauche. Valentino se tient plus loin à droite du plateau. La console de premier plan masque la main basse et tout accessoire ; aucun lancer ou impact montré.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "cherribomb",
      "valentino"
    ],
    "spoilerTier": "season_2",
    "fighterId": "cherribomb",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:cherribomb:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/cherribomb-ending.webp",
    "alt": "Simulation AU — Cherri Bomb : La bombe restante. Plan rapproché poitrine dans le vestibule AU de la sortie ouverte du studio, éclairé par la rue. Cherri referme le rabat d’un sac opaque tenu haut devant le bas de son buste ; son accessoire inactif reste entièrement caché dans le sac. Angel, hors foyer à côté, se dirige librement vers la sortie.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "cherribomb",
      "angeldust"
    ],
    "spoilerTier": "season_2",
    "fighterId": "cherribomb",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:vox:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vox-intro.webp",
    "alt": "Simulation AU — Vox : Tout est cadré. Composition géométrique du studio, Vox centré parmi une grille de moniteurs. Chaise d’invité vide au premier plan ; Vox ajuste à la main un cadre de caméra. Les écrans portent uniquement des aplats abstraits sans chiffres ni visages nouveaux.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "vox"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vox",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:vox:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vox-rival.webp",
    "alt": "Simulation AU — Vox : Le cadre se décale. Plan large asymétrique : Vox entre deux moniteurs se penche et pointe vers la ligne de caméra ; Alastor se tient volontairement à côté de cet axe, tenant sa canne microphone. Lumière cyan autour de Vox, ombres rouges autour d’Alastor.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "vox",
      "alastor"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vox",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:vox:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/vox-ending.webp",
    "alt": "Simulation AU — Vox : Le canal muet. Plan rapproché de dos : Vox seul devant plusieurs moniteurs bleutés ; un rectangle noir au centre reste éteint. Sa main demeure suspendue devant l’écran sombre. Studio vide, composition froide et silencieuse.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "vox"
    ],
    "spoilerTier": "season_1",
    "fighterId": "vox",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:valentino:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/valentino-intro.webp",
    "alt": "Simulation AU — Valentino : Le plateau attend. Plan large frontal d’un plateau désert : fauteuil de direction vide au premier plan, postes de travail abandonnés. Valentino au fond écarte un rideau pour chercher son équipe ; vastes zones sombres.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "valentino"
    ],
    "spoilerTier": "season_1",
    "fighterId": "valentino",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:valentino:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/valentino-rival.webp",
    "alt": "Simulation AU — Valentino : La porte dans le champ. Plan moyen de profil. Valentino proche caméra tend un bras d’ordre vers le plateau ; Angel se tient près de l’issue ouverte et regarde le couloir neutre. Distance nette entre les deux, chemin de sortie non obstrué visuellement.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "valentino",
      "angeldust"
    ],
    "spoilerTier": "season_1",
    "fighterId": "valentino",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:valentino:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/valentino-ending.webp",
    "alt": "Simulation AU — Valentino : Une victoire sans équipe. Plan général éloigné : Valentino demeure seul sous un projecteur rose isolé, sièges vides autour de lui et caméra éteinte au bord du cadre. Il garde sa pose, mais personne ne filme ; sortie ouverte derrière.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "valentino"
    ],
    "spoilerTier": "season_1",
    "fighterId": "valentino",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:velvette:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/velvette-intro.webp",
    "alt": "Le cadre sous contrôle — Elle déplace un vêtement pour nettoyer la silhouette.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "velvette"
    ],
    "spoilerTier": "season_1",
    "fighterId": "velvette",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:velvette:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/velvette-rival.webp",
    "alt": "Image contre conséquence — Velvette abaisse légèrement son téléphone pour regarder directement sa rivale.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "velvette",
      "carmilla"
    ],
    "spoilerTier": "season_1",
    "fighterId": "velvette",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:velvette:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/velvette-ending.webp",
    "alt": "Le choix du montage — Elle retire l’image provocante du centre.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "velvette"
    ],
    "spoilerTier": "season_1",
    "fighterId": "velvette",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:adam:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/adam-intro.webp",
    "alt": "Son propre concert — Il ouvre les bras comme si le public était acquis.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "adam",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:adam:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/adam-rival.webp",
    "alt": "Une certitude à hauteur d’homme — Adam se penche vers l’avant tandis que Lucifer demeure stable.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "adam",
      "lucifer"
    ],
    "spoilerTier": "season_1",
    "fighterId": "adam",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:adam:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/adam-ending.webp",
    "alt": "Pas de rappel — Il garde une main levée pour un rappel qui ne vient pas.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "adam"
    ],
    "spoilerTier": "season_1",
    "fighterId": "adam",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:emily:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/emily-intro.webp",
    "alt": "Une chaise retirée — Elle corrige la disposition avant l’audience.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "emily"
    ],
    "spoilerTier": "season_2",
    "fighterId": "emily",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:emily:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/emily-rival.webp",
    "alt": "La page entre elles — Emily garde une main près de la page sans la saisir.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "emily",
      "sera"
    ],
    "spoilerTier": "season_2",
    "fighterId": "emily",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:emily:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/emily-ending.webp",
    "alt": "La place conservée — Elle attend sans fermer le dossier.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "emily"
    ],
    "spoilerTier": "season_2",
    "fighterId": "emily",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:sera:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/sera-intro.webp",
    "alt": "Un siège trop haut — Elle observe deux hauteurs qui séparent les interlocuteurs.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "sera"
    ],
    "spoilerTier": "season_2",
    "fighterId": "sera",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:sera:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/sera-rival.webp",
    "alt": "La limite commune — Sera montre la porte latérale de rangement.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "sera",
      "lute"
    ],
    "spoilerTier": "season_2",
    "fighterId": "sera",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:sera:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/sera-ending.webp",
    "alt": "Descendre d’un degré — Elle rapproche une chaise des autres.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-court",
    "cast": [
      "sera"
    ],
    "spoilerTier": "season_2",
    "fighterId": "sera",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:lute:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lute-intro.webp",
    "alt": "L’itinéraire droit — Elle pointe une route simple avec son arme.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "lute"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lute",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:lute:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lute-rival.webp",
    "alt": "Quitter la ligne — Lute avance vers la rivale plutôt que vers sa destination.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "lute",
      "vaggie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lute",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:lute:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/lute-ending.webp",
    "alt": "Le poste vide — Elle aperçoit le poste qu’elle a laissé.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "lute"
    ],
    "spoilerTier": "season_1",
    "fighterId": "lute",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:carmilla:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/carmilla-intro.webp",
    "alt": "La commande arrêtée — Sa main s’arrête au-dessus du sceau de sortie.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "carmilla"
    ],
    "spoilerTier": "season_1",
    "fighterId": "carmilla",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:carmilla:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/carmilla-rival.webp",
    "alt": "Le stock reste fermé — Carmilla décale son appui pour couvrir la porte latérale.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "carmilla",
      "lute"
    ],
    "spoilerTier": "season_1",
    "fighterId": "carmilla",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:carmilla:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/carmilla-ending.webp",
    "alt": "Les personnes d’abord — Elle attend le dernier départ avant de fermer.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "carmilla"
    ],
    "spoilerTier": "season_1",
    "fighterId": "carmilla",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:rosie:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/rosie-intro.webp",
    "alt": "Un couvert de plus — Elle garde un couvert en réserve.",
    "width": 1672,
    "height": 941,
    "stageId": "cannibal-town-square",
    "cast": [
      "rosie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "rosie",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:rosie:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/rosie-rival.webp",
    "alt": "Qui raconte l’accord — Elle pose une main sur le dossier fermé sans tendre l’autre.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "rosie",
      "alastor"
    ],
    "spoilerTier": "season_1",
    "fighterId": "rosie",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:rosie:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/rosie-ending.webp",
    "alt": "La table reste à nous — Elle ajoute le couvert réservé.",
    "width": 1672,
    "height": 941,
    "stageId": "cannibal-town-square",
    "cast": [
      "rosie"
    ],
    "spoilerTier": "season_1",
    "fighterId": "rosie",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:zestial:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zestial-intro.webp",
    "alt": "Un siège qui attend — Il garde une main au-dessus d’un dossier non ouvert.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "zestial"
    ],
    "spoilerTier": "season_1",
    "fighterId": "zestial",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:zestial:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zestial-rival.webp",
    "alt": "Après le doute — Carmilla attend une réponse, Zestial baisse enfin la main.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "zestial",
      "carmilla"
    ],
    "spoilerTier": "season_1",
    "fighterId": "zestial",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:zestial:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zestial-ending.webp",
    "alt": "La parole engagée — Il fait avancer le dossier choisi.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "zestial"
    ],
    "spoilerTier": "season_1",
    "fighterId": "zestial",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:zeezi:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zeezi-intro.webp",
    "alt": "La scène qui bouche la porte — Elle mesure l’espace disponible du regard.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "zeezi"
    ],
    "spoilerTier": "season_2",
    "fighterId": "zeezi",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:zeezi:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zeezi-rival.webp",
    "alt": "L’enthousiasme et la limite — Zeezi déplace physiquement un élément de décor.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "zeezi",
      "carmilla"
    ],
    "spoilerTier": "season_2",
    "fighterId": "zeezi",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:zeezi:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/zeezi-ending.webp",
    "alt": "À hauteur du public — Elle accueille les premiers arrivants.",
    "width": 1672,
    "height": 941,
    "stageId": "carmine-industries",
    "cast": [
      "zeezi"
    ],
    "spoilerTier": "season_2",
    "fighterId": "zeezi",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:baxter:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/baxter-intro.webp",
    "alt": "Le cadran et la chaise — Il ajuste une sonde en ignorant encore la chaise.",
    "width": 1672,
    "height": 941,
    "stageId": "pentious-workshop",
    "cast": [
      "baxter"
    ],
    "spoilerTier": "season_2",
    "fighterId": "baxter",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:baxter:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/baxter-rival.webp",
    "alt": "Un arrêt accessible — Charlie garde la main ouverte à distance de l’interrupteur.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "baxter",
      "charlie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "baxter",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:baxter:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/baxter-ending.webp",
    "alt": "La mesure du refus — Il recule son carnet pour dégager la place.",
    "width": 1672,
    "height": 941,
    "stageId": "pentious-workshop",
    "cast": [
      "baxter"
    ],
    "spoilerTier": "season_2",
    "fighterId": "baxter",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:abel:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/abel-intro.webp",
    "alt": "Deux consignes — Il compare les dossiers sans en ouvrir un au hasard.",
    "width": 1672,
    "height": 941,
    "stageId": "hh-heaven-gates",
    "cast": [
      "abel"
    ],
    "spoilerTier": "season_2",
    "fighterId": "abel",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:abel:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/abel-rival.webp",
    "alt": "Garder le passage — Abel pose un pied dans le passage sans brandir une arme inventée.",
    "width": 1672,
    "height": 941,
    "stageId": "heaven-embassy",
    "cast": [
      "abel",
      "lute"
    ],
    "spoilerTier": "season_2",
    "fighterId": "abel",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:abel:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/abel-ending.webp",
    "alt": "La décision assumée — Il relève la tête vers l’interlocuteur hors champ.",
    "width": 1672,
    "height": 941,
    "stageId": "hh-heaven-gates",
    "cast": [
      "abel"
    ],
    "spoilerTier": "season_2",
    "fighterId": "abel",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hz_mimzy:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_mimzy-intro.webp",
    "alt": "Une entrée impeccable — Elle masque la pièce abîmée derrière son dos.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "hz_mimzy"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_mimzy",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hz_mimzy:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_mimzy-rival.webp",
    "alt": "Le sourire ne suffit pas — Elle cesse de présenter la scène et regarde enfin le dégât.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-exterior",
    "cast": [
      "hz_mimzy",
      "alastor"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_mimzy",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hz_mimzy:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_mimzy-ending.webp",
    "alt": "Après les applaudissements — Elle remet un élément à sa place.",
    "width": 1671,
    "height": 941,
    "stageId": "hotel-bar",
    "cast": [
      "hz_mimzy"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_mimzy",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hz_katie_killjoy:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_katie_killjoy-intro.webp",
    "alt": "Tout prépare la conclusion — Elle réoriente la chaise de l’invité vers la caméra.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "hz_katie_killjoy"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hz_katie_killjoy",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hz_katie_killjoy:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_katie_killjoy-rival.webp",
    "alt": "Le contrôle du bouton — Aucune main n’atteint encore le bouton.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "hz_katie_killjoy",
      "vox"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hz_katie_killjoy",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hz_katie_killjoy:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_katie_killjoy-ending.webp",
    "alt": "Un plan moins serré — Katie garde sa main sur le bureau sans pointer hors champ.",
    "width": 1672,
    "height": 940,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "hz_katie_killjoy",
      "hz_tom_trench"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hz_katie_killjoy",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hz_tom_trench:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_tom_trench-intro.webp",
    "alt": "Rapporter quelque chose d’entier — Il rassemble le câble pour dégager le passage.",
    "width": 1672,
    "height": 941,
    "stageId": "hotel-lobby",
    "cast": [
      "hz_tom_trench"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_tom_trench",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hz_tom_trench:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_tom_trench-rival.webp",
    "alt": "Le point final — Tom garde une main ouverte pour demander une seconde supplémentaire.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "hz_tom_trench",
      "hz_katie_killjoy"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_tom_trench",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hz_tom_trench:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hz_tom_trench-ending.webp",
    "alt": "Après la phrase — Tom retire sa main du micro après l’arrêt.",
    "width": 1672,
    "height": 941,
    "stageId": "vee-broadcast-studio",
    "cast": [
      "hz_tom_trench"
    ],
    "spoilerTier": "season_1",
    "fighterId": "hz_tom_trench",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_moxxie:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_moxxie-intro.webp",
    "alt": "L’avis plié — Moxxie aligne la feuille au lieu de la froisser.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_moxxie",
      "hb_millie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_moxxie",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_moxxie:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_moxxie-rival.webp",
    "alt": "La chaise du fils — Moxxie contourne la chaise plutôt que de s’y asseoir.",
    "width": 1672,
    "height": 941,
    "stageId": "crimson-mansion",
    "cast": [
      "hb_moxxie",
      "hb_crimson"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_moxxie",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_moxxie:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_moxxie-ending.webp",
    "alt": "Preuve conservée — Moxxie accepte la main de Millie sans abandonner sa feuille.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_moxxie",
      "hb_millie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_moxxie",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_millie:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_millie-intro.webp",
    "alt": "La marque du ranch — Elle cesse de sourire en reconnaissant la caisse.",
    "width": 1672,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_millie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_millie",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_millie:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_millie-rival.webp",
    "alt": "La clôture coupée — Elle choisit une brèche latérale plutôt que la piste balisée.",
    "width": 1672,
    "height": 941,
    "stageId": "wrath-ranch",
    "cast": [
      "hb_millie",
      "hb_striker"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_millie",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_millie:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_millie-ending.webp",
    "alt": "À table, enfin — Millie pose son arme hors de la table et accepte un plat tendu.",
    "width": 1672,
    "height": 941,
    "stageId": "wrath-ranch",
    "cast": [
      "hb_millie",
      "hb_sallie_may"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_millie",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_stolas:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stolas-intro.webp",
    "alt": "L’atlas incomplet — Il tient la reliure sans arracher les autres pages.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_stolas"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stolas",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_stolas:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stolas-rival.webp",
    "alt": "Une frontière de givre — Stolas pose le pied sur une marche sans tendre la main vers son rival.",
    "width": 1672,
    "height": 941,
    "stageId": "goetia-court",
    "cast": [
      "hb_stolas",
      "hb_andrealphus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stolas",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_stolas:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stolas-ending.webp",
    "alt": "L’invitation non envoyée — Il retire sa main de l’enveloppe.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_stolas"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stolas",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_striker:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_striker-intro.webp",
    "alt": "L’étui en exposition — Sa main efface la poussière du verre.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_striker"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_striker",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_striker:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_striker-rival.webp",
    "alt": "La caisse entre eux — Striker tend la paume vers la caisse, son autre main près de l’arme.",
    "width": 1672,
    "height": 941,
    "stageId": "western-lair",
    "cast": [
      "hb_striker",
      "hb_blitzo"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_striker",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_striker:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_striker-ending.webp",
    "alt": "Deux poches — Striker dissimule l’argent avant de partir.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_striker"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_striker",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_verosika:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_verosika-intro.webp",
    "alt": "La loge ouverte — Elle retire un pass du dossier de sa chaise.",
    "width": 1672,
    "height": 941,
    "stageId": "spring-broken-beach",
    "cast": [
      "hb_verosika"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_verosika",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_verosika:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_verosika-rival.webp",
    "alt": "Le micro au centre — Elle garde une main sur le pied du micro et lui indique la sortie.",
    "width": 1672,
    "height": 941,
    "stageId": "apology-party",
    "cast": [
      "hb_verosika",
      "hb_blitzo"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_verosika",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_verosika:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_verosika-ending.webp",
    "alt": "À son signal — Elle lance le départ d’un signe choisi.",
    "width": 1672,
    "height": 941,
    "stageId": "apology-party",
    "cast": [
      "hb_verosika",
      "hb_vortex"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_verosika",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_asmodeus:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_asmodeus-intro.webp",
    "alt": "Les mauvais billets — Il examine les billets tandis qu’une petite silhouette d’artiste attend sa réponse.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_asmodeus",
      "hb_fizzarolli"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_asmodeus",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_asmodeus:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_asmodeus-rival.webp",
    "alt": "Le guichet brisé — Ozzie tient le cadre du guichet arraché.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_asmodeus",
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_asmodeus",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_asmodeus:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_asmodeus-ending.webp",
    "alt": "Entrer par choix — Ozzie attend un signe avant d’entrer.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_asmodeus",
      "hb_fizzarolli"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_asmodeus",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_beelzebub:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_beelzebub-intro.webp",
    "alt": "Le compteur de trop — Bee soulève le cordon de la barrière pour dégager le passage.",
    "width": 1672,
    "height": 941,
    "stageId": "bee-party",
    "cast": [
      "hb_beelzebub"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_beelzebub",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_beelzebub:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_beelzebub-rival.webp",
    "alt": "Le guichet et le banquet — Elle arrête une roue dentée du décor, pas l’esprit de Mammon.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_beelzebub",
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_beelzebub",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_beelzebub:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_beelzebub-ending.webp",
    "alt": "On peut rester assis — Bee pose un verre d’eau sur une table basse.",
    "width": 1672,
    "height": 941,
    "stageId": "bee-party",
    "cast": [
      "hb_beelzebub",
      "hb_vortex"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_beelzebub",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_crimson:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_crimson-intro.webp",
    "alt": "Trop de couverts — Il redresse un verre déjà droit.",
    "width": 1672,
    "height": 941,
    "stageId": "crimson-mansion",
    "cast": [
      "hb_crimson"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_crimson",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_crimson:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_crimson-rival.webp",
    "alt": "La chaise en travers — Crimson pousse le siège dans l’axe de la porte.",
    "width": 1672,
    "height": 941,
    "stageId": "crimson-mansion",
    "cast": [
      "hb_crimson",
      "hb_moxxie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_crimson",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_crimson:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_crimson-ending.webp",
    "alt": "Le couvert intact — Crimson lève son verre face à l’absence.",
    "width": 1672,
    "height": 941,
    "stageId": "crimson-mansion",
    "cast": [
      "hb_crimson"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_crimson",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_sallie_may:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_sallie_may-intro.webp",
    "alt": "Deux billets, une chaise — Elle range un billet au lieu de l’abandonner sur le bureau.",
    "width": 1671,
    "height": 941,
    "stageId": "imp-reception",
    "cast": [
      "hb_sallie_may"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_sallie_may",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_sallie_may:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_sallie_may-rival.webp",
    "alt": "Le vieux jeu — Elles se font face avec un sourire retenu et des appuis sérieux.",
    "width": 1672,
    "height": 941,
    "stageId": "wrath-ranch",
    "cast": [
      "hb_sallie_may",
      "hb_millie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_sallie_may",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_sallie_may:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_sallie_may-ending.webp",
    "alt": "Chacune son chemin — Elles lèvent chacune une main sans courir l’une vers l’autre.",
    "width": 1672,
    "height": 941,
    "stageId": "wrath-ranch",
    "cast": [
      "hb_sallie_may",
      "hb_millie"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_sallie_may",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_andrealphus:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_andrealphus-intro.webp",
    "alt": "L’escalier parfait — Il dessine du bout des doigts une arête géométrique.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_andrealphus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_andrealphus",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_andrealphus:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_andrealphus-rival.webp",
    "alt": "Le pas qui fissure — Andrealphus serre la rampe tandis que Stolas pose un pied.",
    "width": 1672,
    "height": 941,
    "stageId": "sinsmas-balcony",
    "cast": [
      "hb_andrealphus",
      "hb_stolas"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_andrealphus",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_andrealphus:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_andrealphus-ending.webp",
    "alt": "Un palais impeccable — Il se tient parfaitement droit devant les marches intactes.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_andrealphus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_andrealphus",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_stella:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stella-intro.webp",
    "alt": "Le retour intact — Elle retire son gant en le tirant sèchement.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_stella"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stella",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_stella:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stella-rival.webp",
    "alt": "La place que l’on déplace — Elle repousse le fauteuil hors de son chemin.",
    "width": 1672,
    "height": 941,
    "stageId": "goetia-court",
    "cast": [
      "hb_stella",
      "hb_andrealphus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stella",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_stella:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_stella-ending.webp",
    "alt": "La clé gardée — Elle garde la clé dans sa paume au lieu de la tendre.",
    "width": 1672,
    "height": 941,
    "stageId": "stolas-palace",
    "cast": [
      "hb_stella"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_stella",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_mammon:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_mammon-intro.webp",
    "alt": "Le bruit sans recette — Il secoue le tiroir vide avec incrédulité.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_mammon",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_mammon:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_mammon-rival.webp",
    "alt": "Deux économies — Mammon pousse le guichet vers la scène, Ozzie en arrête le bord.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_mammon",
      "hb_asmodeus"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_mammon",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_mammon:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_mammon-ending.webp",
    "alt": "Le public mécanique — Il écoute le bruit sans regarder les sièges.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_mammon",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_vortex:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_vortex-intro.webp",
    "alt": "Le créneau en plus — Il pose les clés au lieu de les empocher.",
    "width": 1672,
    "height": 941,
    "stageId": "spring-broken-beach",
    "cast": [
      "hb_vortex"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_vortex",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_vortex:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_vortex-rival.webp",
    "alt": "Le relais à prouver — Vortex montre le chemin alternatif avec une paume ouverte.",
    "width": 1672,
    "height": 941,
    "stageId": "spring-broken-beach",
    "cast": [
      "hb_vortex",
      "hb_verosika"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_vortex",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_vortex:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_vortex-ending.webp",
    "alt": "Badge posé — Il pose son téléphone face contre table.",
    "width": 1672,
    "height": 941,
    "stageId": "bee-party",
    "cast": [
      "hb_vortex",
      "hb_beelzebub"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_vortex",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_glitz:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glitz-intro.webp",
    "alt": "Le cadre trop serré — Glitz écarte le bord du cadre pour laisser apparaître sa silhouette entière.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_glitz",
      "hb_glam"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glitz",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_glitz:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glitz-rival.webp",
    "alt": "Une entrée reconnaissable — Glitz finit sa pose sur ses propres appuis face à un bras de Fizz encore replié.",
    "width": 1672,
    "height": 941,
    "stageId": "ozzies-cabaret",
    "cast": [
      "hb_glitz",
      "hb_fizzarolli"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glitz",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_glitz:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glitz-ending.webp",
    "alt": "Deux lumières — Glitz relève la tête pendant que Glam ajuste sa propre marque.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_glitz",
      "hb_glam"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glitz",
    "routeVersion": 3,
    "beat": "ending"
  },
  {
    "id": "v3:hb_glam:intro",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glam-intro.webp",
    "alt": "Le geste interrompu — Glam tient l’arrêt malgré le rideau qui masque une partie de son espace.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_glam",
      "hb_glitz"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glam",
    "routeVersion": 3,
    "beat": "intro"
  },
  {
    "id": "v3:hb_glam:rival",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glam-rival.webp",
    "alt": "La main sur la commande — Glam garde le menton haut et une ligne corporelle claire.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_glam",
      "hb_mammon"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glam",
    "routeVersion": 3,
    "beat": "rival"
  },
  {
    "id": "v3:hb_glam:ending",
    "scope": "personal",
    "src": "/assets/story/infernal-versus/v3/hb_glam-ending.webp",
    "alt": "Après le second salut — Glam relâche enfin son geste pendant que Glitz lui adresse un regard.",
    "width": 1672,
    "height": 941,
    "stageId": "mammon-show",
    "cast": [
      "hb_glam",
      "hb_glitz"
    ],
    "spoilerTier": "season_2",
    "fighterId": "hb_glam",
    "routeVersion": 3,
    "beat": "ending"
  }
];
// END APPROVED NARRATIVE ARTWORK

function isVisible(illustration: CampaignIllustration, filters: IllustrationFilters): boolean {
  return filters.allowSeasonTwo !== false || illustration.spoilerTier !== 'season_2';
}

/** Exact identity and version are required, including for a campaign ending. */
export function globalCampaignIllustration(
  campaignId: string | undefined,
  campaignVersion: number | undefined,
  sceneId: string,
  filters: IllustrationFilters = {},
): GlobalCampaignIllustration | undefined {
  return CAMPAIGN_ILLUSTRATIONS_V4.find((illustration): illustration is GlobalCampaignIllustration =>
    illustration.scope === 'global'
    && illustration.campaignId === campaignId
    && illustration.campaignVersion === campaignVersion
    && illustration.sceneId === sceneId
    && isVisible(illustration, filters));
}

/** V3 art is independent of V1 unlocks and never reuses an old scene implicitly. */
export function personalCampaignIllustration(
  fighterId: string,
  routeVersion: StoryRouteVersion,
  beat: StoryBeat,
  filters: IllustrationFilters = {},
): PersonalCampaignIllustration | undefined {
  return CAMPAIGN_ILLUSTRATIONS_V4.find((illustration): illustration is PersonalCampaignIllustration =>
    illustration.scope === 'personal'
    && illustration.fighterId === fighterId
    && illustration.routeVersion === routeVersion
    && illustration.beat === beat
    && isVisible(illustration, filters));
}
