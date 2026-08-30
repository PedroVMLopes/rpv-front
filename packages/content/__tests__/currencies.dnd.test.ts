import type { ItemSystem } from "../src/item/item.types";
import { getCurrencies, getCurrency } from "../src/curation/currencies.dnd";

describe("getCurrencies", () => {
    it("returns PHB order for dnd", () => {
        expect(getCurrencies("dnd").map((entry) => entry.abbreviation)).toEqual([
            "pp",
            "gp",
            "ep",
            "sp",
            "cp",
        ]);
        expect(getCurrency("gold")?.valueInCopper).toBe(100);
        expect(getCurrency("copper")?.valueInCopper).toBe(1);
        expect(getCurrency("electrum")?.valueInCopper).toBe(50);
        expect(getCurrency("platinum")?.valueInCopper).toBe(1000);
    });

    it("returns empty for an unknown system", () => {
        expect(getCurrencies("other" as ItemSystem)).toEqual([]);
    });
});
