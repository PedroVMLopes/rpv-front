/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ClassSubclassBlock, RaceTraitsBlock } from "../components/characters/CharacterCard/CharacterCardRaceInfo";
import { useContentLocale } from "../store/useContentLocale";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

const storedCharacter: StoredCharacter = {
    id: "char-1",
    type: "player",
    system: "dnd",
    language: "en",
    name: "Elara",
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
    selections: {
        race: "elf",
        subrace: "high-elf",
        choices: {},
    },
    resources: { hp: 8 },
    systemData: {
        race: "elf",
        subrace: "high-elf",
        characterClass: "Wizard",
    },
};

function renderWithProviders(ui: ReactElement) {
    useContentLocale.setState({ contentLocale: "en" });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("CharacterCard race info", () => {
    it("shows localized race and subrace names from slugs", () => {
        renderWithProviders(
            <ClassSubclassBlock
                stored={storedCharacter}
                characterClass="Wizard"
            />
        );

        expect(screen.getByText("Elf · High Elf Wizard")).toBeInTheDocument();
    });

    it("lists racial traits and unresolved choices", () => {
        renderWithProviders(<RaceTraitsBlock stored={storedCharacter} />);

        expect(screen.getByText("Racial Traits")).toBeInTheDocument();
        expect(screen.getByText("Fey Ancestry")).toBeInTheDocument();
        expect(screen.getByText("Choices to resolve")).toBeInTheDocument();
        expect(
            screen.getAllByText(/One cantrip of your choice from the wizard spell list/i)
                .length
        ).toBeGreaterThan(0);
    });
});
