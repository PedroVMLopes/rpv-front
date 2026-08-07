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
import {
    ContentDetailPanel,
    type ContentDetailQuantityHandlers,
} from "./ContentDetailPanel";

type ContentDetailModalProps = {
    model: ContentDetailModel;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUse?: (useAction: ContentUseActionSpec) => void;
    afterContent?: ReactNode;
    footer?: ReactNode;
    quantityHandlers?: ContentDetailQuantityHandlers;
    onDelete?: () => void;
    deleteLabel?: string;
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
    quantityHandlers,
    onDelete,
    deleteLabel,
}: ContentDetailModalProps) {
    const t = useTranslations("contentDetail");
    const useActions = resolveUseActions(model);

    const useActionButtons =
        useActions.length > 0 && onUse ? (
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
                            <span className="pl-1 text-[10px] leading-tight text-muted-foreground">
                                {t(action.captionKey)}
                            </span>
                        ) : null}
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={action.disabled}
                            onClick={() => onUse(action)}
                        >
                            {action.label}
                        </Button>
                    </div>
                ))}
            </div>
        ) : null;

    const deleteButton =
        onDelete && deleteLabel ? (
            <Button type="button" variant="destructive" onClick={onDelete}>
                {deleteLabel}
            </Button>
        ) : null;

    const composedFooter =
        !footer && (useActionButtons || deleteButton) ? (
            <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
                {deleteButton}
                {useActionButtons}
            </DialogFooter>
        ) : null;

    const resolvedFooter = footer ?? composedFooter;

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
                        <ContentDetailPanel
                            model={model}
                            quantityHandlers={quantityHandlers}
                        />
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
