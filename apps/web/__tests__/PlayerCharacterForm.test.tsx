/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextIntlClientProvider } from "next-intl";
import { PlayerCharacterForm } from "../components/characters/PlayerCharacterForm";
import { getCreationSidebar } from "./helpers/characterCreationNav";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { applyChoiceValidation } from "../lib/character/choiceValidation";
import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
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

        expect(sidebar.getByRole("button", { name: "Race" })).toBeInTheDocument();
        expect(sidebar.getAllByRole("button", { name: "Race" })).toHaveLength(1);
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

    it("omits class level 1 summary; fighter L1 choices attach to class step", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    characterClass: "fighter",
                    level: 1,
                }}
                initialStepId="class-level-1-choices"
            />
        );

        const sidebar = getCreationSidebar();

        expect(
            sidebar.queryByRole("button", { name: "Level 1 unlocks" })
        ).not.toBeInTheDocument();
        expect(
            sidebar.getByRole("button", { name: "Level 1 choices" })
        ).toBeInTheDocument();
    });

    it("shows level unlock labels for class and subclass summaries", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "fighter",
                    subclass: "fighter-champion",
                    level: 3,
                }}
                initialStepId="class-level-2"
            />
        );

        const sidebar = getCreationSidebar();

        expect(
            sidebar.getByRole("button", { name: "Level 2 unlocks" })
        ).toBeInTheDocument();
        expect(
            sidebar.getAllByRole("button", { name: "Level 3 unlocks" })
        ).toHaveLength(2);
        expect(
            screen.getByRole("heading", { name: "Level 2 unlocks" })
        ).toBeInTheDocument();
        expect(
            sidebar.getByRole("button", { name: "Level 1 choices" })
        ).toBeInTheDocument();
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

    it("shows deferred level banner on equipment when level is above cap", async () => {
        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "human",
                    characterClass: "wizard",
                    level: 5,
                }}
                initialStepId="equipment"
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
                initialStepId="review"
            />
        );

        const sidebar = getCreationSidebar();

        await user.click(
            sidebar.getByRole("button", { name: "Save Character" })
        );

        expect(onSave).toHaveBeenCalled();
    });

    it("renders macro group titles as plain text when they have sub-steps", () => {
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

        expect(sidebar.getByText("Class & Progression")).toBeInTheDocument();
        expect(
            sidebar.queryByRole("button", { name: "Class & Progression" })
        ).not.toBeInTheDocument();
        expect(
            sidebar.getByRole("button", { name: "Class & Level" })
        ).toBeInTheDocument();
        expect(
            sidebar.getByRole("button", { name: "Subclass" })
        ).toBeInTheDocument();
    });

    it("can jump to the class step from the sidebar", async () => {
        const user = userEvent.setup();

        render(<PlayerFormHarness defaultValues={{ race: "elf" }} />);

        const sidebar = getCreationSidebar();
        await user.click(sidebar.getByRole("button", { name: "Class & Level" }));

        expect(await screen.findByText("Character level")).toBeInTheDocument();
    });

    it("keeps sidebar navigation on edit when initialStepId is race", async () => {
        const user = userEvent.setup();

        render(
            <PlayerFormHarness
                defaultValues={{
                    race: "elf",
                    subrace: "high-elf",
                    characterClass: "wizard",
                    level: 3,
                }}
                initialStepId="race"
            />
        );

        const sidebar = getCreationSidebar();
        await user.click(sidebar.getByRole("button", { name: "Class & Level" }));

        expect(await screen.findByText("Character level")).toBeInTheDocument();
        expect(
            sidebar.getByRole("button", { name: "Class & Level" }).className
        ).toMatch(/bg-primary/);
    });
});

function playerSaveSchema() {
    return applyAbilityScoreValidation(
        applyChoiceValidation(
            createDynamicSchema(dndCharacterSchema, "player"),
            "en",
            "dnd"
        ),
        dndStatConfig
    );
}

function SchemaAwarePlayerFormHarness({
    defaultValues = {},
    onSave = jest.fn(),
    initialStepId,
}: {
    defaultValues?: Record<string, unknown>;
    onSave?: (data: Record<string, unknown>) => void;
    initialStepId?: string;
}) {
    const form = useForm({
        resolver: zodResolver(playerSaveSchema()),
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
                onSave={onSave}
                initialStepId={initialStepId}
            />
        </NextIntlClientProvider>
    );
}

describe("PlayerCharacterForm save payload", () => {
    const extraPersonaValues = {
        name: "Hero",
        race: "human",
        characterClass: "wizard",
        level: 5,
        background: "sage",
        abilityScoreMethod: "manual",
        attributes: dndStatConfig.abilities.map((ability) => ({
            name: ability.name,
            value: 10,
        })),
        build: "Lean",
        voice: "Soft",
        disposition: { solitarySociable: 14, seriousEasygoing: 3 },
        backgroundDetails: { "guild-business": "Alchemists" },
    };

    it("strips persona fields from the Zod schema used by create/edit pages", () => {
        const parsed = playerSaveSchema().safeParse(extraPersonaValues);

        expect(parsed.success).toBe(true);
        if (!parsed.success) {
            return;
        }

        expect(parsed.data).not.toHaveProperty("build");
        expect(parsed.data).not.toHaveProperty("voice");
        expect(parsed.data).not.toHaveProperty("disposition");
        expect(parsed.data).not.toHaveProperty("backgroundDetails");
    });

    it("keeps persona and flavor fields that the schema would strip", async () => {
        const user = userEvent.setup();
        const onSave = jest.fn();

        render(
            <SchemaAwarePlayerFormHarness
                defaultValues={extraPersonaValues}
                onSave={onSave}
                initialStepId="review"
            />
        );

        const sidebar = getCreationSidebar();
        await user.click(
            sidebar.getByRole("button", { name: "Save Character" })
        );

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Hero",
                characterClass: "wizard",
                build: "Lean",
                voice: "Soft",
                disposition: { solitarySociable: 14, seriousEasygoing: 3 },
                backgroundDetails: { "guild-business": "Alchemists" },
            })
        );
    });
});
