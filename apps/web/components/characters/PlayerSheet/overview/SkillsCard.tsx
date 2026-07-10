"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { StatKey } from "@rpv/domain";
import {
    computeSkillModifiers,
    readCharacterLevel,
    sortSkillModifiersByAbilityOrder,
} from "@/lib/character/skillModifiers";
import { computeSavingThrowModifiers } from "@/lib/character/savingThrowModifiers";
import { getSystemRules } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildSavingThrowRollRequest,
    buildSkillRollRequest,
} from "@/lib/roll/buildRollRequest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { ActionRow } from "../ActionRow";
import { useRollAssistant } from "../roll/RollAssistantProvider";
import { OverviewPanel } from "./OverviewPanel";
import { SkillsAbilityFilter } from "./SkillsAbilityFilter";
import { SkillsListModeSwitch } from "./SkillsListModeSwitch";

type SkillsCardProps = {
    stored: StoredCharacter;
};

export function SkillsCard({ stored }: SkillsCardProps) {
    const t = useTranslations("playerSheet");
    const tSkills = useTranslations("skills");
    const tAbilities = useTranslations("abilities");
    const tAbilitiesShort = useTranslations("abilitiesShort");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);
    const [showAll, setShowAll] = useState(false);
    const [activeAbilityFilter, setActiveAbilityFilter] = useState<StatKey | null>(
        null
    );

    const abilityOrder = useMemo(
        () => getSystemRules(stored.system).savingThrows,
        [stored.system]
    );

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

    const visibleSkills = useMemo(() => {
        let skills = showAll
            ? allSkills
            : allSkills.filter((skill) => skill.proficient);

        if (showAll && activeAbilityFilter) {
            skills = skills.filter(
                (skill) => skill.ability === activeAbilityFilter
            );
        }

        return sortSkillModifiersByAbilityOrder(stored.system, skills);
    }, [activeAbilityFilter, allSkills, showAll, stored.system]);
    const visibleSaves = showAll
        ? allSaves
        : allSaves.filter((save) => save.proficient);

    const isEmpty = !showAll && visibleSkills.length === 0 && visibleSaves.length === 0;

    return (
        <OverviewPanel
            title={t("skillsCardTitle")}
            headerAction={
                <SkillsListModeSwitch
                    value={showAll ? "all" : "proficient"}
                    onChange={(mode) => {
                        setShowAll(mode === "all");
                        if (mode !== "all") {
                            setActiveAbilityFilter(null);
                        }
                    }}
                />
            }
        >
            {isEmpty ? (
                <p className="text-sm text-muted-foreground">{t("noneYet")}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {showAll ? (
                        <SkillsAbilityFilter
                            abilities={abilityOrder}
                            activeAbility={activeAbilityFilter}
                            onAbilityChange={setActiveAbilityFilter}
                        />
                    ) : null}
                    {visibleSkills.length > 0 ? (
                        <ul className="flex flex-col gap-1.5">
                            {visibleSkills.map((skill) => (
                                <li key={skill.slug}>
                                    <ActionRow
                                        label={tSkills(skill.slug)}
                                        modifier={skill.modifier}
                                        proficient={skill.proficient}
                                        abilityHint={`[${tAbilitiesShort(skill.ability)}]`}
                                        onRoll={() =>
                                            openRollRequest(
                                                buildSkillRollRequest(
                                                    skill,
                                                    tSkills(skill.slug)
                                                )
                                            )
                                        }
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
                                            onRoll={() =>
                                                openRollRequest(
                                                    buildSavingThrowRollRequest(
                                                        save,
                                                        tAbilities(save.stat)
                                                    )
                                                )
                                            }
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
