"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

type CombatActionCardProps = {
    title: string;
    badges?: string[];
    details?: string[];
    description?: string;
    actionKind: "roll" | "use";
    availability?: "available" | "depleted" | "unavailable";
    resourceLabel?: string;
    stateTags?: string[];
    onRoll?: () => void;
};

export function CombatActionCard({
    title,
    badges,
    details,
    description,
    actionKind,
    availability = "available",
    resourceLabel,
    stateTags,
    onRoll,
}: CombatActionCardProps) {
    const t = useTranslations("playerSheet");
    const tRoll = useTranslations("playerSheet.roll");
    const actionLabel =
        actionKind === "roll" ? t("combat.roll") : t("combat.use");
    const canRoll = actionKind === "roll" && Boolean(onRoll);
    const isDisabled = availability !== "available";
    const canExpand = Boolean(description);

    return (
        <details className={cn("group rounded-xl p-3", sheetInset)}>
            <summary className="list-none [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                            <span className="font-semibold">{title}</span>
                            {badges?.map((badge) => (
                                <span
                                    key={badge}
                                    className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                                >
                                    {badge}
                                </span>
                            ))}
                            {stateTags?.map((tag) => (
                                <span
                                    key={tag}
                                    className="shrink-0 rounded-md bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        {details && details.length > 0 ? (
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {details.join(" · ")}
                            </p>
                        ) : null}
                        {resourceLabel ? (
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                {resourceLabel}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {canRoll ? (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className={cn("shrink-0 font-semibold")}
                                aria-label={tRoll("rollAction", { label: title })}
                                disabled={isDisabled}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onRoll?.();
                                }}
                            >
                                {actionLabel}
                            </Button>
                        ) : actionKind === "use" ? (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className={cn("shrink-0 font-semibold")}
                                title={isDisabled ? t("noneYet") : t("rollComingSoon")}
                                aria-label={
                                    isDisabled
                                        ? `${actionLabel}: ${title}`
                                        : `${actionLabel}: ${title}. ${t("rollComingSoon")}`
                                }
                                disabled={isDisabled}
                                onClick={(event) => event.preventDefault()}
                            >
                                {actionLabel}
                            </Button>
                        ) : null}
                        {canExpand ? (
                            <span className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground">
                                <ChevronDown
                                    className="size-4 transition-transform group-open:rotate-180"
                                    aria-hidden
                                />
                            </span>
                        ) : null}
                    </div>
                </div>
            </summary>

            {description ? (
                <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                    {description}
                </div>
            ) : null}
        </details>
    );
}
