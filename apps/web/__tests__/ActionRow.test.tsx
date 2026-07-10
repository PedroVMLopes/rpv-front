/**
 * @jest-environment jsdom
 */
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { ActionRow } from "../components/characters/PlayerSheet/ActionRow";
import enMessages from "../messages/en.json";

function renderRow(props: Partial<ComponentProps<typeof ActionRow>> = {}) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <ActionRow
                label="Athletics"
                modifier={5}
                proficient
                abilityHint="[STR]"
                onRoll={props.onRoll ?? jest.fn()}
                {...props}
            />
        </NextIntlClientProvider>
    );
}

describe("ActionRow", () => {
    it("renders as an informative row, not a full-row button", () => {
        renderRow();

        expect(screen.queryByRole("button", { name: /Athletics \+5/i })).not.toBeInTheDocument();
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.getByText("+5")).toBeInTheDocument();
    });

    it("calls onRoll when the dice button is clicked", async () => {
        const user = userEvent.setup();
        const onRoll = jest.fn();
        renderRow({ onRoll });

        await user.click(screen.getByRole("button", { name: "Roll Athletics" }));

        expect(onRoll).toHaveBeenCalledTimes(1);
    });
});
