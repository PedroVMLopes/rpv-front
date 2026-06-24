import { emptyCharacterSelections } from "../lib/character/storedCharacter";
import {
    materializeInventoryGrants,
    mergeInventoryWithGrants,
} from "../lib/character/materializeInventoryGrants";

describe("materializeInventoryGrants", () => {
    it("materializes sage background loot with provenance", () => {
        const bag = materializeInventoryGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
            },
            "en",
            "dnd",
            1
        );

        expect(bag).toEqual([
            {
                slug: "scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
        ]);
    });

    it("returns an empty bag when no background is selected", () => {
        expect(
            materializeInventoryGrants(emptyCharacterSelections(), "en", "dnd", 1)
        ).toEqual([]);
    });
});

describe("mergeInventoryWithGrants", () => {
    it("preserves manual stacks and replaces granted stacks", () => {
        const merged = mergeInventoryWithGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
                inventory: {
                    bag: [
                        { slug: "amulet-of-vitality", quantity: 1 },
                        {
                            slug: "scroll-of-fire-bolt",
                            quantity: 9,
                            provenance: "grant:background:sage:2",
                        },
                    ],
                    equipped: {},
                },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.inventory?.bag).toEqual([
            { slug: "amulet-of-vitality", quantity: 1 },
            {
                slug: "scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
        ]);
    });
});
