import { contentRepo } from "../lib/content/contentRepository";
import { buildCatalogDetailModel } from "../lib/character/creation/buildCatalogDetailModel";
import { extractRaceGrants } from "../lib/character/creation/extractCatalogGrants";

describe("race catalog details", () => {
    it("includes fixed racial languages in race grants", () => {
        const dwarf = contentRepo("dnd").getRace("dwarf", "en");

        expect(dwarf).toBeDefined();

        const languageRefs = extractRaceGrants(dwarf!)
            .filter((grant) => grant.grantType === "language")
            .flatMap((grant) => grant.options ?? [])
            .filter((option) => option.optionType === "language")
            .map((option) => option.ref);

        expect(languageRefs).toEqual(
            expect.arrayContaining(["common", "dwarvish"])
        );
    });

    it("includes fixed and selectable half-elf languages", () => {
        const halfElf = contentRepo("dnd").getRace("half-elf", "en");

        expect(halfElf).toBeDefined();

        const languageGrants = extractRaceGrants(halfElf!).filter(
            (grant) => grant.grantType === "language"
        );

        expect(languageGrants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    choose: 0,
                    options: expect.arrayContaining([
                        expect.objectContaining({ ref: "common" }),
                        expect.objectContaining({ ref: "elvish" }),
                    ]),
                }),
                expect.objectContaining({
                    choose: 1,
                    selectionFilter: { any: true },
                }),
            ])
        );
    });

    it("builds full-width age and alignment rows without source labels", () => {
        const model = buildCatalogDetailModel(
            {
                slug: "dwarf",
                title: "Dwarf",
                summary: "Dwarf summary",
                detailDescription: "Dwarf traits.",
                grants: [],
                metadata: {
                    ageDesc:
                        "**_Age._** Dwarves mature at the same rate as humans.",
                    alignmentDesc:
                        "**_Alignment._** Most dwarves are lawful.",
                },
            },
            "race"
        );

        expect(model.sections[0]?.rows).toEqual([
            {
                labelKey: "age",
                value: "Dwarves mature at the same rate as humans.",
                fullWidth: true,
            },
            {
                labelKey: "alignment",
                value: "Most dwarves are lawful.",
                fullWidth: true,
            },
        ]);
    });

    it("strips markdown from description and ability score increase", () => {
        const model = buildCatalogDetailModel(
            {
                slug: "dwarf",
                title: "Dwarf",
                summary: "Dwarf summary",
                detailDescription:
                    "## Dwarf Traits\nYour dwarf character has an assortment of inborn abilities.",
                grants: [],
                metadata: {
                    asiDesc:
                        "**_Ability Score Increase._** Your Constitution score increases by 2.",
                },
            },
            "race"
        );

        expect(model.description).toBe(
            "Dwarf Traits Your dwarf character has an assortment of inborn abilities."
        );
        expect(model.sections[0]?.rows).toEqual([
            {
                labelKey: "abilityScores",
                value: "Your Constitution score increases by 2.",
            },
        ]);
    });

    it("builds class hit-die and subclass-level rows without race-only fields", () => {
        const model = buildCatalogDetailModel(
            {
                slug: "fighter",
                title: "Fighter",
                summary: "A master of martial combat.",
                detailDescription: "Fighters share an unparalleled mastery of weapons.",
                grants: [],
                metadata: {
                    hitDie: 10,
                    subclassLevel: 3,
                    size: "Medium",
                    speedWalk: 30,
                    ageDesc: "**_Age._** Fighters age like humans.",
                    alignmentDesc: "**_Alignment._** Any alignment.",
                },
            },
            "class"
        );

        expect(model.sections[0]?.rows).toEqual([
            { labelKey: "hitDie", value: "d10" },
            { labelKey: "subclassLevel", value: "3" },
            { labelKey: "size", value: "Medium" },
            { labelKey: "speed", value: "30 ft" },
        ]);
    });

    it("builds race size and speed rows and skips blank metadata", () => {
        const model = buildCatalogDetailModel(
            {
                slug: "elf",
                title: "Elf",
                summary: "Elf summary",
                detailDescription: "",
                grants: [],
                metadata: {
                    size: "Medium",
                    speedWalk: 30,
                    asiDesc: "   ",
                    ageDesc: "   ",
                    alignmentDesc: "",
                },
            },
            "race"
        );

        expect(model.description).toBeUndefined();
        expect(model.sections[0]?.rows).toEqual([
            { labelKey: "size", value: "Medium" },
            { labelKey: "speed", value: "30 ft" },
        ]);
    });

    it("omits the metadata section when nothing is present", () => {
        const model = buildCatalogDetailModel(
            {
                slug: "sage",
                title: "Sage",
                summary: "A scholar.",
                detailDescription: "You spent years learning lore.",
                grants: [],
            },
            "background"
        );

        expect(model.sections).toEqual([]);
        expect(model.kind).toBe("catalog");
        expect(model.catalogGrants).toEqual([]);
    });
});
