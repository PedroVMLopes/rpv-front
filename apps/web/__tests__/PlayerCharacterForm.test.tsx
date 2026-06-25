/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { PlayerCharacterForm } from "../components/characters/PlayerCharacterForm";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import { dndStatConfig } from "../presets/dnd/characterStats";
import enMessages from "../messages/en.json";

function PlayerFormHarness({
    defaultValues = {},
    onSave = jest.fn(),
}: {
    defaultValues?: Record<string, unknown>;
    onSave?: (data: Record<string, unknown>) => void;
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
                onSave={onSave}
            />
        </NextIntlClientProvider>
    );
}

describe("PlayerCharacterForm", () => {
    it("locks later steps until race is selected", async () => {
        const user = userEvent.setup();

        render(<PlayerFormHarness />);

        expect(screen.getByRole("button", { name: /Race/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Class/ })).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Next" }));
        expect(
            screen.getByText("Select a race before continuing.")
        ).toBeInTheDocument();
    });

    it("hides subrace until race is selected", () => {
        render(<PlayerFormHarness />);

        expect(screen.queryByText("Subrace")).not.toBeInTheDocument();
    });

    it("shows subrace for elf", () => {
        render(<PlayerFormHarness defaultValues={{ race: "elf" }} />);

        expect(screen.getByText("Subrace")).toBeInTheDocument();
    });

    it("hides subrace for half-elf", () => {
        render(<PlayerFormHarness defaultValues={{ race: "half-elf" }} />);

        expect(screen.queryByText("Subrace")).not.toBeInTheDocument();
    });

    it("shows half-elf racial ASI pickers on race step only", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "half-elf",
                    characterClass: "fighter",
                }}
            />
        );

        expect(screen.getByText("Racial ability increases")).toBeInTheDocument();
        expect(
            screen.queryByText(/Starting sidearm/)
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Class/ }));

        expect(
            screen.queryByText("Racial ability increases")
        ).not.toBeInTheDocument();
    });

    it("unlocks class step after selecting race", async () => {
        const user = userEvent.setup();

        render(<PlayerFormHarness defaultValues={{ race: "elf" }} />);

        await user.click(screen.getByRole("button", { name: "Next" }));

        expect(screen.getByText("Character level")).toBeInTheDocument();
        expect(screen.queryByLabelText("Level")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Class/ })).not.toBeDisabled();
    });

    it("shows fighter fixed proficiencies and equipment teaser on class step", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "fighter",
                    level: 1,
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: /Class/ }));

        expect(
            screen.getByText("Proficiencies & resources (automatic)")
        ).toBeInTheDocument();
        expect(screen.getByText("Strength save")).toBeInTheDocument();
        expect(screen.queryByText("Starting equipment")).not.toBeInTheDocument();
        expect(screen.queryByText("Subclass")).not.toBeInTheDocument();
    });

    it("shows subclass field on class step at level 3", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "fighter",
                    level: 3,
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: /Class/ }));

        expect(screen.getByText("Subclass")).toBeInTheDocument();
    });

    it("unlocks equipment step for a partially built character", () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "wizard",
                    background: "sage",
                    name: "Hero",
                }}
            />
        );

        expect(
            screen.getByRole("button", { name: /Starting Equipment/ })
        ).not.toBeDisabled();
    });
});
