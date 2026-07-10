import type { Locale, StatKey } from "@rpv/domain";

export interface SpellCatalogEntry {
    slug: string;
    /** Language this entry's text is authored in. */
    language: Locale;
    name: string;
    levelInt: number;
    level: string;
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    requiresConcentration: boolean;
    canBeCastAsRitual: boolean;
    description: string;
    higherLevel: string;
    spellLists: string[];
    sourceDocument: string;
}

export type SpellTargetKind =
    | "single"
    | "multiple"
    | "area"
    | "self"
    | "touch"
    | "none";

export type SpellActionCostKind =
    | "action"
    | "bonus_action"
    | "reaction"
    | "minute"
    | "hour"
    | "special";

export type SpellUsageKind =
    | "at_will"
    | "spell_slot"
    | { kind: "limited"; period: "short_rest" | "long_rest"; max: number };

export type SpellDisplayMeta = {
    targetKind: SpellTargetKind;
    actionCost?: SpellActionCostKind;
    usageOverride?: SpellUsageKind;
};

export type SpellRollProfile =
    | { mode: "attack"; damageDice: string; damageType: string }
    | {
          mode: "save";
          saveAbility: StatKey;
          damageDice: string;
          damageType: string;
      }
    | {
          mode: "damage_only";
          damageDice: string;
          damageType?: string;
          flatPerDie?: number;
      };
