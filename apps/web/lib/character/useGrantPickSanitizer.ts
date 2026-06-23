"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { sanitizeSelections } from "./grantPickSanitize";
import { readLevelFromForm } from "./level";
import type { CharacterChoices } from "./storedCharacter";

/**
 * Prunes stale grantPicks and invalid subclass selections when race, subrace,
 * class, subclass, or background changes.
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
    const startingItem = form.watch("startingItem");
    const level = form.watch("level");

    useEffect(() => {
        const formValues = form.getValues();
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);
        const sanitized = sanitizeSelections(
            selections,
            contentLocale,
            system,
            characterLevel
        );
        const current =
            (form.getValues("choices") as CharacterChoices | undefined) ?? {};
        const currentPicks = current.grantPicks ?? {};
        const sanitizedPicks = sanitized.choices.grantPicks ?? {};

        if (sanitized.subclass !== selections.subclass) {
            form.setValue("subclass", sanitized.subclass ?? "", {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

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
        system,
        race,
        subrace,
        characterClass,
        subclass,
        background,
        startingItem,
        level,
    ]);
}
