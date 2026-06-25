"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale, ModifierSource } from "@rpv/domain";
import { getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";
import {
    deriveStartingEquipmentFromForm,
    hasStartingEquipmentContent,
    inventoryChoiceToPending,
} from "@/lib/character/deriveStartingEquipmentFromForm";
import { buildGrantChoiceSelectOptions } from "@/lib/character/grantChoiceOptions";
import {
    findInvalidGrantPicks,
    findMissingRequiredChoices,
} from "@/lib/character/choiceValidation";
import { bagStackReactKey } from "@/lib/character/inventory";
import type { CharacterChoices } from "@/lib/character/storedCharacter";

type StartingEquipmentFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
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

function formatSourceLabel(
    source: ModifierSource,
    t: ReturnType<typeof useTranslations<"startingEquipment">>
): string {
    switch (source.type) {
        case "class":
            return t("sourceClass", { id: source.id });
        case "background":
            return t("sourceBackground", { id: source.id });
        default:
            return `${source.type}: ${source.id}`;
    }
}

function formatCurrencyLine(
    currency: Record<string, number>,
    label: string
): string | null {
    const parts = (["gold", "silver", "bronze"] as const)
        .filter((ref) => (currency[ref] ?? 0) > 0)
        .map((ref) => `${currency[ref]} ${ref}`);

    if (parts.length === 0) {
        return null;
    }

    return `${label}: ${parts.join(", ")}`;
}

export function StartingEquipmentField({
    form,
    contentLocale,
    system,
}: StartingEquipmentFieldProps) {
    const t = useTranslations("startingEquipment");
    const watchedValues = form.watch();

    const formSnapshot = useMemo(
        () => ({
            characterClass: watchedValues.characterClass,
            background: watchedValues.background,
            level: watchedValues.level,
            choices: watchedValues.choices,
            inventory: watchedValues.inventory,
            gold: watchedValues.gold,
            silver: watchedValues.silver,
            bronze: watchedValues.bronze,
        }),
        [
            watchedValues.characterClass,
            watchedValues.background,
            watchedValues.level,
            watchedValues.choices,
            watchedValues.inventory,
            watchedValues.gold,
            watchedValues.silver,
            watchedValues.bronze,
        ]
    );

    const preview = useMemo(
        () => deriveStartingEquipmentFromForm(formSnapshot, contentLocale, system),
        [formSnapshot, contentLocale, system]
    );

    const grantPicks = readGrantPicks(form);
    const choicesError = form.formState.errors.choices;
    const missingChoices = useMemo(
        () =>
            findMissingRequiredChoices(formSnapshot, contentLocale, system).filter(
                (choice) => choice.grant.grantType === "inventory_item"
            ),
        [formSnapshot, contentLocale, system]
    );
    const invalidPicks = useMemo(
        () => findInvalidGrantPicks(formSnapshot, contentLocale, system),
        [formSnapshot, contentLocale, system]
    );
    const missingChoiceKeys = useMemo(
        () => new Set(missingChoices.map((choice) => choice.key)),
        [missingChoices]
    );
    const invalidInventoryKeys = useMemo(
        () =>
            new Set(
                invalidPicks
                    .filter((error) => error.startsWith("invalidInventoryPick:"))
                    .map((error) => error.slice("invalidInventoryPick:".length))
            ),
        [invalidPicks]
    );
    const hasChoiceIssues = missingChoices.length > 0 || invalidInventoryKeys.size > 0;

    if (!hasStartingEquipmentContent(preview)) {
        return null;
    }

    const manualCurrencyLine = formatCurrencyLine(
        preview.manualCurrency,
        t("currencyManual")
    );
    const grantedCurrencyLine = formatCurrencyLine(
        preview.grantedCurrency,
        t("currencyGranted")
    );
    const totalCurrencyLine = formatCurrencyLine(
        preview.totalCurrency,
        t("currencyTotal")
    );

    return (
        <section className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
            <h2 className="text-sm font-bold">{t("title")}</h2>

            {choicesError && hasChoiceIssues ? (
                <p className="text-sm font-medium text-destructive">
                    {t("choicesIncomplete")}
                </p>
            ) : null}

            {preview.fixedItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">{t("autoGranted")}</h3>
                    <div className="flex flex-wrap gap-2">
                        {preview.fixedItems.map((item) => (
                            <span
                                key={`${item.source.type}:${item.source.id}:${item.slug}`}
                                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                            >
                                {item.quantity > 1
                                    ? `${item.name} ×${item.quantity}`
                                    : item.name}
                                <span className="ml-1 opacity-60">
                                    ({formatSourceLabel(item.source, t)})
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {preview.choiceGrants.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">{t("choicesTitle")}</h3>
                    {preview.choiceGrants.map((choice) => {
                        const pending = inventoryChoiceToPending(choice, system);
                        const options = buildGrantChoiceSelectOptions(
                            pending,
                            grantPicks,
                            new Set<string>()
                        );
                        const hasError =
                            missingChoiceKeys.has(choice.key) ||
                            invalidInventoryKeys.has(choice.key);

                        return (
                            <label
                                key={choice.key}
                                className="flex flex-col gap-1 text-sm"
                            >
                                <span className="font-medium">{choice.label}</span>
                                <select
                                    className={`rounded border bg-background px-2 py-1${
                                        hasError ? " border-destructive" : ""
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
                </div>
            ) : null}

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">{t("bagTitle")}</h3>
                {preview.bag.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t("bagEmpty")}</p>
                ) : (
                    <ul className="flex flex-col gap-1 text-sm">
                        {preview.bag.map((stack) => {
                            const itemName =
                                getItem(stack.slug, system)?.name ?? stack.slug;
                            return (
                                <li
                                    key={bagStackReactKey(stack)}
                                    className="flex flex-wrap items-center gap-2"
                                >
                                    <span>
                                        {stack.quantity > 1
                                            ? `${itemName} ×${stack.quantity}`
                                            : itemName}
                                    </span>
                                    {stack.provenance ? (
                                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                            {t("provenanceGrant", {
                                                provenance: stack.provenance,
                                            })}
                                        </span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {manualCurrencyLine || grantedCurrencyLine || totalCurrencyLine ? (
                <div className="flex flex-col gap-1 text-sm">
                    {manualCurrencyLine ? (
                        <p className="text-muted-foreground">{manualCurrencyLine}</p>
                    ) : null}
                    {grantedCurrencyLine ? (
                        <p className="text-muted-foreground">{grantedCurrencyLine}</p>
                    ) : null}
                    {totalCurrencyLine ? (
                        <p className="font-medium">{totalCurrencyLine}</p>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
