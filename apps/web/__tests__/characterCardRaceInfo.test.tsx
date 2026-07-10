/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
    ClassSubclassBlock,
    RaceTraitsBlock,
    UnresolvedChoicesBlock,
} from "../components/characters/CharacterCard/CharacterCardRaceInfo";
import { useContentLocale } from "../store/useContentLocale";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

const storedCharacter: StoredCharacter = {
    id: "char-1",
    schemaVersion: 1,
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
    grants: [],
    selections: {
        race: "elf",
        subrace: "high-elf",
        characterClass: "wizard",
        subclass: "wizard-evocation",
        inventory: emptyInventory(),
        choices: {},
    },
    resources: { hp: 8 },
    systemData: {},
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
    it("shows localized race, class, and subclass names from selections", () => {
        renderWithProviders(<ClassSubclassBlock stored={storedCharacter} />);

        expect(screen.getByText("Elf · High Elf Wizard")).toBeInTheDocument();
        expect(screen.getByText("Evocation")).toBeInTheDocument();
    });

    it("shows localized subclass name for pt-BR content locale", () => {
        useContentLocale.setState({ contentLocale: "pt-BR" });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <ClassSubclassBlock stored={storedCharacter} />
            </NextIntlClientProvider>
        );

        expect(screen.getByText("Evocação")).toBeInTheDocument();
    });

    it("lists racial traits", () => {
        renderWithProviders(<RaceTraitsBlock stored={storedCharacter} />);

        expect(screen.getByText("Traits")).toBeInTheDocument();
        expect(screen.getByText("Fey Ancestry")).toBeInTheDocument();
    });

    it("lists pending decisions for incomplete characters", () => {
        renderWithProviders(
            <UnresolvedChoicesBlock
                stored={{
                    ...storedCharacter,
                    name: "",
                    selections: {
                        ...storedCharacter.selections,
                        race: undefined,
                        characterClass: undefined,
                        subclass: undefined,
                        background: undefined,
                    },
                }}
            />
        );

        expect(screen.getByText(/Pending decisions/i)).toBeInTheDocument();
        expect(screen.getByText("Select a race")).toBeInTheDocument();
    });
});
