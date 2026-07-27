"use client";

import type { CatalogSelectionEntry } from "@/lib/character/creation/catalogSelection.types";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

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
                "flex w-full cursor-pointer items-center gap-2 rounded-xl border-3 border-r-4 border-b-4 p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                    ? "border-primary ring-1 ring-primary/20 bg-primary/80 text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground shadow-xs"
                    : "border-border bg-popover text-popover-foreground hover:bg-primary/50 hover:border-primary hover:shadow-xs"
            )}
        >
            <div className="flex items-center justify-between w-full gap-2">
                <span className="min-w-0 flex-1 font-serif text-base font-semibold leading-tight">
                    {entry.title}
                </span>
                <Maximize2 className="size-4 shrink-0 cursor-pointer" />
            </div>
        </div>
    );
}
