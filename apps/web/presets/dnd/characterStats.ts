import type { PresetStatConfig } from "../types";

export const DND_DEFAULT_ABILITY_VALUE = 10;

export const dndStatConfig: PresetStatConfig = {
    defaultAbilityValue: DND_DEFAULT_ABILITY_VALUE,
    abilities: [
        { name: "strength", labelKey: "abilities.strength", statKey: "strength", shortLabelKey: "abilitiesShort.strength" },
        { name: "dexterity", labelKey: "abilities.dexterity", statKey: "dexterity", shortLabelKey: "abilitiesShort.dexterity" },
        { name: "constitution", labelKey: "abilities.constitution", statKey: "constitution", shortLabelKey: "abilitiesShort.constitution" },
        { name: "intelligence", labelKey: "abilities.intelligence", statKey: "intelligence", shortLabelKey: "abilitiesShort.intelligence" },
        { name: "wisdom", labelKey: "abilities.wisdom", statKey: "wisdom", shortLabelKey: "abilitiesShort.wisdom" },
        { name: "charisma", labelKey: "abilities.charisma", statKey: "charisma", shortLabelKey: "abilitiesShort.charisma" },
    ],
    combatStats: [
        {
            formFields: ["maxHp", "hp"],
            statKey: "hitPoints",
            labelKey: "combat.maxHp",
            defaultValue: 0,
        },
        {
            formFields: ["ac"],
            statKey: "armorClass",
            labelKey: "combat.ac",
            defaultValue: 10,
        },
    ],
    resources: [
        {
            name: "hp",
            labelKey: "combat.hp",
            formField: "hp",
            maxStatKey: "hitPoints",
            defaultValue: 0,
        },
    ],
};

export const dndAbilityAttributeNames = dndStatConfig.abilities.map(
    (ability) => ability.name
) as [string, ...string[]];

export const dndAbilityFieldAttributes = dndStatConfig.abilities.map(({ name, labelKey }) => ({
    name,
    labelKey,
}));

export const dndDefaultAttributes = dndStatConfig.abilities.map((ability) => ({
    name: ability.name,
    value: DND_DEFAULT_ABILITY_VALUE,
}));
