import { StatKey } from "../stats/statKey";
import { ModifierOperation } from "./modifier.operation";

export interface Modifier {
    stat: StatKey;
    operation: ModifierOperation;
    value: number;
    source: {
        type: "race" | "class" | "item" | "background";
        id: string;
    };
}