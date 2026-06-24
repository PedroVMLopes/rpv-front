"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { deriveResourcesFromForm } from "@/lib/character/deriveResourcesFromForm";
import { DerivedResourcesDisplay } from "@/components/characters/DerivedResourcesDisplay";

type ClassResourcesFieldProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function ClassResourcesField({
    form,
    contentLocale,
    system,
}: ClassResourcesFieldProps) {
    const t = useTranslations("classResources");

    const watchedValues = form.watch();
    const formSnapshot = useMemo(
        () => ({
            characterClass: watchedValues.characterClass,
            level: watchedValues.level,
            subclass: watchedValues.subclass,
            race: watchedValues.race,
            subrace: watchedValues.subrace,
            background: watchedValues.background,
            startingItem: watchedValues.startingItem,
            choices: watchedValues.choices,
        }),
        [
            watchedValues.characterClass,
            watchedValues.level,
            watchedValues.subclass,
            watchedValues.race,
            watchedValues.subrace,
            watchedValues.background,
            watchedValues.startingItem,
            watchedValues.choices,
        ]
    );

    const derivedResources = useMemo(
        () => deriveResourcesFromForm(formSnapshot, contentLocale, system),
        [formSnapshot, contentLocale, system]
    );

    const hasClass =
        typeof formSnapshot.characterClass === "string" &&
        formSnapshot.characterClass !== "";

    return (
        <section className="flex flex-col gap-3 rounded border bg-muted/30 p-3">
            <h2 className="text-sm font-semibold">{t("title")}</h2>
            <DerivedResourcesDisplay
                resources={derivedResources}
                emptyHint={hasClass ? t("noneYet") : t("emptyHint")}
            />
        </section>
    );
}
