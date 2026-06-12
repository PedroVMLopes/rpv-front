import type { Catalog, CatalogTranslations } from "../src/catalog/catalog.types";
import { getRace, getSpell, getSubrace, listRaces } from "../src/catalog/read";

const catalog: Catalog = {
    generatedAt: "2026-01-01T00:00:00.000Z",
    source: "open5e",
    defaultLocale: "en",
    races: [
        {
            slug: "dwarf",
            language: "en",
            name: "Dwarf",
            system: "dnd",
            sourceDocument: "wotc-srd",
            description: "Tough mountain folk.",
            size: "Medium",
            speedWalk: 25,
            languagesDesc: "Common, Dwarvish",
            visionDesc: "Darkvision",
            asiDesc: "+2 Constitution",
            traits: [],
            subraces: [
                {
                    slug: "hill-dwarf",
                    raceSlug: "dwarf",
                    language: "en",
                    name: "Hill Dwarf",
                    description: "Wise and tough.",
                    asiDesc: "+1 Wisdom",
                    traits: [],
                },
            ],
        },
    ],
    spells: [
        {
            slug: "acid-splash",
            language: "en",
            name: "Acid Splash",
            levelInt: 0,
            level: "cantrip",
            school: "Conjuration",
            castingTime: "1 action",
            range: "60 feet",
            components: "V, S",
            duration: "Instantaneous",
            requiresConcentration: false,
            canBeCastAsRitual: false,
            description: "You hurl a bubble of acid.",
            higherLevel: "",
            spellLists: ["wizard"],
            sourceDocument: "wotc-srd",
        },
    ],
    skills: [],
    languages: [],
};

const ptBR: CatalogTranslations = {
    races: { dwarf: { name: "Anão" } },
    subraces: { "hill-dwarf": { name: "Anão da Colina" } },
    spells: { "acid-splash": { name: "Respingo Ácido" } },
};

describe("locale-aware catalog reads", () => {
    it("returns base English text when no locale is requested", () => {
        expect(getRace(catalog, "dwarf")?.name).toBe("Dwarf");
        expect(getSpell(catalog, "acid-splash")?.name).toBe("Acid Splash");
    });

    it("applies the overlay translation for a requested locale", () => {
        const race = getRace(catalog, "dwarf", "pt-BR", ptBR);
        expect(race?.name).toBe("Anão");
        expect(race?.language).toBe("pt-BR");
        expect(race?.subraces[0].name).toBe("Anão da Colina");
        expect(getSpell(catalog, "acid-splash", "pt-BR", ptBR)?.name).toBe(
            "Respingo Ácido"
        );
    });

    it("falls back to base text for fields the overlay omits", () => {
        const race = getRace(catalog, "dwarf", "pt-BR", ptBR);
        // name is translated, description is not provided in the overlay
        expect(race?.description).toBe("Tough mountain folk.");
    });

    it("falls back to base text when the slug is missing from the overlay", () => {
        const sparse: CatalogTranslations = { races: {} };
        expect(getRace(catalog, "dwarf", "pt-BR", sparse)?.name).toBe("Dwarf");
    });

    it("localizes lists as well as single lookups", () => {
        const races = listRaces(catalog, "pt-BR", ptBR);
        expect(races[0].name).toBe("Anão");
    });

    it("resolves subraces independently", () => {
        expect(getSubrace(catalog, "hill-dwarf", "pt-BR", ptBR)?.name).toBe(
            "Anão da Colina"
        );
    });
});
