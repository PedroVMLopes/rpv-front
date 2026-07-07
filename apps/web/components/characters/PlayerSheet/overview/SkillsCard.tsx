"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    computeSkillModifiers,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import { computeSavingThrowModifiers } from "@/lib/character/savingThrowModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { ActionRow } from "../ActionRow";
import { OverviewPanel } from "./OverviewPanel";

type SkillsCardProps = {
    stored: StoredCharacter;
};

export function SkillsCard({ stored }: SkillsCardProps) {
    const t = useTranslations("playerSheet");
    const tSkills = useTranslations("skills");
    const tAbilities = useTranslations("abilities");
    const tAbilitiesShort = useTranslations("abilitiesShort");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(stored.id);

    const proficientSkills = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return computeSkillModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        ).filter((skill) => skill.proficient);
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    const proficientSaves = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return computeSavingThrowModifiers(
            stored.system,
            resolved,
            stored.grants ?? [],
            readCharacterLevel(stored.systemData)
        ).filter((save) => save.proficient);
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    const isEmpty =
        proficientSkills.length === 0 && proficientSaves.length === 0;

    return (
        <OverviewPanel title={t("skillsCardTitle")}>
            {isEmpty ? (
                <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {proficientSkills.length > 0 ? (
                        <ul className="flex flex-col gap-1.5">
                            {proficientSkills.map((skill) => (
                                <li key={skill.slug}>
                                    <ActionRow
                                        label={tSkills(skill.slug)}
                                        modifier={skill.modifier}
                                        proficient
                                        abilityHint={`[${tAbilitiesShort(skill.ability)}]`}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {proficientSaves.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("proficientSaves")}
                            </p>
                            <ul className="flex flex-col gap-1.5">
                                {proficientSaves.map((save) => (
                                    <li key={save.stat}>
                                        <ActionRow
                                            label={tAbilities(save.stat)}
                                            modifier={save.modifier}
                                            proficient
                                            abilityHint={`[${tAbilitiesShort(save.stat)}]`}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            )}
        </OverviewPanel>
    );
}
