/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { SpellChoiceGrid } from "../components/characters/creation/spells/SpellChoiceGrid";
import { collectPendingChoiceGrants } from "../lib/character/grantChoices";
import { buildSelectionsFromForm } from "../lib/character/characterAdapter";
import { filterChoicesForStep } from "../lib/character/creationSteps/stepFilters";
import enMessages from "../messages/en.json";

function SpellGridHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });
    const selections = buildSelectionsFromForm(defaultValues);
    const spellChoices = filterChoicesForStep(
        collectPendingChoiceGrants(selections, "en", 1, "dnd").filter(
            (choice) => choice.grant.grantType === "spell"
        ),
        { sourceTypes: ["class"], level: 1, spellTier: "cantrip" }
    );

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <SpellChoiceGrid
                form={form}
                contentLocale="en"
                system="dnd"
                choices={spellChoices}
            />
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("SpellChoiceGrid", () => {
    it("shows all cantrip slots on one screen and toggles selection", async () => {
        const user = userEvent.setup();

        render(
            <SpellGridHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 1,
                    choices: {},
                }}
            />
        );

        const sections = screen.getAllByRole("heading", { level: 3 });
        expect(sections.length).toBeGreaterThan(0);

        const spellButtons = screen.getAllByText(/Fire Bolt|Ray of Frost/i);
        expect(spellButtons.length).toBeGreaterThan(0);

        await user.click(spellButtons[0]!);

        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "fire-bolt"
        );

        await user.click(spellButtons[0]!);

        expect(screen.getByTestId("choices-output")).not.toHaveTextContent(
            "fire-bolt"
        );
    });

    it("opens detail modal from expand button", async () => {
        const user = userEvent.setup();

        render(
            <SpellGridHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 1,
                    choices: {},
                }}
            />
        );

        const expandButtons = screen.getAllByLabelText("View details");
        await user.click(expandButtons[0]!);

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });
});
