import { dndSavingThrows, dndSkills } from "@rpv/content";
import type { SystemRules } from "../types";
import { dndAcRules } from "./ac";
import { dndInitiative, dndPassivePerception } from "./derived";
import { dndHpRules } from "./hp";
import { dndAbilityModifier, dndProficiencyBonus } from "./math";

export const dndRules: SystemRules = {
    abilityModifier: dndAbilityModifier,
    proficiencyBonus: dndProficiencyBonus,
    hp: dndHpRules,
    ac: dndAcRules,
    initiative: dndInitiative,
    passivePerception: dndPassivePerception,
    skills: dndSkills,
    savingThrows: dndSavingThrows,
};
