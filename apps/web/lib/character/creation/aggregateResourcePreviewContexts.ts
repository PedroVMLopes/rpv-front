import type { Grant } from "@rpv/content";
import type { GrantPreviewContext } from "./groupGrantPreviewBuckets";
import { parseSpellSlotLevel } from "@/lib/character/spellSlotResources";

function isAggregatableResource(grant: Grant): grant is Grant & { ref: string } {
    return (
        grant.grantType === "resource" &&
        typeof grant.ref === "string" &&
        grant.ref.trim().length > 0
    );
}

function compareResourceRefs(a: string, b: string): number {
    const levelA = parseSpellSlotLevel(a);
    const levelB = parseSpellSlotLevel(b);

    if (levelA !== undefined && levelB !== undefined) {
        return levelA - levelB;
    }

    if (levelA !== undefined) {
        return -1;
    }

    if (levelB !== undefined) {
        return 1;
    }

    return a.localeCompare(b);
}

/**
 * Collapses fixed `resource` grants with the same `ref` into one context
 * (summed `amount`). Other resource-bucket grants are left unchanged.
 */
export function aggregateResourcePreviewContexts(
    contexts: GrantPreviewContext[]
): GrantPreviewContext[] {
    const aggregatedByRef = new Map<string, GrantPreviewContext>();
    const passthrough: GrantPreviewContext[] = [];

    for (const ctx of contexts) {
        if (!isAggregatableResource(ctx.grant)) {
            passthrough.push(ctx);
            continue;
        }

        const ref = ctx.grant.ref.trim();
        const existing = aggregatedByRef.get(ref);

        if (!existing) {
            aggregatedByRef.set(ref, {
                source: ctx.source,
                featureLevel: undefined,
                grant: {
                    ...ctx.grant,
                    ref,
                    choose: 0,
                    amount: ctx.grant.amount ?? 0,
                },
            });
            continue;
        }

        const priorAmount = existing.grant.amount ?? 0;
        const nextAmount = ctx.grant.amount ?? 0;
        existing.grant = {
            ...existing.grant,
            amount: priorAmount + nextAmount,
        };
    }

    const aggregated = Array.from(aggregatedByRef.entries())
        .filter(([, ctx]) => (ctx.grant.amount ?? 0) !== 0)
        .sort(([refA], [refB]) => compareResourceRefs(refA, refB))
        .map(([, ctx]) => ctx);

    return [...aggregated, ...passthrough];
}
