import type { D20RollMode } from "./rollRiders";

type D20StepContext = "test" | "attack";

export function d20StepTitleKey(
    mode: D20RollMode,
    context: D20StepContext,
    of: number
): string {
    if (of <= 1) {
        return context === "attack" ? "attackStepTitle" : "contextTitle";
    }

    const prefix = context === "attack" ? "attackPairTitle" : "d20PairTitle";

    switch (mode) {
        case "advantage":
            return `${prefix}Advantage`;
        case "disadvantage":
            return `${prefix}Disadvantage`;
        case "inspiration":
            return `${prefix}Inspiration`;
        default:
            return prefix;
    }
}

export function d20ModeHintKey(mode: D20RollMode): string {
    return `modeHint.${mode}`;
}
