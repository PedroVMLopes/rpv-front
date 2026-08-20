"use client";

import { Button } from "@/components/ui/button";
import { ROLLABLE_DICE, type DieSides } from "@/lib/roll/diceRoll";

type DiceSelectStepProps = {
    onSelectDie: (sides: DieSides) => void;
};

export function DiceSelectStep({ onSelectDie }: DiceSelectStepProps) {
    return (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ROLLABLE_DICE.map((sides) => (
                <Button
                    key={sides}
                    type="button"
                    variant="outline"
                    className="font-semibold"
                    onClick={() => onSelectDie(sides)}
                >
                    d{sides}
                </Button>
            ))}
        </div>
    );
}
