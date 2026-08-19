"use client";

import { cn } from "@/lib/utils";
import {
    isSlotUsed,
    ResourceSquareButton,
    spellSlotGridColumnCount,
    spellSlotGridPosition,
} from "../overview/sheetResourceSquares";

type SpellSlotLevelBlockProps = {
    rowKey: string;
    label: string;
    count: number;
    usedCount: number;
    onToggle: (index: number) => void;
    slotAriaLabel: (index: number, total: number, isUsed: boolean) => string;
};

export function SpellSlotLevelBlock({
    rowKey,
    label,
    count,
    usedCount,
    onToggle,
    slotAriaLabel,
}: SpellSlotLevelBlockProps) {
    if (count <= 0) {
        return null;
    }

    const columnCount = spellSlotGridColumnCount(count);

    return (
        <div
            className={cn(
                "flex min-w-0 w-fit flex-col gap-2 rounded-xl border-custom bg-popover p-3 text-popover-foreground"
            )}
        >
            <p className="text-xs font-semibold text-muted-foreground">
                {label}
            </p>
            <div
                className="grid w-fit grid-rows-2 gap-1"
                style={{
                    gridTemplateColumns: `repeat(${columnCount}, auto)`,
                }}
            >
                {Array.from({ length: count }, (_, index) => {
                    const isUsed = isSlotUsed(index, count, usedCount);
                    const { col, row } = spellSlotGridPosition(index);

                    return (
                        <ResourceSquareButton
                            key={`${rowKey}:${index}`}
                            isUsed={isUsed}
                            ariaLabel={slotAriaLabel(index + 1, count, isUsed)}
                            onClick={() => onToggle(index)}
                            style={{ gridColumn: col, gridRow: row }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
