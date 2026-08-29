import type { CharacterGrant } from "@rpv/domain";
import { applyRest } from "../lib/character/applyRest";

const grants: CharacterGrant[] = [
    {
        id: "class-wizard-resource-spell-slots-1",
        kind: "resource",
        ref: "spell-slots-1",
        amount: 4,
        source: { type: "class", id: "wizard" },
    },
    {
        id: "class-warlock-resource-pact-slots",
        kind: "resource",
        ref: "pact-slots",
        amount: 2,
        source: { type: "class", id: "warlock" },
        resource: {
            display: "slots",
            slotLevel: 1,
            recoverOn: "short_rest",
        },
    },
    {
        id: "class-barbarian-resource-rage-uses",
        kind: "resource",
        ref: "rage-uses",
        amount: 2,
        source: { type: "class", id: "barbarian" },
        resource: { recoverOn: "long_rest" },
    },
    {
        id: "class-fighter-resource-action-surge-uses",
        kind: "resource",
        ref: "action-surge-uses",
        amount: 1,
        source: { type: "class", id: "fighter" },
    },
];

describe("applyRest", () => {
    it("restores short-rest pools without touching long-rest or omitted refs", () => {
        expect(
            applyRest(
                {
                    hp: 4,
                    "spell-slots-1": 1,
                    "pact-slots": 0,
                    "rage-uses": 0,
                    "action-surge-uses": 0,
                },
                grants,
                "short_rest",
                { maxHp: 12 }
            )
        ).toEqual({
            hp: 4,
            "spell-slots-1": 1,
            "pact-slots": 2,
            "rage-uses": 0,
            "action-surge-uses": 0,
        });
    });

    it("restores long-rest and short-rest pools and sets HP to max", () => {
        expect(
            applyRest(
                {
                    hp: 4,
                    "spell-slots-1": 1,
                    "pact-slots": 0,
                    "rage-uses": 0,
                    "action-surge-uses": 0,
                },
                grants,
                "long_rest",
                { maxHp: 12 }
            )
        ).toEqual({
            hp: 12,
            "spell-slots-1": 4,
            "pact-slots": 2,
            "rage-uses": 2,
            "action-surge-uses": 0,
        });
    });
});
