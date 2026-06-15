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

export type GrantSourceContext = {
    race?: string;
    subrace?: string;
    background?: string;
    startingItem?: string;
    characterClass?: string;
};

function collectGrantSources(
    selections: CharacterSelections,
    context: GrantSourceContext,
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

    if (context.background) {
        sources.push({
            source: { type: "background", id: context.background },
            grants: getBackgroundGrants(context.background),
        });
    }

    if (context.startingItem) {
        sources.push({
            source: { type: "item", id: context.startingItem },
            grants: getItemGrants(context.startingItem),
        });
    }

    if (context.characterClass) {
        sources.push({
            source: { type: "class", id: context.characterClass },
            grants: getClassGrants(context.characterClass),
        });
    }

    return sources;
}

export const STAT_MODIFIER_SOURCE_TYPES: ModifierSourceType[] = ["item", "feat"];

export function deriveStatModifiers(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): Modifier[] {
    return collectGrantSources(selections, context, locale)
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
    context: GrantSourceContext,
    locale: Locale
): CharacterGrant[] {
    const grantPicks =
        (selections.choices.grantPicks as Record<string, string> | undefined) ??
        {};
    const pending = collectPendingChoiceGrants(selections, context, locale);
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
    context: GrantSourceContext,
    locale: Locale
): number {
    const sources = collectGrantSources(selections, context, locale);
    const allGrants = sources.flatMap((entry) => entry.grants);
    return countLanguageChoices(allGrants);
}

export function getFixedLanguageGrants(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): CharacterGrant[] {
    const sources = collectGrantSources(selections, context, locale);
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
    context: GrantSourceContext,
    locale: Locale
): CharacterGrant[] {
    const sources = collectGrantSources(selections, context, locale);
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

    const choiceGrants = resolveChoiceGrants(selections, context, locale);

    return [...fixedGrants, ...choiceGrants];
}

export function grantContextFromForm(
    formData: Record<string, unknown>
): GrantSourceContext {
    return {
        background:
            typeof formData.background === "string" && formData.background.trim()
                ? formData.background
                : undefined,
        startingItem:
            typeof formData.startingItem === "string" &&
            formData.startingItem.trim()
                ? formData.startingItem
                : undefined,
        characterClass:
            typeof formData.characterClass === "string" &&
            formData.characterClass.trim()
                ? formData.characterClass
                : undefined,
    };
}
