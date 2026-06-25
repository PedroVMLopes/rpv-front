import type { Modifier, StatKey } from "@rpv/domain";
import type { Grant, GrantOption } from "./grant.types";

export type AbilityScoreGrantResolveContext = {
    sourceType: string;
    sourceId: string;
    featureLevel?: number;
};

function levelSegment(featureLevel?: number): string {
    return featureLevel !== undefined ? String(featureLevel) : "base";
}

export function buildAbilityScoreChoiceKey(params: {
    sourceType: string;
    sourceId: string;
    grantIndex: number;
    slot: number;
    featureLevel?: number;
}): string {
    const segment = levelSegment(params.featureLevel);
    return `${params.sourceType}:${params.sourceId}:${segment}:ability_score:${params.grantIndex}:${params.slot}`;
}

function statOptionsFromGrant(grant: Grant): StatKey[] {
    if (grant.options && grant.options.length > 0) {
        return grant.options
            .filter(
                (option): option is Extract<GrantOption, { optionType: "stat" }> =>
                    option.optionType === "stat"
            )
            .map((option) => option.ref);
    }

    if (grant.selectionFilter?.stats?.length) {
        return grant.selectionFilter.stats;
    }

    return [];
}

export function resolveAbilityScorePick(
    grant: Grant,
    pickValue: string | undefined
): StatKey | undefined {
    if (grant.grantType !== "ability_score" || grant.choose <= 0) {
        return undefined;
    }

    if (pickValue === undefined || pickValue.trim() === "") {
        return undefined;
    }

    const stat = pickValue.trim() as StatKey;
    const pool = statOptionsFromGrant(grant);

    return pool.includes(stat) ? stat : undefined;
}

export function isValidAbilityScorePick(
    grant: Grant,
    pickValue: string
): boolean {
    if (grant.grantType !== "ability_score" || grant.choose <= 0) {
        return false;
    }

    return resolveAbilityScorePick(grant, pickValue) !== undefined;
}

export function resolveAbilityScoreGrants(
    grants: Grant[],
    grantPicks: Record<string, string>,
    context: AbilityScoreGrantResolveContext
): Modifier[] {
    const modifiers: Modifier[] = [];

    grants.forEach((grant, grantIndex) => {
        if (grant.grantType !== "ability_score" || grant.choose <= 0) {
            return;
        }

        for (let slot = 0; slot < grant.choose; slot++) {
            const key = buildAbilityScoreChoiceKey({
                sourceType: context.sourceType,
                sourceId: context.sourceId,
                grantIndex,
                slot,
                featureLevel: context.featureLevel,
            });
            const stat = resolveAbilityScorePick(grant, grantPicks[key]);
            if (!stat) {
                continue;
            }

            modifiers.push({
                id: `${context.sourceType}-${context.sourceId}-${stat}-choice-${slot}`,
                stat,
                operation: "add",
                value: grant.amount ?? 1,
                source: { type: "race", id: context.sourceId },
                duration: { type: "permanent" },
                stacking: "stack",
                priority: 0,
            });
        }
    });

    return modifiers;
}
