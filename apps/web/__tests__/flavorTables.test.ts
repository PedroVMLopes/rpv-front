import type { FlavorTable } from "@rpv/content";
import {
    boundFlavorTables,
    flavorFieldMatchesTable,
    flavorTableFormPath,
    joinFlavorSlots,
    listFilledBackgroundDetails,
    parseFlavorSlots,
    sanitizeFlavorFieldsOnBackgroundChange,
    selectValueForFlavorSlot,
    unboundFlavorTables,
    BACKGROUND_DETAILS_KEY,
    FLAVOR_CUSTOM_SENTINEL,
} from "../lib/character/flavorTables";

const table: FlavorTable = {
    slug: "ideals",
    bindTo: "ideals",
    pickCount: 1,
    allowCustom: true,
    options: [
        { slug: "ideal-01", label: "Truth first." },
        { slug: "ideal-02", label: "Share what you know." },
    ],
};

const traitsTable: FlavorTable = {
    slug: "personality-traits",
    bindTo: "personalityTraits",
    pickCount: 2,
    allowCustom: true,
    options: [
        { slug: "trait-01", label: "I annotate everything." },
        { slug: "trait-02", label: "Silence makes me restless." },
        { slug: "trait-03", label: "I trust a diagram." },
    ],
};

describe("boundFlavorTables", () => {
    it("keeps only tables with bindTo", () => {
        expect(
            boundFlavorTables({
                flavorTables: [
                    table,
                    { ...table, slug: "unbound", bindTo: undefined },
                    { ...table, slug: "blank", bindTo: "  " },
                ],
            }).map((entry) => entry.slug)
        ).toEqual(["ideals"]);
    });
});

describe("unboundFlavorTables / flavorTableFormPath", () => {
    const unbound: FlavorTable = {
        slug: "guild-business",
        pickCount: 1,
        allowCustom: true,
        options: [{ slug: "guild-business-01", label: "Alchemists" }],
    };

    it("keeps tables without bindTo", () => {
        expect(
            unboundFlavorTables({
                flavorTables: [
                    table,
                    unbound,
                    { ...table, slug: "blank", bindTo: "  " },
                ],
            }).map((entry) => entry.slug)
        ).toEqual(["guild-business", "blank"]);
    });

    it("uses bindTo for bound tables and backgroundDetails.slug otherwise", () => {
        expect(flavorTableFormPath(table)).toBe("ideals");
        expect(flavorTableFormPath(unbound)).toBe(
            `${BACKGROUND_DETAILS_KEY}.guild-business`
        );
    });
});

describe("listFilledBackgroundDetails", () => {
    it("returns only non-empty string entries", () => {
        expect(
            listFilledBackgroundDetails({
                [BACKGROUND_DETAILS_KEY]: {
                    "guild-business": "Alchemists",
                    empty: "  ",
                    missing: undefined,
                },
            })
        ).toEqual([{ slug: "guild-business", value: "Alchemists" }]);
        expect(listFilledBackgroundDetails({})).toEqual([]);
    });
});

describe("joinFlavorSlots / parseFlavorSlots", () => {
    it("joins non-trailing slots with newlines", () => {
        expect(joinFlavorSlots(["First trait", "Second trait"])).toBe(
            "First trait\nSecond trait"
        );
        expect(joinFlavorSlots(["Only one", ""])).toBe("Only one");
        expect(joinFlavorSlots(["", "Second"])).toBe("\nSecond");
    });

    it("parses pickCount 1 without splitting custom newlines", () => {
        expect(parseFlavorSlots("line one\nline two", 1)).toEqual([
            "line one\nline two",
        ]);
    });

    it("parses pickCount 2 into independent slots", () => {
        expect(parseFlavorSlots("First trait\nSecond trait", 2)).toEqual([
            "First trait",
            "Second trait",
        ]);
        expect(parseFlavorSlots("Only one", 2)).toEqual(["Only one", ""]);
        expect(parseFlavorSlots("one\ntwo\nthree", 2)).toEqual([
            "one",
            "two\nthree",
        ]);
    });
});

describe("flavorFieldMatchesTable", () => {
    it("matches a single catalog label", () => {
        expect(flavorFieldMatchesTable("Truth first.", table)).toBe(true);
        expect(flavorFieldMatchesTable("My own ideal.", table)).toBe(false);
        expect(flavorFieldMatchesTable("", table)).toBe(false);
    });

    it("matches pickCount 2 when every line is a catalog label", () => {
        expect(
            flavorFieldMatchesTable(
                "I annotate everything.\nSilence makes me restless.",
                traitsTable
            )
        ).toBe(true);
        expect(
            flavorFieldMatchesTable(
                "I annotate everything.\nA custom aside.",
                traitsTable
            )
        ).toBe(false);
    });
});

describe("sanitizeFlavorFieldsOnBackgroundChange", () => {
    const previous = { flavorTables: [table, traitsTable] };

    it("clears fields that are exactly previous table labels", () => {
        expect(
            sanitizeFlavorFieldsOnBackgroundChange({
                previous,
                next: undefined,
                values: {
                    ideals: "Truth first.",
                    personalityTraits:
                        "I annotate everything.\nSilence makes me restless.",
                    bonds: "Custom stays.",
                },
            })
        ).toEqual({
            ideals: "",
            personalityTraits: "",
            [BACKGROUND_DETAILS_KEY]: {},
        });
    });

    it("keeps custom text even when leaving a background with tables", () => {
        expect(
            sanitizeFlavorFieldsOnBackgroundChange({
                previous,
                next: undefined,
                values: {
                    ideals: "I wrote this myself.",
                    personalityTraits: "I annotate everything.\nAlso my words.",
                    [BACKGROUND_DETAILS_KEY]: { "guild-business": "Alchemists" },
                },
            })
        ).toEqual({
            [BACKGROUND_DETAILS_KEY]: {},
        });
    });
});

describe("selectValueForFlavorSlot", () => {
    it("maps catalog labels to slugs and unmatched text to custom", () => {
        expect(selectValueForFlavorSlot("Truth first.", table)).toBe("ideal-01");
        expect(selectValueForFlavorSlot("Mine.", table)).toBe(FLAVOR_CUSTOM_SENTINEL);
        expect(selectValueForFlavorSlot("", table)).toBe("");
    });
});
