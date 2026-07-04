"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    listEquippedWeaponActions,
    listSpellActions,
} from "@/lib/character/combatActions";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useContentLocale } from "@/store/useContentLocale";
import { cn } from "@/lib/utils";

type ActionEntryProps = {
    title: string;
    badge?: string;
    details?: string[];
    description?: string;
};

function ActionEntry({ title, badge, details, description }: ActionEntryProps) {
    const t = useTranslations("playerSheet");

    return (
        <button
            type="button"
            className={cn(
                "flex w-full flex-col gap-1 rounded-xl border bg-popover p-3 text-left text-sm",
                "transition-colors hover:bg-accent/40 active:bg-accent/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            title={t("rollComingSoon")}
            aria-label={`${title}. ${t("rollComingSoon")}`}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{title}</span>
                {badge ? (
                    <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {badge}
                    </span>
                ) : null}
            </div>
            {details && details.length > 0 ? (
                <p className="text-xs font-medium text-muted-foreground">
                    {details.join(" · ")}
                </p>
            ) : null}
            {description ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </button>
    );
}

type ActionsSectionProps = {
    stored: StoredCharacter;
};

export function ActionsSection({ stored }: ActionsSectionProps) {
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

    const slotLabel = (slotId: "main-hand" | "off-hand") =>
        slotId === "main-hand" ? tSlots("mainHand") : tSlots("offHand");

    return (
        <section className="flex flex-col gap-4 rounded-2xl border p-3">
            <h2 className="text-sm font-bold">{t("actions")}</h2>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("weaponsEquipped")}
                </p>
                {weapons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noWeapons")}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {weapons.map((weapon) => {
                            const details = [
                                weapon.toHit,
                                weapon.damage,
                            ].filter(Boolean) as string[];

                            return (
                                <li key={weapon.id}>
                                    <ActionEntry
                                        title={weapon.name}
                                        badge={slotLabel(weapon.slotId)}
                                        details={details}
                                        description={weapon.description}
                                    />
                                </li>
                            );
                        })}
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
                        {cantrips.map((spell) => {
                            const details = [
                                spell.attackBonus,
                                spell.saveDc,
                            ].filter(Boolean) as string[];

                            return (
                                <li key={spell.id}>
                                    <ActionEntry
                                        title={spell.name}
                                        badge={t("cantripBadge")}
                                        details={details}
                                        description={spell.description}
                                    />
                                </li>
                            );
                        })}
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
                        {spells.map((spell) => {
                            const details = [
                                spell.levelInt !== null && spell.levelInt > 0
                                    ? t("spellLevel", { level: spell.levelInt })
                                    : null,
                                spell.attackBonus,
                                spell.saveDc,
                            ].filter(Boolean) as string[];

                            return (
                                <li key={spell.id}>
                                    <ActionEntry
                                        title={spell.name}
                                        details={details}
                                        description={spell.description}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
