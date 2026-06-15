import { getItem, getItemGrants, listItems } from "../src/curation/itemGrants.dnd";

describe("itemGrants.dnd", () => {
    it("lists curated items including HP-granting items", () => {
        expect(listItems().map((entry) => entry.slug)).toEqual(
            expect.arrayContaining([
                "scroll-of-fire-bolt",
                "amulet-of-vitality",
                "ring-of-hardiness",
            ])
        );
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
});
