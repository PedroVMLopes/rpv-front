"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { buildSelectionsFromForm } from "./characterAdapter";
import { sanitizeGrantPicks } from "./grantPickSanitize";
import type { CharacterChoices } from "./storedCharacter";

/**
 * Prunes stale grantPicks in the form when race, subrace, class, or background
 * changes so the UI does not show picks from a previous selection.
 */
export function useGrantPickSanitizer(
    form: UseFormReturn<Record<string, unknown>>,
    contentLocale: Locale
) {
    const race = form.watch("race");
    const subrace = form.watch("subrace");
    const characterClass = form.watch("characterClass");
    const background = form.watch("background");
    const startingItem = form.watch("startingItem");

    useEffect(() => {
        const formValues = form.getValues();
        const selections = buildSelectionsFromForm(formValues);
        const sanitized = sanitizeGrantPicks(selections, contentLocale);
        const current =
            (form.getValues("choices") as CharacterChoices | undefined) ?? {};
        const currentPicks = current.grantPicks ?? {};
        const sanitizedPicks = sanitized.choices.grantPicks ?? {};

        if (
            JSON.stringify(currentPicks) === JSON.stringify(sanitizedPicks)
        ) {
            return;
        }

        form.setValue(
            "choices",
            { ...current, grantPicks: sanitizedPicks },
            { shouldDirty: true, shouldValidate: true }
        );
    }, [
        form,
        contentLocale,
        race,
        subrace,
        characterClass,
        background,
        startingItem,
    ]);
}
