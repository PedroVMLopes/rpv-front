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
            bag: [{ slug: "longsword", quantity: 1 }],
            equipped: { "main-hand": "longsword" },
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
            {ui}
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

    it("shows defense saves, passives, and empty conditions", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Defense & Saves")).toBeInTheDocument();
        expect(screen.getByText("Strength")).toBeInTheDocument();
        expect(screen.getByText("Prof")).toBeInTheDocument();
        expect(screen.getByText("Passive Perception")).toBeInTheDocument();
        expect(screen.getByText("Passive Insight")).toBeInTheDocument();
        expect(
            screen.getByText("Conditions & Immunities")
        ).toBeInTheDocument();
        expect(screen.getByText("None yet")).toBeInTheDocument();
    });

    it("lists equipped weapons, spells, and features with roll/use stubs", () => {
        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Attacks & Actions")).toBeInTheDocument();
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Second Wind")).toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: /Roll:/i }).length
        ).toBeGreaterThanOrEqual(2);
        expect(
            screen.getByRole("button", { name: /Use: Second Wind/i })
        ).toBeInTheDocument();
    });

    it("decrements class resources without going below zero", async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <CombatTabConnected characterId={storedCharacter.id} />
        );

        expect(screen.getByText("2 / 2")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Level 1 −/i }));
        expect(
            useCharacterStore.getState().characters[0]?.resources[
                "spell-slots-1"
            ]
        ).toBe(1);

        await user.click(screen.getByRole("button", { name: /Level 1 −/i }));
        expect(
            useCharacterStore.getState().characters[0]?.resources[
                "spell-slots-1"
            ]
        ).toBe(0);

        expect(
            screen.getByRole("button", { name: /Level 1 −/i })
        ).toBeDisabled();
    });
});

describe("PlayerSheet combat tab", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("opens combat content instead of coming soon", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Combat" }));
        expect(screen.getByText("Attacks & Actions")).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });
});
