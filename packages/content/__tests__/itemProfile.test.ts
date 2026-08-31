import type { ItemArmor, ItemEntry, ItemWeapon } from "../src";
import {
    hasGrants,
    isBodyArmor,
    isClothingItem,
    isRangedWeapon,
    isRangedWeaponItem,
    isShield,
} from "../src";

function weapon(overrides: Partial<ItemWeapon> = {}): ItemWeapon {
    return {
        key: "test",
        name: "Test",
        damageDice: "1d4",
        damageType: { name: "Piercing", key: "piercing" },
        properties: [],
        isSimple: true,
        isMartial: false,
        isImprovised: false,
        distanceUnit: null,
        ...overrides,
    };
}

function armor(overrides: Partial<ItemArmor> = {}): ItemArmor {
    return {
        key: "test",
        name: "Test",
        category: "light",
        acBase: 11,
        acDisplay: "11",
        acAddDexmod: true,
        acCapDexmod: null,
        grantsStealthDisadvantage: false,
        strengthScoreRequired: null,
        ...overrides,
    };
}

function item(
    overrides: Partial<ItemEntry> & Pick<ItemEntry, "slug" | "name">
): ItemEntry {
    return {
        system: "dnd",
        description: "",
        category: { name: "Gear", key: "adventuring-gear" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        grants: [],
        stackable: true,
        ...overrides,
    };
}

describe("isRangedWeapon", () => {
    it("treats range fields or ammunition properties as ranged", () => {
        expect(
            isRangedWeapon(item({ slug: "bow", name: "Bow", weapon: weapon({ range: 150 }) }))
        ).toBe(true);
        expect(
            isRangedWeapon(
                item({
                    slug: "net",
                    name: "Net",
                    weapon: weapon({ longRange: 15 }),
                })
            )
        ).toBe(true);
        expect(
            isRangedWeapon(
                item({
                    slug: "dart",
                    name: "Dart",
                    weapon: weapon({
                        properties: [
                            {
                                name: "Ammunition (range 80/320)",
                                type: null,
                                description: "",
                                detail: "range 80/320",
                            },
                        ],
                    }),
                })
            )
        ).toBe(true);
    });

    it("does not treat melee weapons or non-weapons as ranged", () => {
        expect(
            isRangedWeapon(
                item({
                    slug: "sword",
                    name: "Sword",
                    weapon: weapon({
                        properties: [
                            {
                                name: "Versatile",
                                type: null,
                                description: "",
                                detail: "1d8",
                            },
                        ],
                    }),
                })
            )
        ).toBe(false);
        expect(isRangedWeapon(item({ slug: "rope", name: "Rope" }))).toBe(false);
        expect(isRangedWeaponItem(undefined)).toBe(false);
    });
});

describe("armor and clothing classifiers", () => {
    it("treats non-shield armor as body armor", () => {
        expect(
            isBodyArmor(item({ slug: "leather", name: "Leather", armor: armor() }))
        ).toBe(true);
        expect(
            isBodyArmor(
                item({
                    slug: "shield",
                    name: "Shield",
                    armor: armor({ category: "shield" }),
                })
            )
        ).toBe(false);
        expect(isBodyArmor(item({ slug: "rope", name: "Rope" }))).toBe(false);
    });

    it("detects shields by category key or armor category", () => {
        expect(
            isShield(
                item({
                    slug: "wood-shield",
                    name: "Wood Shield",
                    category: { name: "Shield", key: "shield" },
                })
            )
        ).toBe(true);
        expect(
            isShield(
                item({
                    slug: "shield",
                    name: "Shield",
                    armor: armor({ category: "shield" }),
                })
            )
        ).toBe(true);
        expect(
            isShield(item({ slug: "leather", name: "Leather", armor: armor() }))
        ).toBe(false);
    });

    it("detects clothes and robes by slug or name", () => {
        expect(isClothingItem(item({ slug: "srd_clothes-fine", name: "Fine" }))).toBe(
            true
        );
        expect(isClothingItem(item({ slug: "srd_outfit", name: "Court Robes" }))).toBe(
            true
        );
        expect(isClothingItem(item({ slug: "srd_longsword", name: "Longsword" }))).toBe(
            false
        );
    });

    it("reports whether the item has grants", () => {
        expect(hasGrants(item({ slug: "plain", name: "Plain" }))).toBe(false);
        expect(
            hasGrants(
                item({
                    slug: "amulet",
                    name: "Amulet",
                    grants: [
                        {
                            grantType: "stat_modifier",
                            choose: 0,
                            targetStat: "hitPoints",
                            amount: 5,
                        },
                    ],
                })
            )
        ).toBe(true);
    });
});
