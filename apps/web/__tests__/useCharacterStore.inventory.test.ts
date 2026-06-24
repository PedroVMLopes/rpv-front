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
    characterClass: "fighter",
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
            useCharacterStore.getState().addToBag(character.id, "amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "neck", "amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory).toEqual({
            bag: [],
            equipped: { neck: "amulet-of-vitality" },
        });
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(17);
        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("does not add item HP bonus when item is only in bag", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory.bag).toEqual([
            { slug: "amulet-of-vitality", quantity: 1 },
        ]);
        expect(updated.selections.inventory.equipped).toEqual({});
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(12);
        expect(
            updated.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("clamps current hp when unequipping an item that raised max hp", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "neck", "amulet-of-vitality");
        });

        act(() => {
            useCharacterStore.getState().unequipItem(character.id, "neck");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.resources.hp).toBe(12);
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(12);
        expect(
            updated.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("recalculates grants when equipment changes", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "scroll-of-fire-bolt");
            useCharacterStore.getState().addToBag(character.id, "amulet-of-vitality");
            useCharacterStore
                .getState()
                .equipItem(character.id, "main-hand", "scroll-of-fire-bolt");
        });

        let updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "item", id: "scroll-of-fire-bolt" },
                }),
            ])
        );

        act(() => {
            useCharacterStore
                .getState()
                .unequipItem(character.id, "main-hand");
            useCharacterStore
                .getState()
                .equipItem(character.id, "neck", "amulet-of-vitality");
        });

        updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(
            updated.grants.some(
                (grant) =>
                    grant.source.type === "item" &&
                    grant.source.id === "scroll-of-fire-bolt"
            )
        ).toBe(false);
        expect(
            updated.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("leaves character unchanged when equipItem has no bag stock", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore
                .getState()
                .equipItem(character.id, "neck", "amulet-of-vitality");
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory).toEqual({
            bag: [],
            equipped: {},
        });
    });

    it("removes bag quantity without changing equipped items", () => {
        const character = addBaseCharacter();

        act(() => {
            useCharacterStore.getState().addToBag(character.id, "scroll-of-fire-bolt", 2);
            useCharacterStore
                .getState()
                .equipItem(character.id, "main-hand", "scroll-of-fire-bolt");
            useCharacterStore
                .getState()
                .removeFromBag(character.id, "scroll-of-fire-bolt", 1);
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.selections.inventory.bag).toEqual([]);
        expect(updated.selections.inventory.equipped).toEqual({
            "main-hand": "scroll-of-fire-bolt",
        });
    });
});
