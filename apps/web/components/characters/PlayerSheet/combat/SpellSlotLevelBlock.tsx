"use client";

import { cn } from "@/lib/utils";
import {
    isSlotUsed,
    ResourceSquareButton,
    spellSlotGridColumnCount,
    spellSlotGridPosition,
    spellSlotGridRowCount,
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
    const rowCount = spellSlotGridRowCount(count);

    return (
        <div className="flex w-fit shrink-0 flex-col rounded-xl shadow-xs bg-popover text-popover-foreground border-2"> 
            <p className="text-sm font-semibold pt-1 px-4">
                {label}
            </p>
            <div
                className={cn(
                    "flex min-w-0 w-full flex-col gap-2 rounded-xl rounded-t-none shadow-xs p-2 pt-1"
                )}
            >
                <div
                    className="grid w-fit gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${columnCount}, auto)`,
                        gridTemplateRows: `repeat(${rowCount}, auto)`,
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
        </div>
    );
}
