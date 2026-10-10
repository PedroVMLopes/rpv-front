import type { ConditionEntry } from "../condition/condition.types";

/**
 * SRD condition catalog + table extras (`blessed`, `antitoxin`).
 * `rollEffects` only cover what the roll assistant already understands;
 * other mechanical text stays in `description`.
 */
export const dndConditions: ConditionEntry[] = [
    {
        slug: "blinded",
        name: "Blinded",
        description:
            "Can't see; auto-fail sight-based checks. Attack rolls against the creature have advantage; the creature's attack rolls have disadvantage.",
        rollEffects: [
            { kind: "disadvantage", appliesTo: ["attack"] },
        ],
    },
    {
        slug: "charmed",
        name: "Charmed",
        description:
            "Can't attack the charmer or target them with harmful abilities or magical effects. The charmer has advantage on social ability checks to interact with the creature.",
    },
    {
        slug: "deafened",
        name: "Deafened",
        description: "Can't hear and automatically fails hearing-based checks.",
    },
    {
        slug: "frightened",
        name: "Frightened",
        description:
            "Disadvantage on ability checks and attack rolls while the source of fear is in line of sight. Can't willingly move closer to the source.",
        rollEffects: [
            {
                kind: "disadvantage",
                appliesTo: ["attack", "ability_check"],
            },
        ],
    },
    {
        slug: "grappled",
        name: "Grappled",
        description:
            "Speed becomes 0 and can't benefit from bonuses to speed. Ends if the grappler is incapacitated or if an effect removes the grappled creature from the grappler's reach.",
    },
    {
        slug: "incapacitated",
        name: "Incapacitated",
        description: "Can't take actions or reactions.",
    },
    {
        slug: "invisible",
        name: "Invisible",
        description:
            "Impossible to see without magic or a special sense. Attack rolls against the creature have disadvantage; the creature's attack rolls have advantage. The creature is heavily obscured for hiding.",
        rollEffects: [
            { kind: "advantage", appliesTo: ["attack"] },
        ],
    },
    {
        slug: "paralyzed",
        name: "Paralyzed",
        description:
            "Incapacitated and can't move or speak. Auto-fail Strength and Dexterity saves. Attack rolls against the creature have advantage. Hits from within 5 feet are critical hits.",
    },
    {
        slug: "petrified",
        name: "Petrified",
        description:
            "Transformed to solid inanimate substance; weight increases ×10. Incapacitated, can't move or speak, unaware of surroundings. Attack rolls against the creature have advantage. Auto-fail Strength and Dexterity saves. Resistance to all damage. Immunity to poison and disease.",
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
    {
        slug: "prone",
        name: "Prone",
        description:
            "Only crawl or stand (costs half speed). Disadvantage on attack rolls. Melee attacks against the creature have advantage; ranged attacks have disadvantage.",
        rollEffects: [
            { kind: "disadvantage", appliesTo: ["attack"] },
        ],
    },
    {
        slug: "restrained",
        name: "Restrained",
        description:
            "Speed 0; can't benefit from speed bonuses. Attack rolls against the creature have advantage; the creature's attack rolls have disadvantage. Disadvantage on Dexterity saving throws.",
        rollEffects: [
            { kind: "disadvantage", appliesTo: ["attack", "save"] },
        ],
    },
    {
        slug: "stunned",
        name: "Stunned",
        description:
            "Incapacitated, can't move, and can speak only falteringly. Auto-fail Strength and Dexterity saves. Attack rolls against the creature have advantage.",
    },
    {
        slug: "unconscious",
        name: "Unconscious",
        description:
            "Incapacitated, can't move or speak, unaware of surroundings. Drops held items and falls prone. Auto-fail Strength and Dexterity saves. Attack rolls against the creature have advantage; hits from within 5 feet are critical hits.",
    },
    {
        slug: "blessed",
        name: "Blessed",
        description: "Attack rolls and saving throws gain an extra d4.",
        rollEffects: [
            { kind: "extra_die", sides: 4, appliesTo: ["attack", "save"] },
        ],
    },
    {
        slug: "antitoxin",
        name: "Antitoxin",
        description:
            "Advantage on saving throws against poison for 1 hour. Confers no benefit to undead or constructs.",
        rollEffects: [
            {
                kind: "advantage",
                appliesTo: ["save"],
            },
        ],
    },
];
