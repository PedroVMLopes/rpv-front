import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { AbilityScoresField } from "../components/characters/AbilityScoresField";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndStatConfig } from "../presets/dnd/characterStats";
import messages from "../messages/en.json";

function AbilityScoresHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
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

        await user.selectOptions(screen.getByRole("combobox"), "point-buy");

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
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 0,
                    })),
                }}
            />
        );

        const selects = screen.getAllByRole("combobox");
        await user.selectOptions(selects[1], "15");

        expect(screen.getByTestId("ability-output")).toHaveTextContent('"value":15');
    });

    it("shows remaining point-buy budget and blocks overspending", async () => {
        const user = userEvent.setup();

        render(
            <AbilityScoresHarness
                defaultValues={{
                    name: "Test Hero",
                    abilityScoreMethod: "point-buy",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 8,
                    })),
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

        await user.click(screen.getByRole("button", { name: "Roll scores" }));

        expect(screen.getByTestId("ability-output")).toHaveTextContent("rolls");

        const assignmentSelect = screen.getAllByRole("combobox")[1];
        await user.selectOptions(assignmentSelect, "18");

        expect(screen.getByTestId("ability-output")).toHaveTextContent('"value":18');

        randomSpy.mockRestore();
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
