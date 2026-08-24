import { getSpell } from "@rpv/content";
import type { SpellCatalogEntry } from "@rpv/content";
import {
    buildSpellCatalogDetailRows,
    formatSpellComponents,
    formatSpellLists,
    formatSpellSource,
} from "../lib/content/buildSpellCatalogDetailRows";
import type { SpellContentFormatters } from "../lib/content/buildSpellContentModel";

const formatters: SpellContentFormatters = {
    tSpells: (key) => key,
    tAbilities: (key) => key,
    tContentDetail: (key) => (key === "yes" ? "Yes" : key === "no" ? "No" : key),
    tUse: () => "Use",
    missingValue: "—",
};

function makeEntry(
    overrides: Partial<SpellCatalogEntry> = {}
): SpellCatalogEntry {
    return {
        slug: "test-spell",
        language: "en",
        name: "Test Spell",
        levelInt: 1,
        level: "1st-level",
        school: "Evocation",
        castingTime: "1 action",
        range: "60 feet",
        components: "V, S",
        material: "",
        duration: "Instantaneous",
        requiresConcentration: false,
        canBeCastAsRitual: false,
        description: "A test spell.",
        shortDescription: "test",
        higherLevel: "",
        spellLists: ["wizard"],
        archetype: "",
        page: "",
        sourceDocument: "",
        sourceDocumentTitle: "",
        ...overrides,
    };
}

describe("formatSpellComponents", () => {
    it("appends material in parentheses when present", () => {
        expect(formatSpellComponents(makeEntry({ components: "V, S" }))).toBe(
            "V, S"
        );
        expect(
            formatSpellComponents(
                makeEntry({
                    components: "V, S, M",
                    material: "A tiny ball of bat guano and sulfur.",
                })
            )
        ).toBe("V, S, M (A tiny ball of bat guano and sulfur.)");
        expect(
            formatSpellComponents(
                makeEntry({ components: "V, S, M", material: "  " })
            )
        ).toBe("V, S, M");
    });
});

describe("formatSpellSource", () => {
    it("joins document title and page, omitting blank parts", () => {
        expect(formatSpellSource(makeEntry())).toBeUndefined();
        expect(
            formatSpellSource(makeEntry({ sourceDocumentTitle: "5e Core Rules" }))
        ).toBe("5e Core Rules");
        expect(formatSpellSource(makeEntry({ page: "phb 241" }))).toBe("phb 241");
        expect(
            formatSpellSource(
                makeEntry({
                    sourceDocumentTitle: "5e Core Rules",
                    page: "phb 241",
                })
            )
        ).toBe("5e Core Rules · phb 241");
    });
});

describe("formatSpellLists", () => {
    it("humanizes hyphenated class slugs", () => {
        expect(formatSpellLists(makeEntry({ spellLists: [] }))).toBe("");
        expect(
            formatSpellLists(
                makeEntry({ spellLists: ["wizard", "eldritch-knight"] })
            )
        ).toBe("Wizard, Eldritch Knight");
    });
});

describe("buildSpellCatalogDetailRows", () => {
    it("includes material, ritual, and archetype for identify", () => {
        const catalogEntry = getSpell("identify");
        expect(catalogEntry).toBeDefined();

        const rows = buildSpellCatalogDetailRows(catalogEntry!, formatters);
        const byKey = Object.fromEntries(
            rows.map((row) => [row.labelKey, row])
        );

        expect(byKey.components?.value).toBe(
            "V, S, M (a pearl worth at least 100 gp and an owl feather)"
        );
        expect(byKey.ritual?.value).toBe("Yes");
        expect(byKey.concentration?.value).toBe("No");
        expect(byKey.spellLists?.value).toBe("Bard, Wizard");
        expect(byKey.archetype).toEqual({
            labelKey: "archetype",
            value: "Cleric: Knowledge",
            fullWidth: true,
        });
    });

    it("appends a full-width archetype row and keeps extras first", () => {
        const catalogEntry = getSpell("fireball");
        expect(catalogEntry).toBeDefined();

        const rows = buildSpellCatalogDetailRows(catalogEntry!, formatters, [
            { labelKey: "usage", value: "Uses a level 3 spell slot" },
        ]);

        expect(rows[0]).toEqual({
            labelKey: "usage",
            value: "Uses a level 3 spell slot",
        });
        expect(rows.find((row) => row.labelKey === "archetype")).toEqual({
            labelKey: "archetype",
            value: "Cleric: Light, Warlock: Fiend",
            fullWidth: true,
        });
    });

    it("falls back to the missing-value placeholder for blank fields", () => {
        const rows = buildSpellCatalogDetailRows(
            makeEntry({
                range: "",
                components: "",
                castingTime: "",
                spellLists: [],
            }),
            formatters
        );
        const byKey = Object.fromEntries(rows.map((row) => [row.labelKey, row.value]));

        expect(byKey.range).toBe("—");
        expect(byKey.components).toBe("—");
        expect(byKey.castingTime).toBe("—");
        expect(byKey.spellLists).toBe("—");
    });
});
