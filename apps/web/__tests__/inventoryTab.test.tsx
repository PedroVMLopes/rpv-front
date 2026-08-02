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
                { slug: "srd_arrow-bow", quantity: 10 },
                { slug: "rpv_pilot-test-pack-a", quantity: 1 },
            ],
            equipped: { "main-hand": "srd_longbow" },
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
        expect(screen.getByText("1")).toBeInTheDocument();
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

        expect(screen.getByText("Arrow (bow)")).toBeInTheDocument();
        expect(screen.getByText("Pilot Test Pack A")).toBeInTheDocument();
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
                        { slug: "srd_longsword", quantity: 1 },
                        { slug: "srd_leather-armor", quantity: 1 },
                    ],
                    equipped: {
                        "main-hand": "srd_longsword",
                        armor: "srd_leather-armor",
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
        expect(screen.getByText("Arrow (bow)")).toBeInTheDocument();
        expect(screen.queryByText("Longbow")).not.toBeInTheDocument();
        expect(screen.queryByText("Pilot Test Pack A")).not.toBeInTheDocument();

        await user.click(within(tablist).getByRole("tab", { name: "Misc / Other" }));
        expect(screen.getByText("Longbow")).toBeInTheDocument();
        expect(screen.getByText("Pilot Test Pack A")).toBeInTheDocument();
        expect(screen.queryByText("Arrow (bow)")).not.toBeInTheDocument();
    });
});

describe("InventoryTab equip actions", () => {
    function InventoryTabLive({ characterId }: { characterId: string }) {
        const stored = useCharacterStore((state) =>
            state.characters.find((character) => character.id === characterId)
        );
        if (!stored) {
            return null;
        }
        return <InventoryTab stored={stored} />;
    }

    function cardForName(name: string) {
        const heading = screen.getByRole("heading", { name });
        const card = heading.closest("article");
        if (!card) {
            throw new Error(`No article for ${name}`);
        }
        return card;
    }

    it("equips a bag item into a free slot from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A");
        await user.click(
            within(packCard).getByRole("button", { name: "Item actions" })
        );
        await user.click(
            screen.getByRole("menuitem", { name: "Equip to Neck" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped.neck
        ).toBe("rpv_pilot-test-pack-a");
        expect(
            within(cardForName("Pilot Test Pack A")).getByText("Equipped")
        ).toBeInTheDocument();
    });

    it("unequips an equipped item from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const longbowCard = cardForName("Longbow");
        await user.click(
            within(longbowCard).getByRole("button", { name: "Item actions" })
        );
        await user.click(screen.getByRole("menuitem", { name: "Unequip" }));

        const inventory =
            useCharacterStore.getState().characters[0]?.selections.inventory;
        expect(inventory?.equipped["main-hand"]).toBeUndefined();
        expect(
            inventory?.bag.some((stack) => stack.slug === "srd_longbow")
        ).toBe(true);
    });

    it("does not equip into an occupied slot", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A");
        await user.click(
            within(packCard).getByRole("button", { name: "Item actions" })
        );

        const mainHand = screen.getByRole("menuitem", {
            name: "Equip to Main hand",
        });
        expect(mainHand).toHaveAttribute("data-disabled");
        await user.click(mainHand);

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped["main-hand"]
        ).toBe("srd_longbow");
        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped.neck
        ).toBeUndefined();
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
