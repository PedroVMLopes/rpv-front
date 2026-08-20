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
import { SheetDiceFaceButton } from "./SheetDiceFaceButton";

type DiceResultStepProps = {
    sides: DieSides;
    onSelectValue: (value: number) => void;
};

function resultGridClassName(sides: DieSides): string {
    if (sides <= 6) {
        return "grid-cols-3";
    }

    return "grid-cols-5";
}

function D100ResultPicker({
    onSelectValue,
}: {
    onSelectValue: (value: number) => void;
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
                        <SheetDiceFaceButton
                            key={tens}
                            selected={selectedTens === tens}
                            onClick={() => handleTensSelect(tens)}
                        >
                            {formatD100TensLabel(tens)}
                        </SheetDiceFaceButton>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("d100Units")}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                    {D100_UNITS.map((units) => (
                        <SheetDiceFaceButton
                            key={units}
                            selected={selectedUnits === units}
                            onClick={() => handleUnitsSelect(units)}
                        >
                            {units}
                        </SheetDiceFaceButton>
                    ))}
                </div>
            </div>
            <Button type="button" onClick={() => onSelectValue(rollDie(100))}>
                {t("randomRoll")}
            </Button>
        </div>
    );
}

export function DiceResultStep({ sides, onSelectValue }: DiceResultStepProps) {
    const t = useTranslations("playerSheet.roll");

    if (sides === 100) {
        return <D100ResultPicker onSelectValue={onSelectValue} />;
    }

    const values = Array.from({ length: sides }, (_, index) => index + 1);

    return (
        <div className="flex flex-col gap-4">
            <div className={cn("grid gap-1.5", resultGridClassName(sides))}>
                {values.map((value) => (
                    <SheetDiceFaceButton
                        key={value}
                        className={cn(sides > 20 && "h-9 px-2 text-xs")}
                        onClick={() => onSelectValue(value)}
                    >
                        {value}
                    </SheetDiceFaceButton>
                ))}
            </div>
            <Button type="button" onClick={() => onSelectValue(rollDie(sides))}>
                {t("randomRoll")}
            </Button>
        </div>
    );
}
