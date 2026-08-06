"use client";

import { useState, type ReactNode } from "react";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "../ContentDetailModal";
import { ContentSummaryCard } from "../ContentSummaryCard";

type ItemContentCardProps = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
    expandLabel: string;
    onUse?: (useAction: ContentUseActionSpec) => void;
    headerActions?: ReactNode;
    /** Optional test id wrapper attribute on the summary root. */
    "data-testid"?: string;
};

export function ItemContentCard({
    summary,
    detail,
    expandLabel,
    onUse,
    headerActions,
    "data-testid": testId,
}: ItemContentCardProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const handleUse = onUse;

    return (
        <div data-testid={testId} className="min-w-0">
            <ContentSummaryCard
                model={summary}
                expandLabel={expandLabel}
                onExpand={() => setDetailOpen(true)}
                onUse={summary.useAction && handleUse ? handleUse : undefined}
                headerActions={headerActions}
            />
            <ContentDetailModal
                model={detail}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUse={detail.useAction && handleUse ? handleUse : undefined}
            />
        </div>
    );
}
