"use client";

import { useTranslations } from "next-intl";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryFilterId } from "@/lib/character/inventoryDisplay";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type InventoryToolbarProps = {
    activeFilter: InventoryFilterId;
    onFilterChange: (filter: InventoryFilterId) => void;
};

const ACTIVE_FILTERS: InventoryFilterId[] = [
    "all",
    "consumables",
    "tools",
    "quest",
    "misc",
];

const FILTER_I18N_KEYS: Record<InventoryFilterId, string> = {
    all: "filters.all",
    consumables: "filters.consumables",
    tools: "filters.tools",
    quest: "filters.quest",
    misc: "filters.misc",
};

export function InventoryToolbar({
    activeFilter,
    onFilterChange,
}: InventoryToolbarProps) {
    const t = useTranslations("playerSheet.inventory");

    return (
        <div className="flex flex-col gap-3">
            <div
                className={cn(
                    "flex flex-wrap gap-1 rounded-xl p-1",
                    sheetInset
                )}
                role="tablist"
                aria-label={t("filterNavLabel")}
            >
                {ACTIVE_FILTERS.map((filter) => {
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
                            {t(FILTER_I18N_KEYS[filter])}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    type="search"
                    readOnly
                    placeholder={t("searchPlaceholder")}
                    aria-label={t("searchPlaceholder")}
                    className="sm:flex-1"
                />
                <Button
                    type="button"
                    variant="default"
                    className="shrink-0 gap-2"
                    aria-disabled
                >
                    <FaPlus className="size-3.5" aria-hidden />
                    {t("addItem")}
                </Button>
            </div>
        </div>
    );
}
