import {
    characterCanPrepareSpells,
    characterHasMagic,
} from "../lib/character/characterHasMagic";
import type { StoredCharacter } from "../lib/character/storedCharacter";

function baseStored(
    overrides: Partial<StoredCharacter> &
        Pick<StoredCharacter, "id" | "name" | "selections" | "systemData">
): StoredCharacter {
    return {
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        baseStats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            armorClass: 10,
            hitPoints: 8,
        },
        modifiers: [],
        grants: [],
        resources: { hp: 8 },
        ...overrides,
    };
}

describe("characterHasMagic", () => {
    it("is false for a fighter with no spells or slots", () => {
        expect(
            characterHasMagic(
                baseStored({
                    id: "f1",
                    name: "Fighter",
                    selections: {
                        characterClass: "fighter",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "fighter", level: 1 },
                })
            )
        ).toBe(false);
    });

    it("is true when the class has spellcasting", () => {
        expect(
            characterHasMagic(
                baseStored({
                    id: "w1",
                    name: "Wizard",
                    selections: {
                        characterClass: "wizard",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "wizard", level: 1 },
                })
            )
        ).toBe(true);
    });

    it("is true for a racial cantrip on a non-caster class", () => {
        expect(
            characterHasMagic(
                baseStored({
                    id: "e1",
                    name: "Elf Fighter",
                    grants: [
                        {
                            id: "race-high-elf-spell-fire-bolt",
                            kind: "spell",
                            ref: "fire-bolt",
                            source: { type: "race", id: "high-elf" },
                        },
                    ],
                    selections: {
                        characterClass: "fighter",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "fighter", level: 1 },
                })
            )
        ).toBe(true);
    });

    it("is true when pact slots exist without class lookup", () => {
        expect(
            characterHasMagic(
                baseStored({
                    id: "p1",
                    name: "Pact",
                    selections: {
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { level: 1 },
                    resources: { hp: 8, "pact-slots": 1 },
                })
            )
        ).toBe(true);
    });
});

describe("characterCanPrepareSpells", () => {
    it("is true for cleric (prepared-list) without book picks", () => {
        expect(
            characterCanPrepareSpells(
                baseStored({
                    id: "c1",
                    name: "Cleric",
                    selections: {
                        characterClass: "cleric",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "cleric", level: 1 },
                })
            )
        ).toBe(true);
    });

    it("is true for wizard only when leveled spells are known", () => {
        expect(
            characterCanPrepareSpells(
                baseStored({
                    id: "w0",
                    name: "Wizard empty",
                    selections: {
                        characterClass: "wizard",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "wizard", level: 1 },
                })
            )
        ).toBe(false);

        expect(
            characterCanPrepareSpells(
                baseStored({
                    id: "w1",
                    name: "Wizard",
                    selections: {
                        characterClass: "wizard",
                        choices: {
                            grantPicks: {
                                "class:wizard:1:spell:2:0": "burning-hands",
                            },
                        },
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "wizard", level: 1 },
                })
            )
        ).toBe(true);
    });

    it("is false for sorcerer and fighter", () => {
        expect(
            characterCanPrepareSpells(
                baseStored({
                    id: "s1",
                    name: "Sorcerer",
                    selections: {
                        characterClass: "sorcerer",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "sorcerer", level: 1 },
                })
            )
        ).toBe(false);
        expect(
            characterCanPrepareSpells(
                baseStored({
                    id: "f1",
                    name: "Fighter",
                    selections: {
                        characterClass: "fighter",
                        choices: {},
                        inventory: { bag: [], equipped: {} },
                    },
                    systemData: { characterClass: "fighter", level: 1 },
                })
            )
        ).toBe(false);
    });
});
