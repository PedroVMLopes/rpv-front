import { getClassGrantSourcesForLevel } from "@rpv/content";
import { aggregateResourcePreviewContexts } from "../lib/character/creation/aggregateResourcePreviewContexts";
import {
    groupGrantPreviewBuckets,
} from "../lib/character/creation/groupGrantPreviewBuckets";
import type { GrantPreviewContext } from "../lib/character/creation/groupGrantPreviewBuckets";

function wizardContextsThroughLevel(level: number): GrantPreviewContext[] {
    return getClassGrantSourcesForLevel("wizard", level).flatMap((block) =>
        block.grants.map((grant) => ({
            grant,
            source: { type: "class" as const, id: "wizard" },
            featureLevel: block.featureLevel,
        }))
    );
}

describe("aggregateResourcePreviewContexts", () => {
    it("sums wizard spell-slot deltas through level 3 into totals", () => {
        const buckets = groupGrantPreviewBuckets(
            wizardContextsThroughLevel(3),
            "en"
        );
        const aggregated = aggregateResourcePreviewContexts(
            buckets.actionsAndResources.resources
        );

        const resources = aggregated
            .filter((ctx) => ctx.grant.grantType === "resource")
            .map((ctx) => ({
                ref: ctx.grant.ref,
                amount: ctx.grant.amount,
                featureLevel: ctx.featureLevel,
            }));

        expect(resources).toEqual([
            { ref: "spell-slots-1", amount: 4, featureLevel: undefined },
            { ref: "spell-slots-2", amount: 2, featureLevel: undefined },
            { ref: "spell-slots-3", amount: 1, featureLevel: undefined },
        ]);
    });

    it("preserves non-resource contexts in original order after resources", () => {
        const contexts: GrantPreviewContext[] = [
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "spell-slots-1",
                    amount: 2,
                },
                source: { type: "class", id: "wizard" },
                featureLevel: 1,
            },
            {
                grant: {
                    grantType: "inventory_item",
                    choose: 0,
                    ref: "dagger",
                    amount: 1,
                },
                source: { type: "class", id: "wizard" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "spell-slots-1",
                    amount: 1,
                },
                source: { type: "class", id: "wizard" },
                featureLevel: 2,
            },
            {
                grant: {
                    grantType: "currency",
                    choose: 0,
                    amount: 10,
                },
                source: { type: "class", id: "wizard" },
            },
        ];

        const aggregated = aggregateResourcePreviewContexts(contexts);

        expect(aggregated).toHaveLength(3);
        expect(aggregated[0]).toMatchObject({
            grant: {
                grantType: "resource",
                ref: "spell-slots-1",
                amount: 3,
            },
            featureLevel: undefined,
        });
        expect(aggregated[1].grant).toMatchObject({
            grantType: "inventory_item",
            ref: "dagger",
        });
        expect(aggregated[2].grant).toMatchObject({
            grantType: "currency",
            amount: 10,
        });
    });

    it("drops zero-sum resources and rewrites choose>0 resource grants to choose 0", () => {
        const contexts: GrantPreviewContext[] = [
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "rage-uses",
                    amount: 2,
                },
                source: { type: "class", id: "barbarian" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "rage-uses",
                    amount: -2,
                },
                source: { type: "class", id: "barbarian" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 1,
                    ref: "ki-points",
                    amount: 3,
                },
                source: { type: "class", id: "monk" },
            },
        ];

        const aggregated = aggregateResourcePreviewContexts(contexts);

        expect(aggregated).toHaveLength(1);
        expect(aggregated[0].grant).toMatchObject({
            grantType: "resource",
            choose: 0,
            ref: "ki-points",
            amount: 3,
        });
    });

    it("trims refs, sorts spell slots by level, then other resources alphabetically", () => {
        const contexts: GrantPreviewContext[] = [
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "rage-uses",
                    amount: 2,
                },
                source: { type: "class", id: "barbarian" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "  spell-slots-2  ",
                    amount: 1,
                },
                source: { type: "class", id: "wizard" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "ki-points",
                    amount: 4,
                },
                source: { type: "class", id: "monk" },
            },
            {
                grant: {
                    grantType: "resource",
                    choose: 0,
                    ref: "spell-slots-1",
                    amount: 3,
                },
                source: { type: "class", id: "wizard" },
            },
        ];

        expect(
            aggregateResourcePreviewContexts(contexts).map((ctx) => ctx.grant.ref)
        ).toEqual(["spell-slots-1", "spell-slots-2", "ki-points", "rage-uses"]);
    });
});
