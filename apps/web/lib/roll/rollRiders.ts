import type {
    ConditionRollEffect,
    RollEffectAppliesTo,
} from "@rpv/content";
import { rollEffectsFor } from "@/lib/character/conditionRollEffects";
import type { RollRequest } from "./rollRequest.types";

export type D20RollMode =
    | "normal"
    | "advantage"
    | "disadvantage"
    | "inspiration";

/** @deprecated Use D20RollMode */
export type AdvantageMode = D20RollMode;

export function appliesToOf(
    request: RollRequest
): RollEffectAppliesTo | undefined {
    if (request.kind === "attack_then_damage") {
        return "attack";
    }

    if (request.kind === "d20_test") {
        return request.appliesTo;
    }

    if (request.kind === "death_save") {
        return "save";
    }

    return undefined;
}

export function defaultAdvantageMode(
    effects: ConditionRollEffect[],
    appliesTo: RollEffectAppliesTo | undefined
): D20RollMode {
    if (!appliesTo) {
        return "normal";
    }

    const matching = rollEffectsFor(effects, appliesTo);
    const hasAdvantage = matching.some((effect) => effect.kind === "advantage");
    const hasDisadvantage = matching.some(
        (effect) => effect.kind === "disadvantage"
    );

    if (hasAdvantage && hasDisadvantage) {
        return "normal";
    }

    if (hasDisadvantage) {
        return "disadvantage";
    }

    if (hasAdvantage) {
        return "advantage";
    }

    return "normal";
}

export function extraDiceSidesFor(
    effects: ConditionRollEffect[],
    appliesTo: RollEffectAppliesTo | undefined
): number[] {
    if (!appliesTo) {
        return [];
    }

    return rollEffectsFor(effects, appliesTo)
        .filter(
            (effect): effect is ConditionRollEffect & { sides: number } =>
                effect.kind === "extra_die" &&
                typeof effect.sides === "number" &&
                effect.sides > 0
        )
        .map((effect) => effect.sides);
}

export function d20Needed(mode: D20RollMode): 1 | 2 {
    return mode === "normal" ? 1 : 2;
}

export function resolvePickMode(mode: D20RollMode): "normal" | "advantage" | "disadvantage" {
    if (mode === "inspiration") {
        return "advantage";
    }

    return mode;
}

export function pickD20(rolls: number[], mode: D20RollMode): number {
    if (rolls.length === 0) {
        return 0;
    }

    const pickMode = resolvePickMode(mode);

    if (pickMode === "advantage") {
        return Math.max(...rolls);
    }

    if (pickMode === "disadvantage") {
        return Math.min(...rolls);
    }

    return rolls[0] ?? 0;
}

export function spendsInspiration(mode: D20RollMode): boolean {
    return mode === "inspiration";
}
