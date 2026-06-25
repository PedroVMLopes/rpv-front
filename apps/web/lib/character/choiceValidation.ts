import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import type { SystemKey } from "@/presets";
import {
    getClassSubclassLevel,
    getSubclass,
    isValidAbilityScorePick,
    isValidCurrencyPick,
    isValidInventoryItemPick,
} from "@rpv/content";
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
import {
    currencyChoiceToPending,
    deriveStartingEquipmentFromForm,
    inventoryChoiceToPending,
} from "./deriveStartingEquipmentFromForm";
import { findMissingExclusiveGroupPicks } from "./startingEquipmentValidation";
import {
    formatExclusiveRequiredMessage,
    isExclusiveChoiceKey,
    resolveGrantPickValidationMessage,
    type GrantPickValidationIssue,
} from "./choiceValidationMessages";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";

const validationMessages: Record<Locale, { subclassRequired: string }> = {
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
    locale: Locale,
    system: SystemKey
): Map<Grant["grantType"], Set<string>> {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
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

function exclusiveGroupToPendingChoice(
    group: { key: string; label: string; source: { type: string; id: string } },
    locale: Locale
): PendingChoiceGrant {
    return {
        key: group.key,
        grant: {
            grantType: "currency",
            choose: 1,
            description: group.label,
        },
        source: {
            type: group.source.type as PendingChoiceGrant["source"]["type"],
            id: group.source.id,
        },
        label: formatExclusiveRequiredMessage(locale, group.label),
        options: [],
    };
}

export function findMissingRequiredChoices(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): PendingChoiceGrant[] {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).filter(
        (choice) =>
            choice.grant.grantType !== "inventory_item" &&
            choice.grant.grantType !== "currency"
    );
    const grantPicks = readGrantPicks(formData);
    const missing = pending.filter((choice) => {
        const picked = grantPicks[choice.key];
        return !picked || picked.trim() === "";
    });

    const preview = deriveStartingEquipmentFromForm(formData, locale, system);

    for (const choice of preview.choiceGrants) {
        const picked = grantPicks[choice.key];
        if (!picked || picked.trim() === "") {
            missing.push(inventoryChoiceToPending(choice, system, locale));
        }
    }

    for (const choice of preview.currencyChoiceGrants) {
        const picked = grantPicks[choice.key];
        if (!picked || picked.trim() === "") {
            missing.push(currencyChoiceToPending(choice));
        }
    }

    for (const group of findMissingExclusiveGroupPicks(formData, locale, system)) {
        missing.push(exclusiveGroupToPendingChoice(group, locale));
    }

    return missing;
}

export function findInvalidGrantPicks(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): GrantPickValidationIssue[] {
    const selections = buildSelectionsFromForm(formData);
    const characterLevel = readLevelFromForm(formData);
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).filter(
        (choice) =>
            choice.grant.grantType !== "inventory_item" &&
            choice.grant.grantType !== "currency"
    );
    const grantPicks = readGrantPicks(formData);
    const ownedRefsByGrantType = buildOwnedRefsByGrantType(formData, locale, system);
    const errors: GrantPickValidationIssue[] = [];

    for (const duplicate of findDuplicateGrantPicksInPool(pending, grantPicks)) {
        errors.push({
            code: "duplicateGrantPick",
            ref: duplicate.ref,
        });
    }

    for (const invalid of findGrantPicksOnOwnedRefs(
        pending,
        grantPicks,
        ownedRefsByGrantType
    )) {
        errors.push({
            code: "alreadyGranted",
            ref: invalid.ref,
        });
    }

    for (const choice of pending) {
        if (choice.grant.grantType !== "inventory_item") {
            continue;
        }

        const pick = grantPicks[choice.key]?.trim();
        if (!pick) {
            continue;
        }

        if (!isValidInventoryItemPick(choice.grant, pick, system)) {
            errors.push({
                code: "invalidInventoryPick",
                key: choice.key,
                label: choice.label,
            });
        }
    }

    for (const choice of pending) {
        if (choice.grant.grantType !== "ability_score") {
            continue;
        }

        const pick = grantPicks[choice.key]?.trim();
        if (!pick) {
            continue;
        }

        if (!isValidAbilityScorePick(choice.grant, pick)) {
            errors.push({
                code: "invalidAbilityScorePick",
                key: choice.key,
                label: choice.label,
            });
        }
    }

    const preview = deriveStartingEquipmentFromForm(formData, locale, system);

    for (const choice of preview.choiceGrants) {
        const pick = grantPicks[choice.key]?.trim();
        if (!pick) {
            continue;
        }

        if (!isValidInventoryItemPick(choice.grant, pick, system)) {
            errors.push({
                code: "invalidInventoryPick",
                key: choice.key,
                label: choice.label,
            });
        }
    }

    for (const choice of preview.currencyChoiceGrants) {
        const pick = grantPicks[choice.key]?.trim();
        if (!pick) {
            continue;
        }

        if (!isValidCurrencyPick(choice.grant, pick)) {
            errors.push({
                code: "invalidCurrencyPick",
                key: choice.key,
                label: choice.label,
            });
        }
    }

    return errors;
}

export function applyChoiceValidation<T extends ZodRawShape>(
    schema: ZodObject<T>,
    locale: Locale,
    system: SystemKey
) {
    return schema.superRefine((data, ctx) => {
        const formData = data as Record<string, unknown>;

        const missing = findMissingRequiredChoices(formData, locale, system);
        for (const choice of missing) {
            ctx.addIssue({
                code: "custom",
                path: ["choices"],
                message: choice.label,
            });
        }

        for (const issue of findInvalidGrantPicks(formData, locale, system)) {
            ctx.addIssue({
                code: "custom",
                path: ["choices"],
                message: resolveGrantPickValidationMessage(issue, locale),
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

export { isExclusiveChoiceKey, resolveGrantPickValidationMessage };
