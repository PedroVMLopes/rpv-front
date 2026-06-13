import type { Grant } from "../grant/grant.types";
import type { TraitCategory } from "../race/race.types";

export interface TraitOverride {
    category?: TraitCategory;
    grants: Grant[];
}

/**
 * Fixed grants at the race level (Open5e stores languages outside trait blocks).
 */
export const dndRaceLevelGrants: Record<string, Grant[]> = {
    elf: [
        {
            grantType: "language",
            choose: 0,
            options: [
                { optionType: "language", ref: "common" },
                { optionType: "language", ref: "elvish" },
            ],
        },
    ],
    dwarf: [
        {
            grantType: "language",
            choose: 0,
            options: [
                { optionType: "language", ref: "common" },
                { optionType: "language", ref: "dwarvish" },
            ],
        },
    ],
};

/**
 * Hand-curated structured grants that Open5e's free-text traits cannot express.
 * Keyed by source slug (race or subrace) and then by parsed trait slug.
 */
export const dndRaceGrantOverrides: Record<
    string,
    Record<string, TraitOverride>
> = {
    elf: {
        "keen-senses": {
            category: "proficiency",
            grants: [
                {
                    grantType: "skill_proficiency",
                    choose: 0,
                    options: [{ optionType: "skill", ref: "perception" }],
                },
            ],
        },
        "fey-ancestry": {
            category: "resistance",
            grants: [
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Fey Ancestry",
                },
            ],
        },
    },
    "high-elf": {
        "elf-weapon-training": {
            category: "proficiency",
            grants: [
                {
                    grantType: "weapon_proficiency",
                    choose: 0,
                    options: [
                        { optionType: "proficiency", ref: "longsword" },
                        { optionType: "proficiency", ref: "shortsword" },
                        { optionType: "proficiency", ref: "shortbow" },
                        { optionType: "proficiency", ref: "longbow" },
                    ],
                },
            ],
        },
        cantrip: {
            category: "spellcasting",
            grants: [
                {
                    grantType: "spell",
                    choose: 1,
                    selectionFilter: { spellLists: ["wizard"], levelInt: 0 },
                    description:
                        "One cantrip of your choice from the wizard spell list.",
                },
            ],
        },
        "extra-language": {
            category: "language",
            grants: [
                {
                    grantType: "language",
                    choose: 1,
                    selectionFilter: { any: true },
                },
            ],
        },
    },
    dwarf: {
        "dwarven-resilience": {
            category: "resistance",
            grants: [
                {
                    grantType: "ability",
                    choose: 0,
                    description: "Dwarven Resilience",
                },
            ],
        },
        "dwarven-combat-training": {
            category: "proficiency",
            grants: [
                {
                    grantType: "weapon_proficiency",
                    choose: 0,
                    options: [
                        { optionType: "proficiency", ref: "battleaxe" },
                        { optionType: "proficiency", ref: "handaxe" },
                        { optionType: "proficiency", ref: "light-hammer" },
                        { optionType: "proficiency", ref: "warhammer" },
                    ],
                },
            ],
        },
        "tool-proficiency": {
            category: "proficiency",
            grants: [
                {
                    grantType: "tool_proficiency",
                    choose: 1,
                    options: [
                        { optionType: "proficiency", ref: "smiths-tools" },
                        { optionType: "proficiency", ref: "brewers-supplies" },
                        { optionType: "proficiency", ref: "masons-tools" },
                    ],
                },
            ],
        },
    },
    "hill-dwarf": {
        "dwarven-toughness": { category: "other", grants: [] },
    },
};
