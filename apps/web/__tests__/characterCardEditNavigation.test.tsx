/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
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
    CarouselPrevious: () => null,
    CarouselNext: () => null,
}));

const storedCharacter: StoredCharacter = {
    id: "char-edit-nav-1",
    type: "player",
    system: "dnd",
    language: "en",
    name: "Edit Nav Hero",
    baseStats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 10,
        hitPoints: 10,
    },
    modifiers: [],
    grants: [],
    selections: {
        race: "human",
        choices: {},
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
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

describe("CharacterCard edit navigation", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("links gear button to character edit page", () => {
        renderWithProviders(
            <CharacterCard characterId={storedCharacter.id} />
        );

        const editLink = screen.getByRole("link", { name: "Edit character" });
        expect(editLink).toHaveAttribute(
            "href",
            `/characters/player/edit/${storedCharacter.id}`
        );
    });
});
