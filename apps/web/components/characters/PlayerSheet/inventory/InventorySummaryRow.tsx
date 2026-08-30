"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaBox, FaCoins, FaWeightHanging } from "react-icons/fa6";
import { resolveStats } from "@rpv/domain";
import { countMiscItems } from "@/lib/character/inventoryDisplay";
import {
    deriveCarryingCapacity,
    formatCarriedWeight,
    sumInventoryWeight,
} from "@/lib/character/inventoryWeight";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { CurrencyPouch } from "./CurrencyPouch";

type InventorySummaryRowProps = {
    stored: StoredCharacter;
};

export function InventorySummaryRow({ stored }: InventorySummaryRowProps) {
    const t = useTranslations("playerSheet.inventory");

    const miscCount = countMiscItems(
        stored.selections.inventory?.bag ?? [],
        stored.system
    );
    const carried = useMemo(
        () => sumInventoryWeight(stored.selections.inventory, stored.system),
        [stored.selections.inventory, stored.system]
    );
    const capacity = useMemo(() => {
        const strength = resolveStats(stored.baseStats, stored.modifiers, {
            activeConditions: stored.session?.activeConditions,
        }).strength;
        return deriveCarryingCapacity(strength, stored.system);
    }, [stored.baseStats, stored.modifiers, stored.session, stored.system]);
    const capacityValue = capacity ?? 0;
    const fillPercent =
        capacityValue > 0
            ? Math.min(100, (carried / capacityValue) * 100)
            : 0;
    const weightLabel =
        capacity === undefined
            ? `${formatCarriedWeight(carried)} / —`
            : `${formatCarriedWeight(carried)} / ${formatCarriedWeight(capacity)}`;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <OverviewPanel
                title={t("summary.encumbrance")}
                headerAction={
                    <FaWeightHanging
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                }
            >
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold tabular-nums">{weightLabel}</p>
                    <div
                        className={cn(
                            "h-2 w-full overflow-hidden rounded-full",
                            sheetInset
                        )}
                        role="progressbar"
                        aria-valuenow={Math.round(fillPercent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={t("summary.encumbrance")}
                    >
                        <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${fillPercent}%` }}
                        />
                    </div>
                </div>
            </OverviewPanel>

            <OverviewPanel
                title={t("summary.currency")}
                headerAction={
                    <FaCoins
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                }
            >
                <CurrencyPouch stored={stored} />
            </OverviewPanel>

            <OverviewPanel
                title={t("summary.miscItems")}
                headerAction={
                    <FaBox
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                }
            >
                <p className="text-3xl font-bold tabular-nums">{miscCount}</p>
            </OverviewPanel>
        </div>
    );
}
