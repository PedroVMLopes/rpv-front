/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { ItemChoiceGrid } from "../components/characters/creation/items/ItemChoiceGrid";
import {
    deriveStartingEquipmentFromForm,
} from "../lib/character/deriveStartingEquipmentFromForm";
import enMessages from "../messages/en.json";

function ItemGridHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });
    const preview = deriveStartingEquipmentFromForm(defaultValues, "en", "dnd");

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <ItemChoiceGrid
                form={form}
                contentLocale="en"
                system="dnd"
                choices={preview.choiceGrants}
            />
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

const sidearmKey = "class:fighter:base:inventory_item:8:0";

describe("ItemChoiceGrid", () => {
    it("selects, deselects, and opens detail modal for an item option", async () => {
        const user = userEvent.setup();

        render(
            <ItemGridHarness
                defaultValues={{
                    characterClass: "fighter",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:exclusive:starting-wealth":
                                "equipment",
                        },
                    },
                }}
            />
        );

        const option = screen.getByTestId(`item-option-${sidearmKey}-0`);
        const pickButton = option.querySelector("button");
        expect(pickButton).toBeTruthy();

        await user.click(pickButton!);
        expect(screen.getByTestId("choices-output")).toHaveTextContent(sidearmKey);

        await user.click(pickButton!);
        expect(screen.getByTestId("choices-output")).not.toHaveTextContent(
            `"${sidearmKey}":"0"`
        );

        const expandInOption = option.querySelector(
            'button[aria-label]'
        ) as HTMLButtonElement | null;
        expect(expandInOption).toBeTruthy();
        await user.click(expandInOption!);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
