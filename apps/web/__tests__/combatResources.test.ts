import type { CharacterGrant } from "@rpv/domain";
import {
    canAdjustCombatResource,
    listCombatResources,
} from "../lib/character/combatResources";

const grants: CharacterGrant[] = [
    {
        id: "class-wizard-resource-spell-slots-1",
        kind: "resource",
        ref: "spell-slots-1",
        amount: 4,
        source: { type: "class", id: "wizard" },
    },
    {
        id: "class-barbarian-resource-rage-uses",
        kind: "resource",
        ref: "rage-uses",
        amount: 2,
        source: { type: "class", id: "barbarian" },
    },
];

describe("listCombatResources", () => {
    it("pairs grant maxima with current resources and excludes hp", () => {
        const entries = listCombatResources(grants, {
            hp: 10,
            "spell-slots-1": 3,
            "rage-uses": 2,
        });

        expect(entries).toEqual([
            {
                ref: "spell-slots-1",
                current: 3,
                max: 4,
                spellLevel: 1,
            },
            {
                ref: "rage-uses",
                current: 2,
                max: 2,
            },
        ]);
    });

    it("keeps zero-current resources when max is positive", () => {
        const entries = listCombatResources(grants, {
            "spell-slots-1": 0,
            "rage-uses": 0,
        });

        expect(entries.find((entry) => entry.ref === "spell-slots-1")).toEqual({
            ref: "spell-slots-1",
            current: 0,
            max: 4,
            spellLevel: 1,
        });
    });

    it("treats missing current as full max", () => {
        const entries = listCombatResources(grants, {});

        expect(entries.find((entry) => entry.ref === "rage-uses")).toEqual({
            ref: "rage-uses",
            current: 2,
            max: 2,
        });
    });

    it("raises max to a session surplus, clamps negatives, and drops empty extras", () => {
        const entries = listCombatResources(grants, {
            "spell-slots-1": 9,
            "rage-uses": -3,
            "spell-slots-foo": 0,
            leftover: 0,
        });

        expect(entries.find((entry) => entry.ref === "spell-slots-1")).toEqual({
            ref: "spell-slots-1",
            current: 9,
            max: 9,
            spellLevel: 1,
        });
        expect(entries.find((entry) => entry.ref === "rage-uses")).toEqual({
            ref: "rage-uses",
            current: 0,
            max: 2,
        });
        expect(entries.some((entry) => entry.ref === "spell-slots-foo")).toBe(
            false
        );
        expect(entries.some((entry) => entry.ref === "leftover")).toBe(false);
    });

    it("keeps session-only resources and sorts spell slots before other refs", () => {
        const entries = listCombatResources(
            [
                ...grants,
                {
                    id: "class-wizard-resource-spell-slots-2",
                    kind: "resource",
                    ref: "spell-slots-2",
                    amount: 2,
                    source: { type: "class", id: "wizard" },
                },
            ],
            {
                "ki-points": 3,
                "spell-slots-2": 1,
                "spell-slots-1": 2,
            }
        );

        expect(entries.map((entry) => entry.ref)).toEqual([
            "spell-slots-1",
            "spell-slots-2",
            "ki-points",
            "rage-uses",
        ]);
        expect(entries.find((entry) => entry.ref === "ki-points")).toEqual({
            ref: "ki-points",
            current: 3,
            max: 3,
        });
    });
});

describe("canAdjustCombatResource", () => {
    it("blocks adjustments outside 0..max", () => {
        const entry = { ref: "rage-uses", current: 0, max: 2 };
        expect(canAdjustCombatResource(entry, -1)).toBe(false);
        expect(canAdjustCombatResource(entry, 1)).toBe(true);

        const full = { ref: "rage-uses", current: 2, max: 2 };
        expect(canAdjustCombatResource(full, 1)).toBe(false);
        expect(canAdjustCombatResource(full, -1)).toBe(true);
    });
});
