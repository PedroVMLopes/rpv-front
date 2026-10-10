import type { Locale } from "@rpv/domain";
import { getRace, getSubrace } from "../catalog/bundled";
import ptBRTranslations from "../../data/translations/pt-BR.json";
import type { CatalogTranslations } from "../catalog/catalog.types";

function slugifyFeatureName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/** Pilot SRD summaries for class/subclass ability features (English defaults). */
const dndFeatureDescriptions: Record<string, string> = {
    "action-surge":
        "Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action.",
    rage: "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action.",
    "unarmored-defense":
        "While you are not wearing armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier.",
    "reckless-attack":
        "When you make your first attack on your turn, you can decide to attack recklessly, gaining advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.",
    "danger-sense":
        "You gain an uncanny sense of when things nearby aren't as they should be, giving you advantage on Dexterity saving throws against effects you can see.",
    "extra-attack":
        "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
    "fast-movement":
        "Your speed increases by 10 feet while you aren't wearing heavy armor.",
    "martial-arts":
        "Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons.",
    ki: "Your training allows you to harness mystic energy called ki.",
    "flurry-of-blows":
        "You can spend 1 ki point as a bonus action to make two unarmed strikes.",
    "unarmored-movement":
        "Your speed increases by 10 feet while you are not wearing armor or wielding a shield.",
    "deflect-missiles":
        "You can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack.",
    "stunning-strike":
        "You can interfere with the flow of ki in an opponent's body. When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike.",
    "improved-critical":
        "Your weapon attacks score a critical hit on a roll of 19 or 20.",
    "sculpt-spells":
        "You can create pockets of relative safety within the effects of your evocation spells.",
    frenzy:
        "You can go into a frenzy when you rage for extra melee damage, but you suffer exhaustion when the rage ends.",
    "open-hand-technique":
        "You can manipulate your enemy's ki when you hit them with melee weapon attacks.",
    "slow-fall":
        "You can use your reaction when you fall to reduce falling damage by five times your monk level.",
    "sneak-attack":
        "Once per turn, you can deal extra damage when you hit with a finesse or ranged weapon attack and have advantage, or an ally is within 5 feet of the target.",
    "thieves-cant":
        "You know thieves' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.",
    "cunning-action":
        "You can take a bonus action on each of your turns to Dash, Disengage, or Hide.",
    "uncanny-dodge":
        "When an attacker you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
    "mage-hand-legerdemain":
        "When you cast mage hand, you can make the spectral hand invisible and perform additional sleight-of-hand tasks with it.",
    "improved-minor-illusion":
        "You learn the minor illusion cantrip. If you already know it, you learn a different wizard cantrip. You can create both a sound and an image with a single casting.",
    "channel-divinity":
        "You can channel divine energy to fuel magical effects. You regain expended uses when you finish a short or long rest.",
    "turn-undead":
        "As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear you within 30 feet must make a Wisdom saving throw.",
    "destroy-undead":
        "When an undead fails its saving throw against your Turn Undead, it is instantly destroyed if its challenge rating is low enough for your level.",
    "blessing-of-the-trickster":
        "You can use your action to touch a willing creature other than yourself and give it advantage on Dexterity (Stealth) checks for 1 hour.",
    "invoke-duplicity":
        "As an action, you create an illusory duplicate of yourself that lasts for 1 minute or until you lose concentration.",
    "divine-sense":
        "As an action, you open your awareness to detect strong evil and good. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet.",
    "lay-on-hands":
        "You have a pool of healing power that replenishes when you finish a long rest. As an action, you can touch a creature and restore hit points from the pool.",
    "divine-smite":
        "When you hit a creature with a melee weapon attack, you can expend a spell slot to deal radiant damage in addition to the weapon's damage.",
    "divine-health":
        "The divine magic flowing through you makes you immune to disease.",
    "abjure-enemy":
        "As an action, you present your holy symbol and speak a prayer of denunciation. One creature you can see within 60 feet must make a Wisdom saving throw.",
    "vow-of-enmity":
        "As a bonus action, you utter a vow of enmity against a creature you can see within 10 feet. You gain advantage on attack rolls against the creature for 1 minute.",
    druidic:
        "You know Druidic, the secret language of druids. You can leave hidden messages that only other speakers of Druidic understand.",
    "wild-shape":
        "As an action, you can magically assume the shape of a beast you have seen before. You can use this feature twice, regaining expended uses on a short or long rest.",
    "combat-wild-shape":
        "You can use Wild Shape as a bonus action. While transformed, you can expend a spell slot to regain hit points.",
    "circle-forms":
        "Your Wild Shape forms are more powerful. You can transform into beasts with a higher challenge rating than other druids of your level.",
    "second-wind":
        "On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.",
    researcher:
        "When a question of lore comes up, you know which books, people, or halls to consult. If the answer is not at hand, you can usually find a scholar or archive willing to help you look.",
    "shelter-of-the-faithful":
        "Those who share your faith respect you. You and your companions can receive free healing and care at a temple of your faith, and you have ties to a specific temple you can call on for aid that is not hazardous.",
    "guild-membership":
        "Fellow members of your guild treat you as one of their own. In a town with a chapter hall, you can find modest lodging, introductions, and help that is not a crime.",
    "false-identity":
        "You keep a second, fully prepared identity: papers, habits, and people who will vouch for the name. In a pinch you can step into that life as if it had always been yours.",
    discovery:
        "Years alone taught you something the settled world still argues about. You know where that knowledge lives, and who would rather it stayed buried.",
    grapple:
        "When you take the Attack action, you can replace one attack with a special melee attack to grapple a creature no more than one size larger than you, within your reach, using a free hand. Make a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics).",
    shove:
        "When you take the Attack action, you can replace one attack with a special melee attack to shove a creature no more than one size larger than you, within your reach. On a success, you knock it prone or push it 5 feet away. Make a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics).",
    dash: "When you take the Dash action, you gain extra movement for the current turn equal to your speed, after applying any modifiers.",
    disengage:
        "If you take the Disengage action, your movement doesn't provoke opportunity attacks for the rest of the turn.",
    dodge:
        "Until the start of your next turn, attack rolls against you have disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage. You lose this benefit if you are incapacitated or your speed is 0.",
    help: "The creature you aid gains advantage on the next ability check it makes to perform the task before the start of your next turn. Alternatively, you can distract a creature within 5 feet of you so that the next attack roll an ally makes against it before your next turn has advantage.",
    hide: "When you take the Hide action, you make a Dexterity (Stealth) check in an attempt to hide. If you succeed, you gain the benefits of being hidden.",
    "opportunity-attack":
        "When a hostile creature that you can see moves out of your reach, you can use your reaction to make one melee attack against it. The attack occurs right before the creature leaves your reach.",
    "unarmed-strike":
        "Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow. On a hit, it deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.",
};

function localizedCuratedDescription(
    slug: string,
    locale?: Locale
): string | undefined {
    if (locale && locale !== "en") {
        const overlay = (ptBRTranslations as CatalogTranslations).features?.[
            slug
        ]?.description;
        if (overlay) {
            return overlay;
        }
    }

    return dndFeatureDescriptions[slug];
}

function traitDescriptionForAbility(
    featureName: string,
    sourceId: string,
    locale?: Locale
): string | undefined {
    const race = getRace(sourceId, locale);
    if (race) {
        for (const trait of race.traits) {
            if (
                trait.grants.some(
                    (grant) =>
                        grant.grantType === "ability" &&
                        grant.description === featureName
                )
            ) {
                return trait.description;
            }
        }
    }

    const subrace = getSubrace(sourceId, locale);
    if (subrace) {
        for (const trait of subrace.traits) {
            if (
                trait.grants.some(
                    (grant) =>
                        grant.grantType === "ability" &&
                        grant.description === featureName
                )
            ) {
                return trait.description;
            }
        }
    }

    return undefined;
}

export function getAbilityFeatureName(
    featureName: string,
    locale?: Locale
): string {
    const slug = slugifyFeatureName(featureName);
    if (locale && locale !== "en") {
        const overlayName = (ptBRTranslations as CatalogTranslations).features?.[
            slug
        ]?.name;
        if (overlayName) {
            return overlayName;
        }
    }

    return featureName;
}

export function getAbilityFeatureDescription(
    featureName: string,
    source: { type: string; id: string },
    locale?: Locale
): string | undefined {
    if (source.type === "race") {
        const fromTrait = traitDescriptionForAbility(
            featureName,
            source.id,
            locale
        );
        if (fromTrait) {
            return fromTrait;
        }
    }

    return localizedCuratedDescription(slugifyFeatureName(featureName), locale);
}
