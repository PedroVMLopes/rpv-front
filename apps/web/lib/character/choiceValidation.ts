import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import type { ZodObject, ZodRawShape } from "zod";
import { buildSelectionsFromForm } from "./characterAdapter";
import {
    getFixedRefsForGrantType,
    grantContextFromForm,
} from "./characterGrants";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "./grantChoices";
import {
    findDuplicateGrantPicksInPool,
    findGrantPicksOnOwnedRefs,
} from "./grantChoiceOptions";
import type { CharacterChoices } from "./storedCharacter";

function readGrantPicks(formData: Record<string, unknown>): Record<string, string> {
    const choices = formData.choices as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

function buildOwnedRefsByGrantType(
    formData: Record<string, unknown>,
    locale: Locale
): Map<Grant["grantType"], Set<string>> {
    const selections = buildSelectionsFromForm(formData);
    const context = grantContextFromForm(formData);
    const pending = collectPendingChoiceGrants(selections, context, locale);
    const grantTypes = new Set(pending.map((choice) => choice.grant.grantType));
    const owned = new Map<Grant["grantType"], Set<string>>();

    for (const grantType of grantTypes) {
        owned.set(
            grantType,
            getFixedRefsForGrantType(selections, context, locale, grantType)
        );
    }

    return owned;
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

export function findInvalidGrantPicks(
    formData: Record<string, unknown>,
    locale: Locale
): string[] {
    const selections = buildSelectionsFromForm(formData);
    const context = grantContextFromForm(formData);
    const pending = collectPendingChoiceGrants(selections, context, locale);
    const grantPicks = readGrantPicks(formData);
    const ownedRefsByGrantType = buildOwnedRefsByGrantType(formData, locale);
    const errors: string[] = [];

    for (const duplicate of findDuplicateGrantPicksInPool(pending, grantPicks)) {
        errors.push(`duplicateGrantPick:${duplicate.ref}`);
    }

    for (const invalid of findGrantPicksOnOwnedRefs(
        pending,
        grantPicks,
        ownedRefsByGrantType
    )) {
        errors.push(`alreadyGranted:${invalid.ref}`);
    }

    return errors;
}

export function applyChoiceValidation<T extends ZodRawShape>(
    schema: ZodObject<T>,
    locale: Locale
) {
    return schema.superRefine((data, ctx) => {
        const formData = data as Record<string, unknown>;

        const missing = findMissingRequiredChoices(formData, locale);
        for (const choice of missing) {
            ctx.addIssue({
                code: "custom",
                path: ["choices"],
                message: choice.label,
            });
        }

        for (const errorKey of findInvalidGrantPicks(formData, locale)) {
            ctx.addIssue({
                code: "custom",
                path: ["choices"],
                message: errorKey,
            });
        }
    });
}
