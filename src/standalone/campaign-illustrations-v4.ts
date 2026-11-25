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
