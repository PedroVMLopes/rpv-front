"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    listEquippedWeaponActions,
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
import { CombatActionCard } from "../combat/CombatActionCard";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { OverviewPanel } from "./OverviewPanel";
import { SheetDerivedResourcesPanel } from "./SheetDerivedResourcesPanel";

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

    const slotLabel = (slotId: "main-hand" | "off-hand") =>
        slotId === "main-hand" ? tSlots("mainHand") : tSlots("offHand");

    return (
        <OverviewPanel title={t("actions")}>
            <div className="flex flex-col gap-4">
                <SheetDerivedResourcesPanel stored={stored} />
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("weaponsEquipped")}
                    </p>
                    {weapons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noWeapons")}</p>
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

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("cantrips")}
                    </p>
                    {cantrips.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noSpells")}</p>
                    ) : (
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
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("spells")}
                    </p>
                    {spells.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noSpells")}</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
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
                    )}
                </div>
            </div>
        </OverviewPanel>
    );
}
