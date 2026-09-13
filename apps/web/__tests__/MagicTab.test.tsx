/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { MagicSpellbookPanel } from "../components/characters/PlayerSheet/magic/MagicSpellbookPanel";
import { MagicTab } from "../components/characters/PlayerSheet/tabs/MagicTab";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

const toastMock = jest.fn();

jest.mock("sonner", () => ({
    toast: (...args: unknown[]) => toastMock(...args),
}));

function renderSpellbook(stored: StoredCharacter) {
    useCharacterStore.setState({ characters: [stored] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <MagicSpellbookPanel stored={stored} />
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

function renderMagicTab(stored: StoredCharacter) {
    useCharacterStore.setState({ characters: [stored] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <MagicTab stored={stored} />
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

const wizardStored: StoredCharacter = {
    id: "wizard-magic-tab",
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
        {
            id: "class-wizard-spell-magic-missile",
            kind: "spell",
            ref: "magic-missile",
            source: { type: "class", id: "wizard" },
            name: "Magic Missile",
        },
        {
            id: "class-wizard-resource-spell-slots-1",
            kind: "resource",
            ref: "spell-slots-1",
            amount: 4,
            source: { type: "class", id: "wizard" },
        },
        {
            id: "class-wizard-resource-spell-slots-2",
            kind: "resource",
            ref: "spell-slots-2",
            amount: 3,
            source: { type: "class", id: "wizard" },
        },
    ],
    selections: {
        characterClass: "wizard",
        choices: {
            grantPicks: {
                "class:wizard:1:spell:1:0": "fire-bolt",
                "class:wizard:1:spell:1:1": "mage-hand",
                "class:wizard:1:spell:2:0": "burning-hands",
                "class:wizard:1:spell:2:1": "detect-magic",
                "class:wizard:1:spell:2:2": "magic-missile",
            },
            preparedSpells: ["burning-hands", "detect-magic"],
        },
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
    id: "fighter-no-magic",
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

describe("MagicSpellbookPanel", () => {
    beforeEach(() => {
        toastMock.mockClear();
        useCharacterStore.setState({ characters: [wizardStored] });
    });

    it("renders spell level collapsibles with slot squares in the header", () => {
        renderSpellbook(wizardStored);

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

    it("shows cantrips open by default with spell cards", () => {
        renderSpellbook(wizardStored);

        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Mage Hand")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20 +5" })).toBeInTheDocument();
    });

    it("groups leveled spells inside the matching level collapsible", () => {
        renderSpellbook(wizardStored);

        expect(screen.getByText("Burning Hands")).toBeInTheDocument();
        expect(screen.getByText("Detect Magic")).toBeInTheDocument();
    });

    it("shows known unprepared spells as muted read-only cards", async () => {
        const user = userEvent.setup();
        renderSpellbook(wizardStored);

        expect(screen.getByText("Magic Missile")).toBeInTheDocument();
        expect(screen.getByText(/Unprepared/)).toBeInTheDocument();

        const missileCard = screen
            .getByRole("heading", { name: "Magic Missile" })
            .closest("div.min-w-0.h-fit");
        expect(missileCard).not.toBeNull();
        expect(missileCard).toHaveClass("opacity-60");
        expect(
            within(missileCard!).getByRole("button", { name: "3d4+1" })
        ).toBeDisabled();

        await user.click(
            within(missileCard!).getByRole("button", {
                name: "Expand Magic Missile",
            })
        );
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("consumes spell slots via the store from the level header", async () => {
        const user = userEvent.setup();
        renderSpellbook(wizardStored);

        const level1Trigger = screen.getByRole("button", {
            name: "Expand Level 1:",
        });
        const level1Header = level1Trigger.closest("div")?.parentElement;
        const level1Buttons = within(level1Header!).getAllByRole("button", {
            pressed: false,
        });

        await user.click(level1Buttons[3]);

        expect(
            useCharacterStore.getState().characters[0]?.resources["spell-slots-1"]
        ).toBe(3);
    });
});

describe("MagicTab", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [wizardStored] });
    });

    it("shows casting stats, slots, prepare CTA, and spellbook for a wizard", () => {
        renderMagicTab(wizardStored);

        expect(screen.getByText("Casting class")).toBeInTheDocument();
        expect(screen.getByText("Spellbook")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Prepare spells/ })
        ).toBeInTheDocument();
    });

    it("toggles prepared spells in the prepare modal", async () => {
        const user = userEvent.setup();
        const level1Wizard: StoredCharacter = {
            ...wizardStored,
            id: "wizard-prepare-modal",
            systemData: {
                characterClass: "wizard",
                level: 1,
            },
            grants: wizardStored.grants.filter(
                (grant) =>
                    grant.kind === "spell" ||
                    grant.ref === "spell-slots-1"
            ),
            resources: { hp: 8, "spell-slots-1": 2 },
            selections: {
                characterClass: "wizard",
                choices: {
                    grantPicks: {
                        "class:wizard:1:spell:1:0": "fire-bolt",
                        "class:wizard:1:spell:2:0": "burning-hands",
                        "class:wizard:1:spell:2:1": "magic-missile",
                    },
                    preparedSpells: ["burning-hands"],
                },
                inventory: { bag: [], equipped: {} },
            },
        };
        useCharacterStore.setState({ characters: [level1Wizard] });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <MagicTab stored={level1Wizard} />
                    <PlayerSheetActionBar />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        await user.click(
            screen.getAllByRole("button", { name: /Prepare spells/ })[0]
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(
            within(dialog).getByText("1 of 4 prepared")
        ).toBeInTheDocument();

        await user.click(within(dialog).getByText("Magic Missile"));

        const updated = useCharacterStore
            .getState()
            .characters.find((character) => character.id === level1Wizard.id);
        expect(updated?.selections.choices.preparedSpells).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
    });
});

describe("PlayerSheet magic tab visibility", () => {
    it("hides the Magic tab for a fighter without spells", () => {
        useCharacterStore.setState({ characters: [fighterStored] });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <PlayerSheet stored={fighterStored} />
            </NextIntlClientProvider>
        );

        expect(
            screen.queryByRole("tab", { name: "Magic" })
        ).not.toBeInTheDocument();
    });

    it("shows the Magic tab for a wizard", () => {
        useCharacterStore.setState({ characters: [wizardStored] });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <PlayerSheet stored={wizardStored} />
            </NextIntlClientProvider>
        );

        expect(screen.getByRole("tab", { name: "Magic" })).toBeInTheDocument();
    });
});
