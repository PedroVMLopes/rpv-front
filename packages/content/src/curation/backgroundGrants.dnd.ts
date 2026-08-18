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
    {
        slug: "acolyte",
        name: "Acolyte",
        description:
            "You spent your life in the service of a temple, acting as an intermediary between the holy and the mortal world. You know two additional languages of your choice.",
        grants: [
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "religion" },
                ],
            },
            {
                grantType: "language",
                choose: 2,
                selectionFilter: { any: true },
                description: "Two languages of your choice.",
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Shelter of the Faithful",
            },
        ],
        flavorTables: [
            {
                slug: "personality-traits",
                bindTo: "personalityTraits",
                pickCount: 2,
                roll: "d8",
                allowCustom: true,
                options: [
                    {
                        slug: "acolyte-trait-01",
                        label: "I idolize a particular hero of my faith, and constantly refer to that person's deeds and example.",
                    },
                    {
                        slug: "acolyte-trait-02",
                        label: "I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.",
                    },
                    {
                        slug: "acolyte-trait-03",
                        label: "I see omens in every event and action. The gods try to speak to us, we just need to listen.",
                    },
                    {
                        slug: "acolyte-trait-04",
                        label: "Nothing can shake my optimistic attitude.",
                    },
                    {
                        slug: "acolyte-trait-05",
                        label: "I quote (or misquote) sacred texts and proverbs in almost every situation.",
                    },
                    {
                        slug: "acolyte-trait-06",
                        label: "I am tolerant (or intolerant) of other faiths and respect (or condemn) the worship of other gods.",
                    },
                    {
                        slug: "acolyte-trait-07",
                        label: "I've enjoyed fine food, drink, and high society among my temple's elite. Rough living grates on me.",
                    },
                    {
                        slug: "acolyte-trait-08",
                        label: "I've spent so long in the temple that I have little practical experience dealing with people in the outside world.",
                    },
                ],
            },
            {
                slug: "ideals",
                bindTo: "ideals",
                pickCount: 1,
                roll: "d6",
                allowCustom: true,
                options: [
                    {
                        slug: "acolyte-ideal-01",
                        label: "Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld. (Lawful)",
                    },
                    {
                        slug: "acolyte-ideal-02",
                        label: "Charity. I always try to help those in need, regardless of what it costs me. (Good)",
                    },
                    {
                        slug: "acolyte-ideal-03",
                        label: "Change. We must help bring about the changes the gods are constantly working in the world. (Chaotic)",
                    },
                    {
                        slug: "acolyte-ideal-04",
                        label: "Power. I hope to one day rise to the top of my faith's religious hierarchy. (Lawful)",
                    },
                    {
                        slug: "acolyte-ideal-05",
                        label: "Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well. (Lawful)",
                    },
                    {
                        slug: "acolyte-ideal-06",
                        label: "Aspiration. I seek to prove myself worthy of my god's favor by matching my actions against his or her teachings. (Any)",
                    },
                ],
            },
            {
                slug: "bonds",
                bindTo: "bonds",
                pickCount: 1,
                roll: "d6",
                allowCustom: true,
                options: [
                    {
                        slug: "acolyte-bond-01",
                        label: "I would die to recover an ancient relic of my faith that was lost long ago.",
                    },
                    {
                        slug: "acolyte-bond-02",
                        label: "I will someday get revenge on the corrupt temple hierarchy who branded me a heretic.",
                    },
                    {
                        slug: "acolyte-bond-03",
                        label: "I owe my life to the priest who took me in when my parents died.",
                    },
                    {
                        slug: "acolyte-bond-04",
                        label: "Everything I do is for the common people.",
                    },
                    {
                        slug: "acolyte-bond-05",
                        label: "I will do anything to protect the temple where I served.",
                    },
                    {
                        slug: "acolyte-bond-06",
                        label: "I seek to preserve a sacred text that my enemies consider heretical and seek to destroy.",
                    },
                ],
            },
            {
                slug: "flaws",
                bindTo: "flaws",
                pickCount: 1,
                roll: "d6",
                allowCustom: true,
                options: [
                    {
                        slug: "acolyte-flaw-01",
                        label: "I judge others harshly, and myself even more severely.",
                    },
                    {
                        slug: "acolyte-flaw-02",
                        label: "I put too much trust in those who wield power within my temple's hierarchy.",
                    },
                    {
                        slug: "acolyte-flaw-03",
                        label: "My piety sometimes leads me to blindly trust those that profess faith in my god.",
                    },
                    {
                        slug: "acolyte-flaw-04",
                        label: "I am inflexible in my thinking.",
                    },
                    {
                        slug: "acolyte-flaw-05",
                        label: "I am suspicious of strangers and expect the worst of them.",
                    },
                    {
                        slug: "acolyte-flaw-06",
                        label: "Once I pick a goal, I become obsessed with it to the detriment of everything else.",
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