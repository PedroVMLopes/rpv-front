"use client";

import type { ReactNode } from "react";
import { formatModifier } from "@/lib/character/skillModifiers";
import { cn } from "@/lib/utils";

type AbilityStoneProps = {
    score: number;
    modifier: number;
    shortLabel: string;
    ariaLabel: string;
    className?: string;
    compact?: boolean;
    children?: ReactNode;
    onRoll?: () => void;
};

export function AbilityStone({
    score,
    modifier,
    shortLabel,
    ariaLabel,
    className,
    compact = false,
    children,
    onRoll,
}: AbilityStoneProps) {
    const content = (
        <>
            <span
                className={cn(
                    "absolute left-1/2 top-0 z-5 -translate-x-1/2 -translate-y-1/2",
                    "rounded-lg bg-primary px-2 py-0.5 font-semibold leading-none text-primary-foreground",
                    "border-2"
                )}
            >
                {formatModifier(modifier)}
            </span>
            <span
                className={cn(
                    "flex items-end justify-center font-bold font-serif tracking-wide leading-none",
                    compact
                        ? "text-xl"
                        : "flex-1 text-2xl sm:text-3xl"
                )}
            >
                {score}
            </span>
            <span
                className={cn(
                    "flex items-center gap-0.5 text-center font-semibold leading-tight",
                    compact ? "text-xs" : "text-sm"
                )}
            >
                {shortLabel}
                {children}
            </span>
        </>
    );

    const stoneClassName = cn(
        "relative flex flex-col items-center rounded-xl bg-accent px-1.5 text-accent-foreground shadow-xs border-custom border-background",
        compact
            ? "size-19 shrink-0 justify-end gap-1 pb-1.5"
            : "min-h-24 pb-2 pt-3",
        onRoll &&
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
    );

    if (onRoll) {
        return (
            <button
                type="button"
                aria-label={ariaLabel}
                className={stoneClassName}
                onClick={onRoll}
            >
                {content}
            </button>
        );
    }

    return (
        <div role="group" aria-label={ariaLabel} className={stoneClassName}>
            {content}
        </div>
    );
}
