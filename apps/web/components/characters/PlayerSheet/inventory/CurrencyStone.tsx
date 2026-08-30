"use client";

import { cn } from "@/lib/utils";

type CurrencyStoneProps = {
    abbreviation: string;
    name: string;
    amount: number;
    ariaLabel: string;
    onAmountChange: (amount: number) => void;
    className?: string;
};

export function CurrencyStone({
    abbreviation,
    name,
    amount,
    ariaLabel,
    onAmountChange,
    className,
}: CurrencyStoneProps) {
    return (
        <div
            role="group"
            className={cn(
                "relative flex min-w-18 flex-col items-center justify-end gap-1 rounded-xl bg-accent px-1.5 pb-1.5 pt-3 text-accent-foreground border-custom border-background",
                className
            )}
        >
            <span
                className={cn(
                    "absolute left-1/2 top-0 z-1 -translate-x-1/2 -translate-y-1/2",
                    "rounded-lg border-2 bg-primary px-2 py-0.5 text-xs font-semibold uppercase leading-none text-primary-foreground"
                )}
            >
                {abbreviation}
            </span>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                value={amount}
                aria-label={ariaLabel}
                className={cn(
                    "w-full min-w-0 bg-transparent text-center font-serif text-xl font-bold leading-none tracking-wide text-accent-foreground outline-none",
                    "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                )}
                onChange={(event) => {
                    const raw = event.target.value.trim();
                    if (raw === "") {
                        onAmountChange(0);
                        return;
                    }
                    if (!/^\d+$/.test(raw)) {
                        return;
                    }
                    onAmountChange(Number.parseInt(raw, 10));
                }}
            />
            <span className="max-w-full truncate text-center text-xs font-semibold leading-tight">
                {name}
            </span>
        </div>
    );
}
