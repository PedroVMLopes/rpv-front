import { buildPreparedSpellToggleFormData } from "../lib/character/sheetPreparedSpells";
import type { StoredCharacter } from "../lib/character/storedCharacter";

const wizardStored: StoredCharacter = {
    id: "wizard-prep",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Wizard",
    baseStats: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 16,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 8,
    },
    modifiers: [],
    grants: [
        {
            id: "class-wizard-spell-burning-hands",
            kind: "spell",
            ref: "burning-hands",
            source: { type: "class", id: "wizard" },
        },
        {
            id: "class-wizard-spell-magic-missile",
            kind: "spell",
            ref: "magic-missile",
            source: { type: "class", id: "wizard" },
        },
    ],
    selections: {
        characterClass: "wizard",
        choices: {
            grantPicks: {
                "class:wizard:1:spell:2:0": "burning-hands",
                "class:wizard:1:spell:2:1": "magic-missile",
            },
            preparedSpells: ["burning-hands"],
        },
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 8 },
    systemData: {
        characterClass: "wizard",
        level: 1,
    },
};

describe("buildPreparedSpellToggleFormData", () => {
    it("adds a known leveled spell within quota", () => {
        const next = buildPreparedSpellToggleFormData(
            wizardStored,
            "magic-missile",
            "en"
        );

        expect(next).not.toBeNull();
        const choices = next?.choices as { preparedSpells?: string[] };
        expect(choices.preparedSpells).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
    });

    it("removes a prepared spell on toggle off", () => {
        const next = buildPreparedSpellToggleFormData(
            wizardStored,
            "burning-hands",
            "en"
        );

        expect(next).not.toBeNull();
        const choices = next?.choices as { preparedSpells?: string[] };
        expect(choices.preparedSpells).toEqual([]);
    });
});
