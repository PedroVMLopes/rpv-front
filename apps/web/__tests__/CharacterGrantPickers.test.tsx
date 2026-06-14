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
        "en"
    );
    const form = useForm({
        defaultValues,
        resolver: withValidation ? zodResolver(schema) : undefined,
    });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <CharacterGrantPickers form={form} contentLocale="en" />
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
        expect(screen.getByText(/Common/)).toBeInTheDocument();
        expect(screen.getByText(/Elvish/)).toBeInTheDocument();
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
});
