"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ROLLABLE_DICE, type DieSides } from "@/lib/roll/diceRoll";

type DiceSelectStepProps = {
    onSelectDie: (sides: DieSides) => void;
    onCancel: () => void;
};

export function DiceSelectStep({ onSelectDie, onCancel }: DiceSelectStepProps) {
    const t = useTranslations("playerSheet.roll");

    return (
        <div className="flex flex-col gap-4">
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
            <Button type="button" variant="ghost" onClick={onCancel}>
                {t("cancel")}
            </Button>
        </div>
    );
}
