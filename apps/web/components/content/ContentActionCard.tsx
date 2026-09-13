"use client";

import { useState, type ReactNode } from "react";
import type {
    ContentDetailModel,
    ContentSummaryModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";
import { cn } from "@/lib/utils";
import { ContentDetailModal } from "./ContentDetailModal";
import type { ContentDetailQuantityHandlers } from "./ContentDetailPanel";
import { ContentSummaryCard } from "./ContentSummaryCard";

export type ContentActionCardProps = {
    summary: ContentSummaryModel;
    detail: ContentDetailModel;
    expandLabel: string;
    onUse?: (useAction: ContentUseActionSpec) => void;
    headerActions?: ReactNode;
    quantityHandlers?: ContentDetailQuantityHandlers;
    onDelete?: () => void;
    deleteLabel?: string;
    equipActions?: ReactNode;
    afterContent?: ReactNode;
    /** Optional test id wrapper attribute on the summary root. */
    "data-testid"?: string;
    /** When true, omit shortDescription from the list card (detail modal still has it). */
    hideShortDescription?: boolean;
    className?: string;
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
    quantityHandlers,
    onDelete,
    deleteLabel,
    equipActions,
    afterContent,
    "data-testid": testId,
    hideShortDescription,
    className,
}: ContentActionCardProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const handleUse = onUse;

    const handleDelete = onDelete
        ? () => {
              onDelete();
              setDetailOpen(false);
          }
        : undefined;

    return (
        <div data-testid={testId} className={cn("min-w-0 h-fit", className)}>
            <ContentSummaryCard
                model={summary}
                expandLabel={expandLabel}
                onExpand={() => setDetailOpen(true)}
                onUse={
                    hasUseActions(summary) && handleUse ? handleUse : undefined
                }
                headerActions={headerActions}
                hideShortDescription={hideShortDescription}
                afterContent={afterContent}
            />
            <ContentDetailModal
                model={detail}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUse={
                    hasUseActions(detail) && handleUse ? handleUse : undefined
                }
                quantityHandlers={quantityHandlers}
                onDelete={handleDelete}
                deleteLabel={deleteLabel}
                equipActions={equipActions}
                afterContent={afterContent}
            />
        </div>
    );
}
