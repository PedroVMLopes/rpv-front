"use client";

import { ROLLABLE_DICE, type DieSides } from "@/lib/roll/diceRoll";
import { SheetDiceFaceButton } from "./SheetDiceFaceButton";

type DiceSelectStepProps = {
    onSelectDie: (sides: DieSides) => void;
};

export function DiceSelectStep({ onSelectDie }: DiceSelectStepProps) {
    return (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ROLLABLE_DICE.map((sides) => (
                <SheetDiceFaceButton
                    key={sides}
                    onClick={() => onSelectDie(sides)}
                >
                    d{sides}
                </SheetDiceFaceButton>
            ))}
        </div>
    );
}
