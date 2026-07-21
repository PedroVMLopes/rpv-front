import type { ReactNode } from "react";
import { sheetInset } from "@/components/characters/PlayerSheet/playerSheetSurfaces";
import { cn } from "@/lib/utils";

type LevelGainInfoCardProps = {
    title?: string;
    children?: ReactNode;
    className?: string;
};

export function LevelGainInfoCard({
    title,
    children,
    className,
}: LevelGainInfoCardProps) {
    return (
        <div
            className={cn(
                sheetInset,
                "flex flex-col gap-1 rounded-md p-3",
                className
            )}
        >
            {title ? (
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
            ) : null}
            {children}
        </div>
    );
}
