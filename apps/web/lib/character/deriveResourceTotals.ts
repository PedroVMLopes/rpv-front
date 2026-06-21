import type { CharacterGrant } from "@rpv/domain";
import { aggregateResourceGrants } from "@rpv/domain";

export function deriveResourceTotals(
    grants: CharacterGrant[]
): Record<string, number> {
    return aggregateResourceGrants(grants);
}
