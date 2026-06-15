import {
    buildHpDerivationContextFromForm,
    deriveMaxHpFromForm,
} from "../lib/character/hp";

describe("hp derivation helpers", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("builds derivation context from form data", () => {
        expect(
            buildHpDerivationContextFromForm(
                {
                    characterClass: "fighter",
                    level: 3,
                    attributes: baseAttributes,
                },
                "dnd",
                "en"
            )
        ).toEqual({
            level: 3,
            constitution: 14,
            classSlug: "fighter",
            hitDie: 10,
        });
    });

    it("includes race ASI in resolved constitution", () => {
        expect(
            deriveMaxHpFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    race: "dwarf",
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "constitution"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                },
                "dnd",
                "en"
            )
        ).toBe(11);
    });
});
