import {
    extractInventoryItemGrants,
    inventoryGrantProvenance,
} from "../src/grant/inventoryGrants";
import { fixedGrantsToCharacterGrants } from "../src/grant/grants";
import type { Grant } from "../src/grant/grant.types";

describe("extractInventoryItemGrants", () => {
    it("extracts fixed inventory_item grants with ref and amount", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "scroll-of-fire-bolt",
                amount: 2,
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([
            { slug: "scroll-of-fire-bolt", quantity: 2, grantIndex: 0 },
        ]);
    });

    it("defaults quantity to 1 when amount is omitted", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "amulet-of-vitality",
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([
            { slug: "amulet-of-vitality", quantity: 1, grantIndex: 0 },
        ]);
    });

    it("ignores inventory_item grants with choose greater than 0", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 1,
                options: [{ optionType: "proficiency", ref: "longsword" }],
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([]);
    });

    it("ignores non-inventory grants", () => {
        const grants: Grant[] = [
            {
                grantType: "language",
                choose: 0,
                options: [{ optionType: "language", ref: "elvish" }],
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([]);
    });
});

describe("inventoryGrantProvenance", () => {
    it("builds a stable provenance key", () => {
        expect(inventoryGrantProvenance("background", "sage", 2)).toBe(
            "grant:background:sage:2"
        );
    });
});

describe("fixedGrantsToCharacterGrants", () => {
    it("ignores inventory_item grants", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "scroll-of-fire-bolt",
                amount: 1,
            },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, { type: "background", id: "sage" })
        ).toEqual([]);
    });
});
