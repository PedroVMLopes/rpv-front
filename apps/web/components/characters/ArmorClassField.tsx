"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    deriveBaseAcFromForm,
    formatBaseAcBreakdownFromForm,
    resolveAcFromForm,
} from "@/lib/character/ac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ArmorClassFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    system: SystemKey;
    contentLocale: Locale;
};

function coerceNumber(value: unknown): number | undefined {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

export function ArmorClassField({
    form,
    system,
    contentLocale,
}: ArmorClassFieldProps) {
    const t = useTranslations("armorClass");
    const tFields = useTranslations("fields");

    const watchedValues = form.watch();
    const [manualOverride, setManualOverride] = useState(false);
    const initializedRef = useRef(false);

    const formSnapshot = useMemo(
        () => ({
            attributes: watchedValues.attributes,
            race: watchedValues.race,
            subrace: watchedValues.subrace,
            startingItem: watchedValues.startingItem,
            inventory: watchedValues.inventory,
            ac: watchedValues.ac,
        }),
        [
            watchedValues.attributes,
            watchedValues.race,
            watchedValues.subrace,
            watchedValues.startingItem,
            watchedValues.inventory,
            watchedValues.ac,
        ]
    );

    const computedBaseAc = useMemo(
        () => deriveBaseAcFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    const resolvedAc = useMemo(
        () => resolveAcFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    const baseAc = coerceNumber(watchedValues.ac) ?? computedBaseAc;
    const acBonusFromSources =
        resolvedAc !== undefined &&
        baseAc !== undefined &&
        resolvedAc > baseAc
            ? resolvedAc - baseAc
            : undefined;

    const breakdown = useMemo(
        () => formatBaseAcBreakdownFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }

        const existingAc = coerceNumber(formSnapshot.ac);
        if (
            existingAc !== undefined &&
            computedBaseAc !== undefined &&
            existingAc !== computedBaseAc
        ) {
            setManualOverride(true);
        }

        initializedRef.current = true;
    }, [formSnapshot.ac, computedBaseAc]);

    useEffect(() => {
        if (manualOverride || computedBaseAc === undefined) {
            return;
        }

        form.setValue("ac", computedBaseAc, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [computedBaseAc, form, manualOverride]);

    function handleAcChange(value: string) {
        setManualOverride(true);
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("ac", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleResetToComputed() {
        if (computedBaseAc === undefined) {
            return;
        }

        setManualOverride(false);
        form.setValue("ac", computedBaseAc, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    const acValue = coerceNumber(form.watch("ac"));

    return (
        <section className="flex flex-col gap-3 rounded border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{t("title")}</h2>
                {computedBaseAc !== undefined && manualOverride ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetToComputed}
                    >
                        {t("resetToComputed")}
                    </Button>
                ) : null}
            </div>

            <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{tFields("ac")}</span>
                <Input
                    type="number"
                    min={0}
                    value={acValue ?? ""}
                    onChange={(event) => handleAcChange(event.target.value)}
                />
            </label>

            {breakdown ? (
                <p className="text-sm text-muted-foreground">{breakdown}</p>
            ) : (
                <p className="text-sm text-muted-foreground">{t("manualHint")}</p>
            )}

            {acBonusFromSources !== undefined && resolvedAc !== undefined ? (
                <p className="text-sm text-muted-foreground">
                    {t("fromSources", {
                        base: baseAc,
                        bonus: acBonusFromSources,
                        total: resolvedAc,
                    })}
                </p>
            ) : null}

            {manualOverride && computedBaseAc !== undefined ? (
                <p className="text-xs text-muted-foreground">{t("overrideHint")}</p>
            ) : null}
        </section>
    );
}
