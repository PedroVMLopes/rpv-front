import {
    deriveStartingEquipmentFromForm,
    getTotalCurrencyFromForm,
    hasStartingEquipmentContent,
} from "../lib/character/deriveStartingEquipmentFromForm";

const baseFormData = {
    name: "Test Hero",
    level: 1,
};

describe("deriveStartingEquipmentFromForm", () => {
    it("lists sage fixed scroll and granted gold", () => {
        const preview = deriveStartingEquipmentFromForm(
            {
                ...baseFormData,
                background: "sage",
            },
            "en",
            "dnd"
        );

        expect(preview.fixedItems).toEqual([
            expect.objectContaining({
                slug: "scroll-of-fire-bolt",
                quantity: 1,
                source: { type: "background", id: "sage" },
            }),
        ]);
        expect(preview.grantedCurrency).toEqual({ gold: 15 });
        expect(preview.bag).toEqual([
            expect.objectContaining({
                slug: "scroll-of-fire-bolt",
                provenance: "grant:background:sage:2",
            }),
        ]);
        expect(hasStartingEquipmentContent(preview)).toBe(true);
    });

    it("materializes fighter sidearm pick into the bag preview", () => {
        const preview = deriveStartingEquipmentFromForm(
            {
                ...baseFormData,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:inventory_item:5:0": "0",
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(preview.fixedItems).toEqual([
            expect.objectContaining({
                slug: "longsword",
                source: { type: "class", id: "fighter" },
            }),
        ]);
        expect(preview.choiceGrants.map((choice) => choice.key)).toEqual([
            "class:fighter:base:inventory_item:5:0",
        ]);
        expect(preview.bag).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    slug: "longsword",
                    provenance: "grant:class:fighter:4",
                }),
                expect.objectContaining({
                    slug: "pilot-test-dagger",
                    provenance: "grant:class:fighter:5",
                }),
            ])
        );
    });

    it("merges manual and granted currency in totals", () => {
        const preview = deriveStartingEquipmentFromForm(
            {
                ...baseFormData,
                background: "sage",
                gold: 8,
            },
            "en",
            "dnd"
        );

        expect(preview.manualCurrency).toEqual({ gold: 8, silver: 0, bronze: 0 });
        expect(preview.grantedCurrency).toEqual({ gold: 15 });
        expect(preview.totalCurrency).toEqual({ gold: 23, silver: 0, bronze: 0 });
        expect(getTotalCurrencyFromForm(
            {
                ...baseFormData,
                background: "sage",
                gold: 8,
            },
            "en",
            "dnd"
        )).toEqual({ gold: 23, silver: 0, bronze: 0 });
    });

    it("returns empty preview when no starting equipment sources are selected", () => {
        const preview = deriveStartingEquipmentFromForm(baseFormData, "en", "dnd");

        expect(preview.fixedItems).toEqual([]);
        expect(preview.choiceGrants).toEqual([]);
        expect(preview.bag).toEqual([]);
        expect(preview.grantedCurrency).toEqual({});
        expect(hasStartingEquipmentContent(preview)).toBe(false);
    });
});
