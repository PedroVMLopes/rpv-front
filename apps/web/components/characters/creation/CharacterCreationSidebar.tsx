"use client";

import { useMemo } from "react";
import { useMessages, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreationStepGraph } from "@/lib/character/creationSteps";
import type { PendingDecision } from "@/lib/character/pendingDecisions";

type CharacterCreationSidebarProps = {
    graph: CreationStepGraph;
    activeStepId: string;
    pendingDecisions: PendingDecision[];
    stepHint?: string | null;
    isLastStep: boolean;
    isSaving?: boolean;
    onStepSelect: (stepId: string, focusKey?: string) => void;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
};

function humanizeStepId(stepId: string): string {
    return stepId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function useStepLabel() {
    const t = useTranslations("characterCreation");
    // #region agent log
    const allMessages = useMessages();
    // #endregion

    return (
        labelKey: string,
        stepId: string,
        labelValues?: Record<string, string | number>
    ) => {
        // #region agent log
        const stepsMessages = (
            allMessages as {
                characterCreation?: { steps?: Record<string, string> };
            }
        )?.characterCreation?.steps;
        const hasReviewKey = Boolean(stepsMessages?.review);
        const hasEquipmentKey = Boolean(stepsMessages?.equipment);
        // #endregion
        try {
            const result = t(labelKey as never, labelValues as never);
            // #region agent log
            if (stepId === "review" || labelKey.includes("review")) {
                fetch(
                    "http://127.0.0.1:7476/ingest/c64e1074-a4b1-458d-b20f-54db574b559c",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Debug-Session-Id": "8a527e",
                        },
                        body: JSON.stringify({
                            sessionId: "8a527e",
                            runId: "pre-fix",
                            hypothesisId: "A-B-C",
                            location:
                                "CharacterCreationSidebar.tsx:useStepLabel",
                            message: "review step label resolved",
                            data: {
                                labelKey,
                                stepId,
                                result,
                                hasReviewKey,
                                hasEquipmentKey,
                                stepMessageKeys: stepsMessages
                                    ? Object.keys(stepsMessages).filter((k) =>
                                          [
                                              "review",
                                              "equipment",
                                              "finalize",
                                          ].includes(k)
                                      )
                                    : null,
                            },
                            timestamp: Date.now(),
                        }),
                    }
                ).catch(() => {});
            }
            // #endregion
            return result;
        } catch (error) {
            // #region agent log
            fetch(
                "http://127.0.0.1:7476/ingest/c64e1074-a4b1-458d-b20f-54db574b559c",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Debug-Session-Id": "8a527e",
                    },
                    body: JSON.stringify({
                        sessionId: "8a527e",
                        runId: "pre-fix",
                        hypothesisId: "A-D-E",
                        location: "CharacterCreationSidebar.tsx:useStepLabel",
                        message: "step label MISSING_MESSAGE catch",
                        data: {
                            labelKey,
                            stepId,
                            hasReviewKey,
                            hasEquipmentKey,
                            errorMessage:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            stepMessageKeys: stepsMessages
                                ? Object.keys(stepsMessages).filter((k) =>
                                      [
                                          "review",
                                          "equipment",
                                          "finalize",
                                      ].includes(k)
                                  )
                                : null,
                        },
                        timestamp: Date.now(),
                    }),
                }
            ).catch(() => {});
            // #endregion
            return humanizeStepId(stepId);
        }
    };
}

export function CharacterCreationSidebar({
    graph,
    activeStepId,
    pendingDecisions,
    stepHint,
    isLastStep,
    isSaving = false,
    onStepSelect,
    onBack,
    onNext,
    onSave,
}: CharacterCreationSidebarProps) {
    const t = useTranslations("characterCreation");
    const labelFor = useStepLabel();

    const pendingCountByMacro = useMemo(() => {
        const counts = new Map<string, number>();

        for (const decision of pendingDecisions) {
            const macroId = graph.getMacroGroupForStep(decision.stepId);

            if (!macroId) {
                continue;
            }

            counts.set(macroId, (counts.get(macroId) ?? 0) + 1);
        }

        return counts;
    }, [graph, pendingDecisions]);

    const activeMacroId = graph.getMacroGroupForStep(activeStepId);

    function renderStepButton(stepId: string) {
        const step = graph.getStep(stepId);

        if (!step) {
            return null;
        }

        const isActive = stepId === activeStepId;

        return (
            <button
                key={stepId}
                type="button"
                onClick={() => onStepSelect(stepId)}
                className={cn(
                    "rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60",
                    isActive &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
            >
                {labelFor(step.labelKey, stepId, step.labelValues)}
            </button>
        );
    }

    return (
        <div
            data-testid="character-creation-sidebar"
            className="flex h-full min-h-[32rem] flex-col gap-4 border-r bg-muted/20 p-4 md:min-w-[16rem] md:max-w-[18rem]"
        >
            <nav aria-label={t("navigation.stepsNav")} className="flex flex-col gap-2">
                {graph.macroGroups.map((macro) => {
                    const macroPending = pendingCountByMacro.get(macro.id) ?? 0;
                    const isActiveMacro = macro.id === activeMacroId;
                    const hasMultipleSteps = macro.stepIds.length > 1;

                    if (macro.stepIds.length === 0) {
                        return null;
                    }

                    if (!hasMultipleSteps) {
                        const stepId = macro.stepIds[0]!;
                        const step = graph.getStep(stepId);

                        if (!step) {
                            return null;
                        }

                        const isActive = stepId === activeStepId;

                        return (
                            <div
                                key={macro.id}
                                className="flex items-center justify-between gap-2"
                            >
                                <button
                                    type="button"
                                    onClick={() => onStepSelect(stepId)}
                                    className={cn(
                                        "flex-1 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60",
                                        isActive &&
                                            "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {labelFor(
                                        step.labelKey,
                                        stepId,
                                        step.labelValues
                                    )}
                                </button>
                                {macroPending > 0 ? (
                                    <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                                        {macroPending}
                                    </span>
                                ) : null}
                            </div>
                        );
                    }

                    return (
                        <div key={macro.id} className="flex flex-col gap-0.5">
                            <div
                                className={cn(
                                    "flex items-center justify-between rounded-md px-2 py-2 text-sm font-semibold",
                                    isActiveMacro && "text-primary"
                                )}
                            >
                                <span>{labelFor(macro.labelKey, macro.id)}</span>
                                {macroPending > 0 ? (
                                    <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                                        {macroPending}
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-0.5 pl-3">
                                {macro.stepIds.map((stepId) =>
                                    renderStepButton(stepId)
                                )}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {pendingDecisions.length > 0 ? (
                <div className="mt-auto flex flex-col gap-2 border-t pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("navigation.pendingTitle", {
                            count: pendingDecisions.length,
                        })}
                    </p>
                    <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                        {pendingDecisions.map((decision) => (
                            <li key={decision.id}>
                                <button
                                    type="button"
                                    className="w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/60"
                                    onClick={() =>
                                        onStepSelect(
                                            decision.stepId,
                                            decision.focusKey
                                        )
                                    }
                                >
                                    {decision.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {stepHint ? (
                <p className="text-sm font-medium text-destructive">{stepHint}</p>
            ) : null}

            <div className="flex items-center justify-between gap-2 border-t pt-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    disabled={graph.getStepIndex(activeStepId) <= 0}
                >
                    {t("navigation.back")}
                </Button>

                {isLastStep ? (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving}
                        className="font-semibold"
                    >
                        {t("navigation.save")}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onNext}
                        className="font-semibold"
                    >
                        {t("navigation.next")}
                    </Button>
                )}
            </div>
        </div>
    );
}
