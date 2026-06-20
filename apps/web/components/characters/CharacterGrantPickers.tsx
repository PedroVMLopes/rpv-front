"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import {
    getFixedLanguageGrants,
    getFixedRefsForGrantType,
    getLanguageBudget,
    grantContextFromForm,
} from "@/lib/character/characterGrants";
import {
    collectLanguageChoiceGrants,
    collectNonLanguageChoiceGrants,
    collectPendingChoiceGrants,
} from "@/lib/character/grantChoices";
import {
    buildGrantChoiceSelectOptions,
    getOtherPickedRefsForGrantType,
} from "@/lib/character/grantChoiceOptions";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import {
    findInvalidGrantPicks,
    findMissingRequiredChoices,
} from "@/lib/character/choiceValidation";
import type { CharacterChoices } from "@/lib/character/storedCharacter";

type CharacterGrantPickersProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
};

function readGrantPicks(form: UseFormReturn<Record<string, unknown>>): Record<string, string> {
    const choices = form.watch("choices") as CharacterChoices | undefined;
    return choices?.grantPicks ?? {};
}

function setGrantPick(
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

function buildOwnedRefsByGrantType(
    selections: ReturnType<typeof buildSelectionsFromForm>,
    context: ReturnType<typeof grantContextFromForm>,
    contentLocale: Locale,
    pending: ReturnType<typeof collectPendingChoiceGrants>
): Map<Grant["grantType"], Set<string>> {
    const grantTypes = new Set(pending.map((choice) => choice.grant.grantType));
    const owned = new Map<Grant["grantType"], Set<string>>();

    for (const grantType of grantTypes) {
        owned.set(
            grantType,
            getFixedRefsForGrantType(selections, context, contentLocale, grantType)
        );
    }

    return owned;
}

export function CharacterGrantPickers({
    form,
    contentLocale,
}: CharacterGrantPickersProps) {
    const t = useTranslations("grants");
    const formValues = form.watch();

    const selections = useMemo(
        () => buildSelectionsFromForm(formValues),
        [formValues]
    );

    const context = useMemo(
        () => grantContextFromForm(formValues),
        [formValues]
    );

    const pendingChoices = useMemo(
        () => collectPendingChoiceGrants(selections, context, contentLocale),
        [selections, context, contentLocale]
    );

    const ownedRefsByGrantType = useMemo(
        () =>
            buildOwnedRefsByGrantType(
                selections,
                context,
                contentLocale,
                pendingChoices
            ),
        [selections, context, contentLocale, pendingChoices]
    );

    const fixedLanguages = useMemo(
        () => getFixedLanguageGrants(selections, context, contentLocale),
        [selections, context, contentLocale]
    );

    const languageChoices = useMemo(
        () => collectLanguageChoiceGrants(selections, context, contentLocale),
        [selections, context, contentLocale]
    );

    const otherChoices = useMemo(
        () => collectNonLanguageChoiceGrants(selections, context, contentLocale),
        [selections, context, contentLocale]
    );

    const languageBudget = useMemo(
        () => getLanguageBudget(selections, context, contentLocale),
        [selections, context, contentLocale]
    );

    const grantPicks = readGrantPicks(form);
    const choicesError = form.formState.errors.choices;
    const missingChoices = useMemo(
        () => findMissingRequiredChoices(formValues, contentLocale),
        [formValues, contentLocale]
    );
    const invalidPicks = useMemo(
        () => findInvalidGrantPicks(formValues, contentLocale),
        [formValues, contentLocale]
    );
    const missingChoiceKeys = useMemo(
        () => new Set(missingChoices.map((choice) => choice.key)),
        [missingChoices]
    );
    const hasChoiceIssues = missingChoices.length > 0 || invalidPicks.length > 0;

    const ownedLanguageRefs =
        ownedRefsByGrantType.get("language") ??
        new Set(fixedLanguages.map((grant) => grant.ref));

    if (
        fixedLanguages.length === 0 &&
        languageChoices.length === 0 &&
        otherChoices.length === 0
    ) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-muted/30">
            {choicesError && hasChoiceIssues ? (
                <p className="text-sm font-medium text-destructive">
                    {t("choicesIncomplete")}
                </p>
            ) : null}
            {(fixedLanguages.length > 0 || languageChoices.length > 0) && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">{t("languagesTitle")}</h2>

                    {fixedLanguages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {fixedLanguages.map((grant) => (
                                <span
                                    key={grant.id}
                                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                                >
                                    {grant.name ?? grant.ref}
                                    <span className="ml-1 opacity-60">
                                        ({t("autoKnown")})
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    {languageBudget > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {t("languageBudget", { count: languageBudget })}
                        </p>
                    )}

                    {languageChoices.map((choice) => {
                        const selected = grantPicks[choice.key] ?? "";
                        const otherLanguagePicks = getOtherPickedRefsForGrantType(
                            "language",
                            languageChoices,
                            grantPicks,
                            choice.key
                        );
                        const options = buildGrantChoiceSelectOptions(
                            choice,
                            grantPicks,
                            ownedLanguageRefs,
                            otherLanguagePicks
                        );

                        return (
                            <label
                                key={choice.key}
                                className="flex flex-col gap-1 text-sm"
                            >
                                <span className="font-medium">{choice.label}</span>
                                <select
                                    className={`bg-background rounded border px-2 py-1${
                                        missingChoiceKeys.has(choice.key)
                                            ? " border-destructive"
                                            : ""
                                    }`}
                                    value={selected}
                                    onChange={(event) =>
                                        setGrantPick(
                                            form,
                                            choice.key,
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">{t("selectLanguage")}</option>
                                    {options.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        );
                    })}
                </section>
            )}

            {otherChoices.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">{t("abilityChoicesTitle")}</h2>
                    {otherChoices.map((choice) => {
                        const ownedRefs =
                            ownedRefsByGrantType.get(choice.grant.grantType) ??
                            new Set<string>();
                        const options = buildGrantChoiceSelectOptions(
                            choice,
                            grantPicks,
                            ownedRefs
                        );

                        return (
                            <label
                                key={choice.key}
                                className="flex flex-col gap-1 text-sm"
                            >
                                <span className="font-medium">{choice.label}</span>
                                <select
                                    className={`bg-background rounded border px-2 py-1${
                                        missingChoiceKeys.has(choice.key)
                                            ? " border-destructive"
                                            : ""
                                    }`}
                                    value={grantPicks[choice.key] ?? ""}
                                    onChange={(event) =>
                                        setGrantPick(
                                            form,
                                            choice.key,
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">{t("selectOption")}</option>
                                    {options.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        );
                    })}
                </section>
            )}
        </div>
    );
}
