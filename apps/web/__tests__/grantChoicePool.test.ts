/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useForm } from "react-hook-form";
import type { Grant } from "@rpv/content";
import type { PendingChoiceGrant } from "../lib/character/grantChoices";
import {
    groupChoicesByPool,
    readPoolSelectedRefs,
    toggleRefInPool,
} from "../lib/character/grantChoicePool";

const languageGrant: Grant = {
    grantType: "language",
    choose: 2,
    description: "Two languages of your choice.",
    selectionFilter: { any: true },
};

const skillGrant: Grant = {
    grantType: "skill_proficiency",
    choose: 2,
    description: "Choose two skills.",
    options: [
        { optionType: "skill", ref: "athletics" },
        { optionType: "skill", ref: "history" },
        { optionType: "skill", ref: "intimidation" },
    ],
};

function slot(
    key: string,
    label: string,
    grant: Grant,
    options: Array<{ value: string; label: string }>,
    source: PendingChoiceGrant["source"] = { type: "background", id: "sage" }
): PendingChoiceGrant {
    return {
        key,
        grant,
        source,
        label,
        options,
    };
}

const languageOptions = [
    { value: "draconic", label: "Draconic" },
    { value: "dwarvish", label: "Dwarvish" },
    { value: "giant", label: "Giant" },
];

const languageSlots = [
    slot(
        "background:sage:base:language:0:0",
        "Two languages of your choice. (1/2)",
        languageGrant,
        languageOptions
    ),
    slot(
        "background:sage:base:language:0:1",
        "Two languages of your choice. (2/2)",
        languageGrant,
        languageOptions
    ),
];

describe("groupChoicesByPool", () => {
    it("groups sibling language slots under one pool with a clean label", () => {
        const pools = groupChoicesByPool(languageSlots);

        expect(pools).toHaveLength(1);
        expect(pools[0]?.poolKey).toBe("background:sage:base:language:0");
        expect(pools[0]?.slots).toHaveLength(2);
        expect(pools[0]?.label).toBe("Two languages of your choice.");
    });

    it("keeps separate pools for different grants", () => {
        const skillSlots = [
            slot(
                "class:fighter:base:skill_proficiency:3:0",
                "Choose two skills. (1/2)",
                skillGrant,
                [
                    { value: "athletics", label: "Athletics" },
                    { value: "history", label: "History" },
                ],
                { type: "class", id: "fighter" }
            ),
            slot(
                "class:fighter:base:skill_proficiency:3:1",
                "Choose two skills. (2/2)",
                skillGrant,
                [
                    { value: "athletics", label: "Athletics" },
                    { value: "history", label: "History" },
                ],
                { type: "class", id: "fighter" }
            ),
        ];

        const pools = groupChoicesByPool([...languageSlots, ...skillSlots]);

        expect(pools).toHaveLength(2);
        expect(pools.map((pool) => pool.poolKey)).toEqual([
            "background:sage:base:language:0",
            "class:fighter:base:skill_proficiency:3",
        ]);
    });
});

describe("toggleRefInPool", () => {
    it("fills empty slots then clears on re-toggle", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: { choices: { grantPicks: {} } },
            })
        );

        act(() => {
            toggleRefInPool(result.current, languageSlots, "draconic");
            toggleRefInPool(result.current, languageSlots, "dwarvish");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "background:sage:base:language:0:0": "draconic",
            "background:sage:base:language:0:1": "dwarvish",
        });

        act(() => {
            toggleRefInPool(result.current, languageSlots, "draconic");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "background:sage:base:language:0:0": "",
            "background:sage:base:language:0:1": "dwarvish",
        });
    });

    it("no-ops when pool is full and ref is new", () => {
        const { result } = renderHook(() =>
            useForm({
                defaultValues: {
                    choices: {
                        grantPicks: {
                            "background:sage:base:language:0:0": "draconic",
                            "background:sage:base:language:0:1": "dwarvish",
                        },
                    },
                },
            })
        );

        act(() => {
            toggleRefInPool(result.current, languageSlots, "giant");
        });

        expect(result.current.getValues("choices.grantPicks")).toEqual({
            "background:sage:base:language:0:0": "draconic",
            "background:sage:base:language:0:1": "dwarvish",
        });
    });
});

describe("readPoolSelectedRefs", () => {
    it("returns non-empty slot refs in slot order", () => {
        expect(
            readPoolSelectedRefs(
                {
                    "background:sage:base:language:0:0": "draconic",
                    "background:sage:base:language:0:1": "",
                },
                languageSlots
            )
        ).toEqual(["draconic"]);
    });
});
