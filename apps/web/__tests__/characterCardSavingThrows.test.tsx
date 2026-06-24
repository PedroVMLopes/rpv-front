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
    id: "char-saves-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Fighter Hero",
    baseStats: {
        strength: 16,
        dexterity: 10,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 12,
    },
    modifiers: [],
    grants: [
        {
            id: "class-strength",
            kind: "saving_throw",
            ref: "strength",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-constitution",
            kind: "saving_throw",
            ref: "constitution",
            source: { type: "class", id: "fighter" },
        },
    ],
    selections: {
        race: "human",
        choices: {},
    },
    resources: { hp: 12 },
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

describe("CharacterCardGameInfo saving throws", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("shows proficient saving throw modifier with marker", () => {
        renderWithProviders(
            <CharacterCardGameInfo characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Saving Throws")).toBeInTheDocument();
        expect(screen.getByText("Strength")).toBeInTheDocument();
        expect(screen.getByText("+5")).toBeInTheDocument();
        expect(screen.getAllByLabelText("Proficient").length).toBeGreaterThan(0);
    });

    it("shows non-proficient saving throw modifier without marker", () => {
        renderWithProviders(
            <CharacterCardGameInfo characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Dexterity")).toBeInTheDocument();

        const dexterityRow = screen.getByText("Dexterity").closest("li");
        expect(dexterityRow).toHaveTextContent("+0");
        expect(dexterityRow?.querySelector('[aria-label="Proficient"]')).toBeNull();
    });
});
