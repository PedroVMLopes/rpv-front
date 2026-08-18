import { getBackground, getBackgroundGrants } from "../src";
import { localizeCurationEntry } from "../src/curation/curationLocale";

const expectedTableBindTo: Record<string, { bindTo: string; pickCount: number }> =
    {
        "personality-traits": { bindTo: "personalityTraits", pickCount: 2 },
        ideals: { bindTo: "ideals", pickCount: 1 },
        bonds: { bindTo: "bonds", pickCount: 1 },
        flaws: { bindTo: "flaws", pickCount: 1 },
    };

describe("BackgroundEntry flavorTables contract", () => {
    it("authors four bound flavor tables on production sage", () => {
        const sage = getBackground("sage");
        expect(sage?.slug).toBe("sage");
        expect(sage?.flavorTables).toHaveLength(4);

        const slugs = sage?.flavorTables?.map((table) => table.slug);
        expect(slugs).toEqual([
            "personality-traits",
            "ideals",
            "bonds",
            "flaws",
        ]);

        for (const table of sage?.flavorTables ?? []) {
            const expected = expectedTableBindTo[table.slug];
            expect(table.bindTo).toBe(expected.bindTo);
            expect(table.pickCount).toBe(expected.pickCount);
            expect(table.allowCustom).toBe(true);
            expect(table.roll).toBeUndefined();
            expect(table.options.length).toBeGreaterThanOrEqual(2);
        }
    });

    it("preserves flavorTables when localizing name and description", () => {
        const sage = getBackground("sage");
        expect(sage).toBeDefined();
        const tables = sage!.flavorTables;
        expect(tables).toBeDefined();

        const localized = localizeCurationEntry(sage!, "backgrounds", "pt-BR");

        expect(localized.name).toBe("Sábio");
        expect(localized.description).toMatch(/multiverso/i);
        expect(localized.flavorTables).toEqual(tables);
    });

    it("falls back to English when the overlay has no slug", () => {
        const unknown = {
            slug: "unknown-background",
            name: "Unknown",
            description: "No overlay.",
            grants: [] as const,
            flavorTables: getBackground("sage")?.flavorTables,
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
        expect(sage?.flavorTables).toEqual(getBackground("sage")?.flavorTables);
    });
});

describe("getBackgroundGrants", () => {
    it("keeps sage loot at grant index 2 and appends Researcher", () => {
        const grants = getBackgroundGrants("sage");

        expect(grants[2]).toMatchObject({
            grantType: "inventory_item",
            ref: "rpv_scroll-of-fire-bolt",
        });
        expect(grants.some((grant) => grant.description === "Researcher")).toBe(
            true
        );
        expect(grants.at(-1)).toMatchObject({
            grantType: "ability",
            choose: 0,
            description: "Researcher",
        });
    });

    it("authors acolyte skills, language picks, and Shelter of the Faithful without loot", () => {
        const grants = getBackgroundGrants("acolyte");

        expect(grants[0]).toMatchObject({
            grantType: "skill_proficiency",
            choose: 0,
            options: [
                { optionType: "skill", ref: "insight" },
                { optionType: "skill", ref: "religion" },
            ],
        });
        expect(grants[1]).toMatchObject({
            grantType: "language",
            choose: 2,
        });
        expect(grants.at(-1)).toMatchObject({
            grantType: "ability",
            choose: 0,
            description: "Shelter of the Faithful",
        });
        expect(
            grants.some(
                (grant) =>
                    grant.grantType === "inventory_item" ||
                    grant.grantType === "currency"
            )
        ).toBe(false);
    });
});

describe("acolyte flavorTables", () => {
    const expectedRoll: Record<string, string> = {
        "personality-traits": "d8",
        ideals: "d6",
        bonds: "d6",
        flaws: "d6",
    };
    const expectedOptionCount: Record<string, number> = {
        "personality-traits": 8,
        ideals: 6,
        bonds: 6,
        flaws: 6,
    };

    it("authors four bound SRD flavor tables", () => {
        const acolyte = getBackground("acolyte");
        expect(acolyte?.slug).toBe("acolyte");
        expect(acolyte?.flavorTables).toHaveLength(4);

        const slugs = acolyte?.flavorTables?.map((table) => table.slug);
        expect(slugs).toEqual([
            "personality-traits",
            "ideals",
            "bonds",
            "flaws",
        ]);

        for (const table of acolyte?.flavorTables ?? []) {
            const expected = expectedTableBindTo[table.slug];
            expect(table.bindTo).toBe(expected.bindTo);
            expect(table.pickCount).toBe(expected.pickCount);
            expect(table.allowCustom).toBe(true);
            expect(table.roll).toBe(expectedRoll[table.slug]);
            expect(table.options).toHaveLength(expectedOptionCount[table.slug]);
        }
    });

    it("preserves flavorTables when localizing acolyte name and description", () => {
        const acolyte = getBackground("acolyte");
        expect(acolyte).toBeDefined();
        const tables = acolyte!.flavorTables;

        const localized = localizeCurationEntry(acolyte!, "backgrounds", "pt-BR");

        expect(localized.name).toBe("Acólito");
        expect(localized.description).toMatch(/templo/i);
        expect(localized.flavorTables).toEqual(tables);
    });
});
