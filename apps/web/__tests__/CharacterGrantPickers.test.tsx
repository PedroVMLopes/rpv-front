import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { CharacterGrantPickers } from "../components/characters/CharacterGrantPickers";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyChoiceValidation } from "../lib/character/choiceValidation";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import messages from "../messages/en.json";

function GrantPickerHarness({
    defaultValues,
    withValidation = false,
}: {
    defaultValues: Record<string, unknown>;
    withValidation?: boolean;
}) {
    const schema = applyChoiceValidation(
        createDynamicSchema(dndCharacterSchema, "player"),
        "en",
        "dnd"
    );
    const form = useForm({
        defaultValues,
        resolver: withValidation ? zodResolver(schema) : undefined,
    });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <CharacterGrantPickers form={form} contentLocale="en" system="dnd" />
            <button
                type="button"
                onClick={() => void form.trigger()}
                data-testid="validate-choices"
            >
                Validate
            </button>
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("CharacterGrantPickers", () => {
    it("shows auto-known languages and language choice slots for high elf", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    race: "elf",
                    subrace: "high-elf",
                    choices: {},
                }}
            />
        );

        expect(screen.getByText("Languages")).toBeInTheDocument();
        expect(screen.getAllByText(/Common/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Elvish/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Choose 1 language/)).toBeInTheDocument();
    });

    it("stores language picks in choices.grantPicks", async () => {
        const user = userEvent.setup();

        render(
            <GrantPickerHarness
                defaultValues={{
                    race: "elf",
                    subrace: "high-elf",
                    choices: {},
                }}
            />
        );

        const languageSelect = screen.getAllByRole("combobox")[0];
        await user.selectOptions(languageSelect, "draconic");

        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "draconic"
        );
    });

    it("shows owned background skills with a checkmark and disables them", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    background: "sage",
                    characterClass: "fighter",
                    choices: {},
                }}
            />
        );

        const skillSelects = screen.getAllByRole("combobox");
        const firstSkillSelect = skillSelects.find((select) =>
            Array.from(select.options).some((option) =>
                option.textContent?.includes("History")
            )
        );

        expect(firstSkillSelect).toBeDefined();
        const historyOption = Array.from(firstSkillSelect!.options).find(
            (option) => option.value === "history"
        );
        expect(historyOption?.textContent).toBe("✓ History");
        expect(historyOption).toBeDisabled();
    });

    it("shows sibling skill picks as disabled with a checkmark", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    characterClass: "fighter",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:skill_proficiency:3:0": "athletics",
                        },
                    },
                }}
            />
        );

        const athleticsOptions = screen
            .getAllByRole("combobox")
            .flatMap((select) => Array.from(select.options))
            .filter((option) => option.value === "athletics");

        expect(athleticsOptions.length).toBeGreaterThan(1);
        expect(
            athleticsOptions.some(
                (option) =>
                    option.textContent === "✓ Athletics" && option.disabled
            )
        ).toBe(true);
    });

    it("shows earlier fighter skill picks with checkmark in level 3 slot", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    characterClass: "fighter",
                    level: 3,
                    choices: {
                        grantPicks: {
                            "class:fighter:base:skill_proficiency:3:0": "athletics",
                            "class:fighter:base:skill_proficiency:3:1": "perception",
                        },
                    },
                }}
            />
        );

        expect(
            screen.getByText("Additional skill (Level 3)")
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Additional skill (Level 3) (Level 3)")
        ).not.toBeInTheDocument();

        const level3Select = screen
            .getByText("Additional skill (Level 3)")
            .closest("label")
            ?.querySelector("select");

        expect(level3Select).toBeDefined();
        const athleticsOption = Array.from(level3Select!.options).find(
            (option) => option.value === "athletics"
        );
        const perceptionOption = Array.from(level3Select!.options).find(
            (option) => option.value === "perception"
        );
        expect(athleticsOption?.textContent).toBe("✓ Athletics");
        expect(athleticsOption).toBeDisabled();
        expect(perceptionOption?.textContent).toBe("✓ Perception");
        expect(perceptionOption).toBeDisabled();
    });

    it("shows languages picked in other slots as disabled with a checkmark", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    subrace: "high-elf",
                    background: "sage",
                    choices: {
                        grantPicks: {
                            "race:high-elf:base:language:0:0": "draconic",
                        },
                    },
                }}
            />
        );

        const draconicOptions = screen
            .getAllByRole("combobox")
            .flatMap((select) => Array.from(select.options))
            .filter((option) => option.value === "draconic");

        expect(
            draconicOptions.some(
                (option) =>
                    option.textContent === "✓ Draconic" && option.disabled
            )
        ).toBe(true);
    });

    it("shows incomplete choices error after validation", async () => {
        const user = userEvent.setup();

        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "dwarf",
                    choices: {},
                }}
                withValidation
            />
        );

        await user.click(screen.getByTestId("validate-choices"));

        expect(
            screen.getByText("Complete all required choices before saving.")
        ).toBeInTheDocument();
    });

    it("does not show fighter sidearm inventory choice under ability choices", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    characterClass: "fighter",
                    choices: {},
                }}
            />
        );

        expect(screen.getByText("Ability Choices")).toBeInTheDocument();
        expect(
            screen.queryByText(/Starting sidearm \(pilot fixture\)/)
        ).not.toBeInTheDocument();
    });
});
