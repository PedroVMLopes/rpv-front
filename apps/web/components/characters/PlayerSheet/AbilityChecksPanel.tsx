"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { groupAbilityChecks } from "@/lib/character/abilityCheckGroups";
import { getProficiencyBonus } from "@/lib/character/derivedStats";
import {
    formatModifier,
    readCharacterLevel,
} from "@/lib/character/skillModifiers";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import {
    buildAbilityCheckRollRequest,
    buildSavingThrowRollRequest,
    buildSkillRollRequest,
} from "@/lib/roll/buildRollRequest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";
import { AbilityStone } from "./AbilityStone";
import { sheetInset } from "./playerSheetSurfaces";
import { useRollAssistant } from "./roll/RollAssistantProvider";

type AbilityChecksPanelProps = {
    stored: StoredCharacter;
};

type CheckRowProps = {
    label: string;
    rollLabel: string;
    modifier: number;
    proficient: boolean;
    quiet?: boolean;
    onRoll: () => void;
};

function CheckRow({
    label,
    rollLabel,
    modifier,
    proficient,
    quiet = false,
    onRoll,
}: CheckRowProps) {
    const tCharacter = useTranslations("character");
    const tSheet = useTranslations("playerSheet");
    const tRoll = useTranslations("playerSheet.roll");
    const proficiencyLabel = proficient
        ? tCharacter("proficient")
        : tSheet("notProficient");

    return (
        <button
            type="button"
            onClick={onRoll}
            aria-label={tRoll("rollAction", { label: rollLabel })}
            className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left text-sm",
                sheetInset,
                proficient && "border-primary/40",
                "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
        >
            <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                    className={cn(
                        "size-1.5 shrink-0 rounded-full border",
                        proficient
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                    )}
                    title={proficiencyLabel}
                    aria-label={proficiencyLabel}
                />
                <span
                    className={cn(
                        "truncate",
                        quiet
                            ? "font-normal text-muted-foreground"
                            : "font-medium"
                    )}
                >
                    {label}
                </span>
            </span>
            <span
                className={cn(
                    "shrink-0 tabular-nums",
                    quiet ? "font-medium" : "font-semibold"
                )}
            >
                {formatModifier(modifier)}
            </span>
        </button>
    );
}

function scrollToAbilityGroup(stat: string) {
    const element = document.getElementById(`ability-check-${stat}`);
    element?.scrollIntoView?.({ block: "start", behavior: "smooth" });
}

export function AbilityChecksPanel({ stored }: AbilityChecksPanelProps) {
    const t = useTranslations("playerSheet");
    const tAbilities = useTranslations("abilities");
    const tAbilitiesShort = useTranslations("abilitiesShort");
    const tSkills = useTranslations("skills");
    const tCharacter = useTranslations("character");
    const tRoll = useTranslations("playerSheet.roll");
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const { openRollRequest } = useRollAssistant();
    const resolved = getResolvedStats(stored.id);
    const level = readCharacterLevel(stored.systemData);
    const profBonus = getProficiencyBonus(stored.system, level);

    const groups = useMemo(() => {
        if (!resolved) {
            return [];
        }

        return groupAbilityChecks(
            stored.system,
            resolved,
            stored.grants ?? [],
            level
        );
    }, [level, resolved, stored.grants, stored.system]);

    if (!resolved || groups.length === 0) {
        return (
            <p className="pb-2 text-sm text-muted-foreground">{t("noneYet")}</p>
        );
    }

    return (
        <div className="flex flex-col gap-3 pb-2">
            <div className="sticky top-0 z-10 -mx-3 flex items-center gap-1 bg-card px-3 pb-2">
                <nav
                    aria-label={t("abilityRailLabel")}
                    className="flex min-w-0 flex-1 justify-around gap-0.5"
                >
                    {groups.map((group) => (
                        <button
                            key={group.stat}
                            type="button"
                            className="rounded-md px-1.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => scrollToAbilityGroup(group.stat)}
                        >
                            {tAbilitiesShort(group.stat)}
                        </button>
                    ))}
                </nav>
                <span
                    className="shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent-foreground"
                    aria-label={`${tCharacter("proficiencyBonus")} ${formatModifier(profBonus)}`}
                >
                    {formatModifier(profBonus)}
                </span>
            </div>

            {groups.map((group) => {
                const rollLabel = tAbilities(group.stat);
                const saveRollLabel = `${t("savingThrowRow")} (${tAbilitiesShort(group.stat)})`;

                return (
                    <section
                        key={group.stat}
                        id={`ability-check-${group.stat}`}
                        role="region"
                        className="flex scroll-mt-10 items-start gap-2 pt-3"
                        aria-label={rollLabel}
                    >
                        <AbilityStone
                            score={group.score}
                            modifier={group.modifier}
                            shortLabel={tAbilitiesShort(group.stat)}
                            ariaLabel={tRoll("rollAction", { label: rollLabel })}
                            className="w-19 shrink-0"
                            compact
                            onRoll={() =>
                                openRollRequest(
                                    buildAbilityCheckRollRequest(
                                        group.stat,
                                        rollLabel,
                                        group.modifier
                                    )
                                )
                            }
                        />
                        <ul className="flex min-w-0 flex-1 flex-col gap-1">
                            <li>
                                <CheckRow
                                    label={t("savingThrowRow")}
                                    rollLabel={saveRollLabel}
                                    modifier={group.save.modifier}
                                    proficient={group.save.proficient}
                                    quiet
                                    onRoll={() =>
                                        openRollRequest(
                                            buildSavingThrowRollRequest(
                                                group.save,
                                                saveRollLabel
                                            )
                                        )
                                    }
                                />
                            </li>
                            {group.skills.map((skill) => {
                                const skillLabel = tSkills(skill.slug);

                                return (
                                    <li key={skill.slug}>
                                        <CheckRow
                                            label={skillLabel}
                                            rollLabel={skillLabel}
                                            modifier={skill.modifier}
                                            proficient={skill.proficient}
                                            onRoll={() =>
                                                openRollRequest(
                                                    buildSkillRollRequest(
                                                        skill,
                                                        skillLabel
                                                    )
                                                )
                                            }
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
