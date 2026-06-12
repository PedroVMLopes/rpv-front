import { resolveStats, Modifier, ModifierOperation, Stats } from "../src";

const baseStats: Stats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armorClass: 10,
    hitPoints: 10,
};

function createModifier(
    overrides: Partial<Modifier> & Pick<Modifier, "stat" | "operation" | "value">
): Modifier {
    return {
        id: "mod-1",
        source: { type: "race", id: "test" },
        duration: { type: "permanent" },
        stacking: "stack",
        priority: 0,
        ...overrides,
    };
}

describe("resolveStats", () => {
    it("applies add modifiers correctly", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(12);
    });

    it("applies set modifiers before add", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
                priority: 1,
            }),
            createModifier({
                stat: "strength",
                operation: "set",
                value: 8,
                priority: 0,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(10);
    });

    it("applies multiply before add (order: set → multiply → add → sub)", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
            }),
            createModifier({
                stat: "strength",
                operation: "multiply",
                value: 2,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        // (10 * 2) + 2 = 22, not (10 + 2) * 2
        expect(result.strength).toBe(22);
    });

    it("applies sub after add", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 5,
            }),
            createModifier({
                stat: "strength",
                operation: "sub",
                value: 2,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(13);
    });

    it("sorts by priority within the same operation", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "low-priority",
                stat: "strength",
                operation: "add",
                value: 1,
                priority: 10,
            }),
            createModifier({
                id: "high-priority",
                stat: "strength",
                operation: "add",
                value: 5,
                priority: 0,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(16);
    });

    it("does not mutate baseStats", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
            }),
        ];

        resolveStats(baseStats, modifiers);

        expect(baseStats.strength).toBe(10);
    });

    it.each<ModifierOperation>(["set", "multiply", "add", "sub"])(
        "applies %s operation in isolation",
        (operation) => {
            const valueByOperation: Record<ModifierOperation, number> = {
                set: 15,
                multiply: 2,
                add: 3,
                sub: 2,
            };

            const modifiers: Modifier[] = [
                createModifier({
                    stat: "dexterity",
                    operation,
                    value: valueByOperation[operation],
                }),
            ];

            const result = resolveStats(baseStats, modifiers);

            if (operation === "set") expect(result.dexterity).toBe(15);
            if (operation === "multiply") expect(result.dexterity).toBe(20);
            if (operation === "add") expect(result.dexterity).toBe(13);
            if (operation === "sub") expect(result.dexterity).toBe(8);
        }
    );
});

describe("resolveStats - stacking", () => {
    it("accumulates modifiers that both stack", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "a",
                stat: "armorClass",
                operation: "add",
                value: 1,
                source: { type: "item", id: "ring-a" },
                stacking: "stack",
            }),
            createModifier({
                id: "b",
                stat: "armorClass",
                operation: "add",
                value: 1,
                source: { type: "item", id: "ring-b" },
                stacking: "stack",
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.armorClass).toBe(12);
    });

    it("keeps only the highest within a group for ignore-if-higher", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "low",
                stat: "armorClass",
                operation: "add",
                value: 1,
                source: { type: "item", id: "ring" },
                stacking: "ignore-if-higher",
            }),
            createModifier({
                id: "high",
                stat: "armorClass",
                operation: "add",
                value: 3,
                source: { type: "item", id: "cloak" },
                stacking: "ignore-if-higher",
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        // only +3 applies, +1 is ignored
        expect(result.armorClass).toBe(13);
    });

    it("keeps only the first within a group for ignore-if-duplicate", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "first",
                stat: "strength",
                operation: "add",
                value: 2,
                source: { type: "feat", id: "feat" },
                stacking: "ignore-if-duplicate",
                priority: 0,
            }),
            createModifier({
                id: "second",
                stat: "strength",
                operation: "add",
                value: 5,
                source: { type: "feat", id: "feat" },
                stacking: "ignore-if-duplicate",
                priority: 1,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        // only the first (priority 0) applies
        expect(result.strength).toBe(12);
    });

    it("discards earlier group members when a later modifier replaces", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "old",
                stat: "strength",
                operation: "add",
                value: 2,
                source: { type: "spell", id: "spell" },
                stacking: "replace",
                priority: 0,
            }),
            createModifier({
                id: "new",
                stat: "strength",
                operation: "add",
                value: 7,
                source: { type: "spell", id: "spell" },
                stacking: "replace",
                priority: 1,
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(17);
    });

    it("does not collapse modifiers from different source types", () => {
        const modifiers: Modifier[] = [
            createModifier({
                id: "race",
                stat: "strength",
                operation: "add",
                value: 2,
                source: { type: "race", id: "dwarf" },
                stacking: "ignore-if-higher",
            }),
            createModifier({
                id: "item",
                stat: "strength",
                operation: "add",
                value: 1,
                source: { type: "item", id: "belt" },
                stacking: "ignore-if-higher",
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        // different source types are different groups, so both apply
        expect(result.strength).toBe(13);
    });
});

describe("resolveStats - duration", () => {
    it("ignores conditional modifiers without a matching condition", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 4,
                duration: { type: "conditional", condition: "raging" },
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(10);
    });

    it("applies conditional modifiers when the condition is active", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 4,
                duration: { type: "conditional", condition: "raging" },
            }),
        ];

        const result = resolveStats(baseStats, modifiers, {
            activeConditions: ["raging"],
        });

        expect(result.strength).toBe(14);
    });

    it("treats temporary modifiers as active without elapsed-round tracking", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
                duration: { type: "temporary", rounds: 3 },
            }),
        ];

        const result = resolveStats(baseStats, modifiers);

        expect(result.strength).toBe(12);
    });

    it("expires temporary modifiers once their rounds have elapsed", () => {
        const modifiers: Modifier[] = [
            createModifier({
                stat: "strength",
                operation: "add",
                value: 2,
                duration: { type: "temporary", rounds: 3 },
            }),
        ];

        expect(
            resolveStats(baseStats, modifiers, { elapsedRounds: 2 }).strength
        ).toBe(12);
        expect(
            resolveStats(baseStats, modifiers, { elapsedRounds: 3 }).strength
        ).toBe(10);
    });
});
