import { deriveResourcesFromForm } from "../lib/character/deriveResourcesFromForm";
import { buildNewStoredCharacter } from "../lib/character/buildCharacter";

const baseFormData = {
    name: "Test",
    race: "human",
    level: 1,
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 10 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("deriveResourcesFromForm", () => {
    it("returns empty resources when no class is selected", () => {
        expect(deriveResourcesFromForm(baseFormData, "en")).toEqual({});
    });

    it("derives wizard spell slots at level 1", () => {
        expect(
            deriveResourcesFromForm(
                { ...baseFormData, characterClass: "wizard", level: 1 },
                "en"
            )
        ).toEqual({ "spell-slots-1": 2 });
    });

    it("derives wizard spell slot totals at level 5", () => {
        expect(
            deriveResourcesFromForm(
                { ...baseFormData, characterClass: "wizard", level: 5 },
                "en"
            )
        ).toMatchObject({
            "spell-slots-1": 4,
            "spell-slots-2": 3,
            "spell-slots-3": 2,
            "spell-slots-4": 1,
        });
    });

    it("derives barbarian rage uses at level 5", () => {
        expect(
            deriveResourcesFromForm(
                {
                    ...baseFormData,
                    characterClass: "barbarian",
                    subclass: "barbarian-berserker",
                    level: 5,
                },
                "en"
            )
        ).toMatchObject({ "rage-uses": 3 });
    });

    it("derives monk ki points at level 5", () => {
        expect(
            deriveResourcesFromForm(
                {
                    ...baseFormData,
                    characterClass: "monk",
                    subclass: "monk-open-hand",
                    level: 5,
                },
                "en"
            )
        ).toMatchObject({ "ki-points": 5 });
    });

    it("ignores subclass when level is below subclass unlock", () => {
        const withSubclass = deriveResourcesFromForm(
            {
                ...baseFormData,
                characterClass: "barbarian",
                subclass: "barbarian-berserker",
                level: 2,
            },
            "en"
        );
        const withoutSubclass = deriveResourcesFromForm(
            {
                ...baseFormData,
                characterClass: "barbarian",
                level: 2,
            },
            "en"
        );

        expect(withSubclass).toEqual(withoutSubclass);
    });

    it("matches buildStoredCharacter derived resources", () => {
        const formData = {
            ...baseFormData,
            characterClass: "wizard",
            level: 3,
        };

        const stored = buildNewStoredCharacter(formData, "player", "dnd", "en");
        const derived = deriveResourcesFromForm(formData, "en");

        for (const [ref, count] of Object.entries(derived)) {
            expect(stored.resources[ref]).toBe(count);
        }
    });
});
