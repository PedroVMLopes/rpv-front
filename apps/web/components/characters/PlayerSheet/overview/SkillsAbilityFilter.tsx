"use client";

import type { StatKey } from "@rpv/domain";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SkillsAbilityFilterProps = {
    abilities: StatKey[];
    activeAbility: StatKey | null;
    onAbilityChange: (ability: StatKey | null) => void;
};

export function SkillsAbilityFilter({
    abilities,
    activeAbility,
    onAbilityChange,
}: SkillsAbilityFilterProps) {
    const t = useTranslations("playerSheet");
    const tAbilitiesShort = useTranslations("abilitiesShort");

    return (
        <div
            className="flex flex-row justify-around gap-1 rounded-xl border bg-popover p-1"
            role="tablist"
            aria-label={t("skillsAbilityFilterLabel")}
        >
            {abilities.map((ability) => {
                const selected = activeAbility === ability;

                return (
                    <button
                        key={ability}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        className={cn(
                            "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                            selected
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() =>
                            onAbilityChange(selected ? null : ability)
                        }
                    >
                        {tAbilitiesShort(ability)}
                    </button>
                );
            })}
        </div>
    );
}
