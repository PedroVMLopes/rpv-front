import { filterGrantsByExclusiveGroups, type Grant } from "@rpv/content";
import type { GrantSourceEntry } from "./characterGrants";

export function filterStartingGrantsForEntry(
    grants: Grant[],
    grantPicks: Record<string, string>,
    entry: GrantSourceEntry
): Grant[] {
    return filterGrantsByExclusiveGroups(grants, grantPicks, {
        sourceType: entry.source.type,
        sourceId: entry.source.id,
        featureLevel: entry.featureLevel,
    });
}
