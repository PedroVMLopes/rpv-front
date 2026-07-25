"use client";

import type { CatalogSelectionEntry } from "@/lib/character/creation/catalogSelection.types";
import { cn } from "@/lib/utils";

type CatalogSelectionCardProps = {
    entry: CatalogSelectionEntry;
    selected: boolean;
    onOpen: () => void;
};

export function CatalogSelectionCard({
    entry,
    selected,
    onOpen,
}: CatalogSelectionCardProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            data-testid={`catalog-card-${entry.slug}`}
            aria-pressed={selected}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
            className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-xl border-3 p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                    ? "border-primary border-2 ring-1 ring-primary/20 bg-card text-card-foreground hover:bg-muted/40 hover:text-card"
                    : "border-border bg-accent text-accent-foreground hover:bg-card hover:text-card-foreground"
            )}
        >
            <span className="min-w-0 flex-1 font-serif text-base font-semibold leading-tight">
                {entry.title}
            </span>
        </div>
    );
}
