"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
    FaBook,
    FaHandFist,
    FaPenToSquare,
    FaSuitcase,
    FaWandMagicSparkles,
} from "react-icons/fa6";
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

const TAB_ICONS: Record<
    PlayerSheetTabId,
    ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
    overview: FaBook,
    combat: FaHandFist,
    inventory: FaSuitcase,
    magic: FaWandMagicSparkles,
    notes: FaPenToSquare,
};

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
                const Icon = TAB_ICONS[tab];
                const label = t(tab);

                return (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={label}
                        title={label}
                        className={cn(
                            "inline-flex shrink-0 items-center justify-center rounded-t-lg border px-3 py-2 text-sm font-medium transition-colors sm:gap-2",
                            isActive
                                ? cn("border-b-0", sheetTabActive)
                                : sheetTabInactive
                        )}
                        onClick={() => onTabChange(tab)}
                    >
                        <Icon className="size-4 sm:hidden" aria-hidden />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
