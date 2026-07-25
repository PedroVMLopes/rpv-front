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
    const useAction = model.useAction;
    const showBody = Boolean(
        (useAction && onUse) || model.shortDescription
    );

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border-2">
            <div className="flex items-start justify-between bg-accent text-accent-foreground p-2">
                <div className="flex flex-col">
                    <span className="min-w-0 flex-1 font-serif font-semibold">
                        {model.title}
                    </span>
                    {subtitle ? (
                            <span className="text-xs text-accent-foreground/70">
                                {subtitle}
                            </span>
                        ) : null}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    className="size-6 cursor-pointer"
                    aria-label={expandLabel}
                    onClick={onExpand}
                >
                    <Maximize2 className="" aria-hidden />
                </Button>
            </div>

            {showBody ? (
                <div className="flex flex-1 flex-col gap-2 bg-accent text-accent-foreground p-2">
                    {model.shortDescription ? (
                        <p className="text-xs leading-snug text-accent-foreground/80">
                            {model.shortDescription}
                        </p>
                    ) : null}
                    {useAction && onUse ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="w-full font-semibold"
                            onClick={() => onUse(useAction)}
                        >
                            {useAction.label}
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
