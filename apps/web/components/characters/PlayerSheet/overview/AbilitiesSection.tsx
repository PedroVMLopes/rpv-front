"use client";

import { useMemo } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { OverviewPanel } from "./OverviewPanel";
import { sheetInset } from "../playerSheetSurfaces";
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
        <OverviewPanel>
            {level < 20 ? (
                <Button asChild className="mb-2 w-full">
                    <Link
                        href={`/characters/player/edit/${stored.id}?step=class`}
                    >
                        {t("playerSheet.levelUp")}
                    </Link>
                </Button>
            ) : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {display.abilities.map((ability) => {
                    const mod = abilityModifier(ability.resolved);
                    return (
                        <div
                            key={ability.name}
                            className={cn(
                                "flex flex-col items-center rounded-xl p-2",
                                sheetInset
                            )}
                        >
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                {ability.shortLabelKey
                                    ? t(ability.shortLabelKey)
                                    : ability.shortLabel ?? ability.name}
                            </span>
                            <span className="text-lg font-bold tabular-nums">
                                {ability.resolved}
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                                {formatModifier(mod)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className={cn("rounded-lg p-2", sheetInset)}>
                    <span className="text-muted-foreground">
                        {t("character.proficiencyBonus")}{" "}
                    </span>
                    <span className="font-bold">{formatModifier(profBonus)}</span>
                </div>
                <div className={cn("rounded-lg p-2", sheetInset)}>
                    <span className="text-muted-foreground">
                        {t("character.passivePerception")}{" "}
                    </span>
                    <span className="font-bold">{passivePerception}</span>
                </div>
            </div>
        </OverviewPanel>
    );
}
