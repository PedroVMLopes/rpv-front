import type { Grant } from "@rpv/content";
import { getItem } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type ExclusiveBranchSummary = {
    branchId: string;
    label: string;
    summary: string;
    detailLines: string[];
};

type Formatters = {
    equipmentPackage: string;
    choiceCount: (count: number) => string;
    fixedItemCount: (count: number) => string;
    currencyAmount: (amount: number, ref: string) => string;
};

function grantsForBranch(grants: Grant[], branchId: string): Grant[] {
    return grants.filter(
        (grant) =>
            grant.exclusiveGroup && grant.exclusiveBranch === branchId
    );
}

export function buildExclusiveBranchSummaries(
    grants: Grant[],
    branches: Array<{ branchId: string; label: string }>,
    system: SystemKey,
    locale: Locale,
    formatters: Formatters
): ExclusiveBranchSummary[] {
    return branches.map((branch) => {
        const branchGrants = grantsForBranch(grants, branch.branchId);
        const detailLines: string[] = [];
        let fixedItems = 0;
        let choiceCount = 0;
        let currencyLine: string | undefined;

        for (const grant of branchGrants) {
            if (grant.grantType === "currency") {
                const amount = grant.amount ?? 0;
                const ref = grant.ref ?? "gold";
                const line = formatters.currencyAmount(amount, ref);
                detailLines.push(grant.description?.trim() || line);
                currencyLine = line;
                continue;
            }

            if (grant.grantType === "inventory_item") {
                if (grant.choose > 0) {
                    choiceCount += 1;
                    detailLines.push(
                        grant.description?.trim() ||
                            formatters.choiceCount(grant.choose)
                    );
                    continue;
                }

                const slug = grant.ref;
                if (slug) {
                    fixedItems += 1;
                    const name =
                        getItem(slug, system, locale)?.name ?? slug;
                    const qty = grant.amount && grant.amount > 1 ? grant.amount : 1;
                    detailLines.push(qty > 1 ? `${name} ×${qty}` : name);
                } else if (grant.description?.trim()) {
                    detailLines.push(grant.description.trim());
                }
            } else if (grant.description?.trim()) {
                detailLines.push(grant.description.trim());
            }
        }

        let summary: string;
        if (currencyLine && fixedItems === 0 && choiceCount === 0) {
            summary = currencyLine;
        } else if (fixedItems > 0 || choiceCount > 0) {
            const parts: string[] = [];
            if (fixedItems > 0) {
                parts.push(formatters.fixedItemCount(fixedItems));
            }
            if (choiceCount > 0) {
                parts.push(formatters.choiceCount(choiceCount));
            }
            summary = parts.join(" · ") || formatters.equipmentPackage;
        } else {
            summary = formatters.equipmentPackage;
        }

        return {
            branchId: branch.branchId,
            label: branch.label,
            summary,
            detailLines,
        };
    });
}
