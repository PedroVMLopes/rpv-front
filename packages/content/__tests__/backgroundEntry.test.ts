import { getBackground, getBackgroundGrants } from "../src";
import { localizeCurationEntry } from "../src/curation/curationLocale";

function flavorOptionLabel(
    entry:
        | {
              flavorTables?: Array<{
                  slug: string;
                  options: Array<{ slug: string; label: string }>;
              }>;
          }
        | undefined,
    tableSlug: string,
    optionSlug: string
): string | undefined {
    return entry?.flavorTables
        ?.find((table) => table.slug === tableSlug)
        ?.options.find((option) => option.slug === optionSlug)?.label;
}

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

    it("overlays sage option labels in pt-BR without mutating English", () => {
        const sage = getBackground("sage");
        expect(sage).toBeDefined();
        const englishIdeal = flavorOptionLabel(sage, "ideals", "sage-ideal-01");
        expect(englishIdeal).toBe("Truth first: a beautiful lie is still a lie.");

        const localized = localizeCurationEntry(sage!, "backgrounds", "pt-BR");

        expect(localized.name).toBe("Sábio");
        expect(localized.description).toMatch(/multiverso/i);
        expect(flavorOptionLabel(localized, "ideals", "sage-ideal-01")).toBe(
            "A verdade primeiro: uma mentira bela continua sendo mentira."
        );
        const ideals = localized.flavorTables?.find(
            (table) => table.slug === "ideals"
        );
        expect(ideals?.bindTo).toBe("ideals");
        expect(ideals?.pickCount).toBe(1);
        expect(ideals?.roll).toBeUndefined();
        expect(flavorOptionLabel(sage, "ideals", "sage-ideal-01")).toBe(
            englishIdeal
        );
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
        const english = getBackground("sage");
        const sage = getBackground("sage", "pt-BR");
        expect(sage?.name).toBe("Sábio");
        expect(sage?.description).toMatch(/multiverso/i);
        expect(flavorOptionLabel(sage, "ideals", "sage-ideal-01")).toBe(
            "A verdade primeiro: uma mentira bela continua sendo mentira."
        );
        expect(flavorOptionLabel(english, "ideals", "sage-ideal-01")).toBe(
            "Truth first: a beautiful lie is still a lie."
        );
        expect(flavorOptionLabel(getBackground("sage", "en"), "ideals", "sage-ideal-01")).toBe(
            "Truth first: a beautiful lie is still a lie."
        );
    });

    it("keeps English labels for options missing from the overlay", () => {
        const sage = getBackground("sage");
        const traits = sage?.flavorTables?.find(
            (table) => table.slug === "personality-traits"
        );
        expect(traits).toBeDefined();

        const localized = localizeCurationEntry(
            {
                ...sage!,
                flavorTables: [
                    {
                        ...traits!,
                        options: [
                            ...traits!.options,
                            {
                                slug: "sage-trait-missing",
                                label: "English only.",
                            },
                        ],
                    },
                ],
            },
            "backgrounds",
            "pt-BR"
        );

        expect(
            flavorOptionLabel(localized, "personality-traits", "sage-trait-01")
        ).toMatch(/margens/i);
        expect(
            flavorOptionLabel(
                localized,
                "personality-traits",
                "sage-trait-missing"
            )
        ).toBe("English only.");
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

    it("authors guild-artisan skills, a tool pick, a language pick, and Guild Membership without loot", () => {
        const grants = getBackgroundGrants("guild-artisan");

        expect(grants[0]).toMatchObject({
            grantType: "skill_proficiency",
            choose: 0,
            options: [
                { optionType: "skill", ref: "insight" },
                { optionType: "skill", ref: "persuasion" },
            ],
        });
        expect(grants[1]).toMatchObject({
            grantType: "tool_proficiency",
            choose: 1,
        });
        expect(grants[1]?.options).toHaveLength(17);
        expect(grants[2]).toMatchObject({
            grantType: "language",
            choose: 1,
        });
        expect(grants.at(-1)).toMatchObject({
            grantType: "ability",
            choose: 0,
            description: "Guild Membership",
        });
        expect(
            grants.some(
                (grant) =>
                    grant.grantType === "inventory_item" ||
                    grant.grantType === "currency"
            )
        ).toBe(false);
    });

    it("authors charlatan skills, fixed kits, and False Identity without loot or language picks", () => {
        const grants = getBackgroundGrants("charlatan");

        expect(grants[0]).toMatchObject({
            grantType: "skill_proficiency",
            choose: 0,
            options: [
                { optionType: "skill", ref: "deception" },
                { optionType: "skill", ref: "sleight-of-hand" },
            ],
        });
        expect(grants[1]).toMatchObject({
            grantType: "tool_proficiency",
            choose: 0,
            options: [
                { optionType: "proficiency", ref: "disguise-kit" },
                { optionType: "proficiency", ref: "forgery-kit" },
            ],
        });
        expect(grants.at(-1)).toMatchObject({
            grantType: "ability",
            choose: 0,
            description: "False Identity",
        });
        expect(grants.some((grant) => grant.grantType === "language")).toBe(
            false
        );
        expect(
            grants.some(
                (grant) =>
                    grant.grantType === "inventory_item" ||
                    grant.grantType === "currency"
            )
        ).toBe(false);
    });

    it("authors hermit skills, herbalism kit, a language pick, and Discovery without loot", () => {
        const grants = getBackgroundGrants("hermit");

        expect(grants[0]).toMatchObject({
            grantType: "skill_proficiency",
            choose: 0,
            options: [
                { optionType: "skill", ref: "medicine" },
                { optionType: "skill", ref: "religion" },
            ],
        });
        expect(grants[1]).toMatchObject({
            grantType: "tool_proficiency",
            choose: 0,
            options: [{ optionType: "proficiency", ref: "herbalism-kit" }],
        });
        expect(grants[2]).toMatchObject({
            grantType: "language",
            choose: 1,
        });
        expect(grants.at(-1)).toMatchObject({
            grantType: "ability",
            choose: 0,
            description: "Discovery",
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

    it("overlays acolyte option labels in pt-BR without mutating English", () => {
        const acolyte = getBackground("acolyte");
        expect(acolyte).toBeDefined();
        const englishCharity = flavorOptionLabel(
            acolyte,
            "ideals",
            "acolyte-ideal-02"
        );
        expect(englishCharity).toMatch(/^Charity\./);

        const localized = localizeCurationEntry(acolyte!, "backgrounds", "pt-BR");

        expect(localized.name).toBe("Acólito");
        expect(localized.description).toMatch(/templo/i);
        expect(
            flavorOptionLabel(localized, "ideals", "acolyte-ideal-02")
        ).toBe(
            "Caridade. Sempre tento ajudar quem precisa, custe o que custar. (Bom)"
        );
        const traits = localized.flavorTables?.find(
            (table) => table.slug === "personality-traits"
        );
        expect(traits?.bindTo).toBe("personalityTraits");
        expect(traits?.roll).toBe("d8");
        expect(flavorOptionLabel(acolyte, "ideals", "acolyte-ideal-02")).toBe(
            englishCharity
        );
    });
});

describe("guild-artisan flavorTables", () => {
    it("authors four bound tables and one unbound guild-business table", () => {
        const artisan = getBackground("guild-artisan");
        expect(artisan?.slug).toBe("guild-artisan");
        expect(artisan?.flavorTables).toHaveLength(5);

        const slugs = artisan?.flavorTables?.map((table) => table.slug);
        expect(slugs).toEqual([
            "personality-traits",
            "ideals",
            "bonds",
            "flaws",
            "guild-business",
        ]);

        const bound = artisan?.flavorTables?.filter((table) => table.bindTo);
        for (const table of bound ?? []) {
            const expected = expectedTableBindTo[table.slug];
            expect(table.bindTo).toBe(expected.bindTo);
            expect(table.pickCount).toBe(expected.pickCount);
            expect(table.allowCustom).toBe(true);
            expect(table.roll).toBeUndefined();
            expect(table.options.length).toBeGreaterThanOrEqual(2);
        }

        const business = artisan?.flavorTables?.find(
            (table) => table.slug === "guild-business"
        );
        expect(business?.bindTo).toBeUndefined();
        expect(business?.pickCount).toBe(1);
        expect(business?.roll).toBe("d20");
        expect(business?.allowCustom).toBe(true);
        expect(business?.options).toHaveLength(20);
        expect(business?.options[0]).toMatchObject({
            slug: "guild-business-01",
            label: "Alchemists",
        });
    });

    it("overlays guild-artisan option labels in pt-BR without mutating English", () => {
        const artisan = getBackground("guild-artisan");
        expect(artisan).toBeDefined();
        const englishBusiness = flavorOptionLabel(
            artisan,
            "guild-business",
            "guild-business-01"
        );
        expect(englishBusiness).toBe("Alchemists");

        const localized = localizeCurationEntry(
            artisan!,
            "backgrounds",
            "pt-BR"
        );

        expect(localized.name).toBe("Artesão de Guilda");
        expect(localized.description).toMatch(/guilda/i);
        expect(
            flavorOptionLabel(localized, "guild-business", "guild-business-01")
        ).toBe("Alquimistas");
        const business = localized.flavorTables?.find(
            (table) => table.slug === "guild-business"
        );
        expect(business?.bindTo).toBeUndefined();
        expect(business?.roll).toBe("d20");
        expect(
            flavorOptionLabel(artisan, "guild-business", "guild-business-01")
        ).toBe(englishBusiness);
    });
});

describe("charlatan flavorTables", () => {
    it("authors four bound tables and one unbound favorite-scheme table", () => {
        const charlatan = getBackground("charlatan");
        expect(charlatan?.slug).toBe("charlatan");
        expect(charlatan?.flavorTables).toHaveLength(5);

        const slugs = charlatan?.flavorTables?.map((table) => table.slug);
        expect(slugs).toEqual([
            "personality-traits",
            "ideals",
            "bonds",
            "flaws",
            "favorite-scheme",
        ]);

        const bound = charlatan?.flavorTables?.filter((table) => table.bindTo);
        for (const table of bound ?? []) {
            const expected = expectedTableBindTo[table.slug];
            expect(table.bindTo).toBe(expected.bindTo);
            expect(table.pickCount).toBe(expected.pickCount);
            expect(table.allowCustom).toBe(true);
            expect(table.roll).toBeUndefined();
            expect(table.options.length).toBeGreaterThanOrEqual(2);
        }

        const scheme = charlatan?.flavorTables?.find(
            (table) => table.slug === "favorite-scheme"
        );
        expect(scheme?.bindTo).toBeUndefined();
        expect(scheme?.pickCount).toBe(1);
        expect(scheme?.roll).toBeUndefined();
        expect(scheme?.allowCustom).toBe(true);
        expect(scheme?.options).toHaveLength(3);
        expect(scheme?.options[0]).toMatchObject({
            slug: "charlatan-scheme-01",
            label: "A distant heir who needs a modest loan to claim a fortune.",
        });
    });

    it("overlays charlatan option labels in pt-BR without mutating English", () => {
        const charlatan = getBackground("charlatan");
        expect(charlatan).toBeDefined();
        const englishScheme = flavorOptionLabel(
            charlatan,
            "favorite-scheme",
            "charlatan-scheme-01"
        );

        const localized = localizeCurationEntry(
            charlatan!,
            "backgrounds",
            "pt-BR"
        );

        expect(localized.name).toBe("Charlatão");
        expect(
            flavorOptionLabel(
                localized,
                "favorite-scheme",
                "charlatan-scheme-01"
            )
        ).toMatch(/herdeiro distante/i);
        expect(
            flavorOptionLabel(charlatan, "favorite-scheme", "charlatan-scheme-01")
        ).toBe(englishScheme);
    });
});

describe("hermit flavorTables", () => {
    it("authors four bound tables and one unbound life-of-seclusion table", () => {
        const hermit = getBackground("hermit");
        expect(hermit?.slug).toBe("hermit");
        expect(hermit?.flavorTables).toHaveLength(5);

        const slugs = hermit?.flavorTables?.map((table) => table.slug);
        expect(slugs).toEqual([
            "personality-traits",
            "ideals",
            "bonds",
            "flaws",
            "life-of-seclusion",
        ]);

        const bound = hermit?.flavorTables?.filter((table) => table.bindTo);
        for (const table of bound ?? []) {
            const expected = expectedTableBindTo[table.slug];
            expect(table.bindTo).toBe(expected.bindTo);
            expect(table.pickCount).toBe(expected.pickCount);
            expect(table.allowCustom).toBe(true);
            expect(table.roll).toBeUndefined();
            expect(table.options.length).toBeGreaterThanOrEqual(2);
        }

        const seclusion = hermit?.flavorTables?.find(
            (table) => table.slug === "life-of-seclusion"
        );
        expect(seclusion?.bindTo).toBeUndefined();
        expect(seclusion?.pickCount).toBe(1);
        expect(seclusion?.roll).toBeUndefined();
        expect(seclusion?.allowCustom).toBe(true);
        expect(seclusion?.options).toHaveLength(3);
        expect(seclusion?.options[0]).toMatchObject({
            slug: "hermit-seclusion-01",
            label: "A vow to watch a grove until a promised sign arrived.",
        });
    });

    it("overlays hermit option labels in pt-BR without mutating English", () => {
        const hermit = getBackground("hermit");
        expect(hermit).toBeDefined();
        const englishIdeal = flavorOptionLabel(
            hermit,
            "ideals",
            "hermit-ideal-01"
        );
        expect(englishIdeal).toBe("Quiet is a kind of honesty.");

        const localized = localizeCurationEntry(hermit!, "backgrounds", "pt-BR");

        expect(localized.name).toBe("Eremita");
        expect(flavorOptionLabel(localized, "ideals", "hermit-ideal-01")).toBe(
            "O silêncio é um tipo de honestidade."
        );
        expect(flavorOptionLabel(hermit, "ideals", "hermit-ideal-01")).toBe(
            englishIdeal
        );
    });
});
