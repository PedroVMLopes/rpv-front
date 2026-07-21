import type { UseFormReturn } from "react-hook-form";
import type { CharacterChoices } from "./storedCharacter";

export function readPreparedSpellsFromForm(
    form: UseFormReturn<Record<string, unknown>>
): string[] {
    const choices = form.watch("choices") as CharacterChoices | undefined;
    return choices?.preparedSpells ?? [];
}

export function setPreparedSpells(
    form: UseFormReturn<Record<string, unknown>>,
    preparedSpells: string[]
) {
    const current =
        (form.getValues("choices") as CharacterChoices | undefined) ?? {};
    form.setValue(
        "choices",
        {
            ...current,
            preparedSpells,
        },
        { shouldDirty: true, shouldValidate: true }
    );
}

export function togglePreparedSpell(
    form: UseFormReturn<Record<string, unknown>>,
    slug: string,
    options?: { quota?: number }
) {
    const current =
        (form.getValues("choices") as CharacterChoices | undefined) ?? {};
    const prepared = current.preparedSpells ?? [];
    const isSelected = prepared.includes(slug);

    if (!isSelected) {
        const quota = options?.quota;
        if (quota !== undefined && prepared.length >= quota) {
            return;
        }
        setPreparedSpells(form, [...prepared, slug]);
        return;
    }

    setPreparedSpells(
        form,
        prepared.filter((entry) => entry !== slug)
    );
}
