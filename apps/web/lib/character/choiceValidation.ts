import type { Locale } from "@rpv/domain";
import type { ZodObject, ZodRawShape } from "zod";
import { buildSelectionsFromForm } from "./characterAdapter";
import { grantContextFromForm } from "./characterGrants";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "./grantChoices";
import type { CharacterChoices } from "./storedCharacter";

function readGrantPicks(formData: Record<string, unknown>): Record<string, string> {
    const choices = formData.choices as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

export function findMissingRequiredChoices(
    formData: Record<string, unknown>,
    locale: Locale
): PendingChoiceGrant[] {
    const selections = buildSelectionsFromForm(formData);
    const context = grantContextFromForm(formData);
    const pending = collectPendingChoiceGrants(selections, context, locale);
    const grantPicks = readGrantPicks(formData);

    return pending.filter((choice) => {
        const picked = grantPicks[choice.key];
        return !picked || picked.trim() === "";
    });
}

export function applyChoiceValidation<T extends ZodRawShape>(
    schema: ZodObject<T>,
    locale: Locale
) {
    return schema.superRefine((data, ctx) => {
        const missing = findMissingRequiredChoices(
            data as Record<string, unknown>,
            locale
        );

        for (const choice of missing) {
            ctx.addIssue({
                code: "custom",
                path: ["choices"],
                message: choice.label,
            });
        }
    });
}
