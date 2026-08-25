"use client";

import { useEffect, useRef, useState, type TransitionEvent } from "react";
import { Dices, ListChecks, NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { AbilityChecksPanel } from "./AbilityChecksPanel";
import { DiceRollAssistant } from "./roll/DiceRollAssistant";
import { useRollAssistant } from "./roll/RollAssistantProvider";
import { QuickNotePanel } from "./notes/QuickNotePanel";

type PlayerSheetActionBarProps = {
    stored?: StoredCharacter;
};

type ActionBarPanel = "skills" | "dice" | "notes";

const CLOSE_MS = 200;

function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PlayerSheetActionBar({ stored }: PlayerSheetActionBarProps) {
    const t = useTranslations("playerSheet.actionBar");
    const tSheet = useTranslations("playerSheet");
    const tRoll = useTranslations("playerSheet.roll");
    const { state, openManualRoll, close } = useRollAssistant();
    const [panel, setPanel] = useState<ActionBarPanel | null>(null);
    const [expanded, setExpanded] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const expandRafRef = useRef<number | null>(null);

    const isMounted = panel !== null;

    const clearCloseTimer = () => {
        if (closeTimerRef.current !== null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const clearExpandRaf = () => {
        if (expandRafRef.current !== null) {
            cancelAnimationFrame(expandRafRef.current);
            expandRafRef.current = null;
        }
    };

    const scheduleExpand = () => {
        clearExpandRaf();

        if (prefersReducedMotion()) {
            setExpanded(true);
            return;
        }

        // Two rAFs: paint collapsed (0fr) first, then expand so CSS can transition.
        expandRafRef.current = requestAnimationFrame(() => {
            expandRafRef.current = requestAnimationFrame(() => {
                expandRafRef.current = null;
                setExpanded(true);
            });
        });
    };

    const finishClose = () => {
        clearCloseTimer();
        clearExpandRaf();
        close();
        setPanel(null);
    };

    const collapsePanel = () => {
        clearExpandRaf();
        setExpanded(false);

        if (prefersReducedMotion()) {
            finishClose();
            return;
        }

        clearCloseTimer();
        closeTimerRef.current = setTimeout(finishClose, CLOSE_MS);
    };

    const dismissPanel = () => {
        collapsePanel();
    };

    const openPanel = (next: ActionBarPanel) => {
        clearCloseTimer();

        if (next === "dice" && !state.open) {
            openManualRoll();
        }

        const alreadyExpanded = expanded;

        setPanel(next);

        if (alreadyExpanded) {
            setExpanded(true);
            return;
        }

        setExpanded(false);
        scheduleExpand();
    };

    const selectPanel = (next: ActionBarPanel) => {
        if (panel === next && expanded) {
            dismissPanel();
            return;
        }

        if (panel === "dice" && next !== "dice" && state.open) {
            close();
        }

        openPanel(next);
    };

    useEffect(() => {
        if (state.open) {
            clearCloseTimer();
            setPanel("dice");
            if (expanded) {
                return;
            }
            setExpanded(false);
            scheduleExpand();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when roll assistant opens
    }, [state.open]);

    useEffect(() => {
        if (!isMounted) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                dismissPanel();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Escape while mounted
    }, [isMounted, state.open, close, expanded, panel]);

    useEffect(() => {
        return () => {
            clearCloseTimer();
            clearExpandRaf();
        };
    }, []);

    const handlePanelGridTransitionEnd = (
        event: TransitionEvent<HTMLDivElement>
    ) => {
        if (event.propertyName !== "grid-template-rows") {
            return;
        }

        if (!expanded) {
            finishClose();
        }
    };

    const buttonClass = (id: ActionBarPanel, accentWhenIdle = false) =>
        cn(
            expanded && panel === id
                ? "text-primary"
                : accentWhenIdle
                  ? "text-primary"
                  : "text-card-foreground"
        );

    return (
        <>
            {isMounted ? (
                <button
                    type="button"
                    aria-label={tRoll("cancel")}
                    className={cn(
                        "fixed inset-0 z-30 cursor-default bg-black/30 transition-opacity duration-200 motion-reduce:transition-none",
                        expanded
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                    )}
                    onClick={dismissPanel}
                />
            ) : null}

            <div
                className={cn(
                    "fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col pb-[env(safe-area-inset-bottom)] transition-[width] duration-200 motion-reduce:transition-none",
                    expanded ? "w-[calc(100%-2rem)] max-w-lg" : "w-auto"
                )}
            >
                <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border-custom border-background bg-card text-card-foreground shadow-xs">
                    {isMounted ? (
                        <div
                            className={cn(
                                "grid min-h-0 transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
                                expanded
                                    ? "grid-rows-[1fr]"
                                    : "grid-rows-[0fr]"
                            )}
                            onTransitionEnd={handlePanelGridTransitionEnd}
                        >
                            <div className="flex h-full min-h-0 flex-col overflow-hidden">
                                <div
                                    key={panel}
                                    className={cn(
                                        "flex h-full min-h-0 flex-col px-3 pt-3 transition-opacity duration-200 motion-reduce:transition-none",
                                        panel === "skills" || panel === "notes"
                                            ? "overflow-hidden"
                                            : "overflow-y-auto",
                                        expanded
                                            ? "opacity-100 animate-in fade-in duration-200"
                                            : "opacity-0"
                                    )}
                                >
                                    {panel === "dice" ? (
                                        <DiceRollAssistant
                                            onDismiss={collapsePanel}
                                        />
                                    ) : panel === "skills" ? (
                                        stored ? (
                                            <AbilityChecksPanel stored={stored} />
                                        ) : (
                                            <p className="pb-2 text-sm text-muted-foreground">
                                                {tSheet("noneYet")}
                                            </p>
                                        )
                                    ) : stored ? (
                                        <QuickNotePanel
                                            stored={stored}
                                            onDismiss={collapsePanel}
                                        />
                                    ) : (
                                        <p className="pb-2 text-sm text-muted-foreground">
                                            {tSheet("noneYet")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div
                        role="toolbar"
                        aria-label={t("navLabel")}
                        className="flex shrink-0 items-center justify-center gap-1 px-1 py-1"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("skills")}
                            aria-pressed={expanded && panel === "skills"}
                            aria-expanded={expanded && panel === "skills"}
                            className={buttonClass("skills")}
                            onClick={() => selectPanel("skills")}
                        >
                            <ListChecks className="size-4" aria-hidden />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={tRoll("openFab")}
                            aria-pressed={expanded && panel === "dice"}
                            aria-expanded={expanded && panel === "dice"}
                            className={buttonClass("dice")}
                            onClick={() => selectPanel("dice")}
                        >
                            <Dices className="size-5" aria-hidden />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("notes")}
                            aria-pressed={expanded && panel === "notes"}
                            aria-expanded={expanded && panel === "notes"}
                            className={buttonClass("notes")}
                            onClick={() => selectPanel("notes")}
                        >
                            <NotebookPen className="size-4" aria-hidden />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
