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
