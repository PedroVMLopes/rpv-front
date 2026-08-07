"use client";

import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatModifier } from "@/lib/character/skillModifiers";
import { Button } from "@/components/ui/button";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

type ActionRowProps = {
    label: string;
    modifier: number;
    proficient?: boolean;
    abilityHint?: string;
    className?: string;
    onRoll?: () => void;
};

export function ActionRow({
    label,
    modifier,
    proficient = false,
    abilityHint,
    className,
    onRoll,
}: ActionRowProps) {
    const tCharacter = useTranslations("character");
    const tRoll = useTranslations("playerSheet.roll");

    return (
        <div
            className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1 text-sm",
                sheetInset,
                proficient && "border-primary/40",
                className
            )}
        >
            <span className="flex min-w-0 flex-1 items-center gap-2">
                {proficient ? (
                    <span
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                        title={tCharacter("proficient")}
                        aria-hidden
                    />
                ) : null}
                <span className="truncate font-medium">{label}</span>
                {abilityHint ? (
                    <span className="shrink-0 text-xs text-popover-foreground">
                        {abilityHint}
                    </span>
                ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
                <span className="font-semibold tabular-nums">
                    {formatModifier(modifier)}
                </span>
                {onRoll ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        aria-label={tRoll("rollAction", { label })}
                        onClick={onRoll}
                    >
                        <Dices className="size-4" />
                    </Button>
                ) : null}
            </span>
        </div>
    );
}
