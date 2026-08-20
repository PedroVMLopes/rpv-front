/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { DiceRollAssistant } from "../components/characters/PlayerSheet/roll/DiceRollAssistant";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import enMessages from "../messages/en.json";

function renderBar() {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <PlayerSheetActionBar />
                <DiceRollAssistant />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("PlayerSheetActionBar", () => {
    it("renders three icon buttons with skills and notes disabled", () => {
        renderBar();

        expect(
            screen.getByRole("toolbar", { name: "Session actions" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Quick note" })
        ).toBeDisabled();
    });

    it("opens the die selection dialog from the dice button", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20" })).toBeInTheDocument();
    });
});
