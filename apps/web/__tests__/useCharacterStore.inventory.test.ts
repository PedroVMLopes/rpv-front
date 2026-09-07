import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseAttributes = [
    { name: "strength", value: 10 },
    { name: "dexterity", value: 10 },
    { name: "constitution", value: 14 },
    { name: "intelligence", value: 10 },
    { name: "wisdom", value: 10 },
    { name: "charisma", value: 10 },
];

const baseFormData = {
    name: "Test Hero",
    ac: 12,
    attributes: baseAttributes,
    characterClass: "wizard",
    level: 1,
};

describe("useCharacterStore inventory", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    function addBaseCharacter() {
        act(() => {
            useCharacterStore.getState().addCharacter(baseFormData, "player", "dnd");
        });
        return useCharacterStore.getState().characters[0];
    }

    it("adds item HP bonus when equipping from bag via store actions", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "rpv_amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory).toEqual({
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        });
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(13);
        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("does not restore spent spell slots when equipping an item", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore
                .getState()
                .updateResource(character.id, "spell-slots-1", -1);
            useCharacterStore.getState().addToBag(character.id, "rpv_amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.resources["spell-slots-1"]).toBe(1);
    });

    it("does not add item HP bonus when item is only in bag", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "rpv_amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory.bag).toEqual([
            { slug: "rpv_amulet-of-vitality", quantity: 1 },
        ]);
        expect(updated.selections.inventory.equipped).toEqual({});
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(8);
        expect(
            updated.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("raises class max HP when a constitution item is equipped, not when it is in the bag", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    attributes: baseAttributes.map((attribute) =>
                        attribute.name === "constitution"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                },
                "player",
                "dnd"
            );
        });
        const character = useCharacterStore.getState().characters[0];
        expect(character.baseStats.hitPoints).toBe(6);

        act(() => {
            useCharacterStore
                .getState()
                .addToBag(character.id, "rpv_belt-of-constitution");
        });
        const bagOnly = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;
        expect(bagOnly.baseStats.hitPoints).toBe(6);

        act(() => {
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_belt-of-constitution");
        });
        const equipped = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;
        expect(equipped.baseStats.hitPoints).toBe(7);
        expect(
            useCharacterStore.getState().getResolvedStats(equipped.id)?.constitution
        ).toBe(12);
    });

    it("clamps current hp when unequipping an item that raised max hp", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "rpv_amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        act(() => {
            useCharacterStore.getState().unequipItem(character.id, "amulet");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.resources.hp).toBe(8);
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(8);
        expect(
            updated.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("recalculates grants when equipment changes", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "rpv_amulet-of-vitality");
            useCharacterStore.getState().addToBag(character.id, "rpv_ring-of-hardiness");
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        let updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.source.id === "rpv_amulet-of-vitality" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);

        act(() => {
            useCharacterStore.getState().unequipItem(character.id, "amulet");
            useCharacterStore
                .getState()
                .equipItem(character.id, "ring", "rpv_ring-of-hardiness");
        });

        updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.source.id === "rpv_amulet-of-vitality"
            )
        ).toBe(false);
        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.source.id === "rpv_ring-of-hardiness" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("leaves character unchanged when equipItem has no bag stock", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory).toEqual({
            bag: [],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("consumes sage granted scroll from the bag", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    characterClass: "fighter",
                    background: "sage",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:exclusive:starting-wealth":
                                "equipment",
                        },
                    },
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];
        expect(
            character.selections.inventory.bag.some(
                (stack) => stack.slug === "rpv_scroll-of-fire-bolt"
            )
        ).toBe(true);

        act(() => {
            useCharacterStore
                .getState()
                .useInventoryItem(character.id, "rpv_scroll-of-fire-bolt", 1);
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(
            updated.selections.inventory.bag.filter(
                (stack) => stack.slug === "rpv_scroll-of-fire-bolt"
            )
        ).toEqual([
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 0,
                provenance: "grant:background:sage:2",
            },
        ]);
    });

    it("removes bag quantity without changing equipped items", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "srd_longsword", 2);
            useCharacterStore
                .getState()
                .equipItem(character.id, "melee-main", "srd_longsword");
            useCharacterStore
                .getState()
                .removeFromBag(character.id, "srd_longsword", 1);
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory.bag).toEqual([]);
        expect(updated.selections.inventory.equipped).toEqual({
            "melee-main": "srd_longsword",
        });
    });

    it("useInventoryItem consumes a scroll from the bag", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore
                .getState()
                .addToBag(character.id, "rpv_scroll-of-fire-bolt", 2);
            useCharacterStore
                .getState()
                .useInventoryItem(character.id, "rpv_scroll-of-fire-bolt", 1);
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory.bag).toEqual([
            { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
        ]);
        expect(
            updated.grants.some(
                (grant) =>
                    grant.kind === "spell" && grant.ref === "fire-bolt"
            )
        ).toBe(false);
    });
});

describe("useCharacterStore currency", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("clamps spend at zero", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                { ...baseFormData, background: "sage" },
                "player",
                "dnd"
            );
        });
        const character = useCharacterStore.getState().characters[0];
        expect(character.selections.currency).toEqual({ gold: 15 });

        act(() => {
            useCharacterStore.getState().adjustCurrency(character.id, "gold", -20);
        });

        expect(
            useCharacterStore.getState().characters[0].selections.currency
        ).toEqual({ gold: 0 });
    });

    it("keeps the wallet when equipping an item rebuilds the character", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                { ...baseFormData, background: "sage" },
                "player",
                "dnd"
            );
        });
        const character = useCharacterStore.getState().characters[0];

        act(() => {
            useCharacterStore.getState().adjustCurrency(character.id, "gold", -3);
            useCharacterStore
                .getState()
                .addToBag(character.id, "rpv_amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "amulet", "rpv_amulet-of-vitality");
        });

        const updated = useCharacterStore.getState().characters[0];
        expect(updated.selections.currency).toEqual({ gold: 12 });
        expect(updated.selections.grantedCurrency).toEqual({ gold: 15 });
    });
});
