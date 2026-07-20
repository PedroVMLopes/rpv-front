/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AbilitiesSection } from "../components/characters/PlayerSheet/overview/AbilitiesSection";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

function baseStored(overrides: Partial<StoredCharacter> = {}): StoredCharacter {
    return {
        id: "abilities-section-hero",
        schemaVersion: 1,
        type: "player",
        system: "dnd",
        language: "en",
        name: "Hero",
        baseStats: {
            strength: 16,
            dexterity: 14,
            constitution: 12,
            intelligence: 10,
            wisdom: 10,
            charisma: 8,
            armorClass: 16,
            hitPoints: 12,
        },
        modifiers: [],
        grants: [],
        selections: {
            characterClass: "fighter",
            choices: {},
            inventory: { bag: [], equipped: {} },
        },
        resources: { hp: 12 },
        systemData: {
            characterClass: "fighter",
            level: 5,
        },
        ...overrides,
    };
}

function renderSection(stored: StoredCharacter) {
    useCharacterStore.setState({ characters: [stored] });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <AbilitiesSection stored={stored} />
        </NextIntlClientProvider>
    );
}

describe("AbilitiesSection", () => {
    it("shows a full-width level-up link to the class edit step when below level 20", () => {
        const stored = baseStored({ systemData: { characterClass: "fighter", level: 5 } });
        renderSection(stored);

        const link = screen.getByRole("link", { name: "Level up" });
        expect(link).toHaveAttribute(
            "href",
            `/characters/player/edit/${stored.id}?step=class`
        );
    });

    it("hides the level-up link at level 20", () => {
        renderSection(
            baseStored({
                id: "abilities-section-maxed",
                systemData: { characterClass: "fighter", level: 20 },
            })
        );

        expect(
            screen.queryByRole("link", { name: "Level up" })
        ).not.toBeInTheDocument();
    });
});
