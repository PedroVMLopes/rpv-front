/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import { CombatTab } from "../components/characters/PlayerSheet/tabs/CombatTab";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import { HIT_DICE_RESOURCE } from "../lib/character/vitality";
import enMessages from "../messages/en.json";

jest.mock("sonner", () => ({
    toast: jest.fn(),
}));

jest.mock("../components/ui/HealthSlider", () => ({
    HealthSlider: () => <div data-testid="health-slider" />,
}));

const storedCharacter: StoredCharacter = {
    id: "char-combat-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Combat Hero",
    baseStats: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
        armorClass: 16,
        hitPoints: 20,
    },
    modifiers: [],
    grants: [
        {
            id: "class-fighter-saving_throw-strength",
            kind: "saving_throw",
            ref: "strength",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-skill_proficiency-perception-0",
            kind: "proficiency",
            ref: "perception",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-skill_proficiency-insight-0",
            kind: "proficiency",
            ref: "insight",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-weapon_proficiency-martial-weapons-0",
            kind: "proficiency",
            ref: "martial-weapons",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-resource-spell-slots-1",
            kind: "resource",
            ref: "spell-slots-1",
            amount: 2,
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-ability-second-wind",
            kind: "ability",
            ref: "Second Wind",
            name: "Second Wind",
            source: { type: "class", id: "fighter" },
            activation: { cost: "bonus", resourceRef: "second-wind-uses" },
        },
        {
            id: "system-dnd-basic-combat-base-ability-Dash",
            kind: "ability",
            ref: "Dash",
            name: "Dash",
            source: { type: "system", id: "dnd-basic-combat" },
            activation: { cost: "action" },
        },
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            name: "Fire Bolt",
            source: { type: "class", id: "wizard" },
        },
    ],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
        },
    },
    resources: { hp: 18, "spell-slots-1": 2 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

function CombatTabConnected({ characterId }: { characterId: string }) {
    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === characterId)
    );
    if (!stored) {
        return null;
    }
    return <CombatTab stored={stored} />;
}

function renderWithProviders(ui: ReactElement) {
    useCharacterStore.setState({
        characters: [
            {
                ...storedCharacter,
                resources: { ...storedCharacter.resources },
            },
        ],
    });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>{ui}</RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("CombatTab", () => {
    beforeEach(() => {
        useCharacterStore.setState({
            characters: [
                {
                    ...storedCharacter,
                    resources: { hp: 18, "spell-slots-1": 2 },
                },
            ],
        });
    });

    it("shows defense saves and empty conditions without exploration passives", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Spell Slots")).toBeInTheDocument();
        expect(screen.getByText("Defense & Saves")).toBeInTheDocument();
        expect(screen.getByText("Strength")).toBeInTheDocument();
        expect(screen.getByText("Prof")).toBeInTheDocument();
        expect(screen.queryByText("Passive Perception")).not.toBeInTheDocument();
        expect(screen.queryByText("Passive Insight")).not.toBeInTheDocument();
        expect(
            screen.getByText("Conditions & Immunities")
        ).toBeInTheDocument();
        expect(screen.getByText("None yet")).toBeInTheDocument();
        expect(screen.queryByText("Passive Reminders")).not.toBeInTheDocument();
        expect(screen.getByText("Hit dice")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Spend a hit die" })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Short Rest" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Long Rest" })
        ).toBeInTheDocument();

        const slotsHeading = screen.getByText("Spell Slots");
        const defenseHeading = screen.getByText("Defense & Saves");
        expect(
            Boolean(
                slotsHeading.compareDocumentPosition(defenseHeading) &
                    Node.DOCUMENT_POSITION_FOLLOWING
            )
        ).toBe(true);
    });

    it("adds and removes catalog conditions from the panel", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("None yet")).toBeInTheDocument();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Add condition" }),
            "blessed"
        );

        expect(
            screen.getByRole("button", { name: "Remove Blessed" })
        ).toBeInTheDocument();
        expect(screen.queryByText("None yet")).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Remove Blessed" })
        );
        expect(screen.getByText("None yet")).toBeInTheDocument();
    });

    it("lists passive combat traits in reminders, not in actions", () => {
        const withReminder: StoredCharacter = {
            ...storedCharacter,
            id: "char-combat-reminders",
            grants: [
                ...storedCharacter.grants,
                {
                    id: "class-barbarian-ability-danger-sense",
                    kind: "ability",
                    ref: "Danger Sense",
                    name: "Danger Sense",
                    source: { type: "class", id: "barbarian" },
                    activation: { cost: "passive" },
                },
            ],
        };

        useCharacterStore.setState({
            characters: [
                { ...withReminder, resources: { ...withReminder.resources } },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <CombatTab stored={withReminder} />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        const remindersHeading = screen.getByText((content, element) => {
            return (
                content === "Passive Reminders" &&
                element?.getAttribute("data-slot") === "card-title"
            );
        });
        expect(remindersHeading).toBeInTheDocument();
        expect(screen.getByText("Danger Sense")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Danger Sense" })
        ).toBeInTheDocument();

        const conditionsHeading = screen.getByText("Conditions & Immunities");
        expect(
            Boolean(
                conditionsHeading.compareDocumentPosition(remindersHeading) &
                    Node.DOCUMENT_POSITION_FOLLOWING
            )
        ).toBe(true);
    });

    it("lists equipped weapons, spells, and features with roll/use actions", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Unarmed Strike")).toBeInTheDocument();
        expect(screen.getByText("Dash")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Second Wind")).toBeInTheDocument();
        const longswordCard = screen
            .getByRole("button", { name: "Expand Longsword" })
            .closest("li");
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
            screen.getByRole("button", { name: "Expand Longsword" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Expand Second Wind" })
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: "Use" }).length
        ).toBeGreaterThanOrEqual(1);
        await user.click(
            screen.getByRole("button", { name: "Expand Second Wind" })
        );
        expect(screen.getByRole("dialog")).toHaveTextContent(
            /regain hit points equal to 1d10/i
        );
    });

    it("shows spell slot squares above defense saves", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.queryByText("Class Resources")).not.toBeInTheDocument();
        expect(screen.getByText("Spell Slots")).toBeInTheDocument();
        expect(screen.getByText("Level 1:")).toBeInTheDocument();
        const slot1 = screen.getByRole("button", {
            name: "Slot 1 of 2, available",
        });
        const slot2 = screen.getByRole("button", {
            name: "Slot 2 of 2, available",
        });
        expect(slot1).toHaveStyle({ gridColumn: "1", gridRow: "1" });
        expect(slot2).toHaveStyle({ gridColumn: "2", gridRow: "1" });
        expect(slot1.parentElement).toHaveStyle({
            gridTemplateRows: "repeat(1, auto)",
        });
        expect(screen.queryByText("2 / 2")).not.toBeInTheDocument();
        expect(screen.queryByText("Spellcasting")).not.toBeInTheDocument();
    });

    it("shows class resources above spell slots when both exist", () => {
        const mixed: StoredCharacter = {
            ...storedCharacter,
            id: "char-combat-mixed",
            grants: [
                ...storedCharacter.grants,
                {
                    id: "class-barbarian-resource-rage-uses",
                    kind: "resource",
                    ref: "rage-uses",
                    amount: 2,
                    source: { type: "class", id: "barbarian" },
                },
            ],
            resources: { hp: 18, "spell-slots-1": 2, "rage-uses": 2 },
        };

        useCharacterStore.setState({
            characters: [{ ...mixed, resources: { ...mixed.resources } }],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <CombatTab stored={mixed} />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        expect(screen.getByText("Class Resources")).toBeInTheDocument();
        expect(screen.getByText("Rage Uses")).toBeInTheDocument();
        expect(screen.getByText("2 / 2")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Rage Uses −" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Rage Uses +" })
        ).toBeInTheDocument();

        expect(screen.getByText("Spell Slots")).toBeInTheDocument();
        expect(screen.getByText("Level 1:")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Slot 1 of 2, available" })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Level 1: −" })
        ).not.toBeInTheDocument();

        const resourcesHeading = screen.getByText("Class Resources");
        const slotsHeading = screen.getByText("Spell Slots");
        expect(
            Boolean(
                resourcesHeading.compareDocumentPosition(slotsHeading) &
                    Node.DOCUMENT_POSITION_FOLLOWING
            )
        ).toBe(true);
    });

    it("shows pact slots without wizard Level N labels", () => {
        const warlock: StoredCharacter = {
            ...storedCharacter,
            id: "char-combat-warlock",
            grants: storedCharacter.grants
                .filter((grant) => grant.ref !== "spell-slots-1")
                .concat([
                    {
                        id: "class-warlock-resource-pact-slots",
                        kind: "resource",
                        ref: "pact-slots",
                        amount: 1,
                        source: { type: "class", id: "warlock" },
                        resource: {
                            display: "slots",
                            slotLevel: 1,
                            recoverOn: "short_rest",
                        },
                    },
                ]),
            selections: {
                ...storedCharacter.selections,
                characterClass: "warlock",
            },
            resources: { hp: 18, "pact-slots": 1 },
            systemData: {
                characterClass: "warlock",
                level: 1,
            },
        };

        useCharacterStore.setState({
            characters: [{ ...warlock, resources: { ...warlock.resources } }],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <CombatTab stored={warlock} />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        expect(screen.getByText("Pact Slots")).toBeInTheDocument();
        expect(screen.getByText("Pact Slots (1)")).toBeInTheDocument();
        expect(screen.queryByText("Spell Slots")).not.toBeInTheDocument();
        expect(screen.queryByText("Level 1:")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Slot 1 of 1, available" })
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Short Rest" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Long Rest" })).toBeInTheDocument();
    });

    it("marks the last spell slots used first in the two-row grid", () => {
        const fourSlots: StoredCharacter = {
            ...storedCharacter,
            id: "char-combat-four-slots",
            grants: storedCharacter.grants.map((grant) =>
                grant.ref === "spell-slots-1" ? { ...grant, amount: 4 } : grant
            ),
            resources: { hp: 18, "spell-slots-1": 2 },
        };

        useCharacterStore.setState({
            characters: [
                { ...fourSlots, resources: { ...fourSlots.resources } },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <CombatTab stored={fourSlots} />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        expect(
            screen.getByRole("button", { name: "Slot 1 of 4, available" })
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.getByRole("button", { name: "Slot 2 of 4, available" })
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.getByRole("button", { name: "Slot 3 of 4, used" })
        ).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("button", { name: "Slot 4 of 4, used" })
        ).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("button", { name: "Slot 3 of 4, used" })
        ).toHaveStyle({ gridColumn: "1", gridRow: "2" });
        expect(
            screen.getByRole("button", { name: "Slot 4 of 4, used" })
        ).toHaveStyle({ gridColumn: "2", gridRow: "2" });
    });

    it("opens a short rest modal that restores class pools without spending hit dice", async () => {
        const user = userEvent.setup();
        const warlock: StoredCharacter = {
            ...storedCharacter,
            id: "char-short-rest-warlock",
            grants: storedCharacter.grants
                .filter((grant) => grant.ref !== "spell-slots-1")
                .concat([
                    {
                        id: "class-warlock-resource-pact-slots",
                        kind: "resource",
                        ref: "pact-slots",
                        amount: 1,
                        source: { type: "class", id: "warlock" },
                        resource: {
                            display: "slots",
                            slotLevel: 1,
                            recoverOn: "short_rest",
                        },
                    },
                ]),
            selections: {
                ...storedCharacter.selections,
                characterClass: "warlock",
            },
            resources: {
                hp: 10,
                "pact-slots": 0,
                [HIT_DICE_RESOURCE]: 2,
            },
            systemData: {
                characterClass: "warlock",
                level: 3,
            },
        };

        useCharacterStore.setState({
            characters: [{ ...warlock, resources: { ...warlock.resources } }],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider>
                    <CombatTabConnected characterId={warlock.id} />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        expect(
            screen.queryByRole("button", { name: "Spend a hit die" })
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Short Rest" }));

        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByRole("heading", { name: "Short rest" })
        ).toBeInTheDocument();
        expect(within(dialog).getByText("Pact Slots")).toBeInTheDocument();
        expect(within(dialog).getByText("0 → 1")).toBeInTheDocument();
        expect(
            useCharacterStore.getState().characters[0]?.resources["pact-slots"]
        ).toBe(1);
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(10);
        expect(
            useCharacterStore.getState().characters[0]?.resources[
                HIT_DICE_RESOURCE
            ]
        ).toBe(2);

        await user.click(
            within(dialog).getByRole("button", { name: "Spend a hit die" })
        );
        await user.click(within(dialog).getByRole("button", { name: "8" }));

        const afterSpend = useCharacterStore.getState().characters[0];
        expect(afterSpend?.resources[HIT_DICE_RESOURCE]).toBe(1);
        expect(afterSpend?.resources.hp).toBe(20);
        expect(
            within(dialog).getByRole("button", { name: "Spend a hit die" })
        ).toBeInTheDocument();

        await user.click(within(dialog).getByRole("button", { name: "Done" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes the short rest modal without spending remaining hit dice", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        await user.click(screen.getByRole("button", { name: "Short Rest" }));
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByText(
                "No class resources recover on a short rest."
            )
        ).toBeInTheDocument();

        await user.click(within(dialog).getByRole("button", { name: "Done" }));
        expect(
            useCharacterStore.getState().characters[0]?.resources[
                HIT_DICE_RESOURCE
            ]
        ).toBeUndefined();
    });
});

describe("PlayerSheet combat tab", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("opens combat content instead of coming soon", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Actions" }));
        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });
});
