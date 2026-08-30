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
        currency: { gold: 452, silver: 12 },
        inventory: {
            bag: [
                { slug: "srd_arrow-bow", quantity: 10 },
                { slug: "rpv_pilot-test-pack-a", quantity: 1 },
                { slug: "rpv_amulet-of-vitality", quantity: 1 },
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

function cloneStoredCharacter(
    character: StoredCharacter = storedCharacter
): StoredCharacter {
    return JSON.parse(JSON.stringify(character)) as StoredCharacter;
}

function renderWithProviders(
    ui: ReactElement,
    character: StoredCharacter = storedCharacter
) {
    useCharacterStore.setState({
        characters: [cloneStoredCharacter(character)],
    });

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

function equipmentPanel() {
    return panelByTitle("Equipment");
}

function possessionsPanel() {
    return panelByTitle("Possessions");
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
        expect(screen.getByText("2.5 / 210")).toBeInTheDocument();
        expect(screen.getByText("Currency")).toBeInTheDocument();
        expect(screen.getByText("gp")).toBeInTheDocument();
        expect(screen.getByText("sp")).toBeInTheDocument();
        expect(
            screen.getByLabelText("Gold (gp) amount")
        ).toHaveValue("452");
        expect(
            screen.getByLabelText("Silver (sp) amount")
        ).toHaveValue("12");
        expect(
            screen.getByLabelText("Copper (cp) amount")
        ).toHaveValue("0");
        expect(screen.getByText("Misc items")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("adjusts a denomination by editing the amount directly", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const goldInput = screen.getByLabelText("Gold (gp) amount");
        await user.click(goldInput);
        await user.keyboard("{Control>}a{/Control}460");

        expect(goldInput).toHaveValue("460");
        expect(
            useCharacterStore
                .getState()
                .characters.find((entry) => entry.id === storedCharacter.id)
                ?.selections.currency?.gold
        ).toBe(460);
    });

    it("places panels in order: summary, Equipment, Possessions, Cosmetics", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const encumbrance = screen.getByText("Encumbrance");
        const equipment = equipmentPanel();
        const possessions = possessionsPanel();
        const cosmetics = panelByTitle("Cosmetics");

        expect(
            encumbrance.compareDocumentPosition(equipment) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
        expect(
            equipment.compareDocumentPosition(possessions) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
        expect(
            possessions.compareDocumentPosition(cosmetics) &
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
                        "melee-main": "rpv_scroll-of-fire-bolt",
                    },
                },
            },
        };

        renderWithProviders(<InventoryTab stored={withBothGroups} />);

        const wearable = screen.getByTestId("inventory-equipment-wearable");
        const usable = screen.getByTestId("inventory-equipment-usable");

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
            screen.queryByTestId("inventory-equipment-empty")
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
            screen.getByTestId("inventory-equipment-empty")
        ).toHaveTextContent("No items equipped.");
        expect(
            screen.queryByTestId("inventory-equipment-wearable")
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

    it("lists carried possessions and stowed equipment in separate panels", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const possessions = possessionsPanel();
        const equipment = equipmentPanel();

        expect(within(possessions).getByText("Arrow (bow) (10)")).toBeInTheDocument();
        expect(within(possessions).getByText("Pilot Test Pack A")).toBeInTheDocument();
        expect(
            within(possessions).queryByText("Amulet of Vitality")
        ).not.toBeInTheDocument();
        expect(
            within(equipment).getByText("Amulet of Vitality")
        ).toBeInTheDocument();
        expect(within(equipment).getByText("Longbow")).toBeInTheDocument();
        expect(
            within(possessions).queryByRole("button", { name: "Equipped" })
        ).not.toBeInTheDocument();
    });

    it("shows equipped items only in the Equipment panel", () => {
        const overlapping: StoredCharacter = {
            ...storedCharacter,
            id: "char-inventory-overlap",
            selections: {
                ...storedCharacter.selections,
                inventory: {
                    bag: [],
                    equipped: {
                        "melee-main": "srd_longsword",
                        breast: "srd_leather-armor",
                    },
                },
            },
        };

        renderWithProviders(<InventoryTab stored={overlapping} />);

        expect(screen.getAllByText("Longsword")).toHaveLength(1);
        expect(screen.getAllByText("Leather Armor")).toHaveLength(1);

        const wearable = screen.getByTestId("inventory-equipment-wearable");
        const usable = screen.getByTestId("inventory-equipment-usable");
        expect(within(wearable).getByText("Leather Armor")).toBeInTheDocument();
        expect(within(usable).getByText("Longsword")).toBeInTheDocument();
        expect(within(possessionsPanel()).queryByText("Longsword")).not.toBeInTheDocument();
    });

    it("filters Possessions by category tab without hiding Equipment panel", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const tablist = screen.getByRole("tablist", {
            name: "Inventory filters",
        });
        const possessions = possessionsPanel();
        const usable = screen.getByTestId("inventory-equipment-usable");
        const equipment = equipmentPanel();

        await user.click(
            within(tablist).getByRole("tab", { name: "Consumables" })
        );
        expect(within(possessions).getByText("Arrow (bow) (10)")).toBeInTheDocument();
        expect(within(possessions).queryByText("Longbow")).not.toBeInTheDocument();
        expect(
            within(possessions).queryByText("Pilot Test Pack A")
        ).not.toBeInTheDocument();
        expect(within(usable).getByText("Longbow")).toBeInTheDocument();
        expect(
            within(equipment).getByText("Amulet of Vitality")
        ).toBeInTheDocument();

        await user.click(
            within(tablist).getByRole("tab", { name: "Misc / Other" })
        );
        expect(within(possessions).getByText("Pilot Test Pack A")).toBeInTheDocument();
        expect(within(possessions).queryByText("Arrow (bow) (10)")).not.toBeInTheDocument();
        expect(within(usable).getByText("Longbow")).toBeInTheDocument();
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

    it("does not duplicate stackable carried items in Possessions after policy sanitize", () => {
        const partial: StoredCharacter = {
            ...storedCharacter,
            id: "char-torch-partial",
            selections: {
                ...storedCharacter.selections,
                inventory: {
                    bag: [{ slug: "srd_torch", quantity: 9 }],
                    equipped: {},
                    equippedMulti: { usable: ["srd_torch"] },
                },
            },
        };

        renderWithProviders(<InventoryTab stored={partial} />);

        const possessions = possessionsPanel();
        expect(within(possessions).getAllByText(/Torch/).length).toBe(1);
        expect(within(possessions).getByText("Torch (9)")).toBeInTheDocument();
        expect(
            within(possessions).queryByRole("button", { name: "Equip" })
        ).not.toBeInTheDocument();
    });

    it("does not show Equip for carried adventuring gear", () => {
        renderWithProviders(<InventoryTab stored={storedCharacter} />);

        const packCard = cardForName("Pilot Test Pack A", possessionsPanel());
        expect(
            within(packCard).queryByRole("button", { name: "Equip" })
        ).not.toBeInTheDocument();

        const arrowCard = cardForName("Arrow (bow) (10)", possessionsPanel());
        expect(
            within(arrowCard).queryByRole("button", { name: "Equip" })
        ).not.toBeInTheDocument();
    });

    it("shows only policy-allowed slots in equip menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const amuletCard = cardForName("Amulet of Vitality", equipmentPanel());
        await user.click(
            within(amuletCard).getByRole("button", { name: "Equip" })
        );

        expect(
            screen.getByRole("menuitem", { name: "Equip to Amulet" })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("menuitem", { name: "Equip to Usable" })
        ).not.toBeInTheDocument();
    });

    it("equips a bag item into a free slot from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const amuletCard = cardForName("Amulet of Vitality", equipmentPanel());
        await user.click(
            within(amuletCard).getByRole("button", { name: "Equip" })
        );
        await user.click(
            screen.getByRole("menuitem", { name: "Equip to Amulet" })
        );

        expect(
            useCharacterStore.getState().characters[0]?.selections.inventory
                ?.equipped.amulet
        ).toBe("rpv_amulet-of-vitality");

        const wearable = screen.getByTestId("inventory-equipment-wearable");
        expect(
            within(wearable).getByText("Amulet of Vitality")
        ).toBeInTheDocument();
        expect(
            within(possessionsPanel()).queryByText("Amulet of Vitality")
        ).not.toBeInTheDocument();
    });

    it("unequips an equipped item from the card menu", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <InventoryTabLive characterId={storedCharacter.id} />
        );

        const usable = screen.getByTestId("inventory-equipment-usable");
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

        const amuletCard = cardForName("Amulet of Vitality", equipmentPanel());
        await user.click(
            within(amuletCard).getByRole("button", { name: "Equip" })
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

        const arrowCard = cardForName("Arrow (bow) (10)", possessionsPanel());
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

        const packCard = cardForName("Pilot Test Pack A", possessionsPanel());
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

        const usable = screen.getByTestId("inventory-equipment-usable");
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

        const arrowCard = cardForName("Arrow (bow) (10)", possessionsPanel());
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

        const amuletCard = cardForName("Amulet of Vitality", equipmentPanel());
        await user.click(
            within(amuletCard).getByRole("button", {
                name: "Expand Amulet of Vitality",
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
