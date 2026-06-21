import {
    listLanguages,
    resolveGrantPool,
    dndRaceLevelGrants,
    type Grant,
} from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import { catalog } from "@rpv/content";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import { collectGrantSources } from "./characterGrants";
import type { CharacterSelections } from "./storedCharacter";

export type PendingChoiceGrant = {
    key: string;
    grant: Grant;
    source: ModifierSource;
    label: string;
    options: Array<{ value: string; label: string }>;
};

function formatChoiceLabel(
    baseLabel: string,
    grant: Grant,
    slot: number,
    featureLevel?: number
): string {
    let label =
        grant.choose > 1 ? `${baseLabel} (${slot + 1}/${grant.choose})` : baseLabel;

    if (featureLevel !== undefined) {
        label = `${label} (Level ${featureLevel})`;
    }

    return label;
}

function expandChoiceGrant(
    grant: Grant,
    source: ModifierSource,
    grantIndex: number,
    traitName: string,
    featureLevel?: number
): PendingChoiceGrant[] {
    if (grant.choose <= 0) {
        return [];
    }

    const pool = resolveGrantPool(grant, {
        spells: catalog.spells,
        languages: listLanguages(),
    });

    let options: Array<{ value: string; label: string }> = [];

    if (pool.languages) {
        options = pool.languages.map((language) => ({
            value: language.slug,
            label: language.name,
        }));
    } else if (pool.spells) {
        options = pool.spells.map((spell) => ({
            value: spell.slug,
            label: spell.name,
        }));
    } else if (pool.options) {
        const skillNames = new Map(
            catalog.skills.map((skill) => [skill.slug, skill.name])
        );
        options = pool.options.map((option) => ({
            value: option.ref,
            label:
                option.optionType === "skill"
                    ? (skillNames.get(option.ref) ?? option.ref)
                    : option.ref,
        }));
    }

    const baseLabel =
        grant.description?.trim() ||
        traitName ||
        `${grant.grantType} choice`;

    const results: PendingChoiceGrant[] = [];

    for (let slot = 0; slot < grant.choose; slot++) {
        const key =
            grant.grantType === "language"
                ? `${source.type}:${source.id}:language:${grantIndex}:${slot}`
                : `${source.type}:${source.id}:${grant.grantType}:${grantIndex}:${slot}`;

        results.push({
            key,
            grant,
            source,
            label: formatChoiceLabel(baseLabel, grant, slot, featureLevel),
            options,
        });
    }

    return results;
}

function collectFromTraits(
    traits: Array<{ name: string; grants: Grant[] }>,
    source: ModifierSource
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    traits.forEach((trait) => {
        trait.grants.forEach((grant, grantIndex) => {
            pending.push(
                ...expandChoiceGrant(
                    grant,
                    source,
                    grantIndex,
                    trait.name
                )
            );
        });
    });

    return pending;
}

function collectFromGrants(
    grants: Grant[],
    source: ModifierSource,
    featureLevel?: number
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    grants.forEach((grant, grantIndex) => {
        pending.push(
            ...expandChoiceGrant(
                grant,
                source,
                grantIndex,
                "",
                featureLevel
            )
        );
    });

    return pending;
}

export function collectPendingChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (
            entry.source.type === "race" &&
            selections.subrace &&
            entry.source.id === selections.subrace
        ) {
            const subrace = getSubrace(selections.subrace, locale);
            if (subrace) {
                pending.push(...collectFromTraits(subrace.traits, entry.source));
            }
            continue;
        }

        if (
            entry.source.type === "race" &&
            selections.race &&
            entry.source.id === selections.race
        ) {
            const raceLevelGrants = dndRaceLevelGrants[selections.race] ?? [];
            pending.push(...collectFromGrants(raceLevelGrants, entry.source));

            const race = getRace(selections.race, locale);
            if (race) {
                pending.push(...collectFromTraits(race.traits, entry.source));
            }
            continue;
        }

        pending.push(
            ...collectFromGrants(
                entry.grants,
                entry.source,
                entry.featureLevel
            )
        );
    }

    return pending;
}

export function collectLanguageChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    ).filter((choice) => choice.grant.grantType === "language");
}

export function collectNonLanguageChoiceGrants(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    ).filter((choice) => choice.grant.grantType !== "language");
}
