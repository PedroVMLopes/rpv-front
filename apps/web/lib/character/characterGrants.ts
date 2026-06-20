import type { CharacterGrant, Locale, Modifier, ModifierSource, ModifierSourceType } from "@rpv/domain";
import {
    choiceGrantToCharacterGrant,
    countLanguageChoices,
    fixedGrantsToCharacterGrants,
    getBackgroundGrants,
    getItemGrants,
    getClassGrants,
    getLanguage,
    getSpell,
    dndRaceLevelGrants,
    statModifierGrantsToModifiers,
    type Grant,
} from "@rpv/content";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import type { CharacterSelections } from "./storedCharacter";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "./grantChoices";

export function collectGrantSources(
    selections: CharacterSelections,
    locale: Locale
): Array<{ source: ModifierSource; grants: Grant[] }> {
    const sources: Array<{ source: ModifierSource; grants: Grant[] }> = [];

    if (selections.race) {
        const race = getRace(selections.race, locale);
        const raceLevelGrants = dndRaceLevelGrants[selections.race] ?? [];
        const traitGrants = race?.traits.flatMap((trait) => trait.grants) ?? [];

        sources.push({
            source: { type: "race", id: selections.race },
            grants: [...raceLevelGrants, ...traitGrants],
        });
    }

    if (selections.subrace) {
        const subrace = getSubrace(selections.subrace, locale);
        if (subrace) {
            sources.push({
                source: { type: "race", id: selections.subrace },
                grants: subrace.traits.flatMap((trait) => trait.grants),
            });
        }
    }

    if (selections.background) {
        sources.push({
            source: { type: "background", id: selections.background },
            grants: getBackgroundGrants(selections.background),
        });
    }

    for (const itemSlug of selections.items ?? []) {
        sources.push({
            source: { type: "item", id: itemSlug },
            grants: getItemGrants(itemSlug),
        });
    }

    if (selections.characterClass) {
        sources.push({
            source: { type: "class", id: selections.characterClass },
            grants: getClassGrants(selections.characterClass),
        });
    }

    return sources;
}

export function getFixedRefsForGrantType(
    selections: CharacterSelections,
    locale: Locale,
    grantType: Grant["grantType"]
): Set<string> {
    const refs = new Set<string>();
    const sources = collectGrantSources(selections, locale);

    for (const entry of sources) {
        for (const grant of entry.grants) {
            if (grant.choose !== 0 || grant.grantType !== grantType) {
                continue;
            }

            for (const option of grant.options ?? []) {
                refs.add(option.ref);
            }
        }
    }

    return refs;
}

export const STAT_MODIFIER_SOURCE_TYPES: ModifierSourceType[] = ["item", "feat"];

export function deriveStatModifiers(
    selections: CharacterSelections,
    locale: Locale
): Modifier[] {
    return collectGrantSources(selections, locale)
        .filter((entry) =>
            STAT_MODIFIER_SOURCE_TYPES.includes(entry.source.type)
        )
        .flatMap((entry) =>
            statModifierGrantsToModifiers(entry.grants, entry.source)
        );
}

function resolveChoiceGrant(
    pending: PendingChoiceGrant,
    ref: string,
    locale: Locale
): CharacterGrant | null {
    const name =
        pending.grant.grantType === "language"
            ? getLanguage(ref)?.name
            : pending.grant.grantType === "spell"
              ? getSpell(ref, locale)?.name
              : ref;

    return choiceGrantToCharacterGrant(
        pending.grant,
        pending.source,
        pending.key,
        ref,
        name
    );
}

function resolveChoiceGrants(
    selections: CharacterSelections,
    locale: Locale
): CharacterGrant[] {
    const grantPicks =
        (selections.choices.grantPicks as Record<string, string> | undefined) ??
        {};
    const pending = collectPendingChoiceGrants(selections, locale);
    const resolved: CharacterGrant[] = [];

    for (const choice of pending) {
        const ref = grantPicks[choice.key];
        if (!ref) {
            continue;
        }

        const grant = resolveChoiceGrant(choice, ref, locale);
        if (grant) {
            resolved.push(grant);
        }
    }

    return resolved;
}

export function getLanguageBudget(
    selections: CharacterSelections,
    locale: Locale
): number {
    const sources = collectGrantSources(selections, locale);
    const allGrants = sources.flatMap((entry) => entry.grants);
    return countLanguageChoices(allGrants);
}

export function getFixedLanguageGrants(
    selections: CharacterSelections,
    locale: Locale
): CharacterGrant[] {
    const sources = collectGrantSources(selections, locale);
    const grants: CharacterGrant[] = [];

    for (const entry of sources) {
        const languageGrants = entry.grants.filter(
            (grant) => grant.grantType === "language" && grant.choose === 0
        );
        grants.push(
            ...fixedGrantsToCharacterGrants(languageGrants, entry.source).map(
                (grant) => ({
                    ...grant,
                    name: getLanguage(grant.ref)?.name ?? grant.name,
                })
            )
        );
    }

    return grants;
}

export function deriveCharacterGrants(
    selections: CharacterSelections,
    locale: Locale
): CharacterGrant[] {
    const sources = collectGrantSources(selections, locale);
    const fixedGrants = sources.flatMap((entry) =>
        fixedGrantsToCharacterGrants(entry.grants, entry.source).map((grant) => {
            if (grant.kind === "language") {
                return {
                    ...grant,
                    name: getLanguage(grant.ref)?.name ?? grant.name,
                };
            }

            if (grant.kind === "spell") {
                return {
                    ...grant,
                    name: getSpell(grant.ref, locale)?.name ?? grant.name,
                };
            }

            return grant;
        })
    );

    const choiceGrants = resolveChoiceGrants(selections, locale);

    return [...fixedGrants, ...choiceGrants];
}
