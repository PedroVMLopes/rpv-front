/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CharactersPage from "../app/characters/page";
import enMessages from "../messages/en.json";

function renderCharactersHub() {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <CharactersPage />
        </NextIntlClientProvider>
    );
}

describe("Characters hub page", () => {
    it("does not render a page-level Characters heading", () => {
        renderCharactersHub();

        expect(
            screen.queryByRole("heading", { name: "Characters", level: 1 })
        ).not.toBeInTheDocument();
    });

    it("renders section titles for players, enemies, and npcs", () => {
        renderCharactersHub();

        expect(
            screen.getByText(enMessages.characterHub.player.title)
        ).toBeInTheDocument();
        expect(
            screen.getByText(enMessages.characterHub.enemy.title)
        ).toBeInTheDocument();
        expect(
            screen.getByText(enMessages.characterHub.npc.title)
        ).toBeInTheDocument();
    });

    it("links list buttons to character type routes", () => {
        renderCharactersHub();

        expect(
            screen.getByRole("link", {
                name: enMessages.characterHub.player.yourList,
            })
        ).toHaveAttribute("href", "/characters/player");
        expect(
            screen.getByRole("link", {
                name: enMessages.characterHub.enemy.yourList,
            })
        ).toHaveAttribute("href", "/characters/enemy");
        expect(
            screen.getByRole("link", {
                name: enMessages.characterHub.npc.yourList,
            })
        ).toHaveAttribute("href", "/characters/npc");
    });

    it("links create buttons to character creation routes", () => {
        renderCharactersHub();

        const createLinks = [
            screen.getByRole("link", {
                name: `Create ${enMessages.characterHub.player.title}`,
            }),
            screen.getByRole("link", {
                name: `Create ${enMessages.characterHub.enemy.title}`,
            }),
            screen.getByRole("link", {
                name: `Create ${enMessages.characterHub.npc.title}`,
            }),
        ];

        expect(createLinks).toHaveLength(3);
        expect(createLinks[0]).toHaveAttribute(
            "href",
            "/characters/player/create"
        );
        expect(createLinks[1]).toHaveAttribute(
            "href",
            "/characters/enemy/create"
        );
        expect(createLinks[2]).toHaveAttribute("href", "/characters/npc/create");
    });

    it("renders disabled community globe buttons without links", () => {
        renderCharactersHub();

        const globeButtons = screen.getAllByRole("button", {
            name: enMessages.characterHub.exploreCommunity,
        });

        expect(globeButtons).toHaveLength(3);
        globeButtons.forEach((button) => {
            expect(button).toBeDisabled();
            expect(button.closest("a")).toBeNull();
        });
    });

    it("does not render forge community links", () => {
        renderCharactersHub();

        expect(screen.queryByRole("link", { name: /forge/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /explore/i })).not.toBeInTheDocument();
    });
});

describe("CharacterHubSection layout", () => {
    it("places enemies and npcs in a two-column grid below players", () => {
        const { container } = renderCharactersHub();

        const grid = container.querySelector(".md\\:grid-cols-2");
        expect(grid).toBeInTheDocument();
        expect(
            within(grid as HTMLElement).getByText(
                enMessages.characterHub.enemy.title
            )
        ).toBeInTheDocument();
        expect(
            within(grid as HTMLElement).getByText(
                enMessages.characterHub.npc.title
            )
        ).toBeInTheDocument();
    });
});
