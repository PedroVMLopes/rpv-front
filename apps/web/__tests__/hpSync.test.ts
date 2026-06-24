import { syncResourceHpToResolvedMax } from "../lib/character/hpSync";
import type { Modifier, Stats } from "@rpv/domain";

const baseStats: Stats = {
    strength: 10,
    dexterity: 10,
    constitution: 14,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hitPoints: 12,
    armorClass: 10,
};

const itemHpModifier: Modifier = {
    id: "item-amulet-stat-hitPoints",
    stat: "hitPoints",
    operation: "add",
    value: 5,
    source: { type: "item", id: "amulet-of-vitality" },
    duration: { type: "permanent" },
    stacking: "stack",
    priority: 0,
};

describe("syncResourceHpToResolvedMax", () => {
    it("sets hp to resolved max when hp was auto-filled at base max", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 12, hp: 12 },
            baseStats,
            [itemHpModifier]
        );

        expect(synced.hp).toBe(17);
    });

    it("sets hp to resolved max when hp is empty", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 12, hp: undefined },
            baseStats,
            [itemHpModifier]
        );

        expect(synced.hp).toBe(17);
    });

    it("preserves manual current hp below base max", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 99, hp: 50 },
            { ...baseStats, hitPoints: 99 },
            [itemHpModifier]
        );

        expect(synced.hp).toBe(50);
    });

    it("preserves damaged hp when resolved max increases", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 12, hp: 8 },
            baseStats,
            [itemHpModifier]
        );

        expect(synced.hp).toBe(8);
    });

    it("clamps current hp when resolved max decreases", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 17, hp: 17 },
            baseStats,
            []
        );

        expect(synced.hp).toBe(12);
    });

    it("preserves damaged hp when resolved max decreases but current is below new max", () => {
        const synced = syncResourceHpToResolvedMax(
            { maxHp: 17, hp: 8 },
            baseStats,
            []
        );

        expect(synced.hp).toBe(8);
    });
});
