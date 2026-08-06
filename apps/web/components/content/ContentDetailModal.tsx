"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type {
    ContentDetailModel,
    ContentUseActionSpec,
} from "@/lib/content/contentDetail.types";
import { ContentDetailPanel } from "./ContentDetailPanel";

type ContentDetailModalProps = {
    model: ContentDetailModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUse?: (useAction: ContentUseActionSpec) => void;
    afterContent?: ReactNode;
    footer?: ReactNode;
};

function resolveUseActions(
    model: ContentDetailModel
): ContentUseActionSpec[] {
    if (model.useActions && model.useActions.length > 0) {
        return model.useActions;
    }
    return model.useAction ? [model.useAction] : [];
}

export function ContentDetailModal({
    model,
    open,
    onOpenChange,
    onUse,
    afterContent,
    footer,
}: ContentDetailModalProps) {
    const t = useTranslations("contentDetail");
    const useActions = resolveUseActions(model);

    const useActionFooter =
        !footer && useActions.length > 0 && onUse ? (
            <DialogFooter
                className={
                    useActions.length > 1
                        ? "grid grid-cols-2 gap-2 sm:space-x-0"
                        : undefined
                }
            >
                {useActions.map((action, index) => (
                    <div
                        key={`${action.role ?? action.kind}-${index}`}
                        className="flex min-w-0 flex-col gap-0.5"
                    >
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={action.disabled}
                            onClick={() => onUse(action)}
                        >
                            {action.label}
                        </Button>
                        {action.captionKey ? (
                            <span className="text-center text-[10px] leading-tight text-muted-foreground">
                                {t(action.captionKey)}
                            </span>
                        ) : null}
                    </div>
                ))}
            </DialogFooter>
        ) : null;

    const resolvedFooter = footer ?? useActionFooter;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg bg-card text-card-foreground">
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>{model.title}</DialogTitle>
                            <DialogDescription className="sr-only">
                                {model.description ?? model.title}
                            </DialogDescription>
                        </DialogHeader>
                        <ContentDetailPanel model={model} />
                        {afterContent}
                    </div>
                </div>
                {resolvedFooter ? (
                    <div className="shrink-0 border-t bg-background px-6 py-4">
                        {resolvedFooter}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
