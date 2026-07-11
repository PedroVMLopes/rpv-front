"use client";

import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@rpv/domain";
import type { ModifierSource } from "@rpv/domain";
import type { CatalogSelectionEntry } from "@/lib/character/creation/catalogSelection.types";
import { GrantPreviewList } from "@/components/characters/creation/GrantPreviewList";
import { Button } from "@/components/ui/button";
import type { SystemKey } from "@/presets";
import { cn } from "@/lib/utils";

type CatalogSelectionCardProps = {
    entry: CatalogSelectionEntry;
    selected: boolean;
    contentLocale: Locale;
    system: SystemKey;
    source: ModifierSource;
    onToggle: () => void;
    onExpand: () => void;
};

export function CatalogSelectionCard({
    entry,
    selected,
    contentLocale,
    system,
    source,
    onToggle,
    onExpand,
}: CatalogSelectionCardProps) {
    const t = useTranslations("characterCreation");

    return (
        <div
            role="button"
            tabIndex={0}
            data-testid={`catalog-card-${entry.slug}`}
            aria-pressed={selected}
            onClick={onToggle}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggle();
                }
            }}
            className={cn(
                "flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted/40"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex flex-1 flex-col gap-1">
                    <span className="font-serif text-base font-semibold leading-tight">
                        {entry.title}
                    </span>
                    {entry.badges && entry.badges.length > 0 ? (
                        <span
                            className={cn(
                                "text-xs",
                                selected
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                            )}
                        >
                            {entry.badges.map((badge) => badge.label).join(" · ")}
                        </span>
                    ) : null}
                </div>
                <Button
                    type="button"
                    variant={selected ? "secondary" : "secondary"}
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={t("selection.expandDetails")}
                    onClick={(event) => {
                        event.stopPropagation();
                        onExpand();
                    }}
                >
                    <Maximize2 className="size-4" aria-hidden />
                </Button>
            </div>

            {entry.summary ? (
                <p
                    className={cn(
                        "line-clamp-3 text-sm leading-relaxed",
                        selected
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground"
                    )}
                >
                    {entry.summary}
                </p>
            ) : null}

            <GrantPreviewList
                grants={entry.grants}
                contentLocale={contentLocale}
                system={system}
                source={source}
                className={selected ? "[&_button]:border-primary-foreground/30 [&_span]:border-primary-foreground/30" : undefined}
            />
        </div>
    );
}
