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

    it("lists heal use grants for potion of healing", () => {
        const item = getItem("srd_potion-of-healing")!;
        expect(item.category.key).toBe("potion");
        expect(listItemUseGrants(item)).toEqual([
            expect.objectContaining({
                grantType: "ability",
                activation: { cost: "action", consumeQuantity: 1 },
                useEffect: {
                    kind: "heal",
                    dice: "2d4",
                    flat: 2,
                    healingKind: "hp",
                },
            }),
        ]);
        expect(isConsumableItem(item)).toBe(true);
    });

    it("lists use grants for antitoxin and thrown flasks", () => {
        expect(isConsumableItem(getItem("srd_antitoxin-vial")!)).toBe(true);
        expect(isConsumableItem(getItem("srd_holy-water-flask")!)).toBe(true);
        expect(isConsumableItem(getItem("srd_alchemists-fire-flask")!)).toBe(
            true
        );
        expect(listItemUseGrants(getItem("srd_antitoxin-vial")!)[0]?.useEffect).toEqual({
            kind: "apply_condition",
            conditionRef: "antitoxin",
        });
    });

    it("is false for non-consumable gear", () => {
        expect(isConsumableItem(getItem("srd_waterskin")!)).toBe(false);
        expect(isConsumableItem(getItem("rpv_amulet-of-vitality")!)).toBe(false);
        expect(listItemUseGrants(getItem("srd_longsword")!)).toEqual([]);
    });
});
