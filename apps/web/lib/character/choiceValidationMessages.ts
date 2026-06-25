import type { Locale } from "@rpv/domain";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";

export type GrantPickValidationCode =
    | "duplicateGrantPick"
    | "alreadyGranted"
    | "invalidInventoryPick"
    | "invalidCurrencyPick"
    | "invalidAbilityScorePick";

export type GrantPickValidationIssue = {
    code: GrantPickValidationCode;
    key?: string;
    ref?: string;
    label?: string;
};

type ValidationCopy = {
    grants: {
        validation: {
            duplicatePick: string;
            alreadyGranted: string;
            invalidAbilityScore: string;
        };
    };
    startingEquipment: {
        validation: {
            invalidPick: string;
            invalidCurrencyPick: string;
            exclusiveRequired: string;
        };
    };
};

const messagesByLocale: Record<Locale, ValidationCopy> = {
    en: enMessages as ValidationCopy,
    "pt-BR": ptBRMessages as ValidationCopy,
};

function interpolate(
    template: string,
    values: Record<string, string>
): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function formatExclusiveRequiredMessage(
    locale: Locale,
    groupLabel: string
): string {
    return interpolate(
        messagesByLocale[locale].startingEquipment.validation.exclusiveRequired,
        { label: groupLabel }
    );
}

export function resolveGrantPickValidationMessage(
    issue: GrantPickValidationIssue,
    locale: Locale
): string {
    const copy = messagesByLocale[locale];

    switch (issue.code) {
        case "duplicateGrantPick":
            return interpolate(copy.grants.validation.duplicatePick, {
                ref: issue.ref ?? "",
            });
        case "alreadyGranted":
            return interpolate(copy.grants.validation.alreadyGranted, {
                ref: issue.ref ?? "",
            });
        case "invalidInventoryPick":
            return interpolate(copy.startingEquipment.validation.invalidPick, {
                label: issue.label ?? issue.key ?? "",
            });
        case "invalidCurrencyPick":
            return interpolate(copy.startingEquipment.validation.invalidCurrencyPick, {
                label: issue.label ?? issue.key ?? "",
            });
        case "invalidAbilityScorePick":
            return interpolate(copy.grants.validation.invalidAbilityScore, {
                label: issue.label ?? issue.key ?? "",
            });
        default:
            return issue.label ?? issue.key ?? issue.ref ?? "";
    }
}

/** @deprecated Use findMissingRequiredChoices — kept for narrow call sites during migration */
export function isExclusiveChoiceKey(key: string): boolean {
    return key.includes(":exclusive:");
}
