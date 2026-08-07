"use client";

import type { ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
    /** Rendered to the left of the expand button (e.g. inventory equip menu). */
    headerActions?: ReactNode;
};

function resolveUseActions(
    model: ContentSummaryModel
): ContentUseActionSpec[] {
    if (model.useActions && model.useActions.length > 0) {
        return model.useActions;
    }
    return model.useAction ? [model.useAction] : [];
}

export function ContentSummaryCard({
    model,
    expandLabel,
    onExpand,
    onUse,
    headerActions,
}: ContentSummaryCardProps) {
    const t = useTranslations("contentDetail");
    const subtitle = model.badges.map((badge) => badge.label).join(" · ");
    const useActions = resolveUseActions(model);
    const showUse = useActions.length > 0 && Boolean(onUse);
    const showBody = showUse || Boolean(model.shortDescription);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border-custom shadow-xs bg-popover text-popover-foreground">
            <div className="flex items-start justify-between p-2">
                <div className="flex min-w-0 flex-col">
                    <h3 className="min-w-0 flex-1 text-base font-semibold leading-tight">
                        {model.title}
                    </h3>
                    {subtitle ? (
                        <span className="text-xs text-popover-foreground/70">
                            {subtitle}
                        </span>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                    {headerActions}
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
            </div>

            {showBody ? (
                <div className="flex flex-1 flex-col gap-2 p-2 pt-0 text-popover-foreground">
                    {model.shortDescription ? (
                        <p className="text-xs leading-snug">
                            {model.shortDescription}
                        </p>
                    ) : null}
                    {showUse ? (
                        <div
                            className={
                                useActions.length > 1
                                    ? "grid grid-cols-2 gap-2"
                                    : "grid grid-cols-1"
                            }
                        >
                            {useActions.map((action, index) => (
                                <div
                                    key={`${action.role ?? action.kind}-${index}`}
                                    className="flex min-w-0 flex-col gap-0.5"
                                >
                                    {action.captionKey ? (
                                        <span className="pl-1 text-[10px] leading-tight">
                                            {t(action.captionKey)}
                                        </span>
                                    ) : null}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="w-full font-semibold"
                                        disabled={action.disabled}
                                        onClick={() => onUse?.(action)}
                                    >
                                        {action.label}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
