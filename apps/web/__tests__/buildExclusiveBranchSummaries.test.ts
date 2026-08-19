import {
    collectExclusiveGroupChoices,
    getClassGrants,
} from "@rpv/content";
import { buildExclusiveBranchSummaries } from "../lib/character/buildExclusiveBranchSummaries";

const formatters = {
    equipmentPackage: "Starting equipment",
    choiceCount: (count: number) => `${count} choices`,
    fixedItemCount: (count: number) => `${count} items`,
    currencyAmount: (amount: number, ref: string) => `${amount} ${ref}`,
};

describe("buildExclusiveBranchSummaries", () => {
    const fighterGrants = getClassGrants("fighter");
    const [wealthGroup] = collectExclusiveGroupChoices(fighterGrants, {
        type: "class",
        id: "fighter",
    });

    it("summarizes fighter equipment vs gold starting-wealth branches", () => {
        expect(wealthGroup).toBeDefined();

        const summaries = buildExclusiveBranchSummaries(
            fighterGrants,
            wealthGroup.branches,
            "dnd",
            "en",
            formatters
        );

        const byBranch = Object.fromEntries(
            summaries.map((summary) => [summary.branchId, summary])
        );

        expect(byBranch.equipment.summary).toBe("1 items · 4 choices");
        expect(byBranch.equipment.detailLines).toEqual(
            expect.arrayContaining([
                "Longsword",
                "Starting armor",
                "Starting sidearm",
            ])
        );

        expect(byBranch.gold.summary).toBe("50 gold");
        expect(byBranch.gold.detailLines).toEqual([
            "Starting gold (pilot: 5d4×10 avg)",
        ]);
    });

    it("falls back to the equipment package label when a branch has no grants", () => {
        expect(
            buildExclusiveBranchSummaries(
                fighterGrants,
                [{ branchId: "missing", label: "Missing" }],
                "dnd",
                "en",
                formatters
            )
        ).toEqual([
            {
                branchId: "missing",
                label: "Missing",
                summary: "Starting equipment",
                detailLines: [],
            },
        ]);
    });
});
