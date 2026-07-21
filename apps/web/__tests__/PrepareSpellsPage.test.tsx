/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { PrepareSpellsPage } from "../components/characters/creation/PrepareSpellsPage";
import enMessages from "../messages/en.json";

function PrepareHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <PrepareSpellsPage
                title="Prepare Spells"
                form={form}
                contentLocale="en"
                system="dnd"
            />
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("PrepareSpellsPage", () => {
    it("toggles leveled known spells into preparedSpells", async () => {
        const user = userEvent.setup();

        render(
            <PrepareHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 1,
                    choices: {
                        grantPicks: {
                            "class:wizard:1:spell:1:0": "fire-bolt",
                            "class:wizard:1:spell:2:0": "burning-hands",
                            "class:wizard:1:spell:2:1": "magic-missile",
                        },
                        preparedSpells: [],
                    },
                }}
            />
        );

        expect(screen.getByText("Burning Hands")).toBeInTheDocument();
        expect(screen.getByText("Magic Missile")).toBeInTheDocument();
        expect(screen.queryByText("Fire Bolt")).not.toBeInTheDocument();
        expect(screen.getByText("0 of 2 prepared")).toBeInTheDocument();

        await user.click(screen.getByText("Burning Hands"));
        await user.click(screen.getByText("Magic Missile"));

        let choices = JSON.parse(
            screen.getByTestId("choices-output").textContent ?? "{}"
        );
        expect(choices.preparedSpells).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
        expect(screen.getByText("2 of 2 prepared")).toBeInTheDocument();

        await user.click(screen.getByText("Burning Hands"));

        choices = JSON.parse(
            screen.getByTestId("choices-output").textContent ?? "{}"
        );
        expect(choices.preparedSpells).toEqual(["magic-missile"]);
        expect(screen.getByText("1 of 2 prepared")).toBeInTheDocument();
    });
});
