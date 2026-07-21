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
    spellTier = "cantrip",
}: {
    defaultValues: Record<string, unknown>;
    spellTier?: "cantrip" | "leveled";
}) {
    const form = useForm({ defaultValues });
    const selections = buildSelectionsFromForm(defaultValues);
    const spellChoices = filterChoicesForStep(
        collectPendingChoiceGrants(selections, "en", 1, "dnd").filter(
            (choice) => choice.grant.grantType === "spell"
        ),
        { sourceTypes: ["class"], level: 1, spellTier }
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
    it("shows one cantrip pool and toggles multi-select into grantPicks", async () => {
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

        expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
        expect(screen.getByText("Cantrips")).toBeInTheDocument();

        const poolHeadings = screen.getAllByRole("heading", { level: 3 });
        expect(poolHeadings).toHaveLength(1);

        const fireBolt = screen.getByRole("button", { name: /^Fire Bolt$/i });
        const mageHand = screen.getByRole("button", { name: /^Mage Hand$/i });
        const light = screen.getByRole("button", { name: /^Light$/i });
        const acidSplash = screen.getByRole("button", {
            name: /^Acid Splash$/i,
        });

        await user.click(fireBolt);
        await user.click(mageHand);
        await user.click(light);

        let choices = JSON.parse(
            screen.getByTestId("choices-output").textContent ?? "{}"
        );
        expect(Object.values(choices.grantPicks ?? {})).toEqual(
            expect.arrayContaining(["fire-bolt", "mage-hand", "light"])
        );
        expect(screen.getByText("3 of 3 selected")).toBeInTheDocument();
        expect(acidSplash).toBeDisabled();

        await user.click(acidSplash);
        choices = JSON.parse(
            screen.getByTestId("choices-output").textContent ?? "{}"
        );
        expect(Object.values(choices.grantPicks ?? {})).not.toContain(
            "acid-splash"
        );

        await user.click(fireBolt);
        expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /^Acid Splash$/i })
        ).not.toBeDisabled();
    });

    it("groups leveled spells under a level heading", () => {
        render(
            <SpellGridHarness
                spellTier="leveled"
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 1,
                    choices: {},
                }}
            />
        );

        expect(screen.getByText("Level 1 spells")).toBeInTheDocument();
        expect(screen.getByText("0 of 2 selected")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Burning Hands/i })).toBeInTheDocument();
    });

    it("disables a racial cantrip already picked in class cantrip slots", async () => {
        const user = userEvent.setup();

        render(
            <SpellGridHarness
                defaultValues={{
                    race: "elf",
                    subrace: "high-elf",
                    characterClass: "wizard",
                    level: 1,
                    choices: {
                        grantPicks: {
                            "race:high-elf:base:spell:0:0": "acid-splash",
                        },
                    },
                }}
            />
        );

        const acidSplashButtons = screen.getAllByRole("button", {
            name: /Acid Splash/i,
        });

        expect(acidSplashButtons.length).toBeGreaterThan(0);
        for (const button of acidSplashButtons) {
            expect(button).toBeDisabled();
        }

        await user.click(acidSplashButtons[0]!);

        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "race:high-elf:base:spell:0:0"
        );
        expect(screen.getByTestId("choices-output")).not.toHaveTextContent(
            "class:wizard:1:spell:1:0"
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
