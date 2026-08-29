import type {
    CharacterConcentration,
    CharacterSession,
} from "./storedCharacter";

function sanitizeSlotLevel(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }

    const level = Math.floor(value);
    if (level < 1 || level > 9) {
        return undefined;
    }

    return level;
}

function sanitizeConcentration(
    value: unknown
): CharacterConcentration | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const slug =
        typeof (value as CharacterConcentration).slug === "string"
            ? (value as CharacterConcentration).slug.trim()
            : "";

    if (!slug) {
        return undefined;
    }

    const slotLevel = sanitizeSlotLevel(
        (value as CharacterConcentration).slotLevel
    );

    return slotLevel === undefined ? { slug } : { slug, slotLevel };
}

function sanitizeConditionSlugs(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const slugs = [
        ...new Set(
            value
                .filter((entry): entry is string => typeof entry === "string")
                .map((entry) => entry.trim())
                .filter(Boolean)
        ),
    ];

    return slugs.length > 0 ? slugs : undefined;
}

export function sanitizeCharacterSession(
    session: CharacterSession | undefined
): CharacterSession | undefined {
    if (!session) {
        return undefined;
    }

    const concentratingOn = sanitizeConcentration(session.concentratingOn);
    const activeConditions = sanitizeConditionSlugs(session.activeConditions);

    if (!concentratingOn && !activeConditions) {
        return undefined;
    }

    return {
        ...(concentratingOn ? { concentratingOn } : {}),
        ...(activeConditions ? { activeConditions } : {}),
    };
}

export function mergeCharacterSession(
    current: CharacterSession | undefined,
    patch: CharacterSession
): CharacterSession | undefined {
    const next: CharacterSession = { ...current };

    if ("concentratingOn" in patch) {
        if (patch.concentratingOn === null || patch.concentratingOn === undefined) {
            delete next.concentratingOn;
        } else {
            next.concentratingOn = patch.concentratingOn;
        }
    }

    if ("activeConditions" in patch) {
        next.activeConditions = patch.activeConditions;
    }

    return sanitizeCharacterSession(next);
}
