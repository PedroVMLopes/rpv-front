import type { Locale, Modifier, StatKey } from "@rpv/domain";
import { removeModifiersBySource } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    deriveAbilityScoreModifiers,
    deriveStatModifiers,
    STAT_MODIFIER_SOURCE_TYPES,
} from "./characterGrants";
import type { CharacterSelections } from "./storedCharacter";

const ABILITY_SCORE_STATS: ReadonlySet<StatKey> = new Set([
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]);

function isReplacedClassAbilityScore(modifier: Modifier): boolean {
    return (
        (modifier.source.type === "class" ||
            modifier.source.type === "subclass") &&
        ABILITY_SCORE_STATS.has(modifier.stat)
    );
}

export function deriveModifiersForCharacter(
    selections: CharacterSelections,
    locale: Locale,
    options?: {
        preserve?: Modifier[];
        characterLevel?: number;
        system?: SystemKey;
    }
): Modifier[] {
    const characterLevel = options?.characterLevel ?? 1;
    const system = options?.system ?? "dnd";
    const derived = [
        ...deriveAbilityScoreModifiers(
            selections,
            locale,
            characterLevel,
            system
        ),
        ...deriveStatModifiers(selections, locale, characterLevel, system),
    ];

    if (!options?.preserve) {
        return derived;
    }

    let preserved = removeModifiersBySource(options.preserve, {
        type: "race",
    });

    for (const sourceType of STAT_MODIFIER_SOURCE_TYPES) {
        preserved = removeModifiersBySource(preserved, {
            type: sourceType,
        });
    }

    const derivedIds = new Set(derived.map((modifier) => modifier.id));
    preserved = preserved.filter(
        (modifier) =>
            !isReplacedClassAbilityScore(modifier) &&
            !derivedIds.has(modifier.id)
    );

    return [...preserved, ...derived];
}
