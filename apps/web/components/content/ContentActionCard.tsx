"use client";

import { useState, type ReactNode } from "react";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";
import { ContentDetailModal } from "./ContentDetailModal";
import { ContentSummaryCard } from "./ContentSummaryCard";

export type ContentActionCardProps = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
    expandLabel: string;
    onUse?: (useAction: ContentUseActionSpec) => void;
    headerActions?: ReactNode;
    /** Optional test id wrapper attribute on the summary root. */
    "data-testid"?: string;
};

function hasUseActions(model: {
    useAction?: ContentUseActionSpec;
    useActions?: ContentUseActionSpec[];
}): boolean {
    return Boolean(
        (model.useActions && model.useActions.length > 0) || model.useAction
    );
}

export function ContentActionCard({
    summary,
    detail,
    expandLabel,
    onUse,
    headerActions,
    "data-testid": testId,
}: ContentActionCardProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const handleUse = onUse;

    return (
        <div data-testid={testId} className="min-w-0">
            <ContentSummaryCard
                model={summary}
                expandLabel={expandLabel}
                onExpand={() => setDetailOpen(true)}
                onUse={
                    hasUseActions(summary) && handleUse ? handleUse : undefined
                }
                headerActions={headerActions}
            />
            <ContentDetailModal
                model={detail}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUse={
                    hasUseActions(detail) && handleUse ? handleUse : undefined
                }
            />
        </div>
    );
}
