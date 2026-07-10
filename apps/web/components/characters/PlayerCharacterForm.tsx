"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import { getClassSubclassLevel } from "@rpv/content";
import type { SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { AbilityScoresField } from "@/components/characters/AbilityScoresField";
import { HitPointsField } from "@/components/characters/HitPointsField";
import { ArmorClassField } from "@/components/characters/ArmorClassField";
import { ClassResourcesField } from "@/components/characters/ClassResourcesField";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { ClassStepContent } from "@/components/characters/ClassStepContent";
import { StartingEquipmentField } from "@/components/characters/StartingEquipmentField";
import { CharacterCreationStepper } from "@/components/characters/CharacterCreationStepper";
import { PendingDecisionsPanel } from "@/components/characters/PendingDecisionsPanel";
import {
    buildPlayerGrantSourceFields,
    filterPlayerFormFields,
    getVisiblePlayerFields,
} from "@/lib/character/playerFormFields";
import {
    CHARACTER_CREATION_STEP_COUNT,
    CHARACTER_CREATION_STEPS,
    getFirstErrorStepIndex,
    getGrantSourceTypesForStep,
} from "@/lib/character/characterCreationSteps";
import { resolveCharacterNameForSave } from "@/lib/character/defaultCharacterName";
import { collectPendingDecisions } from "@/lib/character/pendingDecisions";
import { useGrantPickSanitizer } from "@/lib/character/useGrantPickSanitizer";
import { readLevelFromForm } from "@/lib/character/level";

type FieldConfig = {
    name: string;
    [key: string]: unknown;
};

export type PlayerCharacterFormProps = {
    mode: "create" | "edit";
    system: SystemKey;
    form: UseFormReturn<Record<string, unknown>>;
    baseFields: FieldConfig[];
    statConfig: PresetStatConfig;
    contentLocale: Locale;
    onSave: (data: Record<string, unknown>) => void;
    header?: React.ReactNode;
    initialStep?: number;
};

function clampStepIndex(step: number): number {
    return Math.min(Math.max(step, 0), CHARACTER_CREATION_STEP_COUNT - 1);
}

export function PlayerCharacterForm({
    mode: _mode,
    system,
    form,
    baseFields,
    statConfig,
    contentLocale,
    onSave,
    header,
    initialStep = 0,
}: PlayerCharacterFormProps) {
    const t = useTranslations("characterCreation");
    const formValues = form.watch();
    const raceSlug = form.watch("race");
    const classSlug = form.watch("characterClass");
    const level = form.watch("level");

    const previousRaceRef = useRef<string | undefined>(
        typeof formValues.race === "string" ? formValues.race : undefined
    );
    const previousClassRef = useRef<string | undefined>(
        typeof formValues.characterClass === "string"
            ? formValues.characterClass
            : undefined
    );
    const previousLevelRef = useRef<number | undefined>(
        readLevelFromForm(formValues)
    );

    const [activeStep, setActiveStep] = useState(() =>
        clampStepIndex(initialStep)
    );
    const [stepHint, setStepHint] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useGrantPickSanitizer(form, contentLocale, system);

    useEffect(() => {
        setActiveStep(clampStepIndex(initialStep));
    }, [initialStep]);

    useEffect(() => {
        if (
            previousRaceRef.current !== undefined &&
            previousRaceRef.current !== raceSlug
        ) {
            form.setValue("subrace", "");
        }

        previousRaceRef.current = raceSlug;
    }, [form, raceSlug]);

    useEffect(() => {
        if (
            previousClassRef.current !== undefined &&
            previousClassRef.current !== classSlug
        ) {
            form.setValue("subclass", "");
        }

        previousClassRef.current = classSlug;
    }, [form, classSlug]);

    useEffect(() => {
        const characterLevel = readLevelFromForm(form.getValues());
        const subclassLevel = classSlug
            ? getClassSubclassLevel(classSlug)
            : undefined;

        if (
            previousLevelRef.current !== undefined &&
            subclassLevel !== undefined &&
            characterLevel < subclassLevel
        ) {
            form.setValue("subclass", "");
        }

        previousLevelRef.current = characterLevel;
    }, [form, classSlug, level]);

    const hydratedFields = useMemo(
        () =>
            filterPlayerFormFields(
                buildPlayerGrantSourceFields(baseFields, {
                    raceSlug,
                    classSlug,
                    level: readLevelFromForm({ level }),
                    contentLocale,
                })
            ),
        [baseFields, raceSlug, classSlug, level, contentLocale]
    );

    const activeStepId = CHARACTER_CREATION_STEPS[activeStep]?.id ?? "race";

    const stepFields = useMemo(
        () =>
            getVisiblePlayerFields(hydratedFields, activeStepId, {
                raceSlug,
                classSlug,
                level: readLevelFromForm({ level }),
                contentLocale,
            }),
        [hydratedFields, activeStepId, raceSlug, classSlug, level, contentLocale]
    );

    const grantSourceTypes = getGrantSourceTypesForStep(activeStepId);

    const pendingDecisions = useMemo(
        () =>
            collectPendingDecisions(
                formValues,
                contentLocale,
                system,
                statConfig
            ),
        [formValues, contentLocale, system, statConfig]
    );

    const handleNext = useCallback(() => {
        setStepHint(null);
        setActiveStep((current) =>
            Math.min(current + 1, CHARACTER_CREATION_STEP_COUNT - 1)
        );
    }, []);

    const handleBack = useCallback(() => {
        setStepHint(null);
        setActiveStep((current) => Math.max(current - 1, 0));
    }, []);

    const handleStepSelect = useCallback((stepIndex: number) => {
        setStepHint(null);
        setActiveStep(clampStepIndex(stepIndex));
    }, []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setStepHint(null);

        const resolvedName = resolveCharacterNameForSave(
            form.getValues("name"),
            contentLocale
        );
        form.setValue("name", resolvedName, { shouldValidate: true });

        const valid = await form.trigger(undefined, { shouldFocus: true });

        if (!valid) {
            const errorStep = getFirstErrorStepIndex(form.formState.errors);
            if (errorStep !== undefined) {
                setActiveStep(errorStep);
            }

            setStepHint(t("hints.fixErrors"));
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        await form.handleSubmit((data) => {
            onSave({
                ...data,
                name: resolveCharacterNameForSave(data.name, contentLocale),
                choices: form.getValues("choices"),
            });
        })();

        setIsSaving(false);
    }, [contentLocale, form, onSave, t]);

    const stepContent = (() => {
        switch (activeStepId) {
            case "race":
                return (
                    <>
                        <DynamicForm
                            form={form}
                            fields={stepFields}
                            hideSubmit
                        />
                        <CharacterGrantPickers
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            sourceTypes={grantSourceTypes}
                        />
                    </>
                );
            case "class":
                return (
                    <ClassStepContent
                        form={form}
                        fields={stepFields}
                        contentLocale={contentLocale}
                        system={system}
                    />
                );
            case "abilities":
                return (
                    <AbilityScoresField
                        form={form}
                        abilities={statConfig.abilities}
                        statConfig={statConfig}
                        contentLocale={contentLocale}
                    />
                );
            case "background":
                return (
                    <>
                        <DynamicForm
                            form={form}
                            fields={stepFields}
                            hideSubmit
                        />
                        <CharacterGrantPickers
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            sourceTypes={grantSourceTypes}
                        />
                    </>
                );
            case "equipment":
                return (
                    <div className="flex flex-col gap-4">
                        <PendingDecisionsPanel
                            decisions={pendingDecisions}
                            onNavigateToStep={handleStepSelect}
                        />
                        <DynamicForm
                            form={form}
                            fields={stepFields}
                            hideSubmit
                        />
                        <StartingEquipmentField
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                        />
                        <div className="flex flex-col gap-4 border rounded-lg p-4 bg-muted/30">
                            <h2 className="text-sm font-bold">
                                {t("combatPreviewTitle")}
                            </h2>
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
            default:
                return null;
        }
    })();

    return (
        <FormProvider {...form}>
            <div className="flex flex-col gap-4">
                {header}
                <CharacterCreationStepper
                    activeStep={activeStep}
                    stepHint={stepHint}
                    isLastStep={activeStep === CHARACTER_CREATION_STEP_COUNT - 1}
                    onStepSelect={handleStepSelect}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSave={() => void handleSave()}
                    isSaving={isSaving}
                />
                <div key={activeStepId}>{stepContent}</div>
            </div>
        </FormProvider>
    );
}
