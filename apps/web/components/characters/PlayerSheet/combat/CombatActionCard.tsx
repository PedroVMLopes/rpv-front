"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CombatActionCardProps = {
    title: string;
    badge?: string;
    details?: string[];
    description?: string;
    actionKind: "roll" | "use";
    onRoll?: () => void;
};

export function CombatActionCard({
    title,
    badge,
    details,
    description,
    actionKind,
    onRoll,
}: CombatActionCardProps) {
    const t = useTranslations("playerSheet");
    const tRoll = useTranslations("playerSheet.roll");
    const actionLabel =
        actionKind === "roll" ? t("combat.roll") : t("combat.use");
    const canRoll = actionKind === "roll" && Boolean(onRoll);

    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-muted p-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 flex flex-col gap-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="font-semibold">{title}</span>
                    {badge ? (
                        <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {badge}
                        </span>
                    ) : null}
                </div>
                {details && details.length > 0 ? (
                    <p className="text-xs font-medium text-muted-foreground">
                        {details.join(" · ")}
                    </p>
                ) : null}
                {description ? (
                    <p className="text-xs text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {canRoll ? (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn("shrink-0 font-semibold")}
                    aria-label={tRoll("rollAction", { label: title })}
                    onClick={onRoll}
                >
                    {actionLabel}
                </Button>
            ) : actionKind === "use" ? (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn("shrink-0 font-semibold")}
                    title={t("rollComingSoon")}
                    aria-label={`${actionLabel}: ${title}. ${t("rollComingSoon")}`}
                >
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    );
}
