"use client";

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
};

export function ContentDetailModal({
    model,
    open,
    onOpenChange,
    onUse,
}: ContentDetailModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{model.title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {model.description ?? model.title}
                    </DialogDescription>
                </DialogHeader>
                <ContentDetailPanel model={model} />
                {model.useAction && onUse ? (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onUse(model.useAction!)}
                        >
                            {model.useAction.label}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
