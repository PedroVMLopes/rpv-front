"use client";

import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getHitDicePool } from "@/lib/character/hitDice";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { cn } from "@/lib/utils";

type HitDiceControlProps = {
    stored: StoredCharacter;
    onSpend: () => void;
    className?: string;
};

export function HitDiceControl({
    stored,
    onSpend,
    className,
}: HitDiceControlProps) {
    const t = useTranslations("playerSheet.vitality");
    const pool = getHitDicePool(stored);

    if (!pool) {
        return null;
    }

    const canSpend = pool.current > 0;

    return (
        <div
            className={cn("flex items-center justify-between gap-2", className)}
        >
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t("hitDice")}
                </p>
                <p className="text-sm font-bold tabular-nums">
                    {t("hitDiceCount", {
                        current: pool.current,
                        max: pool.max,
                    })}
                    {pool.sides ? (
                        <span className="ml-1 font-medium text-muted-foreground">
                            d{pool.sides}
                        </span>
                    ) : null}
                </p>
            </div>
            <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1.5 px-2 text-xs"
                disabled={!canSpend}
                onClick={onSpend}
                aria-label={t("spendHitDie")}
            >
                <Dices className="size-3.5" aria-hidden />
                {t("spendHitDie")}
            </Button>
        </div>
    );
}
