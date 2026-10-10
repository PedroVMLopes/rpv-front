import { listDamageAffinitiesForCharacter } from "../lib/character/damageAffinityDisplay";
import type { CharacterSelections } from "../lib/character/storedCharacter";

describe("listDamageAffinitiesForCharacter", () => {
    it("lists fire resistance for tiefling hellish resistance", () => {
        const selections: CharacterSelections = {
            race: "tiefling",
            choices: {},
            inventory: { bag: [], equipped: {}, equippedMulti: {} },
        };

        expect(listDamageAffinitiesForCharacter(selections, [], "en")).toEqual({
            resistance: ["fire"],
            immunity: [],
            vulnerability: [],
        });
    });

    it("does not invent poison resistance for dwarf resilience", () => {
        const selections: CharacterSelections = {
            race: "dwarf",
            subrace: "hill-dwarf",
            choices: {},
            inventory: { bag: [], equipped: {}, equippedMulti: {} },
        };

        expect(listDamageAffinitiesForCharacter(selections, [], "en")).toEqual({
            resistance: [],
            immunity: [],
            vulnerability: [],
        });
    });

    it("picks up affinity from an ability grant name", () => {
        expect(
            listDamageAffinitiesForCharacter(
                {
                    race: "human",
                    choices: {},
                    inventory: { bag: [], equipped: {}, equippedMulti: {} },
                },
                [
                    {
                        id: "race-tiefling-ability-hellish",
                        kind: "ability",
                        ref: "Hellish Resistance",
                        name: "Hellish Resistance",
                        source: { type: "race", id: "tiefling" },
                    },
                ],
                "en"
            )
        ).toEqual({
            resistance: ["fire"],
            immunity: [],
            vulnerability: [],
        });
    });
});
