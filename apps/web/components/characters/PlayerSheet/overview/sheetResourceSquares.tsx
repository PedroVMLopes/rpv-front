"use client";

import { cn } from "@/lib/utils";

export type UsedCountByKey = Record<string, number>;

export function isSlotUsed(
    index: number,
    total: number,
    usedCount: number
): boolean {
    return index >= total - usedCount;
}

export function toggleSlotCount(
    index: number,
    total: number,
    usedCount: number
): number {
    if (isSlotUsed(index, total, usedCount)) {
        return Math.max(0, usedCount - 1);
    }

    return Math.min(total, usedCount + 1);
}

export function updateUsedCountByKey(
    current: UsedCountByKey,
    rowKey: string,
    index: number,
    total: number
): UsedCountByKey {
    const usedCount = current[rowKey] ?? 0;
    const nextCount = toggleSlotCount(index, total, usedCount);

    if (nextCount === 0) {
        const { [rowKey]: _removed, ...rest } = current;
        return rest;
    }

    return { ...current, [rowKey]: nextCount };
}

function ResourceSquareButton({
    isUsed,
    ariaLabel,
    onClick,
}: {
    isUsed: boolean;
    ariaLabel: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={isUsed}
            aria-label={ariaLabel}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            className={cn(
                "size-6 shrink-0 rounded-sm border border-primary bg-primary transition-opacity",
                isUsed && "opacity-25"
            )}
        />
    );
}

type ResourceSquareRowProps = {
    rowKey: string;
    label?: string;
    count: number;
    usedCount: number;
    onToggle: (index: number) => void;
    slotAriaLabel: (index: number, total: number, isUsed: boolean) => string;
    className?: string;
};

export function ResourceSquareRow({
    rowKey,
    label,
    count,
    usedCount,
    onToggle,
    slotAriaLabel,
    className,
}: ResourceSquareRowProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {label ? (
                <span className="min-w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                    {label}
                </span>
            ) : null}
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: count }, (_, index) => {
                    const isUsed = isSlotUsed(index, count, usedCount);

                    return (
                        <ResourceSquareButton
                            key={`${rowKey}:${index}`}
                            isUsed={isUsed}
                            ariaLabel={slotAriaLabel(index + 1, count, isUsed)}
                            onClick={() => onToggle(index)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
