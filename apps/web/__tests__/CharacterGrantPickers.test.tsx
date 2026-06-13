import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CharacterGrantPickers } from "../components/characters/CharacterGrantPickers";
import messages from "../messages/en.json";

function GrantPickerHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <CharacterGrantPickers form={form} contentLocale="en" />
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
});
