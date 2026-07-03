"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type PlayerSheetTabId =
    | "overview"
    | "combat"
    | "inventory"
    | "notes";

const TABS: PlayerSheetTabId[] = [
    "overview",
    "combat",
    "inventory",
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
            className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
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
                            "shrink-0 rounded-t-lg border border-b-0 px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "border-border bg-background text-foreground"
                                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
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
