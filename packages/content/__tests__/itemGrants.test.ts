import {
    getItem,
    getItemGrants,
    isItemStackable,
    listItems,
    type ItemSystem,
} from "../src/curation/itemGrants.dnd";

describe("itemGrants.dnd", () => {
    it("lists all curated dnd items", () => {
        const slugs = listItems("dnd").map((entry) => entry.slug);

        expect(slugs).toEqual([
            "scroll-of-fire-bolt",
            "amulet-of-vitality",
            "ring-of-hardiness",
            "longsword",
            "leather-armor",
            "shield",
            "pilot-test-dagger",
            "pilot-test-pack-a",
            "pilot-test-starter-kit",
        ]);
        expect(listItems("dnd").every((entry) => entry.system === "dnd")).toBe(true);
    });

    it("returns empty list for unknown system", () => {
        const unknownSystem = "pf2e" as unknown as ItemSystem;
        expect(listItems(unknownSystem)).toEqual([]);
    });

    it("returns undefined for unknown item slug", () => {
        expect(getItem("nonexistent-item")).toBeUndefined();
    });

    it("assigns allowedSlots to each pilot item", () => {
        expect(getItem("scroll-of-fire-bolt")?.allowedSlots).toEqual(["main-hand"]);
        expect(getItem("amulet-of-vitality")?.allowedSlots).toEqual(["neck"]);
        expect(getItem("ring-of-hardiness")?.allowedSlots).toEqual(["ring"]);
        expect(getItem("longsword")?.allowedSlots).toEqual(["main-hand"]);
        expect(getItem("leather-armor")?.allowedSlots).toEqual(["armor"]);
        expect(getItem("shield")?.allowedSlots).toEqual(["off-hand"]);
    });

    it("defaults stackable to true and honors explicit false", () => {
        expect(isItemStackable(getItem("scroll-of-fire-bolt")!)).toBe(true);
        expect(isItemStackable(getItem("amulet-of-vitality")!)).toBe(false);
        expect(isItemStackable(getItem("ring-of-hardiness")!)).toBe(false);
        expect(isItemStackable(getItem("longsword")!)).toBe(false);
        expect(isItemStackable(getItem("leather-armor")!)).toBe(false);
        expect(isItemStackable(getItem("shield")!)).toBe(false);
    });

    it("returns stat_modifier hitPoints grants for amulet of vitality", () => {
        expect(getItemGrants("amulet-of-vitality")).toEqual([
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 5,
            },
        ]);
    });

    it("returns stat_modifier hitPoints grants for ring of hardiness", () => {
        expect(getItem("ring-of-hardiness")).toEqual(
            expect.objectContaining({
                slug: "ring-of-hardiness",
                system: "dnd",
            })
        );
        expect(getItemGrants("ring-of-hardiness")).toEqual([
            expect.objectContaining({
                grantType: "stat_modifier",
                targetStat: "hitPoints",
                amount: 10,
            }),
        ]);
    });

    it("returns spell grant for scroll of fire bolt", () => {
        expect(getItemGrants("scroll-of-fire-bolt")).toEqual([
            {
                grantType: "spell",
                choose: 0,
                options: [{ optionType: "spell", ref: "fire-bolt" }],
            },
        ]);
    });

    it("returns strength modifier grant for longsword", () => {
        expect(getItemGrants("longsword")).toEqual([
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "strength",
                amount: 1,
            },
        ]);
    });

    it("returns armorClass modifier grants for leather armor and shield", () => {
        expect(getItemGrants("leather-armor")).toEqual([
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "armorClass",
                amount: 1,
            },
        ]);
        expect(getItemGrants("shield")).toEqual([
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "armorClass",
                amount: 1,
            },
        ]);
    });

    it("localizes item name for pt-BR without changing grants", () => {
        const localized = getItem("longsword", "dnd", "pt-BR");

        expect(localized?.name).toBe("Espada Longa");
        expect(localized?.grants).toEqual(getItemGrants("longsword"));
    });

    it("keeps backward-compatible defaults for getItem and listItems", () => {
        expect(getItem("shield")?.slug).toBe("shield");
        expect(listItems().length).toBe(9);
        expect(getItemGrants("shield").length).toBe(1);
    });

    it("exposes optional category and tags on fixture items", () => {
        expect(getItem("pilot-test-dagger")).toEqual(
            expect.objectContaining({
                category: "weapon",
                tags: ["simple", "melee"],
            })
        );
        expect(getItem("pilot-test-pack-a")).toEqual(
            expect.objectContaining({
                category: "pack",
                tags: ["adventuring"],
            })
        );
    });
});
