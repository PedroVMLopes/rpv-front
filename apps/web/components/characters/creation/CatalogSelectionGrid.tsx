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
                "flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3",
                className
            )}
        >
            {children}
        </div>
    );
}
