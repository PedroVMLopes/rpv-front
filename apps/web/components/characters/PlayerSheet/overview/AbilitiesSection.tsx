"use client";

import { useMemo } from "react";
import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    computeSkillModifiers,
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import { getProficiencyBonus } from "@/lib/character/derivedStats";
import { computePassiveScore } from "@/lib/character/passiveScores";
import { getResolvedStatDisplay } from "@/lib/character/presetStats";
import { getSystemRules } from "@/lib/character/systemRules";
import { buildAbilityCheckRollRequest } from "@/lib/roll/buildRollRequest";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Button } from "@/components/ui/button";
import { OverviewPanel } from "./OverviewPanel";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

type AbilitiesSectionProps = {
    stored: StoredCharacter;
};

export function AbilitiesSection({ stored }: AbilitiesSectionProps) {
    const t = useTranslations();
    const tRoll = useTranslations("playerSheet.roll");
    const getCharacterProps = useCharacterStore((state) => state.getCharacterProps);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();

    const props = getCharacterProps(stored.id);
    const resolved = getResolvedStats(stored.id);

    const skillModifiers = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return computeSkillModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        );
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    if (!props || !resolved) {
        return null;
    }

    const display = getResolvedStatDisplay(props, stored.system);
    const abilityModifier = getSystemRules(stored.system).abilityModifier;
    const level = readCharacterLevel(stored.systemData);
    const profBonus = getProficiencyBonus(stored.system, level);
    const passives = {
        perception: computePassiveScore(skillModifiers, "perception"),
        insight: computePassiveScore(skillModifiers, "insight"),
        investigation: computePassiveScore(skillModifiers, "investigation"),
    };

    return (
        <OverviewPanel contentClassName="overflow-visible">
            <div className="grid grid-cols-3 gap-x-2 gap-y-3 pt-1">
                {display.abilities.map((ability) => {
                    const mod = abilityModifier(ability.resolved);
                    const label = ability.shortLabelKey
                        ? t(ability.shortLabelKey)
                        : (ability.shortLabel ??
                          (ability.labelKey
                              ? t(ability.labelKey)
                              : (ability.label ?? ability.name)));
                    const rollLabel = ability.labelKey
                        ? t(ability.labelKey)
                        : (ability.label ?? ability.name);

                    return (
                        <div key={ability.name} className="pt-3">
                            <div
                                className={cn(
                                    "relative flex min-h-24 flex-col items-center rounded-xl bg-accent px-1.5 pb-2 pt-3 text-accent-foreground shadow-xs border-custom border-background"
                                )}
                                aria-label={`${rollLabel} ${ability.resolved} ${formatModifier(mod)}`}
                            >
                                <span
                                    className={cn(
                                        "absolute left-1/2 top-0 z-5 -translate-x-1/2 -translate-y-1/2",
                                        "rounded-lg bg-primary text-primary-foreground px-2 py-0.5 font-semibold leading-none",
                                        "border-2"
                                    )}
                                >
                                    {ability.resolved}
                                </span>
                                <span className="flex flex-1 items-center text-2xl font-bold font-serif tracking-wide leading-none sm:text-3xl">
                                    {formatModifier(mod)}
                                </span>
                                <span className="flex items-center gap-0.5 text-center text-sm font-semibold leading-tight">
                                    {label}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0 text-accent-foreground"
                                        aria-label={tRoll("rollAction", {
                                            label: rollLabel,
                                        })}
                                        onClick={() =>
                                            openRollRequest(
                                                buildAbilityCheckRollRequest(
                                                    ability.statKey,
                                                    rollLabel,
                                                    mod
                                                )
                                            )
                                        }
                                    >
                                        <Dices className="size-3.5" aria-hidden />
                                    </Button>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 flex flex-col gap-1 text-sm">
                <div
                    className={cn(
                        "flex flex-row gap-1.5 rounded-lg bg-accent p-2 text-accent-foreground shadow-xs border-custom border-background"
                    )}
                >
                    <span className="text-accent-foreground/70">
                        {t("character.proficiencyBonus")}{" "}
                    </span>
                    <span className="font-bold">{formatModifier(profBonus)}</span>
                </div>
                {(
                    [
                        ["passivePerception", passives.perception],
                        ["passiveInsight", passives.insight],
                        ["passiveInvestigation", passives.investigation],
                    ] as const
                ).map(([labelKey, value]) => (
                    <div
                        key={labelKey}
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-lg px-3 py-2",
                            sheetInset
                        )}
                    >
                        <span className="text-muted-foreground">
                            {t(`character.${labelKey}`)}
                        </span>
                        <span className="font-bold tabular-nums">{value}</span>
                    </div>
                ))}
            </div>
        </OverviewPanel>
    );
}
