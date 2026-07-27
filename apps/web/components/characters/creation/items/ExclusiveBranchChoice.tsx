"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ContentDetailModel } from "@/lib/content/contentDetail.types";
import type { ExclusiveBranchSummary } from "@/lib/character/buildExclusiveBranchSummaries";
import { ContentDetailModal } from "@/components/content/ContentDetailModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExclusiveBranchChoiceProps = {
    groupKey: string;
    groupLabel: string;
    sourceLabel: string;
    branches: ExclusiveBranchSummary[];
    selectedBranchId: string;
    onSelect: (branchId: string) => void;
    focusKey?: string;
};

export function ExclusiveBranchChoice({
    groupKey,
    groupLabel,
    sourceLabel,
    branches,
    selectedBranchId,
    onSelect,
    focusKey,
}: ExclusiveBranchChoiceProps) {
    const t = useTranslations("characterCreation");
    const tEquip = useTranslations("startingEquipment");
    const [detailModel, setDetailModel] = useState<ContentDetailModel | null>(
        null
    );
    const isFocused = focusKey === groupKey;

    function openBranchDetail(branch: ExclusiveBranchSummary) {
        setDetailModel({
            id: `${groupKey}:${branch.branchId}`,
            kind: "item",
            title: branch.label,
            sections: [
                {
                    rows: [
                        {
                            labelKey: "contents",
                            value:
                                branch.detailLines.length > 0
                                    ? branch.detailLines.join(", ")
                                    : branch.summary,
                        },
                    ],
                },
            ],
            description:
                branch.detailLines.length > 0
                    ? branch.detailLines.join("\n")
                    : branch.summary,
        });
    }

    return (
        <section
            data-focus-key={groupKey}
            data-testid={`exclusive-choice-${groupKey}`}
            className={cn(
                "flex flex-col gap-3 rounded-lg",
                isFocused && "ring-2 ring-primary ring-offset-2"
            )}
        >
            <h3 className="text-sm font-semibold">
                {tEquip("exclusiveTitle")}{" "}
                <span className="font-normal text-muted-foreground">
                    ({sourceLabel})
                </span>
                {groupLabel ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {groupLabel}
                    </span>
                ) : null}
            </h3>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                {branches.map((branch) => {
                    const isSelected = branch.branchId === selectedBranchId;

                    return (
                        <div
                            key={branch.branchId}
                            data-testid={`exclusive-branch-${branch.branchId}`}
                            className={cn(
                                "flex flex-col gap-2 rounded-xl border-custom bg-popover text-popover-foreground p-3 transition-colors",
                                isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : ""
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left"
                                    onClick={() => {
                                        if (isSelected) {
                                            onSelect("");
                                            return;
                                        }
                                        onSelect(branch.branchId);
                                    }}
                                >
                                    <span className="font-serif font-semibold leading-tight">
                                        {branch.label}
                                    </span>
                                    <span className="mt-1 block text-xs">
                                        {branch.summary}
                                    </span>
                                </button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    aria-label={t("selection.expandDetails")}
                                    onClick={() => openBranchDetail(branch)}
                                >
                                    <Maximize2 className="size-4" aria-hidden />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {detailModel ? (
                <ContentDetailModal
                    model={detailModel}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailModel(null);
                        }
                    }}
                />
            ) : null}
        </section>
    );
}
