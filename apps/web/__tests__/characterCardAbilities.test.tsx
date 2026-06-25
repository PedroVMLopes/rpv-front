/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CharacterCardAbilities from "../components/characters/CharacterCard/CharacterCardAbilities";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/characterCarousel", () => ({
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-item">{children}</div>
    ),
}));

const storedCharacter: StoredCharacter = {
    id: "char-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Hero",
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
    grants: [
        {
            id: "class-ability-1",
            kind: "ability",
            ref: "fighting-style",
            source: { type: "class", id: "fighter" },
        },
    ],
    selections: {
        characterClass: "fighter",
        inventory: emptyInventory(),
        choices: {},
    },
    resources: { hp: 10 },
    systemData: {},
};

function renderWithProviders(ui: ReactElement, contentLocale: "en" | "pt-BR" = "en") {
    useContentLocale.setState({ contentLocale });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("CharacterCardAbilities locale", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [storedCharacter] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("shows localized class name for pt-BR content locale", () => {
        renderWithProviders(
            <CharacterCardAbilities characterId="char-1" />,
            "pt-BR"
        );

        expect(screen.getByText("Guerreiro")).toBeInTheDocument();
        expect(screen.queryByText("Fighter")).not.toBeInTheDocument();
    });
});
