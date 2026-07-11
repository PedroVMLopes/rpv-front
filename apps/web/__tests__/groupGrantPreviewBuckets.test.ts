import type { Grant } from "@rpv/content";
import {
    getBackgroundGrants,
    getClassGrantSourcesForLevel,
} from "@rpv/content";
import type { ModifierSource } from "@rpv/domain";
import {
    groupGrantPreviewBuckets,
    hasAnyBucketItems,
    type GrantPreviewContext,
} from "../lib/character/creation/groupGrantPreviewBuckets";

function ctx(
    grant: Grant,
    source: ModifierSource,
    featureLevel?: number
): GrantPreviewContext {
    return { grant, source, featureLevel };
}

function bucketGrants(
    contexts: GrantPreviewContext[],
    bucket: keyof ReturnType<typeof groupGrantPreviewBuckets>["proficiencies"]
): Grant[] {
    return groupGrantPreviewBuckets(contexts).proficiencies[bucket].map(
        (entry) => entry.grant
    );
}

function actionResourceGrants(
    contexts: GrantPreviewContext[],
    bucket: keyof ReturnType<
        typeof groupGrantPreviewBuckets
    >["actionsAndResources"]
): Grant[] {
    return groupGrantPreviewBuckets(contexts).actionsAndResources[bucket].map(
        (entry) => entry.grant
    );
}

describe("groupGrantPreviewBuckets", () => {
    it("classifies fighter level 1 proficiencies and omits deferred skill choice", () => {
        const classSource: ModifierSource = { type: "class", id: "fighter" };
        const contexts = getClassGrantSourcesForLevel("fighter", 1).flatMap(
            (block) =>
                block.grants.map((grant) =>
                    ctx(grant, classSource, block.featureLevel)
                )
        );

        expect(
            bucketGrants(contexts, "weapons").some(
                (grant) => grant.grantType === "weapon_proficiency"
            )
        ).toBe(true);
        expect(
            bucketGrants(contexts, "skills").some(
                (grant) => grant.grantType === "saving_throw_proficiency"
            )
        ).toBe(true);
        expect(
            contexts.filter((entry) => entry.grant.choose > 0).every((entry) => {
                const buckets = groupGrantPreviewBuckets(contexts);
                const all = [
                    ...Object.values(buckets.proficiencies).flat(),
                    ...Object.values(buckets.actionsAndResources).flat(),
                ];

                return !all.some(
                    (classified) => classified.grant === entry.grant
                );
            })
        ).toBe(true);
    });

    it("classifies wizard level 1 spell slots as resources", () => {
        const classSource: ModifierSource = { type: "class", id: "wizard" };
        const contexts = getClassGrantSourcesForLevel("wizard", 1).flatMap(
            (block) =>
                block.grants.map((grant) =>
                    ctx(grant, classSource, block.featureLevel)
                )
        );

        expect(
            actionResourceGrants(contexts, "resources").some(
                (grant) =>
                    grant.grantType === "resource" &&
                    grant.ref === "spell-slots-1"
            )
        ).toBe(true);
        expect(actionResourceGrants(contexts, "cantrips")).toHaveLength(0);
    });

    it("classifies fixed cantrip grants into cantrips", () => {
        const contexts = [
            ctx(
                {
                    grantType: "spell",
                    choose: 0,
                    ref: "fire-bolt",
                },
                { type: "race", id: "high-elf" }
            ),
        ];

        expect(actionResourceGrants(contexts, "cantrips")).toHaveLength(1);
        expect(actionResourceGrants(contexts, "spells")).toHaveLength(0);
    });

    it("routes racial ability traits to resources and class abilities to actions", () => {
        const racialAbility = ctx(
            {
                grantType: "ability",
                choose: 0,
                description: "Fey Ancestry",
            },
            { type: "race", id: "elf" }
        );
        const classAbility = ctx(
            {
                grantType: "ability",
                choose: 0,
                description: "Arcane Recovery",
            },
            { type: "class", id: "wizard" }
        );

        expect(actionResourceGrants([racialAbility], "resources")).toHaveLength(
            1
        );
        expect(actionResourceGrants([classAbility], "actions")).toHaveLength(1);
    });

    it("classifies sage background fixed grants and omits language choices", () => {
        const backgroundSource: ModifierSource = {
            type: "background",
            id: "sage",
        };
        const contexts = getBackgroundGrants("sage").map((grant) =>
            ctx(grant, backgroundSource)
        );

        expect(bucketGrants(contexts, "skills")).toHaveLength(1);
        expect(bucketGrants(contexts, "languages")).toHaveLength(0);
        expect(
            actionResourceGrants(contexts, "resources").some(
                (grant) => grant.grantType === "inventory_item"
            )
        ).toBe(true);
        expect(
            actionResourceGrants(contexts, "resources").some(
                (grant) => grant.grantType === "currency"
            )
        ).toBe(true);
    });

    it("classifies stat_modifier grants as resources", () => {
        const contexts = [
            ctx(
                {
                    grantType: "stat_modifier",
                    choose: 0,
                    ref: "speed",
                    amount: 5,
                },
                { type: "race", id: "wood-elf" }
            ),
        ];

        expect(actionResourceGrants(contexts, "resources")).toHaveLength(1);
    });

    it("omits ability_score grants", () => {
        const contexts = [
            ctx(
                {
                    grantType: "ability_score",
                    choose: 2,
                    amount: 1,
                },
                { type: "class", id: "fighter" }
            ),
        ];

        expect(hasAnyBucketItems(groupGrantPreviewBuckets(contexts))).toBe(
            false
        );
    });
});
