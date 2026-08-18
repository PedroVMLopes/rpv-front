"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { buildActionsStatusSummary } from "@/lib/character/actionDisplay";
import { useContentLocale } from "@/store/useContentLocale";
import { useCharacterStore } from "@/store/useCharacterStore";
import { formatModifier } from "@/lib/character/skillModifiers";
import { OverviewPanel } from "../overview/OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type ActionStatusRailProps = {
    stored: StoredCharacter;
};

export function ActionStatusRail({ stored }: ActionStatusRailProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");
    const tCombat = useTranslations("combat");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const currentHp = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id)
                ?.resources.hp ?? 0
    );
    const resolved = getResolvedStats(stored.id);

    const summary = useMemo(
        () =>
            resolved
                ? buildActionsStatusSummary(
                      stored,
                      resolved,
                      contentLocale,
                      currentHp
                  )
                : null,
        [contentLocale, currentHp, resolved, stored]
    );

    if (!summary) {
        return null;
    }

    return (
        <OverviewPanel>
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {[
                        {
                            label: t("hitPoints"),
                            value: `${summary.currentHp}/${summary.maxHp}`,
                            ariaLabel: `${t("hitPoints")} ${summary.currentHp}/${summary.maxHp}`,
                        },
                        {
                            label: tCombat("ac"),
                            value: String(summary.armorClass),
                            ariaLabel: `${tCombat("ac")} ${summary.armorClass}`,
                        },
                        {
                            label: tCharacter("initiative"),
                            value: formatModifier(summary.initiative),
                            ariaLabel: `${tCharacter("initiative")} ${formatModifier(summary.initiative)}`,
                        },
                        {
                            label: t("speed"),
                            value: summary.walkSpeed
                                ? t("speedValue", { speed: summary.walkSpeed })
                                : "—",
                            ariaLabel: `${t("speed")} ${
                                summary.walkSpeed
                                    ? t("speedValue", { speed: summary.walkSpeed })
                                    : "—"
                            }`,
                        },
                    ].map((entry) => (
                        <div
                            key={entry.label}
                            className={cn(
                                "rounded-xl px-3 py-2 text-center",
                                sheetInset
                            )}
                            aria-label={entry.ariaLabel}
                        >
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                {entry.label}
                            </p>
                            <p className="text-sm font-bold tabular-nums">
                                {entry.value}
                            </p>
                        </div>
                    ))}
                </div>

                {summary.resources.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {summary.resources.map((resource) => (
                            <span
                                key={resource.ref}
                                className={cn(
                                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                                    sheetInset
                                )}
                            >
                                {resource.label} {resource.current}/{resource.max}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </OverviewPanel>
    );
}
