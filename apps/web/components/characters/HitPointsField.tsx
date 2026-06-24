"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    deriveMaxHpFromForm,
    formatMaxHpBreakdownFromForm,
    resolveMaxHpFromForm,
} from "@/lib/character/hp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HitPointsFieldProps = {
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

export function HitPointsField({
    form,
    system,
    contentLocale,
}: HitPointsFieldProps) {
    const t = useTranslations("hitPoints");
    const tFields = useTranslations("fields");

    const watchedValues = form.watch();
    const [manualOverride, setManualOverride] = useState(false);
    const initializedRef = useRef(false);

    const formSnapshot = useMemo(
        () => ({
            characterClass: watchedValues.characterClass,
            level: watchedValues.level,
            attributes: watchedValues.attributes,
            race: watchedValues.race,
            subrace: watchedValues.subrace,
            inventory: watchedValues.inventory,
            maxHp: watchedValues.maxHp,
            hp: watchedValues.hp,
        }),
        [
            watchedValues.characterClass,
            watchedValues.level,
            watchedValues.attributes,
            watchedValues.race,
            watchedValues.subrace,
            watchedValues.inventory,
            watchedValues.maxHp,
            watchedValues.hp,
        ]
    );

    const computedMaxHp = useMemo(
        () => deriveMaxHpFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    const resolvedMaxHp = useMemo(
        () => resolveMaxHpFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    const baseMaxHp = coerceNumber(watchedValues.maxHp) ?? computedMaxHp;
    const hpBonusFromSources =
        resolvedMaxHp !== undefined &&
        baseMaxHp !== undefined &&
        resolvedMaxHp > baseMaxHp
            ? resolvedMaxHp - baseMaxHp
            : undefined;

    const breakdown = useMemo(
        () => formatMaxHpBreakdownFromForm(watchedValues, system, contentLocale),
        [watchedValues, system, contentLocale]
    );

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }

        const existingMaxHp = coerceNumber(formSnapshot.maxHp);
        if (
            existingMaxHp !== undefined &&
            computedMaxHp !== undefined &&
            existingMaxHp !== computedMaxHp
        ) {
            setManualOverride(true);
        }

        initializedRef.current = true;
    }, [formSnapshot.maxHp, computedMaxHp]);

    useEffect(() => {
        if (manualOverride || computedMaxHp === undefined) {
            return;
        }

        form.setValue("maxHp", computedMaxHp, {
            shouldDirty: true,
            shouldValidate: true,
        });

        const currentHp = coerceNumber(formSnapshot.hp);
        if (currentHp === undefined || currentHp === 0) {
            form.setValue("hp", computedMaxHp, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [computedMaxHp, form, formSnapshot.hp, manualOverride]);

    function handleMaxHpChange(value: string) {
        setManualOverride(true);
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("maxHp", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleHpChange(value: string) {
        const parsed = value === "" ? undefined : Number(value);
        form.setValue("hp", Number.isNaN(parsed) ? undefined : parsed, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleResetToComputed() {
        if (computedMaxHp === undefined) {
            return;
        }

        setManualOverride(false);
        form.setValue("maxHp", computedMaxHp, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    const maxHpValue = coerceNumber(form.watch("maxHp"));
    const hpValue = coerceNumber(form.watch("hp"));

    return (
        <section className="flex flex-col gap-3 rounded border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{t("title")}</h2>
                {computedMaxHp !== undefined && manualOverride ? (
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

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">{tFields("maxHp")}</span>
                    <Input
                        type="number"
                        min={1}
                        value={maxHpValue ?? ""}
                        onChange={(event) => handleMaxHpChange(event.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">{tFields("hp")}</span>
                    <Input
                        type="number"
                        min={0}
                        value={hpValue ?? ""}
                        onChange={(event) => handleHpChange(event.target.value)}
                    />
                </label>
            </div>

            {breakdown ? (
                <p className="text-sm text-muted-foreground">{breakdown}</p>
            ) : (
                <p className="text-sm text-muted-foreground">{t("manualHint")}</p>
            )}

            {hpBonusFromSources !== undefined && resolvedMaxHp !== undefined ? (
                <p className="text-sm text-muted-foreground">
                    {t("fromSources", {
                        base: baseMaxHp,
                        bonus: hpBonusFromSources,
                        total: resolvedMaxHp,
                    })}
                </p>
            ) : null}

            {manualOverride && computedMaxHp !== undefined ? (
                <p className="text-xs text-muted-foreground">{t("overrideHint")}</p>
            ) : null}
        </section>
    );
}
