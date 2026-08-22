import {
    formatExclusiveRequiredMessage,
    isExclusiveChoiceKey,
    resolveGrantPickValidationMessage,
} from "../lib/character/choiceValidationMessages";

describe("formatExclusiveRequiredMessage", () => {
    it("interpolates the group label in both locales", () => {
        expect(formatExclusiveRequiredMessage("en", "Equipment or gold")).toBe(
            "Choose a starting wealth option: Equipment or gold."
        );
        expect(formatExclusiveRequiredMessage("pt-BR", "Equipamento")).toBe(
            "Escolha uma opção de riqueza inicial: Equipamento."
        );
    });
});

describe("resolveGrantPickValidationMessage", () => {
    it("interpolates refs and labels for known codes", () => {
        expect(
            resolveGrantPickValidationMessage(
                { code: "duplicateGrantPick", ref: "athletics" },
                "en"
            )
        ).toBe("Cannot pick athletics more than once across your choices.");
        expect(
            resolveGrantPickValidationMessage(
                { code: "alreadyGranted", ref: "history" },
                "en"
            )
        ).toBe("history is already granted and cannot be chosen again.");
        expect(
            resolveGrantPickValidationMessage(
                {
                    code: "invalidAbilityScorePick",
                    key: "race:half-elf:base:ability_score:1:0",
                    label: "Two other ability scores of your choice",
                },
                "en"
            )
        ).toBe(
            "Invalid ability score choice: Two other ability scores of your choice."
        );
    });

    it("falls back to key when inventory label is missing", () => {
        expect(
            resolveGrantPickValidationMessage(
                {
                    code: "invalidInventoryPick",
                    key: "class:fighter:base:inventory_item:8:0",
                },
                "en"
            )
        ).toBe(
            "Invalid equipment choice: class:fighter:base:inventory_item:8:0."
        );
    });

    it("leaves missing interpolation tokens empty instead of leaking braces", () => {
        expect(
            resolveGrantPickValidationMessage(
                { code: "duplicateGrantPick" },
                "en"
            )
        ).toBe("Cannot pick  more than once across your choices.");
    });

    it("falls back to label, then key, then ref for unknown codes", () => {
        expect(
            resolveGrantPickValidationMessage(
                {
                    code: "not-a-code" as "duplicateGrantPick",
                    label: "Visible label",
                    key: "some-key",
                    ref: "some-ref",
                },
                "en"
            )
        ).toBe("Visible label");
        expect(
            resolveGrantPickValidationMessage(
                {
                    code: "not-a-code" as "duplicateGrantPick",
                    key: "some-key",
                    ref: "some-ref",
                },
                "en"
            )
        ).toBe("some-key");
        expect(
            resolveGrantPickValidationMessage(
                {
                    code: "not-a-code" as "duplicateGrantPick",
                    ref: "some-ref",
                },
                "en"
            )
        ).toBe("some-ref");
    });
});

describe("isExclusiveChoiceKey", () => {
    it("detects exclusive wealth keys and rejects ordinary grant picks", () => {
        expect(
            isExclusiveChoiceKey("class:fighter:base:exclusive:starting-wealth")
        ).toBe(true);
        expect(
            isExclusiveChoiceKey("class:fighter:base:inventory_item:8:0")
        ).toBe(false);
        expect(isExclusiveChoiceKey("race:half-elf:base:ability_score:1:0")).toBe(
            false
        );
    });
});
