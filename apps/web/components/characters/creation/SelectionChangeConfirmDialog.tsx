"use client";

import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GuardedSelectionField } from "@/lib/character/creation/useSelectionChangeGuard";

type SelectionChangeConfirmDialogProps = {
    field: GuardedSelectionField | null;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function fieldLabelKey(field: GuardedSelectionField): string {
    switch (field) {
        case "race":
            return "race";
        case "subrace":
            return "subrace";
        case "characterClass":
            return "class";
        case "level":
            return "levelLabel";
    }
}

function resolveFieldLabel(
    field: GuardedSelectionField,
    t: ReturnType<typeof useTranslations<"characterCreation">>
): string {
    const key = fieldLabelKey(field);

    if (field === "level") {
        return t("level.label");
    }

    if (field === "subrace") {
        return t("steps.subrace");
    }

    return t(`macro.${key}` as never);
}

export function SelectionChangeConfirmDialog({
    field,
    open,
    onConfirm,
    onCancel,
}: SelectionChangeConfirmDialogProps) {
    const t = useTranslations("characterCreation");

    if (!field) {
        return null;
    }

    const fieldLabel = resolveFieldLabel(field, t);

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onCancel();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("reset.title", { field: fieldLabel })}
                    </DialogTitle>
                    <DialogDescription>
                        {t("reset.body", { field: fieldLabel })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {t("reset.cancel")}
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        {t("reset.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
