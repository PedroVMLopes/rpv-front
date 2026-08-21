import {
    getItem,
    getItemGrants,
    isItemStackable,
    itemProvidesWeaponAttack,
    listItems,
    type ItemSystem,
} from "../src";

describe("item catalog + overlays", () => {
    it("lists Open5e catalog items merged with rpv extras", () => {
        const slugs = listItems("dnd").map((entry) => entry.slug);

        expect(slugs).toEqual(expect.arrayContaining([
            "srd_longsword",
            "srd_leather-armor",
            "srd_shield",
            "rpv_scroll-of-fire-bolt",
            "rpv_amulet-of-vitality",
            "rpv_ring-of-hardiness",
            "rpv_pilot-test-dagger",
            "rpv_pilot-test-pack-a",
            "rpv_pilot-test-starter-kit",
        ]));
        expect(getItem("rpv_dungeoneers-pack")).toBeUndefined();
        expect(getItem("rpv_explorers-pack")).toBeUndefined();
        expect(listItems("dnd").every((entry) => entry.system === "dnd")).toBe(true);
        expect(listItems("dnd").length).toBeGreaterThan(200);
    });

    it("returns empty list for unknown system", () => {
        const unknownSystem = "pf2e" as unknown as ItemSystem;
        expect(listItems(unknownSystem)).toEqual([]);
    });

    it("returns undefined for unknown item slug", () => {
        expect(getItem("nonexistent-item")).toBeUndefined();
        expect(getItem("longsword")).toBeUndefined();
    });

    it("uses Open5e keys as slugs", () => {
        expect(getItem("srd_longsword")?.slug).toBe("srd_longsword");
        expect(getItem("srd_leather-armor")?.slug).toBe("srd_leather-armor");
    });

    it("defaults stackable from weapon/armor presence and honors overlay", () => {
        expect(isItemStackable(getItem("rpv_scroll-of-fire-bolt")!)).toBe(true);
        expect(isItemStackable(getItem("rpv_amulet-of-vitality")!)).toBe(false);
        expect(isItemStackable(getItem("srd_longsword")!)).toBe(false);
        expect(isItemStackable(getItem("srd_leather-armor")!)).toBe(false);
        expect(isItemStackable(getItem("srd_shield")!)).toBe(false);
    });

    it("itemProvidesWeaponAttack is true only when weapon profile is set", () => {
        expect(itemProvidesWeaponAttack(undefined)).toBe(false);
        expect(itemProvidesWeaponAttack(getItem("srd_longsword"))).toBe(true);
        expect(itemProvidesWeaponAttack(getItem("rpv_pilot-test-dagger"))).toBe(
            true
        );
        expect(itemProvidesWeaponAttack(getItem("srd_shield"))).toBe(false);
        expect(itemProvidesWeaponAttack(getItem("srd_leather-armor"))).toBe(
            false
        );
        expect(
            itemProvidesWeaponAttack(getItem("rpv_amulet-of-vitality"))
        ).toBe(false);
    });

    it("returns overlay grants for RPV magic items", () => {
        expect(getItemGrants("rpv_amulet-of-vitality")).toEqual([
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 5,
            },
        ]);
        expect(getItemGrants("rpv_ring-of-hardiness")).toEqual([
            expect.objectContaining({
                grantType: "stat_modifier",
                targetStat: "hitPoints",
                amount: 10,
            }),
        ]);
        expect(getItemGrants("rpv_scroll-of-fire-bolt")).toEqual([
            {
                grantType: "spell",
                choose: 0,
                options: [{ optionType: "spell", ref: "fire-bolt" }],
            },
        ]);
    });

    it("maps weapon nested profile for longsword without stat grants", () => {
        expect(getItemGrants("srd_longsword")).toEqual([]);
        expect(getItem("srd_longsword")?.weapon).toEqual(
            expect.objectContaining({
                damageDice: "1d8",
                damageType: { name: "Slashing", key: "slashing" },
                isMartial: true,
            })
        );
        expect(getItem("srd_longsword")?.category.key).toBe("weapon");
    });

    it("maps armor profile for leather; no flat AC grants", () => {
        expect(getItemGrants("srd_leather-armor")).toEqual([]);
        expect(getItem("srd_leather-armor")?.armor).toEqual(
            expect.objectContaining({
                category: "light",
                acBase: 11,
                acAddDexmod: true,
            })
        );
        expect(getItemGrants("srd_shield")).toEqual([]);
        expect(getItem("srd_shield")?.armor).toEqual(
            expect.objectContaining({
                category: "shield",
                acBase: 2,
            })
        );
    });

    it("localizes item name for pt-BR without changing grants", () => {
        const localized = getItem("srd_longsword", "dnd", "pt-BR");

        expect(localized?.name).toBe("Espada Longa");
        expect(localized?.grants).toEqual(getItemGrants("srd_longsword"));
    });
});
