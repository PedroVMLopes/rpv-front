"use client";

import { useTranslations } from "next-intl";
import { SheetPanel } from "@/components/characters/SheetPanel";
import type { PendingDecision } from "@/lib/character/pendingDecisions";
import { cn } from "@/lib/utils";

type PendingDecisionsPanelProps = {
    decisions: PendingDecision[];
    onNavigateToStep?: (stepIndex: number) => void;
    editBaseHref?: string;
    panelVariant?: "default" | "nested";
};

export function PendingDecisionsPanel({
    decisions,
    onNavigateToStep,
    editBaseHref,
    panelVariant = "default",
}: PendingDecisionsPanelProps) {
    const t = useTranslations("character");

    if (decisions.length === 0) {
        return null;
    }

    return (
        <SheetPanel
            title={t("pendingDecisionsTitle", { count: decisions.length })}
            variant={panelVariant}
        >
            <ul className="flex flex-col gap-1.5">
                {decisions.map((decision) => {
                    const className = cn(
                        "rounded-md px-2 py-1.5 text-sm text-left",
                        (onNavigateToStep || editBaseHref) &&
                            "hover:bg-muted/60 cursor-pointer"
                    );

                    if (editBaseHref) {
                        return (
                            <li key={decision.id}>
                                <a
                                    href={`${editBaseHref}?step=${decision.stepIndex}`}
                                    className={cn(className, "block text-muted-foreground")}
                                >
                                    {decision.label}
                                </a>
                            </li>
                        );
                    }

                    if (onNavigateToStep) {
                        return (
                            <li key={decision.id}>
                                <button
                                    type="button"
                                    className={cn(
                                        className,
                                        "w-full text-muted-foreground"
                                    )}
                                    onClick={() =>
                                        onNavigateToStep(decision.stepIndex)
                                    }
                                >
                                    {decision.label}
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li
                            key={decision.id}
                            className={cn(className, "text-muted-foreground")}
                        >
                            {decision.label}
                        </li>
                    );
                })}
            </ul>
        </SheetPanel>
    );
}
