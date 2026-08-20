"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ModifierSourceType } from "@rpv/domain";
import { listCombatReminders } from "@/lib/character/actionDisplay";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { FeatureActionCard } from "@/components/content/features/FeatureActionCard";
import { useContentLocale } from "@/store/useContentLocale";
import { OverviewPanel } from "../overview/OverviewPanel";

type CombatRemindersPanelProps = {
    stored: StoredCharacter;
};

function traitSourceLabel(
    sourceType: ModifierSourceType | undefined,
    t: ReturnType<typeof useTranslations>
): string {
    switch (sourceType) {
        case "race":
            return t("traitSource.race");
        case "class":
            return t("traitSource.class");
        case "subclass":
            return t("traitSource.subclass");
        case "background":
            return t("traitSource.background");
        case "item":
            return t("traitSource.item");
        case "feat":
            return t("traitSource.feat");
        case "spell":
            return t("traitSource.spell");
        case "condition":
            return t("traitSource.condition");
        case "system":
        default:
            return t("traitSource.system");
    }
}

export function CombatRemindersPanel({ stored }: CombatRemindersPanelProps) {
    const t = useTranslations("playerSheet");
    const contentLocale = useContentLocale((state) => state.contentLocale);
    const reminders = useMemo(
        () => listCombatReminders(stored, contentLocale),
        [contentLocale, stored]
    );

    if (reminders.length === 0) {
        return null;
    }

    const costLabel = t("combat.group.passive");

    return (
        <OverviewPanel title={costLabel}>
            <ul className="flex flex-col gap-2">
                {reminders.map((action) => (
                    <li key={action.id} className="min-w-0">
                        <FeatureActionCard
                            action={action}
                            costLabel={costLabel}
                            sourceLabel={traitSourceLabel(
                                action.featureSource,
                                t
                            )}
                        />
                    </li>
                ))}
            </ul>
        </OverviewPanel>
    );
}
