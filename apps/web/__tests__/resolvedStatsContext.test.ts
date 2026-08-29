import { resolveStats } from "@rpv/domain";
import type { Modifier } from "@rpv/domain";
import { getResolvedStatsForCharacter } from "../lib/character/characterAdapter";

const blessStrength: Modifier = {
    id: "condition-blessed-strength",
    stat: "strength",
    operation: "add",
    value: 4,
    source: { type: "condition", id: "blessed" },
    duration: { type: "conditional", condition: "blessed" },
    stacking: "stack",
    priority: 0,
};

const baseStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armorClass: 10,
    hitPoints: 8,
};

describe("resolved stats with ResolveContext", () => {
    it("applies conditional modifiers only when the condition is active", () => {
        expect(resolveStats(baseStats, [blessStrength]).strength).toBe(10);
        expect(
            resolveStats(baseStats, [blessStrength], {
                activeConditions: ["blessed"],
            }).strength
        ).toBe(14);
    });

    it("passes activeConditions through getResolvedStatsForCharacter", () => {
        expect(
            getResolvedStatsForCharacter({
                baseStats,
                modifiers: [blessStrength],
            }).strength
        ).toBe(10);
        expect(
            getResolvedStatsForCharacter(
                { baseStats, modifiers: [blessStrength] },
                undefined,
                undefined,
                [],
                { activeConditions: ["blessed"] }
            ).strength
        ).toBe(14);
    });
});
