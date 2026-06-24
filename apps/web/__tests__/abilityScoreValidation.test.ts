import { createDynamicSchema } from "../lib/schema/zodDynamic";
import { applyAbilityScoreValidation } from "../lib/character/abilityScoreGeneration";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";
import { dndStatConfig } from "../presets/dnd/characterStats";

const baseAttributes = dndStatConfig.abilities.map((ability) => ({
    name: ability.name,
    value: 10,
}));

const schema = applyAbilityScoreValidation(
    createDynamicSchema(dndCharacterSchema, "player"),
    dndStatConfig
);

describe("applyAbilityScoreValidation", () => {
    it("passes manual assignments", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "manual",
            attributes: baseAttributes,
        });

        expect(result.success).toBe(true);
    });

    it("passes valid point-buy assignments", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "point-buy",
            attributes: [
                { name: "strength", value: 15 },
                { name: "dexterity", value: 14 },
                { name: "constitution", value: 13 },
                { name: "intelligence", value: 12 },
                { name: "wisdom", value: 10 },
                { name: "charisma", value: 8 },
            ],
        });

        expect(result.success).toBe(true);
    });

    it("fails over-budget point-buy assignments", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "point-buy",
            attributes: [
                { name: "strength", value: 15 },
                { name: "dexterity", value: 15 },
                { name: "constitution", value: 13 },
                { name: "intelligence", value: 12 },
                { name: "wisdom", value: 10 },
                { name: "charisma", value: 8 },
            ],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path[0] === "attributes")).toBe(
                true
            );
        }
    });

    it("fails incomplete standard array assignments", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "standard-array",
            attributes: [
                { name: "strength", value: 15 },
                { name: "dexterity", value: 14 },
                { name: "constitution", value: 0 },
                { name: "intelligence", value: 0 },
                { name: "wisdom", value: 0 },
                { name: "charisma", value: 0 },
            ],
        });

        expect(result.success).toBe(false);
    });

    it("passes complete standard array assignments", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "standard-array",
            attributes: [
                { name: "strength", value: 15 },
                { name: "dexterity", value: 14 },
                { name: "constitution", value: 13 },
                { name: "intelligence", value: 12 },
                { name: "wisdom", value: 10 },
                { name: "charisma", value: 8 },
            ],
        });

        expect(result.success).toBe(true);
    });

    it("fails roll assignments when the pool is not fully assigned", () => {
        const result = schema.safeParse({
            name: "Test Hero",
            abilityScoreMethod: "roll",
            abilityScoreRolls: [16, 14, 13, 12, 11, 9],
            attributes: [
                { name: "strength", value: 16 },
                { name: "dexterity", value: 14 },
                { name: "constitution", value: 0 },
                { name: "intelligence", value: 0 },
                { name: "wisdom", value: 0 },
                { name: "charisma", value: 0 },
            ],
        });

        expect(result.success).toBe(false);
    });
});
