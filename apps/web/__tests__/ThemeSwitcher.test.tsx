/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import ThemeSwitcher from "../components/layout/ThemeSwitcher";
import enMessages from "../messages/en.json";

const setTheme = jest.fn();

jest.mock("next-themes", () => ({
    useTheme: () => ({
        resolvedTheme: "light",
        setTheme,
    }),
}));

describe("ThemeSwitcher", () => {
    beforeEach(() => {
        setTheme.mockClear();
    });

    it("toggles to dark theme when clicked in light mode", async () => {
        const user = userEvent.setup();

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <ThemeSwitcher />
            </NextIntlClientProvider>
        );

        const button = await waitFor(() =>
            screen.getByRole("button", {
                name: "Switch to dark theme",
            })
        );

        expect(button).not.toBeDisabled();
        await user.click(button);
        expect(setTheme).toHaveBeenCalledWith("dark");
    });

    it("uses the same aria-label before mount as SSR default", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <ThemeSwitcher />
            </NextIntlClientProvider>
        );

        expect(
            screen.getByRole("button", { name: "Switch to dark theme" })
        ).toBeInTheDocument();
    });
});
