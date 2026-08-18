import { getAbilityFeatureDescription } from "@rpv/content";
import type {
    CharacterGrant,
    Locale,
    ModifierSourceType,
} from "@rpv/domain";
import { getRaceTraitDisplay } from "./raceDisplay";
import type { StoredCharacter } from "./storedCharacter";

export type OverviewTrait = {
    id: string;
    name: string;
    description?: string;
    slug?: string;
};

export type OverviewTraitGroup = {
    sourceType: ModifierSourceType;
    traits: OverviewTrait[];
};

const ABILITY_SOURCE_ORDER: ModifierSourceType[] = [
    "class",
    "subclass",
    "background",
    "item",
    "feat",
    "spell",
    "condition",
    "system",
];

function abilityGrantToTrait(
    grant: CharacterGrant,
    locale: Locale
): OverviewTrait {
    const name = grant.name ?? grant.ref;

    return {
        id: grant.id,
        name,
        description: getAbilityFeatureDescription(name, grant.source, locale),
    };
}

export function listOverviewTraitGroups(
    stored: StoredCharacter,
    locale: Locale
): OverviewTraitGroup[] {
    const groups: OverviewTraitGroup[] = [];
    const raceTraits = getRaceTraitDisplay(stored.selections, locale).traits;

    if (raceTraits.length > 0) {
        groups.push({
            sourceType: "race",
            traits: raceTraits.map((trait) => ({
                id: `race:${trait.slug}`,
                slug: trait.slug,
                name: trait.name,
                description: trait.description || undefined,
            })),
        });
    }

    const grants = stored.grants ?? [];

    for (const sourceType of ABILITY_SOURCE_ORDER) {
        const traits = grants
            .filter(
                (grant) =>
                    grant.kind === "ability" && grant.source.type === sourceType
            )
            .map((grant) => abilityGrantToTrait(grant, locale));

        if (traits.length > 0) {
            groups.push({ sourceType, traits });
        }
    }

    return groups;
}
