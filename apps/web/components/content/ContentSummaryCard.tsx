"use client";

import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{model.title}</span>
                    {model.badges.map((badge) => (
                        <span
                            key={badge.label}
                            className={cn(
                                "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                badge.variant === "muted"
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            )}
                        >
                            {badge.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
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
            </div>
        </div>
    );
}
