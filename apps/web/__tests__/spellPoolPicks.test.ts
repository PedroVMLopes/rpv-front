/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useForm } from "react-hook-form";
import type { Grant } from "@rpv/content";
import type { PendingChoiceGrant } from "../lib/character/grantChoices";
import {
    bucketOptionsBySpellLevel,
    groupSpellChoicesByPool,
    readPoolSelectedRefs,
    toggleSpellInPool,
} from "../lib/character/spellPoolPicks";

const spellGrant: Grant = {
    grantType: "spell",
    choose: 3,
    description: "Choose cantrips",
    selectionFilter: { spellLists: ["wizard"], levelInt: 0 },
};

function slot(
    key: string,
    label: string,
    options: Array<{ value: string; label: string }>
): PendingChoiceGrant {
    return {
        key,
        grant: spellGrant,
        source: { type: "class", id: "wizard" },
        label,
        options,
    };
}

const cantripOptions = [
    { value: "fire-bolt", label: "Fire Bolt" },
    { value: "mage-hand", label: "Mage Hand" },
    { value: "prestidigitation", label: "Prestidigitation" },
    { value: "ray-of-frost", label: "Ray of Frost" },
];

const threeSlots = [
    slot("class:wizard:1:spell:1:0", "Choose cantrips (1/3)", cantripOptions),
    slot("class:wizard:1:spell:1:1", "Choose cantrips (2/3)", cantripOptions),
    slot("class:wizard:1:spell:1:2", "Choose cantrips (3/3)", cantripOptions),
];

describe("groupSpellChoicesByPool", () => {
    it("groups sibling slots under one pool", () => {
        const pools = groupSpellChoicesByPool(threeSlots);

        expect(pools).toHaveLength(1);
        expect(pools[0]?.poolKey).toBe("class:wizard:1:spell:1");
        expect(pools[0]?.slots).toHaveLength(3);
        expect(pools[0]?.label).toBe("Choose cantrips");
    });

    it("strips slot and level suffixes from pool labels", () => {
        const pools = groupSpellChoicesByPool([
            slot(
                "class:wizard:1:spell:1:0",
                "Choose cantrips (1/3) (Level 1)",
                cantripOptions
            ),
        ]);

        expect(pools[0]?.label).toBe("Choose cantrips");
    });

    it("keeps separate pools for different grants", () => {
        const pools = groupSpellChoicesByPool([
            ...threeSlots,
            slot(
                "class:wizard:1:spell:2:0",
                "Choose spells (1/2)",
                [{ value: "burning-hands", label: "Burning Hands" }]
            ),
        ]);

        expect(pools).toHaveLength(2);
        expect(pools.map((pool) => pool.poolKey)).toEqual([
            "class:wizard:1:spell:1",
            "class:wizard:1:spell:2",
        ]);
    });
});

describe("readPoolSelectedRefs", () => {
    it("returns non-empty slot refs in slot order", () => {
        expect(
            readPoolSelectedRefs(
                {
                    "class:wizard:1:spell:1:0": "fire-bolt",
                    "class:wizard:1:spell:1:1": "",
                    "class:wizard:1:spell:1:2": "mage-hand",
                },
                threeSlots
            )
        ).toEqual(["fire-bolt", "mage-hand"]);
    });
});

describe("toggleSpellInPool", () => {
    it("fills empty slots then clears on re-toggle", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: { choices: { grantPicks: {} } },
            })
        );

        act(() => {
            toggleSpellInPool(result.current, threeSlots, "fire-bolt");
            toggleSpellInPool(result.current, threeSlots, "mage-hand");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "class:wizard:1:spell:1:0": "fire-bolt",
            "class:wizard:1:spell:1:1": "mage-hand",
        });

        act(() => {
            toggleSpellInPool(result.current, threeSlots, "fire-bolt");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "class:wizard:1:spell:1:0": "",
            "class:wizard:1:spell:1:1": "mage-hand",
        });
    });

    it("no-ops when pool is full and slug is new", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "class:wizard:1:spell:1:0": "fire-bolt",
                            "class:wizard:1:spell:1:1": "mage-hand",
                            "class:wizard:1:spell:1:2": "prestidigitation",
                        },
                    },
                },
            })
        );

        act(() => {
            toggleSpellInPool(result.current, threeSlots, "ray-of-frost");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "class:wizard:1:spell:1:0": "fire-bolt",
            "class:wizard:1:spell:1:1": "mage-hand",
            "class:wizard:1:spell:1:2": "prestidigitation",
        });
    });
});

describe("bucketOptionsBySpellLevel", () => {
    it("groups options by catalog levelInt descending", () => {
        const buckets = bucketOptionsBySpellLevel(
            [
                { value: "fire-bolt", label: "Fire Bolt" },
                { value: "burning-hands", label: "Burning Hands" },
                { value: "magic-missile", label: "Magic Missile" },
                { value: "misty-step", label: "Misty Step" },
            ],
            "en"
        );

        expect(buckets.map((bucket) => bucket.levelInt)).toEqual([2, 1, 0]);
        expect(buckets[0]?.options.map((option) => option.value)).toEqual([
            "misty-step",
        ]);
        expect(buckets[1]?.options.map((option) => option.value)).toEqual([
            "burning-hands",
            "magic-missile",
        ]);
        expect(buckets[2]?.options.map((option) => option.value)).toEqual([
            "fire-bolt",
        ]);
    });
});
