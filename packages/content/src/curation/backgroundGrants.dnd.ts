import type { Grant } from "../grant/grant.types";

export interface BackgroundEntry {
    slug: string;
    name: string;
    description: string;
    grants: Grant[];
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
                ref: "scroll-of-fire-bolt",
                amount: 1,
                description: "A scholarly scroll for note-taking.",
            },
        ],
    },
];

export function getBackground(slug: string): BackgroundEntry | undefined {
    return dndBackgrounds.find((entry) => entry.slug === slug);
}

export function listBackgrounds(): BackgroundEntry[] {
    return dndBackgrounds;
}

export function getBackgroundGrants(slug: string): Grant[] {
    return getBackground(slug)?.grants ?? [];
}