import type { StatKey } from "@rpv/domain";
import type { DieSides } from "./diceRoll";

export type RollModifierPart = {
    label: string;
    value: number;
};

export type D20TestRequest = {
    kind: "d20_test";
    id: string;
    label: string;
    die: 20;
    modifier: number;
    breakdown?: RollModifierPart[];
};

export type DamageStep = {
    sides: DieSides;
    flat?: number;
    damageType?: string;
};

export type AttackThenDamageRequest = {
    kind: "attack_then_damage";
    id: string;
    label: string;
    attack: { die: 20; modifier: number };
    damage: DamageStep;
};

export type DamageOnlyRequest = {
    kind: "damage_only";
    id: string;
    label: string;
    saveDc?: number;
    saveAbility?: StatKey;
    steps: DamageStep[];
};

export type RollRequest =
    | D20TestRequest
    | AttackThenDamageRequest
    | DamageOnlyRequest;
