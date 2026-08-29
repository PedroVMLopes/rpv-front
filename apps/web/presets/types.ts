import type { Skill } from "@rpv/content";
import type { StatKey, Stats } from "@rpv/domain";

/**
 * Built-in presets reference UI copy through translation keys (`*Key`) so the
 * label follows the active UI locale. The literal `label` fields are kept
 * optional for user-authored systems (future) that ship their own copy.
 */
export type PresetAbilityAttribute = {
    name: string;
    statKey: StatKey;
    labelKey?: string;
    label?: string;
    shortLabelKey?: string;
    shortLabel?: string;
};

export type PresetCombatStatField = "hp" | "maxHp" | "ac";

export type PresetCombatStat = {
    formFields: PresetCombatStatField[];
    statKey: StatKey;
    labelKey?: string;
    label?: string;
    defaultValue: number;
};

export type PresetResource = {
    name: string;
    labelKey?: string;
    label?: string;
    formField?: string;
    maxStatKey?: StatKey;
    defaultValue: number;
};

export type AbilityScoreMethod =
    | "manual"
    | "standard-array"
    | "point-buy"
    | "roll";

export type AbilityGenerationConfig = {
    methods: AbilityScoreMethod[];
    standardArray: number[];
    pointBuy: {
        budget: number;
        min: number;
        max: number;
        cost: Record<number, number>;
    };
    roll: {
        dice: number;
        sides: number;
        drop: number;
        count: number;
    };
};

export type PresetStatConfig = {
    abilities: PresetAbilityAttribute[];
    combatStats: PresetCombatStat[];
    resources: PresetResource[];
    defaultAbilityValue: number;
    abilityGeneration?: AbilityGenerationConfig;
};

export type HpDerivationContext = {
    level: number;
    /** Resolved Constitution (base + race/item/class ability grants). */
    constitution: number;
    classSlug?: string;
    /** Hit die sides resolved from class data. */
    hitDie?: number;
};

export type HpRules = {
    deriveMaxHp: (ctx: HpDerivationContext) => number | undefined;
    formatBreakdown: (ctx: HpDerivationContext) => string | undefined;
};

export type AcDerivationContext = {
    /** Resolved Dexterity (base + race ASI). */
    dexterity: number;
};

export type AcRules = {
    deriveBaseAc: (ctx: AcDerivationContext) => number | undefined;
    formatBreakdown: (ctx: AcDerivationContext) => string | undefined;
};

export type CarryingRules = {
    /** Maximum carried weight from resolved Strength. Same unit as item weights. */
    deriveCapacity: (strength: number) => number;
};

/**
 * Optional table-vitality tracker (temp HP, death saves, hit dice).
 * Omit when the system has no such bookkeeping.
 */
export type VitalityRules = {
    hitDiceRef: string;
    hitDiceMax: (level: number) => number;
    /** Heal from one hit die. Receives the constitution score (5e uses the modifier). */
    hitDieHeal: (dieRoll: number, constitution: number) => number;
    longRestHitDiceRecover: (current: number, max: number) => number;
};

export interface SystemRules {
    abilityModifier: (score: number) => number;
    proficiencyBonus: (level: number) => number;
    hp: HpRules;
    ac: AcRules;
    /** Optional; omit when the system has no encumbrance numbers. */
    carrying?: CarryingRules;
    /** Optional; omit when the system has no temp HP / death saves / hit dice. */
    vitality?: VitalityRules;
    initiative: (stats: Stats) => number;
    passivePerception: (
        skillModifiers: { slug: string; modifier: number }[]
    ) => number;
    skills: Skill[];
    savingThrows: StatKey[];
}

export interface SystemDefinition {
    id: string;
    name: string;
    characters: { fields: unknown; schema: unknown };
    statConfig: PresetStatConfig;
    rules: SystemRules;
}

export type PresetAttributeField = {
    name: string;
    labelKey?: string;
    label?: string;
};
