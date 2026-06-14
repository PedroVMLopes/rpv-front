import {
    listLanguages,
    resolveGrantPool,
    type Grant,
} from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import { catalog } from "@rpv/content";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import {
    getBackgroundGrants,
    getItemGrants,
    getClassGrants,
    dndRaceLevelGrants,
} from "@rpv/content";
import type { CharacterSelections } from "./storedCharacter";
import type { GrantSourceContext } from "./characterGrants";

export type PendingChoiceGrant = {
    key: string;
    grant: Grant;
    source: ModifierSource;
    label: string;
    options: Array<{ value: string; label: string }>;
};

function expandChoiceGrant(
    grant: Grant,
    source: ModifierSource,
    grantIndex: number,
    traitName: string
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

    const label =
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
            label:
                grant.choose > 1
                    ? `${label} (${slot + 1}/${grant.choose})`
                    : label,
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
    source: ModifierSource
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    grants.forEach((grant, grantIndex) => {
        pending.push(
            ...expandChoiceGrant(grant, source, grantIndex, "")
        );
    });

    return pending;
}

export function collectPendingChoiceGrants(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): PendingChoiceGrant[] {
    const pending: PendingChoiceGrant[] = [];

    if (selections.race) {
        const race = getRace(selections.race, locale);
        const raceLevelGrants = dndRaceLevelGrants[selections.race] ?? [];

        pending.push(
            ...collectFromGrants(raceLevelGrants, {
                type: "race",
                id: selections.race,
            })
        );

        if (race) {
            pending.push(
                ...collectFromTraits(race.traits, {
                    type: "race",
                    id: selections.race,
                })
            );
        }
    }

    if (selections.subrace) {
        const subrace = getSubrace(selections.subrace, locale);
        if (subrace) {
            pending.push(
                ...collectFromTraits(subrace.traits, {
                    type: "race",
                    id: selections.subrace,
                })
            );
        }
    }

    if (context.background) {
        pending.push(
            ...collectFromGrants(
                getBackgroundGrants(context.background),
                { type: "background", id: context.background }
            )
        );
    }

    if (context.startingItem) {
        pending.push(
            ...collectFromGrants(
                getItemGrants(context.startingItem),
                { type: "item", id: context.startingItem }
            )
        );
    }

    if (context.characterClass) {
        pending.push(
            ...collectFromGrants(
                getClassGrants(context.characterClass),
                { type: "class", id: context.characterClass }
            )
        );
    }

    return pending;
}

export function collectLanguageChoiceGrants(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(selections, context, locale).filter(
        (choice) => choice.grant.grantType === "language"
    );
}

export function collectNonLanguageChoiceGrants(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): PendingChoiceGrant[] {
    return collectPendingChoiceGrants(selections, context, locale).filter(
        (choice) => choice.grant.grantType !== "language"
    );
}
