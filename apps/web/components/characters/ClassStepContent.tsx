"use client";

import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { CharacterLevelSelector } from "@/components/characters/CharacterLevelSelector";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { Button } from "@/components/ui/button";
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
    equipmentStepIndex: number;
    maxUnlockedStep: number;
    onNavigateToStep: (stepIndex: number) => void;
};

export function ClassStepContent({
    form,
    fields,
    contentLocale,
    system,
    equipmentStepIndex,
    maxUnlockedStep,
    onNavigateToStep,
}: ClassStepContentProps) {
    const t = useTranslations("characterCreation");
    const tAbilities = useTranslations("abilities");
    const tResources = useTranslations("classResources");
    const { control } = form;

    const classSlug = useWatch({ control, name: "characterClass" });
    const watchedLevel = useWatch({ control, name: "level" });
    const level = readLevelFromForm({ level: watchedLevel });

    const partition = useMemo(() => {
        if (typeof classSlug !== "string" || classSlug.trim() === "") {
            return null;
        }

        return partitionClassGrantsForLevel(classSlug, level);
    }, [classSlug, level]);

    const equipmentUnlocked = maxUnlockedStep >= equipmentStepIndex;

    const equipmentPreview = useMemo(() => {
        if (!partition?.equipmentSummary) {
            return null;
        }

        if (partition.equipmentSummary === "equipment") {
            return t("classStep.equipmentPreviewEquipment");
        }

        return partition.equipmentSummary.replace(
            /\bequipment\b/gi,
            t("classStep.equipmentPreviewEquipment")
        );
    }, [partition?.equipmentSummary, t]);

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

            <section className="flex flex-col gap-2">
                <h2 className="text-sm font-bold">{t("classStep.choicesTitle")}</h2>
                <CharacterGrantPickers
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                    sourceTypes={getGrantSourceTypesForStep("class")}
                    sections="choices-only"
                    displayLevel={level}
                />
            </section>

            <section className="flex flex-col gap-2 border rounded-lg p-4 bg-muted/30">
                <h2 className="text-sm font-bold">{t("classStep.equipmentTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("classStep.equipmentHint")}</p>
                {equipmentPreview && (
                    <p className="text-sm">{equipmentPreview}</p>
                )}
                {equipmentUnlocked ? (
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 self-start"
                        onClick={() => onNavigateToStep(equipmentStepIndex)}
                    >
                        {t("classStep.equipmentLink")}
                    </Button>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        {t("classStep.equipmentLinkLocked")}
                    </p>
                )}
            </section>
        </div>
    );
}
