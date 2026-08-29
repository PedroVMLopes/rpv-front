import { dndSavingThrows, dndSkills } from "@rpv/content";
import type { SystemRules } from "../types";
import { dndAcRules } from "./ac";
import { dndInitiative, dndPassivePerception } from "./derived";
import { dndHpRules } from "./hp";
import { dndAbilityModifier, dndProficiencyBonus } from "./math";

/** D&D 5e carrying capacity in pounds (Strength × 15). No movement penalty. */
export function deriveDndCarryingCapacity(strength: number): number {
    return Math.max(0, strength) * 15;
}

export const dndRules: SystemRules = {
    abilityModifier: dndAbilityModifier,
    proficiencyBonus: dndProficiencyBonus,
    hp: dndHpRules,
    ac: dndAcRules,
    carrying: { deriveCapacity: deriveDndCarryingCapacity },
    initiative: dndInitiative,
    passivePerception: dndPassivePerception,
    skills: dndSkills,
    savingThrows: dndSavingThrows,
};
