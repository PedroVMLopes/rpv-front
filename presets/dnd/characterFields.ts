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
            name: "speed",
            label: "Speed",
            type: "number",
            group: "general",
            order: 2,
            inlineGroup: "line3"
        },
        {
            name: "condition",
            label: "Condition",
            type: "select",
            options: ["Todler", "Child", "Teenager", "Young Adult", "Adult", "Old Adult", "Old"],
            group: "general",
            order: 3,
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
        }
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
