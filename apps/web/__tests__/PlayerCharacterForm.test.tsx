/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { PlayerCharacterForm } from "../components/characters/PlayerCharacterForm";
import { getCreationSidebar } from "./helpers/characterCreationNav";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import { dndStatConfig } from "../presets/dnd/characterStats";
import enMessages from "../messages/en.json";

function PlayerFormHarness({
    defaultValues = {},
    onSave = jest.fn(),
    initialStepId,
}: {
    defaultValues?: Record<string, unknown>;
    onSave?: (data: Record<string, unknown>) => void;
    initialStepId?: string;
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
                initialStepId={initialStepId}
            />
        </NextIntlClientProvider>
    );
}

describe("PlayerCharacterForm", () => {
    it("allows navigating to any step without prerequisites", async () => {
        render(<PlayerFormHarness initialStepId="class" />);

        expect(await screen.findByText("Character level")).toBeInTheDocument();
        expect(
            screen.queryByText("Select a race before continuing.")
        ).not.toBeInTheDocument();
    });

    it("shows subrace step for elf in the sidebar", () => {
        render(<PlayerFormHarness defaultValues={{ race: "elf" }} />);

        const sidebar = getCreationSidebar();

        expect(sidebar.getByRole("button", { name: "Subrace" })).toBeInTheDocument();
    });

    it("hides subrace step for half-elf", () => {
        render(<PlayerFormHarness defaultValues={{ race: "half-elf" }} />);

        const sidebar = getCreationSidebar();

        expect(
            sidebar.queryByRole("button", { name: "Subrace" })
        ).not.toBeInTheDocument();
    });

    it("shows half-elf racial ASI pickers on the abilities step", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "half-elf",
                    characterClass: "fighter",
                }}
                initialStepId="abilities"
            />
        );

        expect(screen.getByText("Racial ability increases")).toBeInTheDocument();
    });

    it("shows class level selector on the class step", async () => {
        render(<PlayerFormHarness defaultValues={{ race: "elf" }} initialStepId="class" />);

        expect(screen.getByText("Character level")).toBeInTheDocument();
    });

    it("shows fighter level 1 summary with fixed proficiencies", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "fighter",
                    level: 1,
                }}
                initialStepId="class-level-1"
            />
        );

        expect(screen.getByText("Strength save")).toBeInTheDocument();
    });

    it("shows subclass step in sidebar at level 3", () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "fighter",
                    level: 3,
                }}
            />
        );

        const sidebar = getCreationSidebar();

        expect(sidebar.getByRole("button", { name: "Subclass" })).toBeInTheDocument();
    });

    it("lists pending decisions in the sidebar", async () => {
        render(<PlayerFormHarness />);

        const sidebar = getCreationSidebar();

        expect(sidebar.getByText(/Pending/i)).toBeInTheDocument();
        expect(sidebar.getByText("Select a race")).toBeInTheDocument();
    });

    it("shows deferred level banner on finalize when level is above cap", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 5,
                }}
                initialStepId="finalize"
            />
        );

        expect(
            screen.getByText(/Choices for levels above 3/i)
        ).toBeInTheDocument();
    });

    it("can save wizard level 5 without level 4 spell picks filled", async () => {
        const user = userEvent.setup();
        const onSave = jest.fn();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 5,
                    background: "sage",
                    name: "Hero",
                    abilityScoreMethod: "manual",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 10,
                    })),
                }}
                onSave={onSave}
                initialStepId="finalize"
            />
        );

        const sidebar = getCreationSidebar();

        await user.click(
            sidebar.getByRole("button", { name: "Save Character" })
        );

        expect(onSave).toHaveBeenCalled();
    });

    it("can jump to the class step from the sidebar", async () => {
        const user = userEvent.setup();

        render(<PlayerFormHarness defaultValues={{ race: "elf" }} />);

        const sidebar = getCreationSidebar();
        await user.click(sidebar.getByRole("button", { name: "Class & Level" }));

        expect(await screen.findByText("Character level")).toBeInTheDocument();
    });
});
