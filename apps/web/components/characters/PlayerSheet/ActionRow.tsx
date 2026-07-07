"use client";

import { useTranslations } from "next-intl";
import { formatModifier } from "@/lib/character/skillModifiers";
import { cn } from "@/lib/utils";

type ActionRowProps = {
    label: string;
    modifier: number;
    proficient?: boolean;
    abilityHint?: string;
    className?: string;
    onActivate?: () => void;
};

export function ActionRow({
    label,
    modifier,
    proficient = false,
    abilityHint,
    className,
    onActivate,
}: ActionRowProps) {
    const t = useTranslations("playerSheet");
    const tCharacter = useTranslations("character");

    return (
        <button
            type="button"
            className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
                "bg-muted transition-colors hover:bg-accent/40 active:bg-accent/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                proficient && "border-primary/40",
                className
            )}
            title={t("rollComingSoon")}
            aria-label={`${label} ${formatModifier(modifier)}. ${t("rollComingSoon")}`}
            onClick={onActivate}
        >
            <span className="flex min-w-0 items-center gap-2">
                {proficient ? (
                    <span
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                        title={tCharacter("proficient")}
                        aria-hidden
                    />
                ) : null}
                <span className="truncate font-medium">{label}</span>
                {abilityHint ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {abilityHint}
                    </span>
                ) : null}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
                {formatModifier(modifier)}
            </span>
        </button>
    );
}
