import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CatalogSelectionGridProps = {
    children: ReactNode;
    className?: string;
};

export function CatalogSelectionGrid({
    children,
    className,
}: CatalogSelectionGridProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 bg-card text-card-foreground p-2 rounded-xl border-3",
                className
            )}
        >
            {children}
        </div>
    );
}
