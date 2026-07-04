import { emptyInventory } from "@rpv/domain";
import { getCharacterWalkSpeed } from "../lib/character/characterSpeed";

describe("getCharacterWalkSpeed", () => {
    it("returns speedWalk from the race catalog", () => {
        expect(
            getCharacterWalkSpeed({
                race: "elf",
                inventory: emptyInventory(),
                choices: {},
            })
        ).toBe(30);
    });

    it("returns undefined when race is missing", () => {
        expect(
            getCharacterWalkSpeed({
                inventory: emptyInventory(),
                choices: {},
            })
        ).toBeUndefined();
    });
});
