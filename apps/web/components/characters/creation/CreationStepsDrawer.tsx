"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CreationStepsDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
};

export function CreationStepsDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
}: CreationStepsDrawerProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "fixed inset-y-0 left-0 top-0 flex h-full w-[min(100%,20rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-r p-0 sm:max-w-none",
                    "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
                )}
            >
                <DialogHeader className="border-b px-4 py-3 text-left">
                    <DialogTitle>{title}</DialogTitle>
                    {description ? (
                        <DialogDescription>{description}</DialogDescription>
                    ) : null}
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
