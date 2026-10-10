import { emptyInventory } from "@rpv/domain";
import { buildSpellcastingSystemData } from "../lib/character/spellcastingContext";

describe("buildSpellcastingSystemData", () => {
    it("prefers selections.characterClass over systemData", () => {
        expect(
            buildSpellcastingSystemData({
                selections: {
                    characterClass: "wizard",
                    choices: {},
                    inventory: emptyInventory(),
                },
                systemData: { characterClass: "fighter", level: 5 },
            })
        ).toEqual({
            characterClass: "wizard",
            level: 5,
            subclass: undefined,
        });
    });

    it("keeps systemData.characterClass when selections omit class", () => {
        expect(
            buildSpellcastingSystemData({
                selections: {
                    choices: {},
                    inventory: emptyInventory(),
                },
                systemData: { characterClass: "cleric", level: 2 },
            })
        ).toEqual({
            characterClass: "cleric",
            level: 2,
            subclass: undefined,
        });
    });

    it("includes subclass from selections", () => {
        expect(
            buildSpellcastingSystemData({
                selections: {
                    characterClass: "rogue",
                    subclass: "rogue-arcane-trickster",
                    choices: {},
                    inventory: emptyInventory(),
                },
                systemData: { level: 3 },
            })
        ).toEqual({
            characterClass: "rogue",
            subclass: "rogue-arcane-trickster",
            level: 3,
        });
    });
});
