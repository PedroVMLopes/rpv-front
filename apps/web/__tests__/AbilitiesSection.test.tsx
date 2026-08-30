/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { AbilitiesSection } from "../components/characters/PlayerSheet/overview/AbilitiesSection";
import { PortraitSection } from "../components/characters/PlayerSheet/overview/PortraitSection";
import { PlayerSheetActionBar } from "../components/characters/PlayerSheet/PlayerSheetActionBar";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
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
            <RollAssistantProvider>
                <AbilitiesSection stored={stored} />
                <PlayerSheetActionBar />
            </RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

describe("PortraitSection", () => {
    it("shows a level-up link when below level 20", () => {
        const stored = baseStored({
            systemData: { characterClass: "fighter", level: 5 },
        });
        useCharacterStore.setState({ characters: [stored] });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <PortraitSection stored={stored} />
            </NextIntlClientProvider>
        );

        const link = screen.getByRole("link", { name: "Level up" });
        expect(link).toHaveAttribute(
            "href",
            `/characters/player/edit/${stored.id}?mode=level-up&from=5`
        );
    });

    it("hides the level-up link at level 20", () => {
        const stored = baseStored({
            id: "abilities-section-maxed",
            systemData: { characterClass: "fighter", level: 20 },
        });
        useCharacterStore.setState({ characters: [stored] });

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <PortraitSection stored={stored} />
            </NextIntlClientProvider>
        );

        expect(
            screen.queryByRole("link", { name: "Level up" })
        ).not.toBeInTheDocument();
    });
});

describe("AbilitiesSection", () => {
    it("shows proficiency bonus and exploration passives", () => {
        renderSection(baseStored());

        expect(screen.getByText("Proficiency Bonus")).toBeInTheDocument();
        expect(screen.getByText("Passive Perception")).toBeInTheDocument();
        expect(screen.getByText("Passive Insight")).toBeInTheDocument();
        expect(screen.getByText("Passive Investigation")).toBeInTheDocument();
    });

    it("opens an ability check from the ability card", async () => {
        const user = userEvent.setup();
        renderSection(baseStored());

        await user.click(screen.getByRole("button", { name: "Roll Strength" }));

        expect(screen.getByText("Strength — d20 +3")).toBeInTheDocument();
    });

    it("exposes the ability score and modifier on the stone", () => {
        renderSection(baseStored());

        expect(screen.getByLabelText("Strength 16 +3")).toBeInTheDocument();
    });

    it("shows inspiration at zero and marks it on toggle", async () => {
        const user = userEvent.setup();
        const stored = baseStored();
        renderSection(stored);

        expect(screen.getByText("Inspiration: 0")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Mark that you have Inspiration" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.session?.metaPoints
                ?.inspiration
        ).toBe(1);
    });

    it("clears inspiration when the toggle is clicked while active", async () => {
        const user = userEvent.setup();
        const stored = baseStored({
            session: { metaPoints: { inspiration: 1 } },
        });
        renderSection(stored);

        await user.click(
            screen.getByRole("button", { name: "You do not have Inspiration" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.session?.metaPoints
                ?.inspiration
        ).toBeUndefined();
    });
});
