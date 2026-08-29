"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { RestKind } from "@/lib/character/applyRest";
import {
    listShortRestRecoveries,
    type ShortRestRecovery,
} from "@/lib/character/combatResources";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { OverviewPanel } from "../overview/OverviewPanel";
import { HitDiceControl } from "./HitDiceControl";
import { ShortRestModal } from "./ShortRestModal";

type RestActionsProps = {
    stored: StoredCharacter;
};

export function RestActions({ stored }: RestActionsProps) {
    const t = useTranslations("playerSheet.combat");
    const applyRest = useCharacterStore((state) => state.applyRest);
    const [shortRestOpen, setShortRestOpen] = useState(false);
    const [recoveries, setRecoveries] = useState<ShortRestRecovery[]>([]);

    const rest = (kind: RestKind) => {
        if (kind === "short_rest") {
            setRecoveries(
                listShortRestRecoveries(stored.grants ?? [], stored.resources)
            );
            applyRest(stored.id, "short_rest");
            setShortRestOpen(true);
            return;
        }

        applyRest(stored.id, kind);
    };

    return (
        <OverviewPanel title={t("rest")}>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => rest("short_rest")}
                >
                    {t("shortRest")}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => rest("long_rest")}
                >
                    {t("longRest")}
                </Button>
            </div>
            <HitDiceControl stored={stored} showSpend={false} />
            <ShortRestModal
                stored={stored}
                recoveries={recoveries}
                open={shortRestOpen}
                onOpenChange={setShortRestOpen}
            />
        </OverviewPanel>
    );
}
