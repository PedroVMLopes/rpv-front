"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { sanitizeSelectionsWithStartingMaterialization } from "./grantPickSanitize";
import { readLevelFromForm } from "./level";
import type { CharacterChoices } from "./storedCharacter";

function startingPickSignature(grantPicks: Record<string, string>): string {
    return JSON.stringify(
        Object.entries(grantPicks)
            .filter(
                ([key]) =>
                    key.includes(":exclusive:") ||
                    key.includes(":inventory_item:") ||
                    key.includes(":currency:")
            )
            .sort(([a], [b]) => a.localeCompare(b))
    );
}

/**
 * Prunes stale grantPicks, rematerializes granted inventory/currency, and
 * clears invalid subclass when race, class, background, level, or starting
 * equipment picks change.
 */
export function useGrantPickSanitizer(
    form: UseFormReturn<Record<string, unknown>>,
    contentLocale: Locale,
    system: SystemKey
) {
    const race = form.watch("race");
    const subrace = form.watch("subrace");
    const characterClass = form.watch("characterClass");
    const subclass = form.watch("subclass");
    const background = form.watch("background");
    const level = form.watch("level");
    const choices = form.watch("choices") as CharacterChoices | undefined;
    const startingPickHash = useMemo(
        () => startingPickSignature(choices?.grantPicks ?? {}),
        [choices?.grantPicks]
    );

    useEffect(() => {
        const formValues = form.getValues();
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);
        const sanitized = sanitizeSelectionsWithStartingMaterialization(
            selections,
            contentLocale,
            system,
            characterLevel
        );
        const current =
            (form.getValues("choices") as CharacterChoices | undefined) ?? {};
        const currentPicks = current.grantPicks ?? {};
        const sanitizedPicks = sanitized.choices.grantPicks ?? {};
        const currentInventory = form.getValues("inventory");

        if (sanitized.subclass !== selections.subclass) {
            form.setValue("subclass", sanitized.subclass ?? "", {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

        const picksChanged =
            JSON.stringify(currentPicks) !== JSON.stringify(sanitizedPicks);
        const inventoryChanged =
            JSON.stringify(currentInventory) !==
            JSON.stringify(sanitized.inventory);

        if (!picksChanged && !inventoryChanged) {
            return;
        }

        if (picksChanged) {
            form.setValue(
                "choices",
                { ...current, grantPicks: sanitizedPicks },
                { shouldDirty: true, shouldValidate: true }
            );
        }

        if (inventoryChanged) {
            form.setValue("inventory", sanitized.inventory, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [
        form,
        contentLocale,
        system,
        race,
        subrace,
        characterClass,
        subclass,
        background,
        level,
        startingPickHash,
    ]);
}
