"use client";

import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { CharacterLevelSelector } from "@/components/characters/CharacterLevelSelector";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import {
    formatClassStepGrantLabel,
    partitionClassGrantsForLevel,
} from "@/lib/character/classStepDisplay";
import { readLevelFromForm } from "@/lib/character/level";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { getGrantSourceTypesForStep } from "@/lib/character/characterCreationSteps";

type FieldConfig = {
    name: string;
    [key: string]: unknown;
};

type ClassStepContentProps = {
    form: UseFormReturn<Record<string, unknown>>;
    fields: FieldConfig[];
    contentLocale: Locale;
    system: SystemKey;
};

export function ClassStepContent({
    form,
    fields,
    contentLocale,
    system,
}: ClassStepContentProps) {
    const t = useTranslations("characterCreation");
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const { control } = form;

    const classSlug = useWatch({ control, name: "characterClass" });
    const watchedLevel = useWatch({ control, name: "level" });
    const level = readLevelFromForm({ level: watchedLevel });
    const hasClass =
        typeof classSlug === "string" && classSlug.trim() !== "";

    const partition = useMemo(() => {
        if (!hasClass) {
            return null;
        }

        return partitionClassGrantsForLevel(classSlug, level);
    }, [classSlug, hasClass, level]);

    return (
        <div className="flex flex-col gap-4">
            <CharacterLevelSelector form={form} />
            <DynamicForm form={form} fields={fields} hideSubmit />

            {partition && partition.fixedDisplayGrants.length > 0 && (
                <section className="flex flex-col gap-2 border rounded-lg p-4 bg-muted/30">
                    <h2 className="text-sm font-bold">{t("classStep.fixedTitle")}</h2>
                    <div className="flex flex-wrap gap-2">
                        {partition.fixedDisplayGrants.map((grant) => (
                            <span
                                key={grant.id}
                                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                            >
                                {formatClassStepGrantLabel(
                                    grant,
                                    contentLocale,
                                    (ref) => tAbilities(ref),
                                    (ref) =>
                                        formatResourceRefLabel(ref, (key) =>
                                            tResources(key)
                                        )
                                )}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {hasClass && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-bold">
                        {t("classStep.choicesTitle")}
                    </h2>
                    <CharacterGrantPickers
                        form={form}
                        contentLocale={contentLocale}
                        system={system}
                        sourceTypes={getGrantSourceTypesForStep("class")}
                        sections="choices-only"
                        displayLevel={level}
                    />
                </section>
            )}
        </div>
    );
}
