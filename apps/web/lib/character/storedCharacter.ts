import type { BaseStats, CharacterType, Locale, Modifier } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type StoredCharacter = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    /** Language the user authored this character's free text in. */
    language: Locale;
    name: string;
    baseStats: BaseStats;
    modifiers: Modifier[];
    resources: Record<string, number>;
    systemData: Record<string, unknown>;
};
