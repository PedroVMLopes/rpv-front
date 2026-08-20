import { buildFeatureContentModel } from "../lib/content/buildFeatureContentModel";

describe("buildFeatureContentModel", () => {
    it("builds a content card model with cost badge, source row, and use action", () => {
        const { summary, detail } = buildFeatureContentModel({
            id: "class-fighter-ability-second-wind",
            title: "Second Wind",
            description:
                "On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.",
            sourceLabel: "Class",
            costLabel: "Bonus Action",
            useLabel: "Use",
        });

        expect(summary.kind).toBe("feature");
        expect(summary.title).toBe("Second Wind");
        expect(summary.badges).toEqual([
            { label: "Bonus Action", variant: "muted" },
        ]);
        expect(summary.shortDescription).toContain("1d10");
        expect(summary.useAction).toEqual({
            kind: "cast",
            label: "Use",
            disabled: false,
        });
        expect(detail.kind).toBe("feature");
        expect(detail.description).toContain("bonus action");
        expect(detail.sections[0]?.rows).toEqual([
            { labelKey: "source", value: "Class" },
        ]);
        expect(detail.useAction).toEqual(summary.useAction);
    });

    it("disables use when the feature is depleted", () => {
        const { summary } = buildFeatureContentModel({
            id: "feature-depleted",
            title: "Action Surge",
            sourceLabel: "Class",
            useLabel: "Use",
            depleted: true,
        });

        expect(summary.useAction?.disabled).toBe(true);
    });

    it("omits use action for passive reminders", () => {
        const { summary, detail } = buildFeatureContentModel({
            id: "class-barbarian-ability-danger-sense",
            title: "Danger Sense",
            sourceLabel: "Class",
            costLabel: "Passive",
        });

        expect(summary.useAction).toBeUndefined();
        expect(detail.useAction).toBeUndefined();
        expect(summary.badges).toEqual([
            { label: "Passive", variant: "muted" },
        ]);
    });

    it("adds a resource count badge when provided", () => {
        const { summary } = buildFeatureContentModel({
            id: "class-barbarian-ability-rage",
            title: "Rage",
            sourceLabel: "Class",
            costLabel: "Bonus Action",
            resourceLabel: "2/3",
            useLabel: "Use",
        });

        expect(summary.badges).toEqual([
            { label: "Bonus Action", variant: "muted" },
            { label: "2/3", variant: "muted" },
        ]);
    });
});
