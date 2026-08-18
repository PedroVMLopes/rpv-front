import { contentRepo } from "@/lib/content/contentRepository";
import type { StoredCharacter } from "./storedCharacter";

export const OVERVIEW_PERSONALITY_FIELD_KEYS = [
    "personalityTraits",
    "ideals",
    "bonds",
    "flaws",
    "goals",
] as const;

export type OverviewPersonalityFieldKey =
    (typeof OVERVIEW_PERSONALITY_FIELD_KEYS)[number];

export const BACKGROUND_STEP_IDENTITY_FIELD_NAMES = new Set([
    "name",
    "age",
    ...OVERVIEW_PERSONALITY_FIELD_KEYS,
]);

export type OverviewBackgroundDisplay = {
    name: string;
    description?: string;
};

function readTrimmedString(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

export function readSystemDataString(
    systemData: Record<string, unknown>,
    key: string
): string | null {
    return readTrimmedString(systemData[key]);
}

export function resolveOverviewBackground(
    stored: StoredCharacter
): OverviewBackgroundDisplay | null {
    const slug = stored.selections.background?.trim() || "";
    if (slug) {
        const entry = contentRepo(stored.system).getBackground(slug);
        if (entry) {
            return {
                name: entry.name,
                description: readTrimmedString(entry.description) ?? undefined,
            };
        }

        return { name: slug };
    }

    const fallback = readSystemDataString(stored.systemData, "background");
    if (!fallback) {
        return null;
    }

    const entry = contentRepo(stored.system).getBackground(fallback);
    if (entry) {
        return {
            name: entry.name,
            description: readTrimmedString(entry.description) ?? undefined,
        };
    }

    return { name: fallback };
}

export function listOverviewPersonalityFields(
    stored: StoredCharacter
): Array<{ key: OverviewPersonalityFieldKey; value: string }> {
    return OVERVIEW_PERSONALITY_FIELD_KEYS.flatMap((key) => {
        const value = readSystemDataString(stored.systemData, key);
        if (!value) {
            return [];
        }

        return [{ key, value }];
    });
}
