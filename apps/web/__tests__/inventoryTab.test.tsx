/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { InventoryTab } from "../components/characters/PlayerSheet/tabs/InventoryTab";
import { PlayerSheet } from "../components/characters/PlayerSheet/PlayerSheet";
import { RollAssistantProvider } from "../components/characters/PlayerSheet/roll/RollAssistantProvider";
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
            equipped: { "ranged-main": "srd_longbow" },
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
            <RollAssistantProvider>{ui}</RollAssistantProvider>
        </NextIntlClientProvider>
    );
}

function panelByTitle(title: string) {
    const titleNode = screen.getByText(title, {
        selector: '[data-slot="card-title"]',
    });
    const panel = titleNode.closest('[data-slot="card"]');
    if (!panel || !(panel instanceof HTMLElement)) {
        throw new Error(`${title} panel not found`);
    }
    return panel;
}

function bagPanel() {
    return panelByTitle("Bag");
}

function cardForName(name: string, scope: HTMLElement = document.body) {
    const heading = within(scope).getByRole("heading", { name });
    const card =
        heading.closest("[data-testid^='inventory-card-']") ??
        heading.closest("div.rounded-lg");
    if (!card || !(card instanceof HTMLElement)) {
        throw new Error(`No card for ${name}`);
    }
    return card;
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

    it("places Equipped between summary and Bag", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const encumbrance = screen.getByText("Encumbrance");
        const equipped = panelByTitle("Equipped");
        const bag = panelByTitle("Bag");

        expect(
            encumbrance.compareDocumentPosition(equipped) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
        expect(
            equipped.compareDocumentPosition(bag) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it("shows filled equipped slots in wearable vs usable columns", () => {
        const withBothGroups: StoredCharacter = {
            ...storedCharacter,
            id: "char-inventory-groups",
            selections: {
                ...storedCharacter.selections,
                inventory: {
                    bag: [],
                    equipped: {
                        armor: "srd_leather-armor",
                        amulet: "rpv_amulet-of-vitality",
                        "ranged-main": "srd_longbow",
                        usable: "rpv_scroll-of-fire-bolt",
                    },
                },
            },
        };

        renderWithProviders(<InventoryTab stored={withBothGroups} />);

        const wearable = screen.getByTestId("inventory-equipped-wearable");
        const usable = screen.getByTestId("inventory-equipped-usable");

        expect(within(wearable).getByText("Leather Armor")).toBeInTheDocument();
        expect(
            within(wearable).getByText("Amulet of Vitality")
        ).toBeInTheDocument();
        expect(within(wearable).queryByText("Longbow")).not.toBeInTheDocument();

        expect(within(usable).getByText("Longbow")).toBeInTheDocument();
        expect(
            within(usable).getByText("Scroll of Fire Bolt")
        ).toBeInTheDocument();
        expect(
            within(usable).queryByText("Leather Armor")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByTestId("inventory-equipped-empty")
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    });

    it("shows empty equipped state when nothing is equipped", () => {
        const emptyEquipped: StoredCharacter = {
            ...storedCharacter,
            id: "char-inventory-empty-eq",
            selections: {
                ...storedCharacter.selections,
                inventory: {
                    bag: [{ slug: "srd_arrow-bow", quantity: 10 }],
                    equipped: {},
                },
            },
        };

        renderWithProviders(<InventoryTab stored={emptyEquipped} />);

        expect(
            screen.getByTestId("inventory-equipped-empty")
        ).toHaveTextContent("No items equipped.");
        expect(
            screen.queryByTestId("inventory-equipped-wearable")
        ).not.toBeInTheDocument();
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

    it("lists bag and equipped items with equipped badge in Bag", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const bag = bagPanel();
        expect(within(bag).getByText("Arrow (bow) (10)")).toBeInTheDocument();
        expect(within(bag).getByText("Pilot Test Pack A")).toBeInTheDocument();
        expect(within(bag).getByText("Longbow")).toBeInTheDocument();
        expect(
            within(bag).getAllByRole("button", { name: "Equipped" }).length
        ).toBeGreaterThan(0);

        const longbowCard = cardForName("Longbow", bag);
        expect(
            within(longbowCard).queryByText(/^Equipped ·|· Equipped/)
        ).not.toBeInTheDocument();
    });

    it("keeps equipped items visible in both Equipped panel and Bag", () => {
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
                        "melee-main": "srd_longsword",
                        armor: "srd_leather-armor",
                    },
                },
            },
        };

        renderWithProviders(<InventoryTab stored={overlapping} />);

        // sanitize drops bag copies; panel + bag grid each show the equipped row
        expect(screen.getAllByText("Longsword")).toHaveLength(2);
        expect(screen.getAllByText("Leather Armor")).toHaveLength(2);

        const wearable = screen.getByTestId("inventory-equipped-wearable");
        const usable = screen.getByTestId("inventory-equipped-usable");
        expect(within(wearable).getByText("Leather Armor")).toBeInTheDocument();
        expect(within(usable).getByText("Longsword")).toBeInTheDocument();
    });

    it("filters Bag items by category tab without hiding Equipped panel", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const tablist = screen.getByRole("tablist", {
            name: "Inventory filters",
        });
        const bag = bagPanel();
        const usable = screen.getByTestId("inventory-equipped-usable");

        await user.click(
            within(tablist).getByRole("tab", { name: "Consumables" })
        );
        expect(within(bag).getByText("Arrow (bow) (10)")).toBeInTheDocument();
        expect(within(bag).queryByText("Longbow")).not.toBeInTheDocument();
        expect(
            within(bag).queryByText("Pilot Test Pack A")
        ).not.toBeInTheDocument();
        expect(within(usable).getByText("Longbow")).toBeInTheDocument();

        await user.click(
            within(tablist).getByRole("tab", { name: "Misc / Other" })
        );
        expect(within(bag).getByText("Longbow")).toBeInTheDocument();
        expect(within(bag).getByText("Pilot Test Pack A")).toBeInTheDocument();
        expect(within(bag).queryByText("Arrow (bow) (10)")).not.toBeInTheDocument();
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

    it("includes Usable in the equip menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A", bagPanel());
        await user.click(
            within(packCard).getByRole("button", { name: "Equip" })
        );
        expect(
            screen.getByRole("menuitem", { name: "Equip to Usable" })
        ).toBeInTheDocument();
    });

    it("equips a bag item into a free slot from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A", bagPanel());
        await user.click(
            within(packCard).getByRole("button", { name: "Equip" })
        );
        await user.click(
            screen.getByRole("menuitem", { name: "Equip to Amulet" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped.amulet
        ).toBe("rpv_pilot-test-pack-a");

        const wearable = screen.getByTestId("inventory-equipped-wearable");
        expect(
            within(wearable).getByText("Pilot Test Pack A")
        ).toBeInTheDocument();
        expect(
            within(cardForName("Pilot Test Pack A", bagPanel())).getByRole(
                "button",
                { name: "Equipped" }
            )
        ).toBeInTheDocument();
    });

    it("unequips an equipped item from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const usable = screen.getByTestId("inventory-equipped-usable");
        const longbowCard = cardForName("Longbow", usable);
        await user.click(
            within(longbowCard).getByRole("button", { name: "Equipped" })
        );
        await user.click(screen.getByRole("menuitem", { name: "Unequip" }));

        const inventory =
            useCharacterStore.getState().characters[0]?.selections.inventory;
        expect(inventory?.equipped["ranged-main"]).toBeUndefined();
        expect(
            inventory?.bag.some((stack) => stack.slug === "srd_longbow")
        ).toBe(true);
    });

    it("does not equip into an occupied slot", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A", bagPanel());
        await user.click(
            within(packCard).getByRole("button", { name: "Equip" })
        );

        const rangedMain = screen.getByRole("menuitem", {
            name: "Equip to Ranged main",
        });
        expect(rangedMain).toHaveAttribute("data-disabled");
        await user.click(rangedMain);

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped["ranged-main"]
        ).toBe("srd_longbow");
        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped.amulet
        ).toBeUndefined();
    });

    it("shows quantity suffix and adjusts bag quantity from the detail modal", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const arrowCard = cardForName("Arrow (bow) (10)", bagPanel());
        await user.click(
            within(arrowCard).getByRole("button", {
                name: "Expand Arrow (bow) (10)",
            })
        );

        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("10")).toBeInTheDocument();

        await user.click(
            within(dialog).getByRole("button", { name: "Decrease quantity" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory?.bag
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    slug: "srd_arrow-bow",
                    quantity: 9,
                }),
            ])
        );
    });

    it("deletes a bag item from the detail modal", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A", bagPanel());
        await user.click(
            within(packCard).getByRole("button", {
                name: "Expand Pilot Test Pack A",
            })
        );

        await user.click(screen.getByRole("button", { name: "Delete" }));

        expect(
            useCharacterStore
                .getState()
                .characters[0]?.selections.inventory?.bag.some(
                    (stack) => stack.slug === "rpv_pilot-test-pack-a"
                )
        ).toBe(false);
    });

    it("unequips to bag quantity 0 when decreasing equipped quantity", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const usable = screen.getByTestId("inventory-equipped-usable");
        const longbowCard = cardForName("Longbow", usable);
        await user.click(
            within(longbowCard).getByRole("button", {
                name: "Expand Longbow",
            })
        );

        const dialog = screen.getByRole("dialog");
        expect(
            within(dialog).getByRole("button", { name: "Increase quantity" })
        ).toBeDisabled();

        await user.click(
            within(dialog).getByRole("button", { name: "Decrease quantity" })
        );

        const inventory =
            useCharacterStore.getState().characters[0]?.selections.inventory;
        expect(inventory?.equipped["ranged-main"]).toBeUndefined();
        expect(inventory?.bag).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    slug: "srd_longbow",
                    quantity: 0,
                }),
            ])
        );
        expect(screen.getByText("Longbow (0)")).toBeInTheDocument();
    });

    it("adjusts bag quantity from the modal without equipping", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const arrowCard = cardForName("Arrow (bow) (10)", bagPanel());
        await user.click(
            within(arrowCard).getByRole("button", {
                name: "Expand Arrow (bow) (10)",
            })
        );

        const dialog = screen.getByRole("dialog");
        await user.click(
            within(dialog).getByRole("button", { name: "Increase quantity" })
        );

        expect(
            useCharacterStore
                .getState()
                .characters[0]?.selections.inventory?.bag.find(
                    (stack) => stack.slug === "srd_arrow-bow"
                )?.quantity
        ).toBe(11);

        await user.click(
            within(dialog).getByRole("button", { name: "Decrease quantity" })
        );

        expect(
            useCharacterStore
                .getState()
                .characters[0]?.selections.inventory?.bag.find(
                    (stack) => stack.slug === "srd_arrow-bow"
                )?.quantity
        ).toBe(10);
    });

    it("shows Equip next to Delete in the item modal footer", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const packCard = cardForName("Pilot Test Pack A", bagPanel());
        await user.click(
            within(packCard).getByRole("button", {
                name: "Expand Pilot Test Pack A",
            })
        );

        const dialog = screen.getByRole("dialog");
        expect(
            within(dialog).getByRole("button", { name: "Delete" })
        ).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: "Equip" }));
        expect(
            screen.getByRole("menuitem", { name: "Equip to Amulet" })
        ).toBeInTheDocument();
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
