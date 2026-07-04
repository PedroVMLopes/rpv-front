"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { computePassivePerception } from "@/lib/character/derivedStats";
import { computePassiveScore } from "@/lib/character/passiveScores";
import {
    computeSkillModifiers,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";

type PassiveStatsPanelProps = {
    stored: StoredCharacter;
};

export function PassiveStatsPanel({ stored }: PassiveStatsPanelProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(stored.id);

    const passives = useMemo(() => {
        if (!resolved) {
            return { perception: 10, insight: 10 };
        }

        const skillModifiers = computeSkillModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        );

        return {
            perception: computePassivePerception(stored.system, skillModifiers),
            insight: computePassiveScore(skillModifiers, "insight"),
        };
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    return (
        <section className="flex flex-col gap-2 rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-2 rounded-xl border bg-popover px-3 py-2">
                <span className="text-sm font-medium">
                    {tCharacter("passivePerception")}
                </span>
                <span className="text-sm font-bold tabular-nums">
                    {passives.perception}
                </span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl border bg-popover px-3 py-2">
                <span className="text-sm font-medium">
                    {t("combat.passiveInsight")}
                </span>
                <span className="text-sm font-bold tabular-nums">
                    {passives.insight}
                </span>
            </div>
        </section>
    );
}
