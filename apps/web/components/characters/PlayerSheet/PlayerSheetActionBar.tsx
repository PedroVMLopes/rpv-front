"use client";

import { Dices, ListChecks, NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRollAssistant } from "./roll/RollAssistantProvider";

export function PlayerSheetActionBar() {
    const t = useTranslations("playerSheet.actionBar");
    const tRoll = useTranslations("playerSheet.roll");
    const { openManualRoll } = useRollAssistant();

    return (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
            <div
                role="toolbar"
                aria-label={t("navLabel")}
                className="flex items-center gap-1 rounded-2xl border-custom border-background bg-card px-1 py-1 shadow-xs"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={t("skills")}
                    className="text-muted-foreground"
                >
                    <ListChecks className="size-4" aria-hidden />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={tRoll("openFab")}
                    className="text-primary"
                    onClick={openManualRoll}
                >
                    <Dices className="size-5" aria-hidden />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={t("notes")}
                    className="text-muted-foreground"
                >
                    <NotebookPen className="size-4" aria-hidden />
                </Button>
            </div>
        </div>
    );
}
