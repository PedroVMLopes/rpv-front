import { StatKey } from "../stats/statKey";
import { ModifierDuration } from "./modifier.duration";
import { ModifierOperation } from "./modifier.operation";
import { ModifierSource } from "./modifier.source";
import { ModifierStacking } from "./modifier.stacking";

export interface Modifier {
    id: string;

    stat: StatKey;
    operation: ModifierOperation;
    value: number;

    source: ModifierSource;
    duration: ModifierDuration;
    stacking: ModifierStacking;

    priority: number;
}