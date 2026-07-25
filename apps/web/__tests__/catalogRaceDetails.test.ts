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
});
