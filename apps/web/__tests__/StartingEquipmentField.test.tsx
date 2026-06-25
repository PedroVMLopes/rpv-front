/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { StartingEquipmentField } from "../components/characters/StartingEquipmentField";
import messages from "../messages/en.json";

function StartingEquipmentHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <StartingEquipmentField form={form} contentLocale="en" system="dnd" />
            <pre data-testid="choices-output">
                {JSON.stringify(form.watch("choices"))}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("StartingEquipmentField", () => {
    it("shows fighter auto-granted longsword and sidearm choice", () => {
        render(
            <StartingEquipmentHarness
                defaultValues={{
                    characterClass: "fighter",
                    choices: {},
                }}
            />
        );

        expect(screen.getByText("Starting Equipment")).toBeInTheDocument();
        expect(screen.getAllByText(/Longsword/).length).toBeGreaterThan(0);
        expect(screen.getByText(/From class: fighter/)).toBeInTheDocument();
        expect(
            screen.getByText(/Starting sidearm \(pilot fixture\)/)
        ).toBeInTheDocument();
    });

    it("updates bag preview when sidearm is selected", async () => {
        const user = userEvent.setup();

        render(
            <StartingEquipmentHarness
                defaultValues={{
                    characterClass: "fighter",
                    choices: {},
                }}
            />
        );

        const sidearmSelect = screen.getByRole("combobox");
        await user.selectOptions(sidearmSelect, "0");

        expect(screen.getAllByText(/Pilot Test Dagger/).length).toBeGreaterThan(0);
        expect(screen.getByTestId("choices-output")).toHaveTextContent(
            "class:fighter:base:inventory_item:5:0"
        );
    });

    it("shows sage currency breakdown and granted scroll", () => {
        render(
            <StartingEquipmentHarness
                defaultValues={{
                    background: "sage",
                    gold: 8,
                }}
            />
        );

        expect(screen.getAllByText(/Scroll of Fire Bolt/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Manual currency: 8 gold/)).toBeInTheDocument();
        expect(screen.getByText(/Granted currency: 15 gold/)).toBeInTheDocument();
        expect(screen.getByText(/Total currency: 23 gold/)).toBeInTheDocument();
    });

    it("renders nothing when class and background are empty", () => {
        render(
            <StartingEquipmentHarness defaultValues={{ choices: {} }} />
        );

        expect(screen.queryByText("Starting Equipment")).not.toBeInTheDocument();
    });
});
