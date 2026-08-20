/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { SkillsCard } from "../components/characters/PlayerSheet/overview/SkillsCard";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

const toastMock = jest.fn();

jest.mock("sonner", () => ({
    toast: (...args: unknown[]) => toastMock(...args),
}));

const storedCharacter: StoredCharacter = {
    id: "char-skills-roll",
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

function renderSkillsCard() {
    useCharacterStore.setState({
        characters: [storedCharacter],
    });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <SkillsCard stored={storedCharacter} />
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("SkillsCard roll integration", () => {
    beforeEach(() => {
        toastMock.mockClear();
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("opens contextual d20 roll from a skill row", async () => {
        const user = userEvent.setup();
        renderSkillsCard();

        await user.click(screen.getByRole("button", { name: "Roll Athletics" }));

        expect(screen.getByText(/Athletics — d20 \+5/)).toBeInTheDocument();
        expect(
            screen.queryByText("Select the die you want to roll")
        ).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "14" })).toBeInTheDocument();
    });

    it("shows contextual toast total when a die value is selected", async () => {
        const user = userEvent.setup();
        renderSkillsCard();

        await user.click(screen.getByRole("button", { name: "Roll Athletics" }));
        await user.click(screen.getByRole("button", { name: "14" }));

        expect(toastMock).toHaveBeenCalledWith("Athletics: 19");
    });
});
