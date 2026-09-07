import { getItem, isConsumableItem, listItemUseGrants } from "../src";

describe("itemUse", () => {
    it("lists use grants for the scroll consumable", () => {
        const item = getItem("rpv_scroll-of-fire-bolt")!;
        expect(listItemUseGrants(item)).toEqual([
            expect.objectContaining({
                grantType: "ability",
                activation: { cost: "action", consumeQuantity: 1 },
                useEffect: { kind: "cast_spell", spellRef: "fire-bolt" },
            }),
        ]);
        expect(isConsumableItem(item)).toBe(true);
    });

    it("is false for non-consumable gear", () => {
        expect(isConsumableItem(getItem("srd_waterskin")!)).toBe(false);
        expect(isConsumableItem(getItem("rpv_amulet-of-vitality")!)).toBe(false);
        expect(listItemUseGrants(getItem("srd_longsword")!)).toEqual([]);
    });
});
