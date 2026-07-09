"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
    const [showAll, setShowAll] = useState(false);

    const { allSkills, allSaves } = useMemo(() => {
        if (!resolved) {
            return { allSkills: [], allSaves: [] };
        }

        const level = readCharacterLevel(stored.systemData);
        const grants = stored.grants ?? [];

        return {
            allSkills: computeSkillModifiers(
                stored.system,
                resolved,
                grants,
                level
            ),
            allSaves: computeSavingThrowModifiers(
                stored.system,
                resolved,
                grants,
                level
            ),
        };
    }, [resolved, stored.grants, stored.system, stored.systemData]);

    const visibleSkills = showAll
        ? allSkills
        : allSkills.filter((skill) => skill.proficient);
    const visibleSaves = showAll
        ? allSaves
        : allSaves.filter((save) => save.proficient);

    const isEmpty = !showAll && visibleSkills.length === 0 && visibleSaves.length === 0;

    return (
        <OverviewPanel
            title={t("skillsCardTitle")}
            headerAction={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-pressed={showAll}
                    onClick={() => setShowAll((current) => !current)}
                >
                    {showAll ? t("showProficientOnly") : t("showAllSkills")}
                </Button>
            }
        >
            {isEmpty ? (
                <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {visibleSkills.length > 0 ? (
                        <ul className="flex flex-col gap-1.5">
                            {visibleSkills.map((skill) => (
                                <li key={skill.slug}>
                                    <ActionRow
                                        label={tSkills(skill.slug)}
                                        modifier={skill.modifier}
                                        proficient={skill.proficient}
                                        abilityHint={`[${tAbilitiesShort(skill.ability)}]`}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {visibleSaves.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("proficientSaves")}
                            </p>
                            <ul className="flex flex-col gap-1.5">
                                {visibleSaves.map((save) => (
                                    <li key={save.stat}>
                                        <ActionRow
                                            label={tAbilities(save.stat)}
                                            modifier={save.modifier}
                                            proficient={save.proficient}
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
