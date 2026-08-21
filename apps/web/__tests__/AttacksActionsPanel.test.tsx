/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { AttacksActionsPanel } from "../components/characters/PlayerSheet/combat/AttacksActionsPanel";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
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
        {
            id: "system-dnd-basic-combat-base-ability-Dash",
            kind: "ability",
            ref: "Dash",
            name: "Dash",
            source: { type: "system", id: "dnd-basic-combat" },
            activation: { cost: "action" },
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
                <PlayerSheetActionBar />
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

        expect(screen.getAllByText("Action").length).toBeGreaterThan(0);
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Unarmed Strike")).toBeInTheDocument();
        expect(screen.getByText("Dash")).toBeInTheDocument();
        const longswordCard = screen
            .getByRole("button", { name: "Expand Longsword" })
            .closest("li");
        expect(longswordCard).not.toBeNull();
        expect(
            within(longswordCard as HTMLElement).getByRole("button", {
                name: "d20 +5",
            })
        ).toBeInTheDocument();
        expect(
            within(longswordCard as HTMLElement).getByRole("button", {
                name: /1d8/,
            })
        ).toBeInTheDocument();
        expect(
            within(longswordCard as HTMLElement).getByText("To hit")
        ).toBeInTheDocument();
        expect(
            within(longswordCard as HTMLElement).getByText("Damage")
        ).toBeInTheDocument();
    });

    it("opens attack-only roll for longsword", async () => {
        const user = userEvent.setup();
        renderPanel(fighterStored);

        const longswordCard = screen
            .getByRole("button", { name: "Expand Longsword" })
            .closest("li");
        await user.click(
            within(longswordCard as HTMLElement).getByRole("button", {
                name: "d20 +5",
            })
        );

        expect(screen.getByText("Longsword — d20 +5")).toBeInTheDocument();
    });

    it("toasts unarmed strike damage without opening the dice dialog", async () => {
        const user = userEvent.setup();
        renderPanel(fighterStored);

        const unarmedCard = screen
            .getByRole("button", { name: "Expand Unarmed Strike" })
            .closest("li");
        await user.click(
            within(unarmedCard as HTMLElement).getByRole("button", {
                name: "1 +3",
            })
        );

        expect(toastMock).toHaveBeenCalledWith("Unarmed Strike: 4 damage");
        expect(
            screen.queryByText(/Unarmed Strike — damage/)
        ).not.toBeInTheDocument();
    });

    it("opens damage-only roll for longsword", async () => {
        const user = userEvent.setup();
        renderPanel(fighterStored);

        await user.click(screen.getByRole("button", { name: /1d8/ }));

        expect(screen.getByText(/Longsword — damage/)).toBeInTheDocument();
    });

    it("hides action descriptions in the list and keeps them in the expanded modal", async () => {
        const user = userEvent.setup();
        renderPanel(fighterStored);

        expect(screen.getByText("Dash")).toBeInTheDocument();
        expect(
            screen.queryByText(/gain extra movement for the current turn/)
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expand Dash" }));

        const dialog = screen.getByRole("dialog");
        expect(
            within(dialog).getAllByText(/gain extra movement for the current turn/)
        ).not.toHaveLength(0);
    });

    it("hides spell short descriptions in the list and keeps them in the expanded modal", async () => {
        const user = userEvent.setup();
        renderPanel(wizardStored);

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(
            screen.queryByText("ranged spell attack; 1d10 fire damage on hit")
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Expand Fire Bolt" })
        );

        const dialog = screen.getByRole("dialog");
        expect(
            within(dialog).getByText(
                "ranged spell attack; 1d10 fire damage on hit"
            )
        ).toBeInTheDocument();
        expect(
            within(dialog).getAllByText(/You hurl a mote of fire/)
        ).not.toHaveLength(0);
    });

    it("shows wizard spell previews and opens fire-bolt attack roll", async () => {
        const user = userEvent.setup();
        renderPanel(wizardStored);

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Unarmed Strike")).toBeInTheDocument();
        expect(screen.getByText("Burning Hands")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20 +5" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "1d10" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "3d6" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "d20 +5" }));
        expect(screen.getByText("Fire Bolt — d20 +5")).toBeInTheDocument();
    });

    it("opens damage-only flow with three d6 steps for burning hands", async () => {
        const user = userEvent.setup();
        renderPanel(wizardStored);

        await user.click(screen.getByRole("button", { name: "3d6" }));

        expect(
            screen.getByText(/Burning Hands — damage/)
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "4" }));
        expect(
            screen.getByText("Burning Hands — damage 2/3 (d6)")
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "2" }));
        await user.click(screen.getByRole("button", { name: "6" }));

        expect(toastMock).toHaveBeenCalledWith("Burning Hands: 12 damage");
    });

    it("filters the surface with category toggles", async () => {
        const user = userEvent.setup();
        renderPanel({
            ...wizardStored,
            selections: {
                ...wizardStored.selections,
                inventory: {
                    bag: [{ slug: "srd_longsword", quantity: 1 }],
                    equipped: { "melee-main": "srd_longsword" },
                },
            },
            grants: [
                ...wizardStored.grants,
                {
                    id: "class-fighter-ability-second-wind",
                    kind: "ability",
                    ref: "Second Wind",
                    name: "Second Wind",
                    source: { type: "class", id: "fighter" },
                    activation: {
                        cost: "bonus",
                        resourceRef: "second-wind-uses",
                    },
                },
            ],
        });

        expect(screen.getByText("Second Wind")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Second Wind" })
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Use" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Use" }));
        expect(toastMock).toHaveBeenCalledWith("Second Wind");

        await user.click(screen.getByRole("button", { name: "Spells" }));

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
        expect(screen.queryByText("Second Wind")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Weapons" }));

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.queryByText("Second Wind")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "All" }));

        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Second Wind")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
    });

    it("filters basics separately from class abilities", async () => {
        const user = userEvent.setup();
        renderPanel({
            ...fighterStored,
            grants: [
                ...fighterStored.grants,
                {
                    id: "class-fighter-ability-second-wind",
                    kind: "ability",
                    ref: "Second Wind",
                    name: "Second Wind",
                    source: { type: "class", id: "fighter" },
                    activation: {
                        cost: "bonus",
                        resourceRef: "second-wind-uses",
                    },
                },
            ],
            resources: {
                ...fighterStored.resources,
                "second-wind-uses": 1,
            },
        });

        expect(screen.getByText("Dash")).toBeInTheDocument();
        expect(screen.getByText("Second Wind")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Basics" }));

        expect(screen.getByText("Dash")).toBeInTheDocument();
        expect(screen.queryByText("Second Wind")).not.toBeInTheDocument();
        expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    });
});
