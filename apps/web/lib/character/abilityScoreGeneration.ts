import type { ZodObject, ZodRawShape } from "zod";
import type {
    AbilityGenerationConfig,
    AbilityScoreMethod,
    PresetAbilityAttribute,
    PresetStatConfig,
} from "@/presets/types";
import { readLevelFromForm } from "./level";

export const UNASSIGNED_ABILITY_VALUE = 0;

export function defaultAbilityScoreMethodForLevel(
    level: number
): AbilityScoreMethod {
    return level === 1 ? "standard-array" : "manual";
}

export function shouldShowMigrationHint(
    level: number,
    method: AbilityScoreMethod
): boolean {
    return level > 1 && method === "manual";
}

export type AttributeEntry = { name: string; value?: number };

export function pointBuyCost(
    score: number,
    config: AbilityGenerationConfig["pointBuy"]
): number {
    return config.cost[score] ?? 0;
}

export function readAttributeValues(
    attributes: AttributeEntry[] | undefined,
    abilities: PresetAbilityAttribute[]
): number[] {
    const byName = new Map(
        (attributes ?? []).map((entry) => [entry.name, entry.value ?? 0])
    );

    return abilities.map(
        (ability) => byName.get(ability.name) ?? UNASSIGNED_ABILITY_VALUE
    );
}

export function pointBuySpent(
    values: number[],
    config: AbilityGenerationConfig["pointBuy"]
): number {
    return values.reduce((total, value) => total + pointBuyCost(value, config), 0);
}

export function pointBuyRemaining(
    values: number[],
    config: AbilityGenerationConfig["pointBuy"]
): number {
    return config.budget - pointBuySpent(values, config);
}

export function isPointBuyValid(
    values: number[],
    config: AbilityGenerationConfig["pointBuy"]
): boolean {
    if (values.some((value) => value < config.min || value > config.max)) {
        return false;
    }

    return pointBuySpent(values, config) <= config.budget;
}

export function standardArrayParkingValue(
    config: Pick<AbilityGenerationConfig, "standardArray">
): number {
    return Math.min(...config.standardArray);
}

export function isStandardArrayValid(
    values: number[],
    config: AbilityGenerationConfig
): boolean {
    if (values.some((value) => value === UNASSIGNED_ABILITY_VALUE)) {
        return false;
    }

    const expected = [...config.standardArray].sort((a, b) => a - b);
    const actual = [...values].sort((a, b) => a - b);

    return (
        expected.length === actual.length &&
        expected.every((value, index) => value === actual[index])
    );
}

export function hasStandardArrayOutOfPoolValue(
    values: number[],
    config: Pick<AbilityGenerationConfig, "standardArray">
): boolean {
    const pool = new Set(config.standardArray);
    return values.some(
        (value) =>
            value !== UNASSIGNED_ABILITY_VALUE && !pool.has(value)
    );
}

/**
 * Assigns a standard-array score to one ability index.
 * Values already held elsewhere swap with that ability.
 */
export function assignStandardArrayScore(
    values: number[],
    index: number,
    next: number
): number[] {
    if (values[index] === next) {
        return values;
    }

    const otherIndex = values.findIndex(
        (value, valueIndex) => valueIndex !== index && value === next
    );

    if (otherIndex === -1) {
        return values.map((value, valueIndex) =>
            valueIndex === index ? next : value
        );
    }

    return values.map((value, valueIndex) => {
        if (valueIndex === index) {
            return next;
        }
        if (valueIndex === otherIndex) {
            return values[index]!;
        }
        return value;
    });
}

/**
 * Assigns a rolled score. Duplicate pool values can be held by multiple abilities
 * until the pool count is exhausted; only then does a pick swap with another owner.
 */
export function assignRollScore(
    values: number[],
    index: number,
    next: number,
    pool: number[]
): number[] {
    if (values[index] === next) {
        return values;
    }

    const poolCount = pool.filter((value) => value === next).length;
    const usedElsewhere = values.filter(
        (value, valueIndex) => valueIndex !== index && value === next
    ).length;

    if (usedElsewhere < poolCount) {
        return values.map((value, valueIndex) =>
            valueIndex === index ? next : value
        );
    }

    return assignStandardArrayScore(values, index, next);
}

function countValues(values: number[]): Map<number, number> {
    const counts = new Map<number, number>();
    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
}

export function isRollValid(
    values: number[],
    rolls: number[] | undefined,
    config: AbilityGenerationConfig
): boolean {
    if (!rolls || rolls.length !== config.roll.count) {
        return false;
    }

    if (values.some((value) => value === UNASSIGNED_ABILITY_VALUE)) {
        return false;
    }

    const rollCounts = countValues(rolls);
    const valueCounts = countValues(values);

    if (rollCounts.size !== valueCounts.size) {
        return false;
    }

    for (const [value, count] of valueCounts) {
        if (rollCounts.get(value) !== count) {
            return false;
        }
    }

    return true;
}

export function rollAbilityScore(
    config: AbilityGenerationConfig["roll"],
    rng: () => number = Math.random
): number {
    const rolls = Array.from({ length: config.dice }, () =>
        Math.floor(rng() * config.sides) + 1
    );
    rolls.sort((a, b) => a - b);

    return rolls.slice(config.drop).reduce((total, value) => total + value, 0);
}

export function rollAbilityPool(
    config: AbilityGenerationConfig,
    rng: () => number = Math.random
): number[] {
    return Array.from({ length: config.roll.count }, () =>
        rollAbilityScore(config.roll, rng)
    ).sort((a, b) => b - a);
}

export function getMethodDefaults(
    method: AbilityScoreMethod,
    abilities: PresetAbilityAttribute[],
    statConfig: Pick<PresetStatConfig, "defaultAbilityValue" | "abilityGeneration">
): AttributeEntry[] {
    const generation = statConfig.abilityGeneration;
    const defaultValue =
        method === "point-buy" && generation
            ? generation.pointBuy.min
            : method === "standard-array" && generation
              ? standardArrayParkingValue(generation)
              : method === "manual"
                ? statConfig.defaultAbilityValue
                : UNASSIGNED_ABILITY_VALUE;

    return abilities.map((ability) => ({
        name: ability.name,
        value: defaultValue,
    }));
}

function readAbilityScoreMethod(
    formData: Record<string, unknown>
): AbilityScoreMethod {
    const method = formData.abilityScoreMethod;
    if (
        method === "manual" ||
        method === "standard-array" ||
        method === "point-buy" ||
        method === "roll"
    ) {
        return method;
    }

    return defaultAbilityScoreMethodForLevel(readLevelFromForm(formData));
}

export function isAbilityScoresIncomplete(
    formData: Record<string, unknown>,
    statConfig: PresetStatConfig
): boolean {
    const generation = statConfig.abilityGeneration;
    if (!generation) {
        return false;
    }

    const method = readAbilityScoreMethod(formData);
    if (method === "manual") {
        return false;
    }

    const values = readAttributeValues(
        formData.attributes as AttributeEntry[] | undefined,
        statConfig.abilities
    );

    if (method === "standard-array") {
        return !isStandardArrayValid(values, generation);
    }

    return values.some((value) => value === UNASSIGNED_ABILITY_VALUE);
}

export function validateAbilityScoresForMethod(
    formData: Record<string, unknown>,
    statConfig: PresetStatConfig
): string | null {
    const generation = statConfig.abilityGeneration;
    if (!generation) {
        return null;
    }

    const method = readAbilityScoreMethod(formData);
    const values = readAttributeValues(
        formData.attributes as AttributeEntry[] | undefined,
        statConfig.abilities
    );

    if (method === "manual") {
        return null;
    }

    if (method === "standard-array") {
        if (isStandardArrayValid(values, generation)) {
            return null;
        }

        // Incomplete / multi-parking assignments are soft-pending, not hard errors.
        if (hasStandardArrayOutOfPoolValue(values, generation)) {
            return "standardArrayInvalid";
        }

        return null;
    }

    if (values.some((value) => value === UNASSIGNED_ABILITY_VALUE)) {
        return null;
    }

    if (method === "point-buy") {
        return isPointBuyValid(values, generation.pointBuy)
            ? null
            : "pointBuyInvalid";
    }

    if (method === "roll") {
        const rolls = formData.abilityScoreRolls as number[] | undefined;
        return isRollValid(values, rolls, generation) ? null : "rollInvalid";
    }

    return null;
}

export function applyAbilityScoreValidation<T extends ZodRawShape>(
    schema: ZodObject<T>,
    statConfig: PresetStatConfig
) {
    return schema.superRefine((data, ctx) => {
        const errorKey = validateAbilityScoresForMethod(
            data as Record<string, unknown>,
            statConfig
        );

        if (errorKey) {
            ctx.addIssue({
                code: "custom",
                path: ["attributes"],
                message: errorKey,
            });
        }
    });
}
