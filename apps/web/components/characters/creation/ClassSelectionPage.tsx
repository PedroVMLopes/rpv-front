"use client";

import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { CatalogSelectionPage } from "@/components/characters/creation/CatalogSelectionPage";
import { CharacterLevelSelector } from "@/components/characters/CharacterLevelSelector";
import { SelectionChangeConfirmDialog } from "@/components/characters/creation/SelectionChangeConfirmDialog";
import { useSelectionChangeGuard } from "@/lib/character/creation/useSelectionChangeGuard";
import { readLevelFromForm } from "@/lib/character/level";
import type { SystemKey } from "@/presets";

type ClassSelectionPageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function ClassSelectionPage({
    form,
    contentLocale,
    system,
}: ClassSelectionPageProps) {
    const guard = useSelectionChangeGuard(form);

    const applyLevel = useCallback(
        (nextLevel: number) => {
            form.setValue("level", nextLevel, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [form]
    );

    const handleBeforeLevelChange = useCallback(
        (nextLevel: number) => {
            const currentLevel = readLevelFromForm(form.getValues());

            if (nextLevel === currentLevel) {
                return;
            }

            requestChange("level", () => applyLevel(nextLevel));
        },
        [applyLevel, form, guard.requestChange]
    );

    return (
        <div className="flex flex-col gap-6">
            <CatalogSelectionPage
                formField="characterClass"
                form={form}
                contentLocale={contentLocale}
                system={system}
                guard={guard}
            />
            <CharacterLevelSelector
                form={form}
                onBeforeLevelChange={handleBeforeLevelChange}
            />
            <SelectionChangeConfirmDialog
                field={guard.pending?.field ?? null}
                open={Boolean(guard.pending)}
                onConfirm={guard.confirm}
                onCancel={guard.cancel}
            />
        </div>
    );
}
