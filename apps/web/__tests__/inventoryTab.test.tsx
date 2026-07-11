/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { InventoryTab } from "../components/characters/PlayerSheet/tabs/InventoryTab";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/HealthSlider", () => ({
    HealthSlider: () => <div data-testid="health-slider" />,
}));

const storedCharacter: StoredCharacter = {
    id: "char-inventory-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Pack Hero",
    baseStats: {
        strength: 14,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 8,
        armorClass: 14,
        hitPoints: 12,
    },
    modifiers: [],
    grants: [],
    selections: {
        race: "human",
        characterClass: "fighter",
        choices: {},
        grantedCurrency: { gold: 400 },
        inventory: {
            bag: [
                { slug: "arrows", quantity: 10 },
                { slug: "dungeoneers-pack", quantity: 1 },
            ],
            equipped: { "main-hand": "longbow" },
        },
    },
    resources: { hp: 12 },
    systemData: {
        characterClass: "fighter",
        level: 1,
        gold: 52,
        silver: 12,
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

describe("InventoryTab", () => {
    it("shows summary cards with currency and misc count", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        expect(screen.getByText("Encumbrance")).toBeInTheDocument();
        expect(screen.getByText("— / —")).toBeInTheDocument();
        expect(screen.getByText("Currency")).toBeInTheDocument();
        expect(screen.getByText("452 gold")).toBeInTheDocument();
        expect(screen.getByText("12 silver")).toBeInTheDocument();
        expect(screen.getByText("Misc items")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("renders cosmetic search and add item controls", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        expect(
            screen.getByRole("searchbox", { name: "Search items…" })
        ).toHaveAttribute("readonly");
        expect(
            screen.getByRole("button", { name: "Add item" })
        ).toHaveAttribute("aria-disabled", "true");
    });

    it("lists bag and equipped items with equipped badge", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        expect(screen.getByText("Arrows")).toBeInTheDocument();
        expect(screen.getByText("Dungeoneer's Pack")).toBeInTheDocument();
        expect(screen.getByText("Longbow")).toBeInTheDocument();
        expect(screen.getByText("Equipped")).toBeInTheDocument();
    });

    it("does not duplicate items present in both bag and equipped slots", () => {
        const overlapping: StoredCharacter = {
            ...storedCharacter,
            id: "char-inventory-overlap",
            selections: {
                ...storedCharacter.selections,
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
        };

        renderWithProviders(<InventoryTab stored={overlapping} />);

        expect(screen.getAllByText("Longsword")).toHaveLength(1);
        expect(screen.getAllByText("Leather Armor")).toHaveLength(1);
        expect(screen.getAllByText("Equipped")).toHaveLength(2);
    });

    it("filters items by category tab", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const tablist = screen.getByRole("tablist", {
            name: "Inventory filters",
        });

        await user.click(within(tablist).getByRole("tab", { name: "Consumables" }));
        expect(screen.getByText("Arrows")).toBeInTheDocument();
        expect(screen.queryByText("Longbow")).not.toBeInTheDocument();
        expect(screen.queryByText("Dungeoneer's Pack")).not.toBeInTheDocument();

        await user.click(within(tablist).getByRole("tab", { name: "Misc / Other" }));
        expect(screen.getByText("Longbow")).toBeInTheDocument();
        expect(screen.getByText("Dungeoneer's Pack")).toBeInTheDocument();
        expect(screen.queryByText("Arrows")).not.toBeInTheDocument();
    });
});

describe("PlayerSheet inventory tab", () => {
    it("opens inventory content instead of coming soon", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PlayerSheet stored={storedCharacter} />);

        await user.click(screen.getByRole("tab", { name: "Inventory" }));
        expect(screen.getByText("Encumbrance")).toBeInTheDocument();
        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });
});
