import type { PresetStatConfig } from "../types";

export const DND_DEFAULT_ABILITY_VALUE = 10;

export const dndStatConfig: PresetStatConfig = {
    defaultAbilityValue: DND_DEFAULT_ABILITY_VALUE,
    abilities: [
        { name: "strength", label: "Strength", statKey: "strength", shortLabel: "STR" },
        { name: "dexterity", label: "Dexterity", statKey: "dexterity", shortLabel: "DEX" },
        { name: "constitution", label: "Constitution", statKey: "constitution", shortLabel: "CON" },
        { name: "intelligence", label: "Intelligence", statKey: "intelligence", shortLabel: "INT" },
        { name: "wisdom", label: "Wisdom", statKey: "wisdom", shortLabel: "WIS" },
        { name: "charisma", label: "Charisma", statKey: "charisma", shortLabel: "CHA" },
    ],
    combatStats: [
        {
            formFields: ["maxHp", "hp"],
            statKey: "hitPoints",
            label: "Max HP",
            defaultValue: 0,
        },
        {
            formFields: ["ac"],
            statKey: "armorClass",
            label: "AC",
            defaultValue: 10,
        },
    ],
    resources: [
        {
            name: "hp",
            label: "HP",
            formField: "hp",
            maxStatKey: "hitPoints",
            defaultValue: 0,
        },
    ],
};

export const dndAbilityAttributeNames = dndStatConfig.abilities.map(
    (ability) => ability.name
) as [string, ...string[]];

export const dndAbilityFieldAttributes = dndStatConfig.abilities.map(({ name, label }) => ({
    name,
    label,
}));

export const dndDefaultAttributes = dndStatConfig.abilities.map((ability) => ({
    name: ability.name,
    value: DND_DEFAULT_ABILITY_VALUE,
}));
