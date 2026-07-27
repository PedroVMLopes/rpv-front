"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    DynamicForm,
    type FieldConfig,
} from "@/components/forms/DynamicForm";
import { HitPointsField } from "@/components/characters/HitPointsField";
import { ArmorClassField } from "@/components/characters/ArmorClassField";
import { ClassResourcesField } from "@/components/characters/ClassResourcesField";

type CharacterReviewPageProps = {
    title: string;
    form: UseFormReturn<Record<string, unknown>>;
    stepFields: FieldConfig[];
    contentLocale: Locale;
    system: SystemKey;
};

export function CharacterReviewPage({
    title,
    form,
    stepFields,
    contentLocale,
    system,
}: CharacterReviewPageProps) {
    const t = useTranslations("characterCreation");

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold md:sr-only">{title}</h2>
            <DynamicForm form={form} fields={stepFields} hideSubmit />
            <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
                <h3 className="text-sm font-bold">{t("combatPreviewTitle")}</h3>
                <HitPointsField
                    form={form}
                    system={system}
                    contentLocale={contentLocale}
                />
                <ArmorClassField
                    form={form}
                    system={system}
                    contentLocale={contentLocale}
                />
                <ClassResourcesField
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
            </div>
        </div>
    );
}
