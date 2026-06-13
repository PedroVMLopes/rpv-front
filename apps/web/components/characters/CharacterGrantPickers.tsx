"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import {
    getFixedLanguageGrants,
    getLanguageBudget,
    grantContextFromForm,
} from "@/lib/character/characterGrants";
import {
    collectLanguageChoiceGrants,
    collectNonLanguageChoiceGrants,
} from "@/lib/character/grantChoices";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { listLanguageOptions } from "@/lib/catalog/grantCatalog";
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
        { shouldDirty: true }
    );
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
    const allLanguageOptions = listLanguageOptions();
    const lockedLanguageSlugs = new Set(fixedLanguages.map((grant) => grant.ref));
    const pickedLanguageSlugs = new Set(
        languageChoices
            .map((choice) => grantPicks[choice.key])
            .filter(Boolean)
    );

    const selectableLanguageOptions = allLanguageOptions.filter(
        (option) =>
            !lockedLanguageSlugs.has(option.value) &&
            !pickedLanguageSlugs.has(option.value)
    );

    if (
        fixedLanguages.length === 0 &&
        languageChoices.length === 0 &&
        otherChoices.length === 0
    ) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-muted/30">
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
                        const optionsForSlot = [
                            ...(selected
                                ? allLanguageOptions.filter(
                                      (option) => option.value === selected
                                  )
                                : []),
                            ...selectableLanguageOptions.filter(
                                (option) => option.value !== selected
                            ),
                        ];

                        return (
                            <label
                                key={choice.key}
                                className="flex flex-col gap-1 text-sm"
                            >
                                <span className="font-medium">{choice.label}</span>
                                <select
                                    className="bg-background rounded border px-2 py-1"
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
                                    {optionsForSlot.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
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
                    {otherChoices.map((choice) => (
                        <label
                            key={choice.key}
                            className="flex flex-col gap-1 text-sm"
                        >
                            <span className="font-medium">{choice.label}</span>
                            <select
                                className="bg-background rounded border px-2 py-1"
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
                                {choice.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}
                </section>
            )}
        </div>
    );
}
