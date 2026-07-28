import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { AbilityScoresField } from "../components/characters/AbilityScoresField";
import type { PlayerFormMode } from "../lib/character/characterCreationSteps";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndStatConfig } from "../presets/dnd/characterStats";
import messages from "../messages/en.json";

function AbilityScoresHarness({
    defaultValues,
    mode = "create",
}: {
    defaultValues: Record<string, unknown>;
    mode?: PlayerFormMode;
}) {
    const schema = applyAbilityScoreValidation(
        createDynamicSchema(dndCharacterSchema, "player"),
        dndStatConfig
    );
    const form = useForm({
        defaultValues,
        resolver: zodResolver(schema),
    });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <AbilityScoresField
                form={form}
                abilities={dndStatConfig.abilities}
                statConfig={dndStatConfig}
                contentLocale="en"
                mode={mode}
            />
            <pre data-testid="ability-output">
                {JSON.stringify({
                    method: form.watch("abilityScoreMethod"),
                    attributes: form.watch("attributes"),
                    rolls: form.watch("abilityScoreRolls"),
                })}
            </pre>
        </NextIntlClientProvider>
    );
}

function abilityCard(label: string) {
    const card = screen.getByText(label).closest("div.rounded-xl");
    expect(card).not.toBeNull();
    return card as HTMLElement;
}

function parkingAttributes() {
    return dndStatConfig.abilities.map((ability) => ({
        name: ability.name,
        value: 8,
    }));
}

describe("AbilityScoresField", () => {
    it("updates abilityScoreMethod when the selector changes", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "manual",
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Point Buy" }));

        expect(screen.getByTestId("ability-output")).toHaveTextContent(
            "point-buy"
        );
    });

    it("writes standard array selections into attributes", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "standard-array",
                    attributes: parkingAttributes(),
                }}
            />
        );

        await user.click(
            within(abilityCard("Strength")).getByRole("button", { name: "15" })
        );

        expect(screen.getByTestId("ability-output")).toHaveTextContent(
            '"name":"strength","value":15'
        );
    });

    it("swaps a taken standard array value with the previous owner", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "standard-array",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: ability.name === "strength" ? 15 : 8,
                    })),
                }}
            />
        );

        await user.click(
            within(abilityCard("Dexterity")).getByRole("button", { name: "15" })
        );

        const output = screen.getByTestId("ability-output").textContent ?? "";
        expect(output).toContain('"name":"strength","value":8');
        expect(output).toContain('"name":"dexterity","value":15');
    });

    it("treats 8 like other standard array scores when swapping", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "standard-array",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value:
                            ability.name === "strength"
                                ? 15
                                : ability.name === "dexterity"
                                  ? 14
                                  : 8,
                    })),
                }}
            />
        );

        const strengthEight = within(abilityCard("Strength")).getByRole(
            "button",
            { name: "8" }
        );
        expect(strengthEight).toHaveAttribute("aria-pressed", "false");

        await user.click(strengthEight);

        const output = screen.getByTestId("ability-output").textContent ?? "";
        expect(output).toContain('"name":"strength","value":8');
        expect(output).toContain('"name":"constitution","value":15');
        expect(
            within(abilityCard("Strength")).getByRole("button", { name: "8" })
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("defaults standard array attributes to parking value 8", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    level: 1,
                }}
            />
        );

        const output = JSON.parse(
            screen.getByTestId("ability-output").textContent ?? "{}"
        );
        expect(output.method).toBe("standard-array");
        expect(output.attributes).toEqual(
            dndStatConfig.abilities.map((ability) => ({
                name: ability.name,
                value: 8,
            }))
        );
    });

    it("shows remaining point-buy budget and blocks overspending", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "point-buy",
                    attributes: parkingAttributes(),
                }}
            />
        );

        expect(screen.getByText("Points remaining: 27")).toBeInTheDocument();

        const increaseButtons = screen.getAllByRole("button", { name: "+" });
        for (let index = 0; index < 6; index++) {
            for (let step = 0; step < 7; step++) {
                await user.click(increaseButtons[index]);
            }
        }

        expect(screen.getByText("Points remaining: 0")).toBeInTheDocument();
        increaseButtons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });

    it("rolls scores and assigns them to attributes", async () => {
        const user = userEvent.setup();
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.99);

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "roll",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 0,
                    })),
                }}
            />
        );

        expect(
            screen.getByText(
                /let the dice decide how you assign your abilities/i
            )
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Roll scores" }));

        const output = JSON.parse(
            screen.getByTestId("ability-output").textContent ?? "{}"
        );
        expect(output.rolls).toEqual(
            [...output.rolls].sort((a: number, b: number) => b - a)
        );

        await user.click(
            within(abilityCard("Strength")).getAllByRole("button", {
                name: "18",
            })[0]
        );

        expect(screen.getByTestId("ability-output")).toHaveTextContent(
            '"value":18'
        );

        randomSpy.mockRestore();
    });

    it("renders duplicate rolled scores as separate buttons", async () => {
        const user = userEvent.setup();
        const pool = [14, 14, 15, 13, 12, 10];

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "roll",
                    abilityScoreRolls: pool,
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 0,
                    })),
                }}
            />
        );

        const strengthCard = abilityCard("Strength");
        const fourteenButtons = within(strengthCard).getAllByRole("button", {
            name: "14",
        });
        expect(fourteenButtons).toHaveLength(2);

        await user.click(fourteenButtons[0]);

        expect(screen.getByTestId("ability-output")).toHaveTextContent(
            '"name":"strength","value":14'
        );

        const dexterityFourteens = within(abilityCard("Dexterity")).getAllByRole(
            "button",
            { name: "14" }
        );
        expect(dexterityFourteens).toHaveLength(2);
        expect(dexterityFourteens[0]).toHaveClass("opacity-50");
        expect(dexterityFourteens[1]).not.toHaveClass("opacity-50");

        await user.click(dexterityFourteens[1]);

        const output = screen.getByTestId("ability-output").textContent ?? "";
        expect(output).toContain('"name":"strength","value":14');
        expect(output).toContain('"name":"dexterity","value":14');
    });

    it("defaults to standard array at level 1", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    level: 1,
                }}
            />
        );

        expect(screen.getByTestId("ability-output")).toHaveTextContent(
            "standard-array"
        );
    });

    it("defaults to manual at level above 1", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    level: 3,
                }}
            />
        );

        expect(screen.getByTestId("ability-output")).toHaveTextContent("manual");
        expect(
            screen.getByText(
                /the Total below each field is the value that matters/i
            )
        ).toBeInTheDocument();
    });

    it("forces manual on edit and keeps existing attribute scores", () => {
        const existingAttributes = [
            { name: "strength", value: 15 },
            { name: "dexterity", value: 14 },
            { name: "constitution", value: 13 },
            { name: "intelligence", value: 12 },
            { name: "wisdom", value: 10 },
            { name: "charisma", value: 8 },
        ];

        render(
            <AbilityScoresHarness
                mode="edit"
                defaultValues={{
                    name: "Test Hero",
                    level: 1,
                    abilityScoreMethod: "standard-array",
                    attributes: existingAttributes,
                }}
            />
        );

        const output = JSON.parse(
            screen.getByTestId("ability-output").textContent ?? "{}"
        );
        expect(output.method).toBe("manual");
        expect(output.attributes).toEqual(existingAttributes);

        const strengthInput = within(abilityCard("Strength")).getByRole(
            "spinbutton"
        );
        expect(strengthInput).toHaveValue(15);
    });

    it("preserves filled scores when switching generation methods", async () => {
        const user = userEvent.setup();
        const existingAttributes = [
            { name: "strength", value: 15 },
            { name: "dexterity", value: 14 },
            { name: "constitution", value: 13 },
            { name: "intelligence", value: 12 },
            { name: "wisdom", value: 10 },
            { name: "charisma", value: 8 },
        ];

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "standard-array",
                    attributes: existingAttributes,
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Manual" }));

        const output = JSON.parse(
            screen.getByTestId("ability-output").textContent ?? "{}"
        );
        expect(output.method).toBe("manual");
        expect(output.attributes).toEqual(existingAttributes);
        expect(within(abilityCard("Strength")).getByRole("spinbutton")).toHaveValue(
            15
        );
    });

    it("hides base preview for default manual score of 10", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    level: 3,
                    abilityScoreMethod: "manual",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 10,
                    })),
                }}
            />
        );

        expect(screen.queryByText("Base: 10")).not.toBeInTheDocument();
        expect(screen.getAllByText("Total: 10").length).toBeGreaterThan(0);
    });

    it("hides racial preview when bonus is zero", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "human",
                    abilityScoreMethod: "manual",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: ability.name === "strength" ? 14 : 10,
                    })),
                }}
            />
        );

        expect(screen.getByText("Base: 14")).toBeInTheDocument();
        expect(screen.queryByText(/Racial:/)).not.toBeInTheDocument();
    });

    it("shows racial bonus preview for elf dexterity", () => {
        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    race: "elf",
                    abilityScoreMethod: "manual",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: ability.name === "dexterity" ? 14 : 10,
                    })),
                }}
            />
        );

        expect(screen.getByText("Base: 14")).toBeInTheDocument();
        expect(screen.getByText("Racial: +2")).toBeInTheDocument();
        expect(screen.getByText("Total: 16")).toBeInTheDocument();
    });
});
