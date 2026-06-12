import type {
    Open5eAsiEntry,
    Open5eRace,
    Open5eSubrace,
} from "../open5e/open5e.types";
import type { Grant } from "../grant/grant.types";
import {
    dndRaceGrantOverrides,
    type TraitOverride,
} from "../curation/raceGrants.dnd";
import { ABILITY_NAME_TO_STAT_KEY } from "./ability";
import type {
    CatalogTrait,
    RaceCatalogEntry,
    SubraceCatalogEntry,
} from "./race.types";
import { parseTraitBlocks } from "./trait.parser";

type GrantOverrides = Record<string, Record<string, TraitOverride>>;

function asiToGrants(asi: Open5eAsiEntry[] | undefined): Grant[] {
    const grants: Grant[] = [];

    for (const entry of asi ?? []) {
        for (const attribute of entry.attributes) {
            const stat = ABILITY_NAME_TO_STAT_KEY[attribute];
            if (!stat) {
                continue;
            }
            grants.push({
                grantType: "ability_score",
                choose: 0,
                targetStat: stat,
                amount: entry.value,
            });
        }
    }

    return grants;
}

function buildAsiTrait(
    asiDesc: string,
    asi: Open5eAsiEntry[] | undefined
): CatalogTrait | null {
    const grants = asiToGrants(asi);
    if (grants.length === 0) {
        return null;
    }

    return {
        slug: "ability-score-increase",
        name: "Ability Score Increase",
        description: asiDesc ?? "",
        category: "ability_score",
        grants,
    };
}

function buildTraits(
    markdown: string,
    sourceSlug: string,
    overrides: GrantOverrides
): CatalogTrait[] {
    const sourceOverrides = overrides[sourceSlug] ?? {};

    return parseTraitBlocks(markdown).map((trait) => {
        const override = sourceOverrides[trait.slug];
        return {
            slug: trait.slug,
            name: trait.name,
            description: trait.description,
            category: override?.category ?? "other",
            grants: override?.grants ?? [],
        };
    });
}

function mapSubrace(
    api: Open5eSubrace,
    raceSlug: string,
    overrides: GrantOverrides
): SubraceCatalogEntry {
    const asiTrait = buildAsiTrait(api.asi_desc, api.asi);
    const traits = buildTraits(api.traits, api.slug, overrides);

    return {
        slug: api.slug,
        raceSlug,
        language: "en",
        name: api.name,
        description: api.desc,
        asiDesc: api.asi_desc,
        traits: asiTrait ? [asiTrait, ...traits] : traits,
    };
}

export function mapOpen5eRace(
    api: Open5eRace,
    overrides: GrantOverrides = dndRaceGrantOverrides
): RaceCatalogEntry {
    const asiTrait = buildAsiTrait(api.asi_desc, api.asi);
    const traits = buildTraits(api.traits, api.slug, overrides);

    return {
        slug: api.slug,
        language: "en",
        name: api.name,
        system: "dnd",
        sourceDocument: api.document__slug ?? "",
        description: api.desc,
        size: api.size_raw,
        speedWalk: api.speed?.walk ?? 0,
        languagesDesc: api.languages,
        visionDesc: api.vision,
        asiDesc: api.asi_desc,
        traits: asiTrait ? [asiTrait, ...traits] : traits,
        subraces: (api.subraces ?? []).map((sub) =>
            mapSubrace(sub, api.slug, overrides)
        ),
    };
}
