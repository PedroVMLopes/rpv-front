"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DEATH_SAVE_MAX,
    isDead,
    isStable,
} from "@/lib/character/vitality";
import type { CharacterDeathSaves } from "@/lib/character/storedCharacter";

type DeathSavePipsProps = {
    hp: number;
    saves: CharacterDeathSaves | undefined;
    disabled?: boolean;
    onSuccessCount: (count: number) => void;
    onFailureCount: (count: number) => void;
    onRoll?: () => void;
    compact?: boolean;
};

function pipCountAfterClick(current: number, index: number): number {
    if (index + 1 === current) {
        return current - 1;
    }

    if (index === current) {
        return Math.min(DEATH_SAVE_MAX, current + 1);
    }

    return current;
}

function PipRow({
    label,
    count,
    tone,
    disabled,
    markLabel,
    unmarkLabel,
    onCount,
}: {
    label: string;
    count: number;
    tone: "success" | "failure";
    disabled: boolean;
    markLabel: (index: number) => string;
    unmarkLabel: (index: number) => string;
    onCount: (count: number) => void;
}) {
    const filledClass =
        tone === "success"
            ? "bg-emerald-700 border-emerald-700"
            : "bg-red-800 border-red-800";

    return (
        <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-semibold uppercase text-muted-foreground">
                {label}
            </span>
            <div className="flex gap-1">
                {Array.from({ length: DEATH_SAVE_MAX }, (_, index) => {
                    const filled = index < count;
                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={disabled}
                            aria-label={
                                filled
                                    ? unmarkLabel(index + 1)
                                    : markLabel(index + 1)
                            }
                            className={cn(
                                "size-5 rounded-full border-2",
                                filled
                                    ? filledClass
                                    : "border-muted-foreground/50 bg-transparent",
                                disabled && "opacity-50"
                            )}
                            onClick={() =>
                                onCount(pipCountAfterClick(count, index))
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function DeathSavePips({
    hp,
    saves,
    disabled = false,
    onSuccessCount,
    onFailureCount,
    onRoll,
    compact = false,
}: DeathSavePipsProps) {
    const t = useTranslations("playerSheet.vitality");
    const dead = isDead(saves);
    const stable = isStable(hp, saves);
    const locked = disabled || dead;
    const successes = saves?.successes ?? 0;
    const failures = saves?.failures ?? 0;

    return (
        <div className={cn("flex flex-col gap-1.5", compact && "gap-1")}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase">
                    {t("deathSaves")}
                </span>
                {dead ? (
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                        {t("dead")}
                    </span>
                ) : null}
                {stable ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {t("stable")}
                    </span>
                ) : null}
                {onRoll && !locked ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={onRoll}
                        aria-label={t("rollDeathSave")}
                    >
                        {t("rollDeathSave")}
                    </Button>
                ) : null}
            </div>
            <PipRow
                label={t("successes")}
                count={successes}
                tone="success"
                disabled={locked}
                markLabel={(index) => t("markSuccess", { index })}
                unmarkLabel={(index) => t("unmarkSuccess", { index })}
                onCount={onSuccessCount}
            />
            <PipRow
                label={t("failures")}
                count={failures}
                tone="failure"
                disabled={locked}
                markLabel={(index) => t("markFailure", { index })}
                unmarkLabel={(index) => t("unmarkFailure", { index })}
                onCount={onFailureCount}
            />
        </div>
    );
}
