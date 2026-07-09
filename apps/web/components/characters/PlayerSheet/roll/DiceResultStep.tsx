"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    combineD100,
    D100_TENS,
    D100_UNITS,
    formatD100TensLabel,
    rollDie,
    type DieSides,
} from "@/lib/roll/diceRoll";

type DiceResultStepProps = {
    sides: DieSides;
    onSelectValue: (value: number) => void;
    onCancel: () => void;
};

function resultGridClassName(sides: DieSides): string {
    if (sides <= 6) {
        return "grid-cols-3";
    }

    return "grid-cols-5";
}

function D100ResultPicker({
    onSelectValue,
    onCancel,
}: {
    onSelectValue: (value: number) => void;
    onCancel: () => void;
}) {
    const t = useTranslations("playerSheet.roll");
    const [selectedTens, setSelectedTens] = useState<number | null>(null);
    const [selectedUnits, setSelectedUnits] = useState<number | null>(null);

    const tryComplete = (tens: number | null, units: number | null) => {
        if (tens !== null && units !== null) {
            onSelectValue(combineD100(tens, units));
        }
    };

    const handleTensSelect = (tens: number) => {
        setSelectedTens(tens);
        tryComplete(tens, selectedUnits);
    };

    const handleUnitsSelect = (units: number) => {
        setSelectedUnits(units);
        tryComplete(selectedTens, units);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("d100Tens")}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                    {D100_TENS.map((tens) => (
                        <Button
                            key={tens}
                            type="button"
                            variant={selectedTens === tens ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTensSelect(tens)}
                        >
                            {formatD100TensLabel(tens)}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("d100Units")}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                    {D100_UNITS.map((units) => (
                        <Button
                            key={units}
                            type="button"
                            variant={selectedUnits === units ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleUnitsSelect(units)}
                        >
                            {units}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    {t("cancel")}
                </Button>
                <Button type="button" onClick={() => onSelectValue(rollDie(100))}>
                    {t("randomRoll")}
                </Button>
            </div>
        </div>
    );
}

export function DiceResultStep({
    sides,
    onSelectValue,
    onCancel,
}: DiceResultStepProps) {
    const t = useTranslations("playerSheet.roll");

    if (sides === 100) {
        return (
            <D100ResultPicker onSelectValue={onSelectValue} onCancel={onCancel} />
        );
    }

    const values = Array.from({ length: sides }, (_, index) => index + 1);

    return (
        <div className="flex flex-col gap-4">
            <div className={cn("grid gap-1.5", resultGridClassName(sides))}>
                {values.map((value) => (
                    <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(sides > 20 && "h-9 px-2 text-xs")}
                        onClick={() => onSelectValue(value)}
                    >
                        {value}
                    </Button>
                ))}
            </div>
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
