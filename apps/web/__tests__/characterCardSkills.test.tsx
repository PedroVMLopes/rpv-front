/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CharacterCardGameInfo from "../components/characters/CharacterCard/CharacterCardGameInfo";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/characterCarousel", () => ({
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-item">{children}</div>
    ),
}));

const storedCharacter: StoredCharacter = {
    id: "char-skills-1",
    type: "player",
    system: "dnd",
    language: "en",
    name: "Rogue Hero",
    baseStats: {
        strength: 10,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 10,
    },
    modifiers: [],
    grants: [
        {
            id: "class-stealth",
            kind: "proficiency",
            ref: "stealth",
            source: { type: "class", id: "rogue" },
        },
    ],
    selections: {
        race: "human",
        choices: {},
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "rogue",
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

describe("CharacterCardGameInfo skills", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("shows proficient skill modifier with marker", () => {
        renderWithProviders(
            <CharacterCardGameInfo characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Skills")).toBeInTheDocument();
        expect(screen.getByText("Stealth")).toBeInTheDocument();
        expect(screen.getByText("+4")).toBeInTheDocument();
        expect(screen.getByLabelText("Proficient")).toBeInTheDocument();
    });

    it("shows non-proficient skill modifier without marker", () => {
        renderWithProviders(
            <CharacterCardGameInfo characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Arcana")).toBeInTheDocument();

        const arcanaRow = screen.getByText("Arcana").closest("li");
        expect(arcanaRow).toHaveTextContent("+0");
        expect(arcanaRow?.querySelector('[aria-label="Proficient"]')).toBeNull();
    });
});
