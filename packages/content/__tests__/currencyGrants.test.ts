import {
    aggregateCurrencyByRef,
    currencyGrantProvenance,
    extractCurrencyGrants,
} from "../src/grant/currencyGrants";
import { fixedGrantsToCharacterGrants } from "../src/grant/grants";
import type { Grant } from "../src/grant/grant.types";

describe("extractCurrencyGrants", () => {
    it("extracts fixed currency grants with ref and amount", () => {
        const grants: Grant[] = [
            {
                grantType: "currency",
                choose: 0,
                ref: "gold",
                amount: 15,
            },
        ];

        expect(extractCurrencyGrants(grants)).toEqual([
            { ref: "gold", amount: 15, grantIndex: 0 },
        ]);
    });

    it("defaults amount to 0 when omitted", () => {
        const grants: Grant[] = [
            {
                grantType: "currency",
                choose: 0,
                ref: "silver",
            },
        ];

        expect(extractCurrencyGrants(grants)).toEqual([
            { ref: "silver", amount: 0, grantIndex: 0 },
        ]);
    });

    it("ignores currency grants with choose greater than 0", () => {
        const grants: Grant[] = [
            {
                grantType: "currency",
                choose: 1,
                ref: "gold",
                amount: 10,
            },
        ];

        expect(extractCurrencyGrants(grants)).toEqual([]);
    });

    it("ignores non-currency grants", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "longsword",
            },
        ];

        expect(extractCurrencyGrants(grants)).toEqual([]);
    });
});

describe("currencyGrantProvenance", () => {
    it("builds a stable provenance key", () => {
        expect(currencyGrantProvenance("background", "acolyte", 1)).toBe(
            "grant:background:acolyte:1"
        );
    });
});

describe("aggregateCurrencyByRef", () => {
    it("sums amounts by currency ref", () => {
        const totals = aggregateCurrencyByRef([
            { ref: "gold", amount: 15, grantIndex: 0 },
            { ref: "gold", amount: 10, grantIndex: 2 },
            { ref: "silver", amount: 5, grantIndex: 1 },
        ]);

        expect(totals).toEqual({ gold: 25, silver: 5 });
    });
});

describe("fixedGrantsToCharacterGrants", () => {
    it("ignores currency grants", () => {
        const grants: Grant[] = [
            {
                grantType: "currency",
                choose: 0,
                ref: "gold",
                amount: 15,
            },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, { type: "background", id: "acolyte" })
        ).toEqual([]);
    });
});
