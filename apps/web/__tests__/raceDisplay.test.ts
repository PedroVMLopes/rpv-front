import {
    getRaceLineFromSelections,
    getRaceTraitDisplay,
    formatUnresolvedChoice,
} from "../lib/character/raceDisplay";

describe("raceDisplay", () => {
    it("resolves race and subrace names from slugs", () => {
        expect(
            getRaceLineFromSelections(
                { race: "elf", subrace: "high-elf", choices: {} },
                "en"
            )
        ).toBe("Elf · High Elf");
    });

    it("returns localized race names for pt-BR", () => {
        expect(
            getRaceLineFromSelections({ race: "elf", choices: {} }, "pt-BR")
        ).toBe("Elfo");
    });

    it("collects non-ASI traits and unresolved choices", () => {
        const { traits, unresolvedChoices } = getRaceTraitDisplay(
            { race: "elf", subrace: "high-elf", choices: {} },
            "en"
        );

        expect(traits.some((trait) => trait.slug === "fey-ancestry")).toBe(true);
        expect(traits.some((trait) => trait.slug === "vision")).toBe(true);
        expect(
            unresolvedChoices.some((choice) =>
                formatUnresolvedChoice(choice).includes("cantrip")
            )
        ).toBe(true);
    });
});
