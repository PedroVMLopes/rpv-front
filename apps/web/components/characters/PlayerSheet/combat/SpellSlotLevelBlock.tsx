"use client";

import { cn } from "@/lib/utils";
import {
    isSlotUsed,
    ResourceSquareButton,
    spellSlotGridColumnCount,
    spellSlotGridPosition,
    spellSlotGridRowCount,
} from "../overview/sheetResourceSquares";
import { Divide } from "lucide-react";

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
        <div className="flex flex-col bg-background rounded-xl shadow-xs w-fit items-center">            
            <p className="text-sm font-semibold text-foreground p-1 px-4">
                {label}
            </p>
            <div
                className={cn(
                    "flex min-w-0 w-full flex-col gap-2 rounded-xl rounded-t-none border-2 shadow-xs bg-popover p-2 text-popover-foreground"
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
