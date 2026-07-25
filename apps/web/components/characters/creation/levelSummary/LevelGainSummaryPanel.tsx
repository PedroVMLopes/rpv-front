"use client";

import { useTranslations } from "next-intl";
import type { LevelGainSummary } from "@/lib/character/buildLevelGainSummary";
import { formatResourceRefLabel } from "@/lib/character/resourceLabels";
import {
    formatSpellSlotResourceLabel,
    parseSpellSlotLevel,
} from "@/lib/character/spellSlotResources";
import { LevelGainInfoCard } from "./LevelGainInfoCard";

function resourceLine(
    ref: string,
    amount: number,
    labelFor: (ref: string) => string,
    translateSpellSlots: (
        key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
        values: { level: number; count: number }
    ) => string
): string {
    const slotLevel = parseSpellSlotLevel(ref);
    if (slotLevel !== undefined) {
        return formatSpellSlotResourceLabel(
            slotLevel,
            amount,
            translateSpellSlots,
            { signed: true }
        );
    }

    const sign = amount > 0 ? "+" : "";
    return `${labelFor(ref)}: ${sign}${amount}`;
}

export function LevelGainSummaryPanel({
    summary,
}: {
    summary: LevelGainSummary;
}) {
    const t = useTranslations("characterCreation.levelSummary");
    const tResources = useTranslations("classResources");
    const tGrants = useTranslations("grants");

    const labelFor = (ref: string) =>
        formatResourceRefLabel(
            ref,
            (key) => tResources(key),
            (key) => tResources.has(key)
        );

    const translateSpellSlots = (
        key: "spellSlotsGrouped" | "spellSlotsGroupedDelta",
        values: { level: number; count: number }
    ) => tGrants(key, values);

    const hasSpells =
        summary.spellPicks.spells > 0 || summary.spellPicks.cantrips > 0;

    return (
        <div className="flex flex-col gap-3">
            {summary.subclassAvailable ? (
                <LevelGainInfoCard title={t("subclassAvailable")} />
            ) : null}

            {summary.hp ? (
                <LevelGainInfoCard title={t("hitPoints")}>
                    <p className="text-sm text-muted-foreground">
                        {t("hpChange", {
                            before: summary.hp.before,
                            after: summary.hp.after,
                        })}
                    </p>
                </LevelGainInfoCard>
            ) : null}

            {summary.classResources.length > 0 ? (
                <LevelGainInfoCard title={t("classResources")}>
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                        {summary.classResources.map((entry) => (
                            <li key={entry.ref}>
                                {resourceLine(
                                    entry.ref,
                                    entry.amount,
                                    labelFor,
                                    translateSpellSlots
                                )}
                            </li>
                        ))}
                    </ul>
                </LevelGainInfoCard>
            ) : null}

            {summary.subclassResources.length > 0 ? (
                <LevelGainInfoCard title={t("subclassResources")}>
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                        {summary.subclassResources.map((entry) => (
                            <li key={entry.ref}>
                                {resourceLine(
                                    entry.ref,
                                    entry.amount,
                                    labelFor,
                                    translateSpellSlots
                                )}
                            </li>
                        ))}
                    </ul>
                </LevelGainInfoCard>
            ) : null}

            {hasSpells ? (
                <LevelGainInfoCard>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {summary.spellPicks.cantrips > 0 ? (
                            <span>
                                {t("cantripsGained", {
                                    count: summary.spellPicks.cantrips,
                                })}
                            </span>
                        ) : null}
                        {summary.spellPicks.spells > 0 ? (
                            <span>
                                {t("spellsGained", {
                                    count: summary.spellPicks.spells,
                                })}
                            </span>
                        ) : null}
                    </div>
                </LevelGainInfoCard>
            ) : null}
        </div>
    );
}
