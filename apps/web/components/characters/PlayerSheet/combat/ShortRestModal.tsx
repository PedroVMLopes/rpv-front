"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DiceResultStep } from "@/components/characters/PlayerSheet/roll/DiceResultStep";
import { HitDiceControl } from "./HitDiceControl";
import type { ShortRestRecovery } from "@/lib/character/combatResources";
import { getHitDicePool } from "@/lib/character/hitDice";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import { getSystemRules } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type ShortRestModalProps = {
    stored: StoredCharacter;
    recoveries: ShortRestRecovery[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ShortRestModal({
    stored,
    recoveries,
    open,
    onOpenChange,
}: ShortRestModalProps) {
    const t = useTranslations("playerSheet.combat");
    const tVitality = useTranslations("playerSheet.vitality");
    const tResources = useTranslations("classResources");
    const applyVitalityChange = useCharacterStore(
        (state) => state.applyVitalityChange
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const live = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id) ??
            stored
    );
    const [pickingDie, setPickingDie] = useState(false);
    const pool = getHitDicePool(live);
    const hasVitality =
        getSystemRules(live.system).vitality !== undefined && pool !== undefined;

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setPickingDie(false);
        }
        onOpenChange(next);
    };

    const handleSpendDie = (dieRoll: number) => {
        applyVitalityChange(live.id, {
            type: "spendHitDie",
            dieRoll,
        });
        const constitution = getResolvedStats(live.id)?.constitution ?? 10;
        const heal =
            getSystemRules(live.system).vitality?.hitDieHeal(
                dieRoll,
                constitution
            ) ?? Math.max(1, dieRoll);
        toast(
            tVitality("hitDieToast", {
                label: tVitality("hitDice"),
                total: heal,
            })
        );
        setPickingDie(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        {t("shortRestModal.title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("shortRestModal.hpNote")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <section className="flex flex-col gap-2">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                            {t("shortRestModal.recovered")}
                        </h3>
                        {recoveries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t("shortRestModal.noClassPools")}
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-1.5">
                                {recoveries.map((recovery) => (
                                    <li
                                        key={recovery.ref}
                                        className={cn(
                                            "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm",
                                            sheetInset
                                        )}
                                    >
                                        <span>
                                            {formatResourceRefLabel(
                                                recovery.ref,
                                                (key) => tResources(key)
                                            )}
                                        </span>
                                        <span className="tabular-nums font-semibold">
                                            {t("shortRestModal.recoveredItem", {
                                                previous: recovery.previous,
                                                max: recovery.max,
                                            })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {hasVitality ? (
                        <section className="flex flex-col gap-3">
                            <HitDiceControl
                                stored={live}
                                showSpend={!pickingDie}
                                onSpend={() => setPickingDie(true)}
                            />
                            {pickingDie && pool?.sides ? (
                                <div className="flex flex-col gap-3">
                                    <DiceResultStep
                                        sides={pool.sides}
                                        onSelectValue={handleSpendDie}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPickingDie(false)}
                                    >
                                        {t("shortRestModal.cancelDie")}
                                    </Button>
                                </div>
                            ) : null}
                        </section>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                    >
                        {t("shortRestModal.done")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
