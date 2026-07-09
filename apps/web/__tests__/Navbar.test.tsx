/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Navbar from "../components/layout/Navbar";
import enMessages from "../messages/en.json";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
    usePathname: () => mockUsePathname(),
}));

function renderNavbar(pathname = "/") {
    mockUsePathname.mockReturnValue(pathname);

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <Navbar />
        </NextIntlClientProvider>
    );
}

describe("Navbar", () => {
    beforeEach(() => {
        mockUsePathname.mockReset();
    });

    it("renders main navigation links", () => {
        renderNavbar("/");

        expect(screen.getByRole("link", { name: "RPV" })).toHaveAttribute(
            "href",
            "/"
        );
        expect(screen.getByRole("link", { name: "Characters" })).toHaveAttribute(
            "href",
            "/characters"
        );
        expect(screen.getByRole("link", { name: "Encounters" })).toHaveAttribute(
            "href",
            "/encounters"
        );
    });

    it("links gear and user icons to /user", () => {
        renderNavbar("/");

        const userLinks = screen.getAllByRole("link", { name: /settings|user/i });
        expect(userLinks).toHaveLength(2);
        userLinks.forEach((link) => {
            expect(link).toHaveAttribute("href", "/user");
        });
    });

    it("highlights Characters on nested character routes", () => {
        renderNavbar("/characters/player");

        const charactersLink = screen.getByRole("link", { name: "Characters" });
        expect(charactersLink).toHaveClass("text-primary");
        expect(screen.getByRole("link", { name: "Encounters" })).not.toHaveClass(
            "text-primary"
        );
    });

    it("does not render theme or language switchers", () => {
        renderNavbar("/");

        expect(
            screen.queryByRole("button", { name: enMessages.common.themeLight })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText(enMessages.common.uiLanguage)
        ).not.toBeInTheDocument();
    });
});
