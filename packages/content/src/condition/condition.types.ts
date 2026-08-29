import type { Grant } from "../grant/grant.types";

export type RollEffectAppliesTo = "attack" | "save" | "ability_check";

export type ConditionRollEffect = {
    kind: "extra_die" | "advantage" | "disadvantage";
    /** Die size when `kind` is `extra_die`. */
    sides?: number;
    appliesTo: RollEffectAppliesTo[];
};

export interface ConditionEntry {
    slug: string;
    name: string;
    description?: string;
    grants?: Grant[];
    rollEffects?: ConditionRollEffect[];
}
