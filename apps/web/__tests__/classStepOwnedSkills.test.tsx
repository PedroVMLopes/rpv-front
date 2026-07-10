/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CharacterGrantPickers } from "../components/characters/CharacterGrantPickers";
import { getGrantSourceTypesForStep } from "../lib/character/characterCreationSteps";
import messages from "../messages/en.json";

function ClassStepHarness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
    const form = useForm({ defaultValues });
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <CharacterGrantPickers
                form={form}
                contentLocale="en"
                system="dnd"
                sourceTypes={getGrantSourceTypesForStep("class")}
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

        const skillSelects = screen.getAllByRole("combobox");
        const firstSkillSelect = skillSelects.find((select) =>
            Array.from(select.options).some((option) => option.value === "history")
        );

        expect(firstSkillSelect).toBeDefined();
        const historyOption = Array.from(firstSkillSelect!.options).find(
            (option) => option.value === "history"
        );
        expect(historyOption?.textContent).toBe("✓ History");
        expect(historyOption).toBeDisabled();
    });
});
