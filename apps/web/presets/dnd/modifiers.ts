import type { Modifier } from "@rpv/domain";

export const exampleRaceModifiers: Modifier[] = [
    {
        id: "race-human-str",
        stat: "strength",
        operation: "add",
        value: 1,
        source: { type: "race", id: "human" },
        duration: { type: "permanent" },
        stacking: "stack",
        priority: 0,
    },
];

export const exampleClassModifiers: Modifier[] = [
    {
        id: "class-fighter-hp",
        stat: "hitPoints",
        operation: "add",
        value: 2,
        source: { type: "class", id: "fighter" },
        duration: { type: "permanent" },
        stacking: "stack",
        priority: 0,
    },
];

export function getDefaultModifiersForCreation(): Modifier[] {
    return [...exampleRaceModifiers, ...exampleClassModifiers];
}
