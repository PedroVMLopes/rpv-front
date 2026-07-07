"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    listEquippedWeaponActions,
    listFeatureActions,
    listSpellActions,
} from "@/lib/character/combatActions";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import { CombatActionCard } from "./CombatActionCard";
import { OverviewPanel } from "../overview/OverviewPanel";

type AttacksActionsPanelProps = {
    stored: StoredCharacter;
};

export function AttacksActionsPanel({ stored }: AttacksActionsPanelProps) {
    const t = useTranslations("playerSheet");
    const tSlots = useTranslations("equipmentSlots");
    const contentLocale = useContentLocale((state) => state.contentLocale);

    const weapons = useMemo(
        () =>
            listEquippedWeaponActions(
                stored.selections,
                stored.system,
                contentLocale
            ),
        [contentLocale, stored.selections, stored.system]
    );

    const { cantrips, spells } = useMemo(
        () => listSpellActions(stored.grants ?? [], contentLocale),
        [contentLocale, stored.grants]
    );

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
