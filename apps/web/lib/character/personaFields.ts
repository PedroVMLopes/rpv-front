export const PERSONA_PRESENCE_FIELD_KEYS = [
    "age",
    "build",
    "voice",
    "marks",
    "attire",
] as const;

export type PersonaPresenceFieldKey =
    (typeof PERSONA_PRESENCE_FIELD_KEYS)[number];

export const PERSONA_PRESENCE_PROSE_FIELD_KEYS = [
    "build",
    "voice",
    "marks",
    "attire",
] as const;

export type PersonaPresenceProseFieldKey =
    (typeof PERSONA_PRESENCE_PROSE_FIELD_KEYS)[number];

export const PERSONA_DISPOSITION_AXIS_KEYS = [
    "solitarySociable",
    "improviserPlanner",
    "brusqueDelicate",
    "unadornedOpulent",
    "seriousEasygoing",
] as const;

export type PersonaDispositionAxisKey =
    (typeof PERSONA_DISPOSITION_AXIS_KEYS)[number];

export const PERSONA_EMPTY_DISPLAY = "—";

export const PERSONA_SLIDER_MIN = 1;
export const PERSONA_SLIDER_MAX = 20;
export const PERSONA_SLIDER_STEP = 1;

/** Visual midpoint in creation until the player first moves that axis. Not persisted. */
export const PERSONA_DISPOSITION_UNSET_DISPLAY = 10;

export const DISPOSITION_FORM_KEY = "disposition";

export type DispositionMap = Partial<
    Record<PersonaDispositionAxisKey, number>
>;

export function isDispositionAxisValue(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= PERSONA_SLIDER_MIN &&
        value <= PERSONA_SLIDER_MAX
    );
}

export function parseDisposition(value: unknown): DispositionMap {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    const record = value as Record<string, unknown>;
    const parsed: DispositionMap = {};

    for (const key of PERSONA_DISPOSITION_AXIS_KEYS) {
        const axisValue = record[key];
        if (isDispositionAxisValue(axisValue)) {
            parsed[key] = axisValue;
        }
    }

    return parsed;
}

export function readDispositionAxis(
    systemData: Record<string, unknown> | undefined,
    key: PersonaDispositionAxisKey
): number | null {
    const parsed = parseDisposition(systemData?.[DISPOSITION_FORM_KEY]);
    return parsed[key] ?? null;
}
