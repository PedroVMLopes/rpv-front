import type {
    ConditionRollEffect,
    RollEffectAppliesTo,
} from "@rpv/content";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";
import type { Locale } from "@rpv/domain";

export function collectRollEffectsFromActiveConditions(
    activeSlugs: string[] | undefined,
    system: SystemKey,
    locale?: Locale
): ConditionRollEffect[] {
    if (!activeSlugs?.length) {
        return [];
    }

    const repo = contentRepo(system);
    return activeSlugs.flatMap(
        (slug) => repo.getCondition(slug, locale)?.rollEffects ?? []
    );
}

export function rollEffectsFor(
    effects: ConditionRollEffect[],
    appliesTo: RollEffectAppliesTo
): ConditionRollEffect[] {
    return effects.filter((effect) => effect.appliesTo.includes(appliesTo));
}
