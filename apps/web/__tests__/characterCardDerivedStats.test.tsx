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
    id: "char-derived-1",
    type: "player",
    system: "dnd",
    language: "en",
    name: "Rogue Hero",
    baseStats: {
        strength: 10,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 12,
        charisma: 10,
        armorClass: 12,
        hitPoints: 10,
    },
    modifiers: [],
    grants: [
        {
            id: "class-perception",
            kind: "proficiency",
            ref: "perception",
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

describe("CharacterCardGameInfo derived stats", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("shows proficiency bonus, initiative, and passive perception", () => {
        renderWithProviders(
            <CharacterCardGameInfo characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Proficiency Bonus")).toBeInTheDocument();
        expect(screen.getByText("Initiative")).toBeInTheDocument();
        expect(screen.getByText("Passive Perception")).toBeInTheDocument();

        const profBonusCell = screen.getByText("Proficiency Bonus").closest("div");
        expect(profBonusCell).toHaveTextContent("+2");

        const initiativeCell = screen.getByText("Initiative").closest("div");
        expect(initiativeCell).toHaveTextContent("+2");

        const passivePerceptionCell = screen
            .getByText("Passive Perception")
            .closest("div");
        expect(passivePerceptionCell).toHaveTextContent("13");
    });
});
