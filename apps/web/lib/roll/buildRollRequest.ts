import type { SavingThrowModifier } from "@/lib/character/savingThrowModifiers";
import type { SkillModifier } from "@/lib/character/skillModifiers";
import type { D20TestRequest } from "./rollRequest.types";

export function buildSkillRollRequest(
    skill: SkillModifier,
    label: string
): D20TestRequest {
    return {
        kind: "d20_test",
        id: `skill:${skill.slug}`,
        label,
        die: 20,
        modifier: skill.modifier,
    };
}

export function buildSavingThrowRollRequest(
    save: SavingThrowModifier,
    label: string
): D20TestRequest {
    return {
        kind: "d20_test",
        id: `save:${save.stat}`,
        label,
        die: 20,
        modifier: save.modifier,
    };
}

export function resolveD20TestTotal(
    request: D20TestRequest,
    dieValue: number
): number {
    return dieValue + request.modifier;
}
