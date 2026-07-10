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

export type SpellRollProfile =
    | { mode: "attack"; damageDice: string; damageType: string }
    | {
          mode: "save";
          saveAbility: StatKey;
          damageDice: string;
          damageType: string;
      };
