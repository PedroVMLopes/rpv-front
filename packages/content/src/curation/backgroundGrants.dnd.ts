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
 * Hand-curated background grants. Representative set for the background
 * source pipeline; remaining PHB/SRD backgrounds are future work.
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
    {
        slug: "guild-artisan",
        name: "Guild Artisan",
        description:
            "You are a member of a craft guild, with a stall, a hall, and a mark that other shops recognize. You know one additional language of your choice.",
        grants: [
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "persuasion" },
                ],
            },
            {
                grantType: "tool_proficiency",
                choose: 1,
                description: "One set of artisan's tools.",
                options: [
                    { optionType: "proficiency", ref: "alchemists-supplies" },
                    { optionType: "proficiency", ref: "brewers-supplies" },
                    { optionType: "proficiency", ref: "calligraphers-supplies" },
                    { optionType: "proficiency", ref: "carpenters-tools" },
                    { optionType: "proficiency", ref: "cartographers-tools" },
                    { optionType: "proficiency", ref: "cobblers-tools" },
                    { optionType: "proficiency", ref: "cooks-utensils" },
                    { optionType: "proficiency", ref: "glassblowers-tools" },
                    { optionType: "proficiency", ref: "jewelers-tools" },
                    { optionType: "proficiency", ref: "leatherworkers-tools" },
                    { optionType: "proficiency", ref: "masons-tools" },
                    { optionType: "proficiency", ref: "painters-supplies" },
                    { optionType: "proficiency", ref: "potters-tools" },
                    { optionType: "proficiency", ref: "smiths-tools" },
                    { optionType: "proficiency", ref: "tinkers-tools" },
                    { optionType: "proficiency", ref: "weavers-tools" },
                    { optionType: "proficiency", ref: "woodcarvers-tools" },
                ],
            },
            {
                grantType: "language",
                choose: 1,
                selectionFilter: { any: true },
                description: "One language of your choice.",
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Guild Membership",
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
                        slug: "guild-artisan-trait-01",
                        label: "I price a job by the grain of the wood before I hear the customer's name.",
                    },
                    {
                        slug: "guild-artisan-trait-02",
                        label: "I keep a scrap of every guild stamp I have ever earned.",
                    },
                    {
                        slug: "guild-artisan-trait-03",
                        label: "I talk with my hands as if I were already at the bench.",
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
                        slug: "guild-artisan-ideal-01",
                        label: "Fair measure: a short count cheats the whole street.",
                    },
                    {
                        slug: "guild-artisan-ideal-02",
                        label: "Make it last: cheap work is a second job waiting to happen.",
                    },
                    {
                        slug: "guild-artisan-ideal-03",
                        label: "The hall first: my guild's name rides on every piece I sell.",
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
                        slug: "guild-artisan-bond-01",
                        label: "The master who signed my papers still has a bench I refuse to disappoint.",
                    },
                    {
                        slug: "guild-artisan-bond-02",
                        label: "I owe a season's wages to the hall that hid me during a bad winter.",
                    },
                    {
                        slug: "guild-artisan-bond-03",
                        label: "A rival shop copied my mark; I will see it taken down.",
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
                        slug: "guild-artisan-flaw-01",
                        label: "I cannot walk past crooked joinery without commenting.",
                    },
                    {
                        slug: "guild-artisan-flaw-02",
                        label: "I undercharge friends until my own ledger bleeds.",
                    },
                    {
                        slug: "guild-artisan-flaw-03",
                        label: "I hoard leftover stock for a better job that never comes.",
                    },
                ],
            },
            {
                slug: "guild-business",
                pickCount: 1,
                roll: "d20",
                allowCustom: true,
                options: [
                    { slug: "guild-business-01", label: "Alchemists" },
                    { slug: "guild-business-02", label: "Brewers" },
                    { slug: "guild-business-03", label: "Calligraphers" },
                    { slug: "guild-business-04", label: "Carpenters" },
                    { slug: "guild-business-05", label: "Cartographers" },
                    { slug: "guild-business-06", label: "Cobblers" },
                    { slug: "guild-business-07", label: "Cooks" },
                    { slug: "guild-business-08", label: "Glassblowers" },
                    { slug: "guild-business-09", label: "Jewelers" },
                    { slug: "guild-business-10", label: "Leatherworkers" },
                    { slug: "guild-business-11", label: "Masons" },
                    { slug: "guild-business-12", label: "Painters" },
                    { slug: "guild-business-13", label: "Potters" },
                    { slug: "guild-business-14", label: "Smiths" },
                    { slug: "guild-business-15", label: "Tinkers" },
                    { slug: "guild-business-16", label: "Weavers" },
                    { slug: "guild-business-17", label: "Woodcarvers" },
                    { slug: "guild-business-18", label: "Armorers" },
                    { slug: "guild-business-19", label: "Shipwrights" },
                    { slug: "guild-business-20", label: "Wheelwrights" },
                ],
            },
        ],
    },
    {
        slug: "charlatan",
        name: "Charlatan",
        description:
            "You live by invented names and borrowed trust. You know how to look like someone else long enough to leave before the questions land.",
        grants: [
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    { optionType: "skill", ref: "deception" },
                    { optionType: "skill", ref: "sleight-of-hand" },
                ],
            },
            {
                grantType: "tool_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "disguise-kit" },
                    { optionType: "proficiency", ref: "forgery-kit" },
                ],
            },
            {
                grantType: "ability",
                choose: 0,
                description: "False Identity",
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
                        slug: "charlatan-trait-01",
                        label: "I invent a name before I invent a reason to be in the room.",
                    },
                    {
                        slug: "charlatan-trait-02",
                        label: "I never correct a rumor that makes me more interesting.",
                    },
                    {
                        slug: "charlatan-trait-03",
                        label: "I watch hands first, faces second.",
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
                        slug: "charlatan-ideal-01",
                        label: "The story sells the truth, not the other way around.",
                    },
                    {
                        slug: "charlatan-ideal-02",
                        label: "Everyone deserves a prettier version of themselves.",
                    },
                    {
                        slug: "charlatan-ideal-03",
                        label: "Never leave a mark that cannot be explained as luck.",
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
                        slug: "charlatan-bond-01",
                        label: "A forged letter still keeps someone I love out of a cell.",
                    },
                    {
                        slug: "charlatan-bond-02",
                        label: "I owe a fence who taught me which seals to copy.",
                    },
                    {
                        slug: "charlatan-bond-03",
                        label: "The first identity I stole still answers mail in a town I cannot visit.",
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
                        slug: "charlatan-flaw-01",
                        label: "I cannot resist a closed drawer.",
                    },
                    {
                        slug: "charlatan-flaw-02",
                        label: "I trust a good costume more than a good plan.",
                    },
                    {
                        slug: "charlatan-flaw-03",
                        label: "I talk until the lie has too many rooms.",
                    },
                ],
            },
            {
                slug: "favorite-scheme",
                pickCount: 1,
                allowCustom: true,
                options: [
                    {
                        slug: "charlatan-scheme-01",
                        label: "A distant heir who needs a modest loan to claim a fortune.",
                    },
                    {
                        slug: "charlatan-scheme-02",
                        label: "A miracle tonic mixed from kitchen spices and confidence.",
                    },
                    {
                        slug: "charlatan-scheme-03",
                        label: "A lost relic I just happen to have found this morning.",
                    },
                ],
            },
        ],
    },
    {
        slug: "hermit",
        name: "Hermit",
        description:
            "You spent years apart from towns and clocks. You know one additional language of your choice.",
        grants: [
            {
                grantType: "skill_proficiency",
                choose: 0,
                options: [
                    { optionType: "skill", ref: "medicine" },
                    { optionType: "skill", ref: "religion" },
                ],
            },
            {
                grantType: "tool_proficiency",
                choose: 0,
                options: [{ optionType: "proficiency", ref: "herbalism-kit" }],
            },
            {
                grantType: "language",
                choose: 1,
                selectionFilter: { any: true },
                description: "One language of your choice.",
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Discovery",
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
                        slug: "hermit-trait-01",
                        label: "I answer questions with a pause long enough to make people fidget.",
                    },
                    {
                        slug: "hermit-trait-02",
                        label: "I keep a scrap of bark in my pocket and worry it when I must speak.",
                    },
                    {
                        slug: "hermit-trait-03",
                        label: "I count days by weather, not by calendars.",
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
                        slug: "hermit-ideal-01",
                        label: "Quiet is a kind of honesty.",
                    },
                    {
                        slug: "hermit-ideal-02",
                        label: "What grows without a name still deserves care.",
                    },
                    {
                        slug: "hermit-ideal-03",
                        label: "The world is loud; I will not add to it without cause.",
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
                        slug: "hermit-bond-01",
                        label: "A cave that kept me through a winter still has my marks on the wall.",
                    },
                    {
                        slug: "hermit-bond-02",
                        label: "I left a question buried under a stone and I am not done answering it.",
                    },
                    {
                        slug: "hermit-bond-03",
                        label: "Someone from the village still leaves food at the tree line.",
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
                        slug: "hermit-flaw-01",
                        label: "I forget that people expect answers on the same day.",
                    },
                    {
                        slug: "hermit-flaw-02",
                        label: "I hoard silence until it becomes unkind.",
                    },
                    {
                        slug: "hermit-flaw-03",
                        label: "I treat every crowd as a storm I must wait out.",
                    },
                ],
            },
            {
                slug: "life-of-seclusion",
                pickCount: 1,
                allowCustom: true,
                options: [
                    {
                        slug: "hermit-seclusion-01",
                        label: "A vow to watch a grove until a promised sign arrived.",
                    },
                    {
                        slug: "hermit-seclusion-02",
                        label: "Illness that made towns feel like too many mouths.",
                    },
                    {
                        slug: "hermit-seclusion-03",
                        label: "A secret I was asked to keep far from anyone who would use it.",
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