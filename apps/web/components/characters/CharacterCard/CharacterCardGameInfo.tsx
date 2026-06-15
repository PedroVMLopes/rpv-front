"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CarouselItem } from "@/components/ui/characterCarousel";
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
import { listSavingThrows, listSkills } from "@/lib/catalog/grantCatalog";
import { useCharacterStore } from "@/store/useCharacterStore";

interface CharacterCardGameInfoProps {
    characterId?: string;
}

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
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData),
            listSkills()
        );
    }, [stored, resolved]);

    const savingThrowModifiers = useMemo(() => {
        if (!stored || !resolved) {
            return [];
        }

        return computeSavingThrowModifiers(
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData),
            listSavingThrows()
        );
    }, [stored, resolved]);

    if (!props || !stored || !resolved) {
        return (
            <CarouselItem>
                <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 text-muted-foreground text-sm">
                    {t("character.noneSelected")}
                </div>
            </CarouselItem>
        );
    }

    const display = getResolvedStatDisplay(props, stored.system);
    const labelOf = (item: { labelKey?: string; label?: string; name?: string }) =>
        item.labelKey ? t(item.labelKey) : item.label ?? item.name ?? "";
    const level = readCharacterLevel(stored.systemData);
    const profBonus = getProficiencyBonus(level);
    const initiative = computeInitiative(resolved);
    const passivePerception = computePassivePerception(skillModifiers);

    return (
        <CarouselItem>
            <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        {t("character.resolvedAbilities")}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {display.abilities.map((ability) => (
                            <div
                                key={ability.name}
                                className="flex flex-col items-center border rounded-lg p-2 bg-popover"
                            >
                                <span className="text-xs text-muted-foreground">
                                    {ability.shortLabelKey
                                        ? t(ability.shortLabelKey)
                                        : ability.shortLabel ?? ability.name}
                                </span>
                                <span className="font-bold text-lg">{ability.resolved}</span>
                                {ability.resolved !== ability.base && (
                                    <span className="text-xs text-muted-foreground">
                                        {t("character.base")} {ability.base}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    {display.combat.map((combat) => (
                        <div key={combat.statKey} className="border rounded-lg p-2 bg-popover">
                            <span className="text-muted-foreground">{labelOf(combat)} </span>
                            <span className="font-bold">{combat.resolved}</span>
                            {combat.resolved !== combat.base && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({t("character.base")} {combat.base})
                                </span>
                            )}
                        </div>
                    ))}
                    <div className="border rounded-lg p-2 bg-popover">
                        <span className="text-muted-foreground">
                            {t("character.proficiencyBonus")}{" "}
                        </span>
                        <span className="font-bold">{formatModifier(profBonus)}</span>
                    </div>
                    <div className="border rounded-lg p-2 bg-popover">
                        <span className="text-muted-foreground">
                            {t("character.initiative")}{" "}
                        </span>
                        <span className="font-bold">{formatModifier(initiative)}</span>
                    </div>
                    <div className="border rounded-lg p-2 bg-popover">
                        <span className="text-muted-foreground">
                            {t("character.passivePerception")}{" "}
                        </span>
                        <span className="font-bold">{passivePerception}</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        {t("character.savingThrows")}
                    </p>
                    <ul className="space-y-1 text-sm">
                        {savingThrowModifiers.map((save) => (
                            <li
                                key={save.stat}
                                className={`flex items-center justify-between rounded-lg border px-2 py-1 bg-popover${
                                    save.proficient ? " border-primary/40" : ""
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {save.proficient && (
                                        <span
                                            className="size-1.5 rounded-full bg-primary shrink-0"
                                            title={t("character.proficient")}
                                            aria-label={t("character.proficient")}
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
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        {t("character.skills")}
                    </p>
                    <ul className="space-y-1 text-sm">
                        {skillModifiers.map((skill) => (
                            <li
                                key={skill.slug}
                                className={`flex items-center justify-between rounded-lg border px-2 py-1 bg-popover${
                                    skill.proficient ? " border-primary/40" : ""
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {skill.proficient && (
                                        <span
                                            className="size-1.5 rounded-full bg-primary shrink-0"
                                            title={t("character.proficient")}
                                            aria-label={t("character.proficient")}
                                        />
                                    )}
                                    <span>{tSkills(skill.slug)}</span>
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {formatModifier(skill.modifier)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {props.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t("character.activeModifiers", { count: props.modifiers.length })}
                    </p>
                )}
            </div>
        </CarouselItem>
    );
}
