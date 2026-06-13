import {
    Character as DomainCharacter,
    CharacterProps,
    CharacterType,
    DEFAULT_LOCALE,
    Locale,
    Modifier,
    Stats,
    isLocale,
    resolveStats,
} from "@rpv/domain";
import { SystemKey } from "@/presets";
import {
    buildBaseStatsFromForm,
    buildResourcesFromForm,
    buildSystemDataFromForm,
    flattenStoredToForm,
} from "./presetStats";
import type { StoredCharacter, CharacterSelections } from "./storedCharacter";

function coerceString(value: unknown, fallback: string): string {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }
    return fallback;
}

function coerceOptionalString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }
    return undefined;
}

function coerceLocale(value: unknown, fallback: Locale = DEFAULT_LOCALE): Locale {
    return isLocale(value) ? value : fallback;
}

export function buildSelectionsFromForm(
    formData: Record<string, unknown>,
    existing?: CharacterSelections
): CharacterSelections {
    return {
        race: coerceOptionalString(formData.race),
        subrace: coerceOptionalString(formData.subrace),
        choices: existing?.choices ?? {},
    };
}

export function formDataToStoredCharacter(
    formData: Record<string, unknown>,
    id: string,
    type: CharacterType,
    system: SystemKey,
    modifiers: Modifier[] = [],
    existingSelections?: CharacterSelections
): StoredCharacter {
    const processedForm = { ...formData };

    if (
        processedForm.maxHp === undefined &&
        processedForm.hp !== undefined
    ) {
        processedForm.maxHp = processedForm.hp;
    }

    return {
        id,
        type,
        system,
        language: coerceLocale(formData.language),
        name: coerceString(formData.name, "Unnamed"),
        baseStats: buildBaseStatsFromForm(processedForm, system),
        modifiers,
        selections: buildSelectionsFromForm(processedForm, existingSelections),
        resources: buildResourcesFromForm(processedForm, system),
        systemData: buildSystemDataFromForm(processedForm, system),
    };
}

export function storedCharacterToProps(char: StoredCharacter): CharacterProps {
    return {
        id: char.id,
        type: char.type,
        name: char.name,
        language: char.language,
        baseStats: char.baseStats,
        modifiers: char.modifiers,
    };
}

export function formDataToCharacterProps(
    formData: Record<string, unknown>,
    id: string,
    type: CharacterType,
    system: SystemKey,
    modifiers: Modifier[] = []
): CharacterProps {
    return storedCharacterToProps(
        formDataToStoredCharacter(formData, id, type, system, modifiers)
    );
}

export function characterPropsToDomain(props: CharacterProps): DomainCharacter {
    return DomainCharacter.create(props);
}

export function getResolvedStatsForCharacter(
    props: Pick<CharacterProps, "baseStats" | "modifiers">
): Stats {
    return resolveStats(props.baseStats, props.modifiers);
}

export function isLegacyStoredCharacter(char: unknown): boolean {
    if (!char || typeof char !== "object") {
        return false;
    }

    const record = char as Record<string, unknown>;
    const hasNewShape =
        "resources" in record &&
        "systemData" in record &&
        typeof record.resources === "object" &&
        record.resources !== null;

    if (hasNewShape) {
        return false;
    }

    return (
        "hp" in record ||
        "attributes" in record ||
        ("name" in record && !("systemData" in record))
    );
}

export function migrateLegacyToStored(legacy: Record<string, unknown>): StoredCharacter {
    const id = String(legacy.id ?? crypto.randomUUID());
    const type = (legacy.type as CharacterType) ?? "player";
    const system = (legacy.system as SystemKey) ?? "dnd";
    const modifiers = (legacy.modifiers as Modifier[]) ?? [];

    const { id: _id, type: _type, system: _system, baseStats, modifiers: _mods, ...formFields } =
        legacy;

    const formData: Record<string, unknown> = {
        ...formFields,
        name: legacy.name,
        language: legacy.language,
        hp: legacy.hp,
        maxHp: legacy.maxHp,
        ac: legacy.ac,
        attributes: legacy.attributes,
    };

    const stored = formDataToStoredCharacter(formData, id, type, system, modifiers);

    if (baseStats && typeof baseStats === "object") {
        stored.baseStats = { ...stored.baseStats, ...(baseStats as Stats) };
    }

    if (typeof legacy.hp === "number") {
        stored.resources.hp = legacy.hp;
    }

    return stored;
}

export function normalizeStoredCharacter(char: unknown): StoredCharacter {
    if (isLegacyStoredCharacter(char)) {
        return migrateLegacyToStored(char as Record<string, unknown>);
    }

    const stored = char as StoredCharacter;

    if (!stored.resources || !stored.systemData) {
        return migrateLegacyToStored(stored as unknown as Record<string, unknown>);
    }

    // Backfill the language field for characters persisted before i18n support.
    if (!isLocale(stored.language)) {
        return {
            ...stored,
            language: DEFAULT_LOCALE,
            selections: stored.selections ?? { choices: {} },
        };
    }

    if (!stored.selections) {
        return {
            ...stored,
            selections: buildSelectionsFromForm(stored.systemData ?? {}),
        };
    }

    return stored;
}

export { flattenStoredToForm };
