/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

const storedCharacter: StoredCharacter = {
    id: "action-bar-hero",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Hero",
    baseStats: {
        strength: 16,
        dexterity: 14,
        constitution: 12,
        intelligence: 10,
        wisdom: 10,
        charisma: 8,
        armorClass: 16,
        hitPoints: 12,
    },
    modifiers: [],
    grants: [],
    selections: {
        characterClass: "fighter",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 12 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

function renderBar() {
    useCharacterStore.setState({ characters: [storedCharacter] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <PlayerSheetActionBar stored={storedCharacter} />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("PlayerSheetActionBar", () => {
    it("renders three enabled icon buttons", () => {
        renderBar();

        expect(
            screen.getByRole("toolbar", { name: "Session actions" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Quick note" })
        ).toBeEnabled();
    });

    it("opens the ability checks panel and swaps to dice without collapsing", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(
            screen.getByRole("button", { name: "Skills and abilities" })
        );
        expect(screen.getByRole("navigation", { name: "Abilities" })).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Skills and abilities" })
            ).toHaveAttribute("aria-pressed", "true");
        });

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("navigation", { name: "Abilities" })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("closes the panel when the backdrop is clicked", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));
        expect(screen.getByRole("textbox", { name: "Note" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Cancel" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("textbox", { name: "Note" })
            ).not.toBeInTheDocument();
        });
    });

    it("opens the note composer from the quick note button", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));

        expect(screen.getByRole("textbox", { name: "Note" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save note" })).toBeEnabled();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });

    it("closes without saving when save is pressed on an empty note", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));
        await user.click(screen.getByRole("button", { name: "Save note" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("textbox", { name: "Note" })
            ).not.toBeInTheDocument();
        });
        expect(useCharacterStore.getState().characters[0].notes ?? []).toEqual(
            []
        );
    });

    it("saves a note and closes the panel", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));
        await user.type(screen.getByRole("textbox", { name: "Note" }), "Garen");
        await user.click(screen.getByRole("button", { name: "Save note" }));

        await waitFor(() => {
            expect(
                screen.queryByRole("textbox", { name: "Note" })
            ).not.toBeInTheDocument();
        });
        expect(useCharacterStore.getState().characters[0].notes).toEqual([
            expect.objectContaining({
                body: "Garen",
                visibility: "private",
            }),
        ]);
    });

    it("does not accept more than 1200 characters", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));
        const field = screen.getByRole("textbox", { name: "Note" });
        await user.click(field);
        await user.paste("a".repeat(1201));

        expect(field).toHaveValue("a".repeat(1200));
        expect(screen.getByText("1200/1200")).toBeInTheDocument();
    });

    it("opens die selection from the dice button", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20" })).toBeInTheDocument();
    });
});
