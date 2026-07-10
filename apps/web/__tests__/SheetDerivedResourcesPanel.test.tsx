/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { SheetDerivedResourcesPanel } from "../components/characters/PlayerSheet/overview/SheetDerivedResourcesPanel";
import { SkillsListModeSwitch } from "../components/characters/PlayerSheet/overview/SkillsListModeSwitch";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { useCharacterStore } from "../store/useCharacterStore";
import enMessages from "../messages/en.json";

function renderWithProviders(ui: ReactElement) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

const wizardStored: StoredCharacter = {
    id: "wizard-resources-panel",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Wizard",
    baseStats: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 16,
        wisdom: 10,
        charisma: 10,
        armorClass: 12,
        hitPoints: 8,
    },
    modifiers: [],
    grants: [],
    selections: {
        characterClass: "wizard",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: {
        hp: 8,
        "spell-slots-1": 4,
        "spell-slots-2": 3,
    },
    systemData: {
        characterClass: "wizard",
        level: 3,
    },
};

const barbarianStored: StoredCharacter = {
    id: "barbarian-resources-panel",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Barbarian",
    baseStats: {
        strength: 16,
        dexterity: 14,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 8,
        armorClass: 14,
        hitPoints: 14,
    },
    modifiers: [],
    grants: [],
    selections: {
        characterClass: "barbarian",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: {
        hp: 14,
        "rage-uses": 3,
    },
    systemData: {
        characterClass: "barbarian",
        level: 3,
    },
};

const fighterStored: StoredCharacter = {
    id: "fighter-resources-panel",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Fighter",
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
        level: 1,
    },
};

describe("SheetDerivedResourcesPanel", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [wizardStored] });
    });

    it("renders casting header and spell slot squares for a wizard", () => {
        renderWithProviders(<SheetDerivedResourcesPanel stored={wizardStored} />);

        expect(screen.getByText("Casting class")).toBeInTheDocument();
        expect(screen.getByText("Wizard")).toBeInTheDocument();
        expect(screen.getByText("Casting ability")).toBeInTheDocument();
        expect(screen.getByText("Intelligence")).toBeInTheDocument();
        expect(screen.getByText("Spell save DC")).toBeInTheDocument();
        expect(screen.getByText("13")).toBeInTheDocument();
        expect(screen.getByText("Spell attack")).toBeInTheDocument();
        expect(screen.getByText("+5")).toBeInTheDocument();
        expect(screen.getByText("Level 1:")).toBeInTheDocument();
        expect(screen.getByText("Level 2:")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(7);
    });

    it("renders class resources without spellcasting header for barbarian", () => {
        useCharacterStore.setState({ characters: [barbarianStored] });

        renderWithProviders(
            <SheetDerivedResourcesPanel stored={barbarianStored} />
        );

        expect(screen.queryByText("Casting class")).not.toBeInTheDocument();
        expect(screen.getByText("Rage Uses:")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
    });

    it("returns null when there are no spell slots or derived resources", () => {
        useCharacterStore.setState({ characters: [fighterStored] });

        const { container } = renderWithProviders(
            <SheetDerivedResourcesPanel stored={fighterStored} />
        );

        expect(container).toBeEmptyDOMElement();
    });
});

describe("SkillsListModeSwitch", () => {
    it("switches between proficient and all modes", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        renderWithProviders(
            <SkillsListModeSwitch value="proficient" onChange={onChange} />
        );

        expect(
            screen.getByRole("radiogroup", { name: "Skills list display" })
        ).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Proficient" })).toHaveAttribute(
            "aria-checked",
            "true"
        );

        await user.click(screen.getByRole("radio", { name: "All" }));

        expect(onChange).toHaveBeenCalledWith("all");
    });
});
