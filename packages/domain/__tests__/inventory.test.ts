import { emptyInventory } from "../src/inventory/inventory.types";

describe("emptyInventory", () => {
    it("returns an empty bag and equipped map", () => {
        expect(emptyInventory()).toEqual({
            bag: [],
            equipped: {},
        });
    });
});
