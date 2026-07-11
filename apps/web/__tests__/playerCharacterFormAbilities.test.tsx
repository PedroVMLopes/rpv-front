/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { PlayerCharacterForm } from "../components/characters/PlayerCharacterForm";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyChoiceValidation } from "../lib/character/choiceValidation";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import { dndStatConfig } from "../presets/dnd/characterStats";
import enMessages from "../messages/en.json";

function PlayerFormHarness({
    defaultValues = {},
    initialStepId,
}: {
    defaultValues?: Record<string, unknown>;
    initialStepId?: string;
}) {
    const schema = applyAbilityScoreValidation(
        applyChoiceValidation(
            createDynamicSchema(dndCharacterSchema, "player"),
            "en",
            "dnd"
        ),
        dndStatConfig
    );
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });
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
            />
        </NextIntlClientProvider>
    );
}

describe("PlayerCharacterForm abilities step", () => {
    it("updates standard array UI immediately on first visit via stepper navigation", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    name: "Hero",
                    race: "elf",
                    characterClass: "fighter",
                }}
                initialStepId="abilities"
            />
        );

        const methodSelect = screen.getAllByRole("combobox")[0];
        expect(methodSelect).toHaveValue("standard-array");

        const strengthCard = screen.getByText("Strength").closest("div.rounded");
        expect(strengthCard).not.toBeNull();
        const strengthSelect = within(strengthCard!).getByRole("combobox");
        await user.selectOptions(strengthSelect, "15");

        expect(within(strengthCard!).getByText("Base: 15")).toBeInTheDocument();
    });

    it("uses manual method and migration hint for Lv 3 preset", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    name: "Hero",
                    race: "elf",
                    characterClass: "fighter",
                    level: 3,
                }}
                initialStepId="abilities"
            />
        );

        expect(screen.getAllByRole("combobox")[0]).toHaveValue("manual");
        expect(
            screen.getByText(
                /the Total below each field is the value that matters/i
            )
        ).toBeInTheDocument();
    });

    it("reflects point-buy changes without leaving and returning to the step", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    name: "Hero",
                    race: "elf",
                    characterClass: "fighter",
                }}
                initialStepId="abilities"
            />
        );

        const methodSelect = screen.getAllByRole("combobox")[0];
        await user.selectOptions(methodSelect, "point-buy");

        const strengthCard = screen.getByText("Strength").closest("div.rounded");
        expect(strengthCard).not.toBeNull();
        await user.click(within(strengthCard!).getByRole("button", { name: "+" }));

        expect(within(strengthCard!).getByText("Base: 9")).toBeInTheDocument();
    });

    it("switches generation method UI immediately without tab change", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    name: "Hero",
                    race: "elf",
                    characterClass: "fighter",
                }}
                initialStepId="abilities"
            />
        );

        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();

        const methodSelect = screen.getAllByRole("combobox")[0];
        await user.selectOptions(methodSelect, "manual");

        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
    });

});
