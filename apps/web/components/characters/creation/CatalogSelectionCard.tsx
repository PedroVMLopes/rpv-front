"use client";

import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CatalogSelectionEntry } from "@/lib/character/creation/catalogSelection.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CatalogSelectionCardProps = {
    entry: CatalogSelectionEntry;
    selected: boolean;
    onToggle: () => void;
    onExpand: () => void;
};

export function CatalogSelectionCard({
    entry,
    selected,
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
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-3 p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                    ? "border-primary border-2 ring-1 ring-primary/20 bg-card text-card-foreground hover:bg-muted/40 hover:text-card"
                    : "border-border bg-accent text-accent-foreground hover:bg-card hover:text-card-foreground"
            )}
        >
            <span className="min-w-0 flex-1 font-serif text-base font-semibold leading-tight">
                {entry.title}
            </span>
            <Button
                type="button"
                variant="default"
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
    );
}
