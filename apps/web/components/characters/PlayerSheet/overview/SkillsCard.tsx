"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { StatKey } from "@rpv/domain";
import {
    computeSkillModifiers,
    readCharacterLevel,
    sortSkillModifiersByAbilityOrder,
} from "@/lib/character/skillModifiers";
import { getSystemRules } from "@/lib/character/systemRules";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { buildSkillRollRequest } from "@/lib/roll/buildRollRequest";
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

    const allSkills = useMemo(() => {
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

    const isEmpty = !showAll && visibleSkills.length === 0;

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
                <div className="flex flex-col gap-2">
                    {showAll ? (
                        <SkillsAbilityFilter
                            abilities={abilityOrder}
                            activeAbility={activeAbilityFilter}
                            onAbilityChange={setActiveAbilityFilter}
                        />
                    ) : null}
                    {visibleSkills.length > 0 ? (
                        <ul className="flex flex-col gap-1">
                            {visibleSkills.map((skill) => (
                                <li key={skill.slug}>
                                    <ActionRow
                                        label={tSkills(skill.slug)}
                                        modifier={skill.modifier}
                                        proficient={skill.proficient}
                                        abilityHint={`[${tAbilitiesShort(skill.ability)}]`}
                                        className="bg-popover text-popover-foreground border-custom border-accent shadow-xs rounded-lg"
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
                </div>
            )}
        </OverviewPanel>
    );
}
