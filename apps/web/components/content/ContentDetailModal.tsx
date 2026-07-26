"use client";

import type { ReactNode } from "react";
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

export function ContentDetailModal({
    model,
    open,
    onOpenChange,
    onUse,
    afterContent,
    footer,
}: ContentDetailModalProps) {
    const useActionFooter =
        !footer && model.useAction && onUse ? (
            <DialogFooter>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onUse(model.useAction!)}
                >
                    {model.useAction.label}
                </Button>
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
