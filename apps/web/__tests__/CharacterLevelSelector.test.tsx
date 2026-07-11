/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CharacterLevelSelector } from "../components/characters/CharacterLevelSelector";
import enMessages from "../messages/en.json";

function LevelSelectorHarness({
    defaultValues = {},
}: {
    defaultValues?: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <CharacterLevelSelector form={form} />
            <output data-testid="level-output">{String(form.watch("level"))}</output>
        </NextIntlClientProvider>
    );
}

describe("CharacterLevelSelector", () => {
    it("sets level to 1 when Lv 1 is selected", async () => {
        const user = userEvent.setup();

        render(<LevelSelectorHarness defaultValues={{ level: 5 }} />);

        await user.click(screen.getByRole("button", { name: "Lv 3" }));
        expect(screen.getByTestId("level-output")).toHaveTextContent("3");

        await user.click(screen.getByRole("button", { name: "Lv 1" }));
        expect(screen.getByTestId("level-output")).toHaveTextContent("1");
    });

    it("sets level to 2 when Lv 2 is selected", async () => {
        const user = userEvent.setup();

        render(<LevelSelectorHarness defaultValues={{ level: 1 }} />);

        await user.click(screen.getByRole("button", { name: "Lv 2" }));
        expect(screen.getByTestId("level-output")).toHaveTextContent("2");
    });

    it("shows numeric input for custom preset with default 5 from preset level", async () => {
        const user = userEvent.setup();

        render(<LevelSelectorHarness defaultValues={{ level: 1 }} />);

        expect(
            screen.queryByRole("spinbutton", { name: "Custom level" })
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Custom" }));

        const input = screen.getByRole("spinbutton", { name: "Custom level" });
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(5);
        expect(screen.getByTestId("level-output")).toHaveTextContent("5");
    });

    it("updates level from custom numeric input", async () => {
        render(<LevelSelectorHarness defaultValues={{ level: 5 }} />);

        const input = screen.getByRole("spinbutton", { name: "Custom level" });
        fireEvent.change(input, { target: { value: "7" } });

        expect(screen.getByTestId("level-output")).toHaveTextContent("7");
    });
});
