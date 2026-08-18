"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import { getClassSubclassLevel } from "@rpv/content";
import type { SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import { Button } from "@/components/ui/button";
import { type FieldConfig } from "@/components/forms/DynamicForm";
import { AbilityScoresField } from "@/components/characters/AbilityScoresField";
import { HitPointsField } from "@/components/characters/HitPointsField";
import { ClassResourcesField } from "@/components/characters/ClassResourcesField";
import { CharacterGrantPickers } from "@/components/characters/CharacterGrantPickers";
import { StartingEquipmentField } from "@/components/characters/StartingEquipmentField";
import { CharacterCreationSidebar } from "@/components/characters/creation/CharacterCreationSidebar";
import { CreationStepsDrawer } from "@/components/characters/creation/CreationStepsDrawer";
import { LevelProgressionPage } from "@/components/characters/creation/LevelProgressionPage";
import { SelectionStepRouter } from "@/components/characters/creation/SelectionStepRouter";
import { GrantChoicePage } from "@/components/characters/creation/GrantChoicePage";
import { PrepareSpellsPage } from "@/components/characters/creation/PrepareSpellsPage";
import { CharacterReviewPage } from "@/components/characters/creation/CharacterReviewPage";
import {
    buildPlayerGrantSourceFields,
    filterPlayerFormFields,
    getVisiblePlayerFields,
} from "@/lib/character/playerFormFields";
import {
    getFirstErrorStepId,
    resolvePlayerFormGraph,
    type PlayerFormMode,
} from "@/lib/character/characterCreationSteps";
import {
    resolveInitialStepId,
} from "@/lib/character/creationSteps";
import { resolveCharacterNameForSave } from "@/lib/character/defaultCharacterName";
import { collectPendingDecisions } from "@/lib/character/pendingDecisions";
import { useGrantPickSanitizer } from "@/lib/character/useGrantPickSanitizer";
import { readLevelFromForm } from "@/lib/character/level";
import { getCreationProgressionLevel } from "@/lib/character/creationSteps/progressionLevel";
import { cn } from "@/lib/utils";

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);

        update();
        media.addEventListener("change", update);

        return () => media.removeEventListener("change", update);
    }, [query]);

    return matches;
}


export type PlayerCharacterFormProps = {
    mode: PlayerFormMode;
    system: SystemKey;
    form: UseFormReturn<Record<string, unknown>>;
    baseFields: FieldConfig[];
    statConfig: PresetStatConfig;
    contentLocale: Locale;
    onSave: (data: Record<string, unknown>) => void;
    header?: React.ReactNode;
    initialStepId?: string;
    initialFocusKey?: string;
    /** Persisted level before bump when mode is level-up. */
    levelUpFromLevel?: number;
};

function humanizeStepId(stepId: string): string {
    return stepId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function PlayerCharacterForm({
    mode,
    system,
    form,
    baseFields,
    statConfig,
    contentLocale,
    onSave,
    header,
    initialStepId,
    initialFocusKey,
    levelUpFromLevel,
}: PlayerCharacterFormProps) {
    const t = useTranslations("characterCreation");
    const isDesktopSidebar = useMediaQuery("(min-width: 768px)");
    const formValues = form.watch();
    const raceWatch = form.watch("race");
    const classWatch = form.watch("characterClass");
    const raceSlug = typeof raceWatch === "string" ? raceWatch : undefined;
    const classSlug = typeof classWatch === "string" ? classWatch : undefined;
    const level = form.watch("level");
    const isLevelUp = mode === "level-up";

    const previousRaceRef = useRef<string | undefined>(raceSlug);
    const previousClassRef = useRef<string | undefined>(classSlug);
    const previousLevelRef = useRef<number | undefined>(
        readLevelFromForm(formValues)
    );

    const creationGraph = useMemo(
        () =>
            resolvePlayerFormGraph(formValues, system, contentLocale, {
                mode,
                levelUpFromLevel,
            }),
        [formValues, system, contentLocale, mode, levelUpFromLevel]
    );

    const [activeStepId, setActiveStepId] = useState(() =>
        resolveInitialStepId(initialStepId, creationGraph)
    );
    const [activeFocusKey, setActiveFocusKey] = useState<string | undefined>(
        initialFocusKey
    );
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [stepHint, setStepHint] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useGrantPickSanitizer(form, contentLocale, system);

    useEffect(() => {
        if (initialStepId === undefined) {
            return;
        }

        const resolved = resolveInitialStepId(initialStepId, creationGraph);
        setActiveStepId(resolved);
        // Only re-sync when the step prop changes (e.g. URL ?step=), not when the
        // dynamic graph rebuilds after form edits during navigation.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- creationGraph intentionally omitted
    }, [initialStepId]);

    useEffect(() => {
        setActiveFocusKey(initialFocusKey);
    }, [initialFocusKey]);

    useEffect(() => {
        if (!activeFocusKey) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            const escaped =
                typeof CSS !== "undefined" && typeof CSS.escape === "function"
                    ? CSS.escape(activeFocusKey)
                    : activeFocusKey.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const target = document.querySelector(
                `[data-focus-key="${escaped}"]`
            );

            if (target instanceof HTMLElement) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });

        return () => window.cancelAnimationFrame(frame);
    }, [activeFocusKey, activeStepId]);

    useEffect(() => {
        const isValid = creationGraph.isValidStepId(activeStepId);
        if (!isValid) {
            const fallback = creationGraph.steps[0]?.id ?? "race";
            setActiveStepId(fallback);
        }
    }, [activeStepId, creationGraph]);

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

    const activeStep = creationGraph.getStep(activeStepId);
    const stepTitle = useMemo(() => {
        if (!activeStep) {
            return "";
        }

        try {
            return t(
                activeStep.labelKey as never,
                (activeStep.labelValues ?? {}) as never
            );
        } catch {
            return humanizeStepId(activeStep.id);
        }
    }, [activeStep, t]);

    const stepFields = useMemo(
        () =>
            getVisiblePlayerFields(hydratedFields, activeStepId, creationGraph, {
                raceSlug,
                contentLocale,
            }),
        [hydratedFields, activeStepId, creationGraph, raceSlug, contentLocale]
    );

    const pendingDecisions = useMemo(
        () =>
            collectPendingDecisions(
                formValues,
                contentLocale,
                system,
                statConfig,
                isLevelUp ? "level-up" : "creation",
                isLevelUp
                    ? { levelUpFromLevel: levelUpFromLevel }
                    : undefined
            ),
        [
            formValues,
            contentLocale,
            system,
            statConfig,
            isLevelUp,
            levelUpFromLevel,
        ]
    );

    const isLastStep =
        activeStepId === creationGraph.steps.at(-1)?.id;

    const handleNext = useCallback(() => {
        setStepHint(null);
        setActiveFocusKey(undefined);
        const nextStepId = creationGraph.getNextStepId(activeStepId);

        if (nextStepId) {
            setActiveStepId(nextStepId);
        }
    }, [activeStepId, creationGraph]);

    const handleBack = useCallback(() => {
        setStepHint(null);
        setActiveFocusKey(undefined);
        const prevStepId = creationGraph.getPrevStepId(activeStepId);

        if (prevStepId) {
            setActiveStepId(prevStepId);
        }
    }, [activeStepId, creationGraph]);

    const handleStepSelect = useCallback(
        (stepId: string, focusKey?: string) => {
            setStepHint(null);

            if (creationGraph.isValidStepId(stepId)) {
                setActiveStepId(stepId);
                setActiveFocusKey(focusKey);
                setMobileNavOpen(false);
            }
        },
        [creationGraph]
    );

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
            const errorStepId = getFirstErrorStepId(
                form.formState.errors,
                creationGraph,
                {
                    formData: form.getValues(),
                    locale: contentLocale,
                    system,
                }
            );

            if (errorStepId) {
                setActiveStepId(errorStepId);
            }

            setStepHint(t("hints.fixErrors"));
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        await form.handleSubmit((data) => {
            onSave({
                ...form.getValues(),
                ...data,
                name: resolveCharacterNameForSave(data.name, contentLocale),
                choices: form.getValues("choices"),
            });
        })();

        setIsSaving(false);
    }, [contentLocale, creationGraph, form, onSave, system, t]);

    const showDeferredLevelsBanner =
        !isLevelUp &&
        readLevelFromForm(formValues) > getCreationProgressionLevel(formValues);

    const sidebar = (
        <CharacterCreationSidebar
            graph={creationGraph}
            activeStepId={activeStepId}
            pendingDecisions={pendingDecisions}
            stepHint={stepHint}
            isLastStep={Boolean(isLastStep)}
            isSaving={isSaving}
            onStepSelect={handleStepSelect}
            onBack={handleBack}
            onNext={handleNext}
            onSave={() => void handleSave()}
        />
    );

    const stepContent = (() => {
        if (!activeStep) {
            return null;
        }

        switch (activeStep.kind) {
            case "selection":
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold md:sr-only">{stepTitle}</h2>
                        <SelectionStepRouter
                            step={activeStep}
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            stepFields={stepFields}
                        />
                    </div>
                );
            case "level_summary":
                return (
                    <LevelProgressionPage
                        form={form}
                        contentLocale={contentLocale}
                        system={system}
                        sourceFilter={activeStep.sourceFilter}
                        title={stepTitle}
                    />
                );
            case "grant_picks":
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold">{stepTitle}</h2>
                        <GrantChoicePage
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            stepFilter={activeStep.sourceFilter}
                            focusKey={activeFocusKey}
                        />
                    </div>
                );
            case "abilities":
                return (
                    <div className="flex flex-col gap-4">
                        <AbilityScoresField
                            form={form}
                            abilities={statConfig.abilities}
                            statConfig={statConfig}
                            contentLocale={contentLocale}
                            mode={mode}
                        />
                        <CharacterGrantPickers
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            stepFilter={{ grantTypes: ["ability_score"] }}
                            sections="choices-only"
                            focusKey={activeFocusKey}
                        />
                    </div>
                );
            case "prepare_spells":
                return (
                    <PrepareSpellsPage
                        title={stepTitle}
                        form={form}
                        contentLocale={contentLocale}
                        system={system}
                    />
                );
            case "equipment":
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold md:sr-only">{stepTitle}</h2>
                        {showDeferredLevelsBanner ? (
                            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                                {t("progression.deferredLevels", {
                                    level: readLevelFromForm(formValues),
                                    cap: getCreationProgressionLevel(formValues),
                                })}
                            </p>
                        ) : null}
                        <StartingEquipmentField
                            form={form}
                            contentLocale={contentLocale}
                            system={system}
                            focusKey={activeFocusKey}
                        />
                    </div>
                );
            case "review":
                return (
                    <CharacterReviewPage
                        title={stepTitle}
                        form={form}
                        stepFields={stepFields}
                        contentLocale={contentLocale}
                        system={system}
                    />
                );
            case "finalize":
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold md:sr-only">
                            {stepTitle}
                        </h2>
                        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
                            <h3 className="text-sm font-bold">
                                {t("progression.levelUpConfirmTitle", {
                                    level: readLevelFromForm(formValues),
                                })}
                            </h3>
                            <HitPointsField
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

                <div className="flex items-center justify-between gap-3 md:hidden">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {t("navigation.currentStep")}
                        </p>
                        <p className="truncate font-semibold">{stepTitle}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMobileNavOpen(true)}
                    >
                        {t("navigation.openSteps")}
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    {isDesktopSidebar ? (
                        <div className="md:shrink-0">{sidebar}</div>
                    ) : (
                        <CreationStepsDrawer
                            open={mobileNavOpen}
                            onOpenChange={setMobileNavOpen}
                            title={t("navigation.openSteps")}
                        >
                            {sidebar}
                        </CreationStepsDrawer>
                    )}

                    <div className={cn("min-w-0 flex-1")} key={activeStepId}>
                        {stepContent}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
