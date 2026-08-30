"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { INSPIRATION_REF } from "@/lib/character/sessionMetaPoints";
import { getSessionMetaPointTrackers } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { getMetaPoint } from "@/lib/character/sessionMetaPoints";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type InspirationToggleProps = {
    stored: StoredCharacter;
};

export function InspirationToggle({ stored }: InspirationToggleProps) {
    const t = useTranslations("playerSheet.inspiration");
    const setCharacterSession = useCharacterStore(
        (state) => state.setCharacterSession
    );

    const tracker = getSessionMetaPointTrackers(stored.system).find(
        (entry) => entry.ref === INSPIRATION_REF
    );

    if (!tracker) {
        return null;
    }

    const count = getMetaPoint(stored.session, INSPIRATION_REF);
    const isActive = count > 0;

    const handleToggle = () => {
        setCharacterSession(stored.id, {
            metaPoints: { [INSPIRATION_REF]: isActive ? 0 : 1 },
        });
    };

    return (
        <div
            className={cn(
                "mt-1 flex items-center justify-between gap-2 rounded-lg px-3 py-2",
                sheetInset
            )}
        >
            <span className="text-sm text-muted-foreground">
                {t("count", { count })}
            </span>
            <Button
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                aria-pressed={isActive}
                aria-label={isActive ? t("toggleOff") : t("toggleOn")}
                title={isActive ? t("toggleOff") : t("toggleOn")}
                onClick={handleToggle}
            >
                <Sparkles
                    className={cn("size-4", !isActive && "opacity-50")}
                    aria-hidden
                />
            </Button>
        </div>
    );
}
