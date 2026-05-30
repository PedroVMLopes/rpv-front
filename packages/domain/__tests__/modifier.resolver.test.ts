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
