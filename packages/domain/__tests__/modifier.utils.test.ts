import { removeModifiersBySource, type Modifier } from "../src";

function createModifier(
    overrides: Partial<Modifier> & Pick<Modifier, "stat" | "operation" | "value">
): Modifier {
    return {
        id: "mod-1",
        source: { type: "race", id: "elf" },
        duration: { type: "permanent" },
        stacking: "stack",
        priority: 0,
        ...overrides,
    };
}

describe("removeModifiersBySource", () => {
    const modifiers: Modifier[] = [
        createModifier({
            id: "race-elf-dexterity",
            stat: "dexterity",
            operation: "add",
            value: 2,
            source: { type: "race", id: "elf" },
        }),
        createModifier({
            id: "race-hill-dwarf-wisdom",
            stat: "wisdom",
            operation: "add",
            value: 1,
            source: { type: "race", id: "hill-dwarf" },
        }),
        createModifier({
            id: "class-fighter-hp",
            stat: "hitPoints",
            operation: "add",
            value: 2,
            source: { type: "class", id: "fighter" },
        }),
    ];

    it("removes all modifiers matching source type when id is omitted", () => {
        const result = removeModifiersBySource(modifiers, { type: "race" });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("class-fighter-hp");
    });

    it("removes only modifiers matching source type and id", () => {
        const result = removeModifiersBySource(modifiers, {
            type: "race",
            id: "elf",
        });

        expect(result).toHaveLength(2);
        expect(result.map((m) => m.id)).toEqual([
            "race-hill-dwarf-wisdom",
            "class-fighter-hp",
        ]);
    });

    it("leaves modifiers intact when nothing matches", () => {
        const result = removeModifiersBySource(modifiers, {
            type: "race",
            id: "dwarf",
        });

        expect(result).toEqual(modifiers);
    });
});
