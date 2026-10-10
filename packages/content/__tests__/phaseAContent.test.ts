import {
    getClass,
    getClassGrantSourcesForLevel,
    getClassSubclassLevel,
    getSubclass,
    listClasses,
    listRaces,
    listSpells,
    listSubclassesForClass,
    resolveSpellPool,
    resolveSpellcastingProfile,
} from "../src";

describe("Phase A content (L5 table set)", () => {
    it("includes the six focus classes and new races", () => {
        const classSlugs = listClasses().map((entry) => entry.slug);
        for (const slug of [
            "rogue",
            "cleric",
            "paladin",
            "wizard",
            "druid",
            "monk",
        ]) {
            expect(classSlugs).toContain(slug);
        }

        const raceSlugs = listRaces().map((entry) => entry.slug);
        for (const slug of ["human", "tiefling", "halfling"]) {
            expect(raceSlugs).toContain(slug);
        }
    });

    it("wires Phase A subclasses to the right classes", () => {
        expect(getSubclass("rogue-arcane-trickster")?.classSlug).toBe("rogue");
        expect(getSubclass("cleric-trickery")?.classSlug).toBe("cleric");
        expect(getSubclass("paladin-oath-of-vengeance")?.classSlug).toBe(
            "paladin"
        );
        expect(getSubclass("wizard-illusion")?.classSlug).toBe("wizard");
        expect(getSubclass("druid-circle-of-the-moon")?.classSlug).toBe(
            "druid"
        );
        expect(getSubclass("monk-open-hand")?.classSlug).toBe("monk");

        expect(
            listSubclassesForClass("rogue").map((entry) => entry.slug)
        ).toContain("rogue-arcane-trickster");
    });

    it("resolves Arcane Trickster spellcasting from the subclass", () => {
        expect(resolveSpellcastingProfile("rogue").mode).toBeUndefined();
        expect(
            resolveSpellcastingProfile("rogue", "rogue-arcane-trickster")
        ).toEqual({
            ability: "intelligence",
            mode: "known",
            preparedQuota: "level-plus-mod",
        });
    });

    it("filters spell pools by school for Arcane Trickster picks", () => {
        const pool = resolveSpellPool(
            {
                spellLists: ["wizard"],
                levelIntMax: 1,
                schools: ["Illusion", "Enchantment"],
            },
            listSpells()
        );

        expect(pool.length).toBeGreaterThan(0);
        expect(
            pool.every((spell) =>
                ["Illusion", "Enchantment"].includes(spell.school)
            )
        ).toBe(true);
    });

    it("exposes L1–L5 feature blocks for Phase A casters and half-casters", () => {
        for (const slug of ["cleric", "paladin", "druid", "wizard", "monk", "rogue"]) {
            const levels = getClassGrantSourcesForLevel(slug, 5)
                .map((block) => block.featureLevel)
                .filter((level) => typeof level === "number") as number[];
            expect(Math.max(...levels, 1)).toBeGreaterThanOrEqual(5);
        }

        expect(getClass("paladin")?.preparedQuota).toBe("half-level-plus-mod");
        expect(getClassSubclassLevel("druid")).toBe(2);
        expect(getClassSubclassLevel("rogue")).toBe(3);
    });

    it("imports SRD spells through slot level 3 for the four caster lists", () => {
        const spells = listSpells();
        expect(spells.length).toBeGreaterThan(100);
        expect(spells.some((spell) => spell.slug === "hunters-mark")).toBe(
            true
        );
        expect(spells.some((spell) => spell.slug === "hellish-rebuke")).toBe(
            true
        );
        expect(
            spells.every(
                (spell) => spell.levelInt >= 0 && spell.levelInt <= 3
            )
        ).toBe(true);
    });
});
