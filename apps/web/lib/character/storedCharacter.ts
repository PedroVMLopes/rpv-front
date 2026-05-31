import type { BaseStats, CharacterType, Modifier } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type StoredCharacter = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    name: string;
    baseStats: BaseStats;
    modifiers: Modifier[];
    resources: Record<string, number>;
    systemData: Record<string, unknown>;
};
