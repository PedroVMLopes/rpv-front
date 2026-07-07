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
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            source: { type: "class", id: "wizard" },
            name: "Fire Bolt",
        },
        {
            id: "class-wizard-spell-magic-missile",
            kind: "spell",
            ref: "magic-missile",
            source: { type: "class", id: "wizard" },
            name: "Magic Missile",
        },
    ],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [
                { slug: "longsword", quantity: 1 },
                { slug: "leather-armor", quantity: 1 },
            ],
            equipped: {
                "main-hand": "longsword",
                armor: "leather-armor",
            },
        },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
        background: "Soldier",
        goals: "Protect the realm",
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
        expect(screen.getByLabelText(/AC 16/i)).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Hit Points 10 \/ 12/i)
        ).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
            "aria-selected",
            "true"
        );
    });

    it("shows only proficient skills and saves in the skills card", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Skills")).toBeInTheDocument();
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.queryByText("Stealth")).not.toBeInTheDocument();
        expect(screen.queryByText("Arcana")).not.toBeInTheDocument();

        const strengthButtons = screen.getAllByRole("button", {
            name: /Strength/i,
        });
        expect(strengthButtons.length).toBeGreaterThanOrEqual(1);
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

    it("shows goals and background on overview", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Soldier")).toBeInTheDocument();
        expect(screen.getByText("Protect the realm")).toBeInTheDocument();
    });

    it("shows equipped weapons and spells in actions", () => {
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        expect(screen.getByText("Actions")).toBeInTheDocument();
        expect(screen.getByText("Longsword")).toBeInTheDocument();
        expect(screen.getByText("Main hand")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText("Magic Missile")).toBeInTheDocument();
        expect(screen.getByText("Equipped: Leather Armor")).toBeInTheDocument();
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

        await user.click(screen.getByRole("tab", { name: "Combat" }));
        expect(screen.getByText("Attacks & Actions")).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Inventory" }));
        expect(screen.getByText("Encumbrance")).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Magic" }));
        expect(screen.getByText("Coming soon")).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Notes" }));
        expect(screen.getByText("Coming soon")).toBeInTheDocument();
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
