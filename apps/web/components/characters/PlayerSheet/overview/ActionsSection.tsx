"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
    listEquippedWeaponActions,
    listSpellActions,
    type SpellAction,
    type WeaponAction,
} from "@/lib/character/combatActions";
import { parseDerivedResources } from "@/lib/character/deriveResourcesFromForm";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
    buildWeaponAttackRollRequest,
} from "@/lib/roll/buildRollRequest";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CombatActionCard } from "../combat/CombatActionCard";
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

function openWeaponRoll(
    weapon: WeaponAction,
    openRollRequest: ReturnType<typeof useRollAssistant>["openRollRequest"]
) {
    const request = buildWeaponAttackRollRequest(weapon);
    if (request) {
        openRollRequest(request);
    }
}

function openSpellRoll(
    spell: SpellAction,
    openRollRequest: ReturnType<typeof useRollAssistant>["openRollRequest"]
) {
    const request =
        spell.rollProfile?.mode === "attack"
            ? buildSpellAttackRollRequest(spell)
            : spell.rollProfile?.mode === "save"
              ? buildSpellDamageRollRequest(spell)
              : null;

    if (request) {
        openRollRequest(request);
    }
}

function groupSpellsByLevel(spells: SpellAction[]): Map<number, SpellAction[]> {
    const byLevel = new Map<number, SpellAction[]>();

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

function SpellActionListItem({
    spell,
    openRollRequest,
}: {
    spell: SpellAction;
    openRollRequest: ReturnType<typeof useRollAssistant>["openRollRequest"];
}) {
    return (
        <li>
            <CombatActionCard
                title={spell.name}
                details={
                    [spell.attackBonus, spell.saveDc].filter(Boolean) as string[]
                }
                description={spell.description}
                actionKind="roll"
                onRoll={
                    buildSpellAttackRollRequest(spell) ||
                    buildSpellDamageRollRequest(spell)
                        ? () => openSpellRoll(spell, openRollRequest)
                        : undefined
                }
            />
        </li>
    );
}

export function ActionsSection({ stored }: ActionsSectionProps) {
    const t = useTranslations("playerSheet");
    const tSlots = useTranslations("equipmentSlots");
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

    const slotLabel = (slotId: "main-hand" | "off-hand") =>
        slotId === "main-hand" ? tSlots("mainHand") : tSlots("offHand");

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
                                <li key={weapon.id}>
                                    <CombatActionCard
                                        title={weapon.name}
                                        badge={slotLabel(weapon.slotId)}
                                        details={
                                            [
                                                weapon.toHit,
                                                weapon.damage,
                                            ].filter(Boolean) as string[]
                                        }
                                        description={weapon.description}
                                        actionKind="roll"
                                        onRoll={
                                            buildWeaponAttackRollRequest(weapon)
                                                ? () =>
                                                      openWeaponRoll(
                                                          weapon,
                                                          openRollRequest
                                                      )
                                                : undefined
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cantrips.length > 0 ? (
                    <ActionsCollapsible title={t("cantrips")}>
                        <ul className="flex flex-col gap-2">
                            {cantrips.map((spell) => (
                                <li key={spell.id}>
                                    <CombatActionCard
                                        title={spell.name}
                                        badge={t("cantripBadge")}
                                        details={
                                            [
                                                spell.attackBonus,
                                                spell.saveDc,
                                            ].filter(Boolean) as string[]
                                        }
                                        description={spell.description}
                                        actionKind="roll"
                                        onRoll={
                                            buildSpellAttackRollRequest(spell) ||
                                            buildSpellDamageRollRequest(spell)
                                                ? () =>
                                                      openSpellRoll(
                                                          spell,
                                                          openRollRequest
                                                      )
                                                : undefined
                                        }
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
                                <ul className="flex flex-col gap-2">
                                    {levelSpells.map((spell) => (
                                        <SpellActionListItem
                                            key={spell.id}
                                            spell={spell}
                                            openRollRequest={openRollRequest}
                                        />
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
