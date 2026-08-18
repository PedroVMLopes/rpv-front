import type { Locale } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import {
    hasDarkvision,
    parseDarkvisionRangeFeet,
} from "@/lib/character/creation/raceCatalogResourceChips";
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
    stored: StoredCharacter,
    locale?: Locale
): OverviewBackgroundDisplay | null {
    const slug = stored.selections.background?.trim() || "";
    if (slug) {
        const entry = contentRepo(stored.system).getBackground(slug, locale);
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

    const entry = contentRepo(stored.system).getBackground(fallback, locale);
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
    return listPersonaPersonalityFields(stored).flatMap((field) => {
        if (!field.value) {
            return [];
        }

        return [{ key: field.key, value: field.value }];
    });
}

export function listPersonaPersonalityFields(
    stored: StoredCharacter
): Array<{ key: OverviewPersonalityFieldKey; value: string | null }> {
    return OVERVIEW_PERSONALITY_FIELD_KEYS.map((key) => ({
        key,
        value: readSystemDataString(stored.systemData, key),
    }));
}

export type OverviewOriginFact =
    | { key: "background"; value: string }
    | { key: "size"; value: string }
    | { key: "darkvision"; rangeFeet: number | null }
    | { key: "hitDie"; die: number };

export function listOverviewOriginFacts(
    stored: StoredCharacter,
    locale?: Locale
): OverviewOriginFact[] {
    const facts: OverviewOriginFact[] = [];
    const background = resolveOverviewBackground(stored, locale);
    if (background) {
        facts.push({ key: "background", value: background.name });
    }

    const raceSlug = stored.selections.race?.trim();
    const race = raceSlug
        ? contentRepo(stored.system).getRace(raceSlug, locale)
        : undefined;

    const size = race?.size?.trim();
    if (size) {
        facts.push({ key: "size", value: size });
    }

    const visionDesc = race?.visionDesc;
    if (hasDarkvision(visionDesc)) {
        facts.push({
            key: "darkvision",
            rangeFeet: parseDarkvisionRangeFeet(visionDesc) ?? null,
        });
    }

    const classSlug = stored.selections.characterClass?.trim();
    const hitDie = classSlug
        ? contentRepo(stored.system).getClass(classSlug, locale)?.hitDie
        : undefined;
    if (hitDie !== undefined && hitDie > 0) {
        facts.push({ key: "hitDie", die: hitDie });
    }

    return facts;
}
