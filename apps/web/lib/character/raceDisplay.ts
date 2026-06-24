import type { CatalogTrait, RaceCatalogEntry, SubraceCatalogEntry } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import type { CharacterSelections } from "./storedCharacter";

export type RaceTraitDisplay = {
    slug: string;
    name: string;
    description: string;
};

export type UnresolvedChoiceDisplay = {
    traitName: string;
    description?: string;
    choose: number;
};

function stripMarkdown(value: string): string {
    return value
        .replace(/\*\*_/g, "")
        .replace(/_\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/_/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function collectTraits(traits: CatalogTrait[]): RaceTraitDisplay[] {
    return traits
        .filter(
            (trait) =>
                trait.category !== "ability_score" &&
                !trait.grants.some((grant) => grant.choose > 0)
        )
        .map((trait) => ({
            slug: trait.slug,
            name: trait.name,
            description: stripMarkdown(trait.description),
        }));
}

function collectUnresolvedChoices(traits: CatalogTrait[]): UnresolvedChoiceDisplay[] {
    const choices: UnresolvedChoiceDisplay[] = [];

    for (const trait of traits) {
        for (const grant of trait.grants) {
            if (grant.choose > 0) {
                choices.push({
                    traitName: trait.name,
                    description: grant.description ?? trait.description,
                    choose: grant.choose,
                });
            }
        }
    }

    return choices;
}

export function resolveRaceDisplayName(
    raceSlug: string | undefined,
    locale: Locale
): string | undefined {
    if (!raceSlug) {
        return undefined;
    }

    return getRace(raceSlug, locale)?.name ?? raceSlug;
}

export function resolveSubraceDisplayName(
    subraceSlug: string | undefined,
    locale: Locale
): string | undefined {
    if (!subraceSlug) {
        return undefined;
    }

    return getSubrace(subraceSlug, locale)?.name ?? subraceSlug;
}

export function getRaceLineFromSelections(
    selections: CharacterSelections | undefined,
    locale: Locale
): string {
    const raceName = resolveRaceDisplayName(selections?.race, locale);
    const subraceName = resolveSubraceDisplayName(selections?.subrace, locale);

    return [raceName, subraceName].filter(Boolean).join(" · ");
}

function visionTraitFromRace(race: RaceCatalogEntry | undefined): RaceTraitDisplay | null {
    if (!race?.visionDesc?.trim()) {
        return null;
    }

    return {
        slug: "vision",
        name: "Darkvision",
        description: stripMarkdown(race.visionDesc),
    };
}

export function getRaceTraitDisplay(
    selections: CharacterSelections | undefined,
    locale: Locale
): {
    traits: RaceTraitDisplay[];
    unresolvedChoices: UnresolvedChoiceDisplay[];
} {
    const race = selections?.race ? getRace(selections.race, locale) : undefined;
    const subrace = selections?.subrace
        ? getSubrace(selections.subrace, locale)
        : undefined;

    const traits: RaceTraitDisplay[] = [];
    const vision = visionTraitFromRace(race);
    if (vision) {
        traits.push(vision);
    }

    if (race) {
        traits.push(...collectTraits(race.traits));
    }

    if (subrace) {
        traits.push(...collectTraits(subrace.traits));
    }

    const unresolvedChoices = [
        ...(race ? collectUnresolvedChoices(race.traits) : []),
        ...(subrace ? collectUnresolvedChoices(subrace.traits) : []),
    ];

    return { traits, unresolvedChoices };
}

export function formatUnresolvedChoice(choice: UnresolvedChoiceDisplay): string {
    const description = choice.description
        ? stripMarkdown(choice.description)
        : choice.traitName;

    return `${description} (${choice.choose} to choose)`;
}
