import { dndAbilityFieldAttributes } from "./characterStats";

export const dndCharacterFields = {
    common: [
        {
            name: "name",
            labelKey: "fields.name",
            type: "text",
            required: true,
            group: "general",
            order: 1,
            inlineGroup: "line1"
        },
        {
            name: "age",
            labelKey: "fields.age",
            type: "select",
            options: ["Todler", "Child", "Teenager", "Young Adult", "Adult", "Old Adult", "Old"],
            group: "general",
            order: 1,
            inlineGroup: "line3"
        },
        {
            name: "hp",
            labelKey: "fields.hp",
            type: "number",
            group: "combat",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "maxHp",
            labelKey: "fields.maxHp",
            type: "number",
            group: "combat",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "ac",
            labelKey: "fields.ac",
            type: "number",
            group: "combat",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "attributes",
            labelKey: "fields.attributes",
            type: "attributeGroup",
            group: "attributes",
            order: 1,
            attributes: dndAbilityFieldAttributes
        },
        {
            name: "goals",
            labelKey: "fields.goals",
            type: "text",
            group: "general",
            order: 2
        }
    ],
    player: [
        {
            name: "characterClass",
            labelKey: "fields.characterClass",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "subclass",
            labelKey: "fields.subclass",
            type: "select",
            options: [],
            group: "general",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "level",
            labelKey: "fields.level",
            type: "number",
            defaultValue: 1,
            group: "general",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "gold",
            labelKey: "fields.gold",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "silver",
            labelKey: "fields.silver",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "bronze",
            labelKey: "fields.bronze",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "equippedItems",
            labelKey: "fields.equippedItems",
            type: "text",
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "inventory",
            labelKey: "fields.inventory",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "race",
            labelKey: "fields.race",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "subrace",
            labelKey: "fields.subrace",
            type: "select",
            options: [],
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "background",
            labelKey: "fields.background",
            type: "select",
            options: [],
            group: "general",
            order: 3,
            inlineGroup: "line3"
        },
        {
            name: "startingItem",
            labelKey: "fields.startingItem",
            type: "select",
            options: [],
            group: "general",
            order: 4,
            inlineGroup: "line5"
        },
    ],
    enemy: [
        {
            name: "creatureType",
            labelKey: "fields.creatureType",
            type: "text",
            group: "enemy",
            order: 1
        },
        {
            name: "cr",
            labelKey: "fields.cr",
            type: "number",
            group: "enemy",
            order: 2
        }
    ],
    npc: [
        {
            name: "occupation",
            labelKey: "fields.occupation",
            type: "text",
            group: "npc",
            order: 1
        }
    ]
};
