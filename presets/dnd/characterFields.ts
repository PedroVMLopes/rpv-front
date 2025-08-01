export const dndCharacterFields = {
  common: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "hp", label: "Hit Points", type: "number" },
    { name: "ac", label: "Armor Class", type: "number" }
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
  npc: [{ name: "job", label: "Job", type: "text" }]
};
