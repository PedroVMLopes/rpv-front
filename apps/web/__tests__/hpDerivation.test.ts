import {
    buildHpDerivationContextFromForm,
    deriveMaxHpFromForm,
    resolveMaxHpFromForm,
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

    it("includes equipped constitution item grants in the class HP formula", () => {
        expect(
            deriveMaxHpFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "constitution"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                    inventory: {
                        bag: [{ slug: "rpv_belt-of-constitution", quantity: 1 }],
                        equipped: { amulet: "rpv_belt-of-constitution" },
                    },
                },
                "dnd",
                "en"
            )
        ).toBe(11);
    });

    it("does not apply bag-only constitution items to the HP formula", () => {
        expect(
            deriveMaxHpFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "constitution"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                    inventory: {
                        bag: [{ slug: "rpv_belt-of-constitution", quantity: 1 }],
                        equipped: {},
                    },
                },
                "dnd",
                "en"
            )
        ).toBe(10);
    });

    it("adds equipped hit point item modifiers on top of the class formula", () => {
        expect(
            resolveMaxHpFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes,
                    inventory: {
                        bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
                        equipped: { amulet: "rpv_amulet-of-vitality" },
                    },
                },
                "dnd",
                "en"
            )
        ).toBe(17);
    });

    it("does not add bag-only hit point items to resolved max HP", () => {
        expect(
            resolveMaxHpFromForm(
                {
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes,
                    inventory: {
                        bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
                        equipped: {},
                    },
                },
                "dnd",
                "en"
            )
        ).toBe(12);
    });
});
