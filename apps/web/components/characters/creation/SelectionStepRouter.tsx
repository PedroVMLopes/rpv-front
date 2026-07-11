"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import type { CreationStep } from "@/lib/character/creationSteps/creationStep.types";
import { RaceSelectionPage } from "@/components/characters/creation/RaceSelectionPage";
import { SubraceSelectionPage } from "@/components/characters/creation/SubraceSelectionPage";
import { ClassSelectionPage } from "@/components/characters/creation/ClassSelectionPage";
import { SubclassSelectionPage } from "@/components/characters/creation/SubclassSelectionPage";
import { BackgroundSelectionPage } from "@/components/characters/creation/BackgroundSelectionPage";
import { DynamicForm } from "@/components/forms/DynamicForm";
import type { SystemKey } from "@/presets";

type FieldConfig = {
    name: string;
    [key: string]: unknown;
};

type SelectionStepRouterProps = {
    step: CreationStep;
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
    stepFields: FieldConfig[];
};

export function SelectionStepRouter({
    step,
    form,
    contentLocale,
    system,
    stepFields,
}: SelectionStepRouterProps) {
    switch (step.id) {
        case "race":
            return (
                <RaceSelectionPage
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
            );
        case "subrace":
            return (
                <SubraceSelectionPage
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
            );
        case "class":
            return (
                <ClassSelectionPage
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
            );
        case "subclass":
            return (
                <SubclassSelectionPage
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                />
            );
        case "background":
            return (
                <BackgroundSelectionPage
                    form={form}
                    contentLocale={contentLocale}
                    system={system}
                    identityFields={stepFields}
                />
            );
        default:
            return (
                <DynamicForm form={form} fields={stepFields} hideSubmit />
            );
    }
}
