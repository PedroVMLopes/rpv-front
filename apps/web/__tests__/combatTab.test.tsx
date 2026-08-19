/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import { CombatTab } from "../components/characters/PlayerSheet/tabs/CombatTab";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/HealthSlider", () => ({
    HealthSlider: () => <div data-testid="health-slider" />,
}));

const storedCharacter: StoredCharacter = {
    id: "char-combat-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Combat Hero",
    baseStats: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
        armorClass: 16,
        hitPoints: 20,
    },
    modifiers: [],
    grants: [
        {
            id: "class-fighter-saving_throw-strength",
            kind: "saving_throw",
            ref: "strength",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-skill_proficiency-perception-0",
            kind: "proficiency",
            ref: "perception",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-skill_proficiency-insight-0",
            kind: "proficiency",
            ref: "insight",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-resource-spell-slots-1",
            kind: "resource",
            ref: "spell-slots-1",
            amount: 2,
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-ability-second-wind",
            kind: "ability",
            ref: "Second Wind",
            name: "Second Wind",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            name: "Fire Bolt",
            source: { type: "class", id: "wizard" },
        },
    ],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
        },
    },
    resources: { hp: 18, "spell-slots-1": 2 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

function CombatTabConnected({ characterId }: { characterId: string }) {
    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === characterId)
    );
    if (!stored) {
        return null;
    }
    return <CombatTab stored={stored} />;
}

function renderWithProviders(ui: ReactElement) {
    useCharacterStore.setState({
        characters: [
            {
                ...storedCharacter,
                resources: { ...storedCharacter.resources },
            },
        ],
    });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <RollAssistantProvider>{ui}</RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("CombatTab", () => {
    beforeEach(() => {
        useCharacterStore.setState({
            characters: [
                {
                    ...storedCharacter,
                    resources: { hp: 18, "spell-slots-1": 2 },
                },
            ],
        });
    });

    it("shows defense saves and empty conditions without exploration passives", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Class Resources")).toBeInTheDocument();
        expect(screen.getByText("Defense & Saves")).toBeInTheDocument();
        expect(screen.getByText("Strength")).toBeInTheDocument();
        expect(screen.getByText("Prof")).toBeInTheDocument();
        expect(screen.queryByText("Passive Perception")).not.toBeInTheDocument();
        expect(screen.queryByText("Passive Insight")).not.toBeInTheDocument();
        expect(
            screen.getByText("Conditions & Immunities")
        ).toBeInTheDocument();
        expect(screen.getByText("None yet")).toBeInTheDocument();

        const resourcesHeading = screen.getByText("Class Resources");
        const defenseHeading = screen.getByText("Defense & Saves");
        expect(
            Boolean(
                resourcesHeading.compareDocumentPosition(defenseHeading) &
                    Node.DOCUMENT_POSITION_FOLLOWING
            )
        ).toBe(true);
    });

    it("lists equipped weapons, spells, and features with roll/use actions", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Second Wind")).toBeInTheDocument();
        expect(
            screen.getByText(/regain hit points equal to 1d10/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Roll Longsword" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Use: Second Wind/i })
        ).toBeInTheDocument();
    });

    it("shows class resources above defense saves", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Class Resources")).toBeInTheDocument();
        expect(screen.getByText("Level 1")).toBeInTheDocument();
        expect(screen.getByText("2 / 2")).toBeInTheDocument();
        expect(screen.queryByText("Spellcasting")).not.toBeInTheDocument();
    });
});

describe("PlayerSheet combat tab", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("opens combat content instead of coming soon", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Actions" }));
        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });
});
