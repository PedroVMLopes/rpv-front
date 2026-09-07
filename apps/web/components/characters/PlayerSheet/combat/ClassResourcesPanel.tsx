"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    canAdjustCombatResource,
    isSlotDisplay,
    listCombatResources,
    type CombatResourceEntry,
} from "@/lib/character/combatResources";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { SpellSlotsPanel } from "../magic/SpellSlotsPanel";

type ClassResourcesPanelProps = {
    stored: StoredCharacter;
    /** When true, only spell/pact slot blocks are shown (no rage/ki/etc.). */
    slotsOnly?: boolean;
};

export function ClassResourcesPanel({
    stored,
    slotsOnly = false,
}: ClassResourcesPanelProps) {
    const t = useTranslations("playerSheet");
    const tResources = useTranslations("classResources");
    const updateResource = useCharacterStore((state) => state.updateResource);

    const entries = useMemo(
        () => listCombatResources(stored.grants ?? [], stored.resources),
        [stored.grants, stored.resources]
    );

    const other = useMemo(
        () =>
            entries.filter(
                (entry) =>
                    !isSlotDisplay(entry) && !entry.ref.startsWith("spell-slots-")
            ),
        [entries]
    );

    if (slotsOnly) {
        return <SpellSlotsPanel stored={stored} />;
    }

    const adjust = (entry: CombatResourceEntry, delta: number) => {
        if (!canAdjustCombatResource(entry, delta)) {
            return;
        }
        const storeCurrent = stored.resources[entry.ref] ?? 0;
        const next = entry.current + delta;
        const actualDelta = next - storeCurrent;
        if (actualDelta !== 0) {
            updateResource(stored.id, entry.ref, actualDelta);
        }
    };

    const hasSlots = entries.some(
        (entry) =>
            isSlotDisplay(entry) || entry.ref.startsWith("spell-slots-")
    );

    if (other.length === 0 && !hasSlots) {
        return null;
    }

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

            <SpellSlotsPanel stored={stored} />
        </>
    );
}
