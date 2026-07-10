"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import {
    listEquippedWeaponActions,
    listSpellActions,
} from "@/lib/character/combatActions";
import { parseDerivedResources } from "@/lib/character/deriveResourcesFromForm";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { SpellActionCard } from "@/components/content/spells/SpellActionCard";
import { WeaponActionCard } from "@/components/content/weapons/WeaponActionCard";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { ActionsCollapsible } from "./ActionsCollapsible";
import { OverviewPanel } from "./OverviewPanel";
import { SheetDerivedResourcesPanel } from "./SheetDerivedResourcesPanel";
import {
    ResourceSquareRow,
    updateUsedCountByKey,
    type UsedCountByKey,
} from "./sheetResourceSquares";

type ActionsSectionProps = {
    stored: StoredCharacter;
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

export function ActionsSection({ stored }: ActionsSectionProps) {
    const t = useTranslations("playerSheet");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);

    const weapons = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return listEquippedWeaponActions(stored, resolved, contentLocale);
    }, [contentLocale, resolved, stored]);

    const { cantrips, spells } = useMemo(() => {
        if (!resolved) {
            return { cantrips: [], spells: [] };
        }

        return listSpellActions(stored, resolved, contentLocale);
    }, [contentLocale, resolved, stored]);

    const spellSlots = useMemo(
        () => parseDerivedResources(stored.resources).spellSlots,
        [stored.resources]
    );

    const spellsByLevel = useMemo(() => groupSpellsByLevel(spells), [spells]);

    const classEntry = stored.selections.characterClass
        ? contentRepo(stored.system).getClass(
              stored.selections.characterClass,
              contentLocale
          )
        : undefined;
    const spellcastingAbility = classEntry?.spellcastingAbility ?? null;

    const resourceSignature = useMemo(
        () =>
            JSON.stringify({
                id: stored.id,
                spellSlots,
            }),
        [spellSlots, stored.id]
    );

    const [usedCountByKey, setUsedCountByKey] = useState<UsedCountByKey>({});

    useEffect(() => {
        setUsedCountByKey({});
    }, [resourceSignature]);

    const slotAria = (index: number, total: number, isUsed: boolean) =>
        isUsed
            ? t("resourceSlotUsed", { index, total })
            : t("resourceSlotAvailable", { index, total });

    const handleSlotToggle = (rowKey: string, index: number, total: number) => {
        setUsedCountByKey((current) =>
            updateUsedCountByKey(current, rowKey, index, total)
        );
    };

    return (
        <OverviewPanel title={t("actions")}>
            <div className="flex flex-col gap-4">
                <SheetDerivedResourcesPanel stored={stored} hideSpellSlots />

                <div className="flex flex-col gap-2">
                    {weapons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("noWeapons")}
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {weapons.map((weapon) => (
                                <li key={weapon.id} className="min-w-0">
                                    <WeaponActionCard
                                        stored={stored}
                                        weapon={weapon}
                                        openRollRequest={openRollRequest}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cantrips.length > 0 ? (
                    <ActionsCollapsible title={t("cantrips")}>
                        <ul className="grid grid-cols-2 gap-2">
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

                {spellSlots.map((slot) => {
                    const levelSpells = spellsByLevel.get(slot.level) ?? [];

                    return (
                        <ActionsCollapsible
                            key={slot.ref}
                            title={t("spellSlotLevelLabel", {
                                level: slot.level,
                            })}
                            headerExtra={
                                <ResourceSquareRow
                                    rowKey={slot.ref}
                                    count={slot.count}
                                    usedCount={usedCountByKey[slot.ref] ?? 0}
                                    onToggle={(index) =>
                                        handleSlotToggle(
                                            slot.ref,
                                            index,
                                            slot.count
                                        )
                                    }
                                    slotAriaLabel={slotAria}
                                />
                            }
                        >
                            {levelSpells.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t("noSpellsAtLevel", { level: slot.level })}
                                </p>
                            ) : (
                                <ul className="grid grid-cols-2 gap-2">
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
