"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    listEquippedWeaponActions,
    listFeatureActions,
    listSpellActions,
    type SpellAction,
    type WeaponAction,
} from "@/lib/character/combatActions";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
    buildWeaponAttackRollRequest,
} from "@/lib/roll/buildRollRequest";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CombatActionCard } from "./CombatActionCard";
import { OverviewPanel } from "../overview/OverviewPanel";
import { useRollAssistant } from "../roll/RollAssistantProvider";

type AttacksActionsPanelProps = {
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

export function AttacksActionsPanel({ stored }: AttacksActionsPanelProps) {
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

    const features = useMemo(
        () => listFeatureActions(stored.grants ?? [], contentLocale),
        [contentLocale, stored.grants]
    );

    const hasSpells = cantrips.length > 0 || spells.length > 0;
    const hasAny =
        weapons.length > 0 || hasSpells || features.length > 0;

    const slotLabel = (slotId: "main-hand" | "off-hand") =>
        slotId === "main-hand" ? tSlots("mainHand") : tSlots("offHand");

    return (
        <OverviewPanel title={t("combat.attacksActions")}>
            {!hasAny ? (
                <p className="text-sm text-muted-foreground">
                    {t("combat.noActions")}
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {weapons.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("weaponsEquipped")}
                            </p>
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
                        </div>
                    ) : null}

                    {hasSpells ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("spells")}
                            </p>
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
                                {spells.map((spell) => (
                                    <li key={spell.id}>
                                        <CombatActionCard
                                            title={spell.name}
                                            details={
                                                [
                                                    spell.levelInt !== null &&
                                                    spell.levelInt > 0
                                                        ? t("spellLevel", {
                                                              level: spell.levelInt,
                                                          })
                                                        : null,
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
                        </div>
                    ) : null}

                    {features.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("combat.features")}
                            </p>
                            <ul className="flex flex-col gap-2">
                                {features.map((feature) => (
                                    <li key={feature.id}>
                                        <CombatActionCard
                                            title={feature.name}
                                            description={feature.description}
                                            actionKind="use"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            )}
        </OverviewPanel>
    );
}
