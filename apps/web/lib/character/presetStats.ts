import { presets, SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import type { CharacterProps, Stats } from "@rpv/domain";
import { createDefaultStats, resolveStats } from "@rpv/domain";
import type { StoredCharacter } from "./storedCharacter";

function resolveCharacterStats(
    props: Pick<CharacterProps, "baseStats" | "modifiers">
): Stats {
    return resolveStats(props.baseStats, props.modifiers);
}

export function getPresetStatConfig(system: SystemKey): PresetStatConfig {
    const config = presets[system]?.presetData?.statConfig;

    if (!config) {
        throw new Error(`No stat config registered for system: ${system}`);
    }

    return config;
}

export function getCoreFieldNames(system: SystemKey): Set<string> {
    const config = getPresetStatConfig(system);
    const names = new Set<string>(["name", "attributes", "choices"]);

    for (const combat of config.combatStats) {
        for (const field of combat.formFields) {
            names.add(field);
        }
    }

    for (const resource of config.resources) {
        if (resource.formField) {
            names.add(resource.formField);
        }
    }

    return names;
}

function coerceNumber(value: unknown, fallback: number): number {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
}

function getFormAttributes(
    formData: Record<string, unknown>
): Array<{ name: string; value?: number }> | undefined {
    const attributes = formData.attributes;
    if (!Array.isArray(attributes)) {
        return undefined;
    }

    return attributes.map((entry) => {
        if (typeof entry !== "object" || entry === null) {
            return { name: "", value: undefined };
        }
        const attr = entry as { name?: string; value?: unknown };
        return {
            name: String(attr.name ?? ""),
            value:
                attr.value === undefined || attr.value === ""
                    ? undefined
                    : coerceNumber(attr.value, 0),
        };
    });
}

function readCombatStatFromForm(
    formData: Record<string, unknown>,
    combat: PresetStatConfig["combatStats"][number]
): number | undefined {
    for (const field of combat.formFields) {
        const value = formData[field];
        if (value !== undefined && value !== "") {
            return coerceNumber(value, combat.defaultValue);
        }
    }

    return undefined;
}

export function buildBaseStatsFromForm(
    formData: Record<string, unknown>,
    system: SystemKey
): Stats {
    const config = getPresetStatConfig(system);
    const attributes = getFormAttributes(formData);
    const stats = createDefaultStats();
    const attributeMap = new Map(
        (attributes ?? []).map((attribute) => [attribute.name, attribute.value])
    );
    const knownAbilityNames = new Set(config.abilities.map((ability) => ability.name));

    for (const attribute of attributes ?? []) {
        if (!knownAbilityNames.has(attribute.name)) {
            continue;
        }

        const ability = config.abilities.find((entry) => entry.name === attribute.name);
        if (ability) {
            stats[ability.statKey] =
                attribute.value ?? config.defaultAbilityValue;
        }
    }

    for (const ability of config.abilities) {
        if (!attributeMap.has(ability.name)) {
            stats[ability.statKey] = config.defaultAbilityValue;
        }
    }

    for (const combat of config.combatStats) {
        stats[combat.statKey] =
            readCombatStatFromForm(formData, combat) ?? combat.defaultValue;
    }

    return stats;
}

export function buildResourcesFromForm(
    formData: Record<string, unknown>,
    system: SystemKey
): Record<string, number> {
    const config = getPresetStatConfig(system);
    const resources: Record<string, number> = {};

    for (const resource of config.resources) {
        const raw =
            resource.formField !== undefined
                ? formData[resource.formField]
                : undefined;
        resources[resource.name] =
            raw !== undefined && raw !== ""
                ? coerceNumber(raw, resource.defaultValue)
                : resource.defaultValue;
    }

    return resources;
}

export function buildSystemDataFromForm(
    formData: Record<string, unknown>,
    system: SystemKey
): Record<string, unknown> {
    const coreFields = getCoreFieldNames(system);
    const systemData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (!coreFields.has(key)) {
            systemData[key] = value;
        }
    }

    return systemData;
}

export function flattenStoredToForm(
    stored: StoredCharacter,
    system: SystemKey
): Record<string, unknown> {
    const config = getPresetStatConfig(system);
    const form: Record<string, unknown> = {
        ...stored.systemData,
        name: stored.name,
        race: stored.selections?.race ?? stored.systemData.race,
        subrace: stored.selections?.subrace ?? stored.systemData.subrace,
        choices: stored.selections?.choices ?? {},
        attributes: config.abilities.map((ability) => ({
            name: ability.name,
            value: stored.baseStats[ability.statKey],
        })),
    };

    for (const combat of config.combatStats) {
        const primaryField = combat.formFields[0];
        if (primaryField) {
            form[primaryField] = stored.baseStats[combat.statKey];
        }
    }

    for (const resource of config.resources) {
        if (resource.formField) {
            form[resource.formField] = stored.resources[resource.name];
        }
    }

    return form;
}

export type ResolvedAbilityDisplay = {
    name: string;
    labelKey?: string;
    shortLabelKey?: string;
    label?: string;
    shortLabel?: string;
    statKey: PresetStatConfig["abilities"][number]["statKey"];
    base: number;
    resolved: number;
};

export type ResolvedCombatStatDisplay = {
    labelKey?: string;
    label?: string;
    statKey: PresetStatConfig["combatStats"][number]["statKey"];
    base: number;
    resolved: number;
};

export function getResolvedStatDisplay(
    props: Pick<CharacterProps, "baseStats" | "modifiers">,
    system: SystemKey
): {
    abilities: ResolvedAbilityDisplay[];
    combat: ResolvedCombatStatDisplay[];
} {
    const config = getPresetStatConfig(system);
    const resolved = resolveCharacterStats(props);
    const base = props.baseStats;

    return {
        abilities: config.abilities.map((ability) => ({
            name: ability.name,
            labelKey: ability.labelKey,
            shortLabelKey: ability.shortLabelKey ?? ability.labelKey,
            label: ability.label,
            shortLabel: ability.shortLabel ?? ability.label,
            statKey: ability.statKey,
            base: base[ability.statKey],
            resolved: resolved[ability.statKey],
        })),
        combat: config.combatStats.map((combat) => ({
            labelKey: combat.labelKey,
            label: combat.label,
            statKey: combat.statKey,
            base: base[combat.statKey],
            resolved: resolved[combat.statKey],
        })),
    };
}

export function getResourceMax(
    stored: StoredCharacter,
    resourceName: string
): number | undefined {
    const config = getPresetStatConfig(stored.system);
    const resource = config.resources.find((r) => r.name === resourceName);
    if (!resource?.maxStatKey) {
        return undefined;
    }

    const resolved = resolveCharacterStats({
        baseStats: stored.baseStats,
        modifiers: stored.modifiers,
    });

    return resolved[resource.maxStatKey];
}
