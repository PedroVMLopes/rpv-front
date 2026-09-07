import type { SpellCatalogEntry } from "@rpv/content";
import { getSpell } from "@rpv/content";
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
    tRitual: () => "Cast as ritual",
    missingValue: "—",
};

function catalogSpell(
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
        spellLists: [],
        archetype: "",
        page: "",
        sourceDocument: "",
        sourceDocumentTitle: "",
        ...overrides,
    };
}

describe("formatSpellComponents", () => {
    it("appends trimmed material in parentheses", () => {
        expect(
            formatSpellComponents(
                catalogSpell({
                    components: "V, S, M",
                    material: "  a pearl worth 100 gp  ",
                })
            )
        ).toBe("V, S, M (a pearl worth 100 gp)");
    });

    it("returns components unchanged when material is blank", () => {
        expect(
            formatSpellComponents(catalogSpell({ components: "V, S", material: "  " }))
        ).toBe("V, S");
    });
});

describe("formatSpellSource", () => {
    it("joins document title and page, skipping blanks", () => {
        expect(
            formatSpellSource(
                catalogSpell({
                    sourceDocumentTitle: "5e Core Rules",
                    page: "phb 231",
                })
            )
        ).toBe("5e Core Rules · phb 231");
        expect(
            formatSpellSource(
                catalogSpell({ sourceDocumentTitle: "  SRD  ", page: "" })
            )
        ).toBe("SRD");
        expect(
            formatSpellSource(catalogSpell({ sourceDocumentTitle: " ", page: " " }))
        ).toBeUndefined();
    });
});

describe("formatSpellLists", () => {
    it("title-cases hyphenated list slugs", () => {
        expect(
            formatSpellLists(
                catalogSpell({ spellLists: ["wizard", "life-domain"] })
            )
        ).toBe("Wizard, Life Domain");
        expect(formatSpellLists(catalogSpell({ spellLists: [] }))).toBe("");
    });
});

describe("buildSpellCatalogDetailRows", () => {
    it("uses missing-value placeholders and omits a blank archetype", () => {
        const rows = buildSpellCatalogDetailRows(
            catalogSpell({
                range: "",
                components: "",
                material: "",
                castingTime: "",
                spellLists: [],
                requiresConcentration: false,
                canBeCastAsRitual: false,
            }),
            formatters
        );

        expect(rows).toEqual([
            { labelKey: "range", value: "—" },
            { labelKey: "components", value: "—" },
            { labelKey: "concentration", value: "No" },
            { labelKey: "ritual", value: "No" },
            { labelKey: "castingTime", value: "—" },
            { labelKey: "spellLists", value: "—" },
        ]);
    });

    it("appends extras, ritual yes, and a full-width archetype row", () => {
        const rows = buildSpellCatalogDetailRows(
            catalogSpell({
                canBeCastAsRitual: true,
                requiresConcentration: true,
                spellLists: ["cleric"],
                archetype: "Life Domain",
                material: "holy water",
                components: "V, S, M",
            }),
            formatters,
            [{ labelKey: "school", value: "Evocation" }]
        );

        expect(rows[0]).toEqual({ labelKey: "school", value: "Evocation" });
        expect(rows.find((row) => row.labelKey === "components")?.value).toBe(
            "V, S, M (holy water)"
        );
        expect(rows.find((row) => row.labelKey === "concentration")?.value).toBe(
            "Yes"
        );
        expect(rows.find((row) => row.labelKey === "ritual")?.value).toBe("Yes");
        expect(rows.find((row) => row.labelKey === "archetype")).toEqual({
            labelKey: "archetype",
            value: "Life Domain",
            fullWidth: true,
        });
    });

    it("formats detect-magic catalog fields used by the pick/detail cards", () => {
        const detectMagic = getSpell("detect-magic");
        expect(detectMagic).toBeDefined();

        const rows = buildSpellCatalogDetailRows(detectMagic!, formatters);

        expect(rows.find((row) => row.labelKey === "ritual")?.value).toBe("Yes");
        expect(rows.find((row) => row.labelKey === "concentration")?.value).toBe(
            "Yes"
        );
        expect(formatSpellSource(detectMagic!)).toBe("5e Core Rules · phb 231");
    });
});
