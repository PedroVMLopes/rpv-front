import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { HitPointsField } from "../components/characters/HitPointsField";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndStatConfig } from "../presets/dnd/characterStats";
import messages from "../messages/en.json";

function HitPointsHarness({
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
            <HitPointsField form={form} system="dnd" contentLocale="en" />
            <pre data-testid="hp-output">
                {JSON.stringify({
                    maxHp: form.watch("maxHp"),
                    hp: form.watch("hp"),
                })}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("HitPointsField", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("autofills max HP from class, level, and constitution", async () => {
        render(
            <HitPointsHarness
                defaultValues={{
                    name: "Test Hero",
                    characterClass: "fighter",
                    level: 3,
                    attributes: baseAttributes,
                }}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId("hp-output")).toHaveTextContent('"maxHp":28');
        });

        expect(screen.getByText(/d10 \+ CON \+2 at L1, \+8 x 2 = 28/)).toBeInTheDocument();
    });

    it("stops autofilling after manual max HP edit and can reset", async () => {
        const user = userEvent.setup();

        render(
            <HitPointsHarness
                defaultValues={{
                    name: "Test Hero",
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseAttributes,
                }}
            />
        );

        const maxHpInput = screen.getAllByRole("spinbutton")[0];

        await waitFor(() => {
            expect(maxHpInput).toHaveValue(12);
        });

        await user.clear(maxHpInput);
        await user.type(maxHpInput, "20");

        await waitFor(() => {
            expect(screen.getByTestId("hp-output")).toHaveTextContent('"maxHp":20');
        });

        await user.click(screen.getByRole("button", { name: "Reset to computed" }));

        await waitFor(() => {
            expect(screen.getByTestId("hp-output")).toHaveTextContent('"maxHp":12');
        });
    });
});
