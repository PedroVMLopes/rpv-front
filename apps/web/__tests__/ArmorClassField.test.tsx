import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { ArmorClassField } from "../components/characters/ArmorClassField";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndStatConfig } from "../presets/dnd/characterStats";
import messages from "../messages/en.json";

function ArmorClassHarness({
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
            <ArmorClassField form={form} system="dnd" contentLocale="en" />
            <pre data-testid="ac-output">
                {JSON.stringify({
                    ac: form.watch("ac"),
                })}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("ArmorClassField", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("autofills base AC from dexterity", async () => {
        render(
            <ArmorClassHarness
                defaultValues={{
                    name: "Test Hero",
                    attributes: baseAttributes,
                }}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId("ac-output")).toHaveTextContent('"ac":10');
        });

        expect(screen.getByText(/10 \+ DEX \+0 = 10/)).toBeInTheDocument();
    });

    it("autofills higher base AC when dexterity modifier is positive", async () => {
        render(
            <ArmorClassHarness
                defaultValues={{
                    name: "Test Hero",
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 14 }
                            : attribute
                    ),
                }}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId("ac-output")).toHaveTextContent('"ac":12');
        });

        expect(screen.getByText(/10 \+ DEX \+2 = 12/)).toBeInTheDocument();
    });

    it("stops autofilling after manual AC edit and can reset", async () => {
        const user = userEvent.setup();

        render(
            <ArmorClassHarness
                defaultValues={{
                    name: "Test Hero",
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 14 }
                            : attribute
                    ),
                }}
            />
        );

        const acInput = screen.getByRole("spinbutton");

        await waitFor(() => {
            expect(acInput).toHaveValue(12);
        });

        await user.clear(acInput);
        await user.type(acInput, "16");

        await waitFor(() => {
            expect(screen.getByTestId("ac-output")).toHaveTextContent('"ac":16');
        });

        await user.click(screen.getByRole("button", { name: "Reset to computed" }));

        await waitFor(() => {
            expect(screen.getByTestId("ac-output")).toHaveTextContent('"ac":12');
        });
    });
});
