"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { SpellChoiceGrid } from "@/components/characters/creation/spells/SpellChoiceGrid";
import type { CreationStepSourceFilter } from "@/lib/character/creationSteps/creationStep.types";
import { filterChoicesForStep } from "@/lib/character/creationSteps/stepFilters";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { collectPendingChoiceGrants } from "@/lib/character/grantChoices";
import { readLevelFromForm } from "@/lib/character/level";
import type { SystemKey } from "@/presets";

type GrantChoicePageProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    stepFilter?: CreationStepSourceFilter;
    focusKey?: string;
};

export function GrantChoicePage({
    form,
    contentLocale,
    system,
    stepFilter,
    focusKey,
}: GrantChoicePageProps) {
    const formValues = form.watch();

    const spellChoices = useMemo(() => {
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);
        const pending = collectPendingChoiceGrants(
            selections,
            contentLocale,
            characterLevel,
            system
        );

        return filterChoicesForStep(
            pending.filter((choice) => choice.grant.grantType === "spell"),
            stepFilter
        );
    }, [formValues, contentLocale, system, stepFilter]);

    if (spellChoices.length > 0) {
        return (
            <SpellChoiceGrid
                form={form}
                contentLocale={contentLocale}
                system={system}
                choices={spellChoices}
                focusKey={focusKey}
            />
        );
    }

    return (
        <CharacterGrantPickers
            form={form}
            contentLocale={contentLocale}
            system={system}
            stepFilter={stepFilter}
            sections="choices-only"
            focusKey={focusKey}
        />
    );
}
