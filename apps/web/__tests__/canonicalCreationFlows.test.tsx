/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { PlayerCharacterForm } from "../components/characters/PlayerCharacterForm";
import { PendingDecisionsPanel } from "../components/characters/PendingDecisionsPanel";
import { getCreationSidebar } from "./helpers/characterCreationNav";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import { dndStatConfig } from "../presets/dnd/characterStats";
import { collectPendingDecisions } from "../lib/character/pendingDecisions";
import enMessages from "../messages/en.json";

function PlayerFormHarness({
    defaultValues = {},
    initialStepId,
    initialFocusKey,
}: {
    defaultValues?: Record<string, unknown>;
    initialStepId?: string;
    initialFocusKey?: string;
}) {
    const form = useForm({ defaultValues });
    const baseFields = [
        ...dndCharacterFields.common,
        ...dndCharacterFields.player,
    ];

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <PlayerCharacterForm
                mode="create"
                system="dnd"
                form={form}
                baseFields={baseFields}
                statConfig={dndStatConfig}
                contentLocale="en"
                onSave={jest.fn()}
                initialStepId={initialStepId}
                initialFocusKey={initialFocusKey}
            />
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("canonical character creation flows", () => {
    it("High Elf → Wizard: racial cantrip disabled in class cantrip grid", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
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
                initialStepId="class-level-1-cantrips"
            />
        );

        const acidSplashButtons = screen
            .getAllByRole("button")
            .filter((button) => /Acid Splash/i.test(button.textContent ?? ""));
        expect(
            acidSplashButtons.some((button) => (button as HTMLButtonElement).disabled)
        ).toBe(true);

        const fireBoltPick = screen
            .getAllByRole("button")
            .find(
                (button) =>
                    /Fire Bolt/i.test(button.textContent ?? "") &&
                    !(button as HTMLButtonElement).disabled &&
                    !button.getAttribute("aria-label")
            );
        expect(fireBoltPick).toBeDefined();
        await user.click(fireBoltPick!);

        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "fire-bolt"
        );
        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "acid-splash"
        );
    });

    it("Half-Elf: no subrace step and ASI picks on abilities", () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "half-elf",
                    characterClass: "fighter",
                    level: 1,
                }}
                initialStepId="abilities"
            />
        );

        const sidebar = getCreationSidebar();
        expect(
            sidebar.queryByRole("button", { name: "Subrace" })
        ).not.toBeInTheDocument();
        expect(screen.getByText("Racial ability increases")).toBeInTheDocument();
        expect(
            screen.getAllByText(/Two other ability scores of your choice/).length
        ).toBeGreaterThanOrEqual(1);
    });

    it("Fighter L3: subclass in sidebar and equipment cards on finalize", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "fighter",
                    level: 3,
                    subclass: "fighter-champion",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:exclusive:starting-wealth":
                                "equipment",
                        },
                    },
                }}
                initialStepId="finalize"
            />
        );

        const sidebar = getCreationSidebar();
        expect(sidebar.getByRole("button", { name: "Subclass" })).toBeInTheDocument();

        expect(
            screen.getByTestId(
                "exclusive-choice-class:fighter:base:exclusive:starting-wealth"
            )
        ).toBeInTheDocument();
        expect(
            screen.getAllByText(/Starting sidearm/).length
        ).toBeGreaterThan(0);

        await user.click(
            screen.getByTestId(
                "item-option-class:fighter:base:inventory_item:8:0-0"
            ).querySelector("button")!
        );
        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "class:fighter:base:inventory_item:8:0"
        );
    });

    it("highlights focused equipment choice from initialFocusKey", () => {
        const focusKey = "class:fighter:base:inventory_item:8:0";

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "fighter",
                    level: 1,
                    choices: {
                        grantPicks: {
                            "class:fighter:base:exclusive:starting-wealth":
                                "equipment",
                        },
                    },
                }}
                initialStepId="finalize"
                initialFocusKey={focusKey}
            />
        );

        const section = screen.getByTestId(`item-choice-${focusKey}`);
        expect(section.className).toMatch(/ring-primary/);
    });
});

describe("PendingDecisionsPanel deep links", () => {
    it("includes step and focus query params in edit hrefs", () => {
        const pending = collectPendingDecisions(
            {
                race: "human",
                characterClass: "fighter",
                level: 1,
                background: "sage",
                name: "Hero",
                abilityScoreMethod: "manual",
                attributes: dndStatConfig.abilities.map((ability) => ({
                    name: ability.name,
                    value: 10,
                })),
            },
            "en",
            "dnd",
            dndStatConfig
        );

        const withFocus = pending.find((decision) => decision.focusKey);
        expect(withFocus).toBeDefined();

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <PendingDecisionsPanel
                    decisions={[withFocus!]}
                    editBaseHref="/characters/player/edit/abc"
                />
            </NextIntlClientProvider>
        );

        const link = screen.getByRole("link", { name: withFocus!.label });
        expect(link).toHaveAttribute(
            "href",
            expect.stringContaining(`step=${encodeURIComponent(withFocus!.stepId)}`)
        );
        expect(link).toHaveAttribute(
            "href",
            expect.stringContaining(
                `focus=${encodeURIComponent(withFocus!.focusKey!)}`
            )
        );
    });
});
