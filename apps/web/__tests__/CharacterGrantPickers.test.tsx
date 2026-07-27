import { render, screen, within } from "@testing-library/react";
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
    sourceTypes,
}: {
    defaultValues: Record<string, unknown>;
    withValidation?: boolean;
    sourceTypes?: Array<"race" | "class" | "subclass" | "background" | "item" | "feat" | "spell" | "condition" | "system">;
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
            <CharacterGrantPickers
                form={form}
                contentLocale="en"
                system="dnd"
                sourceTypes={sourceTypes}
            />
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

function choiceSlot(label: string) {
    const heading = screen.getByText(label);
    const slot = heading.closest("div.flex.flex-col");
    expect(slot).not.toBeNull();
    return slot as HTMLElement;
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

        await user.click(screen.getByRole("button", { name: "Draconic" }));

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

        const historyButtons = screen.getAllByRole("button", {
            name: "✓ History",
        });
        expect(historyButtons.length).toBeGreaterThan(0);
        for (const history of historyButtons) {
            expect(history).toBeDisabled();
        }
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

        const athleticsButtons = screen.getAllByRole("button", {
            name: /Athletics/,
        });
        expect(athleticsButtons.length).toBeGreaterThan(1);
        expect(
            athleticsButtons.some(
                (button) =>
                    button.textContent === "✓ Athletics" &&
                    (button as HTMLButtonElement).disabled
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

        const level3Slot = choiceSlot("Additional skill (Level 3)");
        expect(
            within(level3Slot).getByRole("button", { name: "✓ Athletics" })
        ).toBeDisabled();
        expect(
            within(level3Slot).getByRole("button", { name: "✓ Perception" })
        ).toBeDisabled();
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

        const draconicButtons = screen.getAllByRole("button", {
            name: "✓ Draconic",
        });
        expect(draconicButtons.length).toBeGreaterThan(0);
        for (const button of draconicButtons) {
            expect(button).toBeDisabled();
        }
    });

    it("shows invalid choices error after validation", async () => {
        const user = userEvent.setup();

        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    characterClass: "fighter",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:skill_proficiency:3:0": "athletics",
                            "class:fighter:base:skill_proficiency:3:1": "athletics",
                        },
                    },
                }}
                withValidation
            />
        );

        await user.click(screen.getByTestId("validate-choices"));

        expect(
            screen.getByText("Fix invalid grant picks before saving.")
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
            screen.queryByText(/Starting sidearm/)
        ).not.toBeInTheDocument();
    });

    it("shows half-elf racial ability increase pickers", () => {
        render(
            <GrantPickerHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "half-elf",
                    choices: {},
                }}
            />
        );

        expect(screen.getByText("Racial ability increases")).toBeInTheDocument();
        expect(
            screen.getAllByText(/Two other ability scores of your choice/).length
        ).toBe(2);
    });

    it("disables a racial cantrip already picked when showing class spell choices", () => {
        render(
            <GrantPickerHarness
                sourceTypes={["class", "subclass"]}
                defaultValues={{
                    race: "elf",
                    subrace: "high-elf",
                    characterClass: "wizard",
                    choices: {
                        grantPicks: {
                            "race:high-elf:base:spell:0:0": "acid-splash",
                        },
                    },
                }}
            />
        );

        const acidSplashButtons = screen.getAllByRole("button", {
            name: "✓ Acid Splash",
        });
        expect(acidSplashButtons.length).toBeGreaterThan(0);
        for (const button of acidSplashButtons) {
            expect(button).toBeDisabled();
        }
    });
});
