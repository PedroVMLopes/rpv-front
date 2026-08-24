import { contentRepo } from "../lib/content/contentRepository";
import {
    extractBackgroundGrants,
    extractClassGrants,
    extractSubclassGrants,
    extractSubraceGrants,
} from "../lib/character/creation/extractCatalogGrants";
import {
    getCatalogSelectionKindForField,
    getCatalogSelectionSourceKey,
} from "../lib/character/creation/catalogSelection.types";
import { getCatalogSelectionSource } from "../lib/character/creation/sources";
import type { SystemKey } from "../presets";

describe("getCatalogSelectionKindForField", () => {
    it("maps form fields onto catalog selection kinds", () => {
        expect(getCatalogSelectionKindForField("race")).toBe("race");
        expect(getCatalogSelectionKindForField("subrace")).toBe("subrace");
        expect(getCatalogSelectionKindForField("characterClass")).toBe("class");
        expect(getCatalogSelectionKindForField("subclass")).toBe("subclass");
        expect(getCatalogSelectionKindForField("background")).toBe("background");
    });
});

describe("getCatalogSelectionSourceKey", () => {
    it("namespaces catalog caches by system and kind", () => {
        expect(getCatalogSelectionSourceKey("dnd", "class")).toBe("dnd:class");
    });
});

describe("extractCatalogGrants", () => {
    it("includes wizard spell-slot deltas only once the class level unlocks them", () => {
        const wizard = contentRepo("dnd").getClass("wizard", "en");
        expect(wizard).toBeDefined();

        const level1 = extractClassGrants(wizard!, 1);
        const level3 = extractClassGrants(wizard!, 3);

        expect(
            level1.some(
                (grant) =>
                    grant.grantType === "resource" && grant.ref === "spell-slots-1"
            )
        ).toBe(true);
        expect(
            level1.some(
                (grant) =>
                    grant.grantType === "resource" && grant.ref === "spell-slots-2"
            )
        ).toBe(false);
        expect(
            level3.some(
                (grant) =>
                    grant.grantType === "resource" && grant.ref === "spell-slots-2"
            )
        ).toBe(true);
    });

    it("reads high-elf trait grants and champion subclass features", () => {
        const elf = contentRepo("dnd").getRace("elf", "en");
        const highElf = elf?.subraces.find((subrace) => subrace.slug === "high-elf");
        expect(highElf).toBeDefined();

        expect(
            extractSubraceGrants(highElf!).some(
                (grant) => grant.grantType === "spell"
            )
        ).toBe(true);

        const champion = contentRepo("dnd").getSubclass("fighter-champion", "en");
        expect(champion).toBeDefined();

        expect(extractSubclassGrants(champion!, "fighter", 1)).toEqual([]);
        expect(
            extractSubclassGrants(champion!, "fighter", 3).some(
                (grant) =>
                    grant.grantType === "ability" &&
                    grant.description === "Improved Critical"
            )
        ).toBe(true);
    });

    it("returns authored background grants unchanged", () => {
        const sage = contentRepo("dnd").getBackground("sage", "en");
        expect(sage).toBeDefined();
        expect(extractBackgroundGrants(sage!)).toBe(sage!.grants);
        expect(extractBackgroundGrants(sage!).some((grant) => grant.choose === 2)).toBe(
            true
        );
    });
});

describe("getCatalogSelectionSource", () => {
    it("returns no entries for an unknown system", () => {
        const source = getCatalogSelectionSource("pf2e" as SystemKey, "race");
        expect(source.list("en", {})).toEqual([]);
    });

    it("lists classes with hit-die badges and level-gated grants", () => {
        const classes = getCatalogSelectionSource("dnd", "class").list("en", {
            characterLevel: 3,
        });
        const fighter = classes.find((entry) => entry.slug === "fighter");
        const wizard = classes.find((entry) => entry.slug === "wizard");

        expect(fighter?.badges?.map((badge) => badge.label)).toEqual(
            expect.arrayContaining(["d10", "Subclass L3"])
        );
        expect(fighter?.metadata).toEqual({ hitDie: 10, subclassLevel: 3 });
        expect(
            wizard?.grants.some(
                (grant) =>
                    grant.grantType === "resource" && grant.ref === "spell-slots-2"
            )
        ).toBe(true);
    });

    it("requires race and class context for subrace and subclass lists", () => {
        expect(
            getCatalogSelectionSource("dnd", "subrace").list("en", {})
        ).toEqual([]);
        expect(
            getCatalogSelectionSource("dnd", "subclass").list("en", {})
        ).toEqual([]);

        const subraces = getCatalogSelectionSource("dnd", "subrace").list("en", {
            raceSlug: "elf",
        });
        expect(subraces.map((entry) => entry.slug)).toEqual(
            expect.arrayContaining(["high-elf"])
        );

        const subclasses = getCatalogSelectionSource("dnd", "subclass").list(
            "en",
            { classSlug: "fighter", characterLevel: 3 }
        );
        expect(subclasses.map((entry) => entry.slug)).toEqual(
            expect.arrayContaining(["fighter-champion"])
        );
        expect(
            subclasses
                .find((entry) => entry.slug === "fighter-champion")
                ?.grants.some(
                    (grant) =>
                        grant.grantType === "ability" &&
                        grant.description === "Improved Critical"
                )
        ).toBe(true);
    });

    it("lists backgrounds with their authored grants", () => {
        const backgrounds = getCatalogSelectionSource("dnd", "background").list(
            "en",
            {}
        );
        const sage = backgrounds.find((entry) => entry.slug === "sage");

        expect(sage?.title).toBe("Sage");
        expect(sage?.grants.some((grant) => grant.grantType === "language")).toBe(
            true
        );
    });
});
