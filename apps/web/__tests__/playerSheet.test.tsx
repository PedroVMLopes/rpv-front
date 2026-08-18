/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import CharacterCardInfoBlocks from "../components/characters/CharacterCard/CharacterCardInfoBlocks";
import PlayerSheetPage from "../app/characters/player/[id]/page";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/characterCarousel", () => ({
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-item">{children}</div>
    ),
}));

jest.mock("next/navigation", () => ({
    useParams: jest.fn(),
}));

import { useParams } from "next/navigation";

const storedCharacter: StoredCharacter = {
    id: "char-sheet-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Sheet Hero",
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
    grants: [
        {
            id: "class-fighter-skill_proficiency-athletics-0",
            kind: "proficiency",
            ref: "athletics",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-saving_throw-strength",
            kind: "saving_throw",
            ref: "strength",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-weapon_proficiency-martial-weapons-0",
            kind: "proficiency",
            ref: "martial-weapons",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "class-fighter-armor_proficiency-light-armor-0",
            kind: "proficiency",
            ref: "light-armor",
            source: { type: "class", id: "fighter" },
        },
        {
            id: "race-dwarf-tool_proficiency-smiths-tools-0",
            kind: "proficiency",
            ref: "smiths-tools",
            source: { type: "race", id: "dwarf" },
            name: "Smith's Tools",
        },
        {
            id: "race-elf-language-elvish",
            kind: "language",
            ref: "elvish",
            source: { type: "race", id: "elf" },
            name: "Elvish",
        },
    ],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [
                { slug: "srd_longsword", quantity: 1 },
                { slug: "srd_leather-armor", quantity: 1 },
            ],
            equipped: {
                "melee-main": "srd_longsword",
                armor: "srd_leather-armor",
            },
        },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
        background: "Soldier",
        age: "Adult",
        goals: "Protect the realm",
        personalityTraits: "I face danger head-on.",
        ideals: "Honor",
        bonds: "My squad",
        flaws: "I never back down.",
    },
};

const wizardCombatCharacter: StoredCharacter = {
    id: "char-wizard-combat",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Wizard Hero",
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
    grants: [
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            source: { type: "class", id: "wizard" },
            name: "Fire Bolt",
        },
        {
            id: "class-wizard-spell-burning-hands",
            kind: "spell",
            ref: "burning-hands",
            source: { type: "class", id: "wizard" },
            name: "Burning Hands",
        },
    ],
    selections: {
        race: "human",
        characterClass: "wizard",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 8 },
    systemData: {
        characterClass: "wizard",
        level: 1,
    },
};

function renderWithCharacters(
    ui: ReactElement,
    characters: StoredCharacter[]
) {
    useCharacterStore.setState({ characters });

    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

function renderWithProviders(ui: ReactElement) {
    return renderWithCharacters(ui, [storedCharacter]);
}

describe("PlayerSheet", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
        (useParams as jest.Mock).mockReturnValue({ id: storedCharacter.id });
    });

    it("renders header name, level line, and combat stat blocks", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(
            screen.getByRole("heading", { name: /Sheet Hero/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/Level 1 ·/i)).toBeInTheDocument();
        expect(screen.getAllByLabelText(/AC 13/i).length).toBeGreaterThan(0);
        expect(
            screen.getAllByLabelText(/Hit Points 10 \/ 12/i).length
        ).toBeGreaterThan(0);
        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
            "aria-selected",
            "true"
        );
    });

    it("shows only proficient skills and saves in the skills card", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Skills")).toBeInTheDocument();
        expect(
            screen.getByRole("radiogroup", { name: "Skills list display" })
        ).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Proficient" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.queryByText("Stealth")).not.toBeInTheDocument();
        expect(screen.queryByText("Arcana")).not.toBeInTheDocument();

        const strengthButtons = screen.getAllByRole("button", {
            name: /Strength/i,
        });
        expect(strengthButtons.length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByText("Dexterity")).not.toBeInTheDocument();
    });

    it("shows all skills and saving throws when the skills toggle is enabled", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("radio", { name: "All" }));

        expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        expect(screen.getByRole("radio", { name: "Proficient" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
        expect(screen.getByText("Stealth")).toBeInTheDocument();
        expect(screen.getByText("Arcana")).toBeInTheDocument();
        expect(screen.getByText("Dexterity")).toBeInTheDocument();

        const athleticsLabel = screen.getByText("Athletics");
        const acrobaticsLabel = screen.getByText("Acrobatics");
        expect(
            athleticsLabel.compareDocumentPosition(acrobaticsLabel) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it("shows ability filters only in all-skills mode and toggles them", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(
            screen.queryByRole("tablist", { name: "Filter skills by ability" })
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: "All" }));

        const filter = screen.getByRole("tablist", {
            name: "Filter skills by ability",
        });
        expect(filter).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "STR" })).toHaveAttribute(
            "aria-selected",
            "false"
        );

        await user.click(screen.getByRole("tab", { name: "DEX" }));
        expect(screen.getByRole("tab", { name: "DEX" })).toHaveAttribute(
            "aria-selected",
            "true"
        );
        expect(screen.getByText("Stealth")).toBeInTheDocument();
        expect(screen.getByText("Acrobatics")).toBeInTheDocument();
        expect(screen.queryByText("Athletics")).not.toBeInTheDocument();
        expect(screen.queryByText("Arcana")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "DEX" }));
        expect(screen.getByRole("tab", { name: "DEX" })).toHaveAttribute(
            "aria-selected",
            "false"
        );
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.getByText("Arcana")).toBeInTheDocument();
    });

    it("clears ability filter when returning to proficient-only mode", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("radio", { name: "All" }));
        await user.click(screen.getByRole("tab", { name: "DEX" }));
        expect(screen.queryByText("Athletics")).not.toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: "Proficient" }));

        expect(
            screen.queryByRole("tablist", { name: "Filter skills by ability" })
        ).not.toBeInTheDocument();
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.queryByText("Stealth")).not.toBeInTheDocument();
    });

    it("returns to proficient-only skills and saves when the toggle is disabled", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("radio", { name: "All" }));
        expect(screen.getByText("Stealth")).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: "Proficient" }));

        expect(screen.getByRole("radio", { name: "Proficient" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
        expect(screen.queryByText("Stealth")).not.toBeInTheDocument();
        expect(screen.queryByText("Arcana")).not.toBeInTheDocument();
        expect(screen.queryByText("Dexterity")).not.toBeInTheDocument();
    });

    it("shows tool and language proficiencies without weapons or armor", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Proficiencies")).toBeInTheDocument();
        expect(screen.getByText("Smith's Tools")).toBeInTheDocument();
        expect(screen.getByText("Elvish")).toBeInTheDocument();
        expect(screen.queryByText("Martial Weapons")).not.toBeInTheDocument();
        expect(screen.queryByText("Light Armor")).not.toBeInTheDocument();
    });

    it("shows identity, personality, and passive scores on overview", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Adult")).toBeInTheDocument();
        expect(screen.getByText("Soldier")).toBeInTheDocument();
        expect(screen.getByText("Protect the realm")).toBeInTheDocument();
        expect(screen.getByText("I face danger head-on.")).toBeInTheDocument();
        expect(screen.getByText("Honor")).toBeInTheDocument();
        expect(screen.getByText("My squad")).toBeInTheDocument();
        expect(screen.getByText("I never back down.")).toBeInTheDocument();
        expect(screen.getByText("Passive Perception")).toBeInTheDocument();
        expect(screen.getByText("Passive Insight")).toBeInTheDocument();
        expect(screen.getByText("Passive Investigation")).toBeInTheDocument();
    });

    it("resolves catalog background name and description from selections", () => {
        renderWithProviders(
            <PlayerSheet
                stored={{
                    ...storedCharacter,
                    id: "char-sheet-sage",
                    selections: {
                        ...storedCharacter.selections,
                        background: "sage",
                    },
                    systemData: {
                        ...storedCharacter.systemData,
                        background: "Soldier",
                    },
                }}
            />
        );

        expect(screen.getByText("Sage")).toBeInTheDocument();
        expect(
            screen.getByText(/lore of the multiverse/i)
        ).toBeInTheDocument();
        expect(screen.queryByText("Soldier")).not.toBeInTheDocument();
    });

    it("lists class features as reminders without a use action", () => {
        renderWithProviders(
            <PlayerSheet
                stored={{
                    ...storedCharacter,
                    id: "char-sheet-traits",
                    selections: {
                        ...storedCharacter.selections,
                        race: "elf",
                    },
                    grants: [
                        ...storedCharacter.grants,
                        {
                            id: "race-elf-base-ability-Fey Ancestry",
                            kind: "ability",
                            ref: "Fey Ancestry",
                            name: "Fey Ancestry",
                            source: { type: "race", id: "elf" },
                        },
                        {
                            id: "class-fighter-2-ability-Action Surge",
                            kind: "ability",
                            ref: "Action Surge",
                            name: "Action Surge",
                            source: { type: "class", id: "fighter" },
                        },
                    ],
                }}
            />
        );

        expect(screen.getByText("Features & Traits")).toBeInTheDocument();
        expect(screen.getByText("Fey Ancestry")).toBeInTheDocument();
        expect(screen.getByText("Action Surge")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /Use: Action Surge/i })
        ).not.toBeInTheDocument();
    });

    it("does not list combat actions on overview", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.queryByText(/Melee main/)).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Roll Longsword" })
        ).not.toBeInTheDocument();
    });

    it("opens longsword attack roll from combat tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Actions" }));
        await user.click(screen.getByRole("button", { name: "Roll Longsword" }));

        expect(
            screen.getByText("Longsword — attack d20 +5")
        ).toBeInTheDocument();
    });

    it("shows ability scores with modifiers", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        const strLabel = screen.getByText("STR");
        const strCard = strLabel.closest("div");
        expect(strCard).toHaveTextContent("16");
        expect(strCard).toHaveTextContent("+3");
    });

    it("shows combat and inventory content; magic and notes still coming soon", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Actions" }));
        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Inventory" }));
        expect(screen.getByText("Encumbrance")).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Magic" }));
        expect(screen.getByText("Coming soon")).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Notes" }));
        expect(screen.getByText("Coming soon")).toBeInTheDocument();
    });

    it("uses inverted tab surfaces and a background-colored tab panel", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        const overviewTab = screen.getByRole("tab", { name: "Overview" });
        const combatTab = screen.getByRole("tab", { name: "Actions" });

        expect(overviewTab).toHaveClass("bg-muted");
        expect(overviewTab).toHaveClass("border-b-0");
        expect(combatTab).toHaveClass("bg-background");
        expect(combatTab).not.toHaveClass("border-b-0");

        const tabPanel = screen.getByRole("tabpanel");
        expect(tabPanel).toHaveClass("bg-muted");
    });

    it("renders overview panels on the card nested surface", () => {
        const { container } = renderWithProviders(
            <PlayerSheet stored={storedCharacter} />
        );

        const nestedPanels = container.querySelectorAll('[data-slot="card"].bg-card');
        expect(nestedPanels.length).toBeGreaterThan(0);
    });
});

describe("PlayerSheetPage", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("renders the sheet for a known player id", () => {
        (useParams as jest.Mock).mockReturnValue({ id: storedCharacter.id });
        renderWithProviders(<PlayerSheetPage />);

        expect(
            screen.getByRole("heading", { name: /Sheet Hero/i })
        ).toBeInTheDocument();
    });

    it("shows not found for an unknown id", () => {
        (useParams as jest.Mock).mockReturnValue({ id: "missing" });
        renderWithProviders(<PlayerSheetPage />);

        expect(
            screen.getByText("Player character not found.")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Back to players" })
        ).toHaveAttribute("href", "/characters/player");
    });
});

describe("CharacterCardInfoBlocks full sheet CTA", () => {
    beforeEach(() => {
        useCharacterStore.setState({ characters: [storedCharacter] });
    });

    it("links to the full player sheet on the info page", () => {
        renderWithProviders(
            <CharacterCardInfoBlocks characterId={storedCharacter.id} />
        );

        const link = screen.getByRole("link", { name: "Open full sheet" });
        expect(link).toHaveAttribute(
            "href",
            `/characters/player/${storedCharacter.id}`
        );
        expect(
            within(screen.getByTestId("carousel-item")).getByRole("link", {
                name: "Open full sheet",
            })
        ).toBeInTheDocument();
    });
});
