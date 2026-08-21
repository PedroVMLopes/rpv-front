"use client";

import { useTranslations } from "next-intl";
import {
    isActionFilterShowAll,
    selectAllActionFilters,
    toggleActionFilterCategory,
    type ActionFilterCategory,
    type ActionFilterState,
} from "@/lib/character/actionDisplay";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type CombatActionFilterProps = {
    state: ActionFilterState;
    onChange: (next: ActionFilterState) => void;
};

const CATEGORIES: ActionFilterCategory[] = [
    "weapons",
    "spells",
    "abilities",
];

function categoryLabel(
    category: ActionFilterCategory,
    t: ReturnType<typeof useTranslations>
) {
    switch (category) {
        case "weapons":
            return t("combat.filters.weapons");
        case "spells":
            return t("combat.filters.spells");
        case "abilities":
            return t("combat.filters.abilities");
    }
}

export function CombatActionFilter({
    state,
    onChange,
}: CombatActionFilterProps) {
    const t = useTranslations("playerSheet");
    const showAll = isActionFilterShowAll(state);

    return (
        <div
            className={cn("flex flex-wrap gap-1 rounded-xl p-1", sheetInset)}
            role="group"
            aria-label={t("combat.filtersLabel")}
        >
            <button
                type="button"
                aria-pressed={showAll}
                className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    showAll
                        ? "border border-card-foreground/10 bg-card text-card-foreground shadow-sm"
                        : "text-card-foreground/60 hover:text-card-foreground"
                )}
                onClick={() => onChange(selectAllActionFilters())}
            >
                {t("combat.filters.all")}
            </button>

            {CATEGORIES.map((category) => {
                const pressed = state[category];

                return (
                    <button
                        key={category}
                        type="button"
                        aria-pressed={pressed}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                            pressed
                                ? "border border-card-foreground/10 bg-card text-card-foreground shadow-sm"
                                : "text-card-foreground/60 hover:text-card-foreground"
                        )}
                        onClick={() =>
                            onChange(toggleActionFilterCategory(state, category))
                        }
                    >
                        {categoryLabel(category, t)}
                    </button>
                );
            })}
        </div>
    );
}
