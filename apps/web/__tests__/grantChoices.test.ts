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
            "class:fighter:base:skill_proficiency:3:0",
            "class:fighter:base:skill_proficiency:3:1",
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

    it("adds level 3 skill choice when character level is 3", () => {
        const level2 = collectPendingChoiceGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
            },
            "en",
            2
        );
        const level3 = collectPendingChoiceGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
            },
            "en",
            3
        );

        expect(level3.length).toBeGreaterThan(level2.length);
        const level3Skill = level3.find(
            (choice) => choice.key === "class:fighter:3:skill_proficiency:0:0"
        );
        expect(level3Skill?.label).toBe("Additional skill (Level 3)");
    });

    it("uses distinct keys for base and level-gated class choices", () => {
        const pending = collectPendingChoiceGrants(
            {
                ...baseSelections,
                characterClass: "wizard",
            },
            "en",
            5
        );
        const spellKeys = pending
            .filter((choice) => choice.grant.grantType === "spell")
            .map((choice) => choice.key);

        expect(new Set(spellKeys).size).toBe(spellKeys.length);
        expect(spellKeys).toEqual(
            expect.arrayContaining([
                "class:wizard:1:spell:2:0",
                "class:wizard:2:spell:2:0",
            ])
        );
    });

    it("exposes named wizard L1 cantrip and leveled spell options", () => {
        const pending = collectPendingChoiceGrants(
            {
                ...baseSelections,
                characterClass: "wizard",
            },
            "en",
            1
        );

        const spellChoices = pending.filter(
            (choice) => choice.grant.grantType === "spell"
        );

        expect(spellChoices).toHaveLength(5);

        for (const choice of spellChoices) {
            expect(choice.options.length).toBeGreaterThan(0);
            expect(choice.options.every((option) => option.label.length > 0)).toBe(
                true
            );
        }

        const cantripChoice = spellChoices.find((choice) =>
            choice.label.toLowerCase().includes("cantrip")
        );
        const leveledChoice = spellChoices.find(
            (choice) =>
                choice.grant.selectionFilter?.levelInt === 1 &&
                !choice.label.toLowerCase().includes("cantrip")
        );

        expect(cantripChoice?.options.map((option) => option.value)).toEqual(
            expect.arrayContaining(["fire-bolt", "acid-splash"])
        );
        expect(leveledChoice?.options.map((option) => option.value)).toEqual(
            expect.arrayContaining(["magic-missile", "shield"])
        );
    });
});
