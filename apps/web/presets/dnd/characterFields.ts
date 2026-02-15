export const dndCharacterFields = {
    common: [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            group: "general",
            order: 1,
            inlineGroup: "line1"
        },
        {
            name: "age",
            label: "Apparent Age",
            type: "select",
            options: ["Todler", "Child", "Teenager", "Young Adult", "Adult", "Old Adult", "Old"],
            group: "general",
            order: 1,
            inlineGroup: "line3"
        },
        {
            name: "hp",
            label: "Hit Points",
            type: "number",
            group: "combat",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "maxHp",
            label: "Max Hit Points",
            type: "number",
            group: "combat",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "ac",
            label: "Armor Class",
            type: "number",
            group: "combat",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "attributes",
            label: "Attributes",
            type: "attributeGroup",
            group: "attributes",
            order: 1,
            attributes: [
              { name: "strength", label: "Strength" },
              { name: "dexterity", label: "Dexterity" },
              { name: "constitution", label: "Constitution" },
              { name: "intelligence", label: "Intelligence" },
              { name: "wisdom", label: "Wisdom" },
              { name: "charisma", label: "Charisma" }
            ]
        },
        {
            name: "goals",
            label: "Goals",
            type: "text",
            group: "general",
            order: '2'
        }
    ],
    player: [
        {
            name: "characterClass",
            label: "Class",
            type: "select",
            options: ["Fighter", "Wizard", "Rogue"],
            group: "general",
            order: 2,
            inlineGroup: "line2"
        },
        {
            name: "subclass",
            label: "Subclass",
            type: "text",
            group: "general",
            order: 3,
            inlineGroup: "line2"
        },
        {
            name: "level",
            label: "Level",
            type: "number",
            defaultValue: 1,
            group: "general",
            order: 1,
            inlineGroup: "line2"
        },
        {
            name: "gold",
            label: "Gold",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "silver",
            label: "Silver",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "bronze",
            label: "Bronze",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line4"
        },
        {
            name: "equippedItems",
            label: "Equipped Items",
            type: "text",
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "inventory",
            label: "Inventory",
            type: "number",
            defaultValue: 0,
            group: "general",
            order: 3,
            inlineGroup: "line5"
        },
        {
            name: "race",
            label: "Race",
            type: "select",
            options: ["Todler", "Child", "Teenager", "Young Adult", "Adult", "Old Adult", "Old"],
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "background",
            label: "Background",
            type: "select",
            options: ["Todler", "Child", "Teenager", "Young Adult", "Adult", "Old Adult", "Old"],
            group: "general",
            order: 3,
            inlineGroup: "line3"
        },
    ],
    enemy: [
        {
            name: "creatureType",
            label: "Creature Type",
            type: "text",
            group: "enemy",
            order: 1
        },
        {
            name: "cr",
            label: "Challenge Rating",
            type: "number",
            group: "enemy",
            order: 2
        }
    ],
    npc: [
        {
            name: "occupation",
            label: "Occupation",
            type: "text",
            group: "npc",
            order: 1
        }
    ]
};
