"use client";

import { useEffect, useState } from "react";
import { Dices, ListChecks, NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DiceRollAssistant } from "./roll/DiceRollAssistant";
import { useRollAssistant } from "./roll/RollAssistantProvider";

type ActionBarPanel = "skills" | "dice" | "notes";

export function PlayerSheetActionBar() {
    const t = useTranslations("playerSheet.actionBar");
    const tSheet = useTranslations("playerSheet");
    const tRoll = useTranslations("playerSheet.roll");
    const { state, openManualRoll, close } = useRollAssistant();
    const [panel, setPanel] = useState<ActionBarPanel | null>(null);

    const isOpen = panel !== null;

    const dismissPanel = () => {
        if (state.open) {
            close();
        }
        setPanel(null);
    };

    const selectPanel = (next: ActionBarPanel) => {
        if (panel === next) {
            dismissPanel();
            return;
        }

        if (panel === "dice" && next !== "dice" && state.open) {
            close();
        }

        if (next === "dice" && !state.open) {
            openManualRoll();
        }

        setPanel(next);
    };

    useEffect(() => {
        if (state.open) {
            setPanel("dice");
        }
    }, [state.open]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (state.open) {
                    close();
                }
                setPanel(null);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, state.open, close]);

    const buttonClass = (id: ActionBarPanel, accentWhenIdle = false) =>
        cn(
            panel === id
                ? "text-primary"
                : accentWhenIdle
                  ? "text-primary"
                  : "text-muted-foreground"
        );

    return (
        <>
            {isOpen ? (
                <button
                    type="button"
                    aria-label={tRoll("cancel")}
                    className="fixed inset-0 z-30 cursor-default bg-black/30"
                    onClick={dismissPanel}
                />
            ) : null}

            <div
                className={cn(
                    "fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col pb-[env(safe-area-inset-bottom)] transition-[width] duration-200",
                    isOpen ? "w-[calc(100%-2rem)] max-w-lg" : "w-auto"
                )}
            >
                <div
                    className={cn(
                        "flex flex-col overflow-hidden rounded-2xl border-custom border-background bg-card text-card-foreground shadow-xs transition-[max-height] duration-200",
                        isOpen ? "max-h-[70vh]" : "max-h-none"
                    )}
                >
                    {isOpen ? (
                        <div
                            key={panel}
                            className="min-h-0 flex-1 animate-in fade-in duration-150 overflow-y-auto px-3 pt-3"
                        >
                            {panel === "dice" ? (
                                <DiceRollAssistant
                                    onDismiss={() => setPanel(null)}
                                />
                            ) : (
                                <p className="pb-2 text-sm text-muted-foreground">
                                    {tSheet("comingSoon")}
                                </p>
                            )}
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
                            aria-pressed={panel === "skills"}
                            aria-expanded={panel === "skills"}
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
                            aria-pressed={panel === "dice"}
                            aria-expanded={panel === "dice"}
                            className={buttonClass("dice", true)}
                            onClick={() => selectPanel("dice")}
                        >
                            <Dices className="size-5" aria-hidden />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("notes")}
                            aria-pressed={panel === "notes"}
                            aria-expanded={panel === "notes"}
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
