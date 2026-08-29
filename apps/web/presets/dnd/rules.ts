import { dndSavingThrows, dndSkills } from "@rpv/content";
import type { SystemRules, VitalityRules } from "../types";
import { dndAcRules } from "./ac";
import { dndInitiative, dndPassivePerception } from "./derived";
import { dndHpRules } from "./hp";
import { dndAbilityModifier, dndProficiencyBonus } from "./math";

/** D&D 5e carrying capacity in pounds (Strength × 15). No movement penalty. */
export function deriveDndCarryingCapacity(strength: number): number {
    return Math.max(0, strength) * 15;
}

export const dndVitality: VitalityRules = {
    hitDiceRef: "hit-dice",
    hitDiceMax: (level) => {
        if (!Number.isFinite(level) || level < 1) {
            return 0;
        }

        return Math.min(20, Math.floor(level));
    },
    hitDieHeal: (dieRoll, constitution) =>
        Math.max(1, Math.floor(dieRoll) + dndAbilityModifier(constitution)),
    longRestHitDiceRecover: (current, max) => {
        if (max <= 0) {
            return 0;
        }

        const recovered = Math.max(1, Math.floor(max / 2));
        return Math.min(max, Math.max(0, current) + recovered);
    },
};

export const dndRules: SystemRules = {
    abilityModifier: dndAbilityModifier,
    proficiencyBonus: dndProficiencyBonus,
    hp: dndHpRules,
    ac: dndAcRules,
    carrying: { deriveCapacity: deriveDndCarryingCapacity },
    vitality: dndVitality,
    initiative: dndInitiative,
    passivePerception: dndPassivePerception,
    skills: dndSkills,
    savingThrows: dndSavingThrows,
};
