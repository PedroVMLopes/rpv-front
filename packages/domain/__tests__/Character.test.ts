import { Character, Modifier, Stats } from "../src";

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

const defaultProps = {
    id: "char-1",
    type: "player" as const,
    name: "Test Hero",
    baseStats,
    modifiers: [] as Modifier[],
};

describe("Character", () => {
    it("returns base stats when no modifiers", () => {
        const character = Character.create(defaultProps);

        expect(character.getResolvedStats()).toEqual(baseStats);
    });

    it("addModifier returns a new instance with the modifier", () => {
        const character = Character.create(defaultProps);
        const modifier = createModifier({
            id: "str-boost",
            stat: "strength",
            operation: "add",
            value: 2,
        });

        const updated = character.addModifier(modifier);

        expect(character.getModifiers()).toHaveLength(0);
        expect(updated.getModifiers()).toHaveLength(1);
        expect(updated.getResolvedStats().strength).toBe(12);
    });

    it("removeModifier returns a new instance without the modifier", () => {
        const modifier = createModifier({
            id: "str-boost",
            stat: "strength",
            operation: "add",
            value: 2,
        });
        const character = Character.create({
            ...defaultProps,
            modifiers: [modifier],
        });

        const updated = character.removeModifier("str-boost");

        expect(character.getModifiers()).toHaveLength(1);
        expect(updated.getModifiers()).toHaveLength(0);
        expect(updated.getResolvedStats().strength).toBe(10);
    });

    it("getResolvedStats delegates to resolveStats", () => {
        const character = Character.create({
            ...defaultProps,
            modifiers: [
                createModifier({
                    stat: "armorClass",
                    operation: "add",
                    value: 3,
                }),
            ],
        });

        expect(character.getResolvedStats().armorClass).toBe(13);
    });
});
