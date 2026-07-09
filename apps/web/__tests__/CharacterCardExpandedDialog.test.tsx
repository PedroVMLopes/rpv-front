/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import CharacterCard from "../components/characters/CharacterCard/CharacterCard";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/characterCarousel", () => ({
    Carousel: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel">{children}</div>
    ),
    CarouselContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-content">{children}</div>
    ),
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-item" className="h-full">
            {children}
        </div>
    ),
    CarouselPrevious: () => (
        <button type="button" data-testid="carousel-previous">
            Previous
        </button>
    ),
    CarouselNext: () => (
        <button type="button" data-testid="carousel-next">
            Next
        </button>
    ),
}));

const storedCharacter: StoredCharacter = {
    id: "char-expanded-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Expanded Hero",
    baseStats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 14,
    },
    modifiers: [],
    grants: [],
    selections: {
        race: "human",
        choices: {},
        characterClass: "fighter",
        inventory: {
            bag: [],
            equipped: {},
        },
    },
    resources: { hp: 14 },
    systemData: {
        characterClass: "fighter",
        level: 3,
        background: "Soldier",
        avatar: "https://example.com/hero.png",
    },
};

function renderWithProviders(ui: ReactElement) {
    useCharacterStore.setState({ characters: [storedCharacter] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("CharacterCardExpandedDialog", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("opens responsive dialog shell when expand is clicked", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CharacterCard characterId={storedCharacter.id} />
        );

        const expandButton = screen.getByRole("button", {
            name: "Expand character",
        });

        await user.click(expandButton);

        const dialog = screen.getByTestId("character-expanded-dialog");
        expect(dialog).toBeInTheDocument();
        expect(dialog.className).toContain("h-[90dvh]");
        expect(dialog.className).toContain("max-h-[90dvh]");
        expect(dialog.className).toContain("sm:max-w-lg");
        expect(dialog.className).toContain("md:max-w-2xl");
        expect(dialog.className).toContain("lg:max-w-3xl");
        expect(dialog.className).not.toContain("h-80");
    });

    it("uses per-slide scroll instead of fixed carousel height", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CharacterCard characterId={storedCharacter.id} />
        );

        const expandButton = screen.getByRole("button", {
            name: "Expand character",
        });

        await user.click(expandButton);

        const dialog = screen.getByTestId("character-expanded-dialog");
        expect(
            within(dialog).getByTestId("character-expanded-dialog-body")
        ).toBeInTheDocument();
        expect(
            within(dialog).getAllByTestId("character-card-slide-scroll").length
        ).toBeGreaterThan(0);
        expect(dialog.className).not.toContain("h-80");
    });

    it("renders carousel controls in a horizontal chrome row", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CharacterCard characterId={storedCharacter.id} />
        );

        const expandButton = screen.getByRole("button", {
            name: "Expand character",
        });

        await user.click(expandButton);

        const dialog = screen.getByTestId("character-expanded-dialog");
        expect(
            within(dialog).getByTestId("carousel-previous")
        ).toBeInTheDocument();
        expect(within(dialog).getByTestId("carousel-next")).toBeInTheDocument();
        expect(within(dialog).getByText("Character Info")).toBeInTheDocument();
    });

    it("links to the full player sheet from the info slide", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CharacterCard characterId={storedCharacter.id} />
        );

        const expandButton = screen.getByRole("button", {
            name: "Expand character",
        });

        await user.click(expandButton);

        const link = screen.getByRole("link", { name: "Open full sheet" });
        expect(link).toHaveAttribute(
            "href",
            `/characters/player/${storedCharacter.id}`
        );
    });
});
