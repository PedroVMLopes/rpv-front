import {
    buildExclusiveGroupKey,
    collectExclusiveGroupChoices,
    filterGrantsByExclusiveGroups,
    getSelectedExclusiveBranch,
} from "../src/grant/exclusiveGroups";
import type { Grant } from "../src/grant/grant.types";

const equipmentGrant: Grant = {
    grantType: "inventory_item",
    choose: 0,
    ref: "longsword",
    exclusiveGroup: "starting-wealth",
    exclusiveBranch: "equipment",
    description: "Standard equipment",
};

const sidearmGrant: Grant = {
    grantType: "inventory_item",
    choose: 1,
    exclusiveGroup: "starting-wealth",
    exclusiveBranch: "equipment",
    description: "Sidearm choice",
    options: [{ optionType: "item", ref: "pilot-test-dagger" }],
};

const goldGrant: Grant = {
    grantType: "currency",
    choose: 0,
    ref: "gold",
    amount: 50,
    exclusiveGroup: "starting-wealth",
    exclusiveBranch: "gold",
    description: "Starting gold",
};

const ungroupedGrant: Grant = {
    grantType: "inventory_item",
    choose: 0,
    ref: "scroll-of-fire-bolt",
};

const context = { sourceType: "class", sourceId: "fighter" };

describe("exclusiveGroups", () => {
    it("builds stable exclusive group pick keys", () => {
        expect(buildExclusiveGroupKey(context, "starting-wealth")).toBe(
            "class:fighter:base:exclusive:starting-wealth"
        );
    });

    it("collects branches for each exclusive group", () => {
        const choices = collectExclusiveGroupChoices(
            [equipmentGrant, sidearmGrant, goldGrant, ungroupedGrant],
            { type: "class", id: "fighter" }
        );

        expect(choices).toHaveLength(1);
        expect(choices[0].groupId).toBe("starting-wealth");
        expect(choices[0].branches.map((branch) => branch.branchId).sort()).toEqual(
            ["equipment", "gold"]
        );
    });

    it("filters grants to the selected equipment branch", () => {
        const grants = [equipmentGrant, sidearmGrant, goldGrant, ungroupedGrant];
        const grantPicks = {
            [buildExclusiveGroupKey(context, "starting-wealth")]: "equipment",
        };

        expect(filterGrantsByExclusiveGroups(grants, grantPicks, context)).toEqual([
            equipmentGrant,
            sidearmGrant,
            ungroupedGrant,
        ]);
    });

    it("filters grants to the selected gold branch", () => {
        const grants = [equipmentGrant, sidearmGrant, goldGrant, ungroupedGrant];
        const grantPicks = {
            [buildExclusiveGroupKey(context, "starting-wealth")]: "gold",
        };

        expect(filterGrantsByExclusiveGroups(grants, grantPicks, context)).toEqual([
            goldGrant,
            ungroupedGrant,
        ]);
    });

    it("excludes grouped grants when no branch is selected", () => {
        expect(
            filterGrantsByExclusiveGroups(
                [equipmentGrant, goldGrant, ungroupedGrant],
                {},
                context
            )
        ).toEqual([ungroupedGrant]);
    });

    it("reads selected branch from grant picks", () => {
        const grantPicks = {
            [buildExclusiveGroupKey(context, "starting-wealth")]: "gold",
        };

        expect(
            getSelectedExclusiveBranch(grantPicks, context, "starting-wealth")
        ).toBe("gold");
    });
});
