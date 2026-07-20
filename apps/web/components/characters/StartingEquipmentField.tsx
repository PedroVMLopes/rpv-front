"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale, ModifierSource } from "@rpv/domain";
import { contentRepo } from "@/lib/content/contentRepository";
import type { SystemKey } from "@/presets";
import {
    currencyChoiceToPending,
    deriveStartingEquipmentFromForm,
    hasStartingEquipmentContent,
} from "@/lib/character/deriveStartingEquipmentFromForm";
import { buildExclusiveBranchSummaries } from "@/lib/character/buildExclusiveBranchSummaries";
import { collectGrantSources } from "@/lib/character/characterGrants";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { findInvalidGrantPicks } from "@/lib/character/choiceValidation";
import { readGrantPicks, setGrantPick } from "@/lib/character/grantPickForm";
import { bagStackReactKey } from "@/lib/character/inventory";
import { readLevelFromForm } from "@/lib/character/level";
import { STARTING_EQUIPMENT_SOURCES } from "@/lib/character/materializeCurrencyGrants";
import { ExclusiveBranchChoice } from "@/components/characters/creation/items/ExclusiveBranchChoice";
import { ItemChoiceGrid } from "@/components/characters/creation/items/ItemChoiceGrid";
import { cn } from "@/lib/utils";

type StartingEquipmentFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    focusKey?: string;
};

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
    focusKey,
}: StartingEquipmentFieldProps) {
    const t = useTranslations("startingEquipment");
    const tItems = useTranslations("items");
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
    const invalidPicks = useMemo(
        () => findInvalidGrantPicks(formSnapshot, contentLocale, system),
        [formSnapshot, contentLocale, system]
    );
    const invalidInventoryKeys = useMemo(
        () =>
            new Set(
                invalidPicks
                    .filter((issue) => issue.code === "invalidInventoryPick")
                    .map((issue) => issue.key)
                    .filter((key): key is string => key !== undefined)
            ),
        [invalidPicks]
    );
    const invalidCurrencyKeys = useMemo(
        () =>
            new Set(
                invalidPicks
                    .filter((issue) => issue.code === "invalidCurrencyPick")
                    .map((issue) => issue.key)
                    .filter((key): key is string => key !== undefined)
            ),
        [invalidPicks]
    );
    const hasInvalidChoices =
        invalidInventoryKeys.size > 0 || invalidCurrencyKeys.size > 0;

    const branchSummariesByGroupKey = useMemo(() => {
        const level = readLevelFromForm(formSnapshot);
        const selections = buildSelectionsFromForm(formSnapshot);
        const sources = collectGrantSources(selections, contentLocale, level);
        const result = new Map<
            string,
            ReturnType<typeof buildExclusiveBranchSummaries>
        >();

        for (const group of preview.exclusiveGroups) {
            const entry = sources.find(
                (source) =>
                    STARTING_EQUIPMENT_SOURCES.has(source.source.type) &&
                    source.source.type === group.source.type &&
                    source.source.id === group.source.id
            );

            if (!entry) {
                result.set(
                    group.key,
                    buildExclusiveBranchSummaries(
                        [],
                        group.branches,
                        system,
                        contentLocale,
                        {
                            equipmentPackage: tItems("pick.equipmentPackage"),
                            choiceCount: (count) =>
                                tItems("pick.choiceCount", { count }),
                            fixedItemCount: (count) =>
                                tItems("pick.fixedItemCount", { count }),
                            currencyAmount: (amount, ref) => `${amount} ${ref}`,
                        }
                    )
                );
                continue;
            }

            result.set(
                group.key,
                buildExclusiveBranchSummaries(
                    entry.grants,
                    group.branches,
                    system,
                    contentLocale,
                    {
                        equipmentPackage: tItems("pick.equipmentPackage"),
                        choiceCount: (count) =>
                            tItems("pick.choiceCount", { count }),
                        fixedItemCount: (count) =>
                            tItems("pick.fixedItemCount", { count }),
                        currencyAmount: (amount, ref) => `${amount} ${ref}`,
                    }
                )
            );
        }

        return result;
    }, [formSnapshot, contentLocale, system, preview.exclusiveGroups, tItems]);

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

            {choicesError && hasInvalidChoices ? (
                <p className="text-sm font-medium text-destructive">
                    {t("choicesIncomplete")}
                </p>
            ) : null}

            {preview.exclusiveGroups.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {preview.exclusiveGroups.map((group) => (
                        <ExclusiveBranchChoice
                            key={group.key}
                            groupKey={group.key}
                            groupLabel={group.label}
                            sourceLabel={formatSourceLabel(group.source, t)}
                            branches={
                                branchSummariesByGroupKey.get(group.key) ??
                                group.branches.map((branch) => ({
                                    branchId: branch.branchId,
                                    label: branch.label,
                                    summary: branch.label,
                                    detailLines: [],
                                }))
                            }
                            selectedBranchId={grantPicks[group.key] ?? ""}
                            onSelect={(branchId) =>
                                setGrantPick(form, group.key, branchId)
                            }
                            focusKey={focusKey}
                        />
                    ))}
                </div>
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
                    <ItemChoiceGrid
                        form={form}
                        contentLocale={contentLocale}
                        system={system}
                        choices={preview.choiceGrants}
                        invalidKeys={invalidInventoryKeys}
                        focusKey={focusKey}
                    />
                </div>
            ) : null}

            {preview.currencyChoiceGrants.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">{t("choicesTitle")}</h3>
                    {preview.currencyChoiceGrants.map((choice) => {
                        const pending = currencyChoiceToPending(choice);
                        const hasError = invalidCurrencyKeys.has(choice.key);
                        const isFocused = focusKey === choice.key;

                        return (
                            <label
                                key={choice.key}
                                data-focus-key={choice.key}
                                className={cn(
                                    "flex flex-col gap-1 rounded-md text-sm",
                                    isFocused &&
                                        "ring-2 ring-primary ring-offset-2"
                                )}
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
                                    {pending.options.map((option) => (
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
                                contentRepo(system).getItem(
                                    stack.slug,
                                    contentLocale
                                )?.name ?? stack.slug;
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
