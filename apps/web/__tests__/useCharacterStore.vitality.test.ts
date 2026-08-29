import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";
import { HIT_DICE_RESOURCE } from "../lib/character/vitality";

const baseFormData = {
    name: "Vital Hero",
    ac: 12,
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("useCharacterStore vitality pipeline", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    function addFighter() {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    characterClass: "fighter",
                    level: 4,
                },
                "player",
                "dnd"
            );
        });

        return useCharacterStore.getState().characters[0];
    }

    it("applies damage through temp HP and heals without restoring it", () => {
        const created = addFighter();

        act(() => {
            useCharacterStore.getState().updateResource(created.id, "hp", -10);
            useCharacterStore.getState().applyVitalityChange(created.id, {
                type: "setTempHp",
                value: 5,
            });
            useCharacterStore.getState().applyVitalityChange(created.id, {
                type: "damage",
                amount: 3,
            });
        });

        let next = useCharacterStore.getState().characters[0];
        expect(next.resources.hp).toBe(created.resources.hp - 10);
        expect(next.session?.tempHp).toBe(2);

        act(() => {
            useCharacterStore.getState().applyVitalityChange(created.id, {
                type: "heal",
                amount: 1,
            });
        });

        next = useCharacterStore.getState().characters[0];
        expect(next.resources.hp).toBe(created.resources.hp - 9);
        expect(next.session?.tempHp).toBe(2);
    });

    it("leaves temp HP and hit dice on a short rest and restores them on a long rest", () => {
        const created = addFighter();

        act(() => {
            useCharacterStore.setState({
                characters: [
                    {
                        ...created,
                        resources: {
                            ...created.resources,
                            hp: 4,
                            [HIT_DICE_RESOURCE]: 1,
                        },
                        session: {
                            concentratingOn: { slug: "bless" },
                            tempHp: 6,
                            deathSaves: { successes: 1, failures: 0 },
                        },
                    },
                ],
            });
        });

        act(() => {
            useCharacterStore.getState().applyRest(created.id, "short_rest");
        });

        let next = useCharacterStore.getState().characters[0];
        expect(next.resources.hp).toBe(4);
        expect(next.resources[HIT_DICE_RESOURCE]).toBe(1);
        expect(next.session).toEqual({
            concentratingOn: { slug: "bless" },
            tempHp: 6,
            deathSaves: { successes: 1, failures: 0 },
        });

        act(() => {
            useCharacterStore.getState().applyRest(created.id, "long_rest");
        });

        next = useCharacterStore.getState().characters[0];
        expect(next.resources.hp).toBe(created.resources.hp);
        expect(next.resources[HIT_DICE_RESOURCE]).toBe(3);
        expect(next.session).toEqual({
            concentratingOn: { slug: "bless" },
        });
    });
});
