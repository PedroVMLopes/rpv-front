import {
    getDamageAffinityForSource,
    type DamageAffinity,
} from "@rpv/content";
import type { CharacterGrant, Locale } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterSelections } from "./storedCharacter";
import { getRaceTraitDisplay } from "./raceDisplay";

export type AggregatedDamageAffinity = {
    resistance: string[];
    immunity: string[];
    vulnerability: string[];
};

function mergeAffinity(
    into: AggregatedDamageAffinity,
    affinity: DamageAffinity | undefined
): void {
    if (!affinity) {
        return;
    }
    for (const type of affinity.resistance ?? []) {
        if (!into.resistance.includes(type)) {
            into.resistance.push(type);
        }
    }
    for (const type of affinity.immunity ?? []) {
        if (!into.immunity.includes(type)) {
            into.immunity.push(type);
        }
    }
    for (const type of affinity.vulnerability ?? []) {
        if (!into.vulnerability.includes(type)) {
            into.vulnerability.push(type);
        }
    }
}

function applySourceKey(
    into: AggregatedDamageAffinity,
    key: string | undefined
): void {
    if (!key) {
        return;
    }
    mergeAffinity(into, getDamageAffinityForSource(key));
}

/**
 * Display-only aggregation of curated damage affinities from race traits
 * and ability grants. Does not invent affinities from free text.
 */
export function listDamageAffinitiesForCharacter(
    selections: CharacterSelections | undefined,
    grants: CharacterGrant[] | undefined,
    locale: Locale = "en"
): AggregatedDamageAffinity {
    const result: AggregatedDamageAffinity = {
        resistance: [],
        immunity: [],
        vulnerability: [],
    };

    const { traits } = getRaceTraitDisplay(selections, locale);
    for (const trait of traits) {
        applySourceKey(result, trait.slug);
        applySourceKey(result, trait.name);
    }

    for (const grant of grants ?? []) {
        if (grant.kind !== "ability") {
            continue;
        }
        applySourceKey(result, grant.ref);
        applySourceKey(result, grant.name);
    }

    // Also consult raw race/subrace trait slugs in case display filtered them.
    const race = selections?.race
        ? contentRepo().getRace(selections.race, locale)
        : undefined;
    const subrace = selections?.subrace
        ? contentRepo().getSubrace(selections.subrace, locale)
        : undefined;
    for (const trait of [...(race?.traits ?? []), ...(subrace?.traits ?? [])]) {
        applySourceKey(result, trait.slug);
        applySourceKey(result, trait.name);
    }

    return result;
}

export function hasAnyDamageAffinity(
    affinity: AggregatedDamageAffinity
): boolean {
    return (
        affinity.resistance.length > 0 ||
        affinity.immunity.length > 0 ||
        affinity.vulnerability.length > 0
    );
}
