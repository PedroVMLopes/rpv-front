"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FlavorTable } from "@rpv/content";
import {
    FLAVOR_CUSTOM_SENTINEL,
    flavorSlotTextFromSelect,
    flavorTableFormPath,
    joinFlavorSlots,
    parseFlavorSlots,
    selectValueForFlavorSlot,
} from "@/lib/character/flavorTables";

const SELECT_CLASS_NAME =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA_CLASS_NAME = cn(
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-20 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

type FlavorTableFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    table: FlavorTable;
    fieldLabel: string;
};

export function FlavorTableField({
    form,
    table,
    fieldLabel,
}: FlavorTableFieldProps) {
    const t = useTranslations("characterCreation.flavorTable");
    const tForms = useTranslations("forms");
    const fieldId = useId();
    const formPath = flavorTableFormPath(table);
    const boundValue = form.watch(formPath);
    const slots = parseFlavorSlots(boundValue, table.pickCount);
    const [customModeFlags, setCustomModeFlags] = useState<boolean[]>(() =>
        slots.map(
            (slotText) =>
                selectValueForFlavorSlot(slotText, table) === FLAVOR_CUSTOM_SENTINEL
        )
    );

    useEffect(() => {
        const nextSlots = parseFlavorSlots(
            form.getValues(formPath),
            table.pickCount
        );
        setCustomModeFlags(
            nextSlots.map(
                (slotText) =>
                    selectValueForFlavorSlot(slotText, table) ===
                    FLAVOR_CUSTOM_SENTINEL
            )
        );
    }, [form, formPath, table, table.slug, table.pickCount]);

    const commitSlots = (nextSlots: string[]) => {
        form.setValue(formPath, joinFlavorSlots(nextSlots), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const setCustomModeAt = (index: number, isCustomMode: boolean) => {
        setCustomModeFlags((current) => {
            const next = Array.from(
                { length: table.pickCount },
                (_, slotIndex) => current[slotIndex] ?? false
            );
            next[index] = isCustomMode;
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {slots.map((slotText, index) => {
                const derivedSelect = selectValueForFlavorSlot(slotText, table);
                const isCustom =
                    (customModeFlags[index] ?? false) ||
                    derivedSelect === FLAVOR_CUSTOM_SENTINEL;
                const selectValue = isCustom
                    ? FLAVOR_CUSTOM_SENTINEL
                    : derivedSelect;
                const slotLabel =
                    table.pickCount > 1
                        ? t("slot", {
                              label: fieldLabel,
                              current: index + 1,
                              total: table.pickCount,
                          })
                        : fieldLabel;
                const selectId = `${fieldId}-${index}`;
                const customId = `${selectId}-custom`;

                return (
                    <div
                        key={`${table.slug}-${index}`}
                        className="grid gap-2"
                        data-testid={`flavor-slot-${table.slug}-${index}`}
                    >
                        <Label htmlFor={selectId}>{slotLabel}</Label>
                        <select
                            id={selectId}
                            value={selectValue}
                            onChange={(event) => {
                                const nextSelect = event.target.value;
                                const nextSlots = [...slots];

                                if (nextSelect === FLAVOR_CUSTOM_SENTINEL) {
                                    setCustomModeAt(index, true);
                                    return;
                                }

                                setCustomModeAt(index, false);
                                nextSlots[index] = flavorSlotTextFromSelect(
                                    nextSelect,
                                    table,
                                    slotText
                                );
                                commitSlots(nextSlots);
                            }}
                            className={SELECT_CLASS_NAME}
                        >
                            <option value="">
                                {tForms("selectPlaceholder", { label: slotLabel })}
                            </option>
                            {table.options.map((option) => (
                                <option key={option.slug} value={option.slug}>
                                    {option.label}
                                </option>
                            ))}
                            {table.allowCustom ? (
                                <option value={FLAVOR_CUSTOM_SENTINEL}>
                                    {t("custom")}
                                </option>
                            ) : null}
                        </select>
                        {isCustom ? (
                            <textarea
                                id={customId}
                                aria-label={slotLabel}
                                value={slotText}
                                onChange={(event) => {
                                    const nextSlots = [...slots];
                                    nextSlots[index] = event.target.value;
                                    setCustomModeAt(index, true);
                                    commitSlots(nextSlots);
                                }}
                                className={TEXTAREA_CLASS_NAME}
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
