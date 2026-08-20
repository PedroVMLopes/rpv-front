/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import enMessages from "../messages/en.json";

function renderBar() {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("PlayerSheetActionBar", () => {
    it("renders three enabled icon buttons", () => {
        renderBar();

        expect(
            screen.getByRole("toolbar", { name: "Session actions" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Quick note" })
        ).toBeEnabled();
    });

    it("opens a skills placeholder and swaps to dice without collapsing", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(
            screen.getByRole("button", { name: "Skills and abilities" })
        );
        expect(screen.getByText("Coming soon")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toHaveAttribute("aria-pressed", "true");

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Open dice roller" })
        ).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("button", { name: "Skills and abilities" })
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("closes the panel when the backdrop is clicked", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Quick note" }));
        expect(screen.getByText("Coming soon")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });

    it("opens die selection from the dice button", async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(screen.getByRole("button", { name: "Open dice roller" }));

        expect(
            screen.getByText("Select the die you want to roll")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "d20" })).toBeInTheDocument();
    });
});
