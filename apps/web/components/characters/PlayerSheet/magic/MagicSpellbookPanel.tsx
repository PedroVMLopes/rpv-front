"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import {
    canAdjustCombatResource,
    listCombatResources,
    type CombatResourceEntry,
} from "@/lib/character/combatResources";
import { listSpellActions } from "@/lib/character/combatActions";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { SpellActionCard } from "@/components/content/spells/SpellActionCard";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { ActionsCollapsible } from "../overview/ActionsCollapsible";
import { OverviewPanel } from "../overview/OverviewPanel";
import {
    isSlotUsed,
    ResourceSquareRow,
} from "../overview/sheetResourceSquares";

type MagicSpellbookPanelProps = {
    stored: StoredCharacter;
    emptyAction?: ReactNode;
};

function groupSpellsByLevel(
    spells: ReturnType<typeof listSpellActions>["spells"]
): Map<number, ReturnType<typeof listSpellActions>["spells"][number][]> {
    const byLevel = new Map<
        number,
        ReturnType<typeof listSpellActions>["spells"][number][]
    >();

    for (const spell of spells) {
        if (spell.levelInt === null || spell.levelInt <= 0) {
            continue;
        }

        const levelSpells = byLevel.get(spell.levelInt) ?? [];
        levelSpells.push(spell);
        byLevel.set(spell.levelInt, levelSpells);
    }

    return byLevel;
}

export function MagicSpellbookPanel({
    stored,
    emptyAction,
}: MagicSpellbookPanelProps) {
    const t = useTranslations("playerSheet");
    const tMagic = useTranslations("playerSheet.magic");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const updateResource = useCharacterStore((state) => state.updateResource);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);

    const { cantrips, spells } = useMemo(() => {
        if (!resolved) {
            return { cantrips: [], spells: [] };
        }

        return listSpellActions(stored, resolved, contentLocale);
    }, [contentLocale, resolved, stored]);

    const spellsByLevel = useMemo(() => groupSpellsByLevel(spells), [spells]);

    const slotEntries = useMemo(() => {
        return listCombatResources(stored.grants ?? [], stored.resources)
            .filter((entry) => entry.ref.startsWith("spell-slots-"))
            .sort((a, b) => (a.spellLevel ?? 0) - (b.spellLevel ?? 0));
    }, [stored.grants, stored.resources]);

    const levelsToShow = useMemo(() => {
        const levels = new Set<number>();
        for (const entry of slotEntries) {
            if (entry.spellLevel !== undefined) {
                levels.add(entry.spellLevel);
            }
        }
        for (const level of spellsByLevel.keys()) {
            levels.add(level);
        }
        return [...levels].sort((a, b) => a - b);
    }, [slotEntries, spellsByLevel]);

    const classEntry = stored.selections.characterClass
        ? contentRepo(stored.system).getClass(
              stored.selections.characterClass,
              contentLocale
          )
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

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

    const isEmpty = cantrips.length === 0 && spells.length === 0;

    if (isEmpty) {
        return (
            <OverviewPanel title={tMagic("spellbookTitle")}>
                <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-muted-foreground">
                        {tMagic("emptySpellbook")}
                    </p>
                    {emptyAction}
                </div>
            </OverviewPanel>
        );
    }

    return (
        <OverviewPanel title={tMagic("spellbookTitle")}>
            <div className="flex flex-col gap-4">
                {cantrips.length > 0 ? (
                    <ActionsCollapsible title={t("cantrips")} defaultOpen>
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {cantrips.map((spell) => (
                                <li key={spell.id} className="min-w-0">
                                    <SpellActionCard
                                        stored={stored}
                                        spell={spell}
                                        spellcastingAbility={spellcastingAbility}
                                        openRollRequest={openRollRequest}
                                    />
                                </li>
                            ))}
                        </ul>
                    </ActionsCollapsible>
                ) : null}

                {levelsToShow.map((level) => {
                    const entry = slotEntries.find(
                        (slot) => slot.spellLevel === level
                    );
                    const levelSpells = spellsByLevel.get(level) ?? [];
                    const usedCount = entry ? entry.max - entry.current : 0;

                    return (
                        <ActionsCollapsible
                            key={`level-${level}`}
                            title={t("spellSlotLevelLabel", { level })}
                            defaultOpen={levelSpells.length > 0}
                            headerExtra={
                                entry ? (
                                    <ResourceSquareRow
                                        rowKey={entry.ref}
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
                                ) : null
                            }
                        >
                            {levelSpells.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t("noSpellsAtLevel", { level })}
                                </p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {levelSpells.map((spell) => (
                                        <li key={spell.id} className="min-w-0">
                                            <SpellActionCard
                                                stored={stored}
                                                spell={spell}
                                                spellcastingAbility={
                                                    spellcastingAbility
                                                }
                                                openRollRequest={openRollRequest}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ActionsCollapsible>
                    );
                })}
            </div>
        </OverviewPanel>
    );
}
