"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PressableSelectionCardProps = {
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
    className?: string;
    "aria-label"?: string;
    "data-testid"?: string;
};

export function PressableSelectionCard({
    selected,
    disabled = false,
    onClick,
    children,
    className,
    "aria-label": ariaLabel,
    "data-testid": dataTestId,
}: PressableSelectionCardProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={ariaLabel}
            data-testid={dataTestId}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 rounded-xl border-offset p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled
                    ? "cursor-not-allowed opacity-50 border-border bg-popover text-popover-foreground"
                    : selected
                      ? "cursor-pointer ring-1 ring-primary/20 bg-primary/80 text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground shadow-xs"
                      : "cursor-pointer border-border bg-popover text-popover-foreground hover:bg-primary/50 hover:border-primary hover:shadow-xs",
                className
            )}
        >
            {children}
        </button>
    );
}
