import type { Grant } from "../grant/grant.types";
import type { FlavorTable } from "./flavorTable.types";

export interface BackgroundEntry {
    slug: string;
    name: string;
    description: string;
    grants: Grant[];
    flavorTables?: FlavorTable[];
}

/**
 * Hand-curated background grants. Small representative set to prove the
 * background source pipeline; full SRD backgrounds are future work.
 */
export const dndBackgrounds: BackgroundEntry[] = [
    {
        slug: "sage",
        name: "Sage",
        description:
            "You spent years learning the lore of the multiverse. You know two additional languages of your choice.",
        grants: [
            {
                grantType: "language",
                choose: 2,
                selectionFilter: { any: true },
                description: "Two languages of your choice.",
            },
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    { optionType: "skill", ref: "arcana" },
                    { optionType: "skill", ref: "history" },
                ],
            },
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "rpv_scroll-of-fire-bolt",
                amount: 1,
                description: "A scholarly scroll for note-taking.",
            },
            {
                grantType: "currency",
                choose: 0,
                ref: "gold",
                amount: 15,
                description: "Belt pouch (pilot fixture).",
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Researcher",
            },
        ],
        flavorTables: [
            {
                slug: "personality-traits",
                bindTo: "personalityTraits",
                pickCount: 2,
                allowCustom: true,
                options: [
                    {
                        slug: "sage-trait-01",
                        label: "I annotate the margins of everything I read, including tavern menus.",
                    },
                    {
                        slug: "sage-trait-02",
                        label: "Silence makes me restless; I fill it with a question.",
                    },
                    {
                        slug: "sage-trait-03",
                        label: "I trust a diagram more than a speech.",
                    },
                ],
            },
            {
                slug: "ideals",
                bindTo: "ideals",
                pickCount: 1,
                allowCustom: true,
                options: [
                    {
                        slug: "sage-ideal-01",
                        label: "Truth first: a beautiful lie is still a lie.",
                    },
                    {
                        slug: "sage-ideal-02",
                        label: "Share what you know; hoarded lore rots.",
                    },
                    {
                        slug: "sage-ideal-03",
                        label: "Method over brilliance.",
                    },
                ],
            },
            {
                slug: "bonds",
                bindTo: "bonds",
                pickCount: 1,
                allowCustom: true,
                options: [
                    {
                        slug: "sage-bond-01",
                        label: "My first teacher's unfinished notes travel with me.",
                    },
                    {
                        slug: "sage-bond-02",
                        label: "I owe a debt to the archive that hid me when I had nowhere else.",
                    },
                    {
                        slug: "sage-bond-03",
                        label: "A rival scholar still has the only copy of a text I need.",
                    },
                ],
            },
            {
                slug: "flaws",
                bindTo: "flaws",
                pickCount: 1,
                allowCustom: true,
                options: [
                    {
                        slug: "sage-flaw-01",
                        label: "I would rather be precise than kind.",
                    },
                    {
                        slug: "sage-flaw-02",
                        label: "Unanswered questions keep me from sleep, and from watch.",
                    },
                    {
                        slug: "sage-flaw-03",
                        label: "I name-drop sources until listeners stop asking.",
                    },
                ],
            },
        ],
    },
];

function resolveBackground(slug: string): BackgroundEntry | undefined {
    return dndBackgrounds.find((entry) => entry.slug === slug);
}

export function getBackgroundGrants(slug: string): Grant[] {
    return resolveBackground(slug)?.grants ?? [];
}