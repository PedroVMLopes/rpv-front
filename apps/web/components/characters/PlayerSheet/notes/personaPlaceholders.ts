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
    { key: "solitarySociable", value: 7 },
    { key: "improviserPlanner", value: 14 },
    { key: "brusqueDelicate", value: 6 },
    { key: "unadornedOpulent", value: 16 },
    { key: "seriousEasygoing", value: 11 },
] as const;

export type PersonaDispositionAxisKey =
    (typeof PERSONA_DISPOSITION_AXES)[number]["key"];

export const PERSONA_EMPTY_DISPLAY = "—";

export const PERSONA_SLIDER_MIN = 1;
export const PERSONA_SLIDER_MAX = 20;
export const PERSONA_SLIDER_STEP = 1;
