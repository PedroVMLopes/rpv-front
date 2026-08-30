import type {
    CharacterConcentration,
    CharacterDeathSaves,
    CharacterSession,
} from "./storedCharacter";
import { mergeMetaPointPatch, sanitizeMetaPoints } from "./sessionMetaPoints";

const DEATH_SAVE_MAX = 3;

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

function sanitizePipCount(value: unknown): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.min(DEATH_SAVE_MAX, Math.floor(value)));
}

export function sanitizeDeathSaves(
    value: unknown
): CharacterDeathSaves | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const successes = sanitizePipCount(
        (value as CharacterDeathSaves).successes
    );
    const failures = sanitizePipCount(
        (value as CharacterDeathSaves).failures
    );

    if (successes === 0 && failures === 0) {
        return undefined;
    }

    return { successes, failures };
}

function sanitizeTempHp(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }

    const tempHp = Math.floor(value);
    if (tempHp <= 0) {
        return undefined;
    }

    return tempHp;
}

export function sanitizeCharacterSession(
    session: CharacterSession | undefined
): CharacterSession | undefined {
    if (!session) {
        return undefined;
    }

    const concentratingOn = sanitizeConcentration(session.concentratingOn);
    const activeConditions = sanitizeConditionSlugs(session.activeConditions);
    const tempHp = sanitizeTempHp(session.tempHp);
    const deathSaves = sanitizeDeathSaves(session.deathSaves);
    const metaPoints = sanitizeMetaPoints(session.metaPoints);

    if (
        !concentratingOn &&
        !activeConditions &&
        !tempHp &&
        !deathSaves &&
        !metaPoints
    ) {
        return undefined;
    }

    return {
        ...(concentratingOn ? { concentratingOn } : {}),
        ...(activeConditions ? { activeConditions } : {}),
        ...(tempHp !== undefined ? { tempHp } : {}),
        ...(deathSaves ? { deathSaves } : {}),
        ...(metaPoints ? { metaPoints } : {}),
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

    if ("tempHp" in patch) {
        if (patch.tempHp === undefined || patch.tempHp === 0) {
            delete next.tempHp;
        } else {
            next.tempHp = patch.tempHp;
        }
    }

    if ("deathSaves" in patch) {
        if (patch.deathSaves === null || patch.deathSaves === undefined) {
            delete next.deathSaves;
        } else {
            next.deathSaves = patch.deathSaves;
        }
    }

    if ("metaPoints" in patch && patch.metaPoints) {
        const merged = mergeMetaPointPatch(next.metaPoints, patch.metaPoints);
        if (merged) {
            next.metaPoints = merged;
        } else {
            delete next.metaPoints;
        }
    }

    return sanitizeCharacterSession(next);
}
