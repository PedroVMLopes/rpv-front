import { emptyCharacterSelections } from "../lib/character/storedCharacter";
import {
    getManualCurrency,
    getTotalCurrency,
    materializeCurrencyGrants,
} from "../lib/character/materializeCurrencyGrants";
import { mergeStartingGrants } from "../lib/character/materializeInventoryGrants";
import { buildNewStoredCharacter } from "../lib/character/buildCharacter";

describe("materializeCurrencyGrants", () => {
    it("materializes sage background gold", () => {
        expect(
            materializeCurrencyGrants(
                {
                    ...emptyCharacterSelections(),
                    background: "sage",
                },
                "en",
                1
            )
        ).toEqual({ gold: 15 });
    });

    it("returns empty when no background is selected", () => {
        expect(
            materializeCurrencyGrants(emptyCharacterSelections(), "en", 1)
        ).toEqual({});
    });
});

describe("getManualCurrency", () => {
    it("reads manual coin from systemData fields", () => {
        expect(
            getManualCurrency({ gold: 5, silver: "2", bronze: undefined })
        ).toEqual({ gold: 5, silver: 2, bronze: 0 });
    });
});

describe("getTotalCurrency", () => {
    it("sums manual systemData and granted currency", () => {
        const stored = buildNewStoredCharacter(
            {
                name: "Test",
                background: "sage",
                gold: 5,
            },
            "player",
            "dnd",
            "en"
        );

        expect(getTotalCurrency(stored)).toEqual({ gold: 20, silver: 0, bronze: 0 });
        expect(stored.systemData.gold).toBe(5);
        expect(stored.selections.grantedCurrency).toEqual({ gold: 15 });
    });
});

describe("mergeStartingGrants currency", () => {
    it("does not write granted gold into systemData", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
            },
            "en",
            "dnd",
            1
        );

        expect(merged.grantedCurrency).toEqual({ gold: 15 });
    });
});
