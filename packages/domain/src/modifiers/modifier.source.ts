export type ModifierSourceType =
    | "race"
    | "class"
    | "item"
    | "background"
    | "spell"
    | "condition"
    | "feat"
    | "system";

export interface ModifierSource {
    type: ModifierSourceType;
    id: string;
}