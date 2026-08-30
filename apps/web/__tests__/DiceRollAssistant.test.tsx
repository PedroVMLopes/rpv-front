/**
 * @jest-environment jsdom
 */
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import {
    RollAssistantProvider,
    useRollAssistant,
} from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type { RollRequest } from "../lib/roll/rollRequest.types";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

const toastMock = jest.fn();

jest.mock("sonner", () => ({
    toast: (...args: unknown[]) => toastMock(...args),
}));

function renderAssistant(children?: ReactNode) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                {children}
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

function ContextRollTrigger({
    request,
}: {
    request: RollRequest;
}) {
    const { openRollRequest } = useRollAssistant();

    return (
        <button type="button" onClick={() => openRollRequest(request)}>
            Open contextual roll
        </button>
    );
}

describe("DiceRollAssistant", () => {
    beforeEach(() => {
        toastMock.mockClear();
    });

    it("opens the panel from the action bar and shows die selection", async () => {
        const user = userEvent.setup();
        renderAssistant();

        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20" })).toBeInTheDocument();
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Open dice roller" })
            ).toHaveAttribute("aria-pressed", "true");
        });
    });

    it("moves to the result step after selecting a die", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d6" }));

        expect(
            screen.getByText("Select the result (d6)")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    });

    it("closes the panel when the dice button is toggled on step 1", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Open dice roller" })
            ).toHaveAttribute("aria-pressed", "true");
        });
        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "false");
        await waitFor(() => {
            expect(
                screen.queryByText("Select the die you want to roll")
            ).not.toBeInTheDocument();
        });
    });

    it("closes the panel when Escape is pressed on step 2", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d4" }));
        await user.keyboard("{Escape}");

        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "false");
        await waitFor(() => {
            expect(
                screen.queryByText("Select the result (d4)")
            ).not.toBeInTheDocument();
        });
    });

    it("shows a toast and closes when a result is selected", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d20" }));
        await user.click(screen.getByRole("button", { name: "14" }));

        expect(toastMock).toHaveBeenCalledWith("d20: 14");
        await waitFor(() => {
            expect(
                screen.queryByText("Select the result (d20)")
            ).not.toBeInTheDocument();
        });
    });

    it("shows a toast when random roll is used", async () => {
        const user = userEvent.setup();
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d8" }));
        await user.click(screen.getByRole("button", { name: "Random roll" }));

        expect(toastMock).toHaveBeenCalledWith("d8: 5");
        await waitFor(() => {
            expect(
                screen.queryByText("Select the result (d8)")
            ).not.toBeInTheDocument();
        });

        randomSpy.mockRestore();
    });

    it("combines tens and units for d100 manual selection", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d100" }));
        await user.click(screen.getByRole("button", { name: "50" }));
        await user.click(screen.getByRole("button", { name: "7" }));

        expect(toastMock).toHaveBeenCalledWith("d100: 57");
    });

    it("treats 00 and 0 as d100 result 100", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d100" }));
        await user.click(screen.getByRole("button", { name: "00" }));
        await user.click(screen.getByRole("button", { name: "0" }));

        expect(toastMock).toHaveBeenCalledWith("d100: 100");
    });

    it("opens directly on d20 for contextual requests", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 5,
                    appliesTo: "ability_check",
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));

        expect(screen.getByText("Athletics — d20 +5")).toBeInTheDocument();
        expect(
            screen.queryByText("Select the die you want to roll")
        ).not.toBeInTheDocument();
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Open dice roller" })
            ).toHaveAttribute("aria-pressed", "true");
        });
    });

    it("shows contextual toast with modifier applied", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 5,
                    appliesTo: "ability_check",
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "14" }));

        expect(toastMock).toHaveBeenCalledWith("Athletics: 19");
    });

    it("completes attack_then_damage in two steps", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "attack_then_damage",
                    id: "weapon:longsword",
                    label: "Longsword",
                    attack: { die: 20, modifier: 5 },
                    damage: { sides: 8, flat: 3, damageType: "slashing" },
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
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

    it("defaults the damage step title to d6 when sides are missing", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "attack_then_damage",
                    id: "weapon:club",
                    label: "Club",
                    attack: { die: 20, modifier: 2 },
                    damage: { flat: 1, damageType: "bludgeoning" },
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "10" }));

        expect(screen.getByText("Club — damage d6")).toBeInTheDocument();
    });

    it("completes damage_only across three d6 steps", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "damage_only",
                    id: "spell:burning-hands",
                    label: "Burning Hands",
                    saveDc: 13,
                    saveAbility: "dexterity",
                    steps: [
                        { sides: 6, damageType: "fire" },
                        { sides: 6, damageType: "fire" },
                        { sides: 6, damageType: "fire" },
                    ],
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "4" }));
        await user.click(screen.getByRole("button", { name: "2" }));
        await user.click(screen.getByRole("button", { name: "6" }));

        expect(toastMock).toHaveBeenCalledWith("Burning Hands: 12 damage");
    });

    it("lets the player toggle disadvantage and pick the lower d20", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 5,
                    appliesTo: "ability_check",
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "Disadvantage" }));
        await user.click(screen.getByRole("button", { name: "14" }));
        await user.click(screen.getByRole("button", { name: "3" }));

        expect(toastMock).toHaveBeenCalledWith("Athletics: 8");
    });

    it("adds a bless d4 after a save when the character is blessed", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "blessed-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Blessed",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 8,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 8 },
                    systemData: {},
                    session: { activeConditions: ["blessed"] },
                },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider characterId="blessed-roller">
                    <ContextRollTrigger
                        request={{
                            kind: "d20_test",
                            id: "save:wisdom",
                            label: "Wisdom",
                            die: 20,
                            modifier: 2,
                            appliesTo: "save",
                        }}
                    />
                    <PlayerSheetActionBar />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "14" }));

        expect(toastMock).not.toHaveBeenCalled();
        expect(screen.getByText("Wisdom — extra d4")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "3" }));
        expect(toastMock).toHaveBeenCalledWith("Wisdom: 19");
    });

    it("preselects disadvantage on ability checks when poisoned", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "poisoned-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Poisoned",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 8,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 8 },
                    systemData: {},
                    session: { activeConditions: ["poisoned"] },
                },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider characterId="poisoned-roller">
                    <ContextRollTrigger
                        request={{
                            kind: "d20_test",
                            id: "skill:athletics",
                            label: "Athletics",
                            die: 20,
                            modifier: 5,
                            appliesTo: "ability_check",
                        }}
                    />
                    <PlayerSheetActionBar />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        expect(
            screen.getByRole("button", { name: "Disadvantage" })
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("suggests a death-save outcome and only writes on confirm", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "dying-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Dying",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 8,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 0 },
                    systemData: { level: 1 },
                },
            ],
        });

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "death_save",
                    id: "death-save:dying-roller",
                    label: "Death saves",
                    characterId: "dying-roller",
                    die: 20,
                }}
            />
        );

        await user.click(
            screen.getByRole("button", { name: "Open contextual roll" })
        );
        await user.click(screen.getByRole("button", { name: "10" }));

        expect(screen.getByText("Mark the death save")).toBeInTheDocument();
        expect(
            useCharacterStore.getState().characters[0]?.session?.deathSaves
        ).toBeUndefined();

        const suggested = screen.getByRole("button", { name: /Success/ });
        expect(suggested).toHaveTextContent("Suggested");
        await user.click(suggested);

        expect(
            useCharacterStore.getState().characters[0]?.session?.deathSaves
        ).toEqual({ successes: 1, failures: 0 });
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(0);
    });

    it("heals and spends a hit die when the roll completes", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "resting-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Resting",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 14,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 20,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 5, "hit-dice": 3 },
                    systemData: { level: 3 },
                },
            ],
        });

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "hit_die",
                    id: "hit-die:resting-roller",
                    label: "Hit dice",
                    characterId: "resting-roller",
                    die: 10,
                }}
            />
        );

        await user.click(
            screen.getByRole("button", { name: "Open contextual roll" })
        );
        await user.click(screen.getByRole("button", { name: "8" }));

        const next = useCharacterStore.getState().characters[0];
        expect(next?.resources.hp).toBe(15);
        expect(next?.resources["hit-dice"]).toBe(2);
        expect(toastMock).toHaveBeenCalledWith("Hit dice: recover 10 HP");
    });

    it("shows the advantage roll hint when advantage is selected", async () => {
        const user = userEvent.setup();

        renderAssistant(
            <ContextRollTrigger
                request={{
                    kind: "d20_test",
                    id: "skill:athletics",
                    label: "Athletics",
                    die: 20,
                    modifier: 5,
                    appliesTo: "ability_check",
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "Advantage" }));

        expect(
            screen.getByText("Roll twice and use the higher result.")
        ).toBeInTheDocument();
    });

    it("shows inspiration mode only when the character has inspiration", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "inspired-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Inspired",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 8,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 8 },
                    systemData: {},
                    session: { metaPoints: { inspiration: 1 } },
                },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider characterId="inspired-roller">
                    <ContextRollTrigger
                        request={{
                            kind: "d20_test",
                            id: "skill:athletics",
                            label: "Athletics",
                            die: 20,
                            modifier: 5,
                            appliesTo: "ability_check",
                        }}
                    />
                    <PlayerSheetActionBar />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));

        expect(
            screen.getByRole("button", { name: "Inspiration" })
        ).toBeInTheDocument();
    });

    it("spends inspiration after completing a roll in inspiration mode", async () => {
        const user = userEvent.setup();
        useCharacterStore.setState({
            characters: [
                {
                    id: "inspired-roller",
                    schemaVersion: 1,
                    type: "player",
                    system: "dnd",
                    language: "en",
                    name: "Inspired",
                    baseStats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10,
                        armorClass: 10,
                        hitPoints: 8,
                    },
                    modifiers: [],
                    grants: [],
                    selections: { inventory: emptyInventory(), choices: {} },
                    resources: { hp: 8 },
                    systemData: {},
                    session: { metaPoints: { inspiration: 1 } },
                },
            ],
        });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <RollAssistantProvider characterId="inspired-roller">
                    <ContextRollTrigger
                        request={{
                            kind: "d20_test",
                            id: "skill:athletics",
                            label: "Athletics",
                            die: 20,
                            modifier: 5,
                            appliesTo: "ability_check",
                        }}
                    />
                    <PlayerSheetActionBar />
                </RollAssistantProvider>
            </NextIntlClientProvider>
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));
        await user.click(screen.getByRole("button", { name: "Inspiration" }));
        await user.click(screen.getByRole("button", { name: "14" }));
        await user.click(screen.getByRole("button", { name: "3" }));

        expect(toastMock).toHaveBeenCalledWith("Athletics: 19");
        expect(
            useCharacterStore.getState().characters[0]?.session?.metaPoints
                ?.inspiration
        ).toBeUndefined();
    });
});
