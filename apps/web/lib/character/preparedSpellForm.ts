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
    slug: string
) {
    const current =
        (form.getValues("choices") as CharacterChoices | undefined) ?? {};
    const prepared = current.preparedSpells ?? [];
    const next = prepared.includes(slug)
        ? prepared.filter((entry) => entry !== slug)
        : [...prepared, slug];

    setPreparedSpells(form, next);
}
