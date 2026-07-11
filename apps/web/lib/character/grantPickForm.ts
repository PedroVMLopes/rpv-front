import type { UseFormReturn } from "react-hook-form";
import type { CharacterChoices } from "./storedCharacter";

export function readGrantPicks(
    form: UseFormReturn<Record<string, unknown>>
): Record<string, string> {
    const choices = form.watch("choices") as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

export function setGrantPick(
    form: UseFormReturn<Record<string, unknown>>,
    key: string,
    value: string
) {
    const current = (form.getValues("choices") as CharacterChoices | undefined) ?? {};
    form.setValue(
        "choices",
        {
            ...current,
            grantPicks: {
                ...(current.grantPicks ?? {}),
                [key]: value,
            },
        },
        { shouldDirty: true, shouldValidate: true }
    );
}
