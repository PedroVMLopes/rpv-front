import type { ConditionEntry } from "../condition/condition.types";

export const dndConditions: ConditionEntry[] = [
    {
        slug: "blessed",
        name: "Blessed",
        description: "Attack rolls and saving throws gain an extra d4.",
        rollEffects: [
            { kind: "extra_die", sides: 4, appliesTo: ["attack", "save"] },
        ],
    },
    {
        slug: "poisoned",
        name: "Poisoned",
        description: "Disadvantage on attack rolls and ability checks.",
        rollEffects: [
            {
                kind: "disadvantage",
                appliesTo: ["attack", "ability_check"],
            },
        ],
    },
];
