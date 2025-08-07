export const dndCharacterFields = {
  common: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "hp", label: "Hit Points", type: "number" },
    { name: "maxHp", label: "Max Hit Points", type: "number" },
    { name: "ac", label: "Armor Class", type: "number" },
    {
      name: "attributes",
      label: "Attributes",
      type: "attributeGroup",
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
    { name: "level", label: "Level", type: "number", defaultValue: 1 },
    {
      name: "characterClass",
      label: "Class",
      type: "select",
      options: ["Fighter", "Wizard", "Rogue"]
    }
  ],
  enemy: [
    { name: "creatureType", label: "Creature Type", type: "text" },
    { name: "cr", label: "Challenge Rating", type: "number" }
  ],
  npc: [{ name: "occupation", label: "Occupation", type: "text" }]
};
