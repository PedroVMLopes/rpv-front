import { OVERVIEW_PERSONALITY_FIELD_KEYS } from "@/lib/character/overviewIdentity";

export const PERSONA_PRESENCE_FIELD_KEYS = [
    "age",
    "build",
    "voice",
    "marks",
    "attire",
] as const;

export type PersonaPresenceFieldKey =
    (typeof PERSONA_PRESENCE_FIELD_KEYS)[number];

export const PERSONA_DISPOSITION_AXES = [
    { key: "solitaryCommunal", value: 3 },
    { key: "improviserPlanner", value: 1 },
    { key: "directIndirect", value: 3 },
    { key: "cautiousReckless", value: 1 },
    { key: "principledPragmatic", value: 3 },
    { key: "tenderHarsh", value: 1 },
] as const;

export type PersonaDispositionAxisKey =
    (typeof PERSONA_DISPOSITION_AXES)[number]["key"];

export const PERSONA_PERSONALITY_FIELD_KEYS = OVERVIEW_PERSONALITY_FIELD_KEYS;

export const PERSONA_SLIDER_MIN = 0;
export const PERSONA_SLIDER_MAX = 4;
export const PERSONA_SLIDER_STEP = 1;
