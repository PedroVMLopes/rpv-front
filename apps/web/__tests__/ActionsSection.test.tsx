/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { ActionsSection } from "../components/characters/PlayerSheet/overview/ActionsSection";
import { DiceRollAssistant } from "../components/characters/PlayerSheet/roll/DiceRollAssistant";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

const toastMock = jest.fn();

jest.mock("sonner", () => ({
    toast: (...args: unknown[]) => toastMock(...args),
}));

function renderSection(stored: StoredCharacter) {
    useCharacterStore.setState({ characters: [stored] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <ActionsSection stored={stored} />
                <DiceRollAssistant />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

const wizardStored: StoredCharacter = {
    id: "wizard-actions-section",
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
        {
            id: "class-wizard-spell-detect-magic",
            kind: "spell",
            ref: "detect-magic",
            source: { type: "class", id: "wizard" },
            name: "Detect Magic",
        },
        {
            id: "class-wizard-spell-mage-hand",
            kind: "spell",
            ref: "mage-hand",
            source: { type: "class", id: "wizard" },
            name: "Mage Hand",
        },
    ],
    selections: {
        characterClass: "wizard",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: {
        hp: 8,
        "spell-slots-1": 4,
        "spell-slots-2": 3,
    },
    systemData: {
        characterClass: "wizard",
        level: 3,
    },
};

const fighterStored: StoredCharacter = {
    id: "fighter-actions-section",
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

const fighterWithLongswordStored: StoredCharacter = {
    ...fighterStored,
    id: "fighter-longsword-actions-section",
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
            bag: [{ slug: "longsword", quantity: 1 }],
            equipped: { "main-hand": "longsword" },
        },
    },
};

describe("ActionsSection", () => {
    beforeEach(() => {
        toastMock.mockClear();
        useCharacterStore.setState({ characters: [wizardStored] });
    });

    it("shows casting stats without spell slot rows in the top panel for a wizard", () => {
        renderSection(wizardStored);

        expect(screen.getByText("Casting class")).toBeInTheDocument();

        const topPanel = screen.getByText("Casting class").closest("div.rounded-xl");
        expect(topPanel).not.toBeNull();
        expect(
            within(topPanel!).queryByRole("button", { name: /Slot/i })
        ).not.toBeInTheDocument();
    });

    it("renders spell level collapsibles with slot squares in the header", () => {
        renderSection(wizardStored);

        expect(
            screen.getByRole("button", { name: "Expand Level 1:" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Level 2:" })
        ).toBeInTheDocument();

        const level1Trigger = screen.getByRole("button", {
            name: "Expand Level 1:",
        });
        const level1Header = level1Trigger.closest("div")?.parentElement;
        expect(level1Header).not.toBeNull();
        expect(
            within(level1Header!).getAllByRole("button", { pressed: false })
        ).toHaveLength(4);
    });

    it("keeps cantrips collapsed by default and shows spell cards after expanding", async () => {
        const user = userEvent.setup();
        renderSection(wizardStored);

        expect(
            screen.getByRole("button", { name: "Expand Cantrips" })
        ).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("Fire Bolt")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expand Cantrips" }));

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Fire Bolt" })
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20 +5" })).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Use", hidden: true })
        ).not.toBeInTheDocument();
    });

    it("opens spell detail modal from expand button", async () => {
        const user = userEvent.setup();
        renderSection(wizardStored);

        await user.click(screen.getByRole("button", { name: "Expand Cantrips" }));
        await user.click(screen.getByRole("button", { name: "Expand Fire Bolt" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Evocation")).toBeInTheDocument();
        expect(screen.getByText("At will")).toBeInTheDocument();
    });

    it("groups leveled spells inside the matching level collapsible", async () => {
        const user = userEvent.setup();
        renderSection(wizardStored);

        expect(screen.queryByText("Burning Hands")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expand Level 1:" }));

        expect(screen.getByText("Burning Hands")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "3d6" })).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Detect Magic" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Use" })
        ).toBeInTheDocument();
    });

    it("shows empty level message when a slot level has no spells", async () => {
        const user = userEvent.setup();
        renderSection(wizardStored);

        await user.click(screen.getByRole("button", { name: "Expand Level 2:" }));

        expect(
            screen.getByText("No spells at this level.")
        ).toBeInTheDocument();
    });

    it("consumes spell slots from the right in the level header", async () => {
        const user = userEvent.setup();
        renderSection(wizardStored);

        const level1Trigger = screen.getByRole("button", {
            name: "Expand Level 1:",
        });
        const level1Header = level1Trigger.closest("div")?.parentElement;
        const level1Buttons = within(level1Header!).getAllByRole("button", {
            pressed: false,
        });

        await user.click(level1Buttons[0]);

        expect(
            screen.getByRole("button", {
                name: "Slot 4 of 4, used",
                pressed: true,
            })
        ).toBeInTheDocument();
    });

    it("shows weapons empty state and hides spell sections for a non-caster", () => {
        renderSection(fighterStored);

        expect(screen.getByText("No weapons equipped")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Expand Longsword" })
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Casting class")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Expand Cantrips" })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Expand Level 1:" })
        ).not.toBeInTheDocument();
    });

    it("renders equipped weapon cards with roll and detail modal", async () => {
        const user = userEvent.setup();
        renderSection(fighterWithLongswordStored);

        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20 +5" })).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Longsword" })
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expand Longsword" }));

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(
            within(dialog).getAllByText("A well-balanced martial melee weapon.")
        ).not.toHaveLength(0);
        expect(within(dialog).getByText("Versatile")).toBeInTheDocument();
    });

    it("opens roll assistant when weapon roll button is clicked", async () => {
        const user = userEvent.setup();
        renderSection(fighterWithLongswordStored);

        await user.click(screen.getByRole("button", { name: "d20 +5" }));

        expect(
            screen.getByText("Longsword — attack d20 +5")
        ).toBeInTheDocument();
    });
});
