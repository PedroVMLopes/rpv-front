"use client";

import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { readLevelFromForm } from "@/lib/character/level";
import { readGrantPicks } from "@/lib/character/grantPickForm";

export type GuardedSelectionField =
    | "race"
    | "subrace"
    | "characterClass"
    | "level";

export type PendingSelectionChange = {
    field: GuardedSelectionField;
    apply: () => void;
};

function hasGrantPicks(form: UseFormReturn<Record<string, unknown>>): boolean {
    const picks = readGrantPicks(form);
    return Object.values(picks).some((value) => value?.trim());
}

function hasDownstreamSelections(
    form: UseFormReturn<Record<string, unknown>>,
    field: GuardedSelectionField
): boolean {
    const subclass = form.getValues("subclass");
    const subrace = form.getValues("subrace");

    if (field === "race") {
        return Boolean(subrace) || Boolean(subclass) || hasGrantPicks(form);
    }

    if (field === "subrace") {
        return hasGrantPicks(form);
    }

    if (field === "characterClass") {
        return Boolean(subclass) || hasGrantPicks(form);
    }

    if (field === "level") {
        return Boolean(subclass) || hasGrantPicks(form);
    }

    return hasGrantPicks(form);
}

export function useSelectionChangeGuard(
    form: UseFormReturn<Record<string, unknown>>
) {
    const [pending, setPending] = useState<PendingSelectionChange | null>(null);

    const requestChange = useCallback(
        (field: GuardedSelectionField, apply: () => void) => {
            if (!hasDownstreamSelections(form, field)) {
                apply();
                return;
            }

            setPending({ field, apply });
        },
        [form]
    );

    const confirm = useCallback(() => {
        pending?.apply();
        setPending(null);
    }, [pending]);

    const cancel = useCallback(() => {
        setPending(null);
    }, []);

    return {
        pending,
        requestChange,
        confirm,
        cancel,
    };
}

export function mapFormFieldToGuardedField(
    formField: string
): GuardedSelectionField | undefined {
    switch (formField) {
        case "race":
            return "race";
        case "subrace":
            return "subrace";
        case "characterClass":
            return "characterClass";
        default:
            return undefined;
    }
}

export function readCurrentLevel(
    form: UseFormReturn<Record<string, unknown>>
): number {
    return readLevelFromForm(form.getValues());
}
