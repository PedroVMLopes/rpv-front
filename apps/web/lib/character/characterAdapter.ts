import {
    Character as DomainCharacter,
    CharacterGrant,
    CharacterProps,
    CharacterType,
    DEFAULT_LOCALE,
    Locale,
    Modifier,
    Stats,
    emptyInventory,
    isLocale,
    resolveStats,
} from "@rpv/domain";
import { SystemKey } from "@/presets";
import { getSubclass } from "@rpv/content";
import {
    buildBaseStatsFromForm,
    buildResourcesFromForm,
    buildSystemDataFromForm,
    flattenStoredToForm,
} from "./presetStats";
import { deriveResourceTotals } from "./deriveResourceTotals";
import { isCharacterInventory, sanitizeInventory } from "./inventory";
import type { StoredCharacter, CharacterSelections, CharacterChoices } from "./storedCharacter";
import { STORED_CHARACTER_SCHEMA_VERSION } from "./storedCharacter";

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

export function coerceCatalogSlug(value: unknown): string | undefined {
    const raw = coerceOptionalString(value);
    if (!raw) {
        return undefined;
    }
    return raw.trim().toLowerCase();
}

function coerceLocale(value: unknown, fallback: Locale = DEFAULT_LOCALE): Locale {
    return isLocale(value) ? value : fallback;
}

function coerceChoices(value: unknown, existing?: CharacterChoices): CharacterChoices {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        const grantPicks =
            record.grantPicks && typeof record.grantPicks === "object"
                ? (record.grantPicks as Record<string, string>)
                : existing?.grantPicks;

        if (grantPicks !== undefined) {
            return { grantPicks };
        }

        return {};
    }

    if (existing?.grantPicks !== undefined) {
        return { grantPicks: existing.grantPicks };
    }

    return {};
}

function buildInventoryFromForm(
    formData: Record<string, unknown>,
    existing?: CharacterSelections
): CharacterSelections["inventory"] {
    if (isCharacterInventory(formData.inventory)) {
        return formData.inventory;
    }
    return existing?.inventory ?? emptyInventory();
}

function stripLegacyInventoryFormKeys(
    systemData: Record<string, unknown>
): Record<string, unknown> {
    const next = { ...systemData };
    delete next.startingItem;
    delete next.items;
    delete next.equippedItems;
    if (!isCharacterInventory(next.inventory)) {
        delete next.inventory;
    }
    return next;
}

function finalizeStoredCharacter(
    stored: StoredCharacter,
    normalizedSelections: CharacterSelections
): StoredCharacter {
    return {
        ...stored,
        schemaVersion: stored.schemaVersion ?? STORED_CHARACTER_SCHEMA_VERSION,
        language: isLocale(stored.language) ? stored.language : DEFAULT_LOCALE,
        grants: stored.grants ?? [],
        selections: normalizedSelections,
        systemData: stripLegacyInventoryFormKeys(stored.systemData ?? {}),
    };
}

export function normalizeCharacterSelections(
    selections: CharacterSelections | undefined,
    systemData: Record<string, unknown>,
    system: SystemKey
): CharacterSelections {
    const characterClass =
        selections?.characterClass ?? coerceCatalogSlug(systemData.characterClass);
    let subclass = selections?.subclass ?? coerceCatalogSlug(systemData.subclass);

    if (subclass) {
        const entry = getSubclass(subclass);
        if (!entry || !characterClass || entry.classSlug !== characterClass) {
            subclass = undefined;
        }
    }

    const inventory = sanitizeInventory(
        selections?.inventory ?? emptyInventory(),
        system
    );

    return {
        race: selections?.race ?? coerceCatalogSlug(systemData.race),
        subrace: selections?.subrace ?? coerceCatalogSlug(systemData.subrace),
        characterClass,
        subclass,
        background:
            selections?.background ?? coerceCatalogSlug(systemData.background),
        inventory,
        choices: selections?.choices ?? {},
        grantedCurrency: selections?.grantedCurrency,
    };
}

export function buildSelectionsFromForm(
    formData: Record<string, unknown>,
    existing?: CharacterSelections
): CharacterSelections {
    return {
        race: coerceCatalogSlug(formData.race),
        subrace: coerceCatalogSlug(formData.subrace),
        characterClass: coerceCatalogSlug(formData.characterClass),
        subclass: coerceCatalogSlug(formData.subclass),
        background: coerceCatalogSlug(formData.background),
        inventory: buildInventoryFromForm(formData, existing),
        choices: coerceChoices(formData.choices, existing?.choices),
    };
}

export function formDataToStoredCharacter(
    formData: Record<string, unknown>,
    id: string,
    type: CharacterType,
    system: SystemKey,
    modifiers: Modifier[] = [],
    existingSelections?: CharacterSelections,
    grants: CharacterGrant[] = [],
    resolvedSelections?: CharacterSelections
): StoredCharacter {
    const processedForm = { ...formData };

    if (
        processedForm.maxHp === undefined &&
        processedForm.hp !== undefined
    ) {
        processedForm.maxHp = processedForm.hp;
    }

    const selections =
        resolvedSelections ??
        buildSelectionsFromForm(processedForm, existingSelections);

    return {
        id,
        schemaVersion: STORED_CHARACTER_SCHEMA_VERSION,
        type,
        system,
        language: coerceLocale(formData.language),
        name: coerceString(formData.name, "Unnamed"),
        baseStats: buildBaseStatsFromForm(processedForm, system),
        modifiers,
        grants,
        selections,
        resources: {
            ...buildResourcesFromForm(processedForm, system),
            ...deriveResourceTotals(grants),
        },
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
        grants: char.grants ?? [],
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

    if (!stored.grants) {
        stored.grants = [];
    }

    if (typeof legacy.hp === "number") {
        stored.resources.hp = legacy.hp;
    }

    return stored;
}

export function normalizeStoredCharacter(char: unknown): StoredCharacter {
    let stored: StoredCharacter;

    if (isLegacyStoredCharacter(char)) {
        stored = migrateLegacyToStored(char as Record<string, unknown>);
    } else {
        const candidate = char as StoredCharacter;
        if (!candidate.resources || !candidate.systemData) {
            stored = migrateLegacyToStored(
                candidate as unknown as Record<string, unknown>
            );
        } else {
            stored = candidate;
        }
    }

    const normalizedSelections = normalizeCharacterSelections(
        stored.selections ??
            buildSelectionsFromForm(stored.systemData ?? {}),
        stored.systemData ?? {},
        stored.system
    );

    return finalizeStoredCharacter(stored, normalizedSelections);
}

export { flattenStoredToForm };
