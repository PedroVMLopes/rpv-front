/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { AttacksActionsPanel } from "../components/characters/PlayerSheet/combat/AttacksActionsPanel";
import { DiceRollAssistant } from "../components/characters/PlayerSheet/roll/DiceRollAssistant";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

const toastMock = jest.fn();

jest.mock("sonner", () => ({
    toast: (...args: unknown[]) => toastMock(...args),
}));

const fighterStored: StoredCharacter = {
    id: "fighter-combat-panel",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Fighter",
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
            id: "class-fighter-weapon_proficiency-martial-weapons-0",
            kind: "proficiency",
            ref: "martial-weapons",
            source: { type: "class", id: "fighter" },
        },
    ],
    selections: {
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
        },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

const wizardStored: StoredCharacter = {
    id: "wizard-combat-panel",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Wizard",
    baseStats: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 16,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 8,
    },
    modifiers: [],
    grants: [
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            source: { type: "class", id: "wizard" },
            name: "Fire Bolt",
        },
        {
            id: "class-wizard-spell-burning-hands",
            kind: "spell",
            ref: "burning-hands",
            source: { type: "class", id: "wizard" },
            name: "Burning Hands",
        },
    ],
    selections: {
        characterClass: "wizard",
        choices: {
            preparedSpells: ["burning-hands"],
        },
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 8 },
    systemData: {
        characterClass: "wizard",
        level: 1,
    },
};

function renderPanel(stored: StoredCharacter) {
    useCharacterStore.setState({ characters: [stored] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <AttacksActionsPanel stored={stored} />
                <DiceRollAssistant />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("AttacksActionsPanel roll integration", () => {
    beforeEach(() => {
        toastMock.mockClear();
        useCharacterStore.setState({ characters: [fighterStored] });
    });

    it("shows longsword attack preview for fighter", () => {
        renderPanel(fighterStored);

        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText(/\+5/)).toBeInTheDocument();
        expect(screen.getByText(/1d8\+3 slashing/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Roll Longsword" })).toBeInTheDocument();
    });

    it("opens attack_then_damage flow for longsword", async () => {
        const user = userEvent.setup();
        renderPanel(fighterStored);

        await user.click(screen.getByRole("button", { name: "Roll Longsword" }));

        expect(
            screen.getByText("Longsword — attack d20 +5")
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "14" }));
        expect(
            screen.getByText("Longsword — damage d8")
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "5" }));
        expect(toastMock).toHaveBeenCalledWith(
            "Longsword: attack 19, damage 8"
        );
    });

    it("shows wizard spell previews and opens fire-bolt attack roll", async () => {
        const user = userEvent.setup();
        renderPanel(wizardStored);

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Burning Hands")).toBeInTheDocument();
        expect(screen.getByText(/DC 13/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Roll Fire Bolt" }));
        expect(
            screen.getByText("Fire Bolt — attack d20 +5")
        ).toBeInTheDocument();
    });

    it("opens damage_only flow with three d6 steps for burning hands", async () => {
        const user = userEvent.setup();
        renderPanel(wizardStored);

        await user.click(
            screen.getByRole("button", { name: "Roll Burning Hands" })
        );

        expect(
            screen.getByText(/Burning Hands — damage 1\/3 \(d6\) \(DC 13\)/)
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "4" }));
        expect(
            screen.getByText("Burning Hands — damage 2/3 (d6)")
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "2" }));
        await user.click(screen.getByRole("button", { name: "6" }));

        expect(toastMock).toHaveBeenCalledWith("Burning Hands: 12 damage");
    });
});
