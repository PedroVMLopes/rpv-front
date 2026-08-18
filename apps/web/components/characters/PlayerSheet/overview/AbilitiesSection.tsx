"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    computeSkillModifiers,
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import {
    computePassivePerception,
    getProficiencyBonus,
} from "@/lib/character/derivedStats";
import { getResolvedStatDisplay } from "@/lib/character/presetStats";
import { getSystemRules } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { OverviewPanel } from "./OverviewPanel";
import { cn } from "@/lib/utils";

type AbilitiesSectionProps = {
    stored: StoredCharacter;
};

export function AbilitiesSection({ stored }: AbilitiesSectionProps) {
    const t = useTranslations();
    const getCharacterProps = useCharacterStore((state) => state.getCharacterProps);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);

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
    const passivePerception = computePassivePerception(
        stored.system,
        skillModifiers
    );

    return (
        <OverviewPanel contentClassName="overflow-visible">
            <div className="grid grid-cols-3 gap-x-2 gap-y-3 pt-1">
                {display.abilities.map((ability) => {
                    const mod = abilityModifier(ability.resolved);
                    const label = ability.labelKey
                        ? t(ability.labelKey)
                        : (ability.label ?? ability.name);

                    return (
                        <div key={ability.name} className="pt-3">
                            <div
                                className={cn(
                                    "relative flex min-h-24 flex-col items-center rounded-xl bg-accent px-1.5 pb-2 pt-3 text-accent-foreground shadow-xs border-custom border-background"
                                )}
                                aria-label={`${label} ${ability.resolved} ${formatModifier(mod)}`}
                            >
                                <span
                                    className={cn(
                                        "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2",
                                        "rounded-lg bg-primary text-primary-foreground px-2 py-0.5 font-semibold tabular-nums leading-none",
                                        "border-2"
                                    )}
                                >
                                    {ability.resolved}
                                </span>
                                <span className="flex flex-1 items-center text-2xl font-bold font-serif tracking-wide leading-none sm:text-3xl">
                                    {formatModifier(mod)}
                                </span>
                                <span className="text-center text-sm font-semibold leading-tight">
                                    {label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
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
                {/* <div className={cn("rounded-lg p-2 flex flex-row gap-1.5 bg-popover text-popover-foreground border-2 border-border/50")}>
                    <span className="text-popover-foreground/70">
                        {t("character.passivePerception")}{" "}
                    </span>
                    <span className="font-bold">{passivePerception}</span>
                </div> */}
            </div>
        </OverviewPanel>
    );
}
