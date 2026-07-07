/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
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

    it("toggles to dark theme when clicked in light mode", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <ThemeSwitcher />
            </NextIntlClientProvider>
        );

        const button = screen.getByRole("button", {
            name: "Switch to dark theme",
        });

        fireEvent.click(button);
        expect(setTheme).toHaveBeenCalledWith("dark");
    });
});
