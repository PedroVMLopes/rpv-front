"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { sheetTabActive, sheetTabInactive } from "./playerSheetSurfaces";

export type PlayerSheetTabId =
    | "overview"
    | "combat"
    | "inventory"
    | "magic"
    | "notes";

const TABS: PlayerSheetTabId[] = [
    "overview",
    "combat",
    "inventory",
    "magic",
    "notes",
];

type PlayerSheetTabBarProps = {
    activeTab: PlayerSheetTabId;
    onTabChange: (tab: PlayerSheetTabId) => void;
};

export function PlayerSheetTabBar({
    activeTab,
    onTabChange,
}: PlayerSheetTabBarProps) {
    const t = useTranslations("playerSheet.tabs");

    return (
        <nav
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
            aria-label={t("navLabel")}
        >
            {TABS.map((tab) => {
                const isActive = tab === activeTab;

                return (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={cn(
                            "shrink-0 rounded-t-lg border px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? cn("border-b-0", sheetTabActive)
                                : sheetTabInactive
                        )}
                        onClick={() => onTabChange(tab)}
                    >
                        {t(tab)}
                    </button>
                );
            })}
        </nav>
    );
}
