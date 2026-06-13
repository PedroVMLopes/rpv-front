import { Modifier } from "../modifiers/modifier.types";
import { Stats } from "../modifiers/modifier.resolver";
import type { CharacterGrant } from "../grants/characterGrant.types";
import type { Locale } from "../i18n/locale";

export type CharacterId = string;
export type CharacterType = "player" | "enemy" | "npc";
export type BaseStats = Stats;

export interface CharacterProps {
    id: CharacterId;
    type: CharacterType;
    name: string;
    language?: Locale;
    baseStats: BaseStats;
    modifiers: Modifier[];
    grants?: CharacterGrant[];
}
