import { collectPendingChoiceGrants } from "../lib/character/grantChoices";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const baseSelections = { ...emptyCharacterSelections() };

describe("collectPendingChoiceGrants", () => {
    it("includes class skill choice slots with stable keys", () => {
        const pending = collectPendingChoiceGrants(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "fighter",
            },
            "en"
        );

        const skillChoices = pending.filter(
            (choice) => choice.grant.grantType === "skill_proficiency"
        );

        expect(skillChoices).toHaveLength(2);
        expect(skillChoices.map((choice) => choice.key)).toEqual([
            "class:fighter:skill_proficiency:3:0",
            "class:fighter:skill_proficiency:3:1",
        ]);
    });

    it("resolves skill option labels from catalog", () => {
        const pending = collectPendingChoiceGrants(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "rogue",
            },
            "en"
        );

        const stealthChoice = pending.find((choice) =>
            choice.options.some((option) => option.value === "stealth")
        );

        expect(stealthChoice?.options).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    value: "stealth",
                    label: "Stealth",
                }),
            ])
        );
    });
});
