import { emptyCharacterSelections } from "../lib/character/storedCharacter";
import {
    adjustCurrencyAmount,
    getManualCurrency,
    getTotalCurrency,
    materializeCurrencyGrants,
    sanitizeCurrency,
    setCurrencyAmount,
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
    it("reads extras and maps bronze to copper", () => {
        expect(
            getManualCurrency({ gold: 5, silver: "2", bronze: undefined })
        ).toEqual({ gold: 5, silver: 2 });
        expect(getManualCurrency({ bronze: 4 })).toEqual({ copper: 4 });
    });
});

describe("sanitizeCurrency", () => {
    it("clamps, floors, and aliases bronze", () => {
        expect(
            sanitizeCurrency({ gold: 1.9, silver: -3, bronze: 2, "": 9 })
        ).toEqual({ gold: 1, silver: 0, copper: 2 });
    });
});

describe("getTotalCurrency", () => {
    it("reads the seeded wallet, not granted plus systemData", () => {
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

        expect(getTotalCurrency(stored)).toEqual({ gold: 20 });
        expect(stored.systemData.gold).toBeUndefined();
        expect(stored.selections.currency).toEqual({ gold: 20 });
        expect(stored.selections.grantedCurrency).toEqual({ gold: 15 });
    });
});

describe("mergeStartingGrants currency", () => {
    it("does not write granted gold into the wallet", () => {
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
        expect(merged.currency).toBeUndefined();
    });

    it("preserves an existing wallet", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
                currency: { gold: 3 },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.grantedCurrency).toEqual({ gold: 15 });
        expect(merged.currency).toEqual({ gold: 3 });
    });
});

describe("setCurrencyAmount / adjustCurrencyAmount", () => {
    it("clamps at zero", () => {
        expect(adjustCurrencyAmount({ gold: 1 }, "gold", -5)).toEqual({
            gold: 0,
        });
        expect(setCurrencyAmount({ gold: 4 }, "gold", -2)).toEqual({ gold: 0 });
    });
});
