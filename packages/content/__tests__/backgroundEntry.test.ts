import type { BackgroundEntry, FlavorTable } from "../src";
import { getBackground } from "../src";
import { localizeCurationEntry } from "../src/curation/curationLocale";

const flavorTableFixture: FlavorTable = {
    slug: "personality-traits",
    bindTo: "personalityTraits",
    pickCount: 2,
    roll: "d8",
    allowCustom: true,
    options: [
        { slug: "trait-01", label: "I quote ancient texts." },
        { slug: "trait-02", label: "I speak in riddles." },
    ],
};

const backgroundWithTables: BackgroundEntry = {
    slug: "sage",
    name: "Sage",
    description: "You spent years learning the lore of the multiverse.",
    grants: [],
    flavorTables: [flavorTableFixture],
};

describe("BackgroundEntry flavorTables contract", () => {
    it("leaves production sage without flavorTables", () => {
        const sage = getBackground("sage");
        expect(sage?.slug).toBe("sage");
        expect(sage?.flavorTables).toBeUndefined();
    });

    it("preserves flavorTables when localizing name and description", () => {
        const localized = localizeCurationEntry(
            backgroundWithTables,
            "backgrounds",
            "pt-BR"
        );

        expect(localized.name).toBe("Sábio");
        expect(localized.description).toMatch(/multiverso/i);
        expect(localized.flavorTables).toEqual(backgroundWithTables.flavorTables);
        expect(localized.grants).toEqual([]);
    });

    it("falls back to English when the overlay has no slug", () => {
        const unknown: BackgroundEntry = {
            slug: "unknown-background",
            name: "Unknown",
            description: "No overlay.",
            grants: [],
            flavorTables: [flavorTableFixture],
        };

        const localized = localizeCurationEntry(unknown, "backgrounds", "pt-BR");
        expect(localized).toEqual(unknown);
    });
});

describe("background locale overlays", () => {
    it("returns English sage by default", () => {
        expect(getBackground("sage")?.name).toBe("Sage");
        expect(getBackground("sage", "en")?.name).toBe("Sage");
    });

    it("applies the pt-BR overlay for sage", () => {
        const sage = getBackground("sage", "pt-BR");
        expect(sage?.name).toBe("Sábio");
        expect(sage?.description).toMatch(/multiverso/i);
        expect(sage?.flavorTables).toBeUndefined();
    });
});
