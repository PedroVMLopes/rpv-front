import { deriveResourceTotals } from "../lib/character/deriveResourceTotals";
import type { CharacterGrant } from "@rpv/domain";

function createResourceGrant(
    ref: string,
    amount: number
): CharacterGrant {
    return {
        id: `resource-${ref}-${amount}`,
        kind: "resource",
        ref,
        amount,
        source: { type: "class", id: "wizard" },
    };
}

describe("deriveResourceTotals", () => {
    it("delegates to aggregateResourceGrants", () => {
        const grants: CharacterGrant[] = [
            createResourceGrant("spell-slots-1", 2),
            createResourceGrant("spell-slots-1", 1),
            createResourceGrant("spell-slots-2", 1),
        ];

        expect(deriveResourceTotals(grants)).toEqual({
            "spell-slots-1": 3,
            "spell-slots-2": 1,
        });
    });

    it("returns empty object when no resource grants", () => {
        expect(deriveResourceTotals([])).toEqual({});
    });
});
