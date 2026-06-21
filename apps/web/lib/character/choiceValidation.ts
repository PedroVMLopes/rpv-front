import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import { getClassSubclassLevel, getSubclass } from "@rpv/content";
import type { ZodObject, ZodRawShape } from "zod";
import { buildSelectionsFromForm } from "./characterAdapter";
import { getFixedRefsForGrantType } from "./characterGrants";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "./grantChoices";
import {
    findDuplicateGrantPicksInPool,
    findGrantPicksOnOwnedRefs,
} from "./grantChoiceOptions";
import type { CharacterChoices } from "./storedCharacter";
import { readLevelFromForm } from "./level";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";

const validationMessages: Record<
    Locale,
    { subclassRequired: string }
> = {
    en: enMessages.validation,
    "pt-BR": ptBRMessages.validation,
};

function readSubclass(formData: Record<string, unknown>): string {
    const subclass = formData.subclass;
    return typeof subclass === "string" ? subclass.trim() : "";
}

export function findMissingSubclass(
    formData: Record<string, unknown>,
    locale: Locale
): boolean {
    const characterClass =
        typeof formData.characterClass === "string"
            ? formData.characterClass.trim()
            : "";
    if (!characterClass) {
        return false;
    }

    const subclassLevel = getClassSubclassLevel(characterClass);
    if (subclassLevel === undefined) {
        return false;
    }

    const characterLevel = readLevelFromForm(formData);
    if (characterLevel < subclassLevel) {
        return false;
    }

    const subclass = readSubclass(formData);
    if (!subclass) {
        return true;
    }

    const entry = getSubclass(subclass, locale);
    return !entry || entry.classSlug !== characterClass;
}

function readGrantPicks(formData: Record<string, unknown>): Record<string, string> {
    const choices = formData.choices as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

function buildOwnedRefsByGrantType(
    formData: Record<string, unknown>,
    locale: Locale
): Map<Grant["grantType"], Set<string>> {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    );
    const grantTypes = new Set(pending.map((choice) => choice.grant.grantType));
    const owned = new Map<Grant["grantType"], Set<string>>();

    for (const grantType of grantTypes) {
        owned.set(
            grantType,
            getFixedRefsForGrantType(
                selections,
                locale,
                grantType,
                characterLevel
            )
        );
    }

    return owned;
}

export function findMissingRequiredChoices(
    formData: Record<string, unknown>,
    locale: Locale
): PendingChoiceGrant[] {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    );
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
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    );
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

        if (findMissingSubclass(formData, locale)) {
            ctx.addIssue({
                code: "custom",
                path: ["subclass"],
                message: validationMessages[locale].subclassRequired,
            });
        }
    });
}
