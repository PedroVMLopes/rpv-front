"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
    CHARACTER_CREATION_STEPS,
    type CharacterCreationStepId,
} from "@/lib/character/characterCreationSteps";

type CharacterCreationStepperProps = {
    activeStep: number;
    maxUnlockedStep: number;
    stepHint?: string | null;
    isLastStep: boolean;
    onStepSelect: (stepIndex: number) => void;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    isSaving?: boolean;
};

export function CharacterCreationStepper({
    activeStep,
    maxUnlockedStep,
    stepHint,
    isLastStep,
    onStepSelect,
    onBack,
    onNext,
    onSave,
    isSaving = false,
}: CharacterCreationStepperProps) {
    const t = useTranslations("characterCreation");

    return (
        <div className="flex flex-col gap-4">
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {CHARACTER_CREATION_STEPS.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    const isLocked = index > maxUnlockedStep;
                    const isClickable = !isLocked;

                    return (
                        <li key={step.id} className="min-w-0">
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => isClickable && onStepSelect(index)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-xs sm:text-sm",
                                    isActive && "border-primary bg-primary/10",
                                    isCompleted &&
                                        !isActive &&
                                        "border-muted-foreground/30 bg-muted/40",
                                    isLocked && "cursor-not-allowed opacity-50",
                                    !isLocked &&
                                        !isActive &&
                                        "hover:bg-muted/50"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                        isActive && "bg-primary text-primary-foreground",
                                        isCompleted &&
                                            !isActive &&
                                            "bg-muted-foreground/20",
                                        !isActive &&
                                            !isCompleted &&
                                            "bg-muted"
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span className="truncate font-medium">
                                    {t(`steps.${step.id}` as `steps.${CharacterCreationStepId}`)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {stepHint ? (
                <p className="text-sm font-medium text-destructive">{stepHint}</p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={activeStep === 0}
                >
                    {t("navigation.back")}
                </Button>

                {isLastStep ? (
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="font-semibold"
                    >
                        {t("navigation.save")}
                    </Button>
                ) : (
                    <Button type="button" onClick={onNext} className="font-semibold">
                        {t("navigation.next")}
                    </Button>
                )}
            </div>
        </div>
    );
}
