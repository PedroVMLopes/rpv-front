import type { CharacterSession } from "./storedCharacter";

export const INSPIRATION_REF = "inspiration";

const META_POINT_MAX: Record<string, number> = {
    [INSPIRATION_REF]: 1,
};

function metaPointMax(ref: string): number | undefined {
    return META_POINT_MAX[ref];
}

function sanitizeMetaPointValue(ref: string, value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }

    const amount = Math.floor(value);
    if (amount <= 0) {
        return undefined;
    }

    const max = metaPointMax(ref);
    if (max !== undefined) {
        return Math.min(max, amount);
    }

    return amount;
}

export function sanitizeMetaPoints(
    value: unknown
): Record<string, number> | undefined {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const next: Record<string, number> = {};

    for (const [ref, raw] of Object.entries(value as Record<string, unknown>)) {
        const trimmed = ref.trim();
        if (!trimmed) {
            continue;
        }

        const amount = sanitizeMetaPointValue(trimmed, raw);
        if (amount !== undefined) {
            next[trimmed] = amount;
        }
    }

    return Object.keys(next).length > 0 ? next : undefined;
}

export function getMetaPoint(
    session: CharacterSession | undefined,
    ref: string
): number {
    return session?.metaPoints?.[ref] ?? 0;
}

export function mergeMetaPointPatch(
    current: Record<string, number> | undefined,
    patch: Record<string, number>
): Record<string, number> | undefined {
    const next = { ...current };

    for (const [ref, raw] of Object.entries(patch)) {
        const trimmed = ref.trim();
        if (!trimmed) {
            continue;
        }

        const amount = sanitizeMetaPointValue(trimmed, raw);
        if (amount === undefined) {
            delete next[trimmed];
        } else {
            next[trimmed] = amount;
        }
    }

    return Object.keys(next).length > 0 ? next : undefined;
}
