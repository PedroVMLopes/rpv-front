"use client";

import { useTranslations } from "next-intl";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

export type SkillsListMode = "proficient" | "all";

type SkillsListModeSwitchProps = {
    value: SkillsListMode;
    onChange: (value: SkillsListMode) => void;
};

const MODES: SkillsListMode[] = ["proficient", "all"];

export function SkillsListModeSwitch({
    value,
    onChange,
}: SkillsListModeSwitchProps) {
    const t = useTranslations("playerSheet");

    const labels: Record<SkillsListMode, string> = {
        proficient: t("showProficientOnly"),
        all: t("showAllSkills"),
    };

    return (
        <div
            role="radiogroup"
            aria-label={t("skillsListModeLabel")}
            className="relative inline-flex rounded-lg border bg-muted p-0.5"
        >
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md shadow-sm transition-transform duration-200",
                    sheetInset,
                    value === "all" && "translate-x-full"
                )}
            />

            {MODES.map((mode) => {
                const selected = value === mode;

                return (
                    <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                            "relative z-10 min-w-0 flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                            selected
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                            if (!selected) {
                                onChange(mode);
                            }
                        }}
                    >
                        {labels[mode]}
                    </button>
                );
            })}
        </div>
    );
}
