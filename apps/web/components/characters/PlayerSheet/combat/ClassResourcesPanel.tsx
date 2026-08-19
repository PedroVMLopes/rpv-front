"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
    canAdjustCombatResource,
    listCombatResources,
    type CombatResourceEntry,
} from "@/lib/character/combatResources";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { OverviewPanel } from "../overview/OverviewPanel";
import {
    isSlotUsed,
    ResourceSquareRow,
} from "../overview/sheetResourceSquares";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type ClassResourcesPanelProps = {
    stored: StoredCharacter;
};

export function ClassResourcesPanel({ stored }: ClassResourcesPanelProps) {
    const t = useTranslations("playerSheet");
    const tResources = useTranslations("classResources");
    const updateResource = useCharacterStore((state) => state.updateResource);

    const entries = useMemo(
        () => listCombatResources(stored.grants ?? [], stored.resources),
        [stored.grants, stored.resources]
    );

    const other = useMemo(
        () => entries.filter((entry) => entry.spellLevel === undefined),
        [entries]
    );
    const slots = useMemo(
        () =>
            entries
                .filter((entry) => entry.spellLevel !== undefined)
                .sort(
                    (a, b) => (a.spellLevel ?? 0) - (b.spellLevel ?? 0)
                ),
        [entries]
    );

    if (other.length === 0 && slots.length === 0) {
        return null;
    }

    const adjust = (entry: CombatResourceEntry, delta: number) => {
        if (!canAdjustCombatResource(entry, delta)) {
            return;
        }
        // Store treats missing keys as 0; panel treats missing as max.
        const storeCurrent = stored.resources[entry.ref] ?? 0;
        const next = entry.current + delta;
        const actualDelta = next - storeCurrent;
        if (actualDelta !== 0) {
            updateResource(stored.id, entry.ref, actualDelta);
        }
    };

    const slotAria = (index: number, total: number, isUsed: boolean) =>
        isUsed
            ? t("resourceSlotUsed", { index, total })
            : t("resourceSlotAvailable", { index, total });

    return (
        <>
            {other.length > 0 ? (
                <OverviewPanel title={t("combat.classResources")}>
                    <ul className="flex flex-col gap-2">
                        {other.map((entry) => {
                            const displayLabel = formatResourceRefLabel(
                                entry.ref,
                                (key) => tResources(key)
                            );

                            return (
                                <li
                                    key={entry.ref}
                                    className={cn(
                                        "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                                        sheetInset
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">
                                            {displayLabel}
                                        </p>
                                        <p className="text-xs tabular-nums text-muted-foreground">
                                            {entry.current} / {entry.max}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            disabled={
                                                !canAdjustCombatResource(
                                                    entry,
                                                    -1
                                                )
                                            }
                                            aria-label={`${displayLabel} −`}
                                            onClick={() => adjust(entry, -1)}
                                        >
                                            <FaMinus className="size-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            disabled={
                                                !canAdjustCombatResource(
                                                    entry,
                                                    1
                                                )
                                            }
                                            aria-label={`${displayLabel} +`}
                                            onClick={() => adjust(entry, 1)}
                                        >
                                            <FaPlus className="size-3" />
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </OverviewPanel>
            ) : null}

            {slots.length > 0 ? (
                <OverviewPanel title={t("combat.spellSlots")}>
                    <div className="flex flex-col gap-2">
                        {slots.map((entry) => {
                            const usedCount = entry.max - entry.current;

                            return (
                                <ResourceSquareRow
                                    key={entry.ref}
                                    rowKey={entry.ref}
                                    label={t("spellSlotLevelLabel", {
                                        level: entry.spellLevel,
                                    })}
                                    count={entry.max}
                                    usedCount={usedCount}
                                    onToggle={(index) => {
                                        const used = isSlotUsed(
                                            index,
                                            entry.max,
                                            usedCount
                                        );
                                        adjust(entry, used ? 1 : -1);
                                    }}
                                    slotAriaLabel={slotAria}
                                />
                            );
                        })}
                    </div>
                </OverviewPanel>
            ) : null}
        </>
    );
}
