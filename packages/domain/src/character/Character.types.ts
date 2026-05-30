import { Modifier } from "../modifiers/modifier.types";
import { Stats } from "../modifiers/modifier.resolver";

export type CharacterId = string;
export type CharacterType = "player" | "enemy" | "npc";
export type BaseStats = Stats;

export interface CharacterProps {
    id: CharacterId;
    type: CharacterType;
    name: string;
    baseStats: BaseStats;
    modifiers: Modifier[];
}
