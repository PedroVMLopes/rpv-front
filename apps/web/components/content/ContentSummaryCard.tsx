"use client";

import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
    ContentSummaryModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";

type ContentSummaryCardProps = {
    model: ContentSummaryModel;
    expandLabel: string;
    onExpand: () => void;
    onUse?: (useAction: ContentUseActionSpec) => void;
};

export function ContentSummaryCard({
    model,
    expandLabel,
    onExpand,
    onUse,
}: ContentSummaryCardProps) {
    const subtitle = model.badges.map((badge) => badge.label).join(" · ");

    return (
        <div className="flex h-full flex-col gap-2 rounded-xl border-2 bg-accent text-accent-foreground p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                    <span className="font-serif font-semibold leading-tight">
                        {model.title}
                    </span>
                    {subtitle ? (
                        <span className="text-xs">
                            {subtitle}
                        </span>
                    ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {model.useAction && onUse ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="font-semibold"
                            onClick={() => onUse(model.useAction!)}
                        >
                            {model.useAction.label}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={expandLabel}
                        onClick={onExpand}
                    >
                        <Maximize2 className="size-4" aria-hidden />
                    </Button>
                </div>
            </div>
        </div>
    );
}
