import { getCatalogSelectionSource } from "../lib/character/creation/sources";
import type { SystemKey } from "../presets";

describe("getCatalogSelectionSource", () => {
    it("returns an empty list for an unregistered system", () => {
        const source = getCatalogSelectionSource("pf2e" as SystemKey, "class");

        expect(source.list("en", {})).toEqual([]);
    });

    it("returns no subraces or subclasses without a parent slug", () => {
        expect(
            getCatalogSelectionSource("dnd", "subrace").list("en", {})
        ).toEqual([]);
        expect(
            getCatalogSelectionSource("dnd", "subclass").list("en", {
                characterLevel: 3,
            })
        ).toEqual([]);
    });

    it("lists fighter class grants for the requested level", () => {
        const source = getCatalogSelectionSource("dnd", "class");
        const atLevel1 = source
            .list("en", { characterLevel: 1 })
            .find((entry) => entry.slug === "fighter");
        const atLevel3 = source
            .list("en", { characterLevel: 3 })
            .find((entry) => entry.slug === "fighter");

        expect(atLevel1?.badges).toEqual(
            expect.arrayContaining([
                { label: "d10", variant: "muted" },
                { label: "Subclass L3", variant: "muted" },
            ])
        );
        expect(atLevel1?.metadata).toEqual({
            hitDie: 10,
            subclassLevel: 3,
        });
        expect(
            atLevel1?.grants.some((grant) => grant.ref === "action-surge-uses")
        ).toBe(false);
        expect(
            atLevel3?.grants.some((grant) => grant.ref === "action-surge-uses")
        ).toBe(true);
    });

    it("gates champion subclass grants on character level", () => {
        const source = getCatalogSelectionSource("dnd", "subclass");
        const atLevel1 = source
            .list("en", { classSlug: "fighter", characterLevel: 1 })
            .find((entry) => entry.slug === "fighter-champion");
        const atLevel3 = source
            .list("en", { classSlug: "fighter", characterLevel: 3 })
            .find((entry) => entry.slug === "fighter-champion");

        expect(atLevel1).toBeDefined();
        expect(
            atLevel1?.grants.some(
                (grant) => grant.description === "Improved Critical"
            )
        ).toBe(false);
        expect(
            atLevel3?.grants.some(
                (grant) => grant.description === "Improved Critical"
            )
        ).toBe(true);
    });

    it("includes background grants and race metadata badges", () => {
        const sage = getCatalogSelectionSource("dnd", "background")
            .list("en", {})
            .find((entry) => entry.slug === "sage");
        const dwarf = getCatalogSelectionSource("dnd", "race")
            .list("en", {})
            .find((entry) => entry.slug === "dwarf");

        expect(sage?.grants.length).toBeGreaterThan(0);
        expect(dwarf?.badges).toEqual(
            expect.arrayContaining([
                { label: "Medium", variant: "muted" },
                { label: "25 ft", variant: "muted" },
            ])
        );
        expect(dwarf?.metadata).toEqual(
            expect.objectContaining({
                size: "Medium",
                speedWalk: 25,
            })
        );
    });
});
