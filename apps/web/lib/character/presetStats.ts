import { presets, SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import type { CharacterProps, Stats } from "@rpv/domain";
import { createDefaultStats } from "@rpv/domain";
import { getResolvedStatsForCharacter } from "./characterAdapter";

export function getPresetStatConfig(system: SystemKey): PresetStatConfig {
    const config = presets[system]?.presetData?.statConfig;

    if (!config) {
        throw new Error(`No stat config registered for system: ${system}`);
    }

    return config;
}

export type ResolvedAbilityDisplay = {
    name: string;
    label: string;
    shortLabel: string;
    statKey: PresetStatConfig["abilities"][number]["statKey"];
    base: number;
    resolved: number;
};

export type ResolvedCombatStatDisplay = {
    label: string;
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
    const resolved = getResolvedStatsForCharacter(props);
    const base = props.baseStats;

    return {
        abilities: config.abilities.map((ability) => ({
            name: ability.name,
            label: ability.label,
            shortLabel: ability.shortLabel ?? ability.label,
            statKey: ability.statKey,
            base: base[ability.statKey],
            resolved: resolved[ability.statKey],
        })),
        combat: config.combatStats.map((combat) => ({
            label: combat.label,
            statKey: combat.statKey,
            base: base[combat.statKey],
            resolved: resolved[combat.statKey],
        })),
    };
}

export type CharacterFormCombatFields = {
    hp?: number;
    maxHp?: number;
    ac?: number;
};

function readCombatStatFromForm(
    data: CharacterFormCombatFields,
    combat: PresetStatConfig["combatStats"][number]
): number | undefined {
    for (const field of combat.formFields) {
        const value = data[field];
        if (value !== undefined) {
            return value;
        }
    }

    return undefined;
}

export function buildBaseStatsFromForm(
    attributes: Array<{ name: string; value?: number }> | undefined,
    combatFields: CharacterFormCombatFields,
    system: SystemKey
): Stats {
    const config = getPresetStatConfig(system);
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
            stats[ability.statKey] = attribute.value ?? config.defaultAbilityValue;
        }
    }

    for (const ability of config.abilities) {
        if (!attributeMap.has(ability.name)) {
            stats[ability.statKey] = config.defaultAbilityValue;
        }
    }

    for (const combat of config.combatStats) {
        stats[combat.statKey] =
            readCombatStatFromForm(combatFields, combat) ?? combat.defaultValue;
    }

    return stats;
}
