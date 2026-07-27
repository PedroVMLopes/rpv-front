"use client";

import type { CatalogSelectionEntry } from "@/lib/character/creation/catalogSelection.types";
import { PressableSelectionCard } from "@/components/characters/creation/PressableSelectionCard";
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
        <PressableSelectionCard
            selected={selected}
            onClick={onOpen}
            data-testid={`catalog-card-${entry.slug}`}
            className="w-full"
        >
            <div className="flex w-full items-center justify-between gap-2">
                <span className="min-w-0 flex-1 font-serif text-base font-semibold leading-tight">
                    {entry.title}
                </span>
                <Maximize2 className="size-4 shrink-0 cursor-pointer" />
            </div>
        </PressableSelectionCard>
    );
}
