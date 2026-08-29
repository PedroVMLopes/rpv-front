"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { RestKind } from "@/lib/character/applyRest";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { OverviewPanel } from "../overview/OverviewPanel";
import { HitDiceControl } from "./HitDiceControl";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { buildHitDieRollRequest } from "@/lib/roll/buildRollRequest";
import { getHitDicePool } from "@/lib/character/hitDice";

type RestActionsProps = {
    stored: StoredCharacter;
};

export function RestActions({ stored }: RestActionsProps) {
    const t = useTranslations("playerSheet.combat");
    const tVitality = useTranslations("playerSheet.vitality");
    const applyRest = useCharacterStore((state) => state.applyRest);
    const { openRollRequest } = useRollAssistant();
    const pool = getHitDicePool(stored);

    const rest = (kind: RestKind) => {
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
            {pool ? (
                <HitDiceControl
                    stored={stored}
                    onSpend={() => {
                        if (!pool.sides) {
                            return;
                        }

                        openRollRequest(
                            buildHitDieRollRequest(
                                stored.id,
                                tVitality("hitDice"),
                                pool.sides
                            )
                        );
                    }}
                />
            ) : null}
        </OverviewPanel>
    );
}
