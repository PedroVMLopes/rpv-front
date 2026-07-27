/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CharacterGrantPickers } from "../components/characters/CharacterGrantPickers";
import messages from "../messages/en.json";

function ClassStepHarness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
    const form = useForm({ defaultValues });
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <CharacterGrantPickers
                form={form}
                contentLocale="en"
                system="dnd"
                stepFilter={{
                    sourceTypes: ["class"],
                    level: 1,
                    grantTypes: ["skill_proficiency"],
                }}
                sections="choices-only"
            />
        </NextIntlClientProvider>
    );
}

describe("class step owned background skills", () => {
    it("disables sage background skills on class step when background is already sage", () => {
        render(
            <ClassStepHarness
                defaultValues={{
                    race: "elf",
                    background: "sage",
                    characterClass: "wizard",
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
});
