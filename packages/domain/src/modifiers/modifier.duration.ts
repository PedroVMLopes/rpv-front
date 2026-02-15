export type ModifierDuration =
    | { type: "permanent" }
    | { type: "temporary"; rounds: number }
    | { type: "conditional"; condition: string };