/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { AbilityChecksPanel } from "../components/characters/PlayerSheet/AbilityChecksPanel";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

const storedCharacter: StoredCharacter = {
    id: "char-ability-checks",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Roll Hero",
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
    grants: [
        {
            id: "class-fighter-skill_proficiency-athletics-0",
            kind: "proficiency",
            ref: "athletics",
            source: { type: "class", id: "fighter" },
        },
    ],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

function renderPanel() {
    useCharacterStore.setState({
        characters: [storedCharacter],
    });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <AbilityChecksPanel stored={storedCharacter} />
                <PlayerSheetActionBar stored={storedCharacter} />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("AbilityChecksPanel", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("lists the dexterity saving throw then its skills", () => {
        renderPanel();

        const dexterity = screen.getByRole("region", { name: "Dexterity" });
        const labels = within(dexterity)
            .getAllByRole("button")
            .map((button) => button.textContent);

        expect(labels.join(" ")).toContain("DEX");
        expect(labels.some((text) => text?.includes("Saving throw"))).toBe(true);
        expect(labels.some((text) => text?.includes("Acrobatics"))).toBe(true);
        expect(labels.some((text) => text?.includes("Sleight of Hand"))).toBe(
            true
        );
        expect(labels.some((text) => text?.includes("Stealth"))).toBe(true);
    });

    it("marks a proficient skill", () => {
        renderPanel();

        const athletics = screen.getByRole("button", { name: "Roll Athletics" });
        expect(
            within(athletics).getByLabelText("Proficient")
        ).toBeInTheDocument();
    });

    it("opens an ability check from the stone", async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.click(screen.getByRole("button", { name: "Roll Dexterity" }));

        expect(screen.getByText("Dexterity — d20 +2")).toBeInTheDocument();
        expect(
            screen.queryByText("Select the die you want to roll")
        ).not.toBeInTheDocument();
    });

    it("opens a saving throw from the first row", async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.click(
            screen.getByRole("button", { name: "Roll Saving throw (DEX)" })
        );

        expect(
            screen.getByText("Saving throw (DEX) — d20 +2")
        ).toBeInTheDocument();
    });

    it("opens a skill roll and swaps the action bar to the die picker", async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.click(screen.getByRole("button", { name: "Roll Athletics" }));

        expect(screen.getByText("Athletics — d20 +5")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "14" })).toBeInTheDocument();
    });
});
