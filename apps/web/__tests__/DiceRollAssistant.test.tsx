/**
 * @jest-environment jsdom
 */
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import {
    RollAssistantProvider,
    useRollAssistant,
} from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import type {
    AttackThenDamageRequest,
    D20TestRequest,
    DamageOnlyRequest,
} from "../lib/roll/rollRequest.types";
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
    request: D20TestRequest | AttackThenDamageRequest | DamageOnlyRequest;
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
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "true");
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
        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.queryByText("Select the die you want to roll")
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("closes the panel when Escape is pressed on step 2", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d4" }));
        await user.keyboard("{Escape}");

        expect(
            screen.queryByText("Select the result (d4)")
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("shows a toast and closes when a result is selected", async () => {
        const user = userEvent.setup();
        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d20" }));
        await user.click(screen.getByRole("button", { name: "14" }));

        expect(toastMock).toHaveBeenCalledWith("d20: 14");
        expect(
            screen.queryByText("Select the result (d20)")
        ).not.toBeInTheDocument();
    });

    it("shows a toast when random roll is used", async () => {
        const user = userEvent.setup();
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

        renderAssistant();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));
        await user.click(screen.getByRole("button", { name: "d8" }));
        await user.click(screen.getByRole("button", { name: "Random roll" }));

        expect(toastMock).toHaveBeenCalledWith("d8: 5");
        expect(
            screen.queryByText("Select the result (d8)")
        ).not.toBeInTheDocument();

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
                }}
            />
        );

        await user.click(screen.getByRole("button", { name: "Open contextual roll" }));

        expect(screen.getByText("Athletics — d20 +5")).toBeInTheDocument();
        expect(
            screen.queryByText("Select the die you want to roll")
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "true");
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
});
