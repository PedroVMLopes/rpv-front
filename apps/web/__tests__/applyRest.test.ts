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

    it("leaves hit dice unchanged on a short rest and recovers them on a long rest", () => {
        const resources = {
            hp: 4,
            "hit-dice": 1,
            "spell-slots-1": 1,
            "pact-slots": 0,
            "rage-uses": 0,
            "action-surge-uses": 0,
        };
        const hitDice = {
            ref: "hit-dice",
            max: 4,
            recover: (current: number, max: number) =>
                Math.min(max, current + Math.max(1, Math.floor(max / 2))),
        };

        expect(
            applyRest(resources, grants, "short_rest", { maxHp: 12, hitDice })
        ).toEqual({
            hp: 4,
            "hit-dice": 1,
            "spell-slots-1": 1,
            "pact-slots": 2,
            "rage-uses": 0,
            "action-surge-uses": 0,
        });

        expect(
            applyRest(resources, grants, "long_rest", { maxHp: 12, hitDice })
        ).toEqual({
            hp: 12,
            "hit-dice": 3,
            "spell-slots-1": 4,
            "pact-slots": 2,
            "rage-uses": 2,
            "action-surge-uses": 0,
        });
    });

    it("does not restore HP without maxHp or hit dice when max is 0", () => {
        const resources = {
            hp: 4,
            "hit-dice": 1,
            "pact-slots": 0,
        };

        expect(applyRest(resources, grants, "long_rest")).toEqual({
            hp: 4,
            "hit-dice": 1,
            "pact-slots": 2,
            "rage-uses": 2,
            "spell-slots-1": 4,
        });
        expect(
            applyRest(resources, grants, "long_rest", {
                hitDice: {
                    ref: "hit-dice",
                    max: 0,
                    recover: () => 99,
                },
            })
        ).toEqual({
            hp: 4,
            "hit-dice": 1,
            "pact-slots": 2,
            "rage-uses": 2,
            "spell-slots-1": 4,
        });
    });

    it("recovers hit dice from 0 when the current ref is missing", () => {
        expect(
            applyRest({ hp: 4 }, grants, "long_rest", {
                maxHp: 12,
                hitDice: {
                    ref: "hit-dice",
                    max: 4,
                    recover: (current, max) =>
                        Math.min(max, current + Math.max(1, Math.floor(max / 2))),
                },
            })
        ).toEqual({
            hp: 12,
            "pact-slots": 2,
            "rage-uses": 2,
            "spell-slots-1": 4,
            "hit-dice": 2,
        });
    });
});
