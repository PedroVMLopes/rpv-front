"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { sheetInset } from "../playerSheetSurfaces";
import { cn } from "@/lib/utils";

export type SkillsListMode = "proficient" | "all";

type SkillsListModeSwitchProps = {
    value: SkillsListMode;
    onChange: (value: SkillsListMode) => void;
};

export function SkillsListModeSwitch({
    value,
    onChange,
}: SkillsListModeSwitchProps) {
    const t = useTranslations("playerSheet");
    const proficientRef = useRef<HTMLButtonElement>(null);
    const allRef = useRef<HTMLButtonElement>(null);
    const [thumbRect, setThumbRect] = useState<{ width: number; left: number } | null>(
        null
    );

    const proficientLabel = t("showProficientOnly");
    const allLabel = t("showAllSkills");

    useLayoutEffect(() => {
        const activeButton =
            value === "proficient" ? proficientRef.current : allRef.current;

        if (!activeButton) {
            return;
        }

        setThumbRect({
            width: activeButton.offsetWidth,
            left: activeButton.offsetLeft,
        });
    }, [value, proficientLabel, allLabel]);

    return (
        <div
            role="radiogroup"
            aria-label={t("skillsListModeLabel")}
            className={cn("relative isolate inline-flex rounded-lg p-0.5 border-3 border-accent bg-accent text-accent-foreground")}
        >
            {thumbRect ? (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0.5 z-0 rounded-md border border-accent-foreground/10 bg-primary shadow-sm transition-[left,width] duration-200"
                    style={{
                        width: thumbRect.width,
                        left: thumbRect.left,
                    }}
                />
            ) : null}

            <button
                ref={proficientRef}
                type="button"
                role="radio"
                aria-checked={value === "proficient"}
                className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    value === "proficient"
                        ? "font-semibold text-primary-foreground"
                        : "text-accent-foreground/60 hover:text-accent-foreground"
                )}
                onClick={() => {
                    if (value !== "proficient") {
                        onChange("proficient");
                    }
                }}
            >
                {proficientLabel}
            </button>

            <button
                ref={allRef}
                type="button"
                role="radio"
                aria-checked={value === "all"}
                className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    value === "all"
                        ? "font-semibold text-primary-foreground"
                        : "text-accent-foreground/60 hover:text-accent-foreground"
                )}
                onClick={() => {
                    if (value !== "all") {
                        onChange("all");
                    }
                }}
            >
                {allLabel}
            </button>
        </div>
    );
}
