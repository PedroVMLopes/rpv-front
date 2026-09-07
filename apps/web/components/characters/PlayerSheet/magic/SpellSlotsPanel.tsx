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
import { isSlotUsed } from "../overview/sheetResourceSquares";
import { SpellSlotLevelBlock } from "../combat/SpellSlotLevelBlock";

type SpellSlotsPanelProps = {
    stored: StoredCharacter;
};

export function SpellSlotsPanel({ stored }: SpellSlotsPanelProps) {
    const t = useTranslations("playerSheet");
    const tResources = useTranslations("classResources");
    const updateResource = useCharacterStore((state) => state.updateResource);

    const entries = useMemo(
        () => listCombatResources(stored.grants ?? [], stored.resources),
        [stored.grants, stored.resources]
    );

    const wizardSlots = useMemo(
        () =>
            entries
                .filter((entry) => entry.ref.startsWith("spell-slots-"))
                .sort((a, b) => (a.spellLevel ?? 0) - (b.spellLevel ?? 0)),
        [entries]
    );
    const pactSlots = useMemo(
        () =>
            entries.filter(
                (entry) =>
                    isSlotDisplay(entry) && !entry.ref.startsWith("spell-slots-")
            ),
        [entries]
    );

    if (wizardSlots.length === 0 && pactSlots.length === 0) {
        return null;
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

    const slotAria = (index: number, total: number, isUsed: boolean) =>
        isUsed
            ? t("resourceSlotUsed", { index, total })
            : t("resourceSlotAvailable", { index, total });

    return (
        <>
            {pactSlots.length > 0 ? (
                <OverviewPanel
                    title={formatResourceRefLabel(
                        pactSlots[0]?.ref ?? "pact-slots",
                        (key) => tResources(key)
                    )}
                >
                    <div className="flex min-w-0 flex-wrap items-start gap-2">
                        {pactSlots.map((entry) => {
                            const usedCount = entry.max - entry.current;
                            const displayLabel = formatResourceRefLabel(
                                entry.ref,
                                (key) => tResources(key)
                            );

                            return (
                                <SpellSlotLevelBlock
                                    key={entry.ref}
                                    rowKey={entry.ref}
                                    label={
                                        entry.spellLevel !== undefined
                                            ? `${displayLabel} (${entry.spellLevel})`
                                            : displayLabel
                                    }
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

            {wizardSlots.length > 0 ? (
                <OverviewPanel title={t("combat.spellSlots")}>
                    <div className="flex min-w-0 flex-wrap items-start gap-2">
                        {wizardSlots.map((entry) => {
                            const spellLevel = entry.spellLevel;
                            if (spellLevel === undefined) {
                                return null;
                            }

                            const usedCount = entry.max - entry.current;

                            return (
                                <SpellSlotLevelBlock
                                    key={entry.ref}
                                    rowKey={entry.ref}
                                    label={t("spellSlotLevelLabel", {
                                        level: spellLevel,
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
