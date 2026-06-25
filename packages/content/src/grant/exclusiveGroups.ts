import type { Grant } from "./grant.types";

export type ExclusiveGroupContext = {
    sourceType: string;
    sourceId: string;
    featureLevel?: number;
};

export type ExclusiveGroupBranch = {
    branchId: string;
    label: string;
};

export type ExclusiveGroupChoice = {
    key: string;
    groupId: string;
    label: string;
    branches: ExclusiveGroupBranch[];
    source: { type: string; id: string };
    featureLevel?: number;
};

function levelSegment(featureLevel?: number): string {
    return featureLevel !== undefined ? String(featureLevel) : "base";
}

export function buildExclusiveGroupKey(
    context: ExclusiveGroupContext,
    groupId: string
): string {
    const segment = levelSegment(context.featureLevel);
    return `${context.sourceType}:${context.sourceId}:${segment}:exclusive:${groupId}`;
}

export function getSelectedExclusiveBranch(
    grantPicks: Record<string, string>,
    context: ExclusiveGroupContext,
    groupId: string
): string | undefined {
    const key = buildExclusiveGroupKey(context, groupId);
    const pick = grantPicks[key]?.trim();
    return pick && pick.length > 0 ? pick : undefined;
}

function branchLabel(grants: Grant[], branchId: string): string {
    const first = grants.find((grant) => grant.exclusiveBranch === branchId);
    return first?.description?.trim() || branchId;
}

function groupLabel(grants: Grant[], groupId: string): string {
    const first = grants.find((grant) => grant.exclusiveGroup === groupId);
    return first?.description?.trim() || groupId;
}

export function collectExclusiveGroupChoices(
    grants: Grant[],
    source: { type: string; id: string },
    featureLevel?: number
): ExclusiveGroupChoice[] {
    const groupIds = new Set<string>();

    for (const grant of grants) {
        if (grant.exclusiveGroup) {
            groupIds.add(grant.exclusiveGroup);
        }
    }

    const context: ExclusiveGroupContext = {
        sourceType: source.type,
        sourceId: source.id,
        featureLevel,
    };

    const results: ExclusiveGroupChoice[] = [];

    for (const groupId of groupIds) {
        const grouped = grants.filter((grant) => grant.exclusiveGroup === groupId);
        const branchIds = new Set<string>();

        for (const grant of grouped) {
            if (grant.exclusiveBranch) {
                branchIds.add(grant.exclusiveBranch);
            }
        }

        if (branchIds.size === 0) {
            continue;
        }

        results.push({
            key: buildExclusiveGroupKey(context, groupId),
            groupId,
            label: groupLabel(grouped, groupId),
            branches: [...branchIds].map((branchId) => ({
                branchId,
                label: branchLabel(grouped, branchId),
            })),
            source,
            featureLevel,
        });
    }

    return results;
}

export function filterGrantsByExclusiveGroups(
    grants: Grant[],
    grantPicks: Record<string, string>,
    context: ExclusiveGroupContext
): Grant[] {
    const selectedByGroup = new Map<string, string>();

    for (const grant of grants) {
        if (!grant.exclusiveGroup) {
            continue;
        }

        if (!selectedByGroup.has(grant.exclusiveGroup)) {
            const branch = getSelectedExclusiveBranch(
                grantPicks,
                context,
                grant.exclusiveGroup
            );
            if (branch) {
                selectedByGroup.set(grant.exclusiveGroup, branch);
            }
        }
    }

    return grants.filter((grant) => {
        if (!grant.exclusiveGroup) {
            return true;
        }

        const selectedBranch = selectedByGroup.get(grant.exclusiveGroup);
        if (!selectedBranch) {
            return false;
        }

        return grant.exclusiveBranch === selectedBranch;
    });
}

export function isGrantInActiveExclusiveBranch(
    grant: Grant,
    grantPicks: Record<string, string>,
    context: ExclusiveGroupContext
): boolean {
    if (!grant.exclusiveGroup) {
        return true;
    }

    const selectedBranch = getSelectedExclusiveBranch(
        grantPicks,
        context,
        grant.exclusiveGroup
    );

    if (!selectedBranch) {
        return false;
    }

    return grant.exclusiveBranch === selectedBranch;
}
