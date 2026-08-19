"use client";

import { useTranslations } from "next-intl";
import type { ActionFilterId } from "@/lib/character/actionDisplay";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type CombatActionFilterProps = {
    activeFilter: ActionFilterId;
    onFilterChange: (filter: ActionFilterId) => void;
};

const FILTERS: ActionFilterId[] = [
    "all",
    "weapons",
    "spells",
    "features",
    "available",
];

function filterLabel(
    filter: ActionFilterId,
    t: ReturnType<typeof useTranslations>
) {
    switch (filter) {
        case "all":
            return t("combat.filters.all");
        case "weapons":
            return t("combat.filters.weapons");
        case "spells":
            return t("combat.filters.spells");
        case "features":
            return t("combat.filters.features");
        case "available":
            return t("combat.filters.available");
    }
}

export function CombatActionFilter({
    activeFilter,
    onFilterChange,
}: CombatActionFilterProps) {
    const t = useTranslations("playerSheet");

    return (
        <div
            className={cn("flex flex-wrap gap-1 rounded-xl p-1", sheetInset)}
            role="tablist"
            aria-label={t("combat.filtersLabel")}
        >
            {FILTERS.map((filter) => {
                const selected = activeFilter === filter;

                return (
                    <button
                        key={filter}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                            selected
                                ? "border border-card-foreground/10 bg-card text-card-foreground shadow-sm"
                                : "text-card-foreground/60 hover:text-card-foreground"
                        )}
                        onClick={() => onFilterChange(filter)}
                    >
                        {filterLabel(filter, t)}
                    </button>
                );
            })}
        </div>
    );
}
