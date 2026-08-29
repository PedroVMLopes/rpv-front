"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CarouselItem } from "@/components/ui/characterCarousel";
import { SheetPanel } from "@/components/characters/SheetPanel";
import { getResolvedStatDisplay } from "@/lib/character/presetStats";
import {
    computeSkillModifiers,
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import { computeSavingThrowModifiers } from "@/lib/character/savingThrowModifiers";
import {
    computeInitiative,
    computePassivePerception,
    getProficiencyBonus,
} from "@/lib/character/derivedStats";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CharacterCardSlide } from "./characterCardUi";
import { ProficiencyPips } from "@/components/characters/PlayerSheet/ProficiencyPips";
import { cn } from "@/lib/utils";

interface CharacterCardGameInfoProps {
    characterId?: string;
}

const mutedRowClassName =
    "rounded-lg border bg-muted px-2 py-1";

export default function CharacterCardGameInfo({ characterId }: CharacterCardGameInfoProps) {
    const t = useTranslations();
    const tSkills = useTranslations("skills");
    const tAbilities = useTranslations("abilities");
    const getCharacterProps = useCharacterStore((state) => state.getCharacterProps);
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const characters = useCharacterStore((state) => state.characters);
    const props = characterId ? getCharacterProps(characterId) : undefined;
    const stored = characterId ? characters.find((c) => c.id === characterId) : undefined;
    const resolved = characterId ? getResolvedStats(characterId) : undefined;

    const skillModifiers = useMemo(() => {
        if (!stored || !resolved) {
            return [];
        }

        return computeSkillModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        );
    }, [stored, resolved]);

    const savingThrowModifiers = useMemo(() => {
        if (!stored || !resolved) {
            return [];
        }

        return computeSavingThrowModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        );
    }, [stored, resolved]);

    if (!props || !stored || !resolved) {
        return (
            <CarouselItem>
                <CharacterCardSlide>
                    <SheetPanel>
                        <p className="text-sm text-muted-foreground">
                            {t("character.noneSelected")}
                        </p>
                    </SheetPanel>
                </CharacterCardSlide>
            </CarouselItem>
        );
    }

    const display = getResolvedStatDisplay(props, stored.system);
    const labelOf = (item: { labelKey?: string; label?: string; name?: string }) =>
        item.labelKey ? t(item.labelKey) : item.label ?? item.name ?? "";
    const level = readCharacterLevel(stored.systemData);
    const profBonus = getProficiencyBonus(stored.system, level);
    const initiative = computeInitiative(stored.system, resolved);
    const passivePerception = computePassivePerception(stored.system, skillModifiers);

    return (
        <CarouselItem>
            <CharacterCardSlide>
                <SheetPanel>
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                {t("character.resolvedAbilities")}
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {display.abilities.map((ability) => (
                                    <div
                                        key={ability.name}
                                        className="flex flex-col items-center rounded-lg border bg-muted p-2"
                                    >
                                        <span className="text-xs text-muted-foreground">
                                            {ability.shortLabelKey
                                                ? t(ability.shortLabelKey)
                                                : ability.shortLabel ?? ability.name}
                                        </span>
                                        <span className="text-lg font-bold">{ability.resolved}</span>
                                        {ability.resolved !== ability.base && (
                                            <span className="text-xs text-muted-foreground">
                                                {t("character.base")} {ability.base}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                            {display.combat.map((combat) => (
                                <div key={combat.statKey} className={mutedRowClassName}>
                                    <span className="text-muted-foreground">{labelOf(combat)} </span>
                                    <span className="font-bold">{combat.resolved}</span>
                                    {combat.resolved !== combat.base && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            ({t("character.base")} {combat.base})
                                        </span>
                                    )}
                                </div>
                            ))}
                            <div className={mutedRowClassName}>
                                <span className="text-muted-foreground">
                                    {t("character.proficiencyBonus")}{" "}
                                </span>
                                <span className="font-bold">{formatModifier(profBonus)}</span>
                            </div>
                            <div className={mutedRowClassName}>
                                <span className="text-muted-foreground">
                                    {t("character.initiative")}{" "}
                                </span>
                                <span className="font-bold">{formatModifier(initiative)}</span>
                            </div>
                            <div className={mutedRowClassName}>
                                <span className="text-muted-foreground">
                                    {t("character.passivePerception")}{" "}
                                </span>
                                <span className="font-bold">{passivePerception}</span>
                            </div>
                        </div>
                    </div>
                </SheetPanel>

                <SheetPanel title={t("character.savingThrows")}>
                    <ul className="space-y-1 text-sm">
                        {savingThrowModifiers.map((save) => (
                            <li
                                key={save.stat}
                                className={cn(
                                    mutedRowClassName,
                                    "flex items-center justify-between",
                                    save.proficient && "border-primary/40"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {save.proficient && (
                                        <ProficiencyPips
                                            scale={1}
                                            proficientLabel={t("character.proficient")}
                                            expertiseLabel={t("character.expertise")}
                                        />
                                    )}
                                    <span>{tAbilities(save.stat)}</span>
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {formatModifier(save.modifier)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </SheetPanel>

                <SheetPanel title={t("character.skills")}>
                    <ul className="space-y-1 text-sm">
                        {skillModifiers.map((skill) => (
                            <li
                                key={skill.slug}
                                className={cn(
                                    mutedRowClassName,
                                    "flex items-center justify-between",
                                    skill.proficient && "border-primary/40"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <ProficiencyPips
                                        scale={skill.proficiencyScale}
                                        proficientLabel={t("character.proficient")}
                                        expertiseLabel={t("character.expertise")}
                                    />
                                    <span>{tSkills(skill.slug)}</span>
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {formatModifier(skill.modifier)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </SheetPanel>

                {props.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t("character.activeModifiers", { count: props.modifiers.length })}
                    </p>
                )}
            </CharacterCardSlide>
        </CarouselItem>
    );
}
