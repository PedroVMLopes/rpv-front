"use client";

import { useMemo, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
    GiBrain,
    GiConversation,
    GiCrystalBall,
    GiHeartBeats,
    GiMuscleUp,
    GiWalkingBoot,
} from "react-icons/gi";
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

type AbilityIcon = ComponentType<{ className?: string }>;

const ABILITY_ICONS: Record<string, AbilityIcon> = {
    strength: GiMuscleUp,
    dexterity: GiWalkingBoot,
    constitution: GiHeartBeats,
    intelligence: GiBrain,
    wisdom: GiCrystalBall,
    charisma: GiConversation,
};

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
            <div className="grid gap-2 grid-cols-3">
                {display.abilities.map((ability) => {
                    const mod = abilityModifier(ability.resolved);
                    const Icon = ABILITY_ICONS[ability.name];
                    const label = ability.labelKey
                        ? t(ability.labelKey)
                        : (ability.label ?? ability.name);

                    return (
                        <div
                            key={ability.name}
                            className={cn(
                                "flex flex-col items-center rounded-xl gap-1 py-2 px-1.5 bg-accent text-accent-foreground shadow-xs border-custom border-background"
                            )}
                        >
                            <div className="flex flex-col items-center gap-1">
                                {Icon ? (
                                    <Icon
                                        className="size-8 shrink-0 text-accent-foreground/50"
                                        aria-hidden
                                    />
                                ) : null}
                                <div className="flex flex-row items-center leading-none gap-2">
                                    <span className="font-semibold tabular-nums text-accent-foreground/70">
                                        {ability.resolved}
                                    </span>
                                    <span className="font-bold tabular-nums text-primary">
                                        {formatModifier(mod)}
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-center">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm mt-2">
                <div className={cn("rounded-lg p-2 flex flex-row gap-1.5 bg-accent text-accent-foreground border-custom border-background shadow-xs")}>
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
