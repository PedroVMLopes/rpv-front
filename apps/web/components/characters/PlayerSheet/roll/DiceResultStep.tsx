"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { rollDie, type DieSides } from "@/lib/roll/diceRoll";

type DiceResultStepProps = {
    sides: DieSides;
    onSelectValue: (value: number) => void;
    onCancel: () => void;
};

function resultGridClassName(sides: DieSides): string {
    if (sides === 100) {
        return "grid-cols-10";
    }

    if (sides <= 6) {
        return "grid-cols-3";
    }

    return "grid-cols-5";
}

export function DiceResultStep({
    sides,
    onSelectValue,
    onCancel,
}: DiceResultStepProps) {
    const t = useTranslations("playerSheet.roll");
    const values = Array.from({ length: sides }, (_, index) => index + 1);

    const grid = (
        <div className={cn("grid gap-1.5", resultGridClassName(sides))}>
            {values.map((value) => (
                <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                        sides === 100 && "h-8 px-1 text-xs",
                        sides > 20 && sides !== 100 && "h-9 px-2 text-xs"
                    )}
                    onClick={() => onSelectValue(value)}
                >
                    {value}
                </Button>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {sides === 100 ? (
                <ScrollArea className="max-h-[40vh] pr-3">{grid}</ScrollArea>
            ) : (
                grid
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    {t("cancel")}
                </Button>
                <Button type="button" onClick={() => onSelectValue(rollDie(sides))}>
                    {t("randomRoll")}
                </Button>
            </div>
        </div>
    );
}
